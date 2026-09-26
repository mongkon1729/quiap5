var Art = (function () {
  var PALETTE = ['var(--yellow)', 'var(--blue)', 'var(--pink)', 'var(--mint)', 'var(--peach)', 'var(--lilac)'];
  var INK = 'var(--line)';

  function color(i) {
    return PALETTE[((i % PALETTE.length) + PALETTE.length) % PALETTE.length];
  }

  function cover(i) {
    var bg = color(i);
    var a = color(i + 1);
    var b = color(i + 2);
    var variants = [
      '<circle cx="250" cy="60" r="58" fill="' + a + '" stroke="' + INK + '" stroke-width="3"/>' +
      '<path d="M-10 110 C 60 40, 120 150, 200 80 S 320 60, 340 30" fill="none" stroke="' + INK + '" stroke-width="3"/>' +
      '<rect x="40" y="26" width="64" height="64" rx="14" fill="' + b + '" stroke="' + INK + '" stroke-width="3" transform="rotate(-10 72 58)"/>',

      '<path d="M170 -10 C 230 40, 300 20, 330 90 L 330 -10 Z" fill="' + a + '" stroke="' + INK + '" stroke-width="3"/>' +
      '<circle cx="80" cy="72" r="34" fill="' + b + '" stroke="' + INK + '" stroke-width="3"/>' +
      '<path d="M140 100 l18 -30 l18 30 z" fill="var(--paper)" stroke="' + INK + '" stroke-width="3"/>' +
      '<circle cx="230" cy="96" r="7" fill="' + INK + '"/><circle cx="256" cy="96" r="7" fill="' + INK + '"/>',

      '<rect x="190" y="18" width="110" height="84" rx="18" fill="' + a + '" stroke="' + INK + '" stroke-width="3"/>' +
      '<path d="M205 50 h80 M205 70 h55" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M20 30 q 25 -25 50 0 t 50 0 t 50 0" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>' +
      '<circle cx="70" cy="90" r="20" fill="' + b + '" stroke="' + INK + '" stroke-width="3"/>',

      '<path d="M-10 120 L 80 40 L 150 120 Z" fill="' + a + '" stroke="' + INK + '" stroke-width="3"/>' +
      '<path d="M100 120 L 200 20 L 300 120 Z" fill="' + b + '" stroke="' + INK + '" stroke-width="3"/>' +
      '<circle cx="265" cy="38" r="18" fill="var(--yellow)" stroke="' + INK + '" stroke-width="3"/>'
    ];
    return '<svg viewBox="0 0 320 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
      '<rect width="320" height="120" fill="' + bg + '"/>' + variants[((i % 4) + 4) % 4] + '</svg>';
  }

  function hero() {
    return '<svg viewBox="0 0 100 100" aria-hidden="true">' +
      '<circle cx="54" cy="54" r="42" fill="var(--blue)" stroke="' + INK + '" stroke-width="3"/>' +
      '<rect x="24" y="30" width="46" height="56" rx="6" fill="var(--paper)" stroke="' + INK + '" stroke-width="3" transform="rotate(-8 47 58)"/>' +
      '<path d="M33 46 h26 M33 57 h20 M33 68 h24" stroke="' + INK + '" stroke-width="3" stroke-linecap="round" transform="rotate(-8 47 58)"/>' +
      '<circle cx="78" cy="24" r="12" fill="var(--yellow)" stroke="' + INK + '" stroke-width="3"/>' +
      '<path d="M72 24 l4 4 l8 -8" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>';
  }

  return { cover: cover, hero: hero, color: color };
})();
