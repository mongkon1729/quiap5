// Soft, outline-free illustrations drawn in SVG so the page stays small on slow connections.
var Art = (function () {
  var TONES = [
    ['#e6e1ff', '#c9bfff'], ['#ffe4ee', '#fbbfd6'], ['#dff4ff', '#b5dcf7'],
    ['#fff0d6', '#ffd49a'], ['#dcf6ea', '#a9e4c8'], ['#f1e6ff', '#d6c0fb']
  ];

  function tone(i) {
    return TONES[((i % TONES.length) + TONES.length) % TONES.length];
  }

  function color(i) {
    return tone(i)[1];
  }

  // Card header: pastel gradient, soft blobs and a big emoji "object" sitting on a shadow.
  function cover(i, icon) {
    var t = tone(i);
    var id = 'cv' + i + Math.random().toString(36).slice(2, 6);
    var blobs = [
      '<circle cx="262" cy="18" r="62" fill="#fff" opacity=".35"/><circle cx="36" cy="112" r="44" fill="#fff" opacity=".28"/>',
      '<circle cx="40" cy="20" r="54" fill="#fff" opacity=".32"/><circle cx="290" cy="110" r="50" fill="#fff" opacity=".3"/>',
      '<rect x="210" y="-30" width="140" height="140" rx="40" fill="#fff" opacity=".28" transform="rotate(18 280 40)"/><circle cx="60" cy="100" r="30" fill="#fff" opacity=".3"/>',
      '<circle cx="160" cy="-20" r="80" fill="#fff" opacity=".25"/><circle cx="300" cy="96" r="26" fill="#fff" opacity=".35"/>'
    ][((i % 4) + 4) % 4];
    return '<svg viewBox="0 0 320 130" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + t[0] + '"/><stop offset="1" stop-color="' + t[1] + '"/></linearGradient></defs>' +
      '<rect width="320" height="130" fill="url(#' + id + ')"/>' + blobs +
      '<ellipse cx="200" cy="112" rx="46" ry="7" fill="#3b2f8a" opacity=".12"/>' +
      (/\.png$/.test(icon || '') ? '<image href="' + icon + '" x="150" y="12" width="100" height="100"/>'
        : '<text x="200" y="98" font-size="64" text-anchor="middle">' + (icon || '📝') + '</text>') +
      '<circle cx="104" cy="44" r="5" fill="#fff" opacity=".9"/><circle cx="128" cy="92" r="3.5" fill="#fff" opacity=".8"/>' +
      '</svg>';
  }

  function book(x, y, w, h, c1, c2) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="5" fill="' + c1 + '"/>' +
      '<rect x="' + (x + 6) + '" y="' + (y + 3) + '" width="' + (w - 10) + '" height="' + (h - 7) + '" rx="2" fill="#fff" opacity=".92"/>' +
      '<rect x="' + x + '" y="' + (y + h - 6) + '" width="' + w + '" height="6" rx="3" fill="' + c2 + '"/>';
  }

  // Hero left: a stack of books with round glasses.
  function hero() {
    return '<svg viewBox="0 0 180 150" aria-hidden="true">' +
      '<ellipse cx="90" cy="140" rx="70" ry="8" fill="#2a1f78" opacity=".25"/>' +
      book(24, 104, 130, 32, '#ff8a5b', '#e0663a') +
      book(34, 74, 112, 30, '#7b6cf0', '#5a4bd1') +
      book(20, 46, 124, 28, '#4cc9a0', '#2fa57f') +
      '<g fill="none" stroke="#ffd166" stroke-width="5"><circle cx="66" cy="28" r="15"/><circle cx="106" cy="28" r="15"/><path d="M81 28h10M51 26l-12-6M121 26l12-6"/></g>' +
      '</svg>';
  }

  // Hero right: books standing on a wooden shelf.
  function shelf() {
    return '<svg viewBox="0 0 180 150" aria-hidden="true">' +
      '<ellipse cx="96" cy="142" rx="64" ry="7" fill="#2a1f78" opacity=".25"/>' +
      '<rect x="30" y="34" width="22" height="80" rx="4" fill="#f7c35f"/><rect x="34" y="46" width="14" height="5" rx="2" fill="#fff" opacity=".8"/>' +
      '<rect x="54" y="20" width="24" height="94" rx="4" fill="#9b8cfb"/><rect x="58" y="34" width="16" height="5" rx="2" fill="#fff" opacity=".8"/>' +
      '<rect x="80" y="44" width="18" height="70" rx="4" fill="#ff8fb3"/>' +
      '<rect x="104" y="30" width="22" height="84" rx="4" fill="#5ccfa6" transform="rotate(10 115 72)"/>' +
      '<rect x="134" y="62" width="30" height="52" rx="4" fill="#6aa8ff"/>' +
      '<rect x="18" y="114" width="156" height="14" rx="5" fill="#f2a65a"/>' +
      '<rect x="36" y="128" width="12" height="16" rx="3" fill="#d9853a"/><rect x="146" y="128" width="12" height="16" rx="3" fill="#d9853a"/>' +
      '</svg>';
  }

  // 3D picture groups for banners: one big object with small ones floating around it
  function scene(big, small1, small2) {
    var p = 'img/3d/';
    return '<div class="scene3d" aria-hidden="true">' +
      '<img class="s-big" src="' + p + big + '.png" alt="" />' +
      '<img class="s-a" src="' + p + small1 + '.png" alt="" />' +
      '<img class="s-b" src="' + p + small2 + '.png" alt="" /></div>';
  }

  return { cover: cover, hero: hero, shelf: shelf, scene: scene, color: color };
})();
