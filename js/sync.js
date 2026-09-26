// Sends finished attempts to the teacher's Google Sheet. Unsent results wait in an
// outbox (localStorage) and are retried on the next page load or attempt.
var ResultSync = (function () {
  var OUTBOX_KEY = 'quizapp_outbox_v1';
  var memoryOutbox = [];
  var flushing = false;

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

  function flush() {
    if (!url() || flushing) return;
    var items = readOutbox();
    if (!items.length) return;
    flushing = true;
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
    chain.catch(function () {}).then(function () { flushing = false; });
  }

  function submit(result) {
    if (!url()) return;
    result.clientId = newId();
    var items = readOutbox();
    items.push(result);
    writeOutbox(items.slice(-200));
    flush();
  }

  window.addEventListener('online', flush);

  return { submit: submit, flush: flush, isEnabled: function () { return !!url(); } };
})();
