import Foundation

// A parent grant lives only in memory, expires, and authorizes exactly one purchase.
// This is an accidental-purchase guard, not an identity or age verification service.
public struct TipRules {
    public static let productIDs = [
        "com.mindlesspawn.correrobbycorre.tip.small",
        "com.mindlesspawn.correrobbycorre.tip.medium",
        "com.mindlesspawn.correrobbycorre.tip.large"
    ]
    private var challengeID: String?
    private var answer: Int?
    private var challengeDeadline: TimeInterval = 0
    private var token: String?
    private var deadline: TimeInterval = 0

    public init() {}

    public mutating func begin(a: Int, b: Int, now: TimeInterval) -> String {
        invalidate()
        let id = UUID().uuidString
        challengeID = id
        answer = a * b
        challengeDeadline = now + 180
        return id
    }

    public mutating func authorize(challenge id: String, answer value: Int, now: TimeInterval) -> String? {
        guard id == challengeID else { return nil }
        let correct = value == answer && now < challengeDeadline
        invalidate()
        guard correct else { return nil }
        let granted = UUID().uuidString
        token = granted
        deadline = now + 180
        return granted
    }

    public func permits(_ supplied: String, now: TimeInterval) -> Bool {
        token == supplied && now < deadline
    }

    public mutating func consume(_ supplied: String, now: TimeInterval) -> Bool {
        guard permits(supplied, now: now) else { return false }
        invalidate()
        return true
    }

    public mutating func end(challenge: String?, token supplied: String?) {
        // A late close from an old screen must not invalidate a newly opened gate.
        if (challenge != nil && challenge == challengeID) || (supplied != nil && supplied == token) { invalidate() }
    }

    public mutating func invalidate() {
        challengeID = nil
        answer = nil
        token = nil
        deadline = 0
        challengeDeadline = 0
    }
}
