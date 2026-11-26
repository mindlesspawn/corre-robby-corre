# corre, robby, corre

A learning runner for small children. Three doors come down the treadmill and the runner goes through the right one.

The game starts in Spanish. The start screen has an Español / English switch, and each device remembers its choice. The title is the same in both, and is written all in lower case on purpose.

## The games

Pick a game on the start screen.

- **Números (numbers):** hear a number and find that many dots, count little pictures, match a number to dots, then small sums.
- **Colores (colors):** see a color and find the door of that color, then find it from hearing its name alone.

Each game is a ladder of small steps. A right answer moves a child a little way up and a wrong answer a little way down, so the game settles at what is just hard enough. Progress is saved for each game. The − and + buttons on the start screen let a grown-up move a child to an easier or harder step.

## How a run works

- A run is 10 doors. It never ends early.
- A right door opens, with confetti and a happy spin.
- A wrong door gives a soft bump, shows which door was right, and the next right door brings the runner forward again.
- The question is shown as a picture, written underneath in words, and said out loud. Tapping the question says it again.
- The belt speeds up a little every 3 right answers and eases off after a miss.
- Stars from every run add up to unlock characters. The best runs go on the high score table.

## The voice

The game speaks with the voice built into the phone, tablet, or computer. iPhones and iPads come with Spanish voices. A device with no voice for the chosen language stays quiet, and the written question under the banner is there for a grown-up to read aloud. The sound button turns off both the sound effects and the voice.

## Play it online

The game is at <https://robbydcox-boop.github.io/corre-robby-corre/>. It works on any phone, tablet, or computer with internet.

To make it feel like an app on an iPhone or iPad: open the link in Safari, tap Share, then "Add to Home Screen".

Scores, progress, and unlocked characters are saved on each device, so they do not carry over from one device to another.

To update the online game after a change, save the change to GitHub (commit and push to `main`). The new version is live about a minute later.

## Play it from this computer

Start the game from this folder:

```powershell
npm run dev
```

It prints two addresses:

- **Local** (`http://localhost:5173`) opens the game on this computer.
- **Network** (the one marked Wi-Fi) opens it on a phone or tablet that is on the same wifi. Type it into Safari.

The first time, Windows may ask whether Node.js may use the network. Choose Allow, or the phone will not be able to reach it.

The game only works this way while `npm run dev` is running on this computer.

## Change things

| To change | Edit |
| --- | --- |
| The games and their steps (add a game, a step, or a new kind of question) | `src/questions.js` |
| Every word the player reads or hears, in Spanish and English | `src/text.js` |
| Characters, their looks, faces, and unlock costs | `src/characters.js` |
| Speed, doors per run, how fast steps go up, colors, the title | `src/config.js` |
| How a look is built (pictures and 3D models go here later) | `src/looks.js` |
| The voice | `src/speech.js` |
| Where scores and progress are saved (swap for iOS storage later) | `src/storage.js` |
