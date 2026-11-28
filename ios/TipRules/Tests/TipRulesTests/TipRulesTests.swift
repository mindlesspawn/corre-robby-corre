import XCTest
@testable import TipRules

final class TipRulesTests: XCTestCase {
    func testWrongAnswerConsumesChallenge() {
        var rules = TipRules()
        let id = rules.begin(a: 7, b: 8, now: 0)
        XCTAssertNil(rules.authorize(challenge: id, answer: 55, now: 1))
        XCTAssertNil(rules.authorize(challenge: id, answer: 56, now: 2))
    }

    func testGrantExpiresAndCanOnlyBeConsumedOnce() throws {
        var rules = TipRules()
        let id = rules.begin(a: 7, b: 8, now: 0)
        let token = try XCTUnwrap(rules.authorize(challenge: id, answer: 56, now: 1))
        XCTAssertFalse(rules.permits("invented", now: 2))
        XCTAssertTrue(rules.permits(token, now: 180))
        XCTAssertFalse(rules.permits(token, now: 181))
        XCTAssertTrue(rules.consume(token, now: 2))
        XCTAssertFalse(rules.consume(token, now: 3))
    }

    func testExpiredChallengeCannotGrantPurchase() {
        var rules = TipRules()
        let id = rules.begin(a: 9, b: 9, now: 10)
        XCTAssertNil(rules.authorize(challenge: id, answer: 81, now: 190))
    }

    func testBackgroundAndClosingRevokeGrant() throws {
        var rules = TipRules()
        let id = rules.begin(a: 6, b: 9, now: 0)
        let token = try XCTUnwrap(rules.authorize(challenge: id, answer: 54, now: 1))
        rules.invalidate()
        XCTAssertFalse(rules.consume(token, now: 2))
        let freshID = rules.begin(a: 8, b: 8, now: 3)
        let freshToken = try XCTUnwrap(rules.authorize(challenge: freshID, answer: 64, now: 4))
        rules.end(challenge: nil, token: freshToken)
        XCTAssertFalse(rules.consume(freshToken, now: 5))
    }

    func testLateCloseAndWrongChallengeCannotAffectNewSession() throws {
        var rules = TipRules()
        let old = rules.begin(a: 6, b: 6, now: 0)
        let fresh = rules.begin(a: 9, b: 7, now: 1)
        rules.end(challenge: old, token: nil)
        XCTAssertNil(rules.authorize(challenge: old, answer: 36, now: 2))
        let token = try XCTUnwrap(rules.authorize(challenge: fresh, answer: 63, now: 3))
        rules.end(challenge: old, token: "wrong")
        XCTAssertTrue(rules.consume(token, now: 4))
    }
}
