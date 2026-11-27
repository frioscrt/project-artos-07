/* Tranh động và tiếng nền theo cảnh. Được nhúng thẳng vào trang khi dựng.
   Mỗi cảnh trong chương mang data-art và data-sound (xem scenes.json). */
(function () {
  var root = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- màu theo nền sáng/tối ---------- */
  var C = {};
  function readColors() {
    var cs = getComputedStyle(root);
    ['--bg', '--veil', '--ink', '--soft', '--line', '--lamp'].forEach(function (k) { C[k.slice(2)] = cs.getPropertyValue(k).trim(); });
    C.dark = (root.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')) === 'dark';
  }
  readColors();
  addEventListener('a07-theme', readColors);
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', readColors);

  function rgba(hex, a) {
    var h = hex.replace('#', '');
    if (h.length === 3) h = h.replace(/./g, '$&$&');
    var n = parseInt(h, 16);
    return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')';
  }
  function rnd(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }

  /* ---------- các tranh ---------- */
  // mỗi tranh: function(ctx, w, h, t, R) ; t = giây, R = số ngẫu nhiên cố định của tranh
  var ART = {};

  // Dưới đáy nước nhìn lên: vệt sáng mặt nước, tia nắng, bọt khí
  ART.water = function (g, w, h, t, R) {
    var deep = C.dark ? '#0b1416' : '#9fb0ad', top = C.dark ? '#2a4446' : '#dfe8e4';
    var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, top); gr.addColorStop(1, deep);
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    // tia sáng
    for (var i = 0; i < 5; i++) {
      var x = w * (0.15 + i * 0.18) + Math.sin(t * 0.3 + i) * w * 0.03;
      var a = 0.05 + 0.04 * Math.sin(t * 0.5 + i * 2);
      g.fillStyle = rgba(C.dark ? '#cfe3dc' : '#ffffff', a);
      g.beginPath(); g.moveTo(x - w * 0.02, 0); g.lineTo(x + w * 0.02, 0); g.lineTo(x + w * 0.09, h); g.lineTo(x - w * 0.05, h); g.fill();
    }
    // vân sáng mặt nước
    g.strokeStyle = rgba(C.dark ? '#d8ebe4' : '#ffffff', C.dark ? 0.22 : 0.5); g.lineWidth = Math.max(1, w / 500);
    for (var r = 0; r < 4; r++) {
      g.beginPath();
      for (var x2 = 0; x2 <= w; x2 += w / 60) {
        var y = h * (0.05 + r * 0.045) + Math.sin(x2 / w * 9 + t * (0.8 + r * 0.2) + r) * h * 0.012 + Math.sin(x2 / w * 23 - t * 1.3) * h * 0.006;
        x2 ? g.lineTo(x2, y) : g.moveTo(x2, y);
      }
      g.stroke();
    }
    // bọt khí
    g.fillStyle = rgba(C.dark ? '#d8ebe4' : '#ffffff', 0.35);
    for (var b = 0; b < 14; b++) {
      var bx = R[b] * w + Math.sin(t * 1.5 + b) * 4, sp = 0.04 + R[b + 20] * 0.06;
      var by = h - ((t * sp + R[b + 40]) % 1) * h * 1.1;
      g.beginPath(); g.arc(bx, by, 1 + R[b + 60] * w / 300, 0, 7); g.fill();
    }
  };

  // Hẻm buổi sáng đầu xuân: mái nhà, dây điện, nắng xiên, bụi lơ lửng
  ART.street = function (g, w, h, t, R) {
    var sky = C.dark ? ['#3b4a4a', '#6d6f5f'] : ['#dfe3dc', '#f1ead6'];
    var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, sky[0]); gr.addColorStop(1, sky[1]);
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    // nắng xiên
    var sun = g.createRadialGradient(w * 0.82, h * 0.18, 0, w * 0.82, h * 0.18, w * 0.6);
    sun.addColorStop(0, rgba(C.dark ? '#e6c991' : '#fff3cf', 0.55)); sun.addColorStop(1, rgba('#ffffff', 0));
    g.fillStyle = sun; g.fillRect(0, 0, w, h);
    // dãy nhà ống
    var house = C.dark ? '#1c2526' : '#7d8781';
    g.fillStyle = house;
    var x = 0, k = 0;
    while (x < w) {
      var bw = w * (0.07 + R[k] * 0.07), bh = h * (0.35 + R[k + 30] * 0.35);
      g.fillRect(x, h - bh, bw + 1, bh);
      if (R[k + 60] > 0.6) g.fillRect(x + bw * 0.2, h - bh - h * 0.05, bw * 0.15, h * 0.05); // bồn nước
      x += bw; k++;
    }
    // cửa sổ sáng
    g.fillStyle = rgba(C.dark ? '#d9b46e' : '#f6e7c2', C.dark ? 0.5 : 0.7);
    for (var i = 0; i < 18; i++) g.fillRect(R[i + 90] * w, h * (0.55 + R[i + 120] * 0.35), w / 90, h / 30);
    // cột và dây điện võng
    g.strokeStyle = house; g.lineWidth = Math.max(1, w / 450);
    var poles = [w * 0.12, w * 0.55, w * 0.98];
    poles.forEach(function (p) { g.fillRect(p, h * 0.22, w / 160, h); });
    for (var d = 0; d < 4; d++) {
      g.beginPath();
      for (var j = 0; j < poles.length - 1; j++) {
        var a = poles[j], b = poles[j + 1], y0 = h * (0.25 + d * 0.03), sag = h * (0.08 + d * 0.02) + Math.sin(t * 0.6 + d) * h * 0.004;
        g.moveTo(a, y0); g.quadraticCurveTo((a + b) / 2, y0 + sag * 2, b, y0);
      }
      g.stroke();
    }
    // bụi trong nắng
    g.fillStyle = rgba(C.dark ? '#f1dca8' : '#ffffff', 0.6);
    for (var m = 0; m < 22; m++) {
      var mx = (R[m + 150] * w + t * (6 + R[m] * 8)) % w, my = (R[m + 180] * h * 0.7 + Math.sin(t * 0.7 + m) * 8);
      g.globalAlpha = 0.3 + 0.5 * Math.abs(Math.sin(t * 0.8 + m));
      g.fillRect(mx, my, 1.5, 1.5);
    }
    g.globalAlpha = 1;
  };

  // Chập tối: quán nhỏ lần lượt bật đèn vàng
  ART.dusk = function (g, w, h, t, R) {
    var gr = g.createLinearGradient(0, 0, 0, h);
    if (C.dark) { gr.addColorStop(0, '#1d2a35'); gr.addColorStop(0.7, '#4a3f45'); gr.addColorStop(1, '#6b5240'); }
    else { gr.addColorStop(0, '#9aa7b0'); gr.addColorStop(0.7, '#d8c2b0'); gr.addColorStop(1, '#e9cfa6'); }
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    var house = C.dark ? '#121a1e' : '#4c5552';
    g.fillStyle = house;
    var x = -w * 0.02, k = 0, shops = [];
    while (x < w) {
      var bw = w * (0.08 + R[k] * 0.06), bh = h * (0.3 + R[k + 30] * 0.3);
      g.fillRect(x, h - bh, bw + 1, bh);
      if (R[k + 50] > 0.25) shops.push([x + bw * (0.18 + R[k + 80] * 0.2), h - h * (0.15 + R[k + 110] * 0.04), bw * (0.3 + R[k + 140] * 0.2), h * (0.08 + R[k + 170] * 0.03), k]);
      x += bw; k++;
    }
    // cửa sổ tầng trên, phần lớn còn tối
    for (var wi = 0; wi < 10; wi++) {
      g.fillStyle = rgba('#e9c27a', R[wi + 200] > 0.6 ? 0.55 : 0.08);
      g.fillRect(R[wi + 210] * w, h * (0.5 + R[wi + 220] * 0.2), w / 70, h / 22);
    }
    // đèn bật dần theo vòng lặp 14 giây
    var cyc = (t % 14) / 14;
    shops.forEach(function (s, i) {
      var on = cyc > (i / shops.length) * 0.7;
      var flick = on ? 0.85 + 0.15 * Math.sin(t * 7 + i * 3) * (R[i + 70] > 0.8 ? 1 : 0.1) : 0.08;
      var glow = g.createRadialGradient(s[0] + s[2] / 2, s[1] + s[3] / 2, 0, s[0] + s[2] / 2, s[1] + s[3] / 2, s[2] * 1.4);
      glow.addColorStop(0, rgba('#f2c26b', 0.55 * flick)); glow.addColorStop(1, rgba('#f2c26b', 0));
      g.fillStyle = glow; g.fillRect(s[0] - s[2], s[1] - s[2], s[2] * 3, s[3] + s[2] * 2);
      g.fillStyle = rgba('#f5cf86', 0.9 * flick); g.fillRect(s[0], s[1], s[2], s[3]);
      g.fillStyle = house; g.fillRect(s[0] - s[2] * 0.15, s[1] - h * 0.015, s[2] * 1.3, h * 0.015); // mái hiên
    });
    // mặt đường
    g.fillStyle = C.dark ? '#0d1316' : '#3f4643'; g.fillRect(0, h * 0.94, w, h * 0.06);
  };

  // Cây cầu trong mơ: sương trôi, mặt nước lặng
  ART.bridge = function (g, w, h, t, R) {
    var gr = g.createLinearGradient(0, 0, 0, h);
    if (C.dark) { gr.addColorStop(0, '#141d20'); gr.addColorStop(0.55, '#26343a'); gr.addColorStop(1, '#0f1719'); }
    else { gr.addColorStop(0, '#cfd6d3'); gr.addColorStop(0.55, '#e4e8e4'); gr.addColorStop(1, '#b9c3c0'); }
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    var line = C.dark ? '#0c1214' : '#56625f', wl = h * 0.62;
    function bridge(flip, alpha) {
      g.save(); g.globalAlpha = alpha;
      if (flip) { g.translate(0, wl * 2); g.scale(1, -1); }
      g.strokeStyle = line; g.fillStyle = line; g.lineWidth = Math.max(2, w / 160);
      g.beginPath(); g.moveTo(-w * 0.05, wl); g.quadraticCurveTo(w * 0.5, wl - h * 0.42, w * 1.05, wl); g.stroke();
      g.lineWidth = Math.max(1, w / 400);
      g.beginPath(); g.moveTo(-w * 0.05, wl - h * 0.06); g.quadraticCurveTo(w * 0.5, wl - h * 0.5, w * 1.05, wl - h * 0.06); g.stroke();
      for (var i = 1; i < 16; i++) {
        var u = i / 16, x = -w * 0.05 + u * w * 1.1, y = wl + (-h * 0.42) * 2 * u * (1 - u);
        g.fillRect(x, y - h * 0.08 - (u * (1 - u)) * 0, Math.max(1, w / 500), h * 0.08);
      }
      g.restore();
    }
    bridge(false, 1); bridge(true, 0.25);
    // gợn mặt nước
    g.strokeStyle = rgba(C.dark ? '#9fb3b0' : '#ffffff', 0.25); g.lineWidth = 1;
    for (var r = 0; r < 7; r++) {
      var y = wl + h * 0.04 + r * h * 0.045, off = Math.sin(t * 0.4 + r) * w * 0.05;
      g.beginPath(); g.moveTo(w * (0.2 + R[r] * 0.2) + off, y); g.lineTo(w * (0.55 + R[r + 10] * 0.3) + off, y); g.stroke();
    }
    // sương
    for (var f = 0; f < 5; f++) {
      var fy = h * (0.3 + f * 0.12), fx = ((t * (4 + f * 2) + R[f + 20] * w) % (w * 1.6)) - w * 0.3;
      var fg = g.createRadialGradient(fx, fy, 0, fx, fy, w * 0.35);
      fg.addColorStop(0, rgba(C.dark ? '#5f7375' : '#ffffff', C.dark ? 0.28 : 0.55)); fg.addColorStop(1, rgba('#ffffff', 0));
      g.fillStyle = fg; g.fillRect(0, 0, w, h);
    }
  };

  // Đồng hồ treo tường: tích, tích, rồi tiếng thứ ba đến chậm
  ART.clock = function (g, w, h, t, R) {
    var gr = g.createLinearGradient(0, 0, w, h);
    if (C.dark) { gr.addColorStop(0, '#2b3436'); gr.addColorStop(1, '#151c1e'); } else { gr.addColorStop(0, '#eef0ea'); gr.addColorStop(1, '#c9d0cb'); }
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    // ánh sáng nhợt từ cửa sổ
    g.fillStyle = rgba(C.dark ? '#c7d3cf' : '#ffffff', C.dark ? 0.06 : 0.45);
    g.beginPath(); g.moveTo(0, 0); g.lineTo(w * 0.28, 0); g.lineTo(w * 0.6, h); g.lineTo(w * 0.18, h); g.fill();
    var cx = w * 0.62, cy = h * 0.5, r = Math.min(w, h) * 0.34, ink = C.dark ? '#d5d0c3' : '#2a3131';
    g.fillStyle = C.dark ? '#1b2325' : '#f4f4ef'; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill();
    g.strokeStyle = ink; g.lineWidth = Math.max(1.5, r / 30); g.stroke();
    for (var i = 0; i < 60; i++) {
      var a = i / 60 * Math.PI * 2, l = i % 5 ? r * 0.06 : r * 0.13;
      g.lineWidth = i % 5 ? 1 : Math.max(1.5, r / 50);
      g.beginPath(); g.moveTo(cx + Math.sin(a) * (r * 0.9), cy - Math.cos(a) * (r * 0.9)); g.lineTo(cx + Math.sin(a) * (r * 0.9 - l), cy - Math.cos(a) * (r * 0.9 - l)); g.stroke();
    }
    function hand(frac, len, wid) { var a = frac * Math.PI * 2; g.lineWidth = wid; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.sin(a) * len, cy - Math.cos(a) * len); g.stroke(); }
    hand(6.1 / 12, r * 0.5, Math.max(2, r / 16)); hand(0.12, r * 0.75, Math.max(1.5, r / 24));
    // kim giây: chu kỳ 3 nhịp, nhịp thứ ba trễ (1s, 1s, 1.6s)
    var cyc = t % 3.6, step = cyc < 1 ? 0 : cyc < 2 ? 1 : cyc < 3.6 ? 2 : 3;
    var base = Math.floor(t / 3.6) * 3, sec = (base + step) % 60;
    g.strokeStyle = C.lamp; hand(sec / 60, r * 0.82, 1);
    g.fillStyle = C.lamp; g.beginPath(); g.arc(cx, cy, Math.max(2, r / 20), 0, 7); g.fill();
  };

  // Băng ghế đá trước thư viện, nắng xế chiều, bóng ghế kéo dài
  ART.bench = function (g, w, h, t, R) {
    var gr = g.createLinearGradient(0, 0, 0, h);
    if (C.dark) { gr.addColorStop(0, '#3d3a32'); gr.addColorStop(1, '#22231f'); } else { gr.addColorStop(0, '#efe3c8'); gr.addColorStop(1, '#d4c4a2'); }
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    // nền gạch
    g.strokeStyle = rgba(C.dark ? '#000000' : '#8a7a5c', 0.25); g.lineWidth = 1;
    for (var y = h * 0.45; y < h; y += h * 0.07) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    for (var x = -h; x < w + h; x += w * 0.08) { g.beginPath(); g.moveTo(x, h * 0.45); g.lineTo(x - h * 0.4, h); g.stroke(); }
    // bóng ghế dài xiên
    var shade = rgba(C.dark ? '#000000' : '#5b4b33', C.dark ? 0.45 : 0.28);
    var benchCol = C.dark ? '#5d5a52' : '#8f8a7e';
    for (var b = 0; b < 3; b++) {
      var bx = w * (0.08 + b * 0.32), by = h * 0.58 + b * h * 0.02, bw = w * 0.2;
      g.fillStyle = shade;
      g.beginPath(); g.moveTo(bx, by + h * 0.08); g.lineTo(bx + bw, by + h * 0.08); g.lineTo(bx + bw + w * 0.22, by + h * 0.3); g.lineTo(bx + w * 0.22, by + h * 0.3); g.fill();
      g.fillStyle = benchCol;
      g.fillRect(bx, by, bw, h * 0.035);
      g.fillRect(bx + bw * 0.08, by, w * 0.012, h * 0.08); g.fillRect(bx + bw * 0.88, by, w * 0.012, h * 0.08);
    }
    // lon nước trên ghế giữa
    g.fillStyle = C.dark ? '#a9b7b4' : '#6f7f7c'; g.fillRect(w * 0.47, h * 0.6 - h * 0.06, w * 0.014, h * 0.06);
    // vệt nắng trườn dần khỏi mặt sân
    var sweep = (t * 0.02) % 1;
    var lg = g.createLinearGradient(0, 0, w, h);
    lg.addColorStop(Math.max(0, sweep - 0.25), rgba('#fff2cc', 0)); lg.addColorStop(sweep, rgba('#fff2cc', C.dark ? 0.12 : 0.3)); lg.addColorStop(Math.min(1, sweep + 0.25), rgba('#fff2cc', 0));
    g.fillStyle = lg; g.fillRect(0, 0, w, h);
    // lá rơi
    g.fillStyle = C.dark ? '#8a7a4c' : '#a08848';
    for (var l = 0; l < 6; l++) {
      var lx = (R[l] * w + Math.sin(t * 0.8 + l) * 20 + t * 5) % w, ly = ((t * (0.04 + R[l + 10] * 0.03) + R[l + 20]) % 1) * h;
      g.save(); g.translate(lx, ly); g.rotate(t + l); g.fillRect(-3, -1.5, 6, 3); g.restore();
    }
  };

  /* ---------- tranh cho các chương ở làng (chèn vào fx.js khi dựng) ----------
     Tên tranh có thể kèm biến thể sau dấu ":", ví dụ "fields:night:wall". */
  var SKYP = {
    dark: { night: ['#0a1216', '#1b2a30'], dawn: ['#28343c', '#6d6c60'], day: ['#34474e', '#77816f'], noon: ['#5c6463', '#9b8f72'], dusk: ['#1d2a35', '#6b5240'] },
    light: { night: ['#9aa7ad', '#c7cfcb'], dawn: ['#d3dbd8', '#efe5cf'], day: ['#d5e0de', '#eef0e3'], noon: ['#f1efe4', '#f8eed2'], dusk: ['#9aa7b0', '#e9cfa6'] }
  };
  function sil(tod) { return C.dark ? (tod === 'noon' ? '#2a2f2c' : tod === 'night' ? '#060b0d' : '#141c1e') : (tod === 'night' ? '#4a5652' : tod === 'noon' ? '#8c8a78' : '#6b7672'); }
  function sky(g, w, h, tod, y1) {
    var p = SKYP[C.dark ? 'dark' : 'light'][tod] || SKYP.dark.night, gr = g.createLinearGradient(0, 0, 0, h * (y1 || 1));
    gr.addColorStop(0, p[0]); gr.addColorStop(1, p[1]); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  }
  function hills(g, w, h, y, amp, col, k) {
    g.fillStyle = col; g.beginPath(); g.moveTo(0, h);
    for (var x = 0; x <= w; x += w / 40) g.lineTo(x, y - amp * (0.5 + 0.5 * Math.sin(x / w * (3 + k) + k * 2) * Math.sin(x / w * 7 + k)));
    g.lineTo(w, h); g.fill();
  }
  // bụi tre: thân cong vút ra hai bên, lá nhỏ rủ dọc nửa trên mỗi thân, đung đưa
  function bamboo(g, x, base, ht, col, t, k) {
    g.strokeStyle = col; g.fillStyle = col; g.lineCap = 'round';
    for (var i = 0; i < 9; i++) {
      var side = (i - 4) / 4, lean = side * ht * 0.55, sw = Math.sin(t * 0.6 + i * 0.7 + k) * ht * 0.04 * (0.5 + Math.abs(side));
      var tx = x + lean + sw, ty = base - ht * (1 - Math.abs(side) * 0.35), cx = x + side * ht * 0.08, cy = base - ht * 0.75;
      g.lineWidth = Math.max(1, ht / 90);
      g.beginPath(); g.moveTo(x + side * ht * 0.04, base); g.quadraticCurveTo(cx, cy, tx, ty); g.stroke();
      for (var l = 0; l < 7; l++) {
        var u = 0.45 + l * 0.08, px = (1 - u) * (1 - u) * (x + side * ht * 0.04) + 2 * (1 - u) * u * cx + u * u * tx, py = (1 - u) * (1 - u) * base + 2 * (1 - u) * u * cy + u * u * ty;
        var ang = (side >= 0 ? 0.5 : Math.PI - 0.5) + Math.sin(t + l + i) * 0.15 + (l % 2 ? 0.6 : -0.2);
        g.save(); g.translate(px, py); g.rotate(ang); g.beginPath(); g.ellipse(ht * 0.045, 0, ht * 0.05, ht * 0.009, 0, 0, 7); g.fill(); g.restore();
      }
    }
  }
  function hut(g, x, base, wd, col, lit, t) {
    g.fillStyle = col;
    g.fillRect(x, base - wd * 0.42, wd, wd * 0.42);
    g.beginPath(); g.moveTo(x - wd * 0.14, base - wd * 0.4); g.lineTo(x + wd * 0.18, base - wd * 0.78); g.lineTo(x + wd * 0.82, base - wd * 0.78); g.lineTo(x + wd * 1.14, base - wd * 0.4); g.fill();
    if (lit) {
      var f = 0.75 + 0.25 * Math.sin(t * 6) * Math.sin(t * 2.3);
      var gl = g.createRadialGradient(x + wd * 0.5, base - wd * 0.15, 0, x + wd * 0.5, base - wd * 0.15, wd * 0.7);
      gl.addColorStop(0, rgba('#f0b25c', 0.35 * f)); gl.addColorStop(1, rgba('#f0b25c', 0)); g.fillStyle = gl; g.fillRect(x - wd, base - wd, wd * 3, wd * 1.2);
      g.fillStyle = rgba('#f3c27a', 0.85 * f); g.fillRect(x + wd * 0.4, base - wd * 0.3, wd * 0.2, wd * 0.3);
    }
  }
  function moon(g, x, y, r, t) {
    var gl = g.createRadialGradient(x, y, 0, x, y, r * 5); gl.addColorStop(0, rgba(C.dark ? '#cdd6d2' : '#ffffff', C.dark ? 0.18 : 0.5)); gl.addColorStop(1, rgba('#ffffff', 0));
    g.fillStyle = gl; g.fillRect(x - r * 5, y - r * 5, r * 10, r * 10);
    g.fillStyle = C.dark ? '#d9ddd2' : '#ffffff'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
    g.fillStyle = SKYP[C.dark ? 'dark' : 'light'].night[0]; g.beginPath(); g.arc(x + r * 0.45, y - r * 0.15, r * 0.9, 0, 7); g.fill();
  }
  function clouds(g, w, h, t, a, R) {
    for (var c = 0; c < 4; c++) {
      var cx = ((t * (3 + c) + R[c + 100] * w) % (w * 1.6)) - w * 0.3, cy = h * (0.1 + c * 0.08);
      var cg = g.createRadialGradient(cx, cy, 0, cx, cy, w * 0.25);
      cg.addColorStop(0, rgba(C.dark ? '#33434a' : '#ffffff', a)); cg.addColorStop(1, rgba('#ffffff', 0));
      g.fillStyle = cg; g.fillRect(0, 0, w, h);
    }
  }
  function fog(g, w, h, t, y, a, R) {
    for (var f = 0; f < 3; f++) {
      var fx = ((t * (5 + f * 3) + R[f + 120] * w) % (w * 1.6)) - w * 0.3, fy = y + f * h * 0.05;
      var fg = g.createRadialGradient(fx, fy, 0, fx, fy, w * 0.4);
      fg.addColorStop(0, rgba(C.dark ? '#62767a' : '#ffffff', a)); fg.addColorStop(1, rgba('#ffffff', 0));
      g.fillStyle = fg; g.fillRect(0, 0, w, h);
    }
  }
  // làn khói mỏng uốn lên
  function wisp(g, x, y, len, t, col, a) {
    g.lineCap = 'round';
    for (var k = 0; k < 2; k++) {
      g.beginPath();
      for (var i = 0; i <= 24; i++) { var u = i / 24, yy = y - u * len, xx = x + Math.sin(u * 5 - t * 0.9 + k * 2) * len * 0.06 * (0.3 + u) + k * 4; i ? g.lineTo(xx, yy) : g.moveTo(xx, yy); }
      var gr = g.createLinearGradient(0, y, 0, y - len); gr.addColorStop(0, rgba(col, a)); gr.addColorStop(1, rgba(col, 0));
      g.strokeStyle = gr; g.lineWidth = 3 + k * 4; g.stroke();
    }
  }
  function paddies(g, w, h, y, tod) {
    var col = C.dark ? (tod === 'night' ? '#0d1719' : '#26352c') : (tod === 'night' ? '#7b8a84' : '#a9b897');
    g.fillStyle = col; g.fillRect(0, y, w, h - y);
    // bờ ruộng cong nhẹ, mặt nước loáng
    for (var i = 1; i < 8; i++) {
      var yy = y + (h - y) * Math.pow(i / 8, 1.7), a = i * 1.7;
      g.strokeStyle = rgba(C.dark ? '#000000' : '#5f6e5a', 0.35); g.lineWidth = 1 + i * 0.3;
      g.beginPath(); for (var x = 0; x <= w; x += w / 30) g.lineTo(x, yy + Math.sin(x / w * 5 + a) * (1 + i)); g.stroke();
      g.strokeStyle = rgba(C.dark ? '#7d9894' : '#ffffff', tod === 'night' ? 0.12 : 0.28); g.lineWidth = 1;
      g.beginPath(); g.moveTo(w * ((i * 0.37) % 0.7), yy + 3 + i); g.lineTo(w * ((i * 0.37) % 0.7) + w * 0.12, yy + 3 + i); g.stroke();
    }
  }
  function road(g, w, h, y, tod) {
    g.fillStyle = C.dark ? (tod === 'noon' ? '#6d5a44' : tod === 'night' ? '#1a2020' : '#4a463c') : (tod === 'noon' ? '#d8b98e' : '#b8ad97');
    g.beginPath(); g.moveTo(w * 0.47, y); g.lineTo(w * 0.53, y); g.lineTo(w * 0.78, h); g.lineTo(w * 0.22, h); g.fill();
  }
  // bức tường trong suốt ở rìa khu: một mặt kính mờ lấp lánh nơi chân trời
  function glassWall(g, w, h, y, t) {
    var x = w * 0.86;
    var gr = g.createLinearGradient(x - w * 0.03, 0, x + w * 0.03, 0);
    gr.addColorStop(0, rgba('#bfe6ee', 0)); gr.addColorStop(0.5, rgba('#bfe6ee', 0.16 + 0.06 * Math.sin(t * 1.3))); gr.addColorStop(1, rgba('#bfe6ee', 0));
    g.fillStyle = gr; g.fillRect(x - w * 0.03, 0, w * 0.06, y + h * 0.05);
    g.strokeStyle = rgba('#d8f4f8', 0.25); g.lineWidth = 1;
    var yy = (t * 20) % y; g.beginPath(); g.moveTo(x - 3, yy); g.lineTo(x + 3, yy - 8); g.stroke();
  }
  function opts(a) { return (a || '').split(':'); }

  ART.fields = function (g, w, h, t, R, o) {
    var tod = o[0] || 'night', hz = h * 0.55;
    sky(g, w, h, tod, 0.6);
    if (tod === 'night') { moon(g, w * 0.78, h * 0.18, h * 0.04, t); clouds(g, w, h, t, 0.35, R); }
    if (tod === 'noon') { var s = g.createRadialGradient(w * 0.5, -h * 0.1, 0, w * 0.5, -h * 0.1, w * 0.7); s.addColorStop(0, rgba('#fffbe8', 0.7)); s.addColorStop(1, rgba('#fffbe8', 0)); g.fillStyle = s; g.fillRect(0, 0, w, h); }
    hills(g, w, h, hz, h * 0.14, C.dark ? rgba(sil(tod), 0.7) : rgba(sil(tod), 0.45), 1);
    paddies(g, w, h, hz, tod);
    road(g, w, h, hz, tod);
    bamboo(g, w * 0.12, hz + h * 0.02, h * 0.42, sil(tod), t, 1);
    bamboo(g, w * 0.92, hz + h * 0.01, h * 0.3, sil(tod), t, 2);
    if (o.indexOf('wall') >= 0) glassWall(g, w, h, hz, t);
    if (o.indexOf('posts') >= 0) { g.fillStyle = sil(tod); g.fillRect(w * 0.41, hz + h * 0.02, w * 0.012, h * 0.12); g.beginPath(); g.arc(w * 0.416, hz + h * 0.015, w * 0.008, 0, 7); g.fill(); g.fillRect(w * 0.58, hz + h * 0.02, w * 0.012, h * 0.11); g.beginPath(); g.arc(w * 0.586, hz + h * 0.015, w * 0.008, 0, 7); g.fill(); }
    if (tod === 'dawn' || tod === 'night') fog(g, w, h, t, hz, tod === 'dawn' ? 0.45 : 0.2, R);
    if (tod === 'noon') { // hơi nóng bốc lên mặt đường
      g.fillStyle = rgba('#fff6dc', 0.08 + 0.05 * Math.sin(t * 3)); g.fillRect(0, hz - h * 0.02, w, h * 0.06);
    }
    if (tod === 'night') { g.fillStyle = rgba('#d9f0a0', 0.8); for (var f = 0; f < 6; f++) { g.globalAlpha = Math.max(0, Math.sin(t * 1.5 + f * 2)); g.fillRect(R[f + 140] * w, hz + R[f + 150] * h * 0.3, 2, 2); } g.globalAlpha = 1; }
  };

  ART.hut = function (g, w, h, t, R, o) {
    var tod = o[0] || 'night', hz = h * 0.62;
    sky(g, w, h, tod, 0.7);
    if (tod === 'night') { clouds(g, w, h, t, 0.4, R); }
    hills(g, w, h, hz - h * 0.05, h * 0.1, rgba(sil(tod), 0.5), 3);
    g.fillStyle = C.dark ? (tod === 'night' ? '#0f1517' : '#3a3b31') : '#c4b99c'; g.fillRect(0, hz, w, h - hz); // sân đất nện
    hut(g, w * 0.36, hz + h * 0.02, w * 0.3, sil(tod), tod === 'night', t);
    bamboo(g, w * 0.2, hz + h * 0.03, h * 0.5, sil(tod), t, 3);
    bamboo(g, w * 0.82, hz + h * 0.03, h * 0.38, sil(tod), t, 4);
    if (tod !== 'night') fog(g, w, h, t, hz, 0.25, R);
  };

  ART.well = function (g, w, h, t, R, o) {
    var tod = o[0] || 'night', hz = h * 0.66;
    sky(g, w, h, tod, 0.7);
    if (tod === 'night') moon(g, w * 0.2, h * 0.16, h * 0.035, t);
    var col = sil(tod);
    g.fillStyle = C.dark ? (tod === 'night' ? '#0e1416' : '#38392f') : '#c2b9a0'; g.fillRect(0, hz, w, h - hz);
    // cây đa: thân to, rễ phụ thõng xuống, tán rộng đung đưa
    g.fillStyle = col;
    g.beginPath(); g.moveTo(w * 0.6, hz); g.quadraticCurveTo(w * 0.63, hz - h * 0.25, w * 0.6, hz - h * 0.4); g.lineTo(w * 0.68, hz - h * 0.4); g.quadraticCurveTo(w * 0.66, hz - h * 0.2, w * 0.72, hz); g.fill();
    for (var c = 0; c < 9; c++) {
      var cx = w * (0.4 + c * 0.065) + Math.sin(t * 0.4 + c) * 3, cy = hz - h * (0.5 + 0.12 * Math.sin(c * 1.7));
      g.beginPath(); g.ellipse(cx, cy, w * 0.11, h * 0.13, 0, 0, 7); g.fill();
    }
    g.strokeStyle = col; g.lineWidth = 1;
    for (var r = 0; r < 14; r++) { var rx = w * (0.42 + R[r] * 0.45), sw = Math.sin(t * 0.6 + r) * 3; g.beginPath(); g.moveTo(rx, hz - h * 0.42); g.quadraticCurveTo(rx + sw, hz - h * 0.25, rx + sw * 1.5, hz - h * (0.1 + R[r + 20] * 0.18)); g.stroke(); }
    // giếng thành rêu
    g.fillStyle = C.dark ? '#26302d' : '#8d978a'; g.beginPath(); g.ellipse(w * 0.3, hz + h * 0.08, w * 0.09, h * 0.035, 0, 0, 7); g.fill();
    g.fillRect(w * 0.21, hz + h * 0.08, w * 0.18, h * 0.09);
    g.fillStyle = C.dark ? '#0a0f10' : '#4d5752'; g.beginPath(); g.ellipse(w * 0.3, hz + h * 0.08, w * 0.07, h * 0.022, 0, 0, 7); g.fill();
    g.fillStyle = C.dark ? '#26302d' : '#8d978a'; g.beginPath(); g.ellipse(w * 0.3, hz + h * 0.17, w * 0.09, h * 0.03, 0, 0, Math.PI); g.fill();
    if (tod === 'night') fog(g, w, h, t, hz, 0.18, R);
  };

  ART.riverhut = function (g, w, h, t, R, o) {
    var tod = o[0] || 'night', wl = h * 0.6;
    sky(g, w, h, tod, 0.6);
    if (tod === 'night') moon(g, w * 0.7, h * 0.15, h * 0.035, t);
    hills(g, w, h, wl, h * 0.08, rgba(sil(tod), 0.6), 5);
    var wg = g.createLinearGradient(0, wl, 0, h); wg.addColorStop(0, C.dark ? (tod === 'night' ? '#16242a' : '#3f5552') : '#b9cac6'); wg.addColorStop(1, C.dark ? '#0b1215' : '#93a6a1');
    g.fillStyle = wg; g.fillRect(0, wl, w, h - wl);
    g.strokeStyle = rgba(C.dark ? '#a9c0bc' : '#ffffff', 0.3); g.lineWidth = 1;
    for (var r = 0; r < 12; r++) { var y = wl + (h - wl) * (r + 1) / 13, off = ((t * (12 + r * 3) + R[r] * w) % (w * 1.3)) - w * 0.15; g.beginPath(); g.moveTo(off, y); g.lineTo(off + w * (0.05 + R[r + 30] * 0.1), y); g.stroke(); }
    // chòi trên cọc
    var col = sil(tod), x = w * 0.18, b = wl - h * 0.02;
    g.fillStyle = col; for (var p = 0; p < 4; p++) g.fillRect(x + p * w * 0.07, b, w * 0.008, h * 0.14);
    g.fillRect(x - w * 0.02, b - h * 0.02, w * 0.26, h * 0.025);
    g.fillRect(x, b - h * 0.16, w * 0.22, h * 0.14);
    g.beginPath(); g.moveTo(x - w * 0.04, b - h * 0.15); g.lineTo(x + w * 0.11, b - h * 0.3); g.lineTo(x + w * 0.26, b - h * 0.15); g.fill();
    if (tod === 'night') { g.fillStyle = rgba('#f3c27a', 0.6 + 0.2 * Math.sin(t * 5)); g.fillRect(x + w * 0.09, b - h * 0.11, w * 0.03, h * 0.06); }
    // tấm lưới phơi trên sào
    var nx = x + w * 0.3, ny = b - h * 0.16, nw = w * 0.14, nh = h * 0.13, sway = Math.sin(t * 0.8) * 3;
    g.strokeStyle = sil(tod); g.lineWidth = 2; g.beginPath(); g.moveTo(nx - 4, ny); g.lineTo(nx + nw + 4, ny); g.stroke();
    g.strokeStyle = rgba(C.dark ? '#7f8f8c' : '#56625f', 0.5); g.lineWidth = 1;
    for (var n = 0; n <= 7; n++) { g.beginPath(); g.moveTo(nx + n * nw / 7, ny); g.lineTo(nx + n * nw / 7 + sway, ny + nh); g.stroke(); }
    for (var m = 1; m <= 5; m++) { g.beginPath(); g.moveTo(nx + sway * m / 5, ny + m * nh / 5); g.lineTo(nx + nw + sway * m / 5, ny + m * nh / 5); g.stroke(); }
    fog(g, w, h, t, wl, tod === 'night' ? 0.2 : 0.3, R);
  };

  ART.map = function (g, w, h, t, R) {
    g.fillStyle = C.dark ? '#2a2620' : '#d9ccad'; g.fillRect(0, 0, w, h);
    var pg = g.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, w * 0.7); pg.addColorStop(0, rgba('#000000', 0)); pg.addColorStop(1, rgba('#000000', C.dark ? 0.5 : 0.25)); g.fillStyle = pg; g.fillRect(0, 0, w, h);
    var ink = C.dark ? '#b9a27a' : '#6b4a2a';
    g.strokeStyle = ink; g.lineWidth = 1.4; g.lineCap = 'round';
    function wob(x1, y1, x2, y2, k) { g.beginPath(); g.moveTo(x1, y1); for (var i = 1; i <= 12; i++) { var u = i / 12; g.lineTo(x1 + (x2 - x1) * u + Math.sin(u * 20 + k) * 2, y1 + (y2 - y1) * u + Math.cos(u * 17 + k) * 2); } g.stroke(); }
    wob(w * 0.38, h * 0.1, w * 0.36, h * 0.9, 1); wob(w * 0.64, h * 0.12, w * 0.66, h * 0.88, 2);
    // bó lúa, nhà, sông, vẽ kiểu tranh trẻ con
    g.beginPath(); for (var s = 0; s < 5; s++) { g.moveTo(w * (0.17 + s * 0.012), h * 0.62); g.lineTo(w * (0.15 + s * 0.02), h * 0.48); } g.stroke();
    g.beginPath(); g.moveTo(w * 0.47, h * 0.55); g.lineTo(w * 0.51, h * 0.47); g.lineTo(w * 0.55, h * 0.55); g.lineTo(w * 0.55, h * 0.63); g.lineTo(w * 0.47, h * 0.63); g.closePath(); g.stroke();
    g.beginPath(); for (var x = w * 0.7; x < w * 0.95; x += 4) g.lineTo(x, h * 0.55 + Math.sin(x / 9) * 4); g.stroke();
    g.globalAlpha = 0.25; g.fillStyle = ink; g.fillRect(w * 0.37, h * 0.12, w * 0.28, h * 0.76); g.fillRect(w * 0.66, h * 0.12, w * 0.3, h * 0.76); g.globalAlpha = 1;
    // hòn sỏi chặn góc
    g.fillStyle = C.dark ? '#5b5a52' : '#8a877c'; g.beginPath(); g.ellipse(w * 0.9, h * 0.15, w * 0.035, h * 0.04, 0.3, 0, 7); g.fill();
  };

  ART.hearth = function (g, w, h, t, R, o) {
    var st = o[0] || 'warm', k = st === 'warm' ? 1 : st === 'low' ? 0.55 : 0.15;
    // dao động ánh lửa; "low" thì thỉnh thoảng chao mạnh
    var fl = 0.82 + 0.1 * Math.sin(t * 9) + 0.08 * Math.sin(t * 23);
    if (st === 'low') { var ph = (t % 6) / 6; if (ph > 0.75) fl *= 0.35 + 0.65 * Math.abs(Math.cos(ph * 40)); }
    g.fillStyle = C.dark ? '#0b0f10' : '#3d3a33'; g.fillRect(0, 0, w, h);
    var gl = g.createRadialGradient(w * 0.5, h * 0.82, 0, w * 0.5, h * 0.82, w * 0.75 * (0.6 + 0.4 * k));
    gl.addColorStop(0, rgba('#f0a650', 0.75 * k * fl)); gl.addColorStop(0.4, rgba('#8a4a24', 0.4 * k * fl)); gl.addColorStop(1, rgba('#000000', 0));
    g.fillStyle = gl; g.fillRect(0, 0, w, h);
    // vách đất
    g.strokeStyle = rgba('#000000', 0.25); for (var i = 0; i < 9; i++) { g.beginPath(); g.moveTo(0, h * (0.1 + i * 0.08) + R[i] * 4); g.lineTo(w, h * (0.1 + i * 0.08) + R[i + 9] * 4); g.stroke(); }
    // bóng hai người ngồi in lên vách, mờ, co giãn theo lửa
    var sc = 1 + (1 - fl) * 0.5;
    g.save(); g.shadowColor = rgba('#000000', 0.45 * k + 0.15); g.shadowBlur = 18; g.shadowOffsetX = 10000; g.fillStyle = '#000';
    [[0.3, 1], [0.7, 0.9]].forEach(function (p) {
      var cx = w * p[0] - 10000, s = sc * p[1];
      g.beginPath(); g.ellipse(cx, h * 0.5 - h * 0.12 * s, w * 0.035 * s, h * 0.06 * s, 0, 0, 7); g.fill();
      g.beginPath(); g.moveTo(cx - w * 0.09 * s, h * 0.86); g.quadraticCurveTo(cx - w * 0.08 * s, h * 0.5 - h * 0.03 * s, cx, h * 0.5 - h * 0.05 * s); g.quadraticCurveTo(cx + w * 0.08 * s, h * 0.5 - h * 0.03 * s, cx + w * 0.09 * s, h * 0.86); g.fill();
    });
    g.restore();
    // bếp và lửa
    g.fillStyle = C.dark ? '#1a1412' : '#2a2420'; g.fillRect(w * 0.38, h * 0.86, w * 0.24, h * 0.14);
    if (st !== 'out') {
      for (var f = 0; f < 3; f++) {
        var fh = h * (0.16 - f * 0.03) * k * fl * (0.9 + 0.2 * Math.sin(t * 11 + f * 2));
        g.fillStyle = rgba(['#e8892f', '#f4b552', '#fde3a0'][f], 0.9);
        g.beginPath(); g.moveTo(w * (0.44 + f * 0.02), h * 0.88); g.quadraticCurveTo(w * 0.5 + Math.sin(t * 7 + f) * w * 0.012, h * 0.88 - fh * 1.6, w * (0.56 - f * 0.02), h * 0.88); g.fill();
      }
    } else {
      g.fillStyle = rgba('#d0612a', 0.5 + 0.3 * Math.sin(t * 2)); for (var e = 0; e < 7; e++) g.fillRect(w * (0.44 + R[e] * 0.12), h * (0.86 + R[e + 7] * 0.03), 2, 2);
      wisp(g, w * 0.5, h * 0.85, h * 0.6, t, C.dark ? '#7d8a88' : '#cccccc', 0.35);
    }
    // tàn lửa bay
    if (st !== 'out') { g.fillStyle = rgba('#ffcf7a', 0.8); for (var sp = 0; sp < 6 * k; sp++) { var py = h * 0.85 - ((t * (30 + R[sp + 40] * 20) + R[sp + 50] * 100) % (h * 0.5)); g.fillRect(w * 0.5 + Math.sin(t * 2 + sp) * w * 0.05, py, 1.5, 1.5); } }
  };

  ART.chains = function (g, w, h, t, R) {
    sky(g, w, h, 'night');
    g.fillStyle = rgba(C.dark ? '#000000' : '#3c4643', 0.25);
    var col = C.dark ? '#8f9a9a' : '#3a4442';
    for (var c = 0; c < 5; c++) {
      var x0 = w * (0.12 + c * 0.19), len = h * (0.5 + R[c] * 0.45), sw = Math.sin(t * (0.9 + c * 0.13) + c) * w * 0.02;
      g.strokeStyle = col; g.lineWidth = Math.max(1.2, w / 380);
      var n = Math.floor(len / (h * 0.045));
      for (var i = 0; i < n; i++) {
        var u = i / n, x = x0 + sw * u * u, y = -h * 0.02 + u * len;
        g.save(); g.translate(x, y); g.rotate(i % 2 ? 0 : Math.PI / 2 * 0 + sw * 0.002);
        g.beginPath(); if (i % 2) g.ellipse(0, 0, w * 0.004, h * 0.028, 0, 0, 7); else g.ellipse(0, 0, w * 0.009, h * 0.028, 0, 0, 7); g.stroke(); g.restore();
      }
      // vệt sáng lạnh chạy dọc xích
      var gy = ((t * 120 + c * 80) % (len + 200)) - 100;
      var gg = g.createRadialGradient(x0 + sw * 0.5, gy, 0, x0 + sw * 0.5, gy, h * 0.12); gg.addColorStop(0, rgba('#d9eef0', 0.25)); gg.addColorStop(1, rgba('#d9eef0', 0));
      g.fillStyle = gg; g.fillRect(x0 - h * 0.12, gy - h * 0.12, h * 0.24, h * 0.24);
    }
    bamboo(g, w * 0.05, h, h * 0.5, sil('night'), t, 7); bamboo(g, w * 0.97, h, h * 0.45, sil('night'), t, 8);
  };

  ART.helmet = function (g, w, h, t, R, o) {
    var tod = o[0] || 'dawn', hz = h * 0.42;
    sky(g, w, h, tod, 0.5);
    var gr = C.dark ? '#26312a' : '#a7b395'; g.fillStyle = gr; g.fillRect(0, hz, w, h - hz);
    // cỏ may đung đưa
    g.strokeStyle = C.dark ? '#4a5a48' : '#7f8c6c'; g.lineWidth = 1;
    for (var i = 0; i < 90; i++) { var x = R[i % 240] * w, b = hz + R[(i + 50) % 240] * (h - hz), ht = h * (0.06 + R[(i + 90) % 240] * 0.1), sw = Math.sin(t * 1.2 + i) * 4; g.beginPath(); g.moveTo(x, b); g.quadraticCurveTo(x + sw * 0.5, b - ht * 0.6, x + sw, b - ht); g.stroke(); }
    // mũ bảo hiểm xanh lá ngửa lên trời, đọng sương
    var hx = w * 0.56, hy = h * 0.72, hr = w * 0.09;
    g.fillStyle = C.dark ? '#2f6b45' : '#3f8a58'; g.beginPath(); g.ellipse(hx, hy, hr, hr * 0.45, -0.1, 0, Math.PI); g.fill();
    g.fillStyle = C.dark ? '#1c3f29' : '#2c6440'; g.beginPath(); g.ellipse(hx, hy, hr, hr * 0.28, -0.1, 0, 7); g.fill();
    g.fillStyle = rgba('#e8f4f0', 0.6 + 0.3 * Math.sin(t * 2)); g.beginPath(); g.arc(hx - hr * 0.3, hy - hr * 0.02, 1.6, 0, 7); g.arc(hx + hr * 0.2, hy + hr * 0.05, 1.2, 0, 7); g.fill();
    if (o.indexOf('fence') >= 0) { // hàng rào tre và chiếc nón lá
      g.fillStyle = C.dark ? '#3a3b30' : '#8f8668';
      for (var f = 0; f < 18; f++) g.fillRect(w * (0.02 + f * 0.022), hz - h * 0.2, w * 0.008, h * 0.32);
      g.fillRect(0, hz - h * 0.08, w * 0.42, h * 0.012);
      g.fillStyle = C.dark ? '#9c9270' : '#e2d6ae'; g.beginPath(); g.moveTo(w * 0.18, hz + h * 0.2); g.lineTo(w * 0.26, hz + h * 0.12); g.lineTo(w * 0.34, hz + h * 0.2); g.fill();
    }
    fog(g, w, h, t, hz, tod === 'dawn' ? 0.35 : 0.15, R);
  };

  ART.paddy = function (g, w, h, t, R, o) {
    var tod = o[0] || 'dawn', hz = h * 0.35;
    sky(g, w, h, tod, 0.4);
    hills(g, w, h, hz, h * 0.06, rgba(sil(tod), 0.5), 9);
    var wg = g.createLinearGradient(0, hz, 0, h); wg.addColorStop(0, C.dark ? '#3d4b46' : '#c9d4cc'); wg.addColorStop(1, C.dark ? '#18211f' : '#8f9d92');
    g.fillStyle = wg; g.fillRect(0, hz, w, h - hz);
    // mạ non
    g.strokeStyle = C.dark ? '#57704c' : '#6d8f55'; g.lineWidth = 1;
    for (var r = 0; r < 7; r++) for (var c = 0; c < 22; c++) { var y = hz + (h - hz) * Math.pow((r + 1) / 8, 1.4), x = (c + (r % 2) * 0.5) / 22 * w, s = 2 + r * 1.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x - s * 0.4, y - s); g.moveTo(x, y); g.lineTo(x + s * 0.4, y - s); g.stroke(); }
    // nón lá trôi lờ đờ và gợn nước quanh nó
    var nx = w * 0.62 + Math.sin(t * 0.25) * w * 0.03, ny = h * 0.7 + Math.sin(t * 0.6) * 2;
    for (var k = 0; k < 3; k++) { var rr = ((t * 0.4 + k / 3) % 1); g.strokeStyle = rgba(C.dark ? '#c9d6d2' : '#ffffff', 0.4 * (1 - rr)); g.beginPath(); g.ellipse(nx, ny, w * 0.05 + rr * w * 0.1, (w * 0.05 + rr * w * 0.1) * 0.25, 0, 0, 7); g.stroke(); }
    g.fillStyle = C.dark ? '#a49a76' : '#e6dab2'; g.beginPath(); g.ellipse(nx, ny, w * 0.055, w * 0.016, 0, 0, 7); g.fill();
    g.fillStyle = C.dark ? '#7f7658' : '#cbbd8f'; g.beginPath(); g.moveTo(nx - w * 0.05, ny); g.lineTo(nx, ny - w * 0.03); g.lineTo(nx + w * 0.05, ny); g.fill();
    fog(g, w, h, t, hz + h * 0.05, tod === 'dawn' ? 0.35 : 0.12, R);
  };

  ART.farm = function (g, w, h, t, R, o) {
    var tod = o[0] || 'day', hz = h * 0.6;
    sky(g, w, h, tod, 0.6);
    g.fillStyle = C.dark ? '#3a3a2e' : '#cdbf9a'; g.fillRect(0, hz, w, h - hz);
    var col = sil(tod);
    // kho lợp rạ
    for (var k = 0; k < 3; k++) { var x = w * (0.05 + k * 0.17), wd = w * 0.15; g.fillStyle = col; g.fillRect(x, hz - h * 0.14, wd, h * 0.14); g.beginPath(); g.moveTo(x - wd * 0.1, hz - h * 0.13); g.lineTo(x + wd * 0.5, hz - h * 0.3); g.lineTo(x + wd * 1.1, hz - h * 0.13); g.fill(); }
    // nong phơi thóc
    g.fillStyle = C.dark ? '#a88e48' : '#e2c069';
    for (var n = 0; n < 4; n++) { g.beginPath(); g.ellipse(w * (0.12 + n * 0.12), hz + h * 0.2, w * 0.05, h * 0.03, 0, 0, 7); g.fill(); }
    // guồng nước bằng gỗ, nửa dưới ngập trong mương, quay chậm
    var cx = w * 0.8, cy = hz + h * 0.14, r = h * 0.24, a0 = -t * 0.35, wood = C.dark ? '#6b604a' : '#5b4e36';
    g.fillStyle = C.dark ? '#2c3d40' : '#9db3b3'; g.fillRect(w * 0.6, hz + h * 0.2, w * 0.4, h * 0.12);
    g.strokeStyle = wood; g.lineWidth = Math.max(3, w / 130);
    g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke();
    g.lineWidth = Math.max(2, w / 220);
    for (var s = 0; s < 8; s++) { var a = a0 + s / 8 * Math.PI * 2; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); g.stroke(); }
    g.fillStyle = wood;
    for (var q = 0; q < 16; q++) { var b = a0 + q / 16 * Math.PI * 2; g.save(); g.translate(cx + Math.cos(b) * r, cy + Math.sin(b) * r); g.rotate(b); g.fillRect(-2, -h * 0.03, h * 0.05, h * 0.06); g.restore(); }
    g.beginPath(); g.arc(cx, cy, r * 0.12, 0, 7); g.fill();
    g.fillStyle = C.dark ? '#3a3528' : '#6f6248'; g.fillRect(cx - w * 0.006, cy - r * 0.1, w * 0.012, r * 1.3);
    // mặt nước che nửa dưới
    g.fillStyle = rgba(C.dark ? '#2c3d40' : '#9db3b3', 0.85); g.fillRect(w * 0.6, hz + h * 0.27, w * 0.4, h * 0.2);
    g.fillStyle = rgba('#d6eef0', 0.7); for (var d = 0; d < 7; d++) { var dy = ((t * 1.1 + d / 7) % 1); g.fillRect(cx - r * 0.9 + (d % 3) * 3, cy - r * 0.5 + dy * r * 0.8, 1.5, 3); }
  };

  ART.portal = function (g, w, h, t, R) {
    g.fillStyle = C.dark ? '#0d1416' : '#d9dfdc'; g.fillRect(0, 0, w, h);
    // khung cửa sáng lên từng nét như que diêm đi dọc theo đường vẽ
    var cyc = (t % 7) / 7, pr = Math.min(1, cyc / 0.6);
    var x = w * 0.42, y = h * 0.18, ww = w * 0.16, hh = h * 0.62;
    var pts = [[x, y + hh], [x, y], [x + ww, y], [x + ww, y + hh]], segs = 3;
    var ink = C.dark ? '#f3c27a' : '#a8641f';
    var inner = g.createLinearGradient(0, y, 0, y + hh); inner.addColorStop(0, rgba(C.dark ? '#f9f1dc' : '#ffffff', 0.12 + 0.5 * Math.max(0, pr - 0.8) * 5)); inner.addColorStop(1, rgba(C.dark ? '#f9f1dc' : '#ffffff', 0));
    g.fillStyle = inner; g.fillRect(x, y, ww, hh);
    g.strokeStyle = ink; g.lineWidth = Math.max(2, w / 220); g.lineCap = 'round'; g.shadowColor = ink; g.shadowBlur = 12;
    g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
    var done = pr * segs;
    for (var i = 0; i < segs; i++) { var u = Math.max(0, Math.min(1, done - i)); if (u <= 0) break; g.lineTo(pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u); }
    g.stroke(); g.shadowBlur = 0;
    if (pr < 1) { var i2 = Math.floor(done), u2 = done - i2, px = pts[i2][0] + (pts[Math.min(3, i2 + 1)][0] - pts[i2][0]) * u2, py = pts[i2][1] + (pts[Math.min(3, i2 + 1)][1] - pts[i2][1]) * u2; var sp = g.createRadialGradient(px, py, 0, px, py, 14); sp.addColorStop(0, rgba('#fff3cf', 0.9)); sp.addColorStop(1, rgba('#fff3cf', 0)); g.fillStyle = sp; g.fillRect(px - 14, py - 14, 28, 28); }
    g.strokeStyle = rgba(C.dark ? '#5d6c6c' : '#8a9592', 0.5); g.lineWidth = 1; g.beginPath(); g.moveTo(w * 0.25, y + hh); g.lineTo(w * 0.75, y + hh); g.stroke();
  };

  ART.clinic = function (g, w, h, t, R) {
    g.fillStyle = C.dark ? '#141a1a' : '#cfd3c8'; g.fillRect(0, 0, w, h);
    var fl = g.createLinearGradient(0, h * 0.55, 0, h); fl.addColorStop(0, C.dark ? '#211f1b' : '#b3a68a'); fl.addColorStop(1, C.dark ? '#151311' : '#9d907a'); g.fillStyle = fl; g.fillRect(0, h * 0.55, w, h * 0.45);
    // hai dãy giường tre trải chiếu cói, phối cảnh về phía bếp
    var vx = w * 0.5, vy = h * 0.5;
    function bed(side, d) {
      var s = 1 / (1 + d * 0.9), near = side < 0 ? w * 0.02 : w * 0.98, x1 = vx + (near - vx) * s, x2 = vx + (near - vx) * s * 0.55, yb = vy + (h * 0.98 - vy) * s;
      var top = yb - h * 0.07 * s, wd = (x2 - x1);
      g.fillStyle = C.dark ? '#4a4434' : '#b9a46f';
      g.beginPath(); g.moveTo(x1, top); g.lineTo(x2, top); g.lineTo(x2 + wd * 0.15, top - h * 0.02 * s); g.lineTo(x1 + wd * 0.15, top - h * 0.02 * s); g.fill();
      g.fillStyle = C.dark ? '#2e2a21' : '#8a7a52'; g.fillRect(Math.min(x1, x2), top, Math.abs(wd), h * 0.015 * s);
      g.fillRect(x1 - side * 0, top, w * 0.006 * s + 1, h * 0.06 * s); g.fillRect(x2, top, w * 0.006 * s + 1, h * 0.06 * s);
    }
    for (var d = 3; d >= 0; d--) { bed(-1, d * 0.8); bed(1, d * 0.8); }
    // bếp lò và ấm đất sôi
    var cx = w * 0.5, cy = h * 0.58;
    g.fillStyle = C.dark ? '#2a2420' : '#6b5c4a'; g.fillRect(cx - w * 0.05, cy, w * 0.1, h * 0.06);
    g.fillStyle = rgba('#e68a3a', 0.5 + 0.2 * Math.sin(t * 8)); g.fillRect(cx - w * 0.03, cy + h * 0.02, w * 0.06, h * 0.025);
    g.fillStyle = C.dark ? '#0e0c0b' : '#2b2622'; g.beginPath(); g.ellipse(cx, cy - h * 0.03, w * 0.035, h * 0.045, 0, 0, 7); g.fill();
    wisp(g, cx + w * 0.03, cy - h * 0.06, h * 0.35, t, C.dark ? '#c9d0cc' : '#ffffff', 0.35);
    var lg = g.createLinearGradient(w * 0.4, 0, w * 0.6, h); lg.addColorStop(0, rgba('#fff4d8', C.dark ? 0.06 : 0.3)); lg.addColorStop(1, rgba('#fff4d8', 0)); g.fillStyle = lg; g.fillRect(0, 0, w, h);
  };

  ART.market = function (g, w, h, t, R, o) {
    var tod = o[0] || 'day';
    sky(g, w, h, tod, 0.5);
    var gr = C.dark ? (tod === 'noon' ? '#6d5a44' : '#3d3830') : (tod === 'noon' ? '#e0c49a' : '#cfc0a2'); g.fillStyle = gr; g.fillRect(0, h * 0.45, w, h * 0.55);
    var col = sil(tod);
    // dãy sạp tre lợp lá, phối cảnh
    for (var i = 0; i < 5; i++) {
      var s = 1 - i * 0.16, x = w * 0.04 + i * w * 0.08, wd = w * 0.18 * s, base = h * (0.95 - i * 0.1);
      [x, w - x - wd].forEach(function (sx, side) {
        g.fillStyle = col; g.fillRect(sx, base - h * 0.32 * s, w * 0.006, h * 0.32 * s); g.fillRect(sx + wd, base - h * 0.32 * s, w * 0.006, h * 0.32 * s);
        g.beginPath(); g.moveTo(sx - wd * 0.08, base - h * 0.3 * s); g.lineTo(sx + wd * 0.5, base - h * 0.42 * s); g.lineTo(sx + wd * 1.08, base - h * 0.3 * s); g.fill();
        g.fillRect(sx, base - h * 0.1 * s, wd, h * 0.02 * s);
        // xâu cá khô đung đưa
        g.strokeStyle = col; g.lineWidth = 1;
        for (var f = 0; f < 3; f++) { var fx = sx + wd * (0.25 + f * 0.25), sw = Math.sin(t * 0.8 + i + f + side) * 2; g.beginPath(); g.moveTo(fx, base - h * 0.3 * s); g.lineTo(fx + sw, base - h * 0.2 * s); g.stroke(); g.beginPath(); g.ellipse(fx + sw, base - h * 0.18 * s, 2 * s + 1, 5 * s + 1, 0, 0, 7); g.fillStyle = col; g.fill(); }
      });
    }
    if (tod === 'noon') {
      g.fillStyle = rgba('#000000', C.dark ? 0.3 : 0.12); for (var b = 0; b < 5; b++) { var s2 = 1 - b * 0.16; g.fillRect(w * 0.04 + b * w * 0.08, h * (0.95 - b * 0.1), w * 0.18 * s2, h * 0.03 * s2); }
      g.fillStyle = rgba('#fff6dc', 0.07 + 0.04 * Math.sin(t * 3)); g.fillRect(0, h * 0.45, w, h * 0.1);
    }
    // ruồi lượn
    g.fillStyle = col; for (var fl = 0; fl < 3; fl++) g.fillRect(w * 0.5 + Math.sin(t * 3 + fl * 2) * w * 0.08, h * 0.62 + Math.cos(t * 4.3 + fl) * h * 0.05, 1.5, 1.5);
  };

  ART.hall = function (g, w, h, t, R, o) {
    var smoke = o[0] === 'smoke';
    g.fillStyle = C.dark ? '#0f1312' : '#b9b5a8'; g.fillRect(0, 0, w, h);
    g.fillStyle = C.dark ? '#1c1a16' : '#9c8f78'; g.fillRect(0, h * 0.72, w, h * 0.28);
    // ô cửa chấn song, nắng rọi thành từng vệt
    for (var k = 0; k < 3; k++) {
      var wx = w * (0.18 + k * 0.28), wy = h * 0.2;
      g.fillStyle = rgba('#fff2cc', C.dark ? 0.35 : 0.6); g.fillRect(wx, wy, w * 0.1, h * 0.2);
      g.fillStyle = C.dark ? '#0f1312' : '#b9b5a8'; for (var b = 1; b < 5; b++) g.fillRect(wx + b * w * 0.02, wy, w * 0.004, h * 0.2);
      var beam = g.createLinearGradient(wx, wy, wx + w * 0.15, h);
      beam.addColorStop(0, rgba('#fff2cc', C.dark ? 0.14 : 0.3)); beam.addColorStop(1, rgba('#fff2cc', 0));
      g.fillStyle = beam; g.beginPath(); g.moveTo(wx, wy + h * 0.2); g.lineTo(wx + w * 0.1, wy + h * 0.2); g.lineTo(wx + w * 0.26, h); g.lineTo(wx + w * 0.12, h); g.fill();
    }
    // cột gỗ lim đen bóng
    g.fillStyle = C.dark ? '#050707' : '#3b332a';
    [0.06, 0.33, 0.61, 0.9].forEach(function (x) { g.fillRect(w * x, 0, w * 0.035, h); g.fillStyle = rgba('#ffffff', 0.06); g.fillRect(w * x + w * 0.006, 0, w * 0.004, h); g.fillStyle = C.dark ? '#050707' : '#3b332a'; });
    // bụi trong nắng
    g.fillStyle = rgba('#fff2cc', 0.6);
    for (var d = 0; d < 16; d++) { g.globalAlpha = 0.25 + 0.4 * Math.abs(Math.sin(t + d)); g.fillRect(w * (0.2 + R[d] * 0.6) + Math.sin(t * 0.3 + d) * 6, h * (0.4 + R[d + 16] * 0.5) - (t * 3 % 20), 1.5, 1.5); }
    g.globalAlpha = 1;
    if (smoke) for (var s = 0; s < 6; s++) { var sx = ((t * (6 + s) + R[s + 40] * w) % (w * 1.4)) - w * 0.2, sy = h * (0.3 + s * 0.1); var sg = g.createRadialGradient(sx, sy, 0, sx, sy, w * 0.3); sg.addColorStop(0, rgba(C.dark ? '#6c7372' : '#eeeeea', 0.5)); sg.addColorStop(1, rgba('#888888', 0)); g.fillStyle = sg; g.fillRect(0, 0, w, h); }
    if (o[0] === 'stone') { g.fillStyle = C.dark ? '#2f4a46' : '#6f8f88'; g.fillRect(w * 0.4, h * 0.66, w * 0.2, h * 0.05); g.fillStyle = C.dark ? '#1e2f2d' : '#4f6a64'; g.fillRect(w * 0.41, h * 0.71, w * 0.02, h * 0.07); g.fillRect(w * 0.57, h * 0.71, w * 0.02, h * 0.07); }
  };

  ART.room = function (g, w, h, t, R, o) {
    var tod = o[0] || 'night';
    g.fillStyle = C.dark ? '#0f1416' : '#c8ccc4'; g.fillRect(0, 0, w, h);
    // cửa sổ
    var wx = w * 0.56, wy = h * 0.12, ww = w * 0.3, wh = h * 0.5;
    var p = SKYP[C.dark ? 'dark' : 'light'][tod], sg = g.createLinearGradient(0, wy, 0, wy + wh); sg.addColorStop(0, p[0]); sg.addColorStop(1, p[1]);
    g.fillStyle = sg; g.fillRect(wx, wy, ww, wh);
    if (tod === 'night') { g.fillStyle = rgba('#e9c27a', 0.6); for (var i = 0; i < 8; i++) g.fillRect(wx + R[i] * ww, wy + wh * (0.55 + R[i + 8] * 0.4), 3, 4); }
    g.fillStyle = C.dark ? '#0a0e0f' : '#8c9089'; g.fillRect(wx + ww / 2 - 1, wy, 3, wh); g.fillRect(wx, wy + wh / 2 - 1, ww, 3);
    // rèm khẽ lay
    g.fillStyle = C.dark ? '#1c2325' : '#a7ada5';
    var sw = Math.sin(t * 0.5) * w * 0.006; g.beginPath(); g.moveTo(wx - w * 0.04, wy - h * 0.04); g.lineTo(wx + w * 0.05, wy - h * 0.04); g.quadraticCurveTo(wx + w * 0.02 + sw, wy + wh * 0.5, wx + w * 0.04 + sw, wy + wh + h * 0.05); g.lineTo(wx - w * 0.04, wy + wh + h * 0.05); g.fill();
    // bàn học, cuốn vở mở, đèn bàn
    g.fillStyle = C.dark ? '#1d1b18' : '#7d6f5c'; g.fillRect(0, h * 0.72, w, h * 0.06);
    g.fillStyle = C.dark ? '#cfc9b8' : '#f3efe4'; g.beginPath(); g.moveTo(w * 0.2, h * 0.72); g.lineTo(w * 0.38, h * 0.72); g.lineTo(w * 0.36, h * 0.69); g.lineTo(w * 0.22, h * 0.69); g.fill();
    if (tod === 'night') {
      var lg = g.createRadialGradient(w * 0.14, h * 0.6, 0, w * 0.14, h * 0.7, w * 0.4); lg.addColorStop(0, rgba('#f6d28e', 0.45)); lg.addColorStop(1, rgba('#f6d28e', 0)); g.fillStyle = lg; g.fillRect(0, 0, w, h);
    }
    g.strokeStyle = C.dark ? '#2b2a26' : '#5c5448'; g.lineWidth = 3; g.beginPath(); g.moveTo(w * 0.1, h * 0.72); g.lineTo(w * 0.12, h * 0.52); g.lineTo(w * 0.16, h * 0.56); g.stroke();
  };

  ART.store = function (g, w, h, t, R) {
    g.fillStyle = C.dark ? '#100e0c' : '#7a6e60'; g.fillRect(0, 0, w, h);
    // ô cửa nhỏ, vệt nắng trườn chậm trên sàn gỗ
    var sx = w * 0.7, sy = h * 0.08;
    g.fillStyle = rgba('#fff0c8', C.dark ? 0.7 : 0.85); g.fillRect(sx, sy, w * 0.08, h * 0.12);
    var drift = Math.sin(t * 0.05) * w * 0.04;
    var bm = g.createLinearGradient(sx, sy, sx - w * 0.3, h); bm.addColorStop(0, rgba('#fff0c8', C.dark ? 0.22 : 0.4)); bm.addColorStop(1, rgba('#fff0c8', 0.05));
    g.fillStyle = bm; g.beginPath(); g.moveTo(sx, sy + h * 0.12); g.lineTo(sx + w * 0.08, sy + h * 0.12); g.lineTo(sx - w * 0.12 + drift, h); g.lineTo(sx - w * 0.36 + drift, h); g.fill();
    // giá trống, chiếu cuộn, bàn gỗ cũ
    g.strokeStyle = C.dark ? '#2a2520' : '#4e453a'; g.lineWidth = 3;
    for (var s = 0; s < 4; s++) { g.beginPath(); g.moveTo(w * 0.04, h * (0.2 + s * 0.15)); g.lineTo(w * 0.3, h * (0.2 + s * 0.15)); g.stroke(); }
    g.fillStyle = C.dark ? '#3b3427' : '#a39272'; for (var m = 0; m < 3; m++) g.fillRect(w * (0.86 + m * 0.03), h * 0.35, w * 0.022, h * 0.5);
    g.fillStyle = C.dark ? '#211c17' : '#5e5244'; g.fillRect(w * 0.32, h * 0.66, w * 0.36, h * 0.04); g.fillRect(w * 0.34, h * 0.7, w * 0.02, h * 0.2); g.fillRect(w * 0.64, h * 0.7, w * 0.02, h * 0.2);
    g.fillStyle = rgba('#fff0c8', 0.7);
    for (var d = 0; d < 18; d++) { g.globalAlpha = 0.3 + 0.5 * Math.abs(Math.sin(t * 0.7 + d)); g.fillRect(sx - w * (0.05 + R[d] * 0.25) + Math.sin(t * 0.3 + d) * 5, h * (0.3 + R[d + 18] * 0.6), 1.5, 1.5); }
    g.globalAlpha = 1;
  };

  // chữ xanh băng hiện giữa không trung, những cái tên trượt qua
  ART.void = function (g, w, h, t, R) {
    g.fillStyle = C.dark ? '#070b0d' : '#1d2628'; g.fillRect(0, 0, w, h);
    var ice = '#9fe3f0';
    var rowH = h * 0.08;
    for (var i = 0; i < 16; i++) {
      var y = ((i * rowH - t * h * 0.09) % (h + rowH * 2) + h + rowH * 2) % (h + rowH * 2) - rowH;
      var mid = 1 - Math.abs(y - h / 2) / (h / 2);
      g.fillStyle = rgba(ice, Math.max(0, mid) * 0.7);
      var len = w * (0.12 + R[i] * 0.2);
      for (var c = 0; c < len; c += w * 0.018) if (R[(i * 7 + Math.floor(c)) % 240] > 0.15) g.fillRect(w / 2 - len / 2 + c, y, w * 0.012, rowH * 0.18);
    }
    var gl = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.5); gl.addColorStop(0, rgba(ice, 0.08)); gl.addColorStop(1, rgba(ice, 0)); g.fillStyle = gl; g.fillRect(0, 0, w, h);
  };

  /* ---------- tranh cho các cảnh còn trống + bóng nhân vật (chèn vào fx.js sau art2.js) ---------- */

  // nền tường tối có vệt sáng từ một phía; dùng cho cận cảnh trong nhà
  function room2(g, w, h, warm) {
    var gr = g.createLinearGradient(0, 0, 0, h);
    if (C.dark) { gr.addColorStop(0, warm ? '#1b1612' : '#141a1b'); gr.addColorStop(1, warm ? '#0c0a08' : '#0b0f10'); }
    else { gr.addColorStop(0, warm ? '#9b8c76' : '#b8bcb3'); gr.addColorStop(1, warm ? '#6f6352' : '#8f948c'); }
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  }
  function glow(g, x, y, r, col, a) { var gl = g.createRadialGradient(x, y, 0, x, y, r); gl.addColorStop(0, rgba(col, a)); gl.addColorStop(1, rgba(col, 0)); g.fillStyle = gl; g.fillRect(x - r, y - r, r * 2, r * 2); }
  function motes(g, w, h, t, R, x0, x1, y0, y1, n, col) {
    g.fillStyle = rgba(col, 0.7);
    for (var d = 0; d < n; d++) { g.globalAlpha = 0.25 + 0.5 * Math.abs(Math.sin(t * 0.7 + d)); g.fillRect(x0 + R[d % 240] * (x1 - x0) + Math.sin(t * 0.3 + d) * 5, y0 + ((R[(d + 30) % 240] + t * 0.01) % 1) * (y1 - y0), 1.5, 1.5); }
    g.globalAlpha = 1;
  }
  function planks(g, w, h, y0, col) {
    g.strokeStyle = col; g.lineWidth = 1;
    for (var i = 0; i < 9; i++) { var y = y0 + (h - y0) * Math.pow(i / 8, 1.5); g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  }
  // mặt sau tấm thẻ: vòng tròn rối
  function tangle(g, cx, cy, r, col, a, t) {
    g.save(); g.strokeStyle = rgba(col, a); g.lineWidth = Math.max(1, r / 18);
    for (var k = 0; k < 3; k++) { g.beginPath(); for (var i = 0; i <= 60; i++) { var u = i / 60 * Math.PI * 2, rr = r * (0.75 + 0.12 * Math.sin(u * (3 + k) + k + t * 0.2)); g.lineTo(cx + Math.cos(u) * rr, cy + Math.sin(u) * rr * 0.92); } g.stroke(); }
    g.restore();
  }

  // 02.5 tấm thẻ úp trên bàn gỗ cũ trong kho, vòng tròn rối khẽ ánh lên
  ART.cardtable = function (g, w, h, t, R) {
    room2(g, w, h, true);
    var top = h * 0.5;
    g.fillStyle = C.dark ? '#2a221a' : '#8a7458'; g.fillRect(0, top, w, h - top);
    planks(g, w, h, top, rgba('#000000', 0.18));
    var beam = g.createLinearGradient(w * 0.8, 0, w * 0.4, h); beam.addColorStop(0, rgba('#fff0c8', C.dark ? 0.2 : 0.35)); beam.addColorStop(1, rgba('#fff0c8', 0));
    g.fillStyle = beam; g.beginPath(); g.moveTo(w * 0.72, 0); g.lineTo(w * 0.86, 0); g.lineTo(w * 0.66, h); g.lineTo(w * 0.36, h); g.fill();
    var cx = w * 0.52, cy = h * 0.7, cw = w * 0.2, ch = cw * 0.63;
    g.save(); g.translate(cx, cy); g.transform(1, 0, -0.35, 0.45, 0, 0); g.rotate(-0.12);
    g.fillStyle = rgba('#000000', 0.35); g.fillRect(-cw / 2 + 6, -ch / 2 + 8, cw, ch);
    g.fillStyle = C.dark ? '#1d2224' : '#2b3133'; g.fillRect(-cw / 2, -ch / 2, cw, ch);
    tangle(g, 0, 0, ch * 0.34, '#d9c48f', 0.35 + 0.25 * Math.sin(t * 0.9), t);
    g.restore();
    motes(g, w, h, t, R, w * 0.4, w * 0.8, 0, h, 18, '#fff0c8');
  };

  // 02.6 vệt nắng trườn chậm trên sàn gỗ, thời gian trôi
  ART.floorlight = function (g, w, h, t, R) {
    room2(g, w, h, true);
    var top = h * 0.25;
    g.fillStyle = C.dark ? '#221c16' : '#86735a'; g.fillRect(0, top, w, h - top);
    g.strokeStyle = rgba('#000000', 0.2); g.lineWidth = 1;
    for (var i = -6; i < 14; i++) { g.beginPath(); g.moveTo(w * 0.5 + i * w * 0.02, top); g.lineTo(w * 0.5 + i * w * 0.14, h); g.stroke(); }
    var ph = (t * 0.015) % 1, x = w * (0.15 + ph * 0.6), y = h * (0.45 + ph * 0.12);
    g.save(); g.translate(x, y); g.transform(1, 0, -0.6, 0.5, 0, 0);
    var a = C.dark ? 0.28 : 0.45, s = w * 0.16;
    g.fillStyle = rgba('#fff0c8', a); g.fillRect(-s / 2, -s / 2, s, s);
    g.fillStyle = C.dark ? '#221c16' : '#86735a'; g.fillRect(-s * 0.03, -s / 2, s * 0.06, s); g.fillRect(-s / 2, -s * 0.03, s, s * 0.06);
    g.restore();
    glow(g, x, y, w * 0.25, '#fff0c8', C.dark ? 0.08 : 0.15);
    motes(g, w, h, t, R, x - w * 0.15, x + w * 0.15, 0, y, 14, '#fff0c8');
  };

  // 02.7 màn hình điện thoại sáng lên trong túi áo rồi tắt
  ART.phone = function (g, w, h, t, R) {
    room2(g, w, h, false);
    var cyc = t % 6, on = cyc > 1 && cyc < 3.2 ? Math.min(1, (cyc - 1) * 6, (3.2 - cyc) * 3) : 0;
    g.fillStyle = C.dark ? '#1a2022' : '#5a615d'; g.beginPath(); g.moveTo(0, h * 0.35); g.quadraticCurveTo(w * 0.5, h * 0.28, w, h * 0.38); g.lineTo(w, h); g.lineTo(0, h); g.fill(); // vạt vải
    g.strokeStyle = rgba('#000000', 0.3); g.beginPath(); g.moveTo(w * 0.25, h * 0.5); g.quadraticCurveTo(w * 0.5, h * 0.46, w * 0.75, h * 0.52); g.stroke(); // miệng túi
    var px = w * 0.43, py = h * 0.24, pw = w * 0.13, ph = h * 0.42;
    g.fillStyle = '#0c0f10'; g.fillRect(px, py, pw, ph);
    glow(g, px + pw / 2, py + ph * 0.3, w * 0.3, '#cfe6ff', 0.3 * on);
    g.fillStyle = rgba('#dcecff', 0.85 * on); g.fillRect(px + pw * 0.08, py + ph * 0.06, pw * 0.84, ph * 0.6);
    g.fillStyle = rgba('#5d7da0', on); g.fillRect(px + pw * 0.14, py + ph * 0.2, pw * 0.72, ph * 0.08); g.fillRect(px + pw * 0.14, py + ph * 0.32, pw * 0.5, ph * 0.04);
    g.fillStyle = C.dark ? '#1a2022' : '#5a615d'; g.beginPath(); g.moveTo(0, h * 0.52); g.quadraticCurveTo(w * 0.5, h * 0.48, w, h * 0.54); g.lineTo(w, h); g.lineTo(0, h); g.fill(); // túi che nửa dưới
  };

  // 03.2 góc thư viện: kệ sách, cuốn sách mở, điện thoại hiện dấu ba chấm
  ART.library = function (g, w, h, t, R) {
    room2(g, w, h, false);
    var cols = C.dark ? ['#3a3230', '#2b3436', '#3a3a2a', '#2f2a36'] : ['#8a6f5f', '#5f7377', '#8a8a5f', '#6f5f7f'];
    for (var s = 0; s < 4; s++) {
      var y = h * (0.1 + s * 0.15); g.fillStyle = C.dark ? '#0d1112' : '#5c5448'; g.fillRect(0, y + h * 0.12, w, h * 0.012);
      for (var x = 0, k = 0; x < w; k++) { var bw = w * (0.012 + R[(k + s * 40) % 240] * 0.014), bh = h * (0.08 + R[(k + s * 40 + 7) % 240] * 0.04); g.fillStyle = cols[(k + s) % 4]; g.fillRect(x, y + h * 0.12 - bh, bw, bh); x += bw + 1; }
    }
    g.fillStyle = C.dark ? '#1d1b18' : '#7d6f5c'; g.fillRect(0, h * 0.72, w, h * 0.28);
    var lg = g.createRadialGradient(w * 0.45, h * 0.8, 0, w * 0.45, h * 0.8, w * 0.4); lg.addColorStop(0, rgba('#fff0d0', C.dark ? 0.2 : 0.3)); lg.addColorStop(1, rgba('#fff0d0', 0)); g.fillStyle = lg; g.fillRect(0, 0, w, h);
    g.fillStyle = C.dark ? '#cfc9b8' : '#f3efe4'; g.beginPath(); g.moveTo(w * 0.3, h * 0.86); g.lineTo(w * 0.45, h * 0.84); g.lineTo(w * 0.6, h * 0.86); g.lineTo(w * 0.58, h * 0.78); g.lineTo(w * 0.45, h * 0.77); g.lineTo(w * 0.32, h * 0.78); g.fill();
    var page = Math.sin(t * 0.4) * 0.5 + 0.5; g.strokeStyle = rgba('#000000', 0.15); g.beginPath(); g.moveTo(w * 0.45, h * 0.77); g.lineTo(w * 0.45, h * 0.84); g.stroke();
    g.fillStyle = rgba('#a6a091', 0.5); for (var l = 0; l < 4; l++) g.fillRect(w * 0.34, h * (0.79 + l * 0.012), w * 0.09, 1);
    var px = w * 0.7, py = h * 0.8; g.fillStyle = '#0c0f10'; g.save(); g.translate(px, py); g.rotate(-0.15); g.fillRect(0, 0, w * 0.1, h * 0.06);
    g.fillStyle = rgba('#dcecff', 0.8); g.fillRect(w * 0.006, h * 0.006, w * 0.088, h * 0.048);
    for (var d = 0; d < 3; d++) { g.fillStyle = rgba('#5d7da0', 0.4 + 0.6 * Math.max(0, Math.sin(t * 4 - d * 0.8))); g.beginPath(); g.arc(w * (0.035 + d * 0.015), h * 0.03, w * 0.004, 0, 7); g.fill(); }
    g.restore();
  };

  // 04.2 những cái tên trượt qua, một cái tên khựng lại rồi danh sách tắt
  ART.names = function (g, w, h, t, R) {
    g.fillStyle = C.dark ? '#070b0d' : '#1d2628'; g.fillRect(0, 0, w, h);
    var ice = '#9fe3f0', L = ['Felix', 'Hana', 'Leon', 'Mabel', 'Caleb', 'Ivy', 'Oscar', 'Priya', 'Ruby', 'Jasper', 'Dante', 'Nova', 'Theo', 'Lena', 'Rex', 'Zara'];
    var cyc = t % 11, fs = Math.max(12, h * 0.075);
    g.font = '300 ' + fs + 'px Literata, Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    if (cyc < 6) {
      var off = cyc * h * 0.9;
      for (var i = 0; i < 24; i++) {
        var y = ((i * fs * 1.5 - off) % (L.length * fs * 1.5) + L.length * fs * 1.5) % (L.length * fs * 1.5) - fs;
        var mid = 1 - Math.abs(y - h / 2) / (h / 2); if (mid <= 0) continue;
        g.globalAlpha = mid * 0.75; g.fillStyle = ice; g.fillText(L[i % L.length], w / 2, y);
      }
      g.globalAlpha = 1;
    } else if (cyc < 9.5) {
      var a = Math.min(1, (cyc - 6) * 3) * (cyc > 8.8 ? Math.max(0, (9.5 - cyc) / 0.7) : 1);
      glow(g, w / 2, h / 2, w * 0.3, ice, 0.12 * a);
      g.globalAlpha = a; g.fillStyle = ice; g.font = 'italic 300 ' + fs * 1.3 + 'px Literata, Georgia, serif'; g.fillText('Luke', w / 2, h / 2); g.globalAlpha = 1;
    }
  };

  // 05.4 nồi cháo trên kiềng, hơi bốc lên, củi tí tách
  ART.porridge = function (g, w, h, t, R) {
    var fl = 0.82 + 0.1 * Math.sin(t * 9) + 0.08 * Math.sin(t * 23);
    g.fillStyle = C.dark ? '#0b0f10' : '#3d3a33'; g.fillRect(0, 0, w, h);
    glow(g, w * 0.5, h * 0.9, w * 0.6, '#f0a650', 0.6 * fl);
    var cx = w * 0.5, cy = h * 0.6, r = w * 0.15;
    g.fillStyle = C.dark ? '#141110' : '#1f1b18';
    for (var k = 0; k < 3; k++) g.fillRect(cx + (k - 1) * r * 0.9 - w * 0.012, cy + r * 0.3, w * 0.024, h * 0.3); // kiềng
    g.beginPath(); g.ellipse(cx, cy, r, r * 0.75, 0, 0, Math.PI); g.fill();
    g.fillStyle = C.dark ? '#2a2420' : '#3b332c'; g.beginPath(); g.ellipse(cx, cy, r, r * 0.22, 0, 0, 7); g.fill();
    g.fillStyle = C.dark ? '#bdb39a' : '#e8dfc6'; g.beginPath(); g.ellipse(cx, cy + r * 0.02, r * 0.86, r * 0.16, 0, 0, 7); g.fill();
    g.strokeStyle = C.dark ? '#4a3a2a' : '#6b5440'; g.lineWidth = Math.max(2, w / 200); g.beginPath(); g.moveTo(cx + r * 0.3, cy); g.lineTo(cx + r * 1.1, cy - r * 0.9); g.stroke(); // muôi gỗ
    for (var s = 0; s < 3; s++) wisp(g, cx - r * 0.4 + s * r * 0.4, cy - r * 0.05, h * 0.5, t + s * 1.7, C.dark ? '#c9d0cc' : '#ffffff', 0.3);
    for (var f = 0; f < 3; f++) { var fh = h * (0.12 - f * 0.025) * fl * (0.9 + 0.2 * Math.sin(t * 11 + f * 2)); g.fillStyle = rgba(['#e8892f', '#f4b552', '#fde3a0'][f], 0.9); g.beginPath(); g.moveTo(w * (0.43 + f * 0.02), h); g.quadraticCurveTo(cx + Math.sin(t * 7 + f) * w * 0.01, h - fh * 1.6 - h * 0.05, w * (0.57 - f * 0.02), h); g.fill(); }
  };

  // 05.5 cái hòm gỗ trong góc, ổ khoá đồng lấp lánh ánh lửa
  ART.chest = function (g, w, h, t, R) {
    var fl = 0.8 + 0.12 * Math.sin(t * 8) + 0.08 * Math.sin(t * 19);
    room2(g, w, h, true);
    g.fillStyle = rgba('#000000', C.dark ? 0.5 : 0.3); g.fillRect(0, 0, w, h);
    glow(g, w * 0.05, h * 0.7, w * 0.7, '#f0a650', 0.35 * fl);
    g.fillStyle = C.dark ? '#16110d' : '#4e4236'; g.fillRect(0, h * 0.78, w, h * 0.22);
    var x = w * 0.36, y = h * 0.45, cw = w * 0.34, ch = h * 0.34;
    g.fillStyle = C.dark ? '#3a2b1e' : '#6e5235'; g.fillRect(x, y, cw, ch);
    g.fillStyle = C.dark ? '#4a3726' : '#82623f'; g.beginPath(); g.moveTo(x - w * 0.01, y + ch * 0.25); g.quadraticCurveTo(x + cw / 2, y - ch * 0.25, x + cw + w * 0.01, y + ch * 0.25); g.lineTo(x + cw + w * 0.01, y + ch * 0.3); g.lineTo(x - w * 0.01, y + ch * 0.3); g.fill();
    g.fillStyle = rgba('#000000', 0.3); [0.12, 0.88].forEach(function (u) { g.fillRect(x + cw * u - w * 0.008, y, w * 0.016, ch); });
    var lx = x + cw / 2, ly = y + ch * 0.42;
    g.strokeStyle = C.dark ? '#8a6a32' : '#7a5a22'; g.lineWidth = Math.max(2, w / 220); g.beginPath(); g.arc(lx, ly - h * 0.02, w * 0.018, Math.PI, 0); g.stroke();
    g.fillStyle = C.dark ? '#a8803c' : '#b08a3e'; g.fillRect(lx - w * 0.024, ly - h * 0.02, w * 0.048, h * 0.07);
    glow(g, lx - w * 0.01, ly, w * 0.04, '#ffe2a0', 0.5 * fl * (0.6 + 0.4 * Math.sin(t * 1.3)));
    g.fillStyle = '#1a120a'; g.fillRect(lx - w * 0.003, ly + h * 0.01, w * 0.006, h * 0.02);
  };

  // 06.3 ngã ba giếng trong đêm: vệt kiếm tre loé qua, sỏi bắn tung
  ART.clash = function (g, w, h, t, R) {
    sky(g, w, h, 'night', 0.7);
    var hz = h * 0.66, col = sil('night');
    g.fillStyle = C.dark ? '#0e1416' : '#c2b9a0'; g.fillRect(0, hz, w, h - hz);
    g.fillStyle = col; for (var c = 0; c < 7; c++) { g.beginPath(); g.ellipse(w * (0.55 + c * 0.07), hz - h * (0.5 + 0.1 * Math.sin(c * 1.7)), w * 0.1, h * 0.12, 0, 0, 7); g.fill(); }
    g.fillRect(w * 0.7, hz - h * 0.42, w * 0.07, h * 0.42);
    var cyc = t % 2.6, a = cyc < 0.35 ? cyc / 0.35 : Math.max(0, 1 - (cyc - 0.35) / 0.8);
    // vệt chém
    g.save(); g.strokeStyle = rgba(C.dark ? '#e8f0e8' : '#ffffff', 0.8 * a); g.lineWidth = Math.max(2, w / 120); g.lineCap = 'round';
    var k = Math.floor(t / 2.6) % 3, a0 = [-2.4, -0.9, -2.0][k], a1 = a0 + 1.4 * Math.min(1, cyc / 0.35), cx = w * (0.38 + k * 0.06), cy = h * 0.55;
    g.beginPath(); g.arc(cx, cy, h * 0.28, a0, a1); g.stroke();
    g.lineWidth = 1; g.strokeStyle = rgba(C.dark ? '#e8f0e8' : '#ffffff', 0.35 * a); g.beginPath(); g.arc(cx, cy, h * 0.25, a0 + 0.1, a1); g.stroke();
    g.restore();
    // sỏi bắn
    g.fillStyle = C.dark ? '#7d8682' : '#6b665a';
    for (var s = 0; s < 14; s++) { var u = Math.min(1, cyc / 0.9), vx = (R[s] - 0.5) * w * 0.3, vy = -R[s + 14] * h * 0.4; var px = cx + vx * u, py = hz + h * 0.06 + vy * u + h * 0.5 * u * u; if (py < h && u < 1) g.fillRect(px, py, 2.5, 2.5); }
    // bụi
    glow(g, cx, hz + h * 0.08, w * 0.2, C.dark ? '#5f6866' : '#ffffff', 0.25 * a);
  };

  // 06.5 cận sợi xích căng dưới tán đa, rung rồi lặng dần
  ART.taut = function (g, w, h, t, R) {
    sky(g, w, h, 'night');
    var col = C.dark ? '#a9b4b4' : '#3a4442', cyc = t % 9, vib = Math.exp(-cyc * 0.8) * Math.sin(cyc * 40) * h * 0.012;
    g.fillStyle = sil('night'); for (var c = 0; c < 6; c++) { g.beginPath(); g.ellipse(w * (0.1 + c * 0.17), -h * 0.02, w * 0.14, h * 0.14, 0, 0, 7); g.fill(); }
    g.strokeStyle = sil('night'); g.lineWidth = 1; for (var r = 0; r < 12; r++) { var rx = R[r] * w, sw = Math.sin(t * 0.6 + r) * 3; g.beginPath(); g.moveTo(rx, 0); g.quadraticCurveTo(rx + sw, h * 0.3, rx + sw * 1.5, h * (0.3 + R[r + 12] * 0.4)); g.stroke(); }
    g.strokeStyle = col; g.lineWidth = Math.max(2, w / 200);
    [[0.3, 0.12, 0.62, 1.05], [0.55, 0.05, 0.5, 1.05], [0.78, 0.1, 0.7, 1.05]].forEach(function (ch, j) {
      var n = 16; for (var i = 0; i < n; i++) {
        var u = i / n, x = w * (ch[0] + (ch[2] - ch[0]) * u) + vib * Math.sin(u * Math.PI) * (j % 2 ? 1 : -1), y = h * (ch[1] + (ch[3] - ch[1]) * u);
        var ang = Math.atan2(h * (ch[3] - ch[1]), w * (ch[2] - ch[0]));
        g.save(); g.translate(x, y); g.rotate(ang); g.beginPath(); g.ellipse(0, 0, h * 0.035, i % 2 ? h * 0.008 : h * 0.018, 0, 0, 7); g.stroke(); g.restore();
      }
    });
    var gy = ((t * 0.5) % 1.4) * h; glow(g, w * 0.55, gy, h * 0.15, '#d9eef0', 0.18);
  };

  // 07.2 vết chân trên bùn: một người bước ngắn, một người bước dài như lướt
  ART.footprints = function (g, w, h, t, R) {
    sky(g, w, h, 'dawn', 0.3);
    var hz = h * 0.28;
    g.fillStyle = C.dark ? '#2b2a22' : '#9a8f76'; g.fillRect(0, hz, w, h - hz);
    g.fillStyle = C.dark ? '#36352b' : '#a99e83'; for (var m = 0; m < 30; m++) { g.beginPath(); g.ellipse(R[m] * w, hz + R[m + 30] * (h - hz), w * 0.03, h * 0.008, 0, 0, 7); g.fill(); }
    function print(x, y, s, deep) { g.fillStyle = rgba('#000000', deep ? 0.4 : 0.28); g.save(); g.translate(x, y); g.scale(s, s); g.beginPath(); g.ellipse(0, 0, w * 0.012, h * 0.022, 0.15, 0, 7); g.fill(); g.beginPath(); g.ellipse(w * 0.002, h * 0.03, w * 0.009, h * 0.012, 0.15, 0, 7); g.fill(); g.restore(); }
    for (var i = 0; i < 14; i++) { var u = i / 13, s = 0.4 + u * 1.2, y = hz + (h - hz) * Math.pow(u, 1.5); print(w * (0.42 - u * 0.12) + (i % 2 ? -1 : 1) * w * 0.012 * s, y, s, false); }
    for (var j = 0; j < 7; j++) { var v = j / 6, s2 = 0.4 + v * 1.2, y2 = hz + (h - hz) * Math.pow(v, 1.5); print(w * (0.58 + v * 0.14) + (j % 2 ? -1 : 1) * w * 0.012 * s2, y2, s2, true); }
    // nước đọng trong vết chân ánh lên
    g.fillStyle = rgba(C.dark ? '#cfe0dc' : '#ffffff', 0.25 + 0.2 * Math.sin(t)); g.fillRect(w * 0.29, h * 0.9, w * 0.012, 2);
    fog(g, w, h, t, hz, 0.4, R);
  };

  // 07.6 kho thóc, ông lão còng lưng ngồi trên bậc thềm (chỉ bóng)
  ART.granary = function (g, w, h, t, R) {
    sky(g, w, h, 'dawn', 0.6);
    var hz = h * 0.72, col = sil('dawn');
    g.fillStyle = C.dark ? '#3a3a2e' : '#cdbf9a'; g.fillRect(0, hz, w, h - hz);
    g.fillStyle = col; g.fillRect(w * 0.2, hz - h * 0.36, w * 0.5, h * 0.36);
    g.beginPath(); g.moveTo(w * 0.15, hz - h * 0.34); g.lineTo(w * 0.3, hz - h * 0.62); g.lineTo(w * 0.6, hz - h * 0.62); g.lineTo(w * 0.75, hz - h * 0.34); g.fill();
    g.fillStyle = rgba('#000000', 0.35); g.fillRect(w * 0.38, hz - h * 0.26, w * 0.12, h * 0.26);
    g.fillStyle = C.dark ? '#2a2a22' : '#9a8f76'; g.fillRect(w * 0.34, hz - h * 0.02, w * 0.2, h * 0.02); g.fillRect(w * 0.32, hz, w * 0.24, h * 0.025);
    // ông lão: lưng còng như móc câu, hai tay chống gậy
    var bx = w * 0.6, by = hz - h * 0.02, s = h * 0.3, br = Math.sin(t * 0.8) * s * 0.01;
    g.fillStyle = C.dark ? '#050808' : '#3f4744'; g.strokeStyle = g.fillStyle; g.lineCap = 'round';
    g.beginPath(); g.moveTo(bx - s * 0.25, by); g.quadraticCurveTo(bx - s * 0.32, by - s * 0.55, bx - s * 0.05, by - s * 0.75 + br); g.quadraticCurveTo(bx + s * 0.15, by - s * 0.7, bx + s * 0.12, by - s * 0.45); g.lineTo(bx + s * 0.05, by); g.fill();
    g.beginPath(); g.arc(bx + s * 0.12, by - s * 0.62 + br, s * 0.1, 0, 7); g.fill();
    g.lineWidth = Math.max(1.5, s * 0.03); g.beginPath(); g.moveTo(bx + s * 0.3, by + h * 0.02); g.lineTo(bx + s * 0.24, by - s * 0.5); g.stroke();
    g.lineWidth = Math.max(2, s * 0.06); g.beginPath(); g.moveTo(bx + s * 0.02, by - s * 0.5); g.lineTo(bx + s * 0.24, by - s * 0.45); g.stroke();
    // nón lá trên mặt ruộng phía xa
    g.fillStyle = C.dark ? '#a49a76' : '#e6dab2'; for (var n = 0; n < 6; n++) { var nx = w * (0.76 + R[n] * 0.22), ny = hz + h * (0.06 + R[n + 6] * 0.2); g.beginPath(); g.moveTo(nx - w * 0.02, ny); g.lineTo(nx, ny - h * 0.02); g.lineTo(nx + w * 0.02, ny); g.fill(); }
    fog(g, w, h, t, hz, 0.3, R);
  };

  // 07.8 cánh cửa kho khép lại, vệt sáng hẹp dần
  ART.doorclose = function (g, w, h, t, R) {
    room2(g, w, h, true);
    var cyc = (t % 8) / 8, open = cyc < 0.15 ? 1 : cyc < 0.7 ? 1 - (cyc - 0.15) / 0.55 : 0;
    var x = w * 0.36, y = h * 0.12, dw = w * 0.28, dh = h * 0.78;
    g.fillStyle = C.dark ? '#050404' : '#2b2420'; g.fillRect(x, y, dw, dh);
    var gap = dw * 0.7 * open;
    g.fillStyle = rgba('#fff0c8', C.dark ? 0.55 : 0.75); g.fillRect(x + dw - gap, y, gap, dh);
    var beam = g.createLinearGradient(0, y + dh, 0, h); beam.addColorStop(0, rgba('#fff0c8', 0.4 * open)); beam.addColorStop(1, rgba('#fff0c8', 0));
    g.fillStyle = beam; g.beginPath(); g.moveTo(x + dw - gap, y + dh); g.lineTo(x + dw, y + dh); g.lineTo(x + dw + w * 0.2, h); g.lineTo(x + dw - gap - w * 0.05, h); g.fill();
    g.fillStyle = C.dark ? '#3a2e22' : '#6e5a42'; g.fillRect(x + dw - gap - w * 0.03, y, w * 0.03, dh); // mép cánh cửa
    g.strokeStyle = C.dark ? '#1c1610' : '#4a3a2a'; g.lineWidth = Math.max(3, w / 120); g.strokeRect(x, y, dw, dh);
  };

  // 08.2 căn nhà thứ hai ban ngày, cánh cửa khép, chim sẻ nhảy trên mái lá
  ART.shutdoor = function (g, w, h, t, R) {
    sky(g, w, h, 'day', 0.6);
    var hz = h * 0.78, col = sil('day');
    g.fillStyle = C.dark ? '#3a3b31' : '#c4b99c'; g.fillRect(0, hz, w, h - hz);
    g.fillStyle = col; g.fillRect(w * 0.18, hz - h * 0.4, w * 0.64, h * 0.4);
    var ry = hz - h * 0.38; g.beginPath(); g.moveTo(w * 0.1, ry); g.lineTo(w * 0.28, ry - h * 0.3); g.lineTo(w * 0.72, ry - h * 0.3); g.lineTo(w * 0.9, ry); g.fill();
    g.fillStyle = C.dark ? '#0b0f10' : '#4a5450'; g.fillRect(w * 0.43, hz - h * 0.3, w * 0.14, h * 0.3);
    g.strokeStyle = rgba('#000000', 0.3); g.beginPath(); g.moveTo(w * 0.5, hz - h * 0.3); g.lineTo(w * 0.5, hz); g.stroke();
    g.fillStyle = C.dark ? '#141c1e' : '#59625e';
    for (var b = 0; b < 4; b++) {
      var hop = Math.max(0, Math.sin(t * 3 + b * 1.7)), bx = w * (0.32 + b * 0.11) + Math.floor(t * 0.5 + b) % 3 * w * 0.01, by = ry - h * 0.3 * (1 - (bx - w * 0.28) / (w * 0.44)) * 0 - h * 0.3 - hop * h * 0.025 - h * 0.012;
      g.beginPath(); g.ellipse(bx, by, w * 0.01, h * 0.016, 0, 0, 7); g.fill(); g.beginPath(); g.arc(bx + w * 0.009, by - h * 0.014, w * 0.006, 0, 7); g.fill();
      g.fillRect(bx - w * 0.016, by - h * 0.004, w * 0.01, h * 0.005);
    }
    bamboo(g, w * 0.05, hz, h * 0.5, col, t, 11);
  };

  // 08.7 hòm trống, ổ khoá đồng móp méo lủng lẳng
  ART.brokenlock = function (g, w, h, t, R) {
    room2(g, w, h, false);
    var lt = g.createLinearGradient(0, 0, w, 0); lt.addColorStop(0, rgba('#fff4d8', C.dark ? 0.12 : 0.3)); lt.addColorStop(0.6, rgba('#fff4d8', 0)); g.fillStyle = lt; g.fillRect(0, 0, w, h);
    g.fillStyle = C.dark ? '#1b1712' : '#6f6352'; g.fillRect(0, h * 0.8, w, h * 0.2);
    var x = w * 0.3, y = h * 0.42, cw = w * 0.4, ch = h * 0.38;
    g.fillStyle = C.dark ? '#0a0806' : '#2a221a'; g.fillRect(x, y, cw, h * 0.06); // lòng hòm trống
    g.fillStyle = C.dark ? '#3a2b1e' : '#6e5235'; g.fillRect(x, y + h * 0.05, cw, ch - h * 0.05);
    g.save(); g.translate(x, y); g.rotate(-0.5); g.fillStyle = C.dark ? '#4a3726' : '#82623f'; g.fillRect(0, -h * 0.03, cw, h * 0.03); g.restore(); // nắp hé
    // lưới vá dở phủ nửa hòm
    g.strokeStyle = rgba(C.dark ? '#7f8f8c' : '#3c4643', 0.5); g.lineWidth = 1;
    for (var n = 0; n < 10; n++) { g.beginPath(); g.moveTo(x + cw * 0.5 + n * cw * 0.06, y + h * 0.04); g.quadraticCurveTo(x + cw * 0.55 + n * cw * 0.06, y + ch * 0.6, x + cw * 0.6 + n * cw * 0.05, h * 0.82); g.stroke(); }
    for (var m = 1; m < 6; m++) { g.beginPath(); g.moveTo(x + cw * 0.5, y + m * ch * 0.16); g.lineTo(x + cw * 1.05, y + m * ch * 0.17); g.stroke(); }
    var sw = Math.sin(t * 1.4) * 0.35 * (0.5 + 0.5 * Math.sin(t * 0.2)), lx = x + cw * 0.3, ly = y + h * 0.1;
    g.save(); g.translate(lx, ly); g.rotate(sw);
    g.strokeStyle = C.dark ? '#8a6a32' : '#7a5a22'; g.lineWidth = Math.max(2, w / 220); g.beginPath(); g.moveTo(-w * 0.014, h * 0.03); g.quadraticCurveTo(-w * 0.02, -h * 0.01, w * 0.004, 0); g.stroke(); // quai bị bẻ
    g.fillStyle = C.dark ? '#a8803c' : '#b08a3e'; g.beginPath(); g.moveTo(-w * 0.024, h * 0.03); g.lineTo(w * 0.02, h * 0.035); g.lineTo(w * 0.026, h * 0.1); g.lineTo(-w * 0.02, h * 0.095); g.fill();
    g.strokeStyle = rgba('#000000', 0.4); g.beginPath(); g.moveTo(-w * 0.01, h * 0.05); g.lineTo(w * 0.006, h * 0.07); g.lineTo(-w * 0.004, h * 0.085); g.stroke();
    g.restore();
  };

  // 09.6 dãy ghế gỗ, cái đổ nghiêng, cái đã dựng lại, bụi lắng trong nắng
  ART.pews = function (g, w, h, t, R) {
    g.fillStyle = C.dark ? '#0f1312' : '#b9b5a8'; g.fillRect(0, 0, w, h);
    g.fillStyle = C.dark ? '#2a1a16' : '#a36a52'; g.fillRect(0, h * 0.5, w, h * 0.5); // nền gạch đỏ
    g.strokeStyle = rgba('#000000', 0.15); for (var r = 0; r < 8; r++) { var yy = h * 0.5 + h * 0.5 * Math.pow(r / 7, 1.4); g.beginPath(); g.moveTo(0, yy); g.lineTo(w, yy); g.stroke(); }
    var wood = C.dark ? '#050707' : '#3b332a';
    function pew(x, y, s, tilt) { g.save(); g.translate(x, y); g.rotate(tilt); g.fillStyle = wood; g.fillRect(-w * 0.14 * s, -h * 0.03 * s, w * 0.28 * s, h * 0.025 * s); g.fillRect(-w * 0.14 * s, -h * 0.12 * s, w * 0.28 * s, h * 0.02 * s); g.fillRect(-w * 0.13 * s, -h * 0.12 * s, w * 0.01 * s, h * 0.2 * s); g.fillRect(w * 0.12 * s, -h * 0.12 * s, w * 0.01 * s, h * 0.2 * s); g.restore(); }
    pew(w * 0.25, h * 0.62, 0.6, 0); pew(w * 0.72, h * 0.62, 0.6, 0); pew(w * 0.22, h * 0.78, 0.85, 0); pew(w * 0.75, h * 0.82, 0.9, 1.25); pew(w * 0.4, h * 0.97, 1.1, -0.2);
    for (var k = 0; k < 2; k++) { var bx = w * (0.3 + k * 0.35); var beam = g.createLinearGradient(bx, 0, bx + w * 0.2, h); beam.addColorStop(0, rgba('#fff2cc', C.dark ? 0.15 : 0.32)); beam.addColorStop(1, rgba('#fff2cc', 0)); g.fillStyle = beam; g.beginPath(); g.moveTo(bx, 0); g.lineTo(bx + w * 0.1, 0); g.lineTo(bx + w * 0.3, h); g.lineTo(bx + w * 0.15, h); g.fill(); }
    motes(g, w, h, t, R, w * 0.3, w * 0.9, 0, h, 24, '#fff2cc');
  };

  // 09.7 / 09.9 tấm bảng gỗ ghim giấy ngả vàng; tờ giữa ghi số người còn sống
  function board(g, w, h, t, R, close, num, num2) {
    g.fillStyle = C.dark ? '#0f1312' : '#b9b5a8'; g.fillRect(0, 0, w, h);
    var bx = close ? -w * 0.1 : w * 0.12, by = close ? -h * 0.1 : h * 0.1, bw = close ? w * 1.2 : w * 0.76, bh = close ? h * 1.2 : h * 0.72;
    g.fillStyle = C.dark ? '#2a2018' : '#6e5235'; g.fillRect(bx, by, bw, bh);
    var paper = C.dark ? '#8f8466' : '#e6d9ad', ink = '#1f1a14';
    if (!close) {
      [[0.06, 0.08, 0.2, 0.36, 0.05], [0.72, 0.1, 0.22, 0.3, -0.06], [0.08, 0.56, 0.24, 0.3, 0.04], [0.7, 0.52, 0.2, 0.34, -0.03]].forEach(function (p, i) {
        var lift = Math.max(0, Math.sin(t * 0.9 + i * 2)) * 0.06;
        g.save(); g.translate(bx + bw * p[0], by + bh * p[1]); g.rotate(p[4]); g.fillStyle = paper; g.beginPath(); g.moveTo(0, 0); g.lineTo(bw * p[2], 0); g.lineTo(bw * p[2], bh * p[3]); g.lineTo(bw * p[2] * 0.2, bh * p[3] * (1 - lift)); g.lineTo(0, bh * p[3] * (1 - lift * 2)); g.fill();
        g.fillStyle = rgba(ink, 0.35); for (var l = 0; l < 6; l++) g.fillRect(bw * p[2] * 0.12, bh * p[3] * (0.15 + l * 0.12), bw * p[2] * (0.5 + R[i * 6 + l] * 0.3), 1.5);
        g.fillStyle = '#7a1f1f'; g.beginPath(); g.arc(bw * p[2] / 2, bh * 0.015, 2.5, 0, 7); g.fill(); g.restore();
      });
    }
    var px = w * 0.5, py = h * 0.5, pw = close ? w * 0.5 : w * 0.24, ph = close ? h * 0.8 : h * 0.44;
    g.fillStyle = paper; g.fillRect(px - pw / 2, py - ph / 2, pw, ph);
    g.fillStyle = '#7a1f1f'; g.beginPath(); g.arc(px, py - ph / 2 + 5, close ? 5 : 3, 0, 7); g.fill();
    g.fillStyle = rgba(ink, 0.4); g.fillRect(px - pw * 0.35, py - ph * 0.3, pw * 0.7, close ? 3 : 1.5);
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '400 ' + (ph * 0.38) + 'px Literata, Georgia, serif';
    if (num2) {
      var cyc = t % 9, a1 = cyc < 3 ? 1 : cyc < 5 ? 1 - (cyc - 3) / 2 : 0, a2 = cyc < 5 ? 0 : Math.min(1, (cyc - 5) / 2.2);
      g.fillStyle = rgba(ink, 0.85 * a1); g.fillText(num, px, py + ph * 0.1);
      g.fillStyle = rgba(ink, 0.85 * a2); g.fillText(num2, px, py + ph * 0.1);
    } else { g.fillStyle = rgba(ink, 0.85); g.fillText(num, px, py + ph * 0.1); }
    var lg = g.createLinearGradient(0, 0, w, h); lg.addColorStop(0, rgba('#fff2cc', C.dark ? 0.1 : 0.2)); lg.addColorStop(1, rgba('#000000', C.dark ? 0.3 : 0.15)); g.fillStyle = lg; g.fillRect(0, 0, w, h);
  }
  ART.board = function (g, w, h, t, R) { board(g, w, h, t, R, false, '18'); };
  ART.board17 = function (g, w, h, t, R) { board(g, w, h, t, R, true, '18', '17'); };

  // 09.8 sân gạch trước nhà họp, nắng xiên kéo dài bóng cột, cái giếng phủ rêu
  ART.courtyard = function (g, w, h, t, R) {
    sky(g, w, h, 'day', 0.3);
    var hz = h * 0.3;
    g.fillStyle = C.dark ? '#3a2620' : '#b8806a'; g.fillRect(0, hz, w, h - hz);
    g.strokeStyle = rgba('#000000', 0.12); for (var r = 0; r < 10; r++) { var y = hz + (h - hz) * Math.pow(r / 9, 1.3); g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    var sh = rgba('#000000', C.dark ? 0.45 : 0.25), drift = Math.sin(t * 0.04) * w * 0.03;
    [0.1, 0.32, 0.54, 0.76].forEach(function (x) {
      g.fillStyle = sh; g.beginPath(); g.moveTo(w * x, hz); g.lineTo(w * x + w * 0.035, hz); g.lineTo(w * x + w * 0.4 + drift, h); g.lineTo(w * x + w * 0.3 + drift, h); g.fill();
      g.fillStyle = C.dark ? '#050707' : '#3b332a'; g.fillRect(w * x, 0, w * 0.035, hz + 2);
    });
    g.fillStyle = C.dark ? '#050707' : '#3b332a'; g.fillRect(0, 0, w, h * 0.05);
    var wx = w * 0.62, wy = h * 0.72;
    g.fillStyle = C.dark ? '#26302d' : '#8d978a'; g.beginPath(); g.ellipse(wx, wy, w * 0.09, h * 0.04, 0, 0, 7); g.fill(); g.fillRect(wx - w * 0.09, wy, w * 0.18, h * 0.09);
    g.beginPath(); g.ellipse(wx, wy + h * 0.09, w * 0.09, h * 0.035, 0, 0, Math.PI); g.fill();
    g.fillStyle = C.dark ? '#0a0f10' : '#4d5752'; g.beginPath(); g.ellipse(wx, wy, w * 0.07, h * 0.026, 0, 0, 7); g.fill();
    g.fillStyle = C.dark ? '#3f5a45' : '#6f8f68'; for (var m = 0; m < 9; m++) g.fillRect(wx - w * 0.09 + R[m] * w * 0.18, wy + R[m + 9] * h * 0.08, w * 0.012, h * 0.01);
  };

  // 10.4 sạp vải đổ sụp, mép vải lay trong gió trưa
  ART.fallenstall = function (g, w, h, t, R) {
    sky(g, w, h, 'noon', 0.5);
    g.fillStyle = C.dark ? '#6d5a44' : '#e0c49a'; g.fillRect(0, h * 0.5, w, h * 0.5);
    var col = sil('noon');
    g.fillStyle = col; g.fillRect(w * 0.08, h * 0.2, w * 0.008, h * 0.4); g.beginPath(); g.moveTo(w * 0.04, h * 0.22); g.lineTo(w * 0.15, h * 0.14); g.lineTo(w * 0.26, h * 0.22); g.fill();
    g.save(); g.translate(w * 0.44, h * 0.62); g.rotate(0.6); g.fillRect(-w * 0.004, -h * 0.3, w * 0.008, h * 0.3); g.restore();
    g.save(); g.translate(w * 0.72, h * 0.64); g.rotate(-0.9); g.fillRect(-w * 0.004, -h * 0.28, w * 0.008, h * 0.28); g.restore();
    // mái lá sụp nghiêng
    g.beginPath(); g.moveTo(w * 0.36, h * 0.66); g.lineTo(w * 0.6, h * 0.48); g.lineTo(w * 0.84, h * 0.7); g.lineTo(w * 0.8, h * 0.74); g.fill();
    // đống vải nhiều màu, mép vải bay
    var cl = C.dark ? ['#5a3a3a', '#3a4a5a', '#5a5a3a'] : ['#b06a5a', '#5a7a9a', '#b0a05a'];
    for (var i = 0; i < 3; i++) {
      var fl = Math.sin(t * 2.2 + i * 1.3) * h * 0.02 + Math.sin(t * 5 + i) * h * 0.006;
      g.fillStyle = cl[i]; g.beginPath(); g.moveTo(w * (0.38 + i * 0.1), h * 0.74); g.quadraticCurveTo(w * (0.45 + i * 0.1), h * (0.6 + i * 0.02), w * (0.55 + i * 0.1), h * 0.74 + fl); g.lineTo(w * (0.6 + i * 0.1), h * 0.86 + fl); g.lineTo(w * (0.36 + i * 0.1), h * 0.86); g.fill();
    }
    g.fillStyle = rgba('#000000', C.dark ? 0.3 : 0.12); g.fillRect(w * 0.32, h * 0.86, w * 0.6, h * 0.03);
    g.fillStyle = rgba('#fff6dc', 0.07 + 0.04 * Math.sin(t * 3)); g.fillRect(0, h * 0.48, w, h * 0.1);
  };

  // 10.5 sạp thuốc dưới gốc gạo: chùm lá khô treo đung đưa, lọ sành, cân tiểu ly
  ART.herbstall = function (g, w, h, t, R) {
    sky(g, w, h, 'noon', 0.5);
    g.fillStyle = C.dark ? '#3d3830' : '#cfc0a2'; g.fillRect(0, h * 0.6, w, h * 0.4);
    var col = sil('noon');
    // cây gạo già: thân to, cành xoè ngang, che bóng
    g.fillStyle = col; g.fillRect(w * 0.78, 0, w * 0.08, h * 0.65);
    g.beginPath(); g.ellipse(w * 0.55, -h * 0.02, w * 0.6, h * 0.2, 0, 0, 7); g.fill();
    g.fillStyle = rgba('#000000', C.dark ? 0.45 : 0.22); g.fillRect(0, 0, w, h);
    // mái lá dày
    g.fillStyle = col; g.beginPath(); g.moveTo(w * 0.08, h * 0.3); g.lineTo(w * 0.4, h * 0.18); g.lineTo(w * 0.74, h * 0.3); g.lineTo(w * 0.74, h * 0.34); g.lineTo(w * 0.08, h * 0.34); g.fill();
    g.fillRect(w * 0.12, h * 0.3, w * 0.008, h * 0.4); g.fillRect(w * 0.7, h * 0.3, w * 0.008, h * 0.4);
    // chùm lá khô
    g.strokeStyle = col; g.lineWidth = 1;
    for (var b = 0; b < 7; b++) {
      var bx = w * (0.16 + b * 0.08), sw = Math.sin(t * 0.9 + b * 1.1) * w * 0.006, len = h * (0.1 + R[b] * 0.06);
      g.beginPath(); g.moveTo(bx, h * 0.34); g.lineTo(bx + sw, h * 0.34 + len * 0.3); g.stroke();
      g.fillStyle = C.dark ? ['#4a4a32', '#5a4632', '#3a4a3a'][b % 3] : ['#8a8a5a', '#9a7a4a', '#6a8a6a'][b % 3];
      g.beginPath(); g.moveTo(bx + sw - w * 0.012, h * 0.34 + len * 0.3); g.lineTo(bx + sw * 1.6 + w * 0.012, h * 0.34 + len * 0.3); g.lineTo(bx + sw * 2, h * 0.34 + len); g.fill();
    }
    // mặt sạp, lọ sành, túi vải, cân đồng
    g.fillStyle = C.dark ? '#2a221a' : '#6e5a42'; g.fillRect(w * 0.1, h * 0.66, w * 0.62, h * 0.04);
    for (var j = 0; j < 4; j++) { var jx = w * (0.16 + j * 0.07); g.fillStyle = C.dark ? '#4a3a2e' : '#8a6a4e'; g.beginPath(); g.ellipse(jx, h * 0.63, w * 0.022, h * 0.04, 0, 0, 7); g.fill(); g.fillStyle = C.dark ? '#3a4a2a' : '#7a9a5a'; g.fillRect(jx - w * 0.008, h * 0.58, w * 0.016, h * 0.015); }
    g.strokeStyle = C.dark ? '#8a6a32' : '#8a6a2a'; g.lineWidth = Math.max(1.5, w / 300);
    var tilt = Math.sin(t * 0.7) * 0.06, sx = w * 0.56, sy = h * 0.56;
    g.beginPath(); g.moveTo(sx, h * 0.66); g.lineTo(sx, sy); g.stroke();
    g.save(); g.translate(sx, sy); g.rotate(tilt); g.beginPath(); g.moveTo(-w * 0.06, 0); g.lineTo(w * 0.06, 0); g.stroke();
    [-1, 1].forEach(function (s) { g.beginPath(); g.moveTo(s * w * 0.06, 0); g.lineTo(s * w * 0.06, h * 0.04); g.stroke(); g.beginPath(); g.ellipse(s * w * 0.06, h * 0.045, w * 0.02, h * 0.006, -tilt, 0, 7); g.stroke(); });
    g.restore();
  };

  /* ---------- bóng nhân vật: chỉ dáng, không vẽ mặt ----------
     Leon cao nhất (hoodie tối, tóc đen rẽ ngôi lệch), Luke thấp hơn Leon (gầy, tóc nâu rối, kiếm tre sau lưng),
     Clevia nhỏ hơn (tóc đen dài buộc lệch một bên, kẹp tóc trắng, áo khoác đỏ rượu). */
  var HT = { leon: 1, luke: 0.95, clevia: 0.86 };
  function limb(g, pts, w0, w1) { // chi thon dần: vẽ thành một dải đặc
    var L = [], Rr = [];
    for (var i = 0; i < pts.length; i++) {
      var a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
      var ww = (w0 + (w1 - w0) * i / (pts.length - 1)) / 2, nx = -dy / d * ww, ny = dx / d * ww;
      L.push([pts[i][0] + nx, pts[i][1] + ny]); Rr.unshift([pts[i][0] - nx, pts[i][1] - ny]);
    }
    var P = L.concat(Rr); g.beginPath(); g.moveTo(P[0][0], P[0][1]); for (var k = 1; k < P.length; k++) g.lineTo(P[k][0], P[k][1]); g.closePath(); g.fill();
    var e = pts[pts.length - 1]; g.beginPath(); g.arc(e[0], e[1], w1 / 2, 0, 7); g.fill();
    var s0 = pts[0]; g.beginPath(); g.arc(s0[0], s0[1], w0 / 2, 0, 7); g.fill();
  }
  function figure(g, who, x, base, H, o) {
    o = o || {}; var s = H * (HT[who] || 1), col = o.col || (C.dark ? '#040607' : '#2c3432'), back = o.back, t = o.t || 0;
    g.save(); g.translate(x, base); if (o.flip) g.scale(-1, 1);
    g.fillStyle = col; g.strokeStyle = col;
    var sh = s * (who === 'clevia' ? 0.095 : who === 'luke' ? 0.105 : 0.125); // nửa bề ngang vai
    var hip = -s * 0.47, hw = sh * 0.72, step = o.step || 0;
    // chân: đùi và cẳng thon dần
    limb(g, [[-hw * 0.5, hip], [-hw * 0.55 - step * s * 0.05, -s * 0.24], [-hw * 0.5 - step * s * 0.08, -s * 0.02]], s * 0.085, s * 0.05);
    limb(g, [[hw * 0.5, hip], [hw * 0.55 + step * s * 0.05, -s * 0.24], [hw * 0.55 + step * s * 0.1, -s * 0.02]], s * 0.085, s * 0.05);
    g.beginPath(); g.ellipse(-hw * 0.5 - step * s * 0.08 + s * 0.012, -s * 0.012, s * 0.035, s * 0.014, 0, 0, 7); g.fill();
    g.beginPath(); g.ellipse(hw * 0.55 + step * s * 0.1 + s * 0.012, -s * 0.012, s * 0.035, s * 0.014, 0, 0, 7); g.fill();
    // thân (xoay quanh hông khi cúi)
    g.save(); g.translate(0, hip); g.rotate(o.bend || 0);
    var top = -s * 0.32;
    g.beginPath();
    if (who === 'clevia') { // áo khoác loe nhẹ ở vạt, eo thon
      g.moveTo(-hw * 1.15, s * 0.06); g.quadraticCurveTo(-hw * 0.8, -s * 0.12, -sh, top + s * 0.03); g.quadraticCurveTo(-sh * 0.9, top - s * 0.01, -s * 0.03, top);
      g.lineTo(s * 0.03, top); g.quadraticCurveTo(sh * 0.9, top - s * 0.01, sh, top + s * 0.03); g.quadraticCurveTo(hw * 0.8, -s * 0.12, hw * 1.15, s * 0.06);
    } else if (who === 'leon') { // hoodie rộng, vai xuôi, gấu áo bo
      g.moveTo(-hw * 1.1, s * 0.03); g.quadraticCurveTo(-sh * 1.05, -s * 0.15, -sh, top + s * 0.05); g.quadraticCurveTo(-sh * 0.85, top - s * 0.015, -s * 0.03, top);
      g.lineTo(s * 0.03, top); g.quadraticCurveTo(sh * 0.85, top - s * 0.015, sh, top + s * 0.05); g.quadraticCurveTo(sh * 1.05, -s * 0.15, hw * 1.1, s * 0.03);
    } else { // gầy, áo suông
      g.moveTo(-hw * 0.95, s * 0.02); g.quadraticCurveTo(-sh * 0.9, -s * 0.15, -sh, top + s * 0.04); g.quadraticCurveTo(-sh * 0.8, top - s * 0.01, -s * 0.03, top);
      g.lineTo(s * 0.03, top); g.quadraticCurveTo(sh * 0.8, top - s * 0.01, sh, top + s * 0.04); g.quadraticCurveTo(sh * 0.9, -s * 0.15, hw * 0.95, s * 0.02);
    }
    g.closePath(); g.fill();
    // tay
    var aw = s * (who === 'leon' ? 0.06 : 0.05), arms = o.arms || 'down', ay = top + s * 0.035;
    var A = {
      down: [[[-sh * 0.92, ay], [-sh * 1.1, ay + s * 0.15], [-sh * 1.05, ay + s * 0.3]], [[sh * 0.92, ay], [sh * 1.1, ay + s * 0.15], [sh * 1.05, ay + s * 0.3]]],
      pockets: [[[-sh * 0.92, ay], [-sh * 1.12, ay + s * 0.15], [-sh * 0.75, ay + s * 0.24]], [[sh * 0.92, ay], [sh * 1.12, ay + s * 0.15], [sh * 0.75, ay + s * 0.24]]],
      reach: [[[-sh * 0.9, ay], [-sh * 0.7, ay + s * 0.15], [-sh * 0.3, ay + s * 0.28]], [[sh * 0.9, ay], [sh * 0.9, ay + s * 0.16], [sh * 0.6, ay + s * 0.3]]],
      pinned: [[[-sh * 0.9, ay], [-sh * 0.98, ay + s * 0.15], [-sh * 0.85, ay + s * 0.28]], [[sh * 0.9, ay], [sh * 0.98, ay + s * 0.15], [sh * 0.85, ay + s * 0.28]]]
    }[arms];
    A.forEach(function (p) { limb(g, p, aw, aw * 0.7); });
    if (who === 'luke' && o.bandage) { g.fillStyle = rgba('#e8e2d4', 0.5); var bp = A[0][1]; g.save(); g.translate(bp[0], bp[1] + s * 0.04); g.rotate(0.2); g.fillRect(-aw * 0.52, -s * 0.02, aw * 1.04, s * 0.04); g.restore(); g.fillStyle = col; }
    if (who === 'luke' && o.sword !== false) { g.save(); g.translate(0, top + s * 0.16); g.rotate(-0.75); g.fillRect(-s * 0.009, -s * 0.3, s * 0.018, s * 0.5); g.fillRect(-s * 0.02, -s * 0.31, s * 0.04, s * 0.012); g.restore(); }
    // cổ, đầu
    g.fillRect(-s * 0.022, top - s * 0.045, s * 0.044, s * 0.06);
    var hy = top - s * 0.095, hr = s * 0.062;
    g.beginPath(); g.ellipse(0, hy, hr * 0.92, hr * 1.1, 0, 0, 7); g.fill();
    if (who === 'clevia') {
      var sway = Math.sin(t * 1.3) * s * 0.008;
      g.beginPath(); g.moveTo(-hr * 1.0, hy - hr * 0.5); g.quadraticCurveTo(-hr * 1.25, hy + hr * 0.8, -hr * 0.95, hy + hr * 1.7); g.lineTo(-hr * 0.4, hy + hr * 0.6); g.fill(); // tóc mái và tóc hai bên
      g.beginPath(); g.moveTo(hr * 0.55, hy - hr * 0.85); g.bezierCurveTo(hr * 1.9 + sway, hy - hr * 0.2, hr * 1.5 + sway * 2, hy + hr * 2.6, hr * 1.25 + sway * 3, hy + hr * 4.2); g.bezierCurveTo(hr * 0.9 + sway, hy + hr * 2.4, hr * 1.0, hy + hr * 0.6, hr * 0.4, hy - hr * 0.1); g.fill(); // chùm tóc dài buộc lệch
      g.beginPath(); g.ellipse(0, hy - hr * 0.35, hr * 1.02, hr * 0.85, 0, Math.PI, 0); g.fill();
      g.fillStyle = C.dark ? '#d8d4ca' : '#f4f1ea'; g.beginPath(); g.ellipse(hr * 0.8, hy - hr * 0.7, s * 0.014, s * 0.009, 0.6, 0, 7); g.ellipse(hr * 1.0, hy - hr * 0.55, s * 0.012, s * 0.008, -0.4, 0, 7); g.fill(); // kẹp tóc trắng
    } else if (who === 'luke') {
      g.beginPath(); g.ellipse(0, hy - hr * 0.3, hr * 1.05, hr * 0.9, 0, Math.PI, 0); g.fill();
      for (var k = -3; k <= 3; k++) { var bx = k * hr * 0.3, tip = hr * (1.35 + 0.25 * ((k + 7) % 3) / 2); g.beginPath(); g.moveTo(bx - hr * 0.25, hy - hr * 0.6); g.lineTo(bx + hr * 0.12 * (k >= 0 ? 1 : -1), hy - tip); g.lineTo(bx + hr * 0.25, hy - hr * 0.6); g.fill(); }
    } else if (who === 'leon') {
      if (o.hood) { // mũ trùm kéo lên che gần hết mặt
        g.beginPath(); g.moveTo(-sh * 0.55, top + s * 0.01); g.quadraticCurveTo(-hr * 1.45, hy + hr * 0.2, -hr * 1.3, hy - hr * 0.6); g.quadraticCurveTo(-hr * 1.2, hy - hr * 1.6, hr * 0.05, hy - hr * 1.55); g.quadraticCurveTo(hr * 1.25, hy - hr * 1.5, hr * 1.3, hy - hr * 0.5); g.quadraticCurveTo(hr * 1.4, hy + hr * 0.3, sh * 0.55, top + s * 0.01); g.fill();
        g.strokeStyle = rgba(C.dark ? '#9fb6c0' : '#ffffff', 0.22); g.lineWidth = Math.max(1, s * 0.006); g.beginPath(); g.moveTo(-hr * 1.3, hy - hr * 0.6); g.quadraticCurveTo(-hr * 1.2, hy - hr * 1.6, hr * 0.05, hy - hr * 1.55); g.stroke(); // ánh trăng viền mũ trùm
        g.fillStyle = rgba('#000000', 0.5); g.beginPath(); g.ellipse(hr * 0.15, hy + hr * 0.1, hr * 0.75, hr * 0.95, 0, 0, 7); g.fill(); g.fillStyle = col; // khoảng tối trong mũ
      } else { // tóc ngắn rẽ ngôi lệch, mái hất sang một bên
        g.beginPath(); g.moveTo(-hr * 0.95, hy - hr * 0.1); g.bezierCurveTo(-hr * 1.1, hy - hr * 1.4, hr * 0.2, hy - hr * 1.6, hr * 0.95, hy - hr * 0.9); g.quadraticCurveTo(hr * 1.2, hy - hr * 0.4, hr * 0.95, hy - hr * 0.1); g.quadraticCurveTo(hr * 0.5, hy - hr * 0.75, -hr * 0.3, hy - hr * 0.7); g.fill();
      }
    }
    g.restore();
    g.restore();
  }
  // sợi xích vẽ theo đường cong bậc hai, mắt xích xoay theo hướng sợi
  function chainCurve(g, sx, sy, cx, cy, ex, ey, link, col) {
    g.strokeStyle = col; g.lineWidth = Math.max(1, link * 0.22);
    var len = Math.hypot(cx - sx, cy - sy) + Math.hypot(ex - cx, ey - cy), n = Math.max(4, Math.floor(len / (link * 1.3)));
    for (var k = 0; k <= n; k++) {
      var u = k / n, x = (1 - u) * (1 - u) * sx + 2 * (1 - u) * u * cx + u * u * ex, y = (1 - u) * (1 - u) * sy + 2 * (1 - u) * u * cy + u * u * ey;
      var dx = 2 * (1 - u) * (cx - sx) + 2 * u * (ex - cx), dy = 2 * (1 - u) * (cy - sy) + 2 * u * (ey - cy);
      g.save(); g.translate(x, y); g.rotate(Math.atan2(dy, dx)); g.beginPath(); g.ellipse(0, 0, link * 0.75, k % 2 ? link * 0.12 : link * 0.38, 0, 0, 7); g.stroke(); g.restore();
    }
  }

  // 06.6 dưới tán đa: những sợi xích căng từ mặt đất vút lên tán lá, bóng một khối treo đung đưa trên sỏi
  ART.leonbelow = function (g, w, h, t, R) {
    sky(g, w, h, 'night', 0.7);
    var hz = h * 0.78, col = sil('night');
    g.fillStyle = C.dark ? '#0e1416' : '#c2b9a0'; g.fillRect(0, hz, w, h - hz);
    g.fillStyle = C.dark ? '#1a2224' : '#a89f86'; for (var p = 0; p < 40; p++) g.fillRect(R[p] * w, hz + R[p + 40] * (h - hz), 2, 1.5);
    var star = rgba(C.dark ? '#d9eef0' : '#ffffff', 0.6); g.fillStyle = star; for (var s2 = 0; s2 < 7; s2++) { g.globalAlpha = Math.max(0, Math.sin(t + s2 * 2)); g.fillRect(R[s2 + 50] * w, h * (0.25 + R[s2 + 60] * 0.25), 1.5, 1.5); } g.globalAlpha = 1;
    var sway = Math.sin(t * 0.7);
    // bóng khối người treo in trên sỏi, đung đưa theo xích
    var bx = w * 0.4 + sway * w * 0.02, by = hz + h * 0.12;
    var sg = g.createRadialGradient(bx, by, 0, bx, by, w * 0.16); sg.addColorStop(0, rgba('#000000', C.dark ? 0.8 : 0.45)); sg.addColorStop(1, rgba('#000000', 0));
    g.save(); g.translate(bx, by); g.scale(1, 0.28); g.translate(-bx, -by); g.fillStyle = sg; g.fillRect(bx - w * 0.16, by - w * 0.16, w * 0.32, w * 0.32); g.restore();
    // tán đa và rễ phụ
    g.fillStyle = col; for (var c = 0; c < 9; c++) { g.beginPath(); g.ellipse(w * (0.1 + c * 0.1) + Math.sin(t * 0.4 + c) * 3, -h * 0.02 + h * 0.06 * Math.sin(c * 1.7), w * 0.12, h * 0.15, 0, 0, 7); g.fill(); }
    g.fillRect(w * 0.06, 0, w * 0.06, hz + h * 0.02);
    g.strokeStyle = col; g.lineWidth = 1; for (var r = 0; r < 18; r++) { var rx = R[r] * w, sw = Math.sin(t * 0.6 + r) * 3; g.beginPath(); g.moveTo(rx, 0); g.quadraticCurveTo(rx + sw, h * 0.2, rx + sw * 1.5, h * (0.2 + R[r + 18] * 0.35)); g.stroke(); }
    // xích: từ mép dưới bên phải (nơi người con trai đứng, ngoài khung) vút lên, căng, rồi buông thẳng xuống từ cành
    var chain = C.dark ? '#9aa6a6' : '#3a4442', link = Math.max(4, h * 0.018);
    chainCurve(g, w * 0.9, h * 1.02, w * 0.75, h * 0.3, w * 0.46 + sway * w * 0.01, h * 0.12, link, chain);
    chainCurve(g, w * 0.94, h * 1.02, w * 0.8, h * 0.4, w * 0.5 + sway * w * 0.01, h * 0.16, link, chain);
    chainCurve(g, w * 0.4 + sway * w * 0.02, h * 0.12, w * 0.4 + sway * w * 0.025, h * 0.3, w * 0.4 + sway * w * 0.03, h * 0.52, link, chain);
    chainCurve(g, w * 0.36 + sway * w * 0.02, h * 0.1, w * 0.36 + sway * w * 0.025, h * 0.28, w * 0.36 + sway * w * 0.03, h * 0.47, link, chain);
    chainCurve(g, w * 0.44 + sway * w * 0.02, h * 0.12, w * 0.44 + sway * w * 0.025, h * 0.3, w * 0.44 + sway * w * 0.03, h * 0.5, link, chain);
    // ba đầu xích cuộn lại thành mấy vòng quấn ngang, như còn đang siết quanh một thứ gì vô hình
    g.strokeStyle = chain; g.lineWidth = Math.max(1.2, link * 0.25);
    for (var q = 0; q < 5; q++) { g.beginPath(); g.ellipse(w * 0.4 + sway * w * 0.03, h * (0.45 + q * 0.03), w * 0.052, h * 0.012, (q % 2 ? 0.12 : -0.1) + 0.04 * sway, 0, 7); g.stroke(); }
    var gy = ((t * 0.45) % 1.3) * h; glow(g, w * 0.82, h - gy, h * 0.12, '#d9eef0', 0.2);
    fog(g, w, h, t, hz, 0.12, R);
  };

  // 07.7 ruộng sương sớm: hai vệt gợn nước lội chậm qua những luống mạ, nón lá được nhặt dần, chồng lên trên bờ
  ART.wade = function (g, w, h, t, R) {
    sky(g, w, h, 'dawn', 0.4);
    var hz = h * 0.38;
    hills(g, w, h, hz, h * 0.06, rgba(sil('dawn'), 0.5), 9);
    var wg = g.createLinearGradient(0, hz, 0, h); wg.addColorStop(0, C.dark ? '#3d4b46' : '#c9d4cc'); wg.addColorStop(1, C.dark ? '#18211f' : '#8f9d92');
    g.fillStyle = wg; g.fillRect(0, hz, w, h - hz);
    g.strokeStyle = C.dark ? '#57704c' : '#6d8f55'; g.lineWidth = 1;
    for (var r = 0; r < 6; r++) for (var c = 0; c < 20; c++) { var y = hz + (h - hz) * Math.pow((r + 1) / 7, 1.4), x = (c + (r % 2) * 0.5) / 20 * w, s = 2 + r * 1.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x - s * 0.4, y - s); g.moveTo(x, y); g.lineTo(x + s * 0.4, y - s); g.stroke(); }
    // bờ ruộng bên trái, chồng nón lớn dần theo vòng 16 giây
    var cyc = (t % 16) / 16, pile = Math.floor(cyc * 7);
    g.fillStyle = C.dark ? '#2b2a22' : '#9a8f76'; g.beginPath(); g.moveTo(0, h * 0.55); g.lineTo(w * 0.2, h * 0.5); g.lineTo(w * 0.24, h * 0.56); g.lineTo(0, h * 0.64); g.fill();
    for (var k = 0; k < pile; k++) { var py = h * 0.53 - k * h * 0.012; g.fillStyle = k % 2 ? (C.dark ? '#a49a76' : '#e6dab2') : (C.dark ? '#8f8664' : '#d6c99e'); g.beginPath(); g.moveTo(w * 0.07, py); g.lineTo(w * 0.11, py - h * 0.03); g.lineTo(w * 0.15, py); g.fill(); }
    // hai đường lội: gợn nước nối đuôi theo hai luống
    [[0.3, 0.92, 0.62, 0.58], [0.55, 0.95, 0.85, 0.6]].forEach(function (ln, i) {
      var u = (cyc + i * 0.08) % 1;
      for (var k = 0; k < 5; k++) {
        var v = Math.max(0, u - k * 0.05), x = w * (ln[0] + (ln[2] - ln[0]) * v), y = h * (ln[1] + (ln[3] - ln[1]) * v), age = k / 5, sc = 0.5 + 0.5 * (y / h);
        g.strokeStyle = rgba(C.dark ? '#c9d6d2' : '#ffffff', 0.45 * (1 - age)); g.beginPath(); g.ellipse(x, y, w * (0.02 + age * 0.05) * sc, w * (0.02 + age * 0.05) * sc * 0.22, 0, 0, 7); g.stroke();
      }
    });
    // nón còn trôi, cái nào ở gần vệt lội thì lặn mất (đã được nhặt)
    for (var n = 0; n < 8; n++) {
      var nx = w * (0.3 + R[n] * 0.62) + Math.sin(t * 0.25 + n) * w * 0.008, ny = h * (0.58 + R[n + 8] * 0.34);
      if (n / 8 < cyc * 0.9) continue;
      g.fillStyle = C.dark ? '#a49a76' : '#e6dab2'; g.beginPath(); g.ellipse(nx, ny, w * 0.03, w * 0.009, 0, 0, 7); g.fill();
      g.fillStyle = C.dark ? '#7f7658' : '#cbbd8f'; g.beginPath(); g.moveTo(nx - w * 0.026, ny); g.lineTo(nx, ny - w * 0.017); g.lineTo(nx + w * 0.026, ny); g.fill();
    }
    fog(g, w, h, t, hz + h * 0.05, 0.3, R);
  };

  // 08.9 hai ngả đường: khu giữa có mái nhà họp, khu Mỏ có núi đá và lò rèn bốc khói
  ART.twoways = function (g, w, h, t, R) {
    sky(g, w, h, 'day', 0.6);
    var hz = h * 0.55, col = sil('day');
    hills(g, w * 0.5, h, hz, h * 0.05, rgba(col, 0.4), 3);
    // khu Mỏ: núi đá lởm chởm, lò rèn bốc khói
    g.fillStyle = rgba(col, 0.7); g.beginPath(); g.moveTo(w * 0.55, hz); g.lineTo(w * 0.68, hz - h * 0.28); g.lineTo(w * 0.74, hz - h * 0.18); g.lineTo(w * 0.83, hz - h * 0.36); g.lineTo(w * 1.0, hz - h * 0.1); g.lineTo(w, hz); g.fill();
    g.fillStyle = col; g.fillRect(w * 0.8, hz - h * 0.06, w * 0.05, h * 0.06); g.fillRect(w * 0.83, hz - h * 0.12, w * 0.012, h * 0.06);
    wisp(g, w * 0.836, hz - h * 0.12, h * 0.3, t, C.dark ? '#7d8a88' : '#bfc4c0', 0.4);
    // khu giữa: mái cong nhà họp làng
    g.fillStyle = rgba(col, 0.75); g.fillRect(w * 0.2, hz - h * 0.08, w * 0.16, h * 0.08);
    g.beginPath(); g.moveTo(w * 0.17, hz - h * 0.06); g.quadraticCurveTo(w * 0.2, hz - h * 0.09, w * 0.22, hz - h * 0.14); g.lineTo(w * 0.34, hz - h * 0.14); g.quadraticCurveTo(w * 0.36, hz - h * 0.09, w * 0.39, hz - h * 0.06); g.fill();
    g.fillStyle = C.dark ? '#3a3a2e' : '#cdbf9a'; g.fillRect(0, hz, w, h - hz);
    // hai ngả đường
    g.fillStyle = C.dark ? '#4a473a' : '#e0d6b8';
    g.beginPath(); g.moveTo(w * 0.42, h); g.lineTo(w * 0.58, h); g.lineTo(w * 0.53, h * 0.75); g.lineTo(w * 0.3, hz); g.lineTo(w * 0.27, hz); g.lineTo(w * 0.47, h * 0.75); g.fill();
    g.beginPath(); g.moveTo(w * 0.5, h * 0.75); g.lineTo(w * 0.53, h * 0.75); g.lineTo(w * 0.8, hz); g.lineTo(w * 0.77, hz); g.fill();
    // hai hàng vết chân dừng lại ở chỗ rẽ
    g.fillStyle = rgba('#000000', C.dark ? 0.35 : 0.2);
    for (var f = 0; f < 6; f++) { var u = f / 5, fy = h * (1.0 - u * 0.24), sc = 1 - u * 0.5; [[-0.035, 0], [0.035, 0.5]].forEach(function (q) { var fx = w * (0.5 + q[0] * sc) + (f % 2 ? 1 : -1) * w * 0.008 * sc; g.beginPath(); g.ellipse(fx, fy - q[1] * h * 0.02, w * 0.007 * sc, h * 0.012 * sc, 0, 0, 7); g.fill(); }); }
    clouds(g, w, h, t, 0.25, R);
  };

  /* ---------- chương 11: khu Mỏ, cổng hầm (24/11) ---------- */
  // đất đá xám khu Mỏ: núi lởm chởm, đụn đá vụn, bụi bay
  function mineLand(g, w, h, t, R, hz) {
    sky(g, w, h, 'noon', 0.6);
    var col = sil('noon');
    g.fillStyle = rgba(col, 0.45); g.beginPath(); g.moveTo(0, hz); g.lineTo(w * 0.12, hz - h * 0.2); g.lineTo(w * 0.22, hz - h * 0.12); g.lineTo(w * 0.38, hz - h * 0.3); g.lineTo(w * 0.5, hz - h * 0.16); g.lineTo(w * 0.66, hz - h * 0.34); g.lineTo(w * 0.8, hz - h * 0.14); g.lineTo(w, hz - h * 0.24); g.lineTo(w, hz); g.fill();
    g.fillStyle = C.dark ? '#3c3c38' : '#b9b5a6'; g.fillRect(0, hz, w, h - hz);
  }
  function rubble(g, x, base, wd, ht, col) {
    g.fillStyle = col; g.beginPath(); g.moveTo(x - wd / 2, base);
    for (var i = 0; i <= 8; i++) { var u = i / 8; g.lineTo(x - wd / 2 + wd * u, base - ht * Math.sin(u * Math.PI) * (0.85 + 0.15 * Math.sin(i * 2.7))); }
    g.fill();
  }
  function dust(g, w, h, t, R, y0, n) {
    g.fillStyle = rgba(C.dark ? '#9a9a90' : '#f2efe4', 0.5);
    for (var d = 0; d < n; d++) { var x = ((R[d] * w + t * (12 + R[d + 40] * 18)) % (w * 1.1)) - w * 0.05, y = y0 + R[d + 80] * (h - y0) + Math.sin(t + d) * 6; g.globalAlpha = 0.2 + 0.4 * Math.abs(Math.sin(t * 0.5 + d)); g.fillRect(x, y, 2, 1.2); }
    g.globalAlpha = 1;
    var sw = (t * 0.06) % 1.4 - 0.2, gr = g.createLinearGradient(w * (sw - 0.3), 0, w * sw, 0); gr.addColorStop(0, rgba(C.dark ? '#5a5a52' : '#ffffff', 0)); gr.addColorStop(1, rgba(C.dark ? '#5a5a52' : '#ffffff', C.dark ? 0.12 : 0.22)); g.fillStyle = gr; g.fillRect(0, y0, w, h - y0);
  }

  // 11.1 tờ giấy giữa bảng, con số mười lăm
  ART.board15 = function (g, w, h, t, R) { board(g, w, h, t, R, true, '15'); };

  // 11.2 khu Mỏ giữa trưa: đồi trọc, đụn đá, con đường mòn, mái lá với ống khói gạch
  ART.mine = function (g, w, h, t, R) {
    var hz = h * 0.55; mineLand(g, w, h, t, R, hz);
    var col = sil('noon');
    g.fillStyle = C.dark ? '#4a4a44' : '#d4d0c0';
    g.beginPath(); g.moveTo(w * 0.4, h); g.lineTo(w * 0.62, h); g.quadraticCurveTo(w * 0.48, h * 0.72, w * 0.7, hz); g.lineTo(w * 0.67, hz); g.quadraticCurveTo(w * 0.42, h * 0.72, w * 0.4, h); g.fill();
    g.fillStyle = col; g.fillRect(w * 0.74, hz - h * 0.07, w * 0.09, h * 0.07);
    g.beginPath(); g.moveTo(w * 0.72, hz - h * 0.065); g.lineTo(w * 0.785, hz - h * 0.12); g.lineTo(w * 0.85, hz - h * 0.065); g.fill();
    g.fillRect(w * 0.81, hz - h * 0.16, w * 0.016, h * 0.09);
    wisp(g, w * 0.818, hz - h * 0.16, h * 0.32, t, C.dark ? '#7d8a88' : '#cfd2cc', 0.45);
    rubble(g, w * 0.15, h * 0.82, w * 0.26, h * 0.16, C.dark ? '#2c2c28' : '#9a968a');
    rubble(g, w * 0.88, h * 0.9, w * 0.3, h * 0.12, C.dark ? '#262622' : '#8f8b80');
    rubble(g, w * 0.32, hz + h * 0.06, w * 0.12, h * 0.05, rgba(col, 0.8));
    dust(g, w, h, t, R, hz, 26);
  };

  // 11.3 đụn đá vụn, dải băng trắng vắt qua hòn đá bay trong gió, vạt áo đỏ phủ dưới chân
  ART.bandage = function (g, w, h, t, R) {
    var hz = h * 0.42; mineLand(g, w, h, t, R, hz);
    rubble(g, w * 0.5, h * 0.86, w * 0.7, h * 0.46, C.dark ? '#2a2a26' : '#96928a');
    g.fillStyle = C.dark ? '#3a3a35' : '#aaa69c'; g.beginPath(); g.ellipse(w * 0.34, h * 0.78, w * 0.1, h * 0.05, -0.1, 0, 7); g.fill(); // hòn đá
    g.fillStyle = C.dark ? '#4a1e1e' : '#7a2a28'; // vạt áo khoác đỏ sẫm
    g.beginPath(); g.moveTo(w * 0.5, h * 0.9); g.quadraticCurveTo(w * 0.56, h * 0.72, w * 0.7, h * 0.74); g.quadraticCurveTo(w * 0.8, h * 0.8, w * 0.84, h * 0.92); g.lineTo(w * 0.5, h * 0.94); g.fill();
    g.strokeStyle = rgba('#000000', 0.25); g.lineWidth = 1; g.beginPath(); g.moveTo(w * 0.62, h * 0.76); g.quadraticCurveTo(w * 0.64, h * 0.84, w * 0.6, h * 0.92); g.stroke();
    // dải băng: vắt qua hòn đá rồi buông, đầu băng lay
    var bw = Math.max(3, h * 0.022); g.strokeStyle = C.dark ? '#d8d4c8' : '#f6f3ea'; g.lineWidth = bw; g.lineCap = 'round';
    g.beginPath(); g.moveTo(w * 0.42, h * 0.84); g.quadraticCurveTo(w * 0.36, h * 0.72, w * 0.3, h * 0.76);
    for (var i = 1; i <= 14; i++) { var u = i / 14, x = w * (0.3 - u * 0.2), y = h * (0.76 - u * 0.02) + Math.sin(t * 3 - u * 6) * h * 0.04 * u + Math.sin(t * 7 - u * 9) * h * 0.008 * u; g.lineTo(x, y); }
    g.stroke();
    dust(g, w, h, t, R, hz, 18);
  };

  // 11.4 sườn dốc, tảng đá lớn, ống khói phía sau; một vệt nắng loé trên mép đá rồi tắt
  ART.glint = function (g, w, h, t, R) {
    var hz = h * 0.6; mineLand(g, w, h, t, R, hz);
    var col = sil('noon');
    g.fillStyle = C.dark ? '#33332e' : '#a8a498'; g.beginPath(); g.moveTo(0, h); g.lineTo(0, h * 0.7); g.quadraticCurveTo(w * 0.5, h * 0.36, w, h * 0.5); g.lineTo(w, h); g.fill(); // dốc
    g.fillStyle = col; g.fillRect(w * 0.76, h * 0.22, w * 0.02, h * 0.2);
    wisp(g, w * 0.77, h * 0.22, h * 0.22, t, C.dark ? '#7d8a88' : '#cfd2cc', 0.35);
    g.fillStyle = C.dark ? '#1d1d1a' : '#6f6c63'; g.beginPath(); g.moveTo(w * 0.52, h * 0.5); g.lineTo(w * 0.56, h * 0.33); g.lineTo(w * 0.66, h * 0.3); g.lineTo(w * 0.72, h * 0.4); g.lineTo(w * 0.7, h * 0.52); g.fill(); // tảng đá
    var cyc = t % 7, k = cyc > 3 && cyc < 3.7 ? Math.sin((cyc - 3) / 0.7 * Math.PI) : 0;
    if (k > 0) { var gx = w * 0.555, gy = h * 0.36; glow(g, gx, gy, w * 0.08, '#ffffff', 0.7 * k); g.strokeStyle = rgba('#ffffff', 0.9 * k); g.lineWidth = 1.5; g.beginPath(); g.moveTo(gx - w * 0.04 * k, gy); g.lineTo(gx + w * 0.04 * k, gy); g.moveTo(gx, gy - h * 0.04 * k); g.lineTo(gx, gy + h * 0.04 * k); g.stroke(); }
    // vết giày đế khía chạy lên dốc
    g.fillStyle = rgba('#000000', C.dark ? 0.35 : 0.18);
    for (var f = 0; f < 7; f++) { var u = f / 6, fx = w * (0.2 + u * 0.3) + (f % 2 ? 1 : -1) * w * 0.01, fy = h * (0.95 - u * 0.42), s = 1 - u * 0.5; g.beginPath(); g.ellipse(fx, fy, w * 0.012 * s, h * 0.01 * s, -0.5, 0, 7); g.fill(); }
    dust(g, w, h, t, R, h * 0.5, 14);
  };

  // 11.5 căn nhà dân mái lá xám khuất sau mỏm đồi, cửa gỗ khép hờ
  ART.minehut = function (g, w, h, t, R) {
    var hz = h * 0.58; mineLand(g, w, h, t, R, hz);
    var bx = w * 0.36, by = h * 0.72, bw = w * 0.32;
    g.fillStyle = C.dark ? '#4a4236' : '#a8977a'; g.fillRect(bx, by - h * 0.18, bw, h * 0.18); // vách đất trộn rơm
    g.fillStyle = C.dark ? '#3a3a34' : '#8c8a80'; g.beginPath(); g.moveTo(bx - bw * 0.12, by - h * 0.17); g.lineTo(bx + bw * 0.15, by - h * 0.34); g.lineTo(bx + bw * 0.85, by - h * 0.34); g.lineTo(bx + bw * 1.12, by - h * 0.17); g.fill(); // mái lá
    g.strokeStyle = rgba('#000000', 0.15); for (var s = 0; s < 10; s++) { g.beginPath(); g.moveTo(bx + bw * (0.15 + s * 0.07), by - h * 0.34); g.lineTo(bx + bw * (0.02 + s * 0.1), by - h * 0.17); g.stroke(); }
    g.fillStyle = C.dark ? '#050606' : '#2a241c'; g.fillRect(bx + bw * 0.42, by - h * 0.13, bw * 0.16, h * 0.13); // khe cửa tối
    g.fillStyle = C.dark ? '#3a2b1e' : '#6e5235'; var op = 0.3 + 0.05 * Math.sin(t * 0.8); g.fillRect(bx + bw * 0.42, by - h * 0.13, bw * 0.16 * (1 - op), h * 0.13);
    rubble(g, w * 0.2, h * 0.9, w * 0.5, h * 0.2, C.dark ? '#2c2c28' : '#9a968a'); // mỏm đồi che phía trước
    dust(g, w, h, t, R, hz, 16);
  };

  // 11.6 trong nhà tối, mép chõng tre, gáo dừa nước ngả hồng, vệt sáng lọt khe vách
  ART.basin = function (g, w, h, t, R) {
    room2(g, w, h, true);
    var beam = g.createLinearGradient(w * 0.2, 0, w * 0.55, h); beam.addColorStop(0, rgba('#fff0c8', C.dark ? 0.16 : 0.3)); beam.addColorStop(1, rgba('#fff0c8', 0));
    g.fillStyle = beam; g.beginPath(); g.moveTo(w * 0.22, 0); g.lineTo(w * 0.25, 0); g.lineTo(w * 0.62, h); g.lineTo(w * 0.5, h); g.fill();
    g.fillStyle = C.dark ? '#2a2216' : '#9a8460'; g.fillRect(0, h * 0.62, w, h * 0.06); // mặt chõng
    g.strokeStyle = rgba('#000000', 0.3); for (var i = 0; i < 18; i++) { g.beginPath(); g.moveTo(i * w / 17, h * 0.62); g.lineTo(i * w / 17, h * 0.68); g.stroke(); }
    var cx = w * 0.55, cy = h * 0.6;
    g.fillStyle = C.dark ? '#3a2a1a' : '#5e4228'; g.beginPath(); g.ellipse(cx, cy, w * 0.11, h * 0.05, 0, 0, Math.PI); g.fill(); // gáo
    g.fillStyle = C.dark ? '#6a4a4e' : '#d9a8a8'; g.beginPath(); g.ellipse(cx, cy, w * 0.1, h * 0.03, 0, 0, 7); g.fill(); // nước hồng nhạt
    g.strokeStyle = rgba('#ffffff', 0.25); var rr = (t * 0.4) % 1; g.beginPath(); g.ellipse(cx, cy, w * 0.1 * rr, h * 0.03 * rr, 0, 0, 7); g.stroke();
    g.fillStyle = C.dark ? '#d8d4c8' : '#f6f3ea'; g.fillRect(w * 0.7, h * 0.585, w * 0.07, h * 0.03); // cuộn băng
    g.fillStyle = C.dark ? '#5a2a2a' : '#c08080'; g.beginPath(); g.moveTo(w * 0.62, h * 0.62); g.quadraticCurveTo(w * 0.6, h * 0.66, w * 0.63, h * 0.7); g.lineTo(w * 0.635, h * 0.62); g.fill(); // giọt nước tràn
    motes(g, w, h, t, R, w * 0.25, w * 0.55, 0, h * 0.6, 14, '#fff0c8');
  };

  // 11.7 bếp than tàn, lưỡi cuốc kê trên đá mài, hòn đá mài đưa đi đưa lại
  ART.whetstone = function (g, w, h, t, R) {
    room2(g, w, h, true);
    g.fillStyle = C.dark ? '#1b1712' : '#6f6352'; g.fillRect(0, h * 0.7, w, h * 0.3);
    var f = 0.6 + 0.4 * Math.sin(t * 1.3) * Math.sin(t * 0.7);
    glow(g, w * 0.2, h * 0.78, w * 0.22, '#d9783a', 0.25 * f);
    g.fillStyle = C.dark ? '#2a1a12' : '#4a3424'; g.beginPath(); g.ellipse(w * 0.2, h * 0.8, w * 0.1, h * 0.03, 0, 0, 7); g.fill();
    g.fillStyle = rgba('#e8892f', 0.6 * f); for (var e = 0; e < 5; e++) g.fillRect(w * (0.15 + e * 0.02), h * 0.79 + Math.sin(e) * 2, 3, 2);
    g.fillStyle = C.dark ? '#4a4a48' : '#7a7a76'; g.beginPath(); g.moveTo(w * 0.45, h * 0.74); g.lineTo(w * 0.82, h * 0.7); g.lineTo(w * 0.84, h * 0.76); g.lineTo(w * 0.47, h * 0.8); g.fill(); // lưỡi cuốc
    g.strokeStyle = rgba('#ffffff', C.dark ? 0.25 : 0.5); g.lineWidth = 1.5; g.beginPath(); g.moveTo(w * 0.47, h * 0.795); g.lineTo(w * 0.84, h * 0.755); g.stroke();
    var sx = w * (0.6 + 0.12 * Math.sin(t * 2.4)); g.fillStyle = C.dark ? '#5a5248' : '#9a9080'; g.fillRect(sx - w * 0.05, h * 0.67, w * 0.1, h * 0.04); // đá mài
    if (Math.abs(Math.cos(t * 2.4)) > 0.9) { g.fillStyle = rgba('#ffd9a0', 0.6); g.fillRect(sx + w * 0.05, h * 0.7, 2, 2); }
  };

  // 11.8 từ trong nhà tối nhìn ra khung cửa chói nắng, bụi lơ lửng trong luồng sáng
  ART.doorway = function (g, w, h, t, R) {
    room2(g, w, h, false);
    var dx = w * 0.38, dw = w * 0.24, dy = h * 0.18, dh = h * 0.64;
    g.fillStyle = C.dark ? '#7a776c' : '#fbf6e6'; g.fillRect(dx, dy, dw, dh);
    g.fillStyle = C.dark ? '#5a5a52' : '#d8d2bc'; g.beginPath(); g.moveTo(dx, dy + dh * 0.62); g.lineTo(dx + dw * 0.4, dy + dh * 0.5); g.lineTo(dx + dw, dy + dh * 0.58); g.lineTo(dx + dw, dy + dh); g.lineTo(dx, dy + dh); g.fill(); // đồi xa ngoài cửa
    var spill = g.createLinearGradient(0, dy + dh, 0, h); spill.addColorStop(0, rgba('#fff4d8', C.dark ? 0.2 : 0.45)); spill.addColorStop(1, rgba('#fff4d8', 0));
    g.fillStyle = spill; g.beginPath(); g.moveTo(dx, dy + dh); g.lineTo(dx + dw, dy + dh); g.lineTo(dx + dw * 1.6, h); g.lineTo(dx - dw * 0.6, h); g.fill();
    g.fillStyle = C.dark ? '#3a2b1e' : '#5e4228'; g.fillRect(dx - w * 0.02, dy, w * 0.02, dh); g.fillRect(dx + dw, dy, w * 0.02, dh); g.fillRect(dx - w * 0.02, dy - h * 0.02, dw + w * 0.04, h * 0.02);
    motes(g, w, h, t, R, dx - dw * 0.4, dx + dw * 1.4, dy, h, 24, '#fff4d8');
  };

  // 11.9 / 11.10 cổng sắt gỉ chân núi: vết xước sáng trên chấn song, ổ khoá, miệng hầm tối, nón cời trên khúc gỗ
  function gate(g, w, h, t, R, open) {
    sky(g, w, h, 'noon', 0.3);
    g.fillStyle = C.dark ? '#2a2a26' : '#8f8b80'; g.fillRect(0, 0, w, h); // vách núi
    g.fillStyle = rgba('#000000', 0.15); for (var c = 0; c < 9; c++) { g.beginPath(); g.moveTo(R[c] * w, 0); g.lineTo(R[c + 9] * w, h * 0.3); g.lineTo(R[c + 18] * w, h * 0.5); g.lineTo(R[c + 9] * w + 3, h * 0.3); g.fill(); }
    var mx = w * 0.5, my = h * 0.78, mw = w * 0.44, mh = h * 0.6;
    g.fillStyle = C.dark ? '#020303' : '#14120f'; g.beginPath(); g.moveTo(mx - mw / 2, my); g.lineTo(mx - mw / 2, my - mh * 0.7); g.quadraticCurveTo(mx, my - mh * 1.15, mx + mw / 2, my - mh * 0.7); g.lineTo(mx + mw / 2, my); g.fill(); // miệng hầm
    g.fillStyle = C.dark ? '#141210' : '#3a2e22'; g.fillRect(mx - mw / 2 - w * 0.04, my - mh * 0.85, w * 0.04, mh * 0.85); g.fillRect(mx + mw / 2, my - mh * 0.85, w * 0.04, mh * 0.85); // trụ gỗ lim
    g.fillStyle = C.dark ? '#3c3c38' : '#b9b5a6'; g.fillRect(0, my, w, h - my); // nền đá
    var bar = C.dark ? '#5a3a2a' : '#7a4a30', n = 9, open0 = open ? 0.35 : 0;
    for (var i = 0; i < n; i++) {
      var u = i / (n - 1), x = mx - mw / 2 + u * mw; if (open && u < 0.5) x = mx - mw / 2 + u * mw * (1 - open0) ; if (open && u >= 0.5) x = mx + mw / 2 - (1 - u) * mw * (1 - open0);
      g.fillStyle = bar; g.fillRect(x - w * 0.006, my - mh * 0.78, w * 0.012, mh * 0.78);
      g.strokeStyle = rgba(C.dark ? '#d8d0c0' : '#f4efe2', 0.55 + 0.2 * Math.sin(t * 0.8 + i)); g.lineWidth = 1; // vết xước sáng
      for (var s = 0; s < 3; s++) { var sy = my - mh * (0.38 + R[i * 3 + s] * 0.2); g.beginPath(); g.moveTo(x - w * 0.006, sy); g.lineTo(x + w * 0.006, sy - h * 0.012); g.stroke(); }
    }
    g.fillStyle = bar; g.fillRect(mx - mw / 2, my - mh * 0.78, mw, h * 0.012); g.fillRect(mx - mw / 2, my - mh * 0.42, mw, h * 0.012);
    var lx = w * 0.82, ly = my + h * 0.06;
    g.fillStyle = C.dark ? '#3a2b1e' : '#6e5235'; g.fillRect(lx - w * 0.08, ly, w * 0.16, h * 0.05); // khúc gỗ
    g.fillStyle = C.dark ? '#4a4432' : '#b8a678'; g.beginPath(); g.moveTo(lx - w * 0.075, ly); g.lineTo(lx - w * 0.02, ly - h * 0.06); g.lineTo(lx + w * 0.01, ly); g.fill(); // nón cời
    var px = open ? lx + w * 0.045 : mx, py = open ? ly - h * 0.01 : my - mh * 0.4, sw = open ? 0 : Math.sin(t * 1.1) * 0.12;
    g.save(); g.translate(px, py); g.rotate(sw);
    if (!open) { g.strokeStyle = C.dark ? '#3a3a38' : '#4a4a46'; g.lineWidth = Math.max(2, w / 200); for (var k = -3; k <= 3; k++) { if (!k) continue; g.beginPath(); g.ellipse(k * w * 0.018, -h * 0.01, w * 0.01, h * 0.008, 0, 0, 7); g.stroke(); } }
    g.fillStyle = C.dark ? '#1a1a18' : '#262420'; g.beginPath(); g.ellipse(0, h * 0.025, w * 0.022, h * 0.028, 0, 0, 7); g.fill(); // ổ khoá
    g.strokeStyle = C.dark ? '#1a1a18' : '#262420'; g.lineWidth = Math.max(2, w / 220); g.beginPath(); g.arc(0, open ? -h * 0.004 : 0, w * 0.012, Math.PI, 0); g.stroke();
    g.restore();
    if (open) { // sợi xích đen bò vào bóng tối
      g.strokeStyle = C.dark ? '#a9b4b4' : '#2e3634'; g.lineWidth = Math.max(1.6, w / 260);
      var lk = Math.max(6, h * 0.022), nl = 26;
      for (var m = 0; m < nl; m++) { var v = m / nl, wig = Math.sin(v * 8 - t * 1.6) * w * 0.025 * (1 - v * 0.5), cx2 = mx - w * 0.16 + v * w * 0.16 + wig, cy2 = h * 0.98 - v * h * 0.42; g.globalAlpha = Math.max(0, 1 - v * 1.05); g.save(); g.translate(cx2, cy2); g.rotate(0.6 + Math.cos(v * 8 - t * 1.6) * 0.3); g.beginPath(); if (m % 2) g.ellipse(0, 0, lk * 0.12, lk * 0.55, 0, 0, 7); else g.ellipse(0, 0, lk * 0.3, lk * 0.55, 0, 0, 7); g.stroke(); g.restore(); }
      g.globalAlpha = 1;
    }
    fog(g, w, h, t, my - mh * 0.3, C.dark ? 0.06 : 0.1, R);
  }
  ART.minegate = function (g, w, h, t, R, o) { gate(g, w, h, t, R, o && o[0] === 'open'); };

  /* ---------- chương 12: trong hầm mỏ (chèn sau art3.js). Không vẽ người, chỉ dấu vết. Lửa đèn dầu giữ màu lửa. ---------- */
  var LAMP = '#ffc982';
  // vách hầm tối nhìn sâu vào trong: hai vách đá, trần thấp, nền đá; trả về điểm tụ
  function shaft(g, w, h, t, R, o) {
    o = o || {};
    var vx = w * (o.vx || 0.5), vy = h * (o.vy || 0.46), dk = C.dark;
    g.fillStyle = dk ? '#07080a' : '#1c1a17'; g.fillRect(0, 0, w, h);
    // vách trái, vách phải, trần, nền: khối đá thô
    function face(pts, col) { g.fillStyle = col; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); g.fill(); }
    var hw = w * 0.06, hh = h * 0.08;
    face([[0, 0], [vx - hw, vy - hh], [vx - hw, vy + hh], [0, h]], dk ? '#121315' : '#3a352e');
    face([[w, 0], [vx + hw, vy - hh], [vx + hw, vy + hh], [w, h]], dk ? '#0f1012' : '#332f29');
    face([[0, 0], [w, 0], [vx + hw, vy - hh], [vx - hw, vy - hh]], dk ? '#0b0c0d' : '#2a2622');
    face([[0, h], [w, h], [vx + hw, vy + hh], [vx - hw, vy + hh]], dk ? '#17171a' : '#4a443b');
    // vân đá
    g.strokeStyle = rgba('#000000', 0.35); g.lineWidth = 1;
    for (var k = 0; k < 26; k++) { var side = k % 2 ? 1 : -1, u = R[k], x = side < 0 ? u * (vx - hw) : w - u * (w - vx - hw), y0 = (R[k + 26] * 0.9 + 0.05) * h; g.beginPath(); g.moveTo(x, y0); g.lineTo(x + side * -8 * (1 - u), y0 + 14 + R[k + 52] * 20); g.stroke(); }
    // cột gỗ chống hai bên, xa dần
    var posts = o.posts == null ? 4 : o.posts;
    for (var p = 0; p < posts; p++) {
      var s = Math.pow(0.55, p), lx = vx - (vx - hw) * s, rx = vx + (w - vx - hw) * s, ty = vy - (vy - hh) * s, by = vy + (h - vy - hh) * s, pw = Math.max(2, w * 0.035 * s);
      g.fillStyle = dk ? '#2b2017' : '#5a4330';
      g.fillRect(lx + pw * 0.2, ty, pw, by - ty); g.fillRect(rx - pw * 1.2, ty, pw, by - ty); g.fillRect(lx, ty, rx - lx, pw * 0.9);
      if (o.lamps !== false && p < 3) {
        var fx = lx + pw * 2.2, fy = ty + (by - ty) * 0.28, fl = 0.85 + 0.15 * Math.sin(t * 7 + p * 2) * Math.sin(t * 13 + p);
        glow(g, fx, fy, w * 0.22 * s + 20, LAMP, (dk ? 0.28 : 0.35) * fl);
        g.fillStyle = rgba('#3a3128', 0.9); g.fillRect(fx - 4 * s - 2, fy - 7 * s - 3, 8 * s + 4, 12 * s + 5); // chụp kính ám khói
        g.fillStyle = rgba('#ffe2a8', 0.9 * fl); g.beginPath(); g.ellipse(fx, fy, 1.6 + 2 * s, 3 + 4 * s, 0, 0, 7); g.fill();
      }
    }
    // tối dần vào sâu
    var dp = g.createRadialGradient(vx, vy, 0, vx, vy, Math.max(w, h) * 0.18); dp.addColorStop(0, rgba('#000000', o.light ? 0 : 0.9)); dp.addColorStop(1, rgba('#000000', 0)); g.fillStyle = dp; g.fillRect(0, 0, w, h);
    return { vx: vx, vy: vy, hw: hw, hh: hh };
  }
  function vign(g, w, h, a) { var gr = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.25, w / 2, h / 2, Math.max(w, h) * 0.7); gr.addColorStop(0, rgba('#000000', 0)); gr.addColorStop(1, rgba('#000000', a)); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
  // xích mảnh đen trườn theo một đường cong
  function chainPath(g, pts, t, lk, a) {
    g.save(); g.globalAlpha = a == null ? 1 : a; g.strokeStyle = C.dark ? '#a9b4ba' : '#14181b'; g.lineWidth = Math.max(1.6, lk * 0.2); g.shadowColor = C.dark ? 'rgba(200,215,225,.35)' : 'rgba(255,220,170,.35)'; g.shadowBlur = 3;
    for (var i = 0; i < pts.length; i++) { var p = pts[i], q = pts[Math.min(pts.length - 1, i + 1)], an = Math.atan2(q[1] - p[1], q[0] - p[0]); g.save(); g.translate(p[0], p[1]); g.rotate(an); g.beginPath(); if (i % 2) g.ellipse(0, 0, lk * 0.55, lk * 0.13, 0, 0, 7); else g.ellipse(0, 0, lk * 0.55, lk * 0.32, 0, 0, 7); g.stroke(); g.restore(); }
    g.restore();
  }
  function rock(g, x, y, r, R, k, col) {
    g.fillStyle = col; g.beginPath();
    for (var i = 0; i < 7; i++) { var a = i / 7 * 6.283, rr = r * (0.75 + 0.35 * R[(k * 7 + i) % 240]); g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.8); }
    g.closePath(); g.fill();
    g.fillStyle = rgba('#ffffff', C.dark ? 0.04 : 0.08); g.beginPath(); g.ellipse(x - r * 0.25, y - r * 0.3, r * 0.4, r * 0.18, -0.3, 0, 7); g.fill();
  }

  // 12.1 đường hầm: đèn dầu chụp kính ám khói trên cột gỗ, sợi xích mảnh trườn trên nền đá
  ART.tunnel = function (g, w, h, t, R) {
    var s = shaft(g, w, h, t, R);
    var pts = []; for (var i = 0; i < 34; i++) { var u = i / 33, y = h * 0.98 - u * (h * 0.98 - s.vy - s.hh) * 0.8, x = s.vx + Math.sin(u * 9 - t * 1.5) * w * 0.05 * (1 - u) + (1 - u) * w * 0.05; pts.push([x, y]); }
    chainPath(g, pts, t, Math.max(8, h * 0.04), 1);
    motes(g, w, h, t, R, w * 0.1, w * 0.9, 0, h, 16, '#e8d6b4');
  };
  // 12.2 thanh kiếm tre gõ xuống nền đá, quầng đèn giơ lên rọi xuống
  ART.bamboo = function (g, w, h, t, R) {
    shaft(g, w, h, t, R, { vy: 0.38, posts: 3, lamps: false });
    var lx = w * 0.7, ly = h * 0.1, fl = 0.9 + 0.1 * Math.sin(t * 9);
    var cone = g.createRadialGradient(lx, ly, 0, lx, ly + h * 0.5, h * 0.8); cone.addColorStop(0, rgba(LAMP, (C.dark ? 0.32 : 0.4) * fl)); cone.addColorStop(1, rgba(LAMP, 0)); g.fillStyle = cone; g.fillRect(0, 0, w, h);
    g.save(); g.translate(w * 0.45, h * 0.8); g.rotate(-0.22);
    var L = w * 0.42; g.fillStyle = C.dark ? '#8a7a4c' : '#b49a5e'; g.fillRect(-L / 2, -4, L, 8);
    g.fillStyle = rgba('#000000', 0.3); for (var k = 1; k < 5; k++) g.fillRect(-L / 2 + L * k / 5, -5, 3, 10); // đốt tre
    g.fillStyle = C.dark ? '#3a2e22' : '#5a4630'; g.fillRect(L / 2 - L * 0.2, -5, L * 0.2, 10); // chuôi quấn
    g.restore();
    g.fillStyle = rgba('#000000', 0.35); g.beginPath(); g.ellipse(w * 0.46, h * 0.86, w * 0.22, h * 0.02, -0.22, 0, 7); g.fill();
    motes(g, w, h, t, R, w * 0.4, w * 0.9, h * 0.1, h * 0.9, 14, '#ffe6b8');
    vign(g, w, h, 0.7);
  };
  // 12.3 gian hầm rộng: búa tạ dựng cạnh bao tải căng phồng, ba chiếc đèn dầu
  ART.hall12 = function (g, w, h, t, R) {
    var dk = C.dark; g.fillStyle = dk ? '#0c0c0d' : '#25211c'; g.fillRect(0, 0, w, h);
    g.fillStyle = dk ? '#17171a' : '#3f3a32'; g.fillRect(0, h * 0.72, w, h * 0.28);
    for (var c = 0; c < 4; c++) { var x = w * (0.08 + c * 0.28); g.fillStyle = dk ? '#2b2017' : '#5a4330'; g.fillRect(x, 0, w * 0.045, h * 0.74); }
    g.fillRect(0, h * 0.05, w, h * 0.04);
    [0.22, 0.5, 0.78].forEach(function (u, i) { var fl = 0.85 + 0.15 * Math.sin(t * 6 + i * 2.1) * Math.sin(t * 11 + i); glow(g, w * u, h * 0.3, w * 0.3, LAMP, (dk ? 0.26 : 0.32) * fl); g.fillStyle = rgba('#ffe2a8', 0.9 * fl); g.beginPath(); g.ellipse(w * u, h * 0.3, 2.5, 5, 0, 0, 7); g.fill(); });
    // bao tải
    var sx = w * 0.58, sy = h * 0.74; g.fillStyle = dk ? '#5a4e3a' : '#9a8862'; g.beginPath(); g.moveTo(sx - w * 0.1, sy); g.quadraticCurveTo(sx - w * 0.12, sy - h * 0.22, sx - w * 0.03, sy - h * 0.28); g.lineTo(sx + w * 0.03, sy - h * 0.28); g.quadraticCurveTo(sx + w * 0.12, sy - h * 0.22, sx + w * 0.1, sy); g.closePath(); g.fill();
    for (var k = 0; k < 6; k++) rock(g, sx - w * 0.03 + R[k] * w * 0.06, sy - h * 0.29 - R[k + 6] * h * 0.03, 5 + R[k + 12] * 5, R, k, dk ? '#4a4844' : '#77736a');
    // búa tạ dựng nghiêng
    g.save(); g.translate(w * 0.4, sy); g.rotate(0.18); g.fillStyle = dk ? '#5a4632' : '#7a5c3e'; g.fillRect(-3, -h * 0.4, 6, h * 0.4); g.fillStyle = dk ? '#3a3e42' : '#4a4e52'; g.fillRect(-w * 0.04, -h * 0.46, w * 0.08, h * 0.08); g.restore();
    motes(g, w, h, t, R, 0, w, 0, h * 0.7, 26, '#e8d6b4');
    vign(g, w, h, 0.6);
  };
  // 12.4 ngách tối cuối gian hầm: ánh đèn chỉ rọi vào được vài bước
  ART.niche = function (g, w, h, t, R) {
    var s = shaft(g, w, h, t, R, { vy: 0.5, posts: 2, lamps: false });
    var fl = 0.9 + 0.1 * Math.sin(t * 8);
    var gr = g.createLinearGradient(0, h, 0, h * 0.55); gr.addColorStop(0, rgba(LAMP, (C.dark ? 0.22 : 0.3) * fl)); gr.addColorStop(1, rgba(LAMP, 0)); g.fillStyle = gr; g.fillRect(0, h * 0.55, w, h * 0.45);
    for (var k = 0; k < 9; k++) rock(g, w * (0.1 + R[k] * 0.8), h * (0.86 + R[k + 9] * 0.1), 4 + R[k + 18] * 8, R, k, C.dark ? '#262628' : '#5c564c');
    var d = g.createRadialGradient(s.vx, s.vy, 0, s.vx, s.vy, w * 0.4); d.addColorStop(0, rgba('#000000', 0.97)); d.addColorStop(1, rgba('#000000', 0)); g.fillStyle = d; g.fillRect(0, 0, w, h);
    vign(g, w, h, 0.75);
  };
  // 12.5 cái hòm gỗ đen bọc đai sắt, nắp chi chít vết búa, nửa vùi trong đá vụn
  ART.chest12 = function (g, w, h, t, R) {
    var dk = C.dark; g.fillStyle = dk ? '#08090a' : '#1f1c18'; g.fillRect(0, 0, w, h);
    var fl = 0.88 + 0.12 * Math.sin(t * 7) * Math.sin(t * 12);
    glow(g, w * 0.5, h * 0.15, Math.max(w, h) * 0.7, LAMP, (dk ? 0.2 : 0.28) * fl);
    var cx = w * 0.5, cy = h * 0.62, cw = Math.min(w * 0.5, h * 0.9), ch = cw * 0.42;
    g.fillStyle = dk ? '#15120f' : '#2a221b'; g.fillRect(cx - cw / 2, cy - ch / 2, cw, ch);
    g.fillStyle = dk ? '#1d1915' : '#352b22'; g.beginPath(); g.moveTo(cx - cw / 2, cy - ch / 2); g.quadraticCurveTo(cx, cy - ch * 0.95, cx + cw / 2, cy - ch / 2); g.closePath(); g.fill(); // nắp cong
    g.fillStyle = dk ? '#3a3c3e' : '#4e5254'; [0.12, 0.88].forEach(function (u) { g.fillRect(cx - cw / 2 + cw * u - 5, cy - ch * 0.78, 10, ch * 1.28); }); g.fillRect(cx - cw / 2, cy + ch * 0.12, cw, 6);
    g.strokeStyle = rgba(dk ? '#9a8a70' : '#c8b490', 0.25); g.lineWidth = 1; for (var k = 0; k < 14; k++) { var x = cx - cw * 0.4 + R[k] * cw * 0.8, y = cy - ch * (0.5 + R[k + 16] * 0.3); g.beginPath(); g.arc(x, y, 1.5 + R[k + 32] * 2.5, 3.6, 5.8); g.stroke(); } // vết búa
    g.fillStyle = dk ? '#2a2a2a' : '#3a3936'; g.fillRect(cx - 8, cy - ch * 0.55, 16, 18); // ổ khoá
    for (var r = 0; r < 14; r++) rock(g, cx - cw * 0.7 + R[r + 50] * cw * 1.4, cy + ch * 0.38 + R[r + 70] * h * 0.1, 6 + R[r + 90] * 12, R, r, dk ? '#24252a' : '#57524a');
    vign(g, w, h, 0.65);
  };
  // 12.6 bao tải đã buộc miệng, dấu chân nặng nề xa dần ra cửa hầm
  ART.sack = function (g, w, h, t, R) {
    var s = shaft(g, w, h, t, R, { vy: 0.42, posts: 3 });
    var dk = C.dark; g.fillStyle = dk ? 'rgba(0,0,0,.5)' : 'rgba(30,24,18,.38)';
    // dấu giày lệch sang mép phải nền hầm, so le trái phải, nhỏ dần về phía cửa
    for (var i = 0; i < 7; i++) { var u = i / 7, y = h * 0.97 - u * h * 0.38, sc = 1 - u * 0.75, x = w * 0.62 - u * (w * 0.62 - s.vx) * 0.9 + (i % 2 ? 1 : -1) * 9 * sc; g.beginPath(); g.ellipse(x, y, 4.5 * sc + 1, 9 * sc + 1, 0.15, 0, 7); g.fill(); }
    // bao tải buộc miệng đặt cạnh cột
    g.fillStyle = dk ? '#4a4032' : '#8a7a58'; g.beginPath(); g.moveTo(w * 0.12, h * 0.96); g.quadraticCurveTo(w * 0.1, h * 0.78, w * 0.17, h * 0.74); g.lineTo(w * 0.2, h * 0.74); g.quadraticCurveTo(w * 0.28, h * 0.78, w * 0.26, h * 0.96); g.closePath(); g.fill();
    g.strokeStyle = dk ? '#2a2218' : '#4a3c28'; g.lineWidth = 2; g.beginPath(); g.moveTo(w * 0.165, h * 0.75); g.lineTo(w * 0.205, h * 0.75); g.stroke();
    vign(g, w, h, 0.6);
  };
  // 12.7 cuốc chim nằm im trong ngách, một vệt xanh băng tan dần giữa không trung
  ART.pickstill = function (g, w, h, t, R) {
    shaft(g, w, h, t, R, { vy: 0.4, posts: 3 });
    g.save(); g.translate(w * 0.42, h * 0.84); g.rotate(-0.08);
    g.fillStyle = C.dark ? '#5a4632' : '#7a5c3e'; g.fillRect(-w * 0.18, -3, w * 0.36, 6);
    g.strokeStyle = C.dark ? '#5a5f63' : '#3e4245'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(w * 0.18, -h * 0.08); g.quadraticCurveTo(w * 0.2, 0, w * 0.17, h * 0.06); g.stroke();
    g.restore();
    var a = 0.25 + 0.2 * Math.sin(t * 0.6); g.fillStyle = rgba(C.dark ? '#9fdcea' : '#5fb2c4', a); g.fillRect(w * 0.25, h * 0.32, w * 0.5, 2);
    glow(g, w * 0.5, h * 0.32, w * 0.3, C.dark ? '#9fdcea' : '#5fb2c4', a * 0.35);
    vign(g, w, h, 0.65);
  };
  // 12.8 mũi cuốc cào thành vệt trên nền đá, sợi xích tách ba nhánh ngóc lên
  ART.scrape12 = function (g, w, h, t, R) {
    var s = shaft(g, w, h, t, R, { vy: 0.36, posts: 3 });
    g.strokeStyle = rgba(C.dark ? '#c8c0b0' : '#d8cfbd', 0.55); g.lineWidth = 1.5;
    for (var k = 0; k < 3; k++) { g.beginPath(); g.moveTo(s.vx - w * 0.05 + k * 4, s.vy + s.hh + 10); g.quadraticCurveTo(w * (0.35 + k * 0.02), h * 0.75, w * (0.2 + k * 0.03), h); g.stroke(); }
    var bx = w * 0.62, by = h * 0.95, lk = Math.max(6, h * 0.028);
    for (var b = 0; b < 3; b++) { var pts = [], ang = -1.9 + b * 0.55; for (var i = 0; i < 16; i++) { var u = i / 15, x = bx + Math.cos(ang) * u * h * 0.5 + Math.sin(t * 2.4 + u * 5 + b) * 8 * u, y = by + Math.sin(ang) * u * h * 0.5; pts.push([x, y]); } chainPath(g, pts, t, lk, 0.9); }
    vign(g, w, h, 0.55);
  };
  // 12.9 vòng sáng đèn dầu nhỏ giữa bóng tối đặc; mép tối có những đốm đỏ
  ART.lampring = function (g, w, h, t, R) {
    g.fillStyle = '#050505'; g.fillRect(0, 0, w, h);
    var fl = 0.88 + 0.12 * Math.sin(t * 9) * Math.sin(t * 5.3), cx = w * 0.5, cy = h * 0.45, r = Math.min(w, h) * 0.42 * fl;
    var gl = g.createRadialGradient(cx, cy, 0, cx, cy, r); gl.addColorStop(0, rgba(LAMP, 0.55)); gl.addColorStop(0.35, rgba('#b57a3a', 0.25)); gl.addColorStop(1, rgba('#000000', 0)); g.fillStyle = gl; g.fillRect(0, 0, w, h);
    g.fillStyle = rgba('#1a140e', 0.9); g.fillRect(cx - 7, cy - 12, 14, 22); g.fillStyle = rgba('#ffe2a8', fl); g.beginPath(); g.ellipse(cx, cy, 3, 6, 0, 0, 7); g.fill();
    for (var k = 0; k < 4; k++) { var a = R[k] * 6.283, d = r * (1.1 + R[k + 4] * 0.4), ex = cx + Math.cos(a) * d * 1.3, ey = cy + Math.sin(a) * d * 0.7, on = Math.sin(t * 0.5 + k * 1.7) > 0.2 ? 1 : 0; g.fillStyle = rgba('#c2281e', 0.7 * on); g.fillRect(ex - 4, ey, 2, 2); g.fillRect(ex + 3, ey, 2, 2); }
  };
  // 12.10 cây cột gỗ gãy làm đôi, cây búa tạ rơi giữa đá vụn, sợi xích chùng
  ART.pillar = function (g, w, h, t, R) {
    var dk = C.dark; g.fillStyle = dk ? '#08090a' : '#1f1c18'; g.fillRect(0, 0, w, h);
    glow(g, w * 0.2, h * 0.3, w * 0.4, LAMP, dk ? 0.14 : 0.2);
    g.fillStyle = dk ? '#2b2017' : '#5a4330';
    g.save(); g.translate(w * 0.5, 0); g.fillRect(-w * 0.025, 0, w * 0.05, h * 0.38); g.beginPath(); g.moveTo(-w * 0.025, h * 0.38); g.lineTo(-w * 0.01, h * 0.43); g.lineTo(w * 0.005, h * 0.37); g.lineTo(w * 0.025, h * 0.42); g.lineTo(w * 0.025, h * 0.38); g.fill(); g.restore();
    g.save(); g.translate(w * 0.56, h * 0.78); g.rotate(1.2); g.fillRect(-w * 0.025, -h * 0.3, w * 0.05, h * 0.3); g.restore();
    for (var k = 0; k < 22; k++) rock(g, w * (0.2 + R[k] * 0.6), h * (0.72 + R[k + 22] * 0.25), 5 + R[k + 44] * 16, R, k, dk ? '#27282c' : '#57524a');
    g.save(); g.translate(w * 0.32, h * 0.86); g.rotate(-0.5); g.fillStyle = dk ? '#5a4632' : '#7a5c3e'; g.fillRect(0, -3, w * 0.2, 6); g.fillStyle = dk ? '#3a3e42' : '#4a4e52'; g.fillRect(w * 0.18, -h * 0.04, w * 0.06, h * 0.08); g.restore();
    var pts = []; for (var i = 0; i < 26; i++) { var u = i / 25; pts.push([w * 0.95 - u * w * 0.5, h * 0.62 + Math.sin(u * Math.PI) * h * 0.2]); } chainPath(g, pts, t, Math.max(6, h * 0.028), 0.9);
    // bụi còn rơi lả tả
    g.fillStyle = rgba('#c8b8a0', 0.5); for (var d = 0; d < 30; d++) { var x = w * 0.5 + (R[d + 100] - 0.5) * w * 0.4, y = ((R[d + 130] + t * (0.05 + R[d + 160] * 0.08)) % 1) * h * 0.8; g.fillRect(x, y, 1.5, 1.5); }
    vign(g, w, h, 0.6);
  };
  // 12.11 cuối đường hầm thẳng tắp: một khe sáng trắng, chấn song đen in trên nền nắng
  ART.slit = function (g, w, h, t, R) {
    var s = shaft(g, w, h, t, R, { vy: 0.45, posts: 5, light: true, lamps: false });
    var sw = w * 0.1, sh = h * 0.16;
    var gl = g.createRadialGradient(s.vx, s.vy, 0, s.vx, s.vy, w * 0.5); gl.addColorStop(0, rgba('#fffbea', 0.55)); gl.addColorStop(1, rgba('#fffbea', 0)); g.fillStyle = gl; g.fillRect(0, 0, w, h);
    g.fillStyle = '#fffaf0'; g.fillRect(s.vx - sw / 2, s.vy - sh / 2, sw, sh);
    g.fillStyle = '#1a1a1a'; for (var i = 0; i < 6; i++) g.fillRect(s.vx - sw / 2 + sw * (i + 0.5) / 6 - 1, s.vy - sh / 2, 2, sh);
    // bụi trần rơi
    g.fillStyle = rgba('#d8ccb8', 0.6); for (var d = 0; d < 24; d++) { var x = R[d] * w, y = ((R[d + 24] + t * 0.12) % 1) * h; g.fillRect(x, y, 1.5, 1.5); }
  };
  // 12.12 bức tường đá đổ sập lấp đường hầm, một đốm lửa nhỏ run rẩy
  ART.rubble = function (g, w, h, t, R) {
    var dk = C.dark; g.fillStyle = '#040404'; g.fillRect(0, 0, w, h);
    var fl = 0.8 + 0.2 * Math.sin(t * 11) * Math.sin(t * 6.7), lx = w * 0.3, ly = h * 0.82;
    glow(g, lx, ly, w * 0.55 * fl, LAMP, 0.4 * fl);
    for (var k = 0; k < 40; k++) { var x = w * (0.05 + R[k] * 0.9), y = h * (0.1 + R[k + 40] * 0.75), r = 14 + R[k + 80] * 30, lit = Math.max(0, 1 - Math.hypot(x - lx, y - ly) / (w * 0.6)); rock(g, x, y, r, R, k, rgba(dk ? '#3a3430' : '#4a4038', 0.25 + 0.75 * lit)); }
    g.fillStyle = rgba('#1a140e', 0.9); g.fillRect(lx - 6, ly - 10, 12, 18); g.fillStyle = rgba('#ffe2a8', fl); g.beginPath(); g.ellipse(lx, ly - 2, 2.5, 5, 0, 0, 7); g.fill();
    vign(g, w, h, 0.85);
  };
  // 12.13 tảng đá trượt sang một bên như cánh cửa, nắng trưa tràn vào; vệt máu mảnh như sợi chỉ trên mặt đá
  ART.opening = function (g, w, h, t, R) {
    var dk = C.dark; g.fillStyle = '#060606'; g.fillRect(0, 0, w, h);
    var gx = w * 0.5, gw = w * 0.14;
    var beam = g.createLinearGradient(gx, 0, gx - w * 0.2, h); beam.addColorStop(0, rgba('#fffbea', 0.7)); beam.addColorStop(1, rgba('#fffbea', 0.05));
    g.fillStyle = beam; g.beginPath(); g.moveTo(gx - gw / 2, 0); g.lineTo(gx + gw / 2, 0); g.lineTo(gx + gw * 0.3, h); g.lineTo(gx - gw * 1.6, h); g.fill();
    g.fillStyle = '#fffaf0'; g.fillRect(gx - gw / 2, h * 0.08, gw, h * 0.72);
    g.fillStyle = rgba('#5a3a2a', 0.8); for (var i = 0; i < 3; i++) g.fillRect(gx - gw / 2 + gw * (i + 0.5) / 3 - 1, h * 0.2, 2, h * 0.5); // chấn song gỉ xa xa
    for (var k = 0; k < 30; k++) { var x = w * (R[k] < 0.5 ? R[k] * 0.86 : 0.57 + (R[k] - 0.5) * 0.86), y = h * R[k + 30], lit = Math.max(0, 1 - Math.abs(x - gx) / (w * 0.4)); rock(g, x, y, 16 + R[k + 60] * 26, R, k, rgba(dk ? '#3d3a36' : '#5a5148', 0.3 + 0.7 * lit)); }
    // tảng đá vừa trượt ra, mép còn sáng
    g.fillStyle = dk ? '#4a4540' : '#6c6358'; g.fillRect(gx + gw / 2, h * 0.1, w * 0.16, h * 0.68);
    g.strokeStyle = rgba('#fffbea', 0.5); g.lineWidth = 2; g.beginPath(); g.moveTo(gx + gw / 2, h * 0.1); g.lineTo(gx + gw / 2, h * 0.78); g.stroke();
    g.strokeStyle = rgba(dk ? '#8a2a28' : '#7a1e1c', 0.75); g.lineWidth = 1; for (var b = 0; b < 4; b++) { var bx = gx + gw / 2 + w * 0.03 + b * 6, by = h * (0.42 + b * 0.02); g.beginPath(); g.moveTo(bx, by); g.lineTo(bx + 2, by + h * 0.12 + R[b + 120] * h * 0.06); g.stroke(); }
    g.fillStyle = rgba('#fffbea', 0.6); for (var d = 0; d < 22; d++) { var x2 = gx - gw + R[d + 150] * gw * 2, y2 = ((R[d + 180] + t * 0.04) % 1) * h; g.fillRect(x2, y2, 1.5, 1.5); }
  };
  // 12.14 đường mòn nắng gắt, sợi xích cuộn tròn trên đất, cổng hầm ở sau lưng
  ART.path12 = function (g, w, h, t, R) {
    sky(g, w, h, 'noon', 0.45);
    var dk = C.dark; g.fillStyle = dk ? '#3a3630' : '#cbbd9e'; g.fillRect(0, h * 0.45, w, h * 0.55);
    g.fillStyle = dk ? '#2a2824' : '#9a8f7c'; g.beginPath(); g.moveTo(w * 0.62, h * 0.45); g.lineTo(w * 0.62, h * 0.18); g.quadraticCurveTo(w * 0.78, h * 0.02, w * 0.94, h * 0.18); g.lineTo(w * 0.94, h * 0.45); g.fill();
    g.fillStyle = '#050505'; g.beginPath(); g.moveTo(w * 0.7, h * 0.45); g.lineTo(w * 0.7, h * 0.27); g.quadraticCurveTo(w * 0.78, h * 0.17, w * 0.86, h * 0.27); g.lineTo(w * 0.86, h * 0.45); g.fill();
    g.fillStyle = dk ? '#5a3a2a' : '#7a4a30'; for (var i = 0; i < 6; i++) g.fillRect(w * (0.71 + i * 0.028), h * 0.28, 2, h * 0.17);
    g.fillStyle = dk ? '#2e2a24' : '#b2a384'; g.beginPath(); g.moveTo(w * 0.3, h); g.lineTo(w * 0.72, h * 0.45); g.lineTo(w * 0.8, h * 0.45); g.lineTo(w * 0.75, h); g.fill(); // đường mòn
    var cx = w * 0.42, cy = h * 0.8, lk = Math.max(6, h * 0.03), pts = [];
    for (var k = 0; k < 40; k++) { var a = k / 40 * 6.283 * 1.6, r = w * (0.06 + k * 0.0012); pts.push([cx + Math.cos(a) * r * 1.4, cy + Math.sin(a) * r * 0.45]); }
    chainPath(g, pts, t, lk, 0.95);
    g.fillStyle = rgba(dk ? '#d8ccb0' : '#8a7a5c', 0.35); for (var d = 0; d < 26; d++) { var fx = w * (0.3 + R[d] * 0.4), fy = h * (0.55 + R[d + 26] * 0.4) - ((t * 6 + d * 3) % 20); g.fillRect(fx, fy, 1.5, 1.5); } // bụi đường bay lên trong nắng
    var ht = g.createLinearGradient(0, 0, 0, h); ht.addColorStop(0, rgba('#fff8e4', dk ? 0.05 : 0.25)); ht.addColorStop(1, rgba('#fff8e4', 0)); g.fillStyle = ht; g.fillRect(0, 0, w, h);
  };

  /* ---------- chương 13: khu Mỏ buổi chiều, căn nhà sau ống khói, tiệm rèn (chèn sau art4.js). Không vẽ người, chỉ dấu vết. Lửa giữ màu lửa. ---------- */
  var EMBER = '#ff7a3a', HOT = '#ffd9a0';
  // đốm đỏ lập loè của người nhiễm, nhìn từ xa (một cặp chấm), không vẽ dáng người
  function eyes(g, x, y, s, t, k, a) {
    var on = Math.sin(t * 1.3 + k * 2.1) > -0.6 ? 1 : 0.25; g.fillStyle = rgba('#e0322a', (a == null ? 0.85 : a) * on);
    g.fillRect(x - s * 1.6, y, s, s); g.fillRect(x + s * 0.6, y, s, s);
    glow(g, x, y, s * 6, '#e0322a', 0.12 * on * (a == null ? 1 : a));
  }
  // vạt dốc trọc lổn nhổn đá
  function slope(g, w, h, y0, y1, col, R, k) {
    g.fillStyle = col; g.beginPath(); g.moveTo(0, h); g.lineTo(0, y0);
    for (var i = 0; i <= 20; i++) { var u = i / 20; g.lineTo(u * w, y0 + (y1 - y0) * u + Math.sin(u * 9 + k) * h * 0.015); }
    g.lineTo(w, h); g.fill();
    for (var r = 0; r < 18; r++) { var u2 = R[(r + k * 7) % 240], x = u2 * w, y = y0 + (y1 - y0) * u2 + h * (0.03 + R[(r * 3 + k) % 240] * 0.3); rock(g, x, y, 3 + R[(r * 5) % 240] * 8, R, r + k, rgba('#000000', C.dark ? 0.35 : 0.18)); }
  }
  // sọt đá và đòn gánh lăn lóc
  function basketRock(g, x, y, s, tip, col) {
    g.save(); g.translate(x, y); g.rotate(tip);
    g.strokeStyle = col; g.lineWidth = Math.max(1, s * 0.08); g.beginPath(); g.moveTo(-s * 0.5, -s * 0.5); g.lineTo(-s * 0.4, s * 0.3); g.lineTo(s * 0.4, s * 0.3); g.lineTo(s * 0.5, -s * 0.5); g.stroke();
    for (var i = 1; i < 4; i++) { g.beginPath(); g.moveTo(-s * 0.48 + i * 0.02 * s, -s * 0.5 + i * s * 0.2); g.lineTo(s * 0.48 - i * 0.02 * s, -s * 0.5 + i * s * 0.2); g.stroke(); }
    g.restore();
  }
  function chimney(g, x, base, wd, ht, t) {
    g.fillStyle = C.dark ? '#3a2620' : '#8a5a48'; g.fillRect(x - wd / 2, base - ht, wd, ht);
    g.strokeStyle = rgba('#000000', 0.25); g.lineWidth = 1; for (var b = 1; b < 9; b++) { var y = base - ht * b / 9; g.beginPath(); g.moveTo(x - wd / 2, y); g.lineTo(x + wd / 2, y); g.stroke(); }
    wisp(g, x, base - ht, ht * 1.3, t, C.dark ? '#6d7472' : '#c8c9c2', 0.4);
  }
  // nền đất trong nhà và vách đất
  function earthRoom(g, w, h, floorY) {
    room2(g, w, h, true);
    g.fillStyle = C.dark ? '#1c1712' : '#7a6a54'; g.fillRect(0, floorY, w, h - floorY);
    g.strokeStyle = rgba('#000000', 0.18); g.lineWidth = 1; for (var i = 0; i < 14; i++) { g.beginPath(); g.moveTo(i * w / 13, 0); g.lineTo(i * w / 13 + 6, floorY); g.stroke(); }
  }
  // vệt nắng mảnh như sợi chỉ lọt qua khe vách
  function threadBeam(g, x0, y0, x1, y1, wd, a) {
    var gr = g.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, rgba('#fff0c8', a)); gr.addColorStop(1, rgba('#fff0c8', a * 0.15));
    g.fillStyle = gr; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + wd * 0.3, y0); g.lineTo(x1 + wd, y1); g.lineTo(x1 - wd * 0.2, y1); g.fill();
  }
  // lán rèn: mái tôn gỉ, lò gạch than đỏ, cái đe; fire = 0..1 (1 = trắng loá)
  function smithy(g, w, h, t, R, o) {
    o = o || {}; var dk = C.dark, fire = o.fire || 0;
    sky(g, w, h, o.dusk ? 'dusk' : 'noon', 0.5);
    g.fillStyle = dk ? '#1e1c1a' : '#7d756a'; g.beginPath(); g.moveTo(0, h * 0.5); g.lineTo(w * 0.2, h * 0.18); g.lineTo(w * 0.45, h * 0.3); g.lineTo(w * 0.7, h * 0.08); g.lineTo(w, h * 0.26); g.lineTo(w, h); g.lineTo(0, h); g.fill(); // đồi đá sẫm
    var floor = h * 0.78; g.fillStyle = dk ? '#151311' : '#5e564b'; g.fillRect(0, h * 0.24, w, floor - h * 0.24); // gầm lán tối
    // mái tôn gỉ
    g.fillStyle = dk ? '#4a2c1e' : '#8a5236'; g.beginPath(); g.moveTo(-w * 0.02, h * 0.27); g.lineTo(w * 1.02, h * 0.2); g.lineTo(w * 1.02, h * 0.26); g.lineTo(-w * 0.02, h * 0.33); g.fill();
    g.strokeStyle = rgba('#000000', 0.3); for (var c = 0; c < 22; c++) { var x = c * w / 21; g.beginPath(); g.moveTo(x, h * 0.27 - c * 0.0033 * h); g.lineTo(x, h * 0.33 - c * 0.0033 * h); g.stroke(); }
    g.fillStyle = dk ? '#2a1d16' : '#5a3e2c'; g.fillRect(w * 0.04, h * 0.3, w * 0.015, floor - h * 0.3); g.fillRect(w * 0.94, h * 0.24, w * 0.015, floor - h * 0.24); // cột
    // nền đất, lớp tro mịn trước lò
    g.fillStyle = dk ? '#2a2724' : '#a59d8e'; g.fillRect(0, floor, w, h - floor);
    g.fillStyle = dk ? '#3a3734' : '#c4bdb0'; g.beginPath(); g.ellipse(w * 0.42, floor + (h - floor) * 0.55, w * 0.4, (h - floor) * 0.4, 0, 0, 7); g.fill();
    // lò gạch
    var fx = w * 0.2, fy = floor, fw = w * 0.2, fh = h * 0.3, fl = 0.8 + 0.2 * Math.sin(t * 5) * Math.sin(t * 2.7) + fire * 0.3;
    g.fillStyle = dk ? '#3a2420' : '#7a4a3a'; g.fillRect(fx - fw / 2, fy - fh, fw, fh);
    g.strokeStyle = rgba('#000000', 0.3); for (var b = 1; b < 7; b++) { g.beginPath(); g.moveTo(fx - fw / 2, fy - fh * b / 7); g.lineTo(fx + fw / 2, fy - fh * b / 7); g.stroke(); }
    var mx = fx, my = fy - fh * 0.45, mr = fw * 0.22, core = fire > 0.6 ? '#fff6e0' : fire > 0.25 ? HOT : EMBER;
    glow(g, mx, my, fw * (1.4 + fire * 1.6), fire > 0.6 ? '#fff0d0' : EMBER, (dk ? 0.35 : 0.3) * fl);
    g.fillStyle = '#120a06'; g.beginPath(); g.ellipse(mx, my, mr * 1.25, mr * 0.75, 0, 0, 7); g.fill(); // miệng lò
    var gg = g.createRadialGradient(mx, my, 0, mx, my, mr); gg.addColorStop(0, rgba(core, 1)); gg.addColorStop(0.6, rgba(fire > 0.6 ? HOT : '#e8501e', 0.9 * fl)); gg.addColorStop(1, rgba('#5a1608', 0.8)); g.fillStyle = gg; g.beginPath(); g.ellipse(mx, my, mr, mr * 0.55, 0, 0, 7); g.fill(); // than đỏ như con mắt đang mở
    wisp(g, fx, fy - fh, h * 0.25, t, dk ? '#1a1a1a' : '#4a4a4a', 0.5); // khói đen mỏng
    // cái đe
    var ax = w * 0.58, ay = floor - h * 0.02, aw = w * 0.2;
    g.fillStyle = dk ? '#2a2c2e' : '#3a3d40'; g.fillRect(ax - aw * 0.12, ay - h * 0.1, aw * 0.24, h * 0.1); // chân đe
    g.beginPath(); g.moveTo(ax - aw / 2, ay - h * 0.1); g.lineTo(ax + aw * 0.35, ay - h * 0.1); g.quadraticCurveTo(ax + aw * 0.6, ay - h * 0.12, ax + aw * 0.62, ay - h * 0.15); g.lineTo(ax + aw * 0.3, ay - h * 0.155); g.lineTo(ax - aw / 2, ay - h * 0.155); g.fill();
    g.strokeStyle = rgba('#ffffff', dk ? 0.18 : 0.25); g.lineWidth = 1.2; g.beginPath(); g.moveTo(ax - aw / 2, ay - h * 0.155); g.lineTo(ax + aw * 0.3, ay - h * 0.155); g.stroke();
    if (o.lock) { var lx = ax - aw * 0.38, ly = ay - h * 0.155; g.fillStyle = dk ? '#0c0c0c' : '#1a1a1a'; g.beginPath(); g.ellipse(lx, ly - h * 0.02, w * 0.018, h * 0.02, 0, 0, 7); g.fill(); g.strokeStyle = dk ? '#0c0c0c' : '#1a1a1a'; g.lineWidth = Math.max(2, w / 260); g.beginPath(); g.arc(lx, ly - h * 0.035, w * 0.01, Math.PI, 0); g.stroke(); }
    // tia lửa theo nhịp búa (không vẽ người cầm búa)
    if (o.sparks !== false) {
      var beat = t % 0.95, k = beat < 0.35 ? 1 - beat / 0.35 : 0;
      if (k > 0) { glow(g, ax, ay - h * 0.16, w * 0.06, HOT, 0.6 * k); g.strokeStyle = rgba(HOT, 0.9 * k); g.lineWidth = 1.4; for (var s = 0; s < 12; s++) { var an = -Math.PI * (0.1 + R[s] * 0.8), sp = (1 - k) * w * (0.05 + R[s + 12] * 0.12), x1 = ax + Math.cos(an) * sp, y1 = ay - h * 0.16 + Math.sin(an) * sp + (1 - k) * (1 - k) * h * 0.1; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x1 - Math.cos(an) * 5, y1 - Math.sin(an) * 5); g.stroke(); } }
      if (fire < 0.3) { g.fillStyle = rgba('#ff6a2a', 0.9); g.fillRect(ax - aw * 0.15, ay - h * 0.17, aw * 0.3, h * 0.012); } // thanh sắt nung đỏ
    }
    // ghế đẩu kê sát vách, đống sắt vụn
    if (o.stool !== false) {
      var sx = w * 0.86, sy = floor; g.fillStyle = dk ? '#3a2b1e' : '#6e5235'; g.fillRect(sx - w * 0.04, sy - h * 0.09, w * 0.08, h * 0.015); g.fillRect(sx - w * 0.035, sy - h * 0.08, w * 0.008, h * 0.08); g.fillRect(sx + w * 0.027, sy - h * 0.08, w * 0.008, h * 0.08);
      g.strokeStyle = dk ? '#4a4a48' : '#55534e'; g.lineWidth = 2; for (var j = 0; j < 9; j++) { var jx = w * (0.7 + R[j + 40] * 0.12), jy = floor - R[j + 50] * h * 0.05; g.beginPath(); g.moveTo(jx, jy); g.lineTo(jx + (R[j + 60] - 0.5) * w * 0.06, jy - R[j + 70] * h * 0.04); g.stroke(); }
    }
    if (o.prints) { // vết giày đế khía trên tro, cách nhau đúng một sải
      for (var f = 0; f < 6; f++) { var u = f / 5, px = w * (0.82 - u * 0.62), py = floor + (h - floor) * (0.35 + (f % 2) * 0.22), a = (o.blow ? Math.max(0, 1 - Math.max(0, (t % 9) - 4 + u * 2) / 2) : 1) * (C.dark ? 0.5 : 0.35); if (a <= 0) continue; g.fillStyle = rgba('#000000', a); g.beginPath(); g.ellipse(px, py, w * 0.022, h * 0.012, 0, 0, 7); g.fill(); g.strokeStyle = rgba(C.dark ? '#5a5652' : '#d8d2c6', a * 1.3); g.lineWidth = 1; for (var q = -2; q <= 2; q++) { g.beginPath(); g.moveTo(px + q * w * 0.008, py - h * 0.008); g.lineTo(px + q * w * 0.008, py + h * 0.008); g.stroke(); } }
    }
    // hơi nước bốc lên từ thùng nước
    if (o.steam) { var bx = w * 0.4, by = floor; g.fillStyle = dk ? '#2a2c2c' : '#5a5e60'; g.fillRect(bx - w * 0.04, by - h * 0.07, w * 0.08, h * 0.07); for (var m = 0; m < 6; m++) { var v = ((t * 0.3 + m / 6) % 1); glow(g, bx + Math.sin(t + m) * w * 0.02, by - h * 0.07 - v * h * 0.3, w * 0.05 * (0.6 + v), '#ffffff', (C.dark ? 0.12 : 0.25) * (1 - v)); } }
    motes(g, w, h, t, R, w * 0.1, w * 0.7, h * 0.3, floor, 18, HOT);
  }

  // 13.1 đường mòn khu Mỏ: sợi xích nằm phục dưới đất, mắt xích cuối khẽ cựa; trên sườn đồi những cặp đốm đỏ lừ đừ quay về phía tiếng chân
  ART.trail13 = function (g, w, h, t, R) {
    var hz = h * 0.5; mineLand(g, w, h, t, R, hz);
    slope(g, w, h, hz - h * 0.02, hz + h * 0.08, C.dark ? '#34342f' : '#aaa69a', R, 3);
    for (var e = 0; e < 6; e++) eyes(g, w * (0.08 + R[e + 100] * 0.84), hz + h * (0.01 + R[e + 110] * 0.08), Math.max(1.5, h * 0.006), t, e, 0.5 + 0.3 * R[e + 120]);
    g.fillStyle = C.dark ? '#4a4a44' : '#d4d0c0'; g.beginPath(); g.moveTo(w * 0.25, h); g.lineTo(w * 0.75, h); g.quadraticCurveTo(w * 0.55, h * 0.7, w * 0.56, hz + h * 0.1); g.lineTo(w * 0.52, hz + h * 0.1); g.quadraticCurveTo(w * 0.42, h * 0.72, w * 0.25, h); g.fill(); // đường mòn
    var cx = w * 0.5, cy = h * 0.86, lk = Math.max(7, h * 0.032), pts = [];
    for (var k = 0; k < 30; k++) { var a = k / 30 * 6.283 * 1.2, r = w * (0.05 + k * 0.0016); pts.push([cx + Math.cos(a) * r * 1.5, cy + Math.sin(a) * r * 0.42]); }
    var tail = Math.sin(t * 1.7) * Math.sin(t * 0.6); // mấy mắt cuối cựa như con vật nằm phục
    for (var j = 0; j < 6; j++) { var u = j / 5; pts.push([cx + w * (0.15 + u * 0.12), cy - h * 0.02 + Math.sin(u * 3 + t * 2) * h * 0.02 * tail]); }
    chainPath(g, pts, t, lk, 1);
    dust(g, w, h, t, R, hz, 18);
  };
  // 13.2 sợi xích tách làm ba nhánh dọn đường; sọt đá đổ rào rào; ống khói gạch phía trước
  ART.chainsplit = function (g, w, h, t, R) {
    var hz = h * 0.48; mineLand(g, w, h, t, R, hz);
    chimney(g, w * 0.78, hz + h * 0.02, w * 0.04, h * 0.3, t);
    g.fillStyle = C.dark ? '#4a4a44' : '#d4d0c0'; g.beginPath(); g.moveTo(w * 0.3, h); g.lineTo(w * 0.7, h); g.lineTo(w * 0.56, hz + h * 0.05); g.lineTo(w * 0.5, hz + h * 0.05); g.fill();
    for (var e = 0; e < 5; e++) { var side = e % 2 ? 1 : -1; eyes(g, w * (0.5 + side * (0.18 + R[e + 130] * 0.25)), h * (0.58 + R[e + 140] * 0.2), Math.max(1.6, h * 0.007), t, e); }
    var bx = w * 0.5, by = h * 0.98, lk = Math.max(7, h * 0.03);
    [[-0.34, 0.66], [0.02, 0.56], [0.36, 0.7]].forEach(function (tg, i) {
      var reach = 0.75 + 0.25 * Math.sin(t * 1.4 + i * 2.1), pts = [];
      for (var k = 0; k < 18; k++) { var u = k / 17 * reach, x = bx + tg[0] * w * u + Math.sin(u * 6 + t * 3 + i) * w * 0.02 * (1 - u), y = by - (by - h * tg[1]) * u; pts.push([x, y]); }
      chainPath(g, pts, t, lk, 1);
    });
    // sọt đá lăn lóc, đá đổ ra
    basketRock(g, w * 0.14, h * 0.9, h * 0.1, 1.2, C.dark ? '#7a6a4a' : '#5a4a30');
    g.strokeStyle = C.dark ? '#5a4a34' : '#4a3a24'; g.lineWidth = Math.max(2, h * 0.01); g.beginPath(); g.moveTo(w * 0.02, h * 0.8); g.lineTo(w * 0.26, h * 0.96); g.stroke(); // đòn gánh
    for (var s = 0; s < 14; s++) { var ph = (t * 0.6 + R[s + 150]) % 1, sx = w * (0.16 + R[s + 160] * 0.12) + ph * w * 0.05, sy = h * 0.9 + ph * ph * h * 0.12; if (sy > h) continue; rock(g, sx, sy, 2 + R[s + 170] * 4, R, s, C.dark ? '#57574f' : '#8a867a'); }
    dust(g, w, h, t, R, hz, 22);
  };
  // 13.3 trong nhà: chõng tre, chum nước, gác xép lụp xụp trên đầu, vệt nắng mảnh như sợi chỉ, bếp tro còn ấm
  ART.hut13 = function (g, w, h, t, R) {
    var floorY = h * 0.72; earthRoom(g, w, h, floorY);
    for (var b = 0; b < 4; b++) threadBeam(g, w * (0.12 + b * 0.2), 0, w * (0.3 + b * 0.2), floorY + h * 0.06, 3, C.dark ? 0.16 : 0.32);
    g.fillStyle = C.dark ? '#2a2016' : '#6e5a40'; g.fillRect(0, h * 0.08, w, h * 0.05); // ván gác xép
    g.fillStyle = C.dark ? '#3a3020' : '#9a8458'; for (var r = 0; r < 5; r++) { g.beginPath(); g.ellipse(w * (0.15 + r * 0.17), h * 0.07, w * 0.06, h * 0.03, 0, Math.PI, 0); g.fill(); } // bó rơm
    g.fillStyle = C.dark ? '#2a2216' : '#9a8460'; g.fillRect(w * 0.52, h * 0.6, w * 0.42, h * 0.05); g.fillRect(w * 0.54, h * 0.65, w * 0.015, h * 0.12); g.fillRect(w * 0.91, h * 0.65, w * 0.015, h * 0.12); // chõng tre
    g.strokeStyle = rgba('#000000', 0.3); for (var i = 0; i < 16; i++) { g.beginPath(); g.moveTo(w * (0.52 + i * 0.027), h * 0.6); g.lineTo(w * (0.52 + i * 0.027), h * 0.65); g.stroke(); }
    g.fillStyle = C.dark ? '#3a2a20' : '#7a5a42'; g.beginPath(); g.ellipse(w * 0.3, h * 0.66, w * 0.07, h * 0.12, 0, 0, 7); g.fill(); g.fillStyle = C.dark ? '#0a0806' : '#2a2218'; g.beginPath(); g.ellipse(w * 0.3, h * 0.56, w * 0.045, h * 0.015, 0, 0, 7); g.fill(); // chum nước
    var f = 0.5 + 0.5 * Math.sin(t * 0.9) * Math.sin(t * 0.37); glow(g, w * 0.1, h * 0.84, w * 0.12, EMBER, 0.12 * f); g.fillStyle = C.dark ? '#4a4440' : '#9a948c'; g.beginPath(); g.ellipse(w * 0.1, h * 0.85, w * 0.07, h * 0.02, 0, 0, 7); g.fill(); // nhúm tro ấm
    g.fillStyle = rgba(EMBER, 0.5 * f); g.fillRect(w * 0.09, h * 0.84, 2, 2);
    motes(g, w, h, t, R, w * 0.1, w * 0.95, h * 0.12, floorY, 30, '#fff0c8');
  };
  // 13.4 gác xép: bó rơm, thúng thủng đáy, cái giỏ mây nhỏ nằm sát mép trong cùng, cao quá tầm với
  ART.loft = function (g, w, h, t, R) {
    room2(g, w, h, true);
    var y = h * 0.62; g.fillStyle = C.dark ? '#2a2016' : '#6e5a40'; g.fillRect(0, y, w, h * 0.06);
    g.strokeStyle = rgba('#000000', 0.35); for (var p = 0; p < 7; p++) { g.beginPath(); g.moveTo(w * p / 6, y); g.lineTo(w * p / 6 + 4, y + h * 0.06); g.stroke(); }
    g.fillStyle = C.dark ? '#1b1510' : '#5a4834'; g.fillRect(w * 0.1, y + h * 0.06, w * 0.02, h * 0.4); g.fillRect(w * 0.88, y + h * 0.06, w * 0.02, h * 0.4); // cột đỡ
    g.fillStyle = C.dark ? '#3a3020' : '#9a8458'; for (var r = 0; r < 4; r++) { g.beginPath(); g.ellipse(w * (0.12 + r * 0.14), y, w * 0.07, h * 0.12, 0, Math.PI, 0); g.fill(); }
    g.strokeStyle = C.dark ? '#4a3c28' : '#7a6440'; g.lineWidth = 2; [[0.62, 0.08], [0.7, 0.1]].forEach(function (b) { g.beginPath(); g.ellipse(w * b[0], y - h * b[1] * 0.4, w * b[1], h * b[1] * 0.4, 0, 0, 7); g.stroke(); }); // thúng thủng
    var bx = w * 0.84, by = y - h * 0.005, sw = Math.sin(t * 0.8) * 0.01;
    g.save(); g.translate(bx, by); g.rotate(sw);
    g.fillStyle = C.dark ? '#5a4628' : '#a88a56'; g.beginPath(); g.moveTo(-w * 0.05, 0); g.lineTo(-w * 0.04, -h * 0.09); g.lineTo(w * 0.04, -h * 0.09); g.lineTo(w * 0.05, 0); g.fill(); // giỏ mây
    g.strokeStyle = rgba('#000000', 0.3); g.lineWidth = 1; for (var k = 1; k < 5; k++) { g.beginPath(); g.moveTo(-w * 0.048, -h * 0.018 * k); g.lineTo(w * 0.048, -h * 0.018 * k); g.stroke(); }
    g.strokeStyle = C.dark ? '#6a5430' : '#8a6e40'; g.lineWidth = 2; g.beginPath(); g.arc(0, -h * 0.09, w * 0.03, Math.PI, 0); g.stroke();
    g.restore();
    var shine = 0.5 + 0.5 * Math.sin(t * 1.2); glow(g, bx, by - h * 0.05, w * 0.08, '#fff0c8', (C.dark ? 0.08 : 0.15) * shine);
    threadBeam(g, w * 0.55, 0, w * 0.8, h, 3, C.dark ? 0.12 : 0.25);
    motes(g, w, h, t, R, w * 0.3, w, 0, h, 22, '#fff0c8');
  };
  // 13.5 vệt nắng mảnh như sợi chỉ nhích dần trên nền đất; kim chỉ luồn vào, luồn ra miếng vá nâu
  ART.sunline = function (g, w, h, t, R) {
    room2(g, w, h, true);
    g.fillStyle = C.dark ? '#1c1712' : '#7a6a54'; g.fillRect(0, h * 0.35, w, h * 0.65);
    var x = w * (0.3 + ((t * 0.004) % 0.4)); // nhích chậm tới mức phải nhìn rất lâu
    g.fillStyle = rgba('#fff0c8', C.dark ? 0.35 : 0.6); g.beginPath(); g.moveTo(x, h * 0.35); g.lineTo(x + 3, h * 0.35); g.lineTo(x + w * 0.12 + 4, h); g.lineTo(x + w * 0.12, h); g.fill();
    glow(g, x + w * 0.06, h * 0.7, w * 0.08, '#fff0c8', C.dark ? 0.06 : 0.12);
    // vạt áo nâu, miếng vá vuông, kim chỉ
    g.fillStyle = C.dark ? '#3a2c20' : '#7a5a3e'; g.beginPath(); g.moveTo(w * 0.55, h * 0.55); g.quadraticCurveTo(w * 0.75, h * 0.48, w * 0.98, h * 0.56); g.lineTo(w * 0.98, h); g.lineTo(w * 0.5, h); g.fill();
    g.fillStyle = C.dark ? '#4a3a2a' : '#94704c'; g.fillRect(w * 0.7, h * 0.62, w * 0.1, h * 0.12);
    g.strokeStyle = rgba(C.dark ? '#c8b89a' : '#f0e2c4', 0.7); g.setLineDash([3, 4]); g.lineWidth = 1; g.strokeRect(w * 0.7, h * 0.62, w * 0.1, h * 0.12); g.setLineDash([]);
    var ph = (t * 0.5) % 1, nx = w * 0.8 + Math.sin(ph * Math.PI) * w * 0.06, ny = h * 0.62 - Math.sin(ph * Math.PI) * h * 0.14;
    g.strokeStyle = C.dark ? '#b8a888' : '#e8d8b4'; g.lineWidth = 1; g.beginPath(); g.moveTo(w * 0.8, h * 0.66); g.quadraticCurveTo(nx + w * 0.02, ny + h * 0.1, nx, ny); g.stroke(); // sợi chỉ gai
    g.strokeStyle = C.dark ? '#d8d8d0' : '#5a5a56'; g.lineWidth = 2; g.beginPath(); g.moveTo(nx, ny); g.lineTo(nx + w * 0.03, ny - h * 0.04); g.stroke(); // kim
    g.fillStyle = C.dark ? '#a89878' : '#c8b088'; g.beginPath(); g.ellipse(w * 0.6, h * 0.86, w * 0.03, h * 0.025, 0, 0, 7); g.fill(); // cuộn chỉ
    motes(g, w, h, t, R, x - w * 0.05, x + w * 0.2, h * 0.35, h, 14, '#fff0c8');
  };
  // 13.6 khe cửa gỗ sáng một đường dọc; mép chõng có hai mảnh vải xanh bạc màu tưa sợi
  ART.doorcrack = function (g, w, h, t, R) {
    room2(g, w, h, false);
    g.fillStyle = C.dark ? '#2a2016' : '#5e4630'; g.fillRect(w * 0.55, h * 0.06, w * 0.3, h * 0.82); // cánh cửa gỗ
    g.strokeStyle = rgba('#000000', 0.35); for (var p = 1; p < 4; p++) { g.beginPath(); g.moveTo(w * (0.55 + p * 0.075), h * 0.06); g.lineTo(w * (0.55 + p * 0.075), h * 0.88); g.stroke(); }
    var cr = 0.85 + 0.15 * Math.sin(t * 0.7); g.fillStyle = rgba('#fff4d8', C.dark ? 0.75 * cr : 0.95); g.fillRect(w * 0.548, h * 0.06, 2.5, h * 0.82); // khe sáng
    glow(g, w * 0.55, h * 0.47, w * 0.18, '#fff4d8', (C.dark ? 0.1 : 0.2) * cr);
    var sp = g.createLinearGradient(0, h * 0.88, 0, h); sp.addColorStop(0, rgba('#fff4d8', C.dark ? 0.2 : 0.35)); sp.addColorStop(1, rgba('#fff4d8', 0)); g.fillStyle = sp; g.beginPath(); g.moveTo(w * 0.545, h * 0.88); g.lineTo(w * 0.555, h * 0.88); g.lineTo(w * 0.62, h); g.lineTo(w * 0.47, h); g.fill();
    g.fillStyle = C.dark ? '#2a2216' : '#9a8460'; g.fillRect(0, h * 0.7, w * 0.42, h * 0.05); // mép chõng
    [[0.12, 0.69, -0.1], [0.27, 0.695, 0.15]].forEach(function (c) { g.save(); g.translate(w * c[0], h * c[1]); g.rotate(c[2]); g.fillStyle = C.dark ? '#3e5560' : '#7a9aa6'; g.fillRect(-w * 0.05, -h * 0.012, w * 0.1, h * 0.024); g.strokeStyle = C.dark ? '#5a7480' : '#a8c0c8'; g.lineWidth = 1; for (var q = 0; q < 5; q++) { g.beginPath(); g.moveTo(w * 0.05, -h * 0.01 + q * h * 0.005); g.lineTo(w * 0.058 + R[q] * 4, -h * 0.01 + q * h * 0.005); g.stroke(); } g.restore(); }); // vải xanh bạc màu, tưa sợi
    motes(g, w, h, t, R, w * 0.45, w * 0.7, h * 0.1, h, 14, '#fff4d8');
  };
  // 13.7 nắng ngả vàng sẫm trên sườn đồi: sọt đá dựng lại, đòn gánh, đá xúc về từng hòn; không còn đốm đỏ nào
  ART.slopedusk = function (g, w, h, t, R) {
    var dk = C.dark; sky(g, w, h, 'dusk', 0.6);
    var sx = w * 0.82, sy = h * 0.32; glow(g, sx, sy, w * 0.3, '#f0a050', dk ? 0.18 : 0.3);
    g.fillStyle = rgba(sil('dusk'), 0.6); g.beginPath(); g.moveTo(0, h * 0.45); g.lineTo(w * 0.2, h * 0.3); g.lineTo(w * 0.42, h * 0.38); g.lineTo(w * 0.62, h * 0.24); g.lineTo(w, h * 0.4); g.lineTo(w, h); g.lineTo(0, h); g.fill();
    slope(g, w, h, h * 0.55, h * 0.48, dk ? '#38322a' : '#b8a888', R, 9);
    var ray = g.createLinearGradient(w, 0, 0, h); ray.addColorStop(0, rgba('#f0b060', dk ? 0.14 : 0.25)); ray.addColorStop(1, rgba('#f0b060', 0)); g.fillStyle = ray; g.fillRect(0, 0, w, h);
    [[0.22, 0.78, 0], [0.4, 0.72, 0], [0.66, 0.8, 0]].forEach(function (b, i) { basketRock(g, w * b[0], h * b[1], h * 0.09, b[2], dk ? '#8a7650' : '#5a4a30'); for (var s = 0; s < 3; s++) rock(g, w * b[0] + (s - 1) * h * 0.025, h * b[1] - h * 0.035, h * 0.012, R, i * 3 + s, dk ? '#5a5650' : '#8a867a'); });
    g.strokeStyle = dk ? '#5a4a34' : '#4a3a24'; g.lineWidth = Math.max(2, h * 0.009); g.beginPath(); g.moveTo(w * 0.24, h * 0.88); g.lineTo(w * 0.62, h * 0.86); g.stroke();
    // đá được xúc về từng hòn, chậm rãi
    var ph = (t * 0.25) % 1; rock(g, w * (0.5 - ph * 0.08), h * (0.9 - Math.sin(ph * Math.PI) * 0.08), h * 0.014, R, 40, dk ? '#6a665e' : '#7a766a');
    dust(g, w, h, t, R, h * 0.5, 16);
  };
  // 13.8 tiệm rèn: lán tôn gỉ, lò than đỏ như con mắt đang mở, đe, tia lửa; ghế đẩu cạnh đống sắt vụn; vết giày đế khía trên lớp tro mịn
  ART.forge = function (g, w, h, t, R, o) {
    var v = o && o[0];
    smithy(g, w, h, t, R, v === 'white' ? { fire: 1, steam: true, stool: true, lock: true, sparks: true } : v === 'lock' ? { lock: true, prints: false } : { prints: true, blow: true });
  };
  // 13.9 cái ổ khoá trên góc đe, cận cảnh: một vệt sáng lạnh quét qua và thấy cả bên trong: lò xo, lẫy, chốt, chẳng thứ gì xê dịch
  ART.lockxray = function (g, w, h, t, R) {
    var dk = C.dark; g.fillStyle = dk ? '#0d0c0b' : '#3a3632'; g.fillRect(0, 0, w, h);
    glow(g, w * 0.08, h * 0.9, w * 0.5, EMBER, dk ? 0.18 : 0.25); // ánh lò hắt từ bên trái
    g.fillStyle = dk ? '#2a2c2e' : '#4a4d50'; g.beginPath(); g.moveTo(0, h * 0.72); g.lineTo(w, h * 0.68); g.lineTo(w, h); g.lineTo(0, h); g.fill(); // mặt đe
    g.strokeStyle = rgba('#ffffff', dk ? 0.15 : 0.25); g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, h * 0.72); g.lineTo(w, h * 0.68); g.stroke();
    var cx = w * 0.5, cy = h * 0.5, bw = Math.min(w * 0.3, h * 0.42), bh = bw * 0.9;
    g.strokeStyle = dk ? '#151515' : '#1e1e1e'; g.lineWidth = bw * 0.13; g.beginPath(); g.arc(cx, cy - bh * 0.42, bw * 0.3, Math.PI, 0); g.stroke(); // quai
    g.fillStyle = dk ? '#151515' : '#1e1e1e'; g.beginPath(); g.ellipse(cx, cy + bh * 0.05, bw * 0.5, bh * 0.5, 0, 0, 7); g.fill(); // thân khoá
    g.fillStyle = rgba('#6a3a22', 0.35); for (var r = 0; r < 22; r++) { g.beginPath(); g.arc(cx + (R[r] - 0.5) * bw * 0.8, cy + (R[r + 22] - 0.5) * bh * 0.8, 0.8 + R[r + 44] * 1.6, 0, 7); g.fill(); } // gỉ sét
    g.fillStyle = '#050505'; g.beginPath(); g.arc(cx, cy + bh * 0.05, bw * 0.05, 0, 7); g.fill(); g.fillRect(cx - bw * 0.015, cy + bh * 0.05, bw * 0.03, bh * 0.14); // lỗ khoá
    // vệt sáng lạnh quét ngang: trong dải sáng thấy cơ cấu bên trong, nguyên chỗ cũ
    var sweep = ((t * 0.22) % 1.4) - 0.2, sx = cx - bw * 0.7 + sweep * bw * 1.4, band = bw * 0.28;
    g.save(); g.beginPath(); g.rect(sx - band / 2, 0, band, h); g.clip();
    g.beginPath(); g.ellipse(cx, cy + bh * 0.05, bw * 0.5, bh * 0.5, 0, 0, 7); g.clip();
    var ink = dk ? '#cfd8dc' : '#e8eef0'; g.strokeStyle = rgba(ink, 0.85); g.lineWidth = 1.3;
    for (var p = 0; p < 4; p++) { var px = cx - bw * 0.27 + p * bw * 0.18, py0 = cy - bh * 0.3; g.beginPath(); g.moveTo(px, py0); for (var s = 0; s < 8; s++) g.lineTo(px + (s % 2 ? 4 : -4), py0 + s * bh * 0.035); g.stroke(); g.strokeRect(px - 4, py0 + bh * 0.28, 8, bh * 0.14); } // lò xo + lẫy
    g.strokeRect(cx - bw * 0.36, cy + bh * 0.25, bw * 0.72, bh * 0.08); // chốt
    g.restore();
    var bandG = g.createLinearGradient(sx - band / 2, 0, sx + band / 2, 0); bandG.addColorStop(0, rgba('#e8eef0', 0)); bandG.addColorStop(0.5, rgba('#e8eef0', dk ? 0.1 : 0.16)); bandG.addColorStop(1, rgba('#e8eef0', 0)); g.fillStyle = bandG; g.fillRect(sx - band / 2, 0, band, h);
    motes(g, w, h, t, R, 0, w * 0.6, 0, h * 0.7, 14, HOT);
  };
  // 13.11 hoàng hôn đỏ đục như nước rỉ sắt; đường mòn ra khỏi khu Mỏ, ba hàng dấu chân, hàng sải dài nhất đi trước đúng nửa bước; lán rèn còn khói sau lưng
  ART.dusk13 = function (g, w, h, t, R) {
    var dk = C.dark, gr = g.createLinearGradient(0, 0, 0, h * 0.55);
    gr.addColorStop(0, dk ? '#1a1416' : '#8a7a7e'); gr.addColorStop(1, dk ? '#5a2a1e' : '#d88a64'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    var sx = w * 0.3, sy = h * 0.5; glow(g, sx, sy, w * 0.35, '#e0603a', dk ? 0.3 : 0.4);
    g.fillStyle = dk ? '#ff8a5a' : '#ffb08a'; g.beginPath(); g.arc(sx, sy, h * 0.05, Math.PI, 0); g.fill(); // mặt trời chạm đỉnh đồi như hòn than
    g.fillStyle = dk ? '#120e0c' : '#5a4a44'; g.beginPath(); g.moveTo(0, h * 0.5); g.lineTo(w * 0.15, h * 0.42); g.lineTo(w * 0.42, h * 0.52); g.lineTo(w * 0.66, h * 0.4); g.lineTo(w, h * 0.5); g.lineTo(w, h); g.lineTo(0, h); g.fill();
    g.fillStyle = dk ? '#2a2420' : '#8a7a6a'; g.beginPath(); g.moveTo(w * 0.15, h); g.lineTo(w * 0.85, h); g.lineTo(w * 0.36, h * 0.52); g.lineTo(w * 0.31, h * 0.52); g.fill(); // đường mòn về phía mặt trời
    // lán rèn sau lưng: một đốm lửa và làn khói
    var lf = 0.7 + 0.3 * Math.sin(t * 5); glow(g, w * 0.88, h * 0.47, w * 0.06, EMBER, 0.5 * lf); g.fillStyle = dk ? '#3a2018' : '#6a3a2a'; g.fillRect(w * 0.84, h * 0.44, w * 0.08, h * 0.01); wisp(g, w * 0.87, h * 0.44, h * 0.2, t, dk ? '#2a2a2a' : '#5a5a5a', 0.4);
    // ba hàng dấu chân hướng về phía tây; hàng sải dài đi trước nửa bước
    [[0.5, 0.075, 0.5], [0.42, 0.06, 0], [0.58, 0.05, 0]].forEach(function (L, i) {
      for (var f = 0; f < 9; f++) { var u = (f + L[2]) / 9, p = Math.pow(u, 0.8), x = w * (L[0] + (0.335 - L[0]) * p) + (f % 2 ? 1 : -1) * w * 0.008 * (1 - p), y = h * (0.98 - p * 0.44), s = 1 - p * 0.75; if (y < h * 0.54) continue; g.fillStyle = rgba('#000000', (dk ? 0.5 : 0.3) * (0.4 + 0.6 * (1 - p))); g.beginPath(); g.ellipse(x, y, w * 0.012 * s * (1 + i * 0.0), h * 0.009 * s, 0, 0, 7); g.fill(); }
    });
    var hz = g.createLinearGradient(0, h * 0.5, 0, h); hz.addColorStop(0, rgba('#e0603a', dk ? 0.12 : 0.18)); hz.addColorStop(1, rgba('#e0603a', 0)); g.fillStyle = hz; g.fillRect(0, h * 0.5, w, h * 0.5);
    dust(g, w, h, t, R, h * 0.55, 14);
  };

  /* ---------- chương 14: chạng vạng khu Mỏ, sân Nhà họp làng ban đêm, tháp chuông, tiếng chuông, quỷ đầu đàn (chèn sau art5.js). Không vẽ người, chỉ dấu vết. ---------- */
  var ICE14 = '#9fd4ea', LAMP14 = '#ffcf7a';
  // tháp chuông gỗ: bốn cột xiêu, mái ván mục, chuông đồng xỉn rêu; rope: 'tied' | 'hang' | 'sway'
  function tower14(g, x, base, s, t, o) {
    o = o || {}; var dk = C.dark, wood = dk ? '#2a2016' : '#5a4430', top = base - s * 2.1;
    g.strokeStyle = wood; g.lineWidth = Math.max(2, s * 0.07);
    [[-0.55, -0.5], [0.55, 0.48], [-0.32, -0.3], [0.34, 0.3]].forEach(function (c, i) { g.globalAlpha = i > 1 ? 0.6 : 1; g.beginPath(); g.moveTo(x + c[0] * s, base); g.lineTo(x + c[1] * s + (i % 2 ? 2 : -2), top); g.stroke(); });
    g.globalAlpha = 1;
    g.fillStyle = dk ? '#1e1812' : '#4a3a28'; g.beginPath(); g.moveTo(x - s * 0.75, top + s * 0.05); g.lineTo(x, top - s * 0.4); g.lineTo(x + s * 0.78, top + s * 0.08); g.lineTo(x + s * 0.7, top + s * 0.14); g.lineTo(x - s * 0.7, top + s * 0.12); g.fill(); // mái ván mục
    g.fillRect(x - s * 0.55, top + s * 0.12, s * 1.1, s * 0.06); // xà
    var sw = o.rope === 'sway' ? Math.sin(t * 2.2) * Math.exp(-((t % 9) * 0.3)) * 0.25 : 0, bx = x, by = top + s * 0.18, bw = s * 0.62, bh = s * 0.62;
    g.save(); g.translate(bx, by); g.rotate(sw * 0.15);
    var bg = g.createLinearGradient(-bw / 2, 0, bw / 2, 0); bg.addColorStop(0, dk ? '#2e3a30' : '#5f6a4c'); bg.addColorStop(0.45, dk ? '#5a5a3e' : '#9a8a5a'); bg.addColorStop(1, dk ? '#232a22' : '#4a5238'); g.fillStyle = bg;
    g.beginPath(); g.moveTo(-bw * 0.22, 0); g.quadraticCurveTo(-bw * 0.3, bh * 0.55, -bw * 0.5, bh); g.lineTo(bw * 0.5, bh); g.quadraticCurveTo(bw * 0.3, bh * 0.55, bw * 0.22, 0); g.fill();
    g.fillStyle = dk ? '#3f5a3a' : '#6f8a58'; for (var m = 0; m < 9; m++) g.fillRect(-bw * 0.48 + m * bw * 0.11, bh * 0.93, bw * 0.06, bh * 0.05); // rêu ở mép
    if (o.ice) { var k = o.ice; var ig = g.createRadialGradient(-bw * 0.25, bh * 0.55, 0, -bw * 0.25, bh * 0.55, bw * 0.8); ig.addColorStop(0, rgba(ICE14, 0.7 * k)); ig.addColorStop(1, rgba(ICE14, 0)); g.fillStyle = ig; g.fillRect(-bw, -bh * 0.3, bw * 2, bh * 1.6); g.strokeStyle = rgba(ICE14, 0.8 * k); g.lineWidth = 1.2; for (var q = 0; q < 6; q++) { g.beginPath(); g.moveTo(-bw * 0.3, bh * (0.4 + q * 0.08)); g.quadraticCurveTo(0, bh * (0.35 + q * 0.1), bw * (0.1 + q * 0.06), bh * (0.5 + q * 0.07)); g.stroke(); } }
    g.restore();
    // dây thừng
    g.strokeStyle = dk ? '#6a5a40' : '#8a7450'; g.lineWidth = Math.max(1.5, s * 0.03); g.beginPath(); g.moveTo(bx, by + bh * 0.95);
    if (o.rope === 'tied') { g.quadraticCurveTo(bx - s * 0.1, base - s * 0.6, x - s * 0.5, base - s * 0.55); g.stroke(); g.lineWidth *= 1.6; for (var w = 0; w < 4; w++) { g.beginPath(); g.moveTo(x - s * 0.58, base - s * (0.62 - w * 0.05)); g.lineTo(x - s * 0.44, base - s * (0.6 - w * 0.05)); g.stroke(); } }
    else { var rx = bx + Math.sin(t * 1.6) * s * 0.18 * (o.rope === 'sway' ? 1 : 0.04); g.quadraticCurveTo(bx + (rx - bx) * 0.6, base - s * 0.6, rx, base - s * 0.02); g.stroke(); }
  }
  // sân gạch ban đêm phối cảnh
  function yardFloor(g, w, h, hz, lampA) {
    var dk = C.dark; g.fillStyle = dk ? '#1a1210' : '#7a5446'; g.fillRect(0, hz, w, h - hz);
    g.strokeStyle = rgba('#000000', 0.25); g.lineWidth = 1; for (var r = 0; r < 11; r++) { var y = hz + (h - hz) * Math.pow(r / 10, 1.4); g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    for (var c = -6; c <= 6; c++) { g.beginPath(); g.moveTo(w / 2 + c * w * 0.04, hz); g.lineTo(w / 2 + c * w * 0.2, h); g.stroke(); }
  }
  function lamp14(g, x, y, s, t, a) {
    if (a <= 0) { // bấc vừa tắt, sợi khói mảnh
      wisp(g, x, y - s * 0.2, s * 3, t, C.dark ? '#8a8a84' : '#5a5a54', 0.35); g.fillStyle = C.dark ? '#3a3020' : '#2a2016'; g.fillRect(x - s * 0.25, y - s * 0.2, s * 0.5, s * 0.6); return;
    }
    var fl = (0.8 + 0.2 * Math.sin(t * 7) * Math.sin(t * 3.1)) * a;
    glow(g, x, y, s * 9, LAMP14, (C.dark ? 0.28 : 0.35) * fl);
    g.fillStyle = C.dark ? '#3a3020' : '#2a2016'; g.fillRect(x - s * 0.35, y, s * 0.7, s * 0.7);
    g.fillStyle = rgba('#fff0c0', 0.9 * fl); g.beginPath(); g.ellipse(x + Math.sin(t * 5) * s * 0.05, y - s * 0.25, s * 0.18, s * 0.42, 0, 0, 7); g.fill();
  }
  // 14.1 chạng vạng khu Mỏ: ngã rẽ hai ngả, hai căn nhà dân tối om không một đốm lửa, trời tím bầm phía tây
  ART.fork14 = function (g, w, h, t, R) {
    var dk = C.dark, gr = g.createLinearGradient(0, 0, 0, h * 0.6);
    gr.addColorStop(0, dk ? '#120e18' : '#6a6478'); gr.addColorStop(0.7, dk ? '#3a1e26' : '#b07a7a'); gr.addColorStop(1, dk ? '#4a2a22' : '#c89480'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    glow(g, w * 0.15, h * 0.55, w * 0.4, '#a04040', dk ? 0.18 : 0.22);
    g.fillStyle = dk ? '#0e0c0c' : '#4a3e3e'; g.beginPath(); g.moveTo(0, h * 0.55); g.lineTo(w * 0.25, h * 0.4); g.lineTo(w * 0.5, h * 0.5); g.lineTo(w * 0.78, h * 0.36); g.lineTo(w, h * 0.48); g.lineTo(w, h); g.lineTo(0, h); g.fill();
    chimney(g, w * 0.62, h * 0.5, w * 0.03, h * 0.2, t);
    // hai căn nhà dân tối, cửa đen ngòm
    [[0.24, 0.58, 1], [0.8, 0.54, 0.8]].forEach(function (c) { var x = w * c[0], y = h * c[1], s = h * 0.1 * c[2]; g.fillStyle = dk ? '#1a1614' : '#3a3230'; g.fillRect(x - s, y - s * 0.7, s * 2, s * 0.7); g.beginPath(); g.moveTo(x - s * 1.2, y - s * 0.68); g.lineTo(x, y - s * 1.3); g.lineTo(x + s * 1.2, y - s * 0.68); g.fill(); g.fillStyle = '#050404'; g.fillRect(x - s * 0.2, y - s * 0.5, s * 0.4, s * 0.5); });
    // con đường chẻ làm hai
    g.fillStyle = dk ? '#2a2420' : '#8a7a6a'; g.beginPath(); g.moveTo(w * 0.35, h); g.lineTo(w * 0.65, h); g.lineTo(w * 0.52, h * 0.75); g.lineTo(w * 0.82, h * 0.56); g.lineTo(w * 0.78, h * 0.555); g.lineTo(w * 0.5, h * 0.72); g.lineTo(w * 0.27, h * 0.585); g.lineTo(w * 0.23, h * 0.59); g.lineTo(w * 0.47, h * 0.76); g.fill();
    // ba hàng dấu chân dừng lại ở chỗ rẽ
    for (var f = 0; f < 7; f++) for (var l = 0; l < 3; l++) { var u = f / 7, x = w * (0.5 + (l - 1) * 0.04) + (f % 2 ? 3 : -3), y = h * (0.98 - u * 0.2); g.fillStyle = rgba('#000000', (dk ? 0.45 : 0.25) * (1 - u * 0.5)); g.beginPath(); g.ellipse(x, y, w * 0.008 * (1 - u * 0.4), h * 0.006, 0, 0, 7); g.fill(); }
    dust(g, w, h, t, R, h * 0.6, 10);
  };
  // 14.2 sân Nhà họp làng ban đêm: đèn dầu trên cột, giếng nhỏ, tháp chuông góc trái, dây thừng đã tháo buông chạm đất; dấu dép tổ ong trên bậc thềm
  ART.yard14 = function (g, w, h, t, R, o) {
    var dk = C.dark, v = o && o[0], lampA = v === 'out' ? 0 : 1, hz = h * 0.42;
    sky(g, w, h * 0.5, 'night', 1); moon(g, w * 0.82, h * 0.12, h * 0.025, t);
    g.fillStyle = dk ? '#07090a' : '#3a3e3c'; g.beginPath(); g.moveTo(w * 0.35, hz); g.lineTo(w * 0.35, h * 0.24); g.lineTo(w * 0.62, h * 0.12); g.lineTo(w * 0.98, h * 0.24); g.lineTo(w * 0.98, hz); g.fill(); // mái ngói Nhà họp làng
    g.fillStyle = dk ? '#0d0f0f' : '#4a4a44'; g.fillRect(w * 0.38, h * 0.24, w * 0.58, hz - h * 0.24);
    g.fillStyle = '#030303'; g.fillRect(w * 0.6, h * 0.29, w * 0.12, hz - h * 0.29); // cửa chính tối om
    g.fillStyle = dk ? '#050707' : '#2a2620'; [0.42, 0.56, 0.76, 0.92].forEach(function (x) { g.fillRect(w * x, h * 0.24, w * 0.012, hz - h * 0.24); });
    yardFloor(g, w, h, hz);
    if (lampA) { var lg = g.createRadialGradient(w * 0.56, hz, 0, w * 0.56, hz, w * 0.45); lg.addColorStop(0, rgba(LAMP14, dk ? 0.18 : 0.22)); lg.addColorStop(1, rgba(LAMP14, 0)); g.fillStyle = lg; g.fillRect(0, hz, w, h - hz); }
    lamp14(g, w * 0.567, h * 0.3, h * 0.022, t, lampA);
    // giếng nhỏ giữa sân
    var wx = w * 0.55, wy = h * 0.7; g.fillStyle = dk ? '#26302d' : '#7d877a'; g.beginPath(); g.ellipse(wx, wy, w * 0.07, h * 0.03, 0, 0, 7); g.fill(); g.fillRect(wx - w * 0.07, wy, w * 0.14, h * 0.06); g.beginPath(); g.ellipse(wx, wy + h * 0.06, w * 0.07, h * 0.026, 0, 0, Math.PI); g.fill();
    g.fillStyle = '#050707'; g.beginPath(); g.ellipse(wx, wy, w * 0.055, h * 0.02, 0, 0, 7); g.fill();
    tower14(g, w * 0.17, h * 0.78, h * 0.2, t, { rope: 'hang' });
    // dấu dép tổ ong trên bậc thềm
    for (var d = 0; d < 2; d++) { var px = w * (0.63 + d * 0.05), py = hz + h * 0.03; g.fillStyle = rgba('#000000', dk ? 0.4 : 0.25); g.beginPath(); g.ellipse(px, py, w * 0.014, h * 0.008, 0, 0, 7); g.fill(); g.fillStyle = rgba(dk ? '#3a2a22' : '#9a7a6a', 0.6); for (var hh = 0; hh < 5; hh++) g.fillRect(px - w * 0.009 + hh * w * 0.004, py - 1, 1.5, 1.5); }
    if (lampA) motes(g, w, h, t, R, w * 0.45, w * 0.7, h * 0.15, h * 0.45, 8, LAMP14);
  };
  // 14.3 cận cảnh chiếc chuông đồng: rêu ở mép, dây thừng buông thõng; dưới mép chuông, ánh đèn hắt lên hai ô vuông nhỏ như mặt kính
  ART.bell14 = function (g, w, h, t, R) {
    var dk = C.dark; g.fillStyle = dk ? '#06080a' : '#2e3436'; g.fillRect(0, 0, w, h);
    glow(g, w * 0.9, h * 0.9, w * 0.5, LAMP14, dk ? 0.12 : 0.18);
    tower14(g, w * 0.5, h * 1.25, h * 0.55, t, { rope: 'hang', ice: 0.12 + 0.08 * Math.sin(t * 0.9) });
    // hai ô kính nhỏ loé ánh đèn trong bóng tối dưới mái tháp
    var k = 0.5 + 0.5 * Math.sin(t * 0.6); g.fillStyle = rgba(LAMP14, 0.55 * k); g.fillRect(w * 0.63, h * 0.62, w * 0.022, h * 0.014); g.fillRect(w * 0.66, h * 0.62, w * 0.022, h * 0.014);
    glow(g, w * 0.65, h * 0.627, w * 0.04, LAMP14, 0.15 * k);
    motes(g, w, h, t, R, w * 0.2, w * 0.8, h * 0.1, h * 0.9, 10, ICE14);
  };
  // 14.4 chuông ngân: những vòng sáng xanh băng lan ra xuyên qua mái nhà, xuyên qua bức tường trong suốt; dây thừng đung đưa; mấy vòng xích quấn vào khoảng không
  ART.bellring = function (g, w, h, t, R) {
    var dk = C.dark; sky(g, w, h, 'night', 1);
    var cx = w * 0.3, cy = h * 0.42;
    for (var i = 0; i < 6; i++) { var ph = ((t * 0.16 + i / 6) % 1), r = ph * Math.max(w, h) * 1.1; g.strokeStyle = rgba(ICE14, (dk ? 0.45 : 0.6) * (1 - ph)); g.lineWidth = 1.5 + (1 - ph) * 2; g.beginPath(); g.ellipse(cx, cy, r, r * 0.55, 0, 0, 7); g.stroke(); }
    // mái nhà thấp và bức tường trong suốt ở xa: rung theo vòng sóng
    g.fillStyle = dk ? '#050708' : '#3e4442'; for (var m = 0; m < 7; m++) { var x = w * (0.42 + m * 0.09), y = h * 0.62 + Math.sin(t * 3 + m) * 0.6; g.beginPath(); g.moveTo(x - w * 0.05, y); g.lineTo(x, y - h * 0.06); g.lineTo(x + w * 0.05, y); g.fill(); }
    g.fillStyle = dk ? '#050708' : '#3e4442'; g.fillRect(0, h * 0.62, w, h * 0.38);
    var wl = (Math.sin(t * 1.3) * 0.5 + 0.5); g.strokeStyle = rgba(ICE14, 0.18 + 0.2 * wl); g.lineWidth = 2; g.beginPath(); g.moveTo(w * 0.92, h * 0.2); g.lineTo(w * 0.92, h * 0.62); g.stroke();
    tower14(g, cx, h * 0.64, h * 0.12, t, { rope: 'sway', ice: 0.6 + 0.3 * Math.sin(t * 2) });
    // mấy vòng xích quấn vào khoảng không, rơi lỏng
    var col = dk ? '#b8c4c8' : '#2e3638', lk = Math.max(6, h * 0.018); g.strokeStyle = col; g.lineWidth = Math.max(1.3, lk * 0.2);
    for (var c = 0; c < 26; c++) { var a = c / 26 * 6.283 * 2.4, rr2 = w * 0.06 * (1 - c / 60), x2 = w * 0.52 + Math.cos(a) * rr2, y2 = h * 0.86 + Math.sin(a) * rr2 * 0.3; g.save(); g.translate(x2, y2); g.rotate(a + 1.57); g.beginPath(); g.ellipse(0, 0, lk * (c % 2 ? 0.14 : 0.34), lk * 0.6, 0, 0, 7); g.stroke(); g.restore(); }
  };
  // 14.5 sau tiếng chuông: dây thừng đã thôi đung đưa, mặt gạch chỗ ấy không một dấu giày; xích đã thu về
  ART.rope14 = function (g, w, h, t, R) {
    var dk = C.dark; g.fillStyle = dk ? '#08090a' : '#3a3c3a'; g.fillRect(0, 0, w, h);
    yardFloor(g, w, h, h * 0.62);
    glow(g, w * 0.95, h * 0.5, w * 0.5, LAMP14, dk ? 0.1 : 0.16);
    tower14(g, w * 0.45, h * 0.92, h * 0.38, t, { rope: 'hang' });
    // vạch sáng lạnh nhạt dần trên mặt chuông
    var k = Math.max(0, Math.sin(t * 0.25)) * 0.25; glow(g, w * 0.45, h * 0.3, w * 0.12, ICE14, k);
    // khoảng gạch trơn dưới tháp: không dấu giày nào
    g.strokeStyle = rgba(ICE14, 0.08 + 0.05 * Math.sin(t)); g.setLineDash([3, 6]); g.beginPath(); g.ellipse(w * 0.45, h * 0.9, w * 0.12, h * 0.03, 0, 0, 7); g.stroke(); g.setLineDash([]);
    motes(g, w, h, t, R, w * 0.3, w * 0.6, h * 0.3, h * 0.9, 6, '#d8dcd8');
  };
  // 14.6 nhìn qua bức tường trong suốt sang ruộng khu Nông nghiệp dưới trăng non: những cặp đốm đỏ tắt dần từng cặp một
  ART.fieldseyes = function (g, w, h, t, R) {
    var dk = C.dark; sky(g, w, h, 'night', 0.6); moon(g, w * 0.2, h * 0.18, h * 0.03, t);
    for (var s = 0; s < 30; s++) { g.fillStyle = rgba('#ffffff', 0.3 + 0.3 * Math.sin(t + s)); g.fillRect(R[s] * w, R[s + 30] * h * 0.4, 1.2, 1.2); }
    g.fillStyle = dk ? '#0c1210' : '#4e5a52'; g.fillRect(0, h * 0.5, w, h * 0.5);
    g.strokeStyle = rgba(dk ? '#2a3a30' : '#6a7a68', 0.6); g.lineWidth = 1; for (var r = 0; r < 9; r++) { var y = h * 0.5 + h * 0.5 * Math.pow(r / 8, 1.6); g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    // bức tường trong suốt: một gợn sáng dọc mờ
    var wg = g.createLinearGradient(w * 0.08, 0, w * 0.16, 0); wg.addColorStop(0, rgba(ICE14, 0)); wg.addColorStop(0.5, rgba(ICE14, dk ? 0.08 : 0.14)); wg.addColorStop(1, rgba(ICE14, 0)); g.fillStyle = wg; g.fillRect(w * 0.08, 0, w * 0.08, h);
    // mái nhà thấp gần (khu giữa)
    g.fillStyle = dk ? '#040506' : '#2e3230'; for (var m = 0; m < 4; m++) { var x = w * (0.1 + m * 0.3); g.beginPath(); g.moveTo(x - w * 0.14, h); g.lineTo(x - w * 0.1, h * 0.84); g.lineTo(x + w * 0.1, h * 0.84); g.lineTo(x + w * 0.14, h); g.fill(); }
    // đốm đỏ: tắt dần theo chu kỳ, từ trái sang phải, rồi lại lặp sau một khoảng tối dài
    var cyc = (t % 16) / 16;
    for (var e = 0; e < 18; e++) { var ex = w * (0.2 + R[e + 60] * 0.75), ey = h * (0.55 + R[e + 80] * 0.25), off = (ex / w - 0.15) * 0.6, a = cyc < off ? 1 : Math.max(0, 1 - (cyc - off) / 0.04); if (cyc > 0.92) a = (cyc - 0.92) / 0.08; if (a <= 0) continue; var sz = Math.max(1.4, h * 0.006 * (ey / h)); g.fillStyle = rgba('#e0322a', 0.85 * a); g.fillRect(ex - sz * 1.6, ey, sz, sz); g.fillRect(ex + sz * 0.6, ey, sz, sz); glow(g, ex, ey, sz * 6, '#e0322a', 0.1 * a); }
  };
  // 14.7 con số mười một trên bảng gỗ
  ART.board11 = function (g, w, h, t, R) { board(g, w, h, t, R, true, '11'); };
  // 14.8 đèn đã tắt, sân tối; ở cổng, bóng tối dày lên: hàng chục chiếc chuông đồng nhỏ loé ánh trăng, rồi những con mắt đỏ mở ra (không vẽ dáng)
  ART.crown14 = function (g, w, h, t, R) {
    var dk = C.dark; g.fillStyle = dk ? '#020303' : '#1e2222'; g.fillRect(0, 0, w, h);
    yardFloor(g, w, h, h * 0.6); g.fillStyle = rgba('#000000', 0.55); g.fillRect(0, 0, w, h);
    lamp14(g, w * 0.88, h * 0.34, h * 0.02, t, 0);
    // cổng: hai trụ, giữa là khoảng tối đặc hơn
    g.fillStyle = dk ? '#0c0e0e' : '#2a2e2e'; g.fillRect(w * 0.32, h * 0.18, w * 0.03, h * 0.5); g.fillRect(w * 0.65, h * 0.18, w * 0.03, h * 0.5); g.fillRect(w * 0.3, h * 0.16, w * 0.4, h * 0.03);
    var dg = g.createRadialGradient(w * 0.5, h * 0.42, 0, w * 0.5, h * 0.42, w * 0.25); dg.addColorStop(0, 'rgba(0,0,0,.95)'); dg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = dg; g.fillRect(0, 0, w, h);
    // vương miện chuông nhỏ: một vòng cung chấm đồng lấp loá, lắc lư
    var cyc = (t % 12), sway = Math.sin(t * 0.8) * w * 0.006;
    for (var b = 0; b < 15; b++) { var a = Math.PI * (0.1 + b / 14 * 0.8), x = w * 0.5 + Math.cos(a) * w * 0.07 + sway, y = h * 0.27 - Math.sin(a) * h * 0.04 + Math.sin(t * 6 + b) * 1.2, k = 0.4 + 0.6 * Math.abs(Math.sin(t * 2.3 + b * 1.7)); g.fillStyle = rgba(dk ? '#a89a6a' : '#c8b88a', 0.75 * k); g.beginPath(); g.arc(x, y, Math.max(1.6, h * 0.007), 0, 7); g.fill(); glow(g, x, y, h * 0.02, '#d8d0a8', 0.08 * k); }
    // mắt đỏ mở dần trong một vùng bầu dục trắng mờ
    var open = Math.min(1, Math.max(0, (cyc - 0.8) / 5)), n = Math.floor(open * 24), fade = cyc > 10.5 ? 1 - (cyc - 10.5) / 1.5 : 1;
    g.fillStyle = rgba(dk ? '#d8d8d0' : '#e8e8e0', 0.07 * Math.min(1, cyc / 0.8) * fade); g.beginPath(); g.ellipse(w * 0.5 + sway, h * 0.38, w * 0.05, h * 0.07, 0, 0, 7); g.fill();
    for (var e = 0; e < n; e++) { var ex = w * 0.5 + sway + (R[e] - 0.5) * w * 0.085, ey = h * 0.38 + (R[e + 30] - 0.5) * h * 0.12, sz = Math.max(1.2, h * 0.004), bl = Math.sin(t * 1.5 + e) > 0.96 ? 0.2 : 1; g.fillStyle = rgba('#ff3a2a', 0.9 * bl * fade); g.beginPath(); g.ellipse(ex, ey, sz * 1.4, sz * 0.8, 0, 0, 7); g.fill(); glow(g, ex, ey, sz * 5, '#ff3a2a', 0.08 * fade); }
  };

  /* ---------- chương 15: Nước giếng (chèn sau art6.js). Không vẽ người: quỷ đầu đàn chỉ là vương miện chuông nhỏ + bầu dục trắng mờ + mắt đỏ; người chỉ là dấu vết. ---------- */
  var STEEL15 = '#a9b4ba', WATER15 = '#8fd3e0';
  // vương miện chuông + mặt đầy mắt (cùng nét với crown14). o: {look: -1..1 hướng mắt, n: số mắt, sub: 0..1 chìm trong nước, a}
  function face15(g, cx, cy, s, t, R, o) {
    o = o || {}; var dk = C.dark, a = o.a == null ? 1 : o.a, n = o.n == null ? 24 : o.n, sub = o.sub || 0;
    g.fillStyle = rgba(dk ? '#d8d8d0' : '#eeeee8', 0.1 * a); g.beginPath(); g.ellipse(cx, cy, s * 0.55, s * 0.75, 0, 0, 7); g.fill();
    for (var b = 0; b < 13; b++) { var an = Math.PI * (0.12 + b / 12 * 0.76), x = cx + Math.cos(an) * s * 0.6, y = cy - s * 0.78 - Math.sin(an) * s * 0.28 + Math.sin(t * 6 + b) * 0.8, k = (0.4 + 0.6 * Math.abs(Math.sin(t * 2.3 + b * 1.7))) * (1 - sub * 0.8); g.fillStyle = rgba(dk ? '#a89a6a' : '#b8a878', 0.8 * k * a); g.beginPath(); g.arc(x, y, Math.max(1.4, s * 0.05), 0, 7); g.fill(); glow(g, x, y, s * 0.16, '#d8d0a8', 0.07 * k * a); }
    for (var e = 0; e < n; e++) {
      var ex = cx + (R[e] - 0.5) * s * 0.9, ey = cy + (R[e + 30] - 0.5) * s * 1.2, z = Math.max(1.1, s * 0.045), bl = Math.sin(t * 1.3 + e * 2.1) > 0.97 ? 0.15 : 1;
      g.fillStyle = rgba('#ff3a2a', 0.92 * bl * a * (1 - sub * 0.6)); g.beginPath(); g.ellipse(ex, ey, z * 1.4, z * 0.8, 0, 0, 7); g.fill();
      g.fillStyle = rgba('#120202', 0.95 * bl * a); g.fillRect(ex + (o.look || 0) * z * 0.6 - z * 0.12, ey - z * 0.6 + (o.down || 0) * z * 0.3, z * 0.24, z * 1.2);
      glow(g, ex, ey, z * 5, '#ff3a2a', 0.07 * a);
    }
  }
  function well15(g, x, y, s, dk) {
    g.fillStyle = dk ? '#26302d' : '#7d877a'; g.beginPath(); g.ellipse(x, y, s, s * 0.42, 0, 0, 7); g.fill(); g.fillRect(x - s, y, s * 2, s * 0.8); g.beginPath(); g.ellipse(x, y + s * 0.8, s, s * 0.36, 0, 0, Math.PI); g.fill();
    g.fillStyle = dk ? '#3f5a3a' : '#6f8a58'; for (var m = 0; m < 8; m++) g.fillRect(x - s + m * s * 0.26, y + s * (0.05 + (m % 3) * 0.1), s * 0.12, s * 0.06);
    g.fillStyle = '#040606'; g.beginPath(); g.ellipse(x, y, s * 0.8, s * 0.3, 0, 0, 7); g.fill();
  }
  function link15(g, pts, lk, col, a) {
    g.save(); g.globalAlpha = a == null ? 1 : a; g.strokeStyle = col; g.lineWidth = Math.max(1.3, lk * 0.2);
    for (var i = 0; i < pts.length; i++) { var p = pts[i], q = pts[Math.min(pts.length - 1, i + 1)], an = Math.atan2(q[1] - p[1], q[0] - p[0]); g.save(); g.translate(p[0], p[1]); g.rotate(an); g.beginPath(); g.ellipse(0, 0, lk * 0.5, lk * (i % 2 ? 0.12 : 0.3), 0, 0, 7); g.stroke(); g.restore(); }
    g.restore();
  }
  // kén xích kiểu mới (Clair 26/11 thấy cột vòng tròn chồng nhau buồn cười): khối tối chìm vào bóng đêm, các vòng xích quấn xoắn chéo,
  // chỉ nửa trước sáng (trăng từ bên phải), nửa sau mờ hẳn; mép dưới và mép trên tan vào bóng tối. rows = số vòng đã quấn (0..1)
  function helixCocoon(g, cx, top, base, rw, lk, rows, t, strain) {
    // kiểu trói mới (Clair 26/11: kén quấn kín trông như xác ướp): thân tối cao gầy, vai xuôi, chìm vào bóng đêm;
    // chỉ ba vòng xích ngang giữa thân, ổ khoá ở chỗ hai tay bắt chéo. rows = tiến độ quấn (0..1): vòng hiện dần, ổ khoá sập ở cuối
    var H2 = base - top, st = strain || 0;
    function hw(v) { if (v < 0.1) return rw * (0.32 + 0.68 * Math.sin(v / 0.1 * Math.PI / 2)); return rw * (1 - (v - 0.1) * 0.32); }
    var sg = g.createLinearGradient(0, top, 0, base); sg.addColorStop(0, 'rgba(6,7,8,.96)'); sg.addColorStop(0.8, 'rgba(6,7,8,.96)'); sg.addColorStop(1, 'rgba(6,7,8,0)');
    g.fillStyle = sg; g.beginPath(); var K = 24, i, v;
    for (i = 0; i <= K; i++) { v = i / K; g.lineTo(cx - hw(v) - Math.sin(v * 9 + t * 0.7) * rw * 0.015, top + v * H2); }
    for (i = K; i >= 0; i--) { v = i / K; g.lineTo(cx + hw(v) + Math.sin(v * 8 + t * 0.6) * rw * 0.015, top + v * H2); }
    g.closePath(); g.fill();
    // viền trăng mảnh mép phải
    g.strokeStyle = 'rgba(190,206,214,.18)'; g.lineWidth = 1.2; g.beginPath(); for (i = 1; i <= K - 4; i++) { v = i / K; g.lineTo(cx + hw(v), top + v * H2); } g.stroke();
    var loops = [0.4, 0.47, 0.54], shown = rows * 3, lockA = Math.max(0, Math.min(1, (rows - 0.9) / 0.1));
    for (var r = 0; r < 3; r++) {
      var part = Math.max(0, Math.min(1, shown - r)); if (!part) continue;
      var y0 = top + loops[r] * H2, rx = hw(loops[r]) * (1.03 - st * 0.03), ry = rx * 0.2, tl = (r - 1) * 0.04, n = 15, m = Math.round(n * part);
      for (var c = 0; c < m; c++) {
        var a = (c + 0.5) / n * Math.PI, x = cx - Math.cos(a) * rx, y = y0 + Math.sin(a) * ry + (x - cx) * tl;
        var lit = 0.45 + 0.55 * Math.max(0, -Math.cos(a - 0.5)) * 0.9 + 0.1;
        g.strokeStyle = 'rgba(200,214,220,' + Math.min(1, lit).toFixed(3) + ')'; g.lineWidth = Math.max(1.2, lk * 0.2);
        g.save(); g.translate(x, y); g.rotate(Math.atan2(Math.cos(a) * ry + rx * tl * Math.sin(a), Math.sin(a) * rx)); g.beginPath(); g.ellipse(0, 0, lk * 0.42, lk * (c % 2 ? 0.1 : 0.24), 0, 0, 7); g.stroke(); g.restore();
      }
    }
    if (lockA > 0) {
      var ly = top + 0.47 * H2 + hw(0.47) * 0.2 + lk * 0.2, s = lk * 1.15, drop = (1 - lockA) * s * 0.8;
      g.save(); g.globalAlpha = lockA; g.translate(cx, ly + drop);
      g.strokeStyle = '#aab6bc'; g.lineWidth = Math.max(2, s * 0.22); g.beginPath(); g.arc(0, -s * 0.15, s * 0.42, Math.PI, 0); g.lineTo(s * 0.42, s * 0.15); g.moveTo(-s * 0.42, -s * 0.15); g.lineTo(-s * 0.42, s * 0.15); g.stroke();
      g.fillStyle = '#8f9ca2'; g.beginPath(); g.rect(-s * 0.62, s * 0.1, s * 1.24, s * 0.95); g.fill();
      g.fillStyle = 'rgba(230,240,244,.35)'; g.fillRect(s * 0.3, s * 0.14, s * 0.22, s * 0.85);
      g.fillStyle = '#0b0d0e'; g.beginPath(); g.arc(0, s * 0.45, s * 0.13, 0, 7); g.fill(); g.fillRect(-s * 0.05, s * 0.45, s * 0.1, s * 0.3);
      g.restore();
    }
  }
  // 15.1 từ trong gian nhà nhìn ra: khung cửa tối, sân dưới trăng non, giếng nhỏ, cạnh giếng là vương miện chuông và mấy chục con mắt; trên mép ghế dài trong nhà, một dải vải thấm đỏ
  ART.stare15 = function (g, w, h, t, R) {
    var dk = C.dark; g.fillStyle = dk ? '#050606' : '#26282a'; g.fillRect(0, 0, w, h);
    var fx = w * 0.28, fw = w * 0.46, fy = h * 0.1, fh = h * 0.72;
    g.save(); g.beginPath(); g.rect(fx, fy, fw, fh); g.clip();
    sky(g, w, h * 0.5, 'night', 1); moon(g, fx + fw * 0.82, fy + fh * 0.12, h * 0.02, t);
    yardFloor(g, w, h, fy + fh * 0.45);
    well15(g, fx + fw * 0.35, fy + fh * 0.72, fw * 0.12, dk);
    var sway = Math.sin(t * 0.6) * fw * 0.006, look = Math.sin(t * 0.35) * 0.4;
    face15(g, fx + fw * 0.6 + sway, fy + fh * 0.38, fh * 0.12, t, R, { look: look });
    g.restore();
    // khung cửa gỗ lim
    g.fillStyle = dk ? '#1a1410' : '#4a3a2a'; g.fillRect(fx - w * 0.025, fy - h * 0.03, w * 0.025, fh + h * 0.03); g.fillRect(fx + fw, fy - h * 0.03, w * 0.025, fh + h * 0.03); g.fillRect(fx - w * 0.025, fy - h * 0.04, fw + w * 0.05, h * 0.04);
    // nền gạch trong nhà, ghế dài, dải vải đỏ sẫm vắt trên mép ghế
    g.fillStyle = dk ? '#0c0a09' : '#3a302a'; g.fillRect(0, fy + fh, w, h - fy - fh);
    g.fillStyle = dk ? '#2a2016' : '#5a4430'; g.fillRect(w * 0.04, h * 0.88, w * 0.5, h * 0.03); g.fillRect(w * 0.07, h * 0.91, w * 0.015, h * 0.09); g.fillRect(w * 0.5, h * 0.91, w * 0.015, h * 0.09);
    g.fillStyle = dk ? '#bdb6a6' : '#e8e2d2'; g.beginPath(); g.moveTo(w * 0.3, h * 0.88); g.quadraticCurveTo(w * 0.32, h * 0.95, w * 0.31, h * 0.99); g.lineTo(w * 0.335, h * 0.99); g.quadraticCurveTo(w * 0.34, h * 0.94, w * 0.33, h * 0.88); g.fill();
    g.fillStyle = rgba('#7a1020', 0.85); g.beginPath(); g.ellipse(w * 0.322, h * 0.94, w * 0.008, h * 0.018, 0, 0, 7); g.fill();
    motes(g, w, h, t, R, fx, fx + fw, fy, fy + fh, 6, '#c8d0d0');
  };
  // 15.2 dưới bậc thềm: cái kén xích đen sì đứng sừng sững, mắt đỏ trên đỉnh quay xuống nhìn xích; đoạn xích căng ngang về phía khung cửa
  ART.cocoon15 = function (g, w, h, t, R) {
    var dk = C.dark; sky(g, w, h, 'night', 0.7); moon(g, w * 0.86, h * 0.1, h * 0.022, t);
    yardFloor(g, w, h, h * 0.55);
    var cx = w * 0.56, top = h * 0.2, base = h * 0.86, lk = Math.max(6, h * 0.022), strain = 0.5 + 0.5 * Math.sin(t * 0.9), jit = Math.sin(t * 31) * strain * 1.2, col = dk ? '#b8c4c8' : '#2e3638';
    g.fillStyle = rgba('#000000', 0.5); g.beginPath(); g.ellipse(cx, base, w * 0.09, h * 0.02, 0, 0, 7); g.fill();
    helixCocoon(g, cx + jit, top, base, w * 0.07, lk, 1, t, strain);
    face15(g, cx + jit, top + h * 0.02, h * 0.07, t, R, { n: 18, down: 1, look: 0 });
    // đoạn xích căng về khung cửa bên trái, rung theo sức kéo
    var pts = []; for (var m = 0; m <= 30; m++) { var u = m / 30; pts.push([cx - w * 0.05 - u * w * 0.5, h * 0.5 + u * h * 0.06 + Math.sin(u * 30 + t * 40) * strain * 1.4]); }
    link15(g, pts, lk, col, 1);
    g.fillStyle = dk ? '#1a1410' : '#4a3a2a'; g.fillRect(0, 0, w * 0.035, h); g.fillRect(0, h * 0.02, w * 0.05, h * 0.03);
    if (strain > 0.8) for (var s = 0; s < 6; s++) { var sx = cx - w * 0.05 + (R[s] - 0.5) * w * 0.05, sy = h * (0.3 + R[s + 6] * 0.4); g.fillStyle = rgba('#e9f6f8', (strain - 0.8) * 4 * R[s + 12]); g.fillRect(sx, sy, 2, 2); }
  };
  // 15.3 bậc thềm sau đó: một chiếc giày rơi lăn xuống, vòng xích lỏng rơi vãi, dưới trăng
  ART.shoe15 = function (g, w, h, t, R) {
    var dk = C.dark; g.fillStyle = dk ? '#060707' : '#2e3030'; g.fillRect(0, 0, w, h);
    glow(g, w * 0.7, h * 0.1, w * 0.6, '#c8d4e0', dk ? 0.08 : 0.14);
    for (var s = 0; s < 3; s++) { var y = h * (0.42 + s * 0.15); g.fillStyle = dk ? ['#1c1a18', '#221e1b', '#28231f'][s] : ['#5a504a', '#655a52', '#70645a'][s]; g.fillRect(0, y, w, h * 0.15); g.fillStyle = rgba('#000000', 0.35); g.fillRect(0, y, w, 2); }
    // chiếc giày nằm nghiêng ở bậc dưới
    var sx = w * 0.42, sy = h * 0.82; g.save(); g.translate(sx, sy); g.scale(1.6, 1.6); g.translate(-sx, -sy); g.fillStyle = dk ? '#1a1612' : '#2a2420'; g.beginPath(); g.moveTo(sx - w * 0.06, sy); g.quadraticCurveTo(sx - w * 0.065, sy - h * 0.05, sx - w * 0.02, sy - h * 0.05); g.lineTo(sx + w * 0.05, sy - h * 0.02); g.quadraticCurveTo(sx + w * 0.07, sy, sx + w * 0.05, sy + h * 0.01); g.closePath(); g.fill();
    g.strokeStyle = rgba('#d8dcd8', dk ? 0.55 : 0.6); g.lineWidth = 1; g.stroke(); g.fillStyle = rgba('#e8ece8', dk ? 0.5 : 0.7); g.fillRect(sx - w * 0.055, sy - h * 0.002, w * 0.1, 1.5); g.restore();
    // vòng xích lỏng rơi vãi, trượt dần đi như đang thu về
    var pull = (t * 0.03) % 1, lk = Math.max(6, h * 0.025), pts = [];
    for (var m = 0; m < 26; m++) { var u = m / 25; pts.push([w * (0.95 - u * 0.75) + pull * w * 0.05 * u, h * (0.62 + Math.sin(u * 9) * 0.04 + u * 0.1)]); }
    link15(g, pts, lk, dk ? '#8e9ba0' : '#2e3638', 0.85);
    // một vạt vải xanh nhạt mắc ở mép bậc
    g.fillStyle = rgba(dk ? '#7a90a0' : '#9ab0c0', 0.5); g.beginPath(); g.moveTo(w * 0.72, h * 0.57); g.lineTo(w * 0.78, h * 0.565); g.lineTo(w * 0.76, h * 0.6 + Math.sin(t * 1.4) * 2); g.fill();
    motes(g, w, h, t, R, 0, w, 0, h * 0.6, 6, '#c8d0d0');
  };
  // 15.4 con ngõ hẹp giữa hai bức tường đất phủ rêu; đầu ngõ hắt ra một khoảng sân sáng trăng và tháp chuông nghiêng
  ART.alley15 = function (g, w, h, t, R) {
    var dk = C.dark; sky(g, w, h, 'night', 0.6); moon(g, w * 0.5, h * 0.12, h * 0.02, t);
    var vx = w * 0.5, vy = h * 0.5;
    g.fillStyle = dk ? '#16120e' : '#5a4a3a'; g.beginPath(); g.moveTo(0, h * 0.15); g.lineTo(vx - w * 0.06, vy - h * 0.12); g.lineTo(vx - w * 0.06, vy + h * 0.06); g.lineTo(0, h); g.fill();
    g.beginPath(); g.moveTo(w, h * 0.15); g.lineTo(vx + w * 0.06, vy - h * 0.12); g.lineTo(vx + w * 0.06, vy + h * 0.06); g.lineTo(w, h); g.fill();
    g.fillStyle = dk ? '#2a3a26' : '#6f8a58'; for (var m = 0; m < 30; m++) { var side = m % 2 ? 1 : -1, u = R[m], x = vx + side * (w * 0.06 + (1 - u) * w * 0.44), y = h * (0.18 + R[m + 30] * 0.6) * (0.5 + u * 0.5) + vy * (1 - (0.5 + u * 0.5)); g.globalAlpha = 0.5; g.beginPath(); g.ellipse(x, y, w * 0.02 * (1 - u * 0.7), h * 0.01, 0, 0, 7); g.fill(); } g.globalAlpha = 1;
    // đầu ngõ: khoảng sân sáng, tháp chuông nghiêng nhỏ xíu
    g.fillStyle = dk ? '#2a2420' : '#8a7a6a'; g.fillRect(vx - w * 0.06, vy - h * 0.12, w * 0.12, h * 0.18);
    glow(g, vx, vy, w * 0.1, '#c8d4e0', dk ? 0.12 : 0.18);
    tower14(g, vx - w * 0.03, vy + h * 0.02, h * 0.05, t, { rope: 'hang' });
    // nền ngõ đất, dấu dép tổ ong và dấu giày chạy
    g.fillStyle = dk ? '#100d0b' : '#4a3e34'; g.beginPath(); g.moveTo(vx - w * 0.06, vy + h * 0.06); g.lineTo(vx + w * 0.06, vy + h * 0.06); g.lineTo(w * 0.8, h); g.lineTo(w * 0.2, h); g.fill();
    for (var f = 0; f < 10; f++) { var u2 = f / 10, x2 = vx + (f % 2 ? 1 : -1) * w * 0.04 * (1 - u2 * 0.8), y2 = h - u2 * (h - vy - h * 0.06); g.fillStyle = rgba('#000000', (dk ? 0.5 : 0.3) * (1 - u2 * 0.6)); g.beginPath(); g.ellipse(x2, y2, w * 0.012 * (1 - u2 * 0.7), h * 0.008 * (1 - u2 * 0.6), 0, 0, 7); g.fill(); }
  };
  // 15.5 cái giếng: nước dâng cuộn xoáy trong lòng giếng, một cột nước trong suốt vươn lên xoè ngón; trên thành giếng hai dấu dép ướt
  ART.well15 = function (g, w, h, t, R) {
    var dk = C.dark; sky(g, w, h, 'night', 0.6); moon(g, w * 0.18, h * 0.12, h * 0.022, t);
    yardFloor(g, w, h, h * 0.5);
    var wx = w * 0.5, wy = h * 0.72, ws = w * 0.12;
    well15(g, wx, wy, ws, dk);
    // mặt nước cuộn xoáy
    for (var r = 0; r < 4; r++) { g.strokeStyle = rgba(WATER15, (dk ? 0.35 : 0.5) * (1 - r * 0.2)); g.lineWidth = 1.2; g.beginPath(); g.ellipse(wx, wy, ws * (0.2 + r * 0.17), ws * 0.08 * (1 + r * 0.6), t * (r % 2 ? 0.8 : -0.8), 0, 5); g.stroke(); }
    // cột nước vươn lên, đỉnh xoè thành ngón, phập phồng như thở
    var br = 0.5 + 0.5 * Math.sin(t * 1.1), top = h * (0.2 - br * 0.03);
    g.save(); g.globalAlpha = dk ? 0.5 : 0.6;
    var cg = g.createLinearGradient(0, top, 0, wy); cg.addColorStop(0, rgba(WATER15, 0.65)); cg.addColorStop(1, rgba(WATER15, 0.15)); g.fillStyle = cg;
    g.beginPath(); g.moveTo(wx - ws * 0.35, wy); g.quadraticCurveTo(wx - ws * 0.25 + Math.sin(t * 2) * 4, (top + wy) / 2, wx - ws * 0.7, top + h * 0.1);
    for (var f = 0; f < 5; f++) { var fx = wx - ws * 0.7 + f * ws * 0.35, ft = top + Math.abs(f - 2) * h * 0.02 + Math.sin(t * 2.4 + f) * 3; g.quadraticCurveTo(fx - ws * 0.08, ft - h * 0.06, fx + ws * 0.1, ft + h * 0.02); }
    g.quadraticCurveTo(wx + ws * 0.25 - Math.sin(t * 2) * 4, (top + wy) / 2, wx + ws * 0.35, wy); g.fill(); g.restore();
    g.strokeStyle = rgba('#e8fbff', 0.45); g.lineWidth = 1; for (var s = 0; s < 6; s++) { var sy = top + h * 0.08 + ((t * 0.12 + R[s]) % 1) * (wy - top - h * 0.08); g.beginPath(); g.moveTo(wx - ws * 0.2 + R[s + 6] * ws * 0.4, sy); g.lineTo(wx - ws * 0.2 + R[s + 6] * ws * 0.4, sy + 6); g.stroke(); }
    // chuông nhỏ chìm trong nước ở đỉnh, mờ đi
    for (var b = 0; b < 7; b++) { g.fillStyle = rgba('#a89a6a', 0.3); g.beginPath(); g.arc(wx - ws * 0.4 + b * ws * 0.13, top + h * 0.05 + Math.sin(t + b) * 2, Math.max(1.3, h * 0.006), 0, 7); g.fill(); }
    // hai dấu dép ướt ở thành giếng
    for (var d = 0; d < 2; d++) { var px = wx + ws * (1.25 + d * 0.22), py = wy + ws * 0.45 + d * 4; g.fillStyle = rgba(WATER15, 0.25); g.beginPath(); g.ellipse(px, py, w * 0.016, h * 0.009, 0.2, 0, 7); g.fill(); g.fillStyle = rgba(dk ? '#1a2a2c' : '#4a6a6c', 0.7); for (var hh = 0; hh < 5; hh++) g.fillRect(px - w * 0.01 + hh * w * 0.004, py - 1, 1.5, 1.5); }
    for (var k = 0; k < 12; k++) { var u = ((t * 0.3 + R[k + 20]) % 1); g.fillStyle = rgba('#e8fbff', 0.6 * (1 - u)); g.fillRect(wx + (R[k + 40] - 0.5) * ws * 2.4, wy - u * h * 0.3, 1.6, 1.6); }
  };
  // 15.6 cái chợ tối om: phên nứa hạ kín, ghế con lăn lóc, chiếc mũ nồi đung đưa trên đinh, cây gạo già cuối chợ
  ART.market15 = function (g, w, h, t, R) {
    var dk = C.dark; sky(g, w, h, 'night', 0.5); moon(g, w * 0.3, h * 0.1, h * 0.02, t);
    var col = dk ? '#07090a' : '#2e3432';
    g.fillStyle = col; g.fillRect(w * 0.8, h * 0.05, w * 0.06, h * 0.5); g.beginPath(); g.ellipse(w * 0.75, h * 0.08, w * 0.3, h * 0.12, 0, 0, 7); g.fill(); // cây gạo
    g.fillStyle = dk ? '#1a1612' : '#5a5046'; g.fillRect(0, h * 0.5, w, h * 0.5);
    for (var i = 0; i < 4; i++) { var s = 1 - i * 0.18, x = w * 0.04 + i * w * 0.1, wd = w * 0.17 * s, base = h * (0.95 - i * 0.1);
      [x, w - x - wd].forEach(function (sx) { g.fillStyle = col; g.fillRect(sx, base - h * 0.34 * s, w * 0.006, h * 0.34 * s); g.fillRect(sx + wd, base - h * 0.34 * s, w * 0.006, h * 0.34 * s); g.beginPath(); g.moveTo(sx - wd * 0.08, base - h * 0.32 * s); g.lineTo(sx + wd * 0.5, base - h * 0.44 * s); g.lineTo(sx + wd * 1.08, base - h * 0.32 * s); g.fill();
        g.fillStyle = dk ? '#1e1a14' : '#6a5a40'; g.fillRect(sx + w * 0.006, base - h * 0.3 * s, wd - w * 0.006, h * 0.28 * s); g.strokeStyle = rgba('#000000', 0.35); g.lineWidth = 1; for (var q = 1; q < 8; q++) { g.beginPath(); g.moveTo(sx + q * wd / 8, base - h * 0.3 * s); g.lineTo(sx + q * wd / 8, base - h * 0.02 * s); g.stroke(); } }); }
    // ghế con lăn lóc giữa đường
    [[0.44, 0.86, 0.6], [0.58, 0.76, -0.4], [0.5, 0.68, 1.2]].forEach(function (c) { g.save(); g.translate(w * c[0], h * c[1]); g.rotate(c[2]); g.fillStyle = dk ? '#2a2016' : '#5a4430'; g.fillRect(-w * 0.02, -h * 0.01, w * 0.04, h * 0.012); g.fillRect(-w * 0.018, 0, w * 0.004, h * 0.025); g.fillRect(w * 0.014, 0, w * 0.004, h * 0.025); g.restore(); });
    // mũ nồi trên đinh ở sạp đầu chợ
    var hx = w * 0.135, hy = h * 0.6, sw = Math.sin(t * 1.1) * 0.25; g.strokeStyle = dk ? '#3a3a36' : '#2a2a26'; g.lineWidth = 1; g.beginPath(); g.moveTo(hx, hy - h * 0.02); g.lineTo(hx + Math.sin(sw) * 6, hy); g.stroke();
    g.save(); g.translate(hx + Math.sin(sw) * 6, hy); g.rotate(sw); g.fillStyle = dk ? '#2a2e30' : '#3a3e40'; g.beginPath(); g.ellipse(0, h * 0.012, w * 0.025, h * 0.012, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(0, h * 0.006, w * 0.016, h * 0.012, 0, Math.PI, 0); g.fill(); g.restore();
    dust(g, w, h, t, R, h * 0.6, 8);
  };
  // 15.7 qua khe phên nứa: con đường chợ bạc trăng, xa xa qua mái nhà là một gợn kính của bức tường; bên kia tường thỉnh thoảng loé một vết nứt khô
  ART.wall15 = function (g, w, h, t, R) {
    var dk = C.dark; g.fillStyle = dk ? '#030404' : '#1e2020'; g.fillRect(0, 0, w, h);
    var gx = w * 0.3, gw = w * 0.4;
    g.save(); g.beginPath(); g.rect(gx, 0, gw, h); g.clip();
    sky(g, w, h * 0.6, 'night', 0.7); for (var s = 0; s < 20; s++) { g.fillStyle = rgba('#ffffff', 0.3 + 0.3 * Math.sin(t + s)); g.fillRect(gx + R[s] * gw, R[s + 20] * h * 0.35, 1.2, 1.2); }
    g.fillStyle = dk ? '#06080a' : '#2e3432'; for (var m = 0; m < 6; m++) { var x = gx + m * gw * 0.2; g.beginPath(); g.moveTo(x - gw * 0.12, h * 0.58); g.lineTo(x, h * 0.5); g.lineTo(x + gw * 0.12, h * 0.58); g.fill(); } g.fillRect(gx, h * 0.58, gw, h * 0.05);
    var wl = 0.5 + 0.5 * Math.sin(t * 0.7); g.fillStyle = rgba('#9fd4ea', (dk ? 0.05 : 0.1) + 0.04 * wl); g.fillRect(gx, h * 0.12, gw, h * 0.4); g.strokeStyle = rgba('#9fd4ea', 0.12 + 0.12 * wl); g.lineWidth = 1; g.beginPath(); g.moveTo(gx, h * 0.12 + wl * 6); g.lineTo(gx + gw, h * 0.14 + wl * 6); g.stroke();
    // vết nứt khô bên kia tường: loé rồi tắt theo chu kỳ, mỗi lần một chỗ xa hơn
    var cyc = t % 9, k = cyc < 0.6 ? Math.sin(cyc / 0.6 * Math.PI) : 0, cx = gx + gw * (0.25 + (Math.floor(t / 9) % 3) * 0.22), cy = h * 0.45;
    if (k > 0) { g.strokeStyle = rgba('#d8d0c0', 0.7 * k); g.lineWidth = 1.2; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + 6, cy - 5); g.lineTo(cx + 3, cy - 11); g.lineTo(cx + 9, cy - 16); g.moveTo(cx + 6, cy - 5); g.lineTo(cx + 13, cy - 3); g.stroke(); glow(g, cx + 6, cy - 7, 22, '#d8d0c0', 0.12 * k); }
    g.fillStyle = dk ? '#1a1814' : '#6a6050'; g.fillRect(gx, h * 0.63, gw, h * 0.37); var rg = g.createRadialGradient(w * 0.5, h * 0.8, 0, w * 0.5, h * 0.8, gw * 0.6); rg.addColorStop(0, rgba('#c8d4e0', dk ? 0.1 : 0.16)); rg.addColorStop(1, rgba('#c8d4e0', 0)); g.fillStyle = rg; g.fillRect(gx, h * 0.63, gw, h * 0.37);
    g.restore();
    // hai tấm phên nứa hai bên
    [[0, gx], [gx + gw, w - gx - gw]].forEach(function (p) { g.fillStyle = dk ? '#16120e' : '#5a4a36'; g.fillRect(p[0], 0, p[1], h); g.strokeStyle = rgba('#000000', 0.4); g.lineWidth = 1; for (var q = 0; q < 14; q++) { var x = p[0] + q * p[1] / 14; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (var y = 0; y < h; y += h / 9) { g.beginPath(); g.moveTo(p[0], y); g.lineTo(p[0] + p[1], y + 3); g.stroke(); } });
  };
  // 15.8 nhìn qua chỗ mái lá thủng: trời đêm, vài ngôi sao, cành gạo còn rung như vừa có ai rời đi, một chiếc lá khô xoay xoay rơi trong vệt trăng
  ART.gao15 = function (g, w, h, t, R) {
    var dk = C.dark; g.fillStyle = dk ? '#040404' : '#1e1e1c'; g.fillRect(0, 0, w, h);
    var hx = w * 0.5, hy = h * 0.32, hr = Math.min(w, h) * 0.3;
    g.save(); g.beginPath(); g.moveTo(hx - hr, hy); for (var a = 0; a <= 16; a++) { var an = Math.PI + a / 16 * Math.PI * 2, rr = hr * (0.8 + 0.25 * R[a]); g.lineTo(hx + Math.cos(an) * rr, hy + Math.sin(an) * rr * 0.7); } g.closePath(); g.clip();
    sky(g, w, h * 0.7, 'night', 1); for (var s = 0; s < 18; s++) { g.fillStyle = rgba('#ffffff', 0.35 + 0.35 * Math.sin(t * 1.3 + s)); g.fillRect(hx + (R[s] - 0.5) * hr * 2, hy + (R[s + 18] - 0.7) * hr, 1.3, 1.3); }
    // cành gạo vắt ngang, khẽ nảy rồi lặng (như vừa nhẹ đi)
    var cyc = t % 14, bob = cyc < 3 ? Math.sin(cyc * 6) * Math.exp(-cyc * 1.2) * h * 0.012 : 0;
    g.strokeStyle = dk ? '#060504' : '#2a2018'; g.lineCap = 'round'; g.lineWidth = Math.max(7, h * 0.04); g.beginPath(); g.moveTo(hx - hr * 1.3, hy - hr * 0.1); g.quadraticCurveTo(hx, hy - hr * 0.25 + bob, hx + hr * 1.2, hy - hr * 0.55 + bob * 1.4); g.stroke();
    g.lineWidth = Math.max(2, h * 0.01); g.beginPath(); g.moveTo(hx + hr * 0.2, hy - hr * 0.26 + bob); g.quadraticCurveTo(hx + hr * 0.4, hy - hr * 0.6, hx + hr * 0.3, hy - hr * 0.8); g.stroke();
    g.fillStyle = dk ? '#0c0a08' : '#2a2018'; for (var l = 0; l < 9; l++) { g.beginPath(); g.ellipse(hx - hr + l * hr * 0.28, hy - hr * 0.2 - l * hr * 0.03 + bob + Math.sin(t * 2 + l) * 1.5, hr * 0.06, hr * 0.025, l, 0, 7); g.fill(); }
    g.restore();
    // mép mái lá thủng
    g.fillStyle = dk ? '#0e0b08' : '#2a2218'; for (var e = 0; e < 48; e++) { var an2 = e / 48 * 6.283, rr2 = hr * (0.8 + 0.25 * R[(e * 3) % 17]) - 2, L = 6 + R[e] * 14; g.beginPath(); g.moveTo(hx + Math.cos(an2 - 0.08) * (rr2 + L), hy + Math.sin(an2 - 0.08) * (rr2 + L) * 0.7); g.lineTo(hx + Math.cos(an2) * (rr2 - L * 0.6), hy + Math.sin(an2) * (rr2 - L * 0.6) * 0.7); g.lineTo(hx + Math.cos(an2 + 0.08) * (rr2 + L), hy + Math.sin(an2 + 0.08) * (rr2 + L) * 0.7); g.fill(); }
    // vệt trăng rọi xuống nền sạp
    var bg = g.createLinearGradient(0, hy, 0, h); bg.addColorStop(0, rgba('#d8e4f0', dk ? 0.1 : 0.16)); bg.addColorStop(1, rgba('#d8e4f0', 0.02)); g.fillStyle = bg; g.beginPath(); g.moveTo(hx - hr * 0.6, hy + hr * 0.3); g.lineTo(hx + hr * 0.6, hy + hr * 0.3); g.lineTo(hx + hr * 1.1, h); g.lineTo(hx - hr * 1.1, h); g.fill();
    // chiếc lá khô xoay xoay rơi
    var lu = ((t * 0.09) % 1), lx = hx + Math.sin(lu * 12) * hr * 0.3, ly = hy - hr * 0.1 + lu * (h - hy + hr * 0.05), la = lu > 0.92 ? (1 - lu) / 0.08 : 1;
    g.save(); g.translate(lx, ly); g.rotate(lu * 14); g.scale(1, Math.abs(Math.cos(lu * 10)) * 0.8 + 0.2); g.fillStyle = rgba(dk ? '#8a5a3a' : '#7a4a2a', 0.9 * la); g.beginPath(); g.ellipse(0, 0, Math.max(5, h * 0.022), Math.max(2.5, h * 0.01), 0, 0, 7); g.fill(); g.restore();
    // giữa nền sạp: ba chỗ ngồi trũng xuống (dấu ba người), lá rơi vào giữa
    for (var p = 0; p < 3; p++) { var px = hx + (p - 1) * w * 0.22, py = h * 0.92 - (p === 1 ? h * 0.04 : 0); g.fillStyle = rgba('#000000', dk ? 0.45 : 0.3); g.beginPath(); g.ellipse(px, py, w * 0.06, h * 0.02, 0, 0, 7); g.fill(); }
    motes(g, w, h, t, R, hx - hr, hx + hr, hy, h, 8, '#d8e4f0');
  };

  /* ---------- tranh cho Góc nhìn khác (chèn sau art4.js). Không vẽ người, chỉ dấu vết. ---------- */
  function gGlow(g, x, y, r, col, a) { var gl = g.createRadialGradient(x, y, 0, x, y, r); gl.addColorStop(0, rgba(col, a)); gl.addColorStop(1, rgba(col, 0)); g.fillStyle = gl; g.fillRect(x - r, y - r, r * 2, r * 2); }

  // Ban công tầng hai nhà câu lạc bộ nhìn xuống sân: cột hành lang, lan can, hàng cây, nắng xuân.
  // Một sợi chỉ đỏ rất mảnh căng từ lan can xuống khoảng sân, khẽ rung (Góc nhìn khác ch01, Luke).
  ART.balcony = function (g, w, h, t, R) {
    var dk = C.dark;
    var gr = g.createLinearGradient(0, 0, 0, h);
    if (dk) { gr.addColorStop(0, '#2f3a36'); gr.addColorStop(1, '#3d3b31'); } else { gr.addColorStop(0, '#dfe6da'); gr.addColorStop(1, '#efe3c6'); }
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    // sân gạch nhìn từ trên xuống
    g.strokeStyle = rgba(dk ? '#000000' : '#8a7a5c', 0.18); g.lineWidth = 1;
    for (var y = h * 0.5; y < h; y += h * 0.06) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    // hàng cây: tán tròn, bóng đổ, lay nhẹ
    for (var i = 0; i < 5; i++) {
      var tx = w * (0.14 + i * 0.2), ty = h * (0.34 + (i % 2) * 0.04), tr = h * (0.13 + R[i] * 0.04), sw = Math.sin(t * 0.7 + i) * w * 0.004;
      g.fillStyle = rgba('#000000', dk ? 0.3 : 0.12); g.beginPath(); g.ellipse(tx + tr * 0.5, ty + tr * 1.1, tr * 1.1, tr * 0.35, 0, 0, 7); g.fill();
      g.fillStyle = dk ? '#26352b' : '#8fa47f';
      for (var k = 0; k < 5; k++) { g.beginPath(); g.arc(tx + sw + Math.cos(k * 1.3) * tr * 0.5, ty + Math.sin(k * 1.3) * tr * 0.35, tr * (0.55 + R[i * 5 + k + 10] * 0.2), 0, 7); g.fill(); }
      g.fillStyle = dk ? '#3a2e22' : '#6e5a42'; g.fillRect(tx - 2, ty + tr * 0.4, 4, tr * 0.7);
    }
    // nắng lọt qua lá
    for (var d = 0; d < 9; d++) {
      var dx = R[d + 40] * w, dy = h * (0.5 + R[d + 50] * 0.45), a = 0.5 + 0.5 * Math.sin(t * 0.9 + d * 1.7);
      g.fillStyle = rgba('#fff2cc', (dk ? 0.07 : 0.22) * a); g.beginPath(); g.ellipse(dx, dy, w * 0.03, h * 0.012, 0, 0, 7); g.fill();
    }
    // sợi chỉ đỏ: từ lan can (trái, gần) xuống một điểm giữa sân (gốc cây thứ ba), võng và rung khẽ
    var ax = w * 0.2, ay = h * 0.86, bx = w * 0.56, by = h * 0.62, amp = h * 0.006 * (0.6 + 0.4 * Math.sin(t * 0.5));
    g.strokeStyle = dk ? '#E2566C' : '#B3263A'; g.lineWidth = Math.max(1, w / 700); g.shadowColor = rgba('#E2566C', 0.7); g.shadowBlur = 6;
    g.beginPath();
    for (var s = 0; s <= 40; s++) { var u = s / 40, x = ax + (bx - ax) * u, yy = ay + (by - ay) * u + Math.sin(u * Math.PI) * h * 0.05 + Math.sin(u * Math.PI) * Math.sin(t * 9) * amp; s ? g.lineTo(x, yy) : g.moveTo(x, yy); }
    g.stroke(); g.shadowBlur = 0;
    gGlow(g, bx, by, w * 0.02, '#E2566C', dk ? 0.35 : 0.25);
    // lan can tầng hai (gần, tối) + cột hành lang bên trái
    var rail = dk ? '#151816' : '#5c5446';
    g.fillStyle = rail; g.fillRect(0, h * 0.84, w, h * 0.025); g.fillRect(0, h * 0.97, w, h * 0.03);
    for (var b = 0; b < 16; b++) g.fillRect(w * (0.02 + b * 0.065), h * 0.84, w * 0.008, h * 0.16);
    g.fillStyle = dk ? '#1b1f1c' : '#a89c84'; g.fillRect(0, 0, w * 0.09, h);
    g.fillStyle = rgba('#000000', dk ? 0.35 : 0.15); g.fillRect(w * 0.09, 0, w * 0.012, h);
  };

  // Cuối hành lang sau nhà thể chất: máy bán nước sáng đèn, lon nước nằm trong khay. Đèn máy chập chờn lệch nhịp.
  ART.vending = function (g, w, h, t, R) {
    var dk = C.dark;
    var gr = g.createLinearGradient(0, 0, 0, h);
    if (dk) { gr.addColorStop(0, '#1d2120'); gr.addColorStop(1, '#2a2925'); } else { gr.addColorStop(0, '#d9d6cc'); gr.addColorStop(1, '#c8bfa8'); }
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    // hành lang: sàn, đường kẻ dẫn vào sâu, ô cửa sáng cuối hành lang bên trái
    var vx = w * 0.3, vy = h * 0.46;
    g.strokeStyle = rgba(dk ? '#000000' : '#6d6352', 0.25); g.lineWidth = 1;
    [[0, h], [w * 0.6, h], [0, h * 0.75]].forEach(function (p) { g.beginPath(); g.moveTo(vx, vy); g.lineTo(p[0], p[1]); g.stroke(); });
    g.fillStyle = rgba('#fff2cc', dk ? 0.18 : 0.5); g.fillRect(vx - w * 0.03, vy - h * 0.12, w * 0.06, h * 0.16);
    // máy bán nước
    var mx = w * 0.56, my = h * 0.12, mw = w * 0.3, mh = h * 0.8;
    // nhịp đèn: phần lớn đều, thỉnh thoảng một nhịp đến muộn
    var cyc = t % 4.2, fl = cyc > 3.6 && cyc < 3.75 ? 0.55 : 1;
    gGlow(g, mx + mw * 0.5, my + mh * 0.5, w * 0.45, dk ? '#bfe3ea' : '#ffffff', (dk ? 0.16 : 0.3) * fl);
    g.fillStyle = dk ? '#3b4548' : '#8b9597'; g.fillRect(mx, my, mw, mh);
    g.fillStyle = rgba(dk ? '#cfeef2' : '#f4fbfb', (dk ? 0.55 : 0.85) * fl); g.fillRect(mx + mw * 0.08, my + mh * 0.06, mw * 0.84, mh * 0.5);
    // hàng lon
    var cols = ['#9b2f3a', '#3c6f86', '#c9c4b6', '#4f6b4a'];
    for (var r = 0; r < 4; r++) for (var c = 0; c < 5; c++) {
      g.fillStyle = cols[(r + c) % 4]; var cx = mx + mw * (0.14 + c * 0.155), cy = my + mh * (0.1 + r * 0.11);
      g.fillRect(cx, cy, mw * 0.09, mh * 0.075);
    }
    // nút bấm + khay lấy nước, lon nằm trong khay
    g.fillStyle = dk ? '#20272a' : '#5e676a'; g.fillRect(mx + mw * 0.1, my + mh * 0.62, mw * 0.8, mh * 0.04);
    for (var bt = 0; bt < 5; bt++) { g.fillStyle = rgba('#E2566C', 0.5 + 0.5 * (bt === 2 ? fl : 1)); g.beginPath(); g.arc(mx + mw * (0.18 + bt * 0.16), my + mh * 0.64, Math.max(1.5, mw * 0.018), 0, 7); g.fill(); }
    g.fillStyle = dk ? '#101314' : '#3f4648'; g.fillRect(mx + mw * 0.15, my + mh * 0.8, mw * 0.7, mh * 0.1);
    g.fillStyle = '#9b2f3a'; g.save(); g.translate(mx + mw * 0.46, my + mh * 0.86); g.rotate(Math.PI / 2 - 0.12); g.fillRect(-mh * 0.035, -mw * 0.05, mh * 0.07, mw * 0.1); g.restore();
    // ánh đèn hắt xuống sàn
    g.fillStyle = rgba(dk ? '#bfe3ea' : '#ffffff', (dk ? 0.08 : 0.18) * fl); g.beginPath(); g.moveTo(mx, my + mh); g.lineTo(mx + mw, my + mh); g.lineTo(mx + mw * 1.3, h); g.lineTo(mx - mw * 0.4, h); g.fill();
  };

  /* ---- Góc nhìn khác ch05, bà Mabel "Mấy bước nữa" ---- */
  // Giếng đá ở ngã ba lúc trời vừa tối: gốc đa trống trơn, con đường đất đi xa, sau rặng tre thấp có một đốm lửa vàng lọt qua kẽ lá.
  ART.wellfire = function (g, w, h, t, R) {
    var dk = C.dark, hz = h * 0.5;
    sky(g, w, h, 'dusk', 0.62);
    clouds(g, w, h, t, dk ? 0.18 : 0.3, R);
    hills(g, w, h, hz, h * 0.05, sil('dusk'), 2);
    // rặng tre thấp bên phải, đốm lửa lọt qua kẽ lá (nhấp nháy theo lá lay)
    var fx = w * 0.8, fy = hz - h * 0.03, f = 0.7 + 0.3 * Math.sin(t * 3.1) * Math.sin(t * 1.7 + 1);
    gGlow(g, fx, fy, w * 0.06, '#f0b25c', (dk ? 0.5 : 0.45) * f);
    g.fillStyle = rgba('#f3c27a', 0.9 * f); g.beginPath(); g.arc(fx, fy, Math.max(1.5, w * 0.004), 0, 7); g.fill();
    for (var b = 0; b < 4; b++) bamboo(g, w * (0.7 + b * 0.07), hz + h * 0.02, h * (0.16 + R[b] * 0.05), dk ? '#0b1214' : '#55625c', t, b);
    // ruộng nền tối
    g.fillStyle = dk ? '#141d1c' : '#8f9a86'; g.fillRect(0, hz, w, h - hz);
    // con đường đất từ chân giếng chạy về phía rặng tre
    g.fillStyle = dk ? '#2a2620' : '#b9a986';
    g.beginPath(); g.moveTo(w * 0.28, h); g.quadraticCurveTo(w * 0.5, h * 0.7, w * 0.78, hz + h * 0.01); g.lineTo(w * 0.8, hz + h * 0.01); g.quadraticCurveTo(w * 0.62, h * 0.74, w * 0.62, h); g.fill();
    // gốc đa bên trái: thân to, rễ phụ buông, dưới gốc trống không
    var tx = w * 0.12, ty = hz + h * 0.06, tc = dk ? '#0a0f10' : '#4e5a54';
    g.fillStyle = tc; g.beginPath(); g.ellipse(tx, ty - h * 0.3, w * 0.2, h * 0.17, 0, 0, 7); g.fill();
    g.fillRect(tx - w * 0.025, ty - h * 0.2, w * 0.05, h * 0.22);
    g.strokeStyle = tc; g.lineWidth = 1;
    for (var r = 0; r < 12; r++) { var rx = tx - w * 0.15 + R[r + 20] * w * 0.3, sw = Math.sin(t * 0.8 + r) * 2; g.beginPath(); g.moveTo(rx, ty - h * 0.2); g.quadraticCurveTo(rx + sw, ty - h * 0.08, rx + sw * 1.5, ty - h * (0.02 + R[r + 40] * 0.06)); g.stroke(); }
    // giếng đá gần, bên phải giữa: thành giếng tròn, miệng tối, gàu nằm trên thành
    var wx = w * 0.42, wy = h * 0.8, wr = w * 0.14;
    g.fillStyle = dk ? '#2b3030' : '#8b8d84'; g.fillRect(wx - wr, wy - h * 0.08, wr * 2, h * 0.08);
    g.beginPath(); g.ellipse(wx, wy, wr, wr * 0.26, 0, 0, Math.PI); g.fill();
    g.fillStyle = dk ? '#3b4140' : '#a5a79c'; g.beginPath(); g.ellipse(wx, wy - h * 0.08, wr, wr * 0.26, 0, 0, 7); g.fill();
    g.fillStyle = dk ? '#050809' : '#2b3331'; g.beginPath(); g.ellipse(wx, wy - h * 0.08, wr * 0.82, wr * 0.19, 0, 0, 7); g.fill();
    g.strokeStyle = rgba(dk ? '#000000' : '#5d6058', 0.4);
    for (var s = 0; s < 6; s++) { g.beginPath(); g.moveTo(wx - wr + s * wr * 0.4, wy - h * 0.08); g.lineTo(wx - wr + s * wr * 0.4, wy); g.stroke(); }
    g.fillStyle = dk ? '#3a2e22' : '#6e5a42'; g.fillRect(wx + wr * 0.55, wy - h * 0.115, wr * 0.3, h * 0.035);
  };

  // Ruộng đêm: nón lá trắng lềnh bềnh khắp mặt nước tối, trôi chậm; vệ cỏ gần có chiếc mũ bảo hiểm xanh lá lăn nghiêng, quai đứt.
  ART.hatfloat = function (g, w, h, t, R) {
    var dk = C.dark, hz = h * 0.34;
    sky(g, w, h, 'night', 0.4);
    moon(g, w * 0.78, h * 0.12, Math.max(4, w * 0.014), t);
    g.fillStyle = rgba(dk ? '#0a1216' : '#9aa7ad', 0.9); g.fillRect(0, h * 0.05, w * 0.7, h * 0.08);
    hills(g, w, h, hz, h * 0.04, sil('night'), 4);
    for (var b = 0; b < 3; b++) bamboo(g, w * (0.08 + b * 0.09), hz + h * 0.01, h * (0.12 + R[b] * 0.04), sil('night'), t, b + 3);
    // mặt ruộng: nước tối, bờ ruộng kẻ ngang, ánh trăng vỡ
    var wg = g.createLinearGradient(0, hz, 0, h); wg.addColorStop(0, dk ? '#101b1e' : '#7f8e8f'); wg.addColorStop(1, dk ? '#0a1113' : '#6c7a79');
    g.fillStyle = wg; g.fillRect(0, hz, w, h - hz);
    g.strokeStyle = dk ? '#1d2826' : '#5c6a61'; g.lineWidth = 2;
    [0.46, 0.6, 0.78].forEach(function (y) { g.beginPath(); g.moveTo(0, h * y); g.lineTo(w, h * (y - 0.02)); g.stroke(); });
    for (var m = 0; m < 10; m++) { var my = hz + h * 0.04 + m * h * 0.035, mw = w * (0.05 - m * 0.003); g.fillStyle = rgba('#d9ddd2', (dk ? 0.18 : 0.35) * (0.6 + 0.4 * Math.sin(t * 1.4 + m))); g.fillRect(w * 0.78 - mw / 2 + Math.sin(t + m) * 3, my, mw, 1.2); }
    // nón lá: hình nón nhìn nghiêng, trắng nhợt, mỗi chiếc trôi lắc riêng; xa thì nhỏ
    for (var i = 0; i < 14; i++) {
      var dep = R[i + 10], y = hz + h * 0.06 + dep * (h * 0.5), x = ((R[i + 30] * w + t * w * 0.004 * (1 + dep)) % (w * 1.1)) - w * 0.05, s = w * (0.018 + dep * 0.035), bob = Math.sin(t * 1.1 + i * 1.9) * s * 0.08, rot = Math.sin(t * 0.5 + i) * 0.12;
      if (x > w * 0.55 && y > h * 0.72) continue; // chừa chỗ vệ cỏ
      g.save(); g.translate(x, y + bob); g.rotate(rot);
      g.fillStyle = rgba('#000000', dk ? 0.35 : 0.15); g.beginPath(); g.ellipse(0, s * 0.12, s * 1.05, s * 0.22, 0, 0, 7); g.fill();
      g.fillStyle = dk ? '#bfc4b8' : '#f2efe2'; g.beginPath(); g.moveTo(-s, 0); g.lineTo(0, -s * 0.5); g.lineTo(s, 0); g.quadraticCurveTo(0, s * 0.18, -s, 0); g.fill();
      g.strokeStyle = rgba(dk ? '#6f7468' : '#b8b29c', 0.8); g.lineWidth = 0.8; g.beginPath(); g.moveTo(-s * 0.5, -s * 0.25); g.lineTo(s * 0.5, -s * 0.25); g.stroke();
      g.restore();
    }
    // vệ cỏ gần, góc phải dưới
    g.fillStyle = dk ? '#121a16' : '#76836a'; g.beginPath(); g.moveTo(w * 0.5, h); g.quadraticCurveTo(w * 0.62, h * 0.74, w, h * 0.7); g.lineTo(w, h); g.fill();
    g.strokeStyle = dk ? '#26342b' : '#5d6b52'; g.lineWidth = 1;
    for (var k = 0; k < 60; k++) { var gx = w * 0.52 + R[(k + 60) % 240] * w * 0.48, gb = h * (0.8 + R[(k + 120) % 240] * 0.2), gh = h * (0.04 + R[(k + 180) % 240] * 0.06), sw = Math.sin(t * 1.3 + k) * 3; g.beginPath(); g.moveTo(gx, gb); g.quadraticCurveTo(gx + sw * 0.5, gb - gh * 0.6, gx + sw, gb - gh); g.stroke(); }
    // mũ bảo hiểm xanh lá nằm nghiêng trong cỏ, quai đứt buông ra hai đầu
    var hx = w * 0.78, hy = h * 0.86, hr = w * 0.065;
    g.save(); g.translate(hx, hy); g.rotate(0.5);
    g.fillStyle = dk ? '#2f6b45' : '#3f8a58'; g.beginPath(); g.arc(0, 0, hr, Math.PI, 0); g.closePath(); g.fill();
    g.fillStyle = dk ? '#1c3f29' : '#2c6440'; g.fillRect(-hr * 1.02, -hr * 0.06, hr * 2.04, hr * 0.14);
    g.fillStyle = rgba('#e8f4f0', dk ? 0.25 : 0.45); g.beginPath(); g.ellipse(-hr * 0.35, -hr * 0.55, hr * 0.25, hr * 0.08, -0.5, 0, 7); g.fill();
    g.strokeStyle = dk ? '#3a3a36' : '#3d3a33'; g.lineWidth = Math.max(1.2, w / 500);
    g.beginPath(); g.moveTo(-hr * 0.8, hr * 0.08); g.quadraticCurveTo(-hr * 0.9, hr * 0.6, -hr * 0.55, hr * 0.75); g.stroke();
    g.beginPath(); g.moveTo(hr * 0.8, hr * 0.08); g.quadraticCurveTo(hr * 0.75, hr * 0.45, hr * 0.5, hr * 0.5); g.stroke();
    g.restore();
    // trăng lạnh phủ nhẹ
    g.fillStyle = rgba('#000000', dk ? 0.15 : 0.05); g.fillRect(0, 0, w, h);
  };

  // Bờ rào tre trước căn nhà thứ ba: ô cửa sổ thấp sáng lửa đều đặn, không hề lay; lối rẽ vào sân; trên bùn một dấu chân xoay ngược.
  // Con đường đất dẫn ngược về phía giếng, mất hút trong tối.
  ART.fencefire = function (g, w, h, t, R) {
    var dk = C.dark, hz = h * 0.42;
    sky(g, w, h, 'night', 0.5);
    hills(g, w, h, hz, h * 0.03, sil('night'), 6);
    g.fillStyle = dk ? '#10181a' : '#86928a'; g.fillRect(0, hz, w, h - hz);
    // căn nhà phía sau rào, bên phải: ô cửa sổ lửa vàng ấm, đều (không chao)
    var nx = w * 0.56, nb = hz + h * 0.1, nw = w * 0.34, col = dk ? '#080d0f' : '#4a5652';
    g.fillStyle = col; g.fillRect(nx, nb - nw * 0.4, nw, nw * 0.4);
    g.beginPath(); g.moveTo(nx - nw * 0.1, nb - nw * 0.38); g.lineTo(nx + nw * 0.2, nb - nw * 0.72); g.lineTo(nx + nw * 0.8, nb - nw * 0.72); g.lineTo(nx + nw * 1.1, nb - nw * 0.38); g.fill();
    var ox = nx + nw * 0.22, oy = nb - nw * 0.26, ow = nw * 0.22, oh = nw * 0.14;
    gGlow(g, ox + ow / 2, oy + oh / 2, nw * 0.5, '#f0b25c', dk ? 0.32 : 0.3);
    g.fillStyle = '#f3c27a'; g.fillRect(ox, oy, ow, oh);
    g.fillStyle = col; g.fillRect(ox + ow * 0.48, oy, ow * 0.04, oh);
    // con đường đất: từ gần (giữa dưới) chạy ngược về bên trái xa, mất hút
    g.fillStyle = dk ? '#262219' : '#ad9e7d';
    g.beginPath(); g.moveTo(w * 0.2, h); g.quadraticCurveTo(w * 0.24, h * 0.62, w * 0.04, hz + h * 0.02); g.lineTo(w * 0.07, hz + h * 0.02); g.quadraticCurveTo(w * 0.44, h * 0.66, w * 0.56, h); g.fill();
    var fade = g.createLinearGradient(0, 0, w * 0.3, 0); fade.addColorStop(0, rgba(dk ? '#0a1216' : '#9aa7ad', 0.9)); fade.addColorStop(1, rgba(dk ? '#0a1216' : '#9aa7ad', 0)); g.fillStyle = fade; g.fillRect(0, hz - 2, w * 0.3, h * 0.2);
    // dấu chân trên bùn đi tới rồi dừng, giẫm lên chính mình, xoay ngược về phía đường
    var fp = [[0.3, 0.97, 0], [0.34, 0.9, 0], [0.33, 0.84, 0], [0.37, 0.79, 0], [0.37, 0.785, 2.6]];
    fp.forEach(function (p, i) { g.save(); g.translate(w * p[0], h * p[1]); g.rotate(-0.35 + p[2]); g.fillStyle = rgba(dk ? '#000000' : '#5a4e3a', i === 4 ? 0.55 : 0.4); g.beginPath(); g.ellipse(0, 0, w * 0.009, w * 0.018, 0, 0, 7); g.fill(); g.restore(); });
    // bờ rào tre gần: cọc chéo + hàng tre, có một khoảng trống là lối rẽ vào sân
    var fb = h * 0.76, fc = dk ? '#05090a' : '#3f4a45';
    g.strokeStyle = fc; g.lineWidth = Math.max(2, w / 260);
    for (var x = w * 0.5; x < w; x += w * 0.028) { if (x > w * 0.62 && x < w * 0.72) continue; var ht = h * (0.16 + R[Math.floor(x) % 240] * 0.05); g.beginPath(); g.moveTo(x, fb); g.lineTo(x + Math.sin(t * 0.4 + x) * 1, fb - ht); g.stroke(); }
    g.lineWidth = Math.max(1.5, w / 400);
    [[0.5, 0.62], [0.72, 1]].forEach(function (s) { g.beginPath(); g.moveTo(w * s[0], fb - h * 0.08); g.lineTo(w * s[1], fb - h * 0.08); g.stroke(); g.beginPath(); g.moveTo(w * s[0], fb - h * 0.14); g.lineTo(w * s[1], fb - h * 0.14); g.stroke(); });
    for (var b = 0; b < 3; b++) bamboo(g, w * (0.82 + b * 0.07), fb, h * (0.32 + R[b + 5] * 0.08), fc, t, b + 7);
  };

  /* ---------- Góc nhìn khác ch06, Leon "Món nợ cũ" ---------- */
  // Từ chạc ba trên cây đa nhìn xuống ngã ba giếng: thân cành tối ôm hai mép khung, rễ phụ thõng ngay trước mắt,
  // dưới xa là miệng giếng và bốn con đường gặp nhau, ruộng đêm với mấy chiếc nón lá trôi. Không người.
  ART.perch = function (g, w, h, t, R) {
    var dk = C.dark;
    sky(g, w, h, 'night');
    // mặt đất nhìn từ trên cao (chiếm gần hết khung, nghiêng)
    var gr = g.createLinearGradient(0, h * 0.18, 0, h);
    if (dk) { gr.addColorStop(0, '#16201f'); gr.addColorStop(1, '#222c29'); } else { gr.addColorStop(0, '#9da99a'); gr.addColorStop(1, '#b9b39a'); }
    g.fillStyle = gr; g.fillRect(0, h * 0.18, w, h);
    // ruộng: các ô ngăn bằng bờ, nước lấp loáng ánh sao
    g.strokeStyle = rgba(dk ? '#34423e' : '#6d7a66', 0.9); g.lineWidth = 1;
    for (var i = 0; i < 7; i++) { var y = h * (0.24 + i * 0.1); g.beginPath(); g.moveTo(0, y); g.lineTo(w, y - h * 0.03); g.stroke(); }
    for (var s = 0; s < 22; s++) { var a = 0.5 + 0.5 * Math.sin(t * 1.3 + s * 2.1); g.fillStyle = rgba(dk ? '#cfe3e6' : '#ffffff', (dk ? 0.18 : 0.35) * a); g.fillRect(R[s] * w, h * (0.22 + R[s + 22] * 0.7), w * 0.012, 1); }
    // bốn con đường đất gặp nhau ở giếng
    var cx = w * 0.56, cy = h * 0.66, road = dk ? '#3a423b' : '#cfc3a2';
    g.strokeStyle = road; g.lineCap = 'round';
    [[w * 0.05, h * 0.3, w * 0.03], [w * 1.02, h * 0.36, w * 0.028], [w * 0.15, h * 1.05, w * 0.06], [w * 0.95, h * 1.05, w * 0.06]].forEach(function (p) {
      g.lineWidth = p[2]; g.beginPath(); g.moveTo(cx, cy); g.quadraticCurveTo((cx + p[0]) / 2 + w * 0.03, (cy + p[1]) / 2, p[0], p[1]); g.stroke();
    });
    g.lineCap = 'butt';
    g.fillStyle = road; g.beginPath(); g.ellipse(cx, cy, w * 0.11, h * 0.07, 0, 0, 7); g.fill();
    // sỏi
    g.fillStyle = rgba(dk ? '#3b4440' : '#a99d7e', 0.9); for (var p = 0; p < 40; p++) g.fillRect(cx + (R[p + 50] - 0.5) * w * 0.2, cy + (R[p + 90] - 0.5) * h * 0.12, 1.5, 1.2);
    // miệng giếng nhìn từ trên: vành đá và lòng đen
    g.fillStyle = dk ? '#55605b' : '#8d978a'; g.beginPath(); g.ellipse(cx - w * 0.05, cy - h * 0.005, w * 0.035, h * 0.025, 0, 0, 7); g.fill();
    g.fillStyle = dk ? '#020405' : '#2f3634'; g.beginPath(); g.ellipse(cx - w * 0.05, cy - h * 0.005, w * 0.022, h * 0.015, 0, 0, 7); g.fill();
    // nón lá trôi trên ruộng (rất nhỏ vì xa), lờ đờ
    for (var n = 0; n < 7; n++) {
      var nx = ((R[n + 140] * w + t * w * 0.003 * (1 + R[n + 150])) % w), ny = h * (0.26 + R[n + 160] * 0.3), ns = w * 0.009;
      if (Math.abs(nx - cx) < w * 0.14 && Math.abs(ny - cy) < h * 0.1) continue;
      g.fillStyle = rgba(dk ? '#bfc4b8' : '#f2efe2', dk ? 0.55 : 0.85); g.beginPath(); g.ellipse(nx, ny + Math.sin(t + n) * 1, ns, ns * 0.6, 0, 0, 7); g.fill();
    }
    // tán đa che phía trên, cành và thân ôm mép trái + mép dưới (chạc ba anh ngồi)
    var col = sil('night');
    g.fillStyle = col;
    for (var c = 0; c < 8; c++) { g.beginPath(); g.ellipse(w * (c * 0.15) + Math.sin(t * 0.35 + c) * 3, -h * 0.06 + h * 0.05 * Math.sin(c * 2.3), w * 0.14, h * 0.16, 0, 0, 7); g.fill(); }
    g.beginPath(); g.moveTo(0, h * 0.1); g.quadraticCurveTo(w * 0.1, h * 0.5, w * 0.06, h); g.lineTo(0, h); g.fill();
    g.beginPath(); g.moveTo(0, h * 0.92); g.quadraticCurveTo(w * 0.35, h * 0.86, w * 0.62, h * 0.95); g.lineTo(w * 0.7, h); g.lineTo(0, h); g.fill();
    g.beginPath(); g.moveTo(w * 0.04, h * 0.6); g.quadraticCurveTo(w * 0.2, h * 0.7, w * 0.3, h * 0.9); g.lineTo(w * 0.22, h * 0.92); g.quadraticCurveTo(w * 0.12, h * 0.75, w * 0.03, h * 0.7); g.fill();
    // lá viền tán
    for (var l = 0; l < 26; l++) { var lx = R[l + 180] * w, ly = h * (0.06 + R[l + 200] * 0.1) + Math.sin(t * 0.8 + l) * 1.5; g.beginPath(); g.ellipse(lx, ly, w * 0.012, h * 0.008, R[l + 220] * 3, 0, 7); g.fill(); }
    // rễ phụ thõng ngay trước mắt, gần nên to và mờ
    g.strokeStyle = col; g.lineCap = 'round';
    for (var r = 0; r < 9; r++) {
      var rx = w * (0.18 + R[r + 230] * 0.75), len = h * (0.35 + R[r + 5] * 0.5), sw = Math.sin(t * 0.5 + r * 1.3) * w * 0.006;
      g.lineWidth = r < 3 ? Math.max(2, w / 260) : 1; g.globalAlpha = r < 3 ? 0.95 : 0.7;
      g.beginPath(); g.moveTo(rx, 0); g.quadraticCurveTo(rx + sw, len * 0.5, rx + sw * 2, len); g.stroke();
    }
    g.globalAlpha = 1; g.lineCap = 'butt';
  };

  // Một nhánh xích nhỏ cong lên như ngón tay, quặp một tấm thẻ úp (mặt lưng vòng tròn), đung đưa trên nền sỏi đêm.
  ART.chaincard = function (g, w, h, t, R) {
    var dk = C.dark;
    sky(g, w, h, 'night', 0.6);
    var hz = h * 0.62;
    g.fillStyle = dk ? '#0e1416' : '#c2b9a0'; g.fillRect(0, hz, w, h - hz);
    g.fillStyle = dk ? '#1c2426' : '#a89f86'; for (var p = 0; p < 70; p++) g.fillRect(R[p] * w, hz + R[p + 70] * (h - hz), 2, 1.5);
    var star = rgba(dk ? '#d9eef0' : '#ffffff', 0.6); g.fillStyle = star; for (var s = 0; s < 9; s++) { g.globalAlpha = Math.max(0, Math.sin(t * 0.8 + s * 2)); g.fillRect(R[s + 150] * w, h * (0.08 + R[s + 160] * 0.4), 1.5, 1.5); } g.globalAlpha = 1;
    // xích chính từ mép trái vào, võng xuống; nhánh nhỏ mọc ra cong lên giữ thẻ
    var chain = dk ? '#9aa6a6' : '#3a4442', link = Math.max(5, h * 0.03), sw = Math.sin(t * 0.9) * h * 0.012;
    chainCurve(g, -w * 0.02, h * 0.3, w * 0.25, h * 0.62, w * 0.46, h * 0.5 + sw, link, chain);
    chainCurve(g, w * 0.46, h * 0.5 + sw, w * 0.52, h * 0.36, w * 0.6, h * 0.34 + sw * 1.4, link * 0.7, chain);
    // tấm thẻ: hơi xoay, mặt lưng tối, vòng tròn, ánh lạnh lướt qua
    var cxp = w * 0.64, cyp = h * 0.36 + sw * 1.5, cw = h * 0.22, ch = h * 0.31, rot = 0.22 + Math.sin(t * 0.9 - 0.4) * 0.06;
    g.save(); g.translate(cxp, cyp); g.rotate(rot);
    g.fillStyle = rgba('#000000', 0.4); g.fillRect(-cw / 2 + 4, 6, cw, ch);
    g.fillStyle = dk ? '#14202b' : '#23313c'; g.strokeStyle = dk ? '#3a5060' : '#4c6372'; g.lineWidth = 1.2;
    g.beginPath(); if (g.roundRect) g.roundRect(-cw / 2, 0, cw, ch, cw * 0.08); else g.rect(-cw / 2, 0, cw, ch); g.fill(); g.stroke();
    g.strokeStyle = rgba('#9fb6c4', 0.75); g.lineWidth = 1; g.beginPath(); g.arc(0, ch * 0.44, cw * 0.3, 0, 7); g.stroke();
    g.lineWidth = 0.6; g.beginPath(); g.arc(0, ch * 0.44, cw * 0.24, 0, 7); g.stroke();
    // nét rối trong vòng tròn
    g.beginPath(); for (var k = 0; k < 18; k++) { var a = k * 2.4 + 0.3, rr = cw * (0.06 + R[k + 100] * 0.16); var x = Math.cos(a) * rr, y = ch * 0.44 + Math.sin(a) * rr; k ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
    g.fillStyle = rgba('#9fb6c4', 0.7); g.fillRect(-cw * 0.28, ch * 0.86, cw * 0.56, 1);
    // ánh lạnh lướt chéo qua mặt thẻ
    var sh = ((t * 0.35) % 1.6) - 0.3;
    g.save(); g.beginPath(); g.rect(-cw / 2, 0, cw, ch); g.clip();
    var lg = g.createLinearGradient(-cw / 2 + cw * sh * 2 - cw * 0.3, 0, -cw / 2 + cw * sh * 2 + cw * 0.3, ch);
    lg.addColorStop(0, rgba('#d9eef0', 0)); lg.addColorStop(0.5, rgba('#d9eef0', 0.22)); lg.addColorStop(1, rgba('#d9eef0', 0));
    g.fillStyle = lg; g.fillRect(-cw / 2, 0, cw, ch); g.restore();
    g.restore();
    // móc xích ôm mép thẻ
    g.strokeStyle = chain; g.lineWidth = Math.max(1.2, link * 0.18);
    g.beginPath(); g.ellipse(w * 0.6, h * 0.34 + sw * 1.4, link * 0.45, link * 0.3, 0.6, 0, 7); g.stroke();
    glow(g, w * 0.62, h * 0.4, h * 0.3, '#d9eef0', dk ? 0.08 : 0.12);
  };

  // Ký ức: sàn gỗ câu lạc bộ sau buổi tập, nắng chiều nhạt màu. Ba chai nước, một chai nằm lăn qua sàn.
  // Hai thanh kiếm tre dựa tường. Mọi thứ hơi nhoè như nhớ lại.
  ART.dojo = function (g, w, h, t, R) {
    var dk = C.dark;
    var gr = g.createLinearGradient(0, 0, 0, h);
    if (dk) { gr.addColorStop(0, '#2a2620'); gr.addColorStop(1, '#3a2f22'); } else { gr.addColorStop(0, '#e8dcc2'); gr.addColorStop(1, '#d2b88e'); }
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    var fl = h * 0.5;
    // tường: tấm vách gỗ dọc
    g.strokeStyle = rgba(dk ? '#000000' : '#8a6e48', 0.22); g.lineWidth = 1;
    for (var x = 0; x < w; x += w * 0.07) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, fl); g.stroke(); }
    g.fillStyle = dk ? '#1d1914' : '#a88c62'; g.fillRect(0, fl - h * 0.02, w, h * 0.02);
    // sàn ván gỗ nhìn chéo, đường ván chụm về xa
    g.fillStyle = dk ? '#4a3b28' : '#c9a273'; g.fillRect(0, fl, w, h - fl);
    g.strokeStyle = rgba(dk ? '#1e170e' : '#8e6c42', 0.5);
    for (var i = -8; i <= 8; i++) { g.beginPath(); g.moveTo(w * 0.5 + i * w * 0.03, fl); g.lineTo(w * 0.5 + i * w * 0.16, h); g.stroke(); }
    // vệt nắng chéo từ cửa sổ, bụi bay trong vệt nắng
    g.fillStyle = rgba('#fff0c8', dk ? 0.07 : 0.28);
    g.beginPath(); g.moveTo(w * 0.62, 0); g.lineTo(w * 0.8, 0); g.lineTo(w * 0.55, h); g.lineTo(w * 0.22, h); g.fill();
    for (var d = 0; d < 18; d++) { var dx = w * (0.4 + R[d] * 0.35) + Math.sin(t * 0.4 + d) * w * 0.01, dy = (h * R[d + 20] + t * h * 0.01 * (1 + R[d + 40])) % h; g.fillStyle = rgba('#fff3d6', (dk ? 0.25 : 0.6) * (0.5 + 0.5 * Math.sin(t + d))); g.fillRect(dx, dy, 1.5, 1.5); }
    // hai thanh kiếm tre dựa tường bên trái
    g.strokeStyle = dk ? '#8c7a52' : '#7a6236'; g.lineCap = 'round';
    [[0.14, 0.2], [0.18, 0.24]].forEach(function (k) {
      g.lineWidth = Math.max(2, w / 220); g.beginPath(); g.moveTo(w * k[0], fl + h * 0.02); g.lineTo(w * k[1], h * 0.06); g.stroke();
      g.lineWidth = Math.max(3, w / 140); g.beginPath(); g.moveTo(w * k[0], fl + h * 0.02); g.lineTo(w * (k[0] + (k[1] - k[0]) * 0.22), fl - h * 0.1); g.stroke();
    });
    g.lineCap = 'butt';
    // ba chai nước: hai chai đứng, một chai lăn chậm qua sàn
    function bottle(x, y, s, ang) {
      g.save(); g.translate(x, y); g.rotate(ang);
      g.fillStyle = rgba('#000000', dk ? 0.35 : 0.15); g.beginPath(); g.ellipse(ang ? 0 : s * 0.15, ang ? s * 0.4 : 0, s * (ang ? 1.2 : 0.5), s * 0.15, 0, 0, 7); g.fill();
      g.fillStyle = rgba(dk ? '#9fc3cf' : '#e8f6fb', dk ? 0.5 : 0.8); g.strokeStyle = rgba(dk ? '#cfe6ee' : '#7aa4b4', 0.8); g.lineWidth = 1;
      g.beginPath(); if (g.roundRect) g.roundRect(-s * 0.3, -s * 1.6, s * 0.6, s * 1.6, s * 0.12); else g.rect(-s * 0.3, -s * 1.6, s * 0.6, s * 1.6); g.fill(); g.stroke();
      g.fillRect(-s * 0.13, -s * 1.95, s * 0.26, s * 0.35);
      g.fillStyle = dk ? '#3f7d8f' : '#4f9fb3'; g.fillRect(-s * 0.15, -s * 2.05, s * 0.3, s * 0.14);
      g.fillStyle = rgba('#ffffff', 0.35); g.fillRect(-s * 0.2, -s * 1.4, s * 0.06, s * 1.1);
      g.restore();
    }
    var s = h * 0.06;
    bottle(w * 0.36, h * 0.72, s, 0); bottle(w * 0.44, h * 0.7, s * 0.95, 0);
    var roll = (t * 0.06) % 1, rx = w * (0.56 + roll * 0.3), ry = h * (0.82 + roll * 0.06);
    bottle(rx, ry, s * 1.05, Math.PI / 2 + roll * 0.4);
    // nhoè viền như ký ức
    var vg = g.createRadialGradient(w * 0.5, h * 0.6, h * 0.25, w * 0.5, h * 0.6, w * 0.7);
    vg.addColorStop(0, rgba(dk ? '#000000' : '#f5ecd8', 0)); vg.addColorStop(1, rgba(dk ? '#000000' : '#f5ecd8', dk ? 0.75 : 0.7));
    g.fillStyle = vg; g.fillRect(0, 0, w, h);
  };

  // Hửng sáng: trời xám nhạt như nước vo gạo, bờ ruộng im, con đường đất với một hàng dấu giày đi xa dần,
  // gốc đa và rễ phụ lùi lại phía sau bên trái. Không người.
  ART.leondawn = function (g, w, h, t, R) {
    var dk = C.dark, hz = h * 0.42;
    var gr = g.createLinearGradient(0, 0, 0, hz);
    if (dk) { gr.addColorStop(0, '#2b3134'); gr.addColorStop(1, '#5a5f5c'); } else { gr.addColorStop(0, '#cfd3d0'); gr.addColorStop(1, '#ecebe2'); }
    g.fillStyle = gr; g.fillRect(0, 0, w, hz);
    // dải sáng chân trời hửng dần
    var lift = 0.6 + 0.4 * Math.sin(t * 0.15);
    gGlow(g, w * 0.72, hz, w * 0.5, dk ? '#c9c6b4' : '#fffaf0', (dk ? 0.18 : 0.4) * lift);
    // rặng tre xa
    g.fillStyle = dk ? '#2a302e' : '#9ea79c';
    g.beginPath(); g.moveTo(0, hz); for (var x = 0; x <= w; x += w / 50) g.lineTo(x, hz - h * (0.03 + 0.025 * Math.abs(Math.sin(x / w * 17)) + 0.015 * Math.sin(x / w * 5))); g.lineTo(w, hz); g.fill();
    // ruộng nước xám, phản chiếu trời
    var fg = g.createLinearGradient(0, hz, 0, h);
    if (dk) { fg.addColorStop(0, '#3f4644'); fg.addColorStop(1, '#232a28'); } else { fg.addColorStop(0, '#d5d8cf'); fg.addColorStop(1, '#a7ad9c'); }
    g.fillStyle = fg; g.fillRect(0, hz, w, h - hz);
    g.strokeStyle = rgba(dk ? '#1a201e' : '#7e8673', 0.8); g.lineWidth = 1.5;
    [0.5, 0.6, 0.74, 0.9].forEach(function (y, i) { g.beginPath(); g.moveTo(0, h * y); g.lineTo(w, h * (y - 0.01 * i)); g.stroke(); });
    // mạ non lấm tấm
    g.strokeStyle = rgba(dk ? '#4f6050' : '#7e9470', 0.7); g.lineWidth = 1;
    for (var m = 0; m < 80; m++) { var mx = R[m] * w, my = hz + h * 0.04 + R[m + 80] * (h - hz), mh = h * 0.01 * (0.5 + (my - hz) / h * 2); g.beginPath(); g.moveTo(mx, my); g.lineTo(mx + Math.sin(t * 0.8 + m) * 1, my - mh); g.stroke(); }
    // con đường đất từ gần (dưới giữa) đi xa về phía phải chân trời
    g.fillStyle = dk ? '#4a463c' : '#c9bea0';
    g.beginPath(); g.moveTo(w * 0.32, h); g.quadraticCurveTo(w * 0.5, h * 0.7, w * 0.7, hz + h * 0.01); g.lineTo(w * 0.72, hz + h * 0.01); g.quadraticCurveTo(w * 0.62, h * 0.7, w * 0.62, h); g.fill();
    // dấu giày đi xa dần (đế khía nhẹ), mỗi dấu mờ hơn dấu trước
    for (var i = 0; i < 12; i++) {
      var u = i / 11, py = h - (h - hz) * Math.pow(u, 0.8) * 0.95 - h * 0.03, px = w * (0.47 + u * 0.24) + (i % 2 ? 1 : -1) * w * 0.012 * (1 - u), sc = 1.1 - u * 0.9;
      g.save(); g.translate(px, py); g.rotate(-0.35 * u); g.fillStyle = rgba('#000000', (dk ? 0.45 : 0.25) * (1 - u * 0.6));
      g.beginPath(); g.ellipse(0, 0, w * 0.009 * sc, h * 0.018 * sc, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(0, h * 0.025 * sc, w * 0.007 * sc, h * 0.009 * sc, 0, 0, 7); g.fill(); g.restore();
    }
    // gốc đa lùi lại phía sau bên trái: thân, tán, rễ phụ
    var col = dk ? '#151b1c' : '#5d6863';
    g.fillStyle = col; g.fillRect(w * 0.08, hz - h * 0.22, w * 0.05, h * 0.26);
    for (var c = 0; c < 6; c++) { g.beginPath(); g.ellipse(w * (0.02 + c * 0.05) + Math.sin(t * 0.3 + c) * 2, hz - h * (0.26 + 0.05 * Math.sin(c * 1.9)), w * 0.07, h * 0.08, 0, 0, 7); g.fill(); }
    g.strokeStyle = col; g.lineWidth = 1;
    for (var r = 0; r < 12; r++) { var rx = w * (0.0 + R[r + 170] * 0.3), sw = Math.sin(t * 0.5 + r) * 2; g.beginPath(); g.moveTo(rx, hz - h * 0.22); g.quadraticCurveTo(rx + sw, hz - h * 0.12, rx + sw * 1.4, hz - h * (0.02 + R[r + 190] * 0.08)); g.stroke(); }
    // sương sát mặt ruộng
    for (var f = 0; f < 5; f++) { var fy = hz + h * (0.03 + f * 0.05), fx = ((t * w * 0.006 + f * w * 0.3) % (w * 1.4)) - w * 0.2; gGlow(g, fx, fy, w * 0.25, dk ? '#8d938f' : '#ffffff', dk ? 0.08 : 0.25); }
  };

  // ---------- Góc nhìn khác ch12, Talia "Đếm vết nứt" ----------
  // vết nứt trên đá: một đường gãy khúc, chẻ nhánh ở cuối (dùng chung cho ba tranh của Talia)
  function tCrack(g, x, y, ang, len, R, k, depth) {
    var px = x, py = y, n = 6;
    g.beginPath(); g.moveTo(px, py);
    for (var i = 1; i <= n; i++) { var a = ang + (R[(k * 13 + i) % 240] - 0.5) * 0.9; px += Math.cos(a) * len / n; py += Math.sin(a) * len / n; g.lineTo(px, py); }
    g.stroke();
    if (depth > 0) { tCrack(g, px, py, ang - 0.5, len * 0.45, R, k + 7, depth - 1); tCrack(g, px, py, ang + 0.45, len * 0.38, R, k + 11, depth - 1); }
  }
  // Lán lợp tôn dưới chân đồi lúc trời còn tối: đống tro còn đỏ, mấy củ khoai gói lá chuối,
  // đòn gánh gác ngang hai sọt đá, con dốc mờ mờ phía sau, miệng hầm đen trên sườn núi.
  ART.shed = function (g, w, h, t, R) {
    var dk = C.dark, hz = h * 0.5;
    var sk = g.createLinearGradient(0, 0, 0, hz);
    if (dk) { sk.addColorStop(0, '#0d1219'); sk.addColorStop(1, '#232a33'); } else { sk.addColorStop(0, '#5d6a7a'); sk.addColorStop(1, '#a9acaa'); }
    g.fillStyle = sk; g.fillRect(0, 0, w, h);
    // sườn núi với miệng hầm đen
    g.fillStyle = dk ? '#151a1e' : '#5a5f5e';
    g.beginPath(); g.moveTo(0, hz); g.quadraticCurveTo(w * 0.35, h * 0.12, w * 0.72, h * 0.2); g.quadraticCurveTo(w * 0.9, h * 0.26, w, h * 0.36); g.lineTo(w, h); g.lineTo(0, h); g.fill();
    g.fillStyle = '#000000'; g.beginPath(); g.ellipse(w * 0.66, h * 0.33, w * 0.025, h * 0.035, 0, Math.PI, 0); g.lineTo(w * 0.685, h * 0.35); g.lineTo(w * 0.635, h * 0.35); g.fill();
    // con dốc đá dẫn lên
    g.strokeStyle = rgba(dk ? '#3a3e3f' : '#8d8f88', 0.8); g.lineWidth = 2; g.beginPath(); g.moveTo(w * 0.45, h); g.quadraticCurveTo(w * 0.55, h * 0.55, w * 0.65, h * 0.36); g.stroke();
    // nền đất trước lán
    g.fillStyle = dk ? '#1d1c1a' : '#6b6255'; g.fillRect(0, h * 0.74, w, h * 0.26);
    // lán: hai cột, mái tôn gợn sóng chéo
    var lx = w * 0.06, rx = w * 0.44, ty = h * 0.42, by = h * 0.78;
    g.fillStyle = dk ? '#2a2018' : '#4d3c2c'; g.fillRect(lx + w * 0.02, ty, w * 0.012, by - ty); g.fillRect(rx - w * 0.03, ty + h * 0.03, w * 0.012, by - ty - h * 0.03);
    g.fillStyle = dk ? '#3a3d40' : '#7e8386'; g.beginPath(); g.moveTo(lx - w * 0.02, ty - h * 0.02); g.lineTo(rx + w * 0.02, ty + h * 0.04); g.lineTo(rx + w * 0.02, ty + h * 0.07); g.lineTo(lx - w * 0.02, ty + h * 0.01); g.fill();
    g.strokeStyle = rgba('#000000', 0.35); g.lineWidth = 1; for (var s = 0; s < 14; s++) { var u = s / 14, x = lx - w * 0.02 + u * (rx - lx + w * 0.04); g.beginPath(); g.moveTo(x, ty - h * 0.02 + u * h * 0.06); g.lineTo(x, ty + h * 0.01 + u * h * 0.06); g.stroke(); }
    // đống tro còn đỏ dưới mái, khói mỏng
    var ax = w * 0.22, ay = h * 0.79, fl = 0.75 + 0.25 * Math.sin(t * 2.3) * Math.sin(t * 3.7);
    gGlow(g, ax, ay, w * 0.14, '#ff9a5a', (dk ? 0.3 : 0.25) * fl);
    g.fillStyle = dk ? '#3a3632' : '#8a847a'; g.beginPath(); g.ellipse(ax, ay, w * 0.07, h * 0.025, 0, 0, 7); g.fill();
    for (var e = 0; e < 7; e++) { var a = 0.4 + 0.6 * Math.abs(Math.sin(t * 1.6 + e * 2.1)); g.fillStyle = rgba('#ff7a3a', a * 0.8); g.beginPath(); g.arc(ax - w * 0.05 + R[e] * w * 0.1, ay - h * 0.004 + R[e + 7] * h * 0.012, 1.2 + R[e + 14], 0, 7); g.fill(); }
    for (var m = 0; m < 4; m++) { var k = ((t * 0.12 + m / 4) % 1); g.fillStyle = rgba(dk ? '#9aa0a4' : '#e8e8e4', 0.12 * (1 - k)); g.beginPath(); g.arc(ax + Math.sin(k * 5 + m) * w * 0.02, ay - k * h * 0.28, w * 0.02 + k * w * 0.03, 0, 7); g.fill(); }
    // gói lá chuối, mấy củ khoai đen nhẻm hé ra
    g.fillStyle = dk ? '#2d4430' : '#5e8a5a'; g.beginPath(); g.ellipse(w * 0.33, h * 0.84, w * 0.045, h * 0.022, -0.2, 0, 7); g.fill();
    g.fillStyle = dk ? '#1a1410' : '#2e241c'; [0, 1, 2].forEach(function (i) { g.beginPath(); g.ellipse(w * (0.315 + i * 0.016), h * (0.83 - i * 0.002), w * 0.01, h * 0.007, 0.3, 0, 7); g.fill(); });
    // hai sọt đá và đòn gánh gác ngang
    [0.56, 0.74].forEach(function (u, i) {
      var cx = w * u, cy = h * 0.86, cw = w * 0.065, ch = h * 0.09;
      g.fillStyle = dk ? '#3d3122' : '#8a7148'; g.beginPath(); g.moveTo(cx - cw, cy - ch); g.lineTo(cx + cw, cy - ch); g.lineTo(cx + cw * 0.8, cy); g.lineTo(cx - cw * 0.8, cy); g.fill();
      g.strokeStyle = rgba('#000000', 0.3); for (var q = 1; q < 5; q++) { g.beginPath(); g.moveTo(cx - cw + q * cw * 0.4, cy - ch); g.lineTo(cx - cw * 0.8 + q * cw * 0.32, cy); g.stroke(); }
      for (var r = 0; r < 6; r++) rock(g, cx - cw * 0.7 + R[r + i * 6 + 30] * cw * 1.4, cy - ch - R[r + i * 6 + 50] * h * 0.02, 3 + R[r + 70] * 5, R, r + i * 6, dk ? '#4a4a48' : '#8a867c');
    });
    g.strokeStyle = dk ? '#5a4632' : '#6e5236'; g.lineWidth = Math.max(3, w * 0.007); g.lineCap = 'round'; g.beginPath(); g.moveTo(w * 0.5, h * 0.75); g.quadraticCurveTo(w * 0.65, h * 0.73, w * 0.8, h * 0.75); g.stroke(); g.lineCap = 'butt';
    vign(g, w, h, 0.55);
  };
  // Khe đá giữa hai cột chống, nhìn từ bên trong: vách đá sát mặt, vết nứt chạy chéo chẻ đôi ở cuối,
  // những vết nhỏ rẽ ra; hai mép tối ép vào rồi nới ra theo nhịp thở rất khẽ; ngoài khe một bóng mờ đi qua.
  ART.crevice = function (g, w, h, t, R) {
    var dk = C.dark;
    var bg = g.createRadialGradient(w * 0.5, h * 0.45, 0, w * 0.5, h * 0.45, Math.max(w, h) * 0.6);
    if (dk) { bg.addColorStop(0, '#3b3833'); bg.addColorStop(1, '#0e0e0f'); } else { bg.addColorStop(0, '#6e665a'); bg.addColorStop(1, '#2a2520'); }
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    // vân đá ẩm, hạt li ti
    for (var k = 0; k < 120; k++) { g.fillStyle = rgba(R[k] > 0.5 ? '#ffffff' : '#000000', 0.04 + R[k + 120] * 0.05); g.fillRect(R[(k * 3) % 240] * w, R[(k * 7) % 240] * h, 1.5, 1.5); }
    // vết nứt: một vết lớn chạy chéo, chẻ đôi; vài vết nhỏ quanh
    g.lineCap = 'round';
    g.strokeStyle = rgba('#000000', dk ? 0.85 : 0.7); g.lineWidth = Math.max(1.6, w / 300);
    tCrack(g, w * 0.3, h * 0.24, 0.62, Math.min(w, h) * 0.6, R, 3, 1);
    g.lineWidth = Math.max(1, w / 520);
    for (var c = 0; c < 9; c++) { g.strokeStyle = rgba('#000000', 0.45 + R[c + 90] * 0.3); tCrack(g, R[c + 20] * w, R[c + 40] * h, R[c + 60] * 6.28, Math.min(w, h) * (0.1 + R[c + 80] * 0.16), R, c * 5 + 17, c % 3 ? 0 : 1); }
    // mép sáng mảnh bên dưới mỗi vết (đá ướt)
    g.strokeStyle = rgba(dk ? '#c9c0ae' : '#efe4cc', dk ? 0.16 : 0.08); g.lineWidth = 1; g.save(); g.translate(1, 1.5); tCrack(g, w * 0.3, h * 0.24, 0.62, Math.min(w, h) * 0.6, R, 3, 1); g.restore(); g.lineCap = 'butt';
    // một giọt nước bò xuống
    var dy = (t * 0.05 % 1); g.fillStyle = rgba(dk ? '#9fb6c4' : '#dfe8ec', 0.5 * (1 - dy)); g.beginPath(); g.ellipse(w * 0.72, h * (0.1 + dy * 0.7), 1.6, 2.6, 0, 0, 7); g.fill();
    // bóng ngoài khe đi qua (chỉ là một vệt tối lướt ngang mép phải, rồi dừng, rồi đi tiếp)
    var cyc = (t * 0.09) % 1, sx = cyc < 0.4 ? cyc / 0.4 * 0.5 : cyc < 0.6 ? 0.5 : 0.5 + (cyc - 0.6) / 0.4 * 0.5;
    var sh = g.createLinearGradient(0, 0, w, 0); sh.addColorStop(Math.max(0, sx - 0.12), rgba('#000000', 0)); sh.addColorStop(sx, rgba('#000000', 0.35)); sh.addColorStop(Math.min(1, sx + 0.12), rgba('#000000', 0));
    g.fillStyle = sh; g.fillRect(0, 0, w, h);
    // hai mép tối ép vào, nới ra theo nhịp thở bằng mũi, rất chậm
    var br = 0.5 + 0.5 * Math.sin(t * 0.9), ew = w * (0.16 + 0.04 * br);
    var L = g.createLinearGradient(0, 0, ew, 0); L.addColorStop(0, rgba('#000000', 0.98)); L.addColorStop(1, rgba('#000000', 0)); g.fillStyle = L; g.fillRect(0, 0, ew, h);
    var Rr = g.createLinearGradient(w, 0, w - ew, 0); Rr.addColorStop(0, rgba('#000000', 0.98)); Rr.addColorStop(1, rgba('#000000', 0)); g.fillStyle = Rr; g.fillRect(w - ew, 0, ew, h);
    vign(g, w, h, 0.7);
  };
  // Trần hầm nhìn từ dưới lên: cột gãy một bên, vết nứt toả ra như rễ cây, đá vụn rơi lả tả;
  // dưới nền vài mắt xích nằm lại và cán búa gỗ thò ra khỏi đá đổ.
  ART.roots = function (g, w, h, t, R) {
    var dk = C.dark; g.fillStyle = dk ? '#09090a' : '#1f1c18'; g.fillRect(0, 0, w, h);
    var fl = 0.8 + 0.2 * Math.sin(t * 7) * Math.sin(t * 11);
    glow(g, w * 0.82, h * 0.6, w * 0.5, LAMP, (dk ? 0.18 : 0.24) * fl);
    // mặt trần đá
    var cg = g.createLinearGradient(0, 0, 0, h * 0.7); cg.addColorStop(0, dk ? '#1a1a1c' : '#4a443b'); cg.addColorStop(1, dk ? '#0e0e10' : '#2e2a24');
    g.fillStyle = cg; g.beginPath(); g.moveTo(0, 0); g.lineTo(w, 0); g.lineTo(w, h * 0.6); g.quadraticCurveTo(w * 0.5, h * 0.72, 0, h * 0.62); g.fill();
    // cột gãy bên trái: nửa trên còn treo, nửa dưới nghiêng
    g.fillStyle = dk ? '#2b2017' : '#5a4330'; g.fillRect(w * 0.12, 0, w * 0.04, h * 0.3);
    g.save(); g.translate(w * 0.16, h * 0.96); g.rotate(-0.42); g.fillRect(-w * 0.02, -h * 0.55, w * 0.04, h * 0.55); g.restore();
    g.strokeStyle = dk ? '#6a5a44' : '#c8b08a'; g.lineWidth = 1.2; g.beginPath(); for (var s = 0; s < 6; s++) { g.moveTo(w * (0.12 + s * 0.007), h * 0.3); g.lineTo(w * (0.122 + s * 0.007), h * (0.32 + R[s] * 0.03)); } g.stroke();
    // vết nứt toả ra từ đầu cột gãy, dài dần, nối vào nhau như rễ
    var grow = Math.min(1, 0.55 + 0.45 * ((t * 0.08) % 1.3));
    g.lineCap = 'round'; g.strokeStyle = rgba('#000000', 0.9);
    for (var c = 0; c < 7; c++) { g.lineWidth = Math.max(1, w / (260 + c * 60)); tCrack(g, w * 0.15, h * 0.06, -0.15 + c * 0.17 + (R[c + 30] - 0.5) * 0.15, w * (0.35 + R[c] * 0.4) * grow, R, c * 9 + 5, 2); }
    g.strokeStyle = rgba(dk ? '#c9c0ae' : '#efe4cc', dk ? 0.16 : 0.07); g.lineWidth = 1; g.save(); g.translate(0, 1.5); for (var c2 = 0; c2 < 7; c2++) tCrack(g, w * 0.15, h * 0.06, -0.15 + c2 * 0.17 + (R[c2 + 30] - 0.5) * 0.15, w * (0.35 + R[c2] * 0.4) * grow, R, c2 * 9 + 5, 2); g.restore(); g.lineCap = 'butt';
    // đá vụn rơi lả tả
    for (var d = 0; d < 16; d++) { var u = ((t * (0.25 + R[d + 100] * 0.3) + R[d + 120]) % 1), x = w * (0.2 + R[d + 140] * 0.7), y = h * (0.1 + u * 0.85); g.fillStyle = rgba(dk ? '#8a8478' : '#b8b0a0', 0.6 * (1 - u * 0.5)); g.fillRect(x, y, 1.5 + R[d + 160] * 2.5, 1.5 + R[d + 160] * 2.5); }
    // nền: đá đổ, cán búa thò ra, mấy mắt xích nằm lại
    g.fillStyle = dk ? '#141416' : '#3a352e'; g.fillRect(0, h * 0.84, w, h * 0.16);
    for (var r = 0; r < 16; r++) rock(g, w * (0.02 + R[r + 180] * 0.5), h * (0.82 + R[r + 200] * 0.14), 6 + R[r + 220] * 14, R, r, dk ? '#24252a' : '#57524a');
    g.save(); g.translate(w * 0.36, h * 0.9); g.rotate(-0.12); g.fillStyle = dk ? '#5a4632' : '#7a5c3e'; g.fillRect(0, -3, w * 0.16, 6); g.restore();
    var lk = Math.max(7, h * 0.035), pts = []; for (var i = 0; i < 7; i++) pts.push([w * (0.6 + i * 0.045), h * (0.93 - Math.sin(i * 0.9) * 0.012)]);
    chainPath(g, pts, t, lk, 0.85);
    vign(g, w, h, 0.65);
  };

  /* ---------- Góc nhìn khác ch11, Mira "Còn ba vòng" (24/11). Không vẽ người, không vẽ người bỏ đi. ---------- */
  // Lối mòn dưới chân dốc buổi sáng: sọt đá đặt bên đường, quai sọt buộc một mảnh vải trắng thắt nút dẹt,
  // vài giọt máu khô trên đá; trên cao dân gánh đá chỉ là những vệt nhỏ.
  ART.knot = function (g, w, h, t, R) {
    var dk = C.dark, hz = h * 0.5; mineLand(g, w, h, t, R, hz);
    g.fillStyle = dk ? '#33332e' : '#a8a498'; g.beginPath(); g.moveTo(0, h * 0.62); g.quadraticCurveTo(w * 0.45, h * 0.4, w, h * 0.46); g.lineTo(w, h); g.lineTo(0, h); g.fill(); // dốc
    // lối mòn
    g.strokeStyle = rgba(dk ? '#55554c' : '#d6d1c2', 0.7); g.lineWidth = Math.max(6, h * 0.04); g.lineCap = 'round';
    g.beginPath(); g.moveTo(-w * 0.05, h * 0.98); g.quadraticCurveTo(w * 0.5, h * 0.7, w * 0.95, h * 0.5); g.stroke();
    // trên dốc: đòn gánh nhấp nhô xa xa (chỉ là vệt), bụi
    for (var p = 0; p < 4; p++) { var u = ((t * 0.02 + p / 4) % 1), px = w * (0.5 + u * 0.45), py = h * (0.66 - u * 0.17) - Math.abs(Math.sin(t * 2 + p)) * 2; g.strokeStyle = rgba(dk ? '#1a1916' : '#6a5e4a', 0.6); g.lineWidth = 1.5; g.beginPath(); g.moveTo(px - w * 0.012, py); g.lineTo(px + w * 0.012, py); g.stroke(); }
    // sọt đá
    var cx = w * 0.42, cy = h * 0.9, cw = w * 0.1, ch = h * 0.15;
    g.fillStyle = dk ? '#3d3122' : '#8a7148'; g.beginPath(); g.moveTo(cx - cw, cy - ch); g.lineTo(cx + cw, cy - ch); g.lineTo(cx + cw * 0.8, cy); g.lineTo(cx - cw * 0.8, cy); g.fill();
    g.strokeStyle = rgba('#000000', 0.3); g.lineWidth = 1; for (var q = 1; q < 6; q++) { g.beginPath(); g.moveTo(cx - cw + q * cw / 3, cy - ch); g.lineTo(cx - cw * 0.8 + q * cw * 0.8 / 3, cy); g.stroke(); }
    for (var r = 0; r < 8; r++) rock(g, cx - cw * 0.8 + R[r + 30] * cw * 1.6, cy - ch - R[r + 50] * h * 0.025, 4 + R[r + 70] * 6, R, r, dk ? '#4a4a48' : '#8a867c');
    // quai sọt + mảnh vải trắng thắt nút dẹt, hai đầu vải lay
    g.strokeStyle = dk ? '#5a4632' : '#6e5236'; g.lineWidth = Math.max(2, w * 0.004);
    g.beginPath(); g.moveTo(cx - cw * 0.9, cy - ch); g.quadraticCurveTo(cx, cy - ch * 2.1, cx + cw * 0.9, cy - ch); g.stroke();
    var kx = cx + cw * 0.38, ky = cy - ch * 1.68, cl = dk ? '#d8d4c8' : '#f6f3ea';
    g.fillStyle = cl; g.beginPath(); g.ellipse(kx, ky, w * 0.014, h * 0.012, 0.3, 0, 7); g.fill();
    g.strokeStyle = cl; g.lineWidth = Math.max(2.5, h * 0.014);
    [[-1, 0], [1, 0.8]].forEach(function (s) { g.beginPath(); g.moveTo(kx, ky); for (var i = 1; i <= 6; i++) { var u = i / 6; g.lineTo(kx + s[0] * u * w * 0.012 + u * w * 0.015, ky + u * h * 0.07 + Math.sin(t * 2.4 + s[1] - u * 4) * h * 0.008 * u); } g.stroke(); });
    // mấy giọt máu khô cạnh sọt
    g.fillStyle = dk ? '#4a1e1e' : '#7a2a28'; [[0.56, 0.93], [0.585, 0.95], [0.6, 0.925]].forEach(function (d) { g.beginPath(); g.ellipse(w * d[0], h * d[1], w * 0.005, h * 0.004, 0, 0, 7); g.fill(); });
    dust(g, w, h, t, R, hz, 14);
    vign(g, w, h, 0.45);
  };
  // Hòn đá cạnh đụn đá vụn: vệt máu quệt dài trên mặt đá, một tấm thẻ đang sáng dần thành cuộn băng trắng tháo dở một vòng;
  // một nhịp mạch đỏ mảnh chạy đều qua khung tranh như đường điện tim, đều như kim đồng hồ.
  ART.stonecut = function (g, w, h, t, R) {
    var dk = C.dark, hz = h * 0.4; mineLand(g, w, h, t, R, hz);
    rubble(g, w * 0.7, h * 0.84, w * 0.7, h * 0.5, dk ? '#2a2a26' : '#96928a');
    // hòn đá + vệt máu
    g.fillStyle = dk ? '#3a3a35' : '#aaa69c'; g.beginPath(); g.ellipse(w * 0.4, h * 0.78, w * 0.14, h * 0.07, -0.08, 0, 7); g.fill();
    g.fillStyle = rgba('#ffffff', dk ? 0.05 : 0.15); g.beginPath(); g.ellipse(w * 0.38, h * 0.755, w * 0.1, h * 0.03, -0.08, 0, 7); g.fill();
    g.strokeStyle = dk ? '#5a1f1f' : '#7a2a28'; g.lineWidth = Math.max(3, h * 0.014); g.lineCap = 'round';
    g.beginPath(); g.moveTo(w * 0.31, h * 0.76); g.quadraticCurveTo(w * 0.4, h * 0.735, w * 0.48, h * 0.755); g.stroke();
    g.fillStyle = dk ? '#5a1f1f' : '#7a2a28'; [[0.47, 0.82], [0.48, 0.86], [0.465, 0.9]].forEach(function (d, i) { g.beginPath(); g.ellipse(w * d[0], h * d[1], w * (0.006 - i * 0.001), h * 0.005, 0, 0, 7); g.fill(); });
    // cuộn băng trắng trên đất, một đoạn đã tháo ra
    var bx = w * 0.18, by = h * 0.9, cl = dk ? '#d8d4c8' : '#f6f3ea';
    g.fillStyle = cl; g.beginPath(); g.ellipse(bx, by, w * 0.035, h * 0.03, 0, 0, 7); g.fill();
    g.fillStyle = rgba('#000000', 0.15); g.beginPath(); g.ellipse(bx, by, w * 0.012, h * 0.01, 0, 0, 7); g.fill();
    g.strokeStyle = cl; g.lineWidth = Math.max(3, h * 0.02);
    g.beginPath(); g.moveTo(bx + w * 0.03, by); g.quadraticCurveTo(w * 0.27, h * 0.92, w * 0.3, h * 0.84); g.stroke();
    glow(g, bx, by, w * 0.08, '#cfe8ff', (dk ? 0.18 : 0.12) * (0.7 + 0.3 * Math.sin(t * 1.3)));
    // nhịp mạch đỏ mảnh chạy qua khung: đều, không nhanh lên
    var per = 1.15, ph = (t % per) / per, y0 = h * 0.22;
    g.strokeStyle = rgba(dk ? '#E2566C' : '#B3263A', dk ? 0.55 : 0.45); g.lineWidth = Math.max(1, w / 600); g.shadowColor = rgba('#E2566C', 0.6); g.shadowBlur = 5;
    g.beginPath();
    for (var x = 0; x <= w; x += 2) { var u = x / w, k = (u * 3 - ph + 3) % 1, y = y0; if (k > 0.42 && k < 0.5) y -= Math.sin((k - 0.42) / 0.08 * Math.PI) * h * 0.06; else if (k > 0.5 && k < 0.55) y += Math.sin((k - 0.5) / 0.05 * Math.PI) * h * 0.02; x ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.stroke(); g.shadowBlur = 0;
    dust(g, w, h, t, R, hz, 12);
    vign(g, w, h, 0.5);
  };
  // Sườn dốc vừa im: sọt đá, đòn gánh đặt xuống ngay ngắn bên đường, không ai gánh; bụi lắng dần;
  // một hàng vết giày đế khía đi đều ra lối mòn, mờ dần, lẫn vào những vết chân trần.
  ART.baskets = function (g, w, h, t, R) {
    var dk = C.dark, hz = h * 0.45; mineLand(g, w, h, t, R, hz);
    g.fillStyle = dk ? '#33332e' : '#a8a498'; g.beginPath(); g.moveTo(0, h * 0.5); g.quadraticCurveTo(w * 0.5, h * 0.3, w, h * 0.42); g.lineTo(w, h); g.lineTo(0, h); g.fill();
    g.fillStyle = rgba('#000000', dk ? 0.25 : 0.08); g.fillRect(0, 0, w, h); // trời như tối đi một chút
    // sọt và đòn gánh đặt xuống, thưa dần lên dốc
    for (var i = 0; i < 6; i++) {
      var u = i / 5, cx = w * (0.12 + u * 0.78), cy = h * (0.82 - u * 0.36), s = 1 - u * 0.6, cw = w * 0.045 * s, ch = h * 0.06 * s;
      g.fillStyle = dk ? '#3d3122' : '#8a7148';
      [-1, 1].forEach(function (d) { var x = cx + d * cw * 1.6; g.beginPath(); g.moveTo(x - cw, cy - ch); g.lineTo(x + cw, cy - ch); g.lineTo(x + cw * 0.8, cy); g.lineTo(x - cw * 0.8, cy); g.fill(); });
      g.strokeStyle = dk ? '#5a4632' : '#6e5236'; g.lineWidth = Math.max(1.5, w * 0.005 * s); g.lineCap = 'round';
      g.beginPath(); g.moveTo(cx - cw * 2.8, cy + h * 0.01 * s); g.lineTo(cx + cw * 2.8, cy + h * 0.006 * s); g.stroke();
    }
    // vết chân trần lốm đốm xuống dốc
    g.fillStyle = rgba('#000000', dk ? 0.22 : 0.1);
    for (var f = 0; f < 26; f++) { g.beginPath(); g.ellipse(R[f + 100] * w, h * (0.55 + R[f + 140] * 0.42), w * 0.006, h * 0.006, R[f] * 3, 0, 7); g.fill(); }
    // vết giày đế khía: đều nhau, cách nhau đúng một sải, đi ra phía phải và mờ dần (hiện từng vết theo nhịp)
    var shown = Math.floor((t * 0.9) % 14);
    for (var k = 0; k < 10; k++) {
      if (k > shown) break;
      var v = k / 9, fx = w * (0.16 + v * 0.7), fy = h * (0.93 - v * 0.2) + (k % 2 ? 1 : -1) * h * 0.012, sc = 1 - v * 0.5, a = (dk ? 0.5 : 0.3) * (1 - v * 0.75);
      g.save(); g.translate(fx, fy); g.rotate(-0.25); g.fillStyle = rgba('#000000', a); g.beginPath(); g.ellipse(0, 0, w * 0.016 * sc, h * 0.011 * sc, 0, 0, 7); g.fill();
      g.strokeStyle = rgba(dk ? '#6a6a60' : '#d8d3c4', a * 0.9); g.lineWidth = 1; for (var z = -2; z <= 2; z++) { g.beginPath(); g.moveTo(z * w * 0.005 * sc, -h * 0.008 * sc); g.lineTo(z * w * 0.005 * sc, h * 0.008 * sc); g.stroke(); }
      g.restore();
    }
    dust(g, w, h, t * 0.4, R, hz, 8);
    vign(g, w, h, 0.55);
  };
  // Sau cùng: hòn đá, đoạn băng trắng vắt qua rồi buông xuống đất, đầu băng lay trong gió; bụi xám cuốn ngang;
  // một nhịp mạch đỏ mảnh ở góc, mỗi lúc một thưa, một nhỏ.
  ART.tail = function (g, w, h, t, R) {
    var dk = C.dark, hz = h * 0.42; mineLand(g, w, h, t, R, hz);
    rubble(g, w * 0.66, h * 0.88, w * 0.8, h * 0.52, dk ? '#2a2a26' : '#96928a');
    g.fillStyle = dk ? '#3a3a35' : '#aaa69c'; g.beginPath(); g.ellipse(w * 0.36, h * 0.8, w * 0.11, h * 0.055, -0.1, 0, 7); g.fill();
    g.strokeStyle = dk ? '#4a1e1e' : '#7a2a28'; g.lineWidth = Math.max(2.5, h * 0.012); g.lineCap = 'round';
    g.beginPath(); g.moveTo(w * 0.3, h * 0.78); g.quadraticCurveTo(w * 0.36, h * 0.765, w * 0.42, h * 0.78); g.stroke();
    var bw = Math.max(3, h * 0.022); g.strokeStyle = dk ? '#d8d4c8' : '#f6f3ea'; g.lineWidth = bw;
    g.beginPath(); g.moveTo(w * 0.5, h * 0.92); g.quadraticCurveTo(w * 0.44, h * 0.76, w * 0.38, h * 0.78);
    for (var i = 1; i <= 14; i++) { var u = i / 14, x = w * (0.38 - u * 0.22), y = h * (0.78 + u * 0.1) + Math.sin(t * 2.6 - u * 6) * h * 0.03 * u + Math.sin(t * 6 - u * 9) * h * 0.006 * u; g.lineTo(x, y); }
    g.stroke();
    // nhịp mạch thưa dần (chu kỳ 16 giây: đập nhanh, nhỏ dần, lặng, rồi lại)
    var cyc = t % 16, y0 = h * 0.18, x0 = w * 0.62, x1 = w * 0.94;
    g.strokeStyle = rgba(dk ? '#E2566C' : '#B3263A', dk ? 0.5 : 0.4); g.lineWidth = Math.max(1, w / 650); g.beginPath();
    for (var x = x0; x <= x1; x += 2) { var uu = (x - x0) / (x1 - x0), tt = cyc - (1 - uu) * 2, y = y0; if (tt > 0 && tt < 12) { var per = 0.45, k = (tt % per) / per, amp = h * 0.05 * Math.max(0, 1 - tt / 12); if (k < 0.2) y -= Math.sin(k / 0.2 * Math.PI) * amp; } x === x0 ? g.moveTo(x, y) : g.lineTo(x, y); }
    g.stroke();
    dust(g, w, h, t, R, hz, 20);
    vign(g, w, h, 0.6);
  };

  /* ---------- tranh cho Góc nhìn khác, đợt 2 (25/11): ch11 Leon, ch08 Oscar, ch09 Ruby, ch03 Luke. Không vẽ người, chỉ dấu vết. ---------- */

  // ===== ch11 Leon "Cánh cổng không cong" =====
  // Cổng hầm giữa trưa, sợi xích quất vào chấn song theo chu kỳ: vệt xích thép lướt tới, bụi gỉ đỏ bung ra, cổng vẫn thẳng tắp.
  ART.gatelash = function (g, w, h, t, R) {
    var dk = C.dark; gate(g, w, h, t, R, false);
    var mx = w * 0.5, my = h * 0.78, mw = w * 0.44, mh = h * 0.6, per = 3.4, k = Math.floor(t / per), ph = (t % per) / per;
    var bi = Math.floor(R[(k * 7) % 200] * 7) + 1, bx = mx - mw / 2 + bi / 8 * mw, by = my - mh * (0.3 + R[(k * 11) % 200] * 0.3);
    // vệt xích: cung thép quét từ mép trái tới chấn song
    if (ph < 0.12) {
      var u = ph / 0.12, ex = w * 0.02 + (bx - w * 0.02) * u, ey = h * 0.95 + (by - h * 0.95) * u;
      g.strokeStyle = rgba(dk ? '#c8d0d2' : '#3a4244', 0.9); g.lineWidth = Math.max(2, w / 220); g.lineCap = 'round';
      g.beginPath(); g.moveTo(-w * 0.02, h * 1.02); g.quadraticCurveTo(w * 0.1, by - h * 0.2, ex, ey); g.stroke();
      g.strokeStyle = rgba(dk ? '#ffffff' : '#000000', 0.12); g.lineWidth = Math.max(6, w / 70); g.beginPath(); g.moveTo(-w * 0.02, h * 1.02); g.quadraticCurveTo(w * 0.1, by - h * 0.2, ex, ey); g.stroke();
    }
    // va: loé sáng nhỏ + bụi gỉ đỏ bung ra rồi rơi
    if (ph >= 0.1 && ph < 0.7) {
      var v = (ph - 0.1) / 0.6;
      if (v < 0.15) gGlow(g, bx, by, w * 0.06, dk ? '#ffffff' : '#fff6e0', 0.5 * (1 - v / 0.15));
      for (var i = 0; i < 26; i++) {
        var an = R[(i + k * 3) % 220] * 6.283, sp = (0.3 + R[(i * 5 + k) % 230]) * w * 0.12, px = bx + Math.cos(an) * sp * v, py = by + Math.sin(an) * sp * v * 0.7 + v * v * h * 0.18;
        g.fillStyle = rgba(i % 3 ? '#8a3a22' : '#c0603a', (dk ? 0.85 : 0.7) * (1 - v)); g.fillRect(px, py, 2.4, 2.4);
      }
      g.strokeStyle = rgba(dk ? '#f2ece0' : '#ffffff', 0.9 * (1 - v)); g.lineWidth = 1.4;
      g.beginPath(); g.moveTo(bx - w * 0.008, by + h * 0.01); g.lineTo(bx + w * 0.008, by - h * 0.012); g.stroke();
    }
    dust(g, w, h, t, R, h * 0.78, 10);
    vign(g, w, h, 0.45);
  };
  // Từ mỏm đá nhìn xuống sườn dốc lúc đợt nhiễm đi qua: sọt đá, đòn gánh bỏ lại, bụi đứng yên; tít dưới chân dốc một mẩu trắng lay trong gió.
  ART.ledge = function (g, w, h, t, R) {
    var dk = C.dark, hz = h * 0.16; mineLand(g, w, h, t, R, hz);
    var sg = g.createLinearGradient(0, hz, 0, h); sg.addColorStop(0, rgba('#000000', 0)); sg.addColorStop(1, rgba('#000000', dk ? 0.35 : 0.12)); g.fillStyle = sg; g.fillRect(0, hz, w, h - hz);
    // lối mòn ngoằn ngoèo xuống dốc
    g.strokeStyle = rgba(dk ? '#56564e' : '#d6d1c2', 0.9); g.lineWidth = Math.max(6, w * 0.02); g.lineCap = 'round'; g.beginPath(); g.moveTo(w * 0.2, h); g.bezierCurveTo(w * 0.5, h * 0.75, w * 0.3, h * 0.5, w * 0.62, h * 0.3); g.stroke();
    rubble(g, w * 0.8, h * 0.62, w * 0.3, h * 0.16, dk ? '#2e2e2a' : '#a19d92');
    rubble(g, w * 0.35, h * 0.4, w * 0.2, h * 0.08, dk ? '#32322d' : '#aaa69c');
    // sọt đá và đòn gánh đặt bừa
    [[0.42, 0.62, 0.2], [0.58, 0.48, -0.3], [0.7, 0.72, 0.5], [0.3, 0.3, 0.1]].forEach(function (b, i) {
      var x = w * b[0], y = h * b[1], s = w * (0.022 - i * 0.002);
      g.fillStyle = dk ? '#4a3e2c' : '#8a7452'; g.beginPath(); g.moveTo(x - s, y - s * 0.9); g.lineTo(x + s, y - s * 0.9); g.lineTo(x + s * 0.75, y); g.lineTo(x - s * 0.75, y); g.fill();
      g.strokeStyle = dk ? '#3a3022' : '#6e5a3e'; g.lineWidth = Math.max(1.5, w / 400); g.beginPath(); g.moveTo(x - s * 2.2, y + s * 0.3); g.lineTo(x + s * 2.4, y - s * 0.2 + b[2] * s); g.stroke();
    });
    // mẩu băng trắng dưới chân đụn đá
    var fx0 = w * 0.86, fy0 = h * 0.86; g.strokeStyle = dk ? '#cfcbc0' : '#f6f3ea'; g.lineWidth = Math.max(1.5, h * 0.008);
    g.beginPath(); g.moveTo(fx0, fy0); for (var q = 1; q <= 8; q++) { var u = q / 8; g.lineTo(fx0 - u * w * 0.05, fy0 + u * h * 0.02 + Math.sin(t * 2.4 - u * 5) * h * 0.01 * u); } g.stroke();
    // mỏm đá gần, tối, góc trái dưới (chỗ Leon ngồi)
    g.fillStyle = dk ? '#121210' : '#4a4740'; g.beginPath(); g.moveTo(0, h * 0.7); g.lineTo(w * 0.1, h * 0.78); g.lineTo(w * 0.2, h * 0.86); g.lineTo(w * 0.24, h); g.lineTo(0, h); g.fill();
    g.strokeStyle = rgba(dk ? '#2a2a26' : '#6a665c', 1); g.lineWidth = 1; g.beginPath(); g.moveTo(w * 0.02, h * 0.74); g.lineTo(w * 0.1, h * 0.8); g.lineTo(w * 0.16, h * 0.9); g.stroke();
    dust(g, w, h, t * 0.15, R, hz, 14);
    vign(g, w, h, 0.55);
  };
  // Cái ổ khoá cũ treo trên vòng xích gỉ, sát chấn song; một vệt nắng trắng lướt qua mặt sắt rồi đi, lặp lại thật chậm.
  ART.lockstare = function (g, w, h, t, R) {
    var dk = C.dark;
    g.fillStyle = dk ? '#0a0b0b' : '#1c1a17'; g.fillRect(0, 0, w, h); // bóng tối trong hầm phía sau chấn song
    var bar = dk ? '#5a3a2a' : '#7a4a30';
    for (var i = 0; i < 5; i++) { var x = w * (0.1 + i * 0.2); g.fillStyle = bar; g.fillRect(x - w * 0.02, 0, w * 0.04, h);
      g.fillStyle = rgba('#000000', 0.25); g.fillRect(x + w * 0.008, 0, w * 0.012, h);
      g.strokeStyle = rgba(dk ? '#d8d0c0' : '#f4efe2', 0.6); g.lineWidth = 1.2; for (var s = 0; s < 4; s++) { var sy = h * (0.2 + R[i * 4 + s] * 0.6); g.beginPath(); g.moveTo(x - w * 0.02, sy); g.lineTo(x + w * 0.02, sy - h * 0.03); g.stroke(); } }
    // vòng xích gỉ vắt ngang
    g.strokeStyle = dk ? '#6a3a26' : '#5a2e1c'; g.lineWidth = Math.max(3, w / 120);
    for (var k = 0; k < 9; k++) { var cx = w * (0.08 + k * 0.105), cy = h * 0.34 + Math.sin(k / 8 * Math.PI) * h * 0.1; g.beginPath(); if (k % 2) g.ellipse(cx, cy, w * 0.035, h * 0.03, 0.1, 0, 7); else g.ellipse(cx, cy, w * 0.035, h * 0.055, 0.1, 0, 7); g.stroke(); }
    // ổ khoá to, đen sì, khẽ đung đưa
    var sw = Math.sin(t * 0.7) * 0.04, lx = w * 0.5, ly = h * 0.44;
    g.save(); g.translate(lx, ly); g.rotate(sw);
    g.strokeStyle = dk ? '#2a2a28' : '#2a2824'; g.lineWidth = Math.max(5, w / 60); g.beginPath(); g.arc(0, h * 0.08, w * 0.07, Math.PI, 0); g.stroke();
    var bw = w * 0.2, bh = h * 0.3, by = h * 0.08; var lg = g.createLinearGradient(-bw / 2, 0, bw / 2, 0); lg.addColorStop(0, dk ? '#141413' : '#1c1b19'); lg.addColorStop(0.5, dk ? '#2a2a27' : '#34322e'); lg.addColorStop(1, dk ? '#101010' : '#141312');
    g.fillStyle = lg; g.beginPath(); g.moveTo(-bw / 2, by); g.lineTo(bw / 2, by); g.lineTo(bw / 2, by + bh * 0.8); g.quadraticCurveTo(0, by + bh * 1.1, -bw / 2, by + bh * 0.8); g.fill();
    g.fillStyle = '#000000'; g.beginPath(); g.arc(0, by + bh * 0.4, w * 0.014, 0, 7); g.fill(); g.fillRect(-w * 0.005, by + bh * 0.4, w * 0.01, bh * 0.22);
    // vệt nắng trắng lướt qua (chu kỳ 9 giây)
    var c9 = (t % 9) / 9; if (c9 < 0.35) { var u = c9 / 0.35, gx = -bw * 0.8 + u * bw * 1.6, sh = g.createLinearGradient(gx - bw * 0.15, 0, gx + bw * 0.15, 0); sh.addColorStop(0, 'rgba(255,255,255,0)'); sh.addColorStop(0.5, rgba('#ffffff', dk ? 0.35 : 0.45)); sh.addColorStop(1, 'rgba(255,255,255,0)');
      g.save(); g.beginPath(); g.moveTo(-bw / 2, by); g.lineTo(bw / 2, by); g.lineTo(bw / 2, by + bh * 0.8); g.quadraticCurveTo(0, by + bh * 1.1, -bw / 2, by + bh * 0.8); g.clip(); g.fillStyle = sh; g.fillRect(-bw, by, bw * 2, bh); g.restore(); }
    g.restore();
    gGlow(g, w * 0.9, h * 0.1, w * 0.3, dk ? '#a9b8bc' : '#ffffff', dk ? 0.08 : 0.15); // nắng ngoài cổng
    vign(g, w, h, 0.5);
  };

  // ===== ch08 Oscar "Gần sông" =====
  function riverBank(g, w, h, t, R, tod, wl) {
    sky(g, w, h, tod, 0.6);
    hills(g, w, h, wl, h * 0.06, rgba(sil(tod), 0.55), 3);
    var wg = g.createLinearGradient(0, wl, 0, h); wg.addColorStop(0, C.dark ? '#22343a' : '#b9cac6'); wg.addColorStop(1, C.dark ? '#0a1316' : '#8ea29d'); g.fillStyle = wg; g.fillRect(0, wl, w, h - wl);
    g.strokeStyle = rgba(C.dark ? '#a9c0bc' : '#ffffff', 0.22); g.lineWidth = 1;
    for (var r = 0; r < 10; r++) { var y = wl + (h - wl) * (r + 1) / 11 * 0.7, off = ((t * (6 + r * 2) + R[r] * w) % (w * 1.3)) - w * 0.15; g.beginPath(); g.moveTo(off, y); g.lineTo(off + w * (0.04 + R[r + 30] * 0.08), y); g.stroke(); }
  }
  // Trời vừa hửng: con sông đen thẫm, cái chòi lá lụp xụp sát mép nước, cây cầu gỗ ngắn chìa ra; trên bờ, tảng đá lùi hẳn vào trong, cây cần câu dựng cạnh.
  ART.riverdawn = function (g, w, h, t, R) {
    var dk = C.dark, wl = h * 0.5; riverBank(g, w, h, t, R, 'dawn', wl);
    // bờ đất gần (dưới)
    g.fillStyle = dk ? '#1e1c17' : '#7a6e58'; g.beginPath(); g.moveTo(0, h * 0.78); g.quadraticCurveTo(w * 0.5, h * 0.72, w, h * 0.8); g.lineTo(w, h); g.lineTo(0, h); g.fill();
    // chòi trên cọc, bên phải
    var col = sil('dawn'), x = w * 0.62, b = wl + h * 0.02;
    g.fillStyle = col; for (var p = 0; p < 4; p++) g.fillRect(x + p * w * 0.06, b, w * 0.007, h * 0.12);
    g.fillRect(x - w * 0.01, b - h * 0.02, w * 0.22, h * 0.022); g.fillRect(x, b - h * 0.14, w * 0.19, h * 0.12);
    g.beginPath(); g.moveTo(x - w * 0.035, b - h * 0.13); g.lineTo(x + w * 0.08, b - h * 0.27); g.lineTo(x + w * 0.24, b - h * 0.12); g.fill();
    // cầu gỗ ngắn chìa ra mặt nước
    g.fillStyle = dk ? '#2a2318' : '#5e4e36'; g.beginPath(); g.moveTo(x - w * 0.02, b + h * 0.01); g.lineTo(x - w * 0.2, b + h * 0.06); g.lineTo(x - w * 0.2, b + h * 0.075); g.lineTo(x - w * 0.02, b + h * 0.03); g.fill();
    for (var c = 0; c < 4; c++) g.fillRect(x - w * (0.05 + c * 0.05), b + h * (0.02 + c * 0.012), w * 0.005, h * 0.06);
    // vòng nước lớn ngoài đầu cầu (cá to đớp mồi), thỉnh thoảng
    var cy = (t % 7) / 7; if (cy < 0.5) { var u = cy / 0.5; g.strokeStyle = rgba(dk ? '#9fbcbc' : '#ffffff', 0.5 * (1 - u)); g.lineWidth = 1.2; g.beginPath(); g.ellipse(x - w * 0.26, b + h * 0.1, w * 0.05 * u + 2, h * 0.012 * u + 1, 0, 0, 7); g.stroke(); }
    // tảng đá trên bờ, lùi vào trong; cây cần câu dựng nghiêng
    g.fillStyle = dk ? '#34322c' : '#9a948a'; g.beginPath(); g.ellipse(w * 0.24, h * 0.86, w * 0.08, h * 0.045, 0, Math.PI, 0); g.fill(); g.fillRect(w * 0.16, h * 0.86, w * 0.16, h * 0.02);
    g.strokeStyle = dk ? '#5a4a30' : '#4a3a24'; g.lineWidth = Math.max(1.5, w / 400); g.beginPath(); g.moveTo(w * 0.34, h * 0.9); g.lineTo(w * 0.42, h * 0.5); g.stroke();
    g.strokeStyle = rgba(dk ? '#c8d0d0' : '#ffffff', 0.4); g.lineWidth = 0.8; g.beginPath(); g.moveTo(w * 0.42, h * 0.5); g.quadraticCurveTo(w * 0.46, h * 0.62, w * 0.45, h * 0.76); g.stroke();
    // ba bước chân từ đá tới mép nước: ba chấm mờ trên bờ
    fog(g, w, h, t, wl, 0.32, R);
    vign(g, w, h, 0.5);
  };
  // Cái thùng gỗ nhỏ đựng nước cạnh tảng đá: mặt nước gợn từng vòng theo nhịp thở. o: '' (sáng, giỏ hai con cá) | 'still' (phẳng lặng) | 'left' (bị để quên trên bờ, chiều)
  ART.bucket = function (g, w, h, t, R, o) {
    var dk = C.dark, mode = (o && o[0]) || '', wl = h * 0.3; riverBank(g, w, h, t, R, 'day', wl);
    g.fillStyle = dk ? '#1c1a15' : '#8a7c62'; g.beginPath(); g.moveTo(0, h * 0.55); g.quadraticCurveTo(w * 0.5, h * 0.5, w, h * 0.58); g.lineTo(w, h); g.lineTo(0, h); g.fill();
    if (mode !== 'left') { g.fillStyle = dk ? '#34322c' : '#9a948a'; g.beginPath(); g.ellipse(w * 0.2, h * 0.78, w * 0.16, h * 0.09, 0, Math.PI, 0); g.fill(); g.fillRect(w * 0.04, h * 0.78, w * 0.32, h * 0.05); }
    // thùng gỗ
    var cx = w * 0.55, top = h * 0.6, rx = w * 0.12, ry = h * 0.05, ht = h * 0.24;
    g.fillStyle = dk ? '#3a2c1c' : '#7a5a38'; g.beginPath(); g.moveTo(cx - rx, top); g.lineTo(cx - rx * 0.88, top + ht); g.ellipse(cx, top + ht, rx * 0.88, ry * 0.8, 0, Math.PI, 0, true); g.lineTo(cx + rx, top); g.fill();
    g.strokeStyle = rgba('#000000', 0.3); g.lineWidth = 1; for (var s = 1; s < 6; s++) { var u = s / 6; g.beginPath(); g.moveTo(cx - rx + u * rx * 2, top + ry * Math.sin(u * Math.PI) * 0.9); g.lineTo(cx - rx * 0.88 + u * rx * 1.76, top + ht + ry * 0.8 * Math.sin(u * Math.PI)); g.stroke(); }
    g.strokeStyle = dk ? '#1c1a18' : '#3a3530'; g.lineWidth = Math.max(2, h * 0.012); [0.25, 0.75].forEach(function (u) { g.beginPath(); g.ellipse(cx, top + ht * u, rx * (1 - 0.12 * u), ry * (1 - 0.2 * u), 0, 0, Math.PI); g.stroke(); });
    // mặt nước + vòng gợn theo nhịp thở (thở ~4 giây một nhịp)
    var wg = g.createRadialGradient(cx, top, 0, cx, top, rx); wg.addColorStop(0, dk ? '#2c4a50' : '#9fbcbc'); wg.addColorStop(1, dk ? '#122026' : '#6f8e8c');
    g.fillStyle = wg; g.beginPath(); g.ellipse(cx, top, rx * 0.94, ry * 0.85, 0, 0, 7); g.fill();
    g.save(); g.beginPath(); g.ellipse(cx, top, rx * 0.94, ry * 0.85, 0, 0, 7); g.clip();
    var amp = mode === 'still' ? 0.12 : mode === 'left' ? 0.55 : 1, per = 4;
    for (var k = 0; k < 4; k++) { var u2 = ((t / per + k / 4) % 1); g.strokeStyle = rgba(dk ? '#b8d4d4' : '#ffffff', 0.55 * (1 - u2) * amp); g.lineWidth = 1.2; g.beginPath(); g.ellipse(cx, top, rx * 0.9 * u2 + 1, ry * 0.8 * u2 + 0.5, 0, 0, 7); g.stroke(); }
    gGlow(g, cx - rx * 0.3, top - ry * 0.2, rx * 0.5, '#ffffff', dk ? 0.08 : 0.2);
    g.restore();
    g.strokeStyle = dk ? '#4a3a26' : '#5a4428'; g.lineWidth = Math.max(2, h * 0.01); g.beginPath(); g.ellipse(cx, top, rx, ry, 0, 0, 7); g.stroke();
    // giỏ tre hai con cá diếc
    if (!mode) { var gx = w * 0.82, gy = h * 0.8; g.fillStyle = dk ? '#4a4030' : '#a08a5e'; g.beginPath(); g.ellipse(gx, gy, w * 0.07, h * 0.04, 0, 0, 7); g.fill();
      g.fillStyle = dk ? '#8a9a9a' : '#d8dede'; [[-0.02, -0.01, 0.3], [0.015, 0.005, -0.2]].forEach(function (f) { g.save(); g.translate(gx + w * f[0], gy + h * f[1]); g.rotate(f[2]); g.beginPath(); g.ellipse(0, 0, w * 0.025, h * 0.012, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(w * 0.024, 0); g.lineTo(w * 0.036, -h * 0.01); g.lineTo(w * 0.036, h * 0.01); g.fill(); g.restore(); }); }
    if (mode === 'left') gGlow(g, cx, top, rx * 1.6, dk ? '#7fb0c4' : '#ffffff', 0.06 + 0.04 * Math.sin(t * 1.57));
    vign(g, w, h, 0.5);
  };
  // Ký ức mười hai năm trước: biển xám, bãi cát, mũi ghe vừa cập, những vệt chân chạy ra đón; sóng lừng.
  ART.greysea = function (g, w, h, t, R) {
    var dk = C.dark, hz = h * 0.42;
    var sg = g.createLinearGradient(0, 0, 0, hz); sg.addColorStop(0, dk ? '#1a1f22' : '#aeb4b6'); sg.addColorStop(1, dk ? '#33393b' : '#cfd3d2'); g.fillStyle = sg; g.fillRect(0, 0, w, hz);
    var se = g.createLinearGradient(0, hz, 0, h * 0.75); se.addColorStop(0, dk ? '#2a3133' : '#9aa2a2'); se.addColorStop(1, dk ? '#1c2224' : '#848d8d'); g.fillStyle = se; g.fillRect(0, hz, w, h * 0.75 - hz);
    for (var r = 0; r < 7; r++) { var y = hz + (h * 0.33) * (r / 7), sw = Math.sin(t * 0.5 + r) * h * 0.008; g.strokeStyle = rgba(dk ? '#6a7476' : '#e8ecec', 0.25 + r * 0.04); g.lineWidth = 1 + r * 0.2; g.beginPath();
      for (var x = 0; x <= w; x += w / 30) { var yy = y + sw + Math.sin(x / w * (6 + r) + t * (0.6 + r * 0.1)) * h * 0.006 * (r + 1); x ? g.lineTo(x, yy) : g.moveTo(x, yy); } g.stroke(); }
    // sóng lừng (con sóng lớn dâng lên rồi hạ, chu kỳ 8 giây)
    var c8 = (t % 8) / 8, sh = Math.sin(c8 * Math.PI) * h * 0.06; g.fillStyle = rgba(dk ? '#3a4446' : '#8d9696', 0.85); g.beginPath(); g.moveTo(0, hz + h * 0.12);
    for (var x2 = 0; x2 <= w; x2 += w / 40) g.lineTo(x2, hz + h * 0.12 - sh * Math.exp(-Math.pow((x2 / w - 0.62) * 4, 2))); g.lineTo(w, hz + h * 0.2); g.lineTo(0, hz + h * 0.2); g.fill();
    // bãi cát
    var bg = g.createLinearGradient(0, h * 0.72, 0, h); bg.addColorStop(0, dk ? '#3a3730' : '#c9c0aa'); bg.addColorStop(1, dk ? '#24221d' : '#ab9f86'); g.fillStyle = bg; g.beginPath(); g.moveTo(0, h * 0.75); g.quadraticCurveTo(w * 0.5, h * 0.7, w, h * 0.76); g.lineTo(w, h); g.lineTo(0, h); g.fill();
    // bọt sóng liếm bờ
    var fu = 0.5 + 0.5 * Math.sin(t * 0.8); g.strokeStyle = rgba(dk ? '#9aa4a4' : '#ffffff', 0.5); g.lineWidth = 1.5; g.beginPath(); for (var x3 = 0; x3 <= w; x3 += w / 30) { var y3 = h * (0.735 + 0.012 * fu) + Math.sin(x3 / w * 14 + t) * h * 0.004; x3 ? g.lineTo(x3, y3) : g.moveTo(x3, y3); } g.stroke();
    // mũi ghe cập bờ
    g.fillStyle = dk ? '#2a221a' : '#5a4632'; g.beginPath(); g.moveTo(w * 0.18, h * 0.8); g.lineTo(w * 0.46, h * 0.78); g.quadraticCurveTo(w * 0.52, h * 0.74, w * 0.5, h * 0.7); g.lineTo(w * 0.22, h * 0.74); g.fill();
    g.strokeStyle = dk ? '#6a2a26' : '#8a3a30'; g.lineWidth = 2; g.beginPath(); g.moveTo(w * 0.24, h * 0.755); g.lineTo(w * 0.48, h * 0.72); g.stroke();
    // vệt chân chạy ra từ phía trên bãi
    for (var f = 0; f < 18; f++) { var fx = w * (0.6 + (f % 3) * 0.08 + R[f] * 0.03), fy = h * (0.98 - f / 18 * 0.2); g.fillStyle = rgba('#000000', dk ? 0.4 : 0.2); g.beginPath(); g.ellipse(fx + (f % 2) * w * 0.012, fy, w * 0.006, h * 0.008, 0.3, 0, 7); g.fill(); }
    // mưa bụi nước
    g.strokeStyle = rgba(dk ? '#8a9496' : '#ffffff', 0.18); g.lineWidth = 1; for (var d = 0; d < 40; d++) { var dx = (R[d + 60] * w + t * 40) % w, dy = (R[d + 100] * h + t * 140) % h; g.beginPath(); g.moveTo(dx, dy); g.lineTo(dx - 3, dy + 9); g.stroke(); }
    vign(g, w, h, 0.6);
  };
  // Sát mép nước: những gợn dài chạy về một chỗ, lưng cá bạc lấp loáng quẫy bọt trắng; giữa chỗ ấy một vòng nước lõm như có bàn tay áp xuống.
  ART.fishrush = function (g, w, h, t, R) {
    var dk = C.dark, cx = w * 0.5, cy = h * 0.72;
    var wg = g.createLinearGradient(0, 0, 0, h); wg.addColorStop(0, dk ? '#0c171a' : '#7f9894'); wg.addColorStop(1, dk ? '#1c3036' : '#b2c6c2'); g.fillStyle = wg; g.fillRect(0, 0, w, h);
    // gợn dài chạy vào
    for (var k = 0; k < 9; k++) { var u = 1 - ((t * 0.25 + k / 9) % 1), rx = w * 0.9 * u + 4, ry = h * 0.55 * u + 2; g.strokeStyle = rgba(dk ? '#8fb8bc' : '#ffffff', 0.45 * (1 - u) + 0.05); g.lineWidth = 1 + (1 - u) * 1.5; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, Math.PI * 1.05, Math.PI * 1.95); g.stroke(); }
    // lưng cá bạc quẫy
    for (var f = 0; f < 14; f++) { var a0 = R[f] * Math.PI + Math.PI, rr = (0.12 + R[f + 20] * 0.3), ph = (t * (0.8 + R[f + 40]) + R[f + 60] * 6) % 1.6;
      if (ph > 1) continue; var x = cx + Math.cos(a0) * w * rr, y = cy + Math.sin(a0) * h * rr * 0.8, s = w * (0.018 + R[f + 80] * 0.01), up = Math.sin(ph * Math.PI);
      g.save(); g.translate(x, y); g.rotate(R[f + 100] * 6); g.fillStyle = rgba(dk ? '#cfdcdc' : '#f4f8f8', 0.85 * up); g.beginPath(); g.ellipse(0, 0, s, s * 0.32 * up + 0.5, 0, Math.PI, 0); g.fill(); g.restore();
      if (up > 0.7) { g.fillStyle = rgba('#ffffff', 0.5 * up); for (var b = 0; b < 4; b++) g.fillRect(x + (R[(f * 4 + b) % 230] - 0.5) * s * 3, y - up * s * 0.8 * R[(f + b) % 200], 2, 2); } }
    // vòng lõm chỗ bàn tay
    var p = 0.5 + 0.5 * Math.sin(t * 2); gGlow(g, cx, cy, w * 0.12, dk ? '#6fa6b8' : '#ffffff', 0.18 + 0.08 * p);
    g.strokeStyle = rgba(dk ? '#d8e8ea' : '#ffffff', 0.6); g.lineWidth = 1.5; g.beginPath(); g.ellipse(cx, cy, w * 0.06, h * 0.025, 0, 0, 7); g.stroke();
    // bờ bùn gần
    g.fillStyle = dk ? '#1a1712' : '#6e624c'; g.beginPath(); g.moveTo(0, h * 0.9); g.quadraticCurveTo(w * 0.5, h * 0.84, w, h * 0.92); g.lineTo(w, h); g.lineTo(0, h); g.fill();
    vign(g, w, h, 0.5);
  };

  // ===== ch09 Ruby "Một bước" =====
  function pawPrint(g, x, y, s, rot, a, col) { g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = rgba(col, a); g.beginPath(); g.ellipse(0, s * 0.35, s * 0.42, s * 0.34, 0, 0, 7); g.fill();
    [[-0.42, -0.2], [-0.15, -0.45], [0.15, -0.45], [0.42, -0.2]].forEach(function (q) { g.beginPath(); g.ellipse(q[0] * s, q[1] * s, s * 0.14, s * 0.18, 0, 0, 7); g.fill(); }); g.restore(); }
  // Đêm ở khu giữa: mái hiên một ngôi nhà, gầm hiên tối đặc; trong bóng tối hai đốm mắt nhỏ chớp; dấu chân mèo bước ra khỏi bóng, một tấm thẻ úp nằm lại trên bậc.
  ART.eaves = function (g, w, h, t, R) {
    var dk = C.dark; sky(g, w, h, 'night', 0.5); moon(g, w * 0.82, h * 0.14, h * 0.03, t);
    var col = sil('night');
    // nhà: tường + mái hiên chìa ra
    g.fillStyle = dk ? '#121a1d' : '#5e6a66'; g.fillRect(w * 0.1, h * 0.28, w * 0.62, h * 0.5);
    g.fillStyle = col; g.beginPath(); g.moveTo(w * 0.02, h * 0.36); g.lineTo(w * 0.4, h * 0.12); g.lineTo(w * 0.8, h * 0.36); g.lineTo(w * 0.8, h * 0.4); g.lineTo(w * 0.02, h * 0.4); g.fill();
    g.fillStyle = dk ? '#060909' : '#2a302e'; g.fillRect(w * 0.12, h * 0.4, w * 0.58, h * 0.36); // gầm hiên tối
    g.fillStyle = dk ? '#1e1a14' : '#6e5e46'; [0.14, 0.42, 0.68].forEach(function (x) { g.fillRect(w * x, h * 0.4, w * 0.014, h * 0.38); });
    // bậc thềm + sân
    g.fillStyle = dk ? '#2a2620' : '#9a8e76'; g.fillRect(w * 0.08, h * 0.76, w * 0.66, h * 0.04); g.fillStyle = dk ? '#1a1814' : '#7e735e'; g.fillRect(0, h * 0.8, w, h * 0.2);
    // hai đốm mắt trong bóng tối, chớp
    var bl = (t % 5.2) / 5.2, open = bl > 0.06 ? 1 : 0.1, ex = w * 0.3, ey = h * 0.66;
    [0, 1].forEach(function (i) { var x = ex + i * w * 0.022; gGlow(g, x, ey, w * 0.02, '#c3a8ec', 0.35 * open); g.fillStyle = rgba(dk ? '#e2d4ff' : '#f2ecff', 0.95); g.beginPath(); g.ellipse(x, ey, w * 0.006, h * 0.008 * open, 0, 0, 7); g.fill(); });
    // dấu chân mèo bước ra khỏi bóng, về phía phải
    for (var k = 0; k < 7; k++) { var u = k / 6, a = Math.max(0, Math.min(1, ((t * 0.5) % 4) - u * 2.4)) * (dk ? 0.5 : 0.35); pawPrint(g, w * (0.36 + u * 0.48), h * (0.86 + (k % 2) * 0.03), w * 0.018, 1.4, a, dk ? '#c3a8ec' : '#4a3a6a'); }
    // tấm thẻ úp trên bậc (mặt lưng vòng tròn)
    var cxx = w * 0.56, cyy = h * 0.775; g.save(); g.translate(cxx, cyy); g.rotate(-0.15); g.fillStyle = dk ? '#14202b' : '#203040'; g.fillRect(-w * 0.025, -h * 0.025, w * 0.05, h * 0.05);
    g.strokeStyle = rgba('#9fb6c4', 0.8); g.lineWidth = 1; g.beginPath(); g.arc(0, 0, h * 0.015, 0, 7); g.stroke(); g.restore();
    vign(g, w, h, 0.6);
  };
  // Sau bức tường rào: vách một căn nhà, con đường lát đá ong chạy về phía chợ; dấu chân mèo đi trước, nhỏ dần; mái chợ mờ xa.
  ART.alleycard = function (g, w, h, t, R) {
    var dk = C.dark; sky(g, w, h, 'day', 0.6);
    // mái chợ xa
    g.fillStyle = rgba(sil('day'), 0.55); for (var m = 0; m < 4; m++) { var x = w * (0.55 + m * 0.1); g.beginPath(); g.moveTo(x, h * 0.42); g.lineTo(x + w * 0.05, h * 0.34); g.lineTo(x + w * 0.1, h * 0.42); g.fill(); }
    // đường đá ong phối cảnh
    g.fillStyle = dk ? '#3a2a22' : '#a8735a'; g.beginPath(); g.moveTo(w * 0.1, h); g.lineTo(w * 0.62, h * 0.43); g.lineTo(w * 0.72, h * 0.43); g.lineTo(w * 0.98, h); g.fill();
    g.strokeStyle = rgba('#000000', dk ? 0.35 : 0.15); g.lineWidth = 1;
    for (var r = 1; r < 10; r++) { var u = Math.pow(r / 10, 1.8), y = h * 0.43 + (h * 0.57) * u, xl = w * 0.62 - (w * 0.52) * u, xr = w * 0.72 + (w * 0.26) * u; g.beginPath(); g.moveTo(xl, y); g.lineTo(xr, y); g.stroke(); }
    // vách nhà bên trái (gần)
    g.fillStyle = dk ? '#1c1a16' : '#8a7c64'; g.beginPath(); g.moveTo(0, 0); g.lineTo(w * 0.3, h * 0.2); g.lineTo(w * 0.3, h * 0.66); g.lineTo(0, h); g.fill();
    g.strokeStyle = rgba('#000000', 0.25); for (var b = 0; b < 8; b++) { g.beginPath(); g.moveTo(0, h * (0.1 + b * 0.11)); g.lineTo(w * 0.3, h * (0.24 + b * 0.055)); g.stroke(); }
    // tường rào cuối (phải)
    g.fillStyle = dk ? '#232019' : '#9c8e74'; g.fillRect(w * 0.8, h * 0.36, w * 0.2, h * 0.24);
    // dấu chân mèo dẫn về chợ
    for (var k = 0; k < 10; k++) { var u2 = k / 9, yy = h * (0.95 - u2 * 0.5), xx = w * (0.52 + u2 * 0.14) + (k % 2 ? 1 : -1) * w * 0.012 * (1 - u2), s = w * 0.014 * (1 - u2 * 0.7);
      var a = Math.max(0, Math.min(1, ((t * 0.6) % 5) - u2 * 3)) * (dk ? 0.55 : 0.4); pawPrint(g, xx, yy, s, -0.4, a, dk ? '#c3a8ec' : '#4a3a6a'); }
    // nắng qua mép mái
    var sg = g.createLinearGradient(w * 0.3, 0, w, h); sg.addColorStop(0, rgba('#ffffff', dk ? 0.04 : 0.15)); sg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = sg; g.fillRect(0, 0, w, h);
    vign(g, w, h, 0.5);
  };

  // ===== ch03 Luke "Anh sẽ đợi" =====
  // Mặt bàn, cái điện thoại nằm ngửa, màn hình sáng khung chat: một dòng gõ dần rồi bị xoá, gõ lại, lại xoá. o: 'day' | 'dusk' (úp xuống bàn, phòng tối dần, ánh màn hình lọt ra mép)
  ART.phone = function (g, w, h, t, R, o) {
    var dk = C.dark, dusk = o && o[0] === 'dusk';
    var bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, dusk ? (dk ? '#0c1216' : '#5a666c') : (dk ? '#1a2328' : '#c9d1cf')); bg.addColorStop(1, dusk ? (dk ? '#06090b' : '#3c4448') : (dk ? '#0e1417' : '#a9b2b0')); g.fillStyle = bg; g.fillRect(0, 0, w, h);
    // mặt bàn gỗ
    g.fillStyle = dk ? (dusk ? '#14110d' : '#221c15') : (dusk ? '#4a3c2c' : '#8a7458'); g.beginPath(); g.moveTo(0, h * 0.42); g.lineTo(w, h * 0.38); g.lineTo(w, h); g.lineTo(0, h); g.fill();
    g.strokeStyle = rgba('#000000', 0.2); g.lineWidth = 1; for (var r = 0; r < 6; r++) { g.beginPath(); g.moveTo(0, h * (0.5 + r * 0.09)); g.lineTo(w, h * (0.46 + r * 0.095)); g.stroke(); }
    // cửa sổ phía sau
    g.fillStyle = dusk ? (dk ? '#1a2a38' : '#7c8c9c') : (dk ? '#3a4a52' : '#e6ecea'); g.fillRect(w * 0.62, h * 0.04, w * 0.3, h * 0.28);
    g.strokeStyle = dk ? '#0a0e10' : '#5a6462'; g.lineWidth = 3; g.strokeRect(w * 0.62, h * 0.04, w * 0.3, h * 0.28); g.beginPath(); g.moveTo(w * 0.77, h * 0.04); g.lineTo(w * 0.77, h * 0.32); g.stroke();
    if (dusk) for (var l = 0; l < 6; l++) { var on = Math.sin(t * 0.3 + l * 2.1) > -0.6; if (on) { g.fillStyle = rgba('#cfe4ee', 0.5); g.fillRect(w * (0.64 + R[l] * 0.26), h * (0.2 + R[l + 9] * 0.1), 3, 3); } }
    var px = w * 0.42, py = h * 0.68, pw = w * 0.17, ph = h * 0.34;
    g.save(); g.translate(px, py); g.rotate(-0.12);
    g.fillStyle = rgba('#000000', 0.35); g.fillRect(-pw / 2 + 6, -ph / 2 + 8, pw, ph);
    if (dusk) {
      g.fillStyle = dk ? '#0a0c0e' : '#1a1c1e'; g.fillRect(-pw / 2, -ph / 2, pw, ph);
      var gl = 0.25 + 0.1 * Math.sin(t * 0.8); g.shadowColor = rgba('#8FD3E0', gl); g.shadowBlur = 18; g.strokeStyle = rgba('#8FD3E0', gl * 0.6); g.lineWidth = 1; g.strokeRect(-pw / 2, -ph / 2, pw, ph); g.shadowBlur = 0;
      g.strokeStyle = rgba('#9fb6c4', 0.35); g.beginPath(); g.arc(0, -ph * 0.1, pw * 0.18, 0, 7); g.stroke();
    } else {
      g.fillStyle = '#0a0c0e'; g.fillRect(-pw / 2, -ph / 2, pw, ph);
      var sc = g.createLinearGradient(0, -ph / 2, 0, ph / 2); sc.addColorStop(0, '#16242c'); sc.addColorStop(1, '#0c151a'); g.fillStyle = sc; g.fillRect(-pw / 2 + 3, -ph / 2 + 6, pw - 6, ph - 12);
      // bong bóng chat: anh (phải, xanh), em (trái, xám)
      g.fillStyle = '#2f6f80'; g.fillRect(pw * 0.02, -ph * 0.38, pw * 0.4, ph * 0.06);
      g.fillStyle = '#3a4448'; g.fillRect(-pw * 0.42, -ph * 0.28, pw * 0.36, ph * 0.06);
      // ô gõ: dòng chữ dài dần rồi bị xoá (chu kỳ 6 giây), con trỏ nhấp nháy
      var c6 = (t % 6) / 6, len = c6 < 0.5 ? c6 / 0.5 : c6 < 0.62 ? 1 : Math.max(0, 1 - (c6 - 0.62) / 0.3);
      g.fillStyle = '#1e2a30'; g.fillRect(-pw * 0.44, ph * 0.3, pw * 0.88, ph * 0.1);
      g.fillStyle = '#8FD3E0'; for (var c = 0; c < Math.floor(len * 9); c++) g.fillRect(-pw * 0.4 + c * pw * 0.075, ph * 0.335, pw * 0.055, ph * 0.03);
      if (Math.sin(t * 6) > 0) g.fillRect(-pw * 0.4 + Math.floor(len * 9) * pw * 0.075, ph * 0.32, 1.5, ph * 0.06);
      gGlow(g, 0, 0, pw, '#8FD3E0', 0.1);
    }
    g.restore();
    vign(g, w, h, dusk ? 0.7 : 0.5);
  };
  // Đêm không ngủ: căn phòng tối, khung cửa sổ, vài ô đèn xa; một sợi chỉ đỏ mảnh căng từ mép giường ra ngoài cửa sổ, về một chỗ không nhìn thấy, rung khẽ.
  ART.nightthread = function (g, w, h, t, R) {
    var dk = C.dark; g.fillStyle = dk ? '#05080a' : '#2a3236'; g.fillRect(0, 0, w, h);
    var wx = w * 0.55, wy = h * 0.12, ww = w * 0.34, wh = h * 0.46;
    var sk = g.createLinearGradient(0, wy, 0, wy + wh); sk.addColorStop(0, dk ? '#0a1620' : '#4a5a66'); sk.addColorStop(1, dk ? '#14222c' : '#66767e'); g.fillStyle = sk; g.fillRect(wx, wy, ww, wh);
    for (var s = 0; s < 14; s++) { var a = 0.3 + 0.3 * Math.sin(t * 0.6 + s * 1.9); g.fillStyle = rgba('#cfe4ee', a * (dk ? 0.6 : 0.4)); g.fillRect(wx + R[s] * ww, wy + wh * (0.55 + R[s + 20] * 0.4), 2.5, 2.5); }
    g.fillStyle = rgba(sil('night'), 0.9); for (var b = 0; b < 6; b++) { var bx = wx + b * ww / 6, bh = wh * (0.2 + R[b + 40] * 0.25); g.fillRect(bx, wy + wh - bh, ww / 6 - 2, bh); }
    g.strokeStyle = dk ? '#0e1316' : '#1a1f22'; g.lineWidth = 5; g.strokeRect(wx, wy, ww, wh); g.beginPath(); g.moveTo(wx + ww / 2, wy); g.lineTo(wx + ww / 2, wy + wh); g.stroke();
    // ánh trăng loang trên sàn
    g.fillStyle = rgba('#9fb6c4', dk ? 0.05 : 0.08); g.beginPath(); g.moveTo(wx, wy + wh); g.lineTo(wx + ww, wy + wh); g.lineTo(wx + ww * 0.6, h); g.lineTo(wx - ww * 0.5, h); g.fill();
    // mép giường, gối, chăn
    g.fillStyle = dk ? '#0e1418' : '#3e484e'; g.beginPath(); g.moveTo(0, h * 0.66); g.lineTo(w * 0.42, h * 0.7); g.lineTo(w * 0.46, h); g.lineTo(0, h); g.fill();
    g.fillStyle = dk ? '#18222a' : '#56626a'; g.beginPath(); g.ellipse(w * 0.1, h * 0.68, w * 0.09, h * 0.035, -0.05, 0, 7); g.fill();
    // sợi chỉ đỏ: từ mép giường ra cửa sổ, căng, rung (càng về khuya càng căng: biên độ nhỏ mà nhanh)
    var ax = w * 0.22, ay = h * 0.74, bx2 = wx + ww * 0.8, by2 = wy + wh * 0.35, amp = h * 0.006;
    g.strokeStyle = dk ? '#E2566C' : '#c23a4e'; g.lineWidth = Math.max(1, w / 650); g.shadowColor = rgba('#E2566C', 0.8); g.shadowBlur = 7; g.beginPath();
    for (var k = 0; k <= 50; k++) { var u = k / 50, x = ax + (bx2 - ax) * u, y = ay + (by2 - ay) * u + Math.sin(u * Math.PI) * h * 0.012 + Math.sin(u * Math.PI) * Math.sin(t * 12 + u * 3) * amp; k ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.stroke(); g.shadowBlur = 0;
    gGlow(g, bx2, by2, w * 0.03, '#E2566C', 0.3 + 0.15 * Math.sin(t * 1.3));
    vign(g, w, h, 0.65);
  };

  /* ---------- tranh cho Góc nhìn khác, đợt 3 (25/11): ch13 Luke "Nghe thấy". Không vẽ người, chỉ đồ vật. ---------- */
  // Gáo nước trên nền đất cạnh chum, mảnh vải xanh bạc màu xé từ vạt áo vắt trên miệng gáo, giọt nước nhỏ xuống thành vòng gợn; vệt nắng mảnh như sợi chỉ.
  ART.basin = function (g, w, h, t, R) {
    var floorY = h * 0.5, dk = C.dark; earthRoom(g, w, h, floorY);
    threadBeam(g, w * 0.2, 0, w * 0.46, h, 3, dk ? 0.15 : 0.3); threadBeam(g, w * 0.66, 0, w * 0.9, h, 2, dk ? 0.1 : 0.22);
    // chum nước góc trái
    g.fillStyle = dk ? '#3a2a20' : '#7a5a42'; g.beginPath(); g.ellipse(w * 0.12, h * 0.5, w * 0.08, h * 0.2, 0, 0, 7); g.fill();
    g.fillStyle = dk ? '#0a0806' : '#2a2218'; g.beginPath(); g.ellipse(w * 0.12, h * 0.33, w * 0.05, h * 0.02, 0, 0, 7); g.fill();
    // gáo: nửa vỏ tròn, mặt nước trong
    var cx = w * 0.52, cy = h * 0.72, rx = w * 0.13, ry = h * 0.07;
    g.fillStyle = dk ? '#4a3626' : '#8a6644'; g.beginPath(); g.ellipse(cx, cy, rx, ry * 2.1, 0, 0, Math.PI); g.fill();
    g.fillStyle = dk ? '#16222a' : '#9ab8c4'; g.beginPath(); g.ellipse(cx, cy, rx * 0.92, ry * 0.85, 0, 0, 7); g.fill();
    g.strokeStyle = dk ? '#5a4432' : '#a07a50'; g.lineWidth = 2; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, 7); g.stroke();
    g.strokeStyle = dk ? '#5a4432' : '#a07a50'; g.lineWidth = Math.max(3, w * 0.008); g.beginPath(); g.moveTo(cx + rx * 0.95, cy - ry * 0.2); g.lineTo(cx + rx * 2.1, cy - ry * 1.6); g.stroke(); // cán gáo
    // giọt nước rơi theo chu kỳ, gợn vòng tròn
    var per = 2.6, ph = (t % per) / per, dxp = cx - rx * 0.35, top = cy - h * 0.2;
    if (ph < 0.25) { var u = ph / 0.25; g.fillStyle = rgba(dk ? '#bfe2ec' : '#3d7e94', 0.8); g.beginPath(); g.ellipse(dxp, top + (cy - top) * u * u, 1.8, 2.6, 0, 0, 7); g.fill(); }
    else { var v = (ph - 0.25) / 0.75; for (var k = 0; k < 2; k++) { var vv = v - k * 0.18; if (vv <= 0) continue; g.strokeStyle = rgba(dk ? '#bfe2ec' : '#2f6f84', 0.55 * (1 - vv)); g.lineWidth = 1; g.beginPath(); g.ellipse(dxp, cy, rx * 0.6 * vv, ry * 0.6 * vv, 0, 0, 7); g.stroke(); } }
    // mảnh vải xanh bạc màu vắt qua miệng gáo, mép tưa sợi, một đầu ngâm trong nước
    var cl = dk ? '#6f8d9c' : '#5d7c8c', sway = Math.sin(t * 0.6) * h * 0.006;
    g.fillStyle = cl; g.beginPath(); g.moveTo(cx - rx * 0.2, cy - ry * 0.9); g.quadraticCurveTo(cx + rx * 0.3, cy - ry * 1.4, cx + rx * 0.8, cy - ry * 0.5);
    g.lineTo(cx + rx * 0.95, cy + ry * 2.4 + sway); g.lineTo(cx + rx * 0.72, cy + ry * 2.5 + sway); g.lineTo(cx + rx * 0.62, cy - ry * 0.3); g.quadraticCurveTo(cx + rx * 0.2, cy - ry * 0.6, cx - rx * 0.1, cy); g.closePath(); g.fill();
    g.strokeStyle = rgba(dk ? '#c8d8e0' : '#e8f0f4', 0.45); g.lineWidth = 1;
    for (var i = 0; i < 6; i++) { var fx = cx + rx * (0.72 + i * 0.045); g.beginPath(); g.moveTo(fx, cy + ry * 2.45 + sway); g.lineTo(fx + 1.5, cy + ry * 2.45 + sway + 5 + (i % 2) * 3); g.stroke(); }
    // mảnh thứ hai nằm sẵn trên nền, gấp đôi, chờ quấn
    g.fillStyle = rgba(cl, 0.9); g.save(); g.translate(w * 0.8, h * 0.82); g.rotate(-0.12); g.fillRect(-w * 0.07, -h * 0.018, w * 0.14, h * 0.036);
    g.strokeStyle = rgba(dk ? '#c8d8e0' : '#e8f0f4', 0.4); for (var j = 0; j < 7; j++) { g.beginPath(); g.moveTo(-w * 0.07 + j * w * 0.02, h * 0.018); g.lineTo(-w * 0.07 + j * w * 0.02 + 1, h * 0.018 + 4); g.stroke(); } g.restore();
    motes(g, w, h, t, R, w * 0.15, w * 0.95, h * 0.05, h * 0.9, 24, '#fff0c8');
  };

  /* ---------- tranh cho Góc nhìn khác, đợt 4 (25/11): ch14 Leon "Hụt". Không vẽ người, chỉ đồ vật và dấu vết. ---------- */
  // Ký ức hồi đầu năm, ở một ảo cảnh khác: mặt đất bạc màu như ảnh cũ, sợi xích nằm cuộn ở tiền cảnh rồi kéo một vệt dài đi xa;
  // tít đằng sau, giữa bụi, hai ô vuông nhỏ loé lên rồi tắt (cặp kính đứng nhìn theo). Tông xám lạnh, mép ảnh mờ như ký ức.
  ART.memchain = function (g, w, h, t, R) {
    var dk = C.dark, hor = h * 0.46;
    var sky = g.createLinearGradient(0, 0, 0, hor); sky.addColorStop(0, dk ? '#14181b' : '#d9dcdc'); sky.addColorStop(1, dk ? '#22282b' : '#c6cbcb');
    g.fillStyle = sky; g.fillRect(0, 0, w, hor);
    var gr = g.createLinearGradient(0, hor, 0, h); gr.addColorStop(0, dk ? '#1d2224' : '#bfc3c1'); gr.addColorStop(1, dk ? '#0e1112' : '#a7aba8');
    g.fillStyle = gr; g.fillRect(0, hor, w, h - hor);
    // vài khối đổ nát mờ ở chân trời (nơi chuyện đã xong)
    g.fillStyle = rgba(dk ? '#2c3336' : '#9da3a2', 0.8);
    [[0.08, 0.06, 0.05], [0.2, 0.1, 0.03], [0.62, 0.08, 0.06], [0.86, 0.05, 0.04]].forEach(function (b) { g.fillRect(w * b[0], hor - h * b[1], w * b[2] * 1.6, h * b[1]); });
    // vệt xích kéo từ tiền cảnh đi xa
    var steel = dk ? '#8a9498' : '#4a5357';
    g.strokeStyle = rgba(steel, 0.35); g.lineWidth = Math.max(2, w / 260); g.setLineDash([w * 0.012, w * 0.01]);
    g.beginPath(); g.moveTo(w * 0.3, h * 0.86); g.bezierCurveTo(w * 0.45, h * 0.7, w * 0.5, h * 0.6, w * 0.7, hor + h * 0.04); g.stroke(); g.setLineDash([]);
    // sợi xích nằm cuộn: các mắt xích elip nối nhau theo vòng xoắn, mắt cuối khẽ nhổm
    var cx = w * 0.26, cy = h * 0.84, n = 22;
    for (var i = 0; i < n; i++) {
      var a = i * 0.62, r = w * (0.025 + i * 0.0032), lx = cx + Math.cos(a) * r, ly = cy + Math.sin(a) * r * 0.42;
      var lift = i > n - 4 ? Math.max(0, Math.sin(t * 1.3 + i)) * h * 0.02 * (i - n + 4) : 0;
      g.strokeStyle = rgba(steel, 0.95); g.lineWidth = Math.max(1.6, w / 340);
      g.beginPath(); g.ellipse(lx, ly - lift, w * 0.011, h * (i % 2 ? 0.008 : 0.013), a + 1.2, 0, 6.283); g.stroke();
    }
    // tít đằng sau: hai ô vuông nhỏ loé ánh lạnh theo chu kỳ, rồi tắt
    var gx = w * 0.72, gy = hor + h * 0.02, per = 4.6, ph = (t % per) / per, al = ph < 0.5 ? Math.sin(ph / 0.5 * Math.PI) : 0;
    if (al > 0.02) {
      gGlow(g, gx, gy, w * 0.04, dk ? '#dfe9ee' : '#ffffff', 0.25 * al);
      g.strokeStyle = rgba(dk ? '#e6eef2' : '#2a3134', 0.85 * al); g.lineWidth = 1.2;
      g.strokeRect(gx - w * 0.012, gy - h * 0.006, w * 0.009, h * 0.012); g.strokeRect(gx + w * 0.003, gy - h * 0.006, w * 0.009, h * 0.012);
      g.beginPath(); g.moveTo(gx - w * 0.003, gy); g.lineTo(gx + w * 0.003, gy); g.stroke();
    }
    dust(g, w, h, t, R, h * 0.8, 8);
    // mép ảnh mờ như ký ức
    vign(g, w, h, 0.6);
  };

  /* ---------- chạy tranh khi thấy ---------- */
  var arts = [];
  document.querySelectorAll('canvas.art').forEach(function (cv, i) {
    var parts = cv.dataset.art.split(':'), fn = ART[parts[0]]; if (!fn) return;
    var r = rnd(97 + i * 131), R = []; for (var k = 0; k < 240; k++) R.push(r());
    arts.push({ cv: cv, fn: fn, R: R, o: parts.slice(1), on: false });
  });
  function size(a) {
    var d = Math.min(devicePixelRatio || 1, 2), w = a.cv.clientWidth, h = a.cv.clientHeight;
    a.cv.width = Math.round(w * d); a.cv.height = Math.round(h * d);
    a.g = a.cv.getContext('2d'); a.g.setTransform(d, 0, 0, d, 0, 0); a.w = w; a.h = h;
  }
  function draw(a, t) { if (!a.w || !a.h) return; a.g.clearRect(0, 0, a.w, a.h); try { a.fn(a.g, a.w, a.h, t, a.R, a.o); } catch (e) {} }
  arts.forEach(function (a) { size(a); draw(a, 4); });
  addEventListener('resize', function () { arts.forEach(function (a) { size(a); draw(a, 4); }); });
  addEventListener('a07-theme', function () { arts.forEach(function (a) { draw(a, 4); }); });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { arts.forEach(function (a) { if (a.cv === e.target) a.on = e.isIntersecting; }); }); });
    arts.forEach(function (a) { io.observe(a.cv); });
  }
  if (!reduce) {
    var t0 = performance.now();
    (function loop(now) {
      var t = 4 + (now - t0) / 1000;
      arts.forEach(function (a) { if (a.on) draw(a, t); });
      requestAnimationFrame(loop);
    })(t0);
  }

  /* ---------- thẻ: chạm để lật, tan đi khi người đọc tới câu thẻ tan ---------- */
  var cardFigs = [].slice.call(document.querySelectorAll('.card-fig'));
  cardFigs.forEach(function (fig) {
    var b = fig.querySelector('.card');
    b.addEventListener('click', function () { b.classList.toggle('flipped'); if (window.a07sfx) a07sfx('flip'); });
    var phrase = fig.dataset.dissolve;
    if (phrase) {
      var ps = document.querySelectorAll('.scene p');
      for (var i = 0; i < ps.length; i++) if (ps[i].textContent.indexOf(phrase) >= 0) { fig._at = ps[i]; break; }
    }
  });
  function checkCards() {
    cardFigs.forEach(function (fig) {
      if (!fig._at) return;
      var r = fig._at.getBoundingClientRect();
      var gone = r.top + r.height * 0.6 < innerHeight * 0.55;
      if (gone && !fig.classList.contains('gone') && window.a07sfx) a07sfx('dissolve');
      fig.classList.toggle('gone', gone);
    });
  }
  addEventListener('scroll', checkCards, { passive: true }); checkCards();
  // thẻ hệ: lật khi chạm, chia ra khi người đọc tới
  [].forEach.call(document.querySelectorAll('.tcard'), function (b) { b.addEventListener('click', function () { b.classList.toggle('flipped'); if (window.a07sfx) a07sfx('flip'); }); });
  var rows = [].slice.call(document.querySelectorAll('.type-row'));
  if ('IntersectionObserver' in window) {
    var tio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('dealt'); tio.unobserve(e.target); if (window.a07sfx) a07sfx('deal'); } }); }, { rootMargin: '0px 0px -15% 0px' });
    rows.forEach(function (r) { tio.observe(r); });
  } else rows.forEach(function (r) { r.classList.add('dealt'); });

  /* ---------- khoảnh khắc động gắn với câu chữ (chèn vào fx.js khi dựng) ----------
     - p.sys: chữ xanh băng của ảo cảnh hiện ra từng chữ lần đầu người đọc tới.
     - p[data-fx]: khi đoạn văn chạm giữa màn hình thì bật hiệu ứng; cuộn ngược lên trên đoạn đó thì cho bật lại được.
       chains = xích buông từ mép trên xuống, lắc rồi đứng, rồi rút lên
       smoke  = khói xám tràn qua trang rồi tan
       water  = mặt nước gợn tràn qua trang (nhìn từ dưới nước lên)
       door   = khung cửa sáng lên từng nét giữa trang
       dome   = vòm sáng mờ bung ra bọc lấy trang
       và các kiểu trong MORE: dapple shake darkend unlock rain typing whiteout ripple frost hush flare dawn wind scratch thud heal heat tally ribbon creep rescue rescuehold rescuedrop soothe blink vein (vein: Góc nhìn khác ch11, Mira nhìn thấu mạch máu; soothe/blink: Góc nhìn khác ch05, tay bà Mabel làm dịu và Felix chớp mắt đổi chỗ; xích cứu người của Leon: thép như xích tấn công, vòng lỏng ôm lấy giữa trang, nhấc lên rồi đặt xuống; hold = kéo không nổi, drop = người được cứu tự gỡ ra)
       flicker = từ đoạn này tới hết chương, trang tối theo nhịp lửa chao
     - body[data-open="dark"]: mở chương trong bóng tối, sáng lại dần. */
  (function () {
    // chữ hệ thống gõ từng chữ
    var sysPs = [].slice.call(document.querySelectorAll('.scene p.sys'));
    if (!reduce && sysPs.length) {
      sysPs.forEach(function (p) {
        p.setAttribute('aria-label', p.textContent);
        var walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT), nodes = [], n;
        while ((n = walker.nextNode())) nodes.push(n);
        var chars = [];
        nodes.forEach(function (tn) {
          var frag = document.createDocumentFragment();
          Array.from(tn.nodeValue).forEach(function (c) {
            var s = document.createElement('span'); s.className = 'ch'; s.textContent = c; s.setAttribute('aria-hidden', 'true');
            frag.appendChild(s); chars.push(s);
          });
          tn.parentNode.replaceChild(frag, tn);
        });
        p._chars = chars;
      });
      var typeIO = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          typeIO.unobserve(e.target);
          var cs = e.target._chars, step = Math.max(12, Math.min(34, 1400 / cs.length)), i = 0;
          e.target.classList.add('typing');
          (function next() {
            if (i >= cs.length) { e.target.classList.remove('typing'); return; }
            cs[i].classList.add('on'); if (i > 0) cs[i - 1].classList.remove('cur'); cs[i].classList.add('cur');
            i++; setTimeout(next, cs[i - 1].textContent === ' ' ? step * 0.5 : step);
            if (i === cs.length) setTimeout(function () { cs[i - 1].classList.remove('cur'); }, 500);
          })();
        });
      }, { rootMargin: '0px 0px -25% 0px' });
      sysPs.forEach(function (p) { typeIO.observe(p); });
    }

    var fxPs = [].slice.call(document.querySelectorAll('.scene p[data-fx]'));
    var open = document.body.getAttribute('data-open');
    var LAB = document.body.hasAttribute('data-lab'); // trang xem thử ẩn: luôn dựng lớp vẽ
    if ((reduce && !LAB) || (!fxPs.length && !open && !LAB)) return;

    // lớp tối (bóng tối viền quanh trang) và lớp vẽ (xích, khói)
    var shade = document.createElement('div'); shade.className = 'fx-shade'; shade.setAttribute('aria-hidden', 'true');
    var cv = document.createElement('canvas'); cv.className = 'fx-layer'; cv.setAttribute('aria-hidden', 'true');
    document.body.appendChild(shade); document.body.appendChild(cv);
    var g = cv.getContext('2d'), W = 0, H = 0, main = document.querySelector('main') || document.body;
    function fit() { var d = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; cv.width = Math.round(W * d); cv.height = Math.round(H * d); g.setTransform(d, 0, 0, d, 0, 0); }
    fit(); addEventListener('resize', fit);

    var shots = [];          // hiệu ứng đang chạy: {kind, t0}
    var flickFrom = null;    // đoạn bắt đầu vùng lửa chao
    var openT0 = open === 'dark' ? performance.now() : null;
    var running = false;

    fxPs.forEach(function (p) {
      p._armed = true;
      if (p.dataset.fx === 'flicker') flickFrom = p;
    });
    // tô nổi đoạn chữ của lần kích hoạt năng lực nhân vật chính: loé sáng lúc hiệu ứng chạy, rồi giữ lại vạch màu nhẹ
    var WHO = { 'leon-strike': 'leon', 'leon-rescue': 'leon', 'luke-sense': 'luke', 'luke-protect': 'luke', 'luke-eye': 'luke', 'luke-eye-sense': 'luke', 'leon-eye': 'leon', 'leon-eye-trong': 'leon', 'leon-eye-toc': 'leon', 'leon-eye-strike': 'leon', 'leon-eye-chains': 'leon', 'leon-eye-yank': 'leon', 'leon-eye-bristle': 'leon', 'leon-eye-rescue': 'leon', 'clevia-unlock': 'clevia', 'clevia-lock': 'clevia', 'clevia-lock-unlock': 'clevia', chains: 'leon', rescue: 'leon', rescuehold: 'leon', anomaly: 'luke', protect: 'luke', keysense: 'clevia', keyburst: 'clevia', stoneopen: 'clevia', yank: 'leon', bristle: 'leon', bind15: 'leon' };
    function power(p, who, delay) {
      who = who || WHO[p && p.dataset.fx]; if (!p || !who) return;
      var list = [p], q = p.nextElementSibling;
      while (q && list.length < 3) { if (q.tagName === 'P' && !q.classList.contains('sys')) list.push(q); else if (q.tagName !== 'P' && !q.classList.contains('card-fig')) break; q = q.nextElementSibling; }
      setTimeout(function () {
        list.forEach(function (el, i) {
          el.classList.add('pw', 'pw-' + who); el.classList.remove('pw-flash'); void el.offsetWidth;
          el.style.setProperty('--pwd', (i * 0.18) + 's'); el.classList.add('pw-on', 'pw-flash');
        });
      }, Math.max(0, delay || 0));
    }
    window.a07power = power;
    function check() {
      var mid = innerHeight * 0.55;
      fxPs.forEach(function (p) {
        if (p.dataset.fx === 'flicker') return;
        var top = p.getBoundingClientRect().top;
        if (p.dataset.fired) return; // người đọc đã tự kích hoạt bằng tay (khối press)
        if (p.offsetParent === null) return; // đoạn đang ẩn (bài Góc nhìn khác chưa mở)
        if (p._armed && top < mid && top > -innerHeight) {
          p._armed = false; var now0 = performance.now();
          // dùng năng lực / dùng thẻ: vòng tròn rối loé lên trước, rồi mới tới hiệu ứng riêng
          if (p.dataset.cast) { cast(); now0 += 850; }
          var op = { pow: +p.dataset.pow || 1, len: +p.dataset.len || 1, ten: p.dataset.ten !== '0' };
          shots.push({ kind: p.dataset.fx, t0: now0, R: seeds(), pow: op.pow, len: op.len, ten: op.ten }); kick(); power(p, null, now0 - performance.now());
          if (window.a07sfx) { var kd = p.dataset.fx; setTimeout(function () { window.a07sfx(kd, op); }, now0 - performance.now()); }
        }
        else if (!p._armed && top > innerHeight * 0.9) p._armed = true; // cuộn ngược lên: cho bật lại
      });
      if (flickFrom) kick();
    }
    addEventListener('scroll', check, { passive: true });
    function seeds() { var a = []; for (var i = 0; i < 60; i++) a.push(Math.random()); return a; }
    function kick() { if (!running) { running = true; requestAnimationFrame(frame); } }

    var flickLevel = 0; // mờ dần vào/ra khi bước vào/ra vùng lửa chao
    function frame(now) {
      g.clearRect(0, 0, W, H);
      var dark = 0, busy = false;
      // mở chương trong bóng tối
      if (openT0 != null) {
        var u = (now - openT0) / 1000;
        if (u < 9) {
          busy = true;
          var base = u < 1.2 ? 0.88 : 0.88 * Math.max(0, 1 - (u - 1.2) / 7.5);
          // than còn gượng: vài nhịp sáng lên rồi lịm
          var gasp = Math.max(0, Math.sin(u * 2.1)) * 0.12 * Math.max(0, 1 - u / 6);
          dark = Math.max(dark, base - gasp);
        } else openT0 = null;
      }
      // vùng lửa chao
      if (flickFrom) {
        var inside = flickFrom.getBoundingClientRect().top < innerHeight * 0.6;
        flickLevel += ((inside ? 1 : 0) - flickLevel) * 0.04;
        if (flickLevel > 0.005) {
          busy = true;
          var s = now / 1000, ph = (s % 4.2) / 4.2, d = 0.16;
          if (ph > 0.62) d += 0.32 * Math.abs(Math.sin((ph - 0.62) * 26)) * (1 - (ph - 0.62) / 0.38 * 0.4);
          d += 0.03 * Math.sin(s * 9) + 0.02 * Math.sin(s * 23);
          dark = Math.max(dark, d * flickLevel);
        }
      }
      shade.style.opacity = dark.toFixed(3);
      // xích, khói
      for (var i = shots.length - 1; i >= 0; i--) {
        var sh = shots[i]; if (now < sh.t0) { busy = true; continue; }
        var t = (now - sh.t0) / 1000 / (sh.len || 1); PW = sh.pow || 1; TEN = sh.ten !== false;
        var done = sh.kind === 'chains' ? drawChains(t, sh.R) : sh.kind === 'smoke' ? drawSmoke(t, sh.R) : sh.kind === 'water' ? drawWater(t, sh.R) : sh.kind === 'door' ? drawDoor(t, sh.R) : sh.kind === 'dome' ? drawDome(t, sh.R) : MORE[sh.kind] ? MORE[sh.kind](t, sh.R) : true;
        if (done) shots.splice(i, 1); else busy = true;
      }
      if (busy) requestAnimationFrame(frame); else { running = false; g.clearRect(0, 0, W, H); shade.style.opacity = 0; }
    }

    // xích của Leon: bóng tối sập xuống, năm sợi xích sắt đen phóng vào từ mép trang, đập trúng toé lửa,
    // siết thành một vòng giữa trang, căng rung, rồi giật ngược về
    function drawChains(t, R) {
      if (t > 7.2) { main.style.transform = ''; return true; }
      var cx = W / 2, cy = H * 0.5, m = Math.min(W, H), link = Math.max(12, m * 0.034), lw = Math.max(2.4, link * 0.28);
      var iron = '#1b1f21', hi = '#8e9ba0', glint = '#e9f6f8';
      var O = [[-0.08, -0.05], [0.5, -0.1], [1.08, -0.05], [-0.1, 0.62], [1.1, 0.58]];
      var fade = t > 6.4 ? Math.max(0, 1 - (t - 6.4) / 0.8) : 1;
      // bóng tối sập xuống
      var dk = t < 0.18 ? t / 0.18 : t < 4.6 ? 1 - 0.35 * Math.min(1, (t - 0.18) / 1.5) : Math.max(0, 0.65 * (1 - (t - 4.6) / 1.6));
      edge('#000000', (C.dark ? 0.85 : 0.7) * dk, 0.12);
      var shake = 0;
      function linkAt(x, y, ang, face, a) {
        g.save(); g.translate(x, y); g.rotate(ang); g.globalAlpha = a;
        var rx = link * 0.62, ry = face ? link * 0.36 : link * 0.13;
        if (C.dark) {
          // nền tối: thép thật, thân tối màu gang, chỉ ánh lên ở mép trên như bắt ánh sao; không viền đen, quầng rất nhẹ (Clair 24/11: bản bạc sáng viền đen trông hoạt hình)
          g.shadowColor = 'rgba(150,175,190,.22)'; g.shadowBlur = link * 0.5;
          var sg = g.createLinearGradient(0, -ry - lw, 0, ry + lw); sg.addColorStop(0, '#7d898f'); sg.addColorStop(0.35, '#3c4448'); sg.addColorStop(1, '#1c2124');
          g.lineWidth = lw * 1.25; g.strokeStyle = sg; g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, 7); g.stroke(); g.shadowBlur = 0;
          g.lineWidth = Math.max(0.8, lw * 0.22); g.strokeStyle = 'rgba(214,228,234,.75)'; g.beginPath(); g.ellipse(0, -lw * 0.35, rx * 0.95, Math.max(1, ry * 0.9), 0, 3.75, 5.55); g.stroke();
          g.lineWidth = Math.max(0.6, lw * 0.15); g.strokeStyle = 'rgba(140,160,170,.35)'; g.beginPath(); g.ellipse(0, lw * 0.3, rx * 0.9, Math.max(1, ry * 0.85), 0, 0.5, 2.6); g.stroke();
          g.restore(); return;
        }
        g.lineWidth = lw * 1.5; g.strokeStyle = iron; g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, 7); g.stroke();
        g.lineWidth = lw * 0.45; g.strokeStyle = hi; g.beginPath(); g.ellipse(0, -lw * 0.2, rx * 0.92, Math.max(1, ry * 0.85), 0, 3.5, 5.9); g.stroke();
        g.restore();
      }
      g.save(); g.lineCap = 'round';
      O.forEach(function (o, c) {
        var t0 = 0.1 + c * 0.075 + R[c] * 0.05, ti = t0 + 0.24, tt = t - t0; if (tt <= 0) return;
        var ox = o[0] * W, oy = o[1] * H, ang0 = c / O.length * 6.283 + R[c + 5], tx = cx + Math.cos(ang0) * m * 0.13, ty = cy + Math.sin(ang0) * m * 0.13;
        var u = tt < 0.24 ? Math.pow(tt / 0.24, 0.55) : 1;                 // phóng tới
        if (t > 5.2) u *= Math.max(0, 1 - Math.pow((t - 5.2) / 0.55, 2)); // giật ngược về
        var px = ox + (tx - ox) * u, py = oy + (ty - oy) * u, dx = px - ox, dy = py - oy, len = Math.hypot(dx, dy), ang = Math.atan2(dy, dx);
        var vib = t > ti && t < 5.2 ? Math.sin(t * 70 + c) * link * 0.18 * Math.exp(-(t - ti) * 1.6) : 0; // căng rung
        var slack = t > 5.2 ? Math.sin((t - 5.2) * 9) * link * 1.5 * u : (tt < 0.24 ? link * 2.5 * (1 - u) : 0);
        var n = Math.floor(len / (link * 0.95));
        for (var k = 0; k <= n; k++) {
          var s = k / Math.max(1, n), bow = Math.sin(s * Math.PI) * (slack + vib);
          var x = ox + dx * s - Math.sin(ang) * bow, y = oy + dy * s + Math.cos(ang) * bow;
          // vệt mờ khi đang phóng: mắt xích xa đầu nhạt hơn
          var a = tt < 0.3 ? 0.35 + 0.65 * Math.pow(s, 2) : 1;
          linkAt(x, y, ang, k % 2 === 0, a * fade);
        }
        // ánh lạnh chạy dọc sợi xích lúc vừa căng
        if (t > ti && t < ti + 0.9) {
          var q = (t - ti) / 0.9, gx = ox + dx * q, gy = oy + dy * q, gl = g.createRadialGradient(gx, gy, 0, gx, gy, link * 2.4);
          gl.addColorStop(0, rgba(glint, 0.75 * (1 - q))); gl.addColorStop(1, rgba(glint, 0)); g.fillStyle = gl; g.fillRect(gx - link * 3, gy - link * 3, link * 6, link * 6);
        }
        // đập trúng: toé lửa
        var ts = t - ti;
        if (ts > 0 && ts < 0.6) {
          if (ts < 0.12) shake = Math.max(shake, 1 - ts / 0.12);
          var fl = g.createRadialGradient(tx, ty, 0, tx, ty, link * 3); fl.addColorStop(0, rgba('#fff4dc', 0.9 * Math.max(0, 1 - ts / 0.2))); fl.addColorStop(1, rgba('#fff4dc', 0));
          g.fillStyle = fl; g.fillRect(tx - link * 3, ty - link * 3, link * 6, link * 6);
          g.strokeStyle = rgba('#ffd9a0', 1 - ts / 0.6); g.lineWidth = 1.5;
          for (var p = 0; p < 9; p++) {
            var pa = ang + Math.PI + (R[(c * 9 + p) % 60] - 0.5) * 2.4, sp = m * (0.25 + R[(c * 7 + p + 20) % 60] * 0.45);
            var x1 = tx + Math.cos(pa) * sp * ts, y1 = ty + Math.sin(pa) * sp * ts + 200 * ts * ts;
            g.beginPath(); g.moveTo(x1, y1); g.lineTo(x1 - Math.cos(pa) * 6, y1 - Math.sin(pa) * 6); g.stroke();
          }
        }
      });
      // vòng xích siết lại giữa trang
      var tr = t - 0.6;
      if (tr > 0 && t < 5.4) {
        var rr = m * 0.13 * (1 + 0.25 * Math.exp(-tr * 4)), cnt = Math.floor(6.283 * rr / (link * 0.95)), shown = Math.min(cnt, Math.floor(cnt * tr / 0.35));
        var ra = t > 5.0 ? 1 - (t - 5.0) / 0.4 : 1;
        for (var k2 = 0; k2 < shown; k2++) { var aa = k2 / cnt * 6.283 + t * 0.15 * Math.exp(-tr); linkAt(cx + Math.cos(aa) * rr, cy + Math.sin(aa) * rr, aa + Math.PI / 2, k2 % 2 === 0, Math.max(0, ra) * fade); }
      }
      g.restore();
      main.style.transform = shake > 0.02 ? 'translate(' + (Math.sin(t * 90) * 7 * shake).toFixed(1) + 'px,' + (Math.cos(t * 77) * 5 * shake).toFixed(1) + 'px)' : '';
      return false;
    }

    function drawSmoke(t, R) {
      if (t > 8) return true;
      // dày lên trong 1,6 giây, giữ tới giây 3,5, rồi tan dần
      var k = t < 1.6 ? t / 1.6 : t < 3.5 ? 1 : Math.max(0, 1 - (t - 3.5) / 4.5);
      var col = C.dark ? '#5f6866' : '#8e928d';
      for (var i = 0; i < 26; i++) {
        var ox = R[i] * W, oy = H * (0.55 + R[i + 26] * 0.6);
        var grow = Math.min(1, t / (1.2 + R[i] * 1.4));
        var x = ox + Math.sin(t * 0.5 + i) * W * 0.04 + (R[i + 1] - 0.5) * t * W * 0.06;
        var y = oy - grow * H * (0.35 + R[i + 2] * 0.5) - t * H * 0.02;
        var r = Math.max(W, H) * (0.12 + R[i + 3] * 0.18) * (0.4 + 0.8 * grow);
        var gr = g.createRadialGradient(x, y, 0, x, y, r);
        gr.addColorStop(0, rgba(col, 0.42 * k)); gr.addColorStop(0.6, rgba(col, 0.2 * k)); gr.addColorStop(1, rgba(col, 0));
        g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
      }
      return false;
    }


    // mặt nước gợn tràn qua trang, như đang chìm dưới nước nhìn lên
    function drawWater(t, R) {
      if (t > 8) return true;
      var k = t < 1.2 ? t / 1.2 : t < 4.5 ? 1 : Math.max(0, 1 - (t - 4.5) / 3.5);
      var tint = g.createLinearGradient(0, 0, 0, H); tint.addColorStop(0, rgba(C.dark ? '#2a4446' : '#cfe0dc', 0.5 * k)); tint.addColorStop(1, rgba(C.dark ? '#0b1416' : '#7f9a96', 0.55 * k));
      g.fillStyle = tint; g.fillRect(0, 0, W, H);
      g.strokeStyle = rgba(C.dark ? '#d8ebe4' : '#ffffff', 0.35 * k); g.lineWidth = 1.2;
      for (var r = 0; r < 7; r++) {
        g.beginPath();
        for (var x = 0; x <= W; x += W / 50) { var y = H * (0.04 + r * 0.035) + Math.sin(x / W * 8 + t * (0.9 + r * 0.15) + r) * H * 0.008 + Math.sin(x / W * 21 - t * 1.4) * H * 0.004; x ? g.lineTo(x, y) : g.moveTo(x, y); }
        g.stroke();
      }
      for (var i = 0; i < 4; i++) { var bx = W * (0.15 + i * 0.22) + Math.sin(t * 0.3 + i) * W * 0.03; g.fillStyle = rgba('#ffffff', (0.05 + 0.03 * Math.sin(t * 0.6 + i)) * k); g.beginPath(); g.moveTo(bx - W * 0.03, 0); g.lineTo(bx + W * 0.03, 0); g.lineTo(bx + W * 0.12, H); g.lineTo(bx - W * 0.06, H); g.fill(); }
      g.fillStyle = rgba(C.dark ? '#d8ebe4' : '#ffffff', 0.5 * k);
      for (var b = 0; b < 22; b++) { var sp = 0.12 + R[b] * 0.12, by = H * (1.05 - ((t * sp + R[b + 22]) % 1.1)), bx2 = R[b + 11] * W + Math.sin(t * 2 + b) * 5; g.beginPath(); g.arc(bx2, by, 1.5 + R[(b + 30) % 60] * 3, 0, 7); g.fill(); }
      return false;
    }

    // khung cửa sáng lên từng nét giữa trang rồi tan
    function drawDoor(t, R) {
      if (t > 6.5) return true;
      var fade = t > 4.4 ? Math.max(0, 1 - (t - 4.4) / 2.1) : 1, pr = Math.min(1, t / 2.2);
      var dw = Math.min(W * 0.36, H * 0.24), dh = dw * 2, x = W / 2 - dw / 2, y = H * 0.48 - dh / 2;
      var pts = [[x, y + dh], [x, y], [x + dw, y], [x + dw, y + dh]], ink = C.dark ? '#f3c27a' : '#a8641f';
      g.save(); g.globalAlpha = fade;
      if (pr >= 1) { var ins = g.createLinearGradient(0, y, 0, y + dh), a = Math.min(1, (t - 2.2) / 0.6); ins.addColorStop(0, rgba(C.dark ? '#f9f1dc' : '#fff8e6', 0.55 * a)); ins.addColorStop(1, rgba(C.dark ? '#f9f1dc' : '#fff8e6', 0.05)); g.fillStyle = ins; g.fillRect(x, y, dw, dh); }
      g.strokeStyle = ink; g.lineWidth = Math.max(2, W / 200); g.lineCap = 'round'; g.shadowColor = ink; g.shadowBlur = 16;
      g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
      var done = pr * 3;
      for (var i = 0; i < 3; i++) { var u = Math.max(0, Math.min(1, done - i)); if (u <= 0) break; g.lineTo(pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u); }
      g.stroke(); g.shadowBlur = 0;
      if (pr < 1) { var j = Math.min(2, Math.floor(done)), v = done - j, px = pts[j][0] + (pts[j + 1][0] - pts[j][0]) * v, py = pts[j][1] + (pts[j + 1][1] - pts[j][1]) * v, sp = g.createRadialGradient(px, py, 0, px, py, dw * 0.25); sp.addColorStop(0, rgba('#fff2c8', 0.9)); sp.addColorStop(1, rgba('#fff2c8', 0)); g.fillStyle = sp; g.fillRect(px - dw * 0.25, py - dw * 0.25, dw * 0.5, dw * 0.5); }
      g.restore();
      return false;
    }

    // vòm sáng mờ bung ra bọc lấy trang, rung nhẹ rồi lịm dần
    function drawDome(t, R) {
      if (t > 7) return true;
      var grow = t < 0.7 ? 1 - Math.pow(1 - t / 0.7, 3) : 1, fade = t > 4.5 ? Math.max(0, 1 - (t - 4.5) / 2.5) : 1;
      var cx = W / 2, cy = H * 0.55, rx = W * 0.62 * grow, ry = H * 0.62 * grow, col = C.dark ? '#cfe6ff' : '#5f93c8';
      g.save(); g.globalAlpha = fade;
      var gr = g.createRadialGradient(cx, cy, Math.min(rx, ry) * 0.55, cx, cy, Math.max(rx, ry));
      gr.addColorStop(0, rgba(col, 0)); gr.addColorStop(0.75, rgba(col, 0.08)); gr.addColorStop(0.95, rgba(col, 0.42)); gr.addColorStop(1, rgba(col, 0));
      g.translate(cx, cy); g.scale(1, ry / Math.max(1, rx)); g.translate(-cx, -cy);
      g.fillStyle = gr; g.fillRect(cx - rx, cy - rx, rx * 2, rx * 2);
      var wob = 1 + 0.01 * Math.sin(t * 9) * Math.exp(-t);
      g.strokeStyle = rgba(col, 0.6); g.lineWidth = 1.5; g.beginPath(); g.arc(cx, cy, rx * 0.97 * wob, 0, 7); g.stroke();
      // vệt ánh trượt quanh mép vòm
      var a0 = t * 1.4; g.strokeStyle = rgba('#ffffff', 0.7); g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, rx * 0.97 * wob, a0, a0 + 0.5); g.stroke();
      g.restore();
      return false;
    }


    /* ---- các kiểu thêm (24/11): mỗi hàm trả true khi xong ---- */
    function env(t, a, b, c) { return t < a ? t / a : t < a + b ? 1 : Math.max(0, 1 - (t - a - b) / c); }
    function wash(col, a) { g.fillStyle = rgba(col, a); g.fillRect(0, 0, W, H); }
    function edge(col, a, inner) { var gr = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * (inner || 0.3), W / 2, H / 2, Math.max(W, H) * 0.75); gr.addColorStop(0, rgba(col, 0)); gr.addColorStop(1, rgba(col, a)); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
    var MORE = {}, PW = 1, TEN = true; // PW, TEN: độ mạnh và băng tên chiêu của shot đang vẽ (bộ chiêu, chieu.js)
    // nắng lọt qua tán lá, đốm sáng lay động
    MORE.dapple = function (t, R) {
      if (t > 8) return true; var k = env(t, 1.5, 3.5, 3);
      for (var i = 0; i < 18; i++) { var x = R[i] * W + Math.sin(t * 0.8 + i) * 14, y = R[i + 18] * H + Math.cos(t * 0.6 + i) * 10, r = 20 + R[i + 36] * 50; var gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, rgba('#fff1c4', (C.dark ? 0.16 : 0.32) * k * (0.6 + 0.4 * Math.sin(t * 2 + i)))); gr.addColorStop(1, rgba('#fff1c4', 0)); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
      return false;
    };
    // cầu rung dữ dội, hụt chân rơi: trang rung rồi chìm vào bóng tối
    MORE.shake = function (t) {
      if (t > 3.2) { main.style.transform = ''; return true; }
      var a = t < 1.1 ? Math.min(1, t * 4) * (1 - t / 1.1 * 0.3) : 0;
      main.style.transform = a ? 'translate(' + (Math.sin(t * 60) * 5 * a).toFixed(1) + 'px,' + (Math.cos(t * 47) * 3 * a).toFixed(1) + 'px)' : '';
      var d = t < 1 ? 0 : t < 1.6 ? (t - 1) / 0.6 : Math.max(0, 1 - (t - 1.6) / 1.6);
      var gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, rgba('#05080a', 0.9 * d)); gr.addColorStop(1, rgba('#05080a', 0.3 * d)); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      return false;
    };
    // bóng tối cuối cây cầu đặc lại, dâng lên từ mép dưới
    MORE.darkend = function (t) {
      if (t > 6) return true; var k = env(t, 2, 1.5, 2.5);
      var gr = g.createLinearGradient(0, H, 0, H * (1 - 0.8 * k)); gr.addColorStop(0, rgba('#020405', 0.85 * k)); gr.addColorStop(1, rgba('#020405', 0)); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      return false;
    };
    // ổ khoá bật: một tiếng "cạch" lan thành vòng sáng
    MORE.unlock = function (t) {
      if (t > 2.4) return true; var cx = W / 2, cy = H * 0.5, col = C.dark ? '#f3c27a' : '#a8641f';
      for (var i = 0; i < 3; i++) { var u = (t - i * 0.18) / 1.6; if (u <= 0 || u > 1) continue; g.strokeStyle = rgba(col, 0.6 * (1 - u)); g.lineWidth = 2.5 * (1 - u) + 0.5; g.beginPath(); g.arc(cx, cy, 12 + u * Math.min(W, H) * 0.45, 0, 7); g.stroke(); }
      if (t < 0.5) { var gl = g.createRadialGradient(cx, cy, 0, cx, cy, 40); gl.addColorStop(0, rgba('#fff2c8', 0.8 * (1 - t / 0.5))); gl.addColorStop(1, rgba('#fff2c8', 0)); g.fillStyle = gl; g.fillRect(cx - 40, cy - 40, 80, 80); }
      return false;
    };
    // mưa sắp tới: trời sầm lại, vài hạt mưa xiên rơi qua trang
    MORE.rain = function (t, R) {
      if (t > 9) return true; var k = env(t, 2, 4.5, 2.5);
      wash(C.dark ? '#0a0f12' : '#5d666a', (C.dark ? 0.25 : 0.18) * k);
      g.strokeStyle = rgba(C.dark ? '#b8c7cc' : '#5a6a70', 0.45 * k); g.lineWidth = 1;
      for (var i = 0; i < 70; i++) { var sp = 0.9 + (i % 7) * 0.08, x = ((i * 37.3) % W + t * 60) % W, y = ((i * 91.7) % H + t * H * sp) % (H + 40) - 20; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 4, y + 14); g.stroke(); }
      return false;
    };
    // dấu ba chấm của tin nhắn đang gõ
    MORE.typing = function (t) {
      if (t > 5) return true; var k = env(t, 0.4, 3.8, 0.8), cx = W / 2, cy = H * 0.78, bw = 74, bh = 34;
      g.fillStyle = rgba(C.dark ? '#2a3538' : '#ffffff', 0.92 * k); g.beginPath(); g.ellipse(cx, cy, bw / 2, bh / 2, 0, 0, 7); g.fill();
      for (var d = 0; d < 3; d++) { var on = (t * 2.2 - d * 0.35) % 2.2, a = on > 0 && on < 0.9 ? Math.sin(on / 0.9 * Math.PI) : 0; g.fillStyle = rgba(C.dark ? '#cfd8d6' : '#5e6965', (0.3 + 0.7 * a) * k); g.beginPath(); g.arc(cx - 16 + d * 16, cy - a * 3, 4, 0, 7); g.fill(); }
      return false;
    };
    // giấc mơ trắng: trang trắng xoá, vài con số mờ đếm ngược
    MORE.whiteout = function (t) {
      if (t > 8) return true; var k = env(t, 2, 3, 3);
      wash(C.dark ? '#dfe4e2' : '#ffffff', 0.78 * k);
      var n = 7 - Math.floor(t / 0.9); if (n > 0 && t < 6.3) { var ph = (t % 0.9) / 0.9; g.fillStyle = rgba('#8b9692', 0.35 * Math.sin(ph * Math.PI) * k); g.font = '300 ' + Math.round(H * 0.12) + 'px Literata, Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(n), W / 2, H / 2); }
      return false;
    };
    // không khí gợn như mặt hồ bị thả sỏi (màu xanh băng), hoặc mặt nước gợn
    MORE.ripple = function (t) {
      if (t > 4.5) return true; var cx = W / 2, cy = H * 0.5, col = C.dark ? '#8fd3e0' : '#2e7484';
      for (var i = 0; i < 6; i++) { var u = (t - i * 0.35) / 2.6; if (u <= 0 || u > 1) continue; var r = u * Math.max(W, H) * 0.7; g.strokeStyle = rgba(col, 0.5 * (1 - u)); g.lineWidth = 1.5; g.beginPath(); g.ellipse(cx, cy, r, r * 0.42, 0, 0, 7); g.stroke(); }
      return false;
    };
    // bức tường trong suốt: một lớp kính lạnh, vệt sáng trượt ngang, sương giá bám mép
    MORE.frost = function (t) {
      if (t > 6) return true; var k = env(t, 1, 2.5, 2.5);
      wash(C.dark ? '#9fc1e6' : '#cfe0ea', (C.dark ? 0.07 : 0.22) * k);
      edge(C.dark ? '#cfe6ff' : '#ffffff', 0.55 * k, 0.35);
      var x = -W * 0.3 + ((t / 2.2) % 1.6) * W; var gr = g.createLinearGradient(x, 0, x + W * 0.25, H * 0.4); gr.addColorStop(0, rgba('#ffffff', 0)); gr.addColorStop(0.5, rgba('#ffffff', 0.35 * k)); gr.addColorStop(1, rgba('#ffffff', 0)); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      return false;
    };
    // cả cánh đồng cùng ngẩng lên: mép trang sập tối, đứng im, rồi buông
    MORE.hush = function (t) {
      if (t > 5) return true; var k = t < 0.25 ? t / 0.25 : t < 2.6 ? 1 : Math.max(0, 1 - (t - 2.6) / 2.4);
      edge('#000000', (C.dark ? 0.9 : 0.78) * k, 0.15);
      return false;
    };
    // ngọn lửa bùng lên cao vọt rồi dịu xuống
    MORE.flare = function (t) {
      if (t > 4) return true; var k = t < 0.3 ? t / 0.3 : Math.max(0, 1 - (t - 0.3) / 3.7);
      var gr = g.createRadialGradient(W / 2, H * 1.05, 0, W / 2, H * 1.05, H * (0.6 + 0.5 * k)); gr.addColorStop(0, rgba('#ffb35c', 0.55 * k)); gr.addColorStop(0.5, rgba('#e8892f', 0.22 * k)); gr.addColorStop(1, rgba('#e8892f', 0)); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      return false;
    };
    // trời hửng dần: đen sang xám sang trắng nhợt từ phía trên
    MORE.dawn = function (t) {
      if (t > 8) return true; var u = t / 8, d = 0.75 * Math.max(0, 1 - u * 1.8), l = Math.sin(Math.min(1, u * 1.3) * Math.PI) * 0.35;
      wash('#05080a', d);
      var gr = g.createLinearGradient(0, 0, 0, H * 0.7); gr.addColorStop(0, rgba(C.dark ? '#8a948f' : '#f4f1e6', l)); gr.addColorStop(1, rgba('#8a948f', 0)); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      return false;
    };
    // gió lạnh rạp ngọn mạ thành từng đợt sóng xanh
    MORE.wind = function (t, R) {
      if (t > 5) return true; var k = env(t, 0.6, 2.8, 1.6), col = C.dark ? '#7fa36c' : '#6d8f55';
      for (var i = 0; i < 26; i++) { var y = R[i] * H, sp = 0.35 + R[i + 26] * 0.3, x = ((t * sp + R[(i + 13) % 60]) % 1.3 - 0.15) * W, len = W * (0.08 + R[(i + 40) % 60] * 0.12); g.strokeStyle = rgba(col, 0.6 * k); g.lineWidth = 1.8; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + len / 2, y - 6 + Math.sin(t * 3 + i) * 4, x + len, y); g.stroke(); }
      return false;
    };
    // vết cào: bốn vệt dài song song xé ngang trang rồi mờ đi
    MORE.scratch = function (t) {
      if (t > 4) return true; var col = C.dark ? '#c9cfc9' : '#3a2a26', fade = t > 1.6 ? Math.max(0, 1 - (t - 1.6) / 2.4) : 1;
      for (var i = 0; i < 4; i++) { var u = Math.min(1, Math.max(0, (t - i * 0.05) / 0.22)); if (u <= 0) continue; var x0 = W * (0.3 + i * 0.09), y0 = H * 0.22, x1 = x0 + W * 0.12, y1 = H * 0.78; g.strokeStyle = rgba(col, 0.75 * fade); g.lineWidth = 3.5 - i * 0.4; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x0 + W * 0.04, (y0 + y1) / 2, x0 + (x1 - x0) * u, y0 + (y1 - y0) * u); g.stroke(); }
      return false;
    };
    // nước trong gàu gợn lên từng vòng đều đặn, như có bước chân nặng đang tới
    MORE.thud = function (t) {
      if (t > 6.5) return true; var col = C.dark ? '#a9c0bc' : '#3c5a58', fade = t > 4.8 ? Math.max(0, 1 - (t - 4.8) / 1.7) : 1;
      for (var i = 0; i < 6; i++) { var u = (t - i * 0.85) / 1.4; if (u <= 0 || u > 1) continue; var r = 8 + u * Math.min(W, H) * 0.3; g.strokeStyle = rgba(col, 0.55 * (1 - u) * fade); g.lineWidth = 1.4; g.beginPath(); g.ellipse(W / 2, H * 0.55, r, r * 0.38, 0, 0, 7); g.stroke(); }
      var beat = (t % 0.85) / 0.85; edge('#000000', 0.25 * Math.max(0, 1 - beat * 4) * fade, 0.35);
      return false;
    };
    // vết bầm tan dần: một quầng ấm toả ra, dịu đi
    MORE.heal = function (t) {
      if (t > 6) return true; var k = env(t, 1.5, 2, 2.5), p = 0.85 + 0.15 * Math.sin(t * 3);
      var gr = g.createRadialGradient(W / 2, H * 0.5, 0, W / 2, H * 0.5, Math.max(W, H) * 0.55 * p); gr.addColorStop(0, rgba('#f6e2a8', (C.dark ? 0.22 : 0.4) * k)); gr.addColorStop(1, rgba('#f6e2a8', 0)); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      return false;
    };
    // Góc nhìn khác ch05 (bà Mabel): bàn tay làm người ta dịu lại. Quầng tím ấm từ dưới lên, nhịp đập nhanh giần giật rồi chậm dần, êm hẳn.
    MORE.soothe = function (t) {
      if (t > 6.5) return true; var k = env(t, 0.8, 3.6, 2.1), col = C.dark ? '#c3a8ec' : '#8a6fb8';
      var rate = 9 - 7 * Math.min(1, t / 4), ph = t * rate, beat = Math.pow(Math.max(0, Math.sin(ph)), 6) * (1 - Math.min(1, t / 4.5) * 0.7);
      var r = Math.max(W, H) * (0.45 + 0.08 * beat), gr = g.createRadialGradient(W / 2, H * 1.02, 0, W / 2, H * 1.02, r);
      gr.addColorStop(0, rgba(col, (C.dark ? 0.32 : 0.28) * k)); gr.addColorStop(0.55, rgba(col, (C.dark ? 0.12 : 0.1) * k)); gr.addColorStop(1, rgba(col, 0)); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      edge(col, (0.18 + 0.12 * beat) * k, 0.4);
      return false;
    };
    // Góc nhìn khác ch05: Felix "chớp mắt một cái đã ở chỗ khác" (Chuyển hoá). Hai lần mi mắt sập xuống thật nhanh;
    // mỗi lần mở ra thì đoạn chữ đang đọc đã lệch sang chỗ khác, giữa hai chỗ còn một vệt sáng xanh nhạt như dư ảnh. Cuối cùng chữ về hàng.
    MORE.blink = function (t) {
      var ps = MORE._bps;
      if (!ps) ps = MORE._bps = [].slice.call(document.querySelectorAll('.scene p')).filter(function (p) { var r = p.getBoundingClientRect(); return p.offsetParent !== null && r.bottom > 0 && r.top < H; }).slice(0, 6);
      if (t > 2.6) { ps.forEach(function (p) { p.style.transform = ''; p.style.transition = ''; }); MORE._bps = null; return true; }
      var lids = [0.25, 1.05], shift = [0, 14, -18, 0], seg = t < 0.33 ? 0 : t < 1.13 ? 1 : t < 1.95 ? 2 : 3;
      ps.forEach(function (p) { p.style.transition = seg === 3 ? 'transform .5s cubic-bezier(.2,.7,.3,1)' : 'none'; p.style.transform = shift[seg] ? 'translateX(' + shift[seg] + 'px)' : ''; });
      lids.forEach(function (l) { var u = (t - l) / 0.16; if (u < 0 || u > 1) return; var c = Math.sin(u * Math.PI), hh = H * 0.5 * c;
        g.fillStyle = rgba('#05080a', C.dark ? 0.92 : 0.82); g.fillRect(0, 0, W, hh); g.fillRect(0, H - hh, W, hh); });
      [[0.33, -1], [1.13, 1]].forEach(function (s) { var u = (t - s[0]) / 0.6; if (u < 0 || u > 1) return; var x0 = W / 2 - s[1] * W * 0.18, x1 = W / 2 + s[1] * W * 0.18, y = H * 0.5;
        var gr = g.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, rgba('#b9f0cf', 0)); gr.addColorStop(1, rgba('#b9f0cf', (C.dark ? 0.55 : 0.7) * (1 - u))); g.fillStyle = gr; g.fillRect(Math.min(x0, x1), y - 2, Math.abs(x1 - x0), 4);
        var gl = g.createRadialGradient(x1, y, 0, x1, y, 40); gl.addColorStop(0, rgba('#e6fff0', 0.6 * (1 - u))); gl.addColorStop(1, rgba('#e6fff0', 0)); g.fillStyle = gl; g.fillRect(x1 - 40, y - 40, 80, 80); });
      return false;
    };
    // Góc nhìn khác ch11 (Mira, Vein): da mỏng đi như tờ giấy dầu, mạch máu đỏ thẫm bò vào từ mép trang như rễ cây dưới lớp đất mỏng,
    // phập phồng theo một nhịp đều; rồi tan. Không vẽ người, chỉ mạch.
    MORE.vein = function (t, R) {
      if (t > 6.5) return true; var k = env(t, 1.2, 3.2, 2.1), col = C.dark ? '#E2566C' : '#B3263A', grow = Math.min(1, t / 1.8);
      var beat = Math.pow(Math.max(0, Math.sin(t * Math.PI * 2 / 1.1)), 8);
      wash(C.dark ? '#3a1418' : '#f3d9d6', (C.dark ? 0.16 : 0.22) * k);
      g.lineCap = 'round'; g.shadowColor = rgba(col, 0.8);
      function br(x, y, a, len, w, d, s) {
        var n = 6, px = x, py = y; g.lineWidth = w * (1 + 0.35 * beat); g.strokeStyle = rgba(col, (0.32 + 0.26 * beat) * k); g.shadowBlur = 4 + 6 * beat;
        g.beginPath(); g.moveTo(px, py);
        for (var j = 1; j <= n; j++) { if (j / n > grow) break; a += (R[(s + j * 7) % 60] - 0.5) * 0.7; px += Math.cos(a) * len / n; py += Math.sin(a) * len / n; g.lineTo(px, py); }
        g.stroke();
        if (d > 0 && grow > 0.45) { br(px, py, a - 0.5, len * 0.6, w * 0.65, d - 1, s + 13); br(px, py, a + 0.45, len * 0.55, w * 0.6, d - 1, s + 29); }
      }
      // Clair 25/11: mạch chỉ bò ở hai mép, không đè lên chữ (điện thoại: ngắn hẳn, mờ hơn)
      var L = W < 700 ? W * 0.09 : Math.min(W * 0.14, 150);
      for (var i = 0; i < 6; i++) { var u = (i + 0.5) / 6;
        br(0, H * u, (R[i] - 0.5) * 0.6, L, 2.6, 2, i * 5); br(W, H * (1 - u), Math.PI + (R[i + 10] - 0.5) * 0.6, L, 2.6, 2, i * 5 + 3);
      }
      g.shadowBlur = 0;
      edge(col, (0.1 + 0.12 * beat) * k, 0.45);
      return false;
    };
    // ch12: trần hầm sập: trang rung giật, bụi đá đổ ào từ mép trên, rồi tối sập
    MORE.cavein = function (t, R) {
      if (t > 5) { main.style.transform = ''; return true; }
      var a = t < 1.6 ? Math.min(1, t * 5) * (1 - t / 1.6 * 0.4) : 0;
      main.style.transform = a ? 'translate(' + (Math.sin(t * 53) * 7 * a).toFixed(1) + 'px,' + (Math.cos(t * 41) * 5 * a).toFixed(1) + 'px)' : '';
      var col = C.dark ? '#8a8478' : '#6a6258';
      for (var i = 0; i < 60; i++) { var st = R[i % 60] * 0.9, u = t - st; if (u < 0) continue; var x = R[(i * 7) % 60] * W, y = -20 + u * u * H * 1.4, r = 2 + R[(i * 3) % 60] * (i % 6 ? 6 : 18); if (y > H + 30) continue; g.fillStyle = rgba(col, 0.85); g.beginPath(); g.ellipse(x, y, r, r * 0.8, i, 0, 7); g.fill(); }
      var dust = t < 1.2 ? t / 1.2 : Math.max(0, 1 - (t - 1.2) / 3.5); var gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, rgba(C.dark ? '#5a554c' : '#b8ae9c', 0.7 * dust)); gr.addColorStop(1, rgba(C.dark ? '#5a554c' : '#b8ae9c', 0.15 * dust)); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      var d = t < 1.4 ? 0 : t < 2 ? (t - 1.4) / 0.6 : Math.max(0, 1 - (t - 2.6) / 2.4); wash('#020202', 0.92 * d);
      return false;
    };
    // xích cứu người của Leon (Clair chốt 24/11, hướng 1; bản dải dẹt trước đó Clair thấy xấu): cùng thứ thép đẹp của xích tấn công,
    // khác ở chuyển động. Không tối sập, không toé lửa, không rung trang. Một sợi xích lướt vào êm từ mép trái, vòng một vòng lỏng ôm lấy giữa trang,
    // ôm vào vừa đủ (không siết), một vệt sáng ấm chạy quanh vòng; trang được nhấc lên rồi đặt xuống chậm; vòng nới ra, xích rút về.
    //   rescue     = cứu được
    //   rescuehold = cứu không nổi (ch12 Talia): vòng ôm nhưng kéo không lên, căng rung, trang nhích lên rồi tụt lại
    //   rescuedrop = người được cứu tự gỡ ra (ch12 Talia): vòng bung từ đầu xích, mắt xích rơi lả tả xuống
    function cl(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
    function es(x) { x = cl(x); return x * x * (3 - 2 * x); }
    // o: t, reach (0..1 phần xích đang hiện), hug (0 vòng rộng → 1 ôm vừa), dy, vib, glow (0..1 vệt sáng chạy quanh vòng, <0 = không), fall(u) (u: 0 gốc → 1 đầu xích), alpha
    function hugChain(o) {
      if (o.reach <= 0 || o.alpha <= 0) return;
      var m = Math.min(W, H), link = Math.max(12, m * 0.034), lw = Math.max(2.4, link * 0.28), sp = link * 0.95;
      var cx = W / 2, cy = H * 0.52 + o.dy, R = m * (0.3 - 0.07 * o.hug), Ry = R * 0.42;
      var sx = -W * 0.06, sy = cy + H * 0.12, ex = cx - R, ey = cy;      // sợi dẫn: từ mép trái lên tới mép trái của vòng
      var Ls = Math.hypot(ex - sx, ey - sy), Lr = Math.PI * (3 * (R + Ry) - Math.sqrt((3 * R + Ry) * (R + 3 * Ry))) * 1.04, L = Ls + Lr;
      function at(d) {
        if (d < Ls) { var s = d / Ls, bow = Math.sin(Math.PI * s) * link * 1.2; return [sx + (ex - sx) * s, sy + (ey - sy) * s + bow, Math.atan2(ey - sy, ex - sx)]; }
        var a = Math.PI + (d - Ls) / Lr * 6.283 * 1.04, w = Math.sin(o.t * 46 + a * 3) * (o.vib || 0);   // vòng đi theo chiều kim đồng hồ: lên trên rồi vòng qua phải
        return [cx + Math.cos(a) * (R + w), cy + Math.sin(a) * (Ry + w * 0.5), a + Math.PI / 2];
      }
      function linkAt(x, y, ang, face, a) {
        g.save(); g.translate(x, y); g.rotate(ang); g.globalAlpha = a;
        var rx = link * 0.62, ry = face ? link * 0.36 : link * 0.13;
        if (C.dark) {
          g.shadowColor = 'rgba(200,185,175,.22)'; g.shadowBlur = link * 0.5;
          var sg = g.createLinearGradient(0, -ry - lw, 0, ry + lw); sg.addColorStop(0, '#858a8c'); sg.addColorStop(0.35, '#42464a'); sg.addColorStop(1, '#1e2224');
          g.lineWidth = lw * 1.25; g.strokeStyle = sg; g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, 7); g.stroke(); g.shadowBlur = 0;
          g.lineWidth = Math.max(0.8, lw * 0.22); g.strokeStyle = 'rgba(236,228,222,.78)'; g.beginPath(); g.ellipse(0, -lw * 0.35, rx * 0.95, Math.max(1, ry * 0.9), 0, 3.75, 5.55); g.stroke();
          g.lineWidth = Math.max(0.6, lw * 0.15); g.strokeStyle = 'rgba(170,160,155,.35)'; g.beginPath(); g.ellipse(0, lw * 0.3, rx * 0.9, Math.max(1, ry * 0.85), 0, 0.5, 2.6); g.stroke();
        } else {
          g.lineWidth = lw * 1.5; g.strokeStyle = '#1b1f21'; g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, 7); g.stroke();
          g.lineWidth = lw * 0.45; g.strokeStyle = '#9aa2a4'; g.beginPath(); g.ellipse(0, -lw * 0.2, rx * 0.92, Math.max(1, ry * 0.85), 0, 3.5, 5.9); g.stroke();
        }
        g.restore();
      }
      var n = Math.floor(L / sp), shown = Math.floor(n * o.reach);
      g.save(); g.lineCap = 'round';
      // quầng ấm rất nhẹ trong lòng vòng (chỗ người được ôm lấy)
      var hk = es((o.reach * L - Ls) / Lr) * o.alpha, gl = g.createRadialGradient(cx, cy, 0, cx, cy, R * 1.1);
      gl.addColorStop(0, 'rgba(240,220,205,' + ((C.dark ? 0.12 : 0.18) * hk).toFixed(3) + ')'); gl.addColorStop(1, 'rgba(240,220,205,0)'); g.fillStyle = gl; g.fillRect(cx - R * 1.2, cy - R * 1.2, R * 2.4, R * 2.4);
      for (var k = 0; k < shown; k++) {
        var p = at(k * sp), u = k / n, a = Math.min(1, (shown - k) / 3) * o.alpha, ang = p[2], f = o.fall ? o.fall(u) : 0;
        if (f > 0) { p = [p[0] + Math.sin(k * 1.7) * f * link * 2.5, p[1] + f * f * H * 0.6]; ang += Math.sin(k * 2.3) * f * 3; a *= 1 - cl((f - 0.55) / 0.45); }
        if (a > 0.01) linkAt(p[0], p[1], ang, k % 2 === 0, a);
      }
      // vệt sáng ấm chạy một lượt quanh vòng
      if (o.glow > 0 && o.glow < 1) {
        var q = at(Ls + o.glow * Lr * 0.98), gr = g.createRadialGradient(q[0], q[1], 0, q[0], q[1], link * 1.8), ga = Math.sin(Math.PI * o.glow) * o.alpha;
        gr.addColorStop(0, 'rgba(255,238,222,' + (0.5 * ga).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(255,238,222,0)'); g.fillStyle = gr; g.fillRect(q[0] - link * 3, q[1] - link * 3, link * 6, link * 6);
      }
      g.restore();
    }
    MORE.rescue = function (t) {
      if (t > 4) { main.style.transform = ''; return true; }
      var lift = es((t - 0.9) / 0.4) * (1 - es((t - 2) / 1.2));
      main.style.transform = lift > 0.01 ? 'translateY(' + (-lift * 16).toFixed(1) + 'px)' : '';
      hugChain({ t: t, reach: es(t / 0.7) - es((t - 3.1) / 0.8), hug: es((t - 0.6) / 0.5) * (1 - es((t - 2.8) / 0.5)), dy: -lift * 12, glow: (t - 0.8) / 1.1, alpha: 1 });
      return false;
    };
    MORE.rescuehold = function (t) {
      if (t > 6.5) { main.style.transform = ''; return true; }
      var on = es((t - 0.8) / 0.5), fade = 1 - es((t - 5.3) / 1.2), lift = on * (0.5 + 0.5 * Math.sin(t * 2.6)) * 7 * fade;
      main.style.transform = lift > 0.3 ? 'translateY(' + (-lift).toFixed(1) + 'px)' : '';
      hugChain({ t: t, reach: es(t / 0.7), hug: es((t - 0.6) / 0.5), dy: -lift, vib: on * (0.5 + 2 * cl(t / 4)), glow: (t - 0.8) / 1.1, alpha: fade });
      return false;
    };
    MORE.rescuedrop = function (t) {
      if (t > 3.8) { main.style.transform = ''; return true; }
      var drop = es((t - 0.8) / 0.5);
      main.style.transform = t > 0.8 && t < 2.4 ? 'translateY(' + (drop * 6 * (1 - es((t - 1.4) / 1))).toFixed(1) + 'px)' : '';
      hugChain({ t: t, reach: es(t / 0.3), hug: 1 - es((t - 0.6) / 0.4), dy: 0, vib: t < 0.6 ? 2.5 : 0, glow: -1, alpha: 1,
        fall: function (u) { return cl((t - 0.7 - (1 - u) * 0.9) / 1.4); } });   // bung từ đầu xích (phía người được cứu) về phía Leon
      return false;
    };
    // ch15 (Clair 26/11 bỏ tranh + tương tác cái kén): hiệu ứng xích riêng của Leon: ba vòng xích quất ra từ mép trái, quấn chồng lên nhau giữa trang,
    // siết lại, rung căng như có thứ gì gồng bên trong, loé xám thép một nhịp rồi lặng đi
    MORE.bind15 = function (t) {
      if (t > 4.6) { main.style.transform = ''; return true; }
      var strain = es((t - 1.3) / 0.3) * (1 - es((t - 3) / 0.5)), sh = strain * (0.5 + 0.5 * Math.sin(t * 5)), fade = 1 - es((t - 3.7) / 0.8);
      main.style.transform = sh > 0.05 ? 'translate(' + (Math.sin(t * 90) * 5 * sh).toFixed(1) + 'px,' + (Math.cos(t * 77) * 3 * sh).toFixed(1) + 'px)' : '';
      edge('#2a3236', 0.55 * fade, 0.25);
      for (var i = 0; i < 3; i++) hugChain({ t: t, reach: es((t - i * 0.22) / 0.45), hug: es((t - 0.5 - i * 0.18) / 0.35) * 1.15, dy: (i - 1) * Math.min(W, H) * 0.1, vib: sh * 3, glow: -1, alpha: fade });
      var fl = Math.max(0, 1 - Math.abs(t - 1.25) / 0.18); if (fl > 0) wash('#d6e0e2', 0.22 * fl);
      return false;
    };
    // ch12: thẻ Remedy vỡ thành ánh sáng xanh non, ấm, dịu; những đốm sáng bay lên
    MORE.remedy = function (t, R) {
      if (t > 6) return true; var k = env(t, 0.8, 2.4, 2.8), col = C.dark ? '#bfe8a8' : '#6fae52';
      var gr = g.createRadialGradient(W / 2, H * 0.55, 0, W / 2, H * 0.55, Math.max(W, H) * 0.6); gr.addColorStop(0, rgba(col, (C.dark ? 0.3 : 0.35) * k)); gr.addColorStop(1, rgba(col, 0)); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      for (var i = 0; i < 40; i++) { var x = W * (0.3 + R[i % 60] * 0.4) + Math.sin(t * 1.5 + i) * 18, y = H * (0.75 - ((R[(i * 3) % 60] + t * 0.15) % 1) * 0.7); g.fillStyle = rgba(col, 0.7 * k * (0.5 + 0.5 * Math.sin(t * 3 + i))); g.beginPath(); g.arc(x, y, 1.5 + (i % 3), 0, 7); g.fill(); }
      return false;
    };
    // nắng trưa gắt và trắng: chói loá, không khí run run
    // ch13: nét mực loang ra rồi sẫm dần như giọt nước rơi xuống giấy thấm (dấu trên bản đồ đậm lên)
    MORE.ink = function (t, R) {
      if (t > 4.5) return true;
      var cx = W * (0.35 + R[0] * 0.3), cy = H * 0.5, m = Math.min(W, H), grow = 1 - Math.pow(1 - Math.min(1, t / 2.2), 3), fade = t < 3 ? 1 : Math.max(0, 1 - (t - 3) / 1.5);
      var ink = C.dark ? '#c9d4dc' : '#1a1410';
      for (var k = 0; k < 3; k++) {
        var r = m * (0.08 + k * 0.05) * grow; g.fillStyle = rgba(ink, (C.dark ? 0.07 : 0.1) * fade * (1 - k * 0.25)); g.beginPath();
        for (var i = 0; i <= 40; i++) { var a = i / 40 * 6.283, q = r * (0.85 + 0.15 * Math.sin(a * 5 + R[k + 1] * 6) + 0.08 * Math.sin(a * 11 + k)); g.lineTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q * 0.8); }
        g.fill();
      }
      g.strokeStyle = rgba(ink, 0.5 * fade * Math.min(1, t / 1.5)); g.lineWidth = 1.2; g.beginPath(); for (var j = 0; j <= 40; j++) { var b = j / 40 * 6.283, rq = m * 0.18 * grow * (0.9 + 0.1 * Math.sin(b * 7)); g.lineTo(cx + Math.cos(b) * rq, cy + Math.sin(b) * rq * 0.8); } g.stroke();
      return false;
    };
    // ch13: Clevia nhắm mắt lần tìm cái chỗ ấy trong mình: trang tối lại, một vòng đỏ rượu mờ nhói lên ba lần ở giữa, mỗi lần nhạt hơn, không khớp, rồi tắt hẳn
    MORE.seek = function (t) {
      if (t > 5) return true;
      wash('#020202', 0.5 * env(t, 0.8, 3.2, 1));
      for (var i = 0; i < 3; i++) { var st = 0.4 + i * 1.1, u = t - st; if (u < 0 || u > 1.1) continue; var a = Math.sin(u / 1.1 * Math.PI) * (0.55 - i * 0.15), r = Math.min(W, H) * (0.12 + u * 0.05);
        g.strokeStyle = rgba(C.dark ? '#E8869B' : '#8E2238', a); g.lineWidth = 1.6; g.beginPath(); g.arc(W / 2, H * 0.5, r, -1.2 + i * 0.7, 4.2 + i * 0.7); g.stroke(); }
      return false;
    };
    // ch13: mặt kính loé lên một vệt sáng đỏ của lửa lò: một vạch sáng mảnh lướt ngang giữa trang
    MORE.glint = function (t) {
      if (t > 1.4) return true;
      var k = Math.sin(Math.min(1, t / 0.9) * Math.PI), y = H * 0.48, x = W * (0.2 + t / 1.4 * 0.6);
      var gr = g.createLinearGradient(x - W * 0.3, 0, x + W * 0.3, 0); gr.addColorStop(0, rgba('#ff6a3a', 0)); gr.addColorStop(0.5, rgba('#ffb08a', 0.7 * k)); gr.addColorStop(1, rgba('#ff6a3a', 0));
      g.fillStyle = gr; g.fillRect(0, y - 1.5, W, 3);
      var gl = g.createRadialGradient(x, y, 0, x, y, W * 0.12); gl.addColorStop(0, rgba('#ff8a5a', 0.35 * k)); gl.addColorStop(1, rgba('#ff8a5a', 0)); g.fillStyle = gl; g.fillRect(x - W * 0.12, y - W * 0.12, W * 0.24, W * 0.24);
      return false;
    };
    // ch13: một cơn gió thổi qua lán, cuốn lớp tro mịn bay ngang trang; dấu giày ở mép dưới nhoè dần rồi biến mất
    MORE.ashwind = function (t, R) {
      if (t > 4.5) return true;
      var col = C.dark ? '#8a8680' : '#7a756c', fade = t < 3.2 ? 1 : Math.max(0, 1 - (t - 3.2) / 1.3);
      for (var i = 0; i < 90; i++) { var st = R[i % 60] * 1.2, u = t - st; if (u < 0) continue; var x = -30 + u * W * (0.5 + R[(i * 7) % 60] * 0.6), y = H * (0.25 + R[(i * 3) % 60] * 0.75) + Math.sin(u * 3 + i) * 14 - u * 20; if (x > W + 20) continue; g.fillStyle = rgba(col, 0.55 * fade); g.fillRect(x, y, 2 + (i % 3), 1.2); }
      var pr = Math.max(0, 1 - t / 2.6); for (var f = 0; f < 5; f++) { var px = W * (0.2 + f * 0.15), py = H * (0.86 + (f % 2) * 0.05); g.fillStyle = rgba('#000000', (C.dark ? 0.35 : 0.2) * pr); g.beginPath(); g.ellipse(px + (1 - pr) * 20, py, 13 + (1 - pr) * 10, 7, 0, 0, 7); g.fill(); }
      return false;
    };
    // ch13: Leon bước sang ngang một bước: một mảng thép xám trượt từ mép phải vào chắn giữa trang, đứng một nhịp rồi lùi
    MORE.stepin = function (t) {
      if (t > 2.8) return true;
      var u = t < 0.35 ? 1 - Math.pow(1 - t / 0.35, 3) : 1, out = t > 1.9 ? (t - 1.9) / 0.9 : 0, x = W - W * 0.42 * u + W * 0.42 * out * out;
      var gr = g.createLinearGradient(x, 0, x + W * 0.3, 0); gr.addColorStop(0, rgba(C.dark ? '#9aa6ac' : '#4a5258', 0)); gr.addColorStop(0.25, rgba(C.dark ? '#9aa6ac' : '#4a5258', 0.22)); gr.addColorStop(1, rgba(C.dark ? '#5a6468' : '#2a3034', 0.32));
      g.fillStyle = gr; g.fillRect(x, 0, W - x, H);
      g.strokeStyle = rgba(C.dark ? '#c9d3d8' : '#262c30', 0.6 * (1 - out)); g.lineWidth = 2; g.beginPath(); g.moveTo(x + W * 0.07, 0); g.lineTo(x + W * 0.07, H); g.stroke();
      return false;
    };
    MORE.heat = function (t) {
      if (t > 7) return true; var k = env(t, 1.5, 3, 2.5);
      wash('#fff8e4', (C.dark ? 0.16 : 0.42) * k);
      for (var i = 0; i < 6; i++) { var y = H * (0.15 + i * 0.15) + Math.sin(t * 2 + i) * 6; var gr = g.createLinearGradient(0, y - 10, 0, y + 10); gr.addColorStop(0, rgba('#ffffff', 0)); gr.addColorStop(0.5, rgba('#ffffff', 0.12 * k * (0.5 + 0.5 * Math.sin(t * 5 + i)))); gr.addColorStop(1, rgba('#ffffff', 0)); g.fillStyle = gr; g.fillRect(0, y - 10, W, 20); }
      return false;
    };

    /* chương 11 */
    // con số mười lăm hiện lên mờ to giữa trang rồi ánh sáng trắng phủ hết
    MORE.tally = function (t) {
      if (t > 6.5) return true;
      var a = t < 0.6 ? t / 0.6 : t < 1.8 ? 1 : Math.max(0, 1 - (t - 1.8) / 0.8);
      g.fillStyle = rgba(C.dark ? '#d9cfae' : '#3a3024', 0.55 * a); g.font = '300 ' + Math.round(H * 0.3) + 'px Literata, Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('15', W / 2, H / 2);
      var wk = t < 1.6 ? 0 : t < 2.4 ? (t - 1.6) / 0.8 : Math.max(0, 1 - (t - 3.2) / 3.3);
      wash(C.dark ? '#e8ecea' : '#ffffff', 0.85 * Math.min(1, wk));
      return false;
    };
    // dải băng trắng lay trong gió, vắt ngang mép dưới trang
    MORE.ribbon = function (t) {
      if (t > 6) return true; var k = env(t, 0.8, 3.4, 1.8), col = C.dark ? '#d8d4c8' : '#bdb6a6';
      g.strokeStyle = rgba(col, 0.8 * k); g.lineWidth = Math.max(4, H * 0.012); g.lineCap = 'round'; g.beginPath();
      for (var i = 0; i <= 40; i++) { var u = i / 40, x = W * (-0.02 + u * 0.75), y = H * (0.8 - u * 0.1) + Math.sin(t * 3 - u * 7) * H * 0.04 * u + Math.sin(t * 7 - u * 11) * H * 0.008 * u; i ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.stroke(); return false;
    };
    // sợi xích bò từ mép dưới vào giữa trang, rồi bóng tối nuốt dần
    MORE.creep = function (t) {
      if (t > 8) return true; var col = C.dark ? '#a9b4b4' : '#3a4442', link = Math.max(9, H * 0.022), L = Math.min(1, t / 3) * H * 0.55, n = Math.floor(L / link), fade = t > 6.5 ? 1 - (t - 6.5) / 1.5 : 1;
      g.save(); g.globalAlpha = Math.max(0, fade); g.strokeStyle = C.dark ? '#d6e0e2' : col; g.lineWidth = Math.max(1.4, W / 320); if (C.dark) { g.shadowColor = 'rgba(180,205,215,.7)'; g.shadowBlur = 8; }
      for (var k = 0; k < n; k++) { var u = k / Math.max(1, n), x = W * 0.3 + k * link * 0.45 + Math.sin(k * 0.5 - t * 2) * link * 0.8, y = H + 6 - k * link * 0.85; g.save(); g.translate(x, y); g.rotate(0.5 + Math.sin(k * 0.5 - t * 2) * 0.2); g.beginPath(); if (k % 2) g.ellipse(0, 0, link * 0.12, link * 0.6, 0, 0, 7); else g.ellipse(0, 0, link * 0.32, link * 0.6, 0, 0, 7); g.stroke(); g.restore(); }
      g.restore();
      var d = t < 3 ? 0 : Math.min(1, (t - 3) / 3) * (t > 6.5 ? Math.max(0, 1 - (t - 6.5) / 1.5) : 1);
      var gr = g.createRadialGradient(W * 0.55, H * 0.45, Math.min(W, H) * 0.05, W * 0.55, H * 0.45, Math.max(W, H) * 0.7); gr.addColorStop(0, rgba('#000000', 0.9 * d)); gr.addColorStop(0.5, rgba('#000000', 0.5 * d)); gr.addColorStop(1, rgba('#000000', 0.85 * d)); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      return false;
    };

    /* chương 14 */
    // chuông ngân: một chấm sáng xanh băng ở góc trái, rồi từng vòng sóng lan ra khắp trang, chữ khẽ rung theo nhịp
    MORE.bellwave = function (t) {
      var ps = MORE._wps;
      if (!ps) ps = MORE._wps = [].slice.call(document.querySelectorAll('.scene p')).filter(function (p) { var r = p.getBoundingClientRect(); return p.offsetParent !== null && r.bottom > 0 && r.top < H; }).slice(0, 7);
      if (t > 7) { ps.forEach(function (p) { p.style.transform = ''; }); MORE._wps = null; return true; }
      var cx = W * 0.22, cy = H * 0.4, m = Math.max(W, H), ice = C.dark ? '#9fd4ea' : '#2a7aa0';
      edge('#000000', (C.dark ? 0.45 : 0.25) * env(t, 0.5, 5, 1.5), 0.3);
      glow(cx, cy, m * 0.08, ice, 0.6 * env(t, 0.2, 1, 2));
      for (var i = 0; i < 6; i++) { var u = t - i * 0.7; if (u < 0 || u > 3.2) continue; var ph = u / 3.2, r = ph * m * 1.3; g.strokeStyle = rgba(ice, (C.dark ? 0.55 : 0.45) * (1 - ph)); g.lineWidth = 1.2 + (1 - ph) * 2.5; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke(); }
      ps.forEach(function (p, i) { var r = p.getBoundingClientRect(), d = Math.hypot(r.left + r.width / 2 - cx, r.top + r.height / 2 - cy), a = 0; for (var k = 0; k < 6; k++) { var u = t - k * 0.7, front = u / 3.2 * m * 1.3; if (u > 0 && Math.abs(front - d) < 40) a = Math.max(a, (1 - Math.abs(front - d) / 40) * (1 - u / 3.2)); } p.style.transform = a > 0.01 ? 'translateY(' + (Math.sin(t * 40 + i) * 1.4 * a).toFixed(2) + 'px)' : ''; });
      return false;
    };
    // những cặp đốm đỏ ở mép dưới tắt dần từng cặp một, từ trái sang phải
    MORE.eyesout = function (t, R) {
      if (t > 6) return true;
      var a0 = env(t, 0.6, 4.6, 0.8);
      for (var e = 0; e < 16; e++) { var x = W * (0.06 + e / 16 * 0.9 + (R[e] - 0.5) * 0.04), y = H * (0.78 + R[e + 16] * 0.16), off = 0.8 + e * 0.22, a = t < off ? 1 : Math.max(0, 1 - (t - off) / 0.35), s = Math.max(2, H * 0.006); if (a <= 0) continue; g.fillStyle = rgba('#e0322a', 0.85 * a * a0); g.fillRect(x - s * 1.6, y, s, s); g.fillRect(x + s * 0.6, y, s, s); glow(x, y, s * 7, '#e0322a', 0.12 * a * a0); }
      return false;
    };
    // ngọn đèn chao đi hai lần rồi tắt phụt: trang tối sập xuống, một sợi khói mảnh
    MORE.lampout = function (t) {
      if (t > 4) return true;
      var fl = t < 0.35 ? 1 : t < 0.5 ? 0.3 : t < 0.8 ? 0.9 : t < 0.95 ? 0.2 : t < 1.1 ? 0.7 : 0, x = W * 0.86, y = H * 0.22, lamp = C.dark ? '#ffcf7a' : '#c88a20';
      if (fl > 0) glow(x, y, Math.min(W, H) * 0.25, lamp, 0.35 * fl);
      if (t > 1.1) { wash('#000000', (C.dark ? 0.55 : 0.4) * env(t - 1.1, 0.12, 1.6, 1.2)); g.strokeStyle = rgba('#9a9a94', 0.4 * Math.max(0, 1 - (t - 1.1) / 2.8)); g.lineWidth = 1; g.beginPath(); for (var i = 0; i < 30; i++) { var u = i / 29; g.lineTo(x + Math.sin(u * 8 + t * 2) * 6 * u, y - u * H * 0.2 * Math.min(1, (t - 1.1) / 1.5)); } g.stroke(); }
      return false;
    };
    // một bầu dục trắng mờ giữa trang nứt ra, từng con mắt đỏ mở, rồi tất cả cùng nhìn về một phía
    MORE.manyeyes = function (t, R) {
      if (t > 7.5) return true;
      var k = env(t, 0.6, 5.6, 1.3), cx = W / 2, cy = H * 0.45, rx = Math.min(W, H) * 0.16, ry = rx * 1.35;
      wash('#000000', (C.dark ? 0.6 : 0.45) * k);
      g.fillStyle = rgba(C.dark ? '#d8d8d0' : '#f0f0ea', 0.12 * k); g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, 7); g.fill();
      var n = Math.min(26, Math.floor(Math.max(0, t - 0.6) * 7)), look = t > 4.6 ? Math.min(1, (t - 4.6) / 0.4) : 0;
      for (var e = 0; e < n; e++) { var ex = cx + (R[e] - 0.5) * rx * 1.6, ey = cy + (R[e + 26] - 0.5) * ry * 1.6, o = Math.min(1, (t - 0.6 - e / 7) / 0.25), sz = Math.min(W, H) * 0.012;
        g.fillStyle = rgba('#ff3a2a', 0.9 * k); g.beginPath(); g.ellipse(ex, ey, sz * 1.5, sz * 0.9 * o, 0, 0, 7); g.fill();
        var px = look ? 0 : Math.sin(t * 3 + e * 2) * sz * 0.5, py = look ? sz * 0.35 * look : Math.cos(t * 2.4 + e) * sz * 0.3; g.fillStyle = rgba('#120202', 0.95 * k * o); g.fillRect(ex + px - sz * 0.12, ey + py - sz * 0.7 * o, sz * 0.24, sz * 1.4 * o); }
      return false;
    };

    /* chương 15 (Clair 26/11: cảnh combat phải xịn hơn bình thường: rung trang, tràn cả trang, nhiều lớp) */
    // mặt đầy mắt dùng chung: bầu dục trắng mờ, vương miện chuông, mắt đỏ; lx/ly hướng con ngươi (-1..1), dim = chìm nước
    function eyes15(cx, cy, s, t, R, a, lx, ly, dim, n) {
      g.fillStyle = rgba(C.dark ? '#d8d8d0' : '#f0f0ea', 0.12 * a); g.beginPath(); g.ellipse(cx, cy, s, s * 1.35, 0, 0, 7); g.fill();
      for (var b = 0; b < 15; b++) { var an = Math.PI * (0.1 + b / 14 * 0.8), x = cx + Math.cos(an) * s * 1.1, y = cy - s * 1.4 - Math.sin(an) * s * 0.45 + Math.sin(t * 7 + b) * 1.5 * (1 - dim), k = (0.4 + 0.6 * Math.abs(Math.sin(t * 2.6 + b * 1.7))) * (1 - dim * 0.85); g.fillStyle = rgba(C.dark ? '#b8aa7a' : '#9a8a5a', 0.85 * a * k); g.beginPath(); g.arc(x, y, Math.max(2, s * 0.05), 0, 7); g.fill(); }
      for (var e = 0; e < (n || 26); e++) { var ex = cx + (R[e % 60] - 0.5) * s * 1.6, ey = cy + (R[(e + 26) % 60] - 0.5) * s * 2.1, z = Math.max(2.2, s * 0.075);
        g.fillStyle = rgba('#ff3a2a', 0.92 * a * (1 - dim * 0.65)); g.beginPath(); g.ellipse(ex, ey, z * 1.5, z * 0.9, 0, 0, 7); g.fill();
        g.fillStyle = rgba('#120202', 0.95 * a); g.fillRect(ex + lx * z * 0.75 - z * 0.13, ey - z * 0.7 + ly * z * 0.35, z * 0.26, z * 1.4);
        if (!dim) glow(ex, ey, z * 5, '#ff3a2a', 0.08 * a); }
    }
    function chainLinks(pts, lk, a) {
      g.save(); g.globalAlpha = Math.max(0, a); g.strokeStyle = C.dark ? '#d6e0e2' : '#2e3638'; g.lineWidth = Math.max(1.6, lk * 0.22); if (C.dark) { g.shadowColor = 'rgba(180,205,215,.7)'; g.shadowBlur = 8; }
      for (var i = 0; i < pts.length; i++) { var p = pts[i], q = pts[Math.min(pts.length - 1, i + 1)], an = Math.atan2(q[1] - p[1], q[0] - p[0]); g.save(); g.translate(p[0], p[1]); g.rotate(an); g.beginPath(); g.ellipse(0, 0, lk * 0.5, lk * (i % 2 ? 0.12 : 0.3), 0, 0, 7); g.stroke(); g.restore(); }
      g.restore();
    }
    // tiếng "cạch" của chân ghế: mấy chục con mắt ở đầu trang cùng chao về phía người đọc
    MORE.eyesfollow = function (t, R) {
      if (t > 4.2) return true; var k = env(t, 0.4, 2.8, 1);
      edge('#000000', (C.dark ? 0.7 : 0.5) * k, 0.2);
      var turn = t < 0.7 ? 0 : Math.min(1, (t - 0.7) / 0.12), wob = t > 0.82 && t < 1.2 ? Math.sin((t - 0.82) * 40) * 0.15 : 0;
      eyes15(W / 2, H * 0.24, Math.min(W, H) * 0.13, t, R, k, -0.5 * turn + wob, turn, 0);
      return false;
    };
    // "Thế là đủ.": vòng xích quấn giữa trang lỏng ra, rơi tuột xuống như rơm khô
    MORE.slip = function (t, R) {
      if (t > 3) { main.style.transform = ''; return true; }
      var lk = Math.max(10, H * 0.024), cx = W / 2, cy = H * 0.42, fall = t < 0.35 ? 0 : (t - 0.35);
      quake(t < 0.3 ? (0.3 - t) / 0.3 * 0.5 : 0, t);
      edge('#000000', 0.6 * env(t, 0.1, 2, 0.9), 0.25);
      for (var r = 0; r < 6; r++) { var pts = [], rx = W * 0.2 * (1 + fall * 0.4), y0 = cy + (r - 2.5) * lk * 1.6 + fall * fall * H * (0.3 + r * 0.06); for (var c = 0; c <= 18; c++) { var an = c / 18 * Math.PI * 2; pts.push([cx + Math.cos(an) * rx * (1 + fall * R[r] * 0.5), y0 + Math.sin(an) * lk * (1 + fall * 3)]); } chainLinks(pts, lk, 1 - fall / 2.6); }
      return false;
    };
    // xích Leon quấn eo khối người khổng lồ, nhấc bổng, xoay nửa vòng, quăng vào đám mắt đỏ: bóng tối sập, vệt quăng, trang giật mạnh, loé đỏ
    MORE.yank = function (t, R) {
      if (t > 3.6) { main.style.transform = ''; return true; }
      var lk = Math.max(11, H * 0.026), ex = W * 0.5, ey = H * 0.22, ox = W * 1.02, oy = H * 0.98, dk = C.dark;
      wash('#000000', (dk ? 0.62 : 0.45) * env(t, 0.15, 2.6, 0.85));
      eyes15(ex, ey, Math.min(W, H) * 0.1, t, R, env(t, 0.2, 2.6, 0.8), 0, 1, 0, 20);
      // khối nặng (chỉ là một quầng tối nhoè), đi theo đường cong từ trái dưới lên đám mắt
      var u = t < 0.3 ? 0 : Math.min(1, (t - 0.3) / 0.75), e = u * u * (3 - 2 * u), sx = W * 0.22, sy = H * 0.78, bx = sx + (ex - sx) * e - Math.sin(e * Math.PI) * W * 0.15, by = sy + (ey - sy) * e - Math.sin(e * Math.PI) * H * 0.12;
      if (t < 1.25) { for (var tr = 0; tr < 6; tr++) { var ue = Math.max(0, e - tr * 0.05), tx = sx + (ex - sx) * ue - Math.sin(ue * Math.PI) * W * 0.15, ty = sy + (ey - sy) * ue - Math.sin(ue * Math.PI) * H * 0.12; g.fillStyle = rgba('#000000', 0.5 * (1 - tr / 6)); g.beginPath(); g.ellipse(tx, ty, W * 0.07, H * 0.05, e * 3, 0, 7); g.fill(); }
        g.fillStyle = dk ? '#0a0a0a' : '#1a1a1a'; g.beginPath(); g.ellipse(bx, by, W * 0.08, H * 0.055, e * 3, 0, 7); g.fill(); g.strokeStyle = rgba(dk ? '#6a7680' : '#3a4650', 0.5); g.lineWidth = 1.5; g.stroke(); }
      // xích: từ góc phải dưới lao tới quấn khối ấy, rồi kéo theo đường quăng
      var reach = Math.min(1, t / 0.25), pts = [], tgx = t < 1.25 ? bx : ex, tgy = t < 1.25 ? by : ey, slack = t > 1.25 ? Math.min(1, (t - 1.25) / 0.8) : 0;
      for (var m = 0; m <= 28; m++) { var v = m / 28 * reach; pts.push([ox + (tgx - ox) * v + Math.sin(v * 7 + t * 9) * 10 * (1 - v), oy + (tgy - oy) * v + slack * H * 0.25 * Math.sin(v * Math.PI)]); }
      if (t > 0.22 && t < 1.25) for (var c = 0; c < 12; c++) { var an = c / 12 * 6.283 + t * 8; pts.push([bx + Math.cos(an) * W * 0.085, by + Math.sin(an) * H * 0.03]); }
      chainLinks(pts, lk, t > 2.8 ? 1 - (t - 2.8) / 0.8 : 1);
      // va: loé đỏ, mắt toé, trang giật
      var hit = t - 1.05;
      if (hit > 0) { quake(hit < 0.5 ? (1 - hit / 0.5) : 0, t); if (hit < 0.4) { glow(ex, ey, Math.max(W, H) * 0.7 * (0.4 + hit), '#ff3a2a', 0.45 * (1 - hit / 0.4)); wash(dk ? '#ffffff' : '#ffffff', 0.25 * Math.max(0, 1 - hit / 0.12)); }
        g.strokeStyle = rgba('#ffd8d0', Math.max(0, 1 - hit / 0.6)); g.lineWidth = 2; for (var sp = 0; sp < 18; sp++) { var sa = R[sp] * 6.283, d = 40 + hit * 700 * (0.4 + R[sp + 18] * 0.6); g.beginPath(); g.moveTo(ex + Math.cos(sa) * d, ey + Math.sin(sa) * d); g.lineTo(ex + Math.cos(sa) * (d + 14), ey + Math.sin(sa) * (d + 14)); g.stroke(); } }
      return false;
    };
    // nó chạy: chuông rung thành một tràng liên hồi, đám mắt từ xa lao tới phình to, trang rung mỗi lúc một dữ, vạch tốc độ xé dọc trang
    MORE.rush = function (t, R) {
      if (t > 3.4) { main.style.transform = ''; return true; }
      var u = Math.min(1, t / 2.4), near = u * u, k = t > 2.6 ? Math.max(0, 1 - (t - 2.6) / 0.8) : 1, dk = C.dark;
      edge('#000000', (dk ? 0.8 : 0.6) * env(t, 0.2, 2.4, 0.8), 0.15 + 0.1 * (1 - near));
      g.strokeStyle = rgba(dk ? '#c8d0d0' : '#4a5254', 0.35 * k); g.lineWidth = 1; for (var s = 0; s < 40; s++) { var x = R[s] * W, y = ((R[s + 20] + t * (1.5 + R[s + 40])) % 1) * H, len = 20 + near * 120; g.beginPath(); g.moveTo(x, y - len); g.lineTo(x, y); g.stroke(); }
      eyes15(W / 2 + Math.sin(t * 9) * 8 * near, H * (0.12 + near * 0.33), Math.min(W, H) * (0.04 + near * 0.22), t * 2, R, k, 0, 1, 0);
      quake(near * 0.55 * k, t);
      return false;
    };
    // khiên Guard: hiện to giữa trang, những ngón tay xương đập vào ("choang"), vết nứt bò ra từ chỗ lõm, vỡ vụn thành mảnh sáng li ti tan đi; vạch đỏ rượu của Clevia
    MORE.guardbreak = function (t, R) {
      if (t > 3.4) { main.style.transform = ''; return true; }
      var cx = W / 2, cy = H * 0.5, r = Math.min(W, H) * 0.3 * (t < 0.25 ? 1 - Math.pow(1 - t / 0.25, 3) : 1), dk = C.dark, iron = dk ? '#d8ded6' : '#3a4240', wine = dk ? '#E8869B' : '#8E2238';
      var hitT = 0.75, br = 1.45, u = t - hitT;
      wash('#000000', (dk ? 0.55 : 0.35) * env(t, 0.2, 2.4, 0.8));
      if (t < br) {
        glow(cx, cy, r * 1.6, wine, 0.22 + (u > 0 ? 0.3 * Math.max(0, 1 - u / 0.3) : 0));
        g.save(); g.translate(cx + (u > 0 && u < 0.3 ? Math.sin(u * 90) * 6 * (1 - u / 0.3) : 0), cy);
        g.fillStyle = dk ? 'rgba(40,46,48,.85)' : 'rgba(80,88,86,.8)'; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill();
        g.strokeStyle = rgba(iron, 0.4); g.lineWidth = Math.max(2, r * 0.02); [-0.6, -0.3, 0, 0.3, 0.6].forEach(function (dx) { var hy = Math.sqrt(Math.max(0, 0.86 * 0.86 - dx * dx)) * r; g.beginPath(); g.moveTo(dx * r, -hy); g.lineTo(dx * r, hy); g.stroke(); });
        g.strokeStyle = rgba(iron, 0.95); g.lineWidth = Math.max(4, r * 0.08); g.beginPath(); g.arc(0, 0, r * 0.95, 0, 7); g.stroke();
        g.fillStyle = rgba(iron, 0.9); for (var k = 0; k < 12; k++) { var a = k / 12 * 6.283 - 1.57; g.beginPath(); g.arc(Math.cos(a) * r * 0.86, Math.sin(a) * r * 0.86, r * 0.035, 0, 7); g.fill(); }
        g.fillStyle = dk ? '#151a1c' : '#2a3032'; g.beginPath(); g.ellipse(r * 0.05, r * 0.05, r * 0.24, r * 0.18, 0, 0, 7); g.fill(); g.strokeStyle = rgba(iron, 0.7); g.lineWidth = 2; g.stroke();
        if (u > 0) { var grow = Math.min(1, u / 0.6); g.strokeStyle = rgba(dk ? '#fff4f6' : '#ffffff', 0.95); g.lineWidth = 2; g.shadowColor = wine; g.shadowBlur = 10; for (var c = 0; c < 9; c++) { var a0 = R[c] * 6.283, len = r * 0.95 * grow * (0.6 + R[c + 9] * 0.4), x = r * 0.05, y = r * 0.05; g.beginPath(); g.moveTo(x, y); for (var sgm = 1; sgm <= 5; sgm++) { var d = len * sgm / 5, j = (R[(c * 5 + sgm) % 60] - 0.5) * 0.5; g.lineTo(x + Math.cos(a0 + j) * d, y + Math.sin(a0 + j) * d); } g.stroke(); } g.shadowBlur = 0; }
        g.restore();
        // ba vệt ngón tay xương lao vào từ góc trên phải
        var cl = Math.min(1, Math.max(0, (t - 0.45) / 0.3)); if (t > 0.45 && t < hitT + 0.25) { var fa = t < hitT ? 1 : 1 - (t - hitT) / 0.25; g.strokeStyle = rgba('#f0f0e8', 0.9 * fa); g.lineWidth = 3; g.lineCap = 'round'; for (var f = 0; f < 3; f++) { var sx = W * 1.05, sy = -H * 0.05 + f * 30, ex2 = cx + r * 0.3 + f * 14, ey2 = cy - r * 0.4 + f * 18; g.beginPath(); g.moveTo(sx + (ex2 - sx) * Math.max(0, cl - 0.4), sy + (ey2 - sy) * Math.max(0, cl - 0.4)); g.lineTo(sx + (ex2 - sx) * cl, sy + (ey2 - sy) * cl); g.stroke(); } }
        if (u > 0 && u < 0.12) wash('#ffffff', 0.5 * (1 - u / 0.12));
        quake(u > 0 && u < 0.45 ? 1 - u / 0.45 : 0, t);
      } else {
        main.style.transform = '';
        var v = t - br; if (v < 0.12) wash('#ffffff', 0.4 * (1 - v / 0.12));
        for (var p = 0; p < 90; p++) { var pa = R[p % 60] * 6.283 + p, pr = r * Math.sqrt(R[(p * 7) % 60]), sp = 60 + R[(p * 3) % 60] * 260, x2 = cx + Math.cos(pa) * (pr + sp * v), y2 = cy + Math.sin(pa) * (pr + sp * v) - v * v * 60, al = Math.max(0, 1 - v / 1.8);
          g.fillStyle = rgba(p % 4 ? (dk ? '#f4f8f6' : '#5a6462') : wine, al); g.fillRect(x2, y2, 2 + (p % 3), 2 + (p % 3)); if (p % 6 === 0) glow(x2, y2, 10, dk ? '#ffffff' : wine, 0.25 * al); }
      }
      return false;
    };
    // bàn tay nước (Oscar): nước dâng từ mép dưới thành một cột, xoè năm ngón úp lên đám mắt, chuông chìm, tiếng lanh canh tắt; rồi khối nước thở phập phồng
    MORE.waterhand = function (t, R) {
      if (t > 9) return true;
      var dk = C.dark, wcol = dk ? '#8fd3e0' : '#2e7484', hi = dk ? '#e8fbff' : '#ffffff', cx = W / 2, ey = H * 0.3, s = Math.min(W, H) * 0.13, fade = t > 7.8 ? 1 - (t - 7.8) / 1.2 : 1;
      wash('#000000', (dk ? 0.6 : 0.4) * env(t, 0.4, 7.4, 1.2));
      var rise = Math.min(1, t / 0.9), grab = t < 0.9 ? 0 : Math.min(1, (t - 0.9) / 0.45), breath = t > 1.6 ? Math.sin((t - 1.6) * 2.2) : 0;
      var shake = grab && t < 3.2 ? Math.sin(t * 15) * 6 * (1 - (t - 0.9) / 2.3) : 0;
      eyes15(cx + shake, ey, s, t, R, fade, Math.sin(t * 9) * grab * 0.6, 0, grab);
      g.save(); g.globalAlpha = fade;
      // cột nước dâng từ mép dưới, gợn hai mép
      var colTop = H - (H - ey - s * 1.2) * rise, wd = W * 0.13;
      var cg = g.createLinearGradient(0, ey, 0, H); cg.addColorStop(0, rgba(wcol, dk ? 0.55 : 0.5)); cg.addColorStop(1, rgba(wcol, 0.15)); g.fillStyle = cg;
      g.beginPath(); g.moveTo(cx - wd, H); for (var y = H; y >= colTop; y -= 10) g.lineTo(cx - wd * (0.7 + 0.3 * (y - colTop) / H) - Math.sin(y * 0.03 + t * 3) * 7, y);
      for (var y2 = colTop; y2 <= H; y2 += 10) g.lineTo(cx + wd * (0.7 + 0.3 * (y2 - colTop) / H) + Math.sin(y2 * 0.03 + t * 3 + 1) * 7, y2); g.closePath(); g.fill(); g.strokeStyle = rgba(hi, 0.4); g.lineWidth = 1.2; g.stroke();
      if (rise >= 1) {
        // lòng bàn tay nước: một khối bầu dục trong suốt úp trùm mặt, phồng xẹp theo nhịp thở
        var pr = s * (1.25 + breath * 0.06) * (0.6 + 0.4 * grab), py = ey + shake * 0.2;
        var pg = g.createRadialGradient(cx, py, pr * 0.2, cx, py, pr * 1.5); pg.addColorStop(0, rgba(wcol, 0.32 * grab)); pg.addColorStop(0.8, rgba(wcol, 0.5 * grab)); pg.addColorStop(1, rgba(wcol, 0)); g.fillStyle = pg;
        g.beginPath(); g.ellipse(cx + shake, py, pr * 1.15, pr * 1.45, 0, 0, 7); g.fill(); g.strokeStyle = rgba(hi, 0.55 * grab); g.lineWidth = 1.6; g.stroke();
        // bốn ngón vắt qua đỉnh đầu, ngón cái ôm bên má
        g.lineCap = 'round';
        for (var f = 0; f < 4; f++) { var fx = cx + shake + (f - 1.5) * pr * 0.42, base = py - pr * 0.9, tipY = py - pr * (1.9 - grab * 0.35) - Math.abs(f - 1.5) * pr * 0.08 + Math.sin(t * 2.4 + f) * 2, curl = grab * pr * 0.35;
          g.strokeStyle = rgba(wcol, 0.55); g.lineWidth = pr * 0.3; g.beginPath(); g.moveTo(fx, base); g.quadraticCurveTo(fx + (f - 1.5) * pr * 0.05, tipY, fx - curl * 0.2, tipY + curl); g.stroke();
          g.strokeStyle = rgba(hi, 0.5); g.lineWidth = 1.3; g.beginPath(); g.moveTo(fx - pr * 0.12, base); g.quadraticCurveTo(fx - pr * 0.1, tipY, fx - curl * 0.2, tipY + curl - pr * 0.1); g.stroke(); }
        g.strokeStyle = rgba(wcol, 0.55); g.lineWidth = pr * 0.32; g.beginPath(); g.moveTo(cx + shake + pr * 0.9, py + pr * 0.7); g.quadraticCurveTo(cx + shake + pr * 1.5, py, cx + shake + pr * (1.25 - grab * 0.25), py - pr * 0.6); g.stroke();
        // cổ tay nối xuống cột nước
        g.fillStyle = rgba(wcol, 0.45); g.beginPath(); g.moveTo(cx - wd * 0.7, colTop + 2); g.quadraticCurveTo(cx - pr * 0.8, py + pr, cx - pr * 0.9, py + pr * 0.9); g.lineTo(cx + pr * 0.9, py + pr * 0.9); g.quadraticCurveTo(cx + pr * 0.8, py + pr, cx + wd * 0.7, colTop + 2); g.fill();
      }
      for (var b = 0; b < 30; b++) { var by = ((R[b % 60] + t * (0.2 + R[(b + 26) % 60] * 0.3)) % 1), yy = H - by * (H - ey + s), xx = cx + (R[(b + 13) % 60] - 0.5) * wd * 1.4 + Math.sin(t * 2 + b) * 4; g.strokeStyle = rgba(hi, 0.55 * (1 - by)); g.lineWidth = 1; g.beginPath(); g.arc(xx, yy, 1.5 + R[b % 60] * 2.5, 0, 7); g.stroke(); }
      g.restore();
      if (t > 1.6) for (var i = 0; i < 3; i++) { var ph = ((t - 1.6) * 0.35 + i / 3) % 1; g.strokeStyle = rgba(wcol, 0.4 * (1 - ph) * fade); g.lineWidth = 1.5; g.beginPath(); g.ellipse(cx, ey, s * (1.6 + ph * 4), s * (2 + ph * 4) * 0.6, 0, 0, 7); g.stroke(); }
      edge(wcol, (dk ? 0.25 : 0.18) * env(t, 1, 6, 2), 0.35);
      return false;
    };
    // nước đổ ụp: một mảng nước từ trên trút xuống, vỡ toé trắng ở mép dưới, rồi trang trống trơn, lặng
    MORE.splash = function (t, R) {
      if (t > 5) return true;
      var dk = C.dark, wcol = dk ? '#8fd3e0' : '#2e7484', hi = dk ? '#e8fbff' : '#ffffff';
      if (t < 0.55) { var y = H * Math.pow(t / 0.55, 1.6); var gr = g.createLinearGradient(0, y - H * 0.6, 0, y); gr.addColorStop(0, rgba(wcol, 0)); gr.addColorStop(1, rgba(wcol, dk ? 0.55 : 0.45)); g.fillStyle = gr; g.fillRect(0, 0, W, y); g.fillStyle = rgba(hi, 0.7); g.fillRect(0, y - 3, W, 3); }
      else { var u = t - 0.55;
        if (u < 0.5) { var sg = g.createLinearGradient(0, H * (1 - 0.35 * (1 - u / 0.5)), 0, H); sg.addColorStop(0, rgba(wcol, 0)); sg.addColorStop(1, rgba(hi, 0.6 * (1 - u / 0.5))); g.fillStyle = sg; g.fillRect(0, 0, W, H); }
        for (var d = 0; d < 120; d++) { var a = -Math.PI * (0.08 + R[d % 60] * 0.84), sp = 300 + R[(d * 3) % 60] * 700, x = W * (R[(d * 7) % 60]) + Math.cos(a) * sp * u * 0.5, yy = H + Math.sin(a) * sp * u + 1400 * u * u, al = Math.max(0, 0.95 - u * 0.9); if (yy > H + 5) continue; g.fillStyle = rgba(d % 3 ? hi : wcol, al); g.beginPath(); g.arc(x, yy, 1.5 + (d % 4), 0, 7); g.fill(); }
        wash(dk ? '#0a1416' : '#cfd8da', 0.4 * env(u, 0.3, 1.8, 2.3)); }
      return false;
    };
    // tiếng đá nứt bên kia tường: một vết nứt khô loé lên ở mép phải xa, tắt, rồi loé ở chỗ xa hơn
    MORE.crackfar = function (t) {
      if (t > 4.5) return true;
      edge('#000000', 0.4 * env(t, 0.3, 3, 1.2), 0.3);
      [[0.3, 0.86, 0.3], [2.2, 0.92, 0.22]].forEach(function (c) { var u = t - c[0]; if (u < 0 || u > 0.7) return; var k = Math.sin(u / 0.7 * Math.PI), x = W * c[1], y = H * c[2]; g.strokeStyle = rgba(C.dark ? '#d8d0c0' : '#5a5040', 0.8 * k); g.lineWidth = 1.3; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 8, y + 10); g.lineTo(x - 4, y + 22); g.lineTo(x - 12, y + 34); g.moveTo(x - 8, y + 10); g.lineTo(x - 18, y + 14); g.stroke(); glow(x - 8, y + 16, 40, C.dark ? '#d8d0c0' : '#8a8070', 0.15 * k); });
      return false;
    };
    // sợi xích dưới chân Leon dựng đứng: năm đoạn xích thép xám mọc thẳng từ mép dưới, rung như lông gáy con mèo
    MORE.bristle = function (t) {
      if (t > 4) return true;
      var lk = Math.max(10, H * 0.024), up = t < 0.3 ? 1 - Math.pow(1 - t / 0.3, 3) : 1, k = t > 3 ? 1 - (t - 3) : 1;
      edge('#000000', 0.55 * env(t, 0.1, 2.9, 1), 0.25);
      for (var c = 0; c < 7; c++) { var x0 = W * (0.12 + c * 0.127), len = H * (0.18 + (c % 3) * 0.07) * up, pts = []; for (var m = 0; m <= 10; m++) { var v = m / 10; pts.push([x0 + Math.sin(t * 50 + c * 2 + v * 4) * 2.2 * v, H + 4 - len * v]); } chainLinks(pts, lk, k); }
      return false;
    };
    // một chiếc lá gạo khô xoay xoay rơi qua vệt trăng, đáp xuống giữa trang
    MORE.leaf = function (t) {
      if (t > 5.5) return true;
      var dk = C.dark, k = env(t, 0.4, 4, 1.1), cx = W / 2;
      var bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, rgba('#d8e4f0', (dk ? 0.12 : 0.2) * k)); bg.addColorStop(1, rgba('#d8e4f0', 0)); g.fillStyle = bg; g.beginPath(); g.moveTo(cx - W * 0.08, 0); g.lineTo(cx + W * 0.08, 0); g.lineTo(cx + W * 0.25, H); g.lineTo(cx - W * 0.25, H); g.fill();
      var u = Math.min(1, t / 3.6), x = cx + Math.sin(u * 11) * W * 0.08 * (1 - u), y = -20 + u * (H * 0.7 + 20), sz = Math.max(9, H * 0.02);
      g.save(); g.translate(x, y); g.rotate(u < 1 ? u * 16 : 0.3); g.scale(1, u < 1 ? Math.abs(Math.cos(u * 12)) * 0.8 + 0.2 : 0.55); g.fillStyle = rgba(dk ? '#b07a4a' : '#7a4a2a', 0.95 * k); g.beginPath(); g.ellipse(0, 0, sz, sz * 0.45, 0, 0, 7); g.fill(); g.strokeStyle = rgba('#3a2010', 0.6 * k); g.lineWidth = 1; g.beginPath(); g.moveTo(-sz, 0); g.lineTo(sz, 0); g.stroke(); g.restore();
      return false;
    };

    /* vòng tròn rối của mặt sau thẻ (cùng nét với cards.js): dấu chung mỗi lần dùng năng lực hay dùng thẻ */
    var SIG = (function () {
      var seed = 7; function R() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
      var out = [];
      for (var k = 0; k < 7; k++) {
        var n = 5 + Math.floor(R() * 4), path = [];
        for (var i = 0; i <= n; i++) {
          var a = (i / n) * Math.PI * 2 + k, rr = 0.25 + R() * 0.62, pt = [Math.cos(a) * rr, Math.sin(a) * rr];
          if (!i) path.push(pt); else { var c1a = a - 0.9 + R() * 0.6, c2a = a + R() * 0.8, c1r = 0.1 + R() * 0.85, c2r = 0.1 + R() * 0.85; path.push([Math.cos(c1a) * c1r, Math.sin(c1a) * c1r, Math.cos(c2a) * c2r, Math.sin(c2a) * c2r, pt[0], pt[1]]); }
        }
        out.push(path);
      }
      return out;
    })();
    MORE.sigil = function (t) {
      if (t > 1.9) return true;
      var a = t < 0.35 ? t / 0.35 : t < 1 ? 1 : Math.max(0, 1 - (t - 1) / 0.9), sc = t < 1 ? 0.86 + 0.14 * Math.min(1, t / 0.6) : 1 + (t - 1) * 0.5;
      var r = Math.min(W, H) * 0.24 * sc, cx = W / 2, cy = H * 0.5, col = C.dark ? '#bfeaf2' : '#2e7484';
      var gl = g.createRadialGradient(cx, cy, 0, cx, cy, r * 1.6); gl.addColorStop(0, rgba(col, 0.18 * a)); gl.addColorStop(1, rgba(col, 0)); g.fillStyle = gl; g.fillRect(cx - r * 2, cy - r * 2, r * 4, r * 4);
      g.save(); g.translate(cx, cy); g.rotate(t * 0.35); g.strokeStyle = rgba(col, 0.85 * a); g.lineCap = 'round'; g.shadowColor = col; g.shadowBlur = 14;
      g.lineWidth = 2; g.beginPath(); g.arc(0, 0, r * 1.13, 0, 7); g.stroke();
      g.lineWidth = 1; g.beginPath(); g.arc(0, 0, r * 1.04, 0, 7); g.stroke();
      var draw = Math.min(1, t / 0.7); g.lineWidth = 1.4;
      SIG.forEach(function (path, k) {
        var upto = Math.floor(draw * (path.length - 1)) + 1; g.beginPath(); g.moveTo(path[0][0] * r, path[0][1] * r);
        for (var i = 1; i < Math.min(upto + 1, path.length); i++) { var q = path[i]; g.bezierCurveTo(q[0] * r, q[1] * r, q[2] * r, q[3] * r, q[4] * r, q[5] * r); }
        g.stroke();
      });
      g.restore();
      return false;
    };
    // khung cửa mở ra rồi ánh trắng nuốt hết (Teleport)
    MORE.teleport = function (t, R) {
      if (t > 3.6) return true;
      var dw = Math.min(W * 0.34, H * 0.22), dh = dw * 2, x = W / 2 - dw / 2, y = H * 0.5 - dh / 2, ink = C.dark ? '#f3c27a' : '#a8641f', pr = Math.min(1, t / 0.6);
      if (t < 1.6) {
        g.save(); g.globalAlpha = t < 1.2 ? 1 : 1 - (t - 1.2) / 0.4; g.strokeStyle = ink; g.lineWidth = Math.max(2, W / 200); g.shadowColor = ink; g.shadowBlur = 18;
        g.beginPath(); g.moveTo(x, y + dh); g.lineTo(x, y + dh - dh * Math.min(1, pr * 3)); if (pr > 1 / 3) g.lineTo(x + dw * Math.min(1, (pr - 1 / 3) * 3), y); if (pr > 2 / 3) g.lineTo(x + dw, y + dh * Math.min(1, (pr - 2 / 3) * 3)); g.stroke(); g.restore();
      }
      if (t > 0.6) {
        var u = Math.min(1, (t - 0.6) / 0.7), f = t < 1.6 ? 1 : Math.max(0, 1 - (t - 1.6) / 2);
        var rr = Math.max(W, H) * 1.2 * u, gl = g.createRadialGradient(W / 2, H * 0.5, 0, W / 2, H * 0.5, Math.max(1, rr));
        gl.addColorStop(0, rgba('#fffaf0', 0.95 * f)); gl.addColorStop(0.7, rgba('#fffaf0', 0.8 * f)); gl.addColorStop(1, rgba('#fffaf0', 0)); g.fillStyle = gl; g.fillRect(0, 0, W, H);
      }
      return false;
    };
    function cast(silent) {
      shots.push({ kind: 'sigil', t0: performance.now(), R: seeds() }); kick();
      if (silent) return;
      if (window.a07sfx) { window.a07sfx('cast'); return; }
      try {
        if (playing && ac && ac.state === 'running') {
          var n = ac.currentTime, o = gain(1); o.connect(master);
          [1318.5, 1975.5, 2637].forEach(function (f, i) { var x = ac.createOscillator(), gg = gain(0); x.frequency.value = f; gg.gain.setValueAtTime(0, n + i * 0.06); gg.gain.linearRampToValueAtTime(0.035, n + i * 0.06 + 0.05); gg.gain.exponentialRampToValueAtTime(0.0001, n + i * 0.06 + 1.4); x.connect(gg); gg.connect(o); x.start(n + i * 0.06); x.stop(n + 1.6); });
        }
      } catch (e) {}
    }
    /* ---- năng lực riêng của nhân vật chính (cùng cấp với xích của Leon) ---- */
    function sparks(x, y, t, n, R, off, spread, col) {
      g.strokeStyle = rgba(col || '#ffd27a', Math.max(0, 1 - t / 0.7)); g.lineWidth = 2;
      for (var p = 0; p < n; p++) { var pa = (R[(p + off) % 60] - 0.5) * spread - 1.57, sp = 300 + R[(p * 3 + off) % 60] * 500, x1 = x + Math.cos(pa) * sp * t, y1 = y + Math.sin(pa) * sp * t + 500 * t * t; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x1 - Math.cos(pa) * 9, y1 - Math.sin(pa) * 9 - 6); g.stroke(); }
    }
    function quake(a, t) { main.style.transform = a > 0.02 ? 'translate(' + (Math.sin(t * 95) * 9 * a).toFixed(1) + 'px,' + (Math.cos(t * 81) * 7 * a).toFixed(1) + 'px)' : ''; }

    /* ---- năng lực Clevia (Clair chốt 24/11: gộp A + C): vòng khoá xoay khớp từng cú cạch, đồng thời các đoạn chữ lệch như lẫy khoá rồi về hàng,
       cuối cùng tia sáng lỗ khoá xuyên qua và vệt sáng quét ngang. Không tô tối trang, không bánh răng. ---- */
    var CW = { core: '#8E2238', mid: '#C0465F', light: '#F6C9D1', hot: '#FFE8EC' };
    function ring(cx, cy, r, w, a, gapA, gapW) { var dk = C.dark; g.strokeStyle = rgba(dk ? '#E8869B' : CW.mid, dk ? Math.min(1, a * 1.25) : a); g.lineWidth = w; if (dk) { g.shadowColor = rgba('#E8869B', 0.7 * a); g.shadowBlur = 10; } g.beginPath(); g.arc(cx, cy, r, gapA + gapW / 2, gapA - gapW / 2 + 6.283); g.stroke(); g.shadowBlur = 0; }
    function glow(x, y, r, col, a) { var f = g.createRadialGradient(x, y, 0, x, y, r); f.addColorStop(0, rgba(col, a)); f.addColorStop(1, rgba(col, 0)); g.fillStyle = f; g.fillRect(x - r, y - r, r * 2, r * 2); }
    // A. Vòng khoá: bốn vòng sáng mảnh có khe, quay lệch nhau; từng vòng "cạch" khớp khe lên đỉnh; khớp đủ thì một tia sáng hình lỗ khoá xuyên qua, các vòng nở tung
    MORE.clevia_a = function (t, R) {
      if (t > 3.3) return true;
      var cx = W / 2, cy = H * 0.5, m = Math.min(W, H), fade = t < 0.3 ? t / 0.3 : t > 2.7 ? Math.max(0, 1 - (t - 2.7) / 0.6) : 1;
      var burst = t > 1.9 ? t - 1.9 : 0;
      for (var i = 0; i < 4; i++) {
        var lock = [0.6, 0.85, 1.1, 1.6][i], r = m * (0.14 + i * 0.075) * (1 + burst * burst * 1.8), spd = (i % 2 ? -1 : 1) * (2.2 - i * 0.3);
        var ang = t < lock ? R[i] * 6.283 + t * spd : -1.5708, snap = t >= lock && t - lock < 0.25 ? 1 - (t - lock) / 0.25 : 0;
        ring(cx, cy, r, 2 + snap * 3, (0.85 - i * 0.12) * fade * (burst ? Math.max(0, 1 - burst / 1.2) : 1), ang, 0.32);
        for (var k = 0; k < 24; k++) { var ka = ang + k / 24 * 6.283; if (k % 3) continue; g.strokeStyle = rgba(CW.light, 0.5 * fade * (burst ? Math.max(0, 1 - burst) : 1)); g.lineWidth = 1; g.beginPath(); g.moveTo(cx + Math.cos(ka) * (r - 5), cy + Math.sin(ka) * (r - 5)); g.lineTo(cx + Math.cos(ka) * (r + 5), cy + Math.sin(ka) * (r + 5)); g.stroke(); }
        if (snap) glow(cx, cy - r, 40 + snap * 30, CW.hot, 0.8 * snap);
      }
      if (burst) {
        var bw = Math.min(1, burst / 0.15), ba = Math.max(0, 1 - burst / 1.2);
        g.fillStyle = rgba(CW.hot, 0.85 * ba); g.beginPath(); g.arc(cx, cy - m * 0.05, m * 0.05 * bw, 0, 7); g.fill();
        g.beginPath(); g.moveTo(cx - m * 0.03 * bw, cy - m * 0.04); g.lineTo(cx + m * 0.03 * bw, cy - m * 0.04); g.lineTo(cx + m * 0.012 * bw, H); g.lineTo(cx - m * 0.012 * bw, H); g.closePath(); g.fill();
        g.fillRect(cx - 2 * bw, 0, 4 * bw, H);
        glow(cx, cy, m * 0.9, CW.mid, 0.35 * ba);
      }
      return false;
    };
    // C. Cả trang là ổ khoá: các đoạn chữ trên màn hình bị đẩy lên lệch nhau như lẫy khoá, từng đoạn "cạch" về đúng hàng với vạch đỏ ngang; khớp hết thì một đường sáng quét ngang trang
    MORE.clevia_c = function (t, R) {
      var ps = MORE._cps;
      if (t < 0.05 || !ps) { ps = MORE._cps = [].slice.call(document.querySelectorAll('.scene p')).filter(function (p) { var r = p.getBoundingClientRect(); return r.bottom > 0 && r.top < H; }).slice(0, 7); }
      if (t > 2.8) { ps.forEach(function (p) { p.style.transform = ''; p.style.textShadow = ''; }); MORE._cps = null; return true; }
      var y0 = H * 0.5, fade = t > 2.3 ? Math.max(0, 1 - (t - 2.3) / 0.5) : Math.min(1, t / 0.3);
      g.strokeStyle = rgba(CW.mid, 0.8 * fade); g.lineWidth = 1.5; g.setLineDash([10, 8]); g.beginPath(); g.moveTo(0, y0); g.lineTo(W, y0); g.stroke(); g.setLineDash([]);
      ps.forEach(function (p, i) {
        var up = 0.1 + i * 0.04, drop = 0.55 + i * 0.15, lift = t < up ? 0 : t < drop ? Math.min(1, (t - up) / 0.12) : Math.max(0, 1 - (t - drop) / 0.06);
        var off = lift * (6 + R[i] * 12) * (i % 2 ? 1 : -1) + (lift > 0.98 ? Math.sin(t * 60 + i) * 1.5 : 0);
        p.style.transform = off ? 'translateY(' + off.toFixed(1) + 'px)' : '';
        var just = t >= drop && t - drop < 0.3;
        p.style.textShadow = just ? '0 0 12px ' + rgba(CW.mid, 0.9 * (1 - (t - drop) / 0.3)) : '';
        if (just) { var r = p.getBoundingClientRect(); glow(r.left - 4, r.top + r.height / 2, 34, CW.hot, 0.7 * (1 - (t - drop) / 0.3)); }
      });
      var sw = t > 1.85 ? (t - 1.85) / 0.6 : -1;
      if (sw >= 0 && sw <= 1) { var x = sw * (W + 200) - 100, gr = g.createLinearGradient(x - 120, 0, x + 20, 0); gr.addColorStop(0, rgba(CW.mid, 0)); gr.addColorStop(1, rgba(CW.hot, 0.7)); g.fillStyle = gr; g.fillRect(x - 120, 0, 140, H); }
      return false;
    };
    MORE.keysense = function (t, R) { var a = MORE.clevia_a(t, R), c = MORE.clevia_c(t, R); return a && c; };
    // bản ngắn khi người đọc tự giữ tay mở khoá: vòng đã gần khớp hết, chỉ còn cú cạch cuối và tia sáng
    MORE.keyburst = function (t, R) { return MORE.keysense(t + 1.6, R); };
    // Clevia mở lối ra không có khoá: bốn vòng đỏ rượu hiện ra và cùng khẽ xoay đi một lượt (không cú cạch, không lẫy),
    // các đoạn chữ dạt sang hai bên như những tảng đá trượt đi, một khe nắng trắng mở rộng dần giữa trang
    MORE.stoneopen = function (t, R) {
      var ps = MORE._sps;
      if (!ps) { ps = MORE._sps = [].slice.call(document.querySelectorAll('.scene p, .scene .act')).filter(function (p) { var r = p.getBoundingClientRect(); return r.bottom > 0 && r.top < H; }).slice(0, 9); }
      if (t > 5.6) { ps.forEach(function (p) { p.style.transform = ''; p.style.transition = ''; }); MORE._sps = null; return true; }
      var cx = W / 2, cy = H * 0.5, m = Math.min(W, H), dk = C.dark;
      edge('#000000', (dk ? 0.7 : 0.45) * (t < 0.4 ? t / 0.4 : t < 4.2 ? 1 : Math.max(0, 1 - (t - 4.2) / 1.2)), 0.2);
      // vòng đỏ rượu: hiện lên, đứng lặng; tới 1,2 giây cùng xoay nửa vòng thật chậm rồi khớp; 2 giây nở tung ra và tan
      var appear = Math.min(1, t / 0.6), turn = t < 1.2 ? 0 : Math.min(1, (t - 1.2) / 0.8), tu = turn * turn * (3 - 2 * turn), open = t > 2 ? t - 2 : 0, ra = appear * (open ? Math.max(0, 1 - open / 1.4) : 1);
      for (var i = 0; i < 4; i++) {
        var r = m * (0.12 + i * 0.07) * (1 + open * open * 1.5), gap = R[i] * 6.283 * (1 - tu) + (-1.5708) * tu + (i % 2 ? -1 : 1) * 3.1416 * tu;
        ring(cx, cy, r, 2 + (turn > 0 && turn < 1 ? 1.5 : 0), (0.85 - i * 0.12) * ra, gap, 0.32);
      }
      if (turn > 0) glow(cx, cy, m * (0.2 + 0.25 * tu), CW.mid, 0.3 * Math.sin(Math.min(1, turn) * Math.PI) + (open ? 0 : 0.05));
      // đoạn chữ dạt sang hai bên như tảng đá trượt ra, êm, không rơi vụn
      var part = t < 2 ? 0 : t < 3 ? (t - 2) / 1 : t < 4.4 ? 1 : Math.max(0, 1 - (t - 4.4) / 1);
      var pe = part * part * (3 - 2 * part);
      ps.forEach(function (p, i) { p.style.transform = pe > 0.001 ? 'translateX(' + ((i % 2 ? 1 : -1) * (14 + (i % 3) * 8) * pe).toFixed(1) + 'px)' : ''; });
      // khe nắng trắng giữa trang rộng dần
      if (t > 2.1) {
        var sw = Math.min(1, (t - 2.1) / 1.4), slit = W * (0.01 + 0.24 * sw * sw), la = t < 4.2 ? 1 : Math.max(0, 1 - (t - 4.2) / 1.4), white = dk ? '#eef2f0' : '#ffffff';
        var sg = g.createLinearGradient(cx - slit, 0, cx + slit, 0); sg.addColorStop(0, rgba(white, 0)); sg.addColorStop(0.35, rgba(white, 0.55 * la)); sg.addColorStop(0.5, rgba(white, 0.8 * la)); sg.addColorStop(0.65, rgba(white, 0.55 * la)); sg.addColorStop(1, rgba(white, 0)); g.fillStyle = sg; g.fillRect(cx - slit, 0, slit * 2, H);
        var bg = g.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.6); bg.addColorStop(0, rgba(white, 0.25 * la * sw)); bg.addColorStop(1, rgba(white, 0)); g.fillStyle = bg; g.fillRect(0, 0, W, H);
        g.fillStyle = rgba(dk ? '#d8e0de' : '#8a8478', 0.6 * la); for (var d = 0; d < 26; d++) { var dx = cx + (R[d % 60] - 0.5) * slit * 1.6, dy = ((t * 0.06 + R[(d + 30) % 60]) % 1) * H; g.fillRect(dx, dy, 1.6, 1.6); }
      }
      return false;
    };
    // Luke, Anomaly Sense: thời gian như ngừng lại, cả trang mất màu và đập theo nhịp tim, sóng dò quét qua làm chữ gợn,
    // rồi tới chỗ lệch nhịp thì cả trang giật tách màu và một vết đỏ nhoè hiện ra ở đó.
    MORE.anomaly = function (t, R) {
      if (t > 5.2) { main.style.transform = ''; main.style.filter = ''; main.style.textShadow = ''; return true; }
      var cx = W / 2, cy = H * 0.55, M = Math.max(W, H), ice = C.dark ? '#d8f4fa' : '#1f6676', bad = '#ff4d3a';
      var k = t < 0.35 ? t / 0.35 : t < 4.2 ? 1 : Math.max(0, 1 - (t - 4.2) / 1);
      edge('#000000', 0.7 * k, 0.18); wash(C.dark ? '#0a1416' : '#cfd8da', 0.18 * k);
      // nhịp tim: cả trang đập
      var beats = [0.4, 0.66, 1.5, 1.76, 2.6, 2.86, 3.7, 3.96], thump = 0;
      beats.forEach(function (b, i) { var u = t - b; if (u > 0 && u < 0.3) thump = Math.max(thump, (i % 2 ? 0.6 : 1) * (1 - u / 0.3)); });
      edge('#3a0000', 0.45 * thump * k, 0.2);
      // sóng dò
      var waves = [0.35, 1.35, 2.35], wob = 0;
      waves.forEach(function (w0) {
        var u = t - w0, rr = u * M * 0.6; if (u <= 0 || rr > M * 1.1) return;
        var al = (1 - rr / (M * 1.1)) * k; wob = Math.max(wob, al * Math.max(0, 1 - Math.abs(rr - H * 0.4) / (H * 0.4)));
        g.strokeStyle = rgba(ice, 0.95 * al); g.lineWidth = 3; g.shadowColor = ice; g.shadowBlur = 16; g.beginPath(); g.arc(cx, cy, rr, 0, 7); g.stroke();
        g.lineWidth = 1; g.shadowBlur = 0; g.beginPath(); g.arc(cx, cy, rr * 0.93, 0, 7); g.stroke(); g.beginPath(); g.arc(cx, cy, rr * 0.86, 0, 7); g.stroke();
      });
      // bụi lơ lửng đứng im giữa không trung, loé lên khi sóng quét qua
      for (var i = 0; i < 60; i++) {
        var px = R[i] * W, py = R[(i * 7 + 3) % 60] * H, d = Math.hypot(px - cx, py - cy), lit = 0.15;
        waves.forEach(function (w0) { var rr = (t - w0) * M * 0.6; if (rr > 0) lit = Math.max(lit, Math.max(0, 1 - Math.abs(rr - d) / 50)); });
        g.fillStyle = rgba(ice, lit * k); g.beginPath(); g.arc(px, py, 1.2 + lit * 2, 0, 7); g.fill();
      }
      // chỗ lệch nhịp
      var ax = W * (R[0] > 0.5 ? 0.74 : 0.26), ay = H * (0.24 + R[1] * 0.18), found = 0.35 + Math.hypot(ax - cx, ay - cy) / (M * 0.6), glitch = 0;
      if (t > found) {
        var u2 = t - found, fa = Math.min(1, u2 / 0.1) * k, jit = (R[Math.floor(t * 20) % 60] - 0.5) * 14;
        glitch = u2 < 0.6 ? 1 - u2 / 0.6 : 0.25 + 0.2 * (Math.floor(t * 9) % 2);
        // vạch đỏ xé ngang toàn trang
        if (u2 < 0.5 || Math.floor(t * 11) % 4 === 0) for (var b = 0; b < 5; b++) { var by = (R[(b * 9 + Math.floor(t * 15)) % 60]) * H; g.fillStyle = rgba(b % 2 ? '#5fd0ff' : bad, 0.22 * fa); g.fillRect(0, by, W, 2 + R[b] * 6); }
        for (var c = 0; c < 3; c++) {
          var off = (c - 1) * (4 + 4 * glitch), rr2 = 26 + 8 * Math.sin(t * 9 + c);
          g.strokeStyle = rgba(c === 1 ? bad : (c ? '#5fd0ff' : '#ff5fa0'), (c === 1 ? 1 : 0.55) * fa); g.lineWidth = c === 1 ? 3 : 1.5; g.shadowColor = bad; g.shadowBlur = c === 1 ? 18 : 0;
          g.beginPath(); for (var s = 0; s <= 16; s++) { var aa = s / 16 * 6.283, j = (R[(s * 5 + c + Math.floor(t * 14)) % 60] - 0.5) * 16; g.lineTo(ax + off + jit * 0.3 + Math.cos(aa) * (rr2 + j), ay + Math.sin(aa) * (rr2 + j)); } g.closePath(); g.stroke();
        }
        g.shadowBlur = 0;
        g.strokeStyle = rgba(bad, 0.7 * fa); g.lineWidth = 1.5; g.setLineDash([6, 6]); g.lineDashOffset = -t * 60; g.beginPath(); g.moveTo(cx, cy); g.lineTo(ax, ay); g.stroke(); g.setLineDash([]);
      }
      // cả trang phản ứng: mất màu, đập theo tim, gợn theo sóng, tách màu khi chạm chỗ lệch
      main.style.filter = k > 0.02 ? 'grayscale(' + (0.85 * k).toFixed(2) + ')' + (glitch > 0.3 ? ' contrast(1.15)' : '') : '';
      var sc = 1 + 0.018 * thump * k, sk = Math.sin(t * 40) * 0.6 * wob;
      main.style.transform = k > 0.02 ? 'scale(' + sc.toFixed(4) + ') skewX(' + sk.toFixed(2) + 'deg) translateX(' + ((glitch > 0.3 ? (R[Math.floor(t * 25) % 60] - 0.5) * 10 * glitch : 0)).toFixed(1) + 'px)' : '';
      var cs = (2.5 * glitch + 0.6 * wob) * k;
      main.style.textShadow = cs > 0.1 ? (-cs).toFixed(1) + 'px 0 rgba(255,60,80,.6),' + cs.toFixed(1) + 'px 0 rgba(60,200,255,.6)' : '';
      return false;
    };

    // Protect giữ bằng tay: vòm sáng bọc trang; người đọc giữ ngón tay trên màn hình thì vòm còn, móng cào toé lửa trên vòm;
    // buông tay (hoặc cuộn đi) là vòm vỡ tan thành mảnh. Không chạm thì vòm tự lịm như cũ.
    var PR = { on: false, hold: false, used: false, broke: -1, hint: null, t0: 0 };
    function prDown() { if (PR.on && PR.broke < 0) { PR.hold = true; PR.used = true; if (PR.hint) PR.hint.classList.remove('on'); } }
    function prUp() { if (PR.on && PR.hold && PR.broke < 0) { PR.hold = false; PR.broke = performance.now(); if (window.a07sfx) window.a07sfx('shatter'); } }
    addEventListener('pointerdown', prDown, true); ['pointerup', 'pointercancel'].forEach(function (t) { addEventListener(t, prUp, true); });
    addEventListener('scroll', function () { if (PR.hold) prUp(); }, { passive: true });
    MORE.protect = function (t, R) {
      var now = performance.now(), cx = W / 2, cy = H * 0.55, col = C.dark ? '#cfe6ff' : '#5f93c8';
      if (t < 0.05 && !PR.on) { PR.on = true; PR.hold = false; PR.used = false; PR.broke = -1; if (!PR.hint) { PR.hint = document.createElement('div'); PR.hint.className = 'protect-hint'; PR.hint.textContent = 'giữ ngón tay trên màn hình để giữ vòm'; document.body.appendChild(PR.hint); } setTimeout(function () { if (PR.on && !PR.used && PR.broke < 0) PR.hint.classList.add('on'); }, 700); }
      var end = function () { PR.on = false; PR.hold = false; if (PR.hint) PR.hint.classList.remove('on'); return true; };
      var limit = PR.used ? 14 : 4.6;
      if (PR.broke < 0 && t > limit) { if (PR.hold) { PR.hold = false; PR.broke = now; if (window.a07sfx) window.a07sfx('shatter'); } else return end(); }
      var rx = W * 0.62 * (t < 0.7 ? 1 - Math.pow(1 - t / 0.7, 3) : 1), ry = H * 0.62 * (rx / (W * 0.62));
      if (PR.broke < 0) {
        var fade = !PR.used && t > 3 ? Math.max(0, 1 - (t - 3) / 1.6) : 1, pulse = PR.hold ? 0.12 * Math.sin(t * 6) : 0;
        g.save(); g.globalAlpha = fade;
        var gr = g.createRadialGradient(cx, cy, Math.min(rx, ry) * 0.5, cx, cy, Math.max(rx, ry));
        gr.addColorStop(0, rgba(col, 0)); gr.addColorStop(0.75, rgba(col, 0.1 + pulse * 0.3)); gr.addColorStop(0.95, rgba(col, 0.5 + pulse)); gr.addColorStop(1, rgba(col, 0));
        g.translate(cx, cy); g.scale(1, ry / Math.max(1, rx)); g.translate(-cx, -cy); g.fillStyle = gr; g.fillRect(cx - rx, cy - rx, rx * 2, rx * 2);
        g.strokeStyle = rgba(col, 0.7); g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, rx * 0.97, 0, 7); g.stroke();
        var a0 = t * 1.4; g.strokeStyle = rgba('#ffffff', 0.8); g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, rx * 0.97, a0, a0 + 0.5); g.stroke();
        // móng cào vào vòm: ba vệt cào và lửa toé, cứ vài nhịp một lần
        var hitN = Math.floor((t - 0.8) / 0.75);
        if (t > 0.8 && (PR.hold || t < 3)) {
          var ht = (t - 0.8) % 0.75, ang = R[(hitN * 7) % 60] * 6.283;
          if (ht < 0.4) {
            var hx = cx + Math.cos(ang) * rx * 0.97, hy = cy + Math.sin(ang) * rx * 0.97, fa = 1 - ht / 0.4;
            g.strokeStyle = rgba('#ffffff', 0.9 * fa); g.lineWidth = 2;
            for (var c = 0; c < 3; c++) { g.beginPath(); g.moveTo(hx + Math.cos(ang + 1.57) * (c - 1) * 10 - Math.cos(ang) * 20, hy + Math.sin(ang + 1.57) * (c - 1) * 10 - Math.sin(ang) * 20); g.lineTo(hx + Math.cos(ang + 1.57) * (c - 1) * 10 + Math.cos(ang + 0.4) * 30 * Math.min(1, ht / 0.08), hy + Math.sin(ang + 1.57) * (c - 1) * 10 + Math.sin(ang + 0.4) * 30 * Math.min(1, ht / 0.08)); g.stroke(); }
            g.strokeStyle = rgba('#fff0c0', fa); for (var sp = 0; sp < 8; sp++) { var sa = ang + Math.PI + (R[(sp + hitN * 3) % 60] - 0.5) * 2, d = 200 * ht; g.beginPath(); g.moveTo(hx + Math.cos(sa) * d, hy + Math.sin(sa) * d); g.lineTo(hx + Math.cos(sa) * (d + 6), hy + Math.sin(sa) * (d + 6)); g.stroke(); }
            if (ht < 0.02 && window.a07sfx && PR.lastHit !== hitN) { PR.lastHit = hitN; window.a07sfx('claw'); }
          }
        }
        g.restore();
        return false;
      }
      // vỡ tan
      var u = (now - PR.broke) / 1000; if (u > 1.6) return end();
      if (PR.hint) PR.hint.classList.remove('on');
      if (u < 0.15) { var fl = g.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.7); fl.addColorStop(0, rgba('#ffffff', 0.6 * (1 - u / 0.15))); fl.addColorStop(1, rgba('#ffffff', 0)); g.fillStyle = fl; g.fillRect(0, 0, W, H); }
      g.save();
      for (var k = 0; k < 36; k++) {
        var a = k / 36 * 6.283 + R[k % 60] * 0.2, r0 = rx * 0.97, sp2 = 120 + R[(k * 5) % 60] * 380, x = cx + Math.cos(a) * (r0 + sp2 * u), y = cy + Math.sin(a) * (r0 * ry / Math.max(1, rx) + sp2 * u) + 600 * u * u, sz = 8 + R[(k * 3) % 60] * 16;
        g.save(); g.translate(x, y); g.rotate(u * (4 + R[k % 60] * 8)); g.globalAlpha = Math.max(0, 1 - u / 1.6);
        g.fillStyle = rgba(col, 0.35); g.strokeStyle = rgba('#ffffff', 0.9); g.lineWidth = 1;
        g.beginPath(); g.moveTo(0, -sz); g.lineTo(sz * 0.7, sz * 0.5); g.lineTo(-sz * 0.5, sz * 0.6); g.closePath(); g.fill(); g.stroke(); g.restore();
      }
      g.restore();
      return false;
    };
    /* ---------- BỘ CHIÊU BA NHÂN VẬT (bước 3 đề xuất hiệu ứng, 26/11) ----------
       Chèn vào moments.js khi dựng (chỗ @@CHIEU@@), dùng chung g, W, H, C, main, edge, glow, ring, CW...
       Mỗi chiêu 3 nhịp: báo hiệu → bung → dư âm. Chất anime nằm ở cách dàn: vệt tốc độ dồn vào giữa, băng tên chiêu chém chéo,
       khựng hình đúng lúc đánh trúng, loé màu riêng từng người. Không vẽ người, không màu vàng/cam/đồng.
       Màu cố định: Leon xám thép, Luke xanh băng, Clevia đỏ rượu (vòng tròn + cả trang là ổ khoá).
       PW = độ mạnh (0.5–1.5, scenes.json "pow"), độ dài kéo giãn thời gian ở frame() ("len"), TEN = có băng tên chiêu không ("ten": false để tắt).
       Gọi trong chương: moments { "at": "...", "fx": "leon-strike", "pow": 1.2 }. Thử ở trang ẩn xem-thu.html. */
    var KC = {
      leon:   { d: '#C3D0DC', l: '#3E4954', hot: '#F1F6FA', deep: '#0b0f13', name: 'CHAIN' },
      luke:   { d: '#8FD6E6', l: '#24697A', hot: '#E6FAFF', deep: '#04161b', name: 'ANOMALY SENSE' },
      clevia: { d: '#E8869B', l: '#8E2238', hot: '#FFE8EC', deep: '#1a0509', name: '???' } // Clair 27/11: không hiện Unlock; đổi thành 'KEY' khi truyện lộ tên năng lực
    };
    function kc(who) { return C.dark ? KC[who].d : KC[who].l; }
    function km(x) { return Math.max(0, Math.min(1, x)); }
    // khựng hình: từ ti, trong dur giây thời gian chỉ trôi slow lần; sau đó chạy tiếp (trễ đi một chút)
    function hitstop(t, ti, dur, slow) { if (t < ti) return t; if (t < ti + dur) return ti + (t - ti) * slow; return t - dur * (1 - slow); }
    function jolt(a, t) { main.style.transform = a > 0.03 ? 'translate(' + (Math.sin(t * 97) * a).toFixed(1) + 'px,' + (Math.cos(t * 73) * a * 0.7).toFixed(1) + 'px)' : ''; }
    // vệt tốc độ kiểu anime: những tia mảnh dồn từ mép vào một điểm, nhảy hình 20 lần mỗi giây
    function focus(cx, cy, col, a, n, R, t, inner) {
      if (a <= 0.01) return;
      var M = Math.hypot(W, H), m = Math.min(W, H), fr = Math.floor(t * 20);
      g.save(); g.fillStyle = rgba(col, a);
      for (var i = 0; i < n; i++) {
        var j = (i * 7 + fr * 13) % 60, ang = i / n * 6.283 + (R[j] - 0.5) * 0.12, r0 = m * (inner || 0.32) * (0.75 + R[(j + 17) % 60] * 0.6), w = 0.004 + R[(j + 29) % 60] * 0.012;
        g.beginPath(); g.moveTo(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0);
        g.lineTo(cx + Math.cos(ang - w) * M, cy + Math.sin(ang - w) * M); g.lineTo(cx + Math.cos(ang + w) * M, cy + Math.sin(ang + w) * M); g.closePath(); g.fill();
      }
      g.restore();
    }
    // băng tên chiêu: một dải tối chém chéo qua trang, chữ tên chiêu trượt ngang, viền màu riêng; vào 0,12 giây, ra 0,2 giây
    function cutin(u, who, label, y) {
      if (!TEN || u < 0 || u > 1.05) return;
      var col = KC[who].d, hot = KC[who].hot, inn = es(u / 0.13), out = u > 0.85 ? es((u - 0.85) / 0.2) : 0, h = Math.max(52, Math.min(96, H * 0.085)), yy = H * (y || 0.3);
      g.save(); g.translate(W / 2 + (1 - inn) * -W * 1.3 + out * W * 1.3, yy); g.rotate(-0.13);
      g.fillStyle = rgba(KC[who].deep, 0.86); g.fillRect(-W, -h / 2, W * 2, h);
      g.fillStyle = rgba(col, 0.95); g.fillRect(-W, -h / 2 - 3, W * 2, 2); g.fillRect(-W, h / 2 + 1, W * 2, 2);
      g.fillStyle = rgba(col, 0.35); g.fillRect(-W, -h / 2 + 4, W * 2, 1);
      // vệt gió chạy ngang trong dải
      for (var k = 0; k < 14; k++) { var sy = (-0.42 + ((k * 0.137) % 0.84)) * h, sx = ((k * 0.31 + u * (2.4 + k % 3)) % 1.4 - 0.7) * W * 2; g.fillStyle = rgba(col, 0.18 + (k % 3) * 0.06); g.fillRect(sx, sy, W * (0.12 + (k % 4) * 0.05), 1 + (k % 2)); }
      var fs = h * 0.5, txt = label || KC[who].name;
      g.font = 'italic 400 ' + fs.toFixed(0) + 'px Literata, Georgia, serif'; g.textBaseline = 'middle'; g.textAlign = 'center';
      try { g.letterSpacing = (fs * 0.18).toFixed(0) + 'px'; } catch (e) {}
      var dx = -W * 0.04 + u * W * 0.06;
      g.shadowColor = col; g.shadowBlur = 18; g.fillStyle = rgba(hot, 1); g.fillText(txt, dx, 1);
      g.shadowBlur = 0; g.fillStyle = rgba(col, 0.35); g.fillText(txt, dx - fs * 0.12, 1);
      try { g.letterSpacing = '0px'; } catch (e) {}
      g.restore();
    }
    // ngôi sao bốn cánh mảnh: điểm đánh trúng
    function star(x, y, r, col, a, rot) {
      if (a <= 0) return; g.save(); g.translate(x, y); g.rotate(rot || 0); g.fillStyle = rgba(col, a);
      for (var i = 0; i < 4; i++) { g.rotate(1.5708); g.beginPath(); g.moveTo(0, 0); g.lineTo(r * 0.09, r * 0.09); g.lineTo(0, r); g.lineTo(-r * 0.09, r * 0.09); g.closePath(); g.fill(); }
      g.restore(); glow(x, y, r * 0.5, col, a * 0.8);
    }
    // mắt xích thép (kiểu nền tối đã duyệt 24/11: thân gang, ánh lên mép trên, không viền đen)
    function steelLink(x, y, ang, face, a, link) {
      var lw = Math.max(2.4, link * 0.28), rx = link * 0.62, ry = face ? link * 0.36 : link * 0.13;
      g.save(); g.translate(x, y); g.rotate(ang); g.globalAlpha = a;
      if (C.dark) {
        g.shadowColor = 'rgba(170,195,215,.28)'; g.shadowBlur = link * 0.5;
        var sg = g.createLinearGradient(0, -ry - lw, 0, ry + lw); sg.addColorStop(0, '#8b98a0'); sg.addColorStop(0.35, '#434c52'); sg.addColorStop(1, '#1d2226');
        g.lineWidth = lw * 1.25; g.strokeStyle = sg; g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, 7); g.stroke(); g.shadowBlur = 0;
        g.lineWidth = Math.max(0.8, lw * 0.22); g.strokeStyle = 'rgba(222,234,242,.8)'; g.beginPath(); g.ellipse(0, -lw * 0.35, rx * 0.95, Math.max(1, ry * 0.9), 0, 3.75, 5.55); g.stroke();
      } else {
        g.lineWidth = lw * 1.5; g.strokeStyle = '#1b1f21'; g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, 7); g.stroke();
        g.lineWidth = lw * 0.45; g.strokeStyle = '#8e9ba0'; g.beginPath(); g.ellipse(0, -lw * 0.2, rx * 0.92, Math.max(1, ry * 0.85), 0, 3.5, 5.9); g.stroke();
      }
      g.restore();
    }
    // một sợi xích theo đường cong bậc hai từ (x0,y0) tới (x1,y1), võng b
    function chainPath(x0, y0, x1, y1, b, link, a, vibT, vibA) {
      var dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), ang = Math.atan2(dy, dx), n = Math.max(1, Math.floor(L / (link * 0.95)));
      var nx = -Math.sin(ang), ny = Math.cos(ang);
      for (var k = 0; k <= n; k++) {
        var s = k / n, bow = Math.sin(s * Math.PI) * (b + (vibA ? Math.sin(vibT * 70 + k * 0.5) * vibA : 0));
        var bx = x0 + dx * s + nx * bow, by = y0 + dy * s + ny * bow, d = Math.cos(s * Math.PI) * b * Math.PI / L;
        steelLink(bx, by, ang + Math.atan(d), k % 2 === 0, a, link);
      }
    }
    function sparkBurst(x, y, u, n, R, off, col, spread, dirA, speed) {
      if (u < 0 || u > 0.8) return; g.save(); g.strokeStyle = rgba(col, Math.max(0, 1 - u / 0.8)); g.lineWidth = 1.6; g.lineCap = 'round';
      for (var p = 0; p < n; p++) {
        var pa = (dirA == null ? R[(off + p) % 60] * 6.283 : dirA + (R[(off + p) % 60] - 0.5) * (spread || 2.4)), sp = (speed || Math.min(W, H)) * (0.35 + R[(off + p * 3 + 11) % 60] * 0.6);
        var x1 = x + Math.cos(pa) * sp * u, y1 = y + Math.sin(pa) * sp * u + 260 * u * u;
        g.beginPath(); g.moveTo(x1, y1); g.lineTo(x1 - Math.cos(pa) * 9, y1 - Math.sin(pa) * 9); g.stroke();
      }
      g.restore();
    }

    /* ===== LEON ===== */
    // Xích tấn công (combat). Báo hiệu 0–0,75: trang tối sập, vệt tốc độ xám thép dồn vào giữa, băng "CHAIN" chém qua, xích rung lách cách ở hai góc trên.
    // Bung 0,75–1,6: 4–6 sợi xích quất chéo vào từ các mép, vệt nhoè sau đầu xích; trúng ở 0,95: khựng hình, loé trắng thép, sao bốn cánh, sóng tròn, rung trang.
    // Dư âm 1,6–3,4: xích căng rung, chùng xuống, giật ngược về; bụi thép rơi; trang sáng lại.
    MORE['leon-strike'] = function (t0, R) {
      if (t0 > 3.5) { main.style.transform = ''; return true; }
      var t = hitstop(t0, 0.95, 0.14, 0.08), m = Math.min(W, H), cx = W / 2, cy = H * 0.52, col = kc('leon'), hot = KC.leon.hot, link = Math.max(12, m * 0.034);
      var dk = t0 < 0.2 ? t0 / 0.2 : t0 < 2.6 ? 1 - 0.3 * km((t0 - 0.9) / 1.2) : Math.max(0, 0.7 * (1 - (t0 - 2.6) / 0.9));
      edge('#000000', (C.dark ? 0.9 : 0.72) * dk * Math.min(1, 0.7 + PW * 0.3), 0.1);
      // báo hiệu
      focus(cx, cy, col, (t0 < 0.75 ? km(t0 / 0.3) * 0.35 : t0 < 1.3 ? 0.5 * (1 - (t0 - 0.75) / 0.55) : 0) * PW, 46, R, t0, 0.3);
      if (t0 < 0.8) {
        var rat = Math.sin(t0 * 55) * link * 0.25;
        [[-0.02, -0.02, 0.18, 0.12], [1.02, -0.02, 0.82, 0.12]].forEach(function (c, i) { chainPath(W * c[0], H * c[1], W * c[2] + rat * (i ? -1 : 1), H * c[3], link * 0.8, link * 0.8, km(t0 / 0.25) * (1 - km((t0 - 0.7) / 0.1)), t0, link * 0.2); });
      }
      cutin(t0 - 0.02, 'leon');
      // bung: xích quất vào
      var N = Math.round(3 + 2 * PW), O = [[-0.1, 0.08], [1.1, 0.14], [-0.12, 0.8], [1.12, 0.74], [0.3, -0.1], [0.72, 1.1]];
      var shake = 0;
      for (var c = 0; c < N; c++) {
        var st = 0.72 + c * 0.03, u = t - st; if (u <= 0) continue;
        var ox = O[c][0] * W, oy = O[c][1] * H, ang0 = c / N * 6.283 + R[c] * 0.6, tx = cx + Math.cos(ang0) * m * 0.06, ty = cy + Math.sin(ang0) * m * 0.06;
        var fly = u < 0.2 ? Math.pow(u / 0.2, 0.5) : 1;
        if (t > 2.75) fly *= Math.max(0, 1 - Math.pow((t - 2.75) / 0.45, 2));
        var hx = ox + (tx - ox) * fly, hy = oy + (ty - oy) * fly, bow = u < 0.2 ? link * 3.2 * (1 - fly) * (c % 2 ? 1 : -1) : t > 2.75 ? Math.sin((t - 2.75) * 10) * link * 1.8 : t > 2.1 ? link * 1.2 * km((t - 2.1) / 0.6) : 0;
        var fade = t > 3.1 ? Math.max(0, 1 - (t - 3.1) / 0.3) : 1;
        // vệt nhoè sau đầu xích lúc đang quất
        if (u < 0.28) { var ba = Math.atan2(hy - oy, hx - ox), bl = Math.min(Math.hypot(hx - ox, hy - oy), m * 0.6); g.save(); g.strokeStyle = rgba(col, 0.28 * (1 - u / 0.28)); g.lineWidth = link * 1.6; g.lineCap = 'round'; g.beginPath(); g.moveTo(hx - Math.cos(ba) * bl, hy - Math.sin(ba) * bl); g.lineTo(hx, hy); g.stroke(); g.restore(); }
        chainPath(ox, oy, hx, hy, bow, link, fade, t, t > 0.95 && t < 2.1 ? link * 0.22 * Math.exp(-(t - 0.95) * 2) : 0);
      }
      // trúng
      var hu = t0 - 0.95;
      if (hu > 0) {
        if (hu < 0.14) { wash(C.dark ? '#e8f0f6' : '#ffffff', 0.55 * (1 - hu / 0.14) * PW); }
        star(cx, cy, m * (0.28 + 0.1 * PW) * (hu < 0.14 ? 1 : Math.max(0, 1 - (hu - 0.14) / 0.35)), hot, hu < 0.5 ? 1 : 0, 0.3);
        var rr = (hu - 0.1) * m * 1.6; if (rr > 0 && rr < Math.max(W, H)) { g.save(); g.strokeStyle = rgba(hot, 0.8 * (1 - rr / Math.max(W, H))); g.lineWidth = 3 * PW; g.beginPath(); g.arc(cx, cy, rr, 0, 7); g.stroke(); g.lineWidth = 1; g.beginPath(); g.arc(cx, cy, rr * 0.9, 0, 7); g.stroke(); g.restore(); }
        sparkBurst(cx, cy, t - 0.97, Math.round(18 * PW), R, 3, C.dark ? '#dfeaf3' : '#55636e');
        if (hu < 0.5) shake = (hu < 0.14 ? 1 : 1 - (hu - 0.14) / 0.36) * 9 * PW;
      }
      // bụi thép rơi
      if (t0 > 1.2 && t0 < 3.4) { g.fillStyle = rgba(col, 0.6 * Math.max(0, 1 - (t0 - 1.2) / 2.2)); for (var d = 0; d < 30; d++) { var px = cx + (R[d] - 0.5) * m * 0.7, py = cy + (R[(d + 31) % 60] - 0.3) * m * 0.3 + (t0 - 1.2) * (60 + R[(d + 7) % 60] * 90); g.fillRect(px, py, 1.6, 1.6); } }
      jolt(shake, t0);
      return false;
    };
    // Xích cứu người (nhẹ, không đánh). Báo hiệu 0–0,5: ánh lạnh chạy dọc mép trái. Bung 0,5–1,5: một sợi xích lướt vào, vòng thành vòng lỏng ôm giữa trang,
    // khép vòng ở 1,3 thì một nhịp sáng mềm, trang được nhấc lên. Dư âm 1,5–4: vòng giữ, đung đưa, đặt xuống rồi tháo về mép trái.
    MORE['leon-rescue'] = function (t, R) {
      if (t > 4.4) { main.style.transform = ''; return true; }
      var m = Math.min(W, H), link = Math.max(11, m * 0.03), col = kc('leon'), hot = KC.leon.hot;
      var lift = t < 1.3 ? 0 : t < 1.8 ? es((t - 1.3) / 0.5) : t < 3.2 ? 1 : Math.max(0, 1 - es((t - 3.2) / 0.5));
      var cx = W / 2, cy = H * 0.52 - lift * 14 * PW + Math.sin(t * 2.4) * 2 * lift, Rx = m * 0.34, Ry = Rx * 0.4;
      edge('#000000', (C.dark ? 0.55 : 0.35) * env(t, 0.4, 3, 1), 0.2);
      if (t < 0.6) { var q = t / 0.6, gy = H * (0.2 + 0.6 * q); glow(0, gy, m * 0.25, hot, 0.5 * Math.sin(q * Math.PI)); }
      cutin(t - 0.05, 'leon');
      var sx = -W * 0.06, sy = cy + H * 0.14, ex = cx - Rx, ey = cy;
      var Ls = Math.hypot(ex - sx, ey - sy), Lr = Math.PI * (3 * (Rx + Ry) - Math.sqrt((3 * Rx + Ry) * (Rx + 3 * Ry))), L = Ls + Lr, sp = link * 0.95;
      var reach = t < 0.5 ? 0 : t < 1.3 ? es((t - 0.5) / 0.8) : t < 3.6 ? 1 : Math.max(0, 1 - es((t - 3.6) / 0.6)), fade = t > 4 ? Math.max(0, 1 - (t - 4) / 0.4) : 1;
      var show = L * reach;
      for (var d = 0; d < show; d += sp) {
        var x, y, a;
        if (d < Ls) { var s = d / Ls; x = sx + (ex - sx) * s; y = sy + (ey - sy) * s + Math.sin(Math.PI * s) * link * 1.2; a = Math.atan2(ey - sy, ex - sx); }
        else { var aa = Math.PI + (d - Ls) / Lr * 6.283; x = cx + Math.cos(aa) * Rx; y = cy + Math.sin(aa) * Ry; a = aa + Math.PI / 2; }
        steelLink(x, y, a, Math.round(d / sp) % 2 === 0, fade * (d > show - sp * 4 ? 0.5 + 0.5 * (show - d) / (sp * 4) : 1), link);
      }
      var cl = t - 1.3; if (cl > 0 && cl < 1.1) { g.save(); g.strokeStyle = rgba(hot, 0.6 * (1 - cl / 1.1) * PW); g.lineWidth = 2; g.shadowColor = col; g.shadowBlur = 16; g.beginPath(); g.ellipse(cx, cy, Rx * (1 + cl * 0.25), Ry * (1 + cl * 0.25), 0, 0, 7); g.stroke(); g.restore(); glow(cx, cy, m * 0.4, col, 0.18 * (1 - cl / 1.1)); }
      main.style.transform = lift > 0.01 ? 'translateY(' + (-lift * 8 * PW).toFixed(1) + 'px)' : '';
      return false;
    };

    /* ===== LUKE ===== */
    // Anomaly Sense. Báo hiệu 0–0,6: tiếng bị hút mất, trang mất màu, viền xanh băng, vệt tốc độ xanh băng, băng "ANOMALY SENSE".
    // Bung 0,6–2,2: ba vòng sóng dò toả ra, mỗi vòng đi qua làm lưới quét mảnh hiện lên; ở 1,55 bốn góc ngắm sập vào chỗ bất thường: khựng hình, loé băng, chữ tách màu.
    // Dư âm 2,2–4,2: sương giá mọc ở bốn góc rồi tan, màu trang trở lại.
    MORE['luke-sense'] = function (t0, R) {
      if (t0 > 4.3) { main.style.transform = ''; main.style.filter = ''; main.style.textShadow = ''; return true; }
      var t = hitstop(t0, 1.55, 0.12, 0.1), cx = W / 2, cy = H * 0.55, M = Math.max(W, H), m = Math.min(W, H), col = kc('luke'), hot = KC.luke.hot;
      var k = t0 < 0.35 ? t0 / 0.35 : t0 < 3.4 ? 1 : Math.max(0, 1 - (t0 - 3.4) / 0.9);
      edge(C.dark ? '#00070a' : '#0c2a33', (C.dark ? 0.8 : 0.45) * k, 0.16); edge(col, 0.22 * k * PW, 0.45);
      focus(cx, cy, col, (t0 < 0.6 ? km(t0 / 0.25) * 0.3 : t0 < 1 ? 0.3 * (1 - (t0 - 0.6) / 0.4) : 0) * PW, 40, R, t0, 0.28);
      cutin(t0 - 0.06, 'luke', null, 0.26);
      // bụi đứng im
      for (var i = 0; i < 50; i++) { var px = R[i] * W, py = R[(i * 7 + 3) % 60] * H, dd = Math.hypot(px - cx, py - cy), lit = 0.18; [0.6, 1.05, 1.5].forEach(function (w0) { var rr = (t - w0) * M * 0.7; if (rr > 0) lit = Math.max(lit, Math.max(0, 1 - Math.abs(rr - dd) / 46)); }); g.fillStyle = rgba(hot, lit * k); g.beginPath(); g.arc(px, py, 1 + lit * 2, 0, 7); g.fill(); }
      // sóng dò + lưới quét
      [0.6, 1.05, 1.5].forEach(function (w0, wi) {
        var u = t - w0, rr = u * M * 0.7; if (u <= 0 || rr > M * 1.1) return;
        var al = (1 - rr / (M * 1.1)) * k;
        g.save(); g.strokeStyle = rgba(hot, 0.95 * al); g.lineWidth = 2.5 * PW; g.shadowColor = col; g.shadowBlur = 14; g.beginPath(); g.arc(cx, cy, rr, 0, 7); g.stroke();
        g.shadowBlur = 0; g.lineWidth = 1; g.strokeStyle = rgba(col, 0.7 * al); g.beginPath(); g.arc(cx, cy, rr * 0.94, 0, 7); g.stroke();
        if (u < 0.35) { g.strokeStyle = rgba(col, 0.16 * (1 - u / 0.35) * PW); for (var gx = (wi * 13) % 40; gx < W; gx += 40) { g.beginPath(); g.moveTo(gx, 0); g.lineTo(gx, H); g.stroke(); } for (var gy = (wi * 17) % 40; gy < H; gy += 40) { g.beginPath(); g.moveTo(0, gy); g.lineTo(W, gy); g.stroke(); } }
        g.restore();
      });
      // góc ngắm sập vào chỗ bất thường
      var ax = W * (R[0] > 0.5 ? 0.72 : 0.28), ay = H * (0.22 + R[1] * 0.16), lu = t0 - 1.2, glitch = 0;
      if (lu > 0 && t0 < 3.6) {
        var close = es(lu / 0.35), sz = m * (0.5 - 0.42 * close), fa = Math.min(1, lu / 0.1) * k, arm = sz * 0.35;
        g.save(); g.strokeStyle = rgba(hot, fa); g.lineWidth = 2.2; g.shadowColor = col; g.shadowBlur = 12;
        [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (s) { var bx = ax + s[0] * sz, by = ay + s[1] * sz; g.beginPath(); g.moveTo(bx - s[0] * arm, by); g.lineTo(bx, by); g.lineTo(bx, by - s[1] * arm); g.stroke(); });
        g.restore();
        if (t0 > 1.55) {
          var hu = t0 - 1.55; glitch = hu < 0.5 ? 1 - hu / 0.5 : 0;
          if (hu < 0.12) wash(hot, 0.4 * (1 - hu / 0.12) * PW);
          star(ax, ay, m * 0.16 * PW * (hu < 0.12 ? 1 : Math.max(0, 1 - (hu - 0.12) / 0.4)), hot, 1, 0.785);
          g.fillStyle = rgba('#ff4d5e', fa * (0.7 + 0.3 * Math.sin(t0 * 14))); g.beginPath(); g.arc(ax, ay, 3.5, 0, 7); g.fill();
          g.save(); g.strokeStyle = rgba(col, 0.6 * fa); g.lineWidth = 1.2; g.setLineDash([5, 6]); g.lineDashOffset = -t0 * 50; g.beginPath(); g.moveTo(cx, cy); g.lineTo(ax, ay); g.stroke(); g.restore();
        }
      }
      // sương giá ở bốn góc
      if (t0 > 2.1) {
        var fr = km((t0 - 2.1) / 0.8) * (t0 < 3.4 ? 1 : Math.max(0, 1 - (t0 - 3.4) / 0.9));
        g.save(); g.strokeStyle = rgba(hot, 0.55 * fr); g.lineWidth = 1;
        [[0, 0], [W, 0], [0, H], [W, H]].forEach(function (c, ci) {
          for (var b = 0; b < 6; b++) { var ang = Math.atan2(cy - c[1], cx - c[0]) + (R[(ci * 6 + b) % 60] - 0.5) * 1.3, len = m * (0.1 + R[(ci * 6 + b + 30) % 60] * 0.14) * fr, ex = c[0] + Math.cos(ang) * len, ey = c[1] + Math.sin(ang) * len;
            g.beginPath(); g.moveTo(c[0], c[1]); g.lineTo(ex, ey); g.stroke();
            for (var s = 1; s < 4; s++) { var px = c[0] + Math.cos(ang) * len * s / 4, py = c[1] + Math.sin(ang) * len * s / 4, bl = len * 0.18; g.beginPath(); g.moveTo(px, py); g.lineTo(px + Math.cos(ang + 0.7) * bl, py + Math.sin(ang + 0.7) * bl); g.moveTo(px, py); g.lineTo(px + Math.cos(ang - 0.7) * bl, py + Math.sin(ang - 0.7) * bl); g.stroke(); } }
        });
        g.restore();
      }
      main.style.filter = k > 0.02 ? 'grayscale(' + (0.8 * k).toFixed(2) + ')' : '';
      var cs = 3 * glitch * PW;
      main.style.textShadow = cs > 0.1 ? (-cs).toFixed(1) + 'px 0 rgba(255,77,94,.55),' + cs.toFixed(1) + 'px 0 rgba(120,220,255,.6)' : '';
      main.style.transform = glitch > 0.05 ? 'translateX(' + ((R[Math.floor(t0 * 30) % 60] - 0.5) * 8 * glitch).toFixed(1) + 'px)' : '';
      return false;
    };
    // Protect. Báo hiệu 0–0,45: lục giác băng lung linh giữa trang, băng "PROTECT". Bung 0,45–1,1: vỏ lục giác bung ra từng vòng, khép kín loé ở 0,8;
    // một nhát vồ trúng vỏ ở 1,1: khựng hình, vết nứt toả ra từ chỗ trúng, rung nhẹ. Dư âm 1,3–3,6: vỏ giữ, lung linh, rồi rã thành mảnh băng bay lên.
    MORE['luke-protect'] = function (t0, R) {
      if (t0 > 3.7) { main.style.transform = ''; return true; }
      var t = hitstop(t0, 1.1, 0.12, 0.08), cx = W / 2, cy = H * 0.52, m = Math.min(W, H), col = kc('luke'), hot = KC.luke.hot;
      var Rd = m * 0.44, hs = Rd / 5.2;
      edge('#000000', (C.dark ? 0.6 : 0.35) * env(t0, 0.3, 2.6, 0.8), 0.25);
      cutin(t0 - 0.04, 'luke', 'PROTECT', 0.24);
      if (t0 < 0.5) { var q = t0 / 0.5; hexAt(cx, cy, hs * (0.6 + q * 0.4), rgba(hot, 0.8 * Math.sin(q * Math.PI)), 2); glow(cx, cy, hs * 3, col, 0.3 * q); }
      var grow = km((t - 0.45) / 0.35), dissolve = t > 2.8 ? km((t - 2.8) / 0.8) : 0;
      // các ô lục giác theo vòng
      g.save(); g.lineWidth = 1.4;
      var shellA = grow > 0 ? (1 - dissolve) : 0;
      if (shellA > 0) {
        var ring0 = Math.ceil(5.2 * grow);
        for (var qx = -6; qx <= 6; qx++) for (var qy = -6; qy <= 6; qy++) {
          var px = cx + hs * 1.5 * qx, py = cy + hs * Math.sqrt(3) * (qy + (qx & 1 ? 0.5 : 0)), d = Math.hypot(px - cx, py - cy) / hs;
          if (d > 5.2 || d > ring0 + 0.6) continue;
          var edgeK = Math.pow(d / 5.2, 2), pulse = 0.5 + 0.5 * Math.sin(t0 * 3 + d), shine = t0 > 0.8 && t0 < 1.1 ? 1 - (t0 - 0.8) / 0.3 : 0;
          hexAt(px, py, hs * 0.96, rgba(shine > 0 ? hot : col, Math.min(1, (C.dark ? 0.25 : 0.45) + 0.55 * edgeK + 0.15 * pulse + shine * 0.5) * shellA * Math.min(1, PW)), C.dark ? 1.4 : 1.8, rgba(col, (0.03 + 0.06 * edgeK) * shellA));
        }
      }
      g.restore();
      // khép kín
      var cl = t0 - 0.8; if (cl > 0 && cl < 0.6) { g.save(); g.strokeStyle = rgba(hot, 0.9 * (1 - cl / 0.6)); g.lineWidth = 3; g.shadowColor = col; g.shadowBlur = 20; g.beginPath(); g.arc(cx, cy, Rd * (1 + cl * 0.3), 0, 7); g.stroke(); g.restore(); }
      // nhát vồ trúng vỏ + vết nứt
      var hu = t0 - 1.1, ia = -0.9 + R[2] * 0.6, ix = cx + Math.cos(ia) * Rd * 0.92, iy = cy + Math.sin(ia) * Rd * 0.92;
      if (hu > -0.12 && hu < 0) { g.save(); g.strokeStyle = rgba(hot, 0.8); g.lineWidth = 2; for (var c = 0; c < 3; c++) { var o = (c - 1) * 12, ox = ix + Math.cos(ia) * m * 0.3, oy = iy + Math.sin(ia) * m * 0.3, pr = 1 + hu / 0.12; g.beginPath(); g.moveTo(ox + o, oy); g.lineTo(ox + (ix - ox) * pr + o, oy + (iy - oy) * pr); g.stroke(); } g.restore(); }
      var shake = 0;
      if (hu > 0) {
        if (hu < 0.12) { wash(hot, 0.35 * (1 - hu / 0.12) * PW); shake = 6 * PW; } else if (hu < 0.4) shake = 6 * PW * (1 - (hu - 0.12) / 0.28);
        star(ix, iy, m * 0.14 * (hu < 0.12 ? 1 : Math.max(0, 1 - (hu - 0.12) / 0.3)), hot, 1, 0.2);
        var cr = km(hu / 0.25) * (1 - dissolve);
        g.save(); g.strokeStyle = rgba(hot, 0.85 * cr); g.lineWidth = 1.5; g.shadowColor = col; g.shadowBlur = 8;
        for (var b = 0; b < 7; b++) { var a = ia + Math.PI + (b - 3) * 0.32 + (R[b + 10] - 0.5) * 0.2, x = ix, y = iy, L = m * (0.12 + R[b + 20] * 0.16) * cr * Math.min(1.3, PW); g.beginPath(); g.moveTo(x, y); for (var s = 1; s <= 4; s++) { a += (R[(b * 4 + s) % 60] - 0.5) * 0.6; x += Math.cos(a) * L / 4; y += Math.sin(a) * L / 4; g.lineTo(x, y); } g.stroke(); }
        g.restore();
        sparkBurst(ix, iy, hu, Math.round(12 * PW), R, 22, hot, 1.6, ia, m * 0.6);
      }
      // rã thành mảnh băng bay lên
      if (dissolve > 0) {
        g.save();
        for (var k = 0; k < 34; k++) { var a2 = R[k % 60] * 6.283, r0 = Rd * (0.4 + R[(k + 9) % 60] * 0.6), sx = cx + Math.cos(a2) * r0, sy = cy + Math.sin(a2) * r0 - dissolve * m * (0.15 + R[(k + 21) % 60] * 0.25), sz = 4 + R[(k * 3) % 60] * 8;
          g.save(); g.translate(sx, sy); g.rotate(dissolve * 4 + k); g.globalAlpha = Math.max(0, 1 - dissolve); g.fillStyle = rgba(col, 0.3); g.strokeStyle = rgba(hot, 0.9); g.lineWidth = 1; g.beginPath(); g.moveTo(0, -sz); g.lineTo(sz * 0.6, sz * 0.4); g.lineTo(-sz * 0.5, sz * 0.5); g.closePath(); g.fill(); g.stroke(); g.restore(); }
        g.restore();
      }
      jolt(shake, t0);
      return false;
    };
    function hexAt(x, y, r, stroke, w, fill) { g.beginPath(); for (var i = 0; i < 6; i++) { var a = i / 6 * 6.283; i ? g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r) : g.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } g.strokeStyle = stroke; g.lineWidth = w || 1; g.stroke(); }

    /* ===== CLEVIA ===== */
    // Unlock (kiểu A3 Clair chốt 24/11, thêm dàn anime). Báo hiệu 0–0,6: bốn vòng đỏ rượu hiện ra quay lệch nhau, lỗ khoá mờ giữa trang, vệt tốc độ đỏ, băng "UNLOCK".
    // Bung 0,6–1,9: từng vòng "cạch" khớp khe lên đỉnh ở 0,6 / 0,85 / 1,1 / 1,6 (mỗi cú cạch khựng một nhịp ngắn, cả trang là ổ khoá: đoạn chữ cạch về hàng);
    // 1,9: lỗ khoá đầy ánh sáng, tia sáng xuyên dọc, vòng nở tung. Dư âm 1,9–3,4: lấp lánh đỏ hồng bay lên, tan.
    MORE['clevia-unlock'] = function (t0, R) {
      if (t0 > 3.5) { main.style.transform = ''; MORE.clevia_c(9, R); return true; }
      var t = t0;
      [0.6, 0.85, 1.1, 1.6].forEach(function (c) { t = hitstop(t, c, 0.06, 0.15); });
      var cx = W / 2, cy = H * 0.5, m = Math.min(W, H), col = kc('clevia'), hot = KC.clevia.hot;
      edge(C.dark ? '#000000' : '#2a0a12', (C.dark ? 0.65 : 0.3) * env(t0, 0.3, 2.3, 0.8), 0.2);
      focus(cx, cy, col, (t0 < 0.6 ? km(t0 / 0.25) * 0.28 : t0 > 1.9 && t0 < 2.4 ? 0.4 * (1 - (t0 - 1.9) / 0.5) : 0) * PW, 40, R, t0, 0.42);
      // Clair 27/11: năng lực thật của Clevia là Key nên băng tên chiêu hiện "???" (KC.clevia.name); khi truyện tới đoạn lộ tên thì đổi thành KEY.
      cutin(t0 - 0.04, 'clevia', null, 0.24);
      // lỗ khoá mờ giữa trang, đầy dần theo từng cú cạch
      var fill = t < 0.6 ? 0 : t < 0.85 ? 0.25 : t < 1.1 ? 0.5 : t < 1.6 ? 0.75 : 1, kh = m * 0.05, ka = t0 < 0.3 ? t0 / 0.3 : t0 < 2.2 ? 1 : Math.max(0, 1 - (t0 - 2.2) / 0.5);
      g.save(); g.fillStyle = rgba(hot, (0.12 + 0.6 * fill) * ka); g.strokeStyle = rgba(col, 0.9 * ka); g.lineWidth = 1.5; g.shadowColor = col; g.shadowBlur = 10 + 20 * fill;
      g.beginPath(); g.arc(cx, cy - kh * 0.4, kh * 0.55, 0, 7); g.moveTo(cx - kh * 0.22, cy - kh * 0.1); g.lineTo(cx + kh * 0.22, cy - kh * 0.1); g.lineTo(cx + kh * 0.38, cy + kh * 1.1); g.lineTo(cx - kh * 0.38, cy + kh * 1.1); g.closePath(); g.fill(); g.stroke(); g.restore();
      // vòng khoá + cả trang là ổ khoá (dùng lại hai bản Clair đã duyệt, chạy theo thời gian có khựng)
      MORE.clevia_a(t, R); MORE.clevia_c(t, R);
      // mỗi cú cạch: tia đỏ ngắn toé ở đỉnh vòng
      [0.6, 0.85, 1.1, 1.6].forEach(function (c, i) { var u = t0 - c; if (u > 0 && u < 0.3) { var r = m * (0.14 + i * 0.075); star(cx, cy - r, m * 0.08 * PW * (1 - u / 0.3), hot, 1, 0); } });
      // mở: loé, tia lỗ khoá
      var bu = t0 - 1.9, shake = 0;
      if (bu > 0) {
        if (bu < 0.12) { wash(hot, 0.4 * (1 - bu / 0.12) * PW); shake = 4 * PW; }
        star(cx, cy, m * 0.35 * PW * (bu < 0.12 ? 1 : Math.max(0, 1 - (bu - 0.12) / 0.4)), hot, 1, 0.785);
        g.save(); for (var k = 0; k < 40; k++) { var sx = cx + (R[k % 60] - 0.5) * m * 0.8, sy = cy + m * 0.2 - bu * m * (0.25 + R[(k + 13) % 60] * 0.45), a = Math.max(0, 1 - bu / 1.5) * (0.5 + 0.5 * Math.sin(t0 * 12 + k)); g.fillStyle = rgba(k % 3 ? col : hot, a); g.beginPath(); g.arc(sx, sy, 1.2 + R[(k + 5) % 60] * 2, 0, 7); g.fill(); } g.restore();
      }
      [0.6, 0.85, 1.1, 1.6].forEach(function (c) { var u = t0 - c; if (u > 0 && u < 0.08) shake = Math.max(shake, 2.5 * PW); });
      jolt(shake, t0);
      return false;
    };

    /* ===== BẢN THỬ B: CẬN CẢNH VẼ SVG (bước 4 đề xuất hiệu ứng, 27/11) ===== */
    // Mắt Luke loé xanh băng lúc Sense. Chỉ một dải mắt trong băng cắt ngang trang, không thấy mặt, không hình bóng người.
    // Nhịp: 0–0,25 băng tối xẻ mở; 0,2–0,6 mí mở; 0,9 loé: mống mắt bừng xanh băng, đồng tử co, khựng hình, vòng sóng bật ra khỏi mắt;
    // 0,9–2,1 vòng dò gợn trong mống mắt; 1,35 chấm đỏ (chỗ bất thường) phản chiếu trong mống mắt, mí híp lại ngắm; 2,4–2,8 băng khép.
    // 'luke-eye' đứng riêng; 'luke-eye-sense' = cận cảnh rồi nối thẳng vào bộ chiêu luke-sense (sóng dò ra cả trang).
    var EYE_N = 0, SVGNS = 'http://www.w3.org/2000/svg';
    function eyeBuild() {
      var id = 'lke' + (++EYE_N), sv = document.createElementNS(SVGNS, 'svg');
      sv.setAttribute('viewBox', '0 0 1000 420'); sv.setAttribute('preserveAspectRatio', 'xMidYMid meet'); sv.setAttribute('aria-hidden', 'true');
      sv.style.cssText = 'position:fixed;left:0;width:100%;pointer-events:none;z-index:4;overflow:visible';
      var st = '';
      for (var i = 0; i < 40; i++) { var a = i / 40 * 6.283, r0 = 34 + (i % 3) * 4, r1 = 76 + (i % 5) * 5; st += '<line x1="' + (Math.cos(a) * r0).toFixed(1) + '" y1="' + (Math.sin(a) * r0).toFixed(1) + '" x2="' + (Math.cos(a) * r1).toFixed(1) + '" y2="' + (Math.sin(a) * r1).toFixed(1) + '"/>'; }
      var sp = ''; for (var k = 0; k < 18; k++) sp += '<rect class="sp" height="' + (1 + k % 2) + '" y="' + (60 + k * 17) + '"/>';
      var ray = ''; for (var j = 0; j < 36; j++) { var b = j / 36 * 6.283 + (j % 2) * 0.05, w = 0.012 + (j % 4) * 0.006; ray += '<path d="M' + (500 + Math.cos(b) * 250).toFixed(0) + ' ' + (205 + Math.sin(b) * 170).toFixed(0) + 'L' + (500 + Math.cos(b - w) * 1400).toFixed(0) + ' ' + (205 + Math.sin(b - w) * 1400).toFixed(0) + 'L' + (500 + Math.cos(b + w) * 1400).toFixed(0) + ' ' + (205 + Math.sin(b + w) * 1400).toFixed(0) + 'Z"/>'; }
      // nét vẽ kiểu giao diện hệ thống (Clair 27/11: "không tô màu gì hết, như con mắt hệ thống"): chỉ có nét phát sáng, không mảng màu
      var tk = ''; for (var m2 = 0; m2 < 72; m2++) { var a2 = m2 / 72 * 6.283, r2 = m2 % 6 ? 112 : 104; tk += '<line x1="' + (Math.cos(a2) * r2).toFixed(1) + '" y1="' + (Math.sin(a2) * r2).toFixed(1) + '" x2="' + (Math.cos(a2) * 118).toFixed(1) + '" y2="' + (Math.sin(a2) * 118).toFixed(1) + '"/>'; }
      sv.innerHTML =
        '<defs>' +
        '<clipPath id="' + id + 'b"><polygon class="bandclip"/></clipPath>' +
        '<clipPath id="' + id + 'e"><path class="eyeclip"/></clipPath>' +
        '<linearGradient id="' + id + 'bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#01080d" stop-opacity=".84"/><stop offset=".5" stop-color="#020d14" stop-opacity=".94"/><stop offset="1" stop-color="#01080d" stop-opacity=".84"/></linearGradient>' +
        '<filter id="' + id + 'f" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>' +
        '<filter id="' + id + 'g" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
        '</defs>' +
        '<g clip-path="url(#' + id + 'b)">' +
          '<rect x="-3000" y="-200" width="7000" height="820" fill="url(#' + id + 'bg)"/>' +
          '<g class="rays" fill="#8FD6E6" opacity="0">' + ray + '</g>' +
          '<g class="spd" fill="#8FD6E6">' + sp + '</g>' +
          '<ellipse class="halo" cx="505" cy="205" rx="300" ry="140" fill="#8FD6E6" opacity="0" filter="url(#' + id + 'f)"/>' +
          '<g class="hud" fill="none" stroke="#8FD6E6" stroke-width="1.6"><path class="brk"/></g>' +
          '<g filter="url(#' + id + 'g)" fill="none" stroke-linecap="round" stroke-linejoin="round">' +
            '<path class="crease" stroke="#8FD6E6" stroke-width="1.4" stroke-dasharray="10 8"/>' +
            '<g class="tick" stroke="#8FD6E6" stroke-width="1.3" opacity="0">' + tk + '</g>' +
            '<g clip-path="url(#' + id + 'e)">' +
              '<circle class="iglow" cx="505" cy="205" r="98" stroke="#8FD6E6" stroke-width="16" opacity="0" filter="url(#' + id + 'f)"/>' +
              '<circle class="ib" cx="505" cy="205" r="98" stroke="#E6FAFF" stroke-width="2.6"/>' +
              '<circle class="ib2" cx="505" cy="205" r="72" stroke="#8FD6E6" stroke-width="1.2" stroke-dasharray="3 7"/>' +
              '<g class="stri" stroke="#e6faff" stroke-width="1.1" opacity=".18">' + st + '</g>' +
              '<g class="rings" stroke="#e6faff"><circle cx="505" cy="205"/><circle cx="505" cy="205"/><circle cx="505" cy="205"/></g>' +
              '<ellipse class="pup" cx="505" cy="205" rx="12" ry="30" stroke="#E6FAFF" stroke-width="2.4"/>' +
              '<path class="cross" stroke="#E6FAFF" stroke-width="1.2" d="M505 160V185M505 225V250M460 205H485M525 205H550"/>' +
              '<g class="red" opacity="0"><circle cx="545" cy="198" r="7" stroke="#ff6b78" stroke-width="2.2"/><circle cx="545" cy="198" r="1.8" fill="#ff6b78" stroke="none"/>' +
                '<path class="ret" stroke="#ff8a96" stroke-width="2.2"/></g>' +
              '<circle cx="470" cy="182" r="8" stroke="#ffffff" stroke-width="1.6" opacity=".8"/>' +
            '</g>' +
            '<path class="low" stroke="#8FD6E6" stroke-width="1.8"/>' +
            '<path class="lid" stroke="#E6FAFF" stroke-width="2.4"/>' +
            '<path class="lidhi" stroke="#8FD6E6" stroke-width="1"/>' +
            '<g class="lash" stroke="#E6FAFF" stroke-width="2.4"/>' +
            '<g class="brow" stroke="#E6FAFF" stroke-width="1.6"/>' +
            '<g class="hair" stroke="#a9e6f2" stroke-width="1.3"/>' +
          '</g>' +
          '<path class="star" fill="#ffffff" opacity="0"/>' +
          '<g class="out" fill="none" stroke="#E6FAFF"><ellipse cx="505" cy="205"/><ellipse cx="505" cy="205"/></g>' +
          '<rect class="wash" x="-3000" y="-200" width="7000" height="820" fill="#E6FAFF" opacity="0"/>' +
        '</g>' +
        '<g class="edges" stroke="#8FD6E6" stroke-width="2.5"><line class="e1"/><line class="e2"/></g>';
      document.body.appendChild(sv);
      var q = function (s) { return sv.querySelector(s); };
      return { sv: sv, band: q('.bandclip'), clip: q('.eyeclip'), lid: q('.lid'), lidhi: q('.lidhi'), low: q('.low'), crease: q('.crease'), lash: q('.lash'),
        ib: q('.ib'), iglow: q('.iglow'), halo: q('.halo'), stri: q('.stri'), rings: sv.querySelectorAll('.rings circle'), pup: q('.pup'), red: q('.red'), ret: q('.ret'),
        star: q('.star'), brow: q('.brow'), hair: q('.hair'), ib2: q('.ib2'), tick: q('.tick'), brk: q('.brk'), cross: q('.cross'), outs: sv.querySelectorAll('.out ellipse'), wash: q('.wash'), rays: q('.rays'), sp: sv.querySelectorAll('.sp'), e1: q('.e1'), e2: q('.e2') };
    }
    function lerp(a, b, u) { return a + (b - a) * u; }
    function P(x, y) { return x.toFixed(1) + ' ' + y.toFixed(1); }
    function eyeDraw(E, t0, R) {
      var t = hitstop(t0, 0.9, 0.1, 0.1), dk = C.dark;
      // chỗ đặt dải trên màn: giữa trên trang, cao tối đa 36% màn
      var bh = Math.min(W * 0.46, H * 0.36), top = H * 0.38 - bh / 2;
      E.sv.style.top = top.toFixed(1) + 'px'; E.sv.style.height = bh.toFixed(1) + 'px';
      // băng xẻ mở rồi khép (dải nghiêng như băng tên chiêu)
      var op = es(t0 / 0.25) * (t0 > 2.45 ? 1 - es((t0 - 2.45) / 0.3) : 1), hh = 205 * op;
      var tl = 215 - hh - 14, bl = 215 + hh + 14;
      E.band.setAttribute('points', '-3000,' + (tl + 120) + ' 4000,' + (tl - 120) + ' 4000,' + (bl - 120) + ' -3000,' + (bl + 120));
      var ea = op > 0.02 ? Math.min(1, op * 1.5) : 0;
      E.e1.setAttribute('x1', -3000); E.e1.setAttribute('y1', tl + 120); E.e1.setAttribute('x2', 4000); E.e1.setAttribute('y2', tl - 120);
      E.e2.setAttribute('x1', -3000); E.e2.setAttribute('y1', bl + 120); E.e2.setAttribute('x2', 4000); E.e2.setAttribute('y2', bl - 120);
      E.e1.setAttribute('opacity', ea); E.e2.setAttribute('opacity', ea * 0.6);
      // mí: mở 0,2–0,6; híp lại ngắm từ 1,35; nhắm nhanh lúc băng khép
      var o = es((t - 0.2) / 0.4);
      if (t > 1.35) o = lerp(o, 0.72, es((t - 1.35) / 0.3));
      if (t0 > 2.35) o *= 1 - es((t0 - 2.35) / 0.2);
      // dáng mắt theo ảnh mẫu Clair gửi 27/11: mí nặng hờ hững, cong nhẹ, đuôi mắt hơi trĩu xuống (thấp hơn khoé trong), mí trên che phần trên mống mắt,
      // mí dưới chỉ là nét mảnh ở nửa ngoài; vài nét mi ngắn ở đuôi, không vuốt đuôi lên
      var L = [262, 212], Rc = [742, 226];
      var c1 = [lerp(380, 350, o), lerp(258, 150, o)], c2 = [lerp(620, 640, o), lerp(262, 150, o)];
      var up = 'M' + P(L[0], L[1]) + 'C' + P(c1[0], c1[1]) + ' ' + P(c2[0], c2[1]) + ' ' + P(Rc[0], Rc[1]);
      E.clip.setAttribute('d', up + 'C' + P(650, 258) + ' ' + P(400, 254) + ' ' + P(L[0], L[1]) + 'Z');
      var th = 5 + 15 * o;
      E.lid.setAttribute('d', up + 'L' + P(Rc[0] + 18, Rc[1] + 4) + 'C' + P(c2[0] + 6, c2[1] - th - 2) + ' ' + P(c1[0], c1[1] - th * 0.55) + ' ' + P(L[0] - 4, L[1] - 2) + 'Z');
      E.lidhi.setAttribute('d', 'M' + P(L[0] + 60, L[1] - 30 * o - 6) + 'C' + P(c1[0] + 30, c1[1] - th - 4) + ' ' + P(c2[0], c2[1] - th - 8) + ' ' + P(Rc[0] - 10, Rc[1] - 18 * o - 6));
      E.lidhi.setAttribute('opacity', (0.2 + 0.4 * o) * ea);
      E.low.setAttribute('d', 'M' + P(Rc[0] - 10, Rc[1] + 6) + 'C' + P(660, 256) + ' ' + P(540, 262) + ' ' + P(470, 258));
      E.crease.setAttribute('d', 'M' + P(380, lerp(220, 150, o)) + 'C' + P(c1[0] + 30, c1[1] - th - 22 * o) + ' ' + P(c2[0], c2[1] - th - 24 * o) + ' ' + P(Rc[0] - 4, Rc[1] - 14 - 22 * o));
      E.crease.setAttribute('opacity', 0.55 * o * ea); E.crease.removeAttribute('stroke-dasharray');
      // lông mi + lông mày (Clair 27/11: thiếu lông mi lông mày nên chưa đẹp như tranh anime). Vẫn là nét sáng, không tô.
      // mi trên: mọc từ mép trên của mí, dày và dài dần về đuôi, cong nhẹ ra ngoài; mi dưới: vài sợi ngắn ở nửa ngoài.
      var bz = function (u) { var v = 1 - u; return [v * v * v * L[0] + 3 * v * v * u * c1[0] + 3 * v * u * u * c2[0] + u * u * u * Rc[0], v * v * v * L[1] + 3 * v * v * u * c1[1] + 3 * v * u * u * c2[1] + u * u * u * Rc[1]]; };
      var lh = '';
      var LU = [0.8, 0.87, 0.93, 0.97, 0.995];
      for (var li = 0; li < LU.length; li++) {
        var u = LU[li], p0 = bz(u), p1 = bz(Math.min(1, u + 0.01)), tx = p1[0] - p0[0], ty = p1[1] - p0[1], tl = Math.hypot(tx, ty) || 1;
        var nx = ty / tl, ny = -tx / tl; if (ny > 0) { nx = -nx; ny = -ny; }
        var len = (8 + 26 * Math.pow((u - 0.65) / 0.35, 1.2)) * [0.6, 0.8, 1, 1.25, 1.4][li] * o, lean = 2 + u * 1.6;
        var bx = p0[0] + nx * th * 0.8, by = p0[1] + ny * th * 0.8, dx = nx + tx / tl * lean, dy = ny + ty / tl * lean, dl = Math.hypot(dx, dy);
        dx /= dl; dy /= dl;
        lh += '<path stroke-width="' + (1.4 + (u - 0.5) * 3).toFixed(2) + '" d="M' + P(bx, by) + 'q' + P(dx * len * 0.5 - dy * len * 0.12, dy * len * 0.5 + dx * len * 0.12) + ' ' + P(dx * len, dy * len) + '"/>';
      }
      [[700, 246, 6, 9], [716, 240, 9, 10], [730, 233, 11, 9]].forEach(function (q) { lh += '<path stroke-width="1.1" d="M' + P(q[0], q[1]) + 'l' + P(q[2] * o, q[3] * o) + '"/>'; });
      E.lash.innerHTML = lh; E.lash.setAttribute('opacity', Math.min(1, o * 1.3));
      // lông mày: thẳng, hơi xếch, đầu mày dày đuôi thon; hạ xuống một chút lúc híp ngắm
      var fb = (t > 1.35 ? 10 * es((t - 1.35) / 0.3) : 0) - 8 * o, bw = '';
      var B0 = [300, 92 - fb * 0.4], B1 = [470, 58 - fb], B2 = [640, 50 - fb], B3 = [760, 78 - fb * 0.6];
      // một dải thon: đầu mày dày, đuôi nhọn; hai sợi lơ thơ ở đầu mày
      bw += '<path stroke-width="1.8" d="M' + P(B0[0], B0[1]) + 'C' + P(B1[0], B1[1]) + ' ' + P(B2[0], B2[1]) + ' ' + P(B3[0], B3[1]) + 'C' + P(B2[0] + 10, B2[1] + 12) + ' ' + P(B1[0], B1[1] + 22) + ' ' + P(B0[0] + 22, B0[1] + 16) + 'Q' + P(B0[0] - 8, B0[1] + 14) + ' ' + P(B0[0], B0[1]) + 'Z"/>';
      bw += '<path stroke-width="1" d="M' + P(B0[0] + 10, B0[1] + 14) + 'l' + P(26, -16) + 'M' + P(B0[0] + 26, B0[1] + 12) + 'l' + P(24, -18) + '"/>';
      // tóc mái: từng lọn dày nhọn đuôi kiểu anime (Clair 27/11: mấy sợi lẻ "le que" buồn cười). Viền nét sáng, lòng lọn tô màu nền băng
      // để che nét mắt phía sau (chỉ là che khuất, không tô màu tóc); chừa giữa mống mắt cho chỗ loé. Đung đưa rất nhẹ.
      var sw = Math.sin(t0 * 2.2) * 3, hs = '';
      // lọn chồng lên nhau, gốc liền thành mảng tóc ở mép trên, đuôi cong quét chéo sang phải, dài ngắn so le (không đều như răng cưa)
      [[150, 150, 222, 206, 24], [214, 160, 300, 236, 34], [470, 150, 516, 142, 18], [300, 150, 398, 252, 44], [384, 130, 452, 214, 30], [740, 160, 806, 198, 22], [640, 160, 716, 156, 30], [556, 150, 636, 178, 34]].forEach(function (h, i) {
        var rx = h[0], w = h[1], tx = h[2] + sw * (0.6 + i * 0.1), ty = h[3], bd = h[4], y0 = -70, H2 = ty - y0;
        hs += '<path fill="#020d14" fill-opacity=".95" stroke-width="1.6" d="M' + P(rx - w / 2, y0) + 'C' + P(rx - w / 2 + bd * 0.3, y0 + H2 * 0.45) + ' ' + P(tx - w * 0.12 + bd * 0.4, ty - H2 * 0.28) + ' ' + P(tx, ty) +
          'C' + P(tx + w * 0.16 + bd * 0.5, ty - H2 * 0.4) + ' ' + P(rx + w / 2 + bd * 0.4, y0 + H2 * 0.4) + ' ' + P(rx + w / 2, y0) + 'Z"/>';
        hs += '<path stroke-width="1" opacity=".6" d="M' + P(rx + w * 0.05, y0) + 'C' + P(rx + bd * 0.4, y0 + H2 * 0.45) + ' ' + P(tx + bd * 0.3, ty - H2 * 0.35) + ' ' + P(lerp(rx, tx, 0.8) + bd * 0.25, lerp(y0, ty, 0.8)) + '"/>';
      });
      var HAIR = false; // Clair 27/11: tóc mái vẽ nét bị xấu, tắt (mã giữ lại phòng khi thử lại)
      E.hair.innerHTML = HAIR ? hs : ''; E.hair.setAttribute('opacity', (0.95 * ea).toFixed(3));
      E.brow.innerHTML = bw; E.brow.setAttribute('opacity', (0.35 + 0.55 * Math.min(1, o * 1.5)) * ea);
      // loé ở 0,9
      var fu = t0 - 0.9, lit = fu > 0 ? Math.min(1, fu / 0.08) * (t0 > 2.3 ? 1 - es((t0 - 2.3) / 0.4) : 1) : 0;
      E.ib.setAttribute('opacity', ((0.5 + 0.5 * lit) * Math.min(1, o * 2)).toFixed(3));
      E.ib2.setAttribute('transform', 'rotate(' + (-t * 30).toFixed(2) + ' 505 205)'); E.ib2.setAttribute('opacity', (0.35 + 0.5 * lit).toFixed(3));
      E.tick.setAttribute('transform', 'translate(505 205) rotate(' + (t * 18).toFixed(2) + ') scale(' + (1 + (fu > 0 && fu < 0.25 ? 0.12 * (1 - fu / 0.25) : 0)).toFixed(3) + ')');
      E.tick.setAttribute('opacity', (lit * 0.65 * ea).toFixed(3));
      E.cross.setAttribute('opacity', (lit * 0.8).toFixed(3));
      var bz = lerp(1.15, 1, es((t0 - 0.1) / 0.4)) - (fu > 0 && fu < 0.2 ? 0.04 * (1 - fu / 0.2) : 0), bx0 = 505 - 300 * bz, bx1 = 505 + 300 * bz, by0 = 205 - 140 * bz, by1 = 205 + 140 * bz, ba = 34, bd = '';
      [[bx0, by0, 1, 1], [bx1, by0, -1, 1], [bx1, by1, -1, -1], [bx0, by1, 1, -1]].forEach(function (c) { bd += 'M' + P(c[0] + c[2] * ba, c[1]) + 'L' + P(c[0], c[1]) + 'L' + P(c[0], c[1] + c[3] * ba); });
      E.brk.setAttribute('d', bd); E.brk.setAttribute('opacity', (0.7 * ea).toFixed(3));
      E.iglow.setAttribute('opacity', (lit * (fu < 0.3 ? 0.9 : 0.55 + 0.1 * Math.sin(t0 * 6))).toFixed(3));
      E.halo.setAttribute('opacity', (lit * (fu < 0.25 ? 0.45 : 0.18) * PW * ea).toFixed(3));
      E.stri.setAttribute('opacity', (0.18 + 0.4 * lit).toFixed(3));
      E.stri.setAttribute('transform', 'translate(505 205) rotate(' + (t * 12 + lit * 20).toFixed(2) + ')');
      var pr = fu < 0 ? 30 + 3 * es((t - 0.55) / 0.3) : lerp(33, 13, es(fu / 0.1)) + (t > 1.35 ? 1.5 * Math.sin(t0 * 9) * (1 - es((t - 1.35) / 0.5)) : 0);
      E.pup.setAttribute('rx', Math.max(4, pr * (fu > 0 ? 0.32 : 0.6)).toFixed(2)); E.pup.setAttribute('ry', Math.max(14, pr * 1.25).toFixed(2));
      // vòng dò gợn trong mống mắt
      for (var i = 0; i < 3; i++) {
        var c = E.rings[i], u = ((t - 0.95 - i * 0.36) % 1.08) / 1.08;
        if (t < 0.95 + i * 0.36 || t > 2.3) { c.setAttribute('opacity', 0); continue; }
        c.setAttribute('r', (14 + u * 88).toFixed(1)); c.setAttribute('stroke-width', (2.4 * (1 - u) + 0.5).toFixed(2)); c.setAttribute('opacity', (0.85 * (1 - u) * lit).toFixed(3));
      }
      // vòng sóng bật ra khỏi mắt lúc loé
      for (var j = 0; j < 2; j++) {
        var e = E.outs[j], v = (fu - j * 0.12) / 0.7;
        if (v <= 0 || v >= 1) { e.setAttribute('opacity', 0); continue; }
        e.setAttribute('rx', (120 + v * 520).toFixed(1)); e.setAttribute('ry', (60 + v * 230).toFixed(1)); e.setAttribute('stroke-width', (4 * (1 - v) + 0.6) * PW); e.setAttribute('opacity', ((1 - v) * 0.9).toFixed(3));
      }
      // tia dồn vào mắt + vệt tốc độ trong băng
      E.rays.setAttribute('opacity', ((t0 < 0.6 ? 0.1 * es(t0 / 0.3) : fu > 0 && fu < 0.5 ? 0.32 * (1 - fu / 0.5) : 0.04) * PW * ea).toFixed(3));
      var fr = Math.floor(t0 * 20);
      for (var k = 0; k < E.sp.length; k++) { var s = E.sp[k], sx = ((k * 0.37 + t0 * (1.6 + (k % 3) * 0.7)) % 1.6 - 0.3) * 1000; s.setAttribute('x', sx.toFixed(0)); s.setAttribute('width', (80 + (k % 4) * 60)); s.setAttribute('opacity', ((0.08 + (k % 3) * 0.06 + (fu > 0 && fu < 0.4 ? 0.25 : 0)) * ea * ((fr + k) % 5 ? 1 : 0.4)).toFixed(3)); }
      // ngôi sao loé ở chấm sáng
      var sr = fu > 0 ? 70 * PW * (fu < 0.1 ? 1 : Math.max(0, 1 - (fu - 0.1) / 0.45)) : 0, sd = '';
      if (sr > 0.5) { for (var n = 0; n < 4; n++) { var a = n * 1.5708 + 0.3; sd += 'M470 182L' + P(470 + Math.cos(a + 0.785) * sr * 0.09, 182 + Math.sin(a + 0.785) * sr * 0.09) + 'L' + P(470 + Math.cos(a) * sr, 182 + Math.sin(a) * sr) + 'L' + P(470 + Math.cos(a - 0.785) * sr * 0.09, 182 + Math.sin(a - 0.785) * sr * 0.09) + 'Z'; } }
      E.star.setAttribute('d', sd); E.star.setAttribute('opacity', sr > 0.5 ? 1 : 0);
      E.wash.setAttribute('opacity', (fu > 0 && fu < 0.12 ? 0.55 * (1 - fu / 0.12) * PW : 0).toFixed(3));
      // chấm đỏ phản chiếu trong mống mắt + bốn góc ngắm khép vào nó
      var ru = t - 1.35;
      if (ru > 0) {
        var ra = Math.min(1, ru / 0.15) * (0.75 + 0.25 * Math.sin(t0 * 14)) * lit, z = lerp(46, 18, es(ru / 0.3)), arm = z * 0.4, d = '';
        [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (sg) { var bx = 545 + sg[0] * z, by = 198 + sg[1] * z; d += 'M' + P(bx - sg[0] * arm, by) + 'L' + P(bx, by) + 'L' + P(bx, by - sg[1] * arm); });
        E.ret.setAttribute('d', d); E.red.setAttribute('opacity', ra.toFixed(3));
      } else E.red.setAttribute('opacity', 0);
      // canvas phía sau: trang tối viền + vệt tốc độ xanh băng dồn về dải mắt
      edge(dk ? '#00070a' : '#0c2a33', (dk ? 0.75 : 0.4) * op, 0.18);
      focus(W / 2, H * 0.38, kc('luke'), (fu > 0 && fu < 0.45 ? 0.3 * (1 - fu / 0.45) : 0) * PW, 40, R, t0, 0.4);
      jolt(fu > 0 && fu < 0.3 ? 4 * PW * (1 - fu / 0.3) : 0, t0);
    }
    MORE['luke-eye'] = function (t0, R) {
      if (!R._eye) R._eye = eyeBuild();
      if (t0 > 2.85) { if (R._eye.sv.parentNode) R._eye.sv.parentNode.removeChild(R._eye.sv); main.style.transform = ''; return true; }
      eyeDraw(R._eye, t0, R);
      return false;
    };
    // cận cảnh rồi nối vào sóng dò: mắt loé 0–2,85, luke-sense chạy từ 2,3 (băng tên chiêu hiện lúc dải mắt vừa khép)
    MORE['luke-eye-sense'] = function (t0, R) {
      var a = t0 <= 2.85 || (R._eye && R._eye.sv.parentNode) ? MORE['luke-eye'](t0, R) : true, b = t0 > 2.3 ? MORE['luke-sense'](t0 - 2.3, R) : false;
      return a && b;
    };

    /* ===== BẢN THỬ B: CẬN CẢNH MẮT LEON (27/11) ===== */
    // Cùng kiểu "mắt hệ thống" của Luke (chỉ nét sáng, không tô), màu xám thép. Mắt lật gương so với Luke (đuôi mắt bên trái).
    // Tính cách nằm ở nhịp mí: mắt hờ hững, mí nặng che nửa trên mống mắt; đúng lúc xích bung (0,95) mí bật mở, mống mắt loé thép,
    // vòng mắt xích trong mống mắt quay vụt rồi khoá "cạch", hai sợi xích quất chéo sau mắt; rồi mí lại sụp về hờ hững như chưa có gì.
    // Bản 'leon-eye' có mái tóc bằng bốn nét sáng thon (bản mảng tối trước đó Clair chê kì); 'leon-eye-trong' không tóc; 'leon-eye-strike' = có mái rồi nối vào leon-strike.
    var LEYE_N = 0;
    function leyeBuild(hair) {
      var id = 'lne' + (++LEYE_N), sv = document.createElementNS(SVGNS, 'svg');
      sv.setAttribute('viewBox', '0 0 1000 420'); sv.setAttribute('preserveAspectRatio', 'xMidYMid meet'); sv.setAttribute('aria-hidden', 'true');
      sv.style.cssText = 'position:fixed;left:0;width:100%;pointer-events:none;z-index:4;overflow:visible';
      var lk = ''; for (var i = 0; i < 16; i++) lk += '<ellipse/>';
      var ch = ''; for (var c = 0; c < 2; c++) { ch += '<g class="ch">'; for (var k = 0; k < 48; k++) ch += '<ellipse/>'; ch += '</g>'; }
      var sp = ''; for (var s = 0; s < 14; s++) sp += '<rect class="sp" height="' + (1 + s % 2) + '" y="' + (70 + s * 20) + '"/>';
      sv.innerHTML =
        '<defs>' +
        '<clipPath id="' + id + 'b"><polygon class="bandclip"/></clipPath>' +
        '<clipPath id="' + id + 'e"><path class="eyeclip"/></clipPath>' +
        '<linearGradient id="' + id + 'bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#030508" stop-opacity=".86"/><stop offset=".5" stop-color="#070b10" stop-opacity=".95"/><stop offset="1" stop-color="#030508" stop-opacity=".86"/></linearGradient>' +
        '<linearGradient id="' + id + 'hg" gradientUnits="userSpaceOnUse" x1="640" y1="240" x2="980" y2="-60"><stop offset="0" stop-color="#010203" stop-opacity=".95"/><stop offset=".45" stop-color="#020305" stop-opacity=".8"/><stop offset="1" stop-color="#020305" stop-opacity="0"/></linearGradient>' +
        '<filter id="' + id + 'f" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>' +
        '<filter id="' + id + 's" filterUnits="userSpaceOnUse" x="-600" y="-400" width="2400" height="1200"><feGaussianBlur stdDeviation="2.2"/></filter>' +
        '<filter id="' + id + 'g" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
        '</defs>' +
        '<g clip-path="url(#' + id + 'b)">' +
          '<rect x="-3000" y="-200" width="7000" height="820" fill="url(#' + id + 'bg)"/>' +
          '<g class="spd" fill="#C3D0DC">' + sp + '</g>' +
          '<g class="chains" fill="none" stroke="#C3D0DC" stroke-width="2.4" filter="url(#' + id + 'g)">' + ch + '</g>' +
          '<ellipse class="halo" cx="505" cy="212" rx="300" ry="130" fill="#C3D0DC" opacity="0" filter="url(#' + id + 'f)"/>' +
          '<g transform="translate(1010 0) scale(-1 1)">' +
            '<g filter="url(#' + id + 'g)" fill="none" stroke-linecap="round" stroke-linejoin="round">' +
              '<path class="crease" stroke="#C3D0DC" stroke-width="1.3"/>' +
              '<g class="arcs" stroke="#C3D0DC" stroke-width="1.3" opacity="0"><path d="M0 -116A116 116 0 0 1 100 -58"/><path d="M58 100A116 116 0 0 1 -58 100"/><path d="M-100 58A116 116 0 0 1 -100 -58"/></g>' +
              '<g clip-path="url(#' + id + 'e)">' +
                '<circle class="iglow" cx="505" cy="212" r="92" stroke="#C3D0DC" stroke-width="16" opacity="0" filter="url(#' + id + 'f)"/>' +
                '<circle class="ib" cx="505" cy="212" r="92" stroke="#F1F6FA" stroke-width="2.6"/>' +
                '<circle class="ib2" cx="505" cy="212" r="58" stroke="#C3D0DC" stroke-width="1.1"/>' +
                '<g class="lk" stroke="#F1F6FA" stroke-width="1.6">' + lk + '</g>' +
                '<circle class="pup" cx="505" cy="212" r="15" stroke="#F1F6FA" stroke-width="2.4"/>' +
                '<circle class="pdot" cx="505" cy="212" r="3" fill="#F1F6FA" stroke="none"/>' +
                '<path class="glint" fill="#ffffff" stroke="none" opacity="0"/>' +
                '<circle cx="472" cy="186" r="7" stroke="#ffffff" stroke-width="1.5" opacity=".75"/>' +
              '</g>' +
              '<path class="low" stroke="#C3D0DC" stroke-width="1.7"/>' +
              '<path class="lid" stroke="#F1F6FA" stroke-width="2.4"/>' +
              '<g class="lash" stroke="#F1F6FA"/>' +
              '<g class="brow" stroke="#F1F6FA"/>' +
            '</g>' +
            (hair ? '<g class="hair"><g class="hu" fill="#070b10"/><g class="hs" fill="#E2EAF0" filter="url(#' + id + 'g)"/></g>' : '') +
          '</g>' +
          '<path class="blade" fill="#F1F6FA" opacity="0"/>' +
          '<rect class="wash" x="-3000" y="-200" width="7000" height="820" fill="#F1F6FA" opacity="0"/>' +
        '</g>' +
        '<g class="edges" stroke="#C3D0DC" stroke-width="2.5"><line class="e1"/><line class="e2"/></g>';
      document.body.appendChild(sv);
      var q = function (s) { return sv.querySelector(s); };
      return { sv: sv, hair: !!hair, band: q('.bandclip'), clip: q('.eyeclip'), lid: q('.lid'), low: q('.low'), crease: q('.crease'), lash: q('.lash'), brow: q('.brow'),
        ib: q('.ib'), ib2: q('.ib2'), iglow: q('.iglow'), halo: q('.halo'), lk: sv.querySelectorAll('.lk ellipse'), pup: q('.pup'), pdot: q('.pdot'), glint: q('.glint'),
        arcs: q('.arcs'), hu: q('.hu'), hs: q('.hs'), blade: q('.blade'), wash: q('.wash'), sp: sv.querySelectorAll('.sp'),
        ch: [].map.call(sv.querySelectorAll('.ch'), function (gg) { return gg.querySelectorAll('ellipse'); }), e1: q('.e1'), e2: q('.e2') };
    }
    function leyeDraw(E, t0, R) {
      var t = hitstop(t0, 0.95, 0.12, 0.1), dk = C.dark;
      var bh = Math.min(W * 0.46, H * 0.36), top = H * 0.38 - bh / 2;
      E.sv.style.top = top.toFixed(1) + 'px'; E.sv.style.height = bh.toFixed(1) + 'px';
      // băng tối nghiêng xẻ mở / khép (nghiêng ngược chiều băng mắt Luke)
      var op = es(t0 / 0.25) * (t0 > 2.45 ? 1 - es((t0 - 2.45) / 0.3) : 1), hh = 205 * op, tl = 212 - hh - 14, bl = 212 + hh + 14;
      E.band.setAttribute('points', '-3000,' + (tl - 110) + ' 4000,' + (tl + 110) + ' 4000,' + (bl + 110) + ' -3000,' + (bl - 110));
      var ea = op > 0.02 ? Math.min(1, op * 1.5) : 0;
      E.e1.setAttribute('x1', -3000); E.e1.setAttribute('y1', tl - 110); E.e1.setAttribute('x2', 4000); E.e1.setAttribute('y2', tl + 110);
      E.e2.setAttribute('x1', -3000); E.e2.setAttribute('y1', bl - 110); E.e2.setAttribute('x2', 4000); E.e2.setAttribute('y2', bl + 110);
      E.e1.setAttribute('opacity', ea); E.e2.setAttribute('opacity', ea * 0.6);
      var fu = t0 - 0.95, fs = t - 0.95;
      // mí: mở hờ 0,2–0,6 (0,55); 0,8 khép thêm một chút (nheo); loé: bật lên 0,9; 0,35–0,9 sụp về hờ hững; nhắm khi băng khép
      var o = 0.66 * es((t - 0.2) / 0.4);
      if (t > 0.8) o = lerp(o, 0.58, es((t - 0.8) / 0.12));
      if (fs > 0) { o = lerp(0.58, 1, es(fs / 0.06)); if (fs > 0.35) o = lerp(1, 0.66, es((fs - 0.35) / 0.55)); }
      if (t0 > 2.35) o *= 1 - es((t0 - 2.35) / 0.2);
      // dáng mắt nam, hờ hững: mí trên gần thẳng, dày, đuôi mắt trĩu xuống thấp hơn khoé trong; mí dưới nét mảnh nửa ngoài
      var L = [262, 214], Rc = [748, 234];
      var c1 = [lerp(382, 350, o), lerp(262, 136, o)], c2 = [lerp(622, 652, o), lerp(268, 144, o)];
      var up = 'M' + P(L[0], L[1]) + 'C' + P(c1[0], c1[1]) + ' ' + P(c2[0], c2[1]) + ' ' + P(Rc[0], Rc[1]);
      E.clip.setAttribute('d', up + 'C' + P(655, 272) + ' ' + P(400, 268) + ' ' + P(L[0], L[1]) + 'Z');
      var th = 6 + 12 * o;
      E.lid.setAttribute('d', up + 'L' + P(Rc[0] + 20, Rc[1] + 6) + 'C' + P(c2[0] + 8, c2[1] - th - 2) + ' ' + P(c1[0], c1[1] - th * 0.5) + ' ' + P(L[0] - 4, L[1] - 2) + 'Z');
      E.low.setAttribute('d', 'M' + P(Rc[0] - 12, Rc[1] + 8) + 'C' + P(668, 268) + ' ' + P(560, 274) + ' ' + P(486, 270));
      E.crease.setAttribute('d', 'M' + P(430, lerp(212, 136, o) - 10) + 'C' + P(c1[0] + 70, c1[1] - th - 16) + ' ' + P(c2[0], c2[1] - th - 16) + ' ' + P(Rc[0] - 8, Rc[1] - 16 - 14 * o));
      E.crease.setAttribute('opacity', (0.5 * Math.min(1, o * 1.6) * ea).toFixed(3));
      // lông mi: ít sợi, nằm rạp theo mí ở đuôi mắt (mắt nam, lười); mi dưới hai sợi ngắn
      var bzc = function (u) { var v = 1 - u; return [v * v * v * L[0] + 3 * v * v * u * c1[0] + 3 * v * u * u * c2[0] + u * u * u * Rc[0], v * v * v * L[1] + 3 * v * v * u * c1[1] + 3 * v * u * u * c2[1] + u * u * u * Rc[1]]; };
      var lh = '', LU = [0.86, 0.92, 0.965, 0.995];
      for (var li = 0; li < LU.length; li++) {
        var u = LU[li], p0 = bzc(u), p1 = bzc(Math.min(1, u + 0.01)), tx = p1[0] - p0[0], ty = p1[1] - p0[1], tln = Math.hypot(tx, ty) || 1;
        var nx = ty / tln, ny = -tx / tln; if (ny > 0) { nx = -nx; ny = -ny; }
        var len = [16, 22, 28, 32][li] * Math.min(1, o * 1.6), lean = 2.6 + li * 0.5;
        var bx = p0[0] + nx * th * 0.7, by = p0[1] + ny * th * 0.7, dx = nx + tx / tln * lean, dy = ny + ty / tln * lean, dl = Math.hypot(dx, dy); dx /= dl; dy /= dl;
        lh += '<path stroke-width="' + (1.6 + li * 0.5).toFixed(2) + '" d="M' + P(bx, by) + 'q' + P(dx * len * 0.5 - dy * len * 0.1, dy * len * 0.5 + dx * len * 0.1) + ' ' + P(dx * len, dy * len) + '"/>';
      }
      [[712, 250, 8, 9], [728, 244, 10, 9]].forEach(function (q) { lh += '<path stroke-width="1.1" d="M' + P(q[0], q[1]) + 'l' + P(q[2] * o, q[3] * o) + '"/>'; });
      E.lash.innerHTML = lh; E.lash.setAttribute('opacity', Math.min(1, o * 1.4).toFixed(3));
      // lông mày: thấp, gần như thẳng, sát mắt (lạnh); lúc loé hạ xuống thêm một chút
      var fb = (fs > 0 ? 8 * (fs < 0.1 ? fs / 0.1 : Math.max(0.4, 1 - (fs - 0.1) / 1.2)) : 0), bw = '';
      var B0 = [296, 104 + fb * 0.3], B1 = [460, 74 + fb], B2 = [640, 70 + fb], B3 = [776, 98 + fb * 0.5];
      bw += '<path stroke-width="1.8" d="M' + P(B0[0], B0[1]) + 'C' + P(B1[0], B1[1]) + ' ' + P(B2[0], B2[1]) + ' ' + P(B3[0], B3[1]) + 'C' + P(B2[0] + 10, B2[1] + 11) + ' ' + P(B1[0], B1[1] + 20) + ' ' + P(B0[0] + 22, B0[1] + 15) + 'Q' + P(B0[0] - 8, B0[1] + 12) + ' ' + P(B0[0], B0[1]) + 'Z"/>';
      E.brow.innerHTML = bw; E.brow.setAttribute('opacity', ((0.4 + 0.5 * Math.min(1, o * 1.6)) * ea).toFixed(3));
      // mái tóc: một mảng tối che đuôi mắt và đầu mày, mép dưới chia ba mũi rộng, chỉ một đường viền sáng mảnh ở mép trong; lắc rất nhẹ
      if (E.hair) {
        // Clair 27/11: mảng mái tối nhìn kì → thử mái bằng vài nét sáng dài, cong mềm, thon hai đầu (dày ở gốc, nhọn ở ngọn),
        // chụm thành một lọn chéo qua đuôi mắt; dưới mỗi nét có một vệt màu nền để nét mắt phía sau bị ngắt (tóc nằm trước mắt).
        var sw = Math.sin(t0 * 1.8) * 2 + (fs > 0 && fs < 0.4 ? Math.sin(fs * 30) * 4 * (1 - fs / 0.4) : 0), hu = '', hsd = '';
        // gốc chụm gần nhau ở mép trên, ngọn xoè ra; mỗi nét cong võng (bụng lồi về phía khoé trong) rồi ngọn hất nhẹ ra ngoài
        [[548, -70, 470, 70, 560, 190, 612, 214, 6], [580, -70, 540, 90, 610, 230, 672, 266, 7.5], [612, -70, 610, 60, 660, 160, 716, 196, 4.5], [640, -70, 650, 80, 720, 210, 792, 244, 6]].forEach(function (h, k) {
          var x0 = h[0], y0 = h[1], ax = h[2], ay = h[3], bx2 = h[4] + sw * 0.5, by2 = h[5], x1 = h[6] + sw * (0.7 + k * 0.15), y1 = h[7], mw = h[8], Lp = [], Rp = [];
          for (var n = 0; n <= 24; n++) {
            var u = n / 24, v = 1 - u;
            var px = v * v * v * x0 + 3 * v * v * u * ax + 3 * v * u * u * bx2 + u * u * u * x1, py = v * v * v * y0 + 3 * v * v * u * ay + 3 * v * u * u * by2 + u * u * u * y1;
            var dx = 3 * v * v * (ax - x0) + 6 * v * u * (bx2 - ax) + 3 * u * u * (x1 - bx2), dy = 3 * v * v * (ay - y0) + 6 * v * u * (by2 - ay) + 3 * u * u * (y1 - by2), dl = Math.hypot(dx, dy) || 1;
            var w = mw * Math.pow(1 - u, 0.85) * Math.min(1, u * 4 + 0.35) / 2;
            Lp.push(P(px - dy / dl * w, py + dx / dl * w)); Rp.unshift(P(px + dy / dl * w, py - dx / dl * w));
          }
          var d = 'M' + Lp.join('L') + 'L' + Rp.join('L') + 'Z';
          hsd += '<path d="' + d + '"/>';
          hu += '<path d="' + d + '" stroke="#070b10" stroke-width="5" stroke-linejoin="round"/>';
        });
        E.hu.innerHTML = hu; E.hs.innerHTML = hsd;
        E.hs.setAttribute('opacity', ((0.75 + 0.25 * (fu > 0 && fu < 0.5 ? 1 - fu / 0.5 : 0)) * ea).toFixed(3)); E.hu.setAttribute('opacity', (0.95 * ea).toFixed(3));
      }
      // mống mắt: vòng mắt xích quay chậm; loé: quay vụt rồi khoá đúng chỗ
      var lit = fu > 0 ? Math.min(1, fu / 0.06) * (t0 > 2.3 ? 1 - es((t0 - 2.3) / 0.4) : 1) : 0;
      var rot = t * 8 + (fs > 0 ? 180 * es(fs / 0.3) : 0);
      for (var n = 0; n < E.lk.length; n++) {
        var a = n / E.lk.length * 360 + rot, ar = a * Math.PI / 180, x = 505 + Math.cos(ar) * 76, y = 212 + Math.sin(ar) * 76, e = E.lk[n];
        e.setAttribute('cx', x.toFixed(1)); e.setAttribute('cy', y.toFixed(1)); e.setAttribute('rx', n % 2 ? 14 : 15); e.setAttribute('ry', n % 2 ? 1.4 : 6.5);
        e.setAttribute('transform', 'rotate(' + (a + 90).toFixed(1) + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')');
      }
      E.lk[0].parentNode.setAttribute('opacity', (0.3 + 0.6 * lit).toFixed(3));
      E.ib.setAttribute('opacity', ((0.5 + 0.5 * lit) * Math.min(1, o * 2)).toFixed(3));
      E.ib2.setAttribute('opacity', (0.3 + 0.4 * lit).toFixed(3));
      E.iglow.setAttribute('opacity', (lit * (fu < 0.3 ? 0.9 : 0.4 + 0.08 * Math.sin(t0 * 5))).toFixed(3));
      E.halo.setAttribute('opacity', (lit * (fu < 0.25 ? 0.4 * (1 - fu / 0.25) + 0.05 : 0.05) * PW * ea).toFixed(3));
      E.arcs.setAttribute('transform', 'translate(505 212) rotate(' + (-t * 14 - (fs > 0 ? 90 * es(fs / 0.3) : 0)).toFixed(2) + ') scale(' + (1 + (fu > 0 && fu < 0.2 ? 0.1 * (1 - fu / 0.2) : 0)).toFixed(3) + ')');
      E.arcs.setAttribute('opacity', (lit * 0.6 * ea).toFixed(3));
      var pr = fs < 0 ? 15 - 2 * es((t - 0.8) / 0.12) : lerp(13, 9, es(fs / 0.08));
      E.pup.setAttribute('r', pr.toFixed(2));
      // vệt sáng thép lướt chéo qua mống mắt
      var gu = (fu - 0.02) / 0.32;
      if (gu > 0 && gu < 1) { var gx = lerp(380, 640, gu); E.glint.setAttribute('d', 'M' + P(gx - 10, 100) + 'L' + P(gx + 8, 100) + 'L' + P(gx - 52, 320) + 'L' + P(gx - 64, 320) + 'Z'); E.glint.setAttribute('opacity', (0.85 * Math.sin(gu * Math.PI)).toFixed(3)); }
      else E.glint.setAttribute('opacity', 0);
      // hai sợi xích quất chéo sau mắt lúc loé, căng rung, rồi giật về
      var CH = [[-160, 400, 1160, 330], [1160, 30, -160, 10]], LS = 30;
      for (var c = 0; c < 2; c++) {
        var cu = fu - c * 0.04, links = E.ch[c], x0 = CH[c][0], y0 = CH[c][1], x1 = CH[c][2], y1 = CH[c][3], full = Math.hypot(x1 - x0, y1 - y0), ang = Math.atan2(y1 - y0, x1 - x0);
        var reach = cu <= 0 ? 0 : cu < 0.14 ? Math.pow(cu / 0.14, 0.6) : 1;
        if (t0 > 1.9) reach *= 1 - es((t0 - 1.9) / 0.35);
        var vib = cu > 0.14 ? 6 * Math.exp(-(cu - 0.14) * 4) : 0, nxv = -Math.sin(ang), nyv = Math.cos(ang), head = reach * full, chA = (0.55 + 0.35 * lit) * ea;
        for (var k = 0; k < links.length; k++) {
          var el = links[k], dpos = head - k * LS;
          if (dpos < 0 || reach <= 0) { el.setAttribute('opacity', 0); continue; }
          var s2 = dpos / full, wob = Math.sin(s2 * Math.PI) * Math.sin(t0 * 60 + k * 0.7) * vib, lx = x0 + Math.cos(ang) * dpos + nxv * wob, ly = y0 + Math.sin(ang) * dpos + nyv * wob;
          el.setAttribute('cx', lx.toFixed(1)); el.setAttribute('cy', ly.toFixed(1)); el.setAttribute('rx', 17); el.setAttribute('ry', k % 2 ? 1.6 : 7.5);
          el.setAttribute('transform', 'rotate(' + (ang * 180 / Math.PI).toFixed(1) + ' ' + lx.toFixed(1) + ' ' + ly.toFixed(1) + ')'); el.setAttribute('opacity', (chA * (k === 0 ? 1 : 0.85)).toFixed(3));
        }
      }
      // một nhát sáng như lưỡi thép chém ngang băng + loé trắng
      var bu = fu / 0.22;
      if (bu > 0 && bu < 1) { var by0 = 212 + lerp(-40, 40, bu), w2 = 5 * (1 - bu) * PW + 0.5; E.blade.setAttribute('d', 'M' + P(-200, by0 + 60) + 'L' + P(1200, by0 - 60 - w2) + 'L' + P(1200, by0 - 60 + w2) + 'Z'); E.blade.setAttribute('opacity', (0.9 * (1 - bu)).toFixed(3)); }
      else E.blade.setAttribute('opacity', 0);
      E.wash.setAttribute('opacity', (fu > 0 && fu < 0.1 ? 0.45 * (1 - fu / 0.1) * PW : 0).toFixed(3));
      var fr = Math.floor(t0 * 20);
      for (var j = 0; j < E.sp.length; j++) { var sp = E.sp[j], sx = (1.3 - (j * 0.41 + t0 * (1.4 + (j % 3) * 0.6)) % 1.6) * 1000; sp.setAttribute('x', sx.toFixed(0)); sp.setAttribute('width', 70 + (j % 4) * 55); sp.setAttribute('opacity', ((0.06 + (j % 3) * 0.05 + (fu > 0 && fu < 0.4 ? 0.22 : 0)) * ea * ((fr + j) % 5 ? 1 : 0.4)).toFixed(3)); }
      edge(dk ? '#000000' : '#1a2128', (dk ? 0.78 : 0.42) * op, 0.18);
      focus(W / 2, H * 0.38, kc('leon'), (fu > 0 && fu < 0.45 ? 0.3 * (1 - fu / 0.45) : 0) * PW, 40, R, t0, 0.4);
      jolt(fu > 0 && fu < 0.3 ? 5 * PW * (1 - fu / 0.3) : 0, t0);
    }
    function leyeRun(hair) {
      return function (t0, R) {
        if (!R._leye) R._leye = leyeBuild(hair);
        if (t0 > 2.85) { if (R._leye.sv.parentNode) R._leye.sv.parentNode.removeChild(R._leye.sv); main.style.transform = ''; return true; }
        leyeDraw(R._leye, t0, R);
        return false;
      };
    }
    // Clair 27/11 chiều: bỏ tóc ở mọi chỗ trong chương; 'leon-eye' (và mọi combo nối từ nó) giờ là bản không tóc, bản có mái giữ ở 'leon-eye-toc'
    MORE['leon-eye'] = leyeRun(false);
    MORE['leon-eye-toc'] = leyeRun(true);
    MORE['leon-eye-trong'] = leyeRun(false);
    // cận cảnh (có mái) rồi nối vào bộ chiêu xích: leon-strike chạy từ 2,3 (băng mắt vừa khép thì xích quất vào cả trang)
    MORE['leon-eye-strike'] = function (t0, R) {
      var a = t0 <= 2.85 || (R._leye && R._leye.sv.parentNode) ? MORE['leon-eye'](t0, R) : true, b = t0 > 2.3 ? MORE['leon-strike'](t0 - 2.3, R) : false;
      return a && b;
    };
    // bước 5 (27/11, luật Clair: Leon dùng xích combat thật hoặc lúc căng thẳng thì có mắt): mắt (có mái) rồi nối vào hiệu ứng xích cũ của chỗ đó từ 2,3 giây
    function leyeThen(name, fn) {
      MORE['leon-eye-' + name] = function (t0, R) {
        var a = t0 <= 2.85 || (R._leye && R._leye.sv.parentNode) ? MORE['leon-eye'](t0, R) : true, b = t0 > 2.3 ? fn(t0 - 2.3, R) : false;
        return a && b;
      };
    }
    leyeThen('chains', function (t, R) { return drawChains(t, R); });
    leyeThen('yank', function (t, R) { return MORE.yank(t, R); });
    leyeThen('bristle', function (t, R) { return MORE.bristle(t, R); });
    leyeThen('rescue', function (t, R) { return MORE['leon-rescue'](t, R); });

    /* ===== BẢN THỬ B: CẬN CẢNH Ổ KHOÁ CLEVIA (27/11) ===== */
    // Luật cận cảnh (Clair 27/11): mỗi nhân vật chính một cận cảnh riêng theo cách năng lực vận hành. Luke = mắt, Leon = mắt có xích (hiếm), Clevia = ổ khoá.
    // Cùng kiểu "nét hệ thống" (chỉ nét sáng, không tô mảng), màu đỏ rượu. Trái: mặt ổ khoá nhìn thẳng (lỗ khoá trong vòng mặt số);
    // phải: mặt cắt ổ khoá kiểu bản vẽ kỹ thuật, bốn chốt (chốt dưới + chốt trên + lò xo), vạch cắt đỏ đứt nét.
    // Không có chìa: một sợi sáng đỏ (cái chạm của Clevia) luồn vào rãnh khoá, đẩy từng chốt lên đúng vạch cắt ở 0,6 / 0,85 / 1,1 / 1,6
    // (cùng nhịp bốn cú cạch của Unlock; mỗi cú cạch khựng hình, vòng đỏ nhỏ toả ra từ chốt). Chốt thứ tư gượng lại, run run rồi mới bật.
    // 1,9: ổ xoay (lỗ khoá quay một phần tư vòng, lõi khoá trong mặt cắt lật đi), loé, ánh sáng tràn ra từ lỗ khoá, bốn vòng đỏ nở ra. 2,45–2,8 băng khép.
    // 'clevia-lock' đứng riêng; 'clevia-lock-unlock' = cận cảnh rồi ánh sáng lỗ khoá tràn ra cả trang (phần cuối của Unlock: tia lỗ khoá, đoạn chữ cạch về hàng).
    var CLK_N = 0, CLK_T = [0.6, 0.85, 1.1, 1.6], CLK_X = [500, 600, 700, 800], CLK_KL = [40, 30, 46, 34];
    function clkBuild() {
      var id = 'clk' + (++CLK_N), sv = document.createElementNS(SVGNS, 'svg');
      sv.setAttribute('viewBox', '0 0 1000 420'); sv.setAttribute('preserveAspectRatio', 'xMidYMid meet'); sv.setAttribute('aria-hidden', 'true');
      sv.style.cssText = 'position:fixed;left:0;width:100%;pointer-events:none;z-index:4;overflow:visible';
      var dial = ''; for (var i = 0; i < 60; i++) { var a = i / 60 * 6.283, r0 = i % 5 ? 104 : 96; dial += '<line x1="' + (Math.cos(a) * r0).toFixed(1) + '" y1="' + (Math.sin(a) * r0).toFixed(1) + '" x2="' + (Math.cos(a) * 110).toFixed(1) + '" y2="' + (Math.sin(a) * 110).toFixed(1) + '"/>'; }
      var sp = ''; for (var s = 0; s < 14; s++) sp += '<rect class="sp" height="' + (1 + s % 2) + '" y="' + (60 + s * 22) + '"/>';
      var pins = ''; for (var p = 0; p < 4; p++) pins += '<g class="pin"><path class="kp"/><path class="dp"/><path class="spr"/></g>';
      var walls = ''; CLK_X.forEach(function (x) { walls += 'M' + (x - 19) + ' 108V212M' + (x + 19) + ' 108V212M' + (x - 19) + ' 212V258M' + (x + 19) + ' 212V258'; });
      var rays = ''; for (var j = 0; j < 28; j++) { var b = j / 28 * 6.283, w = 0.015 + (j % 3) * 0.008; rays += '<path d="M210 205L' + (210 + Math.cos(b - w) * 1300).toFixed(0) + ' ' + (205 + Math.sin(b - w) * 1300).toFixed(0) + 'L' + (210 + Math.cos(b + w) * 1300).toFixed(0) + ' ' + (205 + Math.sin(b + w) * 1300).toFixed(0) + 'Z"/>'; }
      var rings = ''; for (var r = 0; r < 4; r++) rings += '<circle cx="210" cy="215"/>';
      var cr = ''; for (var c = 0; c < 4; c++) cr += '<circle/>';
      var dm = ''; for (var d = 0; d < 4; d++) dm += '<path d="M' + (165 + d * 30) + ' 362l7 -7l7 7l-7 7z"/>';
      sv.innerHTML =
        '<defs>' +
        '<clipPath id="' + id + 'b"><polygon class="bandclip"/></clipPath>' +
        '<linearGradient id="' + id + 'bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d0205" stop-opacity=".93"/><stop offset=".5" stop-color="#160409" stop-opacity=".97"/><stop offset="1" stop-color="#0d0205" stop-opacity=".93"/></linearGradient>' +
        '<filter id="' + id + 'f" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="12"/></filter>' +
        '<filter id="' + id + 'g" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
        '</defs>' +
        '<g clip-path="url(#' + id + 'b)">' +
          '<rect x="-3000" y="-200" width="7000" height="820" fill="url(#' + id + 'bg)"/>' +
          '<g class="rays" fill="#E8869B" opacity="0">' + rays + '</g>' +
          '<g class="spd" fill="#E8869B">' + sp + '</g>' +
          '<ellipse class="halo" cx="210" cy="215" rx="200" ry="150" fill="#E8869B" opacity="0" filter="url(#' + id + 'f)"/>' +
          '<g class="hud" fill="none" stroke="#E8869B" stroke-width="1.5"><path class="brk"/><path class="link" stroke-dasharray="4 6" d="M268 112L380 100M268 318L380 330"/><g class="dm">' + dm + '</g></g>' +
          '<g filter="url(#' + id + 'g)" fill="none" stroke-linecap="round" stroke-linejoin="round">' +
            // mặt ổ khoá nhìn thẳng
            '<circle class="face" cx="210" cy="215" r="118" stroke="#FFE8EC" stroke-width="2.4" pathLength="1"/>' +
            '<g class="dial" stroke="#E8869B" stroke-width="1.2">' + dial + '</g>' +
            '<circle class="face2" cx="210" cy="215" r="84" stroke="#E8869B" stroke-width="1.2" stroke-dasharray="2 6"/>' +
            '<g class="kh"><path class="khl" fill="#FFE8EC" fill-opacity="0" stroke="#FFE8EC" stroke-width="2.6" d="M210 165a27 27 0 0 1 14 50l10 50h-48l10 -50a27 27 0 0 1 14 -50z"/></g>' +
            // mặt cắt: vỏ, lõi, rãnh, vạch cắt
            '<path class="hous" stroke="#E8869B" stroke-width="2" pathLength="1" d="M380 96H884a16 16 0 0 1 16 16V316a16 16 0 0 1 -16 16H380z"/>' +
            '<path class="plo" stroke="#FFE8EC" stroke-width="2.2" pathLength="1" d="M380 212H900M380 306H900"/>' +
            '<g class="plug"><path class="kw" stroke="#E8869B" stroke-width="1.4" d="M380 258H560l10 6l10 -6H880M380 292H880l12 -17l-12 -17"/>' +
            '<path class="thr" stroke="#FFE8EC" stroke-width="3"/><circle class="tip" r="7" fill="#FFE8EC" stroke="none" opacity="0"/>' +
            '<g class="pinsk">' + pins + '</g></g>' +
            '<g class="pinsd"></g>' +
            '<path class="walls" stroke="#E8869B" stroke-width="1.2" opacity=".7" d="' + walls + '"/>' +
            '<path class="shear" stroke="#E8869B" stroke-width="1.6" stroke-dasharray="9 7" d="M372 212H908"/>' +
            '<path class="shearlit" stroke="#FFE8EC" stroke-width="2.6"/>' +
            '<g class="cr" stroke="#FFE8EC">' + cr + '</g>' +
          '</g>' +
          '<g class="rings" fill="none" stroke="#E8869B">' + rings + '</g>' +
          '<path class="star" fill="#ffffff" opacity="0"/>' +
          '<rect class="wash" x="-3000" y="-200" width="7000" height="820" fill="#FFE8EC" opacity="0"/>' +
        '</g>' +
        '<g class="edges" stroke="#E8869B" stroke-width="2.5" fill="none"><path class="e1"/><path class="e2"/></g>';
      document.body.appendChild(sv);
      var q = function (s) { return sv.querySelector(s); };
      // chốt trên + lò xo nằm ở phần vỏ (không lật theo lõi khi xoay): chuyển sang nhóm pinsd
      var pd = q('.pinsd'), pg = sv.querySelectorAll('.pin');
      for (var k = 0; k < 4; k++) { pd.appendChild(pg[k].querySelector('.dp')); pd.appendChild(pg[k].querySelector('.spr')); }
      return { sv: sv, band: q('.bandclip'), face: q('.face'), face2: q('.face2'), dial: q('.dial'), kh: q('.kh'), khl: q('.khl'), hous: q('.hous'), plug: q('.plug'), plo: q('.plo'),
        kw: q('.kw'), thr: q('.thr'), tip: q('.tip'), kp: sv.querySelectorAll('.kp'), dp: sv.querySelectorAll('.pinsd .dp'), spr: sv.querySelectorAll('.pinsd .spr'),
        walls: q('.walls'), shear: q('.shear'), lit: q('.shearlit'), cr: sv.querySelectorAll('.cr circle'), rings: sv.querySelectorAll('.rings circle'), rays: q('.rays'),
        halo: q('.halo'), brk: q('.brk'), link: q('.link'), dm: sv.querySelectorAll('.dm path'), star: q('.star'), wash: q('.wash'), sp: sv.querySelectorAll('.sp'), e1: q('.e1'), e2: q('.e2') };
    }
    // độ nâng của chốt i (0 = nằm trong rãnh, 1 = đúng vạch cắt): vọt quá một chút rồi "cạch" về; chốt cuối gượng, run trước khi bật
    function clkLift(i, t) {
      var c = CLK_T[i];
      if (i === 3 && t > 1.12 && t < c - 0.12) return 0.25 + 0.2 * es((t - 1.12) / 0.15) + Math.sin(t * 70) * 0.06 * es((t - 1.15) / 0.2);
      if (t < c - 0.12) return 0;
      if (t < c) return lerp(i === 3 ? 0.45 : 0, 1.16, es((t - c + 0.12) / 0.12));
      if (t < c + 0.07) return lerp(1.16, 1, (t - c) / 0.07);
      return 1;
    }
    function clkDraw(E, t0, R) {
      var t = t0; CLK_T.forEach(function (c) { t = hitstop(t, c, 0.06, 0.15); }); t = hitstop(t, 1.9, 0.1, 0.12);
      var dk = C.dark, bh = Math.min(W * 0.46, H * 0.36), top = H * 0.4 - bh / 2;
      E.sv.style.top = top.toFixed(1) + 'px'; E.sv.style.height = bh.toFixed(1) + 'px';
      // băng xẻ mở / khép: nằm ngang, mép dưới khía răng như răng chìa khoá (dấu riêng của Clevia)
      var op = es(t0 / 0.25) * (t0 > 2.45 ? 1 - es((t0 - 2.45) / 0.3) : 1), hh = 205 * op, tl = 215 - hh - 14, bl = 215 + hh + 14;
      var teeth = function (y, dir) { var s = '', xs = [-3000, 120, 150, 175, 205, 240, 262, 300, 4000]; for (var n = 0; n < xs.length; n++) { var dy = n > 0 && n < xs.length - 1 ? ((n % 2) ? 14 : 4) * op * dir : 0; s += xs[n] + ',' + (y + dy).toFixed(1) + ' '; } return s; };
      E.band.setAttribute('points', '-3000,' + tl.toFixed(1) + ' 4000,' + tl.toFixed(1) + ' ' + teeth(bl, -1).trim().split(' ').reverse().join(' '));
      var ea = op > 0.02 ? Math.min(1, op * 1.5) : 0;
      E.e1.setAttribute('d', 'M-3000 ' + tl.toFixed(1) + 'H4000'); E.e2.setAttribute('d', 'M' + teeth(bl, -1).trim().replace(/ /g, 'L'));
      E.e1.setAttribute('opacity', ea); E.e2.setAttribute('opacity', ea * 0.6);
      // nét vẽ hiện dần như bản vẽ đang dựng (0,15–0,55)
      var dr = es((t0 - 0.12) / 0.4);
      [E.face, E.hous, E.plo].forEach(function (el, i) { el.setAttribute('stroke-dasharray', '1 1'); el.setAttribute('stroke-dashoffset', (1 - es((t0 - 0.12 - i * 0.06) / 0.36)).toFixed(3)); });
      E.dial.setAttribute('transform', 'translate(210 215) rotate(' + (t * 10).toFixed(2) + ')'); E.dial.setAttribute('opacity', (0.55 * dr).toFixed(3));
      E.face2.setAttribute('transform', 'rotate(' + (-t * 22).toFixed(2) + ' 210 215)'); E.face2.setAttribute('opacity', (0.6 * dr).toFixed(3));
      E.walls.setAttribute('opacity', (0.7 * dr).toFixed(3)); E.kw.setAttribute('opacity', (0.85 * dr).toFixed(3)); E.shear.setAttribute('opacity', (0.8 * dr).toFixed(3));
      E.link.setAttribute('opacity', (0.5 * dr).toFixed(3));
      var set = 0; for (var i = 0; i < 4; i++) if (t >= CLK_T[i]) set++;
      // xoay ở 1,9: lỗ khoá quay một phần tư vòng; lõi khoá trong mặt cắt lật đi (ép dẹt về trục như ống trụ xoay)
      var tu = es((t - 1.9) / 0.16), fu = t0 - 1.9;
      E.kh.setAttribute('transform', 'rotate(' + (90 * tu + (fu > 0 && fu < 0.25 ? Math.sin(fu * 50) * 3 * (1 - fu / 0.25) : 0)).toFixed(2) + ' 210 215)');
      var fillk = [0, 0.06, 0.12, 0.18, 0.26][set] + (fu > 0 ? 0.12 * Math.min(1, fu / 0.08) : 0); // chỉ ánh hồng mờ trong lỗ khoá, không tô đặc
      E.khl.setAttribute('fill-opacity', (fillk * dr * (t0 > 2.3 ? 1 - es((t0 - 2.3) / 0.3) : 1)).toFixed(3));
      E.khl.setAttribute('opacity', dr.toFixed(3));
      E.plug.setAttribute('transform', 'translate(0 259) scale(1 ' + lerp(1, 0.22, tu).toFixed(3) + ') translate(0 -259)');
      E.plug.setAttribute('opacity', lerp(1, 0.08, tu).toFixed(3));
      // sợi sáng (cái chạm): luồn vào rãnh từ mặt khoá, đầu sợi dừng dưới chốt đang mở
      var tgt = set < 4 ? CLK_X[set] : 880, prev = set ? CLK_X[set - 1] : 380, since = set ? t - CLK_T[set - 1] : t - 0.42;
      var tx = t < 0.42 ? 380 : lerp(prev, tgt, es(since / 0.12)), ty = 275 + (set === 3 && t > 1.12 && t < 1.48 ? Math.sin(t * 60) * 3 : 0);
      var thrOn = t > 0.42 ? Math.min(1, (t - 0.42) / 0.06) * (fu > 0 ? 1 - es(fu / 0.3) : 1) : 0;
      var wig = ''; for (var x = 380; x <= tx; x += 20) wig += (x === 380 ? 'M' : 'L') + P(x, 275 + Math.sin(x * 0.05 - t0 * 14) * 3);
      E.thr.setAttribute('d', wig + 'L' + P(tx, ty)); E.thr.setAttribute('opacity', (0.85 * thrOn).toFixed(3));
      E.tip.setAttribute('cx', tx.toFixed(1)); E.tip.setAttribute('cy', ty.toFixed(1)); E.tip.setAttribute('opacity', (thrOn * (0.7 + 0.3 * Math.sin(t0 * 20))).toFixed(3));
      // các chốt
      for (var p = 0; p < 4; p++) {
        var cx = CLK_X[p], kl = CLK_KL[p], lift = clkLift(p, t), ktop = 276 - kl - (64 - kl) * lift, kb = ktop + kl, dtop = ktop - 44;
        E.kp[p].setAttribute('d', 'M' + P(cx - 13, ktop) + 'H' + (cx + 13) + 'V' + (kb - 9).toFixed(1) + 'L' + P(cx, kb) + 'L' + P(cx - 13, kb - 9) + 'Z');
        E.dp[p].setAttribute('d', 'M' + P(cx - 13, dtop + 4) + 'Q' + P(cx - 13, dtop) + ' ' + P(cx - 9, dtop) + 'H' + (cx + 9) + 'Q' + P(cx + 13, dtop) + ' ' + P(cx + 13, dtop + 4) + 'V' + (ktop - 1).toFixed(1) + 'H' + (cx - 13) + 'Z');
        var sh = '', top2 = 112, n2 = 7, step = (dtop - top2) / n2;
        for (var z = 0; z <= n2; z++) sh += (z ? 'L' : 'M') + P(cx + (z % 2 ? 10 : -10) * (z && z < n2 ? 1 : 0), top2 + z * step);
        E.spr[p].setAttribute('d', sh);
        var isSet = t >= CLK_T[p], col = isSet ? '#FFE8EC' : '#E8869B';
        E.kp[p].setAttribute('stroke', col); E.dp[p].setAttribute('stroke', col); E.spr[p].setAttribute('stroke', '#E8869B');
        E.kp[p].setAttribute('stroke-width', isSet ? 2.2 : 1.6); E.dp[p].setAttribute('stroke-width', isSet ? 2.2 : 1.6); E.spr[p].setAttribute('stroke-width', 1.1);
        [E.kp[p], E.dp[p], E.spr[p]].forEach(function (el) { el.setAttribute('opacity', dr.toFixed(3)); });
        // vòng đỏ nhỏ toả ra từ chỗ chốt chạm vạch cắt
        var u = (t0 - CLK_T[p]) / 0.45, cc = E.cr[p];
        if (u > 0 && u < 1) { cc.setAttribute('cx', cx); cc.setAttribute('cy', 212); cc.setAttribute('r', (8 + u * 62).toFixed(1)); cc.setAttribute('stroke-width', (3 * (1 - u) + 0.5).toFixed(2)); cc.setAttribute('opacity', (0.9 * (1 - u)).toFixed(3)); }
        else cc.setAttribute('opacity', 0);
        E.dm[p].setAttribute('fill', isSet ? '#FFE8EC' : 'none'); E.dm[p].setAttribute('opacity', (dr * (isSet ? 1 : 0.6)).toFixed(3));
      }
      // vạch cắt sáng dần theo số chốt đã khớp
      var lx = set ? CLK_X[set - 1] + 19 : 380;
      E.lit.setAttribute('d', 'M380 212H' + (set === 4 || fu > 0 ? 900 : lx)); E.lit.setAttribute('opacity', (set ? 0.9 * (fu > 0.4 ? Math.max(0, 1 - (fu - 0.4) / 0.4) : 1) : 0).toFixed(3));
      // khung ngắm bốn góc quanh mặt cắt, khép lại mỗi cú cạch
      var pul = 0; CLK_T.forEach(function (c) { var v = t0 - c; if (v > 0 && v < 0.2) pul = Math.max(pul, 1 - v / 0.2); });
      var bz = lerp(1.08, 1, es((t0 - 0.1) / 0.4)) - 0.02 * pul, x0 = 640 - 290 * bz, x1 = 640 + 290 * bz, y0 = 214 - 148 * bz, y1 = 214 + 148 * bz, ba = 30, bd = '';
      [[x0, y0, 1, 1], [x1, y0, -1, 1], [x1, y1, -1, -1], [x0, y1, 1, -1]].forEach(function (c) { bd += 'M' + P(c[0] + c[2] * ba, c[1]) + 'L' + P(c[0], c[1]) + 'L' + P(c[0], c[1] + c[3] * ba); });
      E.brk.setAttribute('d', bd); E.brk.setAttribute('opacity', ((0.5 + 0.4 * pul) * ea).toFixed(3));
      // mở: loé trắng hồng, ngôi sao ở lỗ khoá, tia sáng tràn ra từ lỗ khoá, bốn vòng đỏ nở ra
      E.wash.setAttribute('opacity', (fu > 0 && fu < 0.12 ? 0.5 * (1 - fu / 0.12) * PW : 0).toFixed(3));
      E.rays.setAttribute('opacity', ((fu > 0 ? 0.3 * Math.max(0, 1 - fu / 0.6) : t0 > 0.5 ? 0.012 * set : 0) * PW * ea).toFixed(3));
      E.rays.setAttribute('transform', 'rotate(' + (t0 * 6).toFixed(2) + ' 210 205)');
      E.halo.setAttribute('opacity', ((fu > 0 ? 0.45 * Math.max(0.15, 1 - fu / 0.5) : 0.04 * set) * PW * ea).toFixed(3));
      var sr = fu > 0 ? 80 * PW * (fu < 0.1 ? 1 : Math.max(0, 1 - (fu - 0.1) / 0.45)) : 0, sd = '';
      if (sr > 0.5) { for (var s = 0; s < 4; s++) { var a = s * 1.5708 + 0.785 * tu; sd += 'M210 200L' + P(210 + Math.cos(a + 0.785) * sr * 0.08, 200 + Math.sin(a + 0.785) * sr * 0.08) + 'L' + P(210 + Math.cos(a) * sr, 200 + Math.sin(a) * sr) + 'L' + P(210 + Math.cos(a - 0.785) * sr * 0.08, 200 + Math.sin(a - 0.785) * sr * 0.08) + 'Z'; } }
      E.star.setAttribute('d', sd); E.star.setAttribute('opacity', sr > 0.5 ? 1 : 0);
      for (var r = 0; r < 4; r++) {
        var v = (fu - r * 0.08) / 0.8, rc = E.rings[r];
        if (v <= 0 || v >= 1) { rc.setAttribute('opacity', 0); continue; }
        rc.setAttribute('r', (120 + v * (260 + r * 90)).toFixed(1)); rc.setAttribute('stroke-width', ((3.2 - r * 0.5) * (1 - v) + 0.5) * PW);
        rc.setAttribute('stroke-dasharray', r % 2 ? '24 10' : 'none'); rc.setAttribute('opacity', ((1 - v) * (0.9 - r * 0.15)).toFixed(3));
      }
      // vệt tốc độ trong băng
      var fr = Math.floor(t0 * 20);
      for (var k = 0; k < E.sp.length; k++) { var spk = E.sp[k], sx = ((k * 0.43 + t0 * (1.5 + (k % 3) * 0.6)) % 1.6 - 0.3) * 1000; spk.setAttribute('x', sx.toFixed(0)); spk.setAttribute('width', 70 + (k % 4) * 55); spk.setAttribute('opacity', ((0.05 + (k % 3) * 0.04 + pul * 0.15 + (fu > 0 && fu < 0.4 ? 0.22 : 0)) * ea * ((fr + k) % 5 ? 1 : 0.4)).toFixed(3)); }
      // canvas phía sau: trang tối viền đỏ rượu + vệt tốc độ dồn về băng mỗi cú cạch
      edge(dk ? '#000000' : '#2a0a12', (dk ? 0.75 : 0.4) * op, 0.18);
      focus(W / 2, H * 0.4, kc('clevia'), (pul * 0.22 + (fu > 0 && fu < 0.45 ? 0.3 * (1 - fu / 0.45) : 0)) * PW, 40, R, t0, 0.4);
      var shake = pul > 0.6 ? 2.5 * PW : 0; if (fu > 0 && fu < 0.3) shake = 5 * PW * (1 - fu / 0.3);
      jolt(shake, t0);
    }
    MORE['clevia-lock'] = function (t0, R) {
      if (!R._clk) R._clk = clkBuild();
      if (t0 > 2.85) { if (R._clk.sv.parentNode) R._clk.sv.parentNode.removeChild(R._clk.sv); main.style.transform = ''; return true; }
      clkDraw(R._clk, t0, R);
      return false;
    };
    // cận cảnh rồi ánh sáng lỗ khoá tràn ra cả trang: phần cuối của Unlock (vòng đã khớp, tia lỗ khoá, đoạn chữ cạch về hàng) chạy từ 2,5
    MORE['clevia-lock-unlock'] = function (t0, R) {
      var a = t0 <= 2.85 || (R._clk && R._clk.sv.parentNode) ? MORE['clevia-lock'](t0, R) : true, b = t0 > 2.5 ? MORE['clevia-unlock'](t0 - 2.5 + 1.75, R) : false;
      cutin(t0 - 2.45, 'clevia', null, 0.24); // băng tên "???" lúc băng ổ khoá vừa khép (như Luke: băng mắt khép thì băng tên chiêu chém qua)
      return a && b;
    };

    window.a07cast = cast; // ổ khoá trong acts.js gọi khi bật mở
    window.a07shot = function (kind, quiet) { shots.push({ kind: kind, t0: performance.now(), R: seeds() }); kick(); if (!quiet && window.a07sfx) window.a07sfx(kind); };

    // trang xem thử ẩn (xem-thu.html) và về sau các tương tác: tự bật một hiệu ứng/bộ chiêu
    // o: { pow, len, ten (false = không băng tên chiêu), cast (vòng kích hoạt trước), p (đoạn chữ để tô màu người ra chiêu), quiet (không tiếng) }
    window.a07fx = function (kind, o) {
      o = o || {}; var now0 = performance.now();
      if (o.cast) { cast(o.quiet); now0 += 850; }
      shots.push({ kind: kind, t0: now0, R: seeds(), pow: o.pow || 1, len: o.len || 1, ten: o.ten !== false }); kick();
      if (o.p) power(o.p, WHO[kind] || o.who, now0 - performance.now());
      if (!o.quiet && window.a07sfx) setTimeout(function () { window.a07sfx(kind, o); }, Math.max(40, now0 - performance.now()));
    };
    window.a07fxKinds = ['chains', 'smoke', 'water', 'door', 'dome'].concat(Object.keys(MORE).filter(function (k) { return k[0] !== '_'; }));
    window.a07fxWho = WHO;

    check(); if (openT0 != null) kick();
  })();

  /* ---------- tiếng nền ---------- */
  var ac = null, master = null, bed = null, musicG = null, bedLevel = 1, current = null, curKey = null, playing = false, noiseBuf = null;

  function noise() {
    if (noiseBuf) return noiseBuf;
    var len = ac.sampleRate * 4, b = ac.createBuffer(1, len, ac.sampleRate), d = b.getChannelData(0), last = 0;
    for (var i = 0; i < len; i++) { var wv = Math.random() * 2 - 1; last = (last + 0.02 * wv) / 1.02; d[i] = last * 3.5; } // nhiễu nâu
    return (noiseBuf = b);
  }
  function whiteBuf() {
    var len = ac.sampleRate, b = ac.createBuffer(1, len, ac.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }
  function loopSrc(buf) { var s = ac.createBufferSource(); s.buffer = buf; s.loop = true; s.start(0, Math.random() * 3); return s; }
  function filt(type, f, q) { var x = ac.createBiquadFilter(); x.type = type; x.frequency.value = f; if (q) x.Q.value = q; return x; }
  function gain(v) { var x = ac.createGain(); x.gain.value = v; return x; }
  function lfo(param, rate, depth) { var o = ac.createOscillator(), gg = gain(depth); o.frequency.value = rate; o.connect(gg); gg.connect(param); o.start(); return o; }

  // mỗi nền tiếng: function(out) -> danh sách hàm dừng
  var SND = {};
  function every(minS, maxS, fn) {
    var alive = true, id;
    (function next() { id = setTimeout(function () { if (!alive) return; fn(); next(); }, (minS + Math.random() * (maxS - minS)) * 1000); })();
    return function () { alive = false; clearTimeout(id); };
  }

  SND.water = function (out) {
    var s = loopSrc(noise()), f = filt('lowpass', 380, 0.7), g = gain(0.9);
    s.connect(f); f.connect(g); g.connect(out);
    var l = lfo(f.frequency, 0.07, 160);
    var drone = ac.createOscillator(); drone.frequency.value = 55; var dg = gain(0.05); drone.connect(dg); dg.connect(out); drone.start();
    var bub = every(0.6, 2.4, function () {
      var o = ac.createOscillator(), og = gain(0), n = ac.currentTime, f0 = 300 + Math.random() * 500;
      o.frequency.setValueAtTime(f0, n); o.frequency.exponentialRampToValueAtTime(f0 * 2.4, n + 0.08);
      og.gain.setValueAtTime(0, n); og.gain.linearRampToValueAtTime(0.06, n + 0.01); og.gain.exponentialRampToValueAtTime(0.0001, n + 0.1);
      o.connect(og); og.connect(out); o.start(n); o.stop(n + 0.12);
    });
    return [function () { s.stop(); l.stop(); drone.stop(); bub(); }];
  };

  function birds(out, minS, maxS, vol) {
    return every(minS, maxS, function () {
      var n = ac.currentTime, notes = 2 + Math.floor(Math.random() * 4), base = 2600 + Math.random() * 1600;
      for (var i = 0; i < notes; i++) {
        var o = ac.createOscillator(), og = gain(0), st = n + i * (0.09 + Math.random() * 0.05);
        o.frequency.setValueAtTime(base * (1 + Math.random() * 0.2), st);
        o.frequency.exponentialRampToValueAtTime(base * (0.7 + Math.random() * 0.6), st + 0.07);
        og.gain.setValueAtTime(0, st); og.gain.linearRampToValueAtTime(vol, st + 0.01); og.gain.exponentialRampToValueAtTime(0.0001, st + 0.08);
        o.connect(og); og.connect(out); o.start(st); o.stop(st + 0.1);
      }
    });
  }
  function hum(out, f, v) { var s = loopSrc(noise()), fl = filt('lowpass', f, 0.5), g = gain(v); s.connect(fl); fl.connect(g); g.connect(out); return s; }
  function passBy(out, v) {
    return every(4, 10, function () {
      var s = ac.createBufferSource(); s.buffer = noise(); var fl = filt('bandpass', 300, 1.2), g = gain(0), n = ac.currentTime, d = 3 + Math.random() * 2;
      fl.frequency.setValueAtTime(220, n); fl.frequency.linearRampToValueAtTime(520, n + d / 2); fl.frequency.linearRampToValueAtTime(200, n + d);
      g.gain.setValueAtTime(0, n); g.gain.linearRampToValueAtTime(v, n + d / 2); g.gain.linearRampToValueAtTime(0, n + d);
      s.connect(fl); fl.connect(g); g.connect(out); s.start(n, Math.random() * 3); s.stop(n + d);
    });
  }

  SND.street = function (out) {
    var h = hum(out, 500, 0.35), b = birds(out, 0.8, 3, 0.035), p = passBy(out, 0.25);
    return [function () { h.stop(); b(); p(); }];
  };
  SND.dusk = function (out) {
    var h = hum(out, 300, 0.55), p = passBy(out, 0.4);
    var cr = loopSrc(whiteBuf()), cf = filt('bandpass', 4200, 8), cg = gain(0.0); cr.connect(cf); cf.connect(cg); cg.connect(out);
    var cl = lfo(cg.gain, 9, 0.012);
    return [function () { h.stop(); p(); cr.stop(); cl.stop(); }];
  };
  SND.bridge = function (out) {
    var s = loopSrc(noise()), f = filt('bandpass', 500, 0.8), g = gain(0.6); s.connect(f); f.connect(g); g.connect(out);
    var l1 = lfo(f.frequency, 0.05, 300), l2 = lfo(g.gain, 0.09, 0.35);
    var o1 = ac.createOscillator(), o2 = ac.createOscillator(); o1.frequency.value = 73.4; o2.frequency.value = 110.6;
    var og = gain(0.035); o1.connect(og); o2.connect(og); og.connect(out); o1.start(); o2.start();
    var lap = every(2, 5, function () {
      var src = ac.createBufferSource(); src.buffer = noise(); var fl = filt('lowpass', 700), gg = gain(0), n = ac.currentTime;
      gg.gain.setValueAtTime(0, n); gg.gain.linearRampToValueAtTime(0.25, n + 0.3); gg.gain.linearRampToValueAtTime(0, n + 1.1);
      src.connect(fl); fl.connect(gg); gg.connect(out); src.start(n, Math.random() * 3); src.stop(n + 1.2);
    });
    return [function () { s.stop(); l1.stop(); l2.stop(); o1.stop(); o2.stop(); lap(); }];
  };
  SND.clock = function (out) {
    var h = hum(out, 200, 0.2), wb = whiteBuf(), alive = true, id;
    function tick(strong) {
      var s = ac.createBufferSource(); s.buffer = wb; var fl = filt('bandpass', strong ? 2600 : 3200, 6), g = gain(0), n = ac.currentTime;
      g.gain.setValueAtTime(0.5, n); g.gain.exponentialRampToValueAtTime(0.001, n + 0.03);
      s.connect(fl); fl.connect(g); g.connect(out); s.start(n, Math.random()); s.stop(n + 0.04);
    }
    var seq = [1000, 1000, 1600], i = 0; // nhịp thứ ba trễ, khớp kim giây trong tranh
    (function next() { id = setTimeout(function () { if (!alive) return; tick(i % 3 === 0); i++; next(); }, seq[i % 3]); })();
    return [function () { alive = false; clearTimeout(id); h.stop(); }];
  };
  SND.bench = function (out) {
    var wind = loopSrc(noise()), wf = filt('lowpass', 800), wg = gain(0.3); wind.connect(wf); wf.connect(wg); wg.connect(out);
    var wl = lfo(wg.gain, 0.08, 0.2);
    var voices = loopSrc(noise()), vf = filt('bandpass', 700, 2.5), vg = gain(0.12); voices.connect(vf); vf.connect(vg); vg.connect(out);
    var vl = lfo(vf.frequency, 2.3, 180);
    var b = birds(out, 3, 8, 0.02);
    // tiếng kiếm tre xa xa ở sân tập
    var clack = every(2.5, 7, function () {
      var n = ac.currentTime, hits = 1 + Math.floor(Math.random() * 3);
      for (var k = 0; k < hits; k++) {
        var o = ac.createOscillator(), og = gain(0), st = n + k * 0.18;
        o.type = 'triangle'; o.frequency.setValueAtTime(900 + Math.random() * 200, st); o.frequency.exponentialRampToValueAtTime(400, st + 0.05);
        og.gain.setValueAtTime(0.05, st); og.gain.exponentialRampToValueAtTime(0.0001, st + 0.07);
        var lp = filt('lowpass', 1800); o.connect(lp); lp.connect(og); og.connect(out); o.start(st); o.stop(st + 0.08);
      }
    });
    return [function () { wind.stop(); wl.stop(); voices.stop(); vl.stop(); b(); clack(); }];
  };

  /* ---------- tiếng nền cho các chương sau (chèn vào fx.js khi dựng). Không dùng tiếng chuông. ---------- */
  function crickets(out, v, freq) {
    var src = loopSrc(whiteBuf()), f = filt('bandpass', freq || 4400, 12), g = gain(0); src.connect(f); f.connect(g); g.connect(out);
    var o = ac.createOscillator(), og = gain(v); o.frequency.value = 22; o.connect(og); og.connect(g.gain); o.start();
    var slow = lfo(og.gain, 0.3, v * 0.6);
    return function () { src.stop(); o.stop(); slow.stop(); };
  }
  function frogs(out, v) {
    return every(0.7, 2.2, function () {
      var n = ac.currentTime, reps = 2 + Math.floor(Math.random() * 3), f0 = 180 + Math.random() * 120;
      for (var i = 0; i < reps; i++) { var o = ac.createOscillator(), og = gain(0), st = n + i * 0.13; o.type = 'square'; o.frequency.setValueAtTime(f0, st); o.frequency.exponentialRampToValueAtTime(f0 * 0.7, st + 0.08); var lp = filt('lowpass', 700); og.gain.setValueAtTime(v, st); og.gain.exponentialRampToValueAtTime(0.0001, st + 0.09); o.connect(lp); lp.connect(og); og.connect(out); o.start(st); o.stop(st + 0.1); }
    });
  }
  function wind(out, v, f) { var s = loopSrc(noise()), fl = filt('lowpass', f || 600), g = gain(v); s.connect(fl); fl.connect(g); g.connect(out); var l = lfo(g.gain, 0.07, v * 0.6), l2 = lfo(fl.frequency, 0.05, (f || 600) * 0.4); return function () { s.stop(); l.stop(); l2.stop(); }; }
  function creak(out, v, minS, maxS) {
    return every(minS || 3, maxS || 8, function () {
      var o = ac.createOscillator(), og = gain(0), n = ac.currentTime, d = 0.4 + Math.random() * 0.5; o.type = 'sawtooth';
      o.frequency.setValueAtTime(90 + Math.random() * 40, n); o.frequency.linearRampToValueAtTime(140 + Math.random() * 60, n + d);
      var bp = filt('bandpass', 900, 4); og.gain.setValueAtTime(0, n); og.gain.linearRampToValueAtTime(v, n + 0.05); og.gain.linearRampToValueAtTime(0, n + d);
      o.connect(bp); bp.connect(og); og.connect(out); o.start(n); o.stop(n + d + 0.05);
    });
  }
  function crackle(out, v, minS, maxS) {
    var wb = whiteBuf();
    return every(minS, maxS, function () {
      var s = ac.createBufferSource(); s.buffer = wb; var fl = filt('highpass', 1500 + Math.random() * 2500), g = gain(0), n = ac.currentTime;
      g.gain.setValueAtTime(v * (0.4 + Math.random()), n); g.gain.exponentialRampToValueAtTime(0.0001, n + 0.02 + Math.random() * 0.04);
      s.connect(fl); fl.connect(g); g.connect(out); s.start(n, Math.random() * 0.8); s.stop(n + 0.08);
    });
  }
  function water(out, v, f) { var s = loopSrc(noise()), fl = filt('bandpass', f || 900, 0.6), g = gain(v); s.connect(fl); fl.connect(g); g.connect(out); var l = lfo(fl.frequency, 0.3, (f || 900) * 0.3); return function () { s.stop(); l.stop(); }; }
  function drone(out, f, v) { var o = ac.createOscillator(), o2 = ac.createOscillator(), g = gain(v); o.frequency.value = f; o2.frequency.value = f * 1.503; o.connect(g); o2.connect(g); g.connect(out); o.start(); o2.start(); var l = lfo(g.gain, 0.06, v * 0.5); return function () { o.stop(); o2.stop(); l.stop(); }; }

  SND.room = function (out) { var h = hum(out, 180, 0.22), p = passBy(out, 0.12); return [function () { h.stop(); p(); }]; };
  SND.store = function (out) { var h = hum(out, 150, 0.18), c = creak(out, 0.03, 5, 12), b = birds(out, 5, 12, 0.012); return [function () { h.stop(); c(); b(); }]; };
  SND.void = function (out) {
    var d = drone(out, 82, 0.05), s = loopSrc(whiteBuf()), f = filt('bandpass', 6200, 18), g = gain(0.05); s.connect(f); f.connect(g); g.connect(out);
    var l = lfo(f.frequency, 0.2, 1500);
    return [function () { d(); s.stop(); l.stop(); }];
  };
  SND.night = function (out) { var c = crickets(out, 0.025), f = frogs(out, 0.03), wd = wind(out, 0.12, 400); return [c, f, wd]; };
  SND.nighttense = function (out) { var c = crickets(out, 0.015), wd = wind(out, 0.15, 350), d = drone(out, 55, 0.04); return [c, wd, d]; };
  SND.hearth = function (out) { var c = crackle(out, 0.12, 0.05, 0.4), h = hum(out, 220, 0.2), cr = crickets(out, 0.008); return [c, function () { h.stop(); }, cr]; };
  SND.hearthlow = function (out) { var c = crackle(out, 0.08, 0.3, 1.6), d = drone(out, 49, 0.035), wd = wind(out, 0.1, 300); return [c, d, wd]; };
  SND.chains = function (out) {
    var wd = wind(out, 0.14, 380), d = drone(out, 41, 0.04);
    var clink = every(0.8, 3, function () {
      var n = ac.currentTime; for (var i = 0; i < 2; i++) { var o = ac.createOscillator(), og = gain(0), st = n + i * 0.06; o.type = 'triangle'; o.frequency.value = 1800 + Math.random() * 1600; og.gain.setValueAtTime(0.02, st); og.gain.exponentialRampToValueAtTime(0.0001, st + 0.25); o.connect(og); og.connect(out); o.start(st); o.stop(st + 0.3); }
    });
    return [wd, d, clink];
  };
  SND.dawn = function (out) { var b = birds(out, 1.2, 4, 0.025), wd = wind(out, 0.12, 700); return [b, wd]; };
  SND.paddy = function (out) { var w2 = water(out, 0.12, 600), b = birds(out, 2, 6, 0.02), f = frogs(out, 0.015); return [w2, b, f]; };
  SND.farm = function (out) { var w2 = water(out, 0.18, 1100), c = creak(out, 0.035, 2.5, 4), b = birds(out, 1.5, 5, 0.025); return [w2, c, b]; };
  SND.day = function (out) { var b = birds(out, 1.5, 5, 0.022), wd = wind(out, 0.14, 800); return [b, wd]; };
  SND.river = function (out) { var w2 = water(out, 0.3, 800), wd = wind(out, 0.08, 500), b = birds(out, 4, 10, 0.015); return [w2, wd, b]; };
  SND.rivernight = function (out) { var w2 = water(out, 0.25, 700), c = crickets(out, 0.015), f = frogs(out, 0.02); return [w2, c, f]; };
  SND.clinic = function (out) {
    var h = hum(out, 160, 0.15), w2 = water(out, 0.05, 2400);
    var bub = every(0.15, 0.6, function () { var o = ac.createOscillator(), og = gain(0), n = ac.currentTime, f0 = 400 + Math.random() * 400; o.frequency.setValueAtTime(f0, n); o.frequency.exponentialRampToValueAtTime(f0 * 1.8, n + 0.05); og.gain.setValueAtTime(0.025, n); og.gain.exponentialRampToValueAtTime(0.0001, n + 0.06); o.connect(og); og.connect(out); o.start(n); o.stop(n + 0.07); });
    return [function () { h.stop(); }, w2, bub];
  };
  SND.market = function (out) {
    var wd = wind(out, 0.1, 500), d = drone(out, 62, 0.02);
    var fly = (function () { var o = ac.createOscillator(), g = gain(0); o.type = 'sawtooth'; o.frequency.value = 210; var lp = filt('bandpass', 400, 3); o.connect(lp); lp.connect(g); g.connect(out); o.start(); var l = lfo(g.gain, 0.15, 0.012), l2 = lfo(o.frequency, 5, 20); return function () { o.stop(); l.stop(); l2.stop(); }; })();
    return [wd, d, fly];
  };
  SND.hall = function (out) { var h = hum(out, 120, 0.2), c = creak(out, 0.02, 6, 14), b = birds(out, 6, 14, 0.01); return [function () { h.stop(); }, c, b]; };
  SND.noon = function (out) {
    // ve sầu buổi trưa
    var s = loopSrc(whiteBuf()), f = filt('bandpass', 5200, 6), g = gain(0); s.connect(f); f.connect(g); g.connect(out);
    var o = ac.createOscillator(), og = gain(0.03); o.frequency.value = 48; o.connect(og); og.connect(g.gain); o.start();
    var sw = lfo(og.gain, 0.12, 0.025), wd = wind(out, 0.06, 500);
    return [function () { s.stop(); o.stop(); sw.stop(); }, wd];
  };
  SND.run = function (out) {
    var nn = SND.noon(out), alive = true, id;
    function beat() { var n = ac.currentTime; [0, 0.18].forEach(function (d, i) { var o = ac.createOscillator(), og = gain(0); o.frequency.setValueAtTime(70, n + d); o.frequency.exponentialRampToValueAtTime(40, n + d + 0.12); og.gain.setValueAtTime(i ? 0.18 : 0.28, n + d); og.gain.exponentialRampToValueAtTime(0.0001, n + d + 0.15); o.connect(og); og.connect(out); o.start(n + d); o.stop(n + d + 0.16); }); }
    (function next() { id = setTimeout(function () { if (!alive) return; beat(); next(); }, 520); })();
    return nn.concat([function () { alive = false; clearTimeout(id); }]);
  };

  /* chương 11: khu Mỏ */
  SND.mine = function (out) {
    var wd = wind(out, 0.16, 900), wd2 = wind(out, 0.06, 2600);
    // đá lăn lộc cộc xa xa
    var pebble = every(5, 12, function () { var n = ac.currentTime, reps = 2 + Math.floor(Math.random() * 4); for (var i = 0; i < reps; i++) { var st = n + i * (0.08 + Math.random() * 0.12), o = ac.createOscillator(), og = gain(0), lp = filt('bandpass', 700 + Math.random() * 500, 3); o.type = 'triangle'; o.frequency.value = 180 + Math.random() * 160; og.gain.setValueAtTime(0.03 * (1 - i / reps), st); og.gain.exponentialRampToValueAtTime(0.0001, st + 0.05); o.connect(lp); lp.connect(og); og.connect(out); o.start(st); o.stop(st + 0.06); } });
    return [wd, wd2, pebble];
  };
  SND.hut = function (out) { var h = hum(out, 140, 0.16), wd = wind(out, 0.05, 400); return [function () { h.stop(); }, wd]; };
  SND.whet = function (out) {
    var h = hum(out, 130, 0.14), c = crackle(out, 0.04, 0.6, 2.2), nb = whiteBuf(), alive = true, id;
    function scrape() { var n = ac.currentTime, s = ac.createBufferSource(); s.buffer = nb; var f = filt('bandpass', 2600, 2), g = gain(0); g.gain.setValueAtTime(0, n); g.gain.linearRampToValueAtTime(0.05, n + 0.12); g.gain.linearRampToValueAtTime(0, n + 0.5); s.connect(f); f.connect(g); g.connect(out); s.start(n, Math.random() * 0.5); s.stop(n + 0.55); }
    (function next() { id = setTimeout(function () { if (!alive) return; scrape(); next(); }, 1300); })();
    return [function () { h.stop(); }, c, function () { alive = false; clearTimeout(id); }];
  };
  SND.cave = function (out) {
    var wd = wind(out, 0.14, 260), d = drone(out, 44, 0.035);
    var drip = every(1.5, 4.5, function () { var o = ac.createOscillator(), og = gain(0), n = ac.currentTime, f0 = 900 + Math.random() * 600; o.frequency.setValueAtTime(f0, n); o.frequency.exponentialRampToValueAtTime(f0 * 0.5, n + 0.12); og.gain.setValueAtTime(0.03, n); og.gain.exponentialRampToValueAtTime(0.0001, n + 0.18); o.connect(og); og.connect(out); o.start(n); o.stop(n + 0.2); });
    return [wd, d, drip];
  };

  /* chương 12: trong hầm mỏ (không tiếng trầm kiểu trống) */
  function pickTicks(out, v, minS, maxS) {
    // tiếng cuốc xa vọng lại: "cạch" cao, khô, đều đều
    return every(minS, maxS, function () { var n = ac.currentTime; for (var i = 0; i < 3; i++) { var st = n + i * (0.9 + Math.random() * 0.15), o = ac.createOscillator(), og = gain(0), bp = filt('bandpass', 2200 + Math.random() * 600, 8); o.type = 'triangle'; o.frequency.value = 1300 + Math.random() * 300; og.gain.setValueAtTime(v, st); og.gain.exponentialRampToValueAtTime(0.0001, st + 0.06); o.connect(bp); bp.connect(og); og.connect(out); o.start(st); o.stop(st + 0.08); } });
  }
  function drips(out, v) { return every(1.2, 3.8, function () { var o = ac.createOscillator(), og = gain(0), n = ac.currentTime, f0 = 900 + Math.random() * 700; o.frequency.setValueAtTime(f0, n); o.frequency.exponentialRampToValueAtTime(f0 * 0.5, n + 0.12); og.gain.setValueAtTime(v, n); og.gain.exponentialRampToValueAtTime(0.0001, n + 0.18); o.connect(og); og.connect(out); o.start(n); o.stop(n + 0.2); }); }
  function lampHiss(out, v) { var s = loopSrc(whiteBuf()), f = filt('bandpass', 3200, 1.2), g = gain(v); s.connect(f); f.connect(g); g.connect(out); var l = lfo(g.gain, 0.4, v * 0.4); return function () { s.stop(); l.stop(); }; }
  SND.shaft = function (out) { return [wind(out, 0.1, 240), drips(out, 0.03), pickTicks(out, 0.03, 2.5, 5), lampHiss(out, 0.008)]; };
  SND.anvil = function (out) {
    // búa tạ đập đá: tiếng đá vỡ chát chúa, không ầm trầm
    var hit = every(1.1, 2.4, function () { var n = ac.currentTime, s = ac.createBufferSource(); s.buffer = whiteBuf(); var f = filt('bandpass', 1600, 1.4), g = gain(0); g.gain.setValueAtTime(0.09, n); g.gain.exponentialRampToValueAtTime(0.0001, n + 0.18); s.connect(f); f.connect(g); g.connect(out); s.start(n, Math.random() * 0.5); s.stop(n + 0.2);
      for (var i = 0; i < 4; i++) { var st = n + 0.08 + i * (0.05 + Math.random() * 0.07), o = ac.createOscillator(), og = gain(0); o.type = 'triangle'; o.frequency.value = 500 + Math.random() * 600; og.gain.setValueAtTime(0.02, st); og.gain.exponentialRampToValueAtTime(0.0001, st + 0.04); o.connect(og); og.connect(out); o.start(st); o.stop(st + 0.05); } });
    return [wind(out, 0.08, 240), drips(out, 0.02), hit, lampHiss(out, 0.01)];
  };
  SND.stillshaft = function (out) { return [wind(out, 0.12, 200), drips(out, 0.04), drone(out, 46, 0.03)]; };
  SND.shuffle = function (out) {
    // tiếng chân lệt sệt kéo lê vọng từ các ngách
    var sh = every(0.6, 1.6, function () { var n = ac.currentTime, s = ac.createBufferSource(); s.buffer = whiteBuf(); var f = filt('lowpass', 500 + Math.random() * 300, 1), g = gain(0), p = ac.createStereoPanner ? ac.createStereoPanner() : null; g.gain.setValueAtTime(0, n); g.gain.linearRampToValueAtTime(0.06, n + 0.08); g.gain.linearRampToValueAtTime(0, n + 0.35); s.connect(f); f.connect(g); if (p) { p.pan.value = Math.random() * 1.6 - 0.8; g.connect(p); p.connect(out); } else g.connect(out); s.start(n, Math.random() * 0.5); s.stop(n + 0.4); });
    return [wind(out, 0.1, 220), drips(out, 0.02), sh];
  };
  SND.dust = function (out) {
    // sau cú sập: đá vụn còn lăn lóc, bụi rơi lả tả
    var peb = every(0.8, 2.6, function () { var n = ac.currentTime, reps = 2 + Math.floor(Math.random() * 4); for (var i = 0; i < reps; i++) { var st = n + i * (0.06 + Math.random() * 0.1), o = ac.createOscillator(), og = gain(0); o.type = 'triangle'; o.frequency.value = 300 + Math.random() * 500; og.gain.setValueAtTime(0.025 * (1 - i / reps), st); og.gain.exponentialRampToValueAtTime(0.0001, st + 0.05); o.connect(og); og.connect(out); o.start(st); o.stop(st + 0.06); } });
    var s = loopSrc(whiteBuf()), f = filt('highpass', 5000, 0.7), g = gain(0.006); s.connect(f); f.connect(g); g.connect(out);
    return [peb, drone(out, 44, 0.025), function () { s.stop(); }];
  };

  /* chương 13: khu Mỏ buổi chiều, căn nhà sau ống khói, tiệm rèn (không tiếng trầm kiểu trống) */
  function farShuffle(out, v, minS, maxS) { return every(minS, maxS, function () { var n = ac.currentTime, s = ac.createBufferSource(); s.buffer = whiteBuf(); var f = filt('lowpass', 450 + Math.random() * 250, 1), g = gain(0), p = ac.createStereoPanner ? ac.createStereoPanner() : null; g.gain.setValueAtTime(0, n); g.gain.linearRampToValueAtTime(v, n + 0.1); g.gain.linearRampToValueAtTime(0, n + 0.4); s.connect(f); f.connect(g); if (p) { p.pan.value = Math.random() * 1.6 - 0.8; g.connect(p); p.connect(out); } else g.connect(out); s.start(n, Math.random() * 0.5); s.stop(n + 0.45); }); }
  function chainRustle(out, v, minS, maxS) { return every(minS, maxS, function () { var n = ac.currentTime, reps = 3 + Math.floor(Math.random() * 5); for (var i = 0; i < reps; i++) { var st = n + i * (0.05 + Math.random() * 0.08), o = ac.createOscillator(), og = gain(0); o.type = 'triangle'; o.frequency.value = 2400 + Math.random() * 1800; og.gain.setValueAtTime(v * (1 - i / reps * 0.5), st); og.gain.exponentialRampToValueAtTime(0.0001, st + 0.08); o.connect(og); og.connect(out); o.start(st); o.stop(st + 0.1); } }); }
  // tiếng búa nện sắt: "keng" cao, sáng, có ngân (các hoạ âm lệch nhau như kim loại), không có tiếng thịch
  function keng(out, at, v) { [1870, 2930, 4410, 5920].forEach(function (f, i) { var o = ac.createOscillator(), og = gain(0); o.frequency.value = f * (0.99 + Math.random() * 0.02); og.gain.setValueAtTime(v * [1, 0.55, 0.35, 0.2][i], at); og.gain.exponentialRampToValueAtTime(0.0001, at + 0.7 - i * 0.12); o.connect(og); og.connect(out); o.start(at); o.stop(at + 0.75); }); var s = ac.createBufferSource(); s.buffer = whiteBuf(); var f2 = filt('highpass', 3500, 0.8), g2 = gain(0); g2.gain.setValueAtTime(v * 1.2, at); g2.gain.exponentialRampToValueAtTime(0.0001, at + 0.04); s.connect(f2); f2.connect(g2); g2.connect(out); s.start(at, Math.random() * 0.5); s.stop(at + 0.06); }
  function hammer(out, v, gap) { var alive = true, id; (function next() { id = setTimeout(function () { if (!alive) return; var n = ac.currentTime; for (var i = 0; i < 3; i++) keng(out, n + i * (gap || 0.95), v); next(); }, (3 * (gap || 0.95) + 0.6 + Math.random() * 1.6) * 1000); })(); return function () { alive = false; clearTimeout(id); }; }
  SND.trail13 = function (out) { return [wind(out, 0.12, 700), wind(out, 0.04, 2400), farShuffle(out, 0.025, 1.5, 4), chainRustle(out, 0.012, 2.5, 6)]; };
  SND.march = function (out) { return [wind(out, 0.12, 800), farShuffle(out, 0.05, 0.5, 1.4), chainRustle(out, 0.025, 0.8, 2.2)]; };
  SND.hut13 = function (out) { var h = hum(out, 140, 0.12); return [function () { h.stop(); }, wind(out, 0.04, 500), crackle(out, 0.015, 1.5, 5), farShuffle(out, 0.018, 6, 14)]; };
  SND.dusk13 = function (out) { var far = gain(0.35); far.connect(out); return [wind(out, 0.14, 650), hammer(far, 0.02, 1.1)]; };
  SND.forge = function (out) { return [wind(out, 0.06, 600), crackle(out, 0.035, 0.15, 0.6), hammer(out, 0.035, 0.95)]; };
  SND.forgequiet = function (out) { return [wind(out, 0.06, 600), crackle(out, 0.03, 0.2, 0.8)]; };

  /* chương 14: chạng vạng ở Mỏ, sân Nhà họp làng ban đêm, dư âm chuông, im lặng, chuông nhỏ lanh canh của quỷ đầu đàn (không tiếng trầm kiểu trống) */
  // tiếng ngân cao, mỏng, dài: các hoạ âm lệch nhau, không có âm trầm
  function shimmer(out, v, minS, maxS) { return every(minS, maxS, function () { var n = ac.currentTime; [1318, 1975, 2794, 3729].forEach(function (f, i) { var o = ac.createOscillator(), og = gain(0); o.frequency.value = f * (0.995 + Math.random() * 0.01); og.gain.setValueAtTime(0, n); og.gain.linearRampToValueAtTime(v * [1, 0.5, 0.3, 0.15][i], n + 0.4); og.gain.exponentialRampToValueAtTime(0.0001, n + 5 - i * 0.6); o.connect(og); og.connect(out); o.start(n); o.stop(n + 5.2); }); }); }
  // chuông nhỏ lanh canh, thưa rồi dày dần, tới gần
  function tinkle(out, v) { var t0 = ac.currentTime; return every(0.25, 1.1, function () { var n = ac.currentTime, near = Math.min(1, (n - t0) / 40), reps = 1 + Math.floor(Math.random() * (2 + near * 3)); for (var i = 0; i < reps; i++) { var st = n + i * (0.05 + Math.random() * 0.09), f = 3200 + Math.random() * 2200, o = ac.createOscillator(), og = gain(0); o.frequency.value = f; og.gain.setValueAtTime(v * (0.4 + near * 0.8), st); og.gain.exponentialRampToValueAtTime(0.0001, st + 0.35); o.connect(og); og.connect(out); o.start(st); o.stop(st + 0.4); var o2 = ac.createOscillator(), g2 = gain(0); o2.frequency.value = f * 2.76; g2.gain.setValueAtTime(v * 0.3 * (0.4 + near), st); g2.gain.exponentialRampToValueAtTime(0.0001, st + 0.2); o2.connect(g2); g2.connect(out); o2.start(st); o2.stop(st + 0.25); } }); }
  SND.dusk14 = function (out) { return [wind(out, 0.15, 520), wind(out, 0.03, 2200), chainRustle(out, 0.008, 4, 9)]; };
  SND.yard14 = function (out) { return [crickets(out, 0.012, 4600), wind(out, 0.06, 500), crackle(out, 0.012, 0.6, 2.4)]; };
  SND.ring14 = function (out) { return [shimmer(out, 0.02, 4, 7), wind(out, 0.03, 900)]; };
  SND.still14 = function (out) { return [wind(out, 0.04, 380)]; };
  SND.crown14 = function (out) { return [wind(out, 0.02, 300), tinkle(out, 0.012)]; };

  /* chương 15: Nước giếng (không tiếng trầm kiểu trống) */
  // một tiếng lanh canh lẻ, xa
  function oneTinkle(out, v, minS, maxS) { return every(minS, maxS, function () { var n = ac.currentTime, reps = 1 + Math.floor(Math.random() * 2); for (var i = 0; i < reps; i++) { var st = n + i * 0.12, o = ac.createOscillator(), og = gain(0); o.frequency.value = 3400 + Math.random() * 1800; og.gain.setValueAtTime(v, st); og.gain.exponentialRampToValueAtTime(0.0001, st + 0.4); o.connect(og); og.connect(out); o.start(st); o.stop(st + 0.45); } }); }
  // xích căng rên: nhiễu dải hẹp phồng lên xẹp xuống, lẫn tiếng mắt xích lách cách
  function strain(out, v) { var s = loopSrc(whiteBuf()), f = filt('bandpass', 2600, 7), g = gain(v); s.connect(f); f.connect(g); g.connect(out); var l = lfo(g.gain, 0.45, v * 0.8), l2 = lfo(f.frequency, 0.3, 500); return function () { s.stop(); l.stop(); l2.stop(); }; }
  // nước cuộn xoáy: nhiễu thấp-trung cuộn theo nhịp thở
  function swirl(out, v) { var s = loopSrc(whiteBuf()), f = filt('bandpass', 900, 0.9), g = gain(v); s.connect(f); f.connect(g); g.connect(out); var l = lfo(g.gain, 0.18, v * 0.7), l2 = lfo(f.frequency, 0.11, 400); return function () { s.stop(); l.stop(); l2.stop(); }; }
  // tiếng đá nứt khô ở xa: một vết "rắc" cao rồi sỏi lăn, không ầm
  function farCrack(out, v, minS, maxS) { return every(minS, maxS, function () { var n = ac.currentTime, s = ac.createBufferSource(); s.buffer = whiteBuf(); var f = filt('highpass', 2200, 0.8), g = gain(0); g.gain.setValueAtTime(v, n); g.gain.exponentialRampToValueAtTime(0.0001, n + 0.12); s.connect(f); f.connect(g); g.connect(out); s.start(n, Math.random() * 0.5); s.stop(n + 0.15); for (var i = 0; i < 6; i++) { var st = n + 0.15 + i * (0.06 + Math.random() * 0.1), o = ac.createOscillator(), og = gain(0); o.type = 'triangle'; o.frequency.value = 600 + Math.random() * 700; og.gain.setValueAtTime(v * 0.3 * (1 - i / 7), st); og.gain.exponentialRampToValueAtTime(0.0001, st + 0.05); o.connect(og); og.connect(out); o.start(st); o.stop(st + 0.06); } }); }
  // giọng ngân nga rất xa: một dòng giai điệu mảnh, rung nhẹ, lúc có lúc không
  function farHum(out, v) { var notes = [659, 740, 659, 587, 659, 494, 587, 659], alive = true, id; (function next() { id = setTimeout(function () { if (!alive) return; var n = ac.currentTime, o = ac.createOscillator(), og = gain(0), vb = lfo(o.frequency, 5, 6), lp = filt('lowpass', 1800); o.type = 'triangle'; notes.forEach(function (f, i) { o.frequency.setValueAtTime(f, n + i * 0.55); }); og.gain.setValueAtTime(0, n); og.gain.linearRampToValueAtTime(v, n + 0.4); og.gain.setValueAtTime(v, n + notes.length * 0.55 - 0.5); og.gain.linearRampToValueAtTime(0, n + notes.length * 0.55); o.connect(lp); lp.connect(og); og.connect(out); o.start(n); o.stop(n + notes.length * 0.55 + 0.1); setTimeout(function () { vb.stop(); }, notes.length * 550 + 200); next(); }, 4000 + Math.random() * 5000); })(); return function () { alive = false; clearTimeout(id); }; }
  SND.stare15 = function (out) { return [wind(out, 0.05, 420), oneTinkle(out, 0.012, 2.5, 6)]; };
  SND.cocoon15 = function (out) { return [wind(out, 0.04, 500), strain(out, 0.012), chainRustle(out, 0.02, 0.4, 1.4), oneTinkle(out, 0.01, 1.5, 4)]; };
  SND.shoe15 = function (out) { var far = gain(0.4); far.connect(out); return [wind(out, 0.05, 360), oneTinkle(far, 0.012, 4, 9)]; };
  SND.alley15 = function (out) { return [wind(out, 0.08, 700), farShuffle(out, 0.04, 0.3, 0.7)]; };
  SND.well15 = function (out) { return [swirl(out, 0.05), wind(out, 0.03, 600)]; };
  SND.market15 = function (out) { return [wind(out, 0.1, 520), crackle(out, 0.01, 1.5, 4)]; };
  SND.wall15 = function (out) { var far = gain(0.5); far.connect(out); return [wind(out, 0.07, 440), farCrack(far, 0.05, 6, 12)]; };
  SND.gao15 = function (out) { var far = gain(0.5); far.connect(out); return [wind(out, 0.05, 1600), farHum(far, 0.012), oneTinkle(far, 0.01, 3, 7)]; };

  function switchTo(key) {
    if (!playing || !want || key === curKey) return;
    curKey = key;
    var n = ac.currentTime;
    if (current) {
      var old = current; old.g.gain.cancelScheduledValues(n); old.g.gain.setValueAtTime(old.g.gain.value, n); old.g.gain.linearRampToValueAtTime(0, n + 2.5);
      setTimeout(function () { old.stops.forEach(function (f) { try { f(); } catch (e) {} }); old.g.disconnect(); }, 2700);
      current = null;
    }
    if (!SND[key]) return;
    var g = gain(0); g.connect(bed || master);
    g.gain.setValueAtTime(0, n); g.gain.linearRampToValueAtTime(1, n + 3);
    current = { g: g, stops: SND[key](g) };
  }

  var scenes = [].slice.call(document.querySelectorAll('.scene'));
  function sceneNow() {
    var mid = innerHeight * 0.5, vis = scenes.filter(function (s) { return s.offsetParent !== null; }), key = vis.length ? vis[0].dataset.sound : null; // cảnh đang ẩn (Góc nhìn khác) thì bỏ qua
    vis.forEach(function (s) { if (s.getBoundingClientRect().top < mid) key = s.dataset.sound; });
    return key;
  }
  addEventListener('scroll', function () { if (playing) switchTo(sceneNow()); }, { passive: true });

  // Tiếng mặc định bật và nhớ lựa chọn qua các chương. Trình duyệt chỉ cho phát tiếng sau lần chạm/bấm đầu tiên,
  // nên khi đang "bật" mà chưa phát được thì tiếng tự chạy ở lần chạm đầu tiên vào trang.
  var btn = document.getElementById('sound'), fbtn = document.getElementById('sfx'), want = true, wantFx = true;
  try { want = localStorage.getItem('a07-sound') !== 'off'; wantFx = localStorage.getItem('a07-sfx') !== 'off'; } catch (e) {}
  function ensureCtx() {
    if (ac) return true;
    var AC = window.AudioContext || window.webkitAudioContext; if (!AC) { if (btn) btn.disabled = true; if (fbtn) fbtn.disabled = true; return false; }
    // hai nút riêng (Clair 24/11): master = tiếng hiệu ứng (tương tác, năng lực, lật thẻ), musicG = nhạc nền theo cảnh
    ac = new AC(); master = gain(wantFx ? 0.5 : 0); musicG = gain(want ? 0.5 : 0);
    var comp = ac.createDynamicsCompressor(); master.connect(comp); musicG.connect(comp); comp.connect(ac.destination);
    bed = gain(bedLevel); bed.connect(musicG); // tiếng nền đi qua đây để tương tác "giữ im lặng" hạ được nó
    return true;
  }
  function ramp(node, v, secs) { if (!node) return; var n = ac.currentTime; node.gain.cancelScheduledValues(n); node.gain.setValueAtTime(node.gain.value, n); node.gain.linearRampToValueAtTime(v, n + secs); }
  function startSound() { if ((!want && !wantFx) || !ensureCtx()) return; if (!playing) { playing = true; ac.resume(); curKey = null; } switchTo(sceneNow()); }
  function stopMusic() {
    if (ac && current) {
      var n = ac.currentTime, old = current; current = null;
      old.g.gain.cancelScheduledValues(n); old.g.gain.setValueAtTime(old.g.gain.value, n); old.g.gain.linearRampToValueAtTime(0, n + 0.6);
      setTimeout(function () { old.stops.forEach(function (f) { try { f(); } catch (e) {} }); old.g.disconnect(); }, 800);
    }
    curKey = null;
  }
  function show() { if (btn) btn.setAttribute('aria-pressed', want); if (fbtn) fbtn.setAttribute('aria-pressed', wantFx); }
  show();
  function firstGesture(e) {
    if ((btn && (e.target === btn || btn.contains(e.target))) || (fbtn && (e.target === fbtn || fbtn.contains(e.target)))) return; // bấm thẳng vào nút thì để nút xử lý
    ['pointerdown', 'keydown', 'touchend'].forEach(function (t) { removeEventListener(t, firstGesture, true); });
    if (want || wantFx) startSound();
  }
  ['pointerdown', 'keydown', 'touchend'].forEach(function (t) { addEventListener(t, firstGesture, true); });
  // Nhạc nền: bật/tắt riêng, nhớ qua các chương
  if (btn) btn.onclick = function () {
    if (want && !playing) { startSound(); return; } // đang bật mà chưa phát: lần bấm này để phát
    want = !want;
    try { localStorage.setItem('a07-sound', want ? 'on' : 'off'); } catch (e) {}
    show();
    if (want) { startSound(); ramp(musicG, 0.5, 0.6); } else { ramp(musicG, 0, 0.6); stopMusic(); if (!wantFx) playing = false; }
  };
  // Tiếng hiệu ứng (tương tác, năng lực, lật thẻ): bật/tắt riêng, nhớ qua các chương
  if (fbtn) fbtn.onclick = function () {
    wantFx = !wantFx;
    try { localStorage.setItem('a07-sfx', wantFx ? 'on' : 'off'); } catch (e) {}
    show();
    if (wantFx) { startSound(); ramp(master, 0.5, 0.2); if (window.a07sfx) setTimeout(function () { window.a07sfx('nudge'); }, 250); } else { ramp(master, 0, 0.2); if (!want) playing = false; }
  };
  document.addEventListener('visibilitychange', function () { if (ac && playing) document.hidden ? ac.suspend() : ac.resume(); });
  /* ---------- tương tác người đọc (chèn vào cuối fx.js khi dựng; dùng chung ac, master, bed, playing) ----------
     Khai báo ở "acts" trong scenes.json: {"at": "chữ đầu đoạn", "act": "..."}
       lock    = khối ổ khoá chèn trước đoạn (hoặc sau, "where": "after"); chạm và giữ "hold" giây thì bật mở.
                 "kind": "steel" (khoá sắt, run lên rồi bật) | "bronze" (khoá đồng cũ, lẫy sáng dần từng cái)
       glass   = khối bức tường kính chèn trước đoạn; áp tay giữ thì băng lan ra từ đúng chỗ ngón tay
       still   = từ đoạn này: tắt tiếng nền, tiếng chân lệt sệt đi ngang; cuộn/chạm thì chân khựng lại, để yên thì đi tiếp
       still-end = đoạn trả tiếng nền về
       notify  = một thông báo mờ trượt xuống từ mép trên rồi tắt (chữ nhoè, không đọc được)
       count   = con số ở góc màn hình ("n"), hiện từ đoạn này; count-off = đoạn số tắt
     Luật: chạm hay không cũng đọc tiếp được, không chặn cuộn; tiếng chỉ phát khi người đọc đang bật tiếng. */
  (function () {
    var locks = [].slice.call(document.querySelectorAll('.act-lock'));
    var glasses = [].slice.call(document.querySelectorAll('.act-glass'));
    var marks = [].slice.call(document.querySelectorAll('.scene p[data-act]'));
    if (!locks.length && !glasses.length && !marks.length) return;
    function has(p, k) { return (' ' + p.getAttribute('data-act') + ' ').indexOf(' ' + k + ' ') >= 0; }
    function find(k) { return marks.filter(function (p) { return has(p, k); }); }
    function el(tag, cls, html) { var e = document.createElement(tag); e.className = cls; if (html) e.innerHTML = html; e.setAttribute('aria-hidden', 'true'); document.body.appendChild(e); return e; }
    function live() { return playing && ac && ac.state === 'running'; }

    /* ---- tiếng ---- */
    var wbuf = null;
    function white() { if (wbuf) return wbuf; var len = ac.sampleRate, b = ac.createBuffer(1, len, ac.sampleRate), d = b.getChannelData(0); for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1; return (wbuf = b); }
    function out(v, pan) { var g = gain(v); if (pan != null && ac.createStereoPanner) { var p = ac.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, pan)); g.connect(p); p.connect(master); } else g.connect(master); return g; }
    function burst(o, type, f, q, v, dur, at) {
      var s = ac.createBufferSource(); s.buffer = white(); var fl = filt(type, f, q), g = gain(0), n = at || ac.currentTime;
      g.gain.setValueAtTime(0.0001, n); g.gain.linearRampToValueAtTime(v, n + Math.min(0.012, dur / 4)); g.gain.exponentialRampToValueAtTime(0.0001, n + dur);
      s.connect(fl); fl.connect(g); g.connect(o); s.start(n, Math.random() * 0.5); s.stop(n + dur + 0.03);
    }
    function tone(o, type, f0, f1, v, dur, at) {
      var x = ac.createOscillator(), g = gain(0), n = at || ac.currentTime; x.type = type;
      x.frequency.setValueAtTime(f0, n); x.frequency.exponentialRampToValueAtTime(f1, n + dur);
      g.gain.setValueAtTime(v, n); g.gain.exponentialRampToValueAtTime(0.0001, n + dur);
      x.connect(g); g.connect(o); x.start(n); x.stop(n + dur + 0.02);
    }
    // "cạch": khoá sắt kêu sáng và gọn; khoá đồng cũ kêu "tách" đục hơn
    function clack(heavy) {
      if (!live()) return; var o = out(1), n = ac.currentTime;
      burst(o, 'bandpass', heavy ? 1700 : 3000, 3, 0.7, 0.035, n); tone(o, 'triangle', heavy ? 650 : 1400, heavy ? 280 : 620, 0.14, 0.06, n);
      burst(o, 'bandpass', heavy ? 1100 : 2300, 4, 0.45, 0.05, n + 0.075); tone(o, 'triangle', heavy ? 2900 : 3600, heavy ? 2600 : 3300, 0.6, 0.05, n + 0.075);
    }
    function pinTick(i) { if (live()) { var o = out(1); tone(o, 'triangle', 2300 + i * 210, 1700 + i * 210, 0.05, 0.03); burst(o, 'highpass', 5000, 1, 0.05, 0.015); } }
    function rattle(v) { if (live()) burst(out(1), 'bandpass', 3000 + Math.random() * 1800, 7, v, 0.025); }
    function setBed(v, secs) {
      bedLevel = v; if (!ac || !bed) return; var n = ac.currentTime;
      bed.gain.cancelScheduledValues(n); bed.gain.setValueAtTime(bed.gain.value, n); bed.gain.linearRampToValueAtTime(v, n + secs);
    }

    /* ---- 1. ổ khoá: chạm và giữ ---- */
    locks.forEach(function (box) {
      var btn = box.querySelector('.lockbtn'), svg = btn.querySelector('svg'), need = parseFloat(box.getAttribute('data-hold')) || 1.5;
      var bronze = box.classList.contains('bronze'), pins = [].slice.call(box.querySelectorAll('.pins rect'));
      var t0 = 0, raf = 0, done = false, lastR = 0, sx = 0, sy = 0, holding = false;
      function jitter(a) { var t = performance.now(); svg.style.setProperty('--jx', (Math.sin(t / 15) * a).toFixed(2) + 'px'); svg.style.setProperty('--jy', (Math.cos(t / 23) * a * 0.5).toFixed(2) + 'px'); }
      function setP(p) {
        box.style.setProperty('--p', p.toFixed(3));
        if (bronze) {
          jitter(p > 0 ? 0.4 + p * 0.8 : 0);
          box.classList.toggle('sense', p > 0);
          pins.forEach(function (r, i) {
            var on = p > (i + 1) / (pins.length + 1);
            if (on && !r.classList.contains('on')) { r.classList.add('on'); pinTick(i); }
            else if (!on) r.classList.remove('on');
          });
        } else jitter(p * p * 3.4);
      }
      function loop(now) {
        if (!holding) return;
        var p = Math.min(1, (now - t0) / 1000 / need); setP(p);
        if (!bronze && now - lastR > 110 - p * 75) { lastR = now; rattle(0.04 + 0.22 * p); }
        if (p >= 1) open(true); else raf = requestAnimationFrame(loop);
      }
      function open(sound) {
        if (done) return; done = true; holding = false; cancelAnimationFrame(raf);
        svg.style.removeProperty('--jx'); svg.style.removeProperty('--jy');
        if (bronze) pins.forEach(function (r) { r.classList.add('on'); });
        box.classList.remove('holding'); box.classList.add('done'); if (!sound) box.classList.add('quiet');
        btn.setAttribute('aria-label', 'Ổ khoá đã mở');
        if (sound) { clack(bronze); if (window.a07cast) window.a07cast(true); if (window.a07shot) setTimeout(function () { window.a07shot('keyburst'); }, 250); if (window.a07power) { var tp = box.nextElementSibling; if (!tp || tp.tagName !== 'P') tp = box.previousElementSibling; window.a07power(tp, 'clevia', 250); } }
      }
      function down(e) {
        if (done || (e.button && e.button > 0)) return;
        holding = true; t0 = performance.now(); sx = e.clientX; sy = e.clientY;
        box.classList.add('holding'); raf = requestAnimationFrame(loop);
      }
      function up() { if (done || !holding) return; holding = false; cancelAnimationFrame(raf); box.classList.remove('holding'); setP(0); }
      btn.addEventListener('pointerdown', down);
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (t) { btn.addEventListener(t, up); });
      btn.addEventListener('pointermove', function (e) { if (holding && Math.abs(e.clientY - sy) + Math.abs(e.clientX - sx) > 16) up(); });
      btn.addEventListener('contextmenu', function (e) { e.preventDefault(); });
      btn.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(true); } });
    });

    /* ---- 1. bức tường kính: áp tay giữ ---- */
    glasses.forEach(function (box) {
      var cv = box.querySelector('canvas'), g2 = cv.getContext('2d'), w = 0, h = 0, R = [], i;
      for (i = 0; i < 160; i++) R.push(Math.random());
      var prints = [], hold = null, touched = false, vis = false, raf = 0, hiss = null, crk = 0;
      function fit() { var d = Math.min(devicePixelRatio || 1, 2), r = cv.getBoundingClientRect(); w = r.width; h = r.height; cv.width = Math.round(w * d); cv.height = Math.round(h * d); g2.setTransform(d, 0, 0, d, 0, 0); }
      fit(); addEventListener('resize', function () { fit(); draw(performance.now()); });
      function scenery(t) {
        // bên kia bức tường: bãi đất đêm, rõ từng viên sỏi; không có bóng ai in lên
        var sky = g2.createLinearGradient(0, 0, 0, h * 0.5);
        sky.addColorStop(0, C.dark ? '#0b1215' : '#33414a'); sky.addColorStop(1, C.dark ? '#1b2629' : '#5b6a6c');
        g2.fillStyle = sky; g2.fillRect(0, 0, w, h);
        var gr = g2.createLinearGradient(0, h * 0.42, 0, h); gr.addColorStop(0, C.dark ? '#1a2020' : '#4a524c'); gr.addColorStop(1, C.dark ? '#262b27' : '#636a5f');
        g2.fillStyle = gr; g2.fillRect(0, h * 0.42, w, h * 0.58);
        g2.fillStyle = C.dark ? '#0d1314' : '#2e3a3c'; g2.beginPath(); g2.moveTo(0, h * 0.42);
        for (var x = 0; x <= w; x += w / 24) g2.lineTo(x, h * (0.36 + 0.05 * Math.sin(x / w * 5 + 1) + 0.02 * Math.sin(x / w * 13))); g2.lineTo(w, h * 0.42); g2.fill();
        for (var k = 0; k < 70; k++) {
          var v = R[k + 80], y = h * (0.46 + v * v * 0.52), s = (2 + R[k] * 5) * (0.4 + v * 1.3), px = R[(k * 7) % 160] * w;
          g2.fillStyle = C.dark ? '#3a403b' : '#7b8174'; g2.beginPath(); g2.ellipse(px, y, s * 1.4, s * 0.8, 0, 0, 7); g2.fill();
          g2.fillStyle = C.dark ? 'rgba(200,210,200,.22)' : 'rgba(235,240,228,.5)'; g2.beginPath(); g2.ellipse(px - s * 0.3, y - s * 0.3, s * 0.7, s * 0.3, 0, 0, 7); g2.fill();
        }
        // mặt kính: lạnh, trơn, một vệt sáng trượt rất chậm
        g2.fillStyle = 'rgba(190,220,235,.06)'; g2.fillRect(0, 0, w, h);
        var sx = ((t / 9000) % 1.6 - 0.3) * w, sh = g2.createLinearGradient(sx, 0, sx + w * 0.3, h);
        sh.addColorStop(0, 'rgba(255,255,255,0)'); sh.addColorStop(0.5, 'rgba(255,255,255,.07)'); sh.addColorStop(1, 'rgba(255,255,255,0)');
        g2.fillStyle = sh; g2.fillRect(0, 0, w, h);
      }
      function palm(x, y, a, sc) {
        g2.save(); g2.translate(x, y); g2.scale(sc, sc); g2.fillStyle = 'rgba(232,244,250,' + (0.34 * a).toFixed(3) + ')';
        g2.shadowColor = 'rgba(232,244,250,' + (0.6 * a).toFixed(3) + ')'; g2.shadowBlur = 14;
        g2.beginPath(); g2.ellipse(0, 22, 30, 34, 0, 0, 7); g2.fill();
        [[-21, -22, -0.18], [-7, -30, -0.05], [8, -29, 0.05], [22, -20, 0.18]].forEach(function (f) { g2.beginPath(); g2.ellipse(f[0], f[1], 6.5, 17, f[2], 0, 7); g2.fill(); });
        g2.beginPath(); g2.ellipse(-36, 22, 6.5, 15, -0.9, 0, 7); g2.fill();
        g2.restore();
      }
      function frost(pr, age, fade) {
        var maxL = Math.max(w, h) * 0.75, L = maxL * Math.pow(age, 0.7);
        var hz = g2.createRadialGradient(pr.x, pr.y, 0, pr.x, pr.y, Math.max(1, L * 0.9));
        hz.addColorStop(0, 'rgba(225,240,248,' + (0.28 * fade) + ')'); hz.addColorStop(1, 'rgba(225,240,248,0)');
        g2.fillStyle = hz; g2.fillRect(0, 0, w, h);
        g2.strokeStyle = 'rgba(240,250,255,' + (0.55 * fade) + ')'; g2.lineWidth = 1; g2.lineCap = 'round';
        for (var b = 0; b < 13; b++) {
          var ang = b / 13 * 6.283 + pr.R[b] * 0.4, len = L * (0.55 + pr.R[b + 13] * 0.45), x = pr.x, y = pr.y, segs = 9;
          g2.beginPath(); g2.moveTo(x, y);
          for (var s = 1; s <= segs; s++) {
            var d = len / segs, a2 = ang + (pr.R[(b * 9 + s) % 60] - 0.5) * 0.5; x += Math.cos(a2) * d; y += Math.sin(a2) * d; g2.lineTo(x, y);
            if (s % 2 === 0 && s < segs) { var sl = d * (1.2 + pr.R[(b + s * 3) % 60]), sa = a2 + (s % 4 ? 0.7 : -0.7); g2.moveTo(x, y); g2.lineTo(x + Math.cos(sa) * sl, y + Math.sin(sa) * sl); g2.moveTo(x, y); }
          }
          g2.stroke();
        }
      }
      function draw(now) {
        g2.clearRect(0, 0, w, h); scenery(now);
        for (var k = prints.length - 1; k >= 0; k--) {
          var pr = prints[k], end = pr.t1 || now, age = Math.min(1, (end - pr.t0) / pr.grow), fade = pr.t1 ? Math.max(0, 1 - (now - pr.t1) / 6000) : 1;
          if (fade <= 0) { prints.splice(k, 1); continue; }
          frost(pr, age, fade);
          palm(pr.x, pr.y, Math.min(1, (end - pr.t0) / 350) * fade, Math.min(1.2, w / 380));
        }
      }
      function loop(now) { draw(now); if (hold && live() && now > crk) { crk = now + 60 + Math.random() * 220; burst(out(1), 'highpass', 4500 + Math.random() * 3000, 2, 0.05, 0.02); } if (vis || prints.length) raf = requestAnimationFrame(loop); else raf = 0; }
      function kick() { if (!raf) raf = requestAnimationFrame(loop); }
      new IntersectionObserver(function (es) { vis = es[0].isIntersecting; if (vis) kick(); }).observe(box);
      function rnd() { var a = []; for (var j = 0; j < 60; j++) a.push(Math.random()); return a; }
      function startHiss() {
        if (!live() || hiss) return; var s = ac.createBufferSource(); s.buffer = white(); s.loop = true; var f = filt('highpass', 5500, 0.7), g = gain(0), n = ac.currentTime;
        g.gain.setValueAtTime(0, n); g.gain.linearRampToValueAtTime(0.05, n + 0.6); s.connect(f); f.connect(g); g.connect(master); s.start();
        tone(out(1), 'sine', 1900, 1500, 0.03, 0.9); hiss = { s: s, g: g };
      }
      function stopHiss() { if (!hiss) return; var hs = hiss, n = ac.currentTime; hiss = null; hs.g.gain.cancelScheduledValues(n); hs.g.gain.setValueAtTime(hs.g.gain.value, n); hs.g.gain.linearRampToValueAtTime(0, n + 0.8); setTimeout(function () { try { hs.s.stop(); } catch (e) {} }, 900); }
      var sx = 0, sy = 0;
      cv.addEventListener('pointerdown', function (e) {
        var r = cv.getBoundingClientRect(); touched = true; box.classList.add('done'); sx = e.clientX; sy = e.clientY;
        if (hold) hold.t1 = performance.now();
        hold = { x: e.clientX - r.left, y: e.clientY - r.top, t0: performance.now(), t1: 0, grow: 2600, R: rnd() }; prints.push(hold);
        startHiss(); kick();
      });
      function up() { if (!hold) return; hold.t1 = performance.now(); hold = null; stopHiss(); }
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (t) { cv.addEventListener(t, up); });
      cv.addEventListener('pointermove', function (e) { if (hold && Math.abs(e.clientY - sy) + Math.abs(e.clientX - sx) > 16) up(); });
      cv.addEventListener('contextmenu', function (e) { e.preventDefault(); });
      draw(performance.now());
    });

    /* ---- 2. giữ im lặng ---- */
    var stillP = find('still')[0], stillEnd = find('still-end')[0];
    if (stillP) (function () {
      var cv = el('canvas', 'act-layer'), g3 = cv.getContext('2d'), W = 0, H = 0;
      var shade = el('div', 'act-shade'), hint = el('div', 'act-still-hint', 'giữ yên');
      function fit() { var d = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; cv.width = Math.round(W * d); cv.height = Math.round(H * d); g3.setTransform(d, 0, 0, d, 0, 0); }
      fit(); addEventListener('resize', fit);
      var on = false, prog = 0, lastIn = 0, lastF = 0, nextStep = 0, foot = 0, steps = [], shadeLv = 0, running = false, wasFrozen = true, hintT = [];
      function input() { if (on) lastIn = performance.now(); }
      ['scroll', 'pointerdown', 'wheel', 'keydown', 'touchmove'].forEach(function (t) { addEventListener(t, input, { passive: true }); });
      function zone() { var m = innerHeight * 0.55; return stillP.getBoundingClientRect().top < m && (!stillEnd || stillEnd.getBoundingClientRect().top > m); }
      function begin() {
        on = true; prog = 0; lastIn = performance.now(); nextStep = 0; wasFrozen = true; setBed(0.05, 1.6);
        hintT.forEach(clearTimeout); hintT = [setTimeout(function () { if (on) hint.classList.add('on'); }, 900), setTimeout(function () { hint.classList.remove('on'); }, 5200)];
        kick();
      }
      function end() { on = false; setBed(1, 3); hint.classList.remove('on'); hintT.forEach(clearTimeout); }
      addEventListener('scroll', function () { var z = zone(); if (z && !on) begin(); else if (!z && on) end(); }, { passive: true });
      function squelch(pan, v) {
        if (!live()) return; var o = out(1, pan), n = ac.currentTime;
        burst(o, 'lowpass', 520, 1, v, 0.2, n); burst(o, 'bandpass', 340 + Math.random() * 120, 2.5, v * 0.8, 0.16, n + 0.02); burst(o, 'bandpass', 1100, 1.2, v * 0.35, 0.05, n + 0.05);
      }
      function chew(pan, v) {
        if (!live()) return; var o = out(1, pan), n = ac.currentTime, k = 3 + Math.floor(Math.random() * 3);
        for (var j = 0; j < k; j++) burst(o, 'bandpass', 1200 + Math.random() * 700, 7, v * (0.6 + Math.random() * 0.4), 0.06 + Math.random() * 0.05, n + j * (0.16 + Math.random() * 0.1));
      }
      function step(now) {
        var x = W * (0.06 + 0.88 * prog) + (Math.random() - 0.5) * 14, y = H * 0.84 + (foot ? 13 : -13) + (Math.random() - 0.5) * 6;
        steps.push({ x: x, y: y, t: now, rot: Math.PI / 2 + (Math.random() - 0.5) * 0.5, left: foot }); foot = 1 - foot;
        var near = Math.sin(Math.PI * prog), pan = -0.9 + 1.8 * prog;
        squelch(pan, 0.04 + 0.42 * Math.pow(near, 1.3));
        if (near > 0.6 && Math.random() < 0.18) setTimeout(function () { chew(pan, 0.05 * near); }, 200);
      }
      function footprint(s, a) {
        var k = Math.min(W, H) / 420; g3.save(); g3.translate(s.x, s.y); g3.rotate(s.rot); g3.scale(k * (s.left ? -1 : 1), k);
        g3.fillStyle = (C.dark ? 'rgba(4,6,5,' : 'rgba(40,36,28,') + (0.42 * a).toFixed(3) + ')';
        g3.beginPath(); g3.ellipse(0, 4, 6.5, 12, 0.08, 0, 7); g3.fill(); g3.beginPath(); g3.ellipse(1, 15, 5, 5.5, 0, 0, 7); g3.fill();
        [[-4.5, -10.5, 2.6], [-0.8, -12.5, 2.1], [2.4, -12, 1.9], [5, -10.5, 1.7], [7, -8, 1.5]].forEach(function (t) { g3.beginPath(); g3.arc(t[0], t[1], t[2], 0, 7); g3.fill(); });
        g3.restore();
      }
      function kick() { if (!running) { running = true; lastF = performance.now(); requestAnimationFrame(frame); } }
      function frame(now) {
        var dt = Math.min(0.1, (now - lastF) / 1000); lastF = now;
        var frozen = now - lastIn < (prog === 0 ? 2200 : 4200);
        if (on && prog < 1) {
          if (!frozen) {
            prog = Math.min(1, prog + dt / 13);
            if (now >= nextStep) { step(now); nextStep = now + 430 + Math.random() * 520 + (Math.random() < 0.2 ? 450 : 0); }
          } else if (!wasFrozen && prog > 0.1 && prog < 0.95) {
            // chân khựng lại; ngoài ruộng chỉ còn một tiếng ươn ướt
            var p0 = prog; setTimeout(function () { if (on) chew(-0.9 + 1.8 * p0, 0.04 * Math.sin(Math.PI * p0) + 0.01); }, 700);
          }
          wasFrozen = frozen;
        }
        var target = on ? (frozen && prog > 0 && prog < 1 ? 0.6 : 0.24) : 0;
        shadeLv += (target - shadeLv) * (target > shadeLv ? 0.12 : 0.03); shade.style.opacity = shadeLv.toFixed(3);
        g3.clearRect(0, 0, W, H);
        for (var j = steps.length - 1; j >= 0; j--) {
          if (!on) steps[j].t -= 90; // hết đoạn: dấu chân tan nhanh hơn
          var a = 1 - (now - steps[j].t) / 7000; if (a <= 0) { steps.splice(j, 1); continue; }
          footprint(steps[j], Math.min(1, (now - steps[j].t) / 150) * a);
        }
        if (on || shadeLv > 0.005 || steps.length) requestAnimationFrame(frame); else { running = false; shade.style.opacity = 0; g3.clearRect(0, 0, W, H); }
      }
      if (zone()) begin();
    })();

    /* ---- 3. màn hình thành đồ vật trong truyện ---- */
    var notes = find('notify');
    if (notes.length) (function () {
      var bn = el('div', 'act-notify', '<span class="ic"></span><span class="tx"><span class="ln" style="width:38%"></span><span class="ln" style="width:86%"></span><span class="ln" style="width:62%"></span></span>');
      var tm = 0;
      notes.forEach(function (p) { p._armed = true; });
      function check() {
        notes.forEach(function (p) {
          var top = p.getBoundingClientRect().top;
          if (p._armed && top < innerHeight * 0.6 && top > -innerHeight) {
            p._armed = false; clearTimeout(tm); bn.classList.add('on');
            if (live()) { var o = out(1); tone(o, 'sine', 180, 160, 0.12, 0.18); tone(o, 'sine', 180, 160, 0.1, 0.18, ac.currentTime + 0.26); } // máy đang để rung trong túi
            tm = setTimeout(function () { bn.classList.remove('on'); }, 2600);
          } else if (!p._armed && top > innerHeight * 0.95) p._armed = true;
        });
      }
      addEventListener('scroll', check, { passive: true }); check();
    })();

    var counts = marks.filter(function (p) { return has(p, 'count') || has(p, 'count-off'); });
    if (counts.length) (function () {
      var box = el('div', 'act-count'), shown = null;
      function check() {
        var m = innerHeight * 0.55, cur = null;
        counts.forEach(function (p) { if (p.getBoundingClientRect().top < m) cur = has(p, 'count') ? p.getAttribute('data-n') : null; });
        if (cur === shown) return;
        if (cur != null && shown != null) { box.classList.add('swap'); setTimeout(function () { box.textContent = cur; box.classList.remove('swap'); }, 450); }
        else if (cur != null) box.textContent = cur;
        box.classList.toggle('on', cur != null); shown = cur;
      }
      addEventListener('scroll', check, { passive: true }); check();
    })();
  })();

  /* tên riêng lần đầu trong chương loé sáng khi cuộn tới */
  (function () {
    var fs = [].slice.call(document.querySelectorAll('.nm.first'));
    if (!fs.length || !window.IntersectionObserver) return;
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('lit'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -30% 0px' });
    fs.forEach(function (n) { io.observe(n); });
  })();

  /* tiếng cho các tương tác và khoảnh khắc động: lật thẻ, chia thẻ, thẻ tan, xích (gọi window.a07sfx(tên)) */
  (function () {
    var wb = null;
    function white() { if (wb) return wb; var len = ac.sampleRate, b = ac.createBuffer(1, len, ac.sampleRate), d = b.getChannelData(0); for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1; return (wb = b); }
    function nz(o, type, f0, f1, q, v, dur, at) {
      var s = ac.createBufferSource(); s.buffer = white(); var fl = filt(type, f0, q), g = gain(0), n = at;
      fl.frequency.setValueAtTime(f0, n); fl.frequency.exponentialRampToValueAtTime(f1, n + dur);
      g.gain.setValueAtTime(0.0001, n); g.gain.linearRampToValueAtTime(v, n + Math.min(0.03, dur / 3)); g.gain.exponentialRampToValueAtTime(0.0001, n + dur);
      s.connect(fl); fl.connect(g); g.connect(o); s.start(n, Math.random() * 0.5); s.stop(n + dur + 0.05);
    }
    function sine(o, f, v, dur, at, type) { var x = ac.createOscillator(), g = gain(0); x.type = type || 'sine'; x.frequency.value = f; g.gain.setValueAtTime(v, at); g.gain.exponentialRampToValueAtTime(0.0001, at + dur); x.connect(g); g.connect(o); x.start(at); x.stop(at + dur + 0.05); }
    function clank(o, at, v) { [523, 1371, 2307, 3790].forEach(function (f, i) { sine(o, f * (0.95 + Math.random() * 0.1), v * [0.5, 0.35, 0.22, 0.12][i], 0.25 + 0.35 / (i + 1), at); }); nz(o, 'bandpass', 2600, 1800, 2, v * 1.6, 0.06, at); nz(o, 'highpass', 5000, 7000, 1, v * 0.8, 0.03, at); }
    function clink(o, at, v) { sine(o, 2400 + Math.random() * 1800, v, 0.12, at, 'triangle'); }
    /* bộ tiếng "anime": vang dài (convolver), bão hoà cho cú nổ dày, tiếng dồn lên trước cú đánh */
    var busD = null, busW = null, sat = null;
    function bus() {
      if (busD) return;
      var len = Math.floor(ac.sampleRate * 2.8), ir = ac.createBuffer(2, len, ac.sampleRate);
      for (var c = 0; c < 2; c++) { var d = ir.getChannelData(c); for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
      var cv = ac.createConvolver(); cv.buffer = ir;
      busD = gain(1); busW = gain(0.55); busD.connect(master); busW.connect(cv); cv.connect(master);
      sat = ac.createWaveShaper(); var cu = new Float32Array(1024); for (var k = 0; k < 1024; k++) { var x = k / 512 - 1; cu[k] = Math.tanh(x * 3.2); } sat.curve = cu;
      var sg = gain(0.8); sat.connect(sg); sg.connect(busD); sg.connect(busW);
    }
    function wet(v) { var g = gain(v); g.connect(busD); g.connect(busW); return g; }   // có vang
    function hard(v) { var g = gain(v); g.connect(sat); return g; }                    // bão hoà + vang
    // tiếng dồn lên: nhiễu quét lên cao + âm cưa trượt lên, kết thúc đúng lúc cú đánh tới
    function riser(o, at, dur, v) {
      var s = ac.createBufferSource(); s.buffer = white(); var f = filt('bandpass', 300, 1.5), g = gain(0.0001);
      f.frequency.setValueAtTime(300, at); f.frequency.exponentialRampToValueAtTime(7000, at + dur);
      g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(v, at + dur * 0.95); g.gain.linearRampToValueAtTime(0, at + dur + 0.02);
      s.connect(f); f.connect(g); g.connect(o); s.start(at); s.stop(at + dur + 0.05);
      var x = ac.createOscillator(), xg = gain(0.0001); x.type = 'sawtooth'; x.frequency.setValueAtTime(260, at); x.frequency.exponentialRampToValueAtTime(1600, at + dur);
      var lp = filt('lowpass', 3200); xg.gain.setValueAtTime(0.0001, at); xg.gain.exponentialRampToValueAtTime(v * 0.25, at + dur * 0.95); xg.gain.linearRampToValueAtTime(0, at + dur + 0.02);
      x.connect(lp); lp.connect(xg); xg.connect(o); x.start(at); x.stop(at + dur + 0.05);
    }
    // cú đánh: không dùng tiếng trầm kiểu trống (Clair không ưa) — chỉ có tiếng nứt sắc, kim loại toé và ngân
    function boom(at, v) {
      bus(); var o = wet(v);
      nz(o, 'highpass', 2500, 6000, 0.8, 0.5, 0.18, at);                     // nứt sắc
      nz(o, 'bandpass', 3800, 1600, 3, 0.35, 0.3, at + 0.01);               // rít kim loại
      [2093, 3136, 4699].forEach(function (f, i) { sine(o, f * (0.98 + Math.random() * 0.04), 0.12 / (i + 1), 0.9 - i * 0.2, at, 'triangle'); });
    }
    function whoosh(at, dur, v, up) { bus(); nz(wet(v), 'bandpass', up ? 400 : 4000, up ? 4000 : 300, 1.6, 1, dur, at); }
    // tiếng kim loại ngân dài kiểu "shiiing"
    function shing(at, v, base) {
      bus(); var o = wet(v), b = base || 1;
      [1180, 2950, 4720, 6330, 8100].forEach(function (f, i) { sine(o, f * b * (0.98 + Math.random() * 0.04), [0.35, 0.3, 0.2, 0.12, 0.08][i], 1.6 - i * 0.2, at); });
      nz(o, 'highpass', 6000, 9000, 1, 0.5, 0.25, at);
    }
    function sparkle(at, v, notes) { bus(); var o = wet(v); (notes || [1568, 2093, 2637, 3136, 4186]).forEach(function (f, i) { sine(o, f, 0.4, 0.9, at + i * 0.045); }); }
    function heavyClank(at, v) { bus(); clank(wet(v), at, 1); boom(at, v * 0.6); }
    var S = {
      flip: function (o, n) { nz(o, 'bandpass', 900, 3400, 1.2, 0.22, 0.2, n); nz(o, 'lowpass', 900, 400, 1, 0.3, 0.06, n + 0.17); },
      // nhật ký hệ thống ghi thêm một dòng: hai tiếng bíp số cao, khẽ
      log: function (o, n) { [2349, 3136].forEach(function (f, i) { var x = ac.createOscillator(), g = gain(0), t = n + i * 0.07; x.type = 'sine'; x.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.035, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18); x.connect(g); g.connect(o); x.start(t); x.stop(t + 0.2); }); },
      deal: function (o, n) { for (var i = 0; i < 3; i++) nz(o, 'bandpass', 700, 2600, 1, 0.18, 0.24, n + i * 0.25); },
      dissolve: function (o, n) { nz(o, 'highpass', 3000, 7000, 0.7, 0.07, 1.8, n); [1568, 1175, 880].forEach(function (f, i) { sine(o, f, 0.03, 1.2, n + i * 0.2); }); },
      // dấu kích hoạt (vòng tròn rối): tiếng dồn lên 0,85 giây rồi loé một cái, nối thẳng vào hiệu ứng năng lực
      cast: function (o, n) { bus(); riser(wet(1), n, 0.85, 0.35); sparkle(n + 0.05, 0.05, [2637, 3136, 3951]); whoosh(n + 0.7, 0.3, 0.3, true); },
      chains: function (o, n) {
        bus(); whoosh(n, 0.4, 0.5, false);                                       // bóng tối sập xuống (không dùng tiếng ầm trầm: Clair nghe như trống, 24/11)
        nz(wet(1), 'bandpass', 1200, 6000, 7, 0.6, 0.45, n + 0.02);              // xích rít lên
        whoosh(n + 0.05, 0.35, 0.5, true);
        for (var c = 0; c < 5; c++) clank(wet(1), n + 0.34 + c * 0.075, 0.16);    // đập trúng từng sợi: tiếng kim loại, không tiếng ầm
        shing(n + 0.5, 0.12, 0.6);
        for (var k = 0; k < 16; k++) clink(wet(1), n + 0.9 + k * (0.1 + Math.random() * 0.12), 0.05 * (1 - k / 16)); // căng rung
        whoosh(n + 5.05, 0.5, 0.6, false); nz(wet(1), 'bandpass', 5000, 1200, 5, 0.4, 0.5, n + 5.1); // giật ngược về
        for (var j = 0; j < 12; j++) clink(wet(1), n + 5.1 + j * 0.04, 0.05);
      },
      anomaly: function (o, n) {
        bus(); whoosh(n, 0.6, 0.5, false); nz(wet(1), 'lowpass', 3000, 400, 1, 0.5, 0.7, n);  // âm thanh xung quanh bị hút mất
        sine(wet(1), 5400, 0.02, 4.3, n + 0.1);                                   // ù tai: thời gian ngừng
        // (bỏ tiếng tim đập: Clair nghe như tiếng trống, 24/11; trang vẫn đập theo nhịp tim bằng hình)
        [0.35, 1.35, 2.35].forEach(function (w) { var og = wet(0.2); sine(og, 1320, 0.5, 1.2, n + w); sine(og, 1980, 0.25, 1, n + w); whoosh(n + w, 0.9, 0.2, false); }); // sóng dò "ping"
        var x = ac.createOscillator(), g2 = gain(0), st = n + 1.0, hg = hard(0.6); x.type = 'sawtooth'; x.frequency.value = 85; var lp = filt('bandpass', 1300, 1.5);
        g2.gain.setValueAtTime(0, st); g2.gain.linearRampToValueAtTime(0.3, st + 0.03);
        for (var q = 0; q < 26; q++) g2.gain.setValueAtTime(q % 2 ? 0.02 : 0.3, st + 0.05 + q * 0.055);   // giật nhoè
        g2.gain.linearRampToValueAtTime(0, st + 3); x.connect(lp); lp.connect(g2); g2.connect(hg); x.start(st); x.stop(st + 3.1);
        shing(st, 0.1, 0.5);
      },
      shatter: function (o, n) { bus(); boom(n, 0.4); for (var k = 0; k < 18; k++) { var at = n + Math.random() * 0.5; sine(wet(0.6), 2500 + Math.random() * 4500, 0.06 + Math.random() * 0.05, 0.3 + Math.random() * 0.5, at, 'triangle'); } nz(wet(1), 'highpass', 3000, 8000, 1, 0.5, 0.4, n); },
      claw: function (o, n) { bus(); nz(wet(1), 'bandpass', 3800, 1600, 6, 0.35, 0.18, n); sine(wet(0.3), 4200, 0.08, 0.3, n, 'triangle'); },
      nudge: function (o, n) { nz(o, 'highpass', 5000, 8000, 0.7, 0.03, 0.5, n); sine(o, 2637, 0.012, 0.35, n + 0.05); sine(o, 3520, 0.008, 0.4, n + 0.12); },
      // ch12: trần sập (đá vỡ ào ào, gãy giòn; không ầm trầm), xích cứu người, thẻ Remedy vỡ thành ánh sáng
      cavein: function (o, n) { nz(o, 'bandpass', 2600, 1400, 2, 0.5, 0.12, n); bus(); for (var k = 0; k < 26; k++) { var st = n + 0.1 + k * (0.03 + Math.random() * 0.07); nz(wet(0.6), 'bandpass', 600 + Math.random() * 1800, 400, 1.5, 0.25 * (1 - k / 30), 0.09 + Math.random() * 0.1, st); } nz(wet(0.5), 'highpass', 2500, 1200, 0.7, 0.25, 3, n + 0.3); },
      // xích cứu người (Clair chốt hướng 1): cùng bộ tiếng kim loại sáng của xích tấn công nhưng nhẹ, không nhát đập nặng:
      // tiếng xích lướt, leng keng trong trẻo khi vòng ôm khép lại, một tiếng ngân dài mềm, lúc rút về leng keng thưa dần
      rescue: function (o, n) {
        bus(); whoosh(n, 0.6, 0.3, true); nz(wet(0.6), 'bandpass', 1500, 4500, 5, 0.25, 0.6, n + 0.05);
        for (var k = 0; k < 10; k++) clink(wet(0.8), n + 0.45 + k * 0.06, 0.04 * (1 - k / 14));
        shing(n + 0.85, 0.07, 0.8); sparkle(n + 0.9, 0.03, [1568, 2093, 2637]);
        whoosh(n + 3.1, 0.6, 0.25, false); for (var j = 0; j < 8; j++) clink(wet(0.6), n + 3.15 + j * (0.07 + Math.random() * 0.05), 0.03 * (1 - j / 10));
      },
      rescuehold: function (o, n) {
        bus(); whoosh(n, 0.6, 0.3, true); nz(wet(0.6), 'bandpass', 1500, 4500, 5, 0.25, 0.6, n + 0.05);
        for (var k = 0; k < 10; k++) clink(wet(0.8), n + 0.45 + k * 0.06, 0.04 * (1 - k / 14));
        shing(n + 0.85, 0.06, 0.7);
        for (var c = 0; c < 22; c++) clink(wet(0.6), n + 1.4 + c * (0.12 + Math.random() * 0.1), 0.02 + 0.03 * (c / 22));   // căng rung, mỗi lúc một gắt
        nz(wet(0.3), 'bandpass', 2600, 3400, 6, 0.05, 3.6, n + 1.3);
      },
      rescuedrop: function (o, n) {
        bus(); nz(wet(0.6), 'bandpass', 4000, 1500, 4, 0.2, 0.4, n + 0.6);
        for (var k = 0; k < 14; k++) clink(wet(0.7), n + 1 + k * (0.06 + Math.random() * 0.09), 0.045 * (1 - k / 18));   // mắt xích rơi lách cách xuống nền đá
      },
      remedy: function (o, n) { bus(); sparkle(n, 0.05, [1046, 1318, 1568, 2093, 2637]); nz(wet(0.6), 'bandpass', 2000, 5000, 1, 0.12, 1.6, n + 0.2); [523, 659, 784].forEach(function (f, i) { sine(wet(0.5), f, 0.05, 2.4, n + 0.3 + i * 0.12); }); },
      // ch13: mực loang trên giấy thấm, Clevia lần tìm trong mình (không có gì), mặt kính loé lửa lò, gió cuốn tro, Leon bước sang chắn
      ink: function (o, n) { nz(o, 'lowpass', 1800, 500, 1, 0.12, 0.9, n); sine(o, 1760, 0.018, 0.9, n + 0.1); sine(o, 2349, 0.012, 1.1, n + 0.35); },
      seek: function (o, n) { bus(); [880, 1175, 1318].forEach(function (f, i) { sine(wet(0.5), f, 0.03, 1.4, n + 0.3 + i * 0.5); }); nz(wet(0.4), 'highpass', 4000, 2000, 1, 0.05, 2.6, n); },
      glint: function (o, n) { bus(); sine(wet(0.6), 3951, 0.05, 0.5, n); sine(wet(0.6), 5274, 0.03, 0.4, n + 0.03); nz(o, 'highpass', 6000, 9000, 1, 0.06, 0.15, n); },
      ashwind: function (o, n) { nz(o, 'bandpass', 600, 2400, 0.8, 0.22, 2.4, n); nz(o, 'highpass', 3000, 6000, 1, 0.08, 2, n + 0.4); },
      stepin: function (o, n) { nz(o, 'lowpass', 1600, 700, 1, 0.2, 0.12, n); for (var k = 0; k < 6; k++) clink(o, n + 0.08 + k * 0.05, 0.03); },
      // ch14: tiếng chuông (nhỏ lúc đầu như thìa gõ thành bát, rồi ngân dài, cao, không âm trầm), đốm đỏ tắt, đèn tắt phụt, mắt mở
      bellwave: function (o, n) { bus(); var w = wet(1); [880, 1397, 2093, 2960, 3951].forEach(function (f, i) { var x = ac.createOscillator(), g2 = gain(0); x.frequency.value = f * (0.997 + Math.random() * 0.006); g2.gain.setValueAtTime(0.0001, n); g2.gain.exponentialRampToValueAtTime([0.05, 0.035, 0.025, 0.015, 0.01][i], n + 0.02); g2.gain.exponentialRampToValueAtTime(0.0001, n + 6.5 - i * 0.9); x.connect(g2); g2.connect(w); x.start(n); x.stop(n + 6.6); }); sine(wet(0.6), 5274, 0.02, 0.3, n); swell(wet(0.5), n + 0.3, 2.4, 0.04, 4000); },
      eyesout: function (o, n) { for (var k = 0; k < 10; k++) sine(o, 1600 - k * 70, 0.012, 0.25, n + 0.8 + k * 0.35, 'triangle'); },
      lampout: function (o, n) { nz(o, 'bandpass', 900, 1600, 1, 0.05, 0.3, n); nz(o, 'bandpass', 900, 1600, 1, 0.04, 0.25, n + 0.6); nz(o, 'highpass', 2500, 1200, 1, 0.12, 0.35, n + 1.05); },
      manyeyes: function (o, n) { bus(); for (var k = 0; k < 18; k++) nz(wet(0.5), 'bandpass', 2600 + Math.random() * 2000, 1800, 6, 0.04, 0.08, n + 0.6 + k * 0.14); sine(wet(0.4), 3136, 0.02, 1.6, n + 4.6); sine(wet(0.4), 3322, 0.02, 1.6, n + 4.6); },
      // ch15 (combat xịn hơn): chân ghế "cạch" rồi mấy chục con mắt cùng chao (tiếng lách tách ướt), xích tuột, xích quăng, nó chạy, khiên Guard vỡ, bàn tay nước, nước đổ ụp, đá nứt xa, xích dựng đứng, lá rơi
      eyesfollow: function (o, n) { nz(o, 'bandpass', 1800, 1400, 3, 0.25, 0.05, n + 0.05); bus(); for (var k = 0; k < 16; k++) nz(wet(0.4), 'bandpass', 3000 + Math.random() * 2500, 2000, 8, 0.05, 0.04, n + 0.7 + k * 0.012); sine(wet(0.3), 3322, 0.015, 1.4, n + 0.75); },
      slip: function (o, n) { bus(); nz(wet(0.6), 'bandpass', 4200, 1200, 3, 0.3, 0.35, n); for (var k = 0; k < 18; k++) clink(wet(0.7), n + 0.3 + k * (0.05 + Math.random() * 0.08), 0.045 * (1 - k / 22)); },
      yank: function (o, n) { bus(); whoosh(n, 0.25, 0.45, true); for (var k = 0; k < 10; k++) clink(wet(0.8), n + 0.22 + k * 0.03, 0.05); riser(wet(1), n + 0.3, 0.75, 0.28); whoosh(n + 0.4, 0.65, 0.5, false); boom(n + 1.05, 0.55); nz(hard(0.5), 'highpass', 2500, 7000, 0.8, 0.5, 0.1, n + 1.05); for (var c = 0; c < 14; c++) clink(wet(0.6), n + 1.4 + c * (0.06 + Math.random() * 0.07), 0.035 * (1 - c / 16)); },
      rush: function (o, n) { bus(); for (var k = 0; k < 46; k++) { var at = n + k * 0.05 * (1 - k / 80); sine(wet(0.5), 3200 + Math.random() * 2400, 0.012 + k * 0.0009, 0.25, at); } riser(wet(1), n + 0.2, 2.2, 0.2); for (var s = 0; s < 8; s++) nz(o, 'lowpass', 1200, 600, 1, 0.08 + s * 0.015, 0.12, n + 0.3 + s * 0.28); },
      guardbreak: function (o, n) { bus(); swell(wet(1), n, 0.25, 0.25, 3000); sparkle(n + 0.05, 0.04, [1568, 2093, 2637]); whoosh(n + 0.45, 0.3, 0.4, true); var h = n + 0.75; nz(hard(0.6), 'highpass', 2000, 8000, 0.8, 0.7, 0.12, h); [1240, 1975, 2830, 3720].forEach(function (f, i) { sine(wet(0.8), f * (0.98 + Math.random() * 0.04), 0.1 / (i + 1), 1.1 - i * 0.2, h, 'triangle'); }); for (var c = 0; c < 8; c++) nz(wet(0.4), 'bandpass', 4500, 3000, 6, 0.08, 0.05, h + 0.12 + c * 0.07); S.shatter(o, n + 1.45); sparkle(n + 1.6, 0.05, [3136, 3951, 4699, 5274, 6272]); },
      waterhand: function (o, n) { bus(); nz(wet(0.8), 'bandpass', 300, 2600, 0.9, 0.35, 1.2, n); for (var b = 0; b < 30; b++) { var at = n + 0.2 + Math.random() * 1.2, f0 = 500 + Math.random() * 900, x = ac.createOscillator(), g2 = gain(0); x.frequency.setValueAtTime(f0, at); x.frequency.exponentialRampToValueAtTime(f0 * 1.8, at + 0.06); g2.gain.setValueAtTime(0.03, at); g2.gain.exponentialRampToValueAtTime(0.0001, at + 0.08); x.connect(g2); g2.connect(o); x.start(at); x.stop(at + 0.1); } for (var k = 0; k < 8; k++) sine(o, 3400 + Math.random() * 1800, 0.02 * (1 - k / 8), 0.12, n + 1.2 + k * 0.07); nz(wet(0.6), 'lowpass', 2400, 500, 0.8, 0.3, 0.5, n + 1.2); for (var i = 0; i < 3; i++) { var st = n + 1.8 + i * 2.85; nz(wet(0.5), 'bandpass', 500, 1400, 0.8, 0.12, 1.4, st); nz(wet(0.5), 'bandpass', 1400, 500, 0.8, 0.1, 1.4, st + 1.4); } },
      splash: function (o, n) { bus(); nz(wet(1), 'bandpass', 2400, 600, 0.6, 0.6, 0.9, n + 0.35); nz(o, 'highpass', 3000, 6000, 0.8, 0.25, 0.4, n + 0.4); for (var d = 0; d < 20; d++) { var at = n + 0.6 + Math.random() * 0.9, f0 = 900 + Math.random() * 1400, x = ac.createOscillator(), g2 = gain(0); x.frequency.setValueAtTime(f0, at); x.frequency.exponentialRampToValueAtTime(f0 * 0.6, at + 0.08); g2.gain.setValueAtTime(0.025, at); g2.gain.exponentialRampToValueAtTime(0.0001, at + 0.1); x.connect(g2); g2.connect(o); x.start(at); x.stop(at + 0.12); } },
      crackfar: function (o, n) { [0.3, 2.2].forEach(function (d, i) { var v = i ? 0.06 : 0.1; nz(o, 'highpass', 2200, 3000, 0.8, v, 0.1, n + d); for (var k = 0; k < 5; k++) sine(o, 700 + Math.random() * 600, v * 0.25, 0.05, n + d + 0.12 + k * 0.08, 'triangle'); }); },
      bind15: function (o, n) { bus(); for (var r = 0; r < 3; r++) { whoosh(n + r * 0.22, 0.3, 0.45, r % 2 === 0); nz(wet(0.8), 'bandpass', 1400 + r * 500, 6000, 7, 0.4, 0.3, n + r * 0.22 + 0.02); } for (var c = 0; c < 18; c++) clink(wet(0.7), n + 0.5 + c * 0.04, 0.05); nz(wet(0.5), 'bandpass', 2600, 3400, 8, 0.07, 1.6, n + 1.3); for (var k = 0; k < 10; k++) clink(wet(0.5), n + 1.4 + k * 0.16, 0.03); sparkle(n + 1.22, 0.03, [2093, 2637, 3136]); },
      bristle: function (o, n) { bus(); nz(wet(0.6), 'bandpass', 1500, 5000, 4, 0.25, 0.3, n); for (var k = 0; k < 24; k++) clink(wet(0.6), n + 0.25 + k * 0.1, 0.02 + 0.01 * Math.sin(k)); nz(wet(0.3), 'bandpass', 3000, 3300, 9, 0.05, 2.6, n + 0.3); },
      leaf: function (o, n) { nz(o, 'bandpass', 3000, 4500, 1.5, 0.04, 1.2, n + 0.2); nz(o, 'bandpass', 2600, 3800, 2, 0.05, 0.08, n + 3.6); sine(o, 2637, 0.008, 1.2, n + 3.65); },
      msg: function (o, n) { sine(o, 1320, 0.04, 0.12, n); sine(o, 1760, 0.035, 0.15, n + 0.06); },
      // Góc nhìn khác ch05: tay bà Mabel làm dịu (mấy tiếng tách nhanh thưa dần, một hợp âm mềm lắng xuống; không tiếng trầm)
      soothe: function (o, n) { bus(); var at = n; for (var k = 0; k < 14; k++) { nz(o, 'bandpass', 2600, 2200, 5, 0.05 * (1 - k / 16), 0.04, at); at += 0.11 + k * 0.035; } [880, 1108.7, 1318.5].forEach(function (f, i) { sine(wet(0.5), f, 0.03, 3.2, n + 0.8 + i * 0.12); }); nz(wet(0.4), 'lowpass', 2400, 800, 0.7, 0.05, 3, n + 0.6); },
      // Felix chớp mắt đổi chỗ (Chuyển hoá): hai nhát hút gió rất ngắn, mỗi nhát kèm một tiếng "póc" khô và lấp lánh mảnh
      blink: function (o, n) { bus(); [0.25, 1.05].forEach(function (d) { whoosh(n + d - 0.06, 0.14, 0.35, true); nz(o, 'highpass', 3500, 6500, 1, 0.2, 0.05, n + d + 0.08); sparkle(n + d + 0.09, 0.025, [2637, 3520]); }); },
      // Góc nhìn khác ch11, Mira (Vein): một tiếng lướt mỏng như tờ giấy dầu, rồi nhịp tách đều như kim đồng hồ (không tiếng trầm)
      vein: function (o, n) { bus(); nz(wet(0.5), 'bandpass', 1800, 4200, 1.2, 0.08, 0.9, n); for (var k = 0; k < 5; k++) { nz(o, 'bandpass', 2400, 2400, 6, 0.06, 0.03, n + 0.9 + k * 1.1); sine(o, 1760, 0.012, 0.05, n + 0.9 + k * 1.1); } sine(wet(0.4), 987.8, 0.02, 2.2, n + 0.4); },
      creep: function (o, n) { for (var k = 0; k < 22; k++) clink(o, n + k * (0.12 + Math.random() * 0.2), 0.018); nz(o, 'lowpass', 300, 120, 1, 0.25, 6, n + 3); }
    };
    /* tiếng năng lực Clevia (Clair chốt 24/11: kiểu anime "A3"): tiếng dồn ngược, mỗi vòng khoá khớp là một nhát "kshing" kèm lấp lánh,
       cú mở là ánh sáng loé lên rồi tan thành chuỗi lấp lánh đi lên, không có cú nổ. Nhịp khớp hình trong moments.js:
       vòng khoá cạch ở 0.6 / 0.85 / 1.1 / 1.6 giây, tia lỗ khoá ở 1.9 giây; bản ngắn (keyburst) bật ở 0.15 giây. Không tiếng trầm, không tiếng chuông. */
    function swell(o, at, dur, v, f) { var s = ac.createBufferSource(); s.buffer = white(); var fl = filt('highpass', f || 2500, 0.7), g = gain(0.0001); g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(v, at + dur); g.gain.setValueAtTime(0.0001, at + dur + 0.01); s.connect(fl); fl.connect(g); g.connect(o); s.start(at); s.stop(at + dur + 0.05); }
    function slash(at, v, base) { whoosh(at, 0.18, v, true); nz(wet(v), 'highpass', 3000, 9000, 0.8, 0.6, 0.12, at + 0.12); shing(at + 0.12, v * 0.5, base || 1); }
    S.keysense = function (o, n) {
      bus(); swell(wet(1), n, 0.6, 0.25); riser(wet(1), n + 0.15, 1.6, 0.22);
      [0.6, 0.85, 1.1, 1.6].forEach(function (d, k) { slash(n + d - 0.12, 0.16 + k * 0.03, 0.8 + k * 0.12); sparkle(n + d + 0.02, 0.03 + k * 0.01, [2093 + k * 200, 3136 + k * 300, 4186 + k * 300]); });
      swell(wet(1), n + 1.25, 0.5, 0.35, 3500);
      S.keyburst(o, n + 1.75);
    };
    S.keyburst = function (o, n) { bus(); var t = n + 0.15; nz(hard(0.4), 'highpass', 3000, 8000, 0.8, 0.6, 0.06, t); whoosh(t, 0.5, 0.5, true); sparkle(t + 0.02, 0.07, [2637, 3136, 3951, 4699, 5274, 6272]); nz(wet(1), 'highpass', 6000, 10000, 0.7, 0.12, 1.0, t + 0.1); };
    // đá tự trượt mở (năng lực Clevia, vẫn kiểu A3 nhưng không có cú cạch nào: một lượt xoay ngân dài, rồi đá trượt êm sang hai bên, khe nắng loé ra thành chuỗi lấp lánh)
    S.stoneopen = function (o, n) {
      bus(); swell(wet(1), n, 0.6, 0.22); riser(wet(1), n + 0.3, 1.6, 0.18);
      shing(n + 1.2, 0.09, 0.62); sparkle(n + 1.25, 0.03, [1568, 2093, 2637]); swell(wet(1), n + 1.3, 0.7, 0.3, 3500);
      [-1, 1].forEach(function (side, i) { var p = ac.createStereoPanner ? ac.createStereoPanner() : null, g2 = gain(1); if (p) { p.pan.value = side * 0.7; g2.connect(p); p.connect(busD); p.connect(busW); } else { g2.connect(busD); } nz(g2, 'bandpass', 700, 1600, 1.2, 0.22, 1.1, n + 2 + i * 0.12); });
      S.keyburst(o, n + 2.0); sparkle(n + 2.6, 0.05, [2637, 3136, 3951, 4699, 5274, 6272, 7040]);
    };
    /* ---- tiếng bộ chiêu ba nhân vật (chieu.js). L = độ dài (giãn nhịp), KP = độ mạnh (to/nhỏ). Không tiếng trầm, không trống. ---- */
    var KP = 1;
    function kw(v) { return wet(v * KP); }
    // băng tên chiêu chém qua: một nhát gió ngắn + tiếng kim loại mảnh
    function cutSnd(at, base) { whoosh(at, 0.16, 0.4 * KP, true); nz(kw(0.6), 'highpass', 4000, 9000, 0.8, 0.35, 0.1, at + 0.1); shing(at + 0.1, 0.05 * KP, base || 1.3); }
    S['leon-strike'] = function (o, n, L) {
      bus(); var T = function (x) { return n + x * L; };
      cutSnd(T(0.02), 1.1);
      riser(kw(1), T(0.05), 0.7 * L, 0.3);
      for (var k = 0; k < 12; k++) clink(kw(0.8), T(0.05 + k * 0.055), 0.03 + k * 0.002);     // xích rung lách cách ở góc
      for (var c = 0; c < 4; c++) { whoosh(T(0.72 + c * 0.03), 0.22, 0.45 * KP, c % 2 === 0); nz(kw(0.8), 'bandpass', 1400 + c * 400, 6500, 7, 0.4, 0.25, T(0.72 + c * 0.03)); }
      var h = T(0.95); boom(h, 0.6 * KP); nz(hard(0.6 * KP), 'highpass', 2500, 8000, 0.8, 0.6, 0.12, h); clank(kw(1), h, 0.22); clank(kw(1), h + 0.04, 0.16); shing(h + 0.05, 0.14 * KP, 0.62);
      for (var j = 0; j < 18; j++) clink(kw(0.6), T(1.2) + j * (0.07 + Math.random() * 0.06), 0.045 * (1 - j / 20)); // căng rung
      whoosh(T(2.75), 0.45, 0.5 * KP, false); nz(kw(0.8), 'bandpass', 5000, 1300, 5, 0.35, 0.45, T(2.78));       // giật ngược về
      for (var q = 0; q < 10; q++) clink(kw(0.6), T(2.8) + q * 0.04, 0.045);
    };
    S['leon-rescue'] = function (o, n, L) {
      bus(); var T = function (x) { return n + x * L; };
      cutSnd(T(0.05), 1.1);
      whoosh(T(0.4), 0.7 * L, 0.3 * KP, true); nz(kw(0.6), 'bandpass', 1500, 4500, 5, 0.22, 0.7 * L, T(0.45));
      for (var k = 0; k < 12; k++) clink(kw(0.8), T(0.6 + k * 0.06), 0.035 * (1 - k / 16));
      shing(T(1.3), 0.07 * KP, 0.8); sparkle(T(1.32), 0.035 * KP, [1568, 2093, 2637, 3136]);
      for (var c = 0; c < 8; c++) clink(kw(0.5), T(1.8 + c * 0.2), 0.02);
      whoosh(T(3.6), 0.6, 0.25 * KP, false); for (var j = 0; j < 9; j++) clink(kw(0.6), T(3.65) + j * (0.07 + Math.random() * 0.05), 0.03 * (1 - j / 11));
    };
    S['luke-sense'] = function (o, n, L) {
      bus(); var T = function (x) { return n + x * L; };
      whoosh(n, 0.55, 0.45 * KP, false); nz(kw(1), 'lowpass', 3000, 400, 1, 0.45, 0.6, n);   // tiếng xung quanh bị hút mất
      cutSnd(T(0.06), 1.5);
      sine(kw(1), 5400, 0.018, 3.4 * L, T(0.15));                                             // ù tai: thời gian ngừng
      [0.6, 1.05, 1.5].forEach(function (w, i) { var og = kw(0.25); sine(og, 1320 + i * 220, 0.45, 1.1, T(w)); sine(og, 1980 + i * 330, 0.22, 0.9, T(w)); whoosh(T(w), 0.7, 0.18 * KP, false); }); // sóng dò
      var h = T(1.55); slash(h - 0.12, 0.2 * KP, 1.4); sine(kw(0.6), 3951, 0.06, 0.6, h); sine(kw(0.6), 5274, 0.04, 0.5, h + 0.03); // góc ngắm sập vào
      sparkle(T(2.15), 0.035 * KP, [4699, 3951, 3520, 2960, 2637]);                          // sương giá mọc
      nz(kw(0.4), 'highpass', 6000, 9000, 1, 0.06, 1.6 * L, T(2.2));
    };
    S['luke-protect'] = function (o, n, L) {
      bus(); var T = function (x) { return n + x * L; };
      cutSnd(T(0.04), 1.5);
      swell(kw(1), n, 0.45 * L, 0.2, 3000);
      for (var k = 0; k < 16; k++) sine(kw(0.6), 2800 + k * 160 + Math.random() * 200, 0.025, 0.25, T(0.45 + k * 0.022), 'triangle'); // vỏ lục giác bung ra từng ô
      shing(T(0.8), 0.1 * KP, 1.25); sparkle(T(0.82), 0.04 * KP, [2637, 3136, 3951, 4699]);
      var h = T(1.1); nz(kw(1), 'bandpass', 3800, 1600, 6, 0.35, 0.16, h - 0.1); nz(hard(0.5 * KP), 'highpass', 2500, 8000, 0.8, 0.5, 0.1, h);
      [1975, 2960, 3951].forEach(function (f, i) { sine(kw(0.8), f, 0.08 / (i + 1), 0.9, h, 'triangle'); });
      for (var c = 0; c < 6; c++) nz(kw(0.4), 'bandpass', 4800, 3000, 6, 0.06, 0.05, h + 0.1 + c * 0.06);   // vết nứt chạy
      for (var j = 0; j < 16; j++) sine(kw(0.5), 3200 + Math.random() * 3800, 0.03 + Math.random() * 0.03, 0.3 + Math.random() * 0.4, T(2.8) + Math.random() * 0.7 * L, 'triangle'); // mảnh băng rã
    };
    // bản thử B: cận cảnh mắt Luke (chieu.js luke-eye). Băng xẻ mở: gió mảnh; loé: tiếng pha lê sắc + vòng ngân; chấm đỏ: hai tiếng tíc cao.
    S['luke-eye'] = function (o, n, L) {
      bus(); var T = function (x) { return n + x * L; };
      whoosh(n, 0.3, 0.3 * KP, true); nz(kw(0.6), 'highpass', 5000, 9000, 0.8, 0.2, 0.18, n + 0.02);
      swell(kw(1), T(0.2), 0.6 * L, 0.18, 2600);
      var h = T(0.9); slash(h - 0.1, 0.18 * KP, 1.6); shing(h, 0.12 * KP, 1.5);
      [2637, 3951, 5274].forEach(function (f, i) { sine(kw(0.7), f, 0.07 / (i + 1), 1.2 * L, h + i * 0.015, 'triangle'); });
      sparkle(h + 0.05, 0.04 * KP, [5274, 4699, 3951, 3136]);
      [0.95, 1.31, 1.67].forEach(function (w, i) { sine(kw(0.3), 1760 + i * 220, 0.18, 0.6, T(w)); });
      sine(kw(0.5), 6272, 0.05, 0.12, T(1.38)); sine(kw(0.5), 6272, 0.05, 0.12, T(1.5));
      whoosh(T(2.45), 0.3, 0.22 * KP, false);
    };
    S['luke-eye-sense'] = function (o, n, L) { S['luke-eye'](o, n, L); S['luke-sense'](o, n + 2.3 * L, L); };
    // bản thử B: cận cảnh mắt Leon (chieu.js leon-eye). Băng mở: gió mảnh + xích lách cách khẽ; loé: xích quất, cạch khoá, tiếng thép ngân; giật về.
    S['leon-eye'] = function (o, n, L) {
      bus(); var T = function (x) { return n + x * L; };
      whoosh(n, 0.3, 0.28 * KP, true); nz(kw(0.6), 'highpass', 5000, 9000, 0.8, 0.18, 0.18, n + 0.02);
      for (var k = 0; k < 4; k++) clink(kw(0.5), T(0.35 + k * 0.11), 0.02);
      var h = T(0.95); whoosh(h - 0.06, 0.2, 0.4 * KP, true); whoosh(h - 0.02, 0.2, 0.35 * KP, false);
      clank(kw(1), h, 0.2); clank(kw(1), h + 0.05, 0.14); shing(h + 0.02, 0.13 * KP, 0.7); nz(hard(0.4 * KP), 'highpass', 2500, 8000, 0.8, 0.4, 0.1, h);
      for (var j = 0; j < 10; j++) clink(kw(0.5), h + 0.15 + j * 0.06, 0.035 * (1 - j / 12));
      sine(kw(0.4), 3136, 0.05, 0.5, T(1.25), 'triangle');
      whoosh(T(1.9), 0.3, 0.3 * KP, false); for (var q = 0; q < 6; q++) clink(kw(0.5), T(1.95) + q * 0.04, 0.035);
      whoosh(T(2.45), 0.3, 0.2 * KP, false);
    };
    S['leon-eye-trong'] = S['leon-eye'];
    S['leon-eye-toc'] = S['leon-eye'];
    S['leon-eye-strike'] = function (o, n, L) { S['leon-eye'](o, n, L); S['leon-strike'](o, n + 2.3 * L, L); };
    ['chains', 'yank', 'bristle'].forEach(function (k) { S['leon-eye-' + k] = function (o, n, L) { S['leon-eye'](o, n, L); S[k](o, n + 2.3 * L); }; });
    S['leon-eye-rescue'] = function (o, n, L) { S['leon-eye'](o, n, L); S['leon-rescue'](o, n + 2.3 * L, L); };
    S['clevia-unlock'] = function (o, n, L) {
      bus(); var T = function (x) { return n + x * L; };
      cutSnd(T(0.04), 0.9);
      swell(kw(1), n, 0.6 * L, 0.25); riser(kw(1), T(0.15), 1.6 * L, 0.22);
      [0.6, 0.85, 1.1, 1.6].forEach(function (d, k) { slash(T(d) - 0.12, (0.16 + k * 0.03) * KP, 0.8 + k * 0.12); sparkle(T(d) + 0.02, (0.03 + k * 0.01) * KP, [2093 + k * 200, 3136 + k * 300, 4186 + k * 300]); });
      swell(kw(1), T(1.25), 0.5 * L, 0.35, 3500);
      S.keyburst(o, T(1.75)); sparkle(T(2.2), 0.05 * KP, [2637, 3136, 3951, 4699, 5274, 6272, 7040]);
    };
    // bản thử B: cận cảnh ổ khoá Clevia (chieu.js clevia-lock). Băng mở: gió mảnh; nét vẽ hiện: tiếng dồn mảnh; mỗi chốt: "tách" kim loại cao + kshing + lấp lánh
    // (kiểu A3, cao dần từng chốt); chốt thứ tư gượng: tiếng lách tách run rất nhỏ; xoay 1,9: nhát chém sáng + chuỗi lấp lánh. Không tiếng trầm.
    S['clevia-lock'] = function (o, n, L) {
      bus(); var T = function (x) { return n + x * L; };
      whoosh(n, 0.3, 0.28 * KP, true); swell(kw(1), T(0.12), 0.45 * L, 0.18, 3200);
      for (var j = 0; j < 7; j++) nz(kw(0.25), 'bandpass', 5200, 3000, 8, 0.1, 0.03, T(1.16 + j * 0.05));
      [0.6, 0.85, 1.1, 1.6].forEach(function (d, k) {
        var h = T(d); nz(kw(0.9), 'bandpass', 4200 + k * 400, 2600, 9, 0.5, 0.04, h); nz(hard(0.35 * KP), 'highpass', 3500, 9000, 0.8, 0.3, 0.05, h);
        sine(kw(0.6), 2093 * Math.pow(1.19, k), 0.07, 0.5, h + 0.01, 'triangle');
        shing(h + 0.02, (0.06 + k * 0.015) * KP, 1 + k * 0.15); sparkle(h + 0.03, (0.025 + k * 0.01) * KP, [2637 + k * 200, 3136 + k * 300, 4186 + k * 300]);
      });
      var t = T(1.9); slash(t - 0.1, 0.2 * KP, 1.4); S.keyburst(o, t - 0.15); sparkle(T(2.15), 0.05 * KP, [2637, 3136, 3951, 4699, 5274, 6272]);
      whoosh(T(2.45), 0.3, 0.2 * KP, false);
    };
    S['clevia-lock-unlock'] = function (o, n, L) { S['clevia-lock'](o, n, L); sparkle(n + 2.6 * L, 0.05 * KP, [3136, 3951, 4699, 5274, 6272, 7040]); nz(kw(0.6), 'highpass', 6000, 10000, 0.7, 0.12, 0.9, n + 2.65 * L); };
    window.a07sfx = function (name, op) {
      if (!S[name] || !playing || !ac || ac.state !== 'running') return;
      op = op || {}; KP = Math.max(0.3, Math.min(1.6, op.pow || 1));
      try { var o = gain(KP); o.connect(master); S[name](o, ac.currentTime, op.len || 1); } catch (e) { if (window.console) console.warn('a07sfx', name, e); }
      KP = 1;
    };
  })();

  /* làm nổi các chỗ chạm được (khoá, kính, thẻ lật, thẻ hệ) để người đọc lướt nhanh không bỏ qua:
     nhịp tròn đập tới khi chạm; lần đầu cuộn tới thì vật đó loé lên một cái kèm tiếng "tinh" nhỏ */
  (function () {
    var groups = [];
    [].forEach.call(document.querySelectorAll('.act-lock'), function (b) { groups.push([b, b.querySelector('.lockbtn')]); });
    [].forEach.call(document.querySelectorAll('.act-glass'), function (b) { groups.push([b, b]); });
    [].forEach.call(document.querySelectorAll('.act-rub, .act-ribbon, .act-cv'), function (b) { groups.push([b, b]); });
    [].forEach.call(document.querySelectorAll('.act-press'), function (b) { groups.push([b, b.querySelector('.pressbtn')]); });
    [].forEach.call(document.querySelectorAll('.card-fig'), function (b) { groups.push([b, b.querySelector('.card')]); });
    [].forEach.call(document.querySelectorAll('.type-row'), function (b) {
      var h = document.createElement('span'); h.className = 'row-hint'; h.textContent = 'chạm để lật'; h.setAttribute('aria-hidden', 'true'); b.parentNode.insertBefore(h, b.nextSibling);
      groups.push([b, b.querySelector('.tcard')]);
    });
    if (!groups.length) return;
    groups.forEach(function (gp) {
      var box = gp[0], host = gp[1]; if (!host) return;
      host.classList.add('tap-host');
      var d = document.createElement('span'); d.className = 'tapdot'; d.setAttribute('aria-hidden', 'true'); d.innerHTML = '<i></i>'; host.appendChild(d);
      box.addEventListener('pointerdown', function () { box.classList.add('touched'); var h = box.nextSibling; if (h && h.className === 'row-hint') h.classList.add('touched'); }, { passive: true });
    });
    /* lướt qua mà chưa chạm: không tự làm thay người đọc (Clair 24/11, tự xong thấy hụt hẫng). Thay vào đó hiện một nhắc nhỏ ở mép dưới,
       chạm vào thì cuộn ngược về đúng chỗ; mỗi chỗ chỉ nhắc một lần, không chặn đọc tiếp. */
    (function () {
      // nhắc không chữ (Clair chốt 24/11 kiểu B + A): mép trên hắt sáng màu đèn như ánh lọt xuống, cùng đốm đèn có mũi nhọn chỉ lên ở mép dưới
      var pill = document.createElement('button'); pill.type = 'button'; pill.className = 'act-missed nv-a'; pill.setAttribute('aria-label', 'Quay lại chỗ vừa lướt qua'); pill.innerHTML = '<i></i>';
      var glow = document.createElement('button'); glow.type = 'button'; glow.className = 'act-missed nv-b'; glow.setAttribute('aria-label', 'Quay lại chỗ vừa lướt qua');
      document.body.appendChild(pill); document.body.appendChild(glow);
      var target = null, tm = 0;
      function show(on) { pill.classList.toggle('on', on); glow.classList.toggle('on', on); }
      function back() { if (!target) return; var r = target.getBoundingClientRect(); scrollBy({ top: r.top - innerHeight * 0.3, behavior: 'smooth' }); show(false); }
      pill.addEventListener('click', back); glow.addEventListener('click', back);
      addEventListener('scroll', function () {
        groups.forEach(function (gp) {
          var b = gp[0]; if (b._reminded || b.classList.contains('touched') || b.classList.contains('done')) return;
          var r = b.getBoundingClientRect(); if (r.bottom < 0 && r.bottom > -innerHeight * 1.5) { b._reminded = true; target = b; show(true); if (window.a07sfx) window.a07sfx('nudge'); clearTimeout(tm); tm = setTimeout(function () { show(false); }, 5000); }
        });
        if (target && pill.classList.contains('on')) { var tr = target.getBoundingClientRect(); if (tr.bottom > 0) show(false); }
      }, { passive: true });
    })();
    if (!window.IntersectionObserver) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return; io.unobserve(e.target);
        if (e.target.classList.contains('touched') || e.target.classList.contains('done')) return;
        var h = e.target._host; h.classList.remove('nudge'); void h.offsetWidth; h.classList.add('nudge');
        if (playing && ac && ac.state === 'running') { try { var o = gain(1); o.connect(master); [1760, 2637].forEach(function (f, i) { var x = ac.createOscillator(), g = gain(0), n = ac.currentTime + i * 0.09; x.frequency.value = f; g.gain.setValueAtTime(0.03, n); g.gain.exponentialRampToValueAtTime(0.0001, n + 0.6); x.connect(g); g.connect(o); x.start(n); x.stop(n + 0.65); }); } catch (er) {} }
      });
    }, { rootMargin: '0px 0px -35% 0px' });
    groups.forEach(function (gp) { if (gp[1]) { gp[0]._host = gp[1]; io.observe(gp[0]); } });
  })();

  /* ch03: tin nhắn thành bong bóng. Tin của Luke có dấu ba chấm "đang gõ" trước khi hiện. */
  (function () {
    var ms = [].slice.call(document.querySelectorAll('.scene p[data-act~="msg-in"], .scene p[data-act~="msg-out"]'));
    if (!ms.length) return;
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    ms.forEach(function (p) {
      var inn = / msg-in /.test(' ' + p.getAttribute('data-act') + ' ');
      p.classList.add('msg', inn ? 'in' : 'out');
      // bỏ ngoặc kép hai đầu: đã là bong bóng tin nhắn
      var w = document.createTreeWalker(p, NodeFilter.SHOW_TEXT), first = w.nextNode(), last = first, t;
      while ((t = w.nextNode())) last = t;
      if (first) first.nodeValue = first.nodeValue.replace(/^\s*[“"]/, '');
      if (last) last.nodeValue = last.nodeValue.replace(/[”"]\s*$/, '');
    });
    if (reduce || !window.IntersectionObserver) { ms.forEach(function (p) { p.classList.add('show'); }); return; }
    function pop() { if (window.a07sfx) window.a07sfx('msg'); }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return; var p = e.target; io.unobserve(p);
        if (p.classList.contains('in')) {
          var d = document.createElement('span'); d.className = 'dots'; d.setAttribute('aria-hidden', 'true'); d.innerHTML = '<i></i><i></i><i></i>';
          p.parentNode.insertBefore(d, p);
          setTimeout(function () { d.remove(); p.classList.add('show'); pop(); }, 1100);
        } else { p.classList.add('show'); pop(); }
      });
    }, { rootMargin: '0px 0px -22% 0px' });
    ms.forEach(function (p) { io.observe(p); });
  })();

  /* ch11: miết tay ngang qua chấn song gỉ để lộ những vết xước còn mới, sáng loáng */
  (function () {
    var boxes = [].slice.call(document.querySelectorAll('.act-rub'));
    boxes.forEach(function (box) {
      var cv = box.querySelector('canvas'), g = cv.getContext('2d'), mk = document.createElement('canvas'), mg = mk.getContext('2d'), w = 0, h = 0, R = [], i;
      for (i = 0; i < 200; i++) R.push(Math.random());
      var bars = 6, scr = [], touched = false, lastX = null, lastY = null, scrape = null, revealed = 0, raf = 0;
      function build() {
        scr = [];
        for (var k = 0; k < 46; k++) {
          var y = h * (0.3 + R[k] * 0.4), x = w * (0.05 + R[k + 50] * 0.8), len = w * (0.08 + R[k + 100] * 0.28), a = (R[k + 150] - 0.5) * (k % 5 === 0 ? 2.2 : 0.5);
          scr.push([x, y, x + Math.cos(a) * len, y + Math.sin(a) * len, 0.8 + R[(k * 3) % 200] * 1.8]);
        }
      }
      function fit() { var d = Math.min(devicePixelRatio || 1, 2), r = cv.getBoundingClientRect(); w = r.width; h = r.height; cv.width = Math.round(w * d); cv.height = Math.round(h * d); g.setTransform(d, 0, 0, d, 0, 0); mk.width = Math.round(w); mk.height = Math.round(h); build(); draw(); }
      function draw() {
        // miệng hầm tối phía sau
        var bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, C.dark ? '#0b0d0e' : '#2a2f30'); bg.addColorStop(1, C.dark ? '#050606' : '#151819');
        g.fillStyle = bg; g.fillRect(0, 0, w, h);
        var hole = g.createRadialGradient(w / 2, h * 0.55, 0, w / 2, h * 0.55, w * 0.5); hole.addColorStop(0, 'rgba(0,0,0,.9)'); hole.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = hole; g.fillRect(0, 0, w, h);
        // chấn song gỉ đỏ
        var bw = Math.max(14, w * 0.045);
        for (var b = 0; b < bars; b++) {
          var x = w * (0.1 + b * 0.16), gr = g.createLinearGradient(x - bw / 2, 0, x + bw / 2, 0);
          gr.addColorStop(0, '#3a1d12'); gr.addColorStop(0.35, '#8a4325'); gr.addColorStop(0.6, '#6d3119'); gr.addColorStop(1, '#2a140c');
          g.fillStyle = gr; g.fillRect(x - bw / 2, 0, bw, h);
          for (var sp = 0; sp < 14; sp++) { g.fillStyle = 'rgba(' + (60 + R[(b * 14 + sp) % 200] * 60 | 0) + ',25,10,.6)'; g.beginPath(); g.arc(x + (R[(b * 7 + sp) % 200] - 0.5) * bw, R[(b * 11 + sp * 3) % 200] * h, 1 + R[(sp + b) % 200] * 3, 0, 7); g.fill(); }
        }
        // thanh ngang
        g.fillStyle = '#5a2a17'; g.fillRect(0, h * 0.18, w, bw * 0.6); g.fillRect(0, h * 0.82, w, bw * 0.6);
        // vết xước: chỉ hiện chỗ tay đã miết qua (và chỉ trên thân chấn song)
        g.save(); g.beginPath(); for (var c = 0; c < bars; c++) g.rect(w * (0.1 + c * 0.16) - bw / 2, 0, bw, h); g.clip();
        var tmp = document.createElement('canvas'); tmp.width = cv.width; tmp.height = cv.height; var tg = tmp.getContext('2d'); var d = cv.width / w; tg.setTransform(d, 0, 0, d, 0, 0);
        tg.lineCap = 'round'; tg.shadowColor = '#ffffff'; tg.shadowBlur = 6;
        scr.forEach(function (s) { tg.strokeStyle = 'rgba(235,240,240,.95)'; tg.lineWidth = s[4]; tg.beginPath(); tg.moveTo(s[0], s[1]); tg.lineTo(s[2], s[3]); tg.stroke(); });
        tg.setTransform(1, 0, 0, 1, 0, 0); tg.globalCompositeOperation = 'destination-in'; tg.drawImage(mk, 0, 0, tmp.width, tmp.height);
        g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(tmp, 0, 0); g.setTransform(d, 0, 0, d, 0, 0);
        g.restore();
      }
      function rub(x, y) {
        mg.fillStyle = '#fff'; mg.lineCap = 'round'; mg.strokeStyle = '#fff'; mg.lineWidth = 46;
        mg.beginPath(); if (lastX == null) { mg.arc(x, y, 23, 0, 7); mg.fill(); } else { mg.moveTo(lastX, lastY); mg.lineTo(x, y); mg.stroke(); }
        var sp = lastX == null ? 0 : Math.hypot(x - lastX, y - lastY); lastX = x; lastY = y;
        if (scrape) { var n = ac.currentTime; scrape.g.gain.setTargetAtTime(Math.min(0.18, sp * 0.008), n, 0.03); scrape.f.frequency.setTargetAtTime(1800 + sp * 40, n, 0.05); }
        if (!raf) raf = requestAnimationFrame(function () { raf = 0; draw(); });
      }
      function startScrape() {
        if (scrape || !(playing && ac && ac.state === 'running')) return;
        var len = ac.sampleRate, b = ac.createBuffer(1, len, ac.sampleRate), d = b.getChannelData(0); for (var k = 0; k < len; k++) d[k] = Math.random() * 2 - 1;
        var s = ac.createBufferSource(); s.buffer = b; s.loop = true; var f = filt('bandpass', 2000, 3), g2 = gain(0); s.connect(f); f.connect(g2); g2.connect(master); s.start(); scrape = { s: s, f: f, g: g2 };
      }
      function stopScrape() { if (!scrape) return; var sc = scrape; scrape = null; sc.g.gain.setTargetAtTime(0, ac.currentTime, 0.05); setTimeout(function () { try { sc.s.stop(); } catch (e) {} }, 300); }
      function pos(e) { var r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
      var down = false;
      cv.addEventListener('pointerdown', function (e) { down = true; touched = true; box.classList.add('done', 'touched'); lastX = null; startScrape(); var p = pos(e); rub(p[0], p[1]); });
      cv.addEventListener('pointermove', function (e) { if (!down) return; var p = pos(e); rub(p[0], p[1]); });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (t) { cv.addEventListener(t, function () { down = false; lastX = null; stopScrape(); }); });
      cv.addEventListener('contextmenu', function (e) { e.preventDefault(); });
      fit(); addEventListener('resize', fit); addEventListener('a07-theme', draw);
    });
  })();

  /* giữ tay lên thẻ để kích hoạt (ch09 Teleport nóng dần, Smoke Veil bóp chặt). Xong thì gọi đúng hiệu ứng của đoạn sau
     và đánh dấu đoạn đó đã chạy, để lúc cuộn tới không chạy lại. Không chạm thì đoạn sau vẫn tự chạy như cũ. */
  (function () {
    var boxes = [].slice.call(document.querySelectorAll('.act-press'));
    boxes.forEach(function (box) {
      var btn = box.querySelector('.pressbtn'), inner = btn.querySelector('.card-inner'), need = parseFloat(box.getAttribute('data-hold')) || 1.2, fire = box.getAttribute('data-fire');
      var heat = box.classList.contains('heat'), ov = null, hum = null, t0 = 0, raf = 0, holding = false, done = false, sx = 0, sy = 0;
      if (heat) { ov = document.createElement('div'); ov.className = 'act-heat'; ov.setAttribute('aria-hidden', 'true'); document.body.appendChild(ov); }
      function setP(p) {
        box.style.setProperty('--p', p.toFixed(3));
        var a = heat ? p * 1.5 : p * p * 4, tt = performance.now();
        inner.style.setProperty('--jx', (Math.sin(tt / 14) * a).toFixed(2) + 'px'); inner.style.setProperty('--jy', (Math.cos(tt / 19) * a * 0.6).toFixed(2) + 'px');
        if (ov) ov.style.opacity = (p * p * 0.9).toFixed(3);
        if (hum) { var n = ac.currentTime; hum.o.frequency.setTargetAtTime(heat ? 70 + p * 220 : 120 + p * 500, n, 0.05); hum.g.gain.setTargetAtTime(0.02 + p * 0.09, n, 0.05); }
      }
      function startHum() {
        if (hum || !(playing && ac && ac.state === 'running')) return;
        var o = ac.createOscillator(), f = filt('lowpass', 900), g = gain(0); o.type = 'sawtooth'; o.frequency.value = 80; o.connect(f); f.connect(g); g.connect(master); o.start(); hum = { o: o, g: g };
      }
      function stopHum() { if (!hum) return; var h = hum; hum = null; h.g.gain.setTargetAtTime(0, ac.currentTime, 0.08); setTimeout(function () { try { h.o.stop(); } catch (e) {} }, 400); }
      function loop(now) { if (!holding) return; var p = Math.min(1, (now - t0) / 1000 / need); setP(p); if (p >= 1) go(); else raf = requestAnimationFrame(loop); }
      function go() {
        done = true; holding = false; stopHum(); box.classList.remove('holding'); box.classList.add('done', 'touched');
        if (ov) { ov.style.transition = 'opacity 1.6s'; ov.style.opacity = 0; }
        // đánh dấu đoạn có hiệu ứng này ở phía sau là đã chạy
        var ps = document.querySelectorAll('.scene p[data-fx="' + fire + '"]'), me = box.getBoundingClientRect().top;
        for (var i = 0; i < ps.length; i++) if (ps[i].getBoundingClientRect().top > me) { ps[i].dataset.fired = '1'; break; }
        if (window.a07cast) window.a07cast();
        setTimeout(function () { if (window.a07shot) window.a07shot(fire); }, 850);
      }
      btn.addEventListener('pointerdown', function (e) { if (done) return; holding = true; t0 = performance.now(); sx = e.clientX; sy = e.clientY; box.classList.add('holding'); startHum(); raf = requestAnimationFrame(loop); });
      function up() { if (done || !holding) return; holding = false; cancelAnimationFrame(raf); box.classList.remove('holding'); stopHum(); setP(0); }
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (t) { btn.addEventListener(t, up); });
      btn.addEventListener('pointermove', function (e) { if (holding && Math.abs(e.clientY - sy) + Math.abs(e.clientX - sx) > 16) up(); });
      btn.addEventListener('contextmenu', function (e) { e.preventDefault(); });
      btn.addEventListener('keydown', function (e) { if (!done && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); go(); } });
    });
  })();

  /* ch01: tấm thẻ trong hẻm phủ bụi; miết tay để lau, lộ ra vòng tròn rối */
  (function () {
    [].forEach.call(document.querySelectorAll('.card-fig[data-dust]'), function (fig) {
      var btn = fig.querySelector('.card'), cv = document.createElement('canvas'), g = cv.getContext('2d'), w = 0, h = 0, cleared = false, last = null, down = false, scrape = null, cnt = 0;
      cv.className = 'dust'; cv.setAttribute('aria-hidden', 'true'); fig.insertBefore(cv, fig.firstChild);
      function fit() {
        var r = btn.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2); w = r.width; h = r.height * 1.12; cv.style.height = h + 'px'; cv.style.top = (-r.height * 0.06) + 'px';
        cv.width = Math.round(w * d); cv.height = Math.round(h * d); g.setTransform(d, 0, 0, d, 0, 0); paint();
      }
      function paint() {
        g.clearRect(0, 0, w, h);
        for (var i = 0; i < 2600; i++) { var x = Math.random() * w, y = Math.random() * h, r = Math.random() * 3 + 0.6, c = 120 + Math.random() * 60 | 0; g.fillStyle = 'rgba(' + c + ',' + (c - 10) + ',' + (c - 25) + ',' + (0.35 + Math.random() * 0.5) + ')'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
        var gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.6); gr.addColorStop(0, 'rgba(150,140,120,.55)'); gr.addColorStop(1, 'rgba(150,140,120,.0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      }
      function wipe(x, y) {
        g.save(); g.globalCompositeOperation = 'destination-out'; g.lineCap = 'round'; g.lineWidth = 46; g.beginPath();
        if (last) { g.moveTo(last[0], last[1]); g.lineTo(x, y); g.stroke(); } else { g.arc(x, y, 23, 0, 7); g.fill(); }
        g.restore(); var sp = last ? Math.hypot(x - last[0], y - last[1]) : 0; last = [x, y];
        if (scrape) { var n = ac.currentTime; scrape.g.gain.setTargetAtTime(Math.min(0.1, sp * 0.006), n, 0.03); }
        if (++cnt % 8 === 0) check();
      }
      function check() {
        var d = g.getImageData(0, 0, cv.width, cv.height).data, left = 0, tot = 0; for (var i = 3; i < d.length; i += 64) { tot++; if (d[i] > 40) left++; }
        if (left / tot < 0.55) clear(true);
      }
      function clear(sound) { if (cleared) return; cleared = true; cv.classList.add('gone'); fig.classList.add('touched'); stopScrape(); if (sound && window.a07sfx) window.a07sfx('dissolve'); setTimeout(function () { cv.remove(); }, 1100); }
      function startScrape() {
        if (scrape || !(playing && ac && ac.state === 'running')) return;
        var len = ac.sampleRate, b = ac.createBuffer(1, len, ac.sampleRate), dd = b.getChannelData(0); for (var k = 0; k < len; k++) dd[k] = Math.random() * 2 - 1;
        var s = ac.createBufferSource(); s.buffer = b; s.loop = true; var f = filt('bandpass', 5000, 1), g2 = gain(0); s.connect(f); f.connect(g2); g2.connect(master); s.start(); scrape = { s: s, g: g2 };
      }
      function stopScrape() { if (!scrape) return; var sc = scrape; scrape = null; sc.g.gain.setTargetAtTime(0, ac.currentTime, 0.05); setTimeout(function () { try { sc.s.stop(); } catch (e) {} }, 300); }
      function pos(e) { var r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
      cv.addEventListener('pointerdown', function (e) { down = true; last = null; startScrape(); var p = pos(e); wipe(p[0], p[1]); });
      cv.addEventListener('pointermove', function (e) { if (down) { var p = pos(e); wipe(p[0], p[1]); } });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (t) { cv.addEventListener(t, function () { down = false; last = null; stopScrape(); }); });
      var cap = fig.querySelector('figcaption'); if (cap) cap.textContent = 'Miết tay lau bụi, rồi chạm để lật thẻ';
      setTimeout(fit, 50); addEventListener('resize', function () { if (!cleared) fit(); });
    });
  })();

  /* ch11: dải băng vắt trên hòn đá, gió lay; người đọc kéo đầu dải băng, buông ra thì gió cuốn đi tiếp */
  (function () {
    [].forEach.call(document.querySelectorAll('.act-ribbon'), function (box) {
      var cv = box.querySelector('canvas'), g = cv.getContext('2d'), w = 0, h = 0, N = 22, P = [], drag = null, vis = false, raf = 0, last = 0, flap = 0;
      function fit() { var d = Math.min(devicePixelRatio || 1, 2), r = cv.getBoundingClientRect(); w = r.width; h = r.height; cv.width = Math.round(w * d); cv.height = Math.round(h * d); g.setTransform(d, 0, 0, d, 0, 0); init(); }
      function init() { P = []; var ax = w * 0.3, ay = h * 0.48, seg = w * 0.5 / N; for (var i = 0; i < N; i++) P.push({ x: ax + i * seg, y: ay + i * 2, px: ax + i * seg, py: ay + i * 2 }); }
      function step(t) {
        var ax = w * 0.3, ay = h * 0.48, seg = w * 0.55 / N;
        for (var i = 1; i < N; i++) {
          var q = P[i], vx = (q.x - q.px) * 0.97, vy = (q.y - q.py) * 0.97; q.px = q.x; q.py = q.y;
          var wind = (0.35 + 0.25 * Math.sin(t * 1.3) + 0.15 * Math.sin(t * 3.7 + i * 0.4)) * (i / N);
          q.x += vx + wind; q.y += vy + 0.18 + Math.sin(t * 5 + i * 0.6) * 0.25 * (i / N);
        }
        if (drag) { var e = P[N - 1]; e.x = drag[0]; e.y = drag[1]; }
        for (var k = 0; k < 6; k++) {
          P[0].x = ax; P[0].y = ay;
          for (var j = 0; j < N - 1; j++) { var a = P[j], b = P[j + 1], dx = b.x - a.x, dy = b.y - a.y, dd = Math.hypot(dx, dy) || 1, df = (dd - seg) / dd * 0.5; if (j > 0) { a.x += dx * df; a.y += dy * df; } if (!(drag && j + 1 === N - 1)) { b.x -= dx * df; b.y -= dy * df; } }
        }
        P.forEach(function (q) { if (q.y > h * 0.92) q.y = h * 0.92; });
      }
      function draw(t) {
        var sky = g.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, C.dark ? '#2a2d2c' : '#bfc2bc'); sky.addColorStop(1, C.dark ? '#3a3a35' : '#d9d6cb'); g.fillStyle = sky; g.fillRect(0, 0, w, h);
        // bụi xám bay ngang
        g.fillStyle = C.dark ? 'rgba(200,200,190,.25)' : 'rgba(120,118,110,.35)'; for (var i = 0; i < 30; i++) { var x = ((i * 97.3 + t * (40 + i % 5 * 12)) % (w + 40)) - 20, y = (i * 53.1) % h; g.fillRect(x, y, 2, 1); }
        // hòn đá, vệt máu khô quệt dài
        var rx = w * 0.3; g.fillStyle = C.dark ? '#1c1e1d' : '#6d6c66'; g.beginPath(); g.moveTo(rx - w * 0.2, h); g.quadraticCurveTo(rx - w * 0.18, h * 0.5, rx - w * 0.02, h * 0.46); g.quadraticCurveTo(rx + w * 0.12, h * 0.44, rx + w * 0.16, h); g.fill();
        g.strokeStyle = 'rgba(90,30,22,.55)'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(rx - w * 0.06, h * 0.55); g.quadraticCurveTo(rx, h * 0.6, rx + w * 0.07, h * 0.72); g.stroke();
        // dải băng: dải trắng có hai mép, lật mặt thì tối đi một chút
        for (var j = 0; j < N - 1; j++) {
          var a = P[j], b = P[j + 1], ang = Math.atan2(b.y - a.y, b.x - a.x), wd = 9 * (1 - j / N * 0.3), tw = Math.cos(t * 4 + j * 0.5);
          var nx = -Math.sin(ang) * wd * (0.4 + 0.6 * Math.abs(tw)), ny = Math.cos(ang) * wd * (0.4 + 0.6 * Math.abs(tw));
          g.fillStyle = tw > 0 ? (C.dark ? '#e6e2d6' : '#f6f3ea') : (C.dark ? '#b9b5a9' : '#d6d1c4');
          g.beginPath(); g.moveTo(a.x + nx, a.y + ny); g.lineTo(b.x + nx, b.y + ny); g.lineTo(b.x - nx, b.y - ny); g.lineTo(a.x - nx, a.y - ny); g.fill();
        }
      }
      function loop(now) { var t = now / 1000; step(t); draw(t); if (drag && playing && ac && ac.state === 'running' && now - flap > 160) { flap = now; var v = Math.min(0.12, Math.hypot(P[N - 1].x - P[N - 1].px, P[N - 1].y - P[N - 1].py) * 0.01); if (v > 0.01) { var s = ac.createBufferSource(), len = ac.sampleRate * 0.2 | 0, bb = ac.createBuffer(1, len, ac.sampleRate), dd = bb.getChannelData(0); for (var k = 0; k < len; k++) dd[k] = (Math.random() * 2 - 1) * (1 - k / len); s.buffer = bb; var f = filt('bandpass', 1800, 1), gg = gain(v); s.connect(f); f.connect(gg); gg.connect(master); s.start(); } } if (vis || drag) raf = requestAnimationFrame(loop); else raf = 0; }
      new IntersectionObserver(function (es) { vis = es[0].isIntersecting; if (vis && !raf) raf = requestAnimationFrame(loop); }).observe(box);
      function pos(e) { var r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
      cv.addEventListener('pointerdown', function (e) { var p = pos(e); drag = p; box.classList.add('done', 'touched'); if (!raf) raf = requestAnimationFrame(loop); });
      cv.addEventListener('pointermove', function (e) { if (drag) drag = pos(e); });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (t) { cv.addEventListener(t, function () { drag = null; }); });
      cv.addEventListener('contextmenu', function (e) { e.preventDefault(); });
      fit(); addEventListener('resize', fit);
    });
  })();

/* câu thoại đắt hiện lên nhẹ khi cuộn tới */
(function () {
  var ls = [].slice.call(document.querySelectorAll('p.say[data-act~="line"]'));
  if (!ls.length || !window.IntersectionObserver) return;
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('seen'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -15% 0px' });
  ls.forEach(function (l) { io.observe(l); });
})();

  /* ---------- đợt tương tác 2 (Clair chốt 24/11): khối canvas chèn giữa các đoạn, mọi khối có class .act-cv ----------
     Khai báo ở "acts" trong scenes.json: {"at": "chữ đầu đoạn", "act": "<loại>", "where": "after"?, "hint": "..."?}
       map     = ch04 tờ bản đồ gấp tư: vuốt ngang để mở từng nếp, mở xong các vùng mới hiện mực; chạm để gấp lại
       letter  = ch10 tờ thư gấp tư: vuốt ngang để mở, chữ nghiêng không đọc được, dấu đỏ; chạm để gấp lại
       parry   = ch06 cầm kiếm tre của Luke: vệt đòn lao tới, vuốt theo hướng vệt để đỡ (3 đòn), đỡ trượt cũng được
       chain   = ch06 xích của Leon: kéo ngang cho căng; căng hết thì chạy hiệu ứng xích của đoạn sau (đánh dấu đã chạy)
       hearth  = ch05 bếp lửa: giữ tay hơ, lửa bùng lên, hơi ấm loang ra mép màn hình
       blood   = ch07 rê ngón tay dọc bờ ruộng, từng giọt máu hiện ra; khúc giữa không có gì cả
       knock   = ch08 gõ ba tiếng lên khung cửa gỗ
       bandage = ch08 vuốt ngang để quấn cuộn băng quanh cánh tay bầm
     Luật chung: không chặn cuộn (chỉ cử chỉ ngang, chạm, giữ), cuộn qua thì để nguyên chờ người đọc (có nhắc nhỏ ở mép dưới), có tiếng (không tiếng trầm kiểu trống),
     không vẽ người, không gợi ý ý nghĩa cơ chế ẩn. */
  (function () {
    var boxes = [].slice.call(document.querySelectorAll('.act-cv'));
    if (!boxes.length) return;
    function live() { return playing && ac && ac.state === 'running'; }
    var wb = null;
    function white() { if (wb) return wb; var len = ac.sampleRate, b = ac.createBuffer(1, len, ac.sampleRate), d = b.getChannelData(0); for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1; return (wb = b); }
    function out(v, pan) { var g = gain(v); if (pan != null && ac.createStereoPanner) { var p = ac.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, pan)); g.connect(p); p.connect(master); } else g.connect(master); return g; }
    function nz(o, type, f0, f1, q, v, dur, at) {
      var s = ac.createBufferSource(); s.buffer = white(); var fl = filt(type, f0, q), g = gain(0), n = at || ac.currentTime;
      fl.frequency.setValueAtTime(f0, n); if (f1 !== f0) fl.frequency.exponentialRampToValueAtTime(f1, n + dur);
      g.gain.setValueAtTime(0.0001, n); g.gain.linearRampToValueAtTime(v, n + Math.min(0.012, dur / 4)); g.gain.exponentialRampToValueAtTime(0.0001, n + dur);
      s.connect(fl); fl.connect(g); g.connect(o); s.start(n, Math.random() * 0.5); s.stop(n + dur + 0.05);
    }
    function tn(o, type, f0, f1, v, dur, at) {
      var x = ac.createOscillator(), g = gain(0), n = at || ac.currentTime; x.type = type;
      x.frequency.setValueAtTime(f0, n); x.frequency.exponentialRampToValueAtTime(f1, n + dur);
      g.gain.setValueAtTime(v, n); g.gain.exponentialRampToValueAtTime(0.0001, n + dur);
      x.connect(g); g.connect(o); x.start(n); x.stop(n + dur + 0.03);
    }
    // tiếng nhiễu kéo dài (sột soạt, lửa thở), chỉnh âm lượng theo tốc độ tay
    function hum(type, f, q) {
      if (!live()) return null;
      var s = ac.createBufferSource(); s.buffer = white(); s.loop = true; var fl = filt(type, f, q), g = gain(0); s.connect(fl); fl.connect(g); g.connect(master); s.start();
      return { set: function (v, fr) { var n = ac.currentTime; g.gain.setTargetAtTime(v, n, 0.04); if (fr) fl.frequency.setTargetAtTime(fr, n, 0.06); },
        stop: function () { g.gain.setTargetAtTime(0, ac.currentTime, 0.06); setTimeout(function () { try { s.stop(); } catch (e) {} }, 400); } };
    }
    function snd(fn) { if (!live()) return; try { fn(ac.currentTime); } catch (e) {} }
    function seeds(n) { var a = []; for (var i = 0; i < n; i++) a.push(Math.random()); return a; }
    function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
    function rgba(hex, a) { var n = parseInt(hex.slice(1), 16); return 'rgba(' + (n >> 16) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + clamp(a, 0, 1).toFixed(3) + ')'; }

    /* khung chung: canvas vừa khung, vẽ liên tục khi đang thấy, cử chỉ ngang / chạm / giữ, cuộn qua thì tự xong */
    function mk(box, K) {
      var cv = box.querySelector('canvas'), g = cv.getContext('2d'), raf = 0, down = null;
      var S = { box: box, cv: cv, g: g, w: 0, h: 0, d: 1, vis: false, busy: 0, touched: false, done: false, hint: box.querySelector('.act-hint') };
      function fit() { var d = Math.min(devicePixelRatio || 1, 2), r = cv.getBoundingClientRect(); S.d = d; S.w = r.width; S.h = r.height; cv.width = Math.round(S.w * d); cv.height = Math.round(S.h * d); g.setTransform(d, 0, 0, d, 0, 0); if (K.fit) K.fit(S); paint(); }
      function paint() { g.clearRect(0, 0, S.w, S.h); K.draw(S, performance.now() / 1000); }
      // raf giữ nguyên trong lúc vẽ để S.kick gọi từ trong draw không đẻ thêm vòng vẽ thứ hai
      function loop() { paint(); raf = S.vis || performance.now() < S.busy ? requestAnimationFrame(loop) : 0; }
      S.kick = function (ms) { if (ms) S.busy = Math.max(S.busy, performance.now() + ms); if (!raf) raf = requestAnimationFrame(loop); };
      S.touch = function () { if (!S.touched) { S.touched = true; box.classList.add('touched'); } };
      S.finish = function () { if (S.done) return; S.done = true; box.classList.add('done', 'touched'); };
      S.say = function (t) { if (S.hint) S.hint.textContent = t; };
      S.dark = function () { return !!C.dark; };
      function pos(e) { var r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
      cv.addEventListener('pointerdown', function (e) {
        if (e.button > 0) return; var p = pos(e); down = { x0: p[0], y0: p[1], x: p[0], y: p[1], t0: performance.now(), far: 0 };
        S.touch(); if (K.down) K.down(S, p, down); S.kick();
      });
      cv.addEventListener('pointermove', function (e) {
        if (!down) return; var p = pos(e), dx = p[0] - down.x, dy = p[1] - down.y; down.x = p[0]; down.y = p[1]; down.far = Math.max(down.far, Math.abs(p[0] - down.x0) + Math.abs(p[1] - down.y0));
        if (K.move) K.move(S, p, dx, dy, down);
      });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (t) { cv.addEventListener(t, function () { if (!down) return; var dn = down; down = null; if (K.up) K.up(S, dn, t === 'pointerup' && dn.far < 12 && performance.now() - dn.t0 < 450); }); });
      cv.addEventListener('contextmenu', function (e) { e.preventDefault(); });
      new IntersectionObserver(function (es) { S.vis = es[0].isIntersecting; if (S.vis) S.kick(); else if (K.hide) K.hide(S); }).observe(box);
      addEventListener('resize', fit); addEventListener('a07-theme', fit);
      if (K.init) K.init(S);
      fit();
      return S;
    }

    /* ---- tờ giấy gấp tư (bản đồ ch04, thư ch10): vuốt ngang mở nếp dọc, vuốt tiếp mở nếp ngang; mở rồi chạm để gấp lại ---- */
    function folder(o) {
      var pc = null, ic = null, cc = null, PW = 0, PH = 0, u = 0, dsp = 0, opened = 0, lastR = 0, prevStage = 0;
      function off(wd, ht, d) { var c = document.createElement('canvas'); c.width = Math.round(wd * d); c.height = Math.round(ht * d); var x = c.getContext('2d'); x.setTransform(d, 0, 0, d, 0, 0); return [c, x]; }
      function rustle(v) { snd(function (n) { var m = out(1); nz(m, 'bandpass', 1400 + Math.random() * 2400, 2600, 1.4, v, 0.08 + Math.random() * 0.06, n); }); }
      function snap() { snd(function (n) { var m = out(1); nz(m, 'bandpass', 2600, 1500, 1.6, 0.4, 0.09, n); nz(m, 'highpass', 4500, 6000, 1, 0.18, 0.05, n + 0.01); }); }
      return {
        fit: function (S) {
          var ar = o.aspect; PW = Math.min(S.w * o.maxW, S.h * 0.86 * ar); PH = PW / ar;
          var a = off(PW, PH, S.d), b = off(PW, PH, S.d), c = off(PW, PH, S.d); pc = a; ic = b; cc = c;
          o.paper(pc[1], PW, PH, S.dark()); o.ink(ic[1], PW, PH, S.dark());
        },
        draw: function (S, t) {
          var g = S.g, w = S.w, h = S.h; o.bg(g, w, h, S.dark(), t);
          dsp += (u - dsp) * 0.22; if (Math.abs(u - dsp) < 0.002) dsp = u;
          if (Math.abs(u - dsp) > 0.002) S.kick(200);
          // ghép giấy + mực (mực hiện dần theo vùng sau khi mở hẳn)
          var cx = cc[1]; cx.save(); cx.setTransform(1, 0, 0, 1, 0, 0); cx.clearRect(0, 0, cc[0].width, cc[0].height); cx.drawImage(pc[0], 0, 0);
          var rv = o.inkAlways ? 1 : opened ? clamp((t - opened) / 2.6, 0, 1) : 0, zones = o.zones || 1;
          for (var z = 0; z < zones; z++) { var za = clamp(rv * zones - z, 0, 1); if (za <= 0) continue; var zx = Math.round(ic[0].width * z / zones), zw = Math.round(ic[0].width / zones) + 1; cx.globalAlpha = za; cx.drawImage(ic[0], zx, 0, zw, ic[0].height, zx, 0, zw, ic[0].height); }
          cx.globalAlpha = 1; cx.restore();
          if (rv > 0 && rv < 1) S.kick(200);
          var a = clamp(dsp, 0, 1), b = clamp(dsp - 1, 0, 1), hw = PW / 2, hh = PH / 2, th = Math.PI * a, rp = hw * Math.abs(Math.cos(th));
          var visW = th < Math.PI / 2 ? hw : hw + rp, bh = hh * (1 - Math.pow(1 - b, 2)), visH = hh + bh;
          var x0 = w / 2 - visW / 2, y0 = h / 2 - visH / 2, src = cc[0], k = src.width / PW;
          g.save(); g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 18; g.shadowOffsetY = 6; g.fillStyle = o.back(S.dark()); g.fillRect(x0, y0, visW, visH); g.restore();
          g.drawImage(src, 0, 0, hw * k, hh * k, x0, y0, hw, hh);
          if (th < Math.PI / 2) {
            // mặt lưng của nếp gấp đang phủ lên
            g.fillStyle = o.back(S.dark()); g.fillRect(x0 + hw - rp, y0, rp, hh);
            var sg = g.createLinearGradient(x0 + hw - rp, 0, x0 + hw, 0); sg.addColorStop(0, 'rgba(0,0,0,' + (0.05 + 0.3 * (1 - rp / hw)).toFixed(3) + ')'); sg.addColorStop(1, 'rgba(0,0,0,.18)');
            g.fillStyle = sg; g.fillRect(x0 + hw - rp, y0, rp, hh);
          } else if (rp > 0.5) {
            g.drawImage(src, hw * k, 0, hw * k, hh * k, x0 + hw, y0, rp, hh);
            g.fillStyle = 'rgba(0,0,0,' + (0.35 * (1 - rp / hw)).toFixed(3) + ')'; g.fillRect(x0 + hw, y0, rp, hh);
          }
          if (bh > 0.5) {
            g.drawImage(src, 0, hh * k, PW * k, hh * k, x0, y0 + hh, PW, bh);
            var bg2 = g.createLinearGradient(0, y0 + hh, 0, y0 + hh + bh); bg2.addColorStop(0, 'rgba(0,0,0,' + (0.1 + 0.35 * (1 - b)).toFixed(3) + ')'); bg2.addColorStop(1, 'rgba(0,0,0,' + (0.3 * (1 - b)).toFixed(3) + ')');
            g.fillStyle = bg2; g.fillRect(x0, y0 + hh, PW, bh);
          }
          // nếp gấp còn hằn
          if (a > 0.6) { g.strokeStyle = 'rgba(60,40,20,.22)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x0 + hw, y0); g.lineTo(x0 + hw, y0 + visH); g.stroke(); }
          if (b > 0.2) { g.strokeStyle = 'rgba(60,40,20,.18)'; g.beginPath(); g.moveTo(x0, y0 + hh); g.lineTo(x0 + visW, y0 + hh); g.stroke(); }
        },
        move: function (S, p, dx, dy) {
          if (opened || S.done) return;
          u = clamp(u + Math.abs(dx) / (PW * 0.5), 0, 2); S.touch();
          var now = performance.now(); if (Math.abs(dx) > 1.5 && now - lastR > 70) { lastR = now; rustle(clamp(Math.abs(dx) * 0.012, 0.03, 0.16)); }
          var st = Math.floor(u + 0.001); if (st > prevStage) { prevStage = st; snap(); }
          if (u >= 2) this.open(S, true);
          S.kick(400);
        },
        up: function (S, dn, tap) {
          if (opened && tap && !S.done) { u = 0; prevStage = 0; S.finish(); snap(); rustle(0.12); S.kick(1500); return; }
          if (opened || S.done) return;
          var st = Math.floor(u), fr = u - st;
          if (fr > 0.3) { u = st + 1; if (u > prevStage) { prevStage = u; snap(); } } else u = st;
          if (u >= 2) this.open(S, true);
          S.kick(1200);
        },
        open: function (S, sound) { if (opened) return; opened = performance.now() / 1000; S.box.classList.add('giu-ok'); u = 2; if (o.folded) S.say(o.folded); S.kick(3000); if (sound && o.reveal) snd(o.reveal); },
        auto: function (S) { if (opened) { u = 0; } }
      };
    }

    // --- ch04: tấm bản đồ vẽ tay mực nâu. Chỉ có những gì đoạn văn tả: ba vùng, hai đường kẻ tô màu nước, không có chữ.
    function inkLine(g, R, pts, jit) {
      g.beginPath(); var k = 0;
      for (var i = 0; i < pts.length - 1; i++) {
        var a = pts[i], b = pts[i + 1], n = Math.max(2, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 6));
        for (var s = 0; s <= n; s++) { var u = s / n, x = a[0] + (b[0] - a[0]) * u + (R[(k * 7) % R.length] - 0.5) * jit, y = a[1] + (b[1] - a[1]) * u + (R[(k * 13 + 5) % R.length] - 0.5) * jit; k++; if (i === 0 && s === 0) g.moveTo(x, y); else g.lineTo(x, y); }
      }
      g.stroke();
    }
    var MAP = folder({
      aspect: 4 / 3, maxW: 0.9, zones: 3, folded: 'chạm để gấp lại',
      bg: function (g, w, h, dk) { var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, dk ? '#0d1311' : '#2a3430'); gr.addColorStop(1, dk ? '#1a201a' : '#3c4536'); g.fillStyle = gr; g.fillRect(0, 0, w, h); },
      back: function (dk) { return dk ? '#bdae8d' : '#d8c8a4'; },
      paper: function (g, W, H, dk) {
        g.fillStyle = dk ? '#cfc09e' : '#eadcbc'; g.fillRect(0, 0, W, H);
        var R = seeds(40);
        for (var i = 0; i < 9; i++) { var x = R[i] * W, y = R[i + 10] * H, r = (0.08 + R[i + 20] * 0.18) * W, st = g.createRadialGradient(x, y, 0, x, y, r); st.addColorStop(0, 'rgba(150,110,60,.13)'); st.addColorStop(1, 'rgba(150,110,60,0)'); g.fillStyle = st; g.fillRect(0, 0, W, H); }
        var e = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.7); e.addColorStop(0, 'rgba(110,70,30,0)'); e.addColorStop(1, 'rgba(110,70,30,.35)'); g.fillStyle = e; g.fillRect(0, 0, W, H);
      },
      ink: function (g, W, H) {
        var R = seeds(120), ink = '#5a3a1e'; g.lineCap = 'round'; g.lineJoin = 'round';
        // hai đường ranh giới mảnh, dọc theo đó tô một lớp màu nhạt như nước
        [W / 3, W * 2 / 3].forEach(function (bx, j) {
          var pts = []; for (var y = 0; y <= H; y += H / 8) pts.push([bx + Math.sin(y / H * 6 + j) * W * 0.012, y]);
          g.strokeStyle = 'rgba(110,150,165,.28)'; g.lineWidth = W * 0.035; inkLine(g, R, pts, 2);
          g.strokeStyle = ink; g.lineWidth = 1; inkLine(g, R, pts, 1.2);
        });
        g.strokeStyle = ink; g.fillStyle = ink; g.lineWidth = 1.3;
        function house(x, y, s) { inkLine(g, R, [[x - s, y], [x - s, y - s], [x + s, y - s], [x + s, y], [x - s, y]], 1); inkLine(g, R, [[x - s * 1.35, y - s * 0.95], [x, y - s * 2], [x + s * 1.35, y - s * 0.95]], 1); }
        // vùng trái: ruộng bàn cờ, bù nhìn, mấy mái nhà, cái chòi bên bờ nước
        var cw = W * 0.045, x0 = W * 0.04, y0 = H * 0.42;
        for (var r = 0; r < 5; r++) for (var c = 0; c < 5; c++) {
          var x = x0 + c * cw, y = y0 + r * cw * 0.85; inkLine(g, R, [[x, y], [x + cw, y], [x + cw, y + cw * 0.85], [x, y + cw * 0.85], [x, y]], 1.2);
          if ((r + c) % 2) for (var q = 1; q < 4; q++) inkLine(g, R, [[x + q * cw / 4, y + 2], [x + q * cw / 4 - 2, y + cw * 0.85 - 2]], 0.6);
        }
        var sx = W * 0.27, sy = H * 0.42; inkLine(g, R, [[sx, sy], [sx, sy - H * 0.13]], 0.8); inkLine(g, R, [[sx - W * 0.03, sy - H * 0.095], [sx + W * 0.03, sy - H * 0.095]], 0.8);
        g.beginPath(); g.arc(sx, sy - H * 0.15, W * 0.009, 0, 7); g.stroke(); inkLine(g, R, [[sx - W * 0.018, sy - H * 0.158], [sx, sy - H * 0.185], [sx + W * 0.018, sy - H * 0.158]], 0.6);
        house(W * 0.07, H * 0.22, W * 0.018); house(W * 0.14, H * 0.18, W * 0.016); house(W * 0.2, H * 0.25, W * 0.017);
        house(W * 0.24, H * 0.83, W * 0.016);
        for (var wv = 0; wv < 3; wv++) { var pts = []; for (var xx = W * 0.03; xx <= W * 0.2; xx += W * 0.012) pts.push([xx, H * (0.84 + wv * 0.045) + Math.sin(xx / W * 70) * 2]); inkLine(g, R, pts, 0.5); }
        // vùng giữa: một toà nhà lớn hẳn, mấy sạp hàng, một ngôi nhà có cổng
        var bx = W * 0.5, by = H * 0.36; inkLine(g, R, [[bx - W * 0.09, by], [bx - W * 0.09, by - H * 0.12], [bx + W * 0.09, by - H * 0.12], [bx + W * 0.09, by], [bx - W * 0.09, by]], 1.2);
        inkLine(g, R, [[bx - W * 0.11, by - H * 0.11], [bx, by - H * 0.22], [bx + W * 0.11, by - H * 0.11]], 1.2); inkLine(g, R, [[bx - W * 0.015, by], [bx - W * 0.015, by - H * 0.05], [bx + W * 0.015, by - H * 0.05], [bx + W * 0.015, by]], 0.8);
        for (var st = 0; st < 4; st++) { var tx = W * (0.4 + st * 0.05), ty = H * 0.58; inkLine(g, R, [[tx, ty], [tx + W * 0.04, ty], [tx + W * 0.035, ty - H * 0.035], [tx + W * 0.005, ty - H * 0.035], [tx, ty]], 0.8); inkLine(g, R, [[tx + W * 0.005, ty], [tx + W * 0.005, ty + H * 0.04]], 0.5); inkLine(g, R, [[tx + W * 0.035, ty], [tx + W * 0.035, ty + H * 0.04]], 0.5); }
        house(W * 0.52, H * 0.86, W * 0.02);
        inkLine(g, R, [[W * 0.43, H * 0.9], [W * 0.43, H * 0.78], [W * 0.61, H * 0.78], [W * 0.61, H * 0.9]], 1); inkLine(g, R, [[W * 0.47, H * 0.9], [W * 0.47, H * 0.83], [W * 0.49, H * 0.81], [W * 0.51, H * 0.83], [W * 0.51, H * 0.9]], 0.8);
        // vùng phải: núi tô đậm, một miệng hầm, một ống khói
        [[0.74, 0.5, 0.09, 0.3], [0.86, 0.46, 0.1, 0.36], [0.95, 0.52, 0.07, 0.24]].forEach(function (m) {
          g.beginPath(); g.moveTo(W * (m[0] - m[2]), H * m[1]); g.lineTo(W * m[0], H * (m[1] - m[3])); g.lineTo(W * (m[0] + m[2]), H * m[1]); g.closePath(); g.fillStyle = 'rgba(90,58,30,.55)'; g.fill(); g.stroke();
          for (var hl = 0; hl < 6; hl++) inkLine(g, R, [[W * (m[0] - m[2] * 0.2 + hl * m[2] * 0.12), H * (m[1] - m[3] * 0.7 + hl * m[3] * 0.1)], [W * (m[0] - m[2] * 0.2 + hl * m[2] * 0.12 + 0.02), H * (m[1] - m[3] * 0.62 + hl * m[3] * 0.1)]], 0.4);
        });
        var mx = W * 0.79, my = H * 0.72; g.beginPath(); g.moveTo(mx - W * 0.035, my); g.lineTo(mx - W * 0.035, my - H * 0.04); g.arc(mx, my - H * 0.04, W * 0.035, Math.PI, 0); g.lineTo(mx + W * 0.035, my); g.closePath(); g.fillStyle = 'rgba(60,36,16,.85)'; g.fill(); g.stroke();
        var cx2 = W * 0.91, cy2 = H * 0.86; inkLine(g, R, [[cx2 - W * 0.012, cy2], [cx2 - W * 0.012, cy2 - H * 0.16], [cx2 + W * 0.012, cy2 - H * 0.16], [cx2 + W * 0.012, cy2]], 0.8);
        for (var sm = 0; sm < 3; sm++) { g.beginPath(); g.arc(cx2 + sm * W * 0.012, cy2 - H * (0.19 + sm * 0.04), W * (0.01 + sm * 0.004), 0, 7); g.stroke(); }
        inkLine(g, R, [[W * 0.7, H * 0.9], [W * 0.98, H * 0.9]], 1.2);
      },
      reveal: function (n) { var m = out(1); nz(m, 'highpass', 3000, 6000, 0.7, 0.05, 1.6, n); }
    });

    // --- ch10: thư giới thiệu của trưởng làng. Chữ nghiêng nét mực đen, con dấu đỏ hình vuông góc dưới; không đọc được chữ nào.
    var LETTER = folder({
      aspect: 0.74, maxW: 0.66, inkAlways: true, folded: 'chạm để gấp lại',
      bg: function (g, w, h, dk) { var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, dk ? '#22241f' : '#b9b3a3'); gr.addColorStop(1, dk ? '#2c2b25' : '#cfc7b4'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
        g.strokeStyle = dk ? 'rgba(0,0,0,.35)' : 'rgba(80,70,55,.25)'; g.lineWidth = 1; for (var y = 0; y < h; y += 28) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); for (var x = (y / 28 % 2) * 30; x < w; x += 60) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 28); g.stroke(); } } },
      back: function (dk) { return dk ? '#cfc6b2' : '#e4dccb'; },
      paper: function (g, W, H, dk) { g.fillStyle = dk ? '#ddd3bd' : '#f1e9d8'; g.fillRect(0, 0, W, H); var e = g.createRadialGradient(W / 2, H / 2, W * 0.3, W / 2, H / 2, H * 0.75); e.addColorStop(0, 'rgba(120,90,50,0)'); e.addColorStop(1, 'rgba(120,90,50,.22)'); g.fillStyle = e; g.fillRect(0, 0, W, H); },
      ink: function (g, W, H) {
        var R = seeds(200), k = 0; g.strokeStyle = '#141010'; g.lineCap = 'round'; g.lineJoin = 'round';
        for (var ln = 0; ln < 9; ln++) {
          var y = H * (0.12 + ln * 0.075), x = W * 0.12, end = W * (ln === 8 ? 0.5 : 0.86 - R[ln] * 0.06);
          while (x < end) {
            var wl = W * (0.05 + R[k++ % 200] * 0.09); g.lineWidth = 1 + R[k % 200] * 0.8; g.beginPath(); g.moveTo(x, y);
            for (var s = 0; s < wl; s += 3) { var yy = y - Math.abs(Math.sin(s * 0.5 + R[k % 200] * 6)) * H * 0.028 * (0.5 + R[(k + s) % 200] * 0.7); g.lineTo(x + s + (y - yy) * 0.45, yy); g.lineTo(x + s + 1.6, y); }
            g.stroke(); x += wl + W * 0.025; k++;
          }
        }
        // con dấu đỏ hình vuông
        var sz = W * 0.17, sx = W * 0.72, sy = H * 0.8; g.save(); g.translate(sx, sy); g.rotate(-0.04);
        g.strokeStyle = 'rgba(178,32,28,.85)'; g.lineWidth = 2.4; g.strokeRect(-sz / 2, -sz / 2, sz, sz); g.lineWidth = 1.2; g.strokeRect(-sz / 2 + 4, -sz / 2 + 4, sz - 8, sz - 8);
        g.fillStyle = 'rgba(178,32,28,.78)';
        for (var i = 0; i < 4; i++) for (var j = 0; j < 4; j++) if (R[i * 4 + j + 50] > 0.35) g.fillRect(-sz / 2 + 7 + i * (sz - 14) / 4, -sz / 2 + 7 + j * (sz - 14) / 4, (sz - 14) / 4 - 2, (sz - 14) / 4 * (0.3 + R[i + j * 4 + 80] * 0.6));
        g.restore();
      }
    });

    /* ---- ch06: cầm kiếm tre của Luke, đỡ ba đòn ---- */
    function PARRY() {
      var R = seeds(80), strikes = [], next = 0, n = 0, kick = 0, sparks = [], swipe = 0, started = false, marks = [];
      function hit(S, st, good) {
        st.res = good ? 'ok' : 'miss'; st.rt = performance.now() / 1000; marks[n] = good; n++;
        var cx = S.w / 2, cy = S.h / 2;
        if (good) {
          kick = 1; for (var i = 0; i < 18; i++) { var a = (st.dir > 0 ? Math.PI : 0) + (Math.random() - 0.5) * 2.2; sparks.push({ x: cx, y: cy, vx: Math.cos(a) * (120 + Math.random() * 260), vy: Math.sin(a) * (120 + Math.random() * 260) - 60, t: st.rt }); }
          // tre va: lúc đầu "chát" trong, đòn sau đục và rè dần như chữ trong truyện
          snd(function (t) { var o = out(1, -st.dir * 0.3), f = 2000 - (n - 1) * 380; nz(o, 'bandpass', f, f * 0.8, 4, 0.75, 0.05, t); tn(o, 'triangle', f * 0.55, f * 0.35, 0.22, 0.07, t); nz(o, 'highpass', 4200, 6000, 1, 0.25 - (n - 1) * 0.07, 0.03, t); if (n > 1) nz(o, 'bandpass', 1400, 1000, 1.2, 0.12 * (n - 1), 0.14, t + 0.01); });
        } else {
          kick = -1.6;
          snd(function (t) { var o = out(1, st.dir * 0.4); nz(o, 'bandpass', 600, 2400, 1.2, 0.3, 0.22, t); nz(o, 'bandpass', 1500, 900, 2, 0.2, 0.08, t + 0.02); });
        }
        if (n >= 3) setTimeout(function () { S.finish(); }, 900);
        next = st.rt + 0.75;
      }
      return {
        draw: function (S, t) {
          var g = S.g, w = S.w, h = S.h, cx = w / 2, cy = h / 2;
          var bg = g.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.7); bg.addColorStop(0, S.dark() ? '#18201f' : '#2b3633'); bg.addColorStop(1, S.dark() ? '#070a0a' : '#121918'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
          for (var s = 0; s < 30; s++) { g.fillStyle = 'rgba(220,230,225,' + (0.15 + 0.25 * Math.abs(Math.sin(t * 0.7 + s))).toFixed(3) + ')'; g.fillRect(R[s] * w, R[s + 30] * h * 0.45, 1.4, 1.4); }
          // đòn mới
          if (started && n + strikes.filter(function (x) { return !x.res; }).length < 3 && t > next && !strikes.some(function (x) { return !x.res; })) strikes.push({ t0: t, dir: R[n + 60] > 0.5 ? 1 : -1, y: cy + (R[n + 70] - 0.5) * h * 0.3 });
          kick *= 0.88;
          // kiếm tre: nằm chéo giữa khung, lắc theo cú đỡ
          var ang = -0.5 + kick * 0.12 + Math.sin(t * 1.6) * 0.02 + (S.done ? 0.35 : 0), L = Math.min(w * 0.42, h * 0.9);
          g.save(); g.translate(cx + kick * 6, cy + Math.abs(kick) * 4); g.rotate(ang);
          var bd = g.createLinearGradient(0, -6, 0, 6); bd.addColorStop(0, '#d9cf8f'); bd.addColorStop(0.5, '#b7a65c'); bd.addColorStop(1, '#6f6430'); g.fillStyle = bd;
          g.beginPath(); g.moveTo(-L * 0.55, -5); g.lineTo(L * 0.55, -4); g.lineTo(L * 0.6, 0); g.lineTo(L * 0.55, 4); g.lineTo(-L * 0.55, 5); g.closePath(); g.fill();
          g.strokeStyle = 'rgba(70,60,25,.8)'; g.lineWidth = 1.5; for (var nd = -0.4; nd < 0.6; nd += 0.22) { g.beginPath(); g.moveTo(L * nd, -5); g.lineTo(L * nd, 5); g.stroke(); }
          g.fillStyle = '#3d3424'; g.fillRect(-L * 0.78, -6, L * 0.24, 12); g.strokeStyle = 'rgba(200,180,120,.4)'; for (var wr = 0; wr < 6; wr++) { g.beginPath(); g.moveTo(-L * 0.76 + wr * L * 0.04, -6); g.lineTo(-L * 0.74 + wr * L * 0.04, 6); g.stroke(); }
          g.restore();
          // vệt đòn lao tới từ một phía
          strikes.forEach(function (st) {
            var u = (t - st.t0) / 1.05, dir = st.dir, sx = dir > 0 ? -w * 0.1 : w * 1.1, ex = cx, x = sx + (ex - sx) * Math.min(1, u), y = st.y + (cy - st.y) * Math.min(1, u);
            if (!st.res && u >= 1) hit(S, st, false);
            var fade = st.res ? Math.max(0, 1 - (t - st.rt) / 0.4) : Math.min(1, u * 3);
            if (st.res === 'miss') { x = ex + dir * w * 0.6 * Math.min(1, (t - st.rt) / 0.3); }
            if (fade <= 0) return;
            var tail = dir * -w * 0.28, gr = g.createLinearGradient(x + tail, y, x, y); gr.addColorStop(0, 'rgba(255,200,140,0)'); gr.addColorStop(1, 'rgba(255,236,210,' + (0.95 * fade).toFixed(3) + ')');
            g.strokeStyle = gr; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(x + tail, y + 6); g.quadraticCurveTo(x + tail * 0.4, y - 4, x, y); g.stroke();
            g.fillStyle = 'rgba(255,240,220,' + (0.9 * fade).toFixed(3) + ')'; g.beginPath(); g.moveTo(x + dir * 12, y); g.lineTo(x - dir * 6, y - 9); g.lineTo(x - dir * 6, y + 9); g.closePath(); g.fill();
          });
          strikes = strikes.filter(function (st) { return !st.res || t - st.rt < 0.5; });
          sparks = sparks.filter(function (p) { var a = t - p.t; if (a > 0.6) return false; var x = p.x + p.vx * a, y = p.y + p.vy * a + 400 * a * a; g.strokeStyle = 'rgba(255,214,140,' + (1 - a / 0.6).toFixed(3) + ')'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x - p.vx * 0.02, y - p.vy * 0.02); g.stroke(); return true; });
          // ba dấu đòn ở góc
          for (var m = 0; m < 3; m++) { g.beginPath(); g.arc(w - 22 - (2 - m) * 16, 20, 4.5, 0, 7); if (m < n) { g.fillStyle = marks[m] ? 'rgba(255,214,150,.9)' : 'rgba(200,200,190,.35)'; g.fill(); } else { g.strokeStyle = 'rgba(220,220,210,.4)'; g.lineWidth = 1; g.stroke(); } }
        },
        down: function (S) { if (!started && !S.done) { started = true; next = performance.now() / 1000 + 0.45; S.say('vuốt theo hướng vệt đòn'); } swipe = 0; },
        move: function (S, p, dx) {
          swipe += dx; if (Math.abs(swipe) < 26) return;
          var t = performance.now() / 1000, st = strikes.filter(function (x) { return !x.res; })[0];
          if (st && t - st.t0 > 0.25) hit(S, st, Math.sign(swipe) === st.dir);
          swipe = 0;
        },
        up: function () { swipe = 0; }
      };
    }

    /* ---- ch06: kéo căng sợi xích (của Leon) ---- */
    function CHAIN() {
      var R = seeds(60), pull = 0, holding = false, fired = 0, lastC = 0, lastP = 0;
      return {
        draw: function (S, t) {
          var g = S.g, w = S.w, h = S.h;
          var bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, S.dark() ? '#060908' : '#121a17'); bg.addColorStop(1, S.dark() ? '#141a17' : '#26312b'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
          for (var s = 0; s < 20; s++) { g.fillStyle = 'rgba(220,230,225,.35)'; g.fillRect(R[s] * w, h * (0.35 + R[s + 20] * 0.25), 1.2, 1.2); }
          // tán đa và rễ phụ buông xuống
          g.fillStyle = S.dark() ? '#020403' : '#0a100d';
          for (var b = 0; b < 14; b++) { g.beginPath(); g.arc(R[b] * w * 1.1 - w * 0.05, h * (0.02 + R[b + 14] * 0.12), w * (0.08 + R[b + 28] * 0.08), 0, 7); g.fill(); }
          g.strokeStyle = S.dark() ? 'rgba(30,34,30,.9)' : 'rgba(20,28,24,.9)'; g.lineWidth = 1.2;
          for (var r = 0; r < 12; r++) { var rx = R[r + 40] * w; g.beginPath(); g.moveTo(rx, h * 0.1); g.quadraticCurveTo(rx + Math.sin(t * 0.8 + r) * 4, h * 0.3, rx + Math.sin(t * 0.6 + r) * 6, h * (0.3 + R[r] * 0.3)); g.stroke(); }
          if (!holding && !fired) pull *= 0.86;
          var ten = fired ? 1 : clamp(Math.abs(pull) / (w * 0.32), 0, 1), ax = w * 0.5, ay = -6, ex = w * 0.5 + pull, ey = h * (0.72 - ten * 0.08);
          if (fired) { var ft = t - fired; ex = w * 0.5 + (pull > 0 ? 1 : -1) * w * 0.32; if (ft > 1.2) { ey = h * 0.72; } }
          var sway = (1 - ten) * Math.sin(t * 1.4) * w * 0.03, mx = (ax + ex) / 2 + sway - (1 - ten) * pull * 0.3, my = (ay + ey) / 2 + (1 - ten) * h * 0.18;
          var tr = Math.sin(t * 70) * ten * (holding ? 1.6 : 0);
          // mắt xích dọc theo đường cong
          var N = 26, prev = null;
          for (var i = 0; i <= N; i++) {
            var u = i / N, x = (1 - u) * (1 - u) * ax + 2 * (1 - u) * u * mx + u * u * ex, y = (1 - u) * (1 - u) * ay + 2 * (1 - u) * u * my + u * u * ey;
            x += Math.sin(u * Math.PI) * tr;
            if (prev) {
              var an = Math.atan2(y - prev[1], x - prev[0]), lx = (x + prev[0]) / 2, ly = (y + prev[1]) / 2, len = Math.hypot(x - prev[0], y - prev[1]);
              g.save(); g.translate(lx, ly); g.rotate(an);
              var hot = fired ? Math.max(0, 1 - (t - fired) / 1.2) : ten * ten;
              g.strokeStyle = i % 2 ? '#59646a' : '#3d464b'; g.lineWidth = i % 2 ? 3 : 2.2; g.shadowColor = 'rgba(150,175,190,.25)'; g.shadowBlur = 4;
              g.beginPath(); if (i % 2) g.ellipse(0, 0, len * 0.62, 4.2, 0, 0, 7); else { g.moveTo(-len * 0.6, 0); g.lineTo(len * 0.6, 0); } g.stroke();
              if (hot > 0.05) { g.strokeStyle = 'rgba(220,230,240,' + (0.5 * hot).toFixed(3) + ')'; g.lineWidth = 1; g.beginPath(); g.ellipse(0, -1, len * 0.5, 2.6, 0, 3.4, 6); g.stroke(); }
              g.restore();
            }
            prev = [x, y];
          }
          // vòng sắt ở đầu xích
          g.strokeStyle = '#6b737b'; g.lineWidth = 4; g.beginPath(); g.arc(ex, ey + 10, 10, 0, 7); g.stroke();
          if (fired && t - fired < 0.6) { var fa = 1 - (t - fired) / 0.6, fl = g.createRadialGradient(ex, ey, 0, ex, ey, w * 0.5); fl.addColorStop(0, 'rgba(230,240,250,' + (0.6 * fa).toFixed(3) + ')'); fl.addColorStop(1, 'rgba(230,240,250,0)'); g.fillStyle = fl; g.fillRect(0, 0, w, h); }
          if (holding) S.kick(100);
        },
        down: function () { holding = true; },
        move: function (S, p, dx) {
          if (fired || S.done) return; pull = clamp(pull + dx, -S.w * 0.36, S.w * 0.36);
          var ten = Math.abs(pull) / (S.w * 0.32), now = performance.now();
          if (Math.abs(pull - lastP) > 10 && now - lastC > 55) { lastC = now; lastP = pull; snd(function (n) { var o = out(1); tn(o, 'triangle', 1800 + ten * 1800 + Math.random() * 600, 1500 + ten * 1500, 0.05 + ten * 0.05, 0.08, n); nz(o, 'bandpass', 3500 + ten * 2000, 3000, 6, 0.06, 0.03, n); }); }
          if (ten >= 1) this.fire(S);
        },
        up: function () { holding = false; },
        fire: function (S) {
          fired = performance.now() / 1000; holding = false; S.finish();
          snd(function (n) { var o = out(1); nz(o, 'bandpass', 1500, 6000, 6, 0.35, 0.3, n); for (var k = 0; k < 6; k++) tn(o, 'triangle', 2400 + Math.random() * 1800, 2000, 0.06, 0.1, n + 0.05 + k * 0.04); });
          // nối vào hiệu ứng xích của đoạn sau, đánh dấu đoạn đó đã chạy để lúc cuộn tới không chạy lại
          // ch06 (bước 5): đoạn sau có thể là 'leon-eye-chains' (mắt Leon rồi xích cũ): khi đó bỏ vòng kích hoạt, mắt bật ngay
          var ps = document.querySelectorAll('.scene p[data-fx="chains"], .scene p[data-fx="leon-eye-chains"]'), me = S.box.getBoundingClientRect().top, kind = 'chains';
          for (var i = 0; i < ps.length; i++) if (ps[i].getBoundingClientRect().top > me) { ps[i].dataset.fired = '1'; kind = ps[i].dataset.fx; break; }
          if (kind === 'chains') { if (window.a07cast) window.a07cast(); setTimeout(function () { if (window.a07shot) window.a07shot('chains'); }, 850); }
          else setTimeout(function () { if (window.a07shot) window.a07shot(kind); }, 200);
          S.kick(1800);
        }
      };
    }

    /* ---- ch05: giữ tay hơ bếp lửa; lửa bùng lên, hơi ấm loang ra mép màn hình ---- */
    function HEARTH() {
      var R = seeds(120), hv = 0, holding = false, held = 0, lastT = 0, warm = null, breath = null, nextC = 0, emb = [];
      return {
        init: function () { warm = document.createElement('div'); warm.className = 'act-warm'; warm.setAttribute('aria-hidden', 'true'); document.body.appendChild(warm); },
        draw: function (S, t) {
          var g = S.g, w = S.w, h = S.h, dt = lastT ? Math.min(0.1, t - lastT) : 0; lastT = t;
          hv = holding ? Math.min(1, hv + dt * 0.45) : Math.max(0, hv - dt * 0.22);
          if (holding) { held += dt; if (held > 2.2 && !S.done) S.finish(); }
          warm.style.opacity = (hv * 0.85).toFixed(3);
          if (breath) breath.set(0.012 + hv * 0.05, 700 + hv * 900);
          var cx = w / 2, by = h * 0.8;
          var bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#120b07'); bg.addColorStop(1, '#22150c'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
          // ánh lửa hắt lên vách đất
          var fl = 0.85 + 0.1 * Math.sin(t * 9) + 0.06 * Math.sin(t * 23 + 1), gl = g.createRadialGradient(cx, by - h * 0.15, 0, cx, by - h * 0.15, Math.max(w, h) * (0.45 + hv * 0.4));
          gl.addColorStop(0, 'rgba(255,170,80,' + ((0.35 + hv * 0.35) * fl).toFixed(3) + ')'); gl.addColorStop(1, 'rgba(255,120,40,0)'); g.fillStyle = gl; g.fillRect(0, 0, w, h);
          // vách đất trát rơm
          g.strokeStyle = 'rgba(180,120,60,' + (0.08 + hv * 0.08).toFixed(3) + ')'; g.lineWidth = 1; for (var s = 0; s < 40; s++) { var x = R[s] * w, y = R[s + 40] * h * 0.7; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 6 + R[s + 80] * 10, y + (R[s] - 0.5) * 4); g.stroke(); }
          // ngọn lửa: nhiều lưỡi lửa chồng lên nhau
          var H0 = h * (0.2 + hv * 0.3) * fl;
          for (var k = 0; k < 7; k++) {
            var off = (k - 3) * w * 0.022, hh = H0 * (1 - Math.abs(k - 3) * 0.17) * (0.85 + 0.25 * Math.sin(t * (7 + k) + k * 2)), wd = w * (0.035 + hv * 0.015);
            var fg = g.createLinearGradient(0, by, 0, by - hh); fg.addColorStop(0, 'rgba(255,240,180,.95)'); fg.addColorStop(0.35, 'rgba(255,170,60,.85)'); fg.addColorStop(1, 'rgba(200,60,20,0)');
            g.fillStyle = fg; g.beginPath(); g.moveTo(cx + off - wd, by); g.quadraticCurveTo(cx + off - wd * 0.8, by - hh * 0.5, cx + off + Math.sin(t * 5 + k) * wd * 0.6, by - hh); g.quadraticCurveTo(cx + off + wd * 0.8, by - hh * 0.5, cx + off + wd, by); g.fill();
          }
          // than hồng và ba ông đầu rau đất
          [-1, 1, 0].forEach(function (i) { var sx = cx + i * w * 0.1, sw = w * 0.03, top = by - h * (i ? 0.07 : 0.045), sy = i ? by + 4 : by + 12, sg = g.createLinearGradient(0, top, 0, sy + 8); sg.addColorStop(0, 'rgba(190,110,60,' + (0.7 + hv * 0.3).toFixed(3) + ')'); sg.addColorStop(0.5, '#5a3320'); sg.addColorStop(1, '#2a170d'); g.fillStyle = sg;
            g.beginPath(); g.moveTo(sx - sw, sy + 8); g.quadraticCurveTo(sx - sw * 0.9, top + 4, sx - sw * 0.35, top); g.lineTo(sx + sw * 0.35, top); g.quadraticCurveTo(sx + sw * 0.9, top + 4, sx + sw, sy + 8); g.closePath(); g.fill(); });
          for (var e = 0; e < 14; e++) { g.fillStyle = 'rgba(255,' + (90 + R[e] * 80 | 0) + ',30,' + (0.5 + 0.4 * Math.sin(t * 3 + e)).toFixed(3) + ')'; g.beginPath(); g.arc(cx + (R[e + 20] - 0.5) * w * 0.18, by + 2 + R[e + 40] * 6, 2 + R[e + 60] * 2, 0, 7); g.fill(); }
          // tàn lửa bay lên, nhiều hơn khi lửa bùng
          if (Math.random() < 0.15 + hv * 0.6) emb.push({ x: cx + (Math.random() - 0.5) * w * 0.12, t: t, v: 40 + Math.random() * 70, s: Math.random() * 6 });
          emb = emb.filter(function (p) { var a = t - p.t; if (a > 2.2) return false; g.fillStyle = 'rgba(255,190,90,' + (1 - a / 2.2).toFixed(3) + ')'; g.fillRect(p.x + Math.sin(a * 3 + p.s) * 10, by - H0 * 0.5 - a * p.v, 2, 2); return true; });
          // tiếng lửa tí tách
          if (S.vis && t > nextC) { nextC = t + 0.05 + Math.random() * (0.5 - hv * 0.38); snd(function (n) { var o = out(1, (Math.random() - 0.5) * 0.6); nz(o, 'bandpass', 2000 + Math.random() * 3000, 2500, 3, 0.025 + hv * 0.08 * Math.random(), 0.01 + Math.random() * 0.02, n); }); }
        },
        down: function (S, p, dn) { holding = true; if (!breath) breath = hum('bandpass', 800, 0.8); snd(function (n) { var o = out(1); nz(o, 'bandpass', 500, 2600, 1, 0.12, 0.5, n); }); },
        move: function (S, p, dx, dy, dn) { if (dn.far > 16) holding = false; },
        up: function () { holding = false; },
        hide: function () { holding = false; hv = 0; if (warm) warm.style.opacity = 0; if (breath) { breath.stop(); breath = null; } }
      };
    }

    /* ---- ch07: rê ngón tay lần theo vệt máu trên bờ ruộng ---- */
    function BLOOD() {
      var R = seeds(160), drops = [], trail = [], lastTick = 0, mud = null, lastX = null;
      function path(S, x) { return S.h * 0.55 + Math.sin(x / S.w * 5.2) * S.h * 0.06; }
      return {
        fit: function (S) {
          drops = []; var w = S.w;
          // cụm đầu thưa dần, khúc giữa trống trơn, rồi một cụm dày hơn ở chỗ con bờ uốn cong
          var x = w * 0.05, gap = w * 0.022, i = 0;
          while (x < w * 0.44) { drops.push({ x: x, dy: (R[i] - 0.5) * 10, r: 2.6 + R[i + 40] * 2.4, a: 0 }); x += gap; gap *= 1.17; i++; }
          for (var k = 0; k < 11; k++) drops.push({ x: w * (0.76 + R[k + 80] * 0.1), dy: (R[k + 100] - 0.5) * 16, r: 2.4 + R[k + 120] * 3.4, a: 0 });
        },
        draw: function (S, t) {
          var g = S.g, w = S.w, h = S.h, dk = S.dark();
          var sky = g.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, dk ? '#1d2620' : '#7e8f74'); sky.addColorStop(1, dk ? '#232a22' : '#93a083'); g.fillStyle = sky; g.fillRect(0, 0, w, h);
          // mạ hai bên
          g.strokeStyle = dk ? 'rgba(90,120,80,.5)' : 'rgba(70,110,60,.55)'; g.lineWidth = 1.2;
          for (var s = 0; s < 70; s++) { var x = R[s] * w, y0 = R[s + 70] < 0.5 ? h * (0.08 + R[s + 70] * 0.5) : h * (0.72 + (R[s + 70] - 0.5) * 0.5); g.beginPath(); g.moveTo(x, y0 + 10); g.quadraticCurveTo(x + 2, y0, x + 4 + Math.sin(t + s) * 2, y0 - 6); g.stroke(); }
          // con bờ đất bùn mềm
          g.fillStyle = dk ? '#3b3226' : '#7a6448'; g.beginPath(); g.moveTo(0, path(S, 0) - h * 0.1);
          for (var px = 0; px <= w; px += 8) g.lineTo(px, path(S, px) - h * 0.1); for (px = w; px >= 0; px -= 8) g.lineTo(px, path(S, px) + h * 0.1); g.fill();
          g.fillStyle = dk ? 'rgba(20,16,10,.35)' : 'rgba(60,45,28,.3)'; for (var m = 0; m < 50; m++) { var mx = R[m + 20] * w; g.beginPath(); g.ellipse(mx, path(S, mx) + (R[m + 50] - 0.5) * h * 0.16, 6 + R[m] * 10, 2, 0, 0, 7); g.fill(); }
          // vệt ngón tay rê qua
          trail = trail.filter(function (p) { return t - p[2] < 1.4; });
          if (trail.length > 1) { g.lineCap = 'round'; for (var i = 1; i < trail.length; i++) { g.strokeStyle = 'rgba(255,240,220,' + (0.12 * (1 - (t - trail[i][2]) / 1.4)).toFixed(3) + ')'; g.lineWidth = 18; g.beginPath(); g.moveTo(trail[i - 1][0], trail[i - 1][1]); g.lineTo(trail[i][0], trail[i][1]); g.stroke(); } }
          // giọt máu nâu sẫm
          drops.forEach(function (d) {
            if (!d.t) return; var a = Math.min(1, (t - d.t) / 0.35), y = path(S, d.x) + d.dy;
            g.fillStyle = 'rgba(' + (dk ? '96,34,26' : '74,26,18') + ',' + (0.9 * a).toFixed(3) + ')'; g.beginPath(); g.ellipse(d.x, y, d.r * (0.6 + 0.4 * a), d.r * 0.75 * (0.6 + 0.4 * a), 0.3, 0, 7); g.fill();
            g.fillStyle = 'rgba(60,20,14,' + (0.4 * a).toFixed(3) + ')'; g.beginPath(); g.arc(d.x + d.r * 0.9, y - d.r * 0.4, d.r * 0.3, 0, 7); g.fill();
          });
          if (trail.length) S.kick(300);
        },
        down: function (S, p) { lastX = p[0]; if (!mud) mud = hum('lowpass', 1300, 0.7); this.move(S, p, 0, 0); },
        move: function (S, p, dx) {
          var t = performance.now() / 1000; trail.push([p[0], p[1], t]);
          var sp = Math.abs(dx); if (mud) mud.set(Math.min(0.06, sp * 0.004));
          var x0 = Math.min(lastX, p[0]) - 16, x1 = Math.max(lastX, p[0]) + 16; lastX = p[0];
          drops.forEach(function (d) {
            if (d.t || d.x < x0 || d.x > x1) return; d.t = t;
            var now = performance.now(); if (now - lastTick > 45) { lastTick = now; snd(function (n) { var o = out(1, d.x / S.w * 1.4 - 0.7); nz(o, 'bandpass', 2300 + Math.random() * 800, 1900, 2.5, 0.09, 0.025, n); }); }
          });
          if (drops.every(function (d) { return d.t; })) S.finish();
          S.kick(1500);
        },
        up: function () { if (mud) { mud.stop(); mud = null; } lastX = null; },
        auto: function () { var t = performance.now() / 1000; drops.forEach(function (d) { if (!d.t) d.t = t; }); }
      };
    }

    /* ---- ch08: gõ ba tiếng lên khung cửa gỗ ---- */
    function KNOCK() {
      var R = seeds(120), knocks = [], shake = 0, last = 0, dust = [], opened = 0;
      return {
        draw: function (S, t) {
          var g = S.g, w = S.w, h = S.h, dk = S.dark(); shake *= 0.82;
          g.save(); g.translate(Math.sin(t * 80) * shake * 2.4, 0);
          // ván cửa gỗ dọc, vân gỗ, khung cột bên trái
          var pw = w / 6;
          for (var i = 0; i < 7; i++) {
            var x = i * pw - pw * 0.3, base = dk ? 52 + R[i] * 14 : 112 + R[i] * 24;
            g.fillStyle = 'rgb(' + (base | 0) + ',' + (base * 0.72 | 0) + ',' + (base * 0.48 | 0) + ')'; g.fillRect(x, 0, pw, h);
            g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke();
            g.strokeStyle = 'rgba(30,18,8,.22)'; g.lineWidth = 1;
            for (var v = 0; v < 6; v++) { var vx = x + pw * (0.12 + v * 0.15); g.beginPath(); g.moveTo(vx, 0); for (var y = 0; y <= h; y += 12) g.lineTo(vx + Math.sin(y / 40 + R[i * 6 + v] * 6) * 3, y); g.stroke(); }
            if (R[i + 60] > 0.5) { var ky = R[i + 70] * h; g.strokeStyle = 'rgba(30,18,8,.4)'; g.beginPath(); g.ellipse(x + pw * 0.5, ky, 5, 9, 0, 0, 7); g.stroke(); }
          }
          g.fillStyle = dk ? '#2b1d12' : '#5a3d24'; g.fillRect(0, 0, w * 0.16, h); g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(w * 0.15, 0, 3, h);
          // ánh ngày trắng đục hắt chéo
          var lg = g.createLinearGradient(0, 0, w, h); lg.addColorStop(0, 'rgba(255,250,235,.10)'); lg.addColorStop(1, 'rgba(0,0,0,.15)'); g.fillStyle = lg; g.fillRect(0, 0, w, h);
          g.restore();
          // cửa hé: khe tối bên phải, trong có ánh bếp âm ỉ (không có ai)
          if (opened) { var ou = clamp((t - opened - 0.6) / 2, 0, 1), gw = w * 0.14 * ou * ou; if (gw > 0.5) { g.fillStyle = '#0b0705'; g.fillRect(w - gw, 0, gw, h); var em = g.createRadialGradient(w - gw * 0.4, h * 0.85, 0, w - gw * 0.4, h * 0.85, h * 0.4); em.addColorStop(0, 'rgba(255,140,60,' + (0.35 * ou).toFixed(3) + ')'); em.addColorStop(1, 'rgba(255,140,60,0)'); g.fillStyle = em; g.fillRect(w - gw, 0, gw, h); g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(w - gw - 6, 0, 6, h); } if (ou < 1) S.kick(300); }
          // vòng gợn và bụi rơi ở chỗ gõ
          knocks.forEach(function (k) { var a = t - k.t; if (a > 0.8) return; g.strokeStyle = 'rgba(255,236,200,' + (0.5 * (1 - a / 0.8)).toFixed(3) + ')'; g.lineWidth = 2; g.beginPath(); g.arc(k.x, k.y, 8 + a * 70, 0, 7); g.stroke(); });
          dust = dust.filter(function (d) { var a = t - d.t; if (a > 1.6) return false; g.fillStyle = 'rgba(230,215,190,' + (0.7 * (1 - a / 1.6)).toFixed(3) + ')'; g.fillRect(d.x + Math.sin(a * 4 + d.s) * 6, d.y + a * a * 60 + a * 20, 1.6, 1.6); return true; });
          for (var m = 0; m < 3; m++) { g.beginPath(); g.arc(w - 22 - (2 - m) * 16, 20, 4.5, 0, 7); if (m < knocks.length) { g.fillStyle = 'rgba(255,226,170,.9)'; g.fill(); } else { g.strokeStyle = 'rgba(255,240,220,.5)'; g.lineWidth = 1; g.stroke(); } }
        },
        down: function (S, p) {
          var now = performance.now() / 1000; if (knocks.length >= 3 || now - last < 0.16) return; last = now;
          knocks.push({ x: p[0], y: p[1], t: now }); shake = 1;
          for (var i = 0; i < 10; i++) dust.push({ x: p[0] + (Math.random() - 0.5) * 30, y: p[1] + (Math.random() - 0.5) * 20, t: now, s: Math.random() * 6 });
          // tiếng gõ gỗ "cốc": khô, gọn, không trầm
          snd(function (n) { var o = out(1); nz(o, 'bandpass', 1150, 900, 3.5, 0.8, 0.05, n); tn(o, 'triangle', 760, 520, 0.22, 0.06, n); nz(o, 'bandpass', 2600, 2200, 5, 0.25, 0.02, n); });
          if (knocks.length === 3) { opened = now + 0.4; S.finish(); }
          S.kick(1500);
        }
      };
    }

    /* ---- ch08: vuốt ngang để quấn cuộn băng quanh cánh tay bầm ---- */
    function BANDAGE() {
      var R = seeds(60), wp = 0, dsp = 0, rust = null, done = 0, N = 8;
      return {
        draw: function (S, t) {
          var g = S.g, w = S.w, h = S.h, dk = S.dark(), cy = h * 0.52, rad = h * 0.17;
          dsp += (wp - dsp) * 0.2;
          var bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, dk ? '#15130f' : '#3a332a'); bg.addColorStop(1, dk ? '#211c16' : '#4b4236'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
          // cánh tay: một khối tròn dài tím bầm chạy ngang qua khung, hai đầu chìm vào bóng tối
          var ag = g.createLinearGradient(0, cy - rad, 0, cy + rad); ag.addColorStop(0, '#5a3348'); ag.addColorStop(0.3, '#8a4a63'); ag.addColorStop(0.55, '#6b3550'); ag.addColorStop(1, '#2a1622');
          g.fillStyle = ag; g.fillRect(0, cy - rad, w, rad * 2);
          var bz = g.createRadialGradient(w * 0.55, cy, 0, w * 0.55, cy, w * 0.35); bz.addColorStop(0, 'rgba(70,20,45,.55)'); bz.addColorStop(1, 'rgba(70,20,45,0)'); g.fillStyle = bz; g.fillRect(0, cy - rad, w, rad * 2);
          var ed = g.createLinearGradient(0, 0, w, 0); ed.addColorStop(0, bg2(dk)); ed.addColorStop(0.12, 'rgba(0,0,0,0)'); ed.addColorStop(0.88, 'rgba(0,0,0,0)'); ed.addColorStop(1, bg2(dk)); g.fillStyle = ed; g.fillRect(0, cy - rad - 2, w, rad * 2 + 4);
          // các vòng băng chéo, vòng đang quấn mọc dần từ trên xuống
          var x0 = w * 0.16, span = w * 0.66, bw = span / N * 0.92, sl = rad * 0.9, f = dsp * N;
          for (var i = 0; i < N; i++) {
            var p = clamp(f - i, 0, 1); if (p <= 0) break;
            var x = x0 + i * span / N, yt = cy - rad - 2, yb = cy - rad - 2 + (rad * 2 + 4) * p, xb = x + sl * p;
            var bgd = g.createLinearGradient(0, cy - rad, 0, cy + rad); bgd.addColorStop(0, '#f4efe2'); bgd.addColorStop(0.45, '#fffdf6'); bgd.addColorStop(1, '#b9b2a2'); g.fillStyle = bgd;
            g.beginPath(); g.moveTo(x, yt); g.lineTo(x + bw, yt); g.lineTo(xb + bw, yb); g.lineTo(xb, yb); g.closePath(); g.fill();
            g.strokeStyle = 'rgba(110,100,85,.55)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x, yt); g.lineTo(xb, yb); g.moveTo(x + bw, yt); g.lineTo(xb + bw, yb); g.stroke();
            for (var th = 0; th < 3; th++) { g.strokeStyle = 'rgba(160,150,130,.18)'; g.beginPath(); g.moveTo(x + bw * (0.25 + th * 0.25), yt); g.lineTo(xb + bw * (0.25 + th * 0.25), yb); g.stroke(); }
            if (p < 1 && !done) { g.fillStyle = '#efe8d8'; g.beginPath(); g.ellipse(xb + bw / 2, yb + 6, bw * 0.5, 9, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(120,110,95,.5)'; g.beginPath(); g.ellipse(xb + bw / 2, yb + 6, bw * 0.18, 4, 0, 0, 7); g.stroke(); }
          }
          // nút buộc cuối cùng, rồi một lớp mát như nước giếng lướt qua
          if (done) {
            var kx = x0 + span + sl * 0.5, a = clamp((t - done) / 0.4, 0, 1); g.strokeStyle = 'rgba(240,235,222,' + a + ')'; g.lineWidth = 5; g.lineCap = 'round';
            g.beginPath(); g.ellipse(kx - 8, cy - rad * 0.2, 9, 6, -0.6, 0, 7); g.stroke(); g.beginPath(); g.ellipse(kx + 8, cy - rad * 0.2, 9, 6, 0.6, 0, 7); g.stroke();
            g.beginPath(); g.moveTo(kx, cy - rad * 0.2); g.lineTo(kx - 6, cy + rad * 0.5); g.moveTo(kx, cy - rad * 0.2); g.lineTo(kx + 9, cy + rad * 0.45); g.stroke();
            var u = (t - done - 0.3) / 1.6; if (u > 0 && u < 1) { var sx = x0 - w * 0.1 + u * (span + w * 0.3), cg = g.createLinearGradient(sx - 60, 0, sx + 60, 0); cg.addColorStop(0, 'rgba(170,220,235,0)'); cg.addColorStop(0.5, 'rgba(190,232,245,.45)'); cg.addColorStop(1, 'rgba(170,220,235,0)'); g.fillStyle = cg; g.fillRect(sx - 60, cy - rad - 4, 120, rad * 2 + 8); S.kick(300); }
          }
          if (Math.abs(wp - dsp) > 0.002) S.kick(200);
        },
        down: function () { if (!rust && !done) rust = hum('bandpass', 3200, 1.1); },
        move: function (S, p, dx) {
          if (done) return; var before = Math.floor(wp * N); wp = clamp(wp + Math.abs(dx) / (S.w * 2.4), 0, 1);
          if (rust) rust.set(Math.min(0.09, Math.abs(dx) * 0.006), 2600 + Math.abs(dx) * 60);
          if (Math.floor(wp * N) > before) snd(function (n) { nz(out(1), 'bandpass', 1800, 3400, 1.5, 0.06, 0.12, n); });
          if (wp >= 1) this.tie(S, true);
          S.kick(800);
        },
        up: function () { if (rust) { rust.stop(); rust = null; } },
        tie: function (S, sound) { if (done) return; done = performance.now() / 1000; wp = 1; S.finish(); if (rust) { rust.stop(); rust = null; } if (sound) snd(function (n) { var o = out(1); nz(o, 'bandpass', 2400, 1600, 2, 0.18, 0.08, n); nz(o, 'highpass', 5000, 8000, 0.7, 0.05, 1.4, n + 0.3); }); S.kick(2500); },
        auto: function (S) { this.tie(S, false); }
      };
      function bg2(dk) { return dk ? '#1b1813' : '#433a30'; }
    }

    /* ================= chương 12 ================= */
    var WINE = '#a3243a', SPROUT = '#9fd486';
    function markFired(S, fx) { var ps = document.querySelectorAll('.scene p[data-fx="' + fx + '"]'), me = S.box.getBoundingClientRect().top; for (var i = 0; i < ps.length; i++) if (ps[i].getBoundingClientRect().top > me) { ps[i].dataset.fired = '1'; return; } }
    function lampBg(g, w, h, t, a) {
      g.fillStyle = '#060606'; g.fillRect(0, 0, w, h);
      var fl = 0.88 + 0.12 * Math.sin(t * 8) * Math.sin(t * 13), gl = g.createRadialGradient(w * 0.5, h * 0.05, 0, w * 0.5, h * 0.05, Math.max(w, h) * 0.8);
      gl.addColorStop(0, rgba('#ffc982', (a || 0.3) * fl)); gl.addColorStop(1, 'rgba(255,201,130,0)'); g.fillStyle = gl; g.fillRect(0, 0, w, h);
    }
    // mặt trước thẻ Remedy: bàn tay xoè đỡ chiếc lá non, ánh xanh non (hình in trên thẻ)
    function remedyFace(g, x, y, cw, chh, t, glowA) {
      g.save(); g.translate(x, y);
      var bg = g.createLinearGradient(-cw / 2, -chh / 2, cw / 2, chh / 2); bg.addColorStop(0, '#2c3436'); bg.addColorStop(0.6, '#191f22'); bg.addColorStop(1, '#101518');
      g.fillStyle = bg; rr(g, -cw / 2, -chh / 2, cw, chh, cw * 0.04); g.fill(); g.strokeStyle = '#3c4649'; g.lineWidth = 1; rr(g, -cw / 2 + 3, -chh / 2 + 3, cw - 6, chh - 6, cw * 0.035); g.stroke();
      var gl = g.createRadialGradient(0, -chh * 0.12, 0, 0, -chh * 0.12, cw * 0.35); gl.addColorStop(0, rgba(SPROUT, 0.35 * glowA)); gl.addColorStop(1, rgba(SPROUT, 0)); g.fillStyle = gl; g.fillRect(-cw / 2, -chh / 2, cw, chh);
      var s = cw / 856; g.scale(s, s); g.strokeStyle = '#c9cfc6'; g.lineWidth = 6; g.lineCap = 'round'; g.lineJoin = 'round';
      g.beginPath(); g.moveTo(-150, 40); g.quadraticCurveTo(-120, 120, 0, 125); g.quadraticCurveTo(120, 120, 150, 40); g.stroke(); // lòng bàn tay
      [-150, -95, -40, 15].forEach(function (fx, i) { g.beginPath(); g.moveTo(fx + (i ? 0 : 0), 40 + (i ? 10 : 0)); g.lineTo(fx - 20 + i * 4, -20 + i * 6); g.stroke(); }); // ngón tay
      g.beginPath(); g.moveTo(150, 40); g.quadraticCurveTo(200, 10, 215, -20); g.stroke(); // ngón cái
      g.strokeStyle = SPROUT; g.lineWidth = 5; g.beginPath(); g.moveTo(10, 100); g.quadraticCurveTo(15, 40, 0, -10); g.stroke(); // thân lá
      g.fillStyle = rgba(SPROUT, 0.6 + 0.3 * glowA); g.beginPath(); g.moveTo(0, -10); g.quadraticCurveTo(-70, -40, -60, -110); g.quadraticCurveTo(10, -90, 0, -10); g.fill();
      g.beginPath(); g.moveTo(5, 20); g.quadraticCurveTo(60, -10, 70, -70); g.quadraticCurveTo(20, -50, 5, 20); g.fill();
      g.fillStyle = '#9aa5a3'; g.font = 'italic 40px Literata, Georgia, serif'; g.textAlign = 'center'; g.fillText('Remedy', 0, 230);
      g.restore();
    }
    // mặt sau: vòng tròn rối, chữ PROJECT ARTOS 07
    function backFace(g, x, y, cw, chh, t) {
      g.save(); g.translate(x, y); g.fillStyle = '#1b2124'; rr(g, -cw / 2, -chh / 2, cw, chh, cw * 0.04); g.fill(); g.strokeStyle = '#3c4649'; g.lineWidth = 1; rr(g, -cw / 2 + 3, -chh / 2 + 3, cw - 6, chh - 6, cw * 0.035); g.stroke();
      var r = chh * 0.3; g.strokeStyle = 'rgba(160,176,180,.55)'; g.lineWidth = 1.2;
      for (var k = 0; k < 4; k++) { g.beginPath(); for (var i = 0; i <= 50; i++) { var u = i / 50 * 6.283, q = r * (0.7 + 0.18 * Math.sin(u * (3 + k) + k + t * 0.2)); g.lineTo(Math.cos(u) * q, -chh * 0.06 + Math.sin(u) * q); } g.stroke(); }
      g.fillStyle = '#6b787d'; g.font = Math.round(cw * 0.045) + 'px Literata, Georgia, serif'; g.textAlign = 'center'; g.fillText('PROJECT ARTOS 07', 0, chh * 0.38);
      g.restore();
    }
    function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
    function stoneRumble(v, dur) { snd(function (n) { nz(out(1), 'bandpass', 900, 600, 1.2, v * 0.8, dur, n); for (var k = 0; k < 6; k++) nz(out(1), 'bandpass', 900 + Math.random() * 900, 600, 3, v * 0.4, 0.05, n + Math.random() * dur); }); }

    /* ---- ch12 mở hòm: chạm ổ khoá là bật (lần này dễ hơn), vuốt lên lật nắp, chạm lật thẻ úp ---- */
    function CHEST() {
      var R = seeds(80), phase = 0, unT = 0, lid = 0, dsp = 0, flip = 0, flipT = 0, lastCreak = 0;
      return {
        draw: function (S, t) {
          var g = S.g, w = S.w, h = S.h; lampBg(g, w, h, t, 0.28);
          dsp += (lid - dsp) * 0.2; if (Math.abs(lid - dsp) > 0.002) S.kick(200);
          var cx = w / 2, cy = h * 0.62, cw = Math.min(w * 0.62, h * 1.05), chh = cw * 0.4, top = cy - chh / 2;
          // lòng hòm (thấy khi nắp mở)
          if (dsp > 0.02) {
            var ih = chh * 0.55 * dsp; g.fillStyle = '#0b0907'; g.fillRect(cx - cw / 2 + 6, top - ih, cw - 12, ih + 4);
            for (var k = 0; k < 5; k++) { g.fillStyle = 'rgba(80,76,70,' + (0.9 * dsp).toFixed(2) + ')'; g.beginPath(); g.ellipse(cx - cw * 0.35 + R[k] * cw * 0.7, top - ih * 0.25, 5 + R[k + 5] * 5, 4, 0, 0, 7); g.fill(); }
            g.fillStyle = 'rgba(150,128,96,' + dsp.toFixed(2) + ')'; g.beginPath(); g.ellipse(cx + cw * 0.3, top - ih * 0.3, cw * 0.06, ih * 0.15, 0, 0, 7); g.fill(); // túi vải
            if (phase >= 2) {
              var kw = cw * 0.34, kh = kw * 0.63, kx = cx, ky = top - ih * 0.45, sc = flip ? Math.abs(Math.cos(Math.min(1, (t - flipT) / 0.5) * Math.PI)) : 1, showFront = flip && t - flipT > 0.25;
              g.save(); g.translate(kx, ky); g.scale(Math.max(0.02, sc), 1); if (showFront) remedyFace(g, 0, 0, kw, kh, t, 0.6 + 0.4 * Math.sin(t * 2)); else backFace(g, 0, 0, kw, kh, t); g.restore();
              if (flip && t - flipT < 0.6) S.kick(200);
              this._card = [kx - kw / 2, ky - kh / 2, kw, kh];
            }
          }
          // thân hòm gỗ đen, đai sắt, vết búa
          g.fillStyle = '#16120e'; g.fillRect(cx - cw / 2, top, cw, chh);
          g.fillStyle = '#3e4244'; [0.12, 0.88].forEach(function (u) { g.fillRect(cx - cw / 2 + cw * u - 5, top, 10, chh); });
          g.strokeStyle = 'rgba(200,180,144,.2)'; g.lineWidth = 1; for (var m = 0; m < 10; m++) { g.beginPath(); g.arc(cx - cw * 0.4 + R[m + 20] * cw * 0.8, top + chh * (0.15 + R[m + 30] * 0.7), 1.5 + R[m + 40] * 2.5, 3.6, 5.8); g.stroke(); }
          // nắp: lật ngược lên (thu ngắn dần theo phối cảnh)
          var lh = chh * 0.45 * (1 - dsp * 1.6), ly = top - (dsp > 0.6 ? 0 : 0);
          if (Math.abs(lh) > 1) { g.fillStyle = dsp < 0.62 ? '#1d1915' : '#2a231c'; g.fillRect(cx - cw / 2, ly - Math.max(0, lh), cw, Math.abs(lh)); g.fillStyle = '#3e4244'; [0.12, 0.88].forEach(function (u) { g.fillRect(cx - cw / 2 + cw * u - 5, ly - Math.max(0, lh), 10, Math.abs(lh)); }); }
          if (phase === 1 && dsp < 0.05) { g.fillStyle = 'rgba(255,210,150,.5)'; g.fillRect(cx - cw / 2 + 10, top - 2, cw - 20, 2); } // khe hở sáng
          // ổ khoá
          var lockOpen = phase > 0, lx = cx, lyy = top + chh * 0.18;
          g.fillStyle = '#2a2a2a'; g.fillRect(lx - 11, lyy, 22, 20); g.strokeStyle = '#2a2a2a'; g.lineWidth = 4; g.beginPath(); g.arc(lx, lyy - (lockOpen ? 7 : 0), 7, Math.PI, 0); g.stroke();
          if (unT && t - unT < 1.2) { var u = Math.max(0, (t - unT) / 1.2); g.strokeStyle = rgba(WINE, 0.8 * (1 - u)); g.lineWidth = 2; g.beginPath(); g.arc(lx, lyy + 10, 10 + u * w * 0.4, 0, 7); g.stroke(); S.kick(200); }
          this._lock = [lx, lyy + 10];
        },
        up: function (S, dn, tap) {
          if (!tap) return;
          if (phase === 0) { phase = 1; unT = performance.now() / 1000; S.say('vuốt lên để lật nắp hòm'); snd(function (n) { var o = out(1); nz(o, 'bandpass', 3000, 2400, 3, 0.4, 0.04, n); nz(o, 'bandpass', 2000, 1600, 4, 0.3, 0.05, n + 0.07); }); if (window.a07cast) window.a07cast(true); if (window.a07shot) setTimeout(function () { window.a07shot('keyburst'); }, 250); if (window.a07power) { var tp = S.box.previousElementSibling; if (tp && tp.tagName === 'P') window.a07power(tp, 'clevia', 250); } S.kick(1500); return; }
          if (phase === 2 && !flip && this._card) { var c = this._card; if (dn.x > c[0] - 20 && dn.x < c[0] + c[2] + 20 && dn.y > c[1] - 20 && dn.y < c[1] + c[3] + 20) { flip = 1; flipT = performance.now() / 1000; S.say('Remedy'); if (window.a07sfx) a07sfx('flip'); S.finish(); S.kick(1500); } }
        },
        move: function (S, p, dx, dy) {
          if (phase !== 1) return; if (dy < 0) lid = clamp(lid - dy / (S.h * 0.35), 0, 1);
          var now = performance.now(); if (dy < -1 && now - lastCreak > 90) { lastCreak = now; snd(function (n) { var o = out(1); tn(o, 'sawtooth', 120 + lid * 80, 160 + lid * 90, 0.03, 0.12, n); nz(o, 'bandpass', 900, 700, 4, 0.03, 0.1, n); }); }
          if (lid >= 1) { phase = 2; S.say('chạm để lật tấm thẻ'); snd(function (n) { nz(out(1), 'lowpass', 900, 300, 1, 0.25, 0.15, n); }); }
          S.kick(400);
        }
      };
    }

    /* ---- ch12 giơ đèn: giữ tay để giơ cao, vòng sáng nở ra; buông thì bóng tối co lại, tiếng lệt sệt gần hơn ---- */
    function LAMP() {
      var R = seeds(60), lift = 0, holding = false, held = 0, lastT = 0, shuffle = null, nextS = 0;
      return {
        draw: function (S, t) {
          var g = S.g, w = S.w, h = S.h, dt = lastT ? Math.min(0.1, t - lastT) : 0; lastT = t;
          lift = holding ? Math.min(1, lift + dt * 1.4) : Math.max(0, lift - dt * 0.5);
          if (holding) { held += dt; if (held > 3 && !S.done) S.finish(); }
          g.fillStyle = '#040404'; g.fillRect(0, 0, w, h);
          var lx = w / 2, ly = h * (0.78 - 0.45 * lift), fl = 0.85 + 0.15 * Math.sin(t * 9) * Math.sin(t * 5.7), rad = Math.max(w, h) * (0.16 + 0.42 * lift) * fl;
          // vách hầm hiện ra trong vòng sáng
          for (var k = 0; k < 14; k++) { var x = R[k] * w, y = R[k + 14] * h, d = Math.hypot(x - lx, y - ly), lit = Math.max(0, 1 - d / rad); if (lit <= 0) continue; g.fillStyle = 'rgba(70,62,52,' + (0.8 * lit).toFixed(3) + ')'; g.beginPath(); g.ellipse(x, y, 20 + R[k + 28] * 40, 14 + R[k + 42] * 20, R[k] * 3, 0, 7); g.fill(); }
          var gl = g.createRadialGradient(lx, ly, 0, lx, ly, rad); gl.addColorStop(0, 'rgba(255,201,130,.55)'); gl.addColorStop(0.4, 'rgba(181,122,58,.22)'); gl.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gl; g.fillRect(0, 0, w, h);
          g.strokeStyle = '#3a3128'; g.lineWidth = 2; g.beginPath(); g.moveTo(lx, ly - 14); g.lineTo(lx, h + 10); g.stroke(); // quai và tay cầm chìm vào bóng
          g.fillStyle = 'rgba(40,32,24,.95)'; g.fillRect(lx - 9, ly - 14, 18, 26); g.fillStyle = 'rgba(255,226,168,' + fl.toFixed(2) + ')'; g.beginPath(); g.ellipse(lx, ly, 3.2, 7, 0, 0, 7); g.fill();
          // đốm đỏ ở mép tối: gần hơn khi đèn hạ xuống
          for (var e = 0; e < 5; e++) { var a = R[e + 50] * 6.283, d2 = rad * (1.05 + 0.25 * R[e + 30]) + (1 - lift) * 10, ex = lx + Math.cos(a) * d2 * 1.3, ey = ly + Math.sin(a) * d2 * 0.8; if (ex < 0 || ex > w || ey < 0 || ey > h) continue; var on = (1 - lift) * (Math.sin(t * 0.8 + e * 1.9) > -0.2 ? 1 : 0); if (on < 0.05) continue; g.fillStyle = 'rgba(194,40,30,' + (0.75 * on).toFixed(2) + ')'; g.fillRect(ex - 4, ey, 2.5, 2.5); g.fillRect(ex + 3, ey, 2.5, 2.5); }
          if (shuffle) shuffle.set(0.01 + 0.06 * (1 - lift), 400 + 200 * (1 - lift));
          if (S.vis && !shuffle && S.touched) shuffle = hum('lowpass', 500, 1);
          if (shuffle && t > nextS) { nextS = t + 0.5 + Math.random() * 0.9; snd(function (n) { var o = out(1, Math.random() * 1.6 - 0.8); nz(o, 'lowpass', 600, 300, 1, 0.03 + 0.12 * (1 - lift), 0.3, n); }); }
          if (holding || lift > 0) S.kick(200);
        },
        down: function () { holding = true; },
        up: function () { holding = false; },
        hide: function () { if (shuffle) { shuffle.stop(); shuffle = null; } }
      };
    }

    /* ---- ch12 thẻ Remedy: giữ tay lên thẻ, thẻ vỡ thành ánh sáng xanh non, vệt tím nhạt dần như mực bị nước rửa ---- */
    function REMEDY() {
      var R = seeds(120), hv = 0, holding = false, lastT = 0, broke = 0, parts = [], ring = null;
      return {
        draw: function (S, t) {
          var g = S.g, w = S.w, h = S.h, dt = lastT ? Math.min(0.1, t - lastT) : 0; lastT = t;
          if (!broke) hv = holding ? Math.min(1, hv + dt / 1.6) : Math.max(0, hv - dt * 0.8);
          if (ring) ring.set(0.03 * hv, 900 + hv * 1400);
          g.fillStyle = '#0a0c0d'; g.fillRect(0, 0, w, h);
          // vệt gân tím xanh (như mực thấm giấy), nhạt dần sau khi thẻ vỡ
          var vein = broke ? Math.max(0, 1 - (t - broke) / 3.2) : 1;
          if (vein > 0) { g.strokeStyle = 'rgba(96,70,140,' + (0.5 * vein).toFixed(3) + ')'; g.lineWidth = 2; for (var k = 0; k < 9; k++) { var x = R[k] * w, y = R[k + 9] * h; g.beginPath(); g.moveTo(x, y); for (var s = 0; s < 6; s++) { x += (R[(k * 6 + s) % 120] - 0.5) * 50; y += 14 + R[(k + s * 5) % 120] * 18; g.lineTo(x, y); } g.stroke(); } }
          var cw = Math.min(w * 0.55, h * 1.2), chh = cw * 0.63, cx = w / 2, cy = h / 2;
          if (!broke) {
            var j = holding ? hv * 1.5 : 0;
            remedyFace(g, cx + Math.sin(t * 50) * j, cy + Math.cos(t * 43) * j * 0.6, cw, chh, t, 0.4 + hv);
            if (hv > 0.3) { g.strokeStyle = 'rgba(214,246,196,' + ((hv - 0.3) * 1.2).toFixed(3) + ')'; g.lineWidth = 1.2; for (var c = 0; c < Math.floor(hv * 9); c++) { var a = R[c + 40] * 6.283, l = cw * 0.2 * hv; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * l, cy + Math.sin(a) * l * 0.6); g.lineTo(cx + Math.cos(a + 0.3) * l * 1.6, cy + Math.sin(a + 0.3) * l); g.stroke(); } }
            var gl = g.createRadialGradient(cx, cy, 0, cx, cy, cw * (0.5 + hv)); gl.addColorStop(0, rgba(SPROUT, 0.35 * hv)); gl.addColorStop(1, rgba(SPROUT, 0)); g.fillStyle = gl; g.fillRect(0, 0, w, h);
            if (hv >= 1) this.brk(S, cx, cy, cw, chh);
          } else {
            var u = t - broke;
            parts.forEach(function (p) { var x = p[0] + p[2] * u * 60, y = p[1] + p[3] * u * 60 - u * u * 30; var a = Math.max(0, 1 - u / 3); if (a <= 0) return; g.fillStyle = rgba(SPROUT, 0.8 * a); g.beginPath(); g.arc(x, y, p[4], 0, 7); g.fill(); });
            var gw = g.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.6); gw.addColorStop(0, rgba(SPROUT, 0.3 * Math.max(0, 1 - u / 4))); gw.addColorStop(1, rgba(SPROUT, 0)); g.fillStyle = gw; g.fillRect(0, 0, w, h);
            if (u < 4) S.kick(200);
          }
          if (holding) S.kick(200);
        },
        brk: function (S, cx, cy, cw, chh) {
          broke = performance.now() / 1000; holding = false; S.finish(); if (ring) { ring.stop(); ring = null; }
          for (var i = 0; i < 70; i++) parts.push([cx + (Math.random() - 0.5) * cw, cy + (Math.random() - 0.5) * chh, (Math.random() - 0.5) * 1.6, -0.4 - Math.random() * 1.2, 1 + Math.random() * 2.5]);
          markFired(S, 'remedy'); if (window.a07cast) window.a07cast(); setTimeout(function () { if (window.a07shot) window.a07shot('remedy'); }, 850);
        },
        down: function () { if (broke) return; holding = true; if (!ring) ring = hum('bandpass', 1200, 4); },
        up: function () { holding = false; if (ring) { ring.stop(); ring = null; } },
        hide: function () { if (ring) { ring.stop(); ring = null; } }
      };
    }

    /* ---- ch12 bức tường đá: áp tay giữ. Lúc đầu không có gì cả. Giữ tiếp thì từ rất sâu có gì đó đáp lại, đá trượt sang, nắng tràn vào ---- */
    function WALL() {
      var R = seeds(200), holding = false, held = 0, lastT = 0, open = 0, slide = 0, palm = null, prints = [], tried = 0, grind = null;
      var QUIET = 2.8, WAKE = 4.6;
      return {
        draw: function (S, t) {
          var g = S.g, w = S.w, h = S.h, dt = lastT ? Math.min(0.1, t - lastT) : 0; lastT = t;
          if (holding && !open) { held += dt; if (held >= WAKE) this.open(S); }
          if (open) slide = Math.min(1, slide + dt / 2.4);
          var wake = !open && held > QUIET ? (held - QUIET) / (WAKE - QUIET) : 0;
          var shx = wake ? Math.sin(t * 60) * wake * 2 : 0, shy = wake ? Math.cos(t * 47) * wake * 1.5 : 0;
          g.fillStyle = '#050505'; g.fillRect(0, 0, w, h);
          var fl = 0.85 + 0.15 * Math.sin(t * 10) * Math.sin(t * 6.1); g.save(); g.translate(shx, shy);
          var gl = g.createRadialGradient(w * 0.15, h * 0.95, 0, w * 0.15, h * 0.95, w * 0.9); gl.addColorStop(0, 'rgba(255,201,130,' + (0.32 * fl).toFixed(3) + ')'); gl.addColorStop(1, 'rgba(255,201,130,0)');
          // khe sáng phía sau tảng đá giữa
          var gx = w * 0.5, gw = w * 0.2, gy = h * 0.12, gh = h * 0.76;
          if (slide > 0) { var sw = gw * slide; g.fillStyle = '#fffaf0'; g.fillRect(gx - gw / 2, gy, sw, gh); g.fillStyle = 'rgba(90,58,42,.8)'; for (var b = 0; b < 3; b++) g.fillRect(gx - gw / 2 + gw * (b + 0.5) / 3 - 1, gy + gh * 0.2, 2, gh * 0.6 * Math.min(1, sw / (gw * (b + 0.5) / 3 + 1))); }
          // các tảng đá chèn chặt (tảng giữa trượt sang phải)
          for (var k = 0; k < 34; k++) {
            var x = R[k] * w, y = R[k + 34] * h, r = 22 + R[k + 68] * 34; if (Math.abs(x - gx) < gw * 0.7 && y > gy && y < gy + gh) continue;
            stone(g, x, y, r, k, 0.55);
          }
          g.fillStyle = gl; g.fillRect(0, 0, w, h);
          // tảng giữa
          var bx = gx - gw / 2 + gw * slide; g.fillStyle = '#3a3531'; g.fillRect(bx, gy, gw, gh); g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 1; for (var c = 0; c < 6; c++) { g.beginPath(); g.moveTo(bx + R[c + 100] * gw, gy + R[c + 110] * gh); g.lineTo(bx + R[c + 120] * gw, gy + R[c + 130] * gh); g.stroke(); }
          if (slide > 0) { g.strokeStyle = 'rgba(255,251,234,' + (0.6 * slide).toFixed(2) + ')'; g.lineWidth = 2; g.beginPath(); g.moveTo(bx, gy); g.lineTo(bx, gy + gh); g.stroke(); var beam = g.createLinearGradient(gx, 0, gx - w * 0.3, h); beam.addColorStop(0, 'rgba(255,251,234,' + (0.45 * slide).toFixed(2) + ')'); beam.addColorStop(1, 'rgba(255,251,234,0)'); g.fillStyle = beam; g.beginPath(); g.moveTo(gx - gw / 2, gy); g.lineTo(bx, gy); g.lineTo(bx - w * 0.1, h); g.lineTo(gx - gw * 2.2, h); g.fill(); }
          // vệt máu mảnh như sợi chỉ chỗ lòng bàn tay đã ép
          prints.forEach(function (p) { g.strokeStyle = 'rgba(140,30,34,' + Math.min(0.75, p[2]).toFixed(2) + ')'; g.lineWidth = 1; for (var q = 0; q < 4; q++) { g.beginPath(); g.moveTo(p[0] - 12 + q * 8, p[1] - 6); g.lineTo(p[0] - 10 + q * 8 + 2, p[1] + 10 + q * 3); g.stroke(); } });
          // bàn tay đang ép: chỗ đá tối lại; khi có gì đáp lại, một nhịp đỏ rượu đập từ chỗ ấy ra
          if (palm && holding) { g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(palm[0], palm[1], 26, 32, 0, 0, 7); g.fill(); if (wake > 0) { var ph = (t * 1.4) % 1; g.strokeStyle = rgba(WINE, 0.7 * (1 - ph) * wake); g.lineWidth = 2; g.beginPath(); g.arc(palm[0], palm[1], 20 + ph * w * 0.35 * wake, 0, 7); g.stroke(); } }
          g.restore();
          if (grind) grind.set(open ? 0.12 * (1 - slide) : 0.05 * wake, 260 + 200 * wake);
          if (holding || (open && slide < 1)) S.kick(200);
          if (open && slide >= 1 && grind) { grind.stop(); grind = null; }
        },
        open: function (S) {
          open = performance.now() / 1000; S.finish(); S.say(''); stoneRumble(0.18, 1.6);
          // năng lực Clevia (vòng đỏ rượu + tiếng A3, không cú cạch): nối vào hiệu ứng stoneopen của đoạn sau, đánh dấu đoạn đó đã chạy
          var tp = null, ps = document.querySelectorAll('.scene p[data-fx="stoneopen"]'), me = S.box.getBoundingClientRect().top;
          for (var i = 0; i < ps.length; i++) if (ps[i].getBoundingClientRect().top > me) { tp = ps[i]; break; }
          markFired(S, 'stoneopen'); markFired(S, 'heat');
          // bước 5 (Clair 27/11): cận cảnh ổ khoá Clevia trước, rồi bức tường mở (stoneopen) khi băng cận cảnh khép
          setTimeout(function () { if (window.a07shot) window.a07shot('clevia-lock'); }, 200);
          setTimeout(function () { if (window.a07shot) window.a07shot('stoneopen'); }, 2700);
          if (!tp) { tp = S.box.nextElementSibling; while (tp && tp.tagName !== 'P') tp = tp.nextElementSibling; }
          if (tp && window.a07power) window.a07power(tp, 'clevia', 200);
        },
        down: function (S, p) { if (open) return; holding = true; palm = p; if (!grind) grind = hum('bandpass', 260, 1.2); },
        up: function (S) {
          holding = false; if (palm) prints.push([palm[0], palm[1], 0.4 + Math.min(0.4, held / 8)]);
          if (!open) { tried++; held = 0; if (grind) { grind.stop(); grind = null; } S.say(tried > 1 ? 'giữ lâu hơn nữa' : 'không có gì cả. giữ nữa'); }
        }
      };
      function stone(g, x, y, r, k, lit) { g.fillStyle = 'rgba(' + (52 + (k % 5) * 4) + ',' + (48 + (k % 3) * 4) + ',44,' + (0.6 + 0.4 * lit).toFixed(2) + ')'; g.beginPath(); for (var i = 0; i < 7; i++) { var a = i / 7 * 6.283, q = r * (0.75 + 0.35 * R[(k * 7 + i) % 200]); g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q * 0.8); } g.closePath(); g.fill(); g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 1; g.stroke(); }
    }

    /* ---- ch12 mười bước nữa: chạm từng bước, khe sáng cuối hầm to dần; trần rên lên; xích giật ngược, đá đổ lấp ---- */
    function STEPS() {
      var R = seeds(120), n = 0, z = 0, dz = 0, fell = 0, yankT = 0;
      return {
        draw: function (S, t) {
          var g = S.g, w = S.w, h = S.h; dz += (z - dz) * 0.15; if (Math.abs(z - dz) > 0.002) S.kick(200);
          g.fillStyle = '#060606'; g.fillRect(0, 0, w, h);
          var vx = w / 2, vy = h * 0.45, s = 1 + dz * 0.9, sw = w * 0.07 * s, sh = h * 0.13 * s;
          if (!fell || t - fell < 0.4) {
            var gl = g.createRadialGradient(vx, vy, 0, vx, vy, w * 0.45 * s); gl.addColorStop(0, 'rgba(255,251,234,.5)'); gl.addColorStop(1, 'rgba(255,251,234,0)'); g.fillStyle = gl; g.fillRect(0, 0, w, h);
            g.fillStyle = '#fffaf0'; g.fillRect(vx - sw / 2, vy - sh / 2, sw, sh); g.fillStyle = '#1a1a1a'; for (var i = 0; i < 6; i++) g.fillRect(vx - sw / 2 + sw * (i + 0.5) / 6 - 1, vy - sh / 2, 2, sh);
            // cột gỗ hai bên lướt qua theo bước
            for (var p = 0; p < 5; p++) { var u = ((p / 5 + dz * 0.33) % 1), sc = Math.pow(u, 2.2), lx = vx - (vx - 10) * sc, rx = vx + (w - vx - 10) * sc, ty = vy - vy * sc * 0.95, by = vy + (h - vy) * sc; g.fillStyle = 'rgba(70,52,36,' + (0.3 + 0.7 * u).toFixed(2) + ')'; var pw = Math.max(1.5, w * 0.03 * sc); g.fillRect(lx, ty, pw, by - ty); g.fillRect(rx - pw, ty, pw, by - ty); g.fillRect(lx, ty, rx - lx, pw * 0.8); }
          }
          if (n >= 2 && !fell) { g.fillStyle = 'rgba(200,190,170,.6)'; for (var d = 0; d < 26; d++) { var x = R[d] * w, y = ((R[d + 26] + t * 0.3) % 1) * h * 0.7; g.fillRect(x, y, 1.5, 1.5); } S.kick(200); }
          if (yankT && t - yankT < 0.8) { var a = 1 - (t - yankT) / 0.8; g.lineWidth = 2.4; g.strokeStyle = 'rgba(170,176,178,' + a.toFixed(2) + ')'; for (var k = 0; k < 30; k++) { var an = k / 30 * 6.283, cx = w / 2 + Math.cos(an) * w * 0.32, cy = h * 0.55 + Math.sin(an) * h * 0.14; g.beginPath(); g.ellipse(cx, cy, 7, k % 2 ? 2 : 4.5, an + 1.57, 0, 7); g.stroke(); } S.kick(200); }   // xích cứu: vòng lỏng ôm lấy (thép như xích tấn công)
          if (fell) {
            var u2 = t - fell; for (var r = 0; r < 40; r++) { var st = R[r + 40] * 0.5, q = u2 - st; if (q < 0) continue; var x2 = R[r + 80] * w, y2 = Math.min(h * (0.3 + R[r] * 0.7), -40 + q * q * h * 3), rad = 18 + R[(r * 3) % 120] * 30; g.fillStyle = '#2e2a26'; g.beginPath(); g.ellipse(x2, y2, rad, rad * 0.8, r, 0, 7); g.fill(); }
            var dk = Math.min(1, Math.max(0, (u2 - 0.6) / 1)); g.fillStyle = 'rgba(2,2,2,' + (0.95 * dk).toFixed(2) + ')'; g.fillRect(0, 0, w, h);
            if (u2 < 2.5) S.kick(200);
          }
        },
        up: function (S, dn, tap) {
          if (!tap || fell) return; n++; z = n * 0.33;
          snd(function (t0) { nz(out(1, n % 2 ? -0.3 : 0.3), 'lowpass', 1400, 500, 1, 0.22, 0.12, t0); });
          if (n === 1) S.say('mười bước nữa… chạm tiếp');
          if (n === 2) { S.say('tám bước…'); snd(function (t0) { var o = out(1); tn(o, 'sawtooth', 130, 95, 0.05, 1.8, t0 + 0.3); nz(o, 'bandpass', 420, 300, 2, 0.08, 1.8, t0 + 0.3); }); }
          if (n === 3) {
            var now = performance.now() / 1000; yankT = now; z = 0.2; fell = now + 0.5; S.finish(); S.say('');
            markFired(S, 'rescue'); markFired(S, 'cavein');
            if (window.a07shot) { window.a07shot('rescue'); setTimeout(function () { window.a07shot('cavein'); }, 500); }
          }
          S.kick(1500);
        }
      };
    }

    /* ================= chương 13 ================= */
    var STEEL = '#a9b4ba';
    function kengA(at, v) { var o = out(1); [1870, 2930, 4410, 5920].forEach(function (f, i) { tn(o, 'sine', f, f * 0.998, v * [1, 0.55, 0.35, 0.2][i], 0.8 - i * 0.14, at); }); nz(o, 'highpass', 3500, 6000, 0.8, v * 1.4, 0.04, at); }
    function clinkA(o, at, v) { tn(o, 'triangle', 2400 + Math.random() * 1800, 2300, v, 0.1, at); }
    function linkPath(g, pts, lk, col, a) {
      g.save(); g.globalAlpha = a == null ? 1 : a; g.strokeStyle = col; g.lineWidth = Math.max(1.6, lk * 0.2); g.shadowColor = 'rgba(200,215,225,.35)'; g.shadowBlur = 3;
      for (var i = 0; i < pts.length; i++) { var p = pts[i], q = pts[Math.min(pts.length - 1, i + 1)], an = Math.atan2(q[1] - p[1], q[0] - p[0]); g.save(); g.translate(p[0], p[1]); g.rotate(an); g.beginPath(); if (i % 2) g.ellipse(0, 0, lk * 0.55, lk * 0.13, 0, 0, 7); else g.ellipse(0, 0, lk * 0.55, lk * 0.32, 0, 0, 7); g.stroke(); g.restore(); }
      g.restore();
    }
    // mặt trước thẻ Guard: khiên tròn viền sắt, đinh tán, ván gỗ, vết lõm ở giữa (khớp hình trong album)
    function guardFace(g, x, y, cw, chh, t, glowA) {
      g.save(); g.translate(x, y);
      var bg = g.createLinearGradient(-cw / 2, -chh / 2, cw / 2, chh / 2); bg.addColorStop(0, '#2c3436'); bg.addColorStop(0.6, '#191f22'); bg.addColorStop(1, '#101518');
      g.fillStyle = bg; rr(g, -cw / 2, -chh / 2, cw, chh, cw * 0.04); g.fill(); g.strokeStyle = '#3c4649'; g.lineWidth = 1; rr(g, -cw / 2 + 3, -chh / 2 + 3, cw - 6, chh - 6, cw * 0.035); g.stroke();
      if (glowA) { var gl = g.createRadialGradient(0, -chh * 0.05, 0, 0, -chh * 0.05, cw * 0.4); gl.addColorStop(0, 'rgba(255,217,160,' + (0.22 * glowA).toFixed(3) + ')'); gl.addColorStop(1, 'rgba(255,217,160,0)'); g.fillStyle = gl; g.fillRect(-cw / 2, -chh / 2, cw, chh); }
      var s = cw / 856; g.scale(s, s); g.translate(-428, -270); g.strokeStyle = '#c9cfc6'; g.lineCap = 'round'; g.lineJoin = 'round';
      g.lineWidth = 9; g.beginPath(); g.arc(428, 262, 112, 0, 7); g.stroke();
      g.lineWidth = 2; g.globalAlpha = 0.75; g.beginPath(); g.arc(428, 262, 96, 0, 7); g.stroke(); g.globalAlpha = 1;
      g.fillStyle = 'rgba(201,207,198,.85)'; for (var k = 0; k < 12; k++) { var a = k / 12 * 6.283 - 1.5708; g.beginPath(); g.arc(428 + Math.cos(a) * 104, 262 + Math.sin(a) * 104, 4.5, 0, 7); g.fill(); }
      g.globalAlpha = 0.38; g.lineWidth = 2.5; [-70, -35, 0, 35, 70].forEach(function (dx) { var hy = Math.sqrt(96 * 96 - dx * dx); g.beginPath(); g.moveTo(428 + dx, 262 - hy); g.lineTo(428 + dx, 262 + hy); g.stroke(); }); g.globalAlpha = 1;
      g.fillStyle = '#1b2225'; g.lineWidth = 5; g.beginPath(); g.ellipse(438, 270, 30, 22, 0, 0, 7); g.fill(); g.stroke();
      g.lineWidth = 2.5; g.globalAlpha = 0.8; g.beginPath(); g.moveTo(466, 262); g.lineTo(492, 250); g.lineTo(504, 255); g.moveTo(452, 248); g.lineTo(460, 222); g.moveTo(410, 262); g.lineTo(384, 256); g.moveTo(428, 292); g.lineTo(422, 316); g.moveTo(462, 284); g.lineTo(480, 302); g.stroke(); g.globalAlpha = 1;
      g.fillStyle = '#9aa5a3'; g.font = 'italic 38px Literata, Georgia, serif'; g.textAlign = 'center'; g.fillText('Guard', 428, 462);
      g.restore();
    }

    /* ---- ch13 xích tách nhánh: chạm vào cặp đốm đỏ, một nhánh xích của Leon vươn ra quấn lấy rồi quăng đi (3 lần) ---- */
    function SPLIT() {
      var R = seeds(120), T = [[0.2, 0.6], [0.52, 0.52], [0.8, 0.64]], st = [0, 0, 0], hitT = [0, 0, 0], n = 0, t0 = performance.now() / 1000;
      return {
        draw: function (S, t) {
          var g = S.g, w = S.w, h = S.h, busy = false;
          g.fillStyle = '#0c0d0e'; g.fillRect(0, 0, w, h);
          var sk = g.createLinearGradient(0, 0, 0, h * 0.5); sk.addColorStop(0, '#2a3034'); sk.addColorStop(1, '#4a4a42'); g.fillStyle = sk; g.fillRect(0, 0, w, h * 0.5);
          g.fillStyle = '#2a2a26'; g.beginPath(); g.moveTo(0, h * 0.5); for (var i = 0; i <= 20; i++) g.lineTo(i / 20 * w, h * (0.44 + 0.06 * Math.sin(i * 1.3) * Math.sin(i * 0.7))); g.lineTo(w, h); g.lineTo(0, h); g.fill();
          g.fillStyle = '#4a4a44'; g.beginPath(); g.moveTo(w * 0.3, h); g.lineTo(w * 0.7, h); g.lineTo(w * 0.53, h * 0.5); g.lineTo(w * 0.48, h * 0.5); g.fill();
          for (var d = 0; d < 20; d++) { g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(R[d] * w, h * (0.55 + R[d + 20] * 0.4), 3 + R[d + 40] * 7, 2 + R[d + 40] * 4, 0, 0, 7); g.fill(); }
          var ox = w * 0.5, oy = h * 0.98, lk = Math.max(8, h * 0.035), age = t - t0;
          for (var k = 0; k < 3; k++) {
            var tx = w * T[k][0], ty = h * (T[k][1] + Math.min(0.08, age * 0.003)) + Math.sin(t * 0.7 + k) * 2, s = Math.max(2, h * 0.012);
            if (st[k] === 0) { var on = Math.sin(t * 1.3 + k * 2) > -0.7 ? 1 : 0.3; g.fillStyle = 'rgba(224,50,42,' + (0.9 * on) + ')'; g.fillRect(tx - s * 1.6, ty, s, s); g.fillRect(tx + s * 0.6, ty, s, s); var gl = g.createRadialGradient(tx, ty, 0, tx, ty, s * 8); gl.addColorStop(0, 'rgba(224,50,42,' + (0.2 * on) + ')'); gl.addColorStop(1, 'rgba(224,50,42,0)'); g.fillStyle = gl; g.fillRect(tx - s * 8, ty - s * 8, s * 16, s * 16); continue; }
            var u = t - hitT[k], reach = Math.min(1, u / 0.22), fling = u > 0.45 ? Math.min(1, (u - 0.45) / 0.5) : 0, back = u > 0.95 ? Math.min(1, (u - 0.95) / 0.5) : 0;
            var side = tx < ox ? -1 : 1, ex = tx + side * fling * w * 0.6, ey = ty - fling * h * 0.15 + fling * fling * h * 0.5;
            if (fling < 1) { g.fillStyle = 'rgba(224,50,42,' + (0.9 * (1 - fling)) + ')'; g.fillRect(ex - s * 1.6, ey, s, s); g.fillRect(ex + s * 0.6, ey, s, s); }
            if (fling > 0 && fling < 1) for (var q = 0; q < 8; q++) { g.fillStyle = 'rgba(150,145,130,' + (0.6 * (1 - fling)) + ')'; g.fillRect(tx + side * fling * w * 0.3 * R[q + k * 8] + (R[q + 60] - 0.5) * 30, ty + h * 0.05 + fling * h * 0.2 * R[q + 80], 2.5, 2.5); }
            var L = (back ? 1 - back : reach), pts = [];
            if (L > 0.01) { var hx = fling ? ex : tx, hy = fling ? ey : ty; for (var m = 0; m < 22; m++) { var v = m / 21 * L, x = ox + (hx - ox) * v + Math.sin(v * 7 + t * 4 + k) * w * 0.02 * (1 - v), y = oy + (hy - oy) * v; pts.push([x, y]); }
              if (reach >= 1 && !back) for (var c = 0; c < 10; c++) { var a = c / 10 * 6.283 + t * 6; pts.push([hx + Math.cos(a) * lk * 0.9, hy + s + Math.sin(a) * lk * 0.4]); } // quấn lấy cổ chân
              linkPath(g, pts, lk, STEEL, 1); }
            if (u < 1.6) busy = true;
          }
          // khối xích phục dưới chân
          var base = []; for (var b = 0; b < 16; b++) { var an = b / 16 * 6.283 * 1.2; base.push([ox + Math.cos(an) * w * 0.07, oy - h * 0.03 + Math.sin(an) * h * 0.03]); } linkPath(g, base, lk, STEEL, 0.9);
          S.kick(busy ? 300 : 0);
        },
        up: function (S, dn, tap) {
          if (!tap || n >= 3) return; var best = -1, bd = 1e9;
          for (var k = 0; k < 3; k++) { if (st[k]) continue; var d = Math.hypot(dn.x - S.w * T[k][0], dn.y - S.h * T[k][1]); if (d < bd) { bd = d; best = k; } }
          if (best < 0) return; st[best] = 1; hitT[best] = performance.now() / 1000; n++;
          snd(function (t0) { var o = out(1, T[best][0] * 2 - 1); nz(o, 'bandpass', 1200, 6000, 6, 0.35, 0.22, t0); for (var c = 0; c < 6; c++) clinkA(o, t0 + 0.2 + c * 0.04, 0.05); nz(o, 'bandpass', 4000, 400, 1.4, 0.3, 0.3, t0 + 0.45); for (var p = 0; p < 7; p++) tn(o, 'triangle', 300 + Math.random() * 500, 250, 0.04, 0.05, t0 + 0.6 + p * (0.05 + Math.random() * 0.06)); });
          S.say(n === 1 ? 'thêm hai…' : n === 2 ? 'một nữa' : ''); if (n === 3) S.finish(); S.kick(1800);
        }
      };
    }

    /* ---- ch13 xé vạt áo: vuốt ngang dọc theo vạt áo xanh bạc màu, tiếng vải rách roạt theo tay ---- */
    function TEAR() {
      var R = seeds(160), prog = 0, lastRip = 0, doneT = 0;
      return {
        draw: function (S, t) {
          var g = S.g, w = S.w, h = S.h; g.fillStyle = '#0d0c0b'; g.fillRect(0, 0, w, h);
          var gl = g.createRadialGradient(w * 0.2, 0, 0, w * 0.2, 0, w * 0.9); gl.addColorStop(0, 'rgba(255,240,200,.14)'); gl.addColorStop(1, 'rgba(255,240,200,0)'); g.fillStyle = gl; g.fillRect(0, 0, w, h);
          var x0 = w * 0.08, x1 = w * 0.92, y0 = h * 0.2, ly = h * 0.62, y1 = h * 0.86, tx = x0 + (x1 - x0) * prog;
          var fall = doneT ? Math.min(1, (t - doneT) / 0.6) : 0;
          function cloth(top, bot, dy, rot) {
            g.save(); g.translate(0, dy); g.rotate(rot); g.fillStyle = '#41606c'; g.fillRect(x0, top, x1 - x0, bot - top);
            g.strokeStyle = 'rgba(160,190,200,.12)'; g.lineWidth = 1; for (var i = 0; i < 60; i++) { var x = x0 + i / 59 * (x1 - x0); g.beginPath(); g.moveTo(x, top); g.lineTo(x, bot); g.stroke(); }
            for (var j = top; j < bot; j += 4) { g.beginPath(); g.moveTo(x0, j); g.lineTo(x1, j); g.stroke(); }
            g.restore();
          }
          cloth(y0, ly, 0, 0);
          // dải dưới: phần đã xé tách xuống một chút
          g.save(); g.beginPath(); g.rect(x0, ly, tx - x0, y1 - ly); g.clip(); cloth(ly, y1, h * 0.03 * (1 + fall * 3), fall * 0.05); g.restore();
          g.save(); g.beginPath(); g.rect(tx, ly, x1 - tx + 2, y1 - ly); g.clip(); cloth(ly, y1, 0, 0); g.restore();
          // mép rách tưa sợi
          g.strokeStyle = 'rgba(190,210,215,.7)'; g.lineWidth = 1; for (var k = 0; k < 40; k++) { var x = x0 + k / 40 * (tx - x0); if (x > tx) break; g.beginPath(); g.moveTo(x, ly); g.lineTo(x + (R[k] - 0.5) * 4, ly + 3 + R[k + 40] * 6); g.stroke(); }
          // vết rách vai áo có sẵn (từ ở chợ): ba vệt cào sẫm góc trên
          g.strokeStyle = 'rgba(20,24,26,.8)'; g.lineWidth = 3; for (var c = 0; c < 3; c++) { g.beginPath(); g.moveTo(w * (0.66 + c * 0.05), y0 + h * 0.02); g.lineTo(w * (0.72 + c * 0.05), y0 + h * 0.18); g.stroke(); }
          // đường sẽ xé: chấm mờ chỉ đường, đầu xé sáng lên
          if (!doneT) { g.setLineDash([4, 6]); g.strokeStyle = 'rgba(232,240,236,' + (0.25 + 0.15 * Math.sin(t * 3)).toFixed(2) + ')'; g.beginPath(); g.moveTo(tx, ly); g.lineTo(x1, ly); g.stroke(); g.setLineDash([]); var hg = g.createRadialGradient(tx, ly, 0, tx, ly, 22); hg.addColorStop(0, 'rgba(232,240,236,.5)'); hg.addColorStop(1, 'rgba(232,240,236,0)'); g.fillStyle = hg; g.fillRect(tx - 22, ly - 22, 44, 44); }
          if (doneT && fall < 1) S.kick(200);
        },
        move: function (S, p, dx) {
          if (doneT || dx <= 0) return; var x0 = S.w * 0.08, x1 = S.w * 0.92, np = clamp((p[0] - x0) / (x1 - x0), 0, 1);
          if (np <= prog) return; var gain_ = np - prog; prog = Math.min(1, prog + Math.min(gain_, 0.08));
          var now = performance.now(); if (now - lastRip > 45) { lastRip = now; snd(function (n) { var o = out(1, prog * 1.6 - 0.8); nz(o, 'bandpass', 1800 + Math.random() * 1500, 2600, 1.2, 0.18 + Math.min(0.2, gain_ * 3), 0.07 + Math.random() * 0.05, n); nz(o, 'highpass', 4000, 6000, 1, 0.06, 0.04, n); }); }
          if (prog >= 0.98) { prog = 1; doneT = performance.now() / 1000; S.finish(); S.say(''); snd(function (n) { var o = out(1); nz(o, 'bandpass', 2400, 1200, 1.4, 0.35, 0.18, n); }); }
          S.kick(400);
        }
      };
    }

    /* ---- ch13 cái giỏ trên gác: chạm cái giỏ, nó được nhấc xuống nhẹ như nhặt một quả bóng, đặt cộp xuống cạnh bếp ---- */
    function BASKET() {
      var R = seeds(80), tT = 0, landed = 0, wob = 0;
      return {
        draw: function (S, t) {
          var g = S.g, w = S.w, h = S.h; g.fillStyle = '#0e0b08'; g.fillRect(0, 0, w, h);
          var beam = g.createLinearGradient(w * 0.55, 0, w * 0.75, h); beam.addColorStop(0, 'rgba(255,240,200,.16)'); beam.addColorStop(1, 'rgba(255,240,200,0)'); g.fillStyle = beam; g.beginPath(); g.moveTo(w * 0.55, 0); g.lineTo(w * 0.57, 0); g.lineTo(w * 0.8, h); g.lineTo(w * 0.74, h); g.fill();
          var ly = h * 0.24; g.fillStyle = '#2a2016'; g.fillRect(0, ly, w, h * 0.05); g.fillStyle = '#1b1510'; g.fillRect(w * 0.1, ly + h * 0.05, w * 0.02, h); g.fillRect(w * 0.9, ly + h * 0.05, w * 0.02, h);
          g.strokeStyle = 'rgba(0,0,0,.4)'; for (var p = 0; p < 7; p++) { g.beginPath(); g.moveTo(w * p / 6, ly); g.lineTo(w * p / 6 + 3, ly + h * 0.05); g.stroke(); }
          var sway = landed ? Math.max(0, 1 - (t - landed) / 2) * Math.sin((t - landed) * 9) : 0;
          g.fillStyle = '#3a3020'; for (var r = 0; r < 4; r++) { g.save(); g.translate(w * (0.14 + r * 0.15), ly); g.rotate(r === 3 ? sway * 0.08 : 0); g.beginPath(); g.ellipse(0, 0, w * 0.07, h * 0.1, 0, Math.PI, 0); g.fill(); g.restore(); }
          g.strokeStyle = '#4a3c28'; g.lineWidth = 2; g.beginPath(); g.ellipse(w * 0.68, ly - h * 0.03, w * 0.06, h * 0.03, 0, 0, 7); g.stroke();
          var fy = h * 0.9; g.fillStyle = '#1c1712'; g.fillRect(0, fy, w, h - fy);
          var hx = w * 0.3; g.fillStyle = '#4a4440'; g.beginPath(); g.ellipse(hx, fy + 2, w * 0.08, h * 0.02, 0, 0, 7); g.fill(); var gl = g.createRadialGradient(hx, fy, 0, hx, fy, w * 0.12); gl.addColorStop(0, 'rgba(255,122,58,.16)'); gl.addColorStop(1, 'rgba(255,122,58,0)'); g.fillStyle = gl; g.fillRect(hx - w * 0.12, fy - w * 0.12, w * 0.24, w * 0.24);
          // giỏ: đi theo đường cong từ mép gác xuống nền đất cạnh bếp
          var sx = w * 0.84, sy = ly - h * 0.002, ex = w * 0.42, ey = fy, u = tT ? Math.min(1, (t - tT) / 1.1) : 0, e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
          var bx = sx + (ex - sx) * e, by = sy + (ey - sy) * e - Math.sin(e * Math.PI) * h * 0.12, bw = Math.min(w * 0.11, h * 0.2), bh = bw * 0.8;
          if (landed) { var k = t - landed; by += k < 0.25 ? -Math.sin(k / 0.25 * Math.PI) * 4 : 0; }
          if (!tT) { var hl = 0.5 + 0.5 * Math.sin(t * 3); g.strokeStyle = 'rgba(232,240,236,' + (0.2 + 0.3 * hl).toFixed(2) + ')'; g.setLineDash([3, 5]); g.beginPath(); g.ellipse(bx, by - bh * 0.5, bw * 0.85, bh * 0.85, 0, 0, 7); g.stroke(); g.setLineDash([]); }
          g.fillStyle = '#6a5430'; g.beginPath(); g.moveTo(bx - bw / 2, by); g.lineTo(bx - bw * 0.4, by - bh); g.lineTo(bx + bw * 0.4, by - bh); g.lineTo(bx + bw / 2, by); g.fill();
          g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1; for (var q = 1; q < 5; q++) { g.beginPath(); g.moveTo(bx - bw * 0.48, by - bh * q / 5); g.lineTo(bx + bw * 0.48, by - bh * q / 5); g.stroke(); }
          g.strokeStyle = '#8a6e40'; g.lineWidth = 2; g.beginPath(); g.arc(bx, by - bh, bw * 0.3, Math.PI, 0); g.stroke();
          if (landed) { var k2 = t - landed; for (var d = 0; d < 18; d++) { var a = Math.max(0, 1 - k2 / 1.4); if (!a) break; g.fillStyle = 'rgba(200,180,130,' + (0.6 * a).toFixed(2) + ')'; g.fillRect(bx + (R[d] - 0.5) * bw * 2 * (0.3 + k2), by - k2 * h * 0.1 * R[d + 20] - 2, 2, 2); } }
          for (var m = 0; m < 16; m++) { g.fillStyle = 'rgba(255,240,200,' + (0.2 + 0.3 * Math.abs(Math.sin(t * 0.7 + m))).toFixed(2) + ')'; g.fillRect(w * (0.55 + R[m + 40] * 0.25), ((R[m + 60] + t * 0.01) % 1) * h, 1.5, 1.5); }
          if (tT && !landed && u >= 1) { landed = performance.now() / 1000; S.finish(); snd(function (n) { var o = out(1); nz(o, 'bandpass', 1400, 900, 2, 0.4, 0.08, n); tn(o, 'triangle', 700, 520, 0.08, 0.06, n); nz(o, 'highpass', 3000, 5000, 1, 0.05, 0.4, n + 0.03); }); S.say(''); }
          S.kick(tT && (!landed || t - landed < 2) ? 300 : 0);
        },
        up: function (S, dn, tap) {
          if (!tap || tT) return; tT = performance.now() / 1000;
          snd(function (n) { var o = out(1, 0.5); nz(o, 'bandpass', 2600, 1800, 1.2, 0.12, 0.25, n); nz(o, 'bandpass', 900, 2400, 1, 0.08, 0.6, n + 0.2); });
        }
      };
    }

    /* ---- ch13 lò rèn: giữ tay để kéo bễ, than đỏ chuyển sang trắng loá; buông tay thì búa nện, sắt dẹt ra thành tấm thẻ úp; chạm để lật ---- */
    function FORGE() {
      var R = seeds(120), heat = 0, holding = false, lastT = 0, phase = 0, hamT = 0, hits = 0, flipT = 0, bel = null, nextHit = 0;
      return {
        draw: function (S, t) {
          var g = S.g, w = S.w, h = S.h, dt = lastT ? Math.min(0.1, t - lastT) : 0; lastT = t;
          if (phase === 0) { heat = holding ? Math.min(1, heat + dt / 2.6) : Math.max(0, heat - dt * 0.15); if (bel) bel.set(0.03 + 0.1 * heat, 500 + heat * 1500); if (heat >= 1) { phase = 1; hamT = t; nextHit = t + 0.4; holding = false; if (bel) { bel.stop(); bel = null; } S.say('…'); } }
          if (phase === 1 && t >= nextHit && hits < 6) { hits++; nextHit = t + 0.55; snd(function (n) { kengA(n, 0.06); }); if (hits === 6) { setTimeout(function () { phase = 2; S.say('chạm để lật tấm thẻ'); S.kick(500); snd(function (n) { var o = out(1); nz(o, 'bandpass', 3000, 1500, 1.2, 0.18, 0.9, n); }); }, 700); } }
          g.fillStyle = '#0a0806'; g.fillRect(0, 0, w, h);
          var fx = w * 0.26, fy = h * 0.4, fr = Math.min(w, h) * 0.15, fl = 0.85 + 0.15 * Math.sin(t * 9) * Math.sin(t * 5.3), hh = phase ? 1 : heat;
          var col = hh > 0.7 ? [255, 246, 224] : hh > 0.35 ? [255, 210, 150] : [255, 110, 50];
          var gl = g.createRadialGradient(fx, fy, 0, fx, fy, fr * (2 + hh * 3)); gl.addColorStop(0, 'rgba(' + col + ',' + (0.35 + hh * 0.3) * fl + ')'); gl.addColorStop(1, 'rgba(' + col + ',0)'); g.fillStyle = gl; g.fillRect(0, 0, w, h);
          g.fillStyle = '#3a2420'; g.fillRect(fx - fr * 1.4, fy - fr * 1.2, fr * 2.8, fr * 2.6); g.strokeStyle = 'rgba(0,0,0,.35)'; for (var b = 1; b < 7; b++) { g.beginPath(); g.moveTo(fx - fr * 1.4, fy - fr * 1.2 + b * fr * 0.37); g.lineTo(fx + fr * 1.4, fy - fr * 1.2 + b * fr * 0.37); g.stroke(); }
          g.fillStyle = '#120a06'; g.beginPath(); g.ellipse(fx, fy, fr * 0.9, fr * 0.55, 0, 0, 7); g.fill();
          var cg = g.createRadialGradient(fx, fy, 0, fx, fy, fr * 0.8); cg.addColorStop(0, 'rgba(' + col + ',1)'); cg.addColorStop(0.7, 'rgba(' + (hh > 0.5 ? '255,200,140' : '232,80,30') + ',' + (0.85 * fl).toFixed(2) + ')'); cg.addColorStop(1, 'rgba(90,22,8,.8)'); g.fillStyle = cg; g.beginPath(); g.ellipse(fx, fy, fr * 0.75, fr * 0.42, 0, 0, 7); g.fill();
          if (holding) for (var s = 0; s < 10; s++) { var u = (t * 1.5 + R[s]) % 1; g.fillStyle = 'rgba(255,200,140,' + (0.8 * (1 - u)).toFixed(2) + ')'; g.fillRect(fx + (R[s + 10] - 0.5) * fr, fy - u * h * 0.4, 2, 2); }
          // bễ: túi da phồng xẹp theo tay giữ
          var bx = fx, by = fy + fr * 1.75, pump = holding ? 0.5 + 0.5 * Math.sin(t * 7) : 0.2; g.fillStyle = '#4a3020'; g.beginPath(); g.moveTo(bx - fr * 0.5, by); g.quadraticCurveTo(bx, by - fr * (0.3 + 0.4 * pump), bx + fr * 0.5, by); g.quadraticCurveTo(bx, by + fr * (0.3 + 0.4 * pump), bx - fr * 0.5, by); g.fill(); g.strokeStyle = '#6a4a30'; g.lineWidth = 3; g.beginPath(); g.moveTo(bx + fr * 0.5, by); g.lineTo(fx, fy + fr * 1.4); g.stroke();
          if (phase === 0 && !holding) { g.strokeStyle = 'rgba(232,240,236,' + (0.25 + 0.2 * Math.sin(t * 3)).toFixed(2) + ')'; g.setLineDash([3, 5]); g.beginPath(); g.arc(bx, by, fr * 0.8, 0, 7); g.stroke(); g.setLineDash([]); }
          // cái đe
          var ax = w * 0.66, ay = h * 0.66, aw = Math.min(w * 0.4, h * 0.8);
          g.fillStyle = '#2a2c2e'; g.fillRect(ax - aw * 0.12, ay, aw * 0.24, h * 0.3); g.beginPath(); g.moveTo(ax - aw / 2, ay); g.lineTo(ax + aw * 0.35, ay); g.quadraticCurveTo(ax + aw * 0.6, ay - h * 0.02, ax + aw * 0.62, ay - h * 0.06); g.lineTo(ax + aw * 0.3, ay - h * 0.07); g.lineTo(ax - aw / 2, ay - h * 0.07); g.fill();
          g.strokeStyle = 'rgba(255,255,255,.2)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(ax - aw / 2, ay - h * 0.07); g.lineTo(ax + aw * 0.3, ay - h * 0.07); g.stroke();
          var top = ay - h * 0.07;
          if (phase === 1) { // cục sắt nung dẹt dần dưới từng nhát búa
            var fl2 = hits / 6, gw = aw * (0.12 + fl2 * 0.2), gh = h * (0.06 - fl2 * 0.035); g.fillStyle = 'rgba(255,' + Math.round(200 - fl2 * 90) + ',' + Math.round(120 - fl2 * 80) + ',1)'; g.beginPath(); g.ellipse(ax - aw * 0.05, top - gh / 2, gw / 2, gh / 2, 0, 0, 7); g.fill();
            var since = t - (nextHit - 0.55); if (hits && since < 0.3) { var k = 1 - since / 0.3; var sg = g.createRadialGradient(ax - aw * 0.05, top - gh, 0, ax - aw * 0.05, top - gh, aw * 0.3); sg.addColorStop(0, 'rgba(255,230,180,' + (0.6 * k).toFixed(2) + ')'); sg.addColorStop(1, 'rgba(255,230,180,0)'); g.fillStyle = sg; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(255,217,160,' + k.toFixed(2) + ')'; g.lineWidth = 1.5; for (var q = 0; q < 14; q++) { var an = -Math.PI * (0.05 + R[q + 20 + hits] * 0.9), sp = (1 - k) * aw * (0.2 + R[q + 40] * 0.5), x1 = ax - aw * 0.05 + Math.cos(an) * sp, y1 = top - gh + Math.sin(an) * sp + (1 - k) * (1 - k) * h * 0.2; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x1 - Math.cos(an) * 6, y1 - Math.sin(an) * 6); g.stroke(); } }
            S.kick(300);
          }
          if (phase >= 2) { // tấm thẻ trên đe, còn ấm; úp cho tới khi chạm
            var cw = Math.min(aw * 0.75, w * 0.44), chh = cw * 0.63, cx = ax - aw * 0.05, cy = top - chh * 0.55, sc = flipT ? Math.abs(Math.cos(Math.min(1, (t - flipT) / 0.5) * Math.PI)) : 1, front = flipT && t - flipT > 0.25, warm = Math.max(0, 1 - (phase === 2 && !flipT ? 0 : (t - flipT) / 4)) * (0.6 + 0.4 * Math.sin(t * 2));
            var wg = g.createRadialGradient(cx, cy, 0, cx, cy, cw); wg.addColorStop(0, 'rgba(255,190,120,' + (0.25 * warm).toFixed(2) + ')'); wg.addColorStop(1, 'rgba(255,190,120,0)'); g.fillStyle = wg; g.fillRect(cx - cw, cy - cw, cw * 2, cw * 2);
            g.save(); g.translate(cx, cy); g.scale(Math.max(0.02, sc), 1); if (front) guardFace(g, 0, 0, cw, chh, t, warm); else backFace(g, 0, 0, cw, chh, t); g.restore();
            this._card = [cx - cw / 2, cy - chh / 2, cw, chh];
            if (!flipT) { g.strokeStyle = 'rgba(232,240,236,' + (0.25 + 0.25 * Math.sin(t * 3)).toFixed(2) + ')'; g.setLineDash([3, 5]); rr(g, cx - cw / 2 - 8, cy - chh / 2 - 8, cw + 16, chh + 16, 10); g.stroke(); g.setLineDash([]); }
            if (flipT && t - flipT < 0.6) S.kick(200);
          }
          if (holding || phase === 1) S.kick(200); else S.kick(0);
        },
        down: function (S) { if (phase !== 0) return; holding = true; if (!bel) bel = hum('bandpass', 600, 0.8); snd(function (n) { nz(out(1), 'bandpass', 500, 1400, 0.9, 0.12, 0.5, n); }); },
        up: function (S, dn, tap) {
          if (phase === 0) { holding = false; if (bel) { bel.stop(); bel = null; } if (heat < 1) S.say(heat > 0.3 ? 'giữ thêm nữa, lửa đang trắng dần' : 'giữ để kéo bễ'); return; }
          if (phase === 2 && !flipT && tap && this._card) { var c = this._card; if (dn.x > c[0] - 24 && dn.x < c[0] + c[2] + 24 && dn.y > c[1] - 24 && dn.y < c[1] + c[3] + 24) { flipT = performance.now() / 1000; S.say('Guard'); if (window.a07sfx) a07sfx('flip'); S.finish(); S.kick(1500); } }
        },
        hide: function () { if (bel) { bel.stop(); bel = null; } holding = false; }
      };
    }

    /* ================= chương 14 ================= */
    var ICE = '#9fd4ea';
    // tháp chuông nhỏ dùng chung cho hai tương tác
    function bellT(g, x, by, s, swing, iceA) {
      g.strokeStyle = '#2a2016'; g.lineWidth = Math.max(2, s * 0.06);
      [[-0.6, -0.55], [0.6, 0.55]].forEach(function (c) { g.beginPath(); g.moveTo(x + c[0] * s, by + s * 1.6); g.lineTo(x + c[1] * s, by - s * 0.2); g.stroke(); });
      g.fillStyle = '#1e1812'; g.beginPath(); g.moveTo(x - s * 0.8, by - s * 0.15); g.lineTo(x, by - s * 0.55); g.lineTo(x + s * 0.8, by - s * 0.15); g.fill(); g.fillRect(x - s * 0.6, by - s * 0.18, s * 1.2, s * 0.06);
      g.save(); g.translate(x, by - s * 0.12); g.rotate(swing || 0);
      var bw = s * 0.7, bh = s * 0.7, bg = g.createLinearGradient(-bw / 2, 0, bw / 2, 0); bg.addColorStop(0, '#2e3a30'); bg.addColorStop(0.45, '#5a5a3e'); bg.addColorStop(1, '#232a22'); g.fillStyle = bg;
      g.beginPath(); g.moveTo(-bw * 0.22, 0); g.quadraticCurveTo(-bw * 0.3, bh * 0.55, -bw * 0.5, bh); g.lineTo(bw * 0.5, bh); g.quadraticCurveTo(bw * 0.3, bh * 0.55, bw * 0.22, 0); g.fill();
      g.fillStyle = '#3f5a3a'; for (var m = 0; m < 8; m++) g.fillRect(-bw * 0.48 + m * bw * 0.12, bh * 0.93, bw * 0.06, bh * 0.05);
      if (iceA) { var ig = g.createRadialGradient(0, bh * 0.5, 0, 0, bh * 0.5, bw); ig.addColorStop(0, rgba(ICE, 0.6 * iceA)); ig.addColorStop(1, rgba(ICE, 0)); g.fillStyle = ig; g.fillRect(-bw, -bh * 0.3, bw * 2, bh * 1.8); }
      g.restore();
      return [x, by - s * 0.12 + s * 0.7];
    }
    function night(g, w, h) { var sk = g.createLinearGradient(0, 0, 0, h); sk.addColorStop(0, '#05080a'); sk.addColorStop(1, '#141210'); g.fillStyle = sk; g.fillRect(0, 0, w, h); g.fillStyle = '#1a1210'; g.fillRect(0, h * 0.78, w, h * 0.22); var lg = g.createRadialGradient(w, h * 0.4, 0, w, h * 0.4, w * 0.7); lg.addColorStop(0, 'rgba(255,207,122,.12)'); lg.addColorStop(1, 'rgba(255,207,122,0)'); g.fillStyle = lg; g.fillRect(0, 0, w, h); }
    /* ---- ch14 xích quất hụt: chạm vào hai mặt kính loé dưới tháp chuông; xích Leon lao tới quấn ba vòng... vào khoảng không ---- */
    function LASH() {
      var hitT = 0, R = seeds(40);
      return {
        draw: function (S, t) {
          var g = S.g, w = S.w, h = S.h; night(g, w, h);
          var tx = w * 0.36, ty = h * 0.5, u = hitT ? t - hitT : 0, gone = hitT ? Math.min(1, Math.max(0, (u - 0.25) / 0.5)) : 0;
          bellT(g, w * 0.3, h * 0.22, h * 0.24, hitT ? Math.sin(u * 3) * 0.05 * Math.exp(-u * 0.4) : 0, hitT ? Math.max(0, 1 - u / 3) : 0.1);
          // hai mặt kính loé, rồi mờ đi như bức tranh nước bị nhỏ thêm nước
          var ga = (1 - gone) * (0.55 + 0.35 * Math.sin(t * 1.7)), gw = Math.max(5, w * 0.02);
          if (ga > 0.01) { g.fillStyle = 'rgba(255,207,122,' + ga.toFixed(3) + ')'; g.fillRect(tx - gw * 1.2, ty, gw, gw * 0.6); g.fillRect(tx + gw * 0.2, ty, gw, gw * 0.6); var gl = g.createRadialGradient(tx, ty, 0, tx, ty, gw * 5); gl.addColorStop(0, 'rgba(159,212,234,' + (0.25 * gone * (1 - gone) * 4).toFixed(3) + ')'); gl.addColorStop(1, 'rgba(159,212,234,0)'); g.fillStyle = gl; g.fillRect(tx - gw * 5, ty - gw * 5, gw * 10, gw * 10); }
          if (!hitT) { g.strokeStyle = 'rgba(232,240,236,' + (0.2 + 0.25 * Math.sin(t * 3)).toFixed(2) + ')'; g.setLineDash([3, 5]); g.beginPath(); g.ellipse(tx, ty + gw * 0.3, gw * 3, gw * 2, 0, 0, 7); g.stroke(); g.setLineDash([]); }
          // xích lao từ góc phải dưới
          var ox = w * 0.96, oy = h * 0.98, lk = Math.max(8, h * 0.035), reach = hitT ? Math.min(1, u / 0.22) : 0, wrap = hitT ? Math.min(1, Math.max(0, (u - 0.22) / 0.45)) : 0, drop = hitT ? Math.min(1, Math.max(0, (u - 1.3) / 0.6)) : 0, pts = [];
          for (var m = 0; m < 24; m++) { var v = m / 23 * reach, x = ox + (tx - ox) * v + Math.sin(v * 6 + t * 3) * w * 0.015 * (1 - v), y = oy + (ty - oy) * v + drop * h * 0.3 * v * v; pts.push([x, y]); }
          if (wrap > 0) { var loops = Math.floor(wrap * 30); for (var c = 0; c < loops; c++) { var a = c / 10 * 6.283, rr2 = gw * 2.6 * (1 - wrap * 0.85) * (1 - drop) + 2, sag = drop * h * 0.3; pts.push([tx + Math.cos(a) * rr2 * (1 + drop * 2), ty + gw * 0.3 + Math.sin(a) * rr2 * 0.5 + sag + c * drop * 0.5]); } }
          if (reach > 0) linkPath(g, pts, lk, STEEL, 1);
          // khối xích phục ở góc
          var base = []; for (var b = 0; b < 12; b++) { var an = b / 12 * 6.283; base.push([ox - w * 0.04 + Math.cos(an) * w * 0.05, oy - h * 0.03 + Math.sin(an) * h * 0.025]); } linkPath(g, base, lk, STEEL, 0.9);
          if (hitT && u < 2.2) S.kick(300);
        },
        up: function (S, dn, tap) {
          if (!tap || hitT) return; hitT = performance.now() / 1000; S.finish(); S.say('');
          snd(function (n) { var o = out(1, -0.3); nz(o, 'bandpass', 1200, 7000, 6, 0.4, 0.22, n); for (var c = 0; c < 10; c++) clinkA(o, n + 0.22 + c * 0.045, 0.05); nz(o, 'bandpass', 3500, 900, 2, 0.25, 0.25, n + 0.55); for (var d = 0; d < 9; d++) clinkA(o, n + 1.35 + d * (0.05 + Math.random() * 0.06), 0.04 * (1 - d / 12)); });
          S.kick(2400);
        }
      };
    }
    /* ---- ch14 giật dây chuông: chạm và giữ để giật, dây căng, tháp rên kèn kẹt; chuông không nhúc nhích; buông thì dây đập vào cột "bộp" (2 lần) ---- */
    function ROPE() {
      var hold = 0, holding = false, pulls = 0, relT = 0, last = 0, cr = null;
      return {
        draw: function (S, t) {
          var g = S.g, w = S.w, h = S.h, dt = last ? Math.min(0.05, t - last) : 0; last = t; night(g, w, h);
          if (holding) hold = Math.min(1, hold + dt * 0.8); else hold = Math.max(0, hold - dt * 4);
          var shake = holding ? Math.sin(t * 40) * hold * 1.2 : 0, bx = w * 0.5 + shake * 0.3, s = h * 0.36;
          var bt = bellT(g, bx, h * 0.18, s, 0, 0);
          // dây thừng: căng ra theo lực giật, ngả về phía tay
          var hx = w * 0.5 + hold * w * 0.12, hy = h * 0.92 + hold * h * 0.05, snap = relT ? Math.max(0, 1 - (t - relT) / 0.8) : 0, sw = Math.sin((t - relT) * 14) * snap * w * 0.05;
          g.strokeStyle = '#8a7450'; g.lineWidth = Math.max(2.5, h * 0.012); g.beginPath(); g.moveTo(bt[0], bt[1]); g.quadraticCurveTo(bt[0] + (hx - bt[0]) * 0.5 + (1 - hold) * w * 0.03 + sw, (bt[1] + hy) / 2, hx + sw, hy); g.stroke();
          g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1; for (var k = 0; k < 14; k++) { var u = k / 14, x = bt[0] + (hx + sw - bt[0]) * u, y = bt[1] + (hy - bt[1]) * u; g.beginPath(); g.moveTo(x - 3, y); g.lineTo(x + 3, y + 4); g.stroke(); }
          // cột tháp rên: vệt bụi rơi khi giật mạnh
          if (hold > 0.5) for (var d = 0; d < 6; d++) { g.fillStyle = 'rgba(180,160,130,' + (0.5 * (hold - 0.5)).toFixed(2) + ')'; g.fillRect(bx + (d - 3) * s * 0.2, h * 0.1 + ((t * 80 + d * 23) % (h * 0.3)), 1.5, 1.5); }
          if (!holding && !pulls) { g.strokeStyle = 'rgba(232,240,236,' + (0.2 + 0.25 * Math.sin(t * 3)).toFixed(2) + ')'; g.setLineDash([3, 5]); g.beginPath(); g.ellipse(hx, hy - h * 0.05, w * 0.05, h * 0.08, 0, 0, 7); g.stroke(); g.setLineDash([]); }
          if (cr) cr.set(0.05 + hold * 0.25, 300 + hold * 900);
          if (holding || hold > 0 || snap > 0) S.kick(200);
        },
        down: function (S) { if (pulls >= 2) return; holding = true; cr = hum('bandpass', 400, 4); S.say(''); },
        up: function (S) {
          if (!holding) return; holding = false; if (cr) { cr.stop(); cr = null; }
          if (hold < 0.35) { S.say('giữ lâu hơn để giật mạnh'); return; }
          pulls++; relT = performance.now() / 1000;
          snd(function (n) { var o = out(1); nz(o, 'bandpass', 700, 300, 1.4, 0.35, 0.12, n); nz(o, 'highpass', 2500, 1500, 1, 0.1, 0.08, n + 0.01); });
          if (pulls === 1) S.say('giật lần nữa'); else { S.say(''); S.finish(); }
          S.kick(1200);
        },
        hide: function () { holding = false; if (cr) { cr.stop(); cr = null; } }
      };
    }


    /* ================= chương 15 (Clair 26/11: combat phải xịn hơn bình thường) ================= */
    // mặt đầy mắt + vương miện chuông nhỏ (không vẽ dáng người)
    function eyes15a(g, cx, cy, s, t, R, lx, ly, a) {
      g.fillStyle = 'rgba(216,216,208,' + (0.1 * a).toFixed(3) + ')'; g.beginPath(); g.ellipse(cx, cy, s, s * 1.35, 0, 0, 7); g.fill();
      for (var b = 0; b < 13; b++) { var an = Math.PI * (0.1 + b / 12 * 0.8), x = cx + Math.cos(an) * s * 1.1, y = cy - s * 1.45 - Math.sin(an) * s * 0.45 + Math.sin(t * 7 + b) * 1.2; g.fillStyle = 'rgba(184,170,122,' + (0.8 * a * (0.4 + 0.6 * Math.abs(Math.sin(t * 2.6 + b)))).toFixed(3) + ')'; g.beginPath(); g.arc(x, y, Math.max(1.8, s * 0.06), 0, 7); g.fill(); }
      for (var e = 0; e < 22; e++) { var ex = cx + (R[e] - 0.5) * s * 1.6, ey = cy + (R[e + 22] - 0.5) * s * 2.1, z = Math.max(2, s * 0.08);
        g.fillStyle = 'rgba(255,58,42,' + (0.92 * a).toFixed(3) + ')'; g.beginPath(); g.ellipse(ex, ey, z * 1.5, z * 0.9, 0, 0, 7); g.fill();
        g.fillStyle = 'rgba(18,2,2,' + (0.95 * a).toFixed(3) + ')'; var lxe = typeof lx === 'function' ? lx(e) : lx, lye = typeof ly === 'function' ? ly(e) : ly; g.fillRect(ex + lxe * z * 0.75 - z * 0.13, ey - z * 0.7 + lye * z * 0.35, z * 0.26, z * 1.4); }
    }
    /* ---- ch15 xích Leon trói con quỷ: (1) vuốt ngang qua lại để xích quấn từ cổ chân lên vai thành cái kén;
       (2) chạm và giữ để kéo xích căng; con quỷ gồng lên từng đợt, buông tay lúc nó gồng thì xích tuột bớt;
       giữ đủ thì mấy chục con mắt quay xuống nhìn xích, tiếng "két" dài, xích căng tới rung (xong) ---- */
    // kén xích kiểu mới (Clair 26/11 thấy cột vòng tròn chồng nhau buồn cười): khối tối chìm vào bóng đêm, các vòng xích quấn xoắn chéo,
    // chỉ nửa trước sáng (trăng từ bên phải), nửa sau mờ hẳn; mép dưới và mép trên tan vào bóng tối. rows = số vòng đã quấn (0..1)
    function helixCocoon(g, cx, top, base, rw, lk, rows, t, strain) {
    // kiểu trói mới (Clair 26/11: kén quấn kín trông như xác ướp): thân tối cao gầy, vai xuôi, chìm vào bóng đêm;
    // chỉ ba vòng xích ngang giữa thân, ổ khoá ở chỗ hai tay bắt chéo. rows = tiến độ quấn (0..1): vòng hiện dần, ổ khoá sập ở cuối
    var H2 = base - top, st = strain || 0;
    function hw(v) { if (v < 0.1) return rw * (0.32 + 0.68 * Math.sin(v / 0.1 * Math.PI / 2)); return rw * (1 - (v - 0.1) * 0.32); }
    var sg = g.createLinearGradient(0, top, 0, base); sg.addColorStop(0, 'rgba(6,7,8,.96)'); sg.addColorStop(0.8, 'rgba(6,7,8,.96)'); sg.addColorStop(1, 'rgba(6,7,8,0)');
    g.fillStyle = sg; g.beginPath(); var K = 24, i, v;
    for (i = 0; i <= K; i++) { v = i / K; g.lineTo(cx - hw(v) - Math.sin(v * 9 + t * 0.7) * rw * 0.015, top + v * H2); }
    for (i = K; i >= 0; i--) { v = i / K; g.lineTo(cx + hw(v) + Math.sin(v * 8 + t * 0.6) * rw * 0.015, top + v * H2); }
    g.closePath(); g.fill();
    // viền trăng mảnh mép phải
    g.strokeStyle = 'rgba(190,206,214,.18)'; g.lineWidth = 1.2; g.beginPath(); for (i = 1; i <= K - 4; i++) { v = i / K; g.lineTo(cx + hw(v), top + v * H2); } g.stroke();
    var loops = [0.4, 0.47, 0.54], shown = rows * 3, lockA = Math.max(0, Math.min(1, (rows - 0.9) / 0.1));
    for (var r = 0; r < 3; r++) {
      var part = Math.max(0, Math.min(1, shown - r)); if (!part) continue;
      var y0 = top + loops[r] * H2, rx = hw(loops[r]) * (1.03 - st * 0.03), ry = rx * 0.2, tl = (r - 1) * 0.04, n = 15, m = Math.round(n * part);
      for (var c = 0; c < m; c++) {
        var a = (c + 0.5) / n * Math.PI, x = cx - Math.cos(a) * rx, y = y0 + Math.sin(a) * ry + (x - cx) * tl;
        var lit = 0.45 + 0.55 * Math.max(0, -Math.cos(a - 0.5)) * 0.9 + 0.1;
        g.strokeStyle = 'rgba(200,214,220,' + Math.min(1, lit).toFixed(3) + ')'; g.lineWidth = Math.max(1.2, lk * 0.2);
        g.save(); g.translate(x, y); g.rotate(Math.atan2(Math.cos(a) * ry + rx * tl * Math.sin(a), Math.sin(a) * rx)); g.beginPath(); g.ellipse(0, 0, lk * 0.42, lk * (c % 2 ? 0.1 : 0.24), 0, 0, 7); g.stroke(); g.restore();
      }
    }
    if (lockA > 0) {
      var ly = top + 0.47 * H2 + hw(0.47) * 0.2 + lk * 0.2, s = lk * 1.15, drop = (1 - lockA) * s * 0.8;
      g.save(); g.globalAlpha = lockA; g.translate(cx, ly + drop);
      g.strokeStyle = '#aab6bc'; g.lineWidth = Math.max(2, s * 0.22); g.beginPath(); g.arc(0, -s * 0.15, s * 0.42, Math.PI, 0); g.lineTo(s * 0.42, s * 0.15); g.moveTo(-s * 0.42, -s * 0.15); g.lineTo(-s * 0.42, s * 0.15); g.stroke();
      g.fillStyle = '#8f9ca2'; g.beginPath(); g.rect(-s * 0.62, s * 0.1, s * 1.24, s * 0.95); g.fill();
      g.fillStyle = 'rgba(230,240,244,.35)'; g.fillRect(s * 0.3, s * 0.14, s * 0.22, s * 0.85);
      g.fillStyle = '#0b0d0e'; g.beginPath(); g.arc(0, s * 0.45, s * 0.13, 0, 7); g.fill(); g.fillRect(-s * 0.05, s * 0.45, s * 0.1, s * 0.3);
      g.restore();
    }
  }
    function COCOON() {
      var R = seeds(80), wrap = 0, dsp = 0, phase = 0, hold = 0, holding = false, held = false, last = 0, flash = 0, look = 0, endT = 0, lastLoop = 0, strainT = 0, cr = null, slipT = 0;
      return {
        draw: function (S, t) {
          var g = S.g, w = S.w, h = S.h, dt = last ? Math.min(0.1, t - last) : 0; last = t; dsp += (wrap - dsp) * 0.25;
          // đợt gồng của con quỷ: mỗi 1.6 giây một lần khi đang ở pha giữ
          var surge = phase === 1 ? Math.max(0, Math.sin((t - strainT) * 3.9)) : 0; surge = surge > 0.75 ? (surge - 0.75) * 4 : 0;
          if (phase === 1) {
            if (holding) { hold = Math.min(1, hold + dt / 3.6); } else if (held && surge > 0.5 && dsp > 0.55) { wrap = Math.max(0.55, wrap - dt * 0.6); if (t - slipT > 0.6) { slipT = t; S.say('giữ chặt lại!'); snd(function (n) { var o = out(1, 0.3); for (var c = 0; c < 6; c++) clinkA(o, n + c * 0.05, 0.04); }); } }
            if (wrap < 1 && holding) wrap = Math.min(1, wrap + dt * 0.5);
            if (cr) cr.set(0.03 + hold * 0.12 + surge * 0.1, 1800 + hold * 1600 + surge * 600);
            if (hold >= 1 && !endT) { endT = t; phase = 2; holding = false; if (cr) { cr.stop(); cr = null; } S.finish(); S.say('');
              snd(function (n) { var o = out(1); var x = ac.createOscillator(), xg = gain(0), bp = filt('bandpass', 1400, 6); x.type = 'sawtooth'; x.frequency.setValueAtTime(900, n + 0.9); x.frequency.linearRampToValueAtTime(620, n + 2.6); xg.gain.setValueAtTime(0.0001, n + 0.9); xg.gain.linearRampToValueAtTime(0.07, n + 1.1); xg.gain.exponentialRampToValueAtTime(0.0001, n + 2.8); x.connect(bp); bp.connect(xg); xg.connect(o); x.start(n + 0.9); x.stop(n + 2.9); for (var c = 0; c < 16; c++) clinkA(o, n + 0.1 + c * 0.05, 0.02); }); }
          }
          if (endT) look = Math.min(1, (t - endT) / 0.9);
          var shake = (surge * 3 + (endT && t - endT > 0.9 && t - endT < 2.6 ? 2.5 : 0)) * Math.sin(t * 60);
          g.save(); g.translate(shake, 0);
          // nền: sân ban đêm, khung cửa bên trái
          var sk = g.createLinearGradient(0, 0, 0, h); sk.addColorStop(0, '#05080a'); sk.addColorStop(1, '#141210'); g.fillStyle = sk; g.fillRect(-10, 0, w + 20, h);
          g.fillStyle = '#1a1210'; g.fillRect(-10, h * 0.82, w + 20, h * 0.18);
          var mg = g.createRadialGradient(w * 0.85, h * 0.1, 0, w * 0.85, h * 0.1, w * 0.5); mg.addColorStop(0, 'rgba(200,212,224,.12)'); mg.addColorStop(1, 'rgba(200,212,224,0)'); g.fillStyle = mg; g.fillRect(0, 0, w, h);
          g.fillStyle = '#1a1410'; g.fillRect(0, 0, w * 0.05, h);
          var cx = w * 0.6, top = h * 0.24, base = h * 0.88, lk = Math.max(7, h * 0.03), bulge = 1 + surge * 0.08;
          helixCocoon(g, cx, top, base, w * 0.085, lk, dsp, t, surge);
          // mắt: lúc đầu nhìn ra (về phía người đọc), khi xích đủ căng thì từng con quay xuống nhìn xích
          eyes15a(g, cx, top - h * 0.02, Math.min(w, h) * 0.07, t, R, function (e) { return look ? 0 : Math.sin(t * 2 + e) * 0.4 - 0.4; }, function (e) { return look ? Math.min(1, Math.max(0, look * 2.2 - e / 22)) : 0.6; }, 1);
          // đoạn xích từ đống thép dưới chân (góc trái dưới) căng lên tới kén
          var ox = w * 0.12, oy = h * 0.9, tens = phase === 0 ? 0.3 : 0.5 + hold * 0.5, pts = [];
          for (var m = 0; m <= 26; m++) { var v = m / 26, sag = (1 - tens) * h * 0.12 * Math.sin(v * Math.PI); pts.push([ox + (cx - w * 0.08 - ox) * v, oy + (h * 0.55 - oy) * v + sag + Math.sin(v * 26 + t * 50) * (hold * 1.5 + surge * 2)]); }
          linkPath(g, pts, lk, '#c4ced2', 1);
          var heap = []; for (var b = 0; b < 14; b++) { var an = b / 14 * 6.283; heap.push([ox + Math.cos(an) * w * 0.06, oy + Math.sin(an) * h * 0.03]); } linkPath(g, heap, lk, '#c4ced2', 0.9);
          // lửa toé ở chỗ xích siết khi con quỷ gồng
          if (surge > 0.3 || (endT && t - endT > 0.9 && t - endT < 2.6)) for (var sp = 0; sp < 10; sp++) { var sx = cx + (R[sp] - 0.5) * w * 0.18, sy = top + R[sp + 10] * (base - top), u = (t * 3 + R[sp + 20]) % 1; g.strokeStyle = 'rgba(233,246,248,' + (1 - u).toFixed(2) + ')'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx + (R[sp + 30] - 0.5) * 30 * u, sy - 20 * u); g.stroke(); }
          // vòng giữ: chỉ chỗ đặt tay ở pha 2
          if (phase === 1 && !holding) { g.strokeStyle = 'rgba(232,240,236,' + (0.25 + 0.25 * Math.sin(t * 3)).toFixed(2) + ')'; g.setLineDash([3, 5]); g.beginPath(); g.ellipse(ox + w * 0.12, oy - h * 0.12, w * 0.07, h * 0.08, 0, 0, 7); g.stroke(); g.setLineDash([]); }
          // vạch lực xám thép mép dưới
          if (phase === 1) { g.fillStyle = 'rgba(169,180,186,.25)'; g.fillRect(w * 0.1, h - 6, w * 0.8, 3); g.fillStyle = 'rgba(214,224,226,.9)'; g.fillRect(w * 0.1, h - 6, w * 0.8 * hold, 3); }
          if (flash > 0) { g.fillStyle = 'rgba(214,224,226,' + flash.toFixed(2) + ')'; g.fillRect(0, 0, w, h); flash = Math.max(0, flash - dt * 2.5); }
          g.restore();
          if (Math.abs(wrap - dsp) > 0.002 || phase === 1 || (endT && t - endT < 3) || flash > 0) S.kick(200);
        },
        move: function (S, p, dx) {
          if (phase !== 0) return; var before = Math.floor(wrap * 13); wrap = clamp(wrap + Math.abs(dx) / (S.w * 3.2), 0, 1);
          var now = performance.now();
          if (Math.floor(wrap * 13) > before && now - lastLoop > 60) { lastLoop = now; snd(function (n) { var o = out(1, wrap * 1.4 - 0.7); nz(o, 'bandpass', 1500, 5500, 5, 0.12, 0.12, n); for (var c = 0; c < 4; c++) clinkA(o, n + 0.06 + c * 0.035, 0.035); }); }
          if (wrap >= 1) { phase = 1; flash = 0.35; strainT = performance.now() / 1000 + 0.6; S.say('chạm và giữ để kéo xích căng'); snd(function (n) { var o = out(1); nz(o, 'bandpass', 4000, 1500, 3, 0.25, 0.25, n); kengA(n + 0.02, 0.03); }); }
          S.kick(600);
        },
        down: function (S, p, dn) { if (phase !== 1) return; holding = true; held = true; if (!cr) cr = hum('bandpass', 2000, 6); S.say(''); },
        up: function (S) { if (phase === 1 && holding) { holding = false; if (cr) { cr.stop(); cr = null; } if (hold < 1) S.say('giữ tiếp, đừng buông'); } },
        hide: function () { holding = false; if (cr) { cr.stop(); cr = null; } },
        auto: function (S) { wrap = 1; dsp = 1; hold = 1; phase = 2; endT = performance.now() / 1000 - 3; look = 1; S.finish(); }
      };
    }
    /* ---- ch15 Luke quấn thêm băng: lòng bàn tay quấn vải cũ thấm đỏ; vuốt ngang qua lại để quấn từng vòng vải mới đè lên, vệt đỏ khuất dần;
       đủ vòng thì thắt nút, miết cho phẳng (một vệt sáng xanh băng mảnh của Luke lướt qua) ---- */
    function PALM() {
      var R = seeds(40), wp = 0, dsp = 0, done = 0, rust = null, N = 5;
      return {
        draw: function (S, t) {
          var g = S.g, w = S.w, h = S.h; dsp += (wp - dsp) * 0.2;
          g.fillStyle = '#0d0b09'; g.fillRect(0, 0, w, h);
          var lg = g.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.4, w * 0.6); lg.addColorStop(0, 'rgba(200,212,224,.08)'); lg.addColorStop(1, 'rgba(200,212,224,0)'); g.fillStyle = lg; g.fillRect(0, 0, w, h);
          var cx = w * 0.5, cy = h * 0.52, pw = Math.min(w * 0.36, h * 0.9), ph = pw * 0.62;
          // lòng bàn tay (chỉ một khối mềm, ngón khuất ra ngoài khung trên)
          var sg = g.createLinearGradient(0, cy - ph, 0, cy + ph); sg.addColorStop(0, '#6a5446'); sg.addColorStop(1, '#3a2c24'); g.fillStyle = sg; g.beginPath(); g.ellipse(cx, cy, pw * 0.62, ph * 0.72, 0, 0, 7); g.fill();
          // lớp băng cũ: vải trắng ngà, vệt đỏ sẫm loang giữa (còn ướt, hơi bóng)
          g.fillStyle = '#cfc6b2'; g.fillRect(cx - pw * 0.6, cy - ph * 0.42, pw * 1.2, ph * 0.84);
          var bl = 1 - dsp * 0.92, rg = g.createRadialGradient(cx, cy, 0, cx, cy, pw * 0.4); rg.addColorStop(0, 'rgba(122,16,32,' + (0.9 * bl).toFixed(3) + ')'); rg.addColorStop(0.6, 'rgba(122,16,32,' + (0.55 * bl).toFixed(3) + ')'); rg.addColorStop(1, 'rgba(122,16,32,0)'); g.fillStyle = rg; g.fillRect(cx - pw * 0.6, cy - ph * 0.42, pw * 1.2, ph * 0.84);
          if (bl > 0.3) { g.fillStyle = 'rgba(255,200,200,' + (0.18 * bl * (0.6 + 0.4 * Math.sin(t * 2))).toFixed(3) + ')'; g.beginPath(); g.ellipse(cx - pw * 0.08, cy - ph * 0.08, pw * 0.06, ph * 0.03, -0.4, 0, 7); g.fill(); }
          // vòng vải mới: mỗi vòng một dải chéo vắt qua, dải đang quấn chạy theo tay
          var f = dsp * N;
          for (var i = 0; i < N; i++) { var p = clamp(f - i, 0, 1); if (p <= 0) break; var y = cy - ph * 0.38 + i * ph * 0.19, x0 = cx - pw * 0.62, x1 = x0 + pw * 1.24 * p, sl = (i % 2 ? -1 : 1) * ph * 0.06;
            var bg = g.createLinearGradient(0, y, 0, y + ph * 0.2); bg.addColorStop(0, '#f6f1e4'); bg.addColorStop(0.5, '#fffdf6'); bg.addColorStop(1, '#bdb6a4'); g.fillStyle = bg;
            g.beginPath(); g.moveTo(x0, y - sl); g.lineTo(x1, y + sl * (2 * p - 1)); g.lineTo(x1, y + ph * 0.21 + sl * (2 * p - 1)); g.lineTo(x0, y + ph * 0.21 - sl); g.closePath(); g.fill();
            g.strokeStyle = 'rgba(120,110,95,.5)'; g.lineWidth = 1; g.stroke();
            if (p < 1 && !done) { g.fillStyle = '#efe8d8'; g.beginPath(); g.ellipse(x1 + 4, y + ph * 0.1, 7, ph * 0.12, 0, 0, 7); g.fill(); } }
          // nút thắt + miết phẳng, vệt sáng xanh băng mảnh (Luke)
          if (done) { var a = clamp((t - done) / 0.4, 0, 1), kx = cx + pw * 0.45, ky = cy + ph * 0.05; g.strokeStyle = 'rgba(246,241,228,' + a + ')'; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.ellipse(kx - 7, ky, 8, 5, -0.6, 0, 7); g.stroke(); g.beginPath(); g.ellipse(kx + 7, ky, 8, 5, 0.6, 0, 7); g.stroke(); g.beginPath(); g.moveTo(kx, ky); g.lineTo(kx - 4, ky + 16); g.moveTo(kx, ky); g.lineTo(kx + 7, ky + 14); g.stroke();
            var u = (t - done - 0.35) / 1.2; if (u > 0 && u < 1) { var sx = cx - pw * 0.7 + u * pw * 1.4, cg = g.createLinearGradient(sx - 40, 0, sx + 40, 0); cg.addColorStop(0, 'rgba(159,212,234,0)'); cg.addColorStop(0.5, 'rgba(190,232,245,.5)'); cg.addColorStop(1, 'rgba(159,212,234,0)'); g.fillStyle = cg; g.fillRect(cx - pw * 0.62, cy - ph * 0.42, pw * 1.24, ph * 0.84); }
            if (t - done < 2) S.kick(200); }
          if (Math.abs(wp - dsp) > 0.002) S.kick(200);
        },
        down: function () { if (!rust && !done) rust = hum('bandpass', 3000, 1.2); },
        move: function (S, p, dx) {
          if (done) return; var before = Math.floor(wp * N); wp = clamp(wp + Math.abs(dx) / (S.w * 2.2), 0, 1);
          if (rust) rust.set(Math.min(0.09, Math.abs(dx) * 0.006), 2400 + Math.abs(dx) * 60);
          if (Math.floor(wp * N) > before) snd(function (n) { nz(out(1), 'bandpass', 1600, 3200, 1.5, 0.07, 0.14, n); });
          if (wp >= 1) this.tie(S, true);
          S.kick(800);
        },
        up: function () { if (rust) { rust.stop(); rust = null; } },
        tie: function (S, sound) { if (done) return; done = performance.now() / 1000; wp = 1; S.finish(); S.say(''); if (rust) { rust.stop(); rust = null; } if (sound) snd(function (n) { var o = out(1); nz(o, 'bandpass', 2400, 1600, 2, 0.18, 0.08, n); nz(o, 'bandpass', 1800, 2600, 1.4, 0.06, 0.4, n + 0.3); tn(o, 'sine', 2637, 2637, 0.012, 0.8, n + 0.4); }); },
        auto: function (S) { this.tie(S, false); }
      };
    }

    var KINDS = { map: function () { return MAP; }, letter: function () { return LETTER; }, parry: PARRY, chain: CHAIN, hearth: HEARTH, blood: BLOOD, knock: KNOCK, bandage: BANDAGE, chest: CHEST, lamp: LAMP, remedy: REMEDY, wall: WALL, steps: STEPS, split: SPLIT, tear: TEAR, lash: LASH, rope: ROPE, basket: BASKET, forge: FORGE, cocoon: COCOON, palm: PALM };
    boxes.forEach(function (box) { var f = KINDS[box.getAttribute('data-kind')]; if (f) mk(box, f()); });
  })();

})();
