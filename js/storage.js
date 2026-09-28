// storage.js — localStorage wrapper: profiles, PIN, best scores, wrong answers.
// Falls back to an in-memory store (lost on reload) when localStorage is unavailable.

var Storage = (function () {
  var STORAGE_KEY = 'quizapp_profiles_v1';
  var storageAvailable = null;
  var memoryProfiles = {};

  function isAvailable() {
    if (storageAvailable !== null) return storageAvailable;
    try {
      var testKey = '__quizapp_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      storageAvailable = true;
    } catch (e) {
      storageAvailable = false;
    }
    return storageAvailable;
  }

  function loadProfiles() {
    if (!isAvailable()) return memoryProfiles;
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveProfiles(profiles) {
    if (!isAvailable()) {
      memoryProfiles = profiles;
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    } catch (e) {
      // Quietly ignore write failures (e.g. quota exceeded); app still works this session.
    }
  }

  function simpleHash(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) {
      h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
    }
    return (h >>> 0).toString(36);
  }

  function normalizeName(name) {
    return String(name || '').trim().toLowerCase();
  }

  function profileExists(name) {
    var profiles = loadProfiles();
    return !!profiles[normalizeName(name)];
  }

  function verifyOrCreate(name, pin) {
    var key = normalizeName(name);
    var profiles = loadProfiles();
    var pinHash = simpleHash(pin);

    if (profiles[key]) {
      if (profiles[key].pinHash === pinHash) {
        return { ok: true, isNew: false, profile: profiles[key] };
      }
      return { ok: false, reason: 'wrong_pin' };
    }

    var profile = {
      displayName: String(name).trim(),
      pinHash: pinHash,
      bestScores: {},
      wrongQuestions: []
    };
    profiles[key] = profile;
    saveProfiles(profiles);
    return { ok: true, isNew: true, profile: profile };
  }

  function getProfile(name) {
    var profiles = loadProfiles();
    return profiles[normalizeName(name)] || null;
  }

  function saveBestScore(name, examId, score, total) {
    var key = normalizeName(name);
    var profiles = loadProfiles();
    var profile = profiles[key];
    if (!profile) return;
    var prev = profile.bestScores[examId];
    if (!prev || score > prev.score) {
      profile.bestScores[examId] = { score: score, total: total, date: new Date().toISOString() };
      touch(profile);
      saveProfiles(profiles);
    }
  }

  function getBestScore(name, examId) {
    var profile = getProfile(name);
    if (!profile) return null;
    return profile.bestScores[examId] || null;
  }

  function addWrongQuestion(name, examId, questionId) {
    var key = normalizeName(name);
    var profiles = loadProfiles();
    var profile = profiles[key];
    if (!profile) return;
    var exists = profile.wrongQuestions.some(function (w) {
      return w.examId === examId && w.questionId === questionId;
    });
    if (!exists) {
      profile.wrongQuestions.push({ examId: examId, questionId: questionId });
      touch(profile);
      saveProfiles(profiles);
    }
  }

  function removeWrongQuestion(name, examId, questionId) {
    var key = normalizeName(name);
    var profiles = loadProfiles();
    var profile = profiles[key];
    if (!profile) return;
    profile.wrongQuestions = profile.wrongQuestions.filter(function (w) {
      return !(w.examId === examId && w.questionId === questionId);
    });
    touch(profile);
    saveProfiles(profiles);
  }

  function getWrongQuestions(name) {
    var profile = getProfile(name);
    return profile ? profile.wrongQuestions.slice() : [];
  }

  // ---------- accounts set by the teacher (no PIN; the key is the username) ----------

  function ensureProfile(username, displayName) {
    var key = normalizeName(username);
    var profiles = loadProfiles();
    if (!profiles[key]) {
      profiles[key] = { displayName: displayName || username, bestScores: {}, wrongQuestions: [], updatedAt: 0 };
    } else if (displayName) {
      profiles[key].displayName = displayName;
    }
    saveProfiles(profiles);
  }

  function touch(profile) {
    profile.updatedAt = Date.now();
  }

  function exportProgress(username) {
    var p = getProfile(username);
    if (!p) return null;
    return { bestScores: p.bestScores, wrongQuestions: p.wrongQuestions, updatedAt: p.updatedAt || 0 };
  }

  // Takes progress saved on another device when it is newer than ours. Returns true if it changed anything.
  function importProgress(username, data) {
    if (!data || typeof data !== 'object') return false;
    var key = normalizeName(username);
    var profiles = loadProfiles();
    var p = profiles[key];
    if (!p || (data.updatedAt || 0) <= (p.updatedAt || 0)) return false;
    p.bestScores = data.bestScores || {};
    p.wrongQuestions = data.wrongQuestions || [];
    p.updatedAt = data.updatedAt;
    saveProfiles(profiles);
    return true;
  }

  return {
    ensureProfile: ensureProfile,
    exportProgress: exportProgress,
    importProgress: importProgress,
    isAvailable: isAvailable,
    profileExists: profileExists,
    verifyOrCreate: verifyOrCreate,
    getProfile: getProfile,
    saveBestScore: saveBestScore,
    getBestScore: getBestScore,
    addWrongQuestion: addWrongQuestion,
    removeWrongQuestion: removeWrongQuestion,
    getWrongQuestions: getWrongQuestions
  };
})();
