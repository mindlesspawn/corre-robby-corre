# corre, robby, corre

A learning runner for small children. Three doors come down the treadmill and the runner goes through the right one.

The game starts in Spanish. The start screen has an Español / English switch, and each device remembers its choice. The title is the same in both, and is written all in lower case on purpose.

## The games

Pick a game on the start screen.

- **Números (numbers):** small amounts as dots, comparing more and fewer, counting pictures and fingers, then written numbers, then small sums with pictures.
- **Colores (colors):** see a color and find the door of that color, then find it from hearing its name alone.

Each game is a ladder of small steps. A right answer moves a child a little way up and a wrong answer a little way down, so the game settles at what is just hard enough. Progress is saved for each game. The − and + buttons on the start screen let a grown-up move a child to an easier or harder step.

In the numbers game, playing alone stops climbing at sums up to 5. Harder sums are marked "para niños mayores" and are only reached when a grown-up picks them with the + button.

## How a run works

- A run is 10 doors. It never ends early.
- A right door opens, with confetti and a happy spin.
- A wrong door gives a soft bump, shows which door was right, and says the answer. For small amounts the voice counts them out first. The next right door brings the runner forward again.
- The question is shown as a picture, written underneath in words, and said out loud. Tapping the question says it again.
- The belt moves at one steady speed.
- Stars from every run add up to unlock characters. The best runs go on the high score table.

## What the learning steps are based on

The steps were checked on 26 November 2026 against published early-childhood teaching guidance. This is what was applied, with the source for each point.

| What the game does | Why | Source |
| --- | --- | --- |
| Starts with amounts of 1 to 3, shown as pictures and dots and said aloud | Recognising very small amounts at a glance comes first; start with one to three items | 1, 3 |
| Asks "more" and "fewer" before any written numbers | Comparing comes straight after counting, and before numerals | 1, 2 |
| Brings in written numbers late, each with its dots, then on their own | Numerals are taught once children can recognise, count, and compare amounts; linking a numeral to an amount up to 5 is expected by about age 5 | 1, 2, 4 |
| Uses fingers and dice-style dots | Fingers are a recommended informal tool; dice patterns are standard examples | 1, 3 |
| Stops automatic progress at sums up to 5, shown with pictures | Adding up to 5 is expected by about age 5; sums to 10 at age 4 are only found with objects or fingers; sums to 20 are first-grade work | 2, 5, 6 |
| Shows and says the right answer after a mistake, and adjusts difficulty in small steps | Feedback that explains, plus levelling, is what separated maths apps that helped from those that did not | 7, 8 |
| Teaches pink, orange, and purple alongside the other colors | Most basic color words are learned in any order at about age 3 | 9 |

Limits worth knowing:

- The order of steps is expert judgment. The main guide (source 1) says its panel found no direct evidence for any one particular order.
- Nearly all of this research was done with English-speaking children.
- Not built yet, though the sources recommend them: counting out a requested number ("dame 3"), tapping things to count them, "what comes after", and dots in varied layouts.
- The guidance for this age says to avoid fast-paced programs and let children go at their own pace (sources 8, 10). The belt therefore moves at one steady speed and no longer speeds up. The doors still arrive on a timer, so a child cannot stop to think for as long as they like. The speed settings are in `src/config.js`.
- The sources give no direct evidence on how long a round should be or on penalties.

Sources:

1. Institute of Education Sciences, *Teaching Math to Young Children* practice guide (2013): <https://ies.ed.gov/ncee/wwc/PracticeGuide/18>
2. Head Start *Early Learning Outcomes Framework* (2015), mathematics goals: <https://www.govinfo.gov/content/pkg/GOVPUB-HE23_1100-PURL-gpo65456/pdf/GOVPUB-HE23_1100-PURL-gpo65456.pdf>
3. Clements and Sarama, *Learning Trajectories*: <https://www.learningtrajectories.org/>
4. CDC developmental milestones, 5 years: <https://www.cdc.gov/act-early/milestones/5-years.html>
5. IES Regional Educational Laboratory, problem-solving progression: <https://ies.ed.gov/ncee/rel/math-young-children/pdf/TMYC_Mod4_Solving_Basic_Problems_Developmental_Progression.pdf>
6. Common Core State Standards, Grade 1 operations: <https://www.thecorestandards.org/Math/Content/1/OA/>
7. Outhwaite and others (2023), review of maths apps for young children: <https://discovery.ucl.ac.uk/10170561/1/Outhwaite%20et%20al.%202023.pdf>
8. Hirsh-Pasek and others (2015), *Putting Education in "Educational" Apps*: <https://www.psychologicalscience.org/publications/educational-apps.html>
9. Pitchford and Mullen (2006), on children learning color words: <https://www.mvr.mcgill.ca/Kathy/PDF-05-09/Pitchford-Mullen-2006.pdf>
10. American Academy of Pediatrics, *Media and Young Minds* (2016): <https://www.eurekalert.org/news-releases/695617>

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
| The hand pictures (made with Image Studio) | `public/art/hands/` |
