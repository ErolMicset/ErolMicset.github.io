/* lzflow.js - the animation "DRS <-> LZ <-> device". One file for every page: <div data-lzflow></div>.
   First the device is the Olympus PLC; after one round (write the Led, read the Button, read the Analog value) the PLC is
   replaced by drQEmu, to show the same panel works with no PLC connected. Only the wire in use is drawn, grey, with one arrow at the end the packet goes to.
   A packet has two rows: what it means (top) and the real text line on the wire (bottom). The LZ line is plain text:
   a write is "Name:value" with no answer, a read asks "Name:" and the answer is "Name:value"; each line ends with Enter. */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TARGETS = {
    plc: { name: 'Olympus PLC', sub: 'a real controller on the desk' },
    emu: { name: 'drQEmu', sub: 'an emulated ESP32, no hardware' }
  };
  var CAPS = {
    plc: 'The panel talks to the Olympus PLC. Each tag has its own wire; a write has no answer, a read is answered with the value. The line can be a serial port or Bluetooth Low Energy.',
    emu: 'No PLC connected: the same panel talks to an emulated board in drQEmu. Nothing changes in the panel.'
  };

  var css = document.createElement('style');
  css.textContent =
    '.lzf{background:#141a26;border:1px solid rgba(255,255,255,.09);border-radius:18px;padding:16px;box-shadow:0 1px 2px rgba(13,20,36,.05),0 10px 28px rgba(13,20,36,.07)}' +
    '.lzf svg{display:block;width:100%;height:auto;max-width:960px;margin:0 auto}' +
    '.lzf .lzc{font-size:13px;color:#a6adba;font-weight:600;margin:10px 4px 0;text-align:center}';
  document.head.appendChild(css);

  function el(name, attrs, parent, text) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text !== undefined) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  var FONT = 'system-ui,Segoe UI,sans-serif', MONO = 'ui-monospace,Consolas,Menlo,monospace';
  function label(parent, x, y, size, weight, fill, text, anchor, font) {
    var t = el('text', { x: x, y: y, 'font-size': size, 'font-weight': weight, fill: fill, 'font-family': font || FONT, 'text-anchor': anchor || 'middle' }, parent, text);
    if (/DRS|LZ|Olympus|PLC|drQEmu|ESP32/.test(text)) { t.setAttribute('translate', 'no'); t.setAttribute('class', 'notranslate'); }
    return t;
  }

  function build(host) {
    var target = 'plc';
    var timer = 0, gen = 0, led = false, button = false, analog = 2048;

    host.className = 'lzf';
    host.innerHTML = '';
    var svg = el('svg', { viewBox: '0 0 960 270', role: 'img', 'aria-label': 'DRS talks to a device through the LZ protocol, a plain text line per tag. DRS writes the Led, reads the Button and reads the Analog value. The device is first an Olympus PLC, then a drQEmu emulated ESP32.' });
    host.appendChild(svg);
    var cap = document.createElement('p'); cap.className = 'lzc'; cap.textContent = CAPS.plc;
    host.appendChild(cap);

    /* left: DRS */
    var gl = el('g', {}, svg);
    el('rect', { x: 16, y: 30, width: 250, height: 210, rx: 14, fill: '#1f2837', stroke: '#566277', 'stroke-width': 1.5 }, gl);
    label(gl, 141, 58, 18, 700, '#e8eaf0', 'DRS');
    label(gl, 141, 76, 12, 400, '#a6adba', 'LZ tags in the panel');
    var rows = [['Led', 112], ['Button', 164], ['Analog', 216]];
    rows.forEach(function (r) { el('rect', { x: 34, y: r[1] - 22, width: 214, height: 40, rx: 8, fill: '#2a3446', stroke: '#3a4252' }, gl); label(gl, 48, r[1] + 3, 14, 600, '#e8eaf0', r[0], 'start'); });
    var lLed = el('circle', { cx: 222, cy: 112, r: 9, fill: '#4a5162', stroke: '#8a96ad' }, gl);
    var lBtn = label(gl, 232, 169, 13, 700, '#a6adba', 'up', 'end');
    var lAna = label(gl, 232, 221, 14, 700, '#e8eaf0', '2048', 'end');

    /* middle: the LZ line. Every tag has its own straight cable; only the one in use is drawn */
    var gm = el('g', {}, svg);
    label(gm, 480, 52, 20, 800, '#e8eaf0', 'LZ');
    label(gm, 480, 70, 12, 400, '#a6adba', 'plain text, one line per tag');
    function pathD(pts) { return 'M' + pts.map(function (p) { return p[0] + ' ' + p[1]; }).join(' L'); }
    function reqPts(i) { var y = rows[i][1]; return [[266, y], [694, y]]; }   /* one straight cable per tag: sender and receiver are on the same level */
    function ansPts(i) { var y = rows[i][1]; return [[694, y], [266, y]]; }
    var WIRE = '#a3abbb';
    var wire = el('path', { d: '', stroke: WIRE, 'stroke-width': 3, fill: 'none', 'stroke-linejoin': 'round', opacity: 0 }, gm);
    var arrow = el('path', { d: 'M-8 -9 L4 0 L-8 9', stroke: WIRE, 'stroke-width': 3.4, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0 }, gm);
    function showWire(pts, dir) {   /* dir 1 = to the device, -1 = back to DRS; one arrow, at the end the packet goes to */
      wire.setAttribute('d', pathD(pts)); wire.setAttribute('opacity', 1);
      var end = pts[pts.length - 1], x = end[0] - dir * 14;
      arrow.setAttribute('transform', 'translate(' + (dir > 0 ? x - 2 : x + 2) + ',' + end[1] + ') scale(' + dir + ',1)'); arrow.setAttribute('opacity', 1);
    }
    function hideWire() { wire.setAttribute('opacity', 0); arrow.setAttribute('opacity', 0); }

    /* right: device (drawn again when the target changes) */
    var gr = el('g', { style: 'transition:opacity .45s' }, svg), rLed, rBtn, rAna;
    function drawTarget() {
      gr.textContent = '';
      var t = TARGETS[target];
      el('rect', { x: 694, y: 30, width: 250, height: 210, rx: 14, fill: '#1b251f', stroke: '#5c7a62', 'stroke-width': 1.5 }, gr);
      label(gr, 819, 58, 18, 700, '#e8eaf0', t.name);
      label(gr, 819, 76, 12, 400, '#a6adba', t.sub);
      rows.forEach(function (r) { el('rect', { x: 712, y: r[1] - 22, width: 214, height: 40, rx: 8, fill: '#2a3446', stroke: '#38473c' }, gr); label(gr, 726, r[1] + 3, 14, 600, '#e8eaf0', r[0], 'start'); });
      rLed = el('circle', { cx: 900, cy: 112, r: 9, fill: led ? '#f2b630' : '#4a5162', stroke: '#8a96ad' }, gr);
      rBtn = label(gr, 910, 169, 13, 700, '#a6adba', button ? 'down' : 'up', 'end');
      rAna = label(gr, 910, 221, 14, 700, '#e8eaf0', String(analog), 'end');
    }
    drawTarget();

    /* the packet: top row = what it means, bottom row = the text line on the wire */
    var pk = el('g', { opacity: 0 }, svg);
    el('rect', { x: -75, y: -22, width: 150, height: 23, rx: 7, fill: '#b7791a', stroke: '#fff', 'stroke-width': 1.2 }, pk);
    el('rect', { x: -75, y: 1, width: 150, height: 23, rx: 7, fill: '#2f7d4a', stroke: '#fff', 'stroke-width': 1.2 }, pk);
    var pt1 = label(pk, 0, -6, 12, 700, '#fff', '');
    var pt2 = label(pk, -9, 17, 12.5, 700, '#fff', '', 'middle', MONO);
    el('path', { d: 'M66 6 V14 H55 M59 10 L55 14 L59 18', stroke: '#fff', 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, pk);   /* Enter: every line ends with the line end */
    function along(pts, k) {   /* point at fraction k of the polyline's length */
      var len = [], total = 0, i;
      for (i = 1; i < pts.length; i++) { var l = Math.abs(pts[i][0] - pts[i - 1][0]) + Math.abs(pts[i][1] - pts[i - 1][1]); len.push(l); total += l; }
      var d = k * total;
      for (i = 0; i < len.length; i++) {
        if (d <= len[i] || i === len.length - 1) { var f = len[i] ? Math.min(1, d / len[i]) : 1; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f]; }
        d -= len[i];
      }
    }
    function send(texts, pts, done) {
      pt1.textContent = texts[0]; pt2.textContent = texts[1];
      if (reduce) { done(); return; }
      var elapsed = 0, last = null, hold = 0, held = false, dur = 1500, g = gen;   /* quick; stops half way so the packet can be read */
      pk.setAttribute('opacity', 1);
      function frame(ts) {
        if (g !== gen) return;
        if (last === null) last = ts;
        var dt = ts - last; last = ts;
        if (hold > 0) hold -= dt; else elapsed += dt;
        var k = Math.min(1, elapsed / dur);
        if (!held && k >= 0.5) { k = 0.5; elapsed = dur * 0.5; held = true; hold = 1400; }
        var p = along(pts, k);
        pk.setAttribute('transform', 'translate(' + p[0] + ',' + p[1] + ')');
        if (k < 1) requestAnimationFrame(frame); else { pk.setAttribute('opacity', 0); done(); }
      }
      requestAnimationFrame(frame);
    }
    function after(ms, f) { var g = gen; timer = setTimeout(function () { if (g === gen) f(); }, reduce ? 0 : ms); }

    function paint() {
      lLed.setAttribute('fill', led ? '#f2b630' : '#4a5162'); if (rLed) rLed.setAttribute('fill', led ? '#f2b630' : '#4a5162');
      lBtn.textContent = button ? 'down' : 'up'; if (rBtn) rBtn.textContent = button ? 'down' : 'up';
      lAna.textContent = String(analog); if (rAna) rAna.textContent = String(analog);
    }
    /* row i: the request runs on that tag's wire; the device acts; a read is answered on the same row, a write is not */
    function move(i, request, act, answer, hold, next) {
      showWire(reqPts(i), 1);
      send(request, reqPts(i), function () {
        hideWire(); act();
        if (!answer) { paint(); after(hold, next); return; }
        showWire(ansPts(i), -1);
        send(answer(), ansPts(i), function () { hideWire(); paint(); after(hold, next); });
      });
    }
    function writeLed(next) {
      led = !led;
      move(0, ['write Led = ' + (led ? 'on' : 'off'), 'Led:' + (led ? 1 : 0)], function () { if (rLed) rLed.setAttribute('fill', led ? '#f2b630' : '#4a5162'); }, null, 900, next);
    }
    function readButton(next) {
      move(1, ['read Button', 'Button:'], function () { button = !button; if (rBtn) rBtn.textContent = button ? 'down' : 'up'; },
        function () { return [button ? 'Button = down' : 'Button = up', 'Button:' + (button ? 1 : 0)]; }, 500, next);
    }
    function readAnalog(next) {
      move(2, ['read Analog', 'Analog:'], function () { analog = Math.round(200 + Math.random() * 3600); if (rAna) rAna.textContent = String(analog); },
        function () { return ['Analog = ' + analog, 'Analog:' + analog]; }, 700, next);
    }
    /* one round with the device on the line, then the PLC is replaced by the emulation (and back) */
    function swap(next) {
      gr.style.opacity = 0;
      after(600, function () {
        target = target === 'plc' ? 'emu' : 'plc';
        drawTarget(); cap.textContent = CAPS[target]; gr.style.opacity = 1;
        after(1100, next);
      });
    }
    function round() { writeLed(function () { readButton(function () { readAnalog(function () { swap(round); }); }); }); }
    if (reduce) { led = true; button = true; analog = 2048; paint(); return; }

    /* run only while the picture is on the screen */
    if ('IntersectionObserver' in window) {
      var running = false;
      new IntersectionObserver(function (en) {
        var on = en[0].isIntersecting;
        if (on && !running) { running = true; round(); }
        else if (!on && running) { running = false; gen++; clearTimeout(timer); pk.setAttribute('opacity', 0); hideWire(); }
      }, { threshold: 0.3 }).observe(host);
    } else round();
  }

  function init() { Array.prototype.forEach.call(document.querySelectorAll('[data-lzflow]'), build); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
