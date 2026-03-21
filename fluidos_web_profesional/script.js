
const g = 9.81;

function fmt(n, digits = 3) {
  if (!isFinite(n)) return '—';
  const abs = Math.abs(n);
  if ((abs >= 1e5) || (abs > 0 && abs < 1e-3)) return n.toExponential(3);
  return n.toLocaleString('es-CO', { maximumFractionDigits: digits });
}

function byId(id) { return document.getElementById(id); }
function num(id) { return parseFloat(byId(id).value); }

function calcRe() {
  const rho = num('re-rho');
  const mu = num('re-mu');
  const D = num('re-d');
  const V = num('re-v');
  const out = byId('re-output');

  if ([rho, mu, D, V].some(v => !isFinite(v) || v <= 0)) {
    out.className = 'output bad';
    out.innerHTML = '<strong>Error:</strong> todos los datos deben ser positivos y válidos.';
    return;
  }

  const Re = rho * V * D / mu;
  let cls = 'ok';
  let regime = 'Laminar';
  if (Re < 2300) { regime = 'Laminar'; cls = 'ok'; }
  else if (Re <= 4000) { regime = 'Transición'; cls = 'warn'; }
  else { regime = 'Turbulento'; cls = 'bad'; }

  out.className = `output ${cls}`;
  out.innerHTML = `
    <p><strong>Resultado:</strong> Re = ${fmt(Re, 2)}</p>
    <p><strong>Clasificación:</strong> ${regime}</p>
    <p class="muted">Criterio usado: laminar &lt; 2300, transición 2300–4000, turbulento &gt; 4000.</p>
  `;
}

function calcPoiseuille() {
  const mu = num('poi-mu');
  const L = num('poi-l');
  const R = num('poi-r');
  const Q = num('poi-q');
  const out = byId('poi-output');

  if ([mu, L, R, Q].some(v => !isFinite(v) || v <= 0)) {
    out.className = 'output bad';
    out.innerHTML = '<strong>Error:</strong> todos los datos deben ser positivos y válidos.';
    return;
  }

  const dP = 8 * mu * L * Q / (Math.PI * R**4);
  out.className = 'output ok';
  out.innerHTML = `
    <p><strong>Resultado:</strong> ΔP = ${fmt(dP, 2)} Pa = ${fmt(dP/1000, 3)} kPa</p>
    <p><strong>Observación:</strong> la sensibilidad al radio es muy alta, porque ΔP ∝ 1/R⁴ para Q fijo.</p>
  `;
}

function calcStokes() {
  const rhoP = num('st-rhop');
  const rhoF = num('st-rhof');
  const mu = num('st-mu');
  const D = num('st-d');
  const out = byId('st-output');

  if ([rhoP, rhoF, mu, D].some(v => !isFinite(v) || v <= 0)) {
    out.className = 'output bad';
    out.innerHTML = '<strong>Error:</strong> todos los datos deben ser positivos y válidos.';
    return;
  }

  const r = D / 2;
  const vt = 2 * r**2 * (rhoP - rhoF) * g / (9 * mu);
  const ReP = rhoF * vt * D / mu;
  const valid = ReP < 0.1;

  out.className = `output ${valid ? 'ok' : (ReP < 1 ? 'warn' : 'bad')}`;
  out.innerHTML = `
    <p><strong>Velocidad terminal:</strong> v<sub>t</sub> = ${fmt(vt, 6)} m/s</p>
    <p><strong>Reynolds de partícula:</strong> Re<sub>p</sub> = ${fmt(ReP, 5)}</p>
    <p><strong>Validez de Stokes:</strong> ${valid ? '<span class="good">Sí, Re<sub>p</sub> ≪ 1</span>' : '<span class="bad-txt">No se cumple claramente Re<sub>p</sub> ≪ 1</span>'}</p>
  `;
}

function drawAxes(ctx, w, h, margin, xLabel, yLabel) {
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(margin.left, h - margin.bottom);
  ctx.lineTo(w - margin.right, h - margin.bottom);
  ctx.moveTo(margin.left, h - margin.bottom);
  ctx.lineTo(margin.left, margin.top);
  ctx.stroke();

  ctx.fillStyle = '#d6e6ff';
  ctx.font = '14px Inter, sans-serif';
  ctx.fillText(xLabel, w - margin.right + 8, h - margin.bottom + 5);
  ctx.save();
  ctx.translate(margin.left - 40, margin.top - 10);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(yLabel, 0, 0);
  ctx.restore();
}

function drawGrid(ctx, w, h, margin, nx = 5, ny = 5) {
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  for (let i = 1; i <= nx; i++) {
    const x = margin.left + i * (w - margin.left - margin.right) / nx;
    ctx.beginPath(); ctx.moveTo(x, margin.top); ctx.lineTo(x, h - margin.bottom); ctx.stroke();
  }
  for (let j = 1; j <= ny; j++) {
    const y = margin.top + j * (h - margin.top - margin.bottom) / ny;
    ctx.beginPath(); ctx.moveTo(margin.left, y); ctx.lineTo(w - margin.right, y); ctx.stroke();
  }
}

function updateLabPoiseuille() {
  const R = parseFloat(byId('lab1-r').value);
  const mu = parseFloat(byId('lab1-mu').value);
  const dP = parseFloat(byId('lab1-dp').value);
  const L = parseFloat(byId('lab1-l').value);

  byId('lab1-r-val').textContent = R.toFixed(3);
  byId('lab1-mu-val').textContent = mu.toFixed(3);
  byId('lab1-dp-val').textContent = Math.round(dP).toString();
  byId('lab1-l-val').textContent = L.toFixed(1);

  const Q = Math.PI * R**4 * dP / (8 * mu * L);
  const umax = dP * R**2 / (4 * mu * L);
  const uavg = Q / (Math.PI * R**2);

  byId('lab1-results').innerHTML = `
    <p><strong>Caudal:</strong> ${fmt(Q, 6)} m³/s</p>
    <p><strong>Velocidad máxima:</strong> ${fmt(umax, 4)} m/s</p>
    <p><strong>Velocidad media:</strong> ${fmt(uavg, 4)} m/s</p>
    <p class="muted">En flujo laminar plenamente desarrollado, u<sub>máx</sub> = 2ū.</p>
  `;

  const canvas = byId('lab1-canvas');
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const m = { left: 70, right: 40, top: 35, bottom: 45 };
  ctx.clearRect(0, 0, w, h);
  drawGrid(ctx, w, h, m, 6, 6);
  drawAxes(ctx, w, h, m, 'r', 'u(r) [m/s]');

  // ticks and labels
  ctx.fillStyle = '#b7c7df'; ctx.font = '13px Inter, sans-serif';
  for (let i = 0; i <= 6; i++) {
    const x = m.left + i * (w - m.left - m.right) / 6;
    const rv = -R + 2 * R * i / 6;
    ctx.fillText(fmt(rv, 3), x - 14, h - m.bottom + 20);
  }
  for (let j = 0; j <= 5; j++) {
    const y = h - m.bottom - j * (h - m.top - m.bottom) / 5;
    const uv = umax * j / 5;
    ctx.fillText(fmt(uv, 3), 16, y + 4);
  }

  // plot parabola using x as radial position from -R to R, y as u(r)
  ctx.beginPath();
  const plotW = w - m.left - m.right;
  const plotH = h - m.top - m.bottom;
  for (let i = 0; i <= 200; i++) {
    const rr = -R + 2 * R * i / 200;
    const u = (dP / (4 * mu * L)) * (R**2 - rr**2);
    const x = m.left + (rr + R) / (2 * R) * plotW;
    const y = h - m.bottom - (u / umax) * plotH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = '#5ec6ff'; ctx.lineWidth = 4; ctx.stroke();

  // fill under curve softly
  ctx.lineTo(m.left + plotW, h - m.bottom);
  ctx.lineTo(m.left, h - m.bottom);
  ctx.closePath();
  ctx.fillStyle = 'rgba(94,198,255,0.14)';
  ctx.fill();

  // center line
  const xc = m.left + plotW / 2;
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.setLineDash([7,7]);
  ctx.beginPath(); ctx.moveTo(xc, m.top); ctx.lineTo(xc, h - m.bottom); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#d6e6ff';
  ctx.fillText('uₘₐₓ', xc + 8, m.top + 10);
}

function updateLabStokes() {
  const D_um = parseFloat(byId('lab2-d').value);
  const mu = parseFloat(byId('lab2-mu').value);
  const rhoP = parseFloat(byId('lab2-rhop').value);
  const hDrop = parseFloat(byId('lab2-h').value);
  const rhoF = 997;
  const D = D_um * 1e-6;
  const r = D / 2;
  const vt = 2 * r**2 * (rhoP - rhoF) * g / (9 * mu);
  const ReP = rhoF * vt * D / mu;
  const t = vt > 0 ? hDrop / vt : Infinity;

  byId('lab2-d-val').textContent = D_um.toFixed(0);
  byId('lab2-mu-val').textContent = mu.toFixed(4);
  byId('lab2-rhop-val').textContent = rhoP.toFixed(0);
  byId('lab2-h-val').textContent = hDrop.toFixed(2);

  let validity = '<span class="good">Zona muy favorable para Stokes (Re<sub>p</sub> &lt; 0.1)</span>';
  if (ReP >= 0.1 && ReP < 1) validity = '<span class="warn-txt">Zona límite: revisar aplicabilidad</span>';
  if (ReP >= 1) validity = '<span class="bad-txt">Fuera del rango típico de Stokes</span>';

  byId('lab2-results').innerHTML = `
    <p><strong>Velocidad terminal:</strong> ${fmt(vt, 6)} m/s</p>
    <p><strong>Tiempo para caer ${fmt(hDrop,2)} m:</strong> ${isFinite(t) ? fmt(t, 3) + ' s' : '—'}</p>
    <p><strong>Reynolds de partícula:</strong> ${fmt(ReP, 6)}</p>
    <p><strong>Validez:</strong> ${validity}</p>
  `;

  const canvas = byId('lab2-canvas');
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const m = { left: 70, right: 40, top: 35, bottom: 45 };
  ctx.clearRect(0, 0, w, h);
  drawGrid(ctx, w, h, m, 5, 5);
  drawAxes(ctx, w, h, m, 'D [μm]', 'vₜ [m/s]');

  // compute curve for vt vs diameter using current mu and rhoP
  const Dmin = 5, Dmax = 500;
  let vmax = 0;
  const pts = [];
  for (let Dcur = Dmin; Dcur <= Dmax; Dcur += 5) {
    const d = Dcur * 1e-6;
    const rr = d / 2;
    const v = 2 * rr**2 * (rhoP - rhoF) * g / (9 * mu);
    pts.push({ Dcur, v });
    vmax = Math.max(vmax, v);
  }
  vmax = Math.max(vmax, 1e-8);

  ctx.fillStyle = '#b7c7df'; ctx.font = '13px Inter, sans-serif';
  for (let i = 0; i <= 5; i++) {
    const x = m.left + i * (w - m.left - m.right) / 5;
    const dv = Dmin + (Dmax - Dmin) * i / 5;
    ctx.fillText(fmt(dv, 0), x - 12, h - m.bottom + 20);
  }
  for (let j = 0; j <= 5; j++) {
    const y = h - m.bottom - j * (h - m.top - m.bottom) / 5;
    const vv = vmax * j / 5;
    ctx.fillText(fmt(vv, 4), 14, y + 4);
  }

  // line curve
  ctx.beginPath();
  pts.forEach((p, i) => {
    const x = m.left + (p.Dcur - Dmin) / (Dmax - Dmin) * (w - m.left - m.right);
    const y = h - m.bottom - (p.v / vmax) * (h - m.top - m.bottom);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = '#8b7dff'; ctx.lineWidth = 4; ctx.stroke();

  // current point
  const xp = m.left + (D_um - Dmin) / (Dmax - Dmin) * (w - m.left - m.right);
  const yp = h - m.bottom - (vt / vmax) * (h - m.top - m.bottom);
  ctx.fillStyle = '#ffc857';
  ctx.beginPath(); ctx.arc(xp, yp, 6, 0, Math.PI*2); ctx.fill();

  ctx.fillStyle = '#d6e6ff';
  ctx.fillText('Punto actual', Math.min(xp + 10, w - 130), Math.max(yp - 10, 30));
}

window.addEventListener('DOMContentLoaded', () => {
  calcRe();
  calcPoiseuille();
  calcStokes();
  updateLabPoiseuille();
  updateLabStokes();
  enhanceUI();
});

// init mutation observer after load so dynamically inserted math (React or other) is rendered
window.addEventListener('DOMContentLoaded', () => {
  if (window.katex) observeMathMutations();
});

// force immediate rendering of all equation elements when KaTeX is ready
function renderAllMathOnReady() {
  if (!window.katex) {
    setTimeout(renderAllMathOnReady, 100);
    return;
  }
  renderEquationsWithKaTeX();
  // add copy buttons
  document.querySelectorAll('.equation, .equation-block').forEach(el => {
    if (!el.querySelector('.copy-btn')) addCopyButtonTo(el);
  });
}

(function() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderAllMathOnReady);
  } else {
    setTimeout(renderAllMathOnReady, 50);
  }
})();

function createToast() {
  let t = document.createElement('div');
  t.className = 'toast';
  t.id = 'global-toast';
  document.body.appendChild(t);
  return t;
}

function showToast(msg, timeout = 1600) {
  let t = document.getElementById('global-toast') || createToast();
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('show'), timeout);
}

function copyTextToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((res, rej) => {
    try {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.left = '-9999px';
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
      res();
    } catch (e) { rej(e); }
  });
}

function addCopyButtonTo(node) {
  const btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'copy-btn'; btn.title = 'Copiar fórmula';
  btn.innerHTML = 'Copiar';
  btn.addEventListener('click', (ev) => {
    ev.stopPropagation();
    const txt = node.innerText.replace(/\s+/g,' ').trim();
    copyTextToClipboard(txt).then(() => showToast('Copiado al portapapeles')).catch(() => showToast('No se pudo copiar'));
  });
  node.appendChild(btn);
}

function enhanceUI() {
  // smooth scroll for internal nav links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href.length > 1) {
        const target = document.querySelector(href);
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); history.replaceState(null, '', href); }
      }
    });
  });

  // small keyboard accessibility for details/summary
  document.querySelectorAll('details summary').forEach(s => {
    s.setAttribute('tabindex', '0');
    s.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); s.parentElement.toggleAttribute('open'); } });
  });

  // attach canvas interactions
  attachLab1Interactions();
  attachLab2Interactions();

  // render math with KaTeX if available
  if (window.katex) renderEquationsWithKaTeX();

  // add copy buttons to equation blocks AFTER math rendering
  document.querySelectorAll('.equation, .equation-block').forEach(el => {
    if (!el.querySelector('.copy-btn')) addCopyButtonTo(el);
  });
}

function setSectionOpen(sectionId, open) {
  const sec = document.getElementById(sectionId);
  if (!sec) return;
  sec.querySelectorAll('details').forEach(d => {
    try { d.open = !!open; } catch (e) { if (open) d.setAttribute('open',''); else d.removeAttribute('open'); }
  });
}

function expandSection(sectionId) { setSectionOpen(sectionId, true); }
function collapseSection(sectionId) { setSectionOpen(sectionId, false); }

// convenience global handlers
window.expandSection = expandSection;
window.collapseSection = collapseSection;

/* --- KaTeX rendering helpers --- */
function texifyHTMLFragment(html) {
  let s = html;
  // preserve sub/sup by converting tags first
  s = s.replace(/<sub>(.*?)<\/sub>/g, '_{$1}');
  s = s.replace(/<sup>(.*?)<\/sup>/g, '^{ $1 }');

  // collapse tags to text
  s = s.replace(/<[^>]+>/g, '');
  s = s.replace(/\u00A0/g, ' ');

  // map unicode superscripts (² ³ ⁴ etc) to ^{n}
  const uniSup = { '²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9','⁰':'0' };
  Object.keys(uniSup).forEach(ch => { s = s.replace(new RegExp(ch,'g'), '^{' + uniSup[ch] + '}'); });

  // convert common symbols to TeX
  s = s.replace(/π/g,'\\pi').replace(/Δ/g,'\\Delta');
  s = s.replace(/ρ/g,'\\rho').replace(/μ/g,'\\mu').replace(/ν/g,'\\nu');

  // normalize whitespace
  s = s.replace(/\s+/g, ' ').trim();

  // if there's an equals sign, only attempt fraction-conversion on RHS
  if (s.includes('=')) {
    const parts = s.split('=');
    const lhs = parts.shift().trim();
    let rhs = parts.join('=').trim();
    // single slash -> fraction
    const slashCount = (rhs.match(/\//g) || []).length;
    if (slashCount === 1) {
      const [num, den] = rhs.split('/').map(p => p.trim());
      const n = num.replace(/^\(|\)$/g,'');
      let d = den.replace(/^\(|\)$/g,'');
      rhs = '\\frac{' + n + '}{' + d + '}';
    }
    return lhs + ' = ' + rhs;
  }

  // if no '=', still try a single fraction replacement
  const slashCount = (s.match(/\//g) || []).length;
  if (slashCount === 1) {
    const [num, den] = s.split('/').map(p => p.trim());
    const n = num.replace(/^\(|\)$/g,'');
    let d = den.replace(/^\(|\)$/g,'');
    return '\\frac{' + n + '}{' + d + '}';
  }

  return s;
}

function renderEquationsWithKaTeX() {
  document.querySelectorAll('.equation, .equation-block, .inline-eq').forEach(el => {
    try {
      // avoid double-rendering
      if (el.dataset.katexRendered) return;
      let tex = null;
      if (el.dataset && el.dataset.tex) tex = el.dataset.tex;
      else tex = texifyHTMLFragment(el.innerHTML || el.textContent || '');
      const display = el.classList.contains('equation-block');
      katex.render(tex, el, { throwOnError: false, displayMode: display });
      el.dataset.katexRendered = '1';
    } catch (e) { /* fail silently */ }
  });
}

// Observe dynamic additions to the DOM and render any new equation nodes
function observeMathMutations() {
  if (!window.MutationObserver) return;
  const observer = new MutationObserver(mutations => {
    let added = [];
    for (const m of mutations) {
      for (const n of m.addedNodes) {
        if (!(n instanceof Element)) continue;
        if (n.matches && (n.matches('.equation') || n.matches('.equation-block') || n.matches('.inline-eq'))) added.push(n);
        // also search inside subtree
        added.push(...Array.from(n.querySelectorAll ? n.querySelectorAll('.equation, .equation-block, .inline-eq') : []));
      }
    }
    if (added.length && window.katex) {
      added.forEach(el => {
        try {
          if (el.dataset.katexRendered) return;
          let tex = el.dataset && el.dataset.tex ? el.dataset.tex : texifyHTMLFragment(el.innerHTML || el.textContent || '');
          const display = el.classList.contains('equation-block');
          katex.render(tex, el, { throwOnError: false, displayMode: display });
          el.dataset.katexRendered = '1';
          if (!el.querySelector('.copy-btn')) addCopyButtonTo(el);
        } catch (e) { /* ignore */ }
      });
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

/* --- Canvas interactivity for labs --- */
function ensureCanvasTooltip() {
  let t = document.querySelector('.canvas-tooltip');
  if (!t) { t = document.createElement('div'); t.className = 'canvas-tooltip'; document.body.appendChild(t); }
  return t;
}

function attachLab1Interactions() {
  const canvas = byId('lab1-canvas'); if (!canvas) return;
  const tooltip = ensureCanvasTooltip();
  canvas.addEventListener('mousemove', (ev) => {
    const rect = canvas.getBoundingClientRect(); const x = ev.clientX - rect.left; const y = ev.clientY - rect.top;
    const R = parseFloat(byId('lab1-r').value);
    const mu = parseFloat(byId('lab1-mu').value);
    const dP = parseFloat(byId('lab1-dp').value);
    const L = parseFloat(byId('lab1-l').value);
    const m = { left: 70, right: 40, top: 35, bottom: 45 };
    const plotW = canvas.width - m.left - m.right;
    const plotH = canvas.height - m.top - m.bottom;
    if (x < m.left || x > m.left + plotW) { tooltip.style.display = 'none'; return; }
    const rr = -R + 2 * R * (x - m.left) / plotW;
    const umax = dP * R*R / (4 * mu * L);
    const u = (dP / (4 * mu * L)) * (R*R - rr*rr);
    tooltip.style.display = 'block'; tooltip.style.left = (ev.clientX) + 'px'; tooltip.style.top = (rect.top + y) + 'px';
    tooltip.innerHTML = `<strong>r:</strong> ${rr.toExponential(3)} m<br><strong>u(r):</strong> ${u.toExponential(3)} m/s`;
  });
  canvas.addEventListener('mouseleave', () => { const t = document.querySelector('.canvas-tooltip'); if (t) t.style.display = 'none'; });
}

function attachLab2Interactions() {
  const canvas = byId('lab2-canvas'); if (!canvas) return;
  const tooltip = ensureCanvasTooltip();
  canvas.addEventListener('mousemove', (ev) => {
    const rect = canvas.getBoundingClientRect(); const x = ev.clientX - rect.left; const y = ev.clientY - rect.top;
    const mu = parseFloat(byId('lab2-mu').value);
    const rhoP = parseFloat(byId('lab2-rhop').value);
    const rhoF = 997;
    const Dmin = 5, Dmax = 500;
    const m = { left: 70, right: 40, top: 35, bottom: 45 };
    const plotW = canvas.width - m.left - m.right;
    if (x < m.left || x > m.left + plotW) { tooltip.style.display = 'none'; return; }
    const Dcur = Dmin + (Dmax - Dmin) * (x - m.left) / plotW;
    const d = Dcur * 1e-6; const r = d/2;
    const v = 2 * r*r * (rhoP - rhoF) * g / (9 * mu);
    tooltip.style.display = 'block'; tooltip.style.left = (ev.clientX) + 'px'; tooltip.style.top = (rect.top + y) + 'px';
    tooltip.innerHTML = `<strong>D:</strong> ${Dcur.toFixed(0)} μm<br><strong>vₜ:</strong> ${v.toExponential(3)} m/s`;
  });
  canvas.addEventListener('mouseleave', () => { const t = document.querySelector('.canvas-tooltip'); if (t) t.style.display = 'none'; });
}
