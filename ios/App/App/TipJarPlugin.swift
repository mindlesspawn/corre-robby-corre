import Foundation
import Capacitor
import StoreKit
import UIKit

@objc(TipJarPlugin)
public class TipJarPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "TipJarPlugin"
    public let jsName = "TipJar"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "beginParentGate", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "completeParentGate", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "endParentSession", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getProducts", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "purchase", returnType: CAPPluginReturnPromise)
    ]

    // All mutable purchase/session state is accessed on the main actor.
    private var rules = TipRules()
    private var purchasing = false
    private var catalog: [String: Product] = [:]
    private var catalogStorefront: String?
    private var updatesTask: Task<Void, Never>?
    private var recoveryTask: Task<Void, Never>?

    public override func load() {
        NotificationCenter.default.addObserver(self, selector: #selector(backgrounded), name: UIApplication.didEnterBackgroundNotification, object: nil)
        // Start listening immediately, including approvals that arrive after relaunch.
        updatesTask = Task { @MainActor [weak self] in
            for await result in Transaction.updates {
                guard let self else { return }
                await self.finishVerifiedTip(result)
            }
        }
        recoveryTask = Task { @MainActor [weak self] in
            for await result in Transaction.unfinished {
                guard let self else { return }
                await self.finishVerifiedTip(result)
            }
        }
    }

    deinit {
        updatesTask?.cancel()
        recoveryTask?.cancel()
        NotificationCenter.default.removeObserver(self)
    }

    @objc private func backgrounded() {
        Task { @MainActor in self.rules.invalidate() }
    }

    @MainActor private var now: TimeInterval { ProcessInfo.processInfo.systemUptime }

    @MainActor private func authorized(_ call: CAPPluginCall) -> Bool {
        guard let token = call.getString("parentToken"), rules.permits(token, now: now) else {
            call.reject("A fresh parent check is required.", "AUTH_REQUIRED")
            return false
        }
        return true
    }

    @objc func beginParentGate(_ call: CAPPluginCall) {
        Task { @MainActor in
            guard !purchasing else { call.reject("A purchase is already in progress.", "BUSY"); return }
            let a = Int.random(in: 6...9), b = Int.random(in: 6...9)
            let id = rules.begin(a: a, b: b, now: now)
            call.resolve(["challengeId": id, "a": a, "b": b])
        }
    }

    @objc func completeParentGate(_ call: CAPPluginCall) {
        Task { @MainActor in
            guard let id = call.getString("challengeId"), let answer = call.getInt("answer"),
                  let token = rules.authorize(challenge: id, answer: answer, now: now) else {
                call.reject("Parent check was not completed.", "AUTH_REQUIRED")
                return
            }
            call.resolve(["parentToken": token])
        }
    }

    @objc func endParentSession(_ call: CAPPluginCall) {
        Task { @MainActor in
            rules.end(challenge: call.getString("challengeId"), token: call.getString("parentToken"))
            call.resolve()
        }
    }

    @objc func getProducts(_ call: CAPPluginCall) {
        Task { @MainActor in
            guard authorized(call) else { return }
            guard AppStore.canMakePayments else { call.reject("Purchases are restricted on this device.", "RESTRICTED"); return }
            do {
                let products = try await Product.products(for: TipRules.productIDs).filter { $0.type == .consumable }
                let storefront = await Storefront.current
                guard authorized(call) else { return }
                catalog = Dictionary(uniqueKeysWithValues: products.map { ($0.id, $0) })
                catalogStorefront = storefront?.id
                // StoreKit owns currency, tax-inclusive display prices, and territory availability.
                call.resolve(["products": TipRules.productIDs.compactMap { id -> [String: Any]? in
                    guard let product = catalog[id] else { return nil }
                    return ["id": product.id, "displayPrice": product.displayPrice]
                }])
            } catch {
                call.reject("The App Store could not load tips.", "UNAVAILABLE")
            }
        }
    }

    @objc func purchase(_ call: CAPPluginCall) {
        Task { @MainActor in
            guard !purchasing else { call.reject("A purchase is already in progress.", "BUSY"); return }
            guard authorized(call) else { return }
            guard AppStore.canMakePayments else { call.reject("Purchases are restricted on this device.", "RESTRICTED"); return }
            guard let id = call.getString("productId"), TipRules.productIDs.contains(id), catalog[id] != nil,
                  let displayedPrice = call.getString("displayPrice"), let token = call.getString("parentToken") else {
                call.reject("Unknown tip product.", "UNAVAILABLE")
                return
            }
            purchasing = true
            defer { purchasing = false }
            do {
                // Recheck the storefront and price before opening Apple's payment sheet.
                let products = try await Product.products(for: [id])
                let storefront = await Storefront.current
                guard let product = products.first, product.type == .consumable else {
                    call.reject("This tip is unavailable.", "UNAVAILABLE"); return
                }
                guard product.displayPrice == displayedPrice, storefront?.id == catalogStorefront else {
                    call.reject("Storefront or price changed. Load current prices again.", "PRICE_CHANGED"); return
                }
                guard UIApplication.shared.applicationState == .active, rules.consume(token, now: now) else {
                    call.reject("A fresh parent check is required.", "AUTH_REQUIRED"); return
                }
                // A grant is consumed even if the adult cancels or approval is pending.
                switch try await product.purchase() {
                case .success(let result):
                    guard case .verified(let transaction) = result,
                          transaction.productID == id, transaction.revocationDate == nil else {
                        call.reject("The App Store transaction could not be verified.", "UNVERIFIED"); return
                    }
                    await transaction.finish()
                    call.resolve(["status": "purchased"])
                case .userCancelled:
                    call.resolve(["status": "cancelled"])
                case .pending:
                    call.resolve(["status": "pending"])
                @unknown default:
                    call.reject("The purchase did not finish.", "FAILED")
                }
            } catch {
                call.reject("The App Store could not complete the tip.", "FAILED")
            }
        }
    }

    @MainActor private func finishVerifiedTip(_ result: VerificationResult<Transaction>) async {
        guard case .verified(let transaction) = result,
              TipRules.productIDs.contains(transaction.productID), transaction.productType == .consumable else { return }
        // Tips grant no game content or currency. Finish verified deliveries without
        // interrupting the child, storing receipts, or collecting purchase history.
        await transaction.finish()
    }
}
