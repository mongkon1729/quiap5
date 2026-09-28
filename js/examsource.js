// Loads exams from data/questions.json plus the teacher's "ข้อสอบ" tab in Google Sheets.
// Sheet exams are cached so students still see them when the network drops.
var ExamSource = (function () {
  var CACHE_KEY = 'quizapp_sheet_exams_v1';
  var TIMEOUT_MS = 12000;

  var COLUMNS = {
    exam: ['ชุดข้อสอบ', 'ชื่อชุด', 'exam', 'exam_title', 'title'],
    subject: ['วิชา', 'รายวิชา', 'subject'],
    grade: ['ระดับชั้น', 'ชั้น', 'grade'],
    learningArea: ['กลุ่มสาระ', 'กลุ่มสาระการเรียนรู้', 'learning_area'],
    courseCode: ['รหัสวิชา', 'course_code'],
    strand: ['สาระ', 'strand'],
    standard: ['มาตรฐาน', 'standard'],
    unit: ['หน่วยการเรียนรู้', 'หน่วย', 'unit'],
    lesson: ['เรื่อง', 'lesson'],
    examType: ['ประเภทการสอบ', 'ประเภท', 'exam_type'],
    examDifficulty: ['ความยากของชุด', 'exam_difficulty'],
    difficulty: ['ความยาก', 'difficulty'],
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
          subject: '',
          timeLimitMinutes: 0,
          source: 'sheets',
          questions: []
        };
        order.push(exam);
      }
      if (!exam.timeLimitMinutes) exam.timeLimitMinutes = parseInt(cell(row, 'minutes'), 10) || 0;
      SET_FIELDS.forEach(function (f) {
        var key = f === 'examDifficulty' ? 'difficulty' : f;
        if (!exam[key]) exam[key] = cell(row, f);
      });

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
        difficulty: normalizeDifficulty(cell(row, 'difficulty')),
        sheetRow: rowNo
      });
    }

    order.forEach(function (e) {
      if (!e.timeLimitMinutes) e.timeLimitMinutes = Math.max(5, Math.round(e.questions.length * 1.5));
    });
    return { exams: order, issues: issues };
  }

  var SET_FIELDS = ['subject', 'grade', 'learningArea', 'courseCode', 'strand', 'standard', 'unit', 'lesson', 'examType', 'examDifficulty'];

  var LEARNING_AREAS = {
    'ท': 'ภาษาไทย', 'ค': 'คณิตศาสตร์', 'ว': 'วิทยาศาสตร์และเทคโนโลยี', 'ส': 'สังคมศึกษา ศาสนา และวัฒนธรรม',
    'พ': 'สุขศึกษาและพลศึกษา', 'ศ': 'ศิลปะ', 'ง': 'การงานอาชีพ', 'ต': 'ภาษาต่างประเทศ'
  };
  var SOCIAL_STRANDS = {
    '1': 'สาระที่ 1 ศาสนา ศีลธรรม และจริยธรรม',
    '2': 'สาระที่ 2 หน้าที่พลเมือง วัฒนธรรม และการดำเนินชีวิตในสังคม',
    '3': 'สาระที่ 3 เศรษฐศาสตร์',
    '4': 'สาระที่ 4 ประวัติศาสตร์',
    '5': 'สาระที่ 5 ภูมิศาสตร์'
  };
  var DIFFICULTIES = ['ง่าย', 'ปานกลาง', 'ยาก'];
  var EXAM_TYPES = ['ก่อนเรียน', 'ระหว่างเรียน', 'หลังเรียน', 'กลางภาค', 'ปลายภาค', 'ฝึกทำ'];

  function normalizeDifficulty(v) {
    var s = String(v || '').trim();
    if (!s) return '';
    if (/ง่าย|easy/i.test(s)) return 'ง่าย';
    if (/ยาก|hard/i.test(s) && !/ปาน/.test(s)) return 'ยาก';
    if (/ปาน|กลาง|medium/i.test(s)) return 'ปานกลาง';
    return s;
  }

  // "ส 3.1 ป.5/1" -> { area: 'ส', standard: 'ส 3.1', grade: 'ป.5' }
  function splitIndicator(text) {
    var m = String(text || '').replace(/[๐-๙]/g, function (d) { return String(d.charCodeAt(0) - 0x0E50); })
      .match(/([ทควสพศงต])\s*(\d+)\.(\d+)\s*((?:ป|ม)\.\s*\d)/);
    if (!m) return null;
    return { area: m[1], strandNo: m[2], standard: m[1] + ' ' + m[2] + '.' + m[3], grade: m[4].replace(/\s+/g, '') };
  }

  // Fills set-level curriculum info from the questions' indicators when the teacher left it blank.
  function enrich(exam) {
    var standards = [];
    var indicators = [];
    var parts = null;
    exam.questions.forEach(function (q) {
      if (q.difficulty) q.difficulty = normalizeDifficulty(q.difficulty);
      String(q.indicator || '').split(/[,،]/).forEach(function (raw) {
        var ind = raw.trim();
        if (!ind) return;
        if (indicators.indexOf(ind) < 0) indicators.push(ind);
        var p = splitIndicator(ind);
        if (p) {
          parts = parts || p;
          if (standards.indexOf(p.standard) < 0) standards.push(p.standard);
        }
      });
    });
    exam.indicators = indicators;
    if (!exam.standard && standards.length) exam.standard = standards.join(', ');
    if (parts) {
      if (!exam.grade) exam.grade = parts.grade;
      if (!exam.learningArea) exam.learningArea = LEARNING_AREAS[parts.area] || '';
      if (!exam.strand && parts.area === 'ส') {
        var nums = [];
        standards.forEach(function (s) { var n = s.split(' ')[1].split('.')[0]; if (nums.indexOf(n) < 0) nums.push(n); });
        exam.strand = nums.map(function (n) { return SOCIAL_STRANDS[n]; }).filter(Boolean).join(', ');
      }
    }
    exam.difficulty = normalizeDifficulty(exam.difficulty);
    if (!exam.difficulty) {
      var count = { 'ง่าย': 0, 'ปานกลาง': 0, 'ยาก': 0 };
      var rated = 0;
      exam.questions.forEach(function (q) { if (count[q.difficulty] != null) { count[q.difficulty]++; rated++; } });
      if (rated) {
        exam.difficulty = DIFFICULTIES.reduce(function (best, d) { return count[d] > count[best] ? d : best; }, 'ปานกลาง');
        exam.difficultyDerived = true;
      }
    }
    if (!exam.subject) exam.subject = exam.learningArea ? exam.learningArea.split(' ')[0] : '';
    return exam;
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
        lastVersion = data.version || 3;
        return data.values;
      }, function (err) {
        clearTimeout(timer);
        throw err;
      });
  }

  function combine(fileExams, values, status, savedAt) {
    var parsed = values ? parseSheet(values) : { exams: [], issues: [] };
    fileExams.forEach(enrich);
    parsed.exams.forEach(enrich);
    return {
      exams: fileExams.concat(parsed.exams),
      sheetExams: parsed.exams,
      issues: parsed.issues,
      sheetStatus: status,
      sheetSavedAt: savedAt || null,
      scriptVersion: status === 'fresh' ? lastVersion : null
    };
  }

  var lastVersion = null;

  // Calls onData once with file exams + cached sheet exams, then again when fresh sheet data arrives.
  function load(onData, onError) {
    var fileExams = null;
    var cache = readCache();

    fetch('data/questions.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        fileExams = (data.exams || []).map(function (e) { e.source = 'file'; return e; });        if (!sheetsUrl()) { onData(combine(fileExams, null, 'off')); return; }

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

  // ---------- วิชา → บท → เรื่อง (ใช้ทั้งหน้านักเรียนและหน้าครู) ----------

  var SUBJECTS = [
    { name: 'คณิตศาสตร์', match: /คณิต|^ค$/, icon: '🧮', c1: '#dfe4ff', c2: '#b4c0fb', ink: '#2d3a9c' },
    { name: 'วิทยาศาสตร์', match: /วิทย|^ว$/, icon: '🔬', c1: '#d9f3e4', c2: '#a6dcbd', ink: '#1d6a44' },
    { name: 'ภาษาไทย', match: /ภาษาไทย|^ท$/, icon: '📖', c1: '#ffe3e9', c2: '#f5b3c2', ink: '#8e2f4a' },
    { name: 'สังคมศึกษา', match: /สังคม|^ส$/, icon: '🌏', c1: '#fff3cc', c2: '#f7d56e', ink: '#6b4800' },
    { name: 'ภาษาอังกฤษ', match: /อังกฤษ|ต่างประเทศ|english|^ต$|^อ$/i, icon: '🔤', c1: '#ece4fc', c2: '#cdbcf2', ink: '#5a3a9e' },
    { name: 'สุขศึกษาและพลศึกษา', match: /สุขศึกษา|พลศึกษา|^พ$/, icon: '⚽', c1: '#ffe8d9', c2: '#f8c39c', ink: '#8a4516' },
    { name: 'ศิลปะ', match: /ศิลป|ดนตรี|นาฏ|^ศ$/, icon: '🎨', c1: '#ffe3f3', c2: '#f0b3da', ink: '#86306a' },
    { name: 'การงานอาชีพ', match: /การงาน|^ง$/, icon: '🛠️', c1: '#e3f0f8', c2: '#b3d4ea', ink: '#1f5579' }
  ];
  var OTHER_UNIT = 'เรื่องอื่นๆ';

  function subjectOf(exam) {
    var texts = [exam.subject, exam.learningArea].filter(Boolean).map(function (t) { return String(t).trim(); });
    for (var i = 0; i < SUBJECTS.length; i++) {
      if (texts.some(function (t) { return SUBJECTS[i].match.test(t); })) return SUBJECTS[i];
    }
    return { name: texts[0] || 'วิชาอื่นๆ', icon: '📚', c1: '#f1ede6', c2: '#dcd5ca', ink: '#4a4552' };
  }

  // บทใหญ่ = หน่วยการเรียนรู้ ถ้าไม่ได้ใส่ ใช้สาระตามหลักสูตรแกนกลางแทน
  function unitOf(exam) {
    var u = String(exam.unit || '').trim() || String(exam.strand || '').split(',')[0].trim();
    return u || OTHER_UNIT;
  }

  function lessonOf(exam) {
    return String(exam.lesson || '').trim();
  }

  // Groups keep the order exams appear in the data, so the teacher controls the order.
  function groupBy(list, keyFn) {
    var order = [];
    var map = {};
    list.forEach(function (item) {
      var k = keyFn(item);
      if (!map[k]) { map[k] = []; order.push(k); }
      map[k].push(item);
    });
    return order.map(function (k) { return { key: k, items: map[k] }; });
  }

  function escHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // opts: { href | attrs, theme, icon, kicker, title, sub, pct (0-100 or null), big, delay }
  function navCardHtml(opts) {
    var t = opts.theme;
    var tag = opts.href ? 'a' : 'button';
    var style = '--c1:' + t.c1 + ';--c2:' + t.c2 + ';--c-ink:' + t.ink + ';animation-delay:' + (opts.delay || 0) + 'ms';
    return '<' + tag + ' class="nav-card' + (opts.big ? ' nav-card-big' : '') + '" style="' + style + '"' +
      (opts.href ? ' href="' + escHtml(opts.href) + '"' : ' type="button" ' + (opts.attrs || '')) + '>' +
      '<span class="nav-card-text">' +
        (opts.kicker ? '<span class="nav-card-kicker">' + escHtml(opts.kicker) + '</span>' : '') +
        '<span class="nav-card-title">' + escHtml(opts.title) + '</span>' +
        '<span class="nav-card-sub">' + escHtml(opts.sub) + '</span>' +
      '</span>' +
      '<span class="nav-card-icon" aria-hidden="true">' + (opts.icon || t.icon) + '</span>' +
      (opts.pct != null ? '<span class="nav-card-meter" aria-hidden="true"><span style="width:' + Math.max(0, Math.min(100, opts.pct)) + '%"></span></span>' : '') +
      '</' + tag + '>';
  }

  return {
    load: load,
    parseSheet: parseSheet,
    enrich: enrich,
    normalizeDifficulty: normalizeDifficulty,
    DIFFICULTIES: DIFFICULTIES,
    EXAM_TYPES: EXAM_TYPES,
    SUBJECTS: SUBJECTS,
    OTHER_UNIT: OTHER_UNIT,
    subjectOf: subjectOf,
    unitOf: unitOf,
    lessonOf: lessonOf,
    groupBy: groupBy,
    navCardHtml: navCardHtml,
    isEnabled: function () { return !!sheetsUrl(); }
  };
})();
