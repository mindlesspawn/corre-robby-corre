# The iOS app

## Confirmed account and launch preferences

- Robby already has an **individual Apple Developer membership**, reconfirmed on 27 November 2026. Do not ask him to enroll again. Apple displays the individual account holder's legal name as seller; use the name already on the account.
- **Mexico must be included** in distribution, with Spanish (Mexico) store metadata and English (U.S.) as well.
- The game stays free. Optional parent-only tips use a local StoreKit 2 plugin. App Store Connect products, payment agreements, and device/sandbox purchase validation still need the account holder.
- At Robby's request, ElevenLabs licensing is excluded from the 27 November readiness review; do not treat that exclusion as a license verification.
- Follow [the current launch checklist](store/launch-checklist.md) for the remaining work and tip setup.

The app is the same game as the website, wrapped so it can go on the App Store. There is one game and one set of files: the website's. The app is made from them with one command, so any change to the game reaches the app the same way.

- `ios/` is the Xcode project. It was made with Capacitor and rarely needs touching by hand.
- `capacitor.config.json` holds the app's name and its ID.
- `store/app-store-listing.md` is the draft of everything typed into App Store Connect.
- `public/privacy.html` is the privacy page the App Store asks for.

## What is already set up

- An iPhone is upright only. An iPad can be held any way.
- Progress is saved in the phone's own store, which iOS keeps for as long as the app is installed.
- The app icon and the picture shown while the app opens.
- The name under the icon is "corre robby" (the full name is too long to fit there).
- Gameplay works with no internet: the pictures, voice and music are all inside it. Optional tips need an App Store connection.

## After changing the game

Whenever the game changes, on the PC or on the Mac, this puts the newest version into the app:

```bash
npm run ios
```

Then press Run in Xcode again. Nothing else needs doing.

## The first time, on the Mac

Use Xcode 26 or later with an iOS 26 or later SDK, following [Apple's current upload requirements](https://developer.apple.com/news/upcoming-requirements/), and Node.js 22 or newer. Your existing individual Apple Developer membership is sufficient.

1. Get the project onto the Mac:

   ```bash
   git clone https://github.com/mindlesspawn/corre-robby-corre.git
   cd corre-robby-corre
   npm ci
   ```

2. Put the game into the app and open it in Xcode:

   ```bash
   npm run ios
   npx cap open ios
   ```

3. In Xcode, click **App** at the top of the left-hand list, then the **Signing & Capabilities** tab. Tick **Automatically manage signing** and pick your team (your Apple developer account).

4. Plug in an iPhone or iPad, choose it at the top of the Xcode window, and press the Run button (the triangle). The first time, the phone asks you to trust the computer, and may ask you to trust the developer under Settings > General > VPN & Device Management.

5. Check on the real device, because this is what could not be checked on the PC:
   - The voice and the music play, and the music slider and the sound button work.
   - The side switch that silences the phone silences the game.
   - Progress is still there after closing the app completely and opening it again.
   - An iPhone stays upright when turned. An iPad turns.
   - Nothing is hidden behind the notch or the bar at the bottom.

## Sending it to Apple

Do this once the game is the way you want it.

1. Use the existing individual account and confirm that the bundle ID in `store/app-store-listing.md` matches the registered identifier. The ID cannot be changed after the first upload. The seller is the account holder's legal name.
2. On <https://appstoreconnect.apple.com>, choose **Apps**, then **+**, then **New App**. Pick the same ID as in Xcode. This step can ask you to accept agreements first.
3. In Xcode, choose **Any iOS Device** at the top, then the menu **Product > Archive**. When it finishes, press **Distribute App**, then **App Store Connect**, then **Upload**.
4. After Apple processes the upload, the build appears in App Store Connect under **TestFlight**. Install the TestFlight app on your phone to try the packaged build, and to share it with family before it is public. External testers may require beta review.
5. Fill in the listing from `store/app-store-listing.md`, add the screenshots, answer the current privacy and age questions, explicitly enable **Mexico** under Pricing and Availability, and submit for review. Processing and review times vary.

For every upload, increase **Build** in Xcode. For a new App Store version, also increase **Version**, then repeat steps 3 to 5.

## Things that are not done yet

- **Screenshots** for the App Store. These wait until the game has stopped changing.
- **Trying it on a real iPhone and iPad.** The hosted-Mac workflow checks an unsigned simulator build. Signing, archiving, physical-device checks, and Apple sandbox purchases remain to be done on the owner's Mac/devices.
- **Tip activation and validation.** The iOS Settings screen has Support the game behind a typed adult question. Create the three consumables in `store/tip-products.json`, enable Mexico for the app and each product, finish agreements/banking/tax setup, and test purchases in Apple's sandbox. The browser version does not offer Apple purchases or substitute an external payment link.

## Handoff preference

Robby wants the remaining Mac steps **one at a time**, after preparation is complete. Start by confirming Xcode is installed and can open. Do not repeat the full launch checklist or ask whether he has a developer membership.
