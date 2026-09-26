// Turns an AI-written exam file (plain text, CSV/TSV from Excel, or JSON) into exams + issues.
var ExamImport = (function () {
  var ANSWERS = { 'ก': 0, 'ข': 1, 'ค': 2, 'ง': 3, 'a': 0, 'b': 1, 'c': 2, 'd': 3, '1': 0, '2': 1, '3': 2, '4': 3 };
  var SEP = '\\s*[:：]\\s*';

  var RE = {
    exam: new RegExp('^(?:ชุดข้อสอบ|ชื่อชุด|ชุด)' + SEP + '(.+)$'),
    minutes: new RegExp('^(?:เวลาสอบ|เวลา)' + SEP + '(\\d+)'),
    difficulty: new RegExp('^(?:ระดับความยาก|ความยาก)' + SEP + '(.+)$'),
    question: /^(?:ข้อ(?:ที่)?\s*)?(\d{1,3})\s*[.)]\s*(.+)$/,
    choice: /^\(?([กขคงabcdABCD])\s*[.)]\s*(.+)$/,
    answer: new RegExp('^(?:คำตอบ|ตอบ|เฉลย|answer)' + SEP + '(.+)$', 'i'),
    explanation: new RegExp('^(?:คำอธิบาย|อธิบาย|เหตุผล|explanation)' + SEP + '(.*)$', 'i'),
    topic: new RegExp('^หัวข้อ' + SEP + '(.+)$'),
    indicator: new RegExp('^ตัวชี้วัด' + SEP + '(.+)$'),
    bloom: new RegExp('^(?:bloom|ระดับการคิด|ระดับ)' + SEP + '(.+)$', 'i'),
    image: new RegExp('^(?:รูปภาพ|รูป|image)' + SEP + '(.+)$', 'i')
  };

  function parseAnswer(value, choices) {
    var raw = String(value || '').trim();
    var v = raw.toLowerCase().replace(/^[(\s]+/, '');
    var first = v.charAt(0);
    var next = v.charAt(1);
    if (first in ANSWERS && (!next || /[\s.)]/.test(next))) return ANSWERS[first];
    for (var i = 0; i < (choices || []).length; i++) {
      if (choices[i] && raw === choices[i]) return i;
    }
    return -1;
  }

  function cleanLine(line) {
    return line
      .replace(/\*\*|__|`/g, '')
      .replace(/^\s*(?:#+|[-*•]\s+|>\s*)/, '')
      .trim();
  }

  // Set-level curriculum lines, e.g. "หน่วยการเรียนรู้: หน่วยที่ 2 เศรษฐกิจน่ารู้"
  var SET_LINES = [
    ['subject', /^(?:รายวิชา|วิชา)$/],
    ['courseCode', /^รหัสวิชา$/],
    ['grade', /^(?:ระดับชั้น|ชั้น)$/],
    ['learningArea', /^กลุ่มสาระ(?:การเรียนรู้)?$/],
    ['strand', /^สาระ(?:การเรียนรู้)?$/],
    ['standard', /^มาตรฐาน(?:การเรียนรู้)?$/],
    ['unit', /^(?:หน่วยการเรียนรู้|หน่วยที่|หน่วย)$/],
    ['lesson', /^เรื่อง$/],
    ['examType', /^(?:ประเภทการสอบ|ประเภทข้อสอบ|ประเภท)$/]
  ];
  var SET_KEYS = ['subject', 'courseCode', 'grade', 'learningArea', 'strand', 'standard', 'unit', 'lesson', 'examType', 'difficulty', 'indicator'];

  function matchSetLine(line) {
    var m = line.match(/^([^:：]{1,30})\s*[:：]\s*(.+)$/);
    if (!m) return null;
    var label = m[1].trim();
    for (var i = 0; i < SET_LINES.length; i++) {
      if (SET_LINES[i][1].test(label)) return { key: SET_LINES[i][0], value: m[2].trim() };
    }
    return null;
  }

  function newExam(title) {
    var e = { title: title, minutes: 0, questions: [] };
    SET_KEYS.forEach(function (k) { e[k] = ''; });
    return e;
  }

  function parseText(text, fallbackTitle) {
    var exams = [];
    var issues = [];
    var exam = null;
    var q = null;
    var lastField = null;

    function currentExam() {
      if (!exam) { exam = newExam(fallbackTitle); exams.push(exam); }
      return exam;
    }

    text.split(/\r?\n/).forEach(function (rawLine) {
      var line = cleanLine(rawLine);
      if (!line) return;
      var m;
      var setLine;

      if ((m = line.match(RE.exam))) {
        exam = newExam(m[1].trim());
        exams.push(exam);
        q = null;
        lastField = null;
      } else if ((setLine = matchSetLine(line))) {
        currentExam()[setLine.key] = setLine.value;
        lastField = null;
      } else if ((m = line.match(RE.minutes)) && !q) {
        currentExam().minutes = parseInt(m[1], 10) || 0;
      } else if ((m = line.match(RE.difficulty))) {
        if (q) q.difficulty = m[1].trim(); else currentExam().difficulty = m[1].trim();
        lastField = null;
      } else if ((m = line.match(RE.indicator)) && !q) {
        currentExam().indicator = m[1].trim();
      } else if ((m = line.match(RE.answer)) && q) {
        q.answerRaw = m[1].trim();
        lastField = 'answer';
      } else if ((m = line.match(RE.explanation)) && q) {
        q.explanation = m[1].trim();
        lastField = 'explanation';
      } else if ((m = line.match(RE.indicator)) && q) {
        q.indicator = m[1].trim(); lastField = null;
      } else if ((m = line.match(RE.bloom)) && q) {
        q.bloom = m[1].trim(); lastField = null;
      } else if ((m = line.match(RE.topic)) && q) {
        q.topic = m[1].trim(); lastField = null;
      } else if ((m = line.match(RE.image)) && q) {
        q.image = m[1].trim(); lastField = null;
      } else if ((m = line.match(RE.choice)) && q && q.choices.length < 4) {
        q.choices.push(m[2].trim());
        lastField = 'choice';
      } else if ((m = line.match(RE.question))) {
        q = { no: m[1], question: m[2].trim(), choices: [], answerRaw: '', explanation: '', indicator: '', bloom: '', topic: '', image: '', difficulty: '' };
        currentExam().questions.push(q);
        lastField = 'question';
      } else if (q && lastField === 'question') {
        q.question += ' ' + line;
      } else if (q && lastField === 'explanation') {
        q.explanation += ' ' + line;
      } else if (q && lastField === 'choice') {
        q.choices[q.choices.length - 1] += ' ' + line;
      }
    });

    return finish(exams, issues);
  }

  function finish(exams, issues) {
    var out = [];
    exams.forEach(function (e) {
      var good = [];
      e.questions.forEach(function (q, i) {
        var label = '"' + e.title + '" ข้อ ' + (q.no || i + 1);
        if (!q.question) { issues.push(label + ': ไม่มีคำถาม'); return; }
        if (q.choices.length !== 4 || q.choices.some(function (c) { return !c; })) {
          issues.push(label + ': ตัวเลือกไม่ครบ 4 ข้อ (พบ ' + q.choices.length + ')');
          return;
        }
        var answer = typeof q.answer === 'number' ? q.answer : parseAnswer(q.answerRaw, q.choices);
        if (answer < 0 || answer > 3) { issues.push(label + ': ไม่พบคำตอบ หรือคำตอบไม่ใช่ ก ข ค ง'); return; }
        good.push({
          question: q.question,
          choices: q.choices,
          answer: answer,
          explanation: q.explanation || '',
          topic: q.topic || '',
          indicator: q.indicator || e.indicator || '',
          bloom: q.bloom || '',
          image: q.image || '',
          difficulty: ExamSource.normalizeDifficulty(q.difficulty)
        });
      });
      if (!e.questions.length) issues.push('"' + e.title + '": ไม่พบข้อสอบในชุดนี้');
      if (!good.length) return;
      var exam = { title: e.title, minutes: e.minutes, questions: good };
      SET_KEYS.forEach(function (k) { if (k !== 'indicator') exam[k] = e[k] || ''; });
      exam.difficulty = ExamSource.normalizeDifficulty(exam.difficulty);
      ExamSource.enrich(exam);
      out.push(exam);
    });
    return { exams: out, issues: issues };
  }

  function parseJson(data, fallbackTitle) {
    var exams = [];
    var list = Array.isArray(data) ? [{ title: fallbackTitle, questions: data }] : (data.exams || [data]);
    list.forEach(function (e) {
      var exam = newExam(String(e.title || fallbackTitle));
      SET_KEYS.forEach(function (k) { if (e[k]) exam[k] = String(e[k]); });
      exam.minutes = parseInt(e.timeLimitMinutes || e.minutes, 10) || 0;
      (e.questions || []).forEach(function (q, i) {
        var choices = (q.choices || []).map(function (c) { return String(c && c.text != null ? c.text : c).trim(); });
        exam.questions.push({
          no: i + 1,
          question: String(q.question || '').replace(/^\d+\.\s*/, '').trim(),
          choices: choices,
          answer: typeof q.answer === 'number' ? q.answer : undefined,
          answerRaw: typeof q.answer === 'number' ? '' : String(q.answer || ''),
          explanation: q.explanation || '',
          topic: q.topic || '',
          indicator: q.indicator || '',
          bloom: q.bloom || '',
          image: q.image || '',
          difficulty: q.difficulty || ''
        });
      });
      exams.push(exam);
    });
    return finish(exams, []);
  }

  function parseTable(text, delimiter) {
    var rows = splitDelimited(text, delimiter);
    var parsed = ExamSource.parseSheet(rows);
    return {
      exams: parsed.exams.map(function (e) {
        var exam = { title: e.title, minutes: e.timeLimitMinutes, questions: e.questions.map(function (q) {
          return { question: q.question, choices: q.choices, answer: q.answer, explanation: q.explanation, topic: q.topic, indicator: q.indicator, bloom: q.bloom, image: q.image || '', difficulty: q.difficulty || '' };
        }) };
        SET_KEYS.forEach(function (k) { if (k !== 'indicator') exam[k] = e[k] || ''; });
        return ExamSource.enrich(exam);
      }),
      issues: parsed.issues.map(function (it) { return 'แถว ' + it.row + ': ' + it.message; })
    };
  }

  function splitDelimited(text, d) {
    var rows = [];
    var row = [];
    var cell = '';
    var quoted = false;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (quoted) {
        if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
        else if (ch === '"') quoted = false;
        else cell += ch;
      } else if (ch === '"' && cell === '') {
        quoted = true;
      } else if (ch === d) {
        row.push(cell); cell = '';
      } else if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && text[i + 1] === '\n') i++;
        row.push(cell); rows.push(row); row = []; cell = '';
      } else {
        cell += ch;
      }
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    return rows;
  }

  // Rewrites the JS-object style some AI tools emit (questionParts / label / answer: "ค") into the plain-text format.
  function fromObjectStyle(text) {
    var unescape = function (s) { return s.replace(/\\"/g, '"').replace(/\\([[\]])/g, '$1'); };
    var out = [];
    var re = /questionParts\s*:\s*\\?\[\s*\{\s*text\s*:\s*"((?:[^"\\]|\\.)*)"|label\s*:\s*"((?:[^"\\]|\\.)*)"\s*,\s*text\s*:\s*"((?:[^"\\]|\\.)*)"|\b(answer|indicator|bloom|explanation)\s*:\s*"((?:[^"\\]|\\.)*)"/g;
    var labels = { answer: 'ตอบ', indicator: 'ตัวชี้วัด', bloom: 'Bloom', explanation: 'อธิบาย' };
    var m;
    while ((m = re.exec(text))) {
      if (m[1] != null) { out.push(''); out.push(unescape(m[1])); }
      else if (m[2] != null) out.push(unescape(m[2]).trim() + ' ' + unescape(m[3]));
      else if (m[5]) out.push(labels[m[4]] + ': ' + unescape(m[5]));
    }
    return out.join('\n');
  }

  function parse(text, filename) {
    text = String(text || '').replace(/^﻿/, '');
    if (/questionParts\s*:/.test(text)) text = fromObjectStyle(text);
    var fallbackTitle = (filename || '').replace(/\.[^.]+$/, '').trim() || 'ชุดข้อสอบใหม่';
    var trimmed = text.trim();
    if (!trimmed) return { exams: [], issues: ['ไม่พบข้อความในไฟล์'] };

    if (trimmed.charAt(0) === '{' || trimmed.charAt(0) === '[') {
      try { return parseJson(JSON.parse(trimmed), fallbackTitle); } catch (e) { /* not JSON, fall through */ }
    }
    var firstLine = trimmed.split(/\r?\n/)[0];
    if (/คำถาม|question/i.test(firstLine) && /คำตอบ|answer/i.test(firstLine)) {
      if (firstLine.indexOf('\t') >= 0) return parseTable(trimmed, '\t');
      if (firstLine.indexOf(',') >= 0) return parseTable(trimmed, ',');
    }
    return parseText(trimmed, fallbackTitle);
  }

  var LETTERS = ['ก', 'ข', 'ค', 'ง'];

  // One record per question, keyed by the sheet's column headers. Set-level info goes on the first row of each set.
  function toRecords(exams) {
    var records = [];
    exams.forEach(function (e) {
      e.questions.forEach(function (q, i) {
        var r = {
          'ชุดข้อสอบ': e.title,
          'หัวข้อ': q.topic,
          'ตัวชี้วัด': q.indicator,
          'Bloom': q.bloom,
          'ความยาก': q.difficulty,
          'คำถาม': q.question,
          'ก': q.choices[0], 'ข': q.choices[1], 'ค': q.choices[2], 'ง': q.choices[3],
          'คำตอบ': LETTERS[q.answer],
          'คำอธิบาย': q.explanation,
          'รูปภาพ': q.image
        };
        if (i === 0) {
          r['วิชา'] = e.subject;
          r['เวลา(นาที)'] = e.minutes ? String(e.minutes) : '';
          r['ระดับชั้น'] = e.grade;
          r['กลุ่มสาระ'] = e.learningArea;
          r['รหัสวิชา'] = e.courseCode;
          r['สาระ'] = e.strand;
          r['มาตรฐาน'] = e.standard;
          r['หน่วยการเรียนรู้'] = e.unit;
          r['เรื่อง'] = e.lesson;
          r['ประเภทการสอบ'] = e.examType;
          r['ความยากของชุด'] = e.difficultyDerived ? '' : e.difficulty;
        }
        records.push(r);
      });
    });
    return records;
  }

  var EXAMPLE =
    'ชุด: ภูมิศาสตร์ประเทศไทย หลังเรียน\n' +
    'ระดับชั้น: ป.5\n' +
    'กลุ่มสาระ: สังคมศึกษา ศาสนา และวัฒนธรรม\n' +
    'รายวิชา: สังคมศึกษา 5\n' +
    'รหัสวิชา: ส15101\n' +
    'สาระ: สาระที่ 5 ภูมิศาสตร์\n' +
    'มาตรฐาน: ส 5.1\n' +
    'หน่วยการเรียนรู้: หน่วยที่ 6 ภูมิลักษณ์ของประเทศไทย\n' +
    'เรื่อง: ลักษณะทางกายภาพของภาคต่างๆ\n' +
    'ประเภทการสอบ: หลังเรียน\n' +
    'ความยาก: ปานกลาง\n' +
    'เวลา: 10\n\n' +
    '1. ภาคใดของประเทศไทยมีพื้นที่มากที่สุด\n' +
    'ก. ภาคเหนือ\n' +
    'ข. ภาคตะวันออกเฉียงเหนือ\n' +
    'ค. ภาคกลาง\n' +
    'ง. ภาคใต้\n' +
    'ตอบ: ข\n' +
    'อธิบาย: ภาคตะวันออกเฉียงเหนือมีพื้นที่มากที่สุด ประมาณหนึ่งในสามของประเทศ\n' +
    'ตัวชี้วัด: ส 5.1 ป.5/1\n' +
    'Bloom: ความจำ\n' +
    'ความยาก: ง่าย\n\n' +
    '2. ถ้าต้องการทำนาข้าวให้ได้ผลดี ควรเลือกพื้นที่ในภาคใดมากที่สุด\n' +
    'ก. ภาคกลาง เพราะเป็นที่ราบลุ่มแม่น้ำ มีน้ำอุดมสมบูรณ์\n' +
    'ข. ภาคเหนือ เพราะมีภูเขาสูงและอากาศหนาว\n' +
    'ค. ภาคใต้ เพราะมีฝนตกชุกเกือบทั้งปี\n' +
    'ง. ภาคตะวันออก เพราะติดชายฝั่งทะเล\n' +
    'ตอบ: ก\n' +
    'อธิบาย: ภาคกลางเป็นที่ราบลุ่มแม่น้ำเจ้าพระยา ดินอุดมสมบูรณ์และมีน้ำพอสำหรับทำนา\n' +
    'ตัวชี้วัด: ส 5.1 ป.5/2\n' +
    'Bloom: วิเคราะห์\n' +
    'ความยาก: ยาก\n';

  var CONDITIONS =
    'เงื่อนไข:\n' +
    '- ภาษาเหมาะกับวัยของผู้เรียน ตัวเลือกที่ผิดต้องดูเป็นไปได้ ไม่ตลกหรือชัดเกินไป\n' +
    '- ทุกข้อต้องวัดตัวชี้วัดที่กำหนด และระบุรหัสตัวชี้วัดของข้อนั้น\n' +
    '- กระจายคำตอบให้มีทั้ง ก ข ค ง\n' +
    '- ทุกข้อมีคำอธิบายสั้นๆ ว่าทำไมข้อนั้นถูก\n' +
    '- Bloom ใช้คำใดคำหนึ่ง: ความจำ, ความเข้าใจ, ประยุกต์ใช้, วิเคราะห์, ประเมินค่า, สร้างสรรค์ ให้สอดคล้องกับคำกริยาในตัวชี้วัด\n' +
    '- ความยาก ใช้คำใดคำหนึ่ง: ง่าย, ปานกลาง, ยาก และให้ทั้งชุดมีสัดส่วนประมาณ ง่าย 30% ปานกลาง 50% ยาก 20%\n\n' +
    'ตอบเป็นข้อความธรรมดาตามรูปแบบด้านล่างนี้เท่านั้น ไม่ต้องมีคำนำ ไม่ต้องใช้ตาราง ไม่ต้องใช้ตัวหนา:\n\n';

  var AI_PROMPT =
    'ช่วยออกข้อสอบปรนัย 4 ตัวเลือก ตามหลักสูตรแกนกลางการศึกษาขั้นพื้นฐาน พ.ศ. 2551\n' +
    'ระดับชั้น: [เช่น ป.5]\n' +
    'รายวิชา: [เช่น สังคมศึกษา 5] รหัสวิชา: [เช่น ส15101]\n' +
    'หน่วยการเรียนรู้: [ชื่อหน่วย]\n' +
    'เรื่อง: [ชื่อเรื่อง]\n' +
    'ตัวชี้วัด: [เช่น ส 3.1 ป.5/1, ป.5/2]\n' +
    'ประเภทการสอบ: [ก่อนเรียน / ระหว่างเรียน / หลังเรียน / กลางภาค / ปลายภาค / ฝึกทำ]\n' +
    'จำนวน: [ใส่จำนวน] ข้อ\n\n' +
    CONDITIONS + EXAMPLE;

  // meta: { title, grade, area, subject, courseCode, strands[], standards[], unit, lesson, examType, count, indicators: [{code, text}] }
  function promptFor(meta) {
    var lines = ['ช่วยออกข้อสอบปรนัย 4 ตัวเลือก ตามหลักสูตรแกนกลางการศึกษาขั้นพื้นฐาน พ.ศ. 2551', ''];
    function add(label, value) { if (value) lines.push(label + ': ' + value); }
    add('ชุด', meta.title);
    add('ระดับชั้น', meta.grade);
    add('กลุ่มสาระ', meta.area);
    add('รายวิชา', meta.subject);
    add('รหัสวิชา', meta.courseCode);
    add('สาระ', (meta.strands || []).join(', '));
    add('มาตรฐาน', (meta.standards || []).join(', '));
    add('หน่วยการเรียนรู้', meta.unit);
    add('เรื่อง', meta.lesson);
    add('ประเภทการสอบ', meta.examType);
    add('จำนวน', meta.count ? meta.count + ' ข้อ' : '');
    lines.push('', 'ตัวชี้วัดที่ต้องวัด (ใช้รหัสตามนี้ทุกตัวอักษร และกระจายข้อสอบให้ครบทุกตัวชี้วัด):');
    (meta.indicators || []).forEach(function (it) { lines.push('- ' + it.code + ' ' + it.text); });
    if (meta.core && meta.core.length) {
      lines.push('', 'สาระการเรียนรู้แกนกลาง (ใช้เป็นขอบเขตเนื้อหา ห้ามออกข้อสอบเกินจากนี้):');
      meta.core.forEach(function (c) {
        lines.push('มาตรฐาน ' + c.standard);
        c.lines.forEach(function (l) { lines.push(/^- /.test(l) ? '    ' + l : '• ' + l); });
      });
    }
    lines.push('', 'ให้บรรทัดหัวของชุด (ชุด ระดับชั้น กลุ่มสาระ รายวิชา รหัสวิชา สาระ มาตรฐาน หน่วยการเรียนรู้ เรื่อง ประเภทการสอบ) ตรงกับข้อมูลด้านบน', '');
    return lines.join('\n') + '\n' + CONDITIONS + EXAMPLE;
  }

  return { parse: parse, toRecords: toRecords, example: EXAMPLE, aiPrompt: AI_PROMPT, promptFor: promptFor };
})();
