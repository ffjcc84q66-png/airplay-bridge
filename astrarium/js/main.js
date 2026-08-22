/* ============================================================
   ASTRARIUM — Interazioni
   ============================================================ */

/* ---------- Navbar ---------- */
const nav = document.getElementById('nav');
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

menuBtn.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => navLinks.classList.remove('open'))
);

/* ---------- Reveal on scroll ---------- */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* ---------- Contatori animati ---------- */
const countObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = parseFloat(el.dataset.count);
    const decimals = (el.dataset.count.split('.')[1] || '').length;
    const suffix = el.dataset.suffix || '';
    const dur = 1800;
    const t0 = performance.now();
    const tick = now => {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals).replace('.', ',') + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    countObs.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-count]').forEach(el => countObs.observe(el));

/* ---------- Hero: campo stellare con parallasse ---------- */
(function heroStars() {
  const canvas = document.getElementById('heroStars');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, stars = [], shooting = null, mouseX = 0, mouseY = 0;

  function resize() {
    W = canvas.width = canvas.offsetWidth * devicePixelRatio;
    H = canvas.height = canvas.offsetHeight * devicePixelRatio;
    stars = [];
    const n = Math.floor((canvas.offsetWidth * canvas.offsetHeight) / 2600);
    for (let i = 0; i < n; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: (Math.random() * 1.3 + 0.3) * devicePixelRatio,
        base: Math.random() * 0.6 + 0.25,
        tw: Math.random() * Math.PI * 2,
        ts: Math.random() * 0.015 + 0.004,
        depth: Math.random() * 0.8 + 0.2
      });
    }
  }

  // Via Lattea: banda diagonale di stelle fioche + nebulosità
  function drawMilkyWay() {
    const cx = W * 0.62, cy = H * 0.35;
    const grad = ctx.createLinearGradient(0, H, W, 0);
    grad.addColorStop(0.25, 'rgba(139,147,167,0)');
    grad.addColorStop(0.5, 'rgba(139,147,167,0.05)');
    grad.addColorStop(0.62, 'rgba(180,190,210,0.09)');
    grad.addColorStop(0.75, 'rgba(139,147,167,0.05)');
    grad.addColorStop(1, 'rgba(139,147,167,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  function spawnShooting() {
    if (Math.random() < 0.006 && !shooting) {
      shooting = {
        x: Math.random() * W * 0.7 + W * 0.15,
        y: Math.random() * H * 0.3,
        vx: (Math.random() * 4 + 5) * devicePixelRatio,
        vy: (Math.random() * 2 + 2) * devicePixelRatio,
        life: 1
      };
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawMilkyWay();
    spawnShooting();
    for (const s of stars) {
      s.tw += s.ts;
      const alpha = s.base + Math.sin(s.tw) * 0.25;
      const px = s.x + mouseX * s.depth * 14 * devicePixelRatio;
      const py = s.y + mouseY * s.depth * 14 * devicePixelRatio;
      ctx.beginPath();
      ctx.arc(px, py, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(245,242,234,${Math.max(alpha, 0.05)})`;
      ctx.fill();
    }
    if (shooting) {
      ctx.strokeStyle = `rgba(245,242,234,${shooting.life * 0.8})`;
      ctx.lineWidth = 1.2 * devicePixelRatio;
      ctx.beginPath();
      ctx.moveTo(shooting.x, shooting.y);
      ctx.lineTo(shooting.x - shooting.vx * 6, shooting.y - shooting.vy * 6);
      ctx.stroke();
      shooting.x += shooting.vx;
      shooting.y += shooting.vy;
      shooting.life -= 0.02;
      if (shooting.life <= 0 || shooting.x > W || shooting.y > H) shooting = null;
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  canvas.parentElement.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouseX = (e.clientX - r.left) / r.width - 0.5;
    mouseY = (e.clientY - r.top) / r.height - 0.5;
  });
  resize();
  draw();
})();

/* ---------- Slider Bortle: simulazione cielo ---------- */
(function bortle() {
  const canvas = document.getElementById('bortleCanvas');
  const slider = document.getElementById('bortleSlider');
  const label = document.getElementById('bortleLabel');
  const desc = document.getElementById('bortleDesc');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, stars = [];

  const LEVELS = [
    { name: 'Bortle 1 — Cielo eccezionale', desc: 'Via Lattea visibile con ombre proiettate. Il Golgo è qui.', sky: '#020308', n: 900, mw: 0.55 },
    { name: 'Bortle 2 — Cielo veramente buio', desc: 'Il Col dei Fioi è qui. M31 visibile a occhio nudo.', sky: '#04060f', n: 650, mw: 0.4 },
    { name: 'Bortle 4 — Cielo suburbano', desc: 'Via Lattea solo accennata. La maggioranza delle campagne italiane.', sky: '#0a1024', n: 320, mw: 0.12 },
    { name: 'Bortle 6 — Cielo suburbano chiaro', desc: 'Solo le stelle più brillanti. Il 60% degli italiani vive qui.', sky: '#141c38', n: 140, mw: 0 },
    { name: 'Bortle 8–9 — Cielo cittadino', desc: 'Orione si intravede appena. Il cielo che la bambina non aveva mai visto.', sky: '#222c52', n: 55, mw: 0 }
  ];

  function resize() {
    W = canvas.width = canvas.offsetWidth * devicePixelRatio;
    H = canvas.height = canvas.offsetHeight * devicePixelRatio;
    stars = [];
    for (let i = 0; i < 900; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.pow(Math.random(), 2.2) * 1.6 + 0.25,
        a: Math.random() * 0.75 + 0.2
      });
    }
  }

  function draw() {
    const L = LEVELS[+slider.value];
    ctx.fillStyle = L.sky;
    ctx.fillRect(0, 0, W, H);
    // bagliore urbano dal basso
    const glow = ctx.createLinearGradient(0, H, 0, H * 0.45);
    glow.addColorStop(0, `rgba(242,180,65,${0.05 + slider.value * 0.075})`);
    glow.addColorStop(1, 'rgba(242,180,65,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);
    // Via Lattea
    if (L.mw > 0) {
      const g = ctx.createLinearGradient(0, H, W, 0);
      g.addColorStop(0.4, 'rgba(160,170,195,0)');
      g.addColorStop(0.55, `rgba(160,170,195,${L.mw * 0.16})`);
      g.addColorStop(0.7, 'rgba(160,170,195,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }
    // stelle (solo le prime L.n)
    for (let i = 0; i < L.n; i++) {
      const s = stars[i];
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * devicePixelRatio, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(245,242,234,${s.a})`;
      ctx.fill();
    }
    label.textContent = L.name;
    desc.textContent = L.desc;
  }

  slider.addEventListener('input', draw);
  window.addEventListener('resize', () => { resize(); draw(); });
  resize();
  draw();
})();

/* ---------- Mini-cieli per card osservatori ---------- */
document.querySelectorAll('.obs-visual canvas').forEach(canvas => {
  const ctx = canvas.getContext('2d');
  function draw() {
    const W = canvas.width = canvas.offsetWidth * devicePixelRatio;
    const H = canvas.height = canvas.offsetHeight * devicePixelRatio;
    ctx.fillStyle = '#04060f';
    ctx.fillRect(0, 0, W, H);
    // profilo montagne
    ctx.fillStyle = '#02040a';
    ctx.beginPath();
    ctx.moveTo(0, H);
    const seed = canvas.dataset.seed;
    let x = 0;
    const peaks = 5 + (+seed % 3);
    for (let i = 0; i <= peaks; i++) {
      const px = (W / peaks) * i;
      const py = H * (0.72 + Math.sin(i * 2.7 + +seed) * 0.1);
      ctx.lineTo(px, py);
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fill();
    // stelle
    const n = 120;
    let rng = +seed * 9301 + 49297;
    const rand = () => (rng = (rng * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < n; i++) {
      const sx = rand() * W, sy = rand() * H * 0.75;
      ctx.beginPath();
      ctx.arc(sx, sy, (rand() * 1.1 + 0.25) * devicePixelRatio, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(245,242,234,${rand() * 0.7 + 0.2})`;
      ctx.fill();
    }
    // cupola osservatorio
    const cx = W * 0.5, cy = H * 0.78;
    const dw = W * 0.16;
    ctx.fillStyle = '#0B1B3A';
    ctx.strokeStyle = 'rgba(79,216,196,0.5)';
    ctx.lineWidth = 1.2 * devicePixelRatio;
    ctx.beginPath();
    ctx.arc(cx, cy, dw / 2, Math.PI, 0);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - dw / 2, cy);
    ctx.lineTo(cx - dw / 2, cy + H * 0.1);
    ctx.lineTo(cx + dw / 2, cy + H * 0.1);
    ctx.lineTo(cx + dw / 2, cy);
    ctx.fill();
    ctx.stroke();
    // fenditura
    ctx.strokeStyle = 'rgba(242,180,65,0.85)';
    ctx.lineWidth = 2.4 * devicePixelRatio;
    ctx.beginPath();
    ctx.moveTo(cx, cy - dw / 2);
    ctx.lineTo(cx + dw * 0.14, cy - dw * 0.06);
    ctx.stroke();
  }
  draw();
  window.addEventListener('resize', draw);
});

/* ---------- Widget "Il cielo di stanotte" ---------- */
(function skyTonight() {
  const chart = document.getElementById('skyChart');
  if (!chart) return;
  const ctx = chart.getContext('2d');
  const select = document.getElementById('obsSelect');
  const listEl = document.getElementById('skyList');

  // Coordinate geografiche degli osservatori
  const SITES = {
    fioi: { lat: 46.55, lon: 12.28, name: 'Col dei Fioi' },
    etna: { lat: 37.79, lon: 15.02, name: 'Etna Nord' },
    golgo: { lat: 40.29, lon: 9.67, name: 'Golgo' }
  };

  // Oggetti celesti notevoli (AR in ore, Dec in gradi, magnitudine, nome, tipo)
  const OBJECTS = [
    { name: 'Sirio', type: 'stella', ra: 6.75, dec: -16.7, mag: -1.5 },
    { name: 'Arturo', type: 'stella', ra: 14.26, dec: 19.2, mag: -0.05 },
    { name: 'Vega', type: 'stella', ra: 18.62, dec: 38.8, mag: 0.03 },
    { name: 'Capella', type: 'stella', ra: 5.28, dec: 46.0, mag: 0.08 },
    { name: 'Rigel', type: 'stella', ra: 5.24, dec: -8.2, mag: 0.13 },
    { name: 'Procione', type: 'stella', ra: 7.65, dec: 5.2, mag: 0.34 },
    { name: 'Betelgeuse', type: 'stella', ra: 5.92, dec: 7.4, mag: 0.5 },
    { name: 'Altair', type: 'stella', ra: 19.85, dec: 8.9, mag: 0.77 },
    { name: 'Aldebaran', type: 'stella', ra: 4.6, dec: 16.5, mag: 0.86 },
    { name: 'Antares', type: 'stella', ra: 16.49, dec: -26.4, mag: 1.06 },
    { name: 'Spica', type: 'stella', ra: 13.42, dec: -11.2, mag: 0.97 },
    { name: 'Polluce', type: 'stella', ra: 7.76, dec: 28.0, mag: 1.14 },
    { name: 'M31 — Galassia di Andromeda', type: 'galassia', ra: 0.71, dec: 41.3, mag: 3.4 },
    { name: 'M42 — Nebulosa di Orione', type: 'nebulosa', ra: 5.59, dec: -5.4, mag: 4.0 },
    { name: 'M13 — Ammasso di Ercole', type: 'ammasso', ra: 16.7, dec: 36.5, mag: 5.8 },
    { name: 'M45 — Pleiadi', type: 'ammasso', ra: 3.79, dec: 24.1, mag: 1.6 },
    { name: 'Polo Nord Celeste', type: 'riferimento', ra: 0, dec: 89.9, mag: 2.0 }
  ];

  const rad = d => d * Math.PI / 180;

  // Tempo siderale locale (approssimato)
  function localSiderealTime(lon, date) {
    const jd = date.getTime() / 86400000 + 2440587.5;
    const T = (jd - 2451545.0) / 36525;
    let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T;
    gmst = ((gmst % 360) + 360) % 360;
    return (((gmst + lon) % 360) + 360) % 360; // in gradi
  }

  // Conversione altazimutale
  function altaz(raHours, decDeg, lat, lon, date) {
    const lst = localSiderealTime(lon, date); // gradi
    const ha = (lst - raHours * 15) * Math.PI / 180; // angolo orario in rad
    const dec = rad(decDeg);
    const latR = rad(lat);
    const sinAlt = Math.sin(dec) * Math.sin(latR) + Math.cos(dec) * Math.cos(latR) * Math.cos(ha);
    const alt = Math.asin(sinAlt);
    const cosAz = (Math.sin(dec) - Math.sin(alt) * Math.sin(latR)) / (Math.cos(alt) * Math.cos(latR));
    let az = Math.acos(Math.max(-1, Math.min(1, cosAz)));
    if (Math.sin(ha) > 0) az = 2 * Math.PI - az;
    return { alt: alt * 180 / Math.PI, az: az * 180 / Math.PI };
  }

  // Fase lunare (approssimata)
  function moonPhase(date) {
    const synodic = 29.530588853;
    const known = Date.UTC(2000, 0, 6, 18, 14); // luna nuova nota
    const days = (date.getTime() - known) / 86400000;
    let phase = ((days % synodic) + synodic) % synodic / synodic; // 0..1
    const illum = (1 - Math.cos(phase * 2 * Math.PI)) / 2;
    const names = [
      'Luna nuova', 'Luna crescente', 'Primo quarto', 'Gibbosa crescente',
      'Luna piena', 'Gibbosa calante', 'Ultimo quarto', 'Luna calante'
    ];
    const idx = Math.floor(phase * 8 + 0.5) % 8;
    return { phase, illum, name: names[idx] };
  }

  function drawChart() {
    const site = SITES[select.value];
    const now = new Date();
    const W = chart.width = chart.offsetWidth * devicePixelRatio;
    const H = chart.height = chart.offsetWidth * devicePixelRatio;
    const cx = W / 2, cy = H / 2, R = W / 2 - 14 * devicePixelRatio;

    ctx.clearRect(0, 0, W, H);

    // sfondo
    ctx.fillStyle = '#04060f';
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fill();

    // cerchi di altitudine (60°, 30°, 0°)
    ctx.strokeStyle = 'rgba(139,147,167,0.25)';
    ctx.lineWidth = 1;
    [0.333, 0.666, 1].forEach(f => {
      ctx.beginPath();
      ctx.arc(cx, cy, R * f, 0, Math.PI * 2);
      ctx.stroke();
    });
    // croce cardini
    ctx.strokeStyle = 'rgba(139,147,167,0.2)';
    [[cx - R, cy, cx + R, cy], [cx, cy - R, cx, cy + R]].forEach(l => {
      ctx.beginPath();
      ctx.moveTo(l[0], l[1]);
      ctx.lineTo(l[2], l[3]);
      ctx.stroke();
    });

    // etichette cardinali
    ctx.fillStyle = 'rgba(139,147,167,0.8)';
    ctx.font = `${11 * devicePixelRatio}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('N', cx, cy - R - 6 * devicePixelRatio);
    ctx.fillText('S', cx, cy + R + 14 * devicePixelRatio);
    ctx.fillText('E', cx + R + 10 * devicePixelRatio, cy + 4 * devicePixelRatio);
    ctx.fillText('O', cx - R - 10 * devicePixelRatio, cy + 4 * devicePixelRatio);

    // oggetti
    const visible = [];
    for (const o of OBJECTS) {
      const { alt, az } = altaz(o.ra, o.dec, site.lat, site.lon, now);
      if (alt > 0) {
        const r = R * (1 - alt / 90);
        const ang = (az - 90) * Math.PI / 180; // N in alto
        const x = cx + r * Math.cos(ang);
        const y = cy + r * Math.sin(ang);
        const size = Math.max(1.5, 5 - o.mag) * devicePixelRatio;
        const isDeep = o.type !== 'stella' && o.type !== 'riferimento';
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = isDeep ? 'rgba(242,180,65,0.95)' : 'rgba(245,242,234,0.95)';
        ctx.fill();
        if (isDeep) {
          ctx.strokeStyle = 'rgba(242,180,65,0.4)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(x, y, size + 4 * devicePixelRatio, 0, Math.PI * 2);
          ctx.stroke();
        }
        visible.push({ ...o, alt, az });
      }
    }

    // Polo Nord Celeste sempre visibile dall'Italia
    ctx.strokeStyle = 'rgba(79,216,196,0.5)';
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.02, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    renderList(visible, site);
  }

  function renderList(visible, site) {
    const now = new Date();
    const mp = moonPhase(now);
    visible.sort((a, b) => b.alt - a.alt);
    const top = visible.slice(0, 7);
    listEl.innerHTML = '';

    const moonBox = document.createElement('div');
    moonBox.className = 'moon-phase-box';
    moonBox.innerHTML = `
      <canvas id="moonCanvas" width="128" height="128"></canvas>
      <div class="moon-info">
        <div class="m-name">${mp.name}</div>
        <div class="m-illum">Illuminata al ${Math.round(mp.illum * 100)}% — ${mp.illum > 0.6 ? 'cielo più chiaro' : 'cielo più buio'}</div>
      </div>`;
    listEl.appendChild(moonBox);

    const mc = moonBox.querySelector('#moonCanvas');
    const mctx = mc.getContext('2d');
    mctx.clearRect(0, 0, 128, 128);
    mctx.fillStyle = '#0d1226';
    mctx.beginPath();
    mctx.arc(64, 64, 56, 0, Math.PI * 2);
    mctx.fill();
    mctx.fillStyle = '#F5F2EA';
    mctx.beginPath();
    mctx.arc(64, 64, 56, -Math.PI / 2, -Math.PI / 2 + mp.phase * Math.PI * 2);
    mctx.fill();
    // terminatore ellittico
    mctx.fillStyle = mp.phase < 0.5 ? '#F5F2EA' : '#0d1226';
    mctx.beginPath();
    mctx.ellipse(64, 64, 56 * Math.abs(Math.cos(mp.phase * Math.PI)), 56, 0, -Math.PI / 2, Math.PI / 2, mp.phase < 0.5);
    mctx.fill();

    for (const o of top) {
      const div = document.createElement('div');
      div.className = 'sky-obj';
      const typeLabel = { stella: 'Stella', galassia: 'Galassia', nebulosa: 'Nebulosa', ammasso: 'Ammasso', riferimento: 'Riferimento' }[o.type];
      div.innerHTML = `
        <div class="o-name">${o.name}<small>${typeLabel} · magnitudine ${o.mag}</small></div>
        <div class="o-alt">${Math.round(o.alt)}° sopra l'orizzonte</div>`;
      listEl.appendChild(div);
    }

    if (top.length === 0) {
      const div = document.createElement('div');
      div.className = 'sky-obj';
      div.innerHTML = `<div class="o-name">Nessun oggetto in vista<small>Il cielo ruota: torna tra poche ore</small></div>`;
      listEl.appendChild(div);
    }
  }

  select.addEventListener('change', drawChart);
  window.addEventListener('resize', drawChart);
  drawChart();
  setInterval(drawChart, 60000); // aggiorna ogni minuto
})();

/* ---------- Tabs esperienze ---------- */
document.querySelectorAll('.exp-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.exp-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.exp-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.panel).classList.add('active');
  });
});

/* ---------- FAQ accordion ---------- */
document.querySelectorAll('.faq-item').forEach(item => {
  const q = item.querySelector('.faq-q');
  const a = item.querySelector('.faq-a');
  q.addEventListener('click', () => {
    const open = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(i => {
      i.classList.remove('open');
      i.querySelector('.faq-a').style.maxHeight = null;
    });
    if (!open) {
      item.classList.add('open');
      a.style.maxHeight = a.scrollHeight + 'px';
    }
  });
});

/* ---------- Toast ---------- */
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 4200);
}

/* ---------- Form contatti ---------- */
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll('[required]').forEach(f => {
      const field = f.closest('.field');
      if (!f.value.trim()) {
        field.classList.add('invalid');
        valid = false;
      } else {
        field.classList.remove('invalid');
      }
    });
    const email = form.querySelector('#fEmail');
    if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.closest('.field').classList.add('invalid');
      valid = false;
    }
    if (!valid) {
      showToast('Ci sono alcuni campi da sistemare. Guarda quelli evidenziati.');
      return;
    }
    showToast('Grazie. Ti rispondiamo entro 24 ore — tranne il lunedì, che dedichiamo alla manutenzione dei telescopi.');
    form.reset();
  });
}

/* ---------- Newsletter ---------- */
const nlForm = document.getElementById('nlForm');
if (nlForm) {
  nlForm.addEventListener('submit', e => {
    e.preventDefault();
    const input = nlForm.querySelector('input');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
      showToast('Ci serve un indirizzo email valido per l\u2019Almanacco.');
      return;
    }
    showToast('Benvenuto. Il primo Almanacco arriva con la luna nuova.');
    input.value = '';
  });
}

/* ---------- Anno footer ---------- */
document.getElementById('year').textContent = new Date().getFullYear();
