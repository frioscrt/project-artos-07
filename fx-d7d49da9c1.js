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
    var WHO = { 'leon-strike': 'leon', 'leon-rescue': 'leon', 'luke-sense': 'luke', 'luke-protect': 'luke', 'luke-eye': 'luke', 'luke-eye-sense': 'luke', 'leon-eye': 'leon', 'leon-eye-trong': 'leon', 'leon-eye-toc': 'leon', 'leon-eye-strike': 'leon', 'leon-eye-chains': 'leon', 'leon-eye-yank': 'leon', 'leon-eye-bristle': 'leon', 'leon-eye-rescue': 'leon', 'leon-eye2': 'leon', 'leon-eye2-trong': 'leon', 'leon-eye2-strike': 'leon', 'luke-eye2': 'luke', 'luke-eye2-trong': 'luke', 'luke-eye2-sense': 'luke', 'clevia-unlock': 'clevia', 'clevia-lock': 'clevia', 'clevia-lock-unlock': 'clevia', chains: 'leon', rescue: 'leon', rescuehold: 'leon', anomaly: 'luke', protect: 'luke', keysense: 'clevia', keyburst: 'clevia', stoneopen: 'clevia', yank: 'leon', bristle: 'leon', bind15: 'leon' };
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

    /* Tóc đồ từ ảnh nhân vật đã duyệt (Clair 27/11: đồ chồng lên ảnh mẫu). Sinh bằng máy: ảnh xoay cho hai mắt trùng dải, lấy các nét đen
       mảnh (tóc) thành viền nét, khối tóc tối thành mảng che; bỏ nét mắt/mày của ảnh vì mắt vẽ riêng. Không sửa tay file này. */
    var M2T = {"leon":{"occ":"M647 254L647 256L665 272L670 275L672 274L672 272L666 265L657 254L650 252ZM190 247L190 250L198 262L219 290L236 313L238 313L240 310L226 283L218 256L212 253L192 246ZM592 224L588 226L588 248L584 280L586 282L589 280L605 235L604 232ZM553 174L552 173L549 174L546 194L544 202L540 208L540 216L534 232L518 263L518 266L522 266L532 260L546 242L556 226L564 216L565 208L568 200L560 190ZM452 148L450 148L450 164L465 172L468 172L469 170L462 160L462 158L466 155L466 153L455 148ZM0 -110L0 320L157 320L157 312L154 301L153 288L156 277L156 262L158 229L148 221L132 206L123 194L116 181L110 160L110 146L112 130L116 120L120 110L130 96L148 79L170 64L194 52L220 44L250 39L276 38L278 36L281 10L280 -8L277 -16L276 -26L276 -54L278 -60L280 -60L288 -40L294 -31L312 -10L324 12L336 28L336 31L334 32L316 36L316 37L316 40L338 44L352 48L372 55L390 64L395 60L424 60L449 64L475 65L491 69L494 72L496 76L496 88L494 106L490 116L492 131L488 151L485 156L484 164L482 172L479 176L474 178L477 187L468 210L468 212L470 214L473 212L478 204L484 190L486 188L490 186L490 178L499 159L504 142L505 139L511 134L510 126L516 110L524 78L526 74L540 76L545 80L548 92L551 118L554 120L556 118L560 110L568 99L588 79L610 64L628 55L649 48L676 41L678 40L678 26L680 24L681 24L685 29L688 38L691 39L712 38L738 38L764 41L778 44L800 50L815 56L830 64L851 78L861 87L874 102L884 120L888 130L890 146L890 160L885 178L880 190L868 206L849 224L830 236L800 250L766 258L738 262L712 262L683 260L680 260L678 263L702 290L714 300L730 308L731 311L728 320L790 320L791 310L794 304L796 304L798 308L800 320L948 320L950 304L957 282L966 268L970 250L977 224L981 218L988 216L986 198L986 188L987 181L990 178L991 178L1000 186L1000 95L995 92L992 87L992 82L994 80L1000 80L1000 -52L996 -54L994 -59L986 -88L984 -96L984 -110L493 -110L494 -98L499 -60L498 -44L501 5L501 32L500 36L497 38L494 38L482 34L461 30L438 31L427 30L402 30L378 31L374 29L370 25L362 10L360 2L346 -24L338 -44L329 -77L327 -110ZM532 18L534 22L540 38L542 50L542 54L540 56L537 56L533 54L526 46L525 42L528 24Z","lines":"M638.2 243.5L638.1 242.7L637.8 241.2L636.6 239.3L634.4 237.3L630.9 232.7L626 225.7L622.5 219.7L620.2 214.8L619.2 210.6L619.5 206.8L618.4 202.9L616 199.2L615.2 195.5L615.9 191.6L616.8 189.4L617.9 188.9L618.6 188.7L618.4 188.3L617.8 188.6L616.5 189.1L615.4 191.4L614.5 195.5L615.2 199.5L617.4 203.3L618.3 206.9L618 210.7L619 215.2L621.3 220.3L625 226.3L630.1 233.3L633.9 237.7L636.2 239.7L637.4 241.3L637.7 242.8L637.8 243.5ZM575.9 294.6L577.1 295.5L579.5 297.3L579.8 300.7L578.2 306L575.8 311L572.4 315.5L569.9 318L568 318.6L567 318.9L567 319.1L568 318.9L570.1 318.5L573.1 316L576.7 311.5L579.3 306.5L580.7 300.8L580 297L577.4 295.2L576.1 294.4ZM636.6 -84.5L635.2 -90.4L631.7 -101.9L629.6 -107.5L629.4 -107.5L630.8 -101.6L634.3 -90.1L636.4 -84.5ZM701.6 33.9L698.9 26L692.9 10.2L689.6 2.4L689.4 2.6L692.1 10.5L698.1 26.3L701.4 34.1ZM155.4 272L155.9 275.1L156.9 281.1L157.4 289.6L157.6 300.9L157.9 306.5L158.1 306.5L158.4 300.9L158.6 289.6L157.8 280.9L156.4 274.9L155.6 272ZM191.7 155.5L191.6 154.1L191.4 151.4L191.8 149.4L192.8 147.8L195.3 135.6L199 112.6L202.4 96.8L205.8 88.1L207.6 82.3L207.8 79.5L208.8 75.4L210.4 69.8L211.1 66L210.8 64L210.7 63L210.3 63L210.4 64L210.6 66L209.8 69.7L208 75.1L206.9 79.3L206.6 82L204.7 87.7L201.1 96.4L197.5 112.4L194.2 135.4L192.2 147.7L191.2 149.1L190.9 151.4L191.2 154.1L191.3 155.5ZM885.1 11.5L884.3 7.4L882.5 -0.6L881.1 -7.6L880.2 -13.5L879.6 -16.5L879.4 -16.5L879.6 -13.5L880.1 -7.4L881.5 -0.4L883.7 7.6L884.9 11.5ZM12.9 190.5L12.9 191.5L13.1 193.5L12.5 196.3L11.2 200L10.5 203.1L10.4 205.3L9 211L6.2 220.3L4.9 225L5.1 225L6.8 220.5L10 211.3L11.6 205.5L11.5 203.2L12.1 200.3L13.2 196.5L13.6 193.5L13.3 191.5L13.1 190.5ZM986.5 66.9L986 66.7L985.1 66.5L984.3 65L983.3 62.2L981.1 58.9L977.6 55.3L973.8 52.2L969.8 49.5L967.1 46.9L965.8 44.3L965.1 42.9L964.9 43.1L965.4 44.5L966.6 47.3L969.2 50.2L973.2 53.1L976.9 56.2L980.4 59.6L982.7 62.6L983.7 65.2L984.9 66.8L986 67L986.5 67.1ZM431 50.2L432.6 50.1L435.9 49.9L438.7 50.3L441.2 51.4L444.4 51.9L448.1 51.7L451.1 52L453.7 52.7L461.2 53.1L473.7 53L482.3 53.5L487.1 54.6L489.5 55.2L489.5 54.8L487.2 54.2L482.4 52.8L473.8 52L461.3 51.9L453.8 51.5L451.4 50.8L448.1 50.6L444.4 50.9L441.3 50.6L438.8 49.7L435.9 49.3L432.6 49.7L431 49.8ZM481.1 155.9L480.4 155.3L478.9 154.2L476.9 153.4L474.3 152.8L470.7 152.7L466.2 153.2L462.3 153.1L458.8 152.3L457 151.9L457 152.1L458.7 152.7L462.2 153.9L466.3 154.3L470.8 153.8L474.2 153.7L476.6 154.1L478.6 154.8L480.1 155.7L480.9 156.1ZM944.4 1.1L945.2 3.1L947.1 7.3L949.8 11.4L953.5 15.6L955.4 17.6L955.6 17.4L954 15.2L950.7 10.8L947.9 6.7L945.8 2.9L944.6 0.9ZM929.8 20L932.6 31.2L938.4 53.5L942.1 67.5L943.3 73.2L943.8 76L944.2 76L943.7 73.1L942.9 67.3L939.6 53.2L933.4 31L930.2 20ZM65.9 105.5L65.6 107.5L65.2 111.5L66.1 118.2L68.5 127.5L69.9 132L70.1 132L69.2 127.3L67.2 118L66 111.5L66.1 107.5L66.1 105.5ZM213.6 53.5L214.6 48.3L215.8 37.8L216.1 32.5L215.9 32.5L214.9 37.7L213.7 48.2L213.4 53.5ZM852.1 88.3L850.5 87L847.3 84.5L843.9 82.4L840.5 80.9L837.7 78.5L835.5 74.9L827.2 65.2L812.9 49.3L796.4 28.9L777.6 4L763.8 -15.2L755.2 -28.9L748.7 -38.1L744.3 -42.8L742.2 -45.2L741.8 -44.8L743.9 -42.4L748.1 -37.7L754.3 -28.4L762.7 -14.5L776.2 5L794.9 30.1L811.6 50.4L826.3 66.1L834.7 75.6L837 79L840 81.6L843.6 83.1L846.9 85L850.2 87.5L851.9 88.7ZM519.3 70.9L518.5 72.9L517 76.9L515.2 83.9L513.4 93.9L511.9 99.8L510.9 101.8L509.6 106.6L508 114.1L506.4 119.9L504.6 124.1L503.7 127.4L503.7 129.3L502.6 132.7L500.3 137.6L499 140.3L498.9 140.4L497.8 140.6L496 140.7L495.2 139.8L495 137.4L495.2 135.8L496 134.8L496.4 132.4L496.4 129.2L496.7 127L497.5 125.5L497.9 122.5L497.8 118.6L498.8 109.2L500.6 94.4L501.5 80.4L501.3 67.1L501.2 60.5L500.8 60.5L500.7 67.1L500.5 80.4L499.4 94.3L497.2 109L496.2 118.4L496.1 122.5L495.8 125L495 126.5L494.6 129.1L494.6 132.3L494.3 134.2L493.5 135.2L493.2 137.4L493.5 140.4L495.3 142.3L497.9 142.4L499.6 142.1L500.5 141.2L501.9 138.4L504.2 133.3L505.3 129.7L505.3 127.6L506.2 124.7L507.9 120.4L509.5 114.4L510.9 106.9L512.1 102.2L513.1 100.2L514.4 94.1L516 84.1L517.5 77.1L519 73.1L519.7 71.1ZM0.2 150.5L0.5 148.3L1.1 143.8L1.5 125.7L1.1 94.2L1 78.1L1.4 77.5L1.6 77.1L1.4 76.9L1.1 77.3L0.5 78.1L0.1 94.3L0.3 125.8L0.4 143.7L0 148.2L-0.2 150.5ZM623.3 61L623.1 62.2L622.8 64.7L620 72.6L614.6 86.1L610.6 97.2L608 105.9L606.1 111.6L604.9 114.2L603.2 116.9L600.8 119.7L599.5 124.1L599.2 129.7L598.6 133L597.6 134.4L596 139.2L593.7 147.1L587.9 158.6L578.5 173.9L572.7 184.5L570.4 190.3L568.5 194L566.8 195.7L564.6 199.3L561.8 204.6L560.3 208.6L560.1 211.1L559.2 213.1L557.6 214.8L556.2 215.7L555.2 216L553.8 215.2L551.7 213.2L549.2 212L546.4 211.8L544.4 211L542.9 209.6L542.2 208.8L541.8 209.2L542.6 209.9L544.1 211.5L546.3 212.4L549 212.7L551.3 213.8L553.2 215.8L555 216.8L556.6 216.5L558.2 215.5L560 213.7L561.1 211.4L561.4 208.9L562.9 205.1L565.7 199.9L567.9 196.5L569.7 194.8L571.8 190.9L574.1 185.2L580 174.8L589.6 159.6L595.5 147.9L597.8 139.8L599.4 135.1L600.4 133.5L601 129.8L601.3 124.4L602.4 120.5L604.6 117.9L606.4 115L607.6 112.2L609.5 106.3L611.9 97.6L615.6 86.4L620.7 72.9L623.4 64.8L623.6 62.3L623.7 61ZM47.1 263L45.4 255.1L41.5 239.6L39.3 231.3L39.5 230.2L39.6 229.5L39.4 229.5L39.2 230.1L38.9 231.4L40.5 239.9L44.6 255.4L46.9 263ZM14.4 -109L13.6 -104.8L12.4 -96.3L12.4 -90L13.4 -86L13.9 -84L14.1 -84L13.9 -86L13.3 -90L13.6 -96.2L14.4 -104.7L14.6 -109ZM157.7 178.5L157.4 177.2L157 174.7L157.2 173L158 171.7L158.6 167.9L159 161.7L159.7 157.4L161 154.8L161.1 148.3L159.8 138.1L159.2 133L158.8 133L159.2 138.2L159.9 148.4L159.8 154.7L158.5 157.1L157.8 161.6L157.7 167.8L157.3 171.5L156.6 172.8L156.5 174.8L157.1 177.3L157.3 178.5ZM673.8 242.1L675.2 244.3L677.8 248.5L678.9 251.3L678.4 252.6L677.5 253.7L676.5 254.6L669.4 247.8L656.6 233.3L648.6 223.6L645.6 218.6L641.6 214L636.8 210.1L633.4 206.9L631.4 204.5L629.7 201.6L628.4 198.1L626.5 195L623.9 192.2L622.6 190.9L622.4 191.1L623.6 192.5L626 195.3L627.8 198.4L629 201.9L630.6 205L632.6 207.6L636 210.9L640.7 215L644.4 219.4L647.4 224.4L655.4 234.2L668.6 248.7L676 255.4L678 254.3L679.1 252.9L679.6 251.2L678.4 248.2L675.6 244L674.2 241.9ZM34.9 -45.5L34.4 -40.5L34.2 -30.5L34.4 -25.5L34.6 -25.5L35.1 -30.5L35.3 -40.5L35.1 -45.5ZM482 33.8L479.5 34.2L474.5 34.8L471.6 34.7L470.6 34L467.6 33.5L462.9 33.5L459.6 33.1L457.6 32.3L454.5 32.1L450.5 32.6L444.8 32.6L437.3 32.1L431.3 32.2L427.1 33L424.6 33.1L423.7 32.4L422 31.9L419.6 31.6L414.6 32.2L406.8 33.6L403 34.3L403 34.7L406.9 34.1L414.7 33L419.6 32.6L421.8 32.9L423.3 33.4L424.4 34.2L427.2 34.2L431.4 33.5L437.2 33.4L444.7 33.9L450.5 33.9L454.5 33.4L457.4 33.5L459.4 34.2L462.9 34.5L467.6 34.5L470.4 34.8L471.4 35.5L474.5 35.5L479.5 34.6L482 34.2ZM141.4 195.9L141.1 196.6L140.5 197.8L140.1 201.7L140 208.2L138.9 214.4L137 220.4L136.1 224.9L135.9 228L135.9 229.5L136.1 229.5L136.3 228L136.7 225.1L138 220.6L140.1 214.6L141 208.3L140.9 201.8L141 197.9L141.4 196.7L141.6 196.1ZM935.2 212.5L934.6 210.1L933.5 205.3L932.8 200.1L932.7 194.3L932.1 189L931.1 184.3L930.6 176.5L930.4 165.5L930 158.9L929.4 156.6L929.2 155.5L928.8 155.5L929.1 156.7L929.5 158.9L929.6 165.5L929.4 176.5L929.9 184.5L930.9 189.2L931.6 194.4L931.9 200.2L932.8 205.4L934.2 210.2L934.8 212.5ZM714 128.7L714.5 128.8L715.4 129.1L716.7 130.3L718.4 132.5L719.8 135.4L721 138.9L721.6 142.1L721.9 144.7L718.8 146.7L711.9 148.1L705.4 148.9L699.5 149.2L695.3 149.6L692.9 150.1L691.3 150.8L690.3 151.8L690 153.4L690.3 155.3L691.6 157.9L693.9 161.1L695.3 164.5L695.9 168.2L696.9 171.5L698.5 174.3L700 176.2L701.3 177.1L701.9 177.6L702.1 177.4L701.5 176.9L700.3 175.8L699 174L697.6 171.2L696.6 168L696.2 164.3L694.8 160.6L692.6 157.3L691.5 154.9L691.3 153.4L691.5 152.4L692 151.9L693.3 151.4L695.5 150.9L699.5 150.6L705.6 150.3L712.1 149.4L719.2 147.8L722.8 145.3L722.6 141.9L721.8 138.6L720.5 135.1L718.9 132.2L717.1 130L715.6 128.7L714.5 128.4L714 128.3ZM401.5 32.4L396.6 32.7L386.8 33.9L382 34.9L382 35.1L386.9 34.8L396.7 33.6L401.5 32.6ZM543.1 162.9L539.5 160.3L532.4 155.1L527.4 150.6L524.5 146.6L522 144L520.2 143L519.4 142.1L519.1 140.8L517.9 139.7L516.2 138.9L514.2 137.2L511.9 134.2L509.1 132.2L506.1 131.3L504.5 130.9L504.5 131.1L505.9 131.7L508.9 132.8L511.4 134.8L513.5 137.8L515.6 139.8L517.3 140.6L518.1 141.4L518.4 142.7L519.5 144L521.2 145L523.5 147.4L526.6 151.4L531.8 155.9L539.2 160.7L542.9 163.1ZM136.9 280L136.6 280.8L135.9 282.6L136.4 286.9L138.3 293.3L139.4 296.5L139.6 296.5L139 293.2L137.4 286.6L136.6 282.6L136.9 280.9L137.1 280ZM999.7 -72L999.4 -78.5L998.6 -91.6L996.7 -98.9L994 -100.3L992.2 -101.8L990.9 -103.7L988.9 -105.5L986.4 -106.9L985.1 -107.6L984.9 -107.4L986.1 -106.6L988.6 -105L990.3 -103.3L991.5 -101.2L993.5 -99.5L995.8 -98.4L997.4 -91.4L998.6 -78.5L999.3 -72ZM730.9 242.1L732 243.4L734.1 246L736.1 249.6L738 254.4L739.8 257.7L741.3 259.4L742.7 261.6L744.1 264.2L744.5 266.1L744.1 267.3L743.9 267.9L744.1 268.1L744.4 267.4L745 266.1L744.7 264L743.5 261.2L742.2 258.8L740.7 257.1L739 253.9L736.9 249.2L734.7 245.5L732.3 243.1L731.1 241.9ZM304.4 -109.8L305.1 -109.6L306.3 -109.1L307.2 -108.2L307.9 -107L309 -103L310.6 -96.2L312.3 -90.7L314 -86.4L315.3 -83.9L316.4 -83.1L318.2 -82.8L320.8 -82.8L322.7 -83.3L323.7 -84.4L324.1 -87.7L324 -93.3L323.4 -98.7L322.3 -104L321 -107.4L319.4 -108.9L318.6 -109.6L318.4 -109.4L319.1 -108.6L320.5 -107.1L321.7 -103.8L322.6 -98.6L323 -93.2L322.9 -87.8L322.5 -84.8L322.1 -84.5L320.7 -84.2L318.3 -84.2L316.8 -84.4L316.4 -84.6L315.2 -86.9L313.4 -91.1L311.6 -96.5L309.7 -103.2L308.4 -107.2L307.6 -108.5L306.5 -109.4L305.2 -109.9L304.6 -110.2ZM982.8 90L984.5 99.7L988 119L988.7 135.7L986.7 150.1L984.7 159.7L982.5 164.2L980.7 166.3L979.2 166L977.1 165.1L974.7 163.4L973.2 161.3L972.4 158.4L971.9 151.6L971.8 140.9L971.7 135.5L971.3 135.5L971.2 140.9L971.1 151.6L971.3 158.6L972.1 161.7L973.8 164.3L976.4 166.2L978.8 167.3L981.3 167.5L983.7 165L986.1 160.1L988.3 150.4L990.3 135.8L989.2 118.8L985.2 99.6L983.2 90ZM481.6 115.4L474.5 110.8L460.1 101.8L449.8 96.4L444 94.3L440.2 93.3L438.4 93.3L437.5 93.3L437.5 93.7L438.4 93.7L440.1 93.7L443.8 94.9L449.4 97.3L459.4 102.9L474 111.5L481.4 115.6ZM189.9 -34.4L195.2 -22.9L206.4 -0.2L212.4 11.1L212.6 10.9L207.3 -0.6L196.1 -23.3L190.1 -34.6ZM167.9 83.5L168.5 87.6L169.7 95.6L170.8 100.3L171.6 101.6L172.6 105.2L174 111.5L175.3 115.5L176.3 117.2L176.9 118.1L177.1 117.9L176.7 117L175.7 115.3L174.8 111.3L173.7 105L172.7 101.2L171.9 99.9L170.8 95.4L169 87.4L168.1 83.5ZM201.4 278.1L202.4 279.7L204.6 283L206.1 286L207.1 288.8L208.4 290.9L209.9 291.9L211 293.6L211.9 296.4L213.6 299.3L215.9 302.4L219.7 306.9L225.1 312.8L228.9 316.5L231.3 317.9L232.4 318.6L232.6 318.4L231.5 317.6L229.3 316L225.7 312.2L220.6 306.1L216.9 301.6L214.6 298.7L213.1 295.9L212 293.1L210.6 291.1L209.1 290.1L207.9 288.4L206.9 285.7L205.2 282.7L202.8 279.5L201.6 277.9ZM475.5 59.8L473.5 60.1L469.5 60.8L466 60.8L463.1 60L459.2 59.7L454.8 59.9L451.5 59.7L449.2 58.9L446 58.6L442 58.8L439.2 58.3L437.2 57L433.4 56.5L428.1 56.7L424.9 56.3L423.4 55.3L419.9 55L414.6 55.5L411.7 55.3L410.6 54.6L404 54.3L392 54.5L385.5 54.2L384.7 53.6L383.3 52.4L381.6 50.8L380.8 49.4L380.5 47.9L379.2 45.6L377 42.8L375.4 39.8L374.4 36L372.9 33.3L371.1 32.3L370 30.7L369.3 28L366.5 22.9L361.7 15.6L358.9 10.5L357.9 7.3L356 3.3L353.2 -1.2L347.5 -13.1L338.9 -32.5L332.6 -48.7L328.5 -61.7L325.1 -69L322.5 -70.5L320.8 -72.9L319.8 -76.3L319.3 -79.3L319.3 -81.8L319.2 -83L318.8 -83L318.7 -81.8L318.7 -79.2L319.2 -76.2L320.2 -72.6L322 -70L324.4 -68.5L327.5 -61.3L331.4 -48.3L337.6 -32L346 -12.4L351.5 -0.3L354.3 4.2L356.1 8L357.1 11.3L360 16.6L364.8 23.9L367.5 28.8L368.2 31.5L369.7 33.7L371.4 34.7L372.6 36.7L373.6 40.5L375.3 43.9L377.6 46.7L378.7 48.6L379 50.1L380.1 52L382 53.8L383.6 55.1L385.3 56.1L392 56.3L404 56L410.4 56.2L411.3 56.9L414.7 57L419.9 56.5L423.1 56.7L424.6 57.7L428.1 58.1L433.4 57.8L436.8 58.2L438.8 59.4L442 59.9L446 59.7L449 59.9L451.3 60.6L454.8 60.8L459.2 60.5L462.9 60.7L466 61.5L469.5 61.4L473.5 60.6L475.5 60.2ZM127.1 151.5L126.7 147.9L125.7 140.9L124.9 134.6L124.4 128.9L124.1 126L123.9 126L123.8 128.9L123.9 134.7L124.6 141.1L126.1 148.1L126.9 151.5ZM831.2 250.5L831.4 246.1L831.9 237.4L831.4 228.1L829.8 218.2L826.4 210.5L821.2 205.1L818.6 202.4L818.4 202.6L820.8 205.4L825.6 211L828.7 218.5L830.1 228.2L830.9 237.4L830.8 246.1L830.8 250.5ZM772.1 283.9L771.5 282L770.2 278.2L768.3 274.7L766 271.8L764.9 269.9L765 269L765.1 268.5L764.9 268.5L764.7 269L764.4 270.1L765.3 272.2L767.4 275.3L769.3 278.6L771 282.2L771.9 284.1ZM891.4 -40.9L891.8 -39.9L892.8 -37.9L895.6 -34.1L900.3 -28.8L905.1 -23.7L910.1 -18.9L914.1 -15.5L917.1 -13.5L923.2 -7.6L932.6 2.2L937.4 7.1L937.6 6.9L933.1 1.8L924 -8.4L917.9 -14.5L914.9 -16.5L910.9 -19.9L905.9 -24.6L901 -29.5L896.1 -34.6L893.2 -38.1L892.2 -40.1L891.6 -41.1ZM761.4 29.1L763.7 31.3L768.4 35.7L772.7 40.5L776.9 45.7L779.8 50.2L781.5 53.9L783.1 59.2L784.7 66.2L786.9 71.6L789.8 75.3L791.2 78.1L791.2 80L791.8 82L792.8 83.7L793.4 84.6L793.6 84.4L793.2 83.5L792.2 81.8L791.8 80L791.8 77.9L790.5 74.9L787.8 71.1L785.8 65.8L784.4 58.8L782.7 53.4L780.9 49.5L777.9 45L773.5 39.8L768.9 35.1L764 30.9L761.6 28.9ZM66.6 280.4L64.7 276.1L60.6 267.5L57.7 261.4L56.1 257.8L55.3 255.1L55.2 253.4L55.1 252.5L54.9 252.5L54.8 253.4L54.7 255.2L55.4 258L56.8 261.8L59.6 268L64.1 276.4L66.4 280.6ZM883.9 -70.4L886 -66.4L890.3 -58.2L898.3 -47.5L910 -34.4L915.9 -27.9L916.1 -28.1L910.5 -34.9L899.2 -48.3L891.2 -58.8L886.5 -66.6L884.1 -70.6ZM742.6 -51.1L739.4 -56.1L732.9 -65.9L727.7 -75.2L723.8 -83.8L720.6 -90.3L717.9 -94.5L716.6 -96.6L716.4 -96.4L717.6 -94.3L719.9 -90L722.9 -83.4L726.6 -74.6L731.9 -65.3L738.9 -55.7L742.4 -50.9ZM581.6 227.4L580.4 226.1L578 223.5L575.5 221.4L573.1 220.2L571 218.5L569.2 216.2L566.3 214.5L562.5 213.4L560.5 212.9L560.5 213.1L562.3 213.9L565.9 215.3L568.5 217L570.2 219.3L572.4 221.1L575 222.3L577.5 224L580.1 226.4L581.4 227.6ZM150.1 -76L148 -82.8L143.3 -96L140.6 -102.5L140.4 -102.5L142.5 -95.7L147.2 -82.5L149.9 -76ZM432.4 122.1L436.8 124L445.5 127.7L454 130.5L462.2 132.2L469.7 134.4L476.5 137.2L479.9 138.6L480.1 138.4L476.7 136.8L470 133.6L462.5 131.1L454.3 129.3L445.8 126.8L437 123.5L432.6 121.9ZM902.7 273.5L902.4 272.1L902 269.4L902.5 266.6L903.8 263.6L904.9 259.3L905.7 253.8L906.4 246L906.9 236L906.9 228.4L906.5 223.1L905.8 218.9L904.7 215.9L904.2 214.4L903.8 214.6L904.3 216.1L905.2 219.1L905.7 223.2L905.9 228.4L905.6 236L905.1 246L904.5 253.7L903.9 259.2L903 263.4L901.8 266.4L901.5 269.4L902.1 272.2L902.3 273.5ZM837.2 67.5L836.8 65.3L836.2 61.1L836.4 53.1L837.3 41.4L838.1 32.6L838.9 26.6L839.2 21.5L838.8 17.5L838.7 15.5L838.3 15.5L838.4 17.5L838.6 21.5L838.1 26.4L836.9 32.4L836 41.3L835.4 53.1L835.5 61.1L836.4 65.4L836.8 67.5ZM120.9 -61.5L120.3 -55.8L119.8 -44.3L119.9 -38.5L120.1 -38.5L120.7 -44.2L121.2 -55.7L121.1 -61.5ZM537.4 197.8L536.7 198.1L535.1 198.6L533.4 200.1L531.7 202.5L529.3 203L525.9 201.7L523.1 200.1L520.9 198.1L517.8 196L513.7 193.9L507.9 191.5L500.1 188.7L492.4 185.4L484.7 181.7L478.9 179.3L475.1 178.3L472.9 177.6L472.4 177.3L471.9 176.3L471.4 174.2L470.1 172.2L468.3 170.4L464.1 167.2L457.5 162.5L452.1 158.2L447.8 154.3L445.6 152.4L445.4 152.6L447.5 154.7L451.7 158.8L457 163.2L463.4 168.1L467.5 171.3L469.1 173L470.1 174.8L470.6 176.7L471.3 178.2L472.4 178.9L474.7 179.7L478.4 180.7L484.1 183.1L491.8 186.8L499.6 190.1L507.4 192.8L513.3 195.1L517.2 197L520.3 198.9L522.6 200.9L525.6 202.5L529.2 203.7L532.1 203L533.8 200.4L535.4 198.9L536.8 198.4L537.6 198.2ZM964.6 225L964 222.3L962.7 217L961.7 209.9L960.9 200.9L959.8 194.2L958.4 189.7L957.6 187.5L957.4 187.5L957.9 189.8L959 194.3L959.8 201.1L960.6 210.1L961.8 217.2L963.5 222.4L964.4 225ZM807.1 319.4L806.5 318.8L805.3 317.9L804.9 315.4L805.2 311.1L804.9 306.6L804 301.8L803.9 298.7L804.7 297L805.4 292.8L805.9 286.3L806.1 278.5L805.9 269.4L804.9 261.5L803.1 254.8L802.5 246.8L803.1 237.3L803 230.5L802.2 226.5L801.9 222.9L802.1 219.7L802.4 218L802.8 217.8L803.1 217.7L802.9 217.3L802.7 217.5L802.1 217.8L801.6 219.6L801.3 222.9L801.5 226.5L802.2 230.5L802.1 237.2L801.2 246.7L801.7 255L803.4 261.8L804.4 269.6L804.6 278.5L804.6 286.2L804.1 292.7L803.6 296.7L802.8 298.6L803 301.9L804.1 306.7L804.5 311.1L804.3 315.4L804.9 318.1L806.2 319.2L806.9 319.6ZM963.9 275.6L964.1 276L964.6 276.6L964.5 282.9L964 294.6L963.5 304.2L962.6 311.7L961.8 315.9L960.9 316.9L960.4 317.4L960.6 317.6L961.1 317.1L962.2 316.1L963.4 311.8L964.5 304.3L965.2 294.6L965.3 282.9L964.9 276.6L964.4 275.8L964.1 275.4ZM893.4 295.5L891.9 299.3L889.2 306.9L887.1 312.4L885.5 315.6L883.8 317.6L881.9 318.4L881 318.9L881 319.1L882.1 318.8L884.2 318.1L886.2 316.1L888.1 312.8L890.3 307.3L892.6 299.5L893.6 295.5ZM926.4 -102.4L932.1 -96.4L943.7 -84.4L952.3 -74.9L957.9 -67.5L962.1 -62.9L964.6 -61.2L965.9 -60.4L966.1 -60.6L964.9 -61.5L962.4 -63.3L958.6 -68L953.2 -75.6L944.6 -85.3L932.6 -96.9L926.6 -102.6ZM637.9 -109.9L638.6 -109.2L640 -108L641.4 -103.5L643.3 -95.8L644.4 -92L644.6 -92L644 -96L642.4 -103.8L640.5 -108.3L638.9 -109.5L638.1 -110.1ZM945.6 197L945.2 195.3L944.4 192L944 188.8L944 185.5L942.9 181.8L940.7 177.9L939.6 175.9L939.4 176.1L940.3 178.1L942.1 182.2L943 185.7L943 188.9L943.6 192.2L944.8 195.4L945.4 197ZM589.3 173L589.1 175.9L588.8 181.6L589.2 188.4L590.3 196.2L590.7 203.4L590.4 210.1L590.5 215.5L591 219.5L590.9 228.3L590.3 242.1L590.5 249.6L591.7 250.9L593.1 251.3L594.5 251L595.8 250.3L597.2 249.2L598 247.5L598.2 245L596.5 243.5L593.2 243L591.5 242.8L591.5 243.2L593.1 243.5L596.3 244L597.6 245.2L597.3 247.3L596.6 248.8L595.4 249.7L594.2 250.2L593.1 250.4L592.3 250.1L591.5 249.4L591.5 242.1L592.3 228.4L592.5 219.5L592 215.5L591.8 210.1L592 203.4L591.4 196.1L590.1 188.3L589.5 181.6L589.6 175.9L589.7 173ZM153.3 8.5L155 20L159 42.7L161.3 54L161.7 54L160 42.5L156 19.8L153.7 8.5ZM975.4 -109.9L976 -109.2L977.2 -108L978.4 -104.3L979.7 -98L980.8 -89.3L981.8 -78.1L982.4 -72.5L982.6 -72.5L982.5 -78.1L982 -89.4L980.8 -98.2L979.1 -104.5L977.6 -108.2L976.3 -109.5L975.6 -110.1ZM190.8 262L190.7 262.6L190.4 263.9L190.7 265.9L191.7 268.7L192.3 272.8L192.7 278.3L192.7 282.5L192.1 285.5L192.1 288.9L192.6 292.7L192.8 298.7L192.7 307.2L192.9 312.8L193.5 315.3L194.6 317.3L196.1 318.5L196.9 319.1L197.1 318.9L196.4 318.2L194.9 317L194 315.2L193.6 312.7L193.6 307.3L194 298.8L193.9 292.6L193.4 288.8L193.4 285.5L193.8 282.5L193.8 278.2L193.2 272.7L192.3 268.5L191.3 265.8L190.8 263.9L191 262.7L191.2 262ZM979.1 203L979 201.5L978.6 198.5L979.2 195.5L980.7 192.3L981.6 189.2L981.6 186.4L982.1 183.6L983 180.6L983.2 176.1L982.5 170.4L982.1 167.5L981.9 167.5L982 170.4L982.3 176.1L982 180.4L980.9 183.4L980.4 186.3L980.4 189.1L979.8 192L978.3 195.2L977.9 198.5L978.5 201.5L978.9 203ZM535.6 57.9L533.8 56.2L530.1 52.9L526.4 50.4L523 48.9L521.5 46.1L521.6 41.8L522 38.9L522.7 37.4L523.1 34.5L523.2 30.5L523.6 27.8L524.3 26.1L524.7 23.2L524.8 19.4L525.5 14L527 6.8L527.7 0.8L527.7 -3.7L528.9 -9.7L531.3 -17.5L532.5 -25.7L532.6 -34.2L532.7 -38.5L532.3 -38.5L532.1 -34.3L531.7 -25.8L530.2 -17.7L527.6 -10L526.3 -3.8L526.3 0.7L525.5 6.5L524 13.7L523.2 19.3L523.3 23.1L522.9 25.7L522.2 27.5L521.8 30.5L521.9 34.5L521.5 37.1L520.8 38.6L520.4 41.7L520.5 46.4L522.5 49.6L526.1 51.1L529.7 53.4L533.5 56.6L535.4 58.1ZM828.1 -66.6L826.3 -71.8L822 -82L819.6 -87.1L819.4 -86.9L821.2 -81.7L825.5 -71.5L827.9 -66.4ZM868.9 283L868 288L866.6 297.9L865.2 304.2L863.7 306.9L862.7 310.6L862.1 315.2L861.3 317.8L860.4 318.5L859.9 318.9L860.1 319.1L860.6 318.8L861.7 318L862.7 315.3L863.6 310.9L864.8 307.3L866.3 304.6L867.7 298.1L868.7 288L869.1 283ZM421.1 114.4L418 109.7L411.7 100.3L407.5 94.7L405.5 93L404.2 91L403.5 88.4L400.9 84.5L396.6 79.2L393.8 74.9L392.2 71.2L390.5 68.3L388.7 66.7L387.6 63.4L387 58.5L386.7 56L386.3 56L386.5 58.5L386.9 63.6L388 67.1L389.8 68.9L391.3 71.6L392.7 75.4L395.6 80L399.8 85.3L402.3 89.1L403 91.5L404.5 93.8L406.5 95.5L410.8 100.9L417.5 110L420.9 114.6ZM975.4 -51.4L978.9 -47.1L986.4 -38.8L990.4 -34.9L990.6 -35.1L987.1 -39.4L979.6 -47.7L975.6 -51.6ZM277.6 23.4L276.9 22.8L275.4 21.9L274.8 19.5L274.9 15.5L275.2 13.2L275.7 12.5L275.7 11.5L275.3 11.2L275 2.6L274.5 -14.1L274.2 -22.5L273.8 -22.5L273.7 -14.1L273.8 2.6L274.2 11.3L274.8 12L274.8 12.2L274.3 13L274.1 15.5L274.2 19.5L275.1 22.1L276.6 23.2L277.4 23.6ZM966.3 58.1L967 60.4L968.4 65.2L969.9 74.6L971.5 88.6L972.6 100.4L973.2 110.1L973.2 115.6L972.5 116.7L972.2 118.7L972.2 121.3L972.5 123.4L973.1 125.2L973.3 126L973.7 126L973.4 125.1L973 123.3L972.8 121.2L972.8 118.8L973.2 117L974 115.7L974.3 110.1L973.9 100.3L972.8 88.4L970.9 74.4L969.1 65.1L967.5 60.3L966.7 57.9ZM181.6 147.4L181.3 146.7L180.6 145.2L180.2 143L180 140L180.4 137.9L181.5 136.5L182 134.7L182.1 133L182.8 131.2L184.3 128.9L185.7 125L186.9 119.8L188.5 115L190.6 110.7L191.6 108.6L191.4 108.4L190.2 110.5L187.8 114.7L185.9 119.5L184.6 124.7L183.2 128.4L181.7 130.6L180.9 132.8L181 134.5L180.5 136L179.6 137.6L179.2 140L179.6 143L180.2 145.3L181 146.8L181.4 147.6ZM285.1 92.7L293.8 90.6L311.4 86.2L323 83.7L328.7 83L333 82.8L336 83L343.1 82.1L354.1 79.9L361.7 78.8L366 78.8L369.5 77.6L371.7 75.1L372.5 72.6L371.6 70.4L368.7 66.5L363.7 60.8L361.3 57.5L361.4 56.6L360.3 55.3L358.9 54.6L357.7 53.2L356.4 50.7L353.7 47.3L349.7 43.3L347.6 40.4L347.1 38.2L345.5 36.2L343.3 35.3L341.9 32.8L340.9 28L337.1 21.1L330.5 12.3L326.7 6.6L325.5 3.9L324.1 1.9L322.9 0.9L321.6 -1.2L320.1 -4.7L318.4 -7.2L316.9 -8.5L315.9 -10.1L315.2 -12.6L313.5 -15.2L311.3 -17.3L307.1 -24.7L300.8 -37.5L295 -47.5L290 -54.7L286.6 -61.4L284.8 -67.9L281.3 -72.9L276.2 -76.1L273.2 -80.3L271.9 -85.4L271.2 -88.1L270.8 -87.9L271.4 -85.3L272.6 -80L275.8 -75.6L280.7 -72.3L284 -67.6L285.6 -61.1L289 -54.1L294 -46.8L299.5 -36.8L305.7 -24L309.9 -16.4L312.2 -14.1L313.6 -11.9L314.3 -9.4L315.6 -7.3L317.1 -6L318.4 -3.8L319.9 -0.3L321.4 2.1L322.7 3.1L323.8 4.8L325.1 7.6L329 13.4L335.4 22.2L339.1 28.8L340.1 33.5L341.9 36.7L344.3 37.8L345.4 39.1L345.9 41.3L348.3 44.7L352.3 48.7L354.8 51.8L356.1 54.3L357.6 56.1L359.2 56.9L359.6 57.4L359.7 58.5L362.3 62L367.3 67.7L370.1 71.4L370.7 72.7L370.3 74.2L368.5 76.2L365.7 77.2L361.5 77.2L353.9 78.4L342.9 80.7L336 81.7L333 81.5L328.6 81.8L322.8 82.6L311.1 85.3L293.7 89.9L284.9 92.3ZM381 140.3L378.3 140.6L373.1 141.3L366.1 141.6L357.4 141.5L351.3 141.8L348 142.5L344.6 142.8L340.9 142.8L338.8 142.6L337.9 142L331.5 141.8L319.5 142L308.8 142.6L299.6 143.5L295.1 142.9L294.8 140.9L293.2 137.7L291 133.9L289.8 130.9L289.6 128.1L288.4 125.7L286.6 124.1L285.9 122.8L285.9 120.8L285.1 118.2L283.6 115.5L281.9 111L279.9 104.5L277 92.7L273.4 75.5L271.3 65L270.7 61.4L270.7 55.5L271.1 47.5L271 43.2L270.4 42.6L270.2 42.3L269.8 42.7L270.1 42.9L270.5 43.3L270.4 47.5L269.8 55.5L269.8 61.4L270.2 65.2L272.1 75.7L275.5 93L278.1 105L280.1 111.5L281.9 116.3L283.4 119L284.1 121.2L284.1 123.2L285.1 125.4L286.8 126.8L287.7 128.6L287.9 131.4L289.2 134.8L291.5 138.6L293 141.6L294.1 144.6L299.6 145.5L309 144.4L319.5 143.7L331.5 143.4L337.8 143.5L338.5 143.9L340.8 144.2L344.7 144.2L348.2 143.7L351.4 143L357.4 142.5L366.1 142.4L373.2 142L378.4 141.1L381 140.7ZM967.4 33.6L971 36.5L978.5 41.7L982.4 44.1L982.6 43.9L979 41L971.5 35.8L967.6 33.4ZM776.1 257.1L776.5 256.9L777.3 256.3L777.8 254.8L777.9 252.2L777.7 249.7L777.2 247.1L776.2 244.8L774.7 243.1L773.9 241.2L773.7 239.1L773.7 237.8L774.2 236.9L774 234.3L773.1 230.1L772.6 228L772.4 228L772.6 230.2L773.2 234.4L773.3 236.8L772.8 237.5L772.6 239.1L772.8 241.5L773.8 243.7L775.3 245.4L776.3 247.4L776.8 249.8L777.1 252.3L777.2 254.7L776.9 256.2L776.3 256.6L775.9 256.9ZM727.4 -20.9L729.5 -16.8L734.3 -8.8L736.9 -4.9L737.1 -5.1L735 -9.2L730.2 -17.2L727.6 -21.1ZM490.9 -80.5L491 -78.1L491.3 -73.4L491.2 -67.4L490.7 -60.1L491.4 -53.3L493.4 -47.1L494.4 -44L494.6 -44L493.9 -47.2L492.3 -53.5L491.8 -60.1L492.3 -67.4L492.2 -73.4L491.5 -78.1L491.1 -80.5ZM527.4 66.6L528.9 67.5L531.8 69.2L534.3 70L536 70L537.7 70.7L539.8 72.1L541.7 72.8L543.2 72.7L544 72.6L544 72.4L543.2 72.3L541.8 72.2L540.2 71.4L538.3 69.8L536.2 69L534.5 69L532.2 68.3L529.1 67L527.6 66.4ZM839.9 297.5L840.5 299.7L841.8 304L842.7 308.8L843.4 314.3L843.9 317L844.1 317L844.1 314.2L843.8 308.7L842.7 303.7L841 299.5L840.1 297.5ZM579.9 186.5L580.1 187.7L580.5 189.9L580.2 191.6L579.1 193.1L578.1 195.5L577.4 198.7L574.8 204L570.5 211.6L568.4 215.4L568.6 215.6L571 211.9L575.7 204.5L578.4 199.1L579.1 195.8L579.9 193.4L580.8 191.9L581 189.9L580.4 187.6L580.1 186.5ZM999.2 113L998.9 110L998.3 103.9L995.9 96.4L991.7 87.6L989.3 81.4L988.7 77.5L988.8 74.1L989.4 71.1L989.6 69L989.3 67.9L988.7 67.2L987.9 67L987.5 66.9L987.5 67.1L987.8 67.3L988.5 67.5L988.9 68.1L989.1 69L988.8 70.9L988 73.9L987.8 77.5L988.2 81.6L990.6 88.1L994.9 96.8L997.5 104.1L998.4 110L998.8 113ZM20.8 204.5L20.7 205.7L20.4 208.2L19 212.5L16.6 218.7L12.1 226.9L5.4 237.5L1.6 244.7L0.4 248.6L-0.1 250.5L0.1 250.5L0.8 248.7L2.2 245L6.3 238L13.2 227.6L17.6 219.1L19.7 212.7L20.9 208.3L21.1 205.8L21.2 204.5ZM890.4 115.6L897.3 119.6L911.3 127.1L918.4 130.6L918.6 130.4L911.7 126.4L897.7 118.9L890.6 115.4ZM962.6 155.4L961.7 154.7L960 153.4L957.4 152.6L954.2 152.3L951.8 151.6L950 150.6L947.8 149.9L945.3 149.6L943.5 149L942 148L938 146.8L931.8 145.5L927.4 144.1L924.7 142.6L922.5 141.8L921.4 141.8L917.8 140.1L911.8 136.7L906 133.8L900.5 131.7L896.2 129.5L893.2 127.3L890.5 126L888.2 125.5L886.5 124.6L885.3 123.1L884.6 122.4L884.4 122.6L885 123.4L886.2 124.9L888 126L890.3 126.5L892.8 127.9L895.8 130.2L900 132.6L905.5 134.9L911.2 137.8L917.2 141.4L920.9 143.2L922.2 143.2L924.1 143.9L926.9 145.4L931.5 146.8L937.7 148L941.5 149L943 150L945.2 150.6L947.7 150.8L949.7 151.4L951.5 152.4L954.1 153L957.3 153.2L959.8 153.8L961.5 155L962.4 155.6ZM8.8 128L9 131.9L9.3 139.7L11.1 151.1L14.7 166.1L16.5 175.5L16.3 179.5L15.8 182.2L14.8 183.6L14.4 184.4L14.6 184.6L15.2 183.9L16.2 182.3L16.9 179.5L17.3 175.5L15.8 165.9L12.4 150.9L10.2 139.6L9.5 131.9L9.2 128ZM872.7 258L872.7 255.9L872.8 251.6L873.3 248.7L874.4 247L875.7 242L877.3 233.7L878.2 224.9L878.2 215.6L878.7 209.3L879.4 205.8L879.4 200.7L878.7 194.2L878.8 185.2L879.8 173.4L879 162.5L876.7 152.8L875.4 142.7L875.3 132.2L875.2 127L874.8 127L874.7 132.2L874.6 142.8L875.6 153L877.7 162.7L878.2 173.4L877.2 185.1L877 194.3L877.8 200.8L877.8 205.7L877.1 209.2L876.8 215.6L876.8 224.8L876.2 233.6L874.8 241.8L873.6 246.8L872.7 248.5L872.2 251.6L872.3 255.9L872.3 258ZM792.9 57.6L794.2 58.7L796.9 60.8L799.8 62.4L802.8 63.5L807.6 66.3L814.4 70.9L817.9 73.1L818.1 72.9L814.8 70.4L808.2 65.4L803.2 62.5L800.2 61.6L797.3 60.2L794.5 58.3L793.1 57.4ZM948.1 263.1L949.5 260.6L952.2 255.7L954.5 249.2L956.3 241.1L957.1 237L956.9 237L955.7 240.9L953.5 248.8L951.3 255.3L949 260.4L947.9 262.9ZM782.1 303.6L782.8 302.3L784.1 299.9L785.8 298.7L788 298.6L789.6 298.1L790.6 297L792.6 290.5L795.4 278.2L796.6 272L796.4 272L794.6 278L791.4 290.2L789.6 296.7L789.1 297.2L787.8 297.7L785.5 298L783.6 299.6L782.4 302.2L781.9 303.4ZM702.3 36L702.3 37.9L702.2 41.7L704.9 48.9L710.6 59.2L713.6 65.1L713.9 66.8L715.3 68.7L717.6 70.4L718.6 72L718.7 73.7L719.2 75.7L720.3 78L720.9 79.1L721.1 78.9L720.7 77.8L719.8 75.5L719.3 73.6L719.4 71.8L718.2 69.8L716 68L714.9 66.4L714.6 64.7L711.7 58.6L705.8 48.4L702.8 41.5L702.7 37.9L702.7 36ZM152.6 -21.5L152.8 -25.8L152.5 -34.3L152.1 -38.5L151.9 -38.5L151.7 -34.2L152 -25.7L152.4 -21.5ZM836.1 266.5L837.1 263.8L839.1 258.4L840.4 250.8L841 241.3L841.1 236.5L840.9 236.5L840.3 241.2L839.3 250.7L838.2 258.1L836.6 263.7L835.9 266.5ZM782.1 291L782.4 284.5L782.6 271.5L782.3 264.2L782 262.6L780.8 260.4L778.7 257.7L777.6 256.4L777.4 256.6L778.3 258L780.2 260.8L781.2 262.9L781.4 264.3L781.4 271.5L781.6 284.5L781.9 291ZM796.4 98.6L798.8 104.7L804.3 116.7L807.4 122.6L807.6 122.4L805.2 116.3L799.7 104.3L796.6 98.4ZM163.4 232L163.3 233.1L163.2 235.3L161.5 242.1L158.5 253.6L157.4 261.5L158 265.5L158.4 267.5L158.6 267.5L158.5 265.5L158.1 261.5L159.5 253.9L162.5 242.4L163.8 235.4L163.7 233.1L163.6 232ZM723 319.2L725.2 318.8L729.5 318.2L732.9 316.4L735.2 313.6L736.5 310.9L736.4 308L732.3 304.4L724.3 300L716.3 294.9L708.1 288.9L701.1 282.9L695.3 276.7L691.3 271.8L689 268.1L685.3 264L680.2 259.5L677.5 256.9L677.3 256L677.2 255.5L676.8 255.5L676.9 256L677.2 257.1L679.8 260L684.7 264.5L688.2 268.7L690.4 272.4L694.4 277.5L700.1 283.9L707.2 290.1L715.5 296.1L723.7 301.2L731.7 305.4L735.6 308.5L735.5 310.6L734.5 313.2L732.4 315.8L729.3 317.6L725.1 318.4L723 318.8ZM533.7 -43L534.2 -51.6L534.9 -68.9L534.5 -80.5L533.6 -86.5L533.2 -89.5L532.8 -89.5L533.1 -86.5L533.7 -80.5L533.6 -68.9L533.3 -51.6L533.3 -43ZM128.6 227L128.6 224L128.3 218L128.2 213L128.5 209L128.6 207L128.4 207L128 209L127.3 213L127.2 218L127.9 224L128.4 227ZM980.6 -23.6L979.2 -26.3L976.1 -31.6L973.9 -35.6L972.7 -38.2L972.1 -39.5L971.9 -39.5L972.3 -38L973.1 -35.2L975.2 -31.1L978.6 -25.9L980.4 -23.4ZM710.1 281.9L708.4 279.2L704.8 273.8L702.4 270.1L701.2 267.7L700.6 266.4L700.4 266.6L700.8 267.8L701.6 270.4L703.9 274.4L707.8 279.6L709.9 282.1ZM137.1 275.5L137 273.3L136.6 269.1L136 266.1L135 264.6L134.1 258.9L132.8 249L132.1 244L131.9 244L132.2 249L132.9 259.1L134 264.9L135 266.4L135.9 269.2L136.5 273.4L136.9 275.5ZM171.9 234.1L172.6 235.7L174 239L174.8 244.1L175.2 251.1L177.3 262.5L181.3 278.2L183.3 286L183.7 286L182 278L178.5 262.2L176.3 250.9L175.7 243.9L174.5 238.8L172.9 235.5L172.1 233.9ZM871.6 -65.1L870.4 -68.6L867.8 -75.7L866.6 -80.8L866.6 -84.3L866 -87.4L864.7 -90L863.9 -92.7L863.6 -96L862.4 -100.5L860.2 -106.2L859.1 -109.1L858.9 -108.9L859.8 -106L861.6 -100.3L862.6 -95.8L862.8 -92.5L863.6 -89.5L864.8 -87.1L865.4 -84.2L865.4 -80.7L866.9 -75.3L869.9 -68.4L871.4 -64.9ZM364.5 34.9L361 34.5L354 34.1L349.3 34.8L347 36.2L345.9 36.9L346.1 37.1L347.2 36.6L349.5 35.5L354 35.2L361 35.2L364.5 35.1ZM782.5 238.6L783.8 238.3L786.4 237.7L788 235.9L788.4 233.2L788 230.9L786.9 229L784.6 227.6L781.3 227L779.2 225.8L778.2 223.9L777.6 222.9L777.4 223.1L777.8 224.1L778.8 226.2L781 227.8L784.2 228.6L786.1 229.8L787 231.3L787.4 233.3L787.2 235.6L786.1 237.1L783.7 237.9L782.5 238.4ZM152.1 318.8L151.1 318.1L149.2 316.6L147.7 312.2L146.6 304.7L146.5 299.4L147.6 296.2L148.4 284.7L149 264.9L149.9 251.3L151.1 243.9L151.7 237.7L151.7 232.9L152 229.5L152.7 227.2L153.2 219.5L153.6 206.5L153.7 200L153.3 200L152.9 206.5L152.3 219.5L151.5 227L150.8 229.3L150.3 232.8L150.3 237.6L149.6 243.6L148.3 251.2L147.5 264.8L147.1 284.6L146.4 296.1L145.5 299.3L145.7 304.8L147.1 312.3L148.8 316.9L150.9 318.4L151.9 319.2ZM138.6 130.5L137.7 125.9L135.2 116.9L133.6 112.5L133.4 112.5L134.3 117.1L136.8 126.1L138.4 130.5ZM896.1 102.5L896.5 97.6L896.9 87.9L896.6 81.4L896 78.1L895.6 76.5L895.4 76.5L895.5 78.2L895.9 81.4L895.8 87.9L895.7 97.6L895.9 102.5ZM118.4 -23L117.9 -16.9L117.7 -4.6L117.9 1.5L118.1 1.5L118.6 -4.6L118.8 -16.9L118.6 -23ZM642.6 250.1L643.2 249.4L644.2 247.8L644.7 246L644.5 243.9L643.7 241.9L642.5 240.2L641.9 238.4L641.6 236.3L640.6 234.4L638.8 232.9L637.4 230.4L636.2 226.6L634.6 223.8L632.8 222L631.6 219.9L630.8 217.2L629.4 214.9L627.6 213.2L626.6 211.4L626.3 209.5L626.2 208.5L625.8 208.5L625.9 209.5L626.1 211.6L627.1 213.6L628.8 215.4L630 217.5L630.7 220.3L631.9 222.7L633.6 224.5L635.1 227.1L636.3 230.9L637.9 233.6L639.7 235.1L640.6 236.7L640.9 238.6L641.7 240.6L643 242.3L643.8 244.1L644.1 246L643.8 247.7L642.8 249.1L642.4 249.9ZM170.9 -70.9L172.6 -66L176.6 -56.2L178.9 -51.4L179.1 -51.6L177.4 -56.5L173.4 -66.3L171.1 -71.1ZM136.1 40L136.6 37.4L137.3 32.2L137.3 27.1L136.5 22.3L136.1 20L135.9 20L136 22.4L136.2 27.2L136.2 32.1L135.9 37.3L135.9 40ZM471 221.3L470.5 221.3L469.6 221.3L468.5 220.7L467.4 219.4L466.8 218.4L466.8 217.6L470.1 211.5L476.4 200L480.2 192.4L481.6 188.9L482.4 185.9L482.6 183.6L482.7 182.5L482.3 182.5L482.2 183.6L481.9 185.8L480.9 188.6L479.3 192.1L475.3 199.5L469.2 211L466.2 217.4L466.2 218.6L466.9 219.8L468.2 221.1L469.4 221.7L470.5 221.7L471 221.7ZM430.6 261.1L432.9 259.6L437.5 256.5L442 252.5L446.3 247.7L448.5 244.4L448.7 242.7L448.1 241.2L446.8 240L446.1 239.4L445.9 239.6L446.5 240.3L447.7 241.5L448.1 242.8L447.8 244.1L445.5 247.1L441.2 251.7L437 255.8L432.6 259.2L430.4 260.9ZM823.4 -109.9L824.5 -109L826.7 -107.2L828.1 -105.4L828.8 -103.7L829.9 -102.1L831.4 -100.8L835.8 -95L843.3 -84.8L849.6 -77.3L854.4 -72.7L856.9 -70.4L857.1 -70.6L854.8 -73.1L850.2 -77.9L844.2 -85.5L836.7 -95.7L832.1 -101.4L830.6 -102.7L829.5 -104.1L828.7 -105.8L827.1 -107.6L824.7 -109.3L823.6 -110.1ZM410.5 40.7L412.7 40.5L416.9 40.1L424.8 40.7L436.6 42.4L450.2 43.3L465.7 43.4L475.9 43.1L480.6 42.5L483 42.2L483 41.8L480.6 42L475.9 42.4L465.8 42.4L450.3 41.9L436.7 41.1L424.9 39.8L416.9 39.4L412.6 40L410.5 40.3ZM550.9 222.4L549.9 224.1L548.1 227.5L545.7 227.9L542.3 225.8L541.5 221.7L543.3 215L544.1 211.5L543.9 211.5L542.7 214.8L540.5 221.6L541.4 226.4L545.5 228.9L548.6 228L550.3 224.4L551.1 222.6ZM387.9 211.3L385.2 212.1L379.7 213.8L375.4 214.7L372.4 214.9L369.5 216.3L367 218.8L364.4 219.1L361.1 217.3L358.8 215.2L357.2 212.4L353.6 210.7L348.5 210.4L344.5 210.6L341.7 211.4L338.8 211.7L335.9 211.8L334.6 210.5L334.4 207.3L335.4 204.6L337.8 202.1L340.1 197.7L342.1 191.7L343.5 185.2L344.4 178.4L344.8 174.5L344.8 173.4L344.2 172.3L343.2 171.4L343 170.1L343.4 168.4L343.7 167.6L343.3 167.4L343.1 168.3L342.5 170.1L342.8 171.6L343.8 172.7L344.2 173.6L344.2 174.5L343.6 178.3L342.5 185L340.9 191.3L338.9 197.3L336.7 201.4L334.1 203.9L332.9 207.2L333.2 211L335.4 213.2L338.9 213.3L342 212.9L344.7 212.1L348.5 211.9L353.4 212.1L356.3 213.4L357.7 216L360.4 218.4L364.1 220.2L367.5 219.7L370 217.2L372.6 215.8L375.6 215.5L379.8 214.4L385.3 212.6L388.1 211.7ZM862.9 -11.9L865.9 -5.4L872.4 7.3L875.9 13.6L876.1 13.4L873.1 6.9L866.6 -5.8L863.1 -12.1ZM139.4 152L139.6 157.5L140.6 168.5L141.4 174L141.6 174L141.4 168.5L140.4 157.5L139.6 152ZM370.4 84L370.3 84.5L370.3 85.6L372 88L375.4 91.6L378.4 95.5L381.2 99.7L385.2 104.1L390.3 108.5L392.9 110.6L393.1 110.4L390.7 108L385.8 103.4L382.1 99L379.3 94.8L376.1 90.9L372.5 87.5L370.7 85.4L370.7 84.5L370.6 84ZM944.6 317L945.1 313.4L945.8 306.1L945.5 301.3L944.6 299.1L944.1 298L943.9 298L944.2 299.2L944.8 301.4L944.7 306.1L944.4 313.3L944.4 317ZM999.6 85L999.3 82.6L998.5 77.7L996.7 73.8L994 71.1L992 69.8L990.6 69.8L990 69.9L990 70.1L990.6 70.2L991.8 70.2L993.5 71.7L995.8 74.4L997.5 78L998.7 82.7L999.4 85ZM822.6 158.5L823.1 154L823.8 145L823.7 138L823 133L822.6 130.5L822.4 130.5L822.5 133L822.8 138L822.7 145L822.4 154L822.4 158.5ZM661.4 205L661.7 206.7L662.3 210L664.2 214.4L667.4 219.6L669.7 225.9L671.5 233.3L672.4 237L672.6 237L672 233.2L670.8 225.6L668.4 219.1L665.1 213.9L662.9 209.8L662.1 206.6L661.6 205ZM410 85.2L411.2 85.3L413.8 85.6L417.6 85.1L422.5 83.7L433.1 85.2L449.6 89.6L459.6 92.6L463.3 94.2L469.5 98.3L478.3 104.7L483.6 108.8L485.3 110.7L486.1 113.2L486.2 116.4L487.2 119L489 120.8L489.9 121.6L490.1 121.4L489.3 120.5L487.6 118.7L486.8 116.3L486.9 113.1L486 110.3L484.2 108.2L479 103.8L470.3 97.2L464 93L460.1 91.2L449.9 88.2L433.4 84.1L422.5 82.8L417.4 84.4L413.7 85.1L411.3 84.9L410 84.8ZM765 239.8L760.3 239.6L750.8 239.1L743.9 237.8L739.6 235.6L737.9 233.6L738.3 231.4L739.6 228.4L741.9 224.6L743.4 219.3L744.2 212.8L744.7 209.5L744.3 209.5L743.8 212.7L742.6 219.2L740.9 224.2L738.6 227.8L737.2 231.1L736.6 233.9L738.9 236.6L743.6 239L750.7 240.1L760.2 240.2L765 240.2ZM770.6 296.4L767.1 292L760.1 283.4L754.6 276.3L750.7 270.6L747.8 267.4L745.9 266.7L745.1 266.4L744.9 266.6L745.8 267L747.5 267.8L750.1 271.1L753.7 276.9L759.2 284.1L766.6 292.5L770.4 296.6ZM57.6 224L56.9 219.8L54.9 211.5L53.6 207.5L53.4 207.5L54.1 211.7L56.1 220L57.4 224ZM933.9 -81.4L937.3 -76.2L944.4 -65.8L950 -56.5L954.2 -48.1L956.4 -43.9L956.6 -44.1L954.8 -48.4L951 -57L945.4 -66.5L937.9 -76.6L934.1 -81.6ZM363.1 258.9L361.3 257.4L357.6 254.6L353.2 250.5L348.1 245.2L343.1 239.7L338.3 234.1L335.6 230.2L335.1 228L333.7 225.8L331.6 223.9L330.6 222.9L330.4 223.1L331.4 224.1L333.3 226.2L334.4 228.3L334.9 230.6L337.5 234.7L342.2 240.5L347.2 246L352.5 251.2L357.1 255.2L361 257.8L362.9 259.1ZM999.6 198L999.4 195.6L998.8 190.8L998.7 185.8L999 180.3L998.9 176.8L998.6 175.4L997.1 173L994.5 169.6L993.3 167.3L993.5 166.2L993.6 165.5L993.4 165.5L993.2 166.1L992.9 167.4L994 169.9L996.4 173.5L997.6 175.8L997.8 176.9L997.8 180.2L997.6 185.8L998 190.9L998.9 195.7L999.4 198ZM679.4 270.4L678.5 271.6L676.7 274L674.8 274.6L672.5 273.7L666.6 268.3L657.2 258.9L651.7 253.1L650.4 250.9L648.6 249L646.2 247.6L645.1 246.9L644.9 247.1L646 247.9L648.2 249.5L649.8 251.3L651.1 253.6L656.3 259.6L665.9 269.2L672 274.3L674.7 275.4L677.1 274.5L678.8 271.9L679.6 270.6ZM970.2 234.5L970.2 234L970.2 233L970.7 232.1L971.7 231.1L972.4 227.9L972.8 222.7L973.5 218.2L974.6 214.5L974.9 211.7L974.3 209.9L972.9 208L970.7 205.8L969.7 202.3L969.7 197.1L969.2 192L968.1 187.3L967.9 181.7L968.6 174.9L969.8 169.5L971.7 165.2L972.7 163.1L972.3 162.9L971.3 165L969.2 169.3L967.7 174.8L966.8 181.6L966.9 187.4L967.8 192.2L968.3 197.2L968.3 202.5L969.5 206.5L971.9 208.8L973.2 210.6L973.6 211.8L973.4 214.3L972.5 218L971.9 222.6L971.8 227.8L971.3 230.9L970.3 231.9L969.8 233L969.8 234L969.8 234.5ZM587.2 -19L587.5 -29.9L587.5 -51.6L587.2 -62.5L586.8 -62.5L586.5 -51.6L586.5 -29.9L586.8 -19ZM962.7 35L962.6 34.1L962.3 32.3L960.2 29.4L956.3 25.5L952.6 22.9L949.3 21.6L946.6 20.9L944.7 20.9L942.3 19.3L939.1 15.8L935.8 13.3L932.8 12.1L929.5 9.6L925.7 5.7L921.7 2.4L917.6 -0.3L915.6 -1.6L915.4 -1.4L917.4 0.1L921.3 2.9L925.1 6.3L928.7 10.4L932.2 13.1L935.2 14.4L938.2 16.7L941.4 20.2L944.3 22.1L946.4 22.1L949 22.7L952.1 23.8L955.7 26.2L959.8 29.8L961.9 32.5L962.2 34.2L962.3 35ZM179.9 -81.5L181.3 -75.1L184.8 -62.6L186.9 -56.5L187.1 -56.5L185.7 -62.9L182.2 -75.4L180.1 -81.5ZM694.8 44.6L695.5 47.3L696.9 52.9L698.6 56.5L700.3 58L701.5 59.8L702.2 62.1L703.6 64.1L705.6 65.6L706.6 67.3L706.8 69.5L708.2 73L710.6 77.6L712.7 82.3L714.4 87.3L717.2 92.6L720.9 97.8L723.9 103.1L726.1 108.6L727.9 112.2L729.2 113.6L730.4 116.6L731.7 121.4L734.2 128L738.1 136.5L740.1 141.8L740.4 143.9L740.3 145.1L740.2 145.3L735.7 145.7L727.2 146.1L723 146.3L723 146.7L727.3 146.6L735.8 146.5L740.3 146.2L741.2 145.4L741.4 143.9L741.1 141.5L739.2 136L735.5 127.5L733.1 120.9L731.9 116.1L730.6 112.9L729.3 111.3L727.6 107.9L725.4 102.4L722.3 96.9L718.6 91.7L715.8 86.7L714.1 81.7L711.9 76.9L709.3 72.5L708 69.2L707.7 66.9L706.4 64.9L704.4 63.4L703.1 61.7L702.3 59.4L700.9 57.5L699.2 56L697.6 52.6L696 47.2L695.2 44.4ZM819.1 319.1L820 318.5L821.9 317.3L824.6 312.7L827.7 304.6L829.1 300.6L828.9 300.4L827 304.4L823.6 312.3L821.4 316.9L819.8 318.2L818.9 318.9ZM757.1 25.8L753.9 22.9L747.5 17.1L744.1 13.6L743.6 12.3L738.9 7L730 -2.4L720.1 -13.5L709.2 -26.5L698.1 -40.2L687 -54.6L678 -67.3L671.1 -78.2L667.7 -83.6L667.3 -83.4L670.6 -77.8L677.2 -66.7L686 -53.9L696.9 -39.3L707.8 -25.5L718.9 -12.5L729 -1.4L738.1 7.8L742.9 12.9L743.4 14.2L747 17.7L753.6 23.3L756.9 26.2ZM164.8 -51.9L167.4 -46.4L172.4 -35.3L177 -26.9L180.9 -21.4L184.8 -15.3L188.5 -8.5L192.9 -2.1L197.7 3.8L200.8 8.2L202 11.2L203.5 13.4L205 14.9L205.9 16.6L206.2 18.5L206.3 19.5L206.7 19.5L206.6 18.5L206.4 16.4L205.5 14.6L204 13.1L202.7 10.8L201.5 7.8L198.5 3.2L193.9 -2.9L189.7 -9.2L186 -16L182.1 -22.1L178 -27.6L173.3 -35.7L167.9 -46.6L165.2 -52.1ZM953.7 287.5L954.9 283.6L957.3 275.7L959.8 269.8L962.3 265.7L964 260L964.6 252.7L965.4 247.5L966.3 244.2L966.6 241.5L966.3 239.5L966.2 238.5L965.8 238.5L965.9 239.5L966.1 241.5L965.7 244.1L964.6 247.3L963.6 252.6L962.8 259.8L961.2 265.3L958.7 269.2L956.4 275.3L954.4 283.4L953.3 287.5ZM972.4 -70.9L972.9 -69.4L974 -66.3L977.2 -61.2L982.6 -54.3L985.4 -50.9L985.6 -51.1L983.2 -54.7L978.1 -61.8L974.7 -66.7L973.3 -69.6L972.6 -71.1ZM121.6 -92L121.6 -93.5L121.6 -96.5L121.9 -100.4L122.5 -105.4L122.9 -108.1L123.3 -108.2L123.6 -108.4L123.4 -108.6L123.2 -108.5L122.6 -108.2L121.7 -105.6L120.8 -100.6L120.7 -96.5L121.1 -93.5L121.4 -92ZM734.4 100L735.1 103.3L736.7 109.9L740 116.6L745.1 123L748 127L748.6 128.7L748.9 129.5L749.1 129.5L748.9 128.6L748.5 126.8L745.9 122.5L741 115.9L737.6 109.6L735.6 103.2L734.6 100ZM254.4 -110.2L253.8 -110L252.4 -109.3L252.1 -99.4L252.9 -80.1L252.9 -67L252.1 -60L252 -52.3L252.8 -44.1L252.9 -36.8L252.4 -30.3L252.8 -22.9L254.1 -14.8L256 -9.6L258.2 -7.7L259.5 -1.6L259.8 9.2L260.8 19.7L262.5 29.9L263.3 35L263.7 35L263 29.8L261.7 19.6L260.9 9.1L260.8 -1.7L259.6 -8.3L257.3 -10.4L255.7 -15.2L254.5 -23.1L254.1 -30.2L254.6 -36.7L254.5 -44.2L253.7 -52.4L253.7 -60L254.4 -67L254.1 -80.1L252.9 -99.4L252.9 -109.2L254 -109.5L254.6 -109.8ZM594.8 162L596 166.4L598.3 175.3L600.6 182.2L602.8 187.2L604.5 193L605.7 199.7L605.6 207.2L604.1 215.6L603.1 220.6L602.3 222.1L601.9 225.1L601.7 229.3L600.7 234.4L598.8 240.4L597.8 243.4L598.2 243.6L599.2 240.6L601.3 234.6L602.6 229.4L602.9 225.2L603.4 222.4L604.2 220.9L605.4 215.9L606.9 207.3L607.1 199.6L605.8 192.7L604 186.8L601.6 181.8L599.2 175L596.5 166.3L595.2 162ZM748.9 38.5L749.7 43.5L751.9 53.2L753.7 58.5L754.5 59.2L754.9 59.6L755.1 59.4L754.7 59L754.1 58.3L752.9 53L750.5 43.3L749.1 38.5ZM667.9 -50.5L670.3 -42.4L675.8 -26.4L678.9 -18.5L679.1 -18.5L676.7 -26.6L671.2 -42.6L668.1 -50.5ZM662.3 5L662.9 12.8L664.1 28.3L666.4 42.9L669.6 56.4L671.9 64.5L673.2 67.2L673.8 68.6L674.2 68.4L673.6 67L672.4 64.3L670.4 56.1L667.6 42.6L665.4 28.2L663.6 12.7L662.7 5ZM708.9 198.1L710 201.6L712.3 208.7L716.6 217.3L722.9 227.3L727.2 233L729.3 234.6L732 235.3L735 235.2L736.5 235.2L736.5 234.8L735 234.8L732 234.7L729.7 233.9L727.8 232.5L723.8 226.7L717.7 216.7L713.2 208.3L710.5 201.4L709.1 197.9ZM974.2 13L973.1 8.9L971.1 0.9L970.1 -4.8L970.1 -8.4L968.7 -12.9L965.9 -18.1L963.6 -24.7L961.6 -32.9L960.7 -37L960.3 -37L961.1 -32.8L962.7 -24.5L964.8 -17.6L967.5 -12.4L968.9 -8.1L968.9 -4.7L970.2 1.1L972.6 9.1L973.8 13ZM627.2 54L627.2 51.1L627.4 45.4L628.6 39.9L631 34.4L633 24.5L634.5 10.2L635.2 3L634.8 3L633.8 10.1L631.8 24.3L629.8 34.1L627.6 39.6L626.6 45.3L626.8 51.1L626.8 54ZM298.8 172L298.8 172.8L298.8 174.3L299.9 177.7L302 183.1L306.8 190.9L314.2 201.3L318.4 207.3L319.3 208.9L319.8 210.6L319.8 212.2L318.7 213.4L316.2 214.3L309.2 215.4L297.7 216.7L291.4 217.8L290 218.8L289.4 220.5L289.5 222.8L289.3 224.1L289.1 224.3L284.1 225.2L274.3 226.6L269.5 227.3L269.5 227.7L274.4 227.1L284.2 226.1L289.4 225.2L290.2 224.4L290.5 222.9L290.6 220.7L291 219.5L291.6 219L297.8 218L309.3 216.9L316.5 215.7L319.5 214.6L321.2 212.8L321.2 210.4L320.7 208.3L319.6 206.5L315.3 200.5L307.7 190.3L302.7 182.7L300.4 177.5L299.2 174.2L299.2 172.8L299.2 172ZM154.5 194.2L155.4 194.3L157.1 194.3L159.5 195L162.7 196.5L164.8 198.9L166 202.4L167.4 205L168.8 206.5L172.9 214L179.5 227.6L186.4 239.3L193.6 249.1L200.3 259.4L206.6 270.1L211.3 276.6L214.5 278.8L217.1 279.8L219.4 279.3L220.3 276.9L220 273.4L217.7 266L213.4 254.5L209.9 244.5L207.3 236.1L205.9 230.4L205.6 227.4L204.6 224.1L202.8 220.6L201.5 215.8L200.7 209.6L200.2 206.5L199.8 206.5L200.1 209.7L200.8 215.9L202 220.9L203.7 224.4L204.6 227.6L204.8 230.6L206.2 236.4L208.6 245L211.9 255L216.1 266.5L218.2 273.8L218.5 276.8L218.1 277.9L217.4 278L215.5 277.2L212.7 275.4L208.2 269.1L201.9 258.4L195.1 248.1L187.8 238.4L180.8 226.9L173.9 213.5L169.7 206L168.1 204.5L166.8 202.1L165.5 198.6L163.1 196L159.7 194.5L157.2 193.7L155.4 193.7L154.5 193.8ZM690.9 237.6L693.8 241.2L699.6 248.4L706.9 255.2L715.5 261.5L719.9 264.6L720.1 264.4L716 261L707.6 254.3L700.4 247.6L694.2 240.8L691.1 237.4ZM501 42.2L501.8 42.1L503.4 41.8L504.5 39.6L505.1 35.5L505.1 31.5L504.7 27.5L504.7 12.8L505.2 -12.8L505 -32.2L504.2 -45.4L503.9 -54.9L504.1 -60.6L503.7 -67.3L502.6 -74.8L501.8 -85.8L501.1 -100.3L500.5 -107.8L499.9 -108.4L499.7 -108.7L499.3 -108.3L499.6 -108.1L500 -107.7L500.4 -100.2L500.7 -85.7L501.4 -74.7L502.3 -67.2L502.6 -60.6L502.3 -54.9L502.5 -45.3L503.2 -32.1L503.5 -12.8L503.5 12.7L503.8 27.5L504.4 31.5L504.4 35.5L504 39.4L503.1 41.4L501.7 41.6L501 41.8ZM283.9 -26.5L282.8 -20.3L281.3 -7.8L280.9 -1.5L281.1 -1.5L282.2 -7.7L283.7 -20.2L284.1 -26.5ZM12.8 -55.5L12.9 -52.9L13 -47.6L12.7 -43.8L11.9 -41.3L11 -32L10.2 -16L9.4 -6.5L8.7 -3.2L8.1 3.1L7.7 12.3L7.1 18.7L6.2 22.2L5.7 25.9L5.8 29.6L5.8 31.5L6.2 31.5L6.2 29.6L6.3 25.9L6.8 22.3L7.9 18.8L8.8 12.4L9.4 3.2L10.1 -3L10.8 -6.3L11.6 -16L12.2 -32L12.8 -41.2L13.5 -43.7L13.7 -47.6L13.4 -52.9L13.2 -55.5ZM560.7 162.6L563.7 153L569.7 133.8L573.2 121.2L574.3 115.2L575.8 109L577.8 102.5L579.6 94.5L581.2 85.2L582.4 68.8L583.2 45.3L584 31.4L584.7 27.2L584.7 18.7L584.1 6.2L583.7 -0L583.3 0L583.4 6.3L583.8 18.8L583.6 27.1L582.8 31.3L581.8 45.2L580.6 68.7L579.3 85L577.9 94.2L576.2 102L574.2 108.5L572.7 114.8L571.8 120.8L568.5 133.5L563 152.8L560.3 162.4ZM907.6 301.4L907.2 301L906.6 300.3L906.1 298.4L905.7 295.4L905.2 289.7L904.2 281.2L903.6 277L903.4 277L903.5 281.3L904.1 289.8L904.8 295.6L905.4 298.6L906.2 300.5L907 301.2L907.4 301.6ZM281 43.7L283.2 43.1L287.4 41.9L295.1 40.7L306.1 39.4L314.3 38.8L319.8 39L327.3 38.4L336.8 36.9L341.5 36.2L341.5 35.8L336.7 36.3L327.2 37.4L319.7 37.8L314.2 37.5L305.9 38.1L294.9 39.8L287.3 41.3L283.1 42.7L281 43.3ZM592.9 93L592.9 96.6L593.2 103.9L594.3 109.6L596 113.6L596.9 115.5L597.1 115.5L596.5 113.4L595.2 109.4L594.3 103.8L593.6 96.6L593.1 93ZM926.4 101L927.1 106.6L929.1 117.6L930.4 123L930.6 123L929.9 117.4L927.9 106.4L926.6 101ZM613.4 220.5L612.7 223.7L611.5 230.1L610.4 234.3L609.3 236.3L609 238.3L609.6 239.8L609.9 240.5L610.1 240.5L609.9 239.7L609.5 238.2L610 236.7L611.3 234.7L612.5 230.4L613.3 223.8L613.6 220.5ZM67.6 87L68.1 83.1L68.8 75.4L69.2 70.6L69.8 68.6L70.1 67.5L69.9 67.5L69.4 68.4L68.5 70.4L67.7 75.3L67.4 83.1L67.4 87ZM899.5 203.9L896 202.5L888.8 200.1L883.7 199.1L880.9 199.3L879.5 199.4L879.5 199.6L880.9 199.7L883.6 199.9L888.5 201.2L895.8 203.2L899.5 204.1ZM999.6 240L999.4 236.8L998.8 230.5L997.4 226.7L995.4 225.5L992.2 222.6L987.6 217.7L984.9 213.7L984.1 210.6L983.6 209L983.4 209L983.7 210.7L984.3 214L986.9 218.3L991.3 223.4L994.6 226.5L996.6 227.3L997.9 230.7L998.9 236.9L999.4 240ZM603.9 261.1L604.1 261.4L604.6 261.8L604.8 263.8L604.7 267.2L602.1 273.7L596.9 283.4L593.7 291.3L592.5 297.3L591 302.2L589.1 305.9L586.1 310.4L581.9 315.7L579.9 318.4L580.1 318.6L582.3 316L586.7 310.9L589.9 306.4L592 302.6L593.7 297.7L595 291.7L598.1 283.9L602.9 274.1L605.3 267.3L605.2 263.7L604.9 261.7L604.4 261.1L604.1 260.9ZM260.5 44.4L257.9 44.3L252.6 44.3L248 45L244.3 46.2L242.5 46.9L242.5 47.1L244.4 46.8L248.2 46L252.7 45.4L257.9 44.9L260.5 44.6ZM479.1 304.1L485 300.2L496.6 292.1L503.6 286.5L506.1 283.7L507.5 281.6L507.7 280.3L508.5 279.2L509.9 278.2L510.8 277L511 275.7L511.1 275L510.9 275L510.7 275.6L510.4 276.8L509.6 277.8L508 278.8L507.1 280L506.8 281.2L505.4 283.1L502.9 285.7L495.9 291.1L484.5 299.6L478.9 303.9ZM530.4 30.5L530.8 32.1L531.6 35.1L532 38L532 40.9L531 44.6L529.2 49.1L528.4 51.4L528.6 51.6L529.8 49.4L532 44.9L533 41.1L533 38L532.4 34.9L531.2 31.9L530.6 30.5ZM702 296.4L701.2 296.2L699.4 295.9L698.3 295.3L697.6 294.2L695.1 292.5L690.9 290.2L687 287.3L683.2 283.9L680.2 280.9L677.8 278.2L676.7 276.5L676.7 275.9L676.6 275.5L676.4 275.5L676.3 275.9L676.3 276.7L677.4 278.5L679.6 281.4L682.5 284.6L686.3 288.2L690.3 291.1L694.7 293.3L697.2 294.8L697.9 295.7L699.3 296.4L701.1 296.6L702 296.6ZM278.5 58.2L281.4 57.6L287.2 56.5L292.2 56.2L296.7 56.8L302.7 56.7L309.9 56L313.9 56.1L314.7 56.8L316.7 57.2L319.3 57.2L323.6 56.5L329.6 55.3L336.2 54.8L343.7 55.2L348.9 55.1L351.7 54.5L353.7 53.7L355 52.6L355.6 52.1L355.4 51.9L354.8 52.4L353.5 53.3L351.6 54L348.9 54.4L343.8 54.3L336.3 53.7L329.4 54L323.4 55.2L319.2 55.8L316.8 55.8L315.3 55.5L314.1 54.7L309.8 54.7L302.6 55.5L296.8 55.7L292.3 55.3L287.1 55.8L281.3 57.1L278.5 57.8ZM794.9 121.5L795.6 127.9L797.6 140.7L798.9 147L799.1 147L798.4 140.6L796.4 127.8L795.1 121.5ZM445 174.6L446.4 174.6L449.1 174.5L453.7 176.1L460.4 179.4L464.7 181.1L466.6 181.3L467.9 181.3L468.8 181.3L469.7 180.4L470.7 178.9L471.1 178.1L470.9 177.9L470.3 178.6L469.3 180.1L468.5 180.7L467.9 180.7L466.7 180.5L465 180.2L460.9 178.4L454.1 175.2L449.2 173.8L446.4 174.2L445 174.4ZM67.6 318.9L67 318.4L65.9 317.4L65.3 312.7L64.6 304.2L64.1 300L63.9 300L63.9 304.3L64.2 312.8L65.4 317.6L66.8 318.6L67.4 319.1ZM949.1 53.5L948.9 51L948.3 45.9L946.5 39.3L943.5 31.3L942.1 25.8L942.5 22.7L942.6 21L942.4 21L942 22.6L941.4 25.9L942.5 31.7L945.5 39.7L947.5 46.1L948.4 51L948.9 53.5ZM526.4 112.9L525.3 115L523.1 119.2L521.9 123.9L522 129L522.8 132.7L524.2 135L524.9 136.1L525.1 135.9L524.6 134.8L523.5 132.5L523 129L523.1 124.1L523.9 119.5L525.7 115.2L526.6 113.1ZM999.1 48.9L998.9 48.3L998.4 47L996.8 45.4L994.1 43.6L987 37.3L975.1 26.9L969.1 21.9L968.9 22.1L974.6 27.6L986.2 38.2L993.6 44.2L996.4 45.9L998.1 47.3L998.6 48.4L998.9 49.1ZM658.1 142.5L658.5 140.8L659.2 137.4L660.6 133.3L662.7 128.5L663.6 126.1L663.4 125.9L662.1 128.2L659.6 132.9L658.3 137.1L658 140.7L657.9 142.5ZM202.6 142.7L204.4 141.7L207.9 139.8L211.5 138.9L215.5 138.9L225.5 137.4L241.3 134.3L252.4 132.4L258.9 131.7L264 130.4L267.7 128.6L269.7 126.5L269.5 124.1L268.6 122.3L267.4 121.1L265.1 117L261.6 109.7L258.6 104.6L256.4 101.9L253.5 96.7L250 89L245.8 81.6L241 74.6L238.1 69.6L237.1 66.4L235.1 63.8L232.7 62.4L231.3 59.7L230.7 55.5L229.8 52.7L228.3 51.2L225.5 51L221.5 51.8L218.3 51.5L215.9 50L214.6 49.3L214.4 49.7L215.6 50.5L218.2 52L221.5 52.5L225.5 51.8L228 52L229 53.1L229.8 55.7L230.2 60L231.8 63.1L234.4 64.7L235.9 66.9L236.9 70.2L239.8 75.4L244.5 82.4L248.5 89.8L252 97.5L254.9 102.9L257.1 105.6L259.9 110.6L263.4 117.8L265.9 122.1L267.1 123.4L267.8 124.6L268 125.8L266.8 127.1L263.5 128.8L258.6 130L252.1 130.8L241 132.9L225.3 136.4L215.5 138.1L211.5 138.1L207.6 139.2L204.1 141.3L202.4 142.3ZM668.1 146.1L670.6 143.9L675.4 139.6L679.5 136.7L683.3 135L684 128.1L681.5 116.3L680.1 110.5L679.9 110.5L680.8 116.4L682.8 128.2L682.2 134.5L679 135.8L674.8 138.9L670.2 143.6L667.9 145.9ZM250.5 318.8L249.2 318.8L246.8 318.7L244.5 318.1L242.4 316.9L238.2 311.3L231.8 301.5L227.8 294.7L226.2 290.7L224.1 288.3L221.8 287.8L220.7 287.3L220.5 286.9L220.8 285.4L221.8 282.8L221.6 280.8L220.3 279.5L219.6 278.9L219.4 279.1L220 279.8L221.2 281L221.2 282.7L220.2 285.1L219.7 286.9L220.1 287.9L221.5 288.7L223.6 289.2L225.3 291.3L226.7 295.3L230.7 302.2L237.3 311.9L241.8 317.4L244.3 318.7L246.7 319.3L249.2 319.2L250.5 319.2ZM677.3 -10.5L677.2 -9.3L676.9 -6.7L677.6 -2.4L679.5 3.7L681.6 8.9L683.8 13.1L685.8 18.2L687.6 24.2L690.1 29.8L693.3 35L694.9 37.6L695.1 37.4L693.7 34.8L690.9 29.4L688.6 23.8L687 17.8L684.9 12.6L682.7 8.4L680.5 3.3L678.4 -2.6L677.4 -6.8L677.6 -9.2L677.7 -10.5ZM998.1 220L998 219.3L997.8 218L996.6 216.3L994.5 214.3L992.7 210.7L991.3 205.4L989.6 202L987.8 200.8L986.4 198.7L985.4 195.5L983.8 193.1L982 191.6L981.1 190.9L980.9 191.1L981.7 191.9L983.4 193.4L984.6 195.8L985.6 199.1L987 201.5L988.7 202.7L990.2 205.8L991.8 211.1L993.8 214.7L996.2 216.7L997.4 218.2L997.7 219.4L997.9 220ZM327.7 31L327.8 30.5L328.1 29.4L327.1 27.6L324.9 25.1L323.5 22.5L322.8 19.7L321.5 17.3L319.8 15.5L318.6 13.6L317.9 11.4L316.6 9.2L314.9 7.5L313.5 5.2L312.2 2.2L310.8 -0.1L309.2 -1.3L308.1 -3L307.1 -5.5L305.7 -7.6L304.2 -9.1L301.4 -14.2L297.3 -23.1L295.2 -27.6L294.8 -27.4L296.7 -22.9L300.6 -13.8L303.3 -8.4L304.8 -6.9L305.9 -5L306.9 -2.5L308.3 -0.4L309.7 0.8L311 2.8L312.3 5.8L313.9 8.3L315.6 10L316.8 11.9L317.6 14.1L319 16.2L320.7 17.9L322 20L322.8 22.8L324.4 25.4L326.7 27.9L327.7 29.6L327.5 30.5L327.3 31ZM662.4 -32L662.6 -30.6L663.2 -27.7L665.2 -23.7L668.6 -18.8L670.4 -16.4L670.6 -16.6L669.2 -19.2L666.1 -24.3L664 -28L663.1 -30.7L662.6 -32ZM555.7 124.5L555 113.1L553.5 90.3L551.9 76.7L550.1 72.4L549.2 66.4L549 58.4L546.6 43.6L541.9 22.1L539.1 4.9L538.2 -8L537.7 -14.5L537.3 -14.5L537.6 -8L538.1 5.1L540.6 22.4L544.9 43.9L547.3 58.6L547.5 66.6L548.6 72.8L550.4 77L552.2 90.4L554.3 113.2L555.3 124.5ZM268.6 -38.5L269.6 -44L271.3 -54.9L271.9 -62.6L271.6 -66.9L272 -70.9L273.1 -74.9L273.6 -77L273.4 -77L272.7 -75.1L271.3 -71.1L270.6 -66.9L270.8 -62.6L270.2 -55.1L268.9 -44L268.4 -38.5ZM265.6 -21L266.1 -23.7L266.8 -29.2L267.4 -33.4L268.2 -36.4L268.6 -38L268.4 -38L267.8 -36.6L266.6 -33.6L265.7 -29.3L265.4 -23.8L265.4 -21ZM553.2 177.5L553.4 172.3L553.9 161.8L554.6 155.1L555.6 152.2L556.4 148.1L556.8 143L556.7 136.6L556 128.9L555.7 125L555.3 125L555.5 128.9L555.8 136.6L555.7 143L555.1 147.9L554.4 151.8L553.4 154.9L552.8 161.7L552.8 172.2L552.8 177.5ZM528.1 250.1L529 249.4L530.9 247.9L532.1 245.5L532.7 242.2L533.8 239.6L535.3 237.4L537 233.4L538.8 227.8L539.6 225L539.4 225L538.2 227.7L536 233.1L534.2 236.9L532.7 239.1L531.8 242L531.4 245.3L530.4 247.6L528.7 249.1L527.9 249.9ZM407.1 109.4L400.7 102.2L387.6 88.1L379.2 79.7L375.8 76.8L373.6 75.2L372.5 75L372 74.8L372 75.2L372.5 75.3L373.4 75.5L375.4 77.2L378.6 80.3L386.7 88.9L400.1 102.8L406.9 109.6ZM785.1 317L784.9 316.1L784.5 314.2L782.6 313.5L779.7 314.1L778 315.3L778 317L778.4 318.2L779.4 319L780.6 319.5L782.3 319.7L783.6 319.2L784.6 318.1L785.1 317.6L784.9 317.4L784.4 317.9L783.4 318.8L782.2 319L780.9 318.7L779.9 318.2L779.3 317.6L779 316.8L779 315.9L780.1 315.1L782.6 314.3L784 314.6L784.6 316.2L784.9 317ZM490.1 165.5L491.1 163.1L493.1 158.1L493.6 153.3L492.5 149.1L492.5 145.7L493.6 143L494.1 141.6L493.9 141.4L493.2 142.8L491.8 145.5L491.5 149.2L492.4 153.4L492.1 157.9L490.6 162.9L489.9 165.5ZM428.6 130.4L424.5 126.7L416.1 119.6L410.8 114.6L408.7 111.5L407.6 109.9L407.4 110.1L408.3 111.7L410.2 115.1L415.4 120.4L424 127.3L428.4 130.6ZM690.1 151.5L689.2 147L686.7 138.3L685.1 134L684.9 134L685.8 138.5L688.3 147.2L689.9 151.5ZM545.6 206.5L547.4 201.6L550.6 191.6L551.9 184.9L551.8 181.6L552.1 179.6L552.8 178.6L553.1 178.1L552.9 177.9L552.5 178.4L551.7 179.4L551.2 181.6L551.1 184.8L549.4 191.4L546.6 201.4L545.4 206.5ZM448.1 148.4L444.5 144.6L437 137.3L433.1 133.9L432.9 134.1L436.5 137.9L444 145.2L447.9 148.6Z","edge":"M646.7 254.7L646.9 254.9L647.1 255.2L647.5 255.7L648 256.4L648.6 257.2L649.3 258.2L650.2 259.3L651.2 260.7L652.3 262L653.5 263.4L654.8 264.7L656.2 266.1L657.7 267.5L659.3 268.8L661 270.2L662.9 271.5L664.5 272.7L666 273.6L667.4 274.3L668.6 274.8L669.7 275L670.8 275L671.9 274.5L672.6 273.5L672.8 272.4L672.6 271.3L672.1 270.2L671.4 269.1L670.5 267.8L669.4 266.5L668 265L666.4 263.3L665 261.9L663.8 260.8L662.8 259.8L662 259L661.4 258.4L661 258L660.8 257.8L660.2 258.2L660.4 258.5L660.8 258.9L661.3 259.6L662 260.5L662.8 261.6L663.9 262.9L665.1 264.5L666.5 266.2L667.7 267.8L668.6 269.2L669.4 270.4L669.9 271.3L670.1 272.1L670.2 272.5L670.2 272.6L670.3 272.4L670.4 272.4L670.1 272.3L669.5 272.2L668.6 271.8L667.4 271.2L666 270.3L664.5 269.3L662.7 268L660.9 266.8L659.3 265.5L657.7 264.3L656.3 263.1L654.9 261.9L653.6 260.8L652.4 259.6L651.3 258.4L650.3 257.4L649.4 256.5L648.7 255.7L648.1 255.2L647.7 254.7L647.4 254.4L647.3 254.3ZM189.2 248.7L189.3 248.9L189.6 249.3L189.9 250L190.4 250.8L191 251.9L191.7 253.2L192.6 254.7L193.5 256.4L195 258.7L196.9 261.7L199.3 265.2L202.2 269.3L205.6 274L209.4 279.4L213.8 285.3L218.7 291.8L223 297.4L226.8 302.1L230 306L232.7 309.1L234.8 311.3L236.4 312.7L238.1 313.3L239.7 312L239.9 310.9L239.8 309.7L239.4 308.3L238.9 306.8L238.1 305.1L237.2 303.1L236 300.9L234.7 298.5L233.4 295.9L232 293.1L230.6 290L229.2 286.8L227.8 283.3L226.4 279.7L224.9 275.8L223.5 271.7L222.2 268.1L221.1 265.1L220.2 262.5L219.4 260.5L218.9 258.9L218.5 257.9L218.3 257.4L217.7 257.6L217.8 258.1L218.1 259.2L218.6 260.7L219.3 262.8L220.1 265.4L221 268.5L222.1 272.2L223.4 276.3L224.7 280.3L226 284L227.3 287.6L228.6 290.9L229.9 294L231.2 296.9L232.5 299.6L233.8 302.1L234.9 304.2L235.7 306.1L236.4 307.8L236.8 309.1L237.1 310.2L237.2 310.8L237.1 311.1L238.1 310.6L238 310.4L236.7 309.3L234.7 307.2L232.1 304.2L228.9 300.4L225.2 295.7L220.8 290.2L215.8 283.8L211.2 278L207.2 272.8L203.6 268.2L200.6 264.3L198 260.8L196 258L194.5 255.8L193.4 254.1L192.5 252.7L191.8 251.4L191.1 250.4L190.6 249.6L190.2 248.9L189.9 248.5L189.8 248.3ZM588.7 225.5L588.6 226.3L588.4 228.1L588.1 230.7L587.8 234.1L587.3 238.5L586.8 243.6L586.2 249.7L585.5 256.6L585.1 262.7L584.8 267.9L584.6 272.2L584.6 275.7L584.7 278.3L585 280.2L585.9 281.7L588.1 281.5L589.1 280.4L590 278.8L591.1 276.6L592.3 273.7L593.6 270.2L595.2 266L596.8 261.1L598.6 255.6L600.2 250.7L601.5 246.5L602.6 243.1L603.5 240.3L604.2 238.2L604.6 236.8L604.8 236.1L604.2 235.9L603.9 236.6L603.4 237.9L602.6 240L601.5 242.7L600.2 246.1L598.6 250.2L596.8 254.9L594.7 260.4L592.9 265.2L591.3 269.3L589.8 272.7L588.6 275.5L587.6 277.5L586.8 278.9L586.4 279.3L587.6 279.4L587.7 279.5L587.5 278L587.4 275.6L587.4 272.3L587.5 268L587.7 262.8L588 256.8L588.3 249.9L588.6 243.8L588.8 238.6L589 234.2L589.1 230.7L589.2 228.1L589.3 226.4L589.3 225.5ZM550.2 173.4L550.1 173.8L549.9 174.6L549.6 175.8L549.2 177.3L548.8 179.3L548.2 181.6L547.6 184.3L546.8 187.4L546.1 190.3L545.4 192.9L544.7 195.3L544 197.4L543.3 199.3L542.7 200.9L542 202.3L541.4 203.4L540.7 204.9L540 206.5L539.3 208.4L538.6 210.5L537.8 212.8L537.1 215.3L536.3 218L535.5 220.9L534.6 224L533.5 227.2L532.2 230.6L530.8 234.1L529.2 237.8L527.4 241.7L525.5 245.8L523.5 250L521.7 253.8L520.3 257L519.1 259.8L518.3 262L517.8 263.9L517.7 265.3L518.2 266.9L519.6 267.4L520.5 267.4L521.4 267.3L522.3 267L523.3 266.6L524.3 266L525.4 265.3L526.6 264.6L528 263.6L529.7 262.1L531.7 260L534 257.3L536.7 254.1L539.7 250.3L543.1 245.9L546.8 240.9L550.8 235.3L554.4 230.3L557.5 225.7L560.2 221.7L562.3 218.2L564 215.1L565.3 212.6L566 210.6L566.3 209.1L566.6 207.9L566.8 206.8L567 205.9L567.1 205.2L567.2 204.6L567.3 204.3L567.3 204.1L566.7 203.9L566.6 204.1L566.5 204.5L566.4 205L566.2 205.7L566 206.6L565.8 207.7L565.5 208.9L565.1 210.3L564.3 212.2L563 214.6L561.3 217.5L559 220.9L556.2 224.8L553 229.3L549.3 234.2L545.1 239.6L541.3 244.5L537.8 248.8L534.8 252.5L532.1 255.6L529.7 258.2L527.8 260.2L526.3 261.5L525.1 262.3L524 263L523 263.6L522.1 264.1L521.3 264.4L520.7 264.6L520.2 264.7L519.9 264.7L520.3 265L520.5 265.3L520.6 264.4L521 262.9L521.8 260.8L522.8 258.1L524.2 254.9L526 251.2L528 247L529.9 242.8L531.6 238.9L533.2 235.1L534.6 231.5L535.8 228L536.9 224.7L537.7 221.5L538.5 218.6L539.2 215.9L539.8 213.4L540.5 211.1L541.1 209L541.8 207.2L542.4 205.6L543 204.2L543.6 203L544.2 201.6L544.9 199.8L545.5 197.9L546.1 195.7L546.7 193.3L547.4 190.6L548 187.7L548.6 184.6L549.2 181.8L549.7 179.5L550.1 177.5L550.4 175.9L550.6 174.8L550.8 174L550.8 173.6ZM451.8 165.3L452 165.4L452.4 165.7L453 166.1L453.8 166.6L454.8 167.3L455.9 168L457.3 168.9L458.9 170L460.3 170.9L461.7 171.6L462.9 172.3L464 172.7L465 173.1L466 173.3L466.9 173.3L467.8 173.1L468.6 172.4L469 171.4L469 170.4L468.8 169.5L468.4 168.4L467.8 167.3L467.1 166L466.3 164.6L465.6 163.4L465.1 162.3L464.8 161.2L464.6 160.2L464.6 159.3L464.7 158.5L464.9 157.7L465.4 156.7L465.7 155.5L465.6 154.3L465.2 153.1L464.4 152.1L463.4 151.2L462.2 150.4L460.7 149.6L459 148.9L457.5 148.4L456.3 147.9L455.2 147.5L454.4 147.2L453.8 146.9L453.4 146.8L453.1 146.7L452.9 147.3L453.1 147.4L453.4 147.6L454 148L454.8 148.4L455.8 148.9L457 149.6L458.4 150.3L459.9 151.1L461.2 151.9L462.1 152.7L462.8 153.5L463.2 154.1L463.3 154.7L463.3 155.2L463.1 155.8L462.6 156.7L462.2 157.9L461.9 159.2L461.9 160.5L462.1 161.8L462.5 163.2L463.1 164.6L463.9 166L464.7 167.4L465.4 168.6L465.9 169.5L466.3 170.3L466.4 170.8L466.4 171L466.5 170.9L466.7 170.8L466.6 170.8L466.2 170.8L465.6 170.7L464.8 170.5L463.8 170.2L462.6 169.7L461.2 169.2L459.7 168.4L458.1 167.6L456.6 166.9L455.3 166.3L454.3 165.7L453.4 165.3L452.8 165L452.4 164.8L452.2 164.7ZM157.3 317.5L157.3 317L157.2 316.1L157.1 314.7L156.9 312.9L156.7 310.6L156.4 307.9L156.1 304.7L155.7 301.1L155.5 297.1L155.4 292.6L155.4 287.7L155.5 282.4L155.8 276.7L156.1 270.5L156.5 263.9L157 256.8L157.4 250.6L157.7 245.3L157.9 240.9L158.1 237.3L158.2 234.7L158.3 232.9L158.3 232L157.7 232L157.5 232.8L157.3 234.6L157 237.2L156.5 240.8L156 245.2L155.4 250.4L154.6 256.6L153.9 263.7L153.3 270.3L153 276.6L152.8 282.4L152.8 287.7L153 292.7L153.3 297.2L153.8 301.3L154.4 304.9L155 308.1L155.5 310.8L155.9 313L156.2 314.8L156.4 316.2L156.6 317.1L156.7 317.5ZM278.8 35L278.9 34.7L279 34L279.1 33L279.3 31.6L279.5 29.9L279.8 27.8L280.1 25.4L280.4 22.7L280.7 19.9L281 17.2L281.2 14.5L281.3 11.8L281.4 9.1L281.4 6.4L281.4 3.8L281.3 1.1L281.2 -1.5L281 -4L280.7 -6.5L280.5 -8.9L280.1 -11.3L279.7 -13.6L279.3 -15.9L278.8 -18.1L278.5 -20.5L278.2 -23.1L278 -26.1L278 -29.3L278 -32.9L278.2 -36.7L278.4 -40.7L278.7 -45L279.2 -48.3L279.9 -50.4L280.5 -51.2L280.6 -51.2L281.3 -50.9L282.6 -49.4L284.3 -46.9L286.3 -43.2L288.3 -39.6L290.4 -36.2L292.4 -32.9L294.5 -29.7L296.6 -26.7L298.7 -23.8L300.9 -21L303 -18.4L305.3 -15.5L307.6 -12.4L310.1 -9L312.8 -5.4L315.5 -1.5L318.4 2.6L321.3 7L324.5 11.6L327.1 15.8L329.4 19.4L331.2 22.5L332.6 25.2L333.6 27.3L334.1 28.9L334.2 29.8L334 30.2L333.6 30.8L332.9 31.4L331.9 32L330.7 32.6L329.2 33.1L327.5 33.7L325.5 34.3L323.3 34.8L321.3 35.3L319.6 35.7L318.2 36L317.1 36.3L316.3 36.5L315.7 36.6L315.4 36.7L315.6 37.3L315.9 37.3L316.4 37.2L317.3 37L318.4 36.8L319.8 36.5L321.5 36.1L323.5 35.7L325.7 35.2L327.8 34.8L329.6 34.2L331.2 33.7L332.5 33.1L333.6 32.4L334.5 31.7L335.2 31L335.6 30L335.5 28.6L334.9 26.8L334 24.5L332.6 21.8L330.9 18.5L328.7 14.8L326.1 10.6L323.1 5.8L320.2 1.4L317.4 -2.8L314.7 -6.8L312.1 -10.5L309.7 -13.9L307.3 -17.1L305.1 -20L303 -22.6L300.9 -25.4L298.9 -28.3L296.8 -31.3L294.8 -34.4L292.7 -37.7L290.7 -41.1L288.7 -44.6L286.7 -48.3L284.8 -51.1L283 -53L280.9 -54L278.8 -53.3L277.4 -51.5L276.6 -48.8L276.1 -45.3L275.8 -40.9L275.6 -36.8L275.5 -32.9L275.6 -29.3L275.7 -26L275.9 -22.9L276.2 -20.2L276.7 -17.6L277.2 -15.4L277.7 -13.2L278.1 -11L278.5 -8.6L278.8 -6.2L279.1 -3.8L279.4 -1.3L279.6 1.2L279.7 3.8L279.8 6.5L279.9 9.1L279.9 11.8L279.8 14.4L279.7 17.1L279.6 19.8L279.4 22.6L279.1 25.3L278.9 27.7L278.7 29.8L278.5 31.5L278.4 32.9L278.3 33.9L278.2 34.6L278.2 35ZM392.7 62.7L392.8 62.7L392.9 62.6L393 62.5L393.1 62.4L393.3 62.2L393.6 61.9L393.8 61.7L394.1 61.4L394.5 61.2L395.1 60.9L395.9 60.8L396.8 60.6L398 60.5L399.2 60.4L400.7 60.4L402.3 60.4L404.7 60.5L407.9 60.7L411.9 60.9L416.7 61.2L422.2 61.6L428.6 62.1L435.7 62.6L443.7 63.2L450.9 63.9L457.5 64.5L463.3 65.1L468.5 65.7L473 66.2L476.8 66.8L479.8 67.4L482.2 68L484.4 68.5L486.3 69L488 69.5L489.4 70L490.5 70.4L491.4 70.8L492 71.2L492.2 71.4L492.5 71.8L492.8 72.4L493 73.3L493.3 74.5L493.5 75.9L493.7 77.5L493.9 79.3L494 81.3L494 83.5L493.9 85.9L493.8 88.4L493.5 91.1L493.1 94L492.7 97.1L492.2 100.3L491.5 103.8L491 107L490.5 110.1L490.2 113L489.9 115.7L489.7 118.2L489.7 120.5L489.7 122.6L489.8 124.5L489.8 126.7L489.6 129.3L489.2 132.3L488.7 135.7L488 139.6L487.2 143.8L486.3 148.4L485.1 153.5L484 158L482.9 161.9L481.9 165.3L480.8 168.2L479.8 170.5L478.8 172.3L478 173.4L477.1 174.1L476.1 175.1L475.3 176.1L474.7 177.3L474.3 178.4L474.1 179.7L474.1 180.9L474.2 182.2L474.5 183.3L474.6 184.4L474.6 185.8L474.3 187.5L473.9 189.4L473.3 191.6L472.5 193.9L471.5 196.5L470.4 199.4L469.3 202L468.5 204.3L467.8 206.2L467.2 207.9L466.8 209.3L466.6 210.4L466.5 211.4L466.8 212.3L467.1 212.8L467.6 213.3L468.2 213.7L468.9 213.9L469.5 213.9L470.2 213.8L470.8 213.7L471.7 213.4L472.6 212.7L473.5 211.8L474.4 210.6L475.5 209.1L476.6 207.4L477.7 205.3L479 203L480.4 200.3L481.7 198L482.9 195.9L484 194L485.1 192.5L486.1 191.1L487 190.1L487.7 189.3L488.5 188.7L489.3 187.9L490 187.1L490.6 186.2L491.1 185.2L491.5 184.2L491.7 183.2L491.8 182.1L491.8 181.1L491.9 180L492.2 178.8L492.6 177.4L493.1 175.8L493.7 174L494.5 172.1L495.4 169.9L496.4 167.6L497.4 165.3L498.4 163L499.3 160.7L500.1 158.5L500.8 156.3L501.5 154.1L502.1 151.9L502.7 149.8L503.3 147.8L503.9 146.1L504.6 144.4L505.3 143L506 141.7L506.8 140.5L507.6 139.5L508.6 138.6L509.4 137.5L510.2 136.5L510.8 135.4L511.3 134.3L511.6 133.1L511.8 132L511.9 130.8L511.8 129.7L511.8 128.6L512 127.4L512.2 126.1L512.5 124.6L512.9 123.1L513.5 121.4L514.1 119.6L514.8 117.6L515.6 115.4L516.4 112.8L517.3 110L518.1 106.8L519 103.4L519.9 99.6L520.9 95.6L521.9 91.3L522.8 87.5L523.7 84.2L524.6 81.5L525.4 79.2L526.2 77.5L527 76.4L527.5 75.8L528.1 75.6L528.8 75.4L529.6 75.3L530.5 75.3L531.5 75.3L532.6 75.4L533.7 75.6L534.9 75.8L536.2 76.1L537.4 76.4L538.5 76.7L539.5 77.1L540.4 77.4L541.1 77.8L541.8 78.2L542.3 78.5L542.7 78.9L543.2 79.7L543.7 81.2L544.3 83.2L545 85.8L545.7 89L546.4 92.7L547.1 96.9L547.9 101.7L548.6 106L549.3 109.6L549.9 112.7L550.4 115.1L550.8 117L551.2 118.3L551.6 119.1L552 119.4L552.2 119.5L552.4 119.6L552.5 119.7L552.7 119.7L552.7 119.8L552.8 119.8L552.8 119.8L553.2 119.2L553.1 119.2L553.1 119.1L553 119.1L552.8 119L552.7 118.9L552.5 118.9L552.3 118.7L552.2 118.7L551.9 118.1L551.6 116.8L551.1 115L550.6 112.5L550.1 109.4L549.5 105.8L548.9 101.6L548.1 96.8L547.4 92.5L546.8 88.7L546.1 85.6L545.5 82.9L544.9 80.8L544.4 79.2L543.8 78.1L543.2 77.5L542.5 77.1L541.8 76.6L540.9 76.2L540 75.8L538.9 75.4L537.8 75.1L536.6 74.7L535.2 74.4L534 74.1L532.8 74L531.6 73.8L530.5 73.8L529.5 73.8L528.6 74L527.7 74.1L526.7 74.5L525.7 75.4L524.8 76.8L524 78.6L523 80.9L522.1 83.8L521.1 87.1L520.1 90.9L519.1 95.2L518.1 99.2L517.2 102.9L516.3 106.3L515.4 109.4L514.5 112.2L513.7 114.7L512.9 116.9L512.1 118.9L511.5 120.7L510.9 122.5L510.4 124.1L510.1 125.7L509.8 127.1L509.7 128.5L509.6 129.7L509.7 130.8L509.6 131.7L509.4 132.6L509.2 133.5L508.8 134.4L508.3 135.2L507.6 136.1L506.9 137L505.9 137.9L505 139.1L504.1 140.4L503.2 141.9L502.4 143.5L501.7 145.2L501 147.1L500.4 149.1L499.8 151.2L499.2 153.4L498.5 155.5L497.7 157.7L496.9 159.9L496.1 162.1L495.1 164.3L494.1 166.6L493 168.9L492.1 171.1L491.3 173.1L490.6 174.9L490 176.6L489.6 178.2L489.3 179.6L489.2 180.9L489.2 181.9L489.1 182.7L488.9 183.5L488.7 184.2L488.3 184.9L487.9 185.5L487.4 186.1L486.8 186.7L486 187.3L485 188.3L484 189.5L482.9 190.9L481.8 192.6L480.6 194.5L479.3 196.6L478 199L476.6 201.7L475.3 204L474.2 205.9L473.1 207.6L472.2 208.9L471.4 210L470.8 210.6L470.4 210.9L470.1 211L469.7 211.1L469.5 211.1L469.3 211.1L469.3 211.1L469.3 211.1L469.3 211.1L469.3 211.1L469.3 211.2L469.4 210.8L469.5 210L469.9 208.7L470.4 207.1L471.1 205.2L471.9 203L473 200.5L474.1 197.6L475.2 194.9L476 192.4L476.6 190.1L477.1 188L477.4 186.1L477.4 184.4L477.3 182.8L477 181.7L476.8 180.8L476.8 179.9L477 179.2L477.3 178.4L477.7 177.7L478.2 176.9L478.9 176.2L480 175.3L481.2 173.7L482.3 171.7L483.4 169.2L484.5 166.2L485.5 162.7L486.6 158.7L487.8 154.1L488.9 149L489.8 144.3L490.6 140L491.3 136.1L491.8 132.6L492.1 129.5L492.3 126.8L492.3 124.4L492.2 122.5L492.2 120.5L492.2 118.3L492.4 115.9L492.6 113.2L492.9 110.4L493.3 107.4L493.9 104.2L494.5 100.7L495 97.4L495.4 94.3L495.7 91.4L496 88.6L496.1 86L496.2 83.5L496.1 81.2L496 79.1L495.8 77.3L495.6 75.6L495.4 74.1L495 72.8L494.7 71.7L494.3 70.8L493.7 70L493.1 69.5L492.3 69L491.3 68.6L490 68.1L488.6 67.6L486.9 67.1L484.9 66.6L482.7 66.1L480.2 65.5L477.1 65L473.2 64.4L468.7 63.9L463.5 63.4L457.6 62.9L451 62.3L443.8 61.8L435.8 61.3L428.7 60.9L422.3 60.5L416.7 60.2L411.9 59.9L408 59.7L404.7 59.6L402.3 59.6L400.7 59.6L399.2 59.6L397.9 59.7L396.7 59.9L395.8 60L394.9 60.2L394.2 60.5L393.7 60.8L393.3 61.2L393.1 61.4L392.8 61.7L392.6 61.9L392.5 62L392.4 62.1L392.3 62.2L392.3 62.3ZM677.8 38.5L677.9 38.3L678 37.9L678.2 37.2L678.4 36.3L678.7 35.2L679 33.9L679.4 32.3L679.8 30.5L680.2 29.1L680.5 27.9L680.8 27L681.1 26.5L681.2 26.3L681 26.4L680.8 26.4L680.9 26.5L681.3 26.8L681.7 27.3L682.2 27.8L682.8 28.5L683.3 29.3L683.9 30.3L684.5 31.3L685.2 32.5L685.8 33.5L686.4 34.4L686.8 35.2L687.1 35.8L687.4 36.2L687.6 36.5L687.7 36.6L688.3 36.4L688.3 36.2L688.2 35.9L688 35.4L687.8 34.7L687.5 33.9L687.2 32.9L686.8 31.8L686.4 30.4L685.9 29.2L685.4 28.1L684.9 27.1L684.4 26.3L683.8 25.5L683.2 24.8L682.6 24.3L681.7 23.8L680.5 23.7L679.4 24.2L678.8 25L678.3 26L677.9 27.1L677.6 28.5L677.5 30.2L677.3 32L677.3 33.6L677.2 35L677.2 36.2L677.2 37.1L677.2 37.8L677.2 38.2L677.2 38.5ZM678.2 262.2L678.6 262.7L679.3 263.6L680.3 265L681.7 266.8L683.5 269.1L685.6 271.9L688 275.1L690.9 278.8L693.8 282.3L696.9 285.6L700.1 288.7L703.3 291.7L706.7 294.5L710.2 297L713.8 299.4L717.4 301.6L720.5 303.6L723.1 305.4L725.2 307.2L726.9 308.7L728 310.1L728.6 311.4L728.8 312.4L728.6 313.4L728.4 314.4L728.2 315.3L728 316L727.9 316.6L727.8 317L727.7 317.3L727.7 317.4L728.3 317.6L728.4 317.5L728.5 317.2L728.6 316.8L728.8 316.2L729 315.5L729.3 314.7L729.6 313.7L730 312.5L729.8 311L729.2 309.4L728 307.7L726.4 305.9L724.3 304L721.7 301.9L718.7 299.6L715.2 297.3L711.8 294.9L708.4 292.3L705.2 289.6L701.9 286.7L698.8 283.7L695.7 280.6L692.6 277.3L689.5 273.8L686.9 270.8L684.6 268.2L682.6 266.1L681.1 264.4L679.9 263.1L679.2 262.2L678.8 261.8ZM789.8 317.6L789.9 317.4L790.1 317L790.4 316.4L790.9 315.6L791.4 314.6L792 313.4L792.7 312L793.4 310.3L794.1 309L794.7 307.9L795.2 307L795.6 306.5L795.8 306.2L795.8 306.2L795.4 306.2L795.3 306.2L795.4 306.3L795.7 306.7L796 307.3L796.3 308L796.6 308.9L797 310L797.3 311.2L797.7 312.6L798.1 313.9L798.4 314.9L798.6 315.8L798.8 316.5L799 317L799.1 317.4L799.2 317.6L799.8 317.4L799.8 317.3L799.8 316.9L799.8 316.3L799.7 315.6L799.7 314.7L799.6 313.6L799.5 312.3L799.4 310.8L799.2 309.5L799 308.3L798.8 307.2L798.5 306.2L798.1 305.4L797.7 304.7L797.1 304.1L796.3 303.5L795 303.5L794.1 304L793.4 304.7L792.8 305.6L792.3 306.7L791.7 307.9L791.2 309.5L790.7 311.2L790.3 312.8L790 314.1L789.7 315.2L789.5 316.1L789.3 316.7L789.2 317.2L789.2 317.4ZM948.8 317.5L948.9 317.3L948.9 316.9L949 316.3L949 315.4L949.1 314.4L949.3 313.1L949.4 311.6L949.6 310L949.8 308.2L950.2 306.2L950.7 304.1L951.2 301.9L951.9 299.6L952.7 297.1L953.6 294.4L954.6 291.6L955.5 289L956.5 286.5L957.6 284.2L958.6 282L959.6 280L960.7 278.1L961.7 276.4L962.8 274.8L964 272.6L965.2 270L966.4 266.8L967.7 263.3L969.1 259.2L970.5 254.6L971.9 249.6L973.3 244.1L974.6 239.2L975.8 234.9L976.9 231.2L977.8 228.1L978.7 225.6L979.4 223.7L979.9 222.5L980.3 221.9L980.8 221.3L981.3 220.7L981.8 220.2L982.4 219.7L983 219.3L983.6 218.9L984.3 218.5L985.3 218.2L986.2 217.4L987 216.3L987.4 215L987.7 213.6L987.9 212L987.9 210.1L987.7 208L987.4 205.8L987.2 203.6L987 201.4L986.9 199.2L986.8 197L986.8 194.9L986.9 192.7L987 190.6L987.1 188.5L987.3 186.6L987.5 184.9L987.8 183.5L988.1 182.2L988.4 181.2L988.8 180.4L989.2 179.9L989.6 179.5L990 179.3L990.4 179.2L990.9 179.2L991.4 179.4L992.1 179.7L992.8 180.2L993.5 180.9L994.3 181.7L995.1 182.5L995.7 183.1L996.2 183.7L996.6 184.1L996.9 184.4L997.1 184.6L997.2 184.7L997.8 184.3L997.7 184.2L997.5 183.9L997.2 183.6L996.8 183.1L996.3 182.6L995.7 181.9L995 181.1L994.2 180.2L993.4 179.5L992.6 178.9L991.9 178.4L991.1 178.2L990.3 178.1L989.6 178.2L988.9 178.6L988.3 179.1L987.8 179.8L987.3 180.7L986.9 181.9L986.5 183.2L986.1 184.7L985.8 186.4L985.6 188.4L985.3 190.5L985.2 192.7L985.1 194.8L985 197L985 199.2L985 201.5L985.1 203.7L985.3 206L985.5 208.2L985.6 210.2L985.6 211.8L985.4 213.2L985.2 214.4L984.8 215.2L984.4 215.7L984 216L983.4 216.3L982.5 216.7L981.7 217.1L980.9 217.7L980.1 218.2L979.4 218.9L978.8 219.6L978.2 220.4L977.6 221.3L976.9 222.7L976.1 224.7L975.3 227.3L974.3 230.4L973.2 234.2L971.9 238.5L970.6 243.4L969.2 248.9L967.8 253.9L966.5 258.4L965.3 262.4L964.1 266L962.9 269L961.8 271.6L960.8 273.6L959.7 275.2L958.7 277L957.7 279L956.7 281.1L955.7 283.4L954.7 285.8L953.8 288.4L952.9 291.1L952 293.9L951.2 296.6L950.5 299.2L949.9 301.6L949.4 303.9L949 306L948.7 308L948.6 309.9L948.5 311.6L948.4 313L948.3 314.3L948.3 315.4L948.2 316.2L948.2 316.8L948.2 317.3L948.2 317.5ZM997.8 94.3L997.7 94.2L997.6 93.9L997.4 93.5L997.2 93L996.9 92.3L996.6 91.6L996.1 90.7L995.6 89.7L995.2 88.8L994.9 87.9L994.5 87.1L994.3 86.4L994.1 85.7L993.9 85.1L993.9 84.5L993.8 84L993.8 83.5L993.9 83.1L994 82.7L994.1 82.4L994.4 82.1L994.7 81.7L995.1 81.4L995.6 81.1L996.1 80.8L996.5 80.5L996.9 80.3L997.2 80.1L997.4 80L997.6 79.9L997.6 79.8L997.4 79.2L997.3 79.2L997.1 79.2L996.9 79.3L996.5 79.4L996.1 79.4L995.6 79.6L995 79.7L994.3 79.9L993.6 80.1L993 80.5L992.4 81L992 81.6L991.6 82.3L991.3 83L991.2 83.8L991.1 84.7L991.2 85.5L991.4 86.4L991.6 87.3L992 88.2L992.5 89.1L993.1 90L993.7 90.9L994.5 91.8L995.2 92.5L995.7 93.1L996.2 93.7L996.6 94.1L996.9 94.4L997.1 94.6L997.2 94.7ZM997.8 -52.7L997.7 -52.8L997.6 -53L997.5 -53.3L997.2 -53.7L996.9 -54.3L996.6 -54.9L996.2 -55.6L995.8 -56.4L995.3 -57.6L994.8 -59.1L994.2 -60.9L993.5 -63.1L992.8 -65.7L992.1 -68.6L991.2 -71.8L990.3 -75.4L989.5 -78.8L988.7 -82.1L987.9 -85.2L987.3 -88.3L986.7 -91.1L986.2 -93.9L985.8 -96.6L985.5 -99.1L985.2 -101.3L985 -103.2L984.8 -104.8L984.6 -106.1L984.5 -107.1L984.4 -107.7L984.3 -108L983.7 -108L983.7 -107.7L983.7 -107L983.7 -106L983.7 -104.8L983.7 -103.1L983.8 -101.2L983.8 -99L983.9 -96.4L984.1 -93.6L984.3 -90.8L984.8 -87.8L985.3 -84.7L985.9 -81.5L986.7 -78.1L987.7 -74.7L988.8 -71.1L989.8 -67.9L990.8 -65.1L991.7 -62.5L992.6 -60.4L993.4 -58.5L994.1 -57L994.7 -55.9L995.3 -55.1L995.8 -54.4L996.2 -53.8L996.5 -53.3L996.8 -52.9L997 -52.6L997.1 -52.4L997.2 -52.3ZM492.7 -108L492.7 -107.2L492.9 -105.7L493.2 -103.5L493.5 -100.5L494 -96.8L494.5 -92.4L495.1 -87.2L495.8 -81.2L496.5 -75L497 -68.5L497.5 -61.7L498 -54.7L498.4 -47.3L498.7 -39.7L499 -31.8L499.1 -23.6L499.3 -16L499.5 -9.1L499.6 -2.7L499.7 3.1L499.7 8.3L499.8 12.8L499.8 16.8L499.8 20.2L499.7 23.2L499.6 25.9L499.4 28.2L499.1 30.2L498.8 31.9L498.5 33.2L498.1 34L497.9 34.4L497.3 34.7L496.1 35L494.2 35.1L491.8 35L488.9 34.7L485.5 34.1L481.5 33.4L477 32.5L471.7 31.6L465.7 30.9L458.9 30.3L451.5 29.9L443.3 29.6L434.3 29.4L424.7 29.3L414.3 29.4L405.2 29.4L397.2 29.4L390.6 29.4L385.1 29.3L380.9 29.2L377.9 29L376.3 28.9L376.1 28.8L375.7 28.4L375 27.7L374.2 26.8L373.2 25.5L372.2 24L371 22.3L369.8 20.3L368.4 18L366.8 15.1L365 11.7L362.9 7.8L360.7 3.3L358.2 -1.8L355.5 -7.4L352.5 -13.6L349.4 -20.3L346.5 -26.7L343.8 -32.8L341.4 -38.5L339.3 -44L337.4 -49.1L335.8 -53.9L334.5 -58.4L333.4 -62.5L332.4 -66.6L331.5 -70.7L330.7 -74.8L330.1 -78.8L329.5 -82.8L329 -86.7L328.6 -90.6L328.3 -94.5L328.1 -97.9L327.9 -100.8L327.7 -103.2L327.6 -105.1L327.5 -106.6L327.4 -107.5L327.3 -108L326.7 -108L326.7 -107.5L326.7 -106.5L326.8 -105.1L326.9 -103.1L327.1 -100.7L327.2 -97.8L327.4 -94.4L327.6 -90.5L328 -86.6L328.4 -82.6L328.9 -78.6L329.5 -74.6L330.3 -70.5L331.1 -66.3L332 -62.2L333.1 -58L334.4 -53.4L335.9 -48.6L337.7 -43.4L339.8 -37.9L342.1 -32.1L344.7 -25.9L347.5 -19.5L350.6 -12.7L353.5 -6.5L356.1 -0.8L358.6 4.3L360.8 8.9L362.8 12.9L364.6 16.3L366.2 19.2L367.6 21.6L368.9 23.6L370.1 25.5L371.2 27L372.2 28.4L373.1 29.5L373.9 30.3L374.8 31L375.8 31.4L377.7 31.6L380.8 31.8L385 32L390.5 32.1L397.2 32.1L405.2 32.2L414.3 32.2L424.7 32.1L434.3 32.2L443.2 32.4L451.3 32.7L458.7 33.1L465.4 33.6L471.3 34.3L476.5 35.1L481 36L485 36.8L488.6 37.3L491.7 37.6L494.3 37.7L496.4 37.5L498.2 37.1L499.6 36.3L500.4 35.2L500.9 33.9L501.3 32.4L501.6 30.6L501.9 28.5L502.1 26L502.2 23.3L502.2 20.2L502.2 16.8L502.2 12.8L502.1 8.2L501.9 3.1L501.8 -2.7L501.6 -9.1L501.4 -16.1L501.1 -23.7L500.8 -31.9L500.4 -39.8L500 -47.4L499.5 -54.8L499 -61.8L498.3 -68.6L497.7 -75.1L496.9 -81.3L496.1 -87.3L495.4 -92.5L494.8 -96.9L494.3 -100.6L493.9 -103.6L493.6 -105.8L493.4 -107.3L493.3 -108Z"},"luke":{"occ":"M0 -110L0 320L140 320L138 297L140 293L144 296L150 309L156 316L158 320L186 320L177 295L176 282L176 274L179 272L184 270L190 267L198 271L210 270L226 266L230 264L231 260L228 258L212 256L186 248L162 236L140 221L124 206L115 194L108 181L102 160L102 140L108 120L118 102L131 87L142 78L162 64L186 52L212 44L242 39L269 37L298 -34L308 -54L313 -60L318 -64L322 -64L328 -62L332 -58L333 -56L334 -36L328 -10L328 -4L328 0L331 2L334 0L336 -6L340 -1L340 18L338 27L338 46L340 47L358 52L375 60L378 59L378 56L381 54L386 60L386 66L403 78L411 85L426 102L436 120L442 140L442 154L440 168L436 181L432 190L420 206L403 222L390 232L372 257L361 268L362 272L365 272L374 266L400 238L402 238L404 240L405 246L408 251L414 252L424 264L426 264L428 261L416 236L414 229L414 225L420 218L428 216L429 216L428 208L430 206L432 204L436 204L444 207L449 212L453 223L466 245L475 275L476 276L479 274L480 268L484 262L492 260L498 260L506 266L532 291L550 306L560 310L562 310L564 306L558 302L552 292L536 252L530 232L529 220L530 210L532 208L535 208L540 212L550 226L554 233L560 240L564 242L572 243L576 246L610 274L633 292L648 298L651 296L651 294L634 274L622 258L606 229L592 218L580 206L571 194L563 178L560 168L558 154L558 140L564 120L574 102L596 79L618 64L630 58L630 56L626 52L626 50L628 32L637 -20L639 -24L642 -26L646 -21L648 -14L654 8L656 24L663 44L664 45L688 41L692 39L693 16L695 8L695 2L693 -3L693 -10L694 -12L698 -4L700 8L714 38L746 38L772 41L800 48L823 56L848 70L867 85L882 102L892 120L898 140L898 160L892 181L882 198L867 215L848 230L820 245L788 256L788 258L812 282L814 286L816 293L816 301L813 320L848 320L850 316L851 316L854 318L854 320L1000 320L1000 -110Z","lines":"M551.3 67.6L552.7 71.6L555.6 79.6L559.5 95.4L564.3 118.9L567.2 131.5L568.2 133.1L569.3 136.6L570.5 142.3L571.9 146.9L573.3 150.1L574.2 154.6L574.4 160.6L575.8 168L578.3 176.6L582.8 188L589.4 202.3L593 211.3L593.8 215.2L594.7 217.9L595.8 219L596.4 220.5L596.9 223L598 226L599.5 229.6L601 232.1L602.3 233.3L602.9 234.6L603.2 236.3L604 238L605.3 239.3L608.4 244.6L613.5 254L617.9 261.3L621.4 266.2L624.4 269.7L626.6 271.7L627.8 273.5L628.1 275.2L629.1 276.7L630.6 277.7L631.4 278.2L631.6 277.8L630.9 277.3L629.4 276.3L628.7 275L628.4 273.3L627.1 271.3L624.9 269.3L622.1 265.8L618.6 260.7L614.5 253.5L609.6 243.9L606.5 238.5L605.2 237.2L604.6 235.9L604.3 234.2L603.5 232.4L602.3 231.2L601 228.9L599.5 225.5L598.6 222.5L598.1 220L597.2 218L596.3 217.1L595.5 214.8L594.7 210.7L591.1 201.5L584.7 187.2L580.2 175.9L577.7 167.5L576.3 160.4L576.1 154.4L575.2 149.6L573.6 146.3L572.3 141.9L571 136.2L569.8 132.4L568.8 131L565.7 118.6L560.5 95.1L556.4 79.4L553.3 71.4L551.7 67.4ZM322.9 -110.1L320.8 -107.3L316.6 -101.6L313.9 -97L312.6 -93.5L307.9 -84.3L300.2 -69.2L296.4 -61.6L296.6 -61.4L300.8 -68.8L309.1 -83.7L313.7 -93L314.9 -96.5L317.4 -101.1L321.2 -107L323.1 -109.9ZM964.1 207L963.4 201.4L961.6 190.4L960.6 182.6L960.6 177.9L960.6 175.5L960.4 175.5L960.1 177.9L959.7 182.6L960.4 190.6L962.6 201.6L963.9 207ZM482.1 -84.9L486.4 -89L494.8 -97.3L501.2 -103.7L505.8 -107.8L508.1 -109.9L507.9 -110.1L505.5 -108.2L500.6 -104.3L494 -98.2L485.9 -89.5L481.9 -85.1ZM464.9 -109.9L465.5 -109.4L466.7 -108.3L467.6 -106.7L468.5 -104.5L469.6 -100.5L471.1 -94.8L471.9 -92L472.1 -92L471.7 -94.9L470.7 -100.8L469.5 -104.8L468.4 -107.1L467.1 -108.7L465.7 -109.6L465.1 -110.1ZM586.9 -20.5L585.1 -12.7L582.1 3L580.9 11L581.1 11L582.9 3.2L585.9 -12.5L587.1 -20.5ZM254.7 59.1L256.7 52.2L260.6 38.5L263.5 26.6L265.4 16.6L267.9 5.4L271.1 -7L273.5 -15.5L274.9 -20L279.9 -31.1L288.4 -49L292.7 -57.9L292.3 -58.1L287.8 -49.3L278.8 -31.6L273.6 -20.5L272 -16L269.6 -7.5L266.3 5.1L263.9 16.4L262.2 26.4L259.6 38.2L256.1 52L254.3 58.9ZM290.9 -31.5L289.1 -26L285.6 -14.8L283.4 -8.1L282.5 -5.9L281 -3.7L279 -1.4L276.9 3.3L274.9 10.4L273.9 14L274.1 14L275.4 10.6L277.8 3.7L280 -0.8L282 -3L283.5 -5.3L284.6 -7.7L286.7 -14.5L289.7 -25.8L291.1 -31.5ZM817.6 154.4L816.8 153.6L815 152L812 150.3L807.8 148.5L800.7 146L790.7 142.9L784 140L780.4 137.3L778.7 135.2L778.7 133.3L777.4 130L774.9 125.8L771.5 118.6L767.2 108.4L764.7 101.4L764.2 97.4L762.3 93.7L759.2 90.4L757.7 87.9L757.7 86L757.7 85L757.3 85L757.3 86L757.3 88.1L758.8 90.8L761.7 94.1L763.3 97.6L763.8 101.6L766.1 108.8L770.2 119.2L773.6 126.5L776.1 130.7L777.3 133.7L777.3 135.8L779.4 138.4L783.3 141.2L790.3 144.1L800.3 147L807.5 149.2L811.7 150.9L814.7 152.5L816.5 153.9L817.4 154.6ZM900.4 120L898.7 124.9L895.5 134.8L892.2 144.2L888.8 152.9L886.1 159.1L883.9 162.6L882.9 164.4L883.1 164.6L884.3 162.9L886.7 159.4L889.7 153.3L893.3 144.6L896.5 135.2L899.3 125.1L900.6 120ZM559.4 219.1L562.6 223L569.2 230.6L572.7 234.6L572.7 235.3L573.7 236.4L575.5 237.5L576.4 238.1L576.6 237.9L575.7 237.2L574.1 235.9L573.3 235L573.3 234.1L570 229.9L563.2 222.5L559.6 218.9ZM235 230.4L233.7 230.1L231 229.5L227.7 227.7L223.9 224.6L221.9 222.3L221.7 220.7L221 219.2L220 218.2L218.8 215.9L217.3 212.2L216.2 207.8L215.5 202.6L215.1 200L214.9 200L215 202.6L215.3 207.9L216.2 212.5L217.7 216.4L219 218.8L220 219.8L220.6 221L220.9 222.9L223.1 225.4L227.3 228.3L230.8 230L233.6 230.4L235 230.6ZM334.1 14.5L333.5 11.3L332.2 5.1L331.6 -2.2L331.6 -10.4L332 -17.8L332.8 -24.6L333.2 -28L332.8 -28L332.2 -24.7L331 -17.9L330.4 -10.4L330.4 -2.1L331.3 5.2L333 11.4L333.9 14.5ZM690.8 -77.5L690.7 -76.3L690.4 -73.7L691 -68.8L692.6 -61.4L698 -49.1L707.5 -31.9L712.4 -23.4L712.6 -23.6L708.2 -32.3L699.2 -49.7L693.6 -61.8L691.7 -69L690.9 -73.8L691.1 -76.2L691.2 -77.5ZM815.9 202.1L819 206.5L825.8 215L829.4 219.1L829.6 218.9L826.5 214.5L819.7 206L816.1 201.9ZM697.3 -28.4L702.2 -13.4L712.2 16.8L719.7 36.4L724.5 45.7L727.4 51.5L728.4 53.9L728.9 55.9L729 57.8L730.1 60.1L732.1 62.9L733.4 65.5L733.9 68.2L735.6 71.5L738.4 75.3L739.8 77.1L740.2 76.9L738.8 75L736.1 71.2L734.6 68L734.1 65.3L732.9 62.4L730.9 59.6L730 57.5L730.1 55.8L729.6 53.6L728.6 51L725.7 45.1L721.1 35.8L713.6 16.2L703 -13.6L697.7 -28.6ZM436.2 289L435.5 285.8L434.1 279.5L430.1 270L423.5 257.4L418.9 248.1L416.6 241.9L414.2 237.7L411.9 235.4L410.2 233.2L409.2 231L408.7 229.9L408.3 230.1L408.8 231.2L409.8 233.5L411.4 235.8L413.6 238.1L415.7 242.3L417.8 248.6L422.3 258.1L429.1 270.5L433.4 279.8L435 285.9L435.8 289ZM245.1 135L245 131.4L244.7 124.1L245.1 118.3L246.1 113.9L246.5 109.9L246.5 106.6L246.1 104.5L245.4 103.5L243.4 103.3L240.1 103.7L238.5 103.9L238.5 104.1L240.1 104.1L243.4 103.9L245.1 104.2L245.4 104.7L245.5 106.6L245.5 109.8L244.9 113.6L243.9 118.2L243.8 124.1L244.5 131.4L244.9 135ZM827.9 258.4L827.5 259.3L826.6 261.1L826.4 266.6L827.1 275.9L827.2 282.2L826.7 285.7L826.4 287.5L826.6 287.5L827.1 285.8L828 282.3L828.2 275.8L827.4 266.6L827.1 261.2L827.8 259.4L828.1 258.6ZM560.9 205.6L564.8 210.9L573 221.2L577.4 226.1L577.6 225.9L573.7 220.6L565.5 210.3L561.1 205.4ZM558.4 -4.6L556.9 -1.6L553.9 4.3L549.5 11.7L543.7 20.8L540.9 25.4L541.1 25.6L544.3 21.2L550.5 12.3L554.8 4.7L557.4 -1.4L558.6 -4.4ZM37.9 157L39 162.7L41.7 174L43.4 179.5L43.6 179.5L42.5 173.8L39.8 162.5L38.1 157ZM954.3 124.5L954.2 125.1L953.9 126.4L955 129.1L957.4 133.2L963.4 147.1L973.4 170.9L979.3 185.7L980.6 191.9L981.3 195L981.7 195L981.1 191.8L980 185.5L974.6 170.4L964.6 146.6L958.1 132.8L955.5 128.9L954.3 126.3L954.6 125.2L954.7 124.5ZM98.3 6L98 9.1L97.4 15.4L97.1 23.3L97.2 32.8L97.6 38.2L98.1 39.5L98.3 43.2L98.1 49.7L98.3 53.9L98.8 55.7L98.9 59.1L98.5 64.4L98.3 67L98.7 67L99 64.4L99.6 59.1L99.7 55.6L99.2 53.8L99.2 49.8L99.5 43.3L99.4 39.3L98.9 38L98.5 32.7L98.2 23.2L98.1 15.4L98.5 9.1L98.7 6ZM355.1 84.2L355.6 84L356.7 83.4L357.3 82L357.3 80L356.7 76.5L355.5 71.8L355 65L355.1 56L352.8 35.4L348 3.4L345.1 -22.5L344.3 -42.1L344.1 -66L344.6 -94L344.4 -108.4L343.6 -109.3L343.2 -109.7L342.8 -109.3L343.2 -108.9L343.9 -108.4L343.7 -94L342.6 -66L342.5 -42.1L343.1 -22.3L346 3.6L351.2 35.6L353.9 56L354 65L354.7 71.9L356 76.7L356.7 80L356.7 82L356.3 83.1L355.4 83.5L354.9 83.8ZM0.1 -39.4L1.3 -41L3.7 -44.2L5.6 -47.6L6.9 -51L9.7 -55.3L14.1 -60.6L17.2 -64L19.1 -65.6L20.1 -66.4L19.9 -66.6L18.9 -65.9L16.8 -64.5L13.4 -61.2L8.8 -56L5.9 -51.5L4.7 -47.9L3.1 -44.6L0.9 -41.3L-0.1 -39.6ZM378.4 137.5L379.8 143.3L382.8 154.9L386 163.9L389.2 170.4L390.9 173.6L391.1 173.4L389.8 170.1L387 163.6L383.9 154.6L380.5 143.2L378.6 137.5ZM436.1 140L436 137.8L435.7 133.6L435.5 129.4L435.4 125.1L435.5 122.6L435.9 121.6L436.1 121.1L435.9 120.9L435.6 121.4L435 122.4L434.6 125.1L434.5 129.4L434.8 133.7L435.5 137.9L435.9 140ZM916.9 283L916.8 286.6L916.8 293.9L916.8 299L916.5 302L916.4 303.5L916.6 303.5L917 302L917.7 299L917.9 293.9L917.5 286.6L917.1 283ZM513.1 264.4L511.1 261.9L507 257L505 254.2L505 253.3L504.1 252L502.6 250.8L501.9 249.7L501.9 248.4L500.4 247.1L497.8 245.9L496.6 245.4L496.4 245.6L497.7 246.3L500.1 247.7L501.1 248.8L501.1 250L501.9 251.5L503.4 252.8L504 253.7L504 254.8L506.2 257.7L510.7 262.3L512.9 264.6ZM97.8 -70L97 -61.5L95.5 -44.5L95.2 -32.6L95.8 -25.9L95.9 -20.6L95.5 -16.9L95.3 -15L95.7 -15L96 -16.8L96.6 -20.6L96.7 -25.9L96.3 -32.6L96.8 -44.5L97.8 -61.5L98.2 -70ZM778.4 -59.5L779.1 -56.9L780.6 -51.8L782.9 -46.6L785.9 -41.5L787.4 -38.9L787.6 -39.1L786.4 -41.8L783.9 -47.1L781.6 -52.2L779.6 -57.1L778.6 -59.5ZM666.9 24L667.7 29.7L669.9 41L671.1 47.3L670.9 48.7L670.9 49.5L671.1 49.5L671.3 48.8L671.6 47.2L670.9 40.8L668.5 29.5L667.1 24ZM232.9 -102L232.1 -98.8L230.6 -92.3L229.9 -86.2L229.8 -80.4L229.9 -77.5L230.1 -77.5L230.4 -80.4L230.9 -86.1L231.7 -92.2L232.7 -98.7L233.1 -102ZM145.6 257L145.2 252.6L143.7 243.8L142.6 239.5L142.4 239.5L142.8 243.9L144.3 252.7L145.4 257ZM688.8 79.5L689.4 85.3L690.7 96.8L691.1 104.6L690.7 108.8L690.5 112L690.5 114.1L691.1 116.4L692.2 118.8L692.5 121.2L692.1 123.7L691.8 125L692.2 125L692.4 123.8L693 121.3L692.8 118.7L691.9 116.1L691.5 113.9L691.5 112L691.8 108.9L692.4 104.6L691.8 96.7L690.1 85.2L689.2 79.5ZM580.4 -56.6L578.2 -51.1L574 -40.2L570.4 -32L567.4 -26.5L565 -20.4L563.1 -13.9L561.5 -9.6L560.1 -7.6L559.4 -6.6L559.6 -6.4L560.4 -7.4L562 -9.4L563.9 -13.6L566 -20.1L568.6 -26L571.6 -31.5L575 -39.8L578.8 -50.9L580.6 -56.4ZM615.4 199L615.4 200.1L615.6 202.5L616.6 205.4L618.5 209L620.2 213.1L621.7 217.8L623.2 221.1L624.6 222.9L626.6 223.8L628.9 223.7L630 223.6L630 223.4L628.9 223.3L626.7 223.2L625.1 222.3L624 220.7L622.8 217.4L621.3 212.7L619.5 208.5L617.4 205.1L616.2 202.3L615.8 200.1L615.6 199ZM577.9 95.5L577.2 100.3L575.9 110.1L576.1 119.7L577.6 128.9L578.4 133.5L578.6 133.5L578.2 128.8L577.2 119.6L577.1 110.2L577.8 100.4L578.1 95.5ZM131.3 111.5L131 115.9L130.3 124.6L130.5 138.3L132 156.8L132.8 166L133.2 166L132.8 156.7L131.8 138.2L131.2 124.6L131.5 115.9L131.7 111.5ZM941.1 95.5L939.7 85.9L936.2 66.9L934.1 57.5L933.9 57.5L935.3 67.1L938.8 86.1L940.9 95.5ZM-0.1 284.5L-0.2 285.5L-0.3 287.5L-0 289.3L0.9 290.8L4.1 292.1L9.7 293.2L12.5 293.6L12.5 293.4L9.8 292.6L4.4 291.1L1.4 290L0.8 289L0.3 287.5L0.2 285.5L0.1 284.5ZM155.4 -110.1L155 -109.8L154.2 -108.9L153.1 -105.1L151.7 -98.1L148.7 -87.6L144.1 -73.3L141 -61.2L139.2 -51.4L138.3 -46.5L138.7 -46.5L139.8 -51.3L142 -61L145.4 -72.9L149.8 -87.2L152.6 -97.9L153.7 -104.9L154.6 -108.8L155.3 -109.5L155.6 -109.9ZM399.2 81.9L398.6 80.2L397.4 76.7L396.4 71.9L395.4 65.9L393.7 60.4L391.3 55.6L389.8 51.4L389 47.7L387.7 43.7L385.7 39.7L381.2 26.4L374.1 3.7L369.7 -9.8L368.1 -14L366.8 -16.7L365.8 -17.6L365.1 -19.4L364.8 -22.1L364.7 -23.5L364.3 -23.5L364.4 -22.1L364.6 -19.3L365.2 -17.4L366.2 -16.3L367.4 -13.7L368.8 -9.5L372.9 4.1L379.8 26.9L384.3 40.3L386.3 44.3L387.7 48.1L388.5 51.8L390.2 56.1L392.8 60.8L394.6 66.1L395.6 72.1L396.9 76.8L398.2 80.3L398.8 82.1ZM524.3 271.5L524.3 272.1L524.3 273.5L527.7 278L534.6 285.6L539.5 290L542.3 291L546.4 294.6L552.2 300.8L558.3 306.2L564.6 310.6L568.7 313.7L570.5 315.6L571.4 316.6L571.6 316.4L570.8 315.4L569.1 313.3L565.1 309.9L559 305.3L553.1 299.9L547.3 293.7L543 290L540.2 289L535.4 284.9L528.3 277.5L524.7 273.3L524.7 272.1L524.7 271.5ZM866.6 318.6L867.1 318.3L868.2 317.4L869.3 308.4L870.3 291.2L871.1 278.6L872.1 270.5L872.7 266.5L872.3 266.5L871.6 270.5L870.2 278.4L869 291.1L868.4 308.3L867.8 317.3L866.9 318L866.4 318.4ZM24.6 -91.9L25.5 -93.7L27.1 -97L30 -101.4L33.8 -107.1L35.6 -109.9L35.4 -110.1L33.2 -107.4L29 -102.1L26.4 -97.5L25 -93.8L24.4 -92.1ZM374.9 160.1L375.7 161.6L377.2 164.7L378 166.8L378 168L378.9 169.9L380.8 172.1L381.8 173.9L382.2 175.3L382.4 176L382.6 176L382.6 175.2L382.4 173.6L381.5 171.6L379.8 169.3L379 167.7L379 166.5L378 164.3L376.1 161.4L375.1 159.9ZM346.1 282.2L351.3 278.6L361.7 271.5L368.7 266.2L372.6 262.7L380.1 254L391.1 240L398.2 231.5L401.5 228.5L403.8 225.5L405 222.8L406.9 220.7L409.6 219L411.6 217.1L413 215.2L413.6 213.7L413.6 212.8L414.8 211.3L417.5 209L419.4 206.6L420.1 204.4L424 199.3L431.1 191.2L434.7 187.1L434.3 186.9L430.7 190.8L423.3 198.7L419.2 203.8L418.4 206.1L416.7 208.2L413.9 210.4L412.4 212.2L412.4 213.3L411.8 214.5L410.6 216.1L408.7 217.8L405.9 219.6L403.7 222L402.5 224.7L400.3 227.5L397 230.5L389.9 239L378.9 253L371.6 261.8L368 265.3L361.1 270.7L351 278.1L345.9 281.8ZM799.4 -3L800.2 1.9L801.9 11.7L803.4 21.8L804.7 32.3L805.4 37.5L805.6 37.5L805.3 32.2L804.6 21.7L803.1 11.5L800.8 1.8L799.6 -3ZM220.9 -47.6L220.6 -47.1L220 -46L219.6 -42.9L219.5 -37.7L218.6 -32.8L217.1 -28L216.4 -25.5L216.6 -25.5L217.6 -27.8L219.6 -32.5L220.5 -37.6L220.4 -42.9L220.5 -46L220.9 -46.9L221.1 -47.4ZM550.6 193.4L547.4 189.1L540.8 180.4L534.9 173.7L529.9 169L525.5 164L521.6 158.6L519.6 155.9L519.4 156.1L521.2 158.9L524.8 164.5L529.1 169.8L534.1 174.6L539.9 181.1L546.9 189.4L550.4 193.6ZM124.9 9.5L123.4 16.7L120.7 31.2L119.5 41.2L119.4 46.7L119.3 49.5L119.7 49.5L119.9 46.8L120.3 41.3L121.8 31.3L124.1 16.8L125.1 9.5ZM513.2 4L513.1 3.2L512.8 1.7L509.6 -5.2L503.3 -17.3L495.9 -33.3L487.1 -53.2L482.7 -63.1L482.3 -62.9L486.4 -52.8L494.6 -32.7L502.2 -16.7L508.9 -4.8L512.4 1.8L512.7 3.3L512.8 4ZM77.4 170.1L80.2 178L86.5 193.8L89.9 201.6L90.1 201.4L87.3 193.5L81 177.7L77.6 169.9ZM874.6 247.6L875.2 246.6L876.3 244.6L877.2 241.8L877.8 238.4L879.2 234.5L881.5 229.9L882.6 227.6L882.4 227.4L881 229.6L878.3 234L876.7 238.1L876.3 241.7L875.7 244.4L874.8 246.4L874.4 247.4ZM32.6 -81L32.9 -81.7L33.4 -83.1L35.2 -85L38.3 -87.4L40.3 -89.4L41 -90.9L43.9 -93.8L48.9 -98.3L52.7 -102.7L55.4 -106.8L57.1 -109.1L58.1 -109.6L58.6 -109.9L58.4 -110.1L57.9 -109.9L56.9 -109.4L54.9 -107.2L52 -103.3L48.1 -99.2L43.1 -94.7L40.2 -91.6L39.5 -90.1L37.7 -88.1L34.8 -85.5L33.1 -83.4L32.6 -81.8L32.4 -81ZM411.6 155.9L410.8 154.6L409.1 152L405.8 148.5L400.9 144.2L395.4 138.7L389.2 132.2L386.1 128.9L385.9 129.1L388.8 132.6L394.6 139.5L400.1 145.1L405.2 149.2L408.6 152.5L410.5 154.9L411.4 156.1ZM545.3 -57L543.8 -50.8L540.8 -38.4L535.8 -23.4L528.8 -5.5L525.3 3.4L525.7 3.6L529.5 -5.2L537 -22.9L541.9 -38.1L544.4 -50.7L545.7 -57ZM13.9 21.5L13.4 22.4L12.5 24.4L11.7 29.3L11.4 37.1L11.4 41L11.6 41L12.1 37.1L12.8 29.4L13.2 24.6L13.8 22.6L14.1 21.5ZM150.1 -46L151.7 -51.8L154.7 -63.5L157.2 -72.9L159.5 -79.9L160.6 -83.4L160.4 -83.6L159 -80.1L156.3 -73.1L153.5 -63.8L151 -52L149.9 -46ZM976.9 -62.9L979.1 -58L983.6 -48.1L988.9 -39.2L994.7 -31.2L997.9 -25.4L998.5 -21.5L998.8 -19.5L999.2 -19.5L999 -21.5L998.6 -25.6L995.5 -31.8L989.9 -39.8L984.6 -48.6L979.7 -58.3L977.1 -63.1ZM635.9 -95L635 -92.3L633.3 -86.9L632 -80.3L631.2 -72.8L630.9 -69L631.1 -69L631.8 -72.7L633 -80.2L634.2 -86.6L635.5 -92.2L636.1 -95ZM633.4 -57L632.6 -54.2L631.1 -48.5L630.6 -43.4L631.1 -39.1L631.4 -37L631.6 -37L631.6 -39.1L631.6 -43.4L632.2 -48.3L633.2 -54.1L633.6 -57ZM682.4 192.5L682.1 194.2L681.7 197.8L682.1 202.3L683.4 207.9L684.7 211.5L685.8 213.2L686.4 214.1L686.6 213.9L686.2 213L685.3 211.3L684.3 207.6L683.2 202.2L682.5 197.7L682.6 194.3L682.6 192.5ZM630.8 -28.5L628.4 -15.2L623.9 11.5L620.3 31.9L617.3 45.9L615.8 53L616.2 53L617.9 46.1L621.4 32.1L625.3 11.7L629.3 -15.1L631.2 -28.5ZM166.2 159.1L167 158.2L168.8 156.2L171 154.8L173.7 153.8L178.1 152.9L184.1 152L190.5 150.6L197.3 148.6L209.5 146.8L227.3 144.8L236.4 141.8L236.5 137.3L235.6 132.3L234 126.4L232.7 117.9L231.6 106.9L230.6 99.6L229.5 96.2L229 91.4L228.9 85.1L228.4 81.3L227.7 80.1L227.6 78.3L228.3 75.8L228.7 74.6L228.3 74.4L227.9 75.7L227.1 78.2L227.1 80.2L227.8 81.4L228.1 85.1L228 91.4L228.5 96.3L229.4 99.9L230.4 107.1L231.3 118.1L232.5 126.6L233.9 132.7L234.8 137.5L235.4 140.5L227 143.2L209.3 145.2L197 147.4L190.2 149.4L183.9 151L177.9 152.1L173.5 153.2L170.7 154.2L168.4 155.8L166.7 157.8L165.8 158.9ZM476.3 269L477 281L479 305L480.3 317L480.7 317L480 305L478 281L476.7 269ZM612.2 166L612.3 163.8L612.7 159.2L612.2 153.1L610.8 145.3L610.3 134.9L610.6 121.7L611.1 114.3L611.8 112.9L612.3 107.7L612.4 98.9L613.3 90.2L614.9 81.4L615.7 77L615.3 77L614.4 81.3L612.5 90.1L611.3 98.8L611 107.6L610.4 112.6L609.7 114.2L609.2 121.6L609 134.9L609.7 145.4L611.3 153.2L612.1 159.3L611.9 163.7L611.8 166ZM605.4 263.1L609.1 266.9L616.8 274.2L621.5 277.8L622.8 278L623.5 278.1L623.5 277.9L622.9 277.7L621.8 277.4L617.5 273.5L609.7 266.3L605.6 262.9ZM684.7 24.5L685 21.3L685.7 14.8L685.7 6.7L685 -2.8L684.7 -10.6L684.9 -16.9L684.5 -21.1L683.8 -23.1L683.6 -25.9L684 -29.6L684.2 -31.5L683.8 -31.5L683.5 -29.7L682.9 -25.9L683 -22.9L683.7 -20.9L683.9 -16.9L683.5 -10.6L683.7 -2.7L684.6 6.8L684.8 14.7L684.5 21.2L684.3 24.5ZM227.7 62L227.2 49L225.9 23L224.6 8.3L223.7 5.1L223.4 1.8L223.6 -1.7L223.7 -3.5L223.3 -3.5L223.2 -1.8L222.8 1.8L223 5.2L223.7 8.4L224.6 23L226.3 49L227.3 62ZM410.6 254L409.9 251.5L408.4 246.7L407.7 243.2L407.9 240.9L408.6 238.5L409.9 236.2L410.6 235.1L410.4 234.9L409.6 236L407.9 238.2L406.9 240.6L406.6 243.3L407.4 247L409.3 251.7L410.4 254ZM307.9 -110.1L307 -109.5L305.2 -108.3L303.7 -105.7L302.6 -102L299.6 -94.9L294.9 -84.1L292.3 -76.6L291.7 -72.5L291.4 -70.5L291.6 -70.5L292.1 -72.5L293 -76.4L295.9 -83.7L300.7 -94.4L303.4 -101.7L304.3 -105.5L305.6 -108L307.2 -109.2L308.1 -109.9ZM490.8 76.4L487.6 82.2L481.2 93.9L476.8 101L474.6 103.8L472.2 108L470 113.4L467.9 117.4L465.9 119.9L463.8 124L461.9 129.5L459.7 134.2L457.3 138.2L454.6 143.7L451.7 150.5L449.3 154.6L447.4 156.1L446.4 156.9L446.6 157.1L447.6 156.4L449.7 154.9L452.3 150.8L455.4 144.1L458.2 138.8L460.8 134.8L463.1 130L465.2 124.5L467.1 120.6L469.1 118.1L471.3 114.1L473.5 108.5L475.7 104.5L477.9 101.7L482.1 94.4L488.1 82.5L491.2 76.6ZM847.2 147.5L846.8 145.5L846.2 141.5L846.2 137.9L846.7 134.6L846.9 124L846.2 106L845.7 97L845.3 97L845.3 106L845.6 124L845.8 134.6L845.3 137.9L845.5 141.5L846.4 145.5L846.8 147.5ZM0.1 206L0.4 200.9L0.4 190.6L0.1 185.5L-0.1 185.5L-0.4 190.6L-0.4 200.9L-0.1 206ZM542.7 282.9L540.3 277.3L535.4 265.9L532.4 258.4L531.2 254.7L530.7 251.8L530.7 249.5L530 246.9L528.8 244.1L528.2 241.7L528.3 239.2L527.6 236.5L526.4 234L524.9 227.8L523.2 217.9L522.5 210.4L523 205.1L521.6 194.6L518.1 179.1L515.3 168.2L513.2 161.7L512.2 158.4L511.8 158.6L512.8 161.8L514.7 168.3L517.1 179.4L520.2 194.9L521.5 205.2L521 210.4L521.6 218.1L523.3 228.2L524.9 234.5L526.1 237L526.7 239.3L526.8 241.8L527.4 244.6L528.7 247.4L529.3 249.7L529.3 252L530 255L531.3 258.8L534.6 266.3L539.7 277.5L542.3 283.1ZM912.8 -31L914.7 -14.2L919.2 19.3L921.8 36L922.2 36L920.3 19.2L915.8 -14.3L913.2 -31ZM656.1 300.4L651.7 296.9L642.8 290.3L637.7 286.3L636.4 284.6L634.5 283.6L632.1 283.4L631 283.4L631 283.6L632.1 283.8L634.3 284.2L635.9 285.1L637.1 287L642.2 291.2L651.3 297.6L655.9 300.6ZM809.1 60L808.7 55.1L807.2 45.3L806.1 40.5L805.9 40.5L806.3 45.4L807.8 55.2L808.9 60ZM13.3 199.1L14.3 201.1L16.2 205.1L18 216.3L19.8 234.8L23 250.4L27.2 262.8L29.3 269.1L29.7 268.9L27.8 262.7L24 250.1L21.2 234.7L19 216.2L16.8 204.9L14.7 200.9L13.7 198.9ZM995.9 134.5L995.5 136.1L994.8 139.3L994.9 142L995.6 143.8L996.1 146.4L996.6 150.1L996.9 152L997.1 152L997.1 150.1L997.1 146.3L996.6 143.5L995.9 141.8L995.7 139.4L996 136.2L996.1 134.5ZM172.1 129.1L173.7 126.6L176.9 121.7L179.7 114.7L181.9 105.6L183.7 99.4L185.3 95.8L186.1 94.1L185.9 93.9L184.9 95.7L183 99.1L180.9 105.4L178.6 114.3L176.1 121.3L173.3 126.4L171.9 128.9ZM545.4 211.6L547.1 215.3L550.6 222.7L554.6 228.6L558.8 232.9L560.9 235.1L561.1 234.9L559.2 232.6L555.4 227.9L551.6 222.1L547.7 215L545.6 211.4ZM467.4 199.9L467.1 200.6L466.5 201.9L466.6 204.4L467.2 208.3L470.7 214L477 221.2L480.8 225.7L481.8 227.6L482.4 228.6L482.6 228.4L482.2 227.4L481.2 225.3L477.7 220.6L471.6 213.3L468 207.9L467.2 204.3L467 201.9L467.4 200.7L467.6 200.1ZM903.7 26L903.6 25.1L903.3 23.3L900.9 18L896.3 9.1L892.5 2.7L889.5 -1.3L885.4 -9L879.9 -20.2L870.9 -36.6L858.1 -57.9L851.7 -68.6L851.3 -68.4L857.4 -57.6L869.6 -35.9L878.6 -19.5L884.1 -8.3L888.5 -0.7L891.5 3.3L895.5 9.6L900.3 18.3L902.9 23.5L903.2 25.2L903.3 26ZM518.3 12L518.2 14.2L517.8 18.7L514.9 25.3L509.6 34.2L506.2 41.4L504.7 46.7L503.2 50.1L501.5 51.9L499.8 55.5L498.2 60.8L497.3 63.4L497.7 63.6L498.6 60.9L500.5 55.8L502.3 52.4L504.1 50.7L505.8 47.1L507.3 41.9L510.7 34.8L515.8 25.7L518.5 18.8L518.6 14.3L518.7 12ZM112.2 186.9L110.7 181.9L107.6 171.9L105.6 163.6L104.6 157.1L103.3 150.8L101.5 144.9L99.8 137.4L98.4 128.5L97.7 124L97.3 124L97.9 128.5L98.9 137.6L100.3 145.1L102 151.2L103.4 157.4L104.4 163.9L106.6 172.1L110.1 182.1L111.8 187.1ZM111.4 230.1L112.9 232.1L116.1 236.2L120.4 244.5L126 257L128.8 264.1L128.8 265.7L129.3 268L130.3 270.3L130.5 277.2L130.1 288.8L131 300.3L133.2 311.8L135 318.1L136.6 319.2L137.4 319.7L137.6 319.3L136.9 318.8L135.5 317.9L133.8 311.7L132 300.2L131.4 288.7L132 277.3L131.7 270.2L130.7 267.5L130.2 265.5L130.2 263.7L127.2 256.5L121.3 244L116.6 235.8L113.3 231.9L111.6 229.9ZM493.9 118.1L496.4 123.4L501.7 134L506 141.2L508.8 145.2L510.2 147.7L510 148.8L509.9 149.5L510.1 149.5L510.3 148.9L510.6 147.6L509.4 144.8L506.8 140.8L502.8 133.5L497.1 123.1L494.1 117.9ZM963.9 289.9L962.7 292.1L960.5 296.5L958.1 300.1L955.3 302.9L953.9 304.4L954.1 304.6L955.7 303.3L958.9 300.7L961.5 297L963.3 292.4L964.1 290.1ZM687.1 51.5L686.6 49.7L685.6 46.2L685.4 41.8L685.9 36.3L686.1 33.5L685.9 33.5L685.3 36.2L684.3 41.7L684.7 46.3L686.1 49.8L686.9 51.5ZM65.9 286.1L68.1 290.8L73.1 300.1L75.9 304.6L76.1 304.4L73.9 299.7L68.9 290.4L66.1 285.9ZM837.6 153.4L834.8 150.6L829.2 145L820.3 134.7L808.2 119.9L800.6 109.9L797.6 104.5L795.1 97.7L793.3 89.5L791.3 83.8L789.2 80.5L788.2 78.9L787.8 79.1L788.8 80.7L790.7 84L792.5 89.7L794.1 98L796.4 105L799.4 110.6L807.1 120.8L819.4 135.5L828.6 145.5L834.4 150.9L837.4 153.6ZM861.9 262.5L859.2 269L854.4 282.2L851.6 289.9L850.5 291.9L849.9 292.9L850.1 293.1L850.8 292.1L852.1 290.1L855.4 282.6L860 269.3L862.1 262.5ZM775.1 230.6L778 227.8L783.7 222.2L788.3 215.7L791.9 208.3L793.6 204.6L793.4 204.4L791.3 208L787.4 215.1L782.8 221.5L777.5 227.4L774.9 230.4ZM199.1 36L202.8 25.5L209.6 4.3L212.6 -6.5L212.4 -6.5L208.7 4L201.9 25.2L198.9 36ZM171.6 290.4L171.2 290L170.6 289.3L170 286.9L169.7 283L169.6 275.7L169.5 265.3L170 259.2L171.4 257.5L172.1 256.6L171.9 256.4L171.1 257.2L169.5 259L168.5 265.2L168.4 275.8L168.8 283L169.5 287.1L170.2 289.5L171 290.2L171.4 290.6ZM173.4 305L174.1 307.7L175.6 313.1L177.7 316.6L179.8 318.3L180.9 319.1L181.1 318.9L180.2 317.9L178.3 316.1L176.6 312.7L174.7 307.5L173.6 305ZM399.8 89.1L403.6 97.5L411.1 114.4L416.2 127.4L418.9 136.6L422.3 144.8L426.1 151.8L428.9 158.4L430.8 164.9L432.6 169.7L434.4 173L435.3 174.6L435.7 174.4L434.8 172.8L433.1 169.5L431.5 164.6L429.8 158.1L427.2 151.2L423.5 144.2L420.3 136.1L417.6 126.9L412.2 113.9L404.2 97.2L400.2 88.9ZM438.9 179L439.3 180.6L440.2 183.6L442.2 188.1L445.4 193.9L448.5 199.3L451.6 204.3L454.8 208.6L458.2 212.3L459.9 214.1L460.1 213.9L458.6 212L455.4 208.1L452.4 203.7L449.5 198.7L446.4 193.3L443 187.7L440.8 183.4L439.7 180.4L439.1 179ZM604.4 -110.1L603.7 -109.8L602 -109L598.8 -102.2L594.3 -89.1L592.4 -82.5L592.6 -82.5L595.2 -88.9L599.7 -101.8L602.5 -108.7L603.8 -109.5L604.6 -109.9ZM658.7 4L658.8 2.8L659.1 0.2L658.4 -6.2L656.6 -16.5L655.6 -23.7L655.6 -27.9L655.1 -31.5L654.1 -34.2L653.1 -39.8L652.1 -48.3L651.7 -52.5L651.3 -52.5L651.6 -48.2L652.2 -39.7L652.9 -34L653.9 -31.2L654.4 -27.8L654.4 -23.6L655.4 -16.3L657.6 -6.1L658.6 0.3L658.4 2.7L658.3 4ZM240.6 161.5L240.7 160L240.9 157L240.3 152.7L238.7 147.5L237.3 144.5L236.5 143.8L236.1 143.4L235.9 143.6L236.3 144L236.9 144.7L237.8 147.8L239.2 153L240.1 157L240.3 160L240.4 161.5ZM829.8 -94L829.6 -93.3L829.4 -91.7L830.3 -86.6L832.4 -77.8L833.7 -69.2L834.1 -60.7L835.5 -48.8L837.9 -33.5L839.5 -20.9L840.2 -10.9L840.4 -3.8L840.2 0.8L841.3 14.9L843.7 38.7L844.8 52.6L844.6 56.9L845.2 63.7L846.6 72.9L847.3 77.5L847.7 77.5L847.2 72.8L846 63.6L845.6 56.9L845.9 52.6L845.1 38.6L843 14.8L842 0.7L842.3 -3.8L842.1 -11.1L841.3 -21.1L839.6 -33.8L837 -49L835.4 -60.8L834.8 -69.3L833.3 -78L830.9 -86.7L829.9 -91.8L830.1 -93.2L830.2 -94ZM990.4 46.5L990.2 47.7L989.8 50.3L990.7 54.6L992.8 60.7L994.2 65.6L994.6 69.5L994.9 71.5L995.1 71.5L995.1 69.5L995 65.4L993.9 60.3L991.6 54.4L990.5 50.2L990.6 47.8L990.6 46.5ZM995.6 215.5L995.8 214.4L996.1 212.1L995.7 208.7L994.6 204.1L993.9 199.8L993.7 195.6L993.7 190.3L993.8 183.8L994.3 179.2L995.2 176.4L995.6 175.1L995.4 174.9L994.8 176.3L993.7 179.1L992.9 183.7L992.6 190.2L992.5 195.6L992.8 199.9L993.6 204.4L995 208.8L995.6 212.1L995.4 214.4L995.4 215.5ZM948.9 281L947.4 285.7L944.7 295.1L943.3 303.9L943.2 312L942.6 316.5L941.5 317.7L940.9 318.4L941.1 318.6L941.8 318L943.1 316.7L944 312L944.4 304.1L945.8 295.4L948.1 285.8L949.1 281ZM26.9 121L26.8 121.8L26.8 123.3L28.6 130.7L33 143.6L35.4 150L35.6 150L33.8 143.4L29.6 130.3L27.2 123.2L27.2 121.8L27.1 121ZM587.6 -31.5L587.6 -32.3L587.4 -33.7L588.6 -39.8L590.8 -50.5L591.6 -56L591.4 -56L590 -50.7L587.6 -40L586.9 -33.8L587.2 -32.2L587.4 -31.5ZM764.6 126.9L760.7 120L752.7 106.4L748.5 98.9L748.5 97.2L747.2 94.3L744.5 90.3L743 87.4L742.4 85.5L742.2 84.5L741.8 84.5L742.1 85.5L742.5 87.6L744 90.7L746.3 94.7L747.5 97.5L747.5 99.3L751.6 107.1L760 120.5L764.4 127.1ZM192.6 62L194 59L196.4 52.8L197.5 48.2L197.6 45.4L197.6 44L197.4 44L197.1 45.4L196.7 48L195.4 52.5L193.3 58.8L192.4 62ZM379.4 -89L378.9 -84.3L378.7 -74.8L378.9 -70L379.1 -70L379.6 -74.7L379.8 -84.2L379.6 -89ZM652.1 -58.5L652.2 -59.8L652.3 -62.3L651.7 -66.1L650.3 -71.1L649.2 -78.2L648.2 -87.4L647.6 -92L647.4 -92L647.5 -87.3L648.1 -78.1L649.2 -70.9L650.8 -65.9L651.7 -62.2L651.8 -59.8L651.9 -58.5ZM341.1 52.5L341.3 47.6L341.1 37.9L340.6 33L340.4 33L340.2 37.9L340.4 47.6L340.9 52.5ZM475.4 136.9L474.8 138L473.8 140.2L472.4 142L470.6 143.5L466.2 148.9L459.4 158.4L453.2 166.6L447.7 173.4L444.9 176.9L445.1 177.1L448.1 173.8L454 167.2L460.4 159.1L467.1 149.6L471.2 144L472.9 142.5L474.2 140.5L475.2 138.2L475.6 137.1ZM181.1 241.4L178.6 239.9L173.7 237L166.3 234.1L156.5 231.5L151.2 230.4L150.3 230.7L150 230.9L150 231.1L150.4 231L151.1 230.8L156.3 232.3L165.9 235.2L173.3 237.8L178.4 240.4L180.9 241.6ZM668.8 -86.5L668 -83.4L666.4 -77.2L665.2 -64.9L664.5 -46.6L665 -31.3L666.4 -19.1L667.8 -10.3L669.2 -5.1L669.8 -2.5L670.2 -2.5L669.6 -5.2L668.5 -10.4L667.4 -19.2L666.3 -31.4L666 -46.6L666.3 -64.8L667.1 -77.1L668.5 -83.3L669.2 -86.5ZM460.8 -2.4L463.9 7.4L470.1 27L474.8 39.4L477.6 44.6L480.5 50.8L483.4 58L484.8 61.6L485.2 61.4L483.9 57.8L481.3 50.5L478.6 44.1L475.9 38.9L471.4 26.5L464.6 7.1L461.2 -2.6ZM121.6 317.9L120.7 315.9L118.9 311.8L116.9 305.6L114.5 297.2L113.1 293L112.9 293L113.8 297.3L115.8 305.9L118.1 312.2L120.3 316.1L121.4 318.1ZM821.9 297L821.7 299.1L821.5 303.4L820.9 308.4L820.1 314.4L819.4 317.8L818.8 318.5L818.4 318.9L818.6 319.1L819 318.7L819.8 318L820.9 314.6L822.1 308.6L822.5 303.4L822.3 299.1L822.1 297ZM448.4 -21.1L443 -15L432.8 -2.5L427.9 3.9L428.1 4.1L433.5 -2L443.7 -14.5L448.6 -20.9ZM374.1 -26L374.7 -28.1L375.9 -32.3L376.8 -39L377.1 -48L377.1 -52.5L376.9 -52.5L376.4 -48L375.7 -39L375.1 -32.4L374.3 -28.2L373.9 -26ZM683.6 114L683.6 112.5L683.5 109.4L682.7 106L681.3 102.2L680.3 97.2L679.5 90.7L679.1 87.5L678.9 87.5L679 90.8L679.2 97.3L680.2 102.5L681.8 106.3L682.8 109.6L683.2 112.5L683.4 114ZM99.9 -110L99.2 -106.8L98 -100.3L97.3 -91.5L97.3 -80.5L97.4 -75L97.6 -75L98 -80.5L98.5 -91.5L99 -100.2L99.8 -106.7L100.1 -110Z","edge":"M139.8 317.5L139.8 317.1L139.8 316.5L139.8 315.5L139.7 314.2L139.7 312.6L139.6 310.7L139.5 308.4L139.4 305.9L139.3 303.6L139.3 301.6L139.3 299.8L139.4 298.4L139.5 297.2L139.7 296.3L139.8 295.8L139.7 295.9L139.1 296L139.4 296.2L140.2 296.9L141.4 298.1L142.8 299.8L144.5 301.9L146.4 304.4L148.7 307.4L150.7 310L152.4 312.2L153.8 314L155 315.5L155.8 316.6L156.4 317.3L156.7 317.7L157.3 317.3L157 316.9L156.6 316.1L155.8 314.9L154.9 313.3L153.7 311.3L152.2 308.9L150.5 306.2L148.4 303L146.6 300.3L144.9 298.1L143.5 296.3L142.2 294.9L141 293.9L139.8 293.4L138.2 293.6L137.3 294.7L137 295.7L136.8 296.9L136.8 298.2L136.8 299.8L136.9 301.7L137.1 303.7L137.4 306.1L137.7 308.6L138.1 310.8L138.4 312.8L138.6 314.4L138.8 315.6L139 316.6L139.1 317.2L139.2 317.5ZM185.3 317.4L185.2 317L185 316.3L184.6 315.2L184.2 313.8L183.6 312L182.9 309.9L182.1 307.4L181.2 304.6L180.4 301.8L179.8 299.1L179.2 296.3L178.7 293.6L178.4 291L178.2 288.4L178 285.8L178 283.2L178.2 280.9L178.5 278.9L179.1 277.1L179.8 275.5L180.7 274.2L181.7 273.1L182.9 272.1L184.4 271.3L185.9 270.7L187.3 270.2L188.6 269.8L189.8 269.7L190.9 269.6L192 269.7L193 270L194 270.5L195.2 270.9L196.3 271.3L197.3 271.6L198.3 271.9L199.3 272L200.2 272.2L201.1 272.2L201.9 272.2L203 272.1L204.3 271.9L205.8 271.6L207.5 271.2L209.5 270.7L211.7 270.2L214.1 269.5L216.8 268.7L219.2 268L221.4 267.3L223.3 266.6L225 266L226.4 265.4L227.5 264.9L228.4 264.4L229.1 263.9L229.6 263.5L230.1 263.1L230.4 262.9L230.7 262.6L231 262.5L231.1 262.3L231.2 262.3L230.8 261.7L230.7 261.8L230.6 261.9L230.3 262L230 262.2L229.6 262.5L229.1 262.8L228.6 263.2L227.9 263.6L227.1 264L226 264.4L224.6 264.9L222.9 265.4L221 266L218.8 266.5L216.4 267.1L213.7 267.7L211.2 268.2L209 268.7L207.1 269.1L205.4 269.4L203.9 269.6L202.7 269.7L201.8 269.8L201.2 269.8L200.5 269.7L199.7 269.6L198.9 269.4L198 269.1L197.1 268.8L196.1 268.5L195.1 268L193.9 267.5L192.5 267.1L191.1 266.9L189.6 266.9L188 267.1L186.5 267.5L184.9 268.1L183.2 268.8L181.4 269.8L179.8 271L178.5 272.5L177.4 274.2L176.5 276.2L175.9 278.3L175.6 280.6L175.4 283.2L175.5 285.9L175.8 288.6L176.1 291.3L176.6 294L177.2 296.8L177.9 299.5L178.8 302.3L179.8 305.1L180.9 307.9L181.8 310.3L182.6 312.4L183.3 314.1L183.9 315.5L184.3 316.6L184.5 317.3L184.7 317.6ZM270.3 35.1L270.9 33.8L272.1 31.2L273.8 27.3L276.1 22L279 15.4L282.5 7.6L286.6 -1.6L291.2 -12.1L295.4 -21.5L299.1 -29.8L302.4 -37L305.3 -43.1L307.7 -48L309.7 -51.8L311.3 -54.5L312.4 -56L313.5 -57.4L314.6 -58.6L315.6 -59.6L316.6 -60.4L317.5 -61.1L318.3 -61.5L319 -61.8L319.6 -62L320.4 -62L321.2 -62L322 -61.9L322.8 -61.7L323.8 -61.3L324.7 -60.9L325.7 -60.4L326.8 -59.7L327.8 -59.1L328.6 -58.4L329.3 -57.8L329.9 -57.2L330.4 -56.5L330.8 -55.9L331.1 -55.3L331.3 -54.7L331.5 -53.9L331.7 -52.9L331.8 -51.7L331.9 -50.3L332 -48.7L332.1 -47L332.1 -45.1L332.1 -43L332.1 -40.7L331.9 -38.1L331.6 -35.4L331.3 -32.3L330.8 -29.1L330.3 -25.6L329.6 -21.9L328.9 -18L328.3 -14.4L327.9 -11.3L327.6 -8.5L327.5 -6.1L327.5 -4L327.7 -2.4L328 -1L328.6 -0L329.2 0.7L330 1.2L330.9 1.4L331.9 1.3L332.7 0.8L333.5 0.2L334.2 -0.6L334.9 -1.6L335.5 -2.3L336 -2.8L336.4 -3L336.6 -3.1L336.8 -3.1L336.9 -3.1L337.1 -2.9L337.3 -2.5L337.6 -1.9L337.9 -0.9L338.2 0.3L338.5 1.7L338.7 3.3L338.9 5.2L339.1 7.4L339.3 9.7L339.4 11.9L339.4 14L339.3 15.8L339.2 17.6L339.1 19.1L338.9 20.5L338.6 21.8L338.2 22.9L337.9 24.2L337.6 25.6L337.4 27.1L337.3 28.7L337.2 30.4L337.2 32.3L337.2 34.2L337.3 36.3L337.4 38.1L337.5 39.6L337.5 40.9L337.6 42L337.6 42.7L337.6 43.3L337.7 43.5L338.3 43.5L338.3 43.2L338.3 42.7L338.3 41.9L338.3 40.9L338.3 39.6L338.3 38.1L338.2 36.3L338.2 34.2L338.2 32.3L338.3 30.5L338.4 28.8L338.6 27.2L338.8 25.8L339.1 24.4L339.4 23.2L339.8 22.1L340.1 20.8L340.4 19.3L340.6 17.7L340.8 15.9L340.9 14L340.9 11.9L340.9 9.7L340.8 7.3L340.6 5.1L340.5 3.1L340.3 1.4L340 -0.1L339.7 -1.4L339.4 -2.5L339 -3.4L338.5 -4.1L337.9 -4.7L337.1 -5L336.3 -5.1L335.5 -4.8L334.7 -4.3L334 -3.7L333.3 -2.8L332.6 -1.9L332 -1.3L331.5 -0.9L331.2 -0.7L331 -0.7L330.9 -0.7L330.6 -0.9L330.3 -1.2L330 -1.8L329.8 -2.7L329.7 -4.1L329.7 -6L329.9 -8.3L330.2 -11L330.7 -14.1L331.3 -17.6L332.1 -21.5L332.8 -25.2L333.4 -28.7L333.9 -32L334.3 -35.1L334.6 -37.9L334.8 -40.5L334.9 -42.9L334.9 -45.1L334.8 -47.1L334.8 -48.9L334.7 -50.5L334.6 -52L334.4 -53.3L334.2 -54.5L334 -55.5L333.7 -56.4L333.2 -57.3L332.7 -58.2L332 -59L331.3 -59.8L330.4 -60.6L329.4 -61.3L328.3 -62.1L327.1 -62.8L326 -63.4L324.8 -63.9L323.7 -64.3L322.5 -64.6L321.4 -64.8L320.3 -64.8L319.2 -64.7L318.2 -64.5L317 -64L315.9 -63.4L314.8 -62.6L313.7 -61.6L312.6 -60.5L311.4 -59.1L310.3 -57.6L309 -55.9L307.4 -53.1L305.4 -49.2L302.9 -44.2L300.1 -38L296.9 -30.8L293.3 -22.4L289.3 -12.9L284.9 -2.3L281.1 7L277.8 14.9L275.1 21.6L272.9 26.9L271.3 30.9L270.2 33.5L269.7 34.9ZM387.2 235.8L386.8 236.3L386 237.3L384.7 238.8L383.1 240.8L381 243.4L378.5 246.4L375.6 249.9L372.2 254L369.3 257.6L366.9 260.7L364.8 263.4L363.2 265.6L362 267.4L361.3 268.7L360.9 269.7L361.1 270.5L361.6 270.9L362.3 271.1L363.1 271L363.9 270.8L365 270.5L366.1 270L367.5 269.4L369 268.6L370.8 267.5L372.7 266.1L374.9 264.4L377.3 262.3L379.9 259.9L382.6 257.2L385.6 254.2L388.8 250.8L391.7 247.9L394.2 245.4L396.4 243.4L398.2 241.8L399.7 240.7L400.7 240.1L401.3 239.9L401.4 240L401.8 240.3L402.2 240.7L402.7 241.3L403.3 242L403.8 242.9L404.4 244L405 245.2L405.6 246.5L406.2 247.8L406.9 248.9L407.5 249.9L408.2 250.7L408.9 251.4L409.7 251.9L410.4 252.2L411.1 252.4L411.6 252.6L412.3 253L413.1 253.6L414 254.4L415 255.4L416.1 256.5L417.2 257.8L418.5 259.3L419.6 260.6L420.7 261.8L421.6 262.8L422.4 263.6L423.2 264.2L423.9 264.6L424.6 264.9L425.2 264.9L425.7 264.8L426.2 264.7L426.6 264.5L427 264.2L427.3 263.9L427.6 263.5L427.8 263L428 262.4L427.9 261.4L427.6 260.3L427.2 258.9L426.6 257.1L425.7 255L424.8 252.6L423.6 249.9L422.2 246.8L421 244L419.9 241.3L418.9 238.9L418.1 236.7L417.4 234.6L416.8 232.8L416.4 231.2L416.1 229.8L415.9 228.6L415.9 227.4L416 226.3L416.1 225.3L416.4 224.4L416.8 223.6L417.3 222.8L417.9 222.1L418.6 221.4L419.3 220.7L420.1 220.1L421 219.6L422 219.1L423 218.6L424 218.2L425.2 217.8L426.4 217.4L427.4 216.8L428.2 216.1L428.9 215.3L429.5 214.5L429.8 213.5L429.9 212.5L429.8 211.5L429.8 210.8L429.9 210.1L429.9 209.4L430 208.9L430.2 208.4L430.4 207.9L430.6 207.6L430.8 207.3L431 207.1L431.4 206.9L431.8 206.7L432.5 206.5L433.2 206.4L434.1 206.4L435.1 206.4L436.2 206.4L437.3 206.6L438.4 206.8L439.4 207.1L440.5 207.5L441.5 208L442.5 208.6L443.5 209.3L444.5 210L445.6 211.2L446.8 212.7L448.3 214.8L449.8 217.2L451.5 220L453.4 223.3L455.3 227L457.4 231.1L459.4 235.2L461.3 239.2L463 243.2L464.6 247.1L466.1 250.9L467.5 254.8L468.7 258.5L469.8 262.3L470.9 265.6L471.8 268.4L472.7 270.7L473.6 272.6L474.4 274.1L475.2 275.2L476.5 275.9L477.8 275.7L478.5 275.3L479.3 274.7L479.9 273.9L480.6 273.1L481.3 272.1L481.9 270.9L482.6 269.6L483.3 268.1L484 266.9L484.7 265.8L485.4 264.9L486.1 264.1L486.9 263.4L487.6 262.8L488.4 262.4L489.2 262.1L490.1 261.8L490.9 261.5L491.6 261.4L492.4 261.2L493.1 261.1L493.7 261.1L494.3 261.1L494.6 261.1L495.8 261.7L497.8 263.1L500.7 265.3L504.2 268.1L508.5 271.7L513.6 276L519.3 281L525.8 286.6L531.7 291.7L537 296.1L541.6 299.9L545.6 303L548.9 305.6L551.7 307.4L553.9 308.7L555.5 309.3L556.9 309.8L558.1 310.1L559.3 310.3L560.3 310.4L561.3 310.3L562.2 310L563.1 309.5L563.7 308.5L563.9 307.4L563.7 306.3L563.3 305.1L562.7 303.8L561.9 302.4L560.8 300.8L559.6 299.1L558.2 297.3L556.7 295.1L555.1 292.5L553.5 289.5L551.7 286.1L549.9 282.3L548 278.1L546 273.5L544 268.5L542.1 263.7L540.3 259.2L538.8 254.9L537.4 250.9L536.1 247L535 243.4L534.1 240L533.4 236.9L532.7 233.9L532.2 231L531.8 228.4L531.5 225.8L531.3 223.5L531.2 221.3L531.2 219.3L531.3 217.4L531.5 215.7L531.6 214.2L531.8 212.9L532.1 211.9L532.3 211.1L532.5 210.5L532.7 210.2L532.9 210.1L533.2 209.9L533.5 209.7L533.7 209.7L534 209.6L534.2 209.6L534.5 209.6L534.8 209.6L534.8 209.6L535.4 210.1L536.5 211.1L537.9 212.7L539.7 214.8L541.9 217.4L544.4 220.5L547.2 224.1L550.4 228.3L553.5 232L556.3 235.2L559 238L561.5 240.3L563.8 242.1L566 243.6L568 244.5L569.7 245L571.8 245.9L574.5 247.4L577.7 249.5L581.5 252.1L585.8 255.3L590.6 259L596 263.3L601.8 268.1L607.2 272.5L612 276.4L616.3 279.9L620 282.8L623.2 285.3L625.9 287.3L628 288.9L629.6 289.9L631.2 290.9L632.7 291.9L634.3 292.8L635.9 293.6L637.4 294.3L638.9 295L640.5 295.7L642 296.2L643.4 296.7L644.7 297.1L645.8 297.3L646.8 297.5L647.7 297.6L648.5 297.6L649.2 297.5L649.8 297.3L650.2 297L650.6 296.8L650.9 296.5L651.2 296.2L651.5 295.8L651.6 295.4L651.7 295L651.6 294.4L651.2 293.5L650.5 292.4L649.3 290.9L647.8 289L646 286.7L643.8 284L641.2 280.9L638.2 277.4L635.4 273.8L632.5 270.2L629.8 266.5L627.1 262.8L624.4 258.9L621.9 255L619.3 251L616.9 247L614.7 243.5L612.9 240.4L611.4 237.9L610.1 235.9L609.2 234.3L608.6 233.3L608.3 232.8L607.7 233.2L608 233.7L608.6 234.7L609.5 236.2L610.7 238.3L612.2 240.8L614.1 243.9L616.2 247.4L618.6 251.5L621.1 255.5L623.6 259.5L626.2 263.3L628.9 267.1L631.7 270.9L634.5 274.5L637.3 278.1L640.3 281.6L642.8 284.8L645 287.5L646.8 289.8L648.3 291.7L649.3 293.2L650.1 294.2L650.4 294.8L650.3 294.8L650.3 295L650.2 295.2L650.1 295.3L650 295.5L649.8 295.7L649.5 295.9L649.2 296L648.8 296.2L648.4 296.2L647.8 296.2L647 296.1L646.1 296L645 295.7L643.8 295.3L642.5 294.8L641 294.3L639.5 293.7L638 293L636.5 292.2L635 291.4L633.5 290.6L632 289.6L630.5 288.6L628.9 287.6L626.8 286L624.2 284L621.1 281.5L617.4 278.5L613.1 275.1L608.3 271.1L603 266.7L597.2 261.8L591.8 257.5L587 253.7L582.7 250.4L578.9 247.8L575.6 245.6L572.8 244L570.5 243L568.8 242.5L567.1 241.7L565.1 240.4L562.9 238.6L560.6 236.4L558 233.7L555.2 230.5L552.2 226.9L549.1 222.7L546.2 219.1L543.7 215.9L541.6 213.3L539.7 211.1L538.3 209.5L537.1 208.3L536.1 207.5L535.3 207.3L534.7 207.2L534.1 207.1L533.6 207.2L533 207.3L532.5 207.5L531.9 207.8L531.5 208.1L530.9 208.6L530.4 209.3L530 210.2L529.7 211.3L529.4 212.5L529.2 213.8L529 215.4L528.8 217.2L528.7 219.2L528.7 221.3L528.8 223.6L529 226.1L529.3 228.7L529.7 231.5L530.2 234.4L530.9 237.4L531.6 240.7L532.5 244.1L533.6 247.8L534.9 251.7L536.3 255.8L537.8 260.1L539.6 264.7L541.5 269.5L543.5 274.5L545.5 279.2L547.4 283.4L549.3 287.3L551 290.7L552.7 293.8L554.3 296.5L555.9 298.9L557.4 300.8L558.5 302.4L559.5 303.9L560.2 305.1L560.8 306.2L561 307L561.1 307.4L561.1 307.5L561.1 307.5L561 307.5L560.8 307.6L560.3 307.6L559.6 307.6L558.7 307.4L557.7 307.1L556.4 306.7L555.2 306.2L553.2 305.1L550.6 303.3L547.3 300.8L543.3 297.7L538.7 294L533.5 289.6L527.7 284.5L521.2 278.9L515.4 273.9L510.3 269.6L506 266L502.4 263.1L499.5 260.9L497.2 259.4L495.6 258.5L494.5 258.3L493.7 258.3L492.8 258.4L491.9 258.5L491 258.7L490.1 258.9L489.2 259.2L488.2 259.5L487.2 260L486.1 260.5L485.1 261.3L484.2 262.2L483.3 263.2L482.4 264.3L481.6 265.5L480.9 266.9L480.2 268.4L479.6 269.6L479 270.6L478.4 271.5L477.9 272.2L477.4 272.7L477 273L476.7 273.2L477 273.3L477.1 273.2L476.6 272.6L476 271.4L475.2 269.7L474.3 267.5L473.4 264.7L472.3 261.5L471.2 257.7L469.9 253.9L468.5 250L467 246.1L465.4 242.2L463.6 238.1L461.7 234.1L459.7 230L457.5 225.9L455.5 222.1L453.6 218.8L451.9 215.9L450.3 213.4L448.8 211.3L447.4 209.6L446.1 208.3L444.9 207.4L443.8 206.6L442.6 206L441.4 205.4L440.2 204.9L439 204.6L437.7 204.3L436.5 204.1L435.2 204.1L434 204.1L433 204.1L432 204.3L431.2 204.5L430.4 204.8L429.7 205.2L429.1 205.8L428.6 206.4L428.3 207L428 207.6L427.8 208.3L427.7 209.1L427.6 209.9L427.6 210.7L427.6 211.6L427.7 212.4L427.6 213L427.4 213.5L427.1 214L426.7 214.5L426.1 215L425.4 215.4L424.5 215.8L423.3 216.2L422.1 216.6L421 217.1L419.9 217.7L418.9 218.3L418 219L417.1 219.8L416.3 220.6L415.5 221.5L414.9 222.5L414.4 223.6L414.1 224.8L413.9 226.1L413.8 227.4L413.9 228.8L414.1 230.2L414.4 231.7L414.9 233.4L415.5 235.3L416.2 237.3L417 239.6L418 242.1L419.2 244.7L420.4 247.6L421.8 250.7L423 253.4L424 255.8L424.8 257.8L425.4 259.5L425.9 260.8L426.1 261.8L426.1 262.3L426.1 262.3L426 262.6L425.9 262.7L425.8 262.9L425.6 262.9L425.5 263L425.3 263.1L425.1 263.1L425 263.1L424.7 263L424.3 262.7L423.6 262.2L422.8 261.5L421.9 260.6L420.9 259.5L419.8 258.2L418.5 256.7L417.3 255.3L416.2 254.2L415.2 253.2L414.2 252.3L413.3 251.6L412.4 251.1L411.6 250.8L410.9 250.6L410.5 250.4L410 250.1L409.4 249.6L408.8 248.9L408.2 248L407.6 247L407 245.8L406.4 244.5L405.8 243.2L405.2 242.1L404.6 241.1L404 240.3L403.4 239.6L402.7 239.1L402.1 238.7L401.2 238.4L400.1 238.7L398.8 239.5L397.3 240.7L395.4 242.3L393.2 244.4L390.7 246.9L387.8 249.8L384.7 253.2L381.7 256.3L379 259L376.4 261.4L374.1 263.4L372 265.2L370.1 266.6L368.5 267.6L367 268.4L365.7 269L364.6 269.4L363.6 269.7L362.9 269.9L362.4 270L362.1 269.9L362 269.9L362 269.9L362.2 269.2L362.9 268L364.1 266.2L365.6 264L367.6 261.3L370.1 258.2L372.9 254.6L376.2 250.5L379.1 246.9L381.6 243.9L383.7 241.3L385.3 239.3L386.5 237.8L387.4 236.7L387.8 236.2ZM629.8 54.8L629.7 54.7L629.6 54.6L629.4 54.3L629.2 54.1L628.8 53.7L628.5 53.3L628.1 52.8L627.6 52.2L627.3 51.5L627 50.6L626.8 49.4L626.7 48L626.7 46.4L626.8 44.5L627 42.5L627.3 40.2L627.7 37.4L628.2 34.2L628.8 30.6L629.6 26.5L630.4 21.9L631.3 16.9L632.4 11.4L633.5 5.5L634.6 0.2L635.6 -4.6L636.5 -8.7L637.3 -12.3L638.1 -15.2L638.8 -17.6L639.5 -19.3L640 -20.5L640.6 -21.4L641.1 -22L641.5 -22.4L641.8 -22.6L641.9 -22.6L642.1 -22.6L642.4 -22.4L642.9 -22L643.4 -21.4L643.9 -20.9L644.3 -20.3L644.7 -19.6L645.1 -18.9L645.5 -18.2L645.8 -17.4L646.1 -16.7L646.5 -15.4L646.9 -13.6L647.5 -11.3L648.1 -8.5L648.8 -5.3L649.6 -1.6L650.4 2.6L651.4 7.3L652.3 11.7L653.3 15.8L654.3 19.7L655.3 23.2L656.2 26.5L657.2 29.5L658.2 32.2L659.2 34.7L660.1 36.8L660.8 38.6L661.4 40.1L661.9 41.3L662.3 42.2L662.5 42.8L662.7 43.1L663.3 42.9L663.2 42.6L663 42L662.7 41L662.2 39.8L661.7 38.3L661 36.4L660.2 34.3L659.3 31.8L658.5 29.1L657.6 26.1L656.8 22.8L655.9 19.3L655.1 15.4L654.3 11.3L653.5 6.9L652.7 2.2L651.9 -2L651.2 -5.8L650.6 -9.1L650 -11.9L649.5 -14.2L649.1 -16.1L648.7 -17.5L648.4 -18.4L648 -19.3L647.6 -20.2L647.1 -21L646.6 -21.8L646 -22.6L645.4 -23.3L644.8 -24L644 -24.7L643 -25.2L641.9 -25.4L640.8 -25.2L639.9 -24.6L639 -23.9L638.3 -22.9L637.6 -21.8L636.9 -20.4L636.2 -18.5L635.4 -16L634.6 -12.9L633.8 -9.3L632.9 -5.1L632 -0.3L631 5.1L630.1 11L629.2 16.5L628.4 21.6L627.7 26.2L627.1 30.3L626.6 34L626.2 37.2L625.9 40L625.7 42.3L625.6 44.5L625.6 46.4L625.7 48.1L625.8 49.5L626.1 50.8L626.4 51.9L626.9 52.7L627.4 53.3L627.9 53.8L628.3 54.2L628.6 54.5L628.9 54.8L629 55L629.2 55.2L629.2 55.2ZM692.3 37.5L692.4 37.1L692.5 36.1L692.7 34.7L693 32.9L693.3 30.5L693.7 27.7L694.1 24.5L694.6 20.7L695.1 17.1L695.4 13.7L695.7 10.5L695.8 7.4L696 4.5L696 1.7L695.9 -0.9L695.8 -3.2L695.9 -4L694.7 -3.5L694.8 -3.3L695.8 -1.8L697.1 0.9L698.9 4.6L700.9 9.3L703.4 15.1L705.6 20.1L707.4 24.4L709 28L710.3 30.8L711.2 33L711.9 34.4L712.2 35.1L712.8 34.9L712.6 34.1L712 32.7L711.3 30.4L710.2 27.5L708.9 23.8L707.3 19.4L705.4 14.2L703.2 8.4L701.3 3.5L699.6 -0.3L698.2 -3.1L697 -5L695.5 -6.2L693.3 -5.1L693 -3.2L693.2 -0.8L693.3 1.8L693.3 4.4L693.3 7.3L693.2 10.3L693.1 13.6L692.9 17L692.7 20.5L692.5 24.3L692.3 27.6L692.1 30.4L691.9 32.8L691.8 34.6L691.7 36.1L691.7 37L691.7 37.5ZM787.2 258.2L787.6 258.7L788.4 259.6L789.6 261L791.2 262.8L793.2 265.1L795.5 267.8L798.3 271L801.5 274.6L804.3 277.9L806.8 281L808.9 283.8L810.6 286.4L811.9 288.8L812.8 290.9L813.4 292.8L813.6 294.5L813.8 296.4L813.9 298.3L813.9 300.2L813.9 302.1L813.9 304.1L813.8 306.1L813.6 308.1L813.4 310.2L813.2 312L813.1 313.6L812.9 314.9L812.8 315.9L812.7 316.7L812.7 317.2L812.7 317.4L813.3 317.6L813.4 317.3L813.5 316.8L813.7 316L813.9 315L814.1 313.7L814.4 312.2L814.8 310.4L815.2 308.3L815.5 306.3L815.8 304.2L816 302.2L816.1 300.2L816.2 298.2L816.2 296.3L816.1 294.3L815.9 292.3L815.3 290L814.3 287.6L812.9 285L811.1 282.2L808.9 279.3L806.3 276.2L803.3 272.9L799.9 269.5L796.9 266.6L794.3 264L792.1 261.9L790.4 260.3L789.1 259L788.2 258.2L787.8 257.8Z"}};

    /* ===== BẢN THỬ C: CẬN CẢNH HAI MẮT THEO ẢNH NHÂN VẬT (27/11 tối) =====
       Clair 27/11: có ảnh nhân vật rồi thì vẽ lại cận cảnh thành HAI mắt, dải cắt ngang trang như khung manga zoom vào mắt,
       chỉ có nét sáng, không tô màu. Leon nét xám thép, Luke nét xanh băng. Dáng mắt theo ảnh đã duyệt (anh-tham-khao/leon-rieng,
       luke-rieng-sach): Leon mắt hẹp, mí nặng, lông mày thấp gần như thẳng, tóc đen rối phủ lệch che một mắt; Luke mắt dịu hơn,
       đuôi hơi trĩu, mày cong nhẹ, tóc nâu rối, một lọn rủ giữa hai mắt.
       Nhịp giữ như bản B: Leon hờ hững → 0,95 xích bung: mí bật mở, vòng mắt xích trong mống mắt quay vụt rồi khoá, xích quất sau dải
       → sụp lại hờ hững. Luke mở → 0,9 loé xanh băng, đồng tử co, vòng sóng → 1,35 chấm đỏ + bốn góc ngắm, mí híp → khép.
       Tóc: lọn có viền nét sáng, lòng lọn là màu nền dải (chỉ để che nét mắt phía sau, không phải tô màu tóc). Lọn nào đi qua mắt
       đều né giữa mống mắt để chỗ loé luôn thấy. Kinds: leon-eye2 / leon-eye2-trong (không mái), luke-eye2 / luke-eye2-trong,
       leon-eye2-strike, luke-eye2-sense. Toạ độ: viewBox 1000×320, mắt "cục bộ" có khoé trong ở x=0, đuôi mắt ở x=330. */
    var M2_N = 0;
    var M2 = {
      leon: { line: '#C3D0DC', hi: '#F1F6FA', hair: '#8E99A4', hairT: '#C9D3DC', bg0: '#030508', bg1: '#070b10', occ: '#05080c', tilt: 1, flash: 0.95,
        io: 100, ox: 210, pi: 120, ph: 92, ld: 38, oy: 8, ir: 54, iy: 4, by: -150, bx: [-40, 40, 150, 232], arch: 2, bth: 14, btail: 2, flick: [30, 8],
        // lọn tóc [x gốc, độ rộng gốc, x ngọn, y ngọn, độ cong]: lớp sau (lọn dài đi qua mắt) trước, lớp mái phía trước sau.
        // Ngôi lệch ở x≈430, tóc hất sang phải và phủ mắt phải nhiều hơn (như ảnh).
        // đồ theo ảnh leon-rieng (đã xoay cho hai mắt nằm ngang, mắt trùng dải): ngôi lệch, trán hở một mảng lớn trên mắt trái,
        // tóc bên phải rủ dài che gần hết mắt phải (chừa một ô quanh mắt để chỗ loé vẫn thấy), bên trái phủ thái dương.
        // sil = viền khối tóc [x, y, 1 = góc nhọn]; strands = nét tóc trong khối; locks = lọn rời vắt qua mặt.
        sil: [
          [[-80, -170], [334, -170, 1], [336, -110], [306, -58], [286, 20], [292, 112, 1], [262, 62], [216, 72], [198, 180], [192, 340, 1], [-80, 340, 1]],
          [[494, -170, 1], [497, -110], [504, 20], [516, 140], [470, 292, 1], [540, 228], [546, 302, 1], [580, 222], [602, 304, 1], [630, 226], [648, 140], [690, 150, 1], [700, 70], [745, 44], [796, 62], [818, 170], [810, 322, 1], [852, 246], [930, 336, 1], [1080, 340, 1], [1080, -170, 1]]
        ],
        strands: [
          [60, -150, 50, 0, 40, 150, 20, 330, 3], [150, -150, 150, 0, 130, 150, 100, 330, 3], [220, -150, 215, -20, 200, 120, 190, 300, 3], [282, -150, 272, -60, 266, 0, 274, 60, 2.5],
          [560, -150, 560, 0, 555, 150, 545, 300, 3], [620, -150, 625, 0, 615, 160, 600, 300, 3], [662, -150, 668, -20, 662, 80, 668, 130, 2.5], [860, -150, 870, 0, 860, 160, 840, 320, 3], [940, -150, 960, 0, 960, 160, 945, 330, 3],
          [760, -100, 830, -30, 900, 40, 962, 92, 2], [700, -62, 780, 0, 860, 60, 922, 142, 2]
        ],
        locks: [
          [300, -150, 332, 0, 392, 140, 470, 250, 34, 0], [262, -100, 290, 40, 318, 160, 340, 250, 14, 0], [330, -112, 360, 20, 400, 110, 440, 180, 14, 0],
          [692, -140, 692, 20, 680, 150, 660, 292, 20, 0], [782, -150, 786, 20, 780, 150, 768, 300, 24, 0]
        ] },
      luke: { line: '#8FD6E6', hi: '#E6FAFF', hair: '#5FA6B6', hairT: '#9ADCEA', bg0: '#01080d', bg1: '#020d14', occ: '#010a10', tilt: -1, flash: 0.9,
        io: 118, ox: 236, pi: 110, ph: 98, ld: 44, oy: 14, ir: 56, iy: 4, by: -136, bx: [-14, 60, 150, 220], arch: 10, bth: 11, btail: 8, flick: [24, 10],
        // tóc rối nhẹ (Clair 27/11: bản lọn đều như răng lược nhìn kì): lọn ngắn dài so le, hơi gợn sóng, ngọn hất nhiều hướng, lọn chéo đè nhau;
        // một lọn rủ giữa hai mắt (như ảnh). Phần tử thứ 6 = độ gợn.
        // đồ theo ảnh luke-rieng-sach: mái chữ M — hai vòm hở trán trên hai mắt (vòm trái rộng hơn), một chùm rủ giữa hai mắt xuống sống mũi,
        // hai bên phủ thái dương dài qua đuôi mắt.
        sil: [
          [[-80, -170, 1], [1080, -170, 1], [1080, 340, 1], [902, 336, 1], [880, 296], [862, 240, 1], [840, 192], [808, 138], [778, 80], [738, 20], [700, -40], [652, -64, 1], [628, -20], [614, 30], [604, 92], [602, 150],
           [640, 238, 1], [578, 222], [560, 282, 1], [532, 230], [500, 292, 1], [470, 232], [440, 200], [420, 246, 1], [404, 198], [384, 148], [364, 80], [350, 20], [334, -62], [304, -110, 1], [286, -100], [240, -30], [206, 40], [172, 120], [150, 190], [126, 250], [106, 296, 1], [60, 336, 1], [-80, 340, 1]]
        ],
        strands: [
          [300, -150, 250, -80, 200, 0, 160, 140, 3], [250, -150, 190, -60, 130, 60, 100, 260, 3], [380, -150, 360, -60, 350, 40, 370, 140, 3], [100, -150, 80, 0, 60, 150, 30, 320, 3],
          [470, -150, 460, 0, 470, 140, 495, 280, 3], [520, -150, 530, 0, 515, 150, 535, 270, 3], [450, -130, 470, 40, 500, 150, 550, 290, 2.5], [560, -130, 520, 20, 470, 140, 440, 230, 2.5],
          [640, -150, 630, -60, 615, 40, 600, 150, 3], [700, -150, 730, -60, 780, 40, 830, 180, 3], [780, -150, 820, -40, 860, 100, 880, 300, 3], [880, -150, 920, 0, 950, 150, 960, 320, 3]
        ],
        locks: [
          [215, -40, 225, 40, 240, 120, 246, 165, 12, 0], [380, -40, 395, 80, 410, 180, 425, 240, 14, 0], [690, -60, 694, 20, 700, 80, 700, 140, 16, 0], [740, -20, 760, 40, 785, 100, 800, 150, 14, 0]
        ] }
    };
    var M2IO = 78; // khoảng từ giữa mặt tới khoé trong, đặt theo từng nhân vật lúc vẽ
    function m2Q(s, x, y) { return [500 + s * (M2IO + x), 200 + y]; }
    function m2P(s, x, y) { var q = m2Q(s, x, y); return P(q[0], q[1]); }
    function m2Build(who, hair) {
      var cf = M2[who], id = 'm2' + (++M2_N), sv = document.createElementNS(SVGNS, 'svg');
      sv.setAttribute('viewBox', '60 -110 880 430'); sv.setAttribute('preserveAspectRatio', 'xMidYMid meet'); sv.setAttribute('aria-hidden', 'true');
      sv.style.cssText = 'position:fixed;left:0;width:100%;pointer-events:none;z-index:4;overflow:visible';
      var sp = ''; for (var k = 0; k < 16; k++) sp += '<rect class="sp" height="' + (1 + k % 2) + '" y="' + (-100 + k * 26) + '"/>';
      var ch = ''; if (who === 'leon') for (var c = 0; c < 2; c++) { ch += '<g class="ch">'; for (var n = 0; n < 44; n++) ch += '<ellipse/>'; ch += '</g>'; }
      var eye = function (i) {
        var inner = '';
        if (who === 'leon') { inner = '<g class="lk" stroke="' + cf.hi + '" stroke-width="1.5">'; for (var a = 0; a < 12; a++) inner += '<ellipse/>'; inner += '</g>'; }
        else {
          inner = '<g class="stri" stroke="' + cf.hi + '" stroke-width="1" opacity=".2">';
          for (var b = 0; b < 30; b++) { var an = b / 30 * 6.283, r0 = cf.ir * (0.34 + (b % 3) * 0.04), r1 = cf.ir * (0.78 + (b % 5) * 0.04); inner += '<line x1="' + (Math.cos(an) * r0).toFixed(1) + '" y1="' + (Math.sin(an) * r0).toFixed(1) + '" x2="' + (Math.cos(an) * r1).toFixed(1) + '" y2="' + (Math.sin(an) * r1).toFixed(1) + '"/>'; }
          inner += '</g><g class="rings" stroke="' + cf.hi + '"><circle/><circle/><circle/></g>' +
            '<path class="cross" stroke="' + cf.hi + '" stroke-width="1.1"/>' +
            '<g class="red" opacity="0"><circle r="8" stroke="#ff6b78" stroke-width="2.6"/><circle r="2.4" fill="#ff6b78" stroke="none"/><path class="ret" stroke="#ff8a96" stroke-width="2.6"/></g>';
        }
        var tk = ''; if (who === 'luke') { for (var m = 0; m < 48; m++) { var a2 = m / 48 * 6.283, rr = m % 4 ? cf.ir + 12 : cf.ir + 7; tk += '<line x1="' + (Math.cos(a2) * rr).toFixed(1) + '" y1="' + (Math.sin(a2) * rr).toFixed(1) + '" x2="' + (Math.cos(a2) * (cf.ir + 16)).toFixed(1) + '" y2="' + (Math.sin(a2) * (cf.ir + 16)).toFixed(1) + '"/>'; } }
        return '<g class="eye e' + i + '">' +
          '<clipPath id="' + id + 'c' + i + '"><path class="clipp"/></clipPath>' +
          (who === 'luke' ? '<g class="tick" stroke="' + cf.line + '" stroke-width="1.2" opacity="0">' + tk + '</g>' : '<g class="arcs" stroke="' + cf.line + '" stroke-width="1.3" opacity="0"><path/><path/><path/></g>') +
          '<g clip-path="url(#' + id + 'c' + i + ')">' +
            '<circle class="iglow" stroke="' + cf.line + '" stroke-width="14" opacity="0" filter="url(#' + id + 'f)"/>' +
            '<circle class="ib" stroke="' + cf.hi + '" stroke-width="2.6"/>' +
            '<circle class="ib2" stroke="' + cf.line + '" stroke-width="1.1"' + (who === 'luke' ? ' stroke-dasharray="3 6"' : '') + '/>' +
            inner +
            (who === 'leon' ? '<circle class="pup" stroke="' + cf.hi + '" stroke-width="2.2"/><circle class="pdot" r="2.6" fill="' + cf.hi + '" stroke="none"/>' : '<ellipse class="pup" stroke="' + cf.hi + '" stroke-width="2.2"/>') +
            '<path class="glint" fill="#ffffff" stroke="none" opacity="0"/>' +
            '<circle class="hl" stroke="#ffffff" stroke-width="1.5" opacity=".8"/>' +
          '</g>' +
          '<path class="crease" stroke="' + cf.line + '" stroke-width="1.3"/>' +
          '<path class="low" stroke="' + cf.line + '" stroke-width="1.6"/>' +
          '<g class="lowl" stroke="' + cf.line + '" stroke-width="1.1"/>' +
          '<path class="lid2" stroke="' + cf.hi + '" stroke-width="1.5"/>' +
          '<g class="hatch" stroke="' + cf.hi + '" stroke-width="1.1"/>' +
          '<path class="lid" stroke="' + cf.hi + '" stroke-width="3"/>' +
          '<g class="lash" stroke="' + cf.hi + '"/>' +
          '<g class="brow" stroke="' + cf.hi + '"/>' +
          (who === 'luke' ? '<path class="star" fill="#ffffff" stroke="none" opacity="0"/><g class="out" stroke="' + cf.hi + '"><ellipse/><ellipse/></g>' : '') +
        '</g>';
      };
      sv.innerHTML =
        '<defs>' +
        '<clipPath id="' + id + 'b"><polygon class="bandclip"/></clipPath>' +
        '<linearGradient id="' + id + 'bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + cf.bg0 + '" stop-opacity=".93"/><stop offset=".5" stop-color="' + cf.bg1 + '" stop-opacity=".98"/><stop offset="1" stop-color="' + cf.bg0 + '" stop-opacity=".93"/></linearGradient>' +
        '<filter id="' + id + 'f" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="12"/></filter>' +
        '<filter id="' + id + 'g" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
        '</defs>' +
        '<g clip-path="url(#' + id + 'b)">' +
          '<rect x="-3000" y="-300" width="7000" height="920" fill="url(#' + id + 'bg)"/>' +
          '<g class="spd" fill="' + cf.line + '">' + sp + '</g>' +
          '<ellipse class="halo" cx="500" cy="200" rx="420" ry="110" fill="' + cf.line + '" opacity="0" filter="url(#' + id + 'f)"/>' +
          (who === 'luke' ? '<path class="brk" fill="none" stroke="' + cf.line + '" stroke-width="1.5"/>' : '') +
          '<path class="nose" fill="none" stroke="' + cf.line + '" stroke-width="1.2" stroke-linecap="round"/>' +
          '<g filter="url(#' + id + 'g)" fill="none" stroke-linecap="round" stroke-linejoin="round">' + eye(0) + eye(1) + '</g>' +
          (hair ? '<g class="hair" filter="url(#' + id + 'g)" stroke-linecap="round" stroke-linejoin="round"></g>' : '') +
          // Clair 27/11: xích nằm TRÊN tóc mái (mái đè lên xích nhìn kì)
          (ch ? '<g class="chains" fill="none" stroke="' + cf.line + '" stroke-width="2.2" filter="url(#' + id + 'g)">' + ch + '</g>' : '') +
          (who === 'leon' ? '<path class="blade" fill="' + cf.hi + '" opacity="0"/>' : '') +
          '<rect class="wash" x="-3000" y="-300" width="7000" height="920" fill="' + cf.hi + '" opacity="0"/>' +
        '</g>' +
        '<g class="edges" stroke="' + cf.line + '" stroke-width="2.5"><line class="e1"/><line class="e2"/></g>';
      document.body.appendChild(sv);
      var q = function (s, r) { return (r || sv).querySelector(s); };
      var eyes = [0, 1].map(function (i) {
        var g0 = q('.e' + i), f = function (s) { return g0.querySelector(s); };
        return { s: i ? 1 : -1, clip: f('.clipp'), lid: f('.lid'), lid2: f('.lid2'), hatch: f('.hatch'), low: f('.low'), lowl: f('.lowl'), crease: f('.crease'), lash: f('.lash'), brow: f('.brow'),
          ib: f('.ib'), ib2: f('.ib2'), iglow: f('.iglow'), pup: f('.pup'), pdot: f('.pdot'), hl: f('.hl'), glint: f('.glint'),
          lk: g0.querySelectorAll('.lk ellipse'), arcs: f('.arcs'), stri: f('.stri'), rings: g0.querySelectorAll('.rings circle'), cross: f('.cross'), red: f('.red'), ret: f('.ret'),
          tick: f('.tick'), star: f('.star'), outs: g0.querySelectorAll('.out ellipse') };
      });
      return { sv: sv, who: who, cf: cf, hair: q('.hair'), band: q('.bandclip'), e1: q('.e1'), e2: q('.e2'), sp: sv.querySelectorAll('.sp'), halo: q('.halo'), wash: q('.wash'),
        nose: q('.nose'), brk: q('.brk'), blade: q('.blade'), ch: [].map.call(sv.querySelectorAll('.ch'), function (gg) { return gg.querySelectorAll('ellipse'); }), eyes: eyes };
    }
    // một lọn tóc: hai mép cong gặp nhau ở ngọn nhọn; lòng lọn màu nền dải để che nét phía sau; một nét tóc mảnh bên trong
    // một lọn tóc: dải thon dọc theo sống cong bậc ba [x0,y0, x1,y1, x2,y2, x3,y3, rộng gốc, độ gợn], đồ theo ảnh nhân vật đã căn mắt trùng dải.
    // Lòng lọn màu nền dải để che nét phía sau (không phải tô màu tóc); một nét tóc mảnh bên trong lọn to.
    function m2Lock(cf, L, sw) {
      var x0 = L[0], y0 = L[1], ax = L[2], ay = L[3], bx = L[4] + sw * 0.5, by = L[5], x3 = L[6] + sw, y3 = L[7], w = L[8], wv = L[9] || 0, Lp = [], Rp = [], mid = [];
      for (var n = 0; n <= 24; n++) {
        var u = n / 24, v = 1 - u;
        var px = v * v * v * x0 + 3 * v * v * u * ax + 3 * v * u * u * bx + u * u * u * x3, py = v * v * v * y0 + 3 * v * v * u * ay + 3 * v * u * u * by + u * u * u * y3;
        var dx = 3 * v * v * (ax - x0) + 6 * v * u * (bx - ax) + 3 * u * u * (x3 - bx), dy = 3 * v * v * (ay - y0) + 6 * v * u * (by - ay) + 3 * u * u * (y3 - by), dl = Math.hypot(dx, dy) || 1;
        var hw = w / 2 * Math.pow(1 - u, 0.85), wo = wv * Math.sin(u * 5.6) * (0.3 + u);
        px += dy / dl * wo; py -= dx / dl * wo;
        Lp.push(P(px - dy / dl * hw, py + dx / dl * hw)); Rp.unshift(P(px + dy / dl * hw, py - dx / dl * hw));
        if (u > 0.1 && u < 0.8) mid.push(P(px + dy / dl * hw * 0.3, py - dx / dl * hw * 0.3));
      }
      var s = '<path d="M' + Lp.join('L') + 'L' + Rp.join('L') + 'Z" fill="' + cf.occ + '" fill-opacity=".94" stroke="' + cf.hair + '" stroke-width="1.5"/>';
      if (w > 40) s += '<path d="M' + mid.join('L') + '" fill="none" stroke="' + cf.hair + '" stroke-width="1" opacity=".5"/>';
      return s;
    }
    // viền khối tóc: nối các điểm bằng đường cong mềm (Catmull-Rom), gãy nhọn ở điểm đánh dấu góc (ngọn lọn lớn);
    // rồi khía dọc mép thành răng cưa không đều (mỗi răng là một ngọn lọn nhỏ rủ xuống), và từ mỗi khe giữa hai ngọn
    // kéo một nét tóc ngược lên trong khối (đường chia lọn). Trả về { d: viền, notes: các nét chia lọn }.
    function m2Sil(pts, seed) {
      var n = pts.length, poly = [];
      for (var i = 0; i < n; i++) {
        var p1 = pts[i], p2 = pts[(i + 1) % n], p0 = p1[2] ? p1 : pts[(i - 1 + n) % n], p3 = p2[2] ? p2 : pts[(i + 2) % n];
        var b1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], b2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
        var m = Math.max(2, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / 5));
        for (var k = 0; k < m; k++) { var u = k / m, v = 1 - u; poly.push([v * v * v * p1[0] + 3 * v * v * u * b1[0] + 3 * v * u * u * b2[0] + u * u * u * p2[0], v * v * v * p1[1] + 3 * v * v * u * b1[1] + 3 * v * u * u * b2[1] + u * u * u * p2[1], k === 0 && p1[2]]); }
      }
      var inside = function (x, y) { var c = false; for (var a = 0, b = poly.length - 1; a < poly.length; b = a++) { var pa = poly[a], pb = poly[b]; if ((pa[1] > y) !== (pb[1] > y) && x < (pb[0] - pa[0]) * (y - pa[1]) / (pb[1] - pa[1]) + pa[0]) c = !c; } return c; };
      var rnd = function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
      var out = [], notes = [], acc = 0, per = 20 + rnd() * 30, vis = function (q) { return q[0] > 20 && q[0] < 980 && q[1] > -120 && q[1] < 330; }, N = poly.length;
      for (var a = 0; a < N; a++) {
        var q = poly[a], q2 = poly[(a + 1) % N];
        out.push(P(q[0], q[1]));
        acc += Math.hypot(q2[0] - q[0], q2[1] - q[1]);
        if (acc < per || !vis(q) || q[2]) continue;
        // một ngọn lọn: đáy rộng B dọc mép, đỉnh đẩy ra phía mặt và rủ xuống theo chiều tóc
        var B = 26 + rnd() * 26, L2 = 0, b = a;
        while (L2 < B && b < N - 1 && !poly[b + 1][2]) { L2 += Math.hypot(poly[b + 1][0] - poly[b][0], poly[b + 1][1] - poly[b][1]); b++; }
        if (L2 < 16) { acc = 0; continue; }
        var qb = poly[b], tx = qb[0] - q[0], ty = qb[1] - q[1], tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
        var nx = -ty, ny = tx, mi = poly[Math.round((a + b) / 2)];
        if (inside(mi[0] + nx * 4, mi[1] + ny * 4)) { nx = -nx; ny = -ny; }
        acc = 0; per = 6 + rnd() * 30;
        if (ny < -0.6) continue; // mép quay lên (đáy vòm trán): không khía
        var tooth = ny > 0.25; // mép dựng đứng (hai bên vòm trán) chỉ có nét chia lọn, không khía răng
        var tux = ty > 0 ? tx : -tx, tuy = ty > 0 ? ty : -ty; // chiều mép rủ xuống
        var amp = 16 + rnd() * 22, fx = nx * 0.45 + tux * 0.4 + 0, fy = ny * 0.45 + tuy * 0.4 + 0.35, fl = Math.hypot(fx, fy); fx /= fl; fy /= fl;
        if (tooth) { out.push(P(mi[0] + fx * amp, mi[1] + fy * amp)); a = b - 1; }
        // nét chia lọn: từ khe (cuối ngọn) đi ngược lên dọc chiều tóc, hơi lùi vào trong khối
        var ln = 60 + rnd() * 100, ux = -tux * 0.7 - nx * 0.15, uy = -tuy * 0.7 - 0.3 - ny * 0.15, ul = Math.hypot(ux, uy); ux /= ul; uy /= ul;
        var sx = qb[0] - nx * 3, sy = qb[1] - ny * 3;
        notes.push([sx, sy, sx + ux * ln * 0.35, sy + uy * ln * 0.35, sx + ux * ln * 0.7 + (rnd() - 0.5) * 8, sy + uy * ln * 0.7, sx + ux * ln, sy + uy * ln, 1.8 + rnd() * 1.4]);
      }
      return { d: 'M' + out.join('L') + 'Z', notes: notes };
    }
    function m2Strand(cf, L) {
      var x0 = L[0], y0 = L[1], ax = L[2], ay = L[3], bx = L[4], by = L[5], x3 = L[6], y3 = L[7], w = L[8], Lp = [], Rp = [];
      for (var n = 0; n <= 20; n++) {
        var u = n / 20, v = 1 - u;
        var px = v * v * v * x0 + 3 * v * v * u * ax + 3 * v * u * u * bx + u * u * u * x3, py = v * v * v * y0 + 3 * v * v * u * ay + 3 * v * u * u * by + u * u * u * y3;
        var dx = 3 * v * v * (ax - x0) + 6 * v * u * (bx - ax) + 3 * u * u * (x3 - bx), dy = 3 * v * v * (ay - y0) + 6 * v * u * (by - ay) + 3 * u * u * (y3 - by), dl = Math.hypot(dx, dy) || 1;
        var hw = w / 2 * Math.sin(Math.min(1, u * 1.15) * Math.PI) + 0.15;
        Lp.push(P(px - dy / dl * hw, py + dx / dl * hw)); Rp.unshift(P(px + dy / dl * hw, py - dx / dl * hw));
      }
      return '<path d="M' + Lp.join('L') + 'L' + Rp.join('L') + 'Z" fill="' + cf.hair + '" stroke="none" opacity=".75"/>';
    }
    function m2Draw(E, t0, R) {
      var cf = E.cf, leon = E.who === 'leon', ti = cf.flash, t = hitstop(t0, ti, leon ? 0.12 : 0.1, 0.1), fu = t0 - ti, fs = t - ti, dk = C.dark;
      var bh = Math.min(W * 430 / 880, H * 0.36), top = H * 0.38 - bh / 2;
      E.sv.style.top = top.toFixed(1) + 'px'; E.sv.style.height = bh.toFixed(1) + 'px';
      // băng tối nghiêng xẻ mở / khép (Leon nghiêng một chiều, Luke chiều kia)
      var op = es(t0 / 0.25) * (t0 > 2.45 ? 1 - es((t0 - 2.45) / 0.3) : 1), hh = 226 * op, tl = 105 - hh - 12, bl = 105 + hh + 12, sk = 90 * cf.tilt;
      E.band.setAttribute('points', '-3000,' + (tl - sk) + ' 4000,' + (tl + sk) + ' 4000,' + (bl + sk) + ' -3000,' + (bl - sk));
      var ea = op > 0.02 ? Math.min(1, op * 1.5) : 0;
      E.e1.setAttribute('x1', -3000); E.e1.setAttribute('y1', tl - sk); E.e1.setAttribute('x2', 4000); E.e1.setAttribute('y2', tl + sk);
      E.e2.setAttribute('x1', -3000); E.e2.setAttribute('y1', bl - sk); E.e2.setAttribute('x2', 4000); E.e2.setAttribute('y2', bl + sk);
      E.e1.setAttribute('opacity', ea); E.e2.setAttribute('opacity', ea * 0.6);
      // độ mở mí
      var o;
      if (leon) {
        o = 0.54 * es((t - 0.2) / 0.4);
        if (t > 0.8) o = lerp(o, 0.46, es((t - 0.8) / 0.12));
        if (fs > 0) { o = lerp(0.46, 1, es(fs / 0.06)); if (fs > 0.35) o = lerp(1, 0.54, es((fs - 0.35) / 0.55)); }
      } else {
        o = 0.8 * es((t - 0.2) / 0.4);
        if (fs > 0) o = lerp(0.8, 1, es(fs / 0.06));
        if (t > 1.35) o = lerp(o, 0.64, es((t - 1.35) / 0.3));
      }
      if (t0 > 2.35) o *= 1 - es((t0 - 2.35) / 0.2);
      var lit = fu > 0 ? Math.min(1, fu / (leon ? 0.06 : 0.08)) * (t0 > 2.3 ? 1 - es((t0 - 2.3) / 0.4) : 1) : 0;
      // hình mắt cục bộ (khoé trong x=0, đuôi x=330)
      M2IO = cf.io;
      var OX = cf.ox, k9 = OX / 300, oy = cf.oy, ld = cf.ld, ph = cf.ph;
      var c1 = [50 * k9, lerp(ld * 0.75, -ph, o)], c2 = [214 * k9, lerp(oy + ld * 0.85, -ph * 0.92, o)], c3 = [228 * k9, oy + ld], c4 = [80 * k9, ld * 0.84];
      var th = 6 + 7 * o, bzu = function (u) { var v = 1 - u; return [3 * v * v * u * c1[0] + 3 * v * u * u * c2[0] + u * u * u * OX, 3 * v * v * u * c1[1] + 3 * v * u * u * c2[1] + u * u * u * oy]; };
      // lông mày: Leon thấp, gần thẳng, sát mắt (lúc xích bung hạ thêm, cau lại); Luke cao hơn, cong nhẹ, hạ xuống khi híp ngắm
      var drop = leon ? (fs > 0 ? 7 * (fs < 0.1 ? fs / 0.1 : Math.max(0.4, 1 - (fs - 0.1) / 1.2)) : 0) + (1 - o) * 6 : (t > 1.35 ? 7 * es((t - 1.35) / 0.3) : 0) - (fs > 0 && fs < 0.4 ? 4 * (1 - fs / 0.4) : 0) + (1 - o) * 5;
      var by = cf.by + drop, bx = cf.bx, B0 = [bx[0], by + 9], B1 = [bx[1], by - cf.arch], B2 = [bx[2], by - cf.arch * 0.8], B3 = [bx[3], by + 14 + cf.btail];
      var Pi = cf.pi, iy = cf.iy, ir = cf.ir;
      for (var e = 0; e < 2; e++) {
        var Y = E.eyes[e], s = Y.s, mp = function (x, y) { return m2P(s, x, y); };
        var up = 'M' + mp(0, 0) + 'C' + mp(c1[0], c1[1]) + ' ' + mp(c2[0], c2[1]) + ' ' + mp(OX, oy);
        Y.clip.setAttribute('d', up + 'C' + mp(c3[0], c3[1]) + ' ' + mp(c4[0], c4[1]) + ' ' + mp(0, 0) + 'Z');
        Y.lid.setAttribute('d', up + 'L' + mp(OX + cf.flick[0], oy + cf.flick[1]));
        Y.lid2.setAttribute('d', 'M' + mp(14, -3) + 'C' + mp(c1[0] + 6, c1[1] - th) + ' ' + mp(c2[0], c2[1] - th * 1.15) + ' ' + mp(OX + cf.flick[0] * 0.7, oy + cf.flick[1] * 0.4 - th * 0.5));
        Y.lid2.setAttribute('opacity', (Math.min(1, o * 1.8) * 0.8).toFixed(3));
        // vạch đổ bóng dày dần về đuôi giữa hai nét mí (kiểu manga: mí đậm mà không tô)
        var hs = '';
        [0.4, 0.7].forEach(function (f) { var a0 = bzu(0.42), q1 = bzu(0.62), q2 = bzu(0.84); hs += 'M' + mp(a0[0], a0[1] - th * f * 0.4) + 'C' + mp(q1[0], q1[1] - th * f) + ' ' + mp(q2[0], q2[1] - th * f * 1.1) + ' ' + mp(OX + cf.flick[0] * 0.8, oy + cf.flick[1] * 0.6 - th * f * 0.35); });
        Y.hatch.innerHTML = '<path d="' + hs + '"/>'; Y.hatch.setAttribute('opacity', (Math.min(1, o * 1.8) * 0.75).toFixed(3));
        Y.low.setAttribute('d', 'M' + mp(OX - 6, oy + 6) + 'C' + mp(230 * k9, oy + ld - 1) + ' ' + mp(140 * k9, ld * 0.98 + 2) + ' ' + mp(86 * k9, ld * 0.74));
        Y.low.setAttribute('opacity', (0.5 + 0.5 * Math.min(1, o * 2)).toFixed(3));
        var ll = ''; [0.6, 0.69, 0.78, 0.87].forEach(function (kx, j) { var yy = lerp(ld * 0.98, oy + ld - 1, (kx - 0.47) / 0.53) + 3; ll += 'M' + mp(kx * OX, yy) + 'l' + P(s * (4 + j * 2), 7 + j); });
        Y.lowl.innerHTML = '<path d="' + ll + '"/>'; Y.lowl.setAttribute('opacity', (0.55 * Math.min(1, o * 2)).toFixed(3));
        Y.crease.setAttribute('d', 'M' + mp(40 * k9, c1[1] * 0.45 - 16) + 'C' + mp(c1[0] + 26, c1[1] - th - 18) + ' ' + mp(c2[0], c2[1] - th - 20) + ' ' + mp(OX - 18, oy - th - 18));
        Y.crease.setAttribute('opacity', (0.45 * Math.min(1, o * 1.6)).toFixed(3));
        // mi trên: ít sợi, rạp về đuôi (mắt nam)
        var lh = '', LU = leon ? [0.84, 0.91, 0.97] : [0.8, 0.88, 0.94, 0.99];
        for (var li = 0; li < LU.length; li++) {
          var u = LU[li], p0 = bzu(u), p1 = bzu(Math.min(1, u + 0.01)), tx = p1[0] - p0[0], ty = p1[1] - p0[1], tn = Math.hypot(tx, ty) || 1;
          var nx = ty / tn, ny = -tx / tn; if (ny > 0) { nx = -nx; ny = -ny; }
          var len = (leon ? [14, 20, 26] : [12, 17, 22, 26])[li] * Math.min(1, o * 1.6), lean = leon ? 2.8 + li * 0.5 : 2 + li * 0.4;
          var bx = p0[0] + nx * th, by2 = p0[1] + ny * th, dx = nx + tx / tn * lean, dy = ny + ty / tn * lean, dl = Math.hypot(dx, dy); dx /= dl; dy /= dl;
          lh += '<path stroke-width="' + (1.4 + li * 0.4).toFixed(2) + '" d="M' + mp(bx, by2) + 'L' + mp(bx + dx * len * 0.55 - dy * len * 0.12, by2 + dy * len * 0.55 + dx * len * 0.12) + 'L' + mp(bx + dx * len, by2 + dy * len) + '"/>';
        }
        Y.lash.innerHTML = lh; Y.lash.setAttribute('opacity', Math.min(1, o * 1.4).toFixed(3));
        // lông mày: một dải thon (đầu dày, đuôi nhọn) + vài nét lông ở đầu mày
        var bw = '<path stroke-width="1.7" d="M' + mp(B0[0], B0[1]) + 'C' + mp(B1[0], B1[1]) + ' ' + mp(B2[0], B2[1]) + ' ' + mp(B3[0], B3[1]) + 'C' + mp(B2[0] + 10, B2[1] + cf.bth * 0.55) + ' ' + mp(B1[0], B1[1] + cf.bth) + ' ' + mp(B0[0] + 6, B0[1] + cf.bth * 0.9) + '"/>';
        bw += '<path stroke-width="1" d="M' + mp(B0[0] + 8, B0[1] + cf.bth * 0.85) + 'L' + mp(B0[0] + 30, B0[1] - 2) + 'M' + mp(B0[0] + 26, B0[1] + cf.bth * 0.9) + 'L' + mp(B0[0] + 50, B0[1] - 3) + 'M' + mp(B0[0] + 46, B0[1] + cf.bth * 0.8) + 'L' + mp(B0[0] + 72, B0[1] - 3) + '"/>';
        Y.brow.innerHTML = bw; Y.brow.setAttribute('opacity', ((0.45 + 0.5 * Math.min(1, o * 1.6)) * ea).toFixed(3));
        // mống mắt
        var ic = m2Q(s, Pi, iy), cx = ic[0], cy = ic[1];
        [Y.ib, Y.iglow, Y.ib2].forEach(function (el) { el.setAttribute('cx', cx.toFixed(1)); el.setAttribute('cy', cy.toFixed(1)); });
        Y.ib.setAttribute('r', ir); Y.iglow.setAttribute('r', ir); Y.ib2.setAttribute('r', (ir * (leon ? 0.6 : 0.7)).toFixed(1));
        Y.ib.setAttribute('opacity', ((0.55 + 0.45 * lit) * Math.min(1, o * 2)).toFixed(3));
        Y.iglow.setAttribute('opacity', (lit * (fu < 0.3 ? 0.9 : leon ? 0.4 + 0.08 * Math.sin(t0 * 5) : 0.55 + 0.1 * Math.sin(t0 * 6))).toFixed(3));
        // chấm sáng: cùng một phía trên màn cho cả hai mắt (trên-trái)
        Y.hl.setAttribute('cx', (cx - ir * 0.38).toFixed(1)); Y.hl.setAttribute('cy', (cy - ir * 0.42).toFixed(1)); Y.hl.setAttribute('r', (ir * 0.13).toFixed(1));
        if (leon) {
          var rot = s * (t * 8 + (fs > 0 ? 180 * es(fs / 0.3) : 0)), rr = ir * 0.8;
          for (var n = 0; n < Y.lk.length; n++) {
            var a = n / Y.lk.length * 360 + rot, ar = a * Math.PI / 180, x = cx + Math.cos(ar) * rr, y = cy + Math.sin(ar) * rr, el = Y.lk[n];
            el.setAttribute('cx', x.toFixed(1)); el.setAttribute('cy', y.toFixed(1)); el.setAttribute('rx', (ir * 0.2).toFixed(1)); el.setAttribute('ry', (n % 2 ? ir * 0.035 : ir * 0.1).toFixed(2));
            el.setAttribute('transform', 'rotate(' + (a + 90).toFixed(1) + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')');
          }
          Y.lk[0].parentNode.setAttribute('opacity', (0.35 + 0.6 * lit).toFixed(3));
          Y.ib2.setAttribute('opacity', (0.3 + 0.4 * lit).toFixed(3));
          var pr = (fs < 0 ? 0.3 - 0.04 * es((t - 0.8) / 0.12) : lerp(0.26, 0.18, es(fs / 0.08))) * ir;
          Y.pup.setAttribute('cx', cx.toFixed(1)); Y.pup.setAttribute('cy', cy.toFixed(1)); Y.pup.setAttribute('r', pr.toFixed(2));
          Y.pdot.setAttribute('cx', cx.toFixed(1)); Y.pdot.setAttribute('cy', cy.toFixed(1));
          // vệt sáng thép lướt chéo qua mống mắt
          var gu = (fu - 0.02 - e * 0.04) / 0.32;
          if (gu > 0 && gu < 1) { var gx = lerp(cx - ir * 1.4, cx + ir * 1.4, gu); Y.glint.setAttribute('d', 'M' + P(gx - 6, cy - ir * 1.3) + 'L' + P(gx + 6, cy - ir * 1.3) + 'L' + P(gx - 30, cy + ir * 1.3) + 'L' + P(gx - 38, cy + ir * 1.3) + 'Z'); Y.glint.setAttribute('opacity', (0.85 * Math.sin(gu * Math.PI)).toFixed(3)); }
          else Y.glint.setAttribute('opacity', 0);
          var ar2 = ir + 12, ad = ['M' + P(0, -ar2) + 'A' + ar2 + ' ' + ar2 + ' 0 0 1 ' + P(ar2 * 0.87, -ar2 * 0.5), 'M' + P(ar2 * 0.5, ar2 * 0.87) + 'A' + ar2 + ' ' + ar2 + ' 0 0 1 ' + P(-ar2 * 0.5, ar2 * 0.87), 'M' + P(-ar2 * 0.87, ar2 * 0.5) + 'A' + ar2 + ' ' + ar2 + ' 0 0 1 ' + P(-ar2 * 0.87, -ar2 * 0.5)];
          [].forEach.call(Y.arcs.querySelectorAll('path'), function (pa, k) { pa.setAttribute('d', ad[k]); });
          Y.arcs.setAttribute('transform', 'translate(' + P(cx, cy) + ') rotate(' + (-s * (t * 14 + (fs > 0 ? 90 * es(fs / 0.3) : 0))).toFixed(2) + ') scale(' + (1 + (fu > 0 && fu < 0.2 ? 0.1 * (1 - fu / 0.2) : 0)).toFixed(3) + ')');
          Y.arcs.setAttribute('opacity', (lit * 0.6 * ea).toFixed(3));
        } else {
          Y.ib2.setAttribute('transform', 'rotate(' + (-s * t * 30).toFixed(2) + ' ' + P(cx, cy) + ')'); Y.ib2.setAttribute('opacity', (0.35 + 0.5 * lit).toFixed(3));
          Y.stri.setAttribute('transform', 'translate(' + P(cx, cy) + ') rotate(' + (s * (t * 12 + lit * 20)).toFixed(2) + ')'); Y.stri.setAttribute('opacity', (0.2 + 0.4 * lit).toFixed(3));
          Y.tick.setAttribute('transform', 'translate(' + P(cx, cy) + ') rotate(' + (s * t * 18).toFixed(2) + ') scale(' + (1 + (fu > 0 && fu < 0.25 ? 0.12 * (1 - fu / 0.25) : 0)).toFixed(3) + ')');
          Y.tick.setAttribute('opacity', (lit * 0.6 * ea).toFixed(3));
          Y.cross.setAttribute('d', 'M' + P(cx, cy - ir * 0.46) + 'V' + (cy - ir * 0.22).toFixed(1) + 'M' + P(cx, cy + ir * 0.22) + 'V' + (cy + ir * 0.46).toFixed(1) + 'M' + P(cx - ir * 0.46, cy) + 'H' + (cx - ir * 0.22).toFixed(1) + 'M' + P(cx + ir * 0.22, cy) + 'H' + (cx + ir * 0.46).toFixed(1));
          Y.cross.setAttribute('opacity', (lit * 0.8).toFixed(3));
          var pr2 = fu < 0 ? 0.3 + 0.03 * es((t - 0.55) / 0.3) : lerp(0.33, 0.13, es(fu / 0.1)) + (t > 1.35 ? 0.015 * Math.sin(t0 * 9) * (1 - es((t - 1.35) / 0.5)) : 0);
          Y.pup.setAttribute('cx', cx.toFixed(1)); Y.pup.setAttribute('cy', cy.toFixed(1));
          Y.pup.setAttribute('rx', Math.max(3, pr2 * ir * (fu > 0 ? 0.32 : 0.6)).toFixed(2)); Y.pup.setAttribute('ry', Math.max(9, pr2 * ir * 1.25).toFixed(2));
          for (var i = 0; i < 3; i++) {
            var c = Y.rings[i], ru0 = ((t - 0.95 - i * 0.36) % 1.08) / 1.08;
            c.setAttribute('cx', cx.toFixed(1)); c.setAttribute('cy', cy.toFixed(1));
            if (t < 0.95 + i * 0.36 || t > 2.3) { c.setAttribute('opacity', 0); continue; }
            c.setAttribute('r', (ir * (0.15 + ru0 * 0.85)).toFixed(1)); c.setAttribute('stroke-width', (2.2 * (1 - ru0) + 0.5).toFixed(2)); c.setAttribute('opacity', (0.85 * (1 - ru0) * lit).toFixed(3));
          }
          // chấm đỏ (chỗ bất thường) phản chiếu trong cả hai mống mắt, bốn góc ngắm khép vào
          var ru = t - 1.35;
          if (ru > 0) {
            var rx0 = cx + ir * 0.42, ry0 = cy - ir * 0.08, ra = Math.min(1, ru / 0.15) * (0.75 + 0.25 * Math.sin(t0 * 14)) * lit, z = lerp(ir * 0.5, ir * 0.2, es(ru / 0.3)), arm = z * 0.45, d = '';
            [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (sg) { var qx = rx0 + sg[0] * z, qy = ry0 + sg[1] * z; d += 'M' + P(qx - sg[0] * arm, qy) + 'L' + P(qx, qy) + 'L' + P(qx, qy - sg[1] * arm); });
            Y.ret.setAttribute('d', d); Y.red.setAttribute('transform', ''); [].forEach.call(Y.red.querySelectorAll('circle'), function (cc) { cc.setAttribute('cx', rx0.toFixed(1)); cc.setAttribute('cy', ry0.toFixed(1)); });
            Y.red.setAttribute('opacity', ra.toFixed(3));
          } else Y.red.setAttribute('opacity', 0);
          // ngôi sao loé ở chấm sáng + vòng sóng bật ra khỏi mắt
          var sr = fu > 0 ? 48 * PW * (fu < 0.1 ? 1 : Math.max(0, 1 - (fu - 0.1) / 0.45)) : 0, sd = '', hx = cx - ir * 0.38, hy = cy - ir * 0.42;
          if (sr > 0.5) for (var m = 0; m < 4; m++) { var a3 = m * 1.5708 + 0.3; sd += 'M' + P(hx, hy) + 'L' + P(hx + Math.cos(a3 + 0.785) * sr * 0.09, hy + Math.sin(a3 + 0.785) * sr * 0.09) + 'L' + P(hx + Math.cos(a3) * sr, hy + Math.sin(a3) * sr) + 'L' + P(hx + Math.cos(a3 - 0.785) * sr * 0.09, hy + Math.sin(a3 - 0.785) * sr * 0.09) + 'Z'; }
          Y.star.setAttribute('d', sd); Y.star.setAttribute('opacity', sr > 0.5 ? 1 : 0);
          for (var j = 0; j < 2; j++) {
            var oe = Y.outs[j], v = (fu - j * 0.12) / 0.7;
            oe.setAttribute('cx', cx.toFixed(1)); oe.setAttribute('cy', cy.toFixed(1));
            if (v <= 0 || v >= 1) { oe.setAttribute('opacity', 0); continue; }
            oe.setAttribute('rx', (ir * 1.3 + v * 300).toFixed(1)); oe.setAttribute('ry', (ir * 0.8 + v * 150).toFixed(1)); oe.setAttribute('stroke-width', ((3.5 * (1 - v) + 0.6) * PW).toFixed(2)); oe.setAttribute('opacity', ((1 - v) * 0.85).toFixed(3));
          }
        }
      }
      // sống mũi: một nét mảnh mờ giữa hai mắt
      E.nose.setAttribute('d', 'M' + P(506, 236) + 'Q' + P(498, 270) + ' ' + P(502, 300)); E.nose.setAttribute('opacity', (0.3 * ea).toFixed(3));
      // tóc mái: lắc rất nhẹ; Leon lúc xích bung thì giật nhẹ một cái
      if (E.hair) {
        var sw = Math.sin(t0 * 1.8) * 2 + (leon && fs > 0 && fs < 0.4 ? Math.sin(fs * 30) * 4 * (1 - fs / 0.4) : 0) + (!leon && fu > 0 && fu < 0.3 ? 3 * (1 - fu / 0.3) : 0);
        if (!E.hairDone) {
          // dựng tóc một lần (tốn tính), mỗi khung hình chỉ lắc cả khối
          var hm = '<g class="hm">', T = typeof M2T !== 'undefined' && M2T[E.who];
          if (T) {
            // bản đồ từ ảnh: mảng che (khối tóc tối) rồi các nét tóc lấy đúng từ ảnh
            hm += '<path d="' + T.occ + '" fill="' + cf.bg1 + '" fill-opacity=".9" fill-rule="evenodd" stroke="none"/>';
            hm += '<path d="' + T.lines + '" fill="' + cf.hairT + '" fill-rule="nonzero" opacity=".72"/>';
            hm += '<path d="' + T.edge + '" fill="' + cf.hairT + '" fill-rule="nonzero"/></g><g class="hl2">';
            E.hair.innerHTML = hm + '</g>'; E.hairDone = true; E.hm = E.hair.querySelector('.hm'); E.hl2 = E.hair.querySelector('.hl2');
          } else {
          (cf.sil || []).forEach(function (c, ci) {
            var r = m2Sil(c, 17 + ci * 31);
            hm += '<path d="' + r.d + '" fill="' + cf.occ + '" fill-opacity=".94" stroke="' + cf.hair + '" stroke-width="1.6" stroke-linejoin="round"/>';
            r.notes.forEach(function (L) { hm += m2Strand(cf, L); });
          });
          (cf.strands || []).forEach(function (L) { hm += m2Strand(cf, L); });
          hm += '</g><g class="hl2">';
          cf.locks.forEach(function (L) { hm += m2Lock(cf, L, 0); });
          E.hair.innerHTML = hm + '</g>'; E.hairDone = true; E.hm = E.hair.querySelector('.hm'); E.hl2 = E.hair.querySelector('.hl2');
          }
        }
        E.hm.setAttribute('transform', 'translate(' + (sw * 0.6).toFixed(2) + ' 0)'); E.hl2.setAttribute('transform', 'translate(' + sw.toFixed(2) + ' 0)');
        E.hair.setAttribute('opacity', (ea * (0.9 + 0.1 * lit)).toFixed(3));
      }
      // Luke: bốn góc khung ngắm quanh dải mắt
      if (E.brk) {
        var bz = lerp(1.12, 1, es((t0 - 0.1) / 0.4)) - (fu > 0 && fu < 0.2 ? 0.03 * (1 - fu / 0.2) : 0), x0 = 500 - 450 * bz, x1 = 500 + 450 * bz, y0 = 200 - 100 * bz, y1 = 200 + 100 * bz, ba = 30, bd2 = '';
        [[x0, y0, 1, 1], [x1, y0, -1, 1], [x1, y1, -1, -1], [x0, y1, 1, -1]].forEach(function (c) { bd2 += 'M' + P(c[0] + c[2] * ba, c[1]) + 'L' + P(c[0], c[1]) + 'L' + P(c[0], c[1] + c[3] * ba); });
        E.brk.setAttribute('d', bd2); E.brk.setAttribute('opacity', (0.6 * ea).toFixed(3));
      }
      E.halo.setAttribute('opacity', (lit * (fu < 0.25 ? 0.4 * (1 - fu / 0.25) + 0.05 : 0.05) * PW * ea).toFixed(3));
      E.wash.setAttribute('opacity', (fu > 0 && fu < 0.11 ? 0.5 * (1 - fu / 0.11) * PW : 0).toFixed(3));
      // Leon: hai sợi xích quất chéo sau dải lúc bung, căng rung rồi giật về; một nhát sáng như lưỡi thép chém ngang
      if (leon) {
        var CH = [[-160, 330, 1160, 250], [1160, 10, -160, 30]], LS = 28;
        for (var cI = 0; cI < 2; cI++) {
          var cu = fu - cI * 0.04, links = E.ch[cI], X0 = CH[cI][0], Y0 = CH[cI][1], X1 = CH[cI][2], Y1 = CH[cI][3], full = Math.hypot(X1 - X0, Y1 - Y0), ang = Math.atan2(Y1 - Y0, X1 - X0);
          var reach = cu <= 0 ? 0 : cu < 0.14 ? Math.pow(cu / 0.14, 0.6) : 1; if (t0 > 1.9) reach *= 1 - es((t0 - 1.9) / 0.35);
          var vib = cu > 0.14 ? 6 * Math.exp(-(cu - 0.14) * 4) : 0, nxv = -Math.sin(ang), nyv = Math.cos(ang), head = reach * full, chA = (0.5 + 0.35 * lit) * ea;
          for (var k2 = 0; k2 < links.length; k2++) {
            var el2 = links[k2], dpos = head - k2 * LS;
            if (dpos < 0 || reach <= 0) { el2.setAttribute('opacity', 0); continue; }
            var s2 = dpos / full, wob = Math.sin(s2 * Math.PI) * Math.sin(t0 * 60 + k2 * 0.7) * vib, lx = X0 + Math.cos(ang) * dpos + nxv * wob, ly = Y0 + Math.sin(ang) * dpos + nyv * wob;
            el2.setAttribute('cx', lx.toFixed(1)); el2.setAttribute('cy', ly.toFixed(1)); el2.setAttribute('rx', 16); el2.setAttribute('ry', k2 % 2 ? 1.5 : 7);
            el2.setAttribute('transform', 'rotate(' + (ang * 180 / Math.PI).toFixed(1) + ' ' + lx.toFixed(1) + ' ' + ly.toFixed(1) + ')'); el2.setAttribute('opacity', (chA * (k2 === 0 ? 1 : 0.85)).toFixed(3));
          }
        }
        var bu = fu / 0.22;
        if (bu > 0 && bu < 1) { var by0 = 200 + lerp(-40, 40, bu), w2 = 5 * (1 - bu) * PW + 0.5; E.blade.setAttribute('d', 'M' + P(-200, by0 + 50) + 'L' + P(1200, by0 - 50 - w2) + 'L' + P(1200, by0 - 50 + w2) + 'Z'); E.blade.setAttribute('opacity', (0.9 * (1 - bu)).toFixed(3)); }
        else E.blade.setAttribute('opacity', 0);
      }
      var fr = Math.floor(t0 * 20), dir = leon ? -1 : 1;
      for (var q2 = 0; q2 < E.sp.length; q2++) { var spr = E.sp[q2], sx = dir > 0 ? ((q2 * 0.37 + t0 * (1.6 + (q2 % 3) * 0.7)) % 1.6 - 0.3) * 1000 : (1.3 - (q2 * 0.41 + t0 * (1.4 + (q2 % 3) * 0.6)) % 1.6) * 1000; spr.setAttribute('x', sx.toFixed(0)); spr.setAttribute('width', 70 + (q2 % 4) * 55); spr.setAttribute('opacity', ((0.06 + (q2 % 3) * 0.05 + (fu > 0 && fu < 0.4 ? 0.22 : 0)) * ea * ((fr + q2) % 5 ? 1 : 0.4)).toFixed(3)); }
      if (typeof edge === 'function') {
        edge(dk ? (leon ? '#000000' : '#00070a') : (leon ? '#1a2128' : '#0c2a33'), (dk ? 0.78 : 0.42) * op, 0.18);
        focus(W / 2, H * 0.38, kc(E.who), (fu > 0 && fu < 0.45 ? 0.3 * (1 - fu / 0.45) : 0) * PW, 40, R, t0, 0.4);
        jolt(fu > 0 && fu < 0.3 ? (leon ? 5 : 4) * PW * (1 - fu / 0.3) : 0, t0);
      }
    }
    function m2Run(who, hair) {
      var key = '_m2' + who + (hair ? 'h' : '');
      return function (t0, R) {
        if (!R[key]) R[key] = m2Build(who, hair);
        if (t0 > 2.85) { if (R[key].sv.parentNode) R[key].sv.parentNode.removeChild(R[key].sv); main.style.transform = ''; return true; }
        m2Draw(R[key], t0, R);
        return false;
      };
    }
    MORE['leon-eye2'] = m2Run('leon', true);
    MORE['leon-eye2-trong'] = m2Run('leon', false);
    MORE['luke-eye2'] = m2Run('luke', true);
    MORE['luke-eye2-trong'] = m2Run('luke', false);
    MORE['leon-eye2-strike'] = function (t0, R) {
      var a = t0 <= 2.85 || (R._m2leonh && R._m2leonh.sv.parentNode) ? MORE['leon-eye2'](t0, R) : true, b = t0 > 2.3 ? MORE['leon-strike'](t0 - 2.3, R) : false;
      return a && b;
    };
    MORE['luke-eye2-sense'] = function (t0, R) {
      var a = t0 <= 2.85 || (R._m2lukeh && R._m2lukeh.sv.parentNode) ? MORE['luke-eye2'](t0, R) : true, b = t0 > 2.3 ? MORE['luke-sense'](t0 - 2.3, R) : false;
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
    // bản thử C (hai mắt theo ảnh nhân vật, mat2.js): cùng nhịp với bản B nên dùng chung tiếng
    S['leon-eye2'] = S['leon-eye2-trong'] = S['leon-eye']; S['luke-eye2'] = S['luke-eye2-trong'] = S['luke-eye'];
    S['leon-eye2-strike'] = S['leon-eye-strike']; S['luke-eye2-sense'] = S['luke-eye-sense'];
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
