// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "TipRules",
    products: [.library(name: "TipRules", targets: ["TipRules"])],
    targets: [.target(name: "TipRules"), .testTarget(name: "TipRulesTests", dependencies: ["TipRules"])]
)
