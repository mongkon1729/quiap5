(function () {
  'use strict';

  var KEY_STORE = 'quizapp_teacher_key_v1';
  var SCRIPT_VERSION = 8;
  var SHEETS_URL = (window.QUIZ_CONFIG && window.QUIZ_CONFIG.sheetsUrl || '').trim();
  var LETTERS = ['ก', 'ข', 'ค', 'ง'];

  var ICONS = {
    overview: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
    students: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6.5 6.5 0 0 1 3.5 5.5"/></svg>',
    analysis: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
    bank: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z"/><path d="M20 4h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7z"/></svg>',
    settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
    accounts: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2.5"/><path d="M5.5 16.5a3.5 3.5 0 0 1 7 0M15 10h3M15 14h3"/></svg>',
    import: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>',
    auto: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>',
    teacher: '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="15" r="7" fill="var(--paper)" stroke="var(--line)" stroke-width="2.5"/><path d="M7 36c1.5-8 7-11 13-11s11.5 3 13 11" fill="var(--blue)" stroke="var(--line)" stroke-width="2.5"/><path d="M14 13h12" stroke="var(--line)" stroke-width="2.5" stroke-linecap="round"/></svg>'
  };

  var NAV = [
    { id: 'overview', label: 'ภาพรวม' },
    { id: 'students', label: 'ผลนักเรียน' },
    { id: 'analysis', label: 'วิเคราะห์ข้อสอบ' },
    { id: 'bank', label: 'คลังข้อสอบ' },
    { id: 'import', label: 'นำเข้าข้อสอบ' },
    { id: 'accounts', label: 'บัญชีนักเรียน' },
    { id: 'settings', label: 'ตั้งค่า' }
  ];

  var state = {
    exams: [],
    rows: [],
    demo: false,
    connected: false,
    loadedAt: null,
    view: 'overview',
    studentKey: null,
    analysisExamId: null,
    bankExamId: null,
    bankNav: { subject: '', unit: '', lesson: '' },
    edit: null,
    sheet: null,
    draft: null,
    importMsg: null,
    pick: { area: 'ส', grade: 'ป.5', touched: false, codes: {}, title: '', subject: '', courseCode: '', unit: '', lesson: '', examType: '', count: '10' },
    importing: false,
    accounts: { list: null, loading: false, msg: null, draft: null, room: 'p5', paste: '', showPass: false, busy: false, editing: null, edit: null },
    studentQuery: '',
    scriptText: null,
    stats: null
  };

  // ---------- helpers ----------

  function $(id) { return document.getElementById(id); }

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function lsGet(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function lsSet(key, value) {
    try {
      if (value == null) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, value);
    } catch (e) { /* storage blocked: key just isn't remembered */ }
  }

  function pct(a, b) { return b > 0 ? Math.round((a / b) * 100) : 0; }
  function level(p) { return p >= 80 ? 'good' : (p >= 50 ? 'mid' : 'low'); }

  function bar(p, cls) {
    return '<div class="bar ' + (cls || level(p)) + '"><span style="width:' + Math.max(0, Math.min(100, p)) + '%"></span></div>';
  }

  function colorFor(text) {
    var h = 0;
    for (var i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0;
    return Art.color(Math.abs(h));
  }

  // ---------- curriculum (data/curriculum.json) ----------

  var curriculum = { list: [], byCode: {}, source: '', note: '', areas: [], grades: [] };

  function arabicDigits(s) {
    return String(s || '').replace(/[๐-๙]/g, function (d) { return String(d.charCodeAt(0) - 0x0E50); });
  }

  // "ส3.1 ป.5/2" / "ส ๓.๑ ป.๕/๒" -> "ส 3.1 ป.5/2"
  function normCode(code) {
    var m = arabicDigits(code).match(/([ทควสพศงต])\s*(\d+)\.(\d+)\s*(ป|ม)\.\s*(\d)\s*\/\s*(\d+)/);
    return m ? m[1] + ' ' + m[2] + '.' + m[3] + ' ' + m[4] + '.' + m[5] + '/' + m[6] : '';
  }

  function loadCurriculum() {
    return fetch('data/curriculum.json').then(function (r) { return r.json(); }).then(function (data) {
      curriculum.source = data.source || '';
      curriculum.note = data.note || '';
      curriculum.areas = [];
      curriculum.grades = data.grades || [];
      curriculum.core = {};
      Object.keys(data.areas || {}).forEach(function (letter) {
        var area = data.areas[letter];
        curriculum.areas.push({ letter: letter, name: area.name });
        area.strands.forEach(function (strand) {
          strand.standards.forEach(function (st) {
            Object.keys(st.core || {}).forEach(function (grade) {
              curriculum.core[st.code + '|' + grade] = st.core[grade];
            });
            Object.keys(st.indicators || {}).forEach(function (grade) {
              st.indicators[grade].forEach(function (entry, i) {
                var code = st.code + ' ' + grade + '/' + (i + 1);
                var item = {
                  code: code, text: typeof entry === 'string' ? entry : entry.text, alt: entry.alt || '',
                  grade: grade, standard: st.code, standardText: st.text,
                  strand: 'สาระที่ ' + strand.no + ' ' + strand.name, area: area.name, letter: letter, strandNo: strand.no,
                  revised: strand.revised || area.revised || null
                };
                curriculum.byCode[code] = item;
                curriculum.list.push(item);
              });
            });
          });
        });
      });
    }).catch(function () { /* curriculum is optional reference data */ });
  }

  function indicatorInfo(code) {
    return curriculum.byCode[normCode(code)] || null;
  }

  // Codes we can check: same area/grade/strand as something in the curriculum file.
  function isCheckable(code) {
    var n = normCode(code);
    if (!n) return false;
    var parts = n.split(' ');
    return curriculum.list.some(function (it) {
      return it.letter === parts[0] && it.grade === parts[2].split('/')[0] && it.standard.split('.')[0] === parts[0] + ' ' + parts[1].split('.')[0];
    });
  }

  function unknownIndicators(questions) {
    var bad = [];
    questions.forEach(function (q) {
      String(q.indicator || '').split(/[,،]/).forEach(function (raw) {
        var c = raw.trim();
        if (c && isCheckable(c) && !indicatorInfo(c) && bad.indexOf(c) < 0) bad.push(c);
      });
    });
    return bad;
  }

  function diffPill(d, prefix) {
    if (!d) return '';
    var cls = d === 'ง่าย' ? 'pill-mint' : (d === 'ยาก' ? 'pill-peach' : 'pill-yellow');
    return '<span class="pill ' + cls + '">' + (prefix || '') + esc(d) + '</span>';
  }

  function typePill(t) {
    return t ? '<span class="pill pill-pink">' + esc(t) + '</span>' : '';
  }

  // [label, value] pairs of the set's curriculum info, in the order used on Thai exam papers.
  function metaRows(e) {
    return [
      ['ระดับชั้น', e.grade],
      ['กลุ่มสาระการเรียนรู้', e.learningArea],
      ['รายวิชา', [e.subject, e.courseCode ? '(' + e.courseCode + ')' : ''].join(' ').trim()],
      ['สาระ', e.strand],
      ['มาตรฐาน', e.standard],
      ['ตัวชี้วัด', (e.indicators || []).join(', ')],
      ['หน่วยการเรียนรู้', e.unit],
      ['เรื่อง', e.lesson],
      ['ประเภทการสอบ', e.examType],
      ['ความยาก', e.difficulty ? e.difficulty + (e.difficultyDerived ? ' (ประเมินจากรายข้อ)' : '') : '']
    ];
  }

  function metaTable(e, showEmpty) {
    return '<dl class="meta">' + metaRows(e).filter(function (r) { return showEmpty || r[1]; }).map(function (r) {
      return '<div><dt>' + r[0] + '</dt><dd>' + (r[1] ? esc(r[1]) : '<span class="muted">ยังไม่ระบุ</span>') + '</dd></div>';
    }).join('') + '</dl>';
  }

  function examIndex(examId) {
    for (var i = 0; i < state.exams.length; i++) if (state.exams[i].id === examId) return i;
    return 0;
  }

  function examById(examId) {
    return state.exams.find(function (e) { return e.id === examId; }) || null;
  }

  function dayStart(d) { var x = new Date(d); x.setHours(0, 0, 0, 0); return x.getTime(); }

  function whenText(t) {
    var diffDays = Math.round((dayStart(Date.now()) - dayStart(t)) / 86400000);
    var time = new Date(t).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 0) return 'วันนี้ ' + time;
    if (diffDays === 1) return 'เมื่อวาน ' + time;
    if (diffDays < 7) return diffDays + ' วันที่แล้ว';
    return new Date(t).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
  }

  function durationText(sec) {
    if (!sec) return '-';
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ':' + (s < 10 ? '0' : '') + s + ' นาที';
  }

  // ---------- data ----------

  function normalizeRows(raw) {
    return (raw || []).filter(function (r) {
      return String(r.student || '').trim() && String(r.examId || '').trim();
    }).map(function (r) {
      var t = new Date(r.timestamp).getTime();
      return {
        time: isFinite(t) ? t : 0,
        student: String(r.student || '').trim() || '(ไม่มีชื่อ)',
        examId: String(r.examId || ''),
        examTitle: String(r.examTitle || ''),
        score: Number(r.score) || 0,
        answered: Number(r.answered) || 0,
        questionCount: Number(r.questionCount) || 0,
        completed: r.completed === true || String(r.completed).toUpperCase() === 'TRUE',
        wrong: String(r.wrongIds || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean),
        durationSec: Number(r.durationSec) || 0
      };
    }).sort(function (a, b) { return b.time - a.time; });
  }

  function analyze() {
    var rows = state.rows;
    var students = {};
    var exams = {};
    var weekAgo = Date.now() - 7 * 86400000;
    var sumPct = 0;
    var nCompleted = 0;
    var thisWeek = 0;

    state.exams.forEach(function (e) {
      exams[e.id] = { exam: e, attempts: 0, completed: 0, sumPct: 0, wrong: {}, runs: [] };
    });

    rows.forEach(function (r) {
      var key = r.student.toLowerCase();
      var s = students[key] || (students[key] = { key: key, name: r.student, attempts: [], last: 0, best: {}, sumPct: 0, completed: 0 });
      s.attempts.push(r);
      if (r.time > s.last) s.last = r.time;
      if (r.time >= weekAgo) thisWeek++;

      var es = exams[r.examId];
      if (es) es.attempts++;
      if (!r.completed) return;

      var p = pct(r.score, r.questionCount);
      if (!(r.examId in s.best) || p > s.best[r.examId]) s.best[r.examId] = p;
      s.sumPct += p;
      s.completed++;
      sumPct += p;
      nCompleted++;
      if (es) {
        es.completed++;
        es.sumPct += p;
        es.runs.push({ score: r.score, wrong: r.wrong, student: key, time: r.time, pct: p });
        r.wrong.forEach(function (qid) { es.wrong[qid] = (es.wrong[qid] || 0) + 1; });
      }
    });

    var items = [];
    Object.keys(exams).forEach(function (id) {
      var es = exams[id];
      if (!es.completed) return;
      es.exam.questions.forEach(function (q, qi) {
        items.push({ exam: es.exam, q: q, no: qi + 1, wrongRate: pct(es.wrong[q.id] || 0, es.completed) });
      });
    });
    items.sort(function (a, b) { return b.wrongRate - a.wrongRate; });

    var list = Object.keys(students).map(function (k) {
      var s = students[k];
      s.avg = s.completed ? Math.round(s.sumPct / s.completed) : null;
      return s;
    }).sort(function (a, b) { return b.last - a.last; });

    state.stats = {
      students: list,
      studentMap: students,
      exams: exams,
      items: items,
      avg: nCompleted ? Math.round(sumPct / nCompleted) : null,
      thisWeek: thisWeek
    };
  }

  function masteryBy(field, examId) {
    var es = state.stats.exams[examId];
    var groups = {};
    if (!es || !es.completed) return [];
    es.exam.questions.forEach(function (q) {
      var key = q[field] || 'ไม่ระบุ';
      var g = groups[key] || (groups[key] = { key: key, sum: 0, n: 0 });
      g.sum += 100 - pct(es.wrong[q.id] || 0, es.completed);
      g.n++;
    });
    return Object.keys(groups).map(function (k) {
      return { key: k, value: Math.round(groups[k].sum / groups[k].n), n: groups[k].n };
    }).sort(function (a, b) { return a.value - b.value; });
  }

  // Deterministic sample data so the teacher can preview the dashboard before connecting Sheets.
  function makeDemoRows() {
    var seed = 20260926;
    function rand() {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
    var names = ['ต้นกล้า', 'ใบเตย', 'ภูผา', 'น้ำฝน', 'ข้าวหอม', 'ปลื้ม', 'มะปราง', 'ธันวา', 'แพรวา', 'นภัส',
      'ก้องภพ', 'ชมพู่', 'อชิ', 'ขิม', 'ฟ้าใส', 'ต้นข้าว', 'เมฆ', 'ปูเป้', 'น้ำหวาน', 'ภูมิ', 'ใบบัว', 'กันต์',
      'มินนี่', 'ตะวัน', 'พลอย', 'ไอซ์', 'แสนดี', 'บุ๋มบิ๋ม'].map(function (n, i) { return (i + 1) + ' ' + n; });
    var rows = [];
    var now = Date.now();
    names.forEach(function (name, ni) {
      var skill = 0.35 + rand() * 0.6;
      var tries = 1 + Math.floor(rand() * 4);
      for (var t = 0; t < tries; t++) {
        var exam = state.exams[Math.floor(rand() * state.exams.length)];
        if (!exam) return;
        var wrong = [];
        exam.questions.forEach(function (q, qi) {
          var difficulty = { 'ง่าย': 0.05, 'ปานกลาง': 0.2, 'ยาก': 0.4 }[q.difficulty] ||
            ((qi * 37 + exam.id.length * 11) % 10) / 20;
          if (rand() > skill + 0.12 * t - difficulty) wrong.push(q.id);
        });
        var total = exam.questions.length;
        rows.push({
          timestamp: new Date(now - Math.floor(rand() * 12 * 86400000) - ni * 600000).toISOString(),
          student: name,
          examId: exam.id,
          examTitle: exam.title,
          score: total - wrong.length,
          answered: total,
          questionCount: total,
          completed: true,
          wrongIds: wrong.join(','),
          durationSec: 180 + Math.floor(rand() * 600)
        });
      }
    });
    return rows;
  }

  function fetchScores(key) {
    var url = SHEETS_URL + (SHEETS_URL.indexOf('?') >= 0 ? '&' : '?') + 'key=' + encodeURIComponent(key);
    return fetch(url).then(function (res) { return res.json(); });
  }

  function setRows(raw, demo) {
    state.rows = normalizeRows(raw);
    state.demo = !!demo;
    state.loadedAt = Date.now();
    analyze();
  }

  function refresh() {
    var key = lsGet(KEY_STORE);
    if (!SHEETS_URL || !key || state.demo) return;
    var btn = document.querySelector('[data-action="refresh"]');
    if (btn) { btn.disabled = true; btn.textContent = 'กำลังโหลด...'; }
    fetchScores(key).then(function (data) {
      if (!data.ok) throw new Error('unauthorized');
      state.connected = true;
      setRows(data.rows, false);
      render();
    }).catch(function () {
      if (btn) { btn.disabled = false; btn.textContent = 'โหลดไม่สำเร็จ ลองอีกครั้ง'; }
    });
  }

  // ---------- views ----------

  function head(title, sub, extra) {
    return '<div class="main-head"><div><h1>' + title + '</h1>' + (sub ? '<p>' + sub + '</p>' : '') + '</div>' + (extra || '') + '</div>';
  }

  function refreshBtn() {
    if (!SHEETS_URL || state.demo) return '';
    return '<button type="button" class="btn btn-sm" data-action="refresh">โหลดข้อมูลล่าสุด</button>';
  }

  function renderOverview() {
    var s = state.stats;
    var sub = state.loadedAt ? 'อัปเดต ' + whenText(state.loadedAt) : '';
    var html = head('ภาพรวมห้องเรียน', sub, refreshBtn()) + teacherBanner();

    if (!state.rows.length) return html + subjectCards() + noDataPanel();

    html += '<div class="stats block">' +
      stat('var(--yellow)', 'นักเรียน', s.students.length, 'คนที่ทำข้อสอบแล้ว') +
      stat('var(--blue)', 'ทำข้อสอบ', state.rows.length, 'ครั้งทั้งหมด') +
      stat('var(--mint)', 'คะแนนเฉลี่ย', s.avg == null ? '-' : s.avg + '%', 'จากครั้งที่ทำครบชุด') +
      stat('var(--pink)', '7 วันล่าสุด', s.thisWeek, 'ครั้ง') +
      '</div>';

    html += subjectCards();
    html += prePostBlock();

    var needHelp = s.students.filter(function (st) { return st.avg != null && st.avg < 50; });


    html += '<div class="block"><div class="block-head"><h2>นักเรียนที่ควรช่วยเป็นพิเศษ</h2><span class="muted">คะแนนเฉลี่ยต่ำกว่า 50%</span></div>' +
      (needHelp.length
        ? '<div class="student-list">' + needHelp.map(studentCard).join('') + '</div>'
        : '<div class="panel card"><p class="empty-note">ไม่มีนักเรียนที่คะแนนเฉลี่ยต่ำกว่า 50% เยี่ยมมาก</p></div>') +
      '</div>';
    return html;
  }

  // one card per subject, like the students' home page; average = completed attempts in that subject
  function subjectCards() {
    var ES = ExamSource;
    var s = state.stats;
    var groups = ES.groupBy(state.exams, function (e) { return ES.subjectOf(e).name; });
    if (!groups.length) return '';
    return '<div class="block"><div class="block-head"><h2>รายวิชา</h2><span class="muted">กดเพื่อดูบทและชุดข้อสอบ</span></div>' +
      '<div class="nav-grid">' + groups.map(function (g, i) {
        var done = 0, sum = 0;
        g.items.forEach(function (e) {
          var es = s && s.exams[e.id];
          if (es && es.completed) { done += es.completed; sum += es.sumPct; }
        });
        var avg = done ? Math.round(sum / done) : null;
        var units = ES.groupBy(g.items, ES.unitOf).length;
        return ES.navCardHtml({
          attrs: 'data-action="overview-subject" data-s="' + esc(g.key) + '"',
          theme: ES.subjectOf(g.items[0]), title: g.key, big: true, delay: i * 60,
          sub: units + ' บท • ' + g.items.length + ' ชุด' + (avg == null ? '' : ' • เฉลี่ย ' + avg + '%'),
          pct: avg
        });
      }).join('') + '</div></div>';
  }

  function teacherBanner() {
    return '<div class="hero hero-banner"><div class="hero-illus hero-illus-left">' + Art.scene('books', 'bar_chart', 'pencil') + '</div>' +
      '<div class="hero-text"><h1>สวัสดีคุณครู</h1><p>ดูผลนักเรียนและจัดการข้อสอบได้ที่นี่</p>' +
      '<button type="button" class="btn btn-hero" data-action="nav" data-view="import">เพิ่มข้อสอบชุดใหม่</button></div>' +
      '<div class="hero-illus hero-illus-right">' + Art.scene('school', 'graduation_cap', 'sparkles') + '</div></div>';
  }

  function stat(color, label, value, foot) {
    return '<div class="stat" style="background:' + color + '"><div class="label">' + label + '</div>' +
      '<div class="value">' + value + '</div><div class="foot">' + foot + '</div></div>';
  }

  function noDataPanel() {
    return '<div class="panel card" style="text-align:center">' +
      '<p class="empty-note" style="padding-bottom:8px">' +
      (SHEETS_URL
        ? 'ยังไม่มีผลสอบ นักเรียนทำเสร็จแล้วจะขึ้นที่นี่'
        : 'ยังไม่ได้เชื่อม Google Sheets คะแนนจึงยังไม่เข้ามา') +
      '</p><div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">' +
      (SHEETS_URL ? '' : '<button type="button" class="btn btn-primary btn-sm" data-action="nav" data-view="settings">วิธีเชื่อม Google Sheets</button>') +
      '<button type="button" class="btn btn-sm" data-action="demo-on">ดูตัวอย่างข้อมูล</button></div></div>';
  }

  function studentCard(st, i) {
    var initial = st.name.replace(/^\d+\s*/, '').charAt(0) || st.name.charAt(0);
    var bests = state.exams.map(function (e) {
      var b = st.best[e.id];
      return '<div class="row-item"><div class="row-top"><span>' + esc(e.title) + '</span>' +
        '<span class="num">' + (b == null ? '-' : b + '%') + '</span></div>' + bar(b || 0) + '</div>';
    }).join('');
    return '<button type="button" class="student-card card" style="animation-delay:' + ((i || 0) * 40) + 'ms" data-action="open-student" data-key="' + esc(st.key) + '">' +
      '<div class="who"><span class="avatar" style="background:' + colorFor(st.name) + '">' + esc(initial) + '</span>' +
      '<span class="meta"><strong>' + esc(st.name) + '</strong><span>ทำ ' + st.attempts.length + ' ครั้ง • ล่าสุด ' + whenText(st.last) + '</span></span></div>' +
      '<div class="rows">' + bests + '</div></button>';
  }

  function renderStudents() {
    var s = state.stats;
    var html = head('ผลนักเรียน', state.rows.length ? s.students.length + ' คน' : '',
      '<div class="no-print" style="display:flex;gap:10px;flex-wrap:wrap">' +
      (state.rows.length ? '<button type="button" class="btn btn-sm" data-action="export-summary">ดาวน์โหลดสรุปรายคน (Excel)</button>' +
        '<button type="button" class="btn btn-sm" data-action="export-attempts">ดาวน์โหลดทุกครั้ง (Excel)</button>' : '') + refreshBtn() + '</div>');
    if (!state.rows.length) return html + noDataPanel();

    if (state.studentKey && s.studentMap[state.studentKey]) {
      return html + studentDetail(s.studentMap[state.studentKey]);
    }

    var q = state.studentQuery.trim().toLowerCase();
    var list = s.students.filter(function (st) { return !q || st.key.indexOf(q) >= 0; });
    html += '<input class="search" id="studentSearch" type="search" placeholder="ค้นหาชื่อหรือเลขที่" value="' + esc(state.studentQuery) + '" />';
    html += list.length
      ? '<div class="student-list">' + list.map(studentCard).join('') + '</div>'
      : '<div class="panel card"><p class="empty-note">ไม่พบนักเรียนที่ค้นหา</p></div>';
    return html;
  }

  function studentDetail(st) {
    var wrongCount = {};
    st.attempts.forEach(function (r) {
      r.wrong.forEach(function (qid) {
        var k = r.examId + '|' + qid;
        wrongCount[k] = (wrongCount[k] || 0) + 1;
      });
    });
    var weak = Object.keys(wrongCount).map(function (k) {
      var parts = k.split('|');
      var exam = examById(parts[0]);
      var qi = exam ? exam.questions.findIndex(function (q) { return q.id === parts[1]; }) : -1;
      return { exam: exam, q: qi >= 0 ? exam.questions[qi] : null, no: qi + 1, n: wrongCount[k] };
    }).filter(function (w) { return w.q; }).sort(function (a, b) { return b.n - a.n; }).slice(0, 6);

    var rowsHtml = st.attempts.map(function (r) {
      return '<tr><td>' + whenText(r.time) + '</td><td>' + esc(r.examTitle) + (r.completed ? '' : ' <span class="pill pill-peach">หมดเวลา</span>') + '</td>' +
        '<td class="num">' + r.score + '/' + (r.completed ? r.questionCount : r.answered) + '</td><td class="num">' + durationText(r.durationSec) + '</td></tr>';
    }).join('');

    return '<div class="detail card">' +
      '<div class="detail-head"><div class="who"><span class="avatar" style="background:' + colorFor(st.name) + '">' + esc(st.name.replace(/^\d+\s*/, '').charAt(0)) + '</span>' +
      '<span class="meta"><strong>' + esc(st.name) + '</strong><span>คะแนนเฉลี่ย ' + (st.avg == null ? '-' : st.avg + '%') + ' • ทำ ' + st.attempts.length + ' ครั้ง</span></span></div>' +
      '<button type="button" class="btn btn-sm" data-action="close-student">‹ กลับรายชื่อ</button></div>' +
      '<div class="two-col">' +
        '<div><div class="block-head"><h2>ประวัติการทำข้อสอบ</h2></div><div class="table-wrap"><table class="plain"><thead><tr><th>เมื่อ</th><th>ชุด</th><th>คะแนน</th><th>เวลาที่ใช้</th></tr></thead><tbody>' + rowsHtml + '</tbody></table></div></div>' +
        '<div><div class="block-head"><h2>ข้อที่ตอบผิดบ่อย</h2></div>' +
          (weak.length ? '<div class="rows">' + weak.map(function (w) {
            return '<div class="row-item"><div class="row-top"><strong>' + esc(w.exam.title) + ' ข้อ ' + w.no + '</strong><span class="num">ผิด ' + w.n + ' ครั้ง</span></div>' +
              '<div style="font-size:14px;color:var(--ink-soft)">' + esc(w.q.question) + '</div></div>';
          }).join('') + '</div>' : '<p class="empty-note">ไม่มีข้อที่ตอบผิด</p>') +
        '</div>' +
      '</div></div>';
  }

  function examChips(activeId, action) {
    return '<div class="chips no-print">' + state.exams.map(function (e, i) {
      return '<button type="button" class="chip' + (e.id === activeId ? ' active' : '') + '" data-action="' + action + '" data-exam="' + esc(e.id) + '">' +
        '<span class="dot" style="background:' + Art.color(i) + '"></span>' + esc(e.title) + '</button>';
    }).join('') + '</div>';
  }

  function renderAnalysis() {
    var html = head('วิเคราะห์ข้อสอบ', 'คิดจากครั้งที่นักเรียนทำครบชุด', refreshBtn());
    if (!state.rows.length) return html + noDataPanel();

    var s = state.stats;
    var examId = state.analysisExamId || (state.exams[0] && state.exams[0].id);
    var es = s.exams[examId];
    html += examChips(examId, 'pick-analysis');
    if (!es || !es.completed) {
      return html + '<div class="panel card"><p class="empty-note">ชุดนี้ยังไม่มีนักเรียนทำครบ</p></div>';
    }

    function masteryPanel(title, list) {
      return '<div class="panel card"><div class="block-head"><h2>' + title + '</h2><span class="muted">% ตอบถูก</span></div><div class="rows">' +
        list.map(function (m) {
          return '<div class="row-item"><div class="row-top"><strong>' + esc(m.key) + '</strong><span class="num">' + m.value + '% • ' + m.n + ' ข้อ</span></div>' + bar(m.value) + '</div>';
        }).join('') + '</div></div>';
    }

    var byDifficulty = masteryBy('difficulty', examId).filter(function (m) { return m.key !== 'ไม่ระบุ'; });
    html += '<div class="two-col block">' + masteryPanel('ตามตัวชี้วัด', masteryBy('indicator', examId)) + masteryPanel('ตามระดับการคิด (Bloom)', masteryBy('bloom', examId)) +
      (byDifficulty.length ? masteryPanel('ตามความยากที่ครูกำหนด', byDifficulty) : '') + '</div>';

    var stats = itemStats(es);
    var flagged = stats.filter(function (it) { return it.flags.length; }).length;
    html += '<div class="block"><div class="block-head"><h2>ค่าความยาก (p) และค่าอำนาจจำแนก (r) รายข้อ</h2><span class="muted">จาก ' + es.completed + ' ครั้งที่ทำครบชุด</span></div>' +
      '<div class="panel card"><p class="note" style="margin-top:0">p = สัดส่วนผู้ตอบถูก (ข้อที่ดีควรอยู่ระหว่าง 0.20-0.80) • r = อำนาจจำแนกแบบกลุ่มสูง-กลุ่มต่ำ 27% (ควรตั้งแต่ 0.20 ขึ้นไป)' +
        (es.completed < 10 ? ' • ค่า r จะแสดงเมื่อมีผู้ทำครบชุดอย่างน้อย 10 ครั้ง' : '') +
        (flagged ? ' • <b>มี ' + flagged + ' ข้อที่ควรพิจารณาปรับปรุง</b>' : '') + '</p>' +
      '<div class="table-wrap"><table class="plain item-table"><thead><tr><th>ข้อ</th><th>ตัวชี้วัด / Bloom</th><th>ความยากที่กำหนด</th><th>p</th><th>แปลผล p</th><th>r</th><th>แปลผล r</th><th>ข้อสังเกต</th></tr></thead><tbody>' +
      stats.map(function (it) {
        return '<tr' + (it.flags.length ? ' class="flag"' : '') + '><td class="num"><b>' + it.no + '</b></td>' +
          '<td title="' + esc((indicatorInfo(it.q.indicator) || {}).text || '') + '">' + esc(it.q.indicator || '-') + (it.q.bloom ? '<br><span class="muted">' + esc(it.q.bloom) + '</span>' : '') + '</td>' +
          '<td>' + (it.q.difficulty ? diffPill(it.q.difficulty) : '<span class="muted">-</span>') + '</td>' +
          '<td class="num">' + it.p.toFixed(2) + '</td><td>' + it.pLabel + '</td>' +
          '<td class="num">' + (it.r == null ? '-' : it.r.toFixed(2)) + '</td><td>' + (it.rLabel || '<span class="muted">ข้อมูลยังน้อย</span>') + '</td>' +
          '<td>' + (it.flags.length ? esc(it.flags.join(', ')) : '<span class="muted">-</span>') + '</td></tr>';
      }).join('') + '</tbody></table></div></div></div>';

    var items = s.items.filter(function (it) { return it.exam.id === examId; });
    html += '<div class="block"><div class="block-head"><h2>รายข้อ เรียงจากผิดมากไปน้อย</h2></div>' +
      '<div class="panel card">' + items.map(function (it) {
        return '<div class="item"><span class="qno">' + it.no + '</span><div>' +
          '<p class="qtext">' + esc(it.q.question) + '</p>' +
          '<div class="tags">' + (it.q.indicator ? '<span class="pill">' + esc(it.q.indicator) + '</span>' : '') +
          (it.q.bloom ? '<span class="pill pill-blue">' + esc(it.q.bloom) + '</span>' : '') + diffPill(it.q.difficulty) +
          '<span class="pill pill-mint">ตอบ ' + LETTERS[it.q.answer] + '. ' + esc(it.q.choices[it.q.answer]) + '</span></div>' +
          '<div class="row-top"><span>ตอบผิด</span><span class="num">' + it.wrongRate + '%</span></div>' + bar(it.wrongRate, it.wrongRate >= 50 ? 'low' : (it.wrongRate >= 25 ? 'mid' : 'good')) +
          '</div></div>';
      }).join('') + '</div></div>';
    return html;
  }

  // Pairs "ก่อนเรียน" and "หลังเรียน" sets that share a หน่วย (or เรื่อง) and compares students who did both.
  function prePostBlock() {
    var groups = {};
    state.exams.forEach(function (e) {
      var key = (e.unit || e.lesson || '').trim();
      if (!key || (e.examType !== 'ก่อนเรียน' && e.examType !== 'หลังเรียน')) return;
      var g = groups[key] || (groups[key] = { key: key, pre: [], post: [] });
      g[e.examType === 'ก่อนเรียน' ? 'pre' : 'post'].push(e.id);
    });
    var rows = Object.keys(groups).map(function (k) { return groups[k]; }).filter(function (g) { return g.pre.length && g.post.length; });
    if (!rows.length) return '';

    function runsOf(ids) {
      var out = {};
      ids.forEach(function (id) {
        var es = state.stats.exams[id];
        (es ? es.runs : []).forEach(function (run) {
          (out[run.student] = out[run.student] || []).push(run);
        });
      });
      return out;
    }

    var html = '<div class="block"><div class="block-head"><h2>เปรียบเทียบก่อนเรียน-หลังเรียน</h2><span class="muted">เฉพาะนักเรียนที่ทำครบทั้งสองชุด</span></div><div class="rows panel card">';
    html += rows.map(function (g) {
      var pre = runsOf(g.pre);
      var post = runsOf(g.post);
      var both = Object.keys(pre).filter(function (st) { return post[st]; });
      if (!both.length) {
        return '<div class="row-item"><div class="row-top"><strong>' + esc(g.key) + '</strong><span class="num">ยังไม่มีนักเรียนทำครบทั้งสองชุด</span></div></div>';
      }
      var sumPre = 0;
      var sumPost = 0;
      var improved = 0;
      both.forEach(function (st) {
        var first = pre[st].slice().sort(function (a, b) { return a.time - b.time; })[0].pct;
        var last = post[st].slice().sort(function (a, b) { return b.time - a.time; })[0].pct;
        sumPre += first;
        sumPost += last;
        if (last > first) improved++;
      });
      var a = Math.round(sumPre / both.length);
      var b = Math.round(sumPost / both.length);
      return '<div class="row-item"><div class="row-top"><strong>' + esc(g.key) + '</strong><span class="num">' + both.length + ' คน • พัฒนาขึ้น ' + improved + ' คน</span></div>' +
        '<div class="row-top"><span>ก่อนเรียน</span><span class="num">' + a + '%</span></div>' + bar(a, 'mid') +
        '<div class="row-top"><span>หลังเรียน</span><span class="num">' + b + '% (' + (b - a >= 0 ? '+' : '') + (b - a) + ')</span></div>' + bar(b, 'good') + '</div>';
    }).join('');
    return html + '</div></div>';
  }

  function pLabel(p) {
    if (p >= 0.81) return 'ง่ายมาก';
    if (p >= 0.61) return 'ค่อนข้างง่าย';
    if (p >= 0.41) return 'ปานกลาง';
    if (p >= 0.21) return 'ค่อนข้างยาก';
    return 'ยากมาก';
  }

  function pToLevel(p) {
    return p >= 0.61 ? 'ง่าย' : (p >= 0.41 ? 'ปานกลาง' : 'ยาก');
  }

  function rLabel(r) {
    if (r >= 0.40) return 'ดีมาก';
    if (r >= 0.30) return 'ดี';
    if (r >= 0.20) return 'พอใช้';
    return 'ควรปรับปรุง';
  }

  // Classical item analysis on completed runs: p = share correct, r = (upper27% correct - lower27% correct) / n.
  function itemStats(es) {
    var runs = es.runs.slice().sort(function (a, b) { return b.score - a.score; });
    var n = runs.length >= 10 ? Math.max(1, Math.round(runs.length * 0.27)) : 0;
    var upper = runs.slice(0, n);
    var lower = n ? runs.slice(runs.length - n) : [];
    function correctIn(group, qid) {
      return group.filter(function (run) { return run.wrong.indexOf(qid) < 0; }).length;
    }
    return es.exam.questions.map(function (q, qi) {
      var p = 1 - (es.wrong[q.id] || 0) / es.completed;
      var r = n ? (correctIn(upper, q.id) - correctIn(lower, q.id)) / n : null;
      var flags = [];
      if (p > 0.80) flags.push('ง่ายเกินไป');
      if (p < 0.20) flags.push('ยากเกินไป หรือเฉลยอาจผิด');
      if (r != null && r < 0.20) flags.push(r < 0 ? 'เด็กเก่งตอบผิดมากกว่า ตรวจเฉลย/ตัวลวง' : 'จำแนกเด็กเก่ง-อ่อนได้น้อย');
      if (q.difficulty && q.difficulty !== pToLevel(p)) flags.push('ครูกำหนด "' + q.difficulty + '" แต่ผลจริง "' + pToLevel(p) + '"');
      return { no: qi + 1, q: q, p: p, pLabel: pLabel(p), r: r, rLabel: r == null ? '' : rLabel(r), flags: flags };
    });
  }

  function renderBank() {
    if (state.bankExamId) {
      var exam = examById(state.bankExamId);
      if (exam) return bankDetail(exam);
    }
    var ES = ExamSource;
    var nav = state.bankNav;
    var bySubject = ES.groupBy(state.exams, function (e) { return ES.subjectOf(e).name; });
    var subject = bySubject.find(function (g) { return g.key === nav.subject; });
    var theme = subject ? ES.subjectOf(subject.items[0]) : null;
    var units = subject ? ES.groupBy(subject.items, ES.unitOf) : [];
    var unit = units.find(function (g) { return g.key === nav.unit; });
    var lessons = unit ? ES.groupBy(unit.items.filter(ES.lessonOf), ES.lessonOf) : [];
    var lesson = lessons.find(function (g) { return g.key === nav.lesson; });

    function countText(exams) {
      return exams.length + ' ชุด • ' + exams.reduce(function (n, e) { return n + e.questions.length; }, 0) + ' ข้อ';
    }
    function navAttrs(s, u, l) {
      return 'data-action="bank-nav" data-s="' + esc(s || '') + '" data-u="' + esc(u || '') + '" data-l="' + esc(l || '') + '"';
    }
    var reload = SHEETS_URL ? '<button type="button" class="btn btn-sm" data-action="reload-exams">โหลดข้อสอบใหม่</button>' : '';

    if (!subject) {
      var html = head('คลังข้อสอบ', bySubject.length + ' วิชา • ' + countText(state.exams), reload);
      html += sheetPanel();
      html += '<div class="nav-grid bank-nav">' + bySubject.map(function (g, i) {
        return ES.navCardHtml({ attrs: navAttrs(g.key), theme: ES.subjectOf(g.items[0]), title: g.key, sub: countText(g.items), big: true, delay: i * 60 });
      }).join('') + '</div>';
      return html + sheetGuide();
    }

    var trail = [{ label: subject.key, attrs: navAttrs(subject.key) }];
    if (unit) trail.push({ label: unit.key, attrs: navAttrs(subject.key, unit.key) });
    if (lesson) trail.push({ label: lesson.key, attrs: navAttrs(subject.key, unit.key, lesson.key) });
    var backAttrs = trail.length > 1 ? trail[trail.length - 2].attrs : navAttrs();
    var crumbs = '<nav class="crumbs" aria-label="ตำแหน่งที่อยู่"><button type="button" class="btn btn-sm crumb-back" ' + backAttrs + '>‹ ย้อนกลับ</button>' +
      '<ol><li><button type="button" class="crumb-link" ' + navAttrs() + '>ทุกวิชา</button></li>' + trail.map(function (t, i) {
        return i === trail.length - 1 ? '<li aria-current="page">' + esc(t.label) + '</li>'
          : '<li><button type="button" class="crumb-link" ' + t.attrs + '>' + esc(t.label) + '</button></li>';
      }).join('') + '</ol></nav>';

    if (!unit) {
      var canManage = SHEETS_URL && subject.items.some(function (e) { return e.source === 'sheets'; });
      if (state.manage && state.manage.subject === subject.key) return head(esc(subject.key), 'จัดการบทและเรื่อง', '') + crumbs + manageView();
      return head(esc(subject.key), units.length + ' บท • ' + countText(subject.items),
          '<div class="no-print" style="display:flex;gap:10px;flex-wrap:wrap">' +
          (canManage ? '<button type="button" class="btn btn-sm btn-primary" data-action="manage-open" data-subject="' + esc(subject.key) + '">จัดการบท</button>' : '') + reload + '</div>') + crumbs +
        '<div class="nav-list">' + units.map(function (g, i) {
          var n = ES.groupBy(g.items.filter(ES.lessonOf), ES.lessonOf).length;
          return ES.navCardHtml({
            attrs: navAttrs(subject.key, g.key), theme: theme, delay: i * 60,
            kicker: String(g.items[0].unit || '').trim() ? 'บทที่ ' + (i + 1) : '',
            title: g.key, sub: (n ? n + ' เรื่อง • ' : '') + countText(g.items)
          });
        }).join('') + '</div>';
    }

    if (!lesson) {
      var loose = unit.items.filter(function (e) { return !ES.lessonOf(e); });
      return head(esc(unit.key), countText(unit.items), reload) + crumbs +
        (lessons.length ? '<div class="nav-list">' + lessons.map(function (g, i) {
          return ES.navCardHtml({
            attrs: navAttrs(subject.key, unit.key, g.key), theme: theme, delay: i * 60,
            kicker: 'เรื่องที่ ' + (i + 1), title: g.key, sub: countText(g.items)
          });
        }).join('') + '</div>' : '') +
        (loose.length ? (lessons.length ? '<h3 class="nav-subhead">ชุดข้อสอบรวมทั้งบท</h3>' : '') +
          '<div class="bank-grid" style="margin-top:14px">' + loose.map(bankCard).join('') + '</div>' : '');
    }

    return head(esc(lesson.key), countText(lesson.items), reload) + crumbs +
      '<div class="bank-grid">' + lesson.items.map(bankCard).join('') + '</div>';
  }

  function bankCard(e) {
    var i = state.exams.indexOf(e);
    var theme = ExamSource.subjectOf(e);
    var chips = [e.lesson || e.unit, e.difficulty, e.grade].filter(Boolean);
    var where = [e.courseCode, e.indicators && e.indicators.length ? 'ตัวชี้วัด ' + e.indicators.join(', ') : ''].filter(Boolean).join(' • ');
    return '<article class="exam-card" style="animation-delay:' + ((i % 6) * 60) + 'ms">' +
      '<div class="cover">' + Art.cover(i, ExamSource.pictureFor(e, state.exams)) + '<span class="cover-badge">' + e.questions.length + ' ข้อ</span>' +
        (ExamSource.setNumber(e, state.exams) && e.status !== 'draft' ? '<span class="set-badge">ชุดที่ ' + ExamSource.setNumber(e, state.exams) + '</span>' : '') +
        (e.status === 'draft' ? '<span class="draft-badge">ร่าง • นักเรียนยังไม่เห็น</span>' : '') + '</div>' +
      '<div class="exam-card-body">' +
        '<div class="exam-kind"><img class="kind-icon" src="img/3d/memo.png" alt="" />' + (e.source === 'sheets' ? 'Google Sheets' : 'ไฟล์ในเว็บ') +
          (e.examType ? '<span class="kind-dot">•</span><span class="kind-type">' + esc(e.examType) + '</span>' : '') + '</div>' +
        '<h3>' + esc(e.title) + '</h3>' +
        (chips.length ? '<div class="exam-chips">' + chips.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div>' : '') +
        (where ? '<p class="meta-mini">' + esc(where) + '</p>' : '') +
        '<div class="exam-foot"><span class="exam-progress">⏱ ' + (e.timeLimitMinutes || 15) + ' นาที</span>' +
        '<button type="button" class="btn btn-outline btn-sm" data-action="open-bank" data-exam="' + esc(e.id) + '">ดูข้อสอบ</button></div>' +
      '</div></article>';
  }


  var EXAM_HEADERS = ['ชุดข้อสอบ', 'วิชา', 'เวลา(นาที)', 'หัวข้อ', 'ตัวชี้วัด', 'Bloom', 'คำถาม', 'ก', 'ข', 'ค', 'ง', 'คำตอบ', 'คำอธิบาย', 'รูปภาพ',
    'ความยาก', 'ระดับชั้น', 'กลุ่มสาระ', 'รหัสวิชา', 'สาระ', 'มาตรฐาน', 'หน่วยการเรียนรู้', 'เรื่อง', 'ประเภทการสอบ', 'ความยากของชุด', 'สถานะ', 'ลำดับ'];

  function sheetPanel() {
    if (!SHEETS_URL) {
      return '<div class="panel card block"><div class="block-head"><h2>เพิ่มข้อสอบเอง</h2></div>' +
        '<p class="note" style="margin-top:0">เชื่อม Google Sheets ในเมนูตั้งค่าก่อน แล้วเพิ่มข้อสอบได้จากแท็บ "ข้อสอบ" ในสเปรดชีต</p>' +
        '<div style="margin-top:12px"><button type="button" class="btn btn-sm" data-action="nav" data-view="settings">ไปที่ตั้งค่า</button></div></div>';
    }
    var sh = state.sheet || { sheetStatus: 'loading', sheetExams: [], issues: [] };
    var nQ = sh.sheetExams.reduce(function (n, e) { return n + e.questions.length; }, 0);
    var status = {
      loading: '<span class="pill pill-yellow">กำลังโหลดจาก Google Sheets</span>',
      fresh: '<span class="pill pill-mint">ล่าสุดแล้ว</span>',
      cached: '<span class="pill pill-yellow">โหลดใหม่ไม่ได้ กำลังใช้ข้อมูลที่จำไว้</span>',
      error: '<span class="pill pill-peach">อ่านแท็บข้อสอบไม่ได้</span>'
    }[sh.sheetStatus] || '';

    var html = '<div class="panel card block"><div class="block-head"><h2>ข้อสอบจาก Google Sheets</h2></div>' +
      '<div class="status-line">' + status + '<span>' + sh.sheetExams.length + ' ชุด • ' + nQ + ' ข้อ</span></div>';

    if (sh.sheetStatus === 'error') {
      html += '<p class="note" style="margin-top:0">อัปเดตสคริปต์เป็นเวอร์ชัน ' + SCRIPT_VERSION + ' ก่อน (ขั้นตอนที่ 1 ด้านล่าง)</p>';
    } else if (sh.scriptVersion && sh.scriptVersion < SCRIPT_VERSION) {
      html += '<p class="error-text" style="margin-top:4px">สคริปต์ Google ยังเป็นเวอร์ชัน ' + sh.scriptVersion + ' อัปเดตเป็นเวอร์ชัน ' + SCRIPT_VERSION + ' ได้ที่ขั้นตอนที่ 1 ด้านล่าง</p>';
    }
    if (sh.issues.length) {
      html += '<div class="error-text" style="margin-top:4px"><b>มี ' + sh.issues.length + ' แถวที่ยังไม่ขึ้นเว็บ</b> แก้ในสเปรดชีตแล้วกด "โหลดข้อสอบใหม่"' +
        '<ul style="margin:6px 0 0;padding-left:20px">' + sh.issues.slice(0, 12).map(function (it) {
          return '<li>แถว ' + it.row + ': ' + esc(it.message) + '</li>';
        }).join('') + (sh.issues.length > 12 ? '<li>และอีก ' + (sh.issues.length - 12) + ' แถว</li>' : '') + '</ul></div>';
    } else if (sh.sheetStatus === 'fresh' && sh.sheetExams.length) {
      html += '<p class="msg ok" style="margin-top:0">ทุกแถวถูกต้อง</p>';
    }
    return html + '</div>';
  }

  function sheetGuide() {
    if (!SHEETS_URL) return '';
    var needsUpdate = state.sheet && state.sheet.scriptVersion && state.sheet.scriptVersion < SCRIPT_VERSION;
    return '<details class="panel card block guide"' + (state.sheet && state.sheet.sheetExams.length && !needsUpdate ? '' : ' open') + '>' +
      '<summary><h2>วิธีเพิ่มข้อสอบผ่าน Google Sheets</h2></summary>' +
      '<ol class="steps" style="margin-top:14px">' +
      '<li><b>อัปเดตสคริปต์เป็นเวอร์ชัน ' + SCRIPT_VERSION + ' (ทำครั้งเดียว)</b><br>เปิดสเปรดชีต → ส่วนขยาย → Apps Script → <b>จดรหัสในบรรทัด TEACHER_KEY ไว้ก่อน</b> → ลบโค้ดเดิมทั้งหมด → วางโค้ดใหม่ → ใส่รหัสเดิมกลับใน TEACHER_KEY → กดบันทึก<br>' +
        'จากนั้นกด ทำให้ใช้งานได้ → <b>จัดการการทำให้ใช้งานได้</b> → กดรูปดินสอ → ช่องเวอร์ชันเลือก <b>เวอร์ชันใหม่</b> → กดทำให้ใช้งานได้ ถ้า Google ขอสิทธิ์ Google Drive ให้กดอนุญาต (ใช้เก็บรูป) ลิงก์เดิมใช้ต่อได้' +
        '<div style="margin-top:10px"><button type="button" class="btn btn-secondary btn-sm" data-action="copy-script">คัดลอกสคริปต์เวอร์ชัน ' + SCRIPT_VERSION + '</button> <span id="copyMsg" class="msg ok" hidden>คัดลอกแล้ว</span></div>' +
        '<pre class="code-box" id="scriptBox" hidden></pre></li>' +
      '<li>กดปุ่ม <b>โหลดข้อสอบใหม่</b> ด้านบนหนึ่งครั้ง สเปรดชีตจะมีแท็บใหม่ชื่อ <b>ข้อสอบ</b> พร้อมหัวตาราง</li>' +
      '<li>กรอกข้อสอบในแท็บ <b>ข้อสอบ</b> <b>1 แถว = 1 ข้อ</b><table class="plain" style="margin-top:8px"><tbody>' +
        '<tr><td><b>ชุดข้อสอบ</b></td><td>ชื่อชุด พิมพ์แค่แถวแรกของชุดก็ได้</td></tr>' +
        '<tr><td><b>ข้อมูลของชุด</b><br>วิชา (รายวิชา), รหัสวิชา, ระดับชั้น, กลุ่มสาระ, สาระ, มาตรฐาน, หน่วยการเรียนรู้, เรื่อง, ประเภทการสอบ, ความยากของชุด, เวลา(นาที)</td>' +
          '<td>ใส่แถวแรกของชุดพอ ถ้ามีตัวชี้วัดรายข้อ ระบบเติมชั้น กลุ่มสาระ สาระ และมาตรฐานให้ ประเภทการสอบ: ก่อนเรียน ระหว่างเรียน หลังเรียน กลางภาค ปลายภาค หรือ ฝึกทำ</td></tr>' +
        '<tr><td><b>หัวข้อ / ตัวชี้วัด / Bloom / ความยาก</b></td><td>ไม่บังคับ ความยาก: ง่าย ปานกลาง หรือ ยาก</td></tr>' +
        '<tr><td><b>คำถาม, ก, ข, ค, ง</b></td><td>จำเป็นต้องใส่ทั้งหมด</td></tr>' +
        '<tr><td><b>คำตอบ</b></td><td>พิมพ์ ก ข ค หรือ ง</td></tr>' +
        '<tr><td><b>คำอธิบาย</b></td><td>เหตุผลที่นักเรียนจะเห็นหลังตอบ</td></tr>' +
        '<tr><td><b>รูปภาพ</b></td><td>ไม่บังคับ ใส่ลิงก์รูป หรืออัปโหลดจากปุ่มแก้ไขในคลังข้อสอบ</td></tr>' +
        '</tbody></table></li>' +
      '<li><b>มีข้อสอบใน Excel อยู่แล้ว:</b> เรียงคอลัมน์ให้ตรงหัวตาราง แล้ววางในแท็บข้อสอบตั้งแต่แถวที่ 2' +
        '<div style="margin-top:10px"><button type="button" class="btn btn-sm" data-action="copy-header">คัดลอกหัวตารางไปวางใน Excel</button> <span id="headerMsg" class="msg ok" hidden>คัดลอกแล้ว</span></div></li>' +
      '<li>กลับมาหน้านี้ กด <b>โหลดข้อสอบใหม่</b> ถ้ามีแถวที่กรอกผิด ระบบจะบอกเลขแถวให้แก้</li>' +
      '</ol><p class="note">ถ้าแก้ข้อความในช่องคำถาม ระบบจะนับข้อนั้นเป็นข้อใหม่ ประวัติ "ข้อที่เคยตอบผิด" ของข้อนั้นจะเริ่มใหม่ แก้ตัวเลือก เฉลย หรือคำอธิบายไม่มีผล</p></details>';
  }

  function copyText(text, msgId) {
    var done = function () { var m = $(msgId); if (m) m.hidden = false; };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { window.prompt('คัดลอกข้อความนี้', text); });
    } else {
      window.prompt('คัดลอกข้อความนี้', text);
    }
  }

  function bankDetail(exam) {
    var html = head(esc(exam.title), exam.questions.length + ' ข้อ • เฉลยและคำอธิบาย',
      '<div class="no-print" style="display:flex;gap:10px;flex-wrap:wrap">' +
      '<button type="button" class="btn btn-sm" data-action="close-bank">‹ กลับ</button>' +
      (exam.source === 'sheets' && SHEETS_URL
        ? (exam.status === 'draft'
          ? '<button type="button" class="btn btn-sm btn-primary" data-action="set-status" data-status="เผยแพร่">เผยแพร่ให้นักเรียน</button>'
          : '<button type="button" class="btn btn-sm" data-action="set-status" data-status="ร่าง">ซ่อนเป็นร่าง</button>')
        : '') +
      '<button type="button" class="btn btn-sm' + (exam.status === 'draft' ? '' : ' btn-primary') + '" data-action="print">พิมพ์เฉลย</button></div>');
    if (exam.status === 'draft') {
      html += '<div class="status-note no-print"><img src="img/3d/memo.png" alt="" /><div><b>ชุดนี้ยังเป็นร่าง นักเรียนยังไม่เห็น</b>' +
        '<span>ตรวจเฉลยก่อน แก้ได้ด้วยปุ่ม "แก้ไขข้อนี้" แล้วกด "เผยแพร่ให้นักเรียน"</span></div></div>';
    }
    html += '<div class="paper-head card"><div class="tags">' + typePill(exam.examType) + diffPill(exam.difficulty, 'ความยาก ') +
      '<span class="pill">' + exam.questions.length + ' ข้อ</span><span class="pill">' + (exam.timeLimitMinutes || 15) + ' นาที</span></div>' +
      '<div class="meta wide">' + metaTable(exam, true).replace(/^<dl class="meta">|<\/dl>$/g, '') + '</div></div>';
    html += blueprint(exam);
    var editable = exam.source === 'sheets' && !!SHEETS_URL;
    var ed = state.edit && state.edit.examId === exam.id ? state.edit : null;
    if (!editable) {
      html += '<p class="note no-print">ชุดนี้อยู่ในไฟล์เว็บ แก้จากหน้านี้ไม่ได้ ถ้าจะแก้ ให้นำเข้าไปไว้ใน Google Sheets ก่อน</p>';
    }
    if (ed && ed.msg && ed.msg.kind === 'ok') html += '<p class="msg ok no-print" id="editDone">' + esc(ed.msg.text) + '</p>';
    html += '<div class="q-list">' + exam.questions.map(function (q, qi) {
      if (ed && ed.qid === q.id) return editForm(exam, q, qi);
      return '<div class="q-card card"><div class="q-head"><span class="pill pill-yellow">ข้อ ' + (qi + 1) + '</span>' +
        (q.indicator ? '<span class="pill">' + esc(q.indicator) + '</span>' : '') +
        (q.bloom ? '<span class="pill pill-blue">' + esc(q.bloom) + '</span>' : '') + diffPill(q.difficulty) +
        (editable ? '<button type="button" class="btn btn-sm q-edit-btn no-print" data-action="edit-q" data-qid="' + esc(q.id) + '"' + (ed && ed.busy ? ' disabled' : '') + '>แก้ไขข้อนี้</button>' : '') + '</div>' +
        '<p class="q-text">' + esc(q.question) + '</p>' +
        (q.image ? '<img src="' + esc(q.image) + '" alt="' + esc(q.question) + '" style="max-width:100%;border:var(--border);border-radius:12px;margin-bottom:10px" />' : '') +
        '<ol>' + q.choices.map(function (c, ci) {
          return '<li' + (ci === q.answer ? ' class="is-answer"' : '') + '><b>' + LETTERS[ci] + '.</b><span>' + esc(c) + (ci === q.answer ? ' ✓' : '') + '</span></li>';
        }).join('') + '</ol>' +
        (q.explanation ? '<p class="exp">' + esc(q.explanation) + '</p>' : '') + '</div>';
    }).join('') + (ed && ed.qid === 'new' ? editForm(exam, null, exam.questions.length) : '') + '</div>';
    if (editable && !(ed && ed.qid === 'new')) {
      html += '<div class="btn-row no-print" style="margin-top:14px"><button type="button" class="btn btn-primary" data-action="edit-q" data-qid="new">+ เพิ่มข้อใหม่ในชุดนี้</button></div>';
    }
    return html;
  }

  // ---------- edit one question (sheet exams only) ----------

  function editForm(exam, q, qi) {
    var ed = state.edit;
    var v = q || { question: '', choices: ['', '', '', ''], answer: -1, explanation: '', image: '', indicator: '', topic: '', bloom: '', difficulty: '' };
    function text(id, label, value, placeholder) {
      return '<label class="pick-field">' + label + '<input type="text" id="' + id + '" value="' + esc(value || '') + '" placeholder="' + esc(placeholder || '') + '" /></label>';
    }
    var blooms = [''].concat(BLOOM_ORDER, v.bloom && BLOOM_ORDER.indexOf(v.bloom) < 0 ? [v.bloom] : []);
    var diffs = [''].concat(ExamSource.DIFFICULTIES, v.difficulty && ExamSource.DIFFICULTIES.indexOf(v.difficulty) < 0 ? [v.difficulty] : []);
    var bloomOpts = blooms.map(function (b) { return '<option' + (v.bloom === b ? ' selected' : '') + ' value="' + esc(b) + '">' + (b || '-') + '</option>'; }).join('');
    var diffOpts = diffs.map(function (d) { return '<option' + (v.difficulty === d ? ' selected' : '') + ' value="' + esc(d) + '">' + (d || '-') + '</option>'; }).join('');
    return '<form class="q-card card edit-card no-print" id="editForm" data-qid="' + esc(q ? q.id : 'new') + '">' +
      '<div class="q-head"><span class="pill pill-yellow">' + (q ? 'แก้ไขข้อ ' + (qi + 1) : 'ข้อใหม่ (ข้อ ' + (qi + 1) + ')') + '</span></div>' +
      '<label class="pick-field">คำถาม<textarea id="edQuestion" rows="3">' + esc(v.question) + '</textarea></label>' +
      (q ? '<p class="note" style="margin:4px 0 0">ถ้าแก้ข้อความคำถาม ประวัติ "ข้อที่เคยตอบผิด" ของนักเรียนในข้อนี้จะเริ่มนับใหม่</p>' : '') +
      '<fieldset class="ed-choices"><legend>ตัวเลือก (แตะวงกลมหน้าข้อที่ถูก)</legend>' + LETTERS.map(function (L, ci) {
        return '<div class="ed-choice"><label class="ed-radio" title="ข้อ ' + L + ' ถูก"><input type="radio" name="edAnswer" value="' + ci + '"' + (v.answer === ci ? ' checked' : '') + ' /><b>' + L + '</b></label>' +
          '<input type="text" id="edChoice' + ci + '" value="' + esc(v.choices[ci]) + '" aria-label="ตัวเลือก ' + L + '" /></div>';
      }).join('') + '</fieldset>' +
      '<label class="pick-field">คำอธิบาย (นักเรียนเห็นหลังตอบ)<textarea id="edExplanation" rows="2">' + esc(v.explanation) + '</textarea></label>' +
      '<div class="ed-image"><span class="ed-label">รูปประกอบ</span>' +
        '<img id="edImagePreview" alt="" src="' + esc(v.image || '') + '"' + (v.image ? '' : ' hidden') + ' />' +
        '<input type="hidden" id="edImage" value="' + esc(v.image || '') + '" />' +
        '<div class="btn-row"><label class="btn btn-sm btn-secondary ed-upload">เลือกรูปจากเครื่อง<input type="file" id="edImageFile" accept="image/*" hidden /></label>' +
        '<button type="button" class="btn btn-sm btn-ghost" data-action="remove-image" id="edImageRemove"' + (v.image ? '' : ' hidden') + '>เอารูปออก</button></div>' +
        '<p class="msg" id="edImageMsg" hidden></p></div>' +
      '<details class="ed-more"><summary>ข้อมูลเพิ่มเติม (ตัวชี้วัด หัวข้อ Bloom ความยาก)</summary><div class="pick-fields">' +
        text('edIndicator', 'ตัวชี้วัด', v.indicator, 'เช่น ส 3.1 ป.5/1') + text('edTopic', 'หัวข้อ', v.topic === v.indicator ? '' : v.topic, '') +
        '<label class="pick-field">Bloom<select id="edBloom">' + bloomOpts + '</select></label>' +
        '<label class="pick-field">ความยาก<select id="edDifficulty">' + diffOpts + '</select></label>' +
      '</div></details>' +
      (ed.msg && ed.msg.kind === 'bad' ? '<p class="msg bad" role="alert">' + esc(ed.msg.text) + '</p>' : '') +
      '<div class="btn-row" style="margin-top:12px">' +
        '<button type="button" class="btn btn-primary" data-action="save-q"' + (ed.busy ? ' disabled' : '') + '>' + (ed.busy === 'save' ? 'กำลังบันทึก...' : 'บันทึก') + '</button>' +
        '<button type="button" class="btn btn-sm" data-action="cancel-edit"' + (ed.busy ? ' disabled' : '') + '>ยกเลิก</button>' +
        (q ? '<button type="button" class="btn btn-sm btn-ghost ed-delete" data-action="delete-q"' + (ed.busy ? ' disabled' : '') + '>' + (ed.busy === 'delete' ? 'กำลังลบ...' : 'ลบข้อนี้') + '</button>' : '') +
      '</div></form>';
  }

  function readEditForm() {
    var checked = document.querySelector('input[name="edAnswer"]:checked');
    return {
      question: $('edQuestion').value.trim(),
      choices: [0, 1, 2, 3].map(function (i) { return $('edChoice' + i).value.trim(); }),
      answer: checked ? Number(checked.value) : -1,
      explanation: $('edExplanation').value.trim(),
      image: $('edImage').value.trim(),
      indicator: $('edIndicator').value.trim(),
      topic: $('edTopic').value.trim(),
      bloom: $('edBloom').value,
      difficulty: $('edDifficulty').value
    };
  }

  function editFields(v) {
    return {
      'คำถาม': v.question, 'ก': v.choices[0], 'ข': v.choices[1], 'ค': v.choices[2], 'ง': v.choices[3],
      'คำตอบ': LETTERS[v.answer], 'คำอธิบาย': v.explanation, 'รูปภาพ': v.image,
      'ตัวชี้วัด': v.indicator, 'หัวข้อ': v.topic, 'Bloom': v.bloom, 'ความยาก': v.difficulty
    };
  }

  function editError(text) {
    state.edit.busy = false;
    state.edit.msg = { kind: 'bad', text: text };
    renderKeepEdit();
  }

  // Re-renders while keeping what the teacher typed and the scroll position on the form.
  function renderKeepEdit() {
    var draft = $('editForm') ? readEditForm() : null;
    render();
    if (draft && $('editForm')) {
      $('edQuestion').value = draft.question;
      draft.choices.forEach(function (c, i) { $('edChoice' + i).value = c; });
      var r = document.querySelector('input[name="edAnswer"][value="' + draft.answer + '"]');
      if (r) r.checked = true;
      $('edExplanation').value = draft.explanation;
      setEditImage(draft.image);
      $('edIndicator').value = draft.indicator;
      $('edTopic').value = draft.topic;
      $('edBloom').value = draft.bloom;
      $('edDifficulty').value = draft.difficulty;
    }
    var form = $('editForm') || $('editDone');
    if (form) form.scrollIntoView({ block: 'center' });
  }

  function setEditImage(url) {
    $('edImage').value = url || '';
    $('edImagePreview').src = url || '';
    $('edImagePreview').hidden = !url;
    $('edImageRemove').hidden = !url;
  }

  function needsVersion(min) {
    var version = state.sheet && state.sheet.scriptVersion;
    if (version && version < min) {
      return 'สคริปต์ Google ยังเป็นเวอร์ชัน ' + version + ' ต้องอัปเดตเป็นเวอร์ชัน ' + SCRIPT_VERSION + ' ก่อน ดูวิธีที่ คลังข้อสอบ > วิธีเพิ่มข้อสอบผ่าน Google Sheets ขั้นตอนที่ 1';
    }
    return '';
  }

  function postScript(body) {
    body.key = lsGet(KEY_STORE);
    return fetch(SHEETS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body)
    }).then(function (res) { return res.json(); });
  }

  function replyProblem(reply) {
    if (reply && reply.error === 'unauthorized') return 'รหัสครูไม่ตรงกับ TEACHER_KEY ในสคริปต์ กรอกใหม่ในเมนูตั้งค่า';
    if (reply && reply.error === 'moved') return 'ข้อนี้ในสเปรดชีตถูกแก้หรือย้ายไปแล้ว กด "ยกเลิก" แล้วกด "โหลดข้อสอบใหม่" ในหน้าคลังข้อสอบ จากนั้นลองแก้อีกครั้ง';
    if (!reply || !reply.ok) return 'สคริปต์ Google ยังเก่า อัปเดตเป็นเวอร์ชัน ' + SCRIPT_VERSION + ' ก่อน';
    return '';
  }

  // Reloads sheet exams and keeps the teacher on the same set (its id comes from the set title).
  function reloadAfterEdit(doneText) {
    var calls = 0;
    ExamSource.load(function (data) {
      calls++;
      if (calls === 1) return;
      state.exams = data.exams;
      state.sheet = data;
      state.stats = null;
      analyze();
      state.edit = { examId: state.bankExamId, qid: null, busy: false, msg: { kind: 'ok', text: doneText } };
      renderKeepEdit();
    });
  }

  function startEdit(qid) {
    state.edit = { examId: state.bankExamId, qid: qid, busy: false, msg: null };
    render();
    var form = $('editForm');
    if (form) { form.scrollIntoView({ block: 'start' }); $('edQuestion').focus(); }
  }

  function saveEdit() {
    var ed = state.edit;
    var exam = examById(ed.examId);
    if (!exam || ed.busy) return;
    var q = ed.qid === 'new' ? null : exam.questions.find(function (x) { return x.id === ed.qid; });
    var v = readEditForm();
    if (!v.question) return editError('ยังไม่ได้พิมพ์คำถาม');
    if (v.choices.some(function (c) { return !c; })) return editError('ใส่ตัวเลือกให้ครบทั้ง ก ข ค ง');
    if (v.answer < 0) return editError('เลือกข้อที่ถูกโดยแตะวงกลมหน้าตัวเลือก');
    var dup = exam.questions.some(function (x) { return x !== q && x.question.trim() === v.question; });
    if (dup) return editError('ชุดนี้มีคำถามนี้อยู่แล้ว ลองเปลี่ยนข้อความคำถาม');
    if (!lsGet(KEY_STORE)) return editError('ยังไม่ได้ใส่รหัสครู กรอกในเมนูตั้งค่าก่อน');

    var body;
    if (q) {
      var tooOld = needsVersion(SCRIPT_VERSION);
      if (tooOld) return editError(tooOld);
      body = { action: 'updateQuestion', row: q.sheetRow, expect: q.question, fields: editFields(v) };
    } else {
      var record = editFields(v);
      record['ชุดข้อสอบ'] = exam.title;
      body = { action: 'importExams', records: [record] };
    }
    ed.busy = 'save';
    ed.msg = null;
    renderKeepEdit();
    postScript(body).then(function (reply) {
      var problem = replyProblem(reply);
      if (problem) return editError(problem);
      if (!q && !reply.added) return editError('บันทึกไม่ได้ อาจมีคำถามนี้ในชุดอยู่แล้ว');
      reloadAfterEdit(q ? 'บันทึกแล้ว' : 'เพิ่มข้อใหม่แล้ว');
    }).catch(function () {
      editError('ส่งข้อมูลไม่สำเร็จ ตรวจอินเทอร์เน็ตแล้วลองอีกครั้ง');
    });
  }

  function deleteEdit() {
    var ed = state.edit;
    var exam = examById(ed.examId);
    var q = exam && exam.questions.find(function (x) { return x.id === ed.qid; });
    if (!q || ed.busy) return;
    var tooOld = needsVersion(SCRIPT_VERSION);
    if (tooOld) return editError(tooOld);
    askConfirm({
      title: 'ลบข้อนี้ออกจากชุด "' + exam.title + '" ไหม?',
      text: q.question,
      note: 'ลบแล้วจะหายจากสเปรดชีตด้วย',
      ok: 'ลบข้อนี้', danger: true
    }, function () { doDeleteEdit(ed, q); });
  }

  function doDeleteEdit(ed, q) {
    ed.busy = 'delete';
    ed.msg = null;
    renderKeepEdit();
    postScript({ action: 'deleteQuestion', row: q.sheetRow, expect: q.question }).then(function (reply) {
      var problem = replyProblem(reply);
      if (problem) return editError(problem);
      reloadAfterEdit('ลบข้อนั้นแล้ว');
    }).catch(function () {
      editError('ส่งข้อมูลไม่สำเร็จ ตรวจอินเทอร์เน็ตแล้วลองอีกครั้ง');
    });
  }

  // Shrinks big phone photos before upload so they load fast on students' slow connections.
  function shrinkImage(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        URL.revokeObjectURL(url);
        var scale = Math.min(1, 1200 / Math.max(img.width, img.height));
        var canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.85).split(',')[1]);
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('bad image')); };
      img.src = url;
    });
  }

  function uploadEditImage(file) {
    if (!file) return;
    var msg = $('edImageMsg');
    function say(kind, text) { msg.hidden = false; msg.className = 'msg' + (kind ? ' ' + kind : ''); msg.textContent = text; }
    var tooOld = needsVersion(SCRIPT_VERSION);
    if (tooOld) { say('bad', tooOld); return; }
    if (!/^image\//.test(file.type)) { say('bad', 'ไฟล์นี้ไม่ใช่รูปภาพ ลองเลือกไฟล์ .jpg หรือ .png'); return; }
    say('', 'กำลังอัปโหลดรูป...');
    var save = document.querySelector('[data-action="save-q"]');
    if (save) save.disabled = true;
    shrinkImage(file).then(function (base64) {
      return postScript({ action: 'uploadImage', name: file.name.replace(/\.[^.]+$/, '') + '.jpg', mimeType: 'image/jpeg', base64: base64 });
    }).then(function (reply) {
      if (reply && reply.error === 'unauthorized') throw new Error(replyProblem(reply));
      if (!reply || !reply.ok || !reply.url) throw new Error('สคริปต์ยังอัปโหลดรูปไม่ได้ ตรวจว่าอัปเดตเป็นเวอร์ชัน ' + SCRIPT_VERSION + ' และกดอนุญาตให้เข้าถึง Google Drive แล้ว');
      setEditImage(reply.url);
      say('ok', 'อัปโหลดรูปแล้ว กด "บันทึก" เพื่อใช้รูปนี้');
    }).catch(function (err) {
      say('bad', err && err.message && err.message !== 'bad image' && err.message.indexOf('fetch') < 0 ? err.message : 'อัปโหลดไม่สำเร็จ ลองใหม่ หรือใช้รูปที่เล็กลง');
    }).then(function () {
      if (save) save.disabled = false;
      $('edImageFile').value = '';
    });
  }

  var BLOOM_ORDER = ['ความจำ', 'ความเข้าใจ', 'ประยุกต์ใช้', 'วิเคราะห์', 'ประเมินค่า', 'สร้างสรรค์'];

  // ตารางวิเคราะห์ข้อสอบ: indicators × Bloom levels, plus difficulty counts.
  function blueprint(exam) {
    var blooms = [];
    var rows = {};
    var order = [];
    var diff = { 'ง่าย': 0, 'ปานกลาง': 0, 'ยาก': 0 };
    exam.questions.forEach(function (q, qi) {
      var ind = q.indicator || 'ไม่ระบุตัวชี้วัด';
      var b = q.bloom || 'ไม่ระบุ';
      if (blooms.indexOf(b) < 0) blooms.push(b);
      if (!rows[ind]) { rows[ind] = { total: 0, items: [] }; order.push(ind); }
      rows[ind][b] = (rows[ind][b] || 0) + 1;
      rows[ind].total++;
      rows[ind].items.push(qi + 1);
      if (diff[q.difficulty] != null) diff[q.difficulty]++;
    });
    blooms.sort(function (a, b) {
      var ia = BLOOM_ORDER.indexOf(a); var ib = BLOOM_ORDER.indexOf(b);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });
    var rated = diff['ง่าย'] + diff['ปานกลาง'] + diff['ยาก'];
    return '<div class="panel card block"><div class="block-head"><h2>ตารางวิเคราะห์ข้อสอบ</h2><span class="muted">ตัวชี้วัด × ระดับพฤติกรรม</span></div>' +
      '<div class="table-wrap"><table class="plain"><thead><tr><th>ตัวชี้วัด</th>' +
      blooms.map(function (b) { return '<th>' + esc(b) + '</th>'; }).join('') + '<th>รวม</th><th>ข้อที่</th></tr></thead><tbody>' +
      order.map(function (ind) {
        var info = indicatorInfo(ind);
        return '<tr><td class="bp-ind"><b>' + esc(ind) + '</b>' + (info ? '<br><span class="muted">' + esc(info.text) + '</span>' : '') + '</td>' +
          blooms.map(function (b) { return '<td class="num">' + (rows[ind][b] || '-') + '</td>'; }).join('') +
          '<td class="num"><b>' + rows[ind].total + '</b></td><td>' + rows[ind].items.join(', ') + '</td></tr>';
      }).join('') + '</tbody></table></div>' +
      (rated ? '<div class="tags" style="display:flex;gap:6px;flex-wrap:wrap;margin-top:12px">' +
        ['ง่าย', 'ปานกลาง', 'ยาก'].map(function (d) { return diffPill(d, '') .replace('</span>', ' ' + diff[d] + ' ข้อ (' + pct(diff[d], exam.questions.length) + '%)</span>'); }).join('') +
        (rated < exam.questions.length ? '<span class="pill">ไม่ระบุ ' + (exam.questions.length - rated) + ' ข้อ</span>' : '') + '</div>'
        : '<p class="note">ยังไม่ได้ระบุความยากรายข้อ</p>') +
      '</div>';
  }

  function questionKey(title, question) {
    return String(title).trim() + '|' + String(question).trim();
  }

  // ---------- ข้อมูลชุดข้อสอบในหน้านำเข้า ----------

  var GRADES = ['ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6', 'ม.1', 'ม.2', 'ม.3', 'ม.4', 'ม.5', 'ม.6'];

  // Fills blanks from what the teacher chose in step 1, so the set lands in the right subject/unit/lesson.
  function prefillDraftExam(e) {
    var p = state.pick;
    var areaName = (curriculum.areas.find(function (a) { return a.letter === p.area; }) || {}).name || '';
    if (!e.title && p.title) e.title = p.title;
    var known = ExamSource.SUBJECTS.find(function (s) { return s.match.test(e.subject || '') || s.match.test(e.learningArea || ''); });
    if (!known) known = ExamSource.SUBJECTS.find(function (s) { return s.match.test(p.subject || '') || s.match.test(areaName) || s.match.test(p.area); });
    if (known) e.subject = known.name;
    if (!e.grade) e.grade = p.grade || '';
    if (!e.unit && p.unit) e.unit = p.unit;
    if (!e.lesson && p.lesson) e.lesson = p.lesson;
    if (!e.examType && p.examType) e.examType = p.examType;
    if (!e.courseCode && p.courseCode) e.courseCode = p.courseCode;
  }

  // Marks questions that already exist so they are skipped; re-run when a set title changes.
  function flagDraft(d) {
    var existing = {};
    var sheetTitles = {};
    var fileTitles = {};
    (state.sheet ? state.sheet.sheetExams : []).forEach(function (e) {
      sheetTitles[e.title] = true;
      e.questions.forEach(function (q) { existing[questionKey(e.title, q.question)] = true; });
    });
    state.exams.forEach(function (e) { if (e.source === 'file') fileTitles[e.title] = true; });
    d.newCount = 0;
    d.dupCount = 0;
    d.exams.forEach(function (e) {
      e.appendsTo = !!sheetTitles[e.title];
      e.clashesWithFile = !!fileTitles[e.title];
      e.questions.forEach(function (q) {
        q.duplicate = !!existing[questionKey(e.title, q.question)];
        if (q.duplicate) d.dupCount++; else d.newCount++;
      });
    });
    return d;
  }

  function draftSetForm(e, di) {
    var ES = ExamSource;
    function attrs(field) { return 'data-draft="' + di + '" data-field="' + field + '"'; }
    function options(list, value, blank) {
      var all = list.slice();
      if (value && all.indexOf(value) < 0) all.push(value);
      return (blank ? '<option value="">' + blank + '</option>' : '') + all.map(function (v) {
        return '<option' + (v === value ? ' selected' : '') + '>' + esc(v) + '</option>';
      }).join('');
    }
    function datalist(id, values) {
      return '<datalist id="' + id + '">' + values.map(function (v) { return '<option value="' + esc(v) + '"></option>'; }).join('') + '</datalist>';
    }
    var sameSubject = state.exams.filter(function (x) { return ES.subjectOf(x).name === ES.subjectOf(e).name; });
    var units = ES.groupBy(sameSubject.filter(function (x) { return x.unit; }), function (x) { return x.unit; }).map(function (g) { return g.key; });
    var lessons = ES.groupBy(sameSubject.filter(function (x) { return x.lesson && (!e.unit || x.unit === e.unit); }), function (x) { return x.lesson; }).map(function (g) { return g.key; });
    var subjectNames = ES.SUBJECTS.map(function (s) { return s.name; });
    var subjectValue = subjectNames.indexOf(e.subject) >= 0 ? e.subject : (ES.subjectOf(e).name);

    return '<div class="draft-set"><h3>ข้อมูลชุดข้อสอบ</h3>' +
      '<p class="note" style="margin:0 0 10px">นักเรียนจะเห็นชุดนี้ใน <b>' + esc(subjectValue || 'วิชา') + ' › ' + esc(e.unit || ES.unitOf(e)) + (e.lesson ? ' › ' + esc(e.lesson) : '') + '</b></p>' +
      '<div class="pick-fields">' +
        '<label class="pick-field"><span>ชื่อชุด</span><input type="text" ' + attrs('title') + ' value="' + esc(e.title) + '" /></label>' +
        '<label class="pick-field"><span>รายวิชา</span><select ' + attrs('subject') + ' data-rerender="1">' + options(subjectNames, subjectValue, 'เลือกวิชา') + '</select></label>' +
        '<label class="pick-field"><span>ระดับชั้น</span><select ' + attrs('grade') + '>' + options(GRADES, e.grade, 'เลือกชั้น') + '</select></label>' +
        '<label class="pick-field"><span>ประเภทการสอบ</span><select ' + attrs('examType') + '>' + options(ES.EXAM_TYPES, e.examType, 'ไม่ระบุ') + '</select></label>' +
        '<label class="pick-field"><span>หน่วยการเรียนรู้ (บท)</span><input type="text" list="dlUnit' + di + '" ' + attrs('unit') + ' data-rerender="1" value="' + esc(e.unit || '') + '" placeholder="เช่น เศษส่วน" />' + datalist('dlUnit' + di, units) + '</label>' +
        '<label class="pick-field"><span>เรื่อง</span><input type="text" list="dlLesson' + di + '" ' + attrs('lesson') + ' data-rerender="1" value="' + esc(e.lesson || '') + '" placeholder="เช่น การบวกเศษส่วน" />' + datalist('dlLesson' + di, lessons) + '</label>' +
        '<label class="pick-field"><span>รหัสวิชา</span><input type="text" ' + attrs('courseCode') + ' value="' + esc(e.courseCode || '') + '" placeholder="เช่น ค15101" /></label>' +
        '<label class="pick-field"><span>เวลา (นาที)</span><input type="number" min="1" ' + attrs('minutes') + ' value="' + esc(e.minutes || '') + '" placeholder="ว่างไว้ = คิดให้อัตโนมัติ" /></label>' +
      '</div>' +
      (units.length || lessons.length ? '<p class="note" style="margin:0">พิมพ์ในช่องบทหรือเรื่องแล้วจะมีชื่อเดิมให้เลือก</p>' : '') +
      '</div>';
  }

  function buildDraft(text, filename) {
    var parsed = ExamImport.parse(text, filename);
    parsed.exams.forEach(prefillDraftExam);
    return flagDraft({ text: text, filename: filename || 'ข้อความที่วาง', exams: parsed.exams, issues: parsed.issues });
  }

  function renderImport() {
    var html = head('นำเข้าข้อสอบ', 'ให้ AI ออกข้อสอบ แล้วนำมาใส่เว็บ');

    if (!SHEETS_URL) {
      return html + '<div class="panel card"><p class="empty-note">ต้องเชื่อม Google Sheets ก่อน ข้อสอบจะเก็บในสเปรดชีตของครู' +
        '</p><div style="text-align:center"><button type="button" class="btn btn-primary btn-sm" data-action="nav" data-view="settings">ไปที่ตั้งค่า</button></div></div>';
    }

    html += '<div class="import-steps">' +
      '<div class="panel card"><div class="step-no">1</div><h2>ให้ AI ออกข้อสอบ</h2>' +
        (curriculum.list.length
          ? '<p class="note" style="margin-top:0">เลือกตัวชี้วัดด้านล่าง แล้วคัดลอกคำสั่งไปวางใน ChatGPT, Gemini หรือ Claude</p>'
          : '<p class="note" style="margin-top:0">คัดลอกคำสั่งไปวางใน ChatGPT, Gemini หรือ Claude แล้วแก้ส่วนใน [ ]</p>') +
        indicatorPicker() +
        '<div class="btn-row" style="margin-top:14px"><button type="button" class="btn btn-primary btn-sm" data-action="copy-prompt" id="promptBtn">' + promptButtonLabel() + '</button>' +
        '<button type="button" class="btn btn-sm" data-action="download-example">ไฟล์ตัวอย่าง .txt</button></div>' +
        '<p id="promptMsg" class="msg ok" hidden>คัดลอกแล้ว นำไปวางในแชต AI ได้เลย</p></div>' +
      '<div class="panel card"><div class="step-no">2</div><h2>เลือกไฟล์ หรือวางข้อความ</h2>' +
        '<label id="dropZone" class="dropzone" for="importFile"><strong>ลากไฟล์มาวางตรงนี้ หรือกดเพื่อเลือกไฟล์</strong>' +
        '<span>ไฟล์ .txt .csv หรือ .json</span></label>' +
        '<input id="importFile" type="file" accept=".txt,.md,.csv,.tsv,.json,text/plain" hidden />' +
        '<textarea id="importText" class="import-text" placeholder="หรือคัดลอกคำตอบของ AI มาวางตรงนี้">' + esc(state.pasteText || '') + '</textarea>' +
        '<button type="button" class="btn btn-secondary btn-sm" data-action="parse-import" style="margin-top:10px">ตรวจข้อสอบ</button></div>' +
      '</div>';

    if (state.importMsg) {
      html += '<div class="panel card block import-msg ' + state.importMsg.kind + '"><p class="msg ' + state.importMsg.kind + '" style="margin:0">' + esc(state.importMsg.text) + '</p>' +
        (state.importMsg.kind === 'ok' ? '<div class="btn-row" style="margin-top:12px"><button type="button" class="btn btn-sm" data-action="nav" data-view="bank">ไปที่คลังข้อสอบ</button></div>' : '') + '</div>';
    }

    var d = state.draft;
    if (d) html += draftPreview(d);
    return html;
  }

  function pickedCodes() {
    return Object.keys(state.pick.codes).filter(function (c) { return state.pick.codes[c]; });
  }

  function promptButtonLabel() {
    var n = pickedCodes().length;
    return n ? 'คัดลอกคำสั่งสำหรับ AI (ตัวชี้วัด ' + n + ' ตัว)' : 'คัดลอกคำสั่งสำหรับ AI';
  }

  function indicatorPicker() {
    if (!curriculum.list.length) return '';
    var p = state.pick;
    function field(key, label, placeholder, type) {
      return '<label class="pick-field"><span>' + label + '</span><input data-pick="' + key + '" type="' + (type || 'text') + '" value="' + esc(p[key]) + '" placeholder="' + esc(placeholder || '') + '" /></label>';
    }
    var types = ExamSource.EXAM_TYPES.map(function (t) { return '<option' + (p.examType === t ? ' selected' : '') + '>' + t + '</option>'; }).join('');
    var areaOpts = curriculum.areas.map(function (a) {
      return '<option value="' + a.letter + '"' + (p.area === a.letter ? ' selected' : '') + '>' + esc(a.name) + '</option>';
    }).join('');
    var gradeOpts = curriculum.grades.map(function (g) {
      return '<option' + (p.grade === g ? ' selected' : '') + '>' + g + '</option>';
    }).join('');
    var list = curriculum.list.filter(function (it) { return it.letter === p.area && it.grade === p.grade; });
    var areaName = (curriculum.areas.find(function (a) { return a.letter === p.area; }) || {}).name || '';
    var groups = {};
    var order = [];
    list.forEach(function (it) {
      var key = it.grade + '|' + it.standard;
      if (!groups[key]) { groups[key] = { head: it, items: [] }; order.push(key); }
      groups[key].items.push(it);
    });
    var lastStrand = '';
    return '<details class="picker"' + (pickedCodes().length || p.touched ? ' open' : '') + '><summary>เลือกตัวชี้วัดจากหลักสูตร (' + esc(areaName) + ' ' + esc(p.grade) + ')</summary>' +
      '<div class="pick-fields">' +
        '<label class="pick-field"><span>กลุ่มสาระการเรียนรู้</span><select data-pick="area" data-rerender="1">' + areaOpts + '</select></label>' +
        '<label class="pick-field"><span>ระดับชั้น</span><select data-pick="grade" data-rerender="1">' + gradeOpts + '</select></label>' +
        field('title', 'ชื่อชุด', 'เช่น เศรษฐกิจน่ารู้ หลังเรียน') +
        field('subject', 'รายวิชา', 'เช่น สังคมศึกษา 5') +
        field('courseCode', 'รหัสวิชา', 'เช่น ส15101') +
        field('unit', 'หน่วยการเรียนรู้', 'เช่น หน่วยที่ 3 เศรษฐกิจน่ารู้') +
        field('lesson', 'เรื่อง', 'เช่น ปัจจัยการผลิต') +
        '<label class="pick-field"><span>ประเภทการสอบ</span><select data-pick="examType"><option value="">เลือก</option>' + types + '</select></label>' +
        field('count', 'จำนวนข้อ', '10', 'number') +
      '</div>' +
      '<div class="pick-list">' + order.map(function (key) {
        var g = groups[key];
        var strandHead = g.head.strand !== lastStrand ? '<h3 class="pick-strand">' + esc(g.head.strand) + '</h3>' : '';
        lastStrand = g.head.strand;
        var core = curriculum.core[g.head.standard + '|' + g.head.grade] || [];
        return strandHead + '<div class="pick-std"><p><b>มาตรฐาน ' + esc(g.head.standard) + '</b> ' + esc(g.head.standardText) + '</p>' +
          (core.length ? '<details class="core-list"><summary>สาระการเรียนรู้แกนกลาง ' + esc(g.head.grade) + ' (' + core.length + ' หัวข้อ)</summary><ul>' +
            core.map(function (c) {
              return /^- /.test(c) ? '<li class="sub">' + esc(c.slice(2)) + '</li>' : '<li>' + esc(c) + '</li>';
            }).join('') + '</ul></details>' : '') +
          g.items.map(function (it) {
            return '<label class="pick-item"><input type="checkbox" data-code="' + esc(it.code) + '"' + (p.codes[it.code] ? ' checked' : '') + ' />' +
              '<span><b>' + esc(it.grade + '/' + it.code.split('/')[1]) + '</b> ' + esc(it.text) +
              (it.alt ? '<br><span class="muted" style="font-size:12px">อีกฉบับเขียนว่า: ' + esc(it.alt) + '</span>' : '') + '</span></label>';
          }).join('') + '</div>';
      }).join('') + (list.length ? '' : '<p class="empty-note">ชั้นนี้ไม่มีตัวชี้วัดในกลุ่มสาระนี้</p>') + '</div>' +
      '<p class="note">ที่มา: ' + esc(curriculum.source) + (curriculum.note ? ' • ' + esc(curriculum.note) : '') + '</p></details>';
  }

  function buildPickedPrompt() {
    var codes = pickedCodes();
    if (!codes.length) return ExamImport.aiPrompt;
    var items = codes.map(function (c) { return curriculum.byCode[c]; }).filter(Boolean);
    items.sort(function (a, b) { return curriculum.list.indexOf(a) - curriculum.list.indexOf(b); });
    function uniq(list) { return list.filter(function (v, i) { return v && list.indexOf(v) === i; }); }
    var p = state.pick;
    return ExamImport.promptFor({
      title: p.title,
      grade: items[0].grade,
      area: items[0].area,
      subject: p.subject,
      courseCode: p.courseCode,
      strands: uniq(items.map(function (it) { return it.strand; })),
      standards: uniq(items.map(function (it) { return it.standard; })),
      unit: p.unit,
      lesson: p.lesson,
      examType: p.examType,
      count: p.count,
      indicators: items,
      core: uniq(items.map(function (it) { return it.standard; })).map(function (code) {
        return { standard: code, lines: curriculum.core[code + '|' + items[0].grade] || [] };
      }).filter(function (c) { return c.lines.length; })
    });
  }

  function draftPreview(d) {
    var html = '<div class="panel card block draft-panel"><div class="step-no">3</div><h2>ตรวจก่อนเพิ่มเข้าเว็บ</h2>' +
      '<p class="note" style="margin-top:0">จาก ' + esc(d.filename) + '</p>';

    if (!d.exams.length && !d.issues.length) {
      html += '<p class="error-text">ไม่พบข้อสอบในไฟล์นี้ เทียบรูปแบบกับไฟล์ตัวอย่างดู</p>';
    }

    html += d.exams.map(function (e, di) {
      var fresh = e.questions.filter(function (q) { return !q.duplicate; }).length;
      var notes = [];
      if (e.appendsTo) notes.push('<span class="pill pill-blue">เพิ่มต่อท้ายชุดเดิมใน Sheets</span>');
      else notes.push('<span class="pill pill-mint">ชุดใหม่</span>');
      if (e.clashesWithFile) notes.push('<span class="pill pill-peach">ชื่อซ้ำกับชุดในไฟล์เว็บ ควรเปลี่ยนชื่อ</span>');
      if (fresh < e.questions.length) notes.push('<span class="pill">ข้ามข้อที่มีอยู่แล้ว ' + (e.questions.length - fresh) + ' ข้อ</span>');
      var bad = unknownIndicators(e.questions);
      if (bad.length) notes.push('<span class="pill pill-peach">ตัวชี้วัดไม่พบในหลักสูตร: ' + esc(bad.join(', ')) + '</span>');
      return '<details class="draft-exam"' + (d.exams.length <= 3 ? ' open' : '') + '><summary><span class="draft-title"><b>' + esc(e.title) + '</b> • ' + fresh + ' ข้อใหม่' +
        (e.grade ? ' • ' + esc(e.grade) : '') + (e.minutes ? ' • ' + e.minutes + ' นาที' : '') + '</span>' +
        '<span class="draft-tags">' + notes.join('') + '</span></summary>' +
        draftSetForm(e, di) +
        '<div class="draft-meta">' + metaTable(e, true) + '</div>' +
        '<div class="q-list" style="margin-top:12px">' +
        e.questions.map(function (q, qi) {
          return '<div class="q-card' + (q.duplicate ? ' is-dup' : '') + '"><div class="q-head"><span class="pill pill-yellow">ข้อ ' + (qi + 1) + '</span>' +
            (q.indicator ? '<span class="pill">' + esc(q.indicator) + '</span>' : '') +
            (q.bloom ? '<span class="pill pill-blue">' + esc(q.bloom) + '</span>' : '') +
            diffPill(q.difficulty) +
            (q.duplicate ? '<span class="pill">มีอยู่แล้ว</span>' : '') + '</div>' +
            '<p class="q-text">' + esc(q.question) + '</p><ol>' + q.choices.map(function (c, ci) {
              return '<li' + (ci === q.answer ? ' class="is-answer"' : '') + '><b>' + LETTERS[ci] + '.</b><span>' + esc(c) + (ci === q.answer ? ' ✓' : '') + '</span></li>';
            }).join('') + '</ol>' + (q.explanation ? '<p class="exp">' + esc(q.explanation) + '</p>' : '<p class="exp">ไม่มีคำอธิบาย</p>') + '</div>';
        }).join('') + '</div></details>';
    }).join('');

    if (d.issues.length) {
      html += '<div class="error-text" style="margin-top:14px"><b>' + d.issues.length + ' รายการที่จะไม่ถูกนำเข้า</b> แก้ในไฟล์แล้วตรวจใหม่ได้' +
        '<ul style="margin:6px 0 0;padding-left:20px">' + d.issues.slice(0, 15).map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') +
        (d.issues.length > 15 ? '<li>และอีก ' + (d.issues.length - 15) + ' รายการ</li>' : '') + '</ul></div>';
    }

    var canSend = d.newCount > 0 && !state.importing;
    html += '<div class="btn-row" style="margin-top:16px">' +
      '<button type="button" class="btn btn-primary" data-action="commit-import"' + (canSend ? '' : ' disabled') + '>' +
      (state.importing ? 'กำลังเพิ่มเข้าเว็บ...' : 'เพิ่มเข้าเว็บ ' + d.newCount + ' ข้อ') + '</button>' +
      '<button type="button" class="btn btn-ghost btn-sm" data-action="clear-import">ยกเลิก</button></div>' +
      '<p class="note">กดดูแต่ละชุดเพื่อตรวจก่อนได้ ข้อสอบจะไปอยู่ในแท็บ "ข้อสอบ" ของ Google Sheets ถ้าต้องแก้ทีหลัง แก้ในสเปรดชีตได้เลย</p></div>';
    return html;
  }

  function readImportFile(file) {
    if (!file) return;
    if (/\.(xlsx|xls|docx|doc|pdf)$/i.test(file.name)) {
      state.draft = null;
      state.importMsg = { kind: 'bad', text: 'ยังเปิดไฟล์ ' + file.name.split('.').pop().toUpperCase() + ' โดยตรงไม่ได้ ถ้าเป็น Excel ให้บันทึกเป็น "CSV UTF-8" ก่อน ถ้าเป็น Word ให้คัดลอกข้อความมาวางในช่องด้านล่าง' };
      render();
      return;
    }
    var reader = new FileReader();
    reader.onload = function () {
      state.importMsg = null;
      state.pasteText = '';
      state.draft = buildDraft(String(reader.result), file.name);
      render();
      scrollToPreview();
    };
    reader.readAsText(file, 'utf-8');
  }

  function scrollToPreview() {
    var target = document.querySelector('.draft-panel, .import-msg');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function commitImport() {
    var d = state.draft;
    var key = lsGet(KEY_STORE);
    if (d) flagDraft(d);
    if (!d || !d.newCount) return;
    if (!key) { state.importMsg = { kind: 'bad', text: 'ยังไม่ได้ใส่รหัสครู กรอกในเมนูตั้งค่าก่อน' }; render(); return; }

    var exams = d.exams.map(function (e) {
      var copy = {};
      Object.keys(e).forEach(function (k) { copy[k] = e[k]; });
      copy.questions = e.questions.filter(function (q) { return !q.duplicate; });
      return copy;
    }).filter(function (e) { return e.questions.length; });
    var expected = [];
    exams.forEach(function (e) { e.questions.forEach(function (q) { expected.push(questionKey(e.title, q.question)); }); });

    state.importing = true;
    state.importMsg = null;
    render();

    function fail(text) {
      state.importing = false;
      state.importMsg = { kind: 'bad', text: text };
      render();
      scrollToPreview();
    }

    var version = state.sheet && state.sheet.scriptVersion;
    if (version && version < 4) {
      fail('สคริปต์ Google ยังเป็นเวอร์ชัน ' + version + ' อัปเดตสคริปต์ก่อน ดูวิธีที่ คลังข้อสอบ > วิธีเพิ่มข้อสอบ');
      return;
    }

    fetch(SHEETS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'importExams', key: key, records: ExamImport.toRecords(exams) })
    }).then(function (res) {
      return res.json();
    }).then(function (reply) {
      if (reply && reply.error === 'unauthorized') {
        fail('รหัสครูไม่ตรงกับ TEACHER_KEY ในสคริปต์ กรอกใหม่ในเมนูตั้งค่า');
        return;
      }
      if (!reply || !reply.ok || reply.added === undefined) {
        fail('สคริปต์ยังเป็นเวอร์ชันเก่า อัปเดตแล้วกด Ctrl+F5 แล้วลองใหม่');
        return;
      }
      return new Promise(function (resolve) { setTimeout(resolve, 800); }).then(verifyImport);
    }).catch(function () {
      fail('ส่งข้อมูลไม่สำเร็จ ตรวจอินเทอร์เน็ตแล้วลองอีกครั้ง');
    });

    function verifyImport() {
      var calls = 0;
      ExamSource.load(function (data) {
        calls++;
        if (calls === 1) return;
        state.exams = data.exams;
        state.sheet = data;
        analyze();
        var have = {};
        data.sheetExams.forEach(function (e) { e.questions.forEach(function (q) { have[questionKey(e.title, q.question)] = true; }); });
        var found = expected.filter(function (k) { return have[k]; }).length;
        state.importing = false;
        if (data.sheetStatus === 'fresh' && found === expected.length) {
          state.draft = null;
          state.pasteText = '';
          state.importMsg = { kind: 'ok', text: 'เพิ่มแล้ว ' + found + ' ข้อ เป็นร่างไว้ก่อน ตรวจในคลังข้อสอบแล้วกด "เผยแพร่ให้นักเรียน"' };
        } else if (found > 0) {
          state.importMsg = { kind: 'bad', text: 'เพิ่มได้ ' + found + ' จาก ' + expected.length + ' ข้อ ลองกดเพิ่มอีกครั้ง ข้อที่มีแล้วจะถูกข้ามให้เอง' };
          state.draft = buildDraft(d.text, d.filename);
        } else {
          state.importMsg = { kind: 'bad', text: 'สคริปต์รับข้อมูลแล้ว แต่ยังโหลดข้อสอบใหม่ไม่ได้ ลองกด "โหลดข้อสอบใหม่" ในหน้าคลังข้อสอบอีกครั้ง' };
        }
        render();
        scrollToPreview();
      });
    }
  }

  function renderSettings() {
    var key = lsGet(KEY_STORE);
    var status = SHEETS_URL
      ? (state.connected ? '<span class="pill pill-mint">เชื่อมต่อแล้ว</span>' : '<span class="pill pill-yellow">ใส่ลิงก์แล้ว รอยืนยันรหัส</span>')
      : '<span class="pill pill-peach">ยังไม่ได้เชื่อม</span>';

    var html = head('ตั้งค่า', 'ธีมหน้าจอ และการเชื่อม Google Sheets');

    var current = Theme.get();
    html += '<div class="panel card block"><div class="block-head"><h2>ธีมหน้าจอ</h2></div>' +
      '<div class="theme-switch" role="group" aria-label="เลือกธีม">' +
      [['light', 'สว่าง', ICONS.sun], ['dark', 'มืด', ICONS.moon], ['auto', 'ตามเครื่อง', ICONS.auto]].map(function (t) {
        return '<button type="button" data-action="theme" data-theme="' + t[0] + '" aria-pressed="' + (current === t[0]) + '">' + t[2] + t[1] + '</button>';
      }).join('') + '</div>' +
      '<p class="note">"ตามเครื่อง" จะสลับตามเครื่อง ค่าที่เลือกใช้เฉพาะเครื่องนี้</p></div>';

    html += '<div class="panel card block"><div class="block-head"><h2>Google Sheets</h2></div><div class="status-line"><strong>สถานะ</strong>' + status +
      (state.demo ? '<span class="pill pill-blue">กำลังดูข้อมูลตัวอย่าง</span>' : '') + '</div>';
    if (SHEETS_URL) {
      html += '<form id="keyForm" class="inline-form"><input id="keyInput" type="password" placeholder="รหัสครู" value="' + esc(key || '') + '" autocomplete="current-password" />' +
        '<button type="submit" class="btn btn-primary btn-sm">บันทึกและทดสอบ</button></form>' +
        '<p id="keyMsg" class="msg" hidden></p>' +
        (key ? '<p class="note">เครื่องนี้จำรหัสครูไว้แล้ว ถ้าใช้เครื่องส่วนกลาง <button type="button" class="btn btn-ghost btn-sm" data-action="forget-key">ลืมรหัสบนเครื่องนี้</button></p>' : '');
    } else {
      html += '<p class="note" style="margin-top:0">ทำตามขั้นตอนด้านล่างครั้งเดียว แล้วคะแนนนักเรียนจะเข้ามาที่หน้านี้</p>';
    }
    html += '</div>';

    html += '<div class="block"><div class="block-head"><h2>วิธีเชื่อม Google Sheets (ทำครั้งเดียว)</h2></div><ol class="steps">' +
      '<li>เปิด <b>sheets.google.com</b> สร้างสเปรดชีตใหม่ ตั้งชื่อเช่น <code>คะแนนห้องติว ป.5</code></li>' +
      '<li>ในสเปรดชีตนั้น ไปที่เมนู <b>ส่วนขยาย (Extensions) → Apps Script</b> ลบโค้ดเดิมในหน้าต่างทิ้งให้หมด</li>' +
      '<li>กดปุ่มด้านล่างเพื่อคัดลอกสคริปต์ แล้ววางลงไป จากนั้น<b>แก้บรรทัด TEACHER_KEY</b> เป็นรหัสลับของครูเอง แล้วกดบันทึก (รูปแผ่นดิสก์)' +
        '<div style="margin-top:10px"><button type="button" class="btn btn-secondary btn-sm" data-action="copy-script">คัดลอกสคริปต์</button> <span id="copyMsg" class="msg ok" hidden>คัดลอกแล้ว</span></div>' +
        '<pre class="code-box" id="scriptBox">กำลังโหลด...</pre></li>' +
      '<li>กดปุ่ม <b>ทำให้ใช้งานได้ (Deploy) → การทำให้ใช้งานได้รายการใหม่ (New deployment)</b> กดรูปเฟืองเลือก <b>เว็บแอป (Web app)</b><br>ตั้ง "เรียกใช้ในฐานะ" เป็น <b>ฉัน (Me)</b> และ "ผู้ที่มีสิทธิ์เข้าถึง" เป็น <b>ทุกคน (Anyone)</b> (ต้องเป็น "ทุกคน" เฉยๆ ไม่ใช่ "ทุกคนที่มีบัญชี Google") แล้วกด Deploy และกดอนุญาตสิทธิ์ด้วยบัญชี Google ของครู</li>' +
      '<li>คัดลอก <b>URL ของเว็บแอป</b> (ขึ้นต้นด้วย <code>https://script.google.com/macros/s/</code>)</li>' +
      '<li>เปิดไฟล์ <code>js/config.js</code> ในโฟลเดอร์ quiap5 (คลิกขวา → Open with → Notepad) วาง URL ไว้ระหว่างเครื่องหมาย <code>\'\'</code> หลังคำว่า sheetsUrl แล้วบันทึก จากนั้น Commit และ Push ด้วย GitHub Desktop</li>' +
      '<li>รอ 1-2 นาที เปิดหน้านี้ใหม่ แล้วกรอกรหัสครูจากขั้นตอนที่ 3</li>' +
      '</ol><p class="note">รหัสครูเก็บใน Google ของครู ไม่อยู่ในเว็บ นักเรียนจึงดูคะแนนเพื่อนไม่ได้</p></div>';

    html += '<div class="panel card"><div class="block-head"><h2>ข้อมูลตัวอย่าง</h2></div>' +
      '<p class="note" style="margin-top:0">ดูตัวอย่างหน้านี้เมื่อมีผลสอบ (ข้อมูลสมมุติ)</p>' +
      '<div style="margin-top:12px">' + (state.demo
        ? '<button type="button" class="btn btn-sm" data-action="demo-off">ปิดข้อมูลตัวอย่าง</button>'
        : '<button type="button" class="btn btn-sm" data-action="demo-on">เปิดข้อมูลตัวอย่าง</button>') + '</div></div>';
    return html;
  }

  function renderAside() {
    var status = state.demo ? 'กำลังดูข้อมูลตัวอย่าง' : (state.connected ? 'เชื่อม Google Sheets แล้ว' : 'ยังไม่ได้เชื่อม Google Sheets');
    var html = '<div class="teacher-card"><span class="avatar">' + ICONS.teacher + '</span><div><strong>คุณครู</strong><span>' + status + '</span></div></div>';
    html += '<div class="block-head"><h2>ทำข้อสอบล่าสุด</h2></div>';
    var recent = state.rows.slice(0, 7);
    if (!recent.length) {
      html += '<p class="empty-note">ยังไม่มีกิจกรรม</p>';
    } else {
      html += '<div class="activity">' + recent.map(function (r, i) {
        var total = r.completed ? r.questionCount : r.answered;
        return '<div class="act card" style="animation-delay:' + (i * 50) + 'ms"><span class="thumb">' + Art.cover(examIndex(r.examId)) + '</span><div style="min-width:0">' +
          '<strong>' + esc(r.student) + '</strong>' +
          '<div class="sub"><span>' + esc(r.examTitle) + '</span><span>' + r.score + '/' + total + '</span></div>' +
          bar(pct(r.score, total)) + '<div class="sub" style="margin:4px 0 0"><span>' + whenText(r.time) + '</span></div></div></div>';
      }).join('') + '</div>';
    }
    return html;
  }

  function renderNav() {
    $('nav').innerHTML = NAV.map(function (n) {
      return '<button type="button" class="nav-btn' + (state.view === n.id ? ' active' : '') + '" data-action="nav" data-view="' + n.id + '">' + ICONS[n.id] + '<span>' + n.label + '</span></button>';
    }).join('');
  }

  // ---------- จัดการบทและเรื่อง ----------

  function openManage(subjectName) {
    var ES = ExamSource;
    var sets = state.exams.filter(function (e) { return ES.subjectOf(e).name === subjectName; });
    state.manage = {
      subject: subjectName,
      fileCount: sets.filter(function (e) { return e.source !== 'sheets'; }).length,
      busy: false,
      msg: null,
      units: ES.groupBy(sets.filter(function (e) { return e.source === 'sheets'; }), ES.unitOf).map(function (g) {
        return {
          name: g.key === ES.OTHER_UNIT ? '' : g.key,
          lessons: ES.groupBy(g.items, ES.lessonOf).map(function (l) {
            return { name: l.key, titles: l.items.map(function (e) { return e.title; }) };
          })
        };
      })
    };
  }

  function manageView() {
    var m = state.manage;
    function arrows(kind, idx, len, extra) {
      return '<span class="mg-arrows">' +
        '<button type="button" class="icon-btn" data-action="mg-move" data-kind="' + kind + '" data-i="' + idx + '"' + (extra || '') + ' data-dir="-1" aria-label="เลื่อนขึ้น"' + (idx === 0 ? ' disabled' : '') + '>↑</button>' +
        '<button type="button" class="icon-btn" data-action="mg-move" data-kind="' + kind + '" data-i="' + idx + '"' + (extra || '') + ' data-dir="1" aria-label="เลื่อนลง"' + (idx === len - 1 ? ' disabled' : '') + '>↓</button></span>';
    }
    // every place a set can go: "บทที่ 1 › เรื่อง ..."
    var targets = [];
    m.units.forEach(function (u, ui) {
      u.lessons.forEach(function (l, li) {
        targets.push({ v: ui + ':' + li, label: 'บทที่ ' + (ui + 1) + (u.name ? ' ' + u.name : '') + ' › ' + (l.name || 'รวมทั้งบท') });
      });
    });
    function moveSelect(ui, li, title) {
      return '<select class="mg-select" data-mg-set="' + esc(title) + '" data-from="' + ui + ':' + li + '" aria-label="ย้ายชุด ' + esc(title) + '">' +
        targets.map(function (t) { return '<option value="' + t.v + '"' + (t.v === ui + ':' + li ? ' selected' : '') + '>' + esc(t.label) + '</option>'; }).join('') + '</select>';
    }
    var html = '<div class="panel card block manage">' +
      '<p class="note" style="margin-top:0">พิมพ์ในช่องเพื่อเปลี่ยนชื่อ กด ↑ ↓ เพื่อเรียง ย้ายชุดได้จากช่องเลือกข้างชื่อชุด</p>' +
      (m.fileCount ? '<p class="note">อีก ' + m.fileCount + ' ชุดอยู่ในไฟล์เว็บ แก้จากหน้านี้ไม่ได้</p>' : '') +
      (m.msg ? '<p class="msg ' + m.msg.kind + '">' + esc(m.msg.text) + '</p>' : '');
    html += m.units.map(function (u, ui) {
      var unitSets = u.lessons.reduce(function (n, l) { return n + l.titles.length; }, 0);
      return '<div class="mg-unit"><div class="mg-row"><span class="mg-no">บทที่ ' + (ui + 1) + '</span>' +
        '<input type="text" class="mg-input" data-mg="unit" data-i="' + ui + '" value="' + esc(u.name) + '" placeholder="ชื่อบท เช่น เศษส่วน" />' +
        arrows('unit', ui, m.units.length) +
        '<button type="button" class="btn btn-ghost btn-sm mg-del" data-action="mg-del-unit" data-i="' + ui + '"' + (unitSets ? ' disabled title="ย้ายชุดข้อสอบออกก่อน"' : '') + '>ลบบท</button></div>' +
        '<div class="mg-lessons">' + u.lessons.map(function (l, li) {
          return '<div class="mg-lesson-box"><div class="mg-row mg-lesson"><span class="mg-no">เรื่อง</span>' +
            '<input type="text" class="mg-input" data-mg="lesson" data-i="' + ui + '" data-j="' + li + '" value="' + esc(l.name) + '" placeholder="ไม่ใส่ = ชุดรวมทั้งบท" />' +
            arrows('lesson', li, u.lessons.length, ' data-u="' + ui + '"') +
            '<button type="button" class="btn btn-ghost btn-sm mg-del" data-action="mg-del-lesson" data-i="' + ui + '" data-j="' + li + '"' + (l.titles.length ? ' disabled title="ย้ายชุดข้อสอบออกก่อน"' : '') + '>ลบ</button></div>' +
            (l.titles.length
              ? '<ul class="mg-sets-list">' + l.titles.map(function (title) {
                  return '<li><span class="mg-set-name">' + esc(title) + '</span>' + moveSelect(ui, li, title) + '</li>';
                }).join('') + '</ul>'
              : '<p class="mg-empty">ยังไม่มีชุดข้อสอบ ย้ายชุดมาใส่ได้จากช่องเลือกของชุดอื่น</p>') +
            '</div>';
        }).join('') +
        '<button type="button" class="btn btn-sm mg-add" data-action="mg-add-lesson" data-i="' + ui + '">+ เพิ่มเรื่อง</button></div></div>';
    }).join('');
    html += '<button type="button" class="btn btn-sm mg-add mg-add-unit" data-action="mg-add-unit">+ เพิ่มบท</button>' +
      '<p class="note">บทหรือเรื่องที่ไม่มีชุดข้อสอบจะไม่ถูกบันทึก</p>' +
      '<div class="btn-row" style="margin-top:12px"><button type="button" class="btn btn-primary" data-action="mg-save"' + (m.busy ? ' disabled' : '') + '>' + (m.busy ? 'กำลังบันทึก...' : 'บันทึก') + '</button>' +
      '<button type="button" class="btn btn-ghost btn-sm" data-action="mg-close">ยกเลิก</button></div></div>';
    return html;
  }

  function moveManage(t) {
    var m = state.manage;
    var list = t.dataset.kind === 'unit' ? m.units : m.units[Number(t.dataset.u)].lessons;
    var i = Number(t.dataset.i);
    var j = i + Number(t.dataset.dir);
    if (j < 0 || j >= list.length) return;
    var tmp = list[i]; list[i] = list[j]; list[j] = tmp;
    render();
  }

  function moveSet(select) {
    var m = state.manage;
    var from = select.dataset.from.split(':').map(Number);
    var to = select.value.split(':').map(Number);
    var title = select.dataset.mgSet;
    var src = m.units[from[0]].lessons[from[1]].titles;
    src.splice(src.indexOf(title), 1);
    m.units[to[0]].lessons[to[1]].titles.push(title);
    render();
  }

  function keepManageScroll(fn) {
    var y = window.scrollY;
    fn();
    render();
    window.scrollTo(0, y);
  }

  function saveManage() {
    var m = state.manage;
    var used = m.units.filter(function (u) { return u.lessons.some(function (l) { return l.titles.length; }); });
    if (used.some(function (u) { return !u.name.trim(); })) {
      m.msg = { kind: 'bad', text: 'ใส่ชื่อบทให้ครบทุกบทก่อนนะครับ' };
      render();
      return;
    }
    var tooOld = needsVersion(SCRIPT_VERSION);
    if (tooOld) { m.msg = { kind: 'bad', text: tooOld }; render(); return; }
    var updates = [];
    used.forEach(function (u, ui) {
      u.lessons.filter(function (l) { return l.titles.length; }).forEach(function (l, li) {
        l.titles.forEach(function (title, si) {
          updates.push({ title: title, fields: { 'หน่วยการเรียนรู้': u.name.trim(), 'เรื่อง': l.name.trim(), 'ลำดับ': String((ui + 1) * 1000 + (li + 1) * 10 + si) } });
        });
      });
    });
    m.busy = true;
    m.msg = null;
    render();
    postScript({ action: 'setSetFields', updates: updates }).then(function (reply) {
      var problem = replyProblem(reply);
      if (problem) throw new Error(problem);
      var calls = 0;
      ExamSource.load(function (data) {
        calls++;
        if (calls === 1) return;
        state.exams = data.exams;
        state.sheet = data;
        state.stats = null;
        analyze();
        state.manage = null;
        state.statusMsg = { kind: 'ok', text: 'บันทึกแล้ว' };
        render();
      });
    }).catch(function (err) {
      m.busy = false;
      m.msg = { kind: 'bad', text: err && err.message && err.message.indexOf('fetch') < 0 ? err.message : 'บันทึกไม่สำเร็จ ตรวจอินเทอร์เน็ตแล้วลองอีกครั้ง' };
      render();
    });
  }

  // ---------- ดาวน์โหลดคะแนนเป็นไฟล์ Excel (CSV) ----------

  function csvCell(v) {
    var s = String(v == null ? '' : v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }

  function downloadCsv(name, rows) {
    // BOM so Excel reads Thai correctly
    var text = '\ufeff' + rows.map(function (r) { return r.map(csvCell).join(','); }).join('\r\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 0);
  }

  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }

  function exportAttempts() {
    var rows = [['วันที่', 'เวลา', 'นักเรียน', 'ชุดข้อสอบ', 'คะแนน', 'ตอบ', 'จำนวนข้อ', 'ร้อยละ', 'ทำครบ', 'ใช้เวลา (นาที)']];
    state.rows.slice().sort(function (a, b) { return a.time - b.time; }).forEach(function (r) {
      var d = new Date(r.time);
      rows.push([d.toLocaleDateString('th-TH'), d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }), r.student,
        r.examTitle || (examById(r.examId) || {}).title || r.examId, r.score, r.answered, r.questionCount,
        r.questionCount ? Math.round(r.score / r.questionCount * 100) : '', r.completed ? 'ใช่' : 'ไม่ครบ', Math.round(r.durationSec / 6) / 10]);
    });
    downloadCsv('คะแนนทุกครั้ง-' + today() + '.csv', rows);
  }

  // one row per student, best % for each set they finished
  function exportSummary() {
    var exams = state.exams;
    var best = {};
    var order = [];
    state.rows.forEach(function (r) {
      if (!best[r.student]) { best[r.student] = {}; order.push(r.student); }
      if (!r.completed || !r.questionCount) return;
      var p = Math.round(r.score / r.questionCount * 100);
      if (best[r.student][r.examId] == null || p > best[r.student][r.examId]) best[r.student][r.examId] = p;
    });
    order.sort(function (a, b) { return (parseInt(a, 10) || 0) - (parseInt(b, 10) || 0) || a.localeCompare(b, 'th'); });
    var rows = [['นักเรียน'].concat(exams.map(function (e) { return e.title + ' (%)'; }), ['ทำครบ (ชุด)', 'เฉลี่ย (%)'])];
    order.forEach(function (name) {
      var got = exams.map(function (e) { return best[name][e.id]; });
      var done = got.filter(function (v) { return v != null; });
      rows.push([name].concat(got.map(function (v) { return v == null ? '' : v; }), [done.length,
        done.length ? Math.round(done.reduce(function (s, v) { return s + v; }, 0) / done.length) : '']));
    });
    downloadCsv('สรุปคะแนนรายคน-' + today() + '.csv', rows);
  }

  // ---------- กล่องยืนยันในธีม ----------

  var confirmAction = null;

  function askConfirm(opts, onOk) {
    $('tConfirmTitle').textContent = opts.title || '';
    $('tConfirmText').textContent = opts.text || '';
    $('tConfirmText').hidden = !opts.text;
    $('tConfirmNote').textContent = opts.note || '';
    $('tConfirmNote').hidden = !opts.note;
    var ok = $('tConfirmOk');
    ok.textContent = opts.ok || 'ตกลง';
    ok.className = 'btn ' + (opts.danger ? 'btn-danger' : 'btn-primary');
    confirmAction = onOk;
    $('tConfirm').hidden = false;
    ok.focus();
  }

  function closeConfirm(run) {
    var action = confirmAction;
    confirmAction = null;
    $('tConfirm').hidden = true;
    if (run && action) action();
  }

  // ---------- เผยแพร่ / ร่าง ----------

  function setExamStatus(exam, status) {
    var publish = status === 'เผยแพร่';
    askConfirm({
      title: publish ? 'เผยแพร่ "' + exam.title + '" ให้นักเรียนไหม?' : 'ซ่อน "' + exam.title + '" เป็นร่างไหม?',
      note: publish ? 'นักเรียนจะเห็นชุดนี้เมื่อเปิดเว็บครั้งถัดไป (' + exam.questions.length + ' ข้อ)' : 'นักเรียนจะไม่เห็นชุดนี้ คะแนนเดิมยังอยู่',
      ok: publish ? 'เผยแพร่' : 'ซ่อนเป็นร่าง'
    }, function () {
      var tooOld = needsVersion(SCRIPT_VERSION);
      if (tooOld) { state.statusMsg = { kind: 'bad', text: tooOld }; render(); return; }
      state.statusBusy = true;
      render();
      postScript({ action: 'setExamStatus', title: exam.title, status: status }).then(function (reply) {
        var problem = replyProblem(reply);
        if (problem) throw new Error(problem);
        var calls = 0;
        ExamSource.load(function (data) {
          calls++;
          if (calls === 1) return;
          state.exams = data.exams;
          state.sheet = data;
          state.stats = null;
          analyze();
          state.statusBusy = false;
          state.statusMsg = { kind: 'ok', text: publish ? 'เผยแพร่แล้ว' : 'ซ่อนแล้ว' };
          render();
        });
      }).catch(function (err) {
        state.statusBusy = false;
        state.statusMsg = { kind: 'bad', text: err && err.message && err.message.indexOf('fetch') < 0 ? err.message : 'ส่งข้อมูลไม่สำเร็จ ตรวจอินเทอร์เน็ตแล้วลองอีกครั้ง' };
        render();
      });
    });
  }

  // ---------- แถบเตือนอัปเดตสคริปต์ ----------

  function scriptBanner() {
    var v = state.sheet && state.sheet.sheetStatus === 'fresh' ? state.sheet.scriptVersion : null;
    if (!SHEETS_URL || !v || v >= SCRIPT_VERSION) return '';
    return '<div class="update-banner no-print"><img src="img/3d/light_bulb.png" alt="" />' +
      '<div><b>อัปเดตสคริปต์ Google เป็นเวอร์ชัน ' + SCRIPT_VERSION + ' (ตอนนี้เวอร์ชัน ' + v + ')</b>' +
      '<span>ต้องอัปเดตก่อน บัญชีนักเรียน การแก้ข้อสอบ และการเผยแพร่จึงจะใช้ได้ (ราว 2 นาที)</span></div>' +
      '<button type="button" class="btn btn-sm btn-primary" data-action="show-update">ดูวิธีอัปเดต</button></div>';
  }

  function renderDemoBanner() {
    var b = $('demoBanner');
    b.hidden = !state.demo;
    if (state.demo) {
      b.innerHTML = '<span><b>กำลังดูข้อมูลตัวอย่าง</b> ชื่อและคะแนนทั้งหมดเป็นข้อมูลสมมุติ</span>' +
        '<button type="button" class="btn btn-sm" data-action="demo-off">ปิดตัวอย่าง</button>';
    }
  }


  // ---------- บัญชีนักเรียน ----------

  function randomPassword() {
    var n = '';
    var buf = new Uint32Array(6);
    (window.crypto || window.msCrypto).getRandomValues(buf);
    for (var i = 0; i < 6; i++) n += String(buf[i] % 10);
    return n;
  }

  function accountsProblem(reply) {
    if (reply && reply.error === 'unauthorized') return 'รหัสครูไม่ตรงกับ TEACHER_KEY ในสคริปต์ กรอกใหม่ในเมนูตั้งค่า';
    if (!reply || !reply.ok) return 'สคริปต์ Google ยังเก่า อัปเดตเป็นเวอร์ชัน ' + SCRIPT_VERSION + ' ก่อน (ดูวิธีที่ คลังข้อสอบ > วิธีเพิ่มข้อสอบผ่าน Google Sheets ขั้นตอนที่ 1)';
    return '';
  }

  function loadAccounts() {
    var a = state.accounts;
    if (!SHEETS_URL) return;
    a.loading = true;
    postScript({ action: 'listStudents' }).then(function (reply) {
      var problem = accountsProblem(reply);
      a.msg = problem ? { kind: 'bad', text: problem } : a.msg;
      a.list = problem ? [] : reply.students;
    }).catch(function () {
      a.msg = { kind: 'bad', text: 'โหลดรายชื่อไม่สำเร็จ ตรวจอินเทอร์เน็ตแล้วกด "โหลดใหม่"' };
      a.list = a.list || [];
    }).then(function () {
      a.loading = false;
      if (state.view === 'accounts') render();
    });
  }

  // "12 นัท" or "12<TAB>นัท" per line; a line without a number gets the next free number.
  function buildAccountDraft() {
    var a = state.accounts;
    var room = (a.room || '').trim().toLowerCase().replace(/\s+/g, '');
    var have = {};
    (a.list || []).forEach(function (st) { have[String(st.username).toLowerCase()] = st; });
    var used = {};
    var rows = [];
    var issues = [];
    a.paste.split(/\r?\n/).forEach(function (line, i) {
      var t = arabicDigits(line).trim();
      if (!t) return;
      // from Excel: เลขที่ | ชื่อ | ชื่อผู้ใช้ | รหัสผ่าน (the last two are optional)
      var cols = t.indexOf('\t') >= 0 ? t.split('\t').map(function (c) { return c.trim(); }) : null;
      var m = cols ? [null, cols[0], cols[1]] : t.match(/^(\d{1,3})[\s.,)-]+(.+)$/);
      if (!m || !/^\d{1,3}$/.test(m[1] || '') || !m[2]) { issues.push('บรรทัด ' + (i + 1) + ': ใส่เลขที่นำหน้าชื่อด้วย เช่น "12 นัท"'); return; }
      var num = String(parseInt(m[1], 10));
      var name = m[2].trim();
      var username = (cols && cols[2]) || ((room ? room + '-' : '') + num);
      var key = username.toLowerCase();
      if (used[key]) { issues.push('บรรทัด ' + (i + 1) + ': ชื่อผู้ใช้ ' + username + ' ซ้ำกับบรรทัดก่อนหน้า'); return; }
      used[key] = true;
      var old = have[key];
      rows.push({ username: username, password: (cols && cols[3]) || (old ? '' : randomPassword()), number: num, name: name, room: a.room.trim(), exists: !!old });
    });
    a.draft = { rows: rows, issues: issues };
  }

  function saveAccounts(students, doneText) {
    var a = state.accounts;
    a.busy = true;
    a.msg = null;
    render();
    return postScript({ action: 'saveStudents', students: students }).then(function (reply) {
      var problem = accountsProblem(reply);
      if (problem) { a.msg = { kind: 'bad', text: problem }; return; }
      a.msg = { kind: 'ok', text: doneText(reply) };
      a.draft = null;
      a.paste = '';
      a.list = null;
      loadAccounts();
    }).catch(function () {
      a.msg = { kind: 'bad', text: 'บันทึกไม่สำเร็จ ตรวจอินเทอร์เน็ตแล้วลองอีกครั้ง' };
    }).then(function () {
      a.busy = false;
      render();
    });
  }

  function renderAccounts() {
    var a = state.accounts;
    var list = a.list || [];
    var html = head('บัญชีนักเรียน', list.length ? list.length + ' คน • นักเรียนใช้ชื่อผู้ใช้และรหัสผ่านนี้เข้าสู่ระบบ' : 'สร้างชื่อผู้ใช้และรหัสผ่านให้นักเรียน',
      '<div class="no-print" style="display:flex;gap:10px;flex-wrap:wrap">' +
      '<button type="button" class="btn btn-sm" data-action="acc-reload"' + (a.loading ? ' disabled' : '') + '>' + (a.loading ? 'กำลังโหลด...' : 'โหลดใหม่') + '</button>' +
      (list.length ? '<button type="button" class="btn btn-sm btn-primary" data-action="acc-print">พิมพ์บัตรเข้าระบบ</button>' : '') + '</div>');

    if (!SHEETS_URL) return html + '<div class="panel card"><p class="empty-note">ต้องเชื่อม Google Sheets ก่อน</p></div>';
    if (a.msg) html += '<div class="panel card block import-msg ' + a.msg.kind + '"><p class="msg ' + a.msg.kind + '" style="margin:0">' + esc(a.msg.text) + '</p></div>';

    // add a class
    html += '<div class="panel card block no-print"><div class="block-head"><h2>เพิ่มนักเรียนทั้งห้อง</h2></div>' +
      '<p class="note" style="margin-top:0">คัดลอกคอลัมน์ <b>เลขที่</b> และ <b>ชื่อ</b> จาก Excel มาวาง บรรทัดละ 1 คน ระบบจะตั้งชื่อผู้ใช้เป็น <b>รหัสห้อง-เลขที่</b> และสุ่มรหัสผ่านตัวเลข 6 หลักให้ ' +
        'ถ้าอยากตั้งเอง ให้คัดลอก 4 คอลัมน์ <b>เลขที่ | ชื่อ | ชื่อผู้ใช้ | รหัสผ่าน</b> มาวางแทน หรือกด "สร้างบัญชี" แล้วแก้ในตารางก็ได้</p>' +
      '<div class="pick-fields"><label class="pick-field"><span>รหัสห้อง (ใช้นำหน้าชื่อผู้ใช้)</span><input id="accRoom" type="text" value="' + esc(a.room) + '" placeholder="เช่น p5 หรือ p5-1" /></label></div>' +
      '<textarea id="accPaste" class="import-text" placeholder="1 กานต์&#10;2 ข้าวหอม&#10;3 จิรายุ">' + esc(a.paste) + '</textarea>' +
      '<div class="btn-row" style="margin-top:10px"><button type="button" class="btn btn-secondary btn-sm" data-action="acc-preview">สร้างบัญชี</button></div>';
    if (a.draft) {
      var fresh = a.draft.rows.filter(function (r) { return !r.exists; }).length;
      html += '<div class="acc-draft">' +
        (a.draft.issues.length ? '<div class="error-text"><ul style="margin:0;padding-left:20px">' + a.draft.issues.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') + '</ul></div>' : '') +
        (a.draft.rows.length ? '<div class="table-wrap"><table class="plain"><thead><tr><th>เลขที่</th><th>ชื่อ</th><th>ชื่อผู้ใช้</th><th>รหัสผ่าน</th></tr></thead><tbody>' +
          a.draft.rows.map(function (r, ri) {
            return '<tr><td class="num">' + esc(r.number) + '</td><td>' + esc(r.name) + '</td>' +
              '<td><input class="acc-input" data-acc-draft="' + ri + '" data-field="username" value="' + esc(r.username) + '" aria-label="ชื่อผู้ใช้ของ ' + esc(r.name) + '" autocapitalize="none" spellcheck="false" /></td>' +
              '<td><input class="acc-input" data-acc-draft="' + ri + '" data-field="password" value="' + esc(r.password) + '" placeholder="' + (r.exists ? 'เว้นว่าง = ใช้รหัสเดิม' : 'อย่างน้อย 4 ตัว') + '" aria-label="รหัสผ่านของ ' + esc(r.name) + '" autocapitalize="none" spellcheck="false" />' +
              (r.exists ? '<div class="acc-hint">มีบัญชีนี้แล้ว จะอัปเดตข้อมูล</div>' : '') + '</td></tr>';
          }).join('') + '</tbody></table></div>' +
          '<p class="note">แก้ชื่อผู้ใช้และรหัสผ่านในตารางได้ ห้ามเว้นวรรค รหัสผ่านอย่างน้อย 4 ตัว</p>' +
          '<div class="btn-row" style="margin-top:12px"><button type="button" class="btn btn-primary" data-action="acc-save"' + (a.busy ? ' disabled' : '') + '>' +
            (a.busy ? 'กำลังบันทึก...' : 'บันทึก ' + a.draft.rows.length + ' บัญชี' + (fresh < a.draft.rows.length ? ' (ใหม่ ' + fresh + ')' : '')) + '</button>' +
            '<button type="button" class="btn btn-ghost btn-sm" data-action="acc-cancel">ยกเลิก</button></div>' : '') +
        '</div>';
    }
    html += '</div>';

    // list
    if (a.loading && !a.list) return html + '<div class="panel card"><p class="empty-note">กำลังโหลดรายชื่อ...</p></div>';
    if (!list.length) return html + '<div class="panel card"><p class="empty-note">ยังไม่มีบัญชีนักเรียน วางรายชื่อด้านบนเพื่อเริ่ม</p></div>';
    var sorted = list.slice().sort(function (x, y) {
      return String(x.room).localeCompare(String(y.room)) || (parseInt(x.number, 10) || 0) - (parseInt(y.number, 10) || 0);
    });
    html += '<div class="panel card block"><div class="block-head"><h2>รายชื่อทั้งหมด</h2>' +
      '<button type="button" class="btn btn-ghost btn-sm no-print" data-action="acc-toggle-pass">' + (a.showPass ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน') + '</button></div>' +
      '<div class="table-wrap"><table class="plain acc-table"><thead><tr><th>ห้อง</th><th>เลขที่</th><th>ชื่อ</th><th>ชื่อผู้ใช้</th><th>รหัสผ่าน</th><th>ใช้ล่าสุด</th><th class="no-print"></th></tr></thead><tbody>' +
      sorted.map(function (st) {
        if (a.editing === st.username) return accountEditRow(st);
        return '<tr><td>' + esc(st.room) + '</td><td class="num">' + esc(st.number) + '</td><td>' + esc(st.name) + '</td><td><code>' + esc(st.username) + '</code></td>' +
          '<td><code>' + (a.showPass ? esc(st.password) : '••••••') + '</code></td>' +
          '<td class="num">' + (st.lastSeen ? esc(whenText(new Date(st.lastSeen).getTime())) : '-') + '</td>' +
          '<td class="no-print acc-actions"><button type="button" class="btn btn-sm" data-action="acc-edit" data-user="' + esc(st.username) + '"' + (a.busy ? ' disabled' : '') + '>แก้ไข</button>' +
          '<button type="button" class="btn btn-sm" data-action="acc-reset" data-user="' + esc(st.username) + '"' + (a.busy ? ' disabled' : '') + '>ตั้งรหัสใหม่</button>' +
          '<button type="button" class="btn btn-ghost btn-sm ed-delete" data-action="acc-delete" data-user="' + esc(st.username) + '"' + (a.busy ? ' disabled' : '') + '>ลบ</button></td></tr>';
      }).join('') + '</tbody></table></div>' +
      '<p class="note">กด "แก้ไข" เพื่อตั้งชื่อผู้ใช้หรือรหัสผ่านเอง • นักเรียนลืมรหัส: กด "ตั้งรหัสใหม่" แล้วบอกรหัสใหม่ คะแนนเดิมยังอยู่</p></div>';
    return html;
  }

  function accountEditRow(st) {
    var e = state.accounts.edit;
    function input(field, label, extra) {
      return '<input class="acc-input" data-acc-edit="' + field + '" value="' + esc(e[field]) + '" aria-label="' + label + '" autocapitalize="none" spellcheck="false"' + (extra || '') + ' />';
    }
    return '<tr class="acc-editing"><td>' + input('room', 'ห้อง') + '</td><td>' + input('number', 'เลขที่') + '</td>' +
      '<td>' + input('name', 'ชื่อ') + '</td><td>' + input('username', 'ชื่อผู้ใช้') + '</td><td>' + input('password', 'รหัสผ่าน') + '</td><td></td>' +
      '<td class="no-print acc-actions"><button type="button" class="btn btn-sm btn-primary" data-action="acc-edit-save">บันทึก</button>' +
      '<button type="button" class="btn btn-ghost btn-sm" data-action="acc-edit-cancel">ยกเลิก</button>' +
      (e.error ? '<div class="acc-hint bad">' + esc(e.error) + '</div>' : '') + '</td></tr>';
  }

  // same rules for new accounts and edits; returns a message or ''
  function accountProblem(username, password, ignoreUser, isNew) {
    if (!username) return 'ใส่ชื่อผู้ใช้ก่อน';
    if (/\s/.test(username)) return 'ชื่อผู้ใช้ ' + username + ' มีเว้นวรรค ใช้ขีด (-) แทนได้';
    if (username.length > 40) return 'ชื่อผู้ใช้ยาวเกิน 40 ตัว';
    if ((isNew || password) && password.length < 4) return 'รหัสผ่านของ ' + username + ' ต้องมีอย่างน้อย 4 ตัว';
    var key = username.toLowerCase();
    var clash = (state.accounts.list || []).some(function (x) {
      return String(x.username).toLowerCase() === key && String(x.username).toLowerCase() !== String(ignoreUser || '').toLowerCase();
    });
    if (clash && ignoreUser !== undefined) return 'ชื่อผู้ใช้ ' + username + ' มีคนใช้แล้ว';
    return '';
  }

  function saveAccountEdit() {
    var a = state.accounts;
    var e = a.edit;
    var username = e.username.trim();
    var password = e.password.trim();
    e.error = accountProblem(username, password, a.editing, false);
    if (e.error) { render(); return; }
    var old = a.editing;
    saveAccounts([{ oldUsername: old, username: username, password: password, number: e.number.trim(), name: e.name.trim(), room: e.room.trim() }], function (reply) {
      if (reply.taken && reply.taken.length) return 'ชื่อผู้ใช้ ' + reply.taken.join(', ') + ' มีคนใช้แล้ว ยังไม่ได้เปลี่ยน';
      a.editing = null;
      a.edit = null;
      return 'บันทึกบัญชี ' + username + ' แล้ว' + (old.toLowerCase() !== username.toLowerCase() ? ' นักเรียนต้องเข้าสู่ระบบใหม่ด้วยชื่อผู้ใช้ ' + username : '');
    });
  }

  function resetAccountPassword(username) {
    var pass = randomPassword();
    askConfirm({
      title: 'ตั้งรหัสผ่านใหม่ให้ ' + username + ' ไหม?',
      text: 'รหัสใหม่: ' + pass,
      note: 'นักเรียนต้องเข้าสู่ระบบใหม่ด้วยรหัสนี้ คะแนนเดิมยังอยู่',
      ok: 'ตั้งรหัสใหม่'
    }, function () {
      saveAccounts([{ username: username, password: pass }], function () { return 'ตั้งรหัสใหม่ให้ ' + username + ' แล้ว: ' + pass; });
    });
  }

  function deleteAccount(username) {
    askConfirm({
      title: 'ลบบัญชี ' + username + ' ไหม?',
      note: 'นักเรียนคนนี้จะเข้าไม่ได้อีก คะแนนที่ส่งมาแล้วยังอยู่',
      ok: 'ลบบัญชี', danger: true
    }, function () { doDeleteAccount(username); });
  }

  function doDeleteAccount(username) {
    var a = state.accounts;
    a.busy = true;
    render();
    postScript({ action: 'deleteStudent', username: username }).then(function (reply) {
      var problem = accountsProblem(reply);
      a.msg = problem ? { kind: 'bad', text: problem } : { kind: 'ok', text: 'ลบบัญชี ' + username + ' แล้ว' };
      if (!problem) { a.list = null; loadAccounts(); }
    }).catch(function () {
      a.msg = { kind: 'bad', text: 'ลบไม่สำเร็จ ตรวจอินเทอร์เน็ตแล้วลองอีกครั้ง' };
    }).then(function () { a.busy = false; render(); });
  }

  // Cut-out cards, 10 per A4 page, each with the student's username and password.
  function printAccountCards() {
    var list = (state.accounts.list || []).slice().sort(function (x, y) {
      return String(x.room).localeCompare(String(y.room)) || (parseInt(x.number, 10) || 0) - (parseInt(y.number, 10) || 0);
    });
    var site = location.href.replace(/teacher\.html.*$/, '');
    var box = document.createElement('div');
    box.id = 'printCards';
    box.innerHTML = list.map(function (st) {
      return '<div class="login-slip"><div class="slip-head"><img src="img/3d/backpack.png" alt="" /><div><b>ห้องติว</b><span>' + esc(site) + '</span></div></div>' +
        '<div class="slip-name">' + esc([st.number, st.name].filter(Boolean).join(' ')) + (st.room ? ' <small>' + esc(st.room) + '</small>' : '') + '</div>' +
        '<div class="slip-row"><span>ชื่อผู้ใช้</span><code>' + esc(st.username) + '</code></div>' +
        '<div class="slip-row"><span>รหัสผ่าน</span><code>' + esc(st.password) + '</code></div></div>';
    }).join('');
    document.body.appendChild(box);
    document.body.classList.add('printing-cards');
    var done = function () {
      document.body.classList.remove('printing-cards');
      if (box.parentNode) box.parentNode.removeChild(box);
      window.removeEventListener('afterprint', done);
    };
    window.addEventListener('afterprint', done);
    setTimeout(function () { window.print(); }, 200);
  }

  function render() {
    if (!state.stats) analyze();
    renderNav();
    renderDemoBanner();
    var views = { overview: renderOverview, students: renderStudents, analysis: renderAnalysis, bank: renderBank, import: renderImport, accounts: renderAccounts, settings: renderSettings };
    var view = $('view');
    var statusMsg = state.statusMsg && state.view === 'bank'
      ? '<div class="panel card block import-msg ' + state.statusMsg.kind + ' no-print"><p class="msg ' + state.statusMsg.kind + '" style="margin:0">' + esc(state.statusMsg.text) + '</p></div>' : '';
    view.innerHTML = '<div class="view">' + scriptBanner() + statusMsg + views[state.view]() + '</div>';
    $('aside').innerHTML = renderAside();
    if ($('scriptBox')) loadScript();
    bindDropZone();
  }

  function bindDropZone() {
    var zone = $('dropZone');
    if (!zone) return;
    ['dragenter', 'dragover'].forEach(function (type) {
      zone.addEventListener(type, function (e) { e.preventDefault(); zone.classList.add('over'); });
    });
    ['dragleave', 'drop'].forEach(function (type) {
      zone.addEventListener(type, function () { zone.classList.remove('over'); });
    });
    zone.addEventListener('drop', function (e) {
      e.preventDefault();
      readImportFile(e.dataTransfer.files[0]);
    });
  }

  function downloadExample() {
    var blob = new Blob(['﻿' + ExamImport.example], { type: 'text/plain;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'ตัวอย่างข้อสอบ.txt';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 0);
  }

  function go(view) {
    state.view = view;
    state.statusMsg = null;
    if (view === 'accounts' && !state.accounts.list && !state.accounts.loading) loadAccounts();
    state.studentKey = null;
    state.bankExamId = null;
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function loadScript() {
    var box = $('scriptBox');
    if (state.scriptText) { box.textContent = state.scriptText; return; }
    fetch('teacher-setup/apps-script.txt').then(function (r) { return r.text(); }).then(function (t) {
      state.scriptText = t;
      if ($('scriptBox')) $('scriptBox').textContent = t;
    }).catch(function () {
      box.textContent = 'โหลดสคริปต์ไม่ได้ เปิดไฟล์ teacher-setup/apps-script.txt แทน';
    });
  }

  function copyScript() {
    if (!state.scriptText) return;
    var done = function () { var m = $('copyMsg'); if (m) m.hidden = false; };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(state.scriptText).then(done, selectScript);
    } else {
      selectScript();
    }
  }

  function selectScript() {
    var box = $('scriptBox');
    box.hidden = false;
    var range = document.createRange();
    range.selectNodeContents(box);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  // ---------- events ----------

  function onClick(e) {
    var t = e.target.closest('[data-action]');
    if (!t) return;
    var a = t.dataset.action;
    if (a === 'nav') go(t.dataset.view);
    else if (a === 'refresh') refresh();
    else if (a === 'demo-on') { setRows(makeDemoRows(), true); render(); }
    else if (a === 'demo-off') { state.demo = false; state.rows = []; state.stats = null; state.loadedAt = null; render(); refresh(); }
    else if (a === 'open-student') { state.studentKey = t.dataset.key; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    else if (a === 'close-student') { state.studentKey = null; render(); }
    else if (a === 'pick-analysis') { state.analysisExamId = t.dataset.exam; render(); }
    else if (a === 'open-bank') { state.statusMsg = null; state.bankExamId = t.dataset.exam; state.edit = null; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    else if (a === 'overview-subject') {
      state.view = 'bank'; state.bankExamId = null; state.manage = null;
      state.bankNav = { subject: t.dataset.s, unit: '', lesson: '' };
      render();
      window.scrollTo(0, 0);
    }
    else if (a === 'manage-open') { openManage(t.dataset.subject); render(); }
    else if (a === 'mg-close') { state.manage = null; render(); }
    else if (a === 'mg-move') moveManage(t);
    else if (a === 'mg-add-unit') keepManageScroll(function () { state.manage.units.push({ name: '', lessons: [{ name: '', titles: [] }] }); });
    else if (a === 'mg-add-lesson') keepManageScroll(function () { state.manage.units[Number(t.dataset.i)].lessons.push({ name: '', titles: [] }); });
    else if (a === 'mg-del-unit') keepManageScroll(function () { state.manage.units.splice(Number(t.dataset.i), 1); });
    else if (a === 'mg-del-lesson') keepManageScroll(function () { state.manage.units[Number(t.dataset.i)].lessons.splice(Number(t.dataset.j), 1); });
    else if (a === 'mg-save') saveManage();
    else if (a === 'export-summary') exportSummary();
    else if (a === 'export-attempts') exportAttempts();
    else if (a === 'bank-nav') {
      state.manage = null;
      state.bankNav = { subject: t.dataset.s || '', unit: t.dataset.u || '', lesson: t.dataset.l || '' };
      render();
      window.scrollTo(0, 0);
    }
    else if (a === 'close-bank') { state.bankExamId = null; state.edit = null; render(); }
    else if (a === 'edit-q') startEdit(t.dataset.qid);
    else if (a === 'cancel-edit') { state.edit = null; render(); }
    else if (a === 'save-q') saveEdit();
    else if (a === 'delete-q') deleteEdit();
    else if (a === 'remove-image') { setEditImage(''); $('edImageMsg').hidden = true; }
    else if (a === 'theme') { Theme.set(t.dataset.theme); render(); }
    else if (a === 'print') window.print();
    else if (a === 'copy-script') copyScript();
    else if (a === 'copy-header') copyText(EXAM_HEADERS.join('\t'), 'headerMsg');
    else if (a === 'reload-exams') reloadExams();
    else if (a === 'copy-prompt') copyText(buildPickedPrompt(), 'promptMsg');
    else if (a === 'download-example') downloadExample();
    else if (a === 'parse-import') {
      var text = $('importText').value;
      state.pasteText = text;
      state.importMsg = text.trim() ? null : { kind: 'bad', text: 'วางข้อความข้อสอบในช่องก่อน หรือเลือกไฟล์' };
      state.draft = text.trim() ? buildDraft(text, '') : null;
      render();
      scrollToPreview();
    }
    else if (a === 'commit-import') commitImport();
    else if (a === 'clear-import') { state.draft = null; state.importMsg = null; state.pasteText = ''; render(); }
    else if (a === 'acc-reload') { state.accounts.list = null; state.accounts.msg = null; loadAccounts(); render(); }
    else if (a === 'acc-preview') { state.accounts.room = $('accRoom').value; state.accounts.paste = $('accPaste').value; buildAccountDraft(); render(); }
    else if (a === 'acc-cancel') { state.accounts.draft = null; render(); }
    else if (a === 'acc-save') {
      var d = state.accounts.draft;
      var seen = {};
      var bad = [];
      d.rows.forEach(function (r) {
        r.username = String(r.username || '').trim();
        r.password = String(r.password || '').trim();
        var key = r.username.toLowerCase();
        r.exists = (state.accounts.list || []).some(function (x) { return String(x.username).toLowerCase() === key; });
        var p = accountProblem(r.username, r.password, undefined, !r.exists);
        if (!p && seen[key]) p = 'ชื่อผู้ใช้ ' + r.username + ' ซ้ำกันในตาราง';
        seen[key] = true;
        if (p) bad.push(p);
      });
      if (bad.length) { d.issues = bad; render(); return; }
      var rows = d.rows.map(function (r) { return { username: r.username, password: r.password, number: r.number, name: r.name, room: r.room }; });
      saveAccounts(rows, function (reply) { return 'บันทึกแล้ว เพิ่ม ' + reply.added + ' คน แก้ ' + reply.updated + ' คน'; });
    }
    else if (a === 'acc-edit') {
      var st = (state.accounts.list || []).find(function (x) { return x.username === t.dataset.user; });
      state.accounts.editing = st.username;
      state.accounts.edit = { username: st.username, password: st.password || '', number: st.number || '', name: st.name || '', room: st.room || '', error: '' };
      render();
    }
    else if (a === 'acc-edit-cancel') { state.accounts.editing = null; state.accounts.edit = null; render(); }
    else if (a === 'acc-edit-save') saveAccountEdit();
    else if (a === 'acc-toggle-pass') { state.accounts.showPass = !state.accounts.showPass; render(); }
    else if (a === 'acc-reset') resetAccountPassword(t.dataset.user);
    else if (a === 'acc-delete') deleteAccount(t.dataset.user);
    else if (a === 'acc-print') printAccountCards();
    else if (a === 'set-status') { if (!state.statusBusy) setExamStatus(examById(state.bankExamId), t.dataset.status); }
    else if (a === 'confirm-ok') closeConfirm(true);
    else if (a === 'confirm-cancel') closeConfirm(false);
    else if (a === 'show-update') {
      state.view = 'bank'; state.bankExamId = null; state.bankNav = { subject: '', unit: '', lesson: '' };
      render();
      var g = document.querySelector('.guide');
      if (g) { g.open = true; g.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    }
    else if (a === 'forget-key') { lsSet(KEY_STORE, null); state.connected = false; showLock(); }
  }

  function onInput(e) {
    if (e.target.dataset && e.target.dataset.accDraft && state.accounts.draft) {
      state.accounts.draft.rows[Number(e.target.dataset.accDraft)][e.target.dataset.field] = e.target.value;
      return;
    }
    if (e.target.dataset && e.target.dataset.accEdit && state.accounts.edit) {
      state.accounts.edit[e.target.dataset.accEdit] = e.target.value;
      return;
    }
    if (e.target.dataset && e.target.dataset.mg && state.manage) {
      var u = state.manage.units[Number(e.target.dataset.i)];
      if (e.target.dataset.mg === 'unit') u.name = e.target.value; else u.lessons[Number(e.target.dataset.j)].name = e.target.value;
      return;
    }
    if (e.target.dataset && e.target.dataset.draft && state.draft) {
      state.draft.exams[Number(e.target.dataset.draft)][e.target.dataset.field] = e.target.value.trim();
      return;
    }
    if (e.target.dataset && e.target.dataset.pick) {
      state.pick[e.target.dataset.pick] = e.target.value;
      return;
    }
    if (e.target.id !== 'studentSearch') return;
    state.studentQuery = e.target.value;
    var pos = e.target.selectionStart;
    render();
    var input = $('studentSearch');
    input.focus();
    input.setSelectionRange(pos, pos);
  }

  function onSubmit(e) {
    if (e.target.id === 'editForm') { e.preventDefault(); return; }
    if (e.target.id === 'keyForm') {
      e.preventDefault();
      var key = $('keyInput').value.trim();
      var msg = $('keyMsg');
      msg.hidden = false;
      msg.className = 'msg';
      msg.textContent = 'กำลังทดสอบ...';
      tryKey(key).then(function () {
        render();
        var m = $('keyMsg');
        if (m) { m.hidden = false; m.className = 'msg ok'; m.textContent = 'เชื่อมต่อสำเร็จ พบข้อมูล ' + state.rows.length + ' รายการ'; }
      }).catch(function (err) {
        msg.className = 'msg bad';
        msg.textContent = err.message;
      });
    }
  }

  function tryKey(key) {
    if (!key) return Promise.reject(new Error('กรอกรหัสครูก่อนนะครับ'));
    return fetchScores(key).then(function (data) {
      if (!data.ok) throw new Error('รหัสไม่ถูกต้อง ลองตรวจดูว่าตรงกับ TEACHER_KEY ในสคริปต์');
      lsSet(KEY_STORE, key);
      state.connected = true;
      setRows(data.rows, false);
    }, function () {
      throw new Error('ติดต่อ Google Sheets ไม่ได้ ตรวจว่าตอน Deploy ตั้ง "ผู้ที่มีสิทธิ์เข้าถึง" เป็น "ทุกคน (Anyone)" แล้ว และลิงก์ใน js/config.js ถูกต้อง');
    });
  }

  function showLock() {
    $('dashShell').hidden = true;
    $('lockScreen').hidden = false;
    $('lockArt').innerHTML = '<img src="img/3d/school.png" alt="" style="width:100%;height:100%;object-fit:contain" />';
    $('lockKey').value = '';
    $('lockKey').focus();
  }

  function showDash() {
    $('lockScreen').hidden = true;
    $('dashShell').hidden = false;
    render();
  }

  function bindLock() {
    $('lockForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var err = $('lockError');
      var btn = e.target.querySelector('button[type="submit"]');
      err.hidden = true;
      btn.disabled = true;
      btn.textContent = 'กำลังตรวจสอบ...';
      tryKey($('lockKey').value.trim()).then(showDash).catch(function (ex) {
        err.textContent = ex.message;
        err.hidden = false;
      }).then(function () {
        btn.disabled = false;
        btn.textContent = 'เข้าห้องครู';
      });
    });
  }

  function init() {
    document.addEventListener('click', onClick);
    document.addEventListener('input', onInput);
    document.addEventListener('submit', onSubmit);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !$('tConfirm').hidden) closeConfirm(false);
    });
    $('tConfirm').addEventListener('click', function (e) { if (e.target.id === 'tConfirm') closeConfirm(false); });
    document.addEventListener('change', function (e) {
      if (e.target.id === 'importFile') readImportFile(e.target.files[0]);
      if (e.target.id === 'edImageFile') uploadEditImage(e.target.files[0]);
      if (e.target.dataset.mgSet && state.manage) { var y = window.scrollY; moveSet(e.target); window.scrollTo(0, y); return; }
      if (e.target.dataset.draft && state.draft) {
        state.draft.exams[Number(e.target.dataset.draft)][e.target.dataset.field] = e.target.value.trim();
        if (e.target.dataset.rerender || e.target.dataset.field === 'title') {
          flagDraft(state.draft);
          var keepY = window.scrollY;
          render();
          window.scrollTo(0, keepY);
        }
        return;
      }
      if (e.target.dataset.pick) {
        state.pick[e.target.dataset.pick] = e.target.value;
        if (e.target.dataset.rerender) {
          state.pick.codes = {};
          state.pick.touched = true;
          var y = window.scrollY;
          render();
          window.scrollTo(0, y);
        }
      }
      if (e.target.dataset.code) {
        state.pick.codes[e.target.dataset.code] = e.target.checked;
        var btn = $('promptBtn');
        if (btn) btn.textContent = promptButtonLabel();
      }
    });
    loadCurriculum().then(function () {
      if (!$('dashShell').hidden) render();
    });
    bindLock();

    var started = false;
    ExamSource.load(function (data) {
      state.exams = data.exams;
      state.sheet = data;
      analyze();
      if (started) {
        if (!$('dashShell').hidden) render();
        return;
      }
      started = true;
      if (!SHEETS_URL) { showDash(); return; }
      var key = lsGet(KEY_STORE);
      if (!key) { showLock(); return; }
      tryKey(key).then(showDash).catch(showLock);
    }, function () {
      document.body.innerHTML = '<p class="empty-note">โหลดข้อมูลข้อสอบไม่ได้ ลองรีเฟรชหน้านี้อีกครั้ง</p>';
    });
  }

  function reloadExams() {
    var btn = document.querySelector('[data-action="reload-exams"]');
    if (btn) { btn.disabled = true; btn.textContent = 'กำลังโหลด...'; }
    var calls = 0;
    ExamSource.load(function (data) {
      calls++;
      if (ExamSource.isEnabled() && calls === 1) return;
      state.exams = data.exams;
      state.sheet = data;
      analyze();
      render();
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
