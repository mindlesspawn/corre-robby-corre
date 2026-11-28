// Make a quiet looping game asset from the 160-second ElevenLabs master.
// Usage: node scripts/prepare-music.mjs INPUT.mp3 OUTPUT.mp3 [FFMPEG]
// FFmpeg is only an authoring tool; the game needs no service or extra dependency.
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, unlink, rmdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

const [input, output, ffmpeg = 'ffmpeg'] = process.argv.slice(2);
if (!input || !output) throw new Error('Usage: node scripts/prepare-music.mjs INPUT.mp3 OUTPUT.mp3 [FFMPEG]');
if (resolve(input) === resolve(output)) throw new Error('Keep the source master separate from the game asset.');
const scratch = await mkdtemp(join(tmpdir(), 'corre-music-'));
const loop = join(scratch, 'loop.wav');
const run = (args) => execFileSync(ffmpeg, ['-hide_banner', '-nostats', ...args], {
  encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 4 * 1024 * 1024,
});
try {
  // Rotate the first bar to the end and blend it over the last bar. The boundary
  // then reconnects two adjacent points in the original recording, without silence.
  run(['-y', '-i', input, '-i', input, '-filter_complex',
    '[0:a]atrim=start=2.5:end=160,asetpts=PTS-STARTPTS[body];' +
    '[1:a]atrim=end=2.5,asetpts=PTS-STARTPTS[head];' +
    '[body][head]acrossfade=d=2.5:c1=tri:c2=tri[loop]',
    '-map', '[loop]', '-c:a', 'pcm_f32le', loop]);
  let analysis;
  // FFmpeg prints measurements to stderr, so capture both streams for this pass.
  const { spawnSync } = await import('node:child_process');
  const measured = spawnSync(ffmpeg, ['-hide_banner', '-nostats', '-i', loop,
    '-af', 'loudnorm=I=-20:TP=-2:LRA=7:print_format=json', '-f', 'null', '-'], { encoding: 'utf8' });
  if (measured.status !== 0) throw new Error(measured.stderr);
  const report = measured.stderr.match(/\{\s*"input_i"[^{}]+\}/s);
  if (!report) throw new Error('FFmpeg did not return loudness measurements.');
  analysis = JSON.parse(report[0]);
  if (!Number.isFinite(Number(analysis.input_i)) || !Number.isFinite(Number(analysis.input_tp))) {
    throw new Error('The input did not produce a measurable music loop.');
  }
  // Static gain keeps the dynamics intact and avoids a compressor changing the seam.
  const gain = Math.min(-20 - Number(analysis.input_i), -2 - Number(analysis.input_tp));
  await mkdir(dirname(resolve(output)), { recursive: true });
  run(['-y', '-i', loop, '-af', `volume=${gain.toFixed(3)}dB`,
    '-ar', '48000', '-ac', '2', '-c:a', 'libmp3lame', '-b:a', '160k',
    '-map_metadata', '-1', '-metadata', 'title=Sunny Steps',
    '-metadata', 'comment=Generated with ElevenLabs Music v2 for corre, robby, corre', output]);
  console.log(JSON.stringify({ output, duration_seconds: 157.5, crossfade_seconds: 2.5,
    source_lufs: Number(analysis.input_i), gain_db: gain, target_lufs: -20 }, null, 2));
} finally {
  await unlink(loop).catch(() => {});
  await rmdir(scratch);
}
