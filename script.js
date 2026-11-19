/* =========================================================
   FP SELECTION — script
   Animações inspiradas em naocodei.com/free-code (JS puro):
   #09 cursor · #12 luz no cursor · #14 botão elástico
   #15 embaralhar letras · #18 odômetro · #28 partículas conectadas
   + pontos interativos nos carros (conceito VEYRA)
   + inspeção do GTR com renders reais e malha 3D
   (ideia do simulador Medusa JF-4: tudo é função do tempo)
========================================================= */
(function () {
'use strict';

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ---------- DADOS ---------- */
const CARS = [
  { title:'GTR', tag:'ÚNICO DONO • ESPORTIVO', badge:'SPECIAL SPEC', engine:'V6', power:'565', trac:'4x4',
    desc:'Performance, tecnologia e design agressivo. Um esportivo criado para entregar uma experiência única ao volante.',
    spots:[
      {x:26,y:52,t:'Capô em carbono',d:'Peça leve com entradas de ar que ajudam a refrigerar o motor.'},
      {x:21,y:73,t:'Rodas e freios',d:'Aros pretos, pinças amarelas e pneus de alta performance.'},
      {x:90,y:42,t:'Aerofólio',d:'Gera pressão aerodinâmica para manter o carro firme em velocidade.'}] },
  { title:'FERRARI', tag:'ÚNICO DONO • ESPORTIVO', badge:'ROSSO CORSA', engine:'V8', power:'710', trac:'RWD',
    desc:'Design italiano, desempenho impressionante e uma experiência esportiva que representa o verdadeiro DNA da Ferrari.',
    spots:[
      {x:33,y:40,t:'Motor V8',d:'Resposta imediata e som inconfundível, marca registrada da casa.'},
      {x:21,y:63,t:'Rodas de cinco raios',d:'Desenho clássico com pinças vermelhas à mostra.'},
      {x:86,y:45,t:'Traseira',d:'Linhas fluidas que escoam o ar e dão a silhueta esportiva.'}] },
  { title:'PORSCHE', tag:'ÚNICO DONO • ESPORTIVO', badge:'911 TURBO', engine:'6C', power:'640', trac:'AWD',
    desc:'Sofisticação, potência e engenharia alemã combinadas em um dos esportivos mais desejados do mundo.',
    spots:[
      {x:51,y:46,t:'Cabine',d:'Posição baixa e vidros amplos para dirigir com visão total.'},
      {x:21,y:67,t:'Rodas multirraios',d:'Aros grandes com freios de alto desempenho atrás.'},
      {x:88,y:31,t:'Aerofólio',d:'Asa traseira que estabiliza o carro nas altas velocidades.'}] }
];

/* ---------- #15 EMBARALHAR LETRAS ---------- */
let scrId = 0;
function scramble(el, text) {
  if (reduce) { el.textContent = text; return; }
  const id = ++scrId, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', t0 = performance.now();
  el.setAttribute('aria-label', text);
  (function frame(now) {
    if (id !== scrId) return;
    const t = now - t0; let out = '', done = true;
    for (let i = 0; i < text.length; i++) {
      if (t > 300 + i * 110) out += text[i];
      else { out += chars[Math.floor(Math.random() * 26)]; done = false; }
    }
    el.textContent = out;
    if (!done) requestAnimationFrame(frame);
  })(t0);
}

/* ---------- #18 ODÔMETRO ---------- */
function buildOdo(el, value) {
  el.setAttribute('aria-label', value);
  el.textContent = '';
  const wrap = document.createElement('i');
  wrap.className = 'odo'; wrap.setAttribute('aria-hidden', 'true'); wrap.style.fontStyle = 'normal';
  [...value].forEach(ch => {
    const col = document.createElement('i'), strip = document.createElement('i');
    col.className = 'odo-col'; strip.className = 'odo-strip'; strip.dataset.d = ch;
    for (let n = 0; n <= 9; n++) { const c = document.createElement('i'); c.textContent = n; strip.appendChild(c); }
    col.appendChild(strip); wrap.appendChild(col);
  });
  el.appendChild(wrap);
}
function rollOdo(el, value) {
  if (!el.querySelector('.odo') || el.getAttribute('aria-label') !== value) buildOdo(el, value);
  $$('.odo-strip', el).forEach((s, i) => {
    const d = Number(s.dataset.d);
    s.style.transition = 'none'; s.style.transform = 'translateY(0)'; s.offsetHeight;
    if (reduce) { s.style.transform = `translateY(${-d}em)`; return; }
    s.style.transition = `transform 1.3s cubic-bezier(.2,.8,.2,1) ${.3 + i * .12}s`;
    s.style.transform = `translateY(${-d}em)`;
  });
}

/* ---------- SLIDER ---------- */
const slides = $$('.slide'), bars = $$('#progress button');
let cur = 0;
const els = { tag:$('#s-tag'), title:$('#s-title'), badge:$('#s-badge'), desc:$('#s-desc'),
  engine:$('#s-engine'), power:$('#s-power'), trac:$('#s-trac'), num:$('#s-num') };


function render(i) {
  cur = (i + CARS.length) % CARS.length;
  const d = CARS[cur];
  slides.forEach((s, n) => s.classList.toggle('is-active', n === cur));
  bars.forEach((b, n) => b.classList.toggle('is-active', n === cur));
  els.tag.textContent = d.tag; els.badge.textContent = d.badge; els.desc.textContent = d.desc;
  els.engine.textContent = d.engine; els.trac.textContent = d.trac; els.num.textContent = '0' + (cur + 1);
  riseTitle(els.title, d.title);
  els.power.textContent = d.power;
  if (heroSeen) swapInfo();
  heroSeen = true;
}
$('#prev').addEventListener('click', () => render(cur - 1));
$('#next').addEventListener('click', () => render(cur + 1));
bars.forEach((b, n) => b.addEventListener('click', () => render(n)));
document.addEventListener('keydown', e => {
  if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
  if (e.key === 'ArrowRight') render(cur + 1);
  if (e.key === 'ArrowLeft') render(cur - 1);
});
let tx = 0;
$('#stage').addEventListener('touchstart', e => { tx = e.changedTouches[0].screenX; }, { passive: true });
$('#stage').addEventListener('touchend', e => {
  const d = tx - e.changedTouches[0].screenX;
  if (Math.abs(d) > 45) render(cur + (d > 0 ? 1 : -1));
}, { passive: true });
render(0);

/* ---------- #12 LUZ QUE SEGUE O MOUSE ---------- */
const hero = $('#hero');
addEventListener('pointermove', e => {
  document.documentElement.style.setProperty('--mx', e.clientX + 'px');
  document.documentElement.style.setProperty('--my', e.clientY + 'px');
});

/* ---------- #09 CURSOR PERSONALIZADO ---------- */
if (!reduce && fine) {
  const dot = document.createElement('div'), ring = document.createElement('div');
  dot.className = 'cursor-dot'; ring.className = 'cursor-ring';
  document.body.append(dot, ring); document.body.classList.add('has-cursor');
  let mx = -100, my = -100, rx = -100, ry = -100;
  addEventListener('pointermove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px,${my}px)`;
    ring.classList.toggle('big', !!e.target.closest('a, button, input, select, textarea'));
  });
  (function loop() {
    rx += (mx - rx) * .16; ry += (my - ry) * .16;
    ring.style.transform = `translate(${rx}px,${ry}px)`;
    requestAnimationFrame(loop);
  })();
}

/* ---------- #28 PARTÍCULAS CONECTADAS (só rodam com o hero visível) ---------- */
if (!reduce) {
  const cv = $('.bg-particles'), ctx = cv.getContext('2d');
  let w = 0, h = 0, pts = [], visible = true;
  function size() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = innerWidth; h = innerHeight;
    cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(70, Math.max(24, w / 22)));
    pts = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35 }));
  }
  size(); addEventListener('resize', size);
  
  (function draw() {
    if (visible && !document.hidden) {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i]; p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1; if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.fillStyle = 'rgb(255, 255, 255)'; ctx.fillRect(p.x, p.y, 1.5, 1.5);
        for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot(p.x - pts[j].x, p.y - pts[j].y);
          if (d < 130) {
            ctx.strokeStyle = `rgba(120,170,255,${(1 - d / 130) * .22})`;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
          }
        }
      }
    }
    requestAnimationFrame(draw);
  })();
}

/* ---------- CONTADORES (+12, 100%, 500+) ---------- */
const counters = $$('[data-count]');
const countIO = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  countIO.unobserve(e.target);
  const el = e.target, end = +el.dataset.count, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
  if (reduce) return;
  const t0 = performance.now();
  (function tick(now) {
    const p = Math.min(1, (now - t0) / 1600), v = Math.round(end * (1 - Math.pow(1 - p, 4)));
    el.textContent = pre + v + suf;
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}), { threshold: .6 });
counters.forEach(c => { if (!reduce) c.textContent = (c.dataset.prefix || '') + '0' + (c.dataset.suffix || ''); countIO.observe(c); });

/* ---------- NAV ATIVA ---------- */
const navLinks = $$('.topnav a, .tabbar a');
const secs = ['hero', 'engenharia-3d', 'especificacoes', 'acervo', 'sobre', 'contato'].map(id => document.getElementById(id));
new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id));
}), { rootMargin: '-45% 0px -50% 0px' }).observe && secs.forEach(s => {
  new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' }).observe(s);
});

/* ---------- FORM ---------- */
$$('[data-car]').forEach(a => a.addEventListener('click', () => { $('#c-car').value = a.dataset.car; }));
$('#vip-form').addEventListener('submit', e => {
  e.preventDefault();
  const t = $('#toast'); t.hidden = false; setTimeout(() => { t.hidden = true; }, 5000);
});

/* =========================================================
   INSPEÇÃO DO GTR — renders reais + malha 3D
   Pares "render / malha" com o MESMO enquadramento: a varredura
   revela a malha por baixo da pintura. O tour é função de um único
   tempo gT (pausa, arrasta a régua, escolhe a vista).
========================================================= */
const IM = {
  1:'img/gtr/g1.jpg', 6:'img/gtr/g6.jpg', 7:'img/gtr/g7.jpg', 8:'img/gtr/g8.jpg', 10:'img/gtr/g10.jpg', 12:'img/gtr/g12.jpg',
  13:'img/gtr/g13.jpg', 14:'img/gtr/g14.jpg', 15:'img/gtr/g15.jpg', 17:'img/gtr/g17.jpg', 19:'img/gtr/g19.jpg', 23:'img/gtr/g23.jpg',
  25:'img/gtr/g25.jpg', 27:'img/gtr/g27.jpg', 28:'img/gtr/g28.jpg', 29:'img/gtr/g29.jpg', 30:'img/gtr/g30.jpg'
};
/* a = render · w = malha (mesmo enquadramento) · o = capô/portas abertos
   n / no = pontos (x, y em % da imagem, texto) */
const DK = [[0,0],[.12,0],[.5,100],[.8,100],[1,0]];
const SC = [
  { t:'Frente', a:6, w:29, o:12, dur:14,
    sk:[[0,0],[.05,0],[.3,100],[.42,100],[.52,0],[1,0]], full:.3, open:[.6,.74],
    n:[[27,45,'Faróis em LED'],[37,33,'Capô com extratores'],[50,79,'Splitter dianteiro']],
    no:[[50,23,'Motor à mostra'],[16,24,'Portas abertas'],[50,8,'Capô aberto']] },
  { t:'Frente 3/4', a:1, w:25, dur:7,
    n:[[16,15,'Aerofólio de competição'],[44,50,'Faróis em LED'],[30,66,'Rodas de 5 raios'],[62,85,'Splitter dianteiro']] },
  { t:'Lateral', a:15, w:30, dur:7,
    n:[[10,27,'Aerofólio'],[20,55,'Rodas e freios'],[67,45,'Entrada de ar lateral'],[80,55,'Para-lamas alargados']] },
  { t:'Traseira', a:17, w:28, dur:7,
    n:[[29,37,'Lanternas redondas'],[50,14,'Aerofólio'],[28,67,'Escapamento duplo'],[50,69,'Difusor']] },
  { t:'Vista aérea', a:7, w:27, dur:7,
    n:[[33,48,'Capô com extratores'],[78,9,'Aerofólio'],[51,85,'Rodas dianteiras']] },
  { t:'Motor', a:10, dur:5,
    n:[[34,40,'Cofre do motor'],[82,42,'Porta aberta']] },
  { t:'Interior', a:8, dur:5,
    n:[[43,45,'Bancos esportivos'],[66,35,'Capô aberto']] },
  { t:'Painel', a:14, w:23, dur:7,
    n:[[30,52,'Volante GT-R'],[65,36,'Central multimídia'],[69,72,'Câmbio automático']] },
  { t:'Bancos', a:13, w:19, dur:7,
    n:[[70,35,'Banco concha'],[47,38,'Banco traseiro'],[45,77,'Console central']] }
];

const gStage = $('#gt-stage'), gWorld = $('#gt-world'), gImgs = $('#gt-imgs'), gLine = $('#xr-scan'),
      gNotes = $('#xr-notes'), gChips = $('#gt-chips'), gOpen = $('#gt-open'), gRail = $('#xr-rail'), gPlay = $('#xr-play');
const gClamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const gSmooth = t => t * t * (3 - 2 * t);
const gInterp = (k, u) => {
  for (let i = 1; i < k.length; i++) if (u <= k[i][0]) {
    const a = k[i - 1], b = k[i];
    return b[0] === a[0] ? b[1] : a[1] + (b[1] - a[1]) * gSmooth((u - a[0]) / (b[0] - a[0]));
  }
  return k[k.length - 1][1];
};
const gStart = []; let gTotal = 0;
SC.forEach(sc => { gStart.push(gTotal); gTotal += sc.dur; });

/* camadas de imagem (carregam só quando a seção se aproxima) */
const layers = {};
Object.keys(IM).forEach(k => {
  const im = document.createElement('img');
  im.className = 'gt-img' + ([19, 23, 25, 27, 28, 29, 30].includes(+k) ? ' wire' : ''); im.alt = ''; im.decoding = 'async'; im.draggable = false; im.dataset.src = IM[k];
  gImgs.appendChild(im); layers[k] = im;
});
let gLoaded = false;
function gLoad() { if (gLoaded) return; gLoaded = true; Object.values(layers).forEach(im => { im.src = im.dataset.src; }); }

/* chips + marcas na régua */
const chipEls = SC.map((sc, i) => {
  const b = document.createElement('button');
  b.textContent = sc.t;
  b.addEventListener('click', () => { gT = gStart[i]; gTourOn = true; gPlayIcon(); gApplyTour(); });
  gChips.appendChild(b); return b;
});
gStart.forEach((st, i) => { if (!i) return; const em = document.createElement('em'); em.style.left = st / gTotal * 100 + '%'; gRail.insertBefore(em, $('#xr-knob')); });

let gCur = -1, gT = 0, gTourOn = !reduce, gInView = false, gDragRail = false, gDragScan = false, gPX = 0, gPY = 0;
let gS = { s: 0, o: 0, env: 0, u: 0 };
const mk = (v, deg) => `linear-gradient(${deg},#000 ${v - 7}%,transparent ${v + 7}%)`;

function gEnter(i) {
  gCur = i; const sc = SC[i];
  for (const k in layers) {
    const L = layers[k], isA = +k === sc.a, isW = +k === sc.w, isO = +k === sc.o;
    L.classList.toggle('on', isA || isW || isO);
    L.style.zIndex = isA ? 1 : isW ? 2 : isO ? 3 : 0;
    if (!isW && !isO) L.style.webkitMaskImage = L.style.maskImage = 'none';
  }
  gNotes.textContent = '';
  [['c', sc.n || []], ['o', sc.no || []]].forEach(([g, arr]) => arr.forEach(([x, y, t], k) => {
    const el = document.createElement('div');
    el.className = 'xr-note ' + (k % 2 ? 'dn' : 'up') + (x < 15 ? ' l' : x > 85 ? ' r' : '');
    el.style.left = x + '%'; el.style.top = y + '%'; el.dataset.x = x; el.dataset.g = g; el.dataset.k = k;
    const dot = document.createElement('i'), lab = document.createElement('span');
    lab.textContent = t; el.append(dot, lab); gNotes.appendChild(el);
  }));
  chipEls.forEach((b, n) => b.classList.toggle('is-active', n === i));
  gChips.scrollTo({ left: chipEls[i].offsetLeft - 24, behavior: reduce ? 'auto' : 'smooth' });
  gOpen.hidden = !sc.o;
  gStage.classList.toggle('can-drag', !!sc.w);
  gStage.setAttribute('aria-label', 'GTR · ' + sc.t);
}

function gPaint(i, s, o, env, u) {
  const sc = SC[i]; gS = { s, o, env, u };
  if (sc.w) {
    const v = s * 1.16 - 8, L = layers[sc.w];
    L.style.webkitMaskImage = L.style.maskImage = mk(v, '90deg');
    gLine.style.left = gClamp(v, 0, 100) + '%';
    gLine.style.opacity = (s > .5 && s < 99.5) ? 1 : 0;
  } else gLine.style.opacity = 0;
  if (sc.o) {
    const v = o * 116 - 8, L = layers[sc.o];
    L.style.webkitMaskImage = L.style.maskImage = mk(v, '100deg');
    const t = o > .5 ? 'Fechar capô' : 'Abrir capô';
    if ($('#gt-open-t').textContent !== t) $('#gt-open-t').textContent = t;
  }
  $$('.xr-note', gNotes).forEach(n => {
    const k = +n.dataset.k, x = +n.dataset.x;
    const on = n.dataset.g === 'o' ? o > .7 : (o < .35 && (sc.w ? env >= x : u > .12 + k * .16));
    n.classList.toggle('on', on);
  });
  gWorld.style.transform = `translate3d(${(gPX * -10).toFixed(1)}px,${(gPY * -6).toFixed(1)}px,0) scale(${(1 + .045 * u).toFixed(4)})`;
  const state = sc.o && o > .5 ? 'CAPÔ ABERTO' : sc.w ? (s < 15 ? 'RENDER' : s < 85 ? 'VARREDURA' : 'MALHA 3D') : 'VISTA';
  $('#hud-status').textContent = 'INSPEÇÃO · ' + sc.t.toUpperCase();
  $('#hud-pct').textContent = sc.o && o > .5 ? 'CAPÔ: ABERTO' : sc.w ? 'VARREDURA: ' + Math.round(s) + '%' : 'VISTA ' + (i + 1) + '/' + SC.length;
  $('#xr-mode').textContent = sc.t.toUpperCase() + ' · ' + state;
}

function gApplyTour() {
  let i = SC.length - 1; while (i > 0 && gT < gStart[i]) i--;
  if (i !== gCur) gEnter(i);
  const sc = SC[i], u = gClamp((gT - gStart[i]) / sc.dur);
  const s = sc.w ? gInterp(sc.sk || DK, u) : 0;
  const o = sc.o ? gSmooth(gClamp((u - sc.open[0]) / (sc.open[1] - sc.open[0]))) : 0;
  const env = sc.w ? (u >= (sc.full || .5) ? 100 : s) : 0;
  gPaint(i, s, o, env, u);
  const p = gT / gTotal * 100;
  $('#xr-fill').style.width = p + '%'; $('#xr-knob').style.left = p + '%';
  gRail.setAttribute('aria-valuenow', Math.round(p));
  const f = n => String(Math.floor(n)).padStart(2, '0');
  $('#xr-tc').textContent = `${f(gT / 60)}:${f(gT % 60)} / ${f(gTotal / 60)}:${f(gTotal % 60)}`;
}

function gPlayIcon() {
  $('#xr-pi').setAttribute('d', gTourOn ? 'M2 1h3v10H2zM7 1h3v10H7z' : 'M3 1l8 5-8 5z');
  gPlay.setAttribute('aria-label', gTourOn ? 'Pausar tour' : 'Reproduzir tour');
}
function gPause() { if (gTourOn) { gTourOn = false; gPlayIcon(); } }
gPlay.addEventListener('click', () => { gTourOn = !gTourOn; gPlayIcon(); });

/* régua do tour */
const gRailSet = e => { const r = gRail.getBoundingClientRect(); gT = gClamp((e.clientX - r.left) / r.width, 0, .9999) * gTotal; gApplyTour(); };
gRail.addEventListener('pointerdown', e => { gDragRail = true; gRail.setPointerCapture(e.pointerId); gRailSet(e); });
gRail.addEventListener('pointermove', e => { if (gDragRail) gRailSet(e); });
['pointerup', 'pointercancel'].forEach(ev => gRail.addEventListener(ev, () => { gDragRail = false; }));
gRail.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') { gT = Math.min(gTotal - .01, gT + 2); gApplyTour(); }
  if (e.key === 'ArrowLeft') { gT = Math.max(0, gT - 2); gApplyTour(); }
});

/* arrastar sobre a imagem = varredura manual (só nas vistas com malha) */
function gScanFrom(e) {
  const r = gStage.getBoundingClientRect(), s = gClamp((e.clientX - r.left) / r.width * 100, 0, 100);
  gPaint(gCur, s, gS.o, Math.max(gS.env, s), gS.u);
}
gStage.addEventListener('pointerdown', e => {
  if (e.target.closest('button') || !SC[gCur].w) return;
  gDragScan = true; gPause(); gStage.setPointerCapture(e.pointerId); gScanFrom(e);
});
gStage.addEventListener('pointermove', e => {
  if (gDragScan) { gScanFrom(e); return; }
  if (reduce || !fine) return;
  const r = gStage.getBoundingClientRect();
  gPX = (e.clientX - r.left) / r.width - .5; gPY = (e.clientY - r.top) / r.height - .5;
  gPaint(gCur, gS.s, gS.o, gS.env, gS.u);
});
['pointerup', 'pointercancel'].forEach(ev => gStage.addEventListener(ev, () => { gDragScan = false; }));
gStage.addEventListener('pointerleave', () => { gPX = gPY = 0; gPaint(gCur, gS.s, gS.o, gS.env, gS.u); });

/* botão Abrir / Fechar capô */
let gTw = 0;
gOpen.addEventListener('click', () => {
  gPause();
  const from = gS.o, to = from > .5 ? 0 : 1, id = ++gTw, t0 = performance.now(), dur = reduce ? 1 : 1000;
  (function f(now) {
    if (id !== gTw) return;
    const p = gClamp((now - t0) / dur), v = from + (to - from) * gSmooth(p);
    gPaint(gCur, gS.s, v, gS.env, gS.u);
    if (p < 1) requestAnimationFrame(f);
  })(t0);
});

/* relógio do tour: só roda com a seção visível */
new IntersectionObserver(([e]) => { gInView = e.isIntersecting; if (gInView) gLoad(); }, { rootMargin: '600px 0px', threshold: 0 }).observe($('#engenharia-3d'));
new IntersectionObserver(([e]) => { if (e.isIntersecting) gLoad(); }, { rootMargin: '1200px 0px' }).observe($('#engenharia-3d'));
let gLast = performance.now();
(function gTick(now) {
  const dt = Math.min(.05, (now - gLast) / 1000); gLast = now;
  const vis = gStage.getBoundingClientRect(), on = vis.bottom > 0 && vis.top < innerHeight;
  if (gTourOn && on && !gDragRail && !gDragScan && !document.hidden) { gT = (gT + dt) % gTotal; gApplyTour(); }
  requestAnimationFrame(gTick);
})(gLast);
gPlayIcon();
gApplyTour();


/* =========================================================
   TÍTULO QUE SE DESFAZ AO ROLAR (ideia do prompt "Beyond")
   4 camadas empilhadas (branca, vermelha, "vão", azul) + letras
   que se soltam conforme o scroll. Na abertura o caminho é inverso.
========================================================= */
const hw = $('#hero-word'), hwWrap = $('#hero-wrap'), WORD = 'SELECTION';
const HW_COL = ['#d4e4ff', '#00167a', '#000000'], HW_OFF = [0, 9, 18];
const hwLayers = [];
for (let L = 2; L >= 0; L--) {
  const ly = document.createElement('div'); ly.className = 'hw-layer'; ly.style.color = HW_COL[L];
  const spans = [];
  [...WORD].forEach(ch => { const sp = document.createElement('span'); sp.textContent = ch; ly.appendChild(sp); spans.push(sp); });
  hw.appendChild(ly); hwLayers[L] = spans;
}
const hwHash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
let hwIntro = reduce ? 0 : 1, hwScroll = 0;
function hwDraw() {
  const p = Math.max(hwScroll, hwIntro), sc = innerWidth < 768 ? .5 : 1, assembling = hwIntro > hwScroll;
  hwLayers.forEach((spans, L) => {
    const off = HW_OFF[L] * sc * (1 + 2.2 * hwScroll);
    spans.forEach((sp, i) => {
      const q = Math.pow(gClamp((p - .06) / .94), 1.35), a = hwHash(i + 1), b = hwHash(i * 3 + 7), c = hwHash(i * 5 + 2);
      const dy = off + q * (assembling ? -1 : 1) * (40 + a * 110) * (1 + L * .22);
      const dx = (b - .5) * 120 * q * (1 + L * .25), rot = (c - .5) * 30 * q;
      sp.style.transform = `translate3d(${dx.toFixed(1)}px,${dy.toFixed(1)}px,0) rotate(${rot.toFixed(1)}deg)`;
      sp.style.opacity = (1 - gClamp((q - .3) / .6) * (L === 0 ? .95 : 1)).toFixed(3);
    });
  });
}
function hwProgress() {
  if (getComputedStyle(hero).position === 'sticky') {
    const r = hwWrap.getBoundingClientRect();
    return gClamp(-r.top / Math.max(1, hwWrap.offsetHeight - innerHeight));
  }
  return gClamp(scrollY / 320);
}
let hwTick = false;
function hwOnScroll() {
  if (reduce || hwTick) return; hwTick = true;
  requestAnimationFrame(() => { hwTick = false; hwScroll = hwProgress(); hwDraw(); });
}
addEventListener('scroll', hwOnScroll, { passive: true }); addEventListener('resize', hwOnScroll);
hwDraw();

/* ---------- ANIMAÇÃO DE ABERTURA DO SITE ---------- */
const intro = $('#intro');
function startReady() {
  document.body.classList.add('is-ready');
  hero.classList.add('hero-run');
  if (reduce) return;
  const t0 = performance.now(), dur = 1400;
  (function f(now) {
    const p = gClamp((now - t0) / dur); hwIntro = 1 - (1 - Math.pow(1 - p, 3)); hwIntro = 1 - gSmooth(p); hwDraw();
    if (p < 1) requestAnimationFrame(f);
  })(t0);
}
if (reduce) { intro.remove(); startReady(); }
else {
  document.body.style.overflow = 'hidden'; scrollTo(0, 0);
  let done = false;
  const finish = () => {
    if (done) return; done = true;
    intro.classList.add('out'); document.body.style.overflow = '';
    setTimeout(startReady, 350); setTimeout(() => intro.remove(), 1300);
  };
  const t0 = performance.now(), dur = 1500, bar = $('#intro-bar'), cnt = $('#intro-count');
  (function f(now) {
    const p = gClamp((now - t0) / dur), v = Math.round(p * 100);
    bar.style.width = v + '%'; cnt.textContent = String(v).padStart(3, '0');
    if (p < 1 && !done) requestAnimationFrame(f); else finish();
  })(t0);
  intro.addEventListener('click', finish);
  setTimeout(finish, 3500);
}

/* ---------- COR DA MALHA 3D ---------- */
const MESH = [
  ['Original', 'none', '#60a5fa', '#e2e8f0'],
  ['Azul', 'sepia(1) saturate(6) hue-rotate(165deg)', '#60a5fa', '#60a5fa'],
  ['Ciano', 'sepia(1) saturate(6) hue-rotate(140deg)', '#22d3ee', '#22d3ee'],
  ['Vermelho', 'sepia(1) saturate(7) hue-rotate(-35deg)', '#ef4444', '#ef4444'],
  ['Verde', 'sepia(1) saturate(6) hue-rotate(80deg)', '#4ade80', '#4ade80'],
  ['Âmbar', 'sepia(1) saturate(5) brightness(1.1)', '#fbbf24', '#fbbf24']
];
const swEls = MESH.map((m, i) => {
  const b = document.createElement('button');
  b.className = 'sw' + (i ? '' : ' is-active'); b.style.setProperty('--c', m[3]);
  b.setAttribute('aria-label', 'Malha ' + m[0]); b.setAttribute('aria-pressed', i ? 'false' : 'true'); b.title = m[0];
  b.addEventListener('click', () => {
    gStage.style.setProperty('--wf', m[1]); gStage.style.setProperty('--gt-acc', m[2]);
    swEls.forEach((x, n) => { x.classList.toggle('is-active', n === i); x.setAttribute('aria-pressed', n === i); });
  });
  $('#gt-colors').appendChild(b); return b;
});

/* ---------- ESPECIFICAÇÕES (troca de carro + vídeo de fundo de cada carro) ---------- */
const SPV = [
  { v: 'video/especificacoes-gtr.mp4', p: 'img/carros/gtr.png', s: ['img/carros/gtr.png', 'img/carros/gtr15.jpg', 'img/carros/gtr.png'] },
  { v: 'video/especificacoes-ferrari.mp4', p: 'img/carros/ferrari1.png', s: ['img/carros/ferrari1.png', 'img/carros/ferrari.png', 'img/carros/ferrari1.png'] },
  { v: 'video/especificacoes-porsche.mp4', p: 'img/carros/porsche1.png', s: ['img/carros/porsche1.png', 'img/carros/porsche.png', 'img/carros/porsche1.png'] }
];
const spTabs = $('#sp-tabs'), spEng = $('#sp-engine'), spPow = $('#sp-power'), spTrac = $('#sp-trac'), spBadge = $('#sp-badge');
const sv = $('#specs-video');
let spCur = 0, spInView = false;
const spBtns = CARS.map((c, i) => {
  const b = document.createElement('button'); b.textContent = c.title; b.setAttribute('role', 'tab');
  b.addEventListener('click', () => spSet(i)); spTabs.appendChild(b); return b;
});
function spVideo(i) {
  $$('.specs-slides i').forEach((el, n) => { el.style.backgroundImage = 'url(' + SPV[i].s[n] + ')'; });
  if (!sv) return;
  sv.classList.remove('on'); sv.poster = SPV[i].p; sv.src = SPV[i].v;
  if (!reduce) { sv.load(); if (spInView) { const pr = sv.play(); if (pr && pr.catch) pr.catch(() => {}); } }
}
function spSet(i, keepVideo) {
  spCur = i; const c = CARS[i];
  spBtns.forEach((b, n) => { b.classList.toggle('is-active', n === i); b.setAttribute('aria-selected', n === i); });
  spEng.textContent = c.engine; spTrac.textContent = c.trac; spBadge.textContent = c.badge;
  rollOdo(spPow, c.power);
  if (!keepVideo) spVideo(i);
}
spSet(0);
if (sv) sv.addEventListener('playing', () => sv.classList.add('on'));
new IntersectionObserver(([e]) => {
  spInView = e.isIntersecting;
  if (e.isIntersecting) { spSet(spCur, true); if (sv && !reduce) { const pr = sv.play(); if (pr && pr.catch) pr.catch(() => {}); } }
  else if (sv) sv.pause();
}, { threshold: .25 }).observe($('#especificacoes'));

/* =========================================================
   SUBIR E APARECER (fx-up) — animação suave nas letras e blocos
   Dispara uma vez quando o bloco aparece na tela (.animar → .run)
========================================================= */
function splitInto(el, text) {
  el.textContent = ''; let j = 0;
  text.split(' ').forEach((w, wi) => {
    if (wi) el.appendChild(document.createTextNode(' '));
    const wd = document.createElement('span'); wd.className = 'wd';
    [...w].forEach(ch => { const l = document.createElement('span'); l.className = 'lt'; l.textContent = ch; l.style.setProperty('--j', j++); wd.appendChild(l); });
    el.appendChild(wd);
  });
}
function riseTitle(el, text) {
  el.setAttribute('aria-label', text); splitInto(el, text);
  el.classList.remove('go'); void el.offsetWidth; el.classList.add('go');
}
function swapInfo() {
  const info = $('.hero-info'); info.classList.remove('swap'); void info.offsetWidth; info.classList.add('swap');
}
$$('.sec-head h2').forEach(h2 => { const t = h2.textContent.trim(); h2.setAttribute('aria-label', t); splitInto(h2, t); });
$$('.sec').forEach(sec => {
  sec.classList.add('animar'); let n = 0;
  sec.querySelectorAll('.sec-head > :not(h2), .cards > *, .feats > *, .stats > *, .spec-tabs, .spec-grid > *, .spec-pills, .place, #vip-form > *, .gt-colors, .gt-chips, .xr-log').forEach(el => {
    el.classList.add('fx-up'); el.style.setProperty('--i', String(n++ % 8));
  });
});
$$('.hero-info > *, .hero-stage').forEach((el, n) => { el.classList.add('fx-up'); el.style.setProperty('--i', String(n)); });
const fxIO = new IntersectionObserver((items, obs) => items.forEach(it => {
  if (!it.isIntersecting) return; it.target.classList.add('run'); obs.unobserve(it.target);
}), { threshold: .2 });
$$('.animar').forEach(b => fxIO.observe(b));
document.addEventListener('animationend', e => { if (e.target.classList.contains('fx-up')) e.target.classList.remove('fx-up'); }, true);
var heroSeen = false;

})();
