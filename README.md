# corre, robby, corre

A learning runner for small children. Three doors come down the treadmill and the runner goes through the right one.

The game starts in Spanish. The settings screen (the ⚙️ button on the start screen) has an Español / English switch, and each device remembers its choice. The title is the same in both, and is written all in lower case on purpose.

## The games

Pick a game on the start screen.

- **Números (numbers):** small amounts as dots, comparing more and fewer, counting pictures and fingers, written numbers, what number comes next, then sums.
- **Colores (colors):** see a color and find the door of that color, then find it from hearing its name alone. Ten colors in all.
- **Princesa (princess):** see a crown, a castle, or a unicorn and find its picture, then find it from hearing its name alone. Thirteen things in all. Made for a three year old.
- **Figuras (shapes):** the same with a circle, a square, and a triangle, then a star, a heart, a rectangle, an oval, a diamond, and a hexagon.
- **Patrones (patterns):** a repeating row, such as red, blue, red, blue: find what comes next. From age 4.

## Ages and levels

The start screen has one row of age buttons (3, 4, 5, and 6+) and, under it, the ten levels of the chosen game in two rows of five.

- Picking an age is the only difficulty setting. Every game has its own ten levels for each age.
- A level is one run of 10 doors. Getting 7 or more right clears it and opens the next one. Fewer than 7 changes nothing: the same level is there to try again.
- Each level adds a little: one more color or shape, a bigger number, a harder pattern. Some levels mix what came before, as a review.
- Clearing a level earns a sticker, a different one for each level of each game. It is shown on the end screen, and from then on it takes the place of that level's number on the start screen. A cleared level can be tapped to play it again. Levels that are not open yet are grey.
- Progress is saved for each age and each game, so two children of different ages can share a device by tapping their own age first.
- A child who cannot read can keep going alone. The end screen has one big green button with a play triangle, the picture of the game, and the number of the level it starts: the next level if this one was cleared, the same one if not. After the tenth level of a game it moves on to the next game that still has levels to clear. The little house goes back to the start screen.

| Age | Numbers | Colors | Princess things | Shapes | Patterns |
| --- | --- | --- | --- | --- | --- |
| 3 | Amounts up to 3, then 4, seen at a glance; more and fewer with very different amounts | Match by sight up to 7 colors; find up to 5 by name | Match by sight up to 9; find up to 5 by name | Circle, square, and triangle, then star, heart, and rectangle | None |
| 4 | Amounts up to 5; close amounts; written numbers up to 5, first with their dots | Find up to 7 by name, then colors that look alike | Find up to 9 by name | Up to 9 shapes by sight, 8 by name | Two-part rows (red, blue), then rows with a double (red, red, blue) |
| 5 | Counting up to 10; what number comes next; amounts up to 10; sums up to 10 with pictures | All 10 by name, then colors that look alike | All 13 by name | All 9 by name, then shapes that look alike | Up to three-part rows and doubled pairs |
| 6+ | Sums written only as numbers: up to 10, up to 20, then with two-digit numbers | All 10 by name, then every set of colors that look alike | All 13 by name | All 9 by name, then shapes that look alike | Four-part rows |

The exact levels are in `src/questions.js`, one line each.

The ages are typical expectations, not rules. Pick the age whose levels fit the child, whatever their birthday says. The sources for this batching are under "What the learning steps are based on" below.

## Endless mode

Endless mode is on the settings screen (the ⚙️ button), under "Para adultos o niños avanzados", next to the high score table it fills.

- Questions come at random from the levels open to the child, for the chosen age and game.
- Every right answer makes the belt faster, down to under a second per row of doors.
- It goes on for as long as the answers are right. The first miss ends the run.
- It has sounds but no talking. The question is shown in the banner and written underneath.
- An endless run does not clear a level.

## How a run works

- A run is 10 doors. It never ends early.
- A right door opens, with confetti and a happy spin. Every third right answer earns a special trick: a backflip, a high double spin, or a dance.
- The shapes and dots on the doors have little faces, and the numbers have a pair of eyes on top. The eyes never cover a number and a face never changes a shape's outline.
- When praise is spoken, the word also bounces onto the screen in rainbow letters with a burst of stars, for about a second. Clearing a level gets a bigger one.
- A wrong door gives a soft bump, shows which door was right, and says the answer. For small amounts the voice counts them out first. The next right door brings the runner forward again.
- The question is shown as a picture, written underneath in words, and said out loud. Tapping the question says it again.
- The belt has three speeds, picked on the settings screen (the ⚙️ button on the start screen): slow, normal, and fast. It keeps that speed through a run.
- The next doors wait until the voice has finished talking, and a long question slows the belt for that row, so there is always time to think after hearing it (about 3.5 seconds on slow, 2.5 on normal, 2 on fast).
- Praise is spoken with every other right answer and with every trick, not every time.
- Every character is unlocked from the start. (A character can be turned into a prize again by giving it an unlock cost in `src/characters.js`.) The high score table is for endless runs.

## What the learning steps are based on

The steps were checked on 26 November 2026 against published early-childhood teaching guidance. This is what was applied, with the source for each point.

| What the game does | Why | Source |
| --- | --- | --- |
| Starts with amounts of 1 to 3, shown as pictures and dots and said aloud | Recognising very small amounts at a glance comes first; start with one to three items | 1, 3 |
| Asks "more" and "fewer" before any written numbers | Comparing comes straight after counting, and before numerals | 1, 2 |
| Brings in written numbers late, each with its dots, then on their own | Numerals are taught once children can recognise, count, and compare amounts; linking a numeral to an amount up to 5 is expected by about age 5 | 1, 2, 4 |
| Uses fingers and dice-style dots | Fingers are a recommended informal tool; dice patterns are standard examples | 1, 3 |
| Keeps sums for ages 3 to 5 at 10 or less, shown with pictures | Adding up to 5 is expected by about age 5; some four year olds can find sums up to 10 with objects or fingers; sums written only as numbers, and sums to 20, come later | 2, 5, 6 |
| Starts shapes with a circle, a square, and a triangle | Recognising and naming a typical circle, square, and sometimes a triangle is expected at 3 to 4; matching identical shapes comes earlier | 2, 3 |
| Shows and says the right answer after a mistake, and adjusts difficulty in small steps | Feedback that explains, plus levelling, is what separated maths apps that helped from those that did not | 7, 8 |
| Teaches pink, orange, and purple alongside the other colors | Most basic color words are learned in any order at about age 3 | 9 |

How the steps are batched by age (checked again on 27 November 2026):

| Age | What the source expects | Source |
| --- | --- | --- |
| 3 (36 to 48 months) | Begins to recognise the number in a small group without counting; begins to compare small groups, such as 2 blocks and 4; recognises and names a typical circle, square, and sometimes a triangle | 2 |
| 3 | Shows they know at least one color by 30 months; most basic color words arrive at about 3 | 4, 9 |
| 4 (48 to 60 months) | By 60 months: recognises up to 5 objects at a glance; tells which of two groups has more for up to at least 5 objects; links a written numeral from 0 to 5 to an amount; recognises a greater number of shapes | 2 |
| 4 | Names a few colors | 4 |
| 5 | Counts to 10 and names some numbers between 1 and 5; by 60 months answers "how many?" for about 10 objects and adds up to 5; in kindergarten adds within 10 with objects or drawings | 2, 4, 11 |
| 6+ | First grade: adds within 20, fluently within 10, and adds a two-digit and a one-digit number | 6 |

What research from Vanderbilt University added (checked on 27 November 2026):

| What the game does | Why | Source |
| --- | --- | --- |
| Has a patterns game, from age 4 | In a study that followed 517 children from low-income homes from age 4 to 11, knowing repeating patterns in pre-school was one of three things that predicted maths in fifth grade. Children just starting pre-school scored very low on patterns, so the game starts them at 4. | 12 |
| Keeps comparing amounts going up to age 5, with amounts up to 10 | The other two predictors were comparing amounts and counting objects. The authors say comparing amounts gets too little attention in pre-school. | 12 |
| Asks "what number comes next" at ages 5 and 6 | A Vanderbilt teacher-training deck names moving up and down the number sequence as something to practise. | 13 |
| Keeps sounds and movement tied to the answer, with no extras to tap | In a study of children aged 2 to 4 using a touchscreen app, and in a later review, sounds, animations and tappable extras that had nothing to do with the task got in the way of learning. | 14, 15 |

How shapes are drawn, and how the game celebrates (checked on 27 November 2026):

| What the game does | Why | Source |
| --- | --- | --- |
| Draws shapes in other sizes and tilts in the later levels, and triangles, rectangles and ovals in other proportions at 5 and 6 | Shape toys and apps mostly show one "usual" version of each shape, and the researchers warn that children who only see those may not accept the others. Children are expected to name shapes whatever their size or which way up they are by about 5. | 2, 17, 18 |
| Never turns a square onto its corner | It would look like the diamond, which is a separate door in the game. | a design choice |
| Draws every shape on a door in the same ink color | So the shape is the only thing that tells the doors apart. | a design choice |
| Brings in the rectangle later than the star, circle, square and triangle | In a study of two year olds the star was the easiest shape to pick out and the rectangle the hardest. | 17 |
| Keeps celebrations short, only after a right answer, and biggest for a cleared level | An analysis of 124 children's apps marked apps down for praise and rewards after every action, and up for feedback tied to the answer. Getting to a new level is named as a better reward than stickers or badges. | 19, 20 |
| Asks, then waits; keeps a steady pace; repeats | Children's programmes that pause for an answer, go slowly and repeat are the ones researchers single out as holding attention and teaching. In one study of 100 videos, the pace of most was too fast for most children to take in. | 21, 22 |

The faces and the stickers are there to make the game friendlier, not because research says they teach. The sources above do not test faces, and they rate stickers below reaching a new level as a reward. So both are kept small: the faces do not move, and there is one sticker for a whole level, never one for each answer.

Not built, though this research points to it: telling a child why a shape is that shape ("it has three sides") when the answer is shown. In one study, children taught that way sorted shapes they had never seen about 30% better (source 23).

Two things from that research are advice for grown-ups, not features. Children under about 3 learn little from a screen on their own, and children of 3 to 5 learn more when a grown-up plays alongside, talks about what is on the screen, and connects it to real things ("you have three grapes too") (sources 15, 16).

Limits worth knowing:

- The pattern study shows a link, not a cause, it covered children from low-income homes only, and its authors call their pattern test only moderately reliable.
- The sources describe what is typical by an age. They do not say which exact questions belong to which birthday, so where each batch starts and ends is a judgment made from them. The princess game follows the colors game's batching, since both are about learning names.

- The order of steps is expert judgment. The main guide (source 1) says its panel found no direct evidence for any one particular order.
- Nearly all of this research was done with English-speaking children.
- The princess game (finding a picture from its name) fits the general goal of fast-growing vocabulary at this age (source 2), but the sources do not prescribe that particular activity. It is a design choice.
- Not built yet, though the sources recommend them: counting out a requested number ("dame 3"), tapping things to count them, "what comes before", and dots in varied layouts.
- The guidance for this age says to avoid fast-paced programs and let children go at their own pace (sources 8, 10). The belt therefore keeps one speed through a run, has a slow setting, and waits for the voice. The doors do still arrive on their own, so a child cannot stop them to think for as long as they like. The speed settings are in `src/config.js`.
- The sources give no direct evidence on how long a round should be or on penalties.

Sources:

1. Institute of Education Sciences, *Teaching Math to Young Children* practice guide (2013): <https://ies.ed.gov/ncee/wwc/PracticeGuide/18>
2. Head Start *Early Learning Outcomes Framework* (2015), mathematics goals: <https://www.govinfo.gov/content/pkg/GOVPUB-HE23_1100-PURL-gpo65456/pdf/GOVPUB-HE23_1100-PURL-gpo65456.pdf>
3. Clements and Sarama, *Learning Trajectories*: <https://www.learningtrajectories.org/>
4. CDC developmental milestones at 30 months, 4 years, and 5 years: <https://www.cdc.gov/act-early/milestones/30-months.html>, <https://www.cdc.gov/act-early/milestones/4-years.html>, <https://www.cdc.gov/act-early/milestones/5-years.html>
5. IES Regional Educational Laboratory, problem-solving progression: <https://ies.ed.gov/ncee/rel/math-young-children/pdf/TMYC_Mod4_Solving_Basic_Problems_Developmental_Progression.pdf>
6. Common Core State Standards, Grade 1 operations: <https://www.thecorestandards.org/Math/Content/1/OA/>
7. Outhwaite and others (2023), review of maths apps for young children: <https://discovery.ucl.ac.uk/10170561/1/Outhwaite%20et%20al.%202023.pdf>
8. Hirsh-Pasek and others (2015), *Putting Education in "Educational" Apps*: <https://www.psychologicalscience.org/publications/educational-apps.html>
9. Pitchford and Mullen (2006), on children learning color words: <https://www.mvr.mcgill.ca/Kathy/PDF-05-09/Pitchford-Mullen-2006.pdf>
10. American Academy of Pediatrics, *Media and Young Minds* (2016): <https://www.eurekalert.org/news-releases/695617>
11. Common Core State Standards, Kindergarten operations and counting: <https://www.thecorestandards.org/Math/Content/K/OA/>, <https://www.thecorestandards.org/Math/Content/K/CC/>
12. Rittle-Johnson, Fyfe, Hofer and Farran (2016), *Early Math Trajectories*, Vanderbilt University: <https://cdn.vanderbilt.edu/t2-my/my-prd/wp-content/uploads/sites/1185/2020/04/Early-Math-Trajectories_Final.pdf>
13. Peabody Research Institute, Vanderbilt University, *It's More Than Counting to 10!* (2016): <https://cdn.vanderbilt.edu/vu-my/wp-content/uploads/sites/1479/2016/09/14123103/pre-k-math-091516.pdf>
14. Russo-Johnson, Troseth, Duncan and Mesghina (2017), on touchscreens and word learning: <https://pmc.ncbi.nlm.nih.gov/articles/PMC5388766>
15. A review of research on how young children learn from screens: <https://pmc.ncbi.nlm.nih.gov/articles/PMC10783145>
16. Troseth, *Understanding Children's Learning in Digital Contexts* (slides), Vanderbilt University: <https://www.nichd.nih.gov/sites/default/files/2018-03/TrosethChildrensDigitalLearning.pdf>
17. A study of which shape names two year olds know, and what shape toys and books show: <https://pmc.ncbi.nlm.nih.gov/articles/PMC4808058>
18. A study of shape toys with usual and unusual shapes, and how parents talk about them: <https://pmc.ncbi.nlm.nih.gov/articles/PMC6289199/>
19. *How educational are educational apps for young children?* (2021), an analysis of 124 apps: <https://pmc.ncbi.nlm.nih.gov/articles/PMC8916741>
20. University of California, Irvine, on a study of 171 pre-school maths and reading apps (2018): <https://news.uci.edu/2018/09/19/most-preschool-math-literacy-apps-not-designed-to-help-children-learn-uci-study-finds>
21. Association for Psychological Science, *Watch and Learn* (2005), on research behind children's television: <https://www.psychologicalscience.org/observer/watch-and-learn>
22. The Hechinger Report on a study of 100 educational videos (2018): <https://hechingerreport.org/educational-videos-leaving-low-income-behind/>
23. University of Washington I-LABS, *Supporting Shape Knowledge*: <https://modules.ilabs.uw.edu/module/how-play-helps-math-learning/supporting-shape-knowledge>

## The voice

The game speaks with recorded clips in both languages, so it says the same thing in the same voice on every phone, tablet, and computer. The Spanish voice is Mexican Spanish and the English voice is American English. Both are computer-generated (made with OpenAI text-to-speech), not a person.

- The clips are in `public/voice/es/` and `public/voice/en/`, one for each line the game can say: 393 in each language.
- After each recording run, every clip was transcribed back and compared with its line.
- Sums bigger than 10 have no clip. For those the game uses the voice built into the device. If the device has no voice for that language, the game stays quiet for those sums, and the written question under the banner is there for a grown-up to read aloud.
- The sound button turns off the sound effects and the voice.
- On an iPhone or iPad, the switch on the side that silences the phone also silences the game.

To record again after changing the spoken words in `src/text.js` (for English, add `--language en`):

```powershell
node scripts/record-voice.mjs --key-file "C:\path\to\.env" --check --fix
```

The file must contain a line `OPENAI_API_KEY=...`. Only lines without a clip are recorded, so a small change costs very little. The key is sent only to OpenAI and is never printed or saved by the script. Do not put the key in this folder: this repository is public.

## The music

A quiet tune loops in the background: a marimba melody, a classical guitar picking the chords, and light percussion. The game makes it from simple sounds as it plays, so there is no music file, and the loop (16 bars, 40 seconds) joins without a gap.

- It is much quieter than the voice, and dips further while the voice is talking.
- In an endless run it speeds up with the belt.
- The music has its own volume slider, next to the 🎵 button on the settings screen and on the pause screen. Sliding it to zero, or tapping 🎵, turns only the music off. Each device remembers where the slider was left.
- The 🔊 button turns everything off.

## Play it online

The game is at <https://mindlesspawn.github.io/corre-robby-corre/>. It works on any phone, tablet, or computer with internet.

To make it feel like an app on an iPhone or iPad: open the link in Safari, tap Share, then "Add to Home Screen".

A phone is played upright. Held sideways, the game pauses and shows a phone turning back up. A tablet can be held either way. (A web page cannot stop a phone from turning, so the game waits instead. The iOS app will be able to lock it properly.)

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
| The faces on shapes, dots and numbers | `src/faces.js` |
| Characters, their looks, faces, and unlock costs | `src/characters.js` |
| The three belt speeds, doors per run, how fast steps go up, colors, the title | `src/config.js` |
| How a look is built (pictures and 3D models go here later) | `src/looks.js` |
| The voice, and which clip says which line | `src/speech.js`, `src/voice/es.json`, `src/voice/en.json` |
| Recording the voice clips | `scripts/record-voice.mjs` |
| Where scores and progress are saved (swap for iOS storage later) | `src/storage.js` |
| The hand pictures (made with Image Studio) | `public/art/hands/` |
| The background tune (its notes, speed, and loudness) | `src/music.js` |
| The look of the menus and buttons | `src/style.css` |
| The letters (Fredoka, a free rounded font bundled with the game) | the first line of `src/main.js` |
