(function () {
  'use strict';

  var KEY_STORE = 'quizapp_teacher_key_v1';
  var SHEETS_URL = (window.QUIZ_CONFIG && window.QUIZ_CONFIG.sheetsUrl || '').trim();
  var LETTERS = ['ก', 'ข', 'ค', 'ง'];

  var ICONS = {
    overview: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
    students: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6.5 6.5 0 0 1 3.5 5.5"/></svg>',
    analysis: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
    bank: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z"/><path d="M20 4h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7z"/></svg>',
    settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
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
    sheet: null,
    draft: null,
    importMsg: null,
    pick: { area: 'ส', grade: 'ป.5', touched: false, codes: {}, title: '', subject: '', courseCode: '', unit: '', lesson: '', examType: '', count: '10' },
    importing: false,
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
      Object.keys(data.areas || {}).forEach(function (letter) {
        var area = data.areas[letter];
        curriculum.areas.push({ letter: letter, name: area.name });
        area.strands.forEach(function (strand) {
          strand.standards.forEach(function (st) {
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
    var html = head('ภาพรวมห้องเรียน', sub, refreshBtn());

    if (!state.rows.length) return html + noDataPanel();

    html += '<div class="stats block">' +
      stat('var(--yellow)', 'นักเรียน', s.students.length, 'คนที่ทำข้อสอบแล้ว') +
      stat('var(--blue)', 'ทำข้อสอบ', state.rows.length, 'ครั้งทั้งหมด') +
      stat('var(--mint)', 'คะแนนเฉลี่ย', s.avg == null ? '-' : s.avg + '%', 'จากครั้งที่ทำครบชุด') +
      stat('var(--pink)', '7 วันล่าสุด', s.thisWeek, 'ครั้ง') +
      '</div>';

    var examRows = state.exams.map(function (e) {
      var es = s.exams[e.id];
      var avg = es.completed ? Math.round(es.sumPct / es.completed) : null;
      return '<div class="row-item"><div class="row-top"><strong>' + esc(e.title) + '</strong>' +
        '<span class="num">' + (avg == null ? 'ยังไม่มีคนทำครบ' : avg + '% • ' + es.completed + ' ครั้ง') + '</span></div>' +
        bar(avg || 0) + '</div>';
    }).join('');

    var hard = s.items.filter(function (it) { return it.wrongRate > 0; }).slice(0, 5).map(function (it) {
      return '<div class="row-item"><div class="row-top"><strong>' + esc(it.exam.title) + ' ข้อ ' + it.no + '</strong>' +
        '<span class="num">ผิด ' + it.wrongRate + '%</span></div>' +
        '<div style="font-size:14px;color:var(--ink-soft)">' + esc(it.q.question) + '</div>' +
        bar(it.wrongRate, 'low') + '</div>';
    }).join('');

    html += prePostBlock();

    var needHelp = s.students.filter(function (st) { return st.avg != null && st.avg < 50; });

    html += '<div class="two-col block">' +
      '<div class="panel card"><div class="block-head"><h2>คะแนนเฉลี่ยรายชุด</h2></div><div class="rows">' + examRows + '</div></div>' +
      '<div class="panel card"><div class="block-head"><h2>ข้อที่ผิดบ่อย</h2>' +
        '<button type="button" class="btn btn-ghost btn-sm" data-action="nav" data-view="analysis">ดูทั้งหมด</button></div>' +
        '<div class="rows">' + (hard || '<p class="empty-note">ยังไม่มีข้อมูล</p>') + '</div></div>' +
      '</div>';

    html += '<div class="block"><div class="block-head"><h2>นักเรียนที่ควรช่วยเป็นพิเศษ</h2><span class="muted">คะแนนเฉลี่ยต่ำกว่า 50%</span></div>' +
      (needHelp.length
        ? '<div class="student-list">' + needHelp.map(studentCard).join('') + '</div>'
        : '<div class="panel card"><p class="empty-note">ไม่มีนักเรียนที่คะแนนเฉลี่ยต่ำกว่า 50% เยี่ยมมาก</p></div>') +
      '</div>';
    return html;
  }

  function stat(color, label, value, foot) {
    return '<div class="stat" style="background:' + color + '"><div class="label">' + label + '</div>' +
      '<div class="value">' + value + '</div><div class="foot">' + foot + '</div></div>';
  }

  function noDataPanel() {
    return '<div class="panel card" style="text-align:center">' +
      '<p class="empty-note" style="padding-bottom:8px">' +
      (SHEETS_URL
        ? 'ยังไม่มีนักเรียนส่งผลสอบเข้ามา เมื่อมีคนทำข้อสอบเสร็จ ผลจะขึ้นที่นี่'
        : 'ยังไม่ได้เชื่อมกับ Google Sheets คะแนนของนักเรียนจึงยังไม่ส่งมาที่หน้านี้') +
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
    var html = head('ผลนักเรียน', state.rows.length ? s.students.length + ' คน' : '', refreshBtn());
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
    var html = head('คลังข้อสอบ', state.exams.length + ' ชุด • ' + state.exams.reduce(function (n, e) { return n + e.questions.length; }, 0) + ' ข้อ',
      SHEETS_URL ? '<button type="button" class="btn btn-sm" data-action="reload-exams">โหลดข้อสอบใหม่</button>' : '');
    html += sheetPanel();
    html += '<div class="bank-grid">' + state.exams.map(function (e, i) {
      var bloom = {};
      e.questions.forEach(function (q) { if (q.bloom) bloom[q.bloom] = (bloom[q.bloom] || 0) + 1; });
      return '<article class="bank-card card" style="animation-delay:' + (i * 60) + 'ms"><div class="cover">' + Art.cover(i) + '</div><div class="body">' +
        '<div class="tags">' + typePill(e.examType) + diffPill(e.difficulty, 'ความยาก ') +
          (e.grade ? '<span class="pill">' + esc(e.grade) + '</span>' : '') + '</div>' +
        '<h3>' + esc(e.title) + '</h3>' +
        '<div class="exam-meta"><span>' + e.questions.length + ' ข้อ</span><span>จับเวลา ' + (e.timeLimitMinutes || 15) + ' นาที</span>' +
        '<span>' + (e.source === 'sheets' ? 'จาก Google Sheets' : 'จากไฟล์ในเว็บ') + '</span></div>' +
        metaTable({ subject: e.subject, courseCode: e.courseCode, standard: e.standard, unit: e.unit, lesson: e.lesson, indicators: e.indicators }, false) +
        '<div class="chips" style="margin:0;gap:6px">' + Object.keys(bloom).map(function (b) {
          return '<span class="pill">' + esc(b) + ' ' + bloom[b] + '</span>';
        }).join('') + '</div>' +
        '<button type="button" class="btn btn-primary" data-action="open-bank" data-exam="' + esc(e.id) + '">ดูข้อสอบและเฉลย</button>' +
        '</div></article>';
    }).join('') + '</div>';
    html += sheetGuide();
    return html;
  }

  var EXAM_HEADERS = ['ชุดข้อสอบ', 'วิชา', 'เวลา(นาที)', 'หัวข้อ', 'ตัวชี้วัด', 'Bloom', 'คำถาม', 'ก', 'ข', 'ค', 'ง', 'คำตอบ', 'คำอธิบาย', 'รูปภาพ',
    'ความยาก', 'ระดับชั้น', 'กลุ่มสาระ', 'รหัสวิชา', 'สาระ', 'มาตรฐาน', 'หน่วยการเรียนรู้', 'เรื่อง', 'ประเภทการสอบ', 'ความยากของชุด'];

  function sheetPanel() {
    if (!SHEETS_URL) {
      return '<div class="panel card block"><div class="block-head"><h2>เพิ่มข้อสอบเอง</h2></div>' +
        '<p class="note" style="margin-top:0">เชื่อม Google Sheets ในเมนูตั้งค่าก่อน แล้วครูจะเพิ่มข้อสอบใหม่ได้เองจากแท็บ "ข้อสอบ" ในสเปรดชีต</p>' +
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
      html += '<p class="note" style="margin-top:0">ถ้ายังไม่ได้อัปเดตสคริปต์เป็นเวอร์ชัน 4 ให้ทำตามขั้นตอนที่ 1 ด้านล่างก่อน</p>';
    } else if (sh.scriptVersion && sh.scriptVersion < 4) {
      html += '<p class="error-text" style="margin-top:4px">สคริปต์ Google ยังเป็นเวอร์ชัน ' + sh.scriptVersion + ' ให้อัปเดตเป็นเวอร์ชัน 4 (ขั้นตอนที่ 1 ด้านล่าง) เพื่อบันทึกข้อมูลหลักสูตร ระดับชั้น หน่วย และความยาก</p>';
    }
    if (sh.issues.length) {
      html += '<div class="error-text" style="margin-top:4px"><b>มี ' + sh.issues.length + ' แถวที่ยังไม่ขึ้นเว็บ</b> แก้ในสเปรดชีตแล้วกด "โหลดข้อสอบใหม่"' +
        '<ul style="margin:6px 0 0;padding-left:20px">' + sh.issues.slice(0, 12).map(function (it) {
          return '<li>แถว ' + it.row + ': ' + esc(it.message) + '</li>';
        }).join('') + (sh.issues.length > 12 ? '<li>และอีก ' + (sh.issues.length - 12) + ' แถว</li>' : '') + '</ul></div>';
    } else if (sh.sheetStatus === 'fresh' && sh.sheetExams.length) {
      html += '<p class="msg ok" style="margin-top:0">ทุกแถวถูกต้อง นักเรียนจะเห็นข้อสอบใหม่เมื่อเปิดเว็บครั้งถัดไป</p>';
    }
    return html + '</div>';
  }

  function sheetGuide() {
    if (!SHEETS_URL) return '';
    var needsUpdate = state.sheet && state.sheet.scriptVersion && state.sheet.scriptVersion < 4;
    return '<details class="panel card block guide"' + (state.sheet && state.sheet.sheetExams.length && !needsUpdate ? '' : ' open') + '>' +
      '<summary><h2>วิธีเพิ่มข้อสอบผ่าน Google Sheets</h2></summary>' +
      '<ol class="steps" style="margin-top:14px">' +
      '<li><b>อัปเดตสคริปต์เป็นเวอร์ชัน 4 (ทำครั้งเดียว)</b><br>เปิดสเปรดชีต → ส่วนขยาย → Apps Script → <b>จดรหัสในบรรทัด TEACHER_KEY ไว้ก่อน</b> → ลบโค้ดเดิมทั้งหมด → วางโค้ดใหม่ → ใส่รหัสเดิมกลับใน TEACHER_KEY → กดบันทึก<br>' +
        'จากนั้นกด ทำให้ใช้งานได้ → <b>จัดการการทำให้ใช้งานได้</b> → กดรูปดินสอ → ช่องเวอร์ชันเลือก <b>เวอร์ชันใหม่</b> → กดทำให้ใช้งานได้ (ลิงก์เดิมใช้ต่อได้ ไม่ต้องแก้ config.js)' +
        '<div style="margin-top:10px"><button type="button" class="btn btn-secondary btn-sm" data-action="copy-script">คัดลอกสคริปต์เวอร์ชัน 4</button> <span id="copyMsg" class="msg ok" hidden>คัดลอกแล้ว</span></div>' +
        '<pre class="code-box" id="scriptBox" hidden></pre></li>' +
      '<li>กดปุ่ม <b>โหลดข้อสอบใหม่</b> ด้านบนหนึ่งครั้ง สเปรดชีตจะมีแท็บใหม่ชื่อ <b>ข้อสอบ</b> พร้อมหัวตาราง</li>' +
      '<li>กรอกข้อสอบในแท็บ <b>ข้อสอบ</b> <b>1 แถว = 1 ข้อ</b><table class="plain" style="margin-top:8px"><tbody>' +
        '<tr><td><b>ชุดข้อสอบ</b></td><td>ชื่อชุด พิมพ์ให้เหมือนกันทุกแถวในชุดเดียวกัน (หรือพิมพ์แค่แถวแรก แถวถัดไปเว้นว่างได้)</td></tr>' +
        '<tr><td><b>ข้อมูลของชุด</b><br>วิชา (รายวิชา), รหัสวิชา, ระดับชั้น, กลุ่มสาระ, สาระ, มาตรฐาน, หน่วยการเรียนรู้, เรื่อง, ประเภทการสอบ, ความยากของชุด, เวลา(นาที)</td>' +
          '<td>ใส่แค่แถวแรกของชุดก็พอ ถ้าใส่ตัวชี้วัดรายข้อไว้ ระบบจะเติมระดับชั้น กลุ่มสาระ สาระ และมาตรฐานให้เอง ประเภทการสอบใช้คำว่า ก่อนเรียน ระหว่างเรียน หลังเรียน กลางภาค ปลายภาค หรือ ฝึกทำ</td></tr>' +
        '<tr><td><b>หัวข้อ / ตัวชี้วัด / Bloom / ความยาก</b></td><td>รายข้อ ไม่บังคับ ความยากใช้คำว่า ง่าย ปานกลาง หรือ ยาก ใส่แล้วหน้าวิเคราะห์ข้อสอบจะแยกผลให้</td></tr>' +
        '<tr><td><b>คำถาม, ก, ข, ค, ง</b></td><td>จำเป็นต้องใส่ทั้งหมด</td></tr>' +
        '<tr><td><b>คำตอบ</b></td><td>พิมพ์ ก ข ค หรือ ง</td></tr>' +
        '<tr><td><b>คำอธิบาย</b></td><td>เหตุผลที่นักเรียนจะเห็นหลังตอบ</td></tr>' +
        '<tr><td><b>รูปภาพ</b></td><td>ไม่บังคับ ใส่ลิงก์รูปที่เปิดดูได้โดยตรง</td></tr>' +
        '</tbody></table></li>' +
      '<li><b>มีข้อสอบใน Excel อยู่แล้ว:</b> เรียงคอลัมน์ใน Excel ให้ตรงกับหัวตาราง แล้วคัดลอกทั้งหมดไปวางในแท็บข้อสอบ ตั้งแต่แถวที่ 2' +
        '<div style="margin-top:10px"><button type="button" class="btn btn-sm" data-action="copy-header">คัดลอกหัวตารางไปวางใน Excel</button> <span id="headerMsg" class="msg ok" hidden>คัดลอกแล้ว</span></div></li>' +
      '<li>กลับมาหน้านี้ กด <b>โหลดข้อสอบใหม่</b> ถ้ามีแถวที่กรอกผิด ระบบจะบอกเลขแถวให้แก้</li>' +
      '</ol><p class="note">ถ้าแก้ข้อความในช่องคำถาม ระบบจะนับข้อนั้นเป็นข้อใหม่ ประวัติ "ข้อที่เคยตอบผิด" ของข้อนั้นจะเริ่มนับใหม่ ส่วนการแก้ตัวเลือก คำตอบ หรือคำอธิบาย ไม่กระทบประวัติ</p></details>';
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
      '<button type="button" class="btn btn-sm btn-primary" data-action="print">พิมพ์เฉลย</button></div>');
    html += '<div class="paper-head card"><div class="tags">' + typePill(exam.examType) + diffPill(exam.difficulty, 'ความยาก ') +
      '<span class="pill">' + exam.questions.length + ' ข้อ</span><span class="pill">' + (exam.timeLimitMinutes || 15) + ' นาที</span></div>' +
      '<div class="meta wide">' + metaTable(exam, true).replace(/^<dl class="meta">|<\/dl>$/g, '') + '</div></div>';
    html += blueprint(exam);
    html += '<div class="q-list">' + exam.questions.map(function (q, qi) {
      return '<div class="q-card card"><div class="q-head"><span class="pill pill-yellow">ข้อ ' + (qi + 1) + '</span>' +
        (q.indicator ? '<span class="pill">' + esc(q.indicator) + '</span>' : '') +
        (q.bloom ? '<span class="pill pill-blue">' + esc(q.bloom) + '</span>' : '') + diffPill(q.difficulty) + '</div>' +
        '<p class="q-text">' + esc(q.question) + '</p>' +
        (q.image ? '<img src="' + esc(q.image) + '" alt="' + esc(q.question) + '" style="max-width:100%;border:var(--border);border-radius:12px;margin-bottom:10px" />' : '') +
        '<ol>' + q.choices.map(function (c, ci) {
          return '<li' + (ci === q.answer ? ' class="is-answer"' : '') + '><b>' + LETTERS[ci] + '.</b><span>' + esc(c) + (ci === q.answer ? ' ✓' : '') + '</span></li>';
        }).join('') + '</ol>' +
        (q.explanation ? '<p class="exp">' + esc(q.explanation) + '</p>' : '') + '</div>';
    }).join('') + '</div>';
    return html;
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

  function buildDraft(text, filename) {
    var parsed = ExamImport.parse(text, filename);
    var existing = {};
    var sheetTitles = {};
    var fileTitles = {};
    (state.sheet ? state.sheet.sheetExams : []).forEach(function (e) {
      sheetTitles[e.title] = true;
      e.questions.forEach(function (q) { existing[questionKey(e.title, q.question)] = true; });
    });
    state.exams.forEach(function (e) { if (e.source === 'file') fileTitles[e.title] = true; });

    var newCount = 0;
    var dupCount = 0;
    parsed.exams.forEach(function (e) {
      e.appendsTo = !!sheetTitles[e.title];
      e.clashesWithFile = !!fileTitles[e.title];
      e.questions.forEach(function (q) {
        q.duplicate = !!existing[questionKey(e.title, q.question)];
        if (q.duplicate) dupCount++; else newCount++;
      });
    });
    return { text: text, filename: filename || 'ข้อความที่วาง', exams: parsed.exams, issues: parsed.issues, newCount: newCount, dupCount: dupCount };
  }

  function renderImport() {
    var html = head('นำเข้าข้อสอบ', 'ให้ AI ออกข้อสอบ แล้วนำไฟล์มาสร้างชุดข้อสอบในเว็บได้ทันที');

    if (!SHEETS_URL) {
      return html + '<div class="panel card"><p class="empty-note">ต้องเชื่อม Google Sheets ก่อน ข้อสอบที่นำเข้าจะไปเก็บในสเปรดชีตของครู' +
        '</p><div style="text-align:center"><button type="button" class="btn btn-primary btn-sm" data-action="nav" data-view="settings">ไปที่ตั้งค่า</button></div></div>';
    }

    html += '<div class="import-steps">' +
      '<div class="panel card"><div class="step-no">1</div><h2>ให้ AI ออกข้อสอบ</h2>' +
        (curriculum.list.length
          ? '<p class="note" style="margin-top:0">เลือกตัวชี้วัดจากหลักสูตรด้านล่าง ระบบจะใส่ข้อความตัวชี้วัดตามหลักสูตรลงในคำสั่งให้ แล้วคัดลอกไปวางใน ChatGPT, Gemini หรือ Claude</p>'
          : '<p class="note" style="margin-top:0">คัดลอกคำสั่งไปวางใน ChatGPT, Gemini หรือ Claude แก้ส่วนที่อยู่ใน [ ] เป็นวิชา เรื่อง และจำนวนข้อที่ต้องการ</p>') +
        indicatorPicker() +
        '<div class="btn-row" style="margin-top:14px"><button type="button" class="btn btn-primary btn-sm" data-action="copy-prompt" id="promptBtn">' + promptButtonLabel() + '</button>' +
        '<button type="button" class="btn btn-sm" data-action="download-example">ไฟล์ตัวอย่าง .txt</button></div>' +
        '<p id="promptMsg" class="msg ok" hidden>คัดลอกแล้ว นำไปวางในแชต AI ได้เลย</p></div>' +
      '<div class="panel card"><div class="step-no">2</div><h2>เลือกไฟล์ หรือวางข้อความ</h2>' +
        '<label id="dropZone" class="dropzone" for="importFile"><strong>ลากไฟล์มาวางตรงนี้ หรือกดเพื่อเลือกไฟล์</strong>' +
        '<span>รับไฟล์ .txt .csv .json (บันทึกคำตอบของ AI เป็นไฟล์ .txt ได้เลย)</span></label>' +
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
        return strandHead + '<div class="pick-std"><p><b>มาตรฐาน ' + esc(g.head.standard) + '</b> ' + esc(g.head.standardText) + '</p>' +
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
      indicators: items
    });
  }

  function draftPreview(d) {
    var html = '<div class="panel card block draft-panel"><div class="step-no">3</div><h2>ตรวจก่อนเพิ่มเข้าเว็บ</h2>' +
      '<p class="note" style="margin-top:0">จาก ' + esc(d.filename) + '</p>';

    if (!d.exams.length && !d.issues.length) {
      html += '<p class="error-text">ไม่พบข้อสอบในไฟล์นี้ ลองดูว่ารูปแบบตรงกับไฟล์ตัวอย่างไหม</p>';
    }

    html += d.exams.map(function (e) {
      var fresh = e.questions.filter(function (q) { return !q.duplicate; }).length;
      var notes = [];
      if (e.appendsTo) notes.push('<span class="pill pill-blue">เพิ่มต่อท้ายชุดเดิมใน Sheets</span>');
      else notes.push('<span class="pill pill-mint">ชุดใหม่</span>');
      if (e.clashesWithFile) notes.push('<span class="pill pill-peach">ชื่อซ้ำกับชุดในไฟล์เว็บ ควรเปลี่ยนชื่อ</span>');
      if (fresh < e.questions.length) notes.push('<span class="pill">ข้ามข้อที่มีอยู่แล้ว ' + (e.questions.length - fresh) + ' ข้อ</span>');
      var bad = unknownIndicators(e.questions);
      if (bad.length) notes.push('<span class="pill pill-peach">ตัวชี้วัดไม่พบในหลักสูตร: ' + esc(bad.join(', ')) + '</span>');
      return '<details class="draft-exam"' + (d.exams.length === 1 ? ' open' : '') + '><summary><span class="draft-title"><b>' + esc(e.title) + '</b> • ' + fresh + ' ข้อใหม่' +
        (e.grade ? ' • ' + esc(e.grade) : '') + (e.minutes ? ' • ' + e.minutes + ' นาที' : '') + '</span>' +
        '<span class="draft-tags">' + notes.join('') + '</span></summary>' +
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
      '<p class="note">กดดูรายละเอียดแต่ละชุดเพื่อตรวจคำตอบก่อนได้ ข้อสอบจะไปอยู่ในแท็บ "ข้อสอบ" ของ Google Sheets ถ้าต้องแก้ทีหลัง แก้ในสเปรดชีตได้เลย</p></div>';
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
    if (!d || !d.newCount) return;
    if (!key) { state.importMsg = { kind: 'bad', text: 'ยังไม่ได้ใส่รหัสครูในเครื่องนี้ ไปที่ตั้งค่าแล้วกรอกรหัสครูก่อน' }; render(); return; }

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
      fail('สคริปต์ Google ยังเป็นเวอร์ชัน ' + version + ' ต้องอัปเดตเป็นเวอร์ชัน 4 ก่อน จึงจะบันทึกข้อมูลหลักสูตร (ระดับชั้น หน่วย ความยาก ฯลฯ) ได้ ดูวิธีที่ คลังข้อสอบ > วิธีเพิ่มข้อสอบ');
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
        fail('รหัสครูในเครื่องนี้ไม่ตรงกับ TEACHER_KEY ในสคริปต์ ไปที่ ตั้งค่า แล้วกรอกรหัสครูใหม่ (ต้องตรงกับในสคริปต์ทุกตัวอักษร)');
        return;
      }
      if (!reply || !reply.ok || reply.added === undefined) {
        fail('ลิงก์ใน js/config.js ยังเป็นสคริปต์เวอร์ชันเก่า ตรวจว่า Push ลิงก์ใหม่แล้ว จากนั้นกด Ctrl+F5 แล้วลองอีกครั้ง');
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
          state.importMsg = { kind: 'ok', text: 'เพิ่มเข้าเว็บแล้ว ' + found + ' ข้อ นักเรียนจะเห็นชุดข้อสอบนี้เมื่อเปิดเว็บครั้งถัดไป' };
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
      '<p class="note">"ตามเครื่อง" จะสลับเองตามการตั้งค่าของคอมหรือมือถือ ธีมที่เลือกจำไว้เฉพาะเครื่องนี้ และใช้กับหน้านักเรียนบนเครื่องนี้ด้วย</p></div>';

    html += '<div class="panel card block"><div class="block-head"><h2>Google Sheets</h2></div><div class="status-line"><strong>สถานะ</strong>' + status +
      (state.demo ? '<span class="pill pill-blue">กำลังดูข้อมูลตัวอย่าง</span>' : '') + '</div>';
    if (SHEETS_URL) {
      html += '<form id="keyForm" class="inline-form"><input id="keyInput" type="password" placeholder="รหัสครู" value="' + esc(key || '') + '" autocomplete="current-password" />' +
        '<button type="submit" class="btn btn-primary btn-sm">บันทึกและทดสอบ</button></form>' +
        '<p id="keyMsg" class="msg" hidden></p>' +
        (key ? '<p class="note">เครื่องนี้จำรหัสครูไว้แล้ว ถ้าใช้เครื่องส่วนกลาง <button type="button" class="btn btn-ghost btn-sm" data-action="forget-key">ลืมรหัสบนเครื่องนี้</button></p>' : '');
    } else {
      html += '<p class="note" style="margin-top:0">ทำตามขั้นตอนด้านล่างครั้งเดียว หลังจากนั้นคะแนนของนักเรียนทุกคนจะมาอยู่ที่หน้านี้</p>';
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
      '<li>รอ 1-2 นาที เปิดหน้านี้ใหม่ แล้วกรอกรหัสครูที่ตั้งไว้ในขั้นตอนที่ 3</li>' +
      '</ol><p class="note">รหัสครูอยู่ใน Google ของครูเท่านั้น ไม่อยู่ในเว็บ นักเรียนจึงเปิดดูคะแนนของเพื่อนไม่ได้ ส่วนเฉลยในคลังข้อสอบ เป็นข้อมูลเดียวกับที่อยู่ในเว็บอยู่แล้ว</p></div>';

    html += '<div class="panel card"><div class="block-head"><h2>ข้อมูลตัวอย่าง</h2></div>' +
      '<p class="note" style="margin-top:0">ลองดูว่าแดชบอร์ดจะหน้าตาเป็นอย่างไรเมื่อมีนักเรียนทำข้อสอบ (ข้อมูลสมมุติ ไม่ได้บันทึกที่ไหน)</p>' +
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

  function renderDemoBanner() {
    var b = $('demoBanner');
    b.hidden = !state.demo;
    if (state.demo) {
      b.innerHTML = '<span><b>กำลังดูข้อมูลตัวอย่าง</b> ชื่อและคะแนนทั้งหมดเป็นข้อมูลสมมุติ</span>' +
        '<button type="button" class="btn btn-sm" data-action="demo-off">ปิดตัวอย่าง</button>';
    }
  }

  function render() {
    if (!state.stats) analyze();
    renderNav();
    renderDemoBanner();
    var views = { overview: renderOverview, students: renderStudents, analysis: renderAnalysis, bank: renderBank, import: renderImport, settings: renderSettings };
    var view = $('view');
    view.innerHTML = '<div class="view">' + views[state.view]() + '</div>';
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
      box.textContent = 'โหลดสคริปต์ไม่ได้ เปิดไฟล์ teacher-setup/apps-script.txt ในโฟลเดอร์แทนได้';
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
    else if (a === 'open-bank') { state.bankExamId = t.dataset.exam; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    else if (a === 'close-bank') { state.bankExamId = null; render(); }
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
    else if (a === 'forget-key') { lsSet(KEY_STORE, null); state.connected = false; showLock(); }
  }

  function onInput(e) {
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
    $('lockArt').innerHTML = Art.hero();
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
    document.addEventListener('change', function (e) {
      if (e.target.id === 'importFile') readImportFile(e.target.files[0]);
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
