// Turns an AI-written exam file (plain text, CSV/TSV from Excel, or JSON) into exams + issues.
var ExamImport = (function () {
  var ANSWERS = { 'ก': 0, 'ข': 1, 'ค': 2, 'ง': 3, 'a': 0, 'b': 1, 'c': 2, 'd': 3, '1': 0, '2': 1, '3': 2, '4': 3 };
  var SEP = '\\s*[:：]\\s*';

  var RE = {
    exam: new RegExp('^(?:ชุดข้อสอบ|ชื่อชุด|ชุด)' + SEP + '(.+)$'),
    subject: new RegExp('^วิชา' + SEP + '(.+)$'),
    minutes: new RegExp('^(?:เวลาสอบ|เวลา)' + SEP + '(\\d+)'),
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

  function newExam(title) {
    return { title: title, subject: '', minutes: 0, questions: [] };
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

      if ((m = line.match(RE.exam))) {
        exam = newExam(m[1].trim());
        exams.push(exam);
        q = null;
        lastField = null;
      } else if ((m = line.match(RE.subject)) && !q) {
        currentExam().subject = m[1].trim();
      } else if ((m = line.match(RE.minutes)) && !q) {
        currentExam().minutes = parseInt(m[1], 10) || 0;
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
        q = { no: m[1], question: m[2].trim(), choices: [], answerRaw: '', explanation: '', indicator: '', bloom: '', topic: '', image: '' };
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
          indicator: q.indicator || '',
          bloom: q.bloom || '',
          image: q.image || ''
        });
      });
      if (!e.questions.length) issues.push('"' + e.title + '": ไม่พบข้อสอบในชุดนี้');
      if (good.length) out.push({ title: e.title, subject: e.subject, minutes: e.minutes, questions: good });
    });
    return { exams: out, issues: issues };
  }

  function parseJson(data, fallbackTitle) {
    var exams = [];
    var list = Array.isArray(data) ? [{ title: fallbackTitle, questions: data }] : (data.exams || [data]);
    list.forEach(function (e) {
      var exam = newExam(String(e.title || fallbackTitle));
      exam.subject = e.subject || '';
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
          image: q.image || ''
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
        return { title: e.title, subject: e.subject, minutes: e.timeLimitMinutes, questions: e.questions.map(function (q) {
          return { question: q.question, choices: q.choices, answer: q.answer, explanation: q.explanation, topic: q.topic, indicator: q.indicator, bloom: q.bloom, image: q.image || '' };
        }) };
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

  var HEADERS = ['ชุดข้อสอบ', 'วิชา', 'เวลา(นาที)', 'หัวข้อ', 'ตัวชี้วัด', 'Bloom', 'คำถาม', 'ก', 'ข', 'ค', 'ง', 'คำตอบ', 'คำอธิบาย', 'รูปภาพ'];
  var LETTERS = ['ก', 'ข', 'ค', 'ง'];

  function toRows(exams) {
    var rows = [];
    exams.forEach(function (e) {
      e.questions.forEach(function (q, i) {
        rows.push([
          e.title,
          i === 0 ? (e.subject || '') : '',
          i === 0 && e.minutes ? String(e.minutes) : '',
          q.topic, q.indicator, q.bloom, q.question,
          q.choices[0], q.choices[1], q.choices[2], q.choices[3],
          LETTERS[q.answer], q.explanation, q.image
        ]);
      });
    });
    return rows;
  }

  var EXAMPLE =
    'ชุด: ภูมิศาสตร์ประเทศไทย\n' +
    'วิชา: สังคมศึกษา\n' +
    'เวลา: 10\n\n' +
    '1. ภาคใดของประเทศไทยมีพื้นที่มากที่สุด\n' +
    'ก. ภาคเหนือ\n' +
    'ข. ภาคตะวันออกเฉียงเหนือ\n' +
    'ค. ภาคกลาง\n' +
    'ง. ภาคใต้\n' +
    'ตอบ: ข\n' +
    'อธิบาย: ภาคตะวันออกเฉียงเหนือมีพื้นที่มากที่สุด ประมาณหนึ่งในสามของประเทศ\n' +
    'ตัวชี้วัด: ส 5.1 ป.5/1\n' +
    'Bloom: ความจำ\n\n' +
    '2. แม่น้ำสายหลักที่ไหลผ่านภาคกลางคือแม่น้ำใด\n' +
    'ก. แม่น้ำโขง\n' +
    'ข. แม่น้ำเจ้าพระยา\n' +
    'ค. แม่น้ำสาละวิน\n' +
    'ง. แม่น้ำมูล\n' +
    'ตอบ: ข\n' +
    'อธิบาย: แม่น้ำเจ้าพระยาไหลผ่านภาคกลาง เป็นแหล่งน้ำสำคัญของการทำนา\n' +
    'ตัวชี้วัด: ส 5.1 ป.5/2\n' +
    'Bloom: ความเข้าใจ\n';

  var AI_PROMPT =
    'ช่วยออกข้อสอบปรนัย 4 ตัวเลือก สำหรับนักเรียนชั้น ป.5\n' +
    'วิชา: [ใส่วิชา]\n' +
    'เรื่อง: [ใส่เรื่อง/หน่วยการเรียนรู้]\n' +
    'จำนวน: [ใส่จำนวน] ข้อ\n' +
    'ตัวชี้วัด: [ใส่ตัวชี้วัด ถ้ามี]\n\n' +
    'เงื่อนไข:\n' +
    '- ภาษาง่าย เหมาะกับเด็ก ป.5 ตัวเลือกที่ผิดต้องดูเป็นไปได้ ไม่ตลกหรือชัดเกินไป\n' +
    '- กระจายคำตอบให้มีทั้ง ก ข ค ง\n' +
    '- ทุกข้อต้องมีคำอธิบายสั้นๆ ว่าทำไมข้อนั้นถูก\n' +
    '- Bloom ใช้คำใดคำหนึ่ง: ความจำ, ความเข้าใจ, ประยุกต์ใช้, วิเคราะห์\n\n' +
    'ตอบเป็นข้อความธรรมดาตามรูปแบบด้านล่างนี้เท่านั้น ไม่ต้องมีคำนำ ไม่ต้องใช้ตาราง ไม่ต้องใช้ตัวหนา:\n\n' +
    EXAMPLE;

  return { parse: parse, toRows: toRows, example: EXAMPLE, aiPrompt: AI_PROMPT };
})();
