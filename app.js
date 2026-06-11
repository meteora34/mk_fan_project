// ============================================================
//  MORTAL KOMBAT — app.js
//  Все данные грузятся из data/*.json
//  Картинки берутся из img/fighters/ и img/arenas/
// ============================================================

// ── State ────────────────────────────────────────────────────────
let fighters = [];
let games    = [];
let misc     = {};
let arenas   = [];

// ── Bootstrap ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  try {
    [fighters, games, misc] = await Promise.all([
      fetch('data/fighters.json').then(r => r.json()),
      fetch('data/games.json').then(r => r.json()),
      fetch('data/misc.json').then(r => r.json()),
    ]);
    arenas = misc.arenas || [];
  } catch (e) {
    console.error('Failed to load JSON data:', e);
    showLoadError();
    return;
  }
  initObservers();
  
  renderHero();
  renderFighters();
  renderTimeline();
  renderLore();
  renderQuotes();
  renderCounters();
  renderArena();
  renderFatalityGen();
  initCursorTrail();
  initBloodDrips();

  initSoundEngine();
  renderSoundboard();
  renderMemes();
});

function showLoadError() {
  document.body.innerHTML += `
    <div style="position:fixed;inset:0;background:#000;color:#cc0000;
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      font-family:monospace;font-size:1.2rem;z-index:99999;gap:16px;">
      <div style="font-size:3rem">⚠️</div>
      <div>Ошибка загрузки данных</div>
      <div style="font-size:.8rem;color:#666">Откройте через локальный сервер (Live Server / python3 -m http.server)</div>
    </div>`;
}

// ── HERO ─────────────────────────────────────────────────────────
function renderHero() {
  const scorp = document.getElementById('heroScorpion');
  if (scorp && misc.scorpionHero) {
  const isMobile = window.innerWidth <= 768;
  scorp.src = isMobile ? 'img/fd480512ca8d522de4ec464e4171ed45.jpg' : misc.scorpionHero;
}

  const logo = document.getElementById('heroLogo');
  if (logo && misc.logo) logo.src = misc.logoNav;

  const navLogo = document.getElementById('navLogo');
  if (navLogo && misc.logo) {
    navLogo.innerHTML = `<img src="${misc.logo}"
      style="height:36px; width:36px; vertical-align:middle; margin-right:8px; clip-path:circle(50%); filter:drop-shadow(0 0 16px rgba(201,160,48,0.95));"> MK`;
  }

  const footerLogo = document.getElementById('footerDragon');
  if (footerLogo && misc.logoNav) {
    footerLogo.src = misc.logoNav;
  }
}

// ── FIGHTERS GRID ─────────────────────────────────────────────────
function renderFighters() {
  const grid = document.getElementById('fightersGrid');
  if (!grid) return;

  grid.innerHTML = fighters.map(f => `
    <div class="fighter-card" ondblclick="openFighterModal('${escAttr(f.name)}')">
      <div class="fighter-bg" style="background:${f.bg}"></div>
      <img class="fighter-sprite"
           src="${f.img}"
           alt="${escAttr(f.name)}"
           loading="lazy">
      <div class="fighter-special"
           style="color:${f.color};border-color:${f.color}">${f.special}</div>
      <div class="fighter-info">
        <div class="fighter-name">${f.name}</div>
        <div class="fighter-title-tag" style="color:${f.color}">${f.title}</div>
        <div class="fighter-stats">
          <div class="stat">
            <span class="stat-label">Power</span>
            <div class="stat-bar">
              <div class="stat-fill" style="width:${f.power}%;background:${f.color}"></div>
            </div>
          </div>
          <div class="stat">
            <span class="stat-label">Speed</span>
            <div class="stat-bar">
              <div class="stat-fill" style="width:${f.speed}%;background:${f.color}"></div>
            </div>
          </div>
          <div class="stat">
            <span class="stat-label">Defense</span>
            <div class="stat-bar">
              <div class="stat-fill" style="width:${f.defense}%;background:${f.color}"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  // Set VS arena sprites
  const p1img = document.getElementById('p1emoji');
  const p2img = document.getElementById('p2emoji');
  const scorp = fighters.find(f => f.name === 'Scorpion');
  const subz  = fighters.find(f => f.name === 'Sub-Zero');
  if (p1img && scorp) p1img.src = scorp.img;
  if (p2img && subz)  p2img.src = subz.img;
}

// ── TIMELINE ──────────────────────────────────────────────────────
function renderTimeline() {
  const wrap = document.getElementById('timelineWrap');
  if (!wrap) return;

  wrap.innerHTML = games.map(g => `
    <div class="timeline-item">
      <div class="tl-content"
           ondblclick="openGameModal('${escAttr(g.game)}')"
           title="Двойной клик — подробнее">
        ${g.logo ? `
          <div class="tl-logo-wrap">
            <img src="${g.logo}" alt="${escAttr(g.game)}">
          </div>` : ''}
        <span class="tl-year">${g.year}</span>
        <div class="tl-game">${g.game}</div>
        <div class="tl-desc">${g.desc}</div>
        <div class="tl-hint">2× клик — подробнее</div>
      </div>
      <div class="tl-dot"></div>
      <div class="tl-empty"></div>
    </div>
  `).join('');

  document.querySelectorAll('.timeline-item').forEach(el => tlObserver.observe(el));
}
// ── QUOTES ────────────────────────────────────────────────────────
let quoteIndex = 0;
function renderQuotes() {
  if (!misc.quotes || !misc.quotes.length) return;
  showQuote();
  setInterval(showQuote, 3000);
}

function showQuote() {
  const q = misc.quotes[quoteIndex];
  const textEl = document.getElementById('quoteText');
  const srcEl  = document.getElementById('quoteSource');
  if (!textEl || !q) return;
  textEl.style.opacity = 0;
  srcEl.style.opacity  = 0;
  setTimeout(() => {
    textEl.textContent = q.text;
    srcEl.textContent  = q.source;
    textEl.style.opacity = 1;
    srcEl.style.opacity  = 1;
  }, 500);
  quoteIndex = (quoteIndex + 1) % misc.quotes.length;
}

// ── COUNTERS ──────────────────────────────────────────────────────
let countersAnimated = false;
function renderCounters() {
  if (!misc.counters) return;
}

function animateCounters() {
  if (countersAnimated) return;
  countersAnimated = true;
  const c = misc.counters || { years: 33, games: 12, sales: 75, fighters: 100 };
  animateCounter(document.getElementById('cnt1'), c.years);
  setTimeout(() => animateCounter(document.getElementById('cnt2'), c.games),   200);
  setTimeout(() => animateCounter(document.getElementById('cnt3'), c.sales),   400);
  setTimeout(() => animateCounter(document.getElementById('cnt4'), c.fighters),600);
}

function animateCounter(el, target, duration = 1500) {
  if (!el) return;
  let val = 0;
  const step = target / (duration / 16);
  const t = setInterval(() => {
    val += step;
    if (val >= target) { el.textContent = target; clearInterval(t); return; }
    el.textContent = Math.floor(val);
  }, 16);
}

// ── ARENA (VS) ────────────────────────────────────────────────────
const fightOutcomes = [
  ['FLAWLESS VICTORY!', true,  false],
  ['FATALITY!',         true,  false],
  ['SCORPION WINS!',    true,  false],
  ['SUB-ZERO WINS!',    false, true ],
  ['DRAW! DOUBLE KO!',  true,  true ],
  ['BRUTALITY!',        true,  false],
  ['FRIENDSHIP! 🌸',    true,  false],
];

let fightRunning = false;

function renderArena() {
  // arena bg
  const arenaBg = document.getElementById('arenaBg');
  if (arenaBg && arenas.length) {
    arenaBg.style.backgroundImage = `url('${arenas[0]}')`;
  }
}

function startFight() {
  if (fightRunning) return;
  fightRunning = true;

  const btn    = document.getElementById('fightBtn');
  const result = document.getElementById('fightResult');
  const p1h    = document.getElementById('p1health');
  const p2h    = document.getElementById('p2health');
  const p1pct  = document.getElementById('p1pct');
  const p2pct  = document.getElementById('p2pct');

  playSound('sounds/fight.mp3');
  btn.textContent = '...';
  result.textContent = 'ROUND 1 — FIGHT!';
  p1h.style.width = '100%'; p2h.style.width = '100%';
  p1pct.textContent = '100%'; p2pct.textContent = '100%';

  const [outcome, p1wins, p2wins] =
    fightOutcomes[Math.floor(Math.random() * fightOutcomes.length)];

  const steps = 8;
  let step = 0;
  const iv = setInterval(() => {
    step++;
    if (step >= steps) {
      clearInterval(iv);
      const fp1 = p1wins ? Math.floor(20 + Math.random() * 30) : 0;
      const fp2 = p2wins ? Math.floor(20 + Math.random() * 30) : 0;
      p1h.style.width  = fp1 + '%'; p2h.style.width  = fp2 + '%';
      p1pct.textContent = fp1 + '%'; p2pct.textContent = fp2 + '%';
      result.textContent = outcome;
      updateStreak(p1wins && !p2wins);
      if (outcome.includes('FATALITY'))       playSound('sounds/fatality.mp3');
      else if (outcome.includes('FLAWLESS'))  playSound('sounds/flawless_victory.mp3');
      else if (outcome.includes('BRUTALITY')) playSound('sounds/brutality.mp3');
      else if (outcome.includes('FRIENDSHIP'))playSound('sounds/friendship.mp3');
      else                                    playSound('sounds/outstanding.mp3');
      result.style.color = outcome.includes('FRIENDSHIP') ? '#ff88aa' : 'var(--gold)';
      btn.textContent = 'REMATCH!';
      fightRunning = false;
      return;
    }
    const r = Math.random();
    const v1 = p1wins ? Math.max(5, 100 - step * 4 * (1 - r * 0.3)) : Math.max(5, 100 - step * 12);
    const v2 = p2wins ? Math.max(5, 100 - step * 4 * (1 - r * 0.3)) : Math.max(5, 100 - step * 12);
    p1h.style.width = v1 + '%'; p2h.style.width = v2 + '%';
    p1pct.textContent = Math.round(v1) + '%'; p2pct.textContent = Math.round(v2) + '%';
  }, 200);
}

// ── FIGHTER MODAL ─────────────────────────────────────────────────
function openFighterModal(name) {
  const f = fighters.find(x => x.name === name);
  if (!f) return;

  const arena = arenas[Math.floor(Math.random() * arenas.length)];
  const el = id => document.getElementById(id);

  el('mArenaBg').style.backgroundImage = `url('${arena}')`;
  el('mSprite').src   = f.img;
  el('mName').textContent  = f.name;
  el('mName').style.color  = f.color;
  el('mSub').textContent   = f.title;
  el('mSub').style.color   = f.color;

  // Bio — short + expandable full
  const bioEl = el('mBio');
  if (f.fullBio) {
    const full = f.fullBio.replace(/\n\n/g, '<br><br>');
    bioEl.innerHTML = `
      <div class="mbio-short" onclick="this.classList.toggle('expanded')">${f.bio}</div>
      <div class="mbio-full">${full}</div>`;
  } else {
    bioEl.textContent = f.bio;
  }

  // Games
  const gEl = el('mGames');
  gEl.innerHTML = (f.games || []).map(g =>
    `<span class="mgame">${g}</span>`).join('');

  // Fatality
  el('mFat').innerHTML = f.fatality || '';

  if (f.sound) playSound(f.sound);

  el('modalOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
  document.body.style.overflow = '';
}

// ── GAME MODAL ────────────────────────────────────────────────────
function openGameModal(name) {
  const g = games.find(x => x.game === name);
  if (!g) return;

  const el = id => document.getElementById(id);
  el('gmYear').textContent     = g.year;
  el('gmTitle').textContent    = g.game;
  el('gmPlatform').textContent = g.platform;
  el('gmDesc').textContent     = g.fullDesc || g.desc;
  
  const gmLogo = document.getElementById('gmLogo');
  if (gmLogo) {
    if (g.logo) {
      gmLogo.src = g.logo;
      gmLogo.style.display = 'block';
    } else {
      gmLogo.style.display = 'none';
    }
  }

  const roster = el('gmRoster');
  roster.innerHTML = (g.roster || []).map(f =>
    `<span class="gm-fighter${f.isNew ? ' new' : ''}">${f.name}</span>`).join('');

  const pros = el('gmPros');
  pros.innerHTML = (g.pros || []).map(p => `<li>${p}</li>`).join('');

  const cons = el('gmCons');
  cons.innerHTML = (g.cons || []).map(c => `<li>${c}</li>`).join('');

  const facts = el('gmFacts');
  facts.innerHTML = (g.facts || []).map(f =>
    `<div class="gm-fact">${f}</div>`).join('');

  el('gmodalOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeGameModal() {
  document.getElementById('gmodalOverlay').classList.remove('active');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeModal(); closeGameModal(); }
});

// ── OBSERVERS ─────────────────────────────────────────────────────
let tlObserver;

function initObservers() {
  tlObserver = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.15 });

  document.querySelectorAll('.timeline-item').forEach(el => tlObserver.observe(el));

  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) animateCounters(); });
  }, { threshold: 0.3 });

  const fatalitySection = document.getElementById('fatality');
  if (fatalitySection) counterObserver.observe(fatalitySection);
}

// ── BLOOD DRIPS ───────────────────────────────────────────────────
function initBloodDrips() {
  const section = document.getElementById('fatality');
  if (!section) return;
  setInterval(() => {
    const drip = document.createElement('div');
    drip.className = 'blood-drip';
    drip.style.left = Math.random() * 100 + 'vw';
    drip.style.animationDuration = (2 + Math.random() * 3) + 's';
    drip.style.animationDelay = Math.random() * 2 + 's';
    section.appendChild(drip);
    setTimeout(() => drip.remove(), 6000);
  }, 800);
}

// ── CURSOR TRAIL ──────────────────────────────────────────────────
function initCursorTrail() {
  document.addEventListener('mousemove', e => {
    if (Math.random() > 0.9) {
      const dot = document.createElement('div');
      dot.style.cssText = `
        position:fixed;width:4px;height:4px;background:var(--blood);
        border-radius:50%;pointer-events:none;z-index:9998;
        left:${e.clientX}px;top:${e.clientY}px;
        transition:all .8s ease;opacity:.8;`;
      document.body.appendChild(dot);
      setTimeout(() => { dot.style.opacity = 0; dot.style.transform = 'scale(3)'; }, 50);
      setTimeout(() => dot.remove(), 900);
    }
  });
}

// ── UTILS ─────────────────────────────────────────────────────────
function escAttr(str) {
  return String(str).replace(/'/g, '&#39;').replace(/"/g, '&quot;');
}

function id(str) {
  return document.getElementById(str);
}
// ============================================================
//  SOUND ENGINE
// ============================================================

let bgMusic      = null;
let currentSfx   = null;
const BG_VOLUME  = 0.35;  // громкость фона
const SFX_VOLUME = 0.9;   // громкость эффектов
const DUCK_VOLUME = 0.08; // громкость фона когда играет эффект

function initSoundEngine() {
  if (!misc.soundtrack) return;

  bgMusic = new Audio(misc.soundtrack);
  bgMusic.loop   = true;
  bgMusic.volume = BG_VOLUME;

  // Запускаем по первому клику пользователя (браузер требует)
  const startBg = () => {
    bgMusic.play().catch(() => {});
    document.removeEventListener('click', startBg);
    document.removeEventListener('keydown', startBg);
  };
  document.addEventListener('click',   startBg);
  document.addEventListener('keydown', startBg);
}

function playSound(filePath, onEnd) {
  if (!filePath) return;

  // Притушить фон
  if (bgMusic) fadeBg(DUCK_VOLUME);

  // Остановить предыдущий эффект
  if (currentSfx) {
    currentSfx.pause();
    currentSfx.currentTime = 0;
  }

  currentSfx = new Audio(filePath);
  currentSfx.volume = SFX_VOLUME;
  currentSfx.play().catch(() => {});

  currentSfx.addEventListener('ended', () => {
    fadeBg(BG_VOLUME); // вернуть громкость фона
    currentSfx = null;
    if (onEnd) onEnd();
  });
}

function fadeBg(targetVolume, duration = 400) {
  if (!bgMusic) return;
  const start    = bgMusic.volume;
  const diff     = targetVolume - start;
  const steps    = 20;
  const interval = duration / steps;
  let   step     = 0;

  const timer = setInterval(() => {
    step++;
    bgMusic.volume = Math.min(1, Math.max(0, start + diff * (step / steps)));
    if (step >= steps) clearInterval(timer);
  }, interval);
}

// ── Кнопка включения/выключения фона ─────────────────────────
function toggleBgMusic() {
  if (!bgMusic) return;
  if (bgMusic.paused) {
    bgMusic.play();
    document.getElementById('musicToggle').textContent = '🔊';
  } else {
    bgMusic.pause();
    document.getElementById('musicToggle').textContent = '🔇';
  }
}

// ── Soundboard ────────────────────────────────────────────────
function renderSoundboard() {
  const section = document.getElementById('soundboard');
  if (!section || !misc.soundboard) return;

  const categories = {
    announcer: { label: 'Announcer',  sounds: [] },
    kahn:      { label: 'Shao Kahn',  sounds: [] },
    fighters:  { label: 'Бойцы',      sounds: [] },
  };

  misc.soundboard.forEach(s => {
    if (categories[s.category]) categories[s.category].sounds.push(s);
  });

  section.innerHTML = Object.values(categories).map(cat => `
    <div class="sb-category">
      <div class="sb-cat-label">${cat.label}</div>
      <div class="sb-buttons">
        ${cat.sounds.map(s => `
          <button class="sb-btn" onclick="playSound('${s.file}')">
            ${s.label}
          </button>
        `).join('')}
      </div>
    </div>
  `).join('');
}

// ── Memes gallery ─────────────────────────────────────────────
function renderMemes() {
  const grid = document.getElementById('memesGrid');
  if (!grid || !misc.memes) return;

  grid.innerHTML = misc.memes.map(src => `
    <div class="meme-card" onclick="openMeme('${src}')">
      <img src="${src}" alt="MK Meme" loading="lazy">
    </div>
  `).join('');
}

function openMeme(src) {
  const overlay = document.getElementById('memeOverlay');
  document.getElementById('memeImg').src = src;
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeMeme() {
  document.getElementById('memeOverlay').classList.remove('active');
  document.body.style.overflow = '';
}
// ============================================================
//  EASTER EGGS
// ============================================================

// ── Чит-коды ─────────────────────────────────────────────────
const CHEAT_CODES = {
  'reptile': {
    fighter: 'Reptile',
    color:   '#44cc44',
    msg:     'YOU FOUND THE HIDDEN WARRIOR',
    secret:  'В MK1 его можно встретить только выполнив\nстрогие условия на арене The Pit'
  },
  'noobsaibot': {
    fighter: 'Noob Saibot',
    color:   '#4444aa',
    msg:     'NOOB SAIBOT APPROACHES',
    secret:  'Его имя — Boon + Tobias задом наперёд.\nСоздатели спрятали себя в игре'
  },
  'toasty': {
    special: 'toasty',
    msg:     'TOASTY!'
  },
  'shangwins': {
    special: 'shangtsung',
    msg:     'IT HAS BEGUN'
  },
  'ermac': {
    fighter: 'Ermac',
    color:   '#cc2200',
    msg:     'THOUSANDS OF SOULS CRY OUT',
    secret:  'Ermac начинался как баг в памяти MK1.\nИгроки создали легенду из ничего'
  },
  'smokesecret': {
    fighter: 'Smoke',
    color:   '#aaaaaa',
    msg:     'HIDDEN IN THE SHADOWS',
    secret:  'Human Smoke — один из\nсамых редких секретов UMK3'
  }
};

let typedBuffer = '';
let typedTimer  = null;

document.addEventListener('keydown', e => {
  // Игнорируем если открыта модалка
  if (document.getElementById('modalOverlay').classList.contains('active')) return;
  if (document.getElementById('gmodalOverlay').classList.contains('active')) return;

  const key = e.key.toLowerCase();
  if (key.length !== 1 || !/[a-z]/.test(key)) return;

  typedBuffer += key;

  // Сбрасываем буфер через 1.5 сек паузы
  clearTimeout(typedTimer);
  typedTimer = setTimeout(() => { typedBuffer = ''; }, 1500);

  // Проверяем все чит-коды
  for (const [code, data] of Object.entries(CHEAT_CODES)) {
    if (typedBuffer.endsWith(code)) {
      typedBuffer = '';
      triggerEasterEgg(data);
      break;
    }
  }
});

function triggerEasterEgg(data) {
  // Спецэффекты
  if (data.special === 'toasty') {
    triggerToasty();
    return;
  }
  if (data.special === 'shangtsung') {
    triggerShangTsungTakeover();
    return;
  }

  // Стандартная пасхалка с бойцом
  const fighter = fighters.find(f => f.name === data.fighter);
  if (!fighter) return;

  triggerGlitch(400, () => {
    const overlay  = document.getElementById('easterOverlay');
    const sprite   = document.getElementById('easterSprite');
    const nameEl   = document.getElementById('easterName');
    const msgEl    = document.getElementById('easterMsg');
    const content  = document.getElementById('easterContent');

    overlay.style.background = `rgba(0,0,0,0.92)`;
    sprite.src               = fighter.img;
    sprite.style.filter      = `drop-shadow(0 0 50px ${data.color})`;
    nameEl.textContent        = data.fighter.toUpperCase();
    nameEl.style.color        = data.color;
    msgEl.innerHTML           = `${data.msg}<br>
      <span style="font-size:.8rem;color:rgba(232,213,176,0.4);
                   white-space:pre-line;">${data.secret || ''}</span>`;

    overlay.classList.add('active');
    setTimeout(() => content.classList.add('visible'), 50);

    // Звук если есть
    if (fighter.sound) playSound(fighter.sound);

    // Закрыть по клику или через 5 сек
    const close = () => {
      content.classList.remove('visible');
      setTimeout(() => {
        overlay.classList.remove('active');
        overlay.style.background = 'rgba(0,0,0,0)';
      }, 300);
      overlay.removeEventListener('click', close);
    };
    overlay.addEventListener('click', close);
    setTimeout(close, 5000);
  });
}

// ── Toasty! ───────────────────────────────────────────────────
function triggerToasty() {
  let box = document.getElementById('toastyBox');
  if (!box) {
    box = document.createElement('div');
    box.id = 'toastyBox';
    box.innerHTML = `
      <div class="toasty-text">TOASTY!</div>`;
    document.body.appendChild(box);
  }
  box.classList.remove('active');
  void box.offsetWidth; // reflow
  box.classList.add('active');
  if (misc.soundboard) {
    const t = misc.soundboard.find(s => s.label === 'TOASTY!');
    if (t) playSound(t.file);
  }
  setTimeout(() => box.classList.remove('active'), 2600);
}

// ── Shang Tsung Takeover ────────────────────────────────────────
function triggerShangTsungTakeover() {
  triggerGlitch(200);

  const overlay = document.getElementById('easterOverlay');
  const content = document.getElementById('easterContent');
  const sprite  = document.getElementById('easterSprite');
  const nameEl  = document.getElementById('easterName');
  const msgEl   = document.getElementById('easterMsg');

  const shangTsung = fighters.find(f => f.name === 'Shang Tsung');
  if (shangTsung) sprite.src = shangTsung.img;

  sprite.style.filter = 'drop-shadow(0 0 60px #00cc44)';
  nameEl.textContent  = 'Shang Tsung';
  nameEl.style.color  = '#00cc44';
  msgEl.textContent   = 'IT HAS BEGUN';
  overlay.style.background = 'rgba(0,10,0,0.96)';

  overlay.classList.add('active');
  setTimeout(() => content.classList.add('visible'), 50);

  if (misc.soundboard) {
    const s = misc.soundboard.find(x => x.label === 'IT HAS BEGUN!');
    if (s) playSound(s.file);
  }

  setTimeout(() => {
    content.classList.remove('visible');
    setTimeout(() => {
      overlay.classList.remove('active');
    }, 300);
  }, 4000);
}

// ── Glitch эффект ─────────────────────────────────────────────
function triggerGlitch(duration = 400, onDone) {
  const overlay = document.getElementById('glitchOverlay');
  overlay.style.display = 'block';

  const colors = ['rgba(204,0,0,0.3)', 'rgba(0,100,255,0.3)', 'rgba(0,255,0,0.2)'];
  let  i = 0;

  const flicker = setInterval(() => {
    overlay.style.background = colors[i % colors.length];
    document.body.classList.toggle('glitch-active');
    i++;
  }, 50);

  setTimeout(() => {
    clearInterval(flicker);
    overlay.style.display = 'none';
    document.body.classList.remove('glitch-active');
    if (onDone) onDone();
  }, duration);
}

// ── Луна на арене ─────────────────────────────────────────────
let moonClickCount = 0;
let moonTimer      = null;

function moonClick() {
  moonClickCount++;
  clearTimeout(moonTimer);

  // Сброс через 3 сек
  moonTimer = setTimeout(() => { moonClickCount = 0; }, 3000);

  // Подсвечиваем луну при каждом клике
  const moon = document.getElementById('pitMoon');
  moon.style.boxShadow = `0 0 ${20 + moonClickCount * 15}px rgba(240,192,64,0.9)`;

  if (moonClickCount >= 5) {
    moonClickCount = 0;
    triggerMoonSecret();
  }
}

function triggerMoonSecret() {
  const moon      = document.getElementById('pitMoon');
  const silhouette = document.getElementById('moonSilhouette');

  // Случайный силуэт
  const silhouettes = [
  'img/suka.png',
  'img/santa.png',
];

const randomImage = silhouettes[Math.floor(Math.random() * silhouettes.length)];

if (randomImage.includes('santa.png')) {
  silhouette.innerHTML = `<img src="${randomImage}" alt="silhouette" width="350">`;
} else {
  silhouette.innerHTML = `<img src="${randomImage}" alt="silhouette" width="125">`;
}

  // Сброс луны
  moon.style.boxShadow = '';

  // Позиционируем и запускаем полёт
  silhouette.style.right   = '-60px';
  silhouette.style.opacity = '0';
  silhouette.style.animation = 'none';
  void silhouette.offsetWidth;

  silhouette.style.position  = 'absolute';
  silhouette.style.top       = '10px';
  silhouette.style.animation = 'silhouette-fly 3s ease forwards';

  // Секретное сообщение в консоли
  console.log('%c🌕 FATALITY SECRET UNLOCKED 🌕',
    'color:#f0c040;font-size:20px;font-weight:bold;');
  console.log('%cВ оригинальном MK1 мимо луны летела ведьма на метле.\nНикто не знал как это триггернуть — пока фанаты не разобрали ROM.',
    'color:#c9a030;font-size:13px;');

  // Небольшое сообщение на экране
  showSecretMsg('🌕 MOON SECRET UNLOCKED 🌕',
    'Проверь консоль браузера (F12)');
}

function showSecretMsg(title, sub) {
  const el = document.createElement('div');
  el.style.cssText = `
    position:fixed;bottom:30px;left:50%;transform:translateX(-50%);
    background:rgba(0,0,0,0.9);border:1px solid rgba(240,192,64,0.5);
    padding:16px 32px;z-index:20000;text-align:center;
    animation:fadeInUp 0.4s ease;pointer-events:none;`;
  el.innerHTML = `
    <div style="font-family:'Black Ops One',cursive;color:#f0c040;
                font-size:1.1rem;letter-spacing:3px;">${title}</div>
    <div style="font-family:'Rajdhani',sans-serif;color:rgba(232,213,176,0.5);
                font-size:.8rem;letter-spacing:2px;margin-top:4px;">${sub}</div>`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}
// ── Случайный боец ────────────────────────────────────────────
function randomFighter() {
  if (!fighters.length) return;
  const f = fighters[Math.floor(Math.random() * fighters.length)];
  openFighterModal(f.name);
}

// ── Счётчик комбо ─────────────────────────────────────────────
let winStreak   = 0;
let bestStreak  = 0;
let totalFights = 0;

function updateStreak(p1wins) {
  totalFights++;
  document.getElementById('totalFights').textContent = totalFights;

  if (p1wins) {
    winStreak++;
    if (winStreak > bestStreak) {
      bestStreak = winStreak;
      document.getElementById('bestStreak').textContent = bestStreak;
      // Подсветить рекорд
      const best = document.getElementById('bestStreak');
      best.style.transform = 'scale(1.3)';
      best.style.transition = 'transform 0.3s';
      setTimeout(() => { best.style.transform = 'scale(1)'; }, 300);
    }
  } else {
    winStreak = 0;
  }

  const streakEl = document.getElementById('winStreak');
  streakEl.textContent = winStreak;

  // Цвет серии: чем больше — тем ярче
  if (winStreak >= 5)      streakEl.style.color = '#f0c040';
  else if (winStreak >= 3) streakEl.style.color = '#ff8800';
  else                     streakEl.style.color = 'var(--blood)';

  // Пасхалка при серии 10
  if (winStreak === 10) {
    showSecretMsg('FLAWLESS VICTORY × 10', 'ТЫ НЕПОБЕДИМ');
    if (misc.soundboard) {
      const s = misc.soundboard.find(x => x.label === 'FLAWLESS VICTORY!');
      if (s) playSound(s.file);
    }
  }
}
// ============================================================
//  LORE SECTION
// ============================================================

const loreData = [
  {
    id: 'origins',
    tab: '⚔️ Начало',
    lead: 'Турнир, созданный богами',
    text: [
      'Тысячи лет назад Старшие Боги — высшие существа вселенной — установили закон, защищающий слабые царства от завоевания сильными. Этот закон воплотился в турнире Мортал Комбат.',
      'Правило простое и жестокое: чтобы завоевать чужое царство, нужно победить в десяти турнирах подряд. Каждый турнир — лучшие бойцы двух миров сходятся в смертельной схватке. Проигравший погибает. Победитель несёт судьбу своего мира на плечах.',
      'Земное Царство — наш мир — выстояло благодаря этому закону на протяжении тысячелетий. Но Аутворлд Шао Кана выиграл девять турниров подряд. Один следующий — и Земля падёт.'
    ],
    quote: 'Девять побед. Одна осталась. Судьба мира в руках смертных.',
    cards: [
      { title: 'Старшие Боги', text: 'Высшие существа вселенной. Установили законы Мортал Комбат. Не вмешиваются в схватки — но карают тех кто нарушает правила.' },
      { title: 'Правило 10 побед', text: 'Только выиграв десять турниров подряд можно законно поглотить чужое царство. Это единственное что удерживает Шао Кана от немедленного вторжения.' },
      { title: 'Шан Цзун', text: 'Организатор турниров от имени Аутворлда. Поглощает души проигравших. Именно его арена — место первой игры серии.' },
    ]
  },
  {
    id: 'realms',
    tab: '🌍 Царства',
    lead: 'Миры разделённые и связанные',
    text: [
      'Вселенная Мортал Комбат состоит из множества царств — отдельных измерений со своими законами, расами и историей. Каждое царство уникально, но все они связаны через порталы и турнирный закон.',
      'Earthrealm — наш мир. Молодое, уязвимое, но обладающее удивительным потенциалом. Именно здесь рождаются самые сильные смертные воины — те кто раз за разом спасает реальность.',
      'Outworld — тёмная империя Шао Кана, созданная поглощением других миров. Населён сотнями рас: Шоканами, Таркатанами, Зателреанцами. Это не злой мир — это мир где выживает сильнейший.',
      'Netherrealm — ад этой вселенной. Сюда попадают души убийц и предателей. Здесь нет покоя — только вечная боль и борьба за крупицы власти среди демонов.'
    ],
    quote: 'Каждое царство — это мир. Каждый мир — это жизни. Каждая жизнь — это душа.',
    cards: [
      { title: 'Earthrealm 🌍', text: 'Земное Царство. Защитник — Рейден, бог грома. Последний рубеж против Аутворлда.' },
      { title: 'Outworld 💀', text: 'Империя Шао Кана. Создана поглощением других миров. Здесь правит сила.' },
      { title: 'Netherrealm 🔥', text: 'Ад вселенной МК. Царство Куан Чи и Шиннока. Отсюда Скорпион вернулся как призрак мести.' },
      { title: 'Edenia ✨', text: 'Прекрасный мир поглощённый Каном тысячи лет назад. Родина Китаны и Синдэль.' },
      { title: 'Chaosrealm 🌀', text: 'Царство абсолютного хаоса. Никаких законов, никаких правил. Жители ненавидят любой порядок.' },
      { title: 'Orderrealm ⚖️', text: 'Полная противоположность Хаосреалму. Абсолютный закон и иерархия. Граничит с тоталитаризмом.' },
    ]
  },
  {
    id: 'tournament',
    tab: '🏆 Турнир',
    lead: 'Правила смертельной игры',
    text: [
      'Мортал Комбат — не просто турнир боевых искусств. Это священный ритуал, определяющий судьбу целых миров. Каждый боец несёт на себе ответственность за миллионы жизней.',
      'Турнир проводится раз в поколение. Шан Цзун организует его от имени Аутворлда, привлекая лучших бойцов обманом, угрозами или соблазном. Рейден собирает земных защитников — тех кто готов умереть ради своего мира.',
      'Фаталити — финальный удар побеждённому противнику — не обязателен по правилам, но традиционен. Это демонстрация абсолютного превосходства. "FINISH HIM" — не приказ, а возможность.'
    ],
    quote: 'FINISH HIM. Два слова. Судьба мира.',
    cards: [
      { title: 'Фаталити', text: 'Финальное добивание противника. Традиция, а не правило. Демонстрация полного превосходства бойца.' },
      { title: 'Флоулесс Виктори', text: 'Победа без единого полученного удара. Высшая форма мастерства в турнире.' },
      { title: 'Mercy', text: 'Победитель дарует противнику немного здоровья — чтобы продолжить бой. Редкий жест благородства.' },
      { title: 'Brutality', text: 'Серия быстрых ударов добивающая противника. Введена в MK3 как альтернатива фаталити.' },
    ]
  },
  {
    id: 'history',
    tab: '📜 Хронология',
    lead: 'От первого турнира до конца времён',
    text: [
      'История серии охватывает тысячелетия внутри вселенной и три десятилетия в реальном мире. Каждая игра добавляла новые слои к мифологии — от простого файтинга до масштабной космической оперы.',
      'Первый турнир 1992 года был прост: Шан Цзун против земных бойцов. Лю Кан победил — и спас мир. Казалось бы, конец истории. Но это было лишь начало.',
      'MK2 поднял ставки: бои перенеслись в Аутворлд, появился Шао Кан как финальный босс. MK3 — вторжение прямо на Землю. Каждая следующая часть расширяла вселенную добавляя новые царства, расы и угрозы.',
      'MK9 в 2011 году перезапустил всё с нуля — путешествие во времени, переписанная история. MK11 довёл эту идею до предела: сама ткань времени разрушается. В MK1 2023 года Лю Кан как бог создаёт новый мир с нуля — и история начинается снова.'
    ],
    quote: 'История не заканчивается. Она начинается снова.',
    cards: [
      { title: '1992 — Начало', text: 'Первый турнир. Лю Кан побеждает Шан Цзуна. Земля спасена. Но война только началась.' },
      { title: '1995 — Вторжение', text: 'Шао Кан нарушает правила и вторгается на Землю напрямую. MK3 — война на улицах городов.' },
      { title: '2002 — Падение', text: 'Deadly Alliance убивает Лю Кана. Первый раз главный герой серии погибает.' },
      { title: '2011 — Перезапуск', text: 'MK9 переписывает историю через путешествие во времени. Новый канон, старые лица.' },
      { title: '2019 — Конец времён', text: 'MK11. Кроника — хранительница времени — ломает реальность. Финальная битва за существование.' },
      { title: '2023 — Новый мир', text: 'MK1. Лю Кан-бог создаёт идеальный мир. Знакомые персонажи в новых ролях.' },
    ]
  },
  {
    id: 'clans',
    tab: '🥷 Кланы',
    lead: 'Тайные организации серии',
    text: [
      'За кулисами турнира действуют тайные организации — кланы ниндзя, военные подразделения и преступные синдикаты. Именно они формируют большинство бойцов серии.',
      'Клан Лин Куэй — древний китайский клан убийц, давший миру обоих Sub-Zero, Смоука, Сектора и Сайракса. В MK3 их принудительно роботизировали — этот конфликт стал одной из центральных тем серии.',
      'Клан Шираи Рю — японские соперники Лин Куэй. Уничтожены вместе с семьёй Скорпиона. Возрождены им в MK9 как символ искупления и новой надежды.'
    ],
    quote: 'Лин Куэй против Шираи Рю. Лёд против огня. Вечное противостояние.',
    cards: [
      { title: 'Лин Куэй 🧊', text: 'Древний китайский клан убийц. Sub-Zero, Смоук, Сектор, Сайракс. В MK3 перешли к роботизации.' },
      { title: 'Шираи Рю 🔥', text: 'Японский клан ниндзя. Родной клан Скорпиона. Уничтожен, возрождён, снова уничтожен.' },
      { title: 'ОКФ 🪖', text: 'Отряд специальных операций. Соня Блейд, Джакс, Страйкер. Военные защитники Земли.' },
      { title: 'Чёрный Дракон 🐲', text: 'Преступный синдикат. Кано, Кабал. Торговцы оружием и наёмники без принципов.' },
      { title: 'Белый Лотос 🌸', text: 'Орден монахов защищающих Земное Царство. Лю Кан, Кунг Лао. Ученики Рейдена.' },
      { title: 'Красный Дракон 🔴', text: 'Элитный преступный клан, предшественник Чёрного Дракона. Более дисциплинированы и опасны.' },
    ]
  }
];

function renderLore() {
  const tabsEl    = document.getElementById('loreTabs');
  const contentEl = document.getElementById('loreContent');
  if (!tabsEl || !contentEl) return;

  // Табы
  tabsEl.innerHTML = loreData.map((l, i) => `
    <button class="lore-tab ${i === 0 ? 'active' : ''}"
            onclick="switchLore('${l.id}')">
      ${l.tab}
    </button>
  `).join('');

  // Контент
  contentEl.innerHTML = loreData.map((l, i) => `
    <div class="lore-block ${i === 0 ? 'active' : ''}" id="lore-${l.id}">
      <div class="lore-lead">${l.lead}</div>
      ${l.text.map(p => `<p class="lore-text">${p}</p>`).join('')}
      <div class="lore-quote">${l.quote}</div>
      <div class="lore-cards">
        ${l.cards.map(c => `
          <div class="lore-card">
            <div class="lore-card-title">${c.title}</div>
            <div class="lore-card-text">${c.text}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function switchLore(id) {
  document.querySelectorAll('.lore-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.lore-block').forEach(b => b.classList.remove('active'));

  document.querySelector(`[onclick="switchLore('${id}')"]`).classList.add('active');
  document.getElementById(`lore-${id}`).classList.add('active');
}
// ============================================================
//  FATALITY GENERATOR
// ============================================================

const fatalityData = {
  'Sub-Zero':    { desc: 'Spine Rip',       combo: ['Down','Right','Left','LowPunch'],        victory: 'SUB-ZERO WINS' },
  'Scorpion':    { desc: 'Toasty',          combo: ['Up','Up','Right','HighPunch'],            victory: 'SCORPION WINS' },
  'Liu Kang':    { desc: 'Dragon Bite',     combo: ['Down','Right','Down','Right','LowKick'], victory: 'LIU KANG WINS' },
  'Kung Lao':    { desc: 'Hat Split',       combo: ['Left','Right','Down','HighPunch'],        victory: 'KUNG LAO WINS' },
  'Raiden':      { desc: 'Electrocution',   combo: ['Up','Up','Down','Down','LowPunch'],       victory: 'RAIDEN WINS' },
  'Ermac':       { desc: 'Telekinetic Slam',combo: ['Down','Down','Right','LowKick'],          victory: 'ERMAC WINS' },
  'Reptile':     { desc: 'Acid Shower',     combo: ['Right','Down','Left','HighKick'],         victory: 'REPTILE WINS' },
  'Goro':        { desc: 'Body Pull',       combo: ['Down','Left','Right','HighPunch'],        victory: 'GORO WINS' },
  'Shang Tsung': { desc: 'Soul Steal',      combo: ['Left','Left','Down','HighKick'],          victory: 'SHANG TSUNG WINS' },
  'Shao Kahn':   { desc: 'Skull Crush',     combo: ['Right','Down','Right','HighPunch'],       victory: 'SHAO KAHN WINS' },
  'Motaro':      { desc: 'Decapitation',    combo: ['Down','Right','Left','LowPunch'],         victory: 'MOTARO WINS' },
  'Sindel':      { desc: 'Hair Hang',       combo: ['Up','Down','Down','HighPunch'],           victory: 'SINDEL WINS' },
  'Sektor':      { desc: 'Missile Barrage', combo: ['Down','Down','Right','HighPunch'],        victory: 'SEKTOR WINS' },
  'Nightwolf':   { desc: 'Arrow',           combo: ['Left','Down','Right','LowPunch'],         victory: 'NIGHTWOLF WINS' },
  'Kabal':       { desc: 'Hook Spin',       combo: ['Right','Right','Down','LowKick'],         victory: 'KABAL WINS' },
  'Cyrax':       { desc: 'Self Destruct',   combo: ['Left','Right','Down','HighKick'],         victory: 'CYRAX WINS' },
  'Sonya Blade': { desc: 'Kiss of Death',   combo: ['Down','Left','Right','LowPunch'],         victory: 'SONYA WINS' },
  'Noob Saibot': { desc: 'Shadow Toss',     combo: ['Down','Down','Left','HighPunch'],         victory: 'NOOB WINS' },
  'Smoke':       { desc: 'Explosive',       combo: ['Left','Left','Right','LowKick'],          victory: 'SMOKE WINS' },
  'Kano':        { desc: 'Heart Rip',       combo: ['Right','Down','Left','HighPunch'],        victory: 'KANO WINS' },
  'Baraka':      { desc: 'Blade Decap',     combo: ['Right','Right','Down','LowKick'],         victory: 'BARAKA WINS' },
  'Kintaro':     { desc: 'Spine Slam',      combo: ['Down','Left','Right','HighPunch'],        victory: 'KINTARO WINS' },
  'Chameleon':   { desc: 'Random',          combo: ['Left','Right','Left','LowPunch'],         victory: 'CHAMELEON WINS' },
  'Rain':        { desc: 'Water Bubble',    combo: ['Down','Right','Right','HighKick'],        victory: 'RAIN WINS' },
  'Jax':         { desc: 'Head Clap',       combo: ['Right','Left','Right','HighPunch'],       victory: 'JAX WINS' },
  'Kitana':      { desc: 'Fan Decap',       combo: ['Left','Down','Right','LowKick'],          victory: 'KITANA WINS' },
  'Mileena':     { desc: 'Sais Throw',      combo: ['Down','Down','Left','HighKick'],          victory: 'MILEENA WINS' },
  'Jade':        { desc: 'Razor Edge',      combo: ['Right','Down','Left','LowPunch'],         victory: 'JADE WINS' },
  'Johnny Cage': { desc: 'Head Pop',        combo: ['Down','Right','Left','HighPunch'],        victory: 'CAGE WINS' },
  'Khameleon':   { desc: 'Random',          combo: ['Left','Left','Right','HighKick'],         victory: 'KHAMELEON WINS' },
  'Sheeva':      { desc: 'Stomp',           combo: ['Down','Left','Down','LowKick'],           victory: 'SHEEVA WINS' },
  'Stryker':     { desc: 'Grenade',         combo: ['Right','Right','Left','HighPunch'],       victory: 'STRYKER WINS' },
};

// Иконки для отображения кнопок
const fgIcons = {
  Up:        '↑', Down:  '↓', Left: '←', Right: '→',
  LowPunch:  'LP', HighPunch: 'HP',
  LowKick:   'LK', HighKick:  'HK',
};

// Маппинг клавиш клавиатуры
const fgKeyMap = {
  ArrowUp:    'Up',    ArrowDown:  'Down',
  ArrowLeft:  'Left',  ArrowRight: 'Right',
  'a': 'LowPunch',  'A': 'LowPunch',
  's': 'HighPunch', 'S': 'HighPunch',
  'z': 'LowKick',   'Z': 'LowKick',
  'x': 'HighKick',  'X': 'HighKick',
};

// State
let fgSelectedFighter = null;
let fgCurrentCombo    = [];
let fgInputIndex      = 0;
let fgActive          = false;
let fgTimerInterval   = null;
let fgTimeLeft        = 5;
let fgKeyListener     = null;

// ── Рендер кнопок выбора бойца ───────────────────────────────
function renderFatalityGen() {
  const wrap = document.getElementById('fgFighters');
  if (!wrap) return;

  wrap.innerHTML = fighters.map(f => `
    <button class="fg-fighter-btn"
            onclick="fgSelectFighter('${escAttr(f.name)}')">
      ${f.name}
    </button>
  `).join('');
}

// ── Выбор бойца ──────────────────────────────────────────────
function fgSelectFighter(name) {
  fgSelectedFighter = name;
  fgReset();

  // Подсветить выбранного
  document.querySelectorAll('.fg-fighter-btn').forEach(btn => {
    btn.classList.toggle('selected', btn.textContent.trim() === name);
  });

  // Установить спрайт
  const fighter = fighters.find(f => f.name === name);
  const sprite  = document.getElementById('fgSprite');
  const p1Name  = document.getElementById('fgP1Name');
  if (fighter && sprite) sprite.src = fighter.img;
  if (p1Name) p1Name.textContent = name.toUpperCase();

  // Показать арену
  document.getElementById('fgArena').style.opacity = '1';
  document.getElementById('fgStartBtn').disabled = false;

  // Обновить экран
  const data = fatalityData[name];
  fgSetScreen(
    'FINISH HIM!',
    data ? `Комбо: ${data.desc}` : 'Нажми FINISH HIM!'
  );
}

// ── Сброс состояния ──────────────────────────────────────────
function fgReset() {
  fgActive     = false;
  fgInputIndex = 0;
  fgTimeLeft   = 5;
  clearInterval(fgTimerInterval);

  const timer  = document.getElementById('fgTimer');
  const result = document.getElementById('fgResult');
  const strip  = document.getElementById('fgComboStrip');
  const health = document.getElementById('fgHealthFill');
  const btn    = document.getElementById('fgStartBtn');

  if (timer)  { timer.textContent = '5'; timer.classList.remove('urgent'); }
  if (result) { result.textContent = ''; result.style.color = ''; }
  if (strip)  strip.innerHTML = '';
  if (health) health.style.width = '100%';
  if (btn)    { btn.textContent = 'FINISH HIM!'; btn.disabled = !fgSelectedFighter; }

  // Убрать слушатель клавиш
  if (fgKeyListener) {
    document.removeEventListener('keydown', fgKeyListener);
    fgKeyListener = null;
  }
}

// ── Старт ────────────────────────────────────────────────────
function fgStart() {
  if (!fgSelectedFighter) return;
  const data = fatalityData[fgSelectedFighter];
  if (!data) return;

  fgReset();
  fgActive       = true;
  fgCurrentCombo = [...data.combo];
  fgInputIndex   = 0;
  fgTimeLeft     = fgCurrentCombo.length <= 4 ? 5 : 7;

  // Отрисовать комбо полоску
  fgRenderStrip();

  // Экран
  fgSetScreen('FINISH HIM!', 'Введи комбо!');
  document.getElementById('fgStartBtn').disabled = true;

  // Таймер
  const timerEl = document.getElementById('fgTimer');
  if (timerEl) timerEl.textContent = fgTimeLeft;

  fgTimerInterval = setInterval(() => {
    fgTimeLeft--;
    if (timerEl) {
      timerEl.textContent = fgTimeLeft;
      timerEl.classList.toggle('urgent', fgTimeLeft <= 2);
    }
    // Здоровье убывает
    const health = document.getElementById('fgHealthFill');
    if (health) health.style.width = (fgTimeLeft / (fgCurrentCombo.length <= 4 ? 5 : 7) * 100) + '%';

    if (fgTimeLeft <= 0) fgFail();
  }, 1000);

  // Слушатель клавиш
  fgKeyListener = (e) => {
    if (!fgActive) return;
    const mapped = fgKeyMap[e.key];
    if (mapped) {
      e.preventDefault();
      fgInput(mapped);
    }
  };
  document.addEventListener('keydown', fgKeyListener);

  // Звук
  if (misc.soundboard) {
    const s = misc.soundboard.find(x => x.label === 'FINISH HIM!');
    if (s) playSound(s.file);
  }
}

// ── Отрисовка комбо полоски ───────────────────────────────────
function fgRenderStrip() {
  const strip = document.getElementById('fgComboStrip');
  if (!strip) return;
  strip.innerHTML = fgCurrentCombo.map((btn, i) => `
    <div class="fg-combo-btn" id="fgBtn${i}">
      ${fgIcons[btn] || btn}
    </div>
  `).join('');
}

// ── Обработка ввода ───────────────────────────────────────────
function fgInput(input) {
  if (!fgActive) return;

  const expected = fgCurrentCombo[fgInputIndex];
  const btnEl    = document.getElementById(`fgBtn${fgInputIndex}`);

  if (input === expected) {
    // Правильно
    if (btnEl) btnEl.classList.add('hit');
    fgInputIndex++;

    // Сыграть тактильный отклик на мобиле
    if (navigator.vibrate) navigator.vibrate(30);

    if (fgInputIndex >= fgCurrentCombo.length) {
      fgSuccess();
    }
  } else {
    // Ошибка — сбрасываем прогресс
    if (btnEl) {
      btnEl.classList.add('miss');
      setTimeout(() => btnEl.classList.remove('miss'), 300);
    }
    // Сбросить все hit
    document.querySelectorAll('.fg-combo-btn').forEach(b => b.classList.remove('hit'));
    fgInputIndex = 0;

    if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
  }
}

// ── Успех ────────────────────────────────────────────────────
function fgSuccess() {
  fgActive = false;
  clearInterval(fgTimerInterval);
  if (fgKeyListener) {
    document.removeEventListener('keydown', fgKeyListener);
    fgKeyListener = null;
  }

  const data    = fatalityData[fgSelectedFighter];
  const result  = document.getElementById('fgResult');
  const arena   = document.getElementById('fgArena');
  const btn     = document.getElementById('fgStartBtn');

  // Экран темнеет
  arena.classList.add('fg-victory-flash');
  setTimeout(() => arena.classList.remove('fg-victory-flash'), 1600);

  fgSetScreen('FATALITY!', data.desc.toUpperCase());
  document.getElementById('fgScreenTitle').style.color = 'var(--gold)';

  if (result) {
    result.textContent = data.victory;
    result.style.color = 'var(--gold)';
  }

  if (btn) {
    btn.textContent = 'ЕЩЁ РАЗ!';
    btn.disabled    = false;
  }

  // Звуки
  if (misc.soundboard) {
    setTimeout(() => {
      const fat = misc.soundboard.find(x => x.label === 'FATALITY!');
      if (fat) playSound(fat.file);
    }, 600);
    setTimeout(() => {
      const flawless = misc.soundboard.find(x => x.label === 'FLAWLESS VICTORY!');
      if (flawless) playSound(flawless.file);
    }, 2000);
  }
}

// ── Провал ───────────────────────────────────────────────────
function fgFail() {
  fgActive = false;
  clearInterval(fgTimerInterval);
  if (fgKeyListener) {
    document.removeEventListener('keydown', fgKeyListener);
    fgKeyListener = null;
  }

  const result = document.getElementById('fgResult');
  const btn    = document.getElementById('fgStartBtn');
  const health = document.getElementById('fgHealthFill');

  fgSetScreen('TIME EXPIRED', 'ENEMY WINS');
  document.getElementById('fgScreenTitle').style.color = 'rgba(232,213,176,0.3)';

  if (result) {
    result.textContent = 'TOO SLOW...';
    result.style.color = 'rgba(232,213,176,0.2)';
  }
  if (health) health.style.width = '0%';
  if (btn) {
    btn.textContent = 'ПОПРОБУЙ СНОВА';
    btn.disabled    = false;
  }

}

// ── Хелпер экрана ────────────────────────────────────────────
function fgSetScreen(title, sub) {
  const t = document.getElementById('fgScreenTitle');
  const s = document.getElementById('fgScreenSub');
  if (t) { t.textContent = title; t.style.color = ''; }
  if (s) s.textContent = sub;
}
// ============================================================
//  HUB TAB SWITCHER
// ============================================================
function switchHub(hubId, panelId, clickedTab) {
  // Переключаем панели внутри хаба
  const hub = document.getElementById(hubId);
  if (!hub) return;

  // Убрать active со всех панелей хаба
  hub.querySelectorAll('.hub-panel').forEach(p => p.classList.remove('active'));
  // Убрать active со всех табов хаба
  hub.querySelectorAll('.hub-tab').forEach(t => t.classList.remove('active'));

  // Активировать нужную панель и таб
  const panel = document.getElementById(panelId);
  if (panel) panel.classList.add('active');
  if (clickedTab) clickedTab.classList.add('active');
}

// ── Поиск по бойцам ──────────────────────────────────────────
function filterFighters(query) {
  const q = query.trim().toLowerCase();
  const cards = document.querySelectorAll('.fighter-card');
  const empty = document.getElementById('fighterSearchEmpty');
  let visible = 0;

  cards.forEach(card => {
    const name = card.querySelector('.fighter-name');
    const title = card.querySelector('.fighter-title-tag');
    const nameText  = name  ? name.textContent.toLowerCase()  : '';
    const titleText = title ? title.textContent.toLowerCase() : '';

    const match = !q || nameText.includes(q) || titleText.includes(q);
    card.style.display = match ? '' : 'none';
    if (match) visible++;
  });

  if (empty) empty.style.display = visible === 0 ? 'block' : 'none';
}
// ── Бургер меню ───────────────────────────────────────────────
function toggleNav() {
  console.log("Клик по бургеру СРАБОТАЛ!"); // <- Проверим, вызывается ли функция

  const btn     = document.getElementById('burgerBtn');
  const links   = document.getElementById('navLinks');
  const overlay = document.getElementById('navOverlay');

  if (!btn || !links || !overlay) {
    console.log("ОШИБКА: Один из элементов не найден в HTML!", { btn, links, overlay });
    return;
  }

  btn.classList.toggle('active');
  links.classList.toggle('active');
  overlay.classList.toggle('active');

  console.log("Текущие классы меню после клика:", links.className); // <- Проверим, добавился ли active

  document.body.style.overflow = links.classList.contains('active') ? 'hidden' : '';
}

function closeNav() {
  const btn     = document.getElementById('burgerBtn');
  const links   = document.getElementById('navLinks');
  const overlay = document.getElementById('navOverlay');

  btn.classList.remove('active');
  links.classList.remove('active');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

// Закрыть по Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeNav();
});