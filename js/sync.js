// Sends finished attempts to the teacher's Google Sheet. Unsent results wait in an
// outbox (localStorage) and are retried on the next page load or attempt.
var ResultSync = (function () {
  var OUTBOX_KEY = 'quizapp_outbox_v1';
  var memoryOutbox = [];
  var current = null;

  function url() {
    return (window.QUIZ_CONFIG && window.QUIZ_CONFIG.sheetsUrl || '').trim();
  }

  function readOutbox() {
    try {
      var raw = window.localStorage.getItem(OUTBOX_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return memoryOutbox;
    }
  }

  function writeOutbox(items) {
    try {
      window.localStorage.setItem(OUTBOX_KEY, JSON.stringify(items));
    } catch (e) {
      memoryOutbox = items;
    }
  }

  function newId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }

  function send(item) {
    // text/plain + no-cors avoids a CORS preflight that Apps Script cannot answer.
    return fetch(url(), {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(item)
    });
  }

  // Resolves when this round of sending is over (sent or not).
  function flush() {
    if (!url()) return Promise.resolve();
    if (current) return current.then(flush);
    var items = readOutbox();
    if (!items.length) return Promise.resolve();
    var remaining = items.slice();
    var chain = Promise.resolve();
    items.forEach(function (item) {
      chain = chain.then(function () {
        return send(item).then(function () {
          remaining = remaining.filter(function (r) { return r.clientId !== item.clientId; });
          writeOutbox(remaining);
        });
      });
    });
    current = chain.catch(function () {}).then(function () { current = null; });
    return current;
  }

  function isQueued(clientId) {
    return readOutbox().some(function (r) { return r.clientId === clientId; });
  }

  // Resolves true when the teacher's sheet got it, false when it waits in the outbox.
  function submit(result) {
    if (!url()) return null;
    result.clientId = newId();
    var items = readOutbox();
    items.push(result);
    writeOutbox(items.slice(-200));
    if (navigator.onLine === false) return Promise.resolve(false);
    return flush().then(function () { return !isQueued(result.clientId); });
  }

  window.addEventListener('online', flush);

  return { submit: submit, flush: flush, isEnabled: function () { return !!url(); } };
})();
