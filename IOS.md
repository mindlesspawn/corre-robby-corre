# The iOS app

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
- The app works with no internet: the pictures, voice and music are all inside it.

## After changing the game

Whenever the game changes, on the PC or on the Mac, this puts the newest version into the app:

```bash
npm run ios
```

Then press Run in Xcode again. Nothing else needs doing.

## The first time, on the Mac

You need Xcode (free, from the Mac App Store) and Node.js 22 or newer.

1. Get the project onto the Mac:

   ```bash
   git clone https://github.com/mindlesspawn/corre-robby-corre.git
   cd corre-robby-corre
   npm install
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

1. Decide the two open things in `store/app-store-listing.md`: the app's ID and the seller name. The ID cannot be changed after the first upload.
2. On <https://appstoreconnect.apple.com>, choose **Apps**, then **+**, then **New App**. Pick the same ID as in Xcode. This step can ask you to accept agreements first.
3. In Xcode, choose **Any iOS Device** at the top, then the menu **Product > Archive**. When it finishes, press **Distribute App**, then **App Store Connect**, then **Upload**.
4. About fifteen minutes later the build appears in App Store Connect under **TestFlight**. Install the TestFlight app on your phone to try it exactly as the App Store would deliver it, and to share it with family before it is public.
5. Fill in the listing from `store/app-store-listing.md`, add the screenshots, answer the privacy and age questions, and press **Submit for Review**. Review usually takes a few days.

For every later version, raise the version number in Xcode (**App > General > Version**), then repeat steps 3 to 5.

## Things that are not done yet

- **Screenshots** for the App Store. These wait until the game has stopped changing.
- **Trying it on a real iPhone and iPad.** Everything above was prepared on a Windows PC, where an iOS app cannot be built or run.
- **The support page.** It is hidden. Before turning it on inside the app, check Apple's current rules: in a children's app, a link out or anything to do with money must be behind a grown-up check (the game has one), and a tip given inside an app normally has to go through Apple's own in-app purchase.
