# Sunny Steps

The game's background recording, generated with ElevenLabs Music v2 on 27 November 2026. The brief prioritizes an adult listening alongside a child: a memorable, playful tune with a relaxed groove and enough variation for repeat play.

The musical direction is acoustic soul-pop with a light bossa-nova rhythm: warm electric piano, nylon guitar, rounded bass, brushed drums, soft shakers, and occasional mellow marimba. The requested tempo is 96 BPM. Four instrumental takes were generated; take 1 is the initial game version. The other takes remain in the [ElevenLabs flow](https://elevenlabs.io/app/flows/gm6twH64ZaZCdZZOOQXM). The exact prompt, generation IDs, and processing measurements are in `sunny-steps.json`.

## What informed the brief

| Evidence | How it shaped this track |
| --- | --- |
| In his [Library of Congress interview](https://www.loc.gov/static/programs/national-recording-preservation-board/documents/koji-kondo-interview.pdf), Mario composer Koji Kondo emphasizes approachable rhythms and memorable melodies; he attributes variety on repetition to four distinct motifs. | A recognizable hook with related contrasting phrases and changes of instrumentation, rather than one phrase playing continuously. |
| [Bluey's composer describes](https://www.bluey.tv/blog/qa-with-joff/) a compact repeated theme and scores shaped by each story, including guitar and orchestral arrangements. | A clear musical identity and warm instrumentation with detail for adults. This is a family-media reference, not a game study. |
| [Witek et al. (2014)](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0094446) found the highest pleasure and desire-to-move ratings at medium syncopation in drum breaks. | A gently syncopated groove with a clear pulse. |
| [Jakubowski et al., summarized by APA](https://www.apa.org/news/press/releases/2016/11/earworms), linked earworms to familiar melodic contours with distinctive intervals or repetition. | A short rising-and-falling hook with a recognizable rhythmic turn. Memorability alone does not establish pleasantness. |

These sources do not establish a universal best soundtrack for parents watching preschool games. The genre, tempo, arrangement, lack of vocals, and longer repeat interval are design choices informed by them. Actual parent preference and listening fatigue still need listening feedback; the technical checks do not measure those qualities.

## Playback and preparation

- The 160-second original becomes a 157.5-second loop by blending its first 2.5 seconds over its last 2.5 seconds. This softens the join and removes an abrupt restart. The requested tempo makes that approximately one bar; generated timing is not guaranteed to follow the prompt exactly.
- Static gain preserves the dynamics. The encoded asset measures -20.44 LUFS integrated and -7.56 dBTP, at 160 kbps stereo / 48 kHz (about 3.15 MB).
- `src/music.js` streams it through the shared audio system, lowers it during speech, and preserves pitch during gentle endless-mode acceleration. Music defaults to 40%; other saved custom levels are retained. The former 65% default migrates once to 40%.
- Overall volume, music, voice, and effects have independent saved sliders in the quick sound panel, Settings, and Pause. Recorded speech and synthesized effects use separate gain controls under the master gain; device speech receives the equivalent combined volume.
- Switching apps pauses the track and keeps its place. A load or decoding failure uses the original synthesized tune in `src/music-fallback.js`.
- Music is bundled under `public/music/`, including for the iOS build. No ElevenLabs request or account credential is needed during play.

To reproduce the game asset from the original take, with FFmpeg installed:

```sh
node scripts/prepare-music.mjs ORIGINAL.mp3 public/music/sunny-steps.mp3
```

An optional third argument supplies the FFmpeg executable path. Run playback lifecycle checks with `node --experimental-vm-modules --test tests/music.test.mjs`.
