/* $CAPY — endless run */

// ---- launch config: paste the mint at launch and redeploy ----
// CA alone lights up the contract bar (click-to-copy), the Chart icon
// (DexScreener) and the Buy icon (pump.fun). COMMUNITY_URL lights the
// community icon whenever you have one.
const CA = '';
const COMMUNITY_URL = '';

const vidA = document.getElementById('heroA');
const vidB = document.getElementById('heroB');
const soundbar = document.getElementById('soundbar');
const soundbtn = document.getElementById('soundbtn');
const vol = document.getElementById('vol');

// ---------- infinite loop with crossfade ----------
const FADE = 0.9; // seconds of overlap at the loop point
let active = vidA;
let standby = vidB;
let fading = false;
let muted = true;

function applyAudio(v) {
  v.muted = muted;
  v.volume = parseFloat(vol.value);
}

function checkLoop() {
  const v = active;
  if (!fading && v.duration && v.currentTime > v.duration - FADE) {
    fading = true;
    const next = standby;
    next.currentTime = 0;
    applyAudio(next);
    next.play().catch(() => {});
    next.classList.add('on');
    v.classList.remove('on');
    setTimeout(() => {
      v.pause();
      v.currentTime = 0;
      standby = v;
      active = next;
      fading = false;
    }, FADE * 1000 + 80);
  } else if (!fading && booted && v.paused) {
    // resurrect after background-tab throttling
    v.play().catch(() => {});
  }
}

function tick() {
  checkLoop();
  requestAnimationFrame(tick);
}
// rAF freezes in background tabs; keep the loop alive from an interval too
setInterval(checkLoop, 500);

// last-resort: if a hero ever runs to the end (missed crossfade), hard-restart it
for (const v of [vidA, vidB]) {
  v.addEventListener('ended', () => {
    if (v === active && !fading) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
  });
}

// ---------- launch ----------
let booted = true;
document.body.classList.add('booted');
active.play().catch(() => {});
requestAnimationFrame(tick);

// ---------- sound ----------
soundbtn.addEventListener('click', () => {
  muted = !muted;
  soundbar.classList.toggle('muted', muted);
  soundbtn.querySelector('b').textContent = muted ? 'Sound Off' : 'Sound On';
  soundbtn.setAttribute('aria-pressed', String(!muted));
  applyAudio(active);
  applyAudio(standby);
  active.play().catch(() => {});
});
vol.addEventListener('input', () => {
  applyAudio(active);
  applyAudio(standby);
});

// ---------- launch links ----------
function goLive(id, href, title) {
  const el = document.getElementById(id);
  el.classList.remove('pending');
  el.removeAttribute('aria-disabled');
  el.href = href;
  el.target = '_blank';
  el.rel = 'noopener';
  el.title = title;
}
if (CA) {
  goLive('ico-chart', `https://dexscreener.com/solana/${CA}`, 'Chart');
  goLive('ico-buy', `https://pump.fun/coin/${CA}`, 'Buy');
}
if (COMMUNITY_URL) goLive('ico-comm', COMMUNITY_URL, 'Community');

// ---------- contract bar ----------
const caEl = document.getElementById('ca');
if (CA) {
  caEl.textContent = CA;
  caEl.classList.remove('soon');
  caEl.classList.add('copy');
  caEl.title = 'copy';
  caEl.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(CA);
      const prev = caEl.textContent;
      caEl.textContent = 'copied';
      setTimeout(() => (caEl.textContent = prev), 900);
    } catch {}
  });
}

// ---------- memes ----------
const CLIPS = [
  { thumb: 'https://pbs.twimg.com/media/HP7yoVsXAAA6Fmz?format=webp&name=medium', img: 'https://pbs.twimg.com/media/HP7yoVsXAAA6Fmz?format=webp&name=large' },
  { thumb: 'https://pbs.twimg.com/media/HP7vr9AWcAArRoK?format=webp&name=medium', img: 'https://pbs.twimg.com/media/HP7vr9AWcAArRoK?format=webp&name=large' },
  { thumb: 'https://pbs.twimg.com/media/HP7rYcpXMAAkjMZ?format=webp&name=medium', img: 'https://pbs.twimg.com/media/HP7rYcpXMAAkjMZ?format=webp&name=large' },
  { thumb: 'https://pbs.twimg.com/media/HP7pRn_WMAALlSv?format=webp&name=medium', img: 'https://pbs.twimg.com/media/HP7pRn_WMAALlSv?format=webp&name=large' },
  { thumb: 'https://pbs.twimg.com/amplify_video_thumb/2089361406583771136/img/tWGvDpYgRpli0wvP.jpg', img: 'https://pbs.twimg.com/amplify_video_thumb/2089361406583771136/img/tWGvDpYgRpli0wvP.jpg' },
];

const memes = document.getElementById('memes');
const grid = document.getElementById('memegrid');
const light = document.getElementById('light');
const lightimg = document.getElementById('lightimg');
let cur = 0;

CLIPS.forEach((c, i) => {
  const b = document.createElement('button');
  b.className = 'meme';
  b.type = 'button';
  const img = document.createElement('img');
  img.alt = `meme ${i + 1}`;
  img.loading = 'lazy';
  img.src = c.thumb;
  b.appendChild(img);
  b.addEventListener('click', () => openLight(i));
  grid.appendChild(b);
});

document.getElementById('memesbtn').addEventListener('click', () => (memes.hidden = false));
document.getElementById('memesclose').addEventListener('click', () => (memes.hidden = true));
memes.addEventListener('click', (e) => { if (e.target === memes) memes.hidden = true; });

function openLight(i) {
  cur = i;
  lightimg.src = CLIPS[cur].img;
  light.hidden = false;
}
function closeLight() {
  light.hidden = true;
  lightimg.removeAttribute('src');
}
document.getElementById('lightclose').addEventListener('click', closeLight);
document.getElementById('lightprev').addEventListener('click', () => openLight((cur + CLIPS.length - 1) % CLIPS.length));
document.getElementById('lightnext').addEventListener('click', () => openLight((cur + 1) % CLIPS.length));
light.addEventListener('click', (e) => { if (e.target === light) closeLight(); });

document.addEventListener('keydown', (e) => {
  if (!light.hidden) {
    if (e.key === 'Escape') closeLight();
    if (e.key === 'ArrowLeft') openLight((cur + CLIPS.length - 1) % CLIPS.length);
    if (e.key === 'ArrowRight') openLight((cur + 1) % CLIPS.length);
  } else if (!memes.hidden && e.key === 'Escape') {
    memes.hidden = true;
  }
});
