// Loads exams from data/questions.json plus the teacher's "ข้อสอบ" tab in Google Sheets.
// Sheet exams are cached so students still see them when the network drops.
var ExamSource = (function () {
  var CACHE_KEY = 'quizapp_sheet_exams_v1';
  var TIMEOUT_MS = 12000;

  var COLUMNS = {
    exam: ['ชุดข้อสอบ', 'ชื่อชุด', 'exam', 'exam_title', 'title'],
    subject: ['วิชา', 'subject'],
    minutes: ['เวลา(นาที)', 'เวลา', 'นาที', 'minutes', 'time_limit'],
    topic: ['หัวข้อ', 'topic'],
    indicator: ['ตัวชี้วัด', 'indicator'],
    bloom: ['bloom', 'ระดับการคิด'],
    question: ['คำถาม', 'โจทย์', 'question'],
    a: ['ก', 'ตัวเลือก ก', 'choice_a', 'a'],
    b: ['ข', 'ตัวเลือก ข', 'choice_b', 'b'],
    c: ['ค', 'ตัวเลือก ค', 'choice_c', 'c'],
    d: ['ง', 'ตัวเลือก ง', 'choice_d', 'd'],
    answer: ['คำตอบ', 'เฉลย', 'answer'],
    explanation: ['คำอธิบาย', 'explanation'],
    image: ['รูปภาพ', 'รูป', 'image']
  };

  var ANSWERS = { 'ก': 0, 'ข': 1, 'ค': 2, 'ง': 3, 'a': 0, 'b': 1, 'c': 2, 'd': 3, '1': 0, '2': 1, '3': 2, '4': 3 };

  function sheetsUrl() {
    return (window.QUIZ_CONFIG && window.QUIZ_CONFIG.sheetsUrl || '').trim();
  }

  function norm(s) {
    return String(s == null ? '' : s).trim().toLowerCase().replace(/\s+/g, ' ');
  }

  function hash(text) {
    var h = 0;
    for (var i = 0; i < text.length; i++) h = (Math.imul(31, h) + text.charCodeAt(i)) | 0;
    return (h >>> 0).toString(36);
  }

  function parseAnswer(value) {
    var v = norm(value).replace(/[.)\s]/g, '');
    if (!v) return -1;
    if (v in ANSWERS) return ANSWERS[v];
    var first = v.charAt(0);
    return first in ANSWERS ? ANSWERS[first] : -1;
  }

  // values: 2D array from the sheet (first row = headers). Returns { exams, issues }.
  function parseSheet(values) {
    var issues = [];
    if (!values || values.length < 2) return { exams: [], issues: issues };

    var header = values[0].map(norm);
    var col = {};
    Object.keys(COLUMNS).forEach(function (field) {
      col[field] = -1;
      for (var i = 0; i < header.length; i++) {
        if (COLUMNS[field].indexOf(header[i]) >= 0) { col[field] = i; break; }
      }
    });
    ['exam', 'question', 'a', 'b', 'c', 'd', 'answer'].forEach(function (f) {
      if (col[f] < 0) issues.push({ row: 1, message: 'ไม่พบคอลัมน์ "' + COLUMNS[f][0] + '" ในแถวหัวตาราง' });
    });
    if (issues.length) return { exams: [], issues: issues };

    function cell(row, field) {
      return col[field] < 0 ? '' : String(row[col[field]] == null ? '' : row[col[field]]).trim();
    }

    var order = [];
    var byTitle = {};
    var lastTitle = '';

    for (var r = 1; r < values.length; r++) {
      var row = values[r];
      var rowNo = r + 1;
      var question = cell(row, 'question');
      var title = cell(row, 'exam') || lastTitle;
      var choices = [cell(row, 'a'), cell(row, 'b'), cell(row, 'c'), cell(row, 'd')];
      var blank = !question && !choices.join('') && !cell(row, 'answer');
      if (blank) continue;
      lastTitle = title;

      if (!title) { issues.push({ row: rowNo, message: 'ยังไม่ได้ใส่ชื่อชุดข้อสอบ' }); continue; }
      if (!question) { issues.push({ row: rowNo, message: 'ยังไม่ได้ใส่คำถาม' }); continue; }
      if (choices.some(function (c) { return !c; })) { issues.push({ row: rowNo, message: 'ตัวเลือกไม่ครบ 4 ข้อ (ก ข ค ง)' }); continue; }
      var answer = parseAnswer(cell(row, 'answer'));
      if (answer < 0) { issues.push({ row: rowNo, message: 'คำตอบต้องเป็น ก ข ค หรือ ง' }); continue; }

      var exam = byTitle[title];
      if (!exam) {
        exam = byTitle[title] = {
          id: 'sheet-' + hash(title),
          title: title,
          subject: cell(row, 'subject') || 'สังคมศึกษา',
          timeLimitMinutes: parseInt(cell(row, 'minutes'), 10) || 0,
          source: 'sheets',
          questions: []
        };
        order.push(exam);
      }
      if (!exam.timeLimitMinutes) exam.timeLimitMinutes = parseInt(cell(row, 'minutes'), 10) || 0;

      var qid = 'h' + hash(question);
      if (exam.questions.some(function (q) { return q.id === qid; })) {
        issues.push({ row: rowNo, message: 'คำถามซ้ำกับข้อก่อนหน้าในชุดเดียวกัน' });
        continue;
      }
      exam.questions.push({
        id: qid,
        topic: cell(row, 'topic') || cell(row, 'indicator'),
        question: question,
        image: cell(row, 'image') || null,
        choices: choices,
        answer: answer,
        explanation: cell(row, 'explanation'),
        indicator: cell(row, 'indicator'),
        bloom: cell(row, 'bloom'),
        sheetRow: rowNo
      });
    }

    order.forEach(function (e) {
      if (!e.timeLimitMinutes) e.timeLimitMinutes = Math.max(5, Math.round(e.questions.length * 1.5));
    });
    return { exams: order, issues: issues };
  }

  function readCache() {
    try {
      var raw = window.localStorage.getItem(CACHE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function writeCache(values) {
    try {
      window.localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), values: values }));
    } catch (e) { /* cache is best-effort */ }
  }

  function fetchSheetValues() {
    var url = sheetsUrl();
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, TIMEOUT_MS);
    return fetch(url + (url.indexOf('?') >= 0 ? '&' : '?') + 'action=exams', ctrl ? { signal: ctrl.signal } : {})
      .then(function (res) { return res.json(); })
      .then(function (data) {
        clearTimeout(timer);
        if (!data || !data.ok || !Array.isArray(data.values)) throw new Error('bad response');
        return data.values;
      }, function (err) {
        clearTimeout(timer);
        throw err;
      });
  }

  function combine(fileExams, values, status, savedAt) {
    var parsed = values ? parseSheet(values) : { exams: [], issues: [] };
    return {
      exams: fileExams.concat(parsed.exams),
      sheetExams: parsed.exams,
      issues: parsed.issues,
      sheetStatus: status,
      sheetSavedAt: savedAt || null
    };
  }

  // Calls onData once with file exams + cached sheet exams, then again when fresh sheet data arrives.
  function load(onData, onError) {
    var fileExams = null;
    var cache = readCache();

    fetch('data/questions.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        fileExams = (data.exams || []).map(function (e) { e.source = 'file'; return e; });
        if (!sheetsUrl()) { onData(combine(fileExams, null, 'off')); return; }

        onData(combine(fileExams, cache && cache.values, cache ? 'cached' : 'loading', cache && cache.savedAt));
        fetchSheetValues().then(function (values) {
          writeCache(values);
          onData(combine(fileExams, values, 'fresh', Date.now()));
        }, function () {
          onData(combine(fileExams, cache && cache.values, cache ? 'cached' : 'error', cache && cache.savedAt));
        });
      })
      .catch(function (err) {
        if (onError) onError(err);
      });
  }

  return { load: load, parseSheet: parseSheet, isEnabled: function () { return !!sheetsUrl(); } };
})();
