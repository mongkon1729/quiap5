// account.js — student login with username + password that the teacher sets in Google Sheets.
// The session is remembered on this device; progress (best scores, wrong answers) is copied
// to the sheet so it follows the student to any device.
var Account = (function () {
  var SESSION_KEY = 'quizapp_session_v1';
  var TIMEOUT_MS = 15000;
  var memorySession = null;
  var pushTimer = null;

  function url() {
    return (window.QUIZ_CONFIG && window.QUIZ_CONFIG.sheetsUrl || '').trim();
  }

  function getSession() {
    try {
      var raw = window.localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : memorySession;
    } catch (e) {
      return memorySession;
    }
  }

  function setSession(session) {
    memorySession = session;
    try {
      if (session) window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      else window.localStorage.removeItem(SESSION_KEY);
    } catch (e) { /* this session only */ }
  }

  function post(body) {
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, TIMEOUT_MS);
    return fetch(url(), {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body),
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (res) {
      clearTimeout(timer);
      return res.json();
    }, function (err) {
      clearTimeout(timer);
      throw err;
    });
  }

  // Resolves with the session, or rejects with a message a child can act on.
  function login(username, password) {
    if (!url()) return Promise.reject(new Error('เว็บยังไม่ได้เชื่อมกับระบบของคุณครู บอกคุณครูนะ'));
    return post({ action: 'studentLogin', username: username, password: password }).then(function (reply) {
      if (reply && reply.ok && reply.student) {
        var s = reply.student;
        var session = {
          username: s.username,
          name: s.name || s.username,
          number: s.number || '',
          room: s.room || '',
          token: reply.token
        };
        setSession(session);
        Storage.ensureProfile(session.username, displayName(session));
        if (reply.progress) Storage.importProgress(session.username, reply.progress);
        return session;
      }
      if (reply && reply.error === 'wrong') throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูก ลองพิมพ์ใหม่ ถ้ายังเข้าไม่ได้ให้บอกคุณครูนะ');
      throw new Error('ระบบยังไม่พร้อม บอกคุณครูให้อัปเดตสคริปต์ Google นะ');
    }, function () {
      throw new Error('ไม่มีเน็ต เข้าสู่ระบบครั้งแรกต้องต่อเน็ตก่อนนะ');
    });
  }

  function logout() {
    flushProgress();
    setSession(null);
  }

  function displayName(session) {
    session = session || getSession();
    if (!session) return '';
    return [session.number, session.name].filter(Boolean).join(' ');
  }

  // Pull newer progress saved from another device. Quietly does nothing when offline.
  function refreshProgress() {
    var s = getSession();
    if (!s || !url()) return Promise.resolve(false);
    return post({ action: 'studentProgress', username: s.username, token: s.token }).then(function (reply) {
      if (reply && reply.error === 'token') { setSession(null); return 'signedOut'; }
      if (reply && reply.ok && reply.progress) return Storage.importProgress(s.username, reply.progress);
      return false;
    }, function () { return false; });
  }

  // Waits a moment so several changes in a row are sent together.
  function pushProgress() {
    clearTimeout(pushTimer);
    pushTimer = setTimeout(flushProgress, 1500);
  }

  function flushProgress() {
    clearTimeout(pushTimer);
    var s = getSession();
    if (!s || !url()) return;
    post({ action: 'saveProgress', username: s.username, token: s.token, progress: Storage.exportProgress(s.username) })
      .catch(function () { /* sent again after the next change */ });
  }

  window.addEventListener('online', flushProgress);

  return {
    getSession: getSession,
    login: login,
    logout: logout,
    displayName: displayName,
    refreshProgress: refreshProgress,
    pushProgress: pushProgress,
    isEnabled: function () { return !!url(); }
  };
})();
