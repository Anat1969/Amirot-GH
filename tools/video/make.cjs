// סרטון הדגמה של אמירות: קריינות בקול אברי (he-IL-AvriNeural) במהירות 1.2, ודפדוף חי באפליקציה בסנכרון לקריינות.
// הרצה (מול vite preview בפורט 4173):  node tools/video/make.cjs [תיקיית פלט]
// דרישות: pip install edge-tts, ffmpeg, וגישת רשת ל-speech.platform.bing.com.
// בלי גישה לקול: נוצרת תצוגה מקדימה שקטה עם כתוביות ותזמון משוער (--preview), כדי לבדוק את הצילום.
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE || 'http://localhost:4173/';
const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'script.json'), 'utf8'));
const OUT = path.resolve(process.argv.find((a, i) => i > 1 && !a.startsWith('--')) || path.join(__dirname, 'out'));
const PREVIEW = process.argv.includes('--preview');
fs.mkdirSync(OUT, { recursive: true });
const sh = (cmd, args) => execFileSync(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] }).toString();
const dur = (f) => parseFloat(sh('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]));
const PAD = 0.45; // שקט קצר בין סצנות

// 1. קריינות: קובץ לכל סצנה, והאורך שלו קובע את אורך הסצנה
function narrate() {
  return cfg.scenes.map((s) => {
    const f = path.join(OUT, `${s.id}.mp3`);
    if (PREVIEW) return { ...s, audio: null, len: s.say.length / 15 + PAD }; // הערכה: כ-15 תווים לשנייה במהירות 1.2
    if (!fs.existsSync(f)) {
      const proxy = process.env.HTTPS_PROXY ? ['--proxy', process.env.HTTPS_PROXY] : [];
      sh('edge-tts', [...proxy, '--voice', cfg.voice, `--rate=${cfg.rate}`, '--text', s.say, '--write-media', f]);
    }
    return { ...s, audio: f, len: dur(f) + PAD };
  });
}

// 2. צילום: CDP screencast, מסגרת לכל שינוי במסך עם חותמת זמן
async function record(scenes) {
  const { width: W, height: H } = cfg.viewport;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  const frames = path.join(OUT, 'frames');
  fs.rmSync(frames, { recursive: true, force: true }); fs.mkdirSync(frames);
  const list = [];
  const cdp = await page.context().newCDPSession(page);
  let recording = false;
  cdp.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
    cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
    if (!recording) return;
    const f = path.join(frames, `${String(list.length).padStart(6, '0')}.jpg`);
    fs.writeFileSync(f, Buffer.from(data, 'base64'));
    list.push({ f, t: metadata.timestamp });
  });

  // סמן עכבר וכתובית, מוזרקים לדף כדי שייראו בצילום ויקבלו את גופני האפליקציה וכיווניות RTL אמיתית
  const overlay = (cap) => page.evaluate((cap) => {
    let c = document.getElementById('__cur');
    if (!c) {
      c = document.createElement('div'); c.id = '__cur';
      c.style.cssText = 'position:fixed;z-index:99999;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;background:rgba(26,26,24,.18);border:2px solid #1a1a18;pointer-events:none;transition:transform .15s;left:-50px;top:-50px';
      document.body.appendChild(c);
      addEventListener('mousemove', (e) => { c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px'; }, true);
      addEventListener('mousedown', () => { c.style.transform = 'scale(.7)'; }, true);
      addEventListener('mouseup', () => { c.style.transform = ''; }, true);
    }
    let b = document.getElementById('__cap');
    if (!b) {
      b = document.createElement('div'); b.id = '__cap'; b.dir = 'rtl';
      b.style.cssText = "position:fixed;z-index:99998;left:50%;bottom:44px;transform:translateX(-50%);max-width:1200px;padding:18px 34px;background:rgba(26,26,24,.9);color:#fff;font:600 34px/1.45 'Frank Ruhl Libre',serif;text-align:center;white-space:pre-line;direction:rtl;unicode-bidi:plaintext;box-shadow:0 10px 40px rgba(0,0,0,.25);border-right:6px solid #1d7a4f;pointer-events:none;opacity:0;transition:opacity .35s";
      document.body.appendChild(b);
    }
    b.textContent = cap; requestAnimationFrame(() => { b.style.opacity = '1'; });
  }, cap);

  const pos = { x: W * 0.5, y: H * 0.5 };
  const move = async (x, y, steps = 28) => { await page.mouse.move(x, y, { steps }); pos.x = x; pos.y = y; };

  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: W, maxHeight: H, everyNthFrame: 1 });
  for (const [i, s] of scenes.entries()) {
    const t0 = Date.now();
    await page.goto(BASE + s.url);
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(350);
    await overlay(s.cap);
    await page.mouse.move(pos.x, pos.y);
    if (i === 0) { recording = true; }
    s.start = (Date.now() - t0) / 1000; // זמן הטעינה לא נכנס לסרטון: הוא נחתך בעריכה
    const tScene = Date.now();
    const left = () => s.len - (Date.now() - tScene) / 1000;
    for (const a of s.do) {
      if (left() <= 0.3) break;
      if (a[0] === 'wait') await page.waitForTimeout(Math.max(0, a[1] * s.len * 1000));
      else if (a[0] === 'move') await move(a[1] * W, a[2] * H);
      else if (a[0] === 'wheel') {
        await move(a[1] * W, a[2] * H, 16);
        const n = 40, ms = Math.max(20, (left() - 0.6) * 1000 / n);
        for (let k = 0; k < n; k++) { await page.mouse.wheel(0, a[3] / n); await page.waitForTimeout(ms); }
      } else if (a[0] === 'click') {
        const el = page.getByText(a[1], { exact: false }).first();
        const box = await el.boundingBox().catch(() => null);
        if (box) { await move(box.x + box.width / 2, box.y + box.height / 2); await page.waitForTimeout(150); await el.click().catch(() => {}); }
        else console.warn(`[${s.id}] לא נמצא: ${a[1]}`);
      }
    }
    if (left() > 0) await page.waitForTimeout(left() * 1000);
    s.wall = [tScene, Date.now()];
  }
  recording = false;
  await cdp.send('Page.stopScreencast');
  await browser.close();
  return { list, scenes };
}

// 3. עריכה: לכל סצנה רק המסגרות שבין תחילתה לסופה, באורך הקריינות המדויק
function assemble({ list, scenes }) {
  const concat = [];
  for (const s of scenes) {
    const [a, b] = s.wall.map((x) => x / 1000);
    const fr = list.filter((x) => x.t >= a && x.t < b);
    const prev = list.filter((x) => x.t < a).pop();
    const seq = prev ? [{ ...prev, t: a }, ...fr] : fr;
    seq.forEach((x, k) => {
      const end = k + 1 < seq.length ? seq[k + 1].t : a + s.len;
      concat.push(`file '${x.f}'`, `duration ${Math.max(0.001, end - x.t).toFixed(4)}`);
    });
  }
  concat.push(concat[concat.length - 2]);
  fs.writeFileSync(path.join(OUT, 'frames.txt'), concat.join('\n'));
  const silent = path.join(OUT, 'video.mp4');
  sh('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', path.join(OUT, 'frames.txt'), '-vf', 'fps=30,format=yuv420p', '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', silent]);
  if (PREVIEW) { fs.renameSync(silent, path.join(OUT, 'amirot-preview.mp4')); return path.join(OUT, 'amirot-preview.mp4'); }
  // פס קול: כל קטע במקומו, עם שקט עד הסצנה הבאה
  const parts = scenes.map((s, i) => { const f = path.join(OUT, `pad${i}.wav`); sh('ffmpeg', ['-y', '-i', s.audio, '-af', `apad=whole_dur=${s.len.toFixed(3)}`, '-ar', '48000', '-ac', '2', f]); return `file '${f}'`; });
  fs.writeFileSync(path.join(OUT, 'audio.txt'), parts.join('\n'));
  const wav = path.join(OUT, 'voice.wav');
  sh('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', path.join(OUT, 'audio.txt'), wav]);
  const final = path.join(OUT, 'amirot.mp4');
  sh('ffmpeg', ['-y', '-i', silent, '-i', wav, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', final]);
  return final;
}

(async () => {
  const scenes = narrate();
  console.log(`סצנות: ${scenes.length}, אורך: ${scenes.reduce((s, x) => s + x.len, 0).toFixed(1)} שניות${PREVIEW ? ' (משוער)' : ''}`);
  const out = assemble(await record(scenes));
  console.log('נוצר:', out, `(${dur(out).toFixed(1)} שניות)`);
})();
