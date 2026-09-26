// Loaded in <head> before the CSS so the page never flashes the wrong theme.
var Theme = (function () {
  var KEY = 'quizapp_theme';
  var media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  var listeners = [];

  function get() {
    try {
      var v = window.localStorage.getItem(KEY);
      return v === 'light' || v === 'dark' ? v : 'auto';
    } catch (e) {
      return 'auto';
    }
  }

  function resolved() {
    var pref = get();
    if (pref !== 'auto') return pref;
    return media && media.matches ? 'dark' : 'light';
  }

  function apply() {
    document.documentElement.setAttribute('data-theme', resolved());
    listeners.forEach(function (fn) { fn(); });
  }

  function set(value) {
    try {
      if (value === 'auto') window.localStorage.removeItem(KEY);
      else window.localStorage.setItem(KEY, value);
    } catch (e) { /* not remembered, still applied for this visit */ }
    var mode = value === 'auto' ? (media && media.matches ? 'dark' : 'light') : value;
    document.documentElement.setAttribute('data-theme', mode);
    listeners.forEach(function (fn) { fn(); });
  }

  function toggle() {
    set(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  }

  if (media) {
    var onChange = function () { if (get() === 'auto') apply(); };
    if (media.addEventListener) media.addEventListener('change', onChange);
    else if (media.addListener) media.addListener(onChange);
  }

  apply();

  return {
    get: get,
    resolved: resolved,
    set: set,
    toggle: toggle,
    onChange: function (fn) { listeners.push(fn); }
  };
})();
