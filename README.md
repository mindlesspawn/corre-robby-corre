# Number Run

A learning runner for kids. Three doors come down the treadmill, each with an answer on top. Roll through the right one.

## Play it

Start the game from this folder:

```powershell
npm run dev
```

It prints two addresses:

- **Local** (`http://localhost:5173`) opens the game on this computer.
- **Network** (the one marked Wi-Fi) opens it on a phone or tablet that is on the same wifi. Type it into Safari.

The first time, Windows may ask whether Node.js may use the network. Choose Allow, or the phone will not be able to reach it.

To make it feel like an app on an iPhone or iPad: open the Network address in Safari, tap Share, then "Add to Home Screen".

The game only works while `npm run dev` is running on this computer.

## Change things

| To change | Edit |
| --- | --- |
| Characters, their looks, and unlock costs | `src/characters.js` |
| Speed, difficulty steps, colors, the title | `src/config.js` |
| The questions (add subtraction, and so on) | `src/questions.js` |
| How a look is built (pictures and 3D models go here later) | `src/looks.js` |
| Where scores are saved (swap for iOS storage later) | `src/storage.js` |

## How a run works

- A right answer scores 1 point and opens the door.
- The first wrong answer pushes the runner back. Three right answers in a row bring it forward again.
- A second wrong answer while pushed back ends the run.
- The belt speeds up every 3 right answers and eases off after a miss.
- Points from every run add up to unlock characters. The top 10 runs go on the high score table.
