/* ===========================================================
   Mark Scheiber — Site interactions
   - Lenis smooth scroll
   - GSAP + ScrollTrigger reveals & parallax
   - Animated prism canvas backdrop (Pink Floyd inspired)
   - Card 3D tilt on pointer
   =========================================================== */

document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- Smooth scroll (Lenis ↔ GSAP) ---------- */
gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
  duration: 1.05,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  wheelMultiplier: 1.1,
  touchMultiplier: 1.5,
});
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

/* ---------- Hero entrance ---------- */
const heroTl = gsap.timeline({ defaults:{ ease:'power3.out' } });
heroTl
  .to('.hero .eyebrow.reveal', { opacity:1, y:0, duration:.8 })
  .to('.hero-title .line.reveal', { opacity:1, y:0, duration:1.1, stagger:.12 }, '-=.4')
  .to('.hero-sub.reveal', { opacity:1, y:0, duration:.9 }, '-=.6')
  .to('.hero-actions.reveal', { opacity:1, y:0, duration:.8 }, '-=.6')
  .to('.hero-photo-wrap.reveal', { opacity:1, y:0, duration:1.0 }, '-=.9');

/* ---------- Section reveals ---------- */
gsap.utils.toArray('.section-head').forEach(el => {
  gsap.from(el.children, {
    scrollTrigger:{ trigger:el, start:'top 80%' },
    opacity:0, y:50, duration:1, stagger:.12, ease:'power3.out'
  });
});

gsap.utils.toArray('.card').forEach((el,i) => {
  gsap.from(el, {
    scrollTrigger:{ trigger:el, start:'top 85%' },
    opacity:0, y:60, duration:1, delay:i*.08, ease:'power3.out'
  });
});

gsap.utils.toArray('.work-item').forEach((el,i) => {
  gsap.from(el, {
    scrollTrigger:{ trigger:el, start:'top 88%' },
    opacity:0, y:80, duration:1.1, delay:i*.1, ease:'power3.out'
  });
});

gsap.from('.about-lead', {
  scrollTrigger:{ trigger:'.about', start:'top 75%' },
  opacity:0, y:40, duration:1, ease:'power3.out'
});
gsap.from('.about-stats div', {
  scrollTrigger:{ trigger:'.about-stats', start:'top 80%' },
  opacity:0, y:40, duration:.9, stagger:.12, ease:'power3.out'
});

gsap.from('.contact-inner > *', {
  scrollTrigger:{ trigger:'.contact', start:'top 75%' },
  opacity:0, y:50, duration:1, stagger:.1, ease:'power3.out'
});

/* ---------- Parallax on work thumbs ---------- */
gsap.utils.toArray('.work-thumb').forEach(el => {
  gsap.to(el, {
    yPercent:-12,
    ease:'none',
    scrollTrigger:{ trigger:el, start:'top bottom', end:'bottom top', scrub:true }
  });
});

/* ---------- 3D card tilt ---------- */
document.querySelectorAll('[data-tilt]').forEach(card => {
  const max = 8;
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    gsap.to(card, { rotateY:x*max, rotateX:-y*max, transformPerspective:800, duration:.5, ease:'power2.out' });
  });
  card.addEventListener('mouseleave', () => {
    gsap.to(card, { rotateX:0, rotateY:0, duration:.7, ease:'power3.out' });
  });
});

/* ===========================================================
   PRISM CANVAS — animated refracted-light backdrop
   Drifting glowing orbs with additive blending = prism vibe
   =========================================================== */
const canvas = document.getElementById('prism-canvas');
const ctx = canvas.getContext('2d');
let W, H, DPR;

function resize(){
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = canvas.width  = innerWidth  * DPR;
  H = canvas.height = innerHeight * DPR;
  canvas.style.width = innerWidth+'px';
  canvas.style.height = innerHeight+'px';
}
addEventListener('resize', resize); resize();

const COLORS = ['#ff3ea5','#7a5cff','#28e0ff','#9dff5b','#ffb547'];
const orbs = COLORS.map((c,i) => ({
  c,
  x: Math.random()*W,
  y: Math.random()*H,
  r: (innerWidth < 700 ? 260 : 520) * DPR,
  vx: (Math.random()-.5)*.4,
  vy: (Math.random()-.5)*.4,
  phase: Math.random()*Math.PI*2
}));

let mouseX = W/2, mouseY = H/2;
addEventListener('mousemove', e => { mouseX = e.clientX*DPR; mouseY = e.clientY*DPR; });

function draw(t){
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = 'rgba(7,6,13,1)';
  ctx.fillRect(0,0,W,H);

  ctx.globalCompositeOperation = 'lighter';
  orbs.forEach((o,i) => {
    o.phase += .003;
    o.x += o.vx + Math.sin(o.phase)*.3;
    o.y += o.vy + Math.cos(o.phase)*.3;
    // gentle attraction to mouse
    o.x += (mouseX - o.x) * .0008;
    o.y += (mouseY - o.y) * .0008;
    if(o.x < -o.r) o.x = W+o.r; if(o.x > W+o.r) o.x = -o.r;
    if(o.y < -o.r) o.y = H+o.r; if(o.y > H+o.r) o.y = -o.r;

    const g = ctx.createRadialGradient(o.x,o.y,0,o.x,o.y,o.r);
    g.addColorStop(0, hexA(o.c,.55));
    g.addColorStop(.4, hexA(o.c,.18));
    g.addColorStop(1, hexA(o.c,0));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(o.x,o.y,o.r,0,Math.PI*2); ctx.fill();
  });

  requestAnimationFrame(draw);
}
function hexA(hex,a){
  const n = parseInt(hex.slice(1),16);
  return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})`;
}
requestAnimationFrame(draw);

/* ===========================================================
   GRAND TETONS — voxel mountain range builds as you scroll
   Set VOXEL_ENABLED = true to re-enable.
   =========================================================== */
const VOXEL_ENABLED = false;
// Jagged silhouette of the Teton range — 20w x 30h.
// Peaks (left → right): Teewinot, Mt Owen, Grand Teton (tallest),
// Middle Teton, South Teton, settling into forested valley floor.
const PIXEL_ART = [
  "..............#.............", // 0  Grand Teton summit
  ".............###............", // 1
  ".............###............", // 2
  "............#####...........", // 3
  "......#.....#####....#......", // 4  Middle & South tips emerge
  ".....##....#######...##.....", // 5
  ".....###...#######..###.....", // 6
  "....####..#########.####....", // 7
  "....####..#########.####....", // 8
  "...#####..#########.#####...", // 9
  "...######.##########.#####..", // 10
  "..######.###########.######.", // 11
  "..#######.###########.######", // 12
  ".########.############.#####", // 13
  ".########.############.#####", // 14
  ".###########################", // 15  saddles fill in
  "############################", // 16  ridges merge
  "############################", // 17  talus / scree
  "############################", // 18
  "############################", // 19
  "############################", // 20  tree line
  "############################", // 21
  "############################", // 22  forested base
  "############################", // 23
  "############################", // 24
  "############################", // 25
  "############################", // 26
  "############################", // 27
  "############################", // 28
  "############################", // 29  valley floor
];
const GRID_W = 28, GRID_H = 30, DEPTH = 3;

const legoCanvas = document.createElement('canvas');
legoCanvas.id = 'lego-canvas';
if(VOXEL_ENABLED) document.body.appendChild(legoCanvas);
const lctx = legoCanvas.getContext('2d');

const TILE_W = 7, TILE_H = 3.5, BLOCK_H = 7;
const CANVAS_CSS_W = 480, CANVAS_CSS_H = 560;
let LDPR;
function resizeLego(){
  LDPR = Math.min(devicePixelRatio||1, 2);
  legoCanvas.width  = CANVAS_CSS_W * LDPR;
  legoCanvas.height = CANVAS_CSS_H * LDPR;
  legoCanvas.style.width  = CANVAS_CSS_W+'px';
  legoCanvas.style.height = CANVAS_CSS_H+'px';
}
resizeLego();
addEventListener('resize', resizeLego);

function colorForRow(r){
  if(r >= 22) return '#2f6b3a'; // forested valley floor
  if(r >= 17) return '#5a6f55'; // tree line
  if(r >= 13) return '#6b7480'; // talus / lower rock
  if(r >= 8)  return '#8a93a0'; // mid rock face
  if(r >= 4)  return '#cfd6e0'; // upper rock / patchy snow
  return '#ffffff';             // snowy summits
}

const voxels = [];
for(let row=0; row<GRID_H; row++){
  for(let col=0; col<GRID_W; col++){
    if(PIXEL_ART[row][col] === '#'){
      for(let z=0; z<DEPTH; z++){
        voxels.push({
          x: col,
          yWorld: (GRID_H - 1 - row),
          z,
          row,
          color: colorForRow(row),
        });
      }
    }
  }
}

// Compute centroid for centering in canvas
let _minX=Infinity,_maxX=-Infinity,_minY=Infinity,_maxY=-Infinity;
voxels.forEach(v => {
  if(v.x < _minX) _minX = v.x; if(v.x > _maxX) _maxX = v.x;
  if(v.yWorld < _minY) _minY = v.yWorld; if(v.yWorld > _maxY) _maxY = v.yWorld;
});
const CX = (_minX + _maxX) / 2;
const CY = (_minY + _maxY) / 2;

// Build order: bottom rows first, back-to-front, center-out
const buildOrder = [...voxels].sort((a,b) => {
  if(b.row !== a.row) return b.row - a.row;
  if(a.z !== b.z) return a.z - b.z;
  return Math.abs(a.x - (GRID_W-1)/2) - Math.abs(b.x - (GRID_W-1)/2);
});
buildOrder.forEach((v,i) => v.buildIdx = i);

// Render order: back-to-front painter's algorithm
const renderOrder = [...voxels].sort((a,b) => {
  if(b.z !== a.z) return b.z - a.z;          // back z first
  if(b.yWorld !== a.yWorld) return b.yWorld - a.yWorld; // top first
  return a.x - b.x;                          // left first
});

function project(x,y,z){
  const ox = (CANVAS_CSS_W * 0.5) * LDPR;
  const oy = (CANVAS_CSS_H * 0.5) * LDPR;
  return {
    sx: ox + (x - z - CX + (DEPTH-1)/2) * TILE_W * LDPR,
    sy: oy + (x + z - CX - (DEPTH-1)/2) * TILE_H * LDPR - (y - CY) * BLOCK_H * LDPR
  };
}

function shade(hex, amt){
  const n = parseInt(hex.slice(1),16);
  let r = (n>>16)&255, g = (n>>8)&255, b = n&255;
  if(amt >= 0){ r += (255-r)*amt; g += (255-g)*amt; b += (255-b)*amt; }
  else { r *= 1+amt; g *= 1+amt; b *= 1+amt; }
  return `rgb(${r|0},${g|0},${b|0})`;
}

function drawVoxel(v, t){
  const ease = t < 1 ? 1 - Math.pow(1-t,3) : 1;
  const dropY = (1 - ease) * 60 * LDPR;
  const scale = 0.35 + 0.65 * ease;
  const alpha = ease;

  const p = project(v.x, v.yWorld, v.z);
  const cx = p.sx;
  const cy = p.sy - dropY;
  const w  = TILE_W * LDPR * scale;
  const h  = TILE_H * LDPR * scale;
  const bh = BLOCK_H * LDPR * scale;

  lctx.globalAlpha = alpha;

  const c = v.color;
  const top   = shade(c, 0.05);
  const left  = shade(c, -0.30);
  const right = shade(c, -0.50);

  // top diamond
  lctx.fillStyle = top;
  lctx.beginPath();
  lctx.moveTo(cx, cy - h);
  lctx.lineTo(cx + w, cy);
  lctx.lineTo(cx, cy + h);
  lctx.lineTo(cx - w, cy);
  lctx.closePath();
  lctx.fill();
  lctx.strokeStyle = 'rgba(0,0,0,.45)';
  lctx.lineWidth = 1 * LDPR;
  lctx.stroke();

  // left face
  lctx.fillStyle = left;
  lctx.beginPath();
  lctx.moveTo(cx - w, cy);
  lctx.lineTo(cx, cy + h);
  lctx.lineTo(cx, cy + h + bh);
  lctx.lineTo(cx - w, cy + bh);
  lctx.closePath();
  lctx.fill();
  lctx.stroke();

  // right face
  lctx.fillStyle = right;
  lctx.beginPath();
  lctx.moveTo(cx, cy + h);
  lctx.lineTo(cx + w, cy);
  lctx.lineTo(cx + w, cy + bh);
  lctx.lineTo(cx, cy + h + bh);
  lctx.closePath();
  lctx.fill();
  lctx.stroke();

  // lego stud on top
  lctx.fillStyle = shade(c, 0.25);
  lctx.beginPath();
  lctx.ellipse(cx, cy - h*0.15, w*0.32, h*0.32, 0, 0, Math.PI*2);
  lctx.fill();

  lctx.globalAlpha = 1;
}

let visibleCount = 0;
const animStart = new WeakMap();

function updateLegoProgress(){
  const docH = document.documentElement.scrollHeight - innerHeight;
  const prog = docH > 0 ? Math.min(1, Math.max(0, scrollY / docH)) : 0;
  const target = Math.round(prog * voxels.length);
  if(target > visibleCount){
    for(let i=visibleCount;i<target;i++) animStart.set(buildOrder[i], performance.now());
  }
  visibleCount = target;
}
if(VOXEL_ENABLED){
  addEventListener('scroll', updateLegoProgress, { passive:true });
  lenis.on('scroll', updateLegoProgress);
}

function renderLego(now){
  lctx.clearRect(0,0,legoCanvas.width,legoCanvas.height);
  for(const v of renderOrder){
    if(v.buildIdx >= visibleCount) continue;
    const start = animStart.get(v) || 0;
    const t = Math.min(1, (now - start) / 500);
    drawVoxel(v, t);
  }
  requestAnimationFrame(renderLego);
}
if(VOXEL_ENABLED){
  requestAnimationFrame(renderLego);
  updateLegoProgress();
}

/* ===========================================================
   STICK MEN — Link-style sword fight drifting across the nav
   =========================================================== */
(function stickMenFight() {
  const stickMen = document.querySelector('.stick-men');
  if (!stickMen) return;

  const sm1SA = document.getElementById('sm1-sword-arm');
  const sm1BA = document.getElementById('sm1-l-arm');
  const sm1LL = document.getElementById('sm1-l-leg');
  const sm1RL = document.getElementById('sm1-r-leg');
  const sm2SA = document.getElementById('sm2-sword-arm');
  const sm2BA = document.getElementById('sm2-r-arm');
  const sm2LL = document.getElementById('sm2-l-leg');
  const sm2RL = document.getElementById('sm2-r-leg');

  if (!sm1SA || !sm2SA) return;

  const SH = '14 15'; // shoulder — SVG origin for arm rotation
  const HP = '14 24'; // hip     — SVG origin for leg rotation

  // Leg walk cycle — opposing phase between front/back leg
  gsap.to([sm1LL, sm2LL], {
    rotation: 22, svgOrigin: HP, duration: 0.30,
    repeat: -1, yoyo: true, ease: 'power1.inOut'
  });
  gsap.to([sm1RL, sm2RL], {
    rotation: -22, svgOrigin: HP, duration: 0.30,
    repeat: -1, yoyo: true, ease: 'power1.inOut', delay: 0.30
  });

  // Back arm — combat sway for balance
  gsap.to(sm1BA, { rotation: -13, svgOrigin: SH, duration: 0.62, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  gsap.to(sm2BA, { rotation:  13, svgOrigin: SH, duration: 0.62, repeat: -1, yoyo: true, ease: 'sine.inOut' });

  function getMaxX() {
    const nav      = document.querySelector('.nav');
    const navLinks = document.querySelector('.nav > nav');
    const bg       = document.querySelector('.brand-group');
    if (!nav || !navLinks || !bg) return 260;
    return Math.max(80, nav.offsetWidth - bg.offsetWidth - navLinks.offsetWidth - 90);
  }

  const STEP = 14;
  let posX = 0, exchNum = 0;

  function exchange() {
    const maxX = getMaxX();

    if (posX >= maxX - STEP) {
      // Sprint off-screen right, snap back to start
      gsap.to(stickMen, {
        x: posX + 100, duration: 0.38, ease: 'power2.in',
        onComplete: () => {
          posX = 0; exchNum = 0;
          gsap.set(stickMen, { x: 0 });
          gsap.delayedCall(0.12, exchange);
        }
      });
      return;
    }

    const tl = gsap.timeline({ onComplete: exchange });
    const type = exchNum % 4;

    if (type === 0) {
      // Man 1 direct slash → man 2 blocks
      tl.to(sm1SA, { rotation:  46, svgOrigin: SH, duration: 0.16, ease: 'power4.out' })
        .to(sm2SA, { rotation:  24, svgOrigin: SH, duration: 0.14, ease: 'power2.out' }, '-=0.04')
        .to([sm1SA, sm2SA], { rotation: 0, duration: 0.28, ease: 'back.out(1.6)' }, '+=0.04')
        .to(stickMen, { x: `+=${STEP}`, duration: 0.36, ease: 'power1.inOut' }, '-=0.30');

    } else if (type === 1) {
      // Man 2 overhead strike → man 1 parries up
      tl.to(sm2SA, { rotation: -52, svgOrigin: SH, duration: 0.16, ease: 'power4.out' })
        .to(sm1SA, { rotation: -22, svgOrigin: SH, duration: 0.14, ease: 'power2.out' }, '-=0.04')
        .to([sm1SA, sm2SA], { rotation: 0, duration: 0.28, ease: 'back.out(1.6)' }, '+=0.04')
        .to(stickMen, { x: `+=${STEP}`, duration: 0.36, ease: 'power1.inOut' }, '-=0.30');

    } else if (type === 2) {
      // Feint: man 1 fakes high, pulls, then commits low
      tl.to(sm1SA, { rotation: 20, svgOrigin: SH, duration: 0.10, ease: 'power3.out' })
        .to(sm1SA, { rotation:  7, svgOrigin: SH, duration: 0.09, ease: 'power2.in' })
        .to(sm1SA, { rotation: 58, svgOrigin: SH, duration: 0.14, ease: 'power4.out' })
        .to(sm2SA, { rotation: 26, svgOrigin: SH, duration: 0.13, ease: 'power2.out' }, '-=0.07')
        .to([sm1SA, sm2SA], { rotation: 0, duration: 0.30, ease: 'back.out(1.5)' }, '+=0.04')
        .to(stickMen, { x: `+=${STEP}`, duration: 0.36, ease: 'power1.inOut' }, '-=0.26');

    } else {
      // Simultaneous clash — both strike at once, elastic spring-back
      tl.to(sm1SA, { rotation:  44, svgOrigin: SH, duration: 0.15, ease: 'power4.out' })
        .to(sm2SA, { rotation: -48, svgOrigin: SH, duration: 0.15, ease: 'power4.out' }, '<')
        .to([sm1SA, sm2SA], { rotation: 0, duration: 0.34, ease: 'elastic.out(1.3, 0.38)' }, '+=0.02')
        .to(stickMen, { x: `+=${STEP}`, duration: 0.40, ease: 'power1.inOut' }, '-=0.36');
    }

    posX  += STEP;
    exchNum++;
  }

  // Start after the hero entrance settles
  gsap.delayedCall(1.2, exchange);
})();
