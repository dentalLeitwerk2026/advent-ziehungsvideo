// Erzeugt das Ziehungsvideo aus template/index.html.
// Aufruf: node render.js '{"day":3,"ticket":"NUSS-05661","stufe":"P5","antworten":127}' ausgabe.mp4
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const P = JSON.parse(process.argv[2] || '{}');
const out = process.argv[3] || 'video.mp4';
const FPS = 30, SECONDS = 10;

function check(p) {
  const day = Number(p.day);
  if (!Number.isInteger(day) || day < 1 || day > 24) throw new Error('day muss 1–24 sein: ' + p.day);
  if (!/^NUSS-\d{3,6}$/.test(String(p.ticket || ''))) throw new Error('ticket hat nicht die Form NUSS-12345: ' + p.ticket);
  if (!/^P[1-6]$/.test(String(p.stufe || ''))) throw new Error('stufe muss P1–P6 sein: ' + p.stufe);
  return { day, ticket: String(p.ticket), stufe: String(p.stufe), antworten: Math.max(0, Number(p.antworten) || 0) };
}

(async () => {
  const params = check(P);
  const frames = fs.mkdtempSync('/tmp/frames-');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(p => { window.P = p; }, params);
  await page.goto('file://' + path.join(__dirname, 'template', 'index.html'));
  await page.evaluate(() => window.ready);
  if (errors.length) throw new Error('Fehler in der Vorlage: ' + errors.join(' | '));
  for (let f = 0; f < FPS * SECONDS; f++) {
    await page.evaluate(t => window.render(t), f / FPS);
    await page.screenshot({ path: `${frames}/f${String(f).padStart(4, '0')}.png` });
  }
  await browser.close();
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(FPS), '-i', `${frames}/f%04d.png`,
    '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=48000',
    '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-crf', '20', '-maxrate', '4M', '-bufsize', '8M', '-g', '60',
    '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', out], { stdio: 'inherit' });
  fs.rmSync(frames, { recursive: true, force: true });
  console.log('Fertig:', out);
})().catch(e => { console.error(e.message || e); process.exit(1); });
