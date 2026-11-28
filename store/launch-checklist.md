# App Store launch — 27 November 2026

## Confirmed preferences

Robby already has an **individual Apple Developer membership**. This was reconfirmed in this chat on 27 November 2026; do not ask him to enroll again. Use the account holder's existing legal name as seller. Mexico distribution is required, and the app should remain free with optional tips for adults. ElevenLabs rights are excluded from this review at Robby's request, not verified by it.

## Copyright and asset check

The relevant standard is permission to distribute the assets in an app, not absence of copyright. This is a review of available project evidence, not a comprehensive legal or trademark clearance.

| Material | Evidence and result |
| --- | --- |
| Noto Emoji pictures and flags | Source release and licenses documented in `public/art/emoji/README.md`; Apache 2.0 notices and license are bundled. Noto identifies the region flags as public domain or otherwise copyright-exempt. |
| Fredoka font | Installed package contains SIL OFL 1.1. Added its actual license to `public/licenses/`. |
| Three.js, Capacitor core/iOS/Preferences, tslib | Installed dependency licenses allow redistribution subject to notices. Copied actual package notices into `public/licenses/`; added Apache Cordova notice/license for the derived native code. |
| Game characters, world, tutorial hand and effects | Source builds them from shapes, SVG paths and synthesized tones. No imported commercial character model or sampled effect was identified in the inspected code. |
| Counting-hand PNGs and app icons | Inspected artwork and repository history. README attributes the hands to Image Studio; provider/model/input/rights receipts for these raster assets are not preserved here. Keep those records before claiming complete asset clearance. Visual inspection cannot prove ownership. |
| Recorded music/voice | Excluded from this review at the owner's request. Existing provenance files remain in the project. |
| App name | No formal trademark search has been performed. Availability in App Store Connect is not trademark clearance. |

The [Noto project license explanation](https://github.com/googlefonts/noto-emoji#license) supports the image/flag distinction. The app now includes a local **Settings → Privacy and credits** entry behind the existing parent gate because the policy contains external references. The page links to bundled license texts.

## Readiness findings

Prepared locally in this review:

- Added the iOS privacy manifest for Preferences/UserDefaults (`CA92.1`) and included it in the Xcode Resources build phase, following the [Capacitor Preferences requirements](https://capacitorjs.com/docs/apis/preferences).
- Declared SystemBootTime reason `35F9.1` for the parent gate's elapsed-time expiry. The timer stays on-device and is never transmitted, matching [Apple's approved timer use](https://developer.apple.com/documentation/bundleresources/app-privacy-configuration/nsprivacyaccessedapitypes/nsprivacyaccessedapitype).
- Bundled third-party notices, made the privacy/credits page accessible from Settings, and corrected the policy's optional nickname wording.
- Updated the listing draft to seven games, the current tutorial/replay behavior, four volume controls, and mandatory Mexico availability.
- Implemented optional StoreKit 2 consumable tips in the iOS app. A typed parent question grants one purchase attempt, expires after three minutes, and is revoked when the adult leaves or backgrounds the app. Apple supplies the price and payment sheet; cancellation, pending approval, verification failure, and unavailable products have separate English/Spanish messages. Verified unfinished transactions are recovered without interrupting play.
- Prepared the exact product IDs and English/Spanish (Mexico) metadata in `store/tip-products.json`. Mexico must still be enabled in App Store Connect for both the app and each product. No prices or exchange rates are hard-coded in the app.
- Updated privacy and store copy to describe optional tips. No purchase SDK, payment server, analytics, or game rewards were added.
- Fixed an existing native startup issue: the Preferences plugin proxy must not be returned directly from an async function. Its generated `then` method could stall initialization. A regression test verifies loading Spanish preferences/progress and saving changes.

Still required before submission:

- Sign and validate an archive on the owner's Mac. The automated hosted-Mac check builds an unsigned simulator app; it does not replace a signed archive or device test.
- Test a real iPhone and iPad: offline launch, Spanish audio, taps/swipes, question replay, pause/background/resume, mute switch, safe areas, rotation, and saved settings/progress.
- Create the three consumable products, complete payment agreements/banking/tax setup, and perform sandbox purchase testing. The native implementation is ready for these steps; products have not been registered or approved in App Store Connect here.
- Capture current Spanish and English screenshots from the native app at the sizes requested in App Store Connect. Use fictional nicknames.
- Supply a reachable support contact and finish the current App Privacy and age-rating questionnaires. Gameplay data stays local. StoreKit transactions are verified on-device; the developer does not receive card details or retain purchase history. Reassess if data collection changes.
- Confirm the raster-asset provenance noted above. Review exclusion of audio is not an all-assets clearance.

Verification: the 27 JavaScript tests cover game/audio behavior, native storage startup, parent authorization, duplicate taps, cancellation, pending approval, failure, unavailable products, stale responses, and exact Apple price strings. Five Swift tests cover the native gate's expiration, one-use grant, wrong answers, and revocation. `.github/workflows/ios-check.yml` runs both suites, synchronizes assets, builds the app with Xcode, and checks bundled privacy/license resources. The [first hosted Xcode build passed](https://github.com/mindlesspawn/corre-robby-corre/actions/runs/46123463278); consult the latest successful branch run for subsequent fixes. Production-build browser checks passed with the real Capacitor JavaScript adapter and simulated native responses: typed gate, Spanish/MXN, small-phone/tablet layout, success/cancel/pending/failure, restrictions, late responses, backgrounding, English, privacy/credit navigation, and bundled notices. Actual Apple checkout still requires sandbox/device testing. Nothing has been submitted to Apple.

## Mac handoff

Guide Robby **one step at a time**, without repeating membership questions. Use the current `main` branch after the prepared implementation's checks and merge. First step: open Xcode and confirm its version. The full reference below is for later steps, not a single checklist to send him at once.

## Listing walkthrough

1. In the existing Apple Developer account, register the explicit app identifier `com.mindlesspawn.correrobbycorre` if it is not already registered. Keep the identifier identical in the account, `capacitor.config.json`, Xcode, and App Store Connect.
2. In [App Store Connect](https://appstoreconnect.apple.com), open **Apps → + → New App**. Platform: iOS. Name: `corre, robby, corre`. Primary language: English (U.S.). Bundle ID: the identifier above. Suggested private SKU: `corre-robby-corre-ios`. [Apple's app-record instructions](https://developer.apple.com/help/app-store-connect/create-an-app-record/add-a-new-app/).
3. On the Mac, get these project changes, run `npm ci`, `npm run ios`, and `npx cap open ios`. Use Xcode 26+ and the iOS 26+ SDK under [current upload requirements](https://developer.apple.com/news/upcoming-requirements/). In Signing & Capabilities select the existing individual team and automatic signing. Confirm Version 1.0 and a unique Build number.
4. Run on an iPhone/iPad, then **Product → Archive → Distribute App → App Store Connect → Upload**. Validate the archive, including its privacy report. Each later upload needs a new Build number.
5. Once processed, test through TestFlight. External family testers can require beta review. Use the weekend sessions to observe whether the children complete practice and understand the spoken questions without adult coaching.
6. Fill the English listing and add **Spanish (Mexico)** using `store/app-store-listing.md`. Choose appropriate categories and **Made for Kids: ages 5 and under** for the preschool audience. Answer the current rating questionnaire accurately; a Kids age band and the calculated content rating are different fields. Add screenshots, privacy URL, support contact, and reviewer instructions. [Kids requirements](https://developer.apple.com/kids/).
7. Open **Pricing and Availability → App Availability → Set Up Availability**. Select Mexico explicitly, plus the United States or any other territories you want. The download price remains Free. Spanish metadata alone does not enable distribution. [Apple's territory instructions](https://developer.apple.com/help/app-store-connect/manage-your-apps-availability/manage-availability-for-your-app-on-the-app-store).
8. Select the tested build, attach any tip products to the same first submission, and submit for review. Choose manual release if you want to control the launch after approval. Verify Mexico shows **Available** after release.

Mexico's default listing language is [Spanish (Mexico)](https://developer.apple.com/help/app-store-connect/reference/app-information/app-store-localizations/). A customer's Apple Account storefront determines access; being physically in Mexico alone does not select that storefront. No separate Apple developer account is needed just to select Mexico.

## Optional tips — recommended setup

Use **Support the game / Apoyar el juego**, inside Settings and behind the existing adult question. Keep every character and activity free, with no rewards, reminders, pressure, subscriptions, or interruptions for children. Call payments voluntary tips, not tax-deductible charitable donations. Apple treats approved nonprofit fundraising separately from developer tips. [Review Guidelines 1.3, 3.1.1 and 3.2.1](https://developer.apple.com/app-store/review/guidelines/).

1. In **App Store Connect → Business**, the account holder accepts the Paid Apps Agreement and completes Apple's banking/tax requirements. This is required for IAP even when the app download is free. Use the account's actual residency and business details; selling in Mexico does not itself make the seller Mexican. [Apple's purchase setup](https://developer.apple.com/help/app-store-connect/configure-in-app-purchase-settings/overview-for-configuring-in-app-purchases/).
2. Under the app, open **Monetization → In-App Purchases → + → Consumable**. Create repeatable optional tip products. Suggested IDs and labels:

| Product ID | English label | Spanish (Mexico) label |
| --- | --- | --- |
| `com.mindlesspawn.correrobbycorre.tip.small` | Small tip | Propina pequeña |
| `com.mindlesspawn.correrobbycorre.tip.medium` | Medium tip | Propina mediana |
| `com.mindlesspawn.correrobbycorre.tip.large` | Large tip | Propina grande |

3. Suggested starting amounts are about US$1, US$3 and US$5, chosen from the price points Apple offers. Review the Mexico prices and enable Mexico for **each tip product**, separately from app availability. Display StoreKit's localized price in the app so Mexican customers see the correct MXN price; do not hard-code dollar signs or exchange rates. Apple's taxes and commission reduce proceeds. [Create products](https://developer.apple.com/help/app-store-connect/manage-in-app-purchases/create-consumable-or-non-consumable-in-app-purchases/), [set prices](https://developer.apple.com/help/app-store-connect/manage-in-app-purchases/set-a-price-for-an-in-app-purchase/).
4. The native StoreKit purchase flow is implemented through the local Capacitor plugin. Confirm its three IDs match App Store Connect exactly. It loads actual products, shows Apple's confirmation, verifies and finishes transactions, distinguishes cancellation and pending approval, prevents duplicate taps, and recovers unfinished transactions. If products cannot load, it offers no purchase buttons and gameplay remains free/offline. No card details pass through the game.
5. Test in Apple's sandbox/TestFlight: success, cancellation, pending approval, interrupted purchase, unavailable product, repeated voluntary tips, no internet, and Mexican storefront localization. Test purchases should not be charged. Check current sandbox setup in [Apple's purchase review guide](https://developer.apple.com/help/app-review/before-submitting-for-review/configure-in-app-purchases/).
6. The privacy policy and listing now explain optional tips and Apple's payment handling. Confirm the final App Privacy answers match this implementation, including any changes made before submission.
7. Submit the first consumable products with the new app version, with review screenshots and the exact path through the parent gate. [First purchase submission](https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-in-app-purchase).

The website can use a separate hosted support link later, but the existing `CONFIG.support` URLs are not a StoreKit implementation. Do not simply activate a web donation link in the iOS build as a substitute for this purchase flow.
