(function () {
  'use strict';

  var examsData = { exams: [] };

  var state = {
    currentUserName: null,
    selectedExam: null,
    timerEnabled: false,
    mode: 'normal', // 'normal' | 'review'
    questions: [],
    currentIndex: 0,
    answers: [],
    resolvedInReview: 0,
    timerInterval: null,
    secondsLeft: 0,
    answeredCurrent: false,
    streak: 0,
    startedAt: 0,
    currentChoiceOrder: [] // maps displayed choice position -> original choice index
  };

  var LETTERS = ['ก', 'ข', 'ค', 'ง'];
  var PRAISE = ['ถูกต้อง เก่งมาก', 'ใช่เลย ตอบถูก', 'ถูกต้อง ทำได้ดีมาก', 'เยี่ยมเลย ตอบถูก'];
  var COMFORT = ['ยังไม่ถูกนะ ลองอ่านเหตุผลดูนะ', 'ไม่เป็นไร ลองอ่านเหตุผลดูนะ', 'เกือบแล้ว ลองอ่านเหตุผลดูนะ'];
  var SUN_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var MOON_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>';

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  var el = {};

  function cacheEls() {
    el.storageWarning = document.getElementById('storageWarning');
    el.userChip = document.getElementById('userChip');
    el.userChipName = document.getElementById('userChipName');
    el.btnTheme = document.getElementById('btnTheme');
    el.btnQuit = document.getElementById('btnQuit');
    el.streakPill = document.getElementById('streakPill');
    el.summaryFacts = document.getElementById('summaryFacts');
    el.confetti = document.getElementById('confetti');

    el.screenStart = document.getElementById('screen-start');
    el.heroTitle = document.getElementById('heroTitle');
    el.heroSub = document.getElementById('heroSub');
    el.heroArt = document.getElementById('heroArt');
    el.examCount = document.getElementById('examCount');
    el.examList = document.getElementById('examList');
    el.reviewEntry = document.getElementById('reviewEntry');
    el.btnGlobalReview = document.getElementById('btnGlobalReview');
    el.reviewCount = document.getElementById('reviewCount');

    el.screenIdentify = document.getElementById('screen-identify');
    el.identifyExamTitle = document.getElementById('identifyExamTitle');
    el.identifyForm = document.getElementById('identifyForm');
    el.inputName = document.getElementById('inputName');
    el.inputPin = document.getElementById('inputPin');
    el.labelPin = document.getElementById('labelPin');
    el.pinConfirmWrap = document.getElementById('pinConfirmWrap');
    el.inputPinConfirm = document.getElementById('inputPinConfirm');
    el.toggleTimer = document.getElementById('toggleTimer');
    el.timerHint = document.getElementById('timerHint');
    el.identifyError = document.getElementById('identifyError');
    el.btnBackToStart = document.getElementById('btnBackToStart');

    el.screenQuiz = document.getElementById('screen-quiz');
    el.progressText = document.getElementById('progressText');
    el.timerText = document.getElementById('timerText');
    el.progressFill = document.getElementById('progressFill');
    el.questionTopic = document.getElementById('questionTopic');
    el.questionText = document.getElementById('questionText');
    el.questionImageWrap = document.getElementById('questionImageWrap');
    el.questionImage = document.getElementById('questionImage');
    el.choicesList = document.getElementById('choicesList');
    el.feedbackBox = document.getElementById('feedbackBox');
    el.feedbackText = document.getElementById('feedbackText');
    el.explanationText = document.getElementById('explanationText');
    el.btnCheck = document.getElementById('btnCheck');
    el.btnNext = document.getElementById('btnNext');

    el.screenSummary = document.getElementById('screen-summary');
    el.summaryHeading = document.getElementById('summaryHeading');
    el.starsRow = document.getElementById('starsRow');
    el.summaryScore = document.getElementById('summaryScore');
    el.summaryMessage = document.getElementById('summaryMessage');
    el.btnReviewWrong = document.getElementById('btnReviewWrong');
    el.btnRetake = document.getElementById('btnRetake');
    el.btnToStart = document.getElementById('btnToStart');

    el.screenReviewDone = document.getElementById('screen-review-done');
    el.reviewDoneText = document.getElementById('reviewDoneText');
    el.btnReviewDoneToStart = document.getElementById('btnReviewDoneToStart');

    el.imageModal = document.getElementById('imageModal');
    el.imageModalImg = document.getElementById('imageModalImg');

    el.confirmModal = document.getElementById('confirmModal');
    el.confirmText = document.getElementById('confirmText');
    el.btnConfirmOk = document.getElementById('btnConfirmOk');
    el.btnConfirmCancel = document.getElementById('btnConfirmCancel');
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  }

  function showScreen(screenEl) {
    [el.screenStart, el.screenIdentify, el.screenQuiz, el.screenSummary, el.screenReviewDone].forEach(function (s) {
      s.hidden = s !== screenEl;
    });
    window.scrollTo(0, 0);
  }

  function stopTimer() {
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }
  }

  function findQuestionById(examId, questionId) {
    var exam = examsData.exams.find(function (e) { return e.id === examId; });
    if (!exam) return null;
    var question = exam.questions.find(function (q) { return q.id === questionId; });
    if (!question) return null;
    return { exam: exam, question: question };
  }

  // ---------- หน้าเริ่มต้น ----------

  function renderUserChip() {
    el.userChip.hidden = !state.currentUserName;
    document.getElementById('howTo').hidden = !!state.currentUserName;
    el.userChipName.textContent = state.currentUserName || '';
    if (state.currentUserName) {
      el.heroTitle.textContent = 'สวัสดี ' + state.currentUserName;
      el.heroSub.textContent = 'ทำได้ดีมาก ฝึกต่ออีกสักชุดไหม';
    }
  }

  function examTags(exam) {
    var tags = [];
    if (exam.examType) tags.push('<span class="pill pill-pink">' + escapeHtml(exam.examType) + '</span>');
    if (exam.difficulty) {
      var cls = exam.difficulty === 'ง่าย' ? 'pill-mint' : (exam.difficulty === 'ยาก' ? 'pill-peach' : 'pill-yellow');
      tags.push('<span class="pill ' + cls + '">' + escapeHtml(exam.difficulty) + '</span>');
    }
    return tags.length ? '<div class="exam-tags">' + tags.join('') + '</div>' : '';
  }

  function renderStartScreen() {
    renderUserChip();
    el.examCount.textContent = examsData.exams.length + ' ชุด';
    el.examList.innerHTML = '';
    examsData.exams.forEach(function (exam, i) {
      var best = state.currentUserName ? Storage.getBestScore(state.currentUserName, exam.id) : null;
      var pct = best ? Math.round((best.score / best.total) * 100) : 0;
      var card = document.createElement('article');
      card.className = 'exam-card card';
      card.style.animationDelay = (i * 70) + 'ms';
      card.innerHTML =
        '<div class="cover">' + Art.cover(i) +
          '<span class="pill">' + exam.questions.length + ' ข้อ</span>' +
        '</div>' +
        '<div class="exam-card-body">' +
          examTags(exam) +
          '<h3>' + escapeHtml(exam.title) + '</h3>' +
          (exam.lesson || exam.unit ? '<p class="exam-lesson">' + escapeHtml(exam.lesson ? 'เรื่อง ' + exam.lesson : exam.unit) + '</p>' : '') +
          '<div class="exam-meta"><span>' + escapeHtml([exam.subject, exam.grade].filter(Boolean).join(' • ')) + '</span>' +
          '<span>จับเวลา ' + (exam.timeLimitMinutes || 15) + ' นาที</span></div>' +
          (best
            ? '<div class="best-row"><span>คะแนนสูงสุด</span><strong>' + best.score + '/' + best.total + '</strong></div>' +
              '<div class="bar"><span style="width:' + pct + '%"></span></div>'
            : '<div class="best-row"><span>' + (state.currentUserName ? 'ยังไม่เคยทำชุดนี้' : 'เข้าชื่อแล้วจะเห็นคะแนนสูงสุด') + '</span></div>') +
          '<button type="button" class="btn btn-primary btn-start-exam">เริ่มทำข้อสอบ</button>' +
        '</div>';
      card.querySelector('.btn-start-exam').addEventListener('click', function () {
        openIdentifyScreen(exam);
      });
      el.examList.appendChild(card);
    });

    var wrongCount = state.currentUserName ? Storage.getWrongQuestions(state.currentUserName).length : 0;
    if (wrongCount > 0) {
      el.reviewCount.textContent = wrongCount;
      el.reviewEntry.hidden = false;
    } else {
      el.reviewEntry.hidden = true;
    }
  }

  function goToStart() {
    stopTimer();
    renderStartScreen();
    showScreen(el.screenStart);
  }

  // ---------- หน้าระบุตัวตน ----------

  function openIdentifyScreen(exam) {
    state.selectedExam = exam;
    el.identifyExamTitle.textContent = [exam.title, exam.lesson ? 'เรื่อง ' + exam.lesson : '', exam.questions.length + ' ข้อ']
      .filter(Boolean).join(' • ');
    el.timerHint.textContent = 'นับถอยหลังทั้งชุด ' + (exam.timeLimitMinutes || 15) + ' นาที';
    el.identifyForm.reset();
    el.identifyError.hidden = true;
    el.pinConfirmWrap.hidden = true;
    el.labelPin.textContent = 'PIN 4 หลัก';
    if (state.currentUserName) {
      el.inputName.value = state.currentUserName;
    }
    showScreen(el.screenIdentify);
    updatePinModeForName();
  }

  function updatePinModeForName() {
    var name = el.inputName.value.trim();
    if (!name) {
      el.pinConfirmWrap.hidden = true;
      el.labelPin.textContent = 'PIN 4 หลัก';
      return;
    }
    var exists = Storage.profileExists(name);
    if (exists) {
      el.pinConfirmWrap.hidden = true;
      el.labelPin.textContent = 'PIN 4 หลัก';
    } else {
      el.pinConfirmWrap.hidden = false;
      el.labelPin.textContent = 'ตั้ง PIN ใหม่ 4 หลัก';
    }
  }

  function showIdentifyError(message) {
    el.identifyError.textContent = message;
    el.identifyError.hidden = false;
  }

  function handleIdentifySubmit(evt) {
    evt.preventDefault();
    el.identifyError.hidden = true;

    var name = el.inputName.value.trim();
    var pin = el.inputPin.value.trim();

    if (!name) {
      showIdentifyError('กรอกเลขที่และชื่อเล่นก่อนนะ');
      return;
    }
    if (!/^[0-9]{4}$/.test(pin)) {
      showIdentifyError('PIN ต้องเป็นตัวเลข 4 หลักนะ');
      return;
    }

    var exists = Storage.profileExists(name);
    if (!exists) {
      var pinConfirm = el.inputPinConfirm.value.trim();
      if (pin !== pinConfirm) {
        showIdentifyError('PIN ไม่ตรงกัน ลองพิมพ์ใหม่อีกครั้งนะ');
        return;
      }
    }

    var result = Storage.verifyOrCreate(name, pin);
    if (!result.ok) {
      showIdentifyError('PIN ไม่ถูกต้องนะ ลองใหม่อีกครั้ง ถ้าจำ PIN ไม่ได้ให้บอกคุณครูช่วยดูให้นะ');
      return;
    }

    state.currentUserName = result.profile.displayName;
    state.timerEnabled = el.toggleTimer.checked;
    renderUserChip();
    startQuiz(state.selectedExam);
  }

  // ---------- หน้าทำข้อสอบ ----------

  function startQuiz(exam) {
    state.mode = 'normal';
    state.questions = exam.questions;
    state.currentIndex = 0;
    state.answers = [];
    state.streak = 0;
    state.startedAt = Date.now();
    renderQuestion();
    showScreen(el.screenQuiz);
    setupTimerIfNeeded(exam);
  }

  function setupTimerIfNeeded(exam) {
    stopTimer();
    if (!state.timerEnabled) {
      el.timerText.hidden = true;
      return;
    }
    var minutes = exam.timeLimitMinutes || 15;
    state.secondsLeft = minutes * 60;
    el.timerText.hidden = false;
    updateTimerDisplay();
    state.timerInterval = setInterval(function () {
      state.secondsLeft--;
      updateTimerDisplay();
      if (state.secondsLeft <= 0) {
        stopTimer();
        finishQuiz();
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    var m = Math.floor(state.secondsLeft / 60);
    var s = state.secondsLeft % 60;
    el.timerText.textContent = 'เหลือ ' + m + ':' + (s < 10 ? '0' : '') + s;
  }

  function shuffleArray(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  function renderQuestion() {
    var questions = state.questions;
    var question = state.mode === 'review' ? questions[state.currentIndex].question : questions[state.currentIndex];
    var total = questions.length;

    el.progressText.textContent = 'ข้อ ' + (state.currentIndex + 1) + ' จาก ' + total;
    el.progressFill.style.width = Math.round(((state.currentIndex) / total) * 100) + '%';

    el.questionTopic.textContent = question.topic || '';
    el.questionText.textContent = question.question;

    if (question.image) {
      el.questionImage.src = question.image;
      el.questionImage.alt = question.question;
      el.questionImageWrap.hidden = false;
    } else {
      el.questionImageWrap.hidden = true;
      el.questionImage.src = '';
    }

    var order;
    if (state.mode === 'review') {
      order = shuffleArray(question.choices.map(function (_, idx) { return idx; }));
    } else {
      order = question.choices.map(function (_, idx) { return idx; });
    }
    state.currentChoiceOrder = order;

    el.choicesList.innerHTML = '';
    order.forEach(function (originalIdx, displayIdx) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'choice-btn';
      btn.dataset.originalIndex = originalIdx;
      btn.innerHTML = '<span class="choice-icon">' + LETTERS[displayIdx] + '</span><span class="choice-label"></span>';
      btn.querySelector('.choice-label').textContent = question.choices[originalIdx];
      btn.addEventListener('click', function () { selectChoice(btn); });
      el.choicesList.appendChild(btn);
    });

    el.feedbackBox.hidden = true;
    el.feedbackBox.className = 'feedback';
    el.btnCheck.hidden = false;
    el.btnCheck.disabled = true;
    el.btnCheck.textContent = 'เลือกคำตอบก่อนนะ';
    renderStreak();
    el.btnNext.hidden = true;
    state.answeredCurrent = false;
  }

  function selectChoice(btn) {
    if (state.answeredCurrent) return;
    var buttons = el.choicesList.querySelectorAll('.choice-btn');
    buttons.forEach(function (b) { b.classList.remove('selected'); });
    btn.classList.add('selected');
    el.btnCheck.disabled = false;
    el.btnCheck.textContent = 'ตรวจคำตอบ';
  }

  function renderStreak() {
    el.streakPill.hidden = state.streak < 2;
    el.streakPill.textContent = 'ถูกติดกัน ' + state.streak + ' ข้อ';
  }

  function checkAnswer() {
    var selectedBtn = el.choicesList.querySelector('.choice-btn.selected');
    if (!selectedBtn) return;

    var questions = state.questions;
    var entry = state.mode === 'review' ? questions[state.currentIndex] : null;
    var question = state.mode === 'review' ? entry.question : questions[state.currentIndex];

    var selectedOriginalIdx = parseInt(selectedBtn.dataset.originalIndex, 10);
    var isCorrect = selectedOriginalIdx === question.answer;

    var buttons = el.choicesList.querySelectorAll('.choice-btn');
    buttons.forEach(function (b) {
      b.disabled = true;
      var idx = parseInt(b.dataset.originalIndex, 10);
      if (idx === question.answer) {
        b.classList.add('correct');
        b.querySelector('.choice-icon').textContent = '✓';
      } else if (b === selectedBtn) {
        b.classList.add('wrong');
        b.querySelector('.choice-icon').textContent = '✕';
      }
    });

    el.feedbackBox.hidden = false;
    el.explanationText.textContent = question.explanation || '';

    if (isCorrect) {
      el.feedbackText.textContent = '✓ ' + pick(PRAISE);
      el.feedbackBox.classList.add('is-correct');
      state.streak++;
    } else {
      el.feedbackText.textContent = '✕ ' + pick(COMFORT);
      el.feedbackBox.classList.add('is-wrong');
      state.streak = 0;
    }
    renderStreak();

    if (state.mode === 'normal') {
      state.answers.push({ questionId: question.id, correct: isCorrect });
      if (!isCorrect && state.currentUserName) {
        Storage.addWrongQuestion(state.currentUserName, state.selectedExam.id, question.id);
      }
    } else if (state.mode === 'review') {
      if (isCorrect) {
        state.resolvedInReview++;
        if (state.currentUserName) {
          Storage.removeWrongQuestion(state.currentUserName, entry.examId, question.id);
        }
      }
    }

    state.answeredCurrent = true;
    el.btnCheck.hidden = true;
    el.btnNext.hidden = false;
    var isLast = state.currentIndex >= questions.length - 1;
    el.btnNext.textContent = isLast ? (state.mode === 'review' ? 'เสร็จสิ้น' : 'ดูสรุปผล') : 'ข้อต่อไป';
    el.btnNext.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function goNext() {
    var questions = state.questions;
    state.currentIndex++;
    if (state.currentIndex >= questions.length) {
      el.progressFill.style.width = '100%';
      if (state.mode === 'review') {
        finishReview();
      } else {
        finishQuiz();
      }
      return;
    }
    renderQuestion();
  }

  // ---------- หน้าสรุปผล ----------

  function finishQuiz() {
    stopTimer();
    var attempted = state.answers.length;
    var score = state.answers.filter(function (a) { return a.correct; }).length;
    var fullTotal = state.questions.length;

    if (attempted === fullTotal && state.currentUserName) {
      Storage.saveBestScore(state.currentUserName, state.selectedExam.id, score, fullTotal);
    }

    if (attempted > 0 && state.currentUserName) {
      ResultSync.submit({
        timestamp: new Date().toISOString(),
        student: state.currentUserName,
        examId: state.selectedExam.id,
        examTitle: state.selectedExam.title,
        score: score,
        answered: attempted,
        questionCount: fullTotal,
        completed: attempted === fullTotal,
        wrongIds: state.answers.filter(function (a) { return !a.correct; }).map(function (a) { return a.questionId; }).join(','),
        durationSec: Math.round((Date.now() - state.startedAt) / 1000)
      });
    }

    renderSummary(score, attempted);
    showScreen(el.screenSummary);
  }

  function renderSummary(score, total) {
    var pct = total > 0 ? (score / total) * 100 : 0;
    var stars = pct >= 80 ? 3 : (pct >= 50 ? 2 : 1);
    var message;
    if (pct >= 80) {
      message = pct === 100 ? 'ถูกครบทุกข้อ เก่งมาก' : 'เก่งมาก ตอบถูกเกือบหมดเลย';
    } else if (pct >= 50) {
      message = 'ทำได้ดีนะ ทบทวนข้อที่ผิดอีกนิด คราวหน้าได้เพิ่มแน่';
    } else {
      message = 'ไม่เป็นไรนะ ลองทบทวนข้อที่ผิด แล้วกลับมาทำใหม่กัน';
    }

    el.summaryHeading.textContent = state.selectedExam.title;
    el.starsRow.innerHTML = [0, 1, 2].map(function (i) {
      return '<span class="star' + (i < stars ? ' on' : '') + '">★</span>';
    }).join('');
    el.summaryScore.textContent = score + ' / ' + total;
    el.summaryMessage.textContent = message;

    var seconds = Math.round((Date.now() - state.startedAt) / 1000);
    var mins = Math.floor(seconds / 60);
    var timeText = (mins ? mins + ' นาที ' : '') + (seconds % 60) + ' วินาที';
    var facts = ['ถูก ' + Math.round(pct) + '%', 'ใช้เวลา ' + timeText];
    if (total < state.questions.length) facts.push('หมดเวลาก่อนครบ ' + state.questions.length + ' ข้อ');
    el.summaryFacts.innerHTML = facts.map(function (f) { return '<span class="pill">' + escapeHtml(f) + '</span>'; }).join('');

    el.confetti.innerHTML = '';
    if (stars === 3) {
      var colors = ['var(--yellow)', 'var(--blue)', 'var(--pink)', 'var(--mint)', 'var(--peach)'];
      for (var i = 0; i < 26; i++) {
        var bit = document.createElement('i');
        bit.style.left = Math.round(Math.random() * 100) + '%';
        bit.style.background = colors[i % colors.length];
        bit.style.animationDelay = Math.round(Math.random() * 500) + 'ms';
        el.confetti.appendChild(bit);
      }
    }

    var wrongCount = state.currentUserName ? Storage.getWrongQuestions(state.currentUserName).length : 0;
    el.btnReviewWrong.hidden = wrongCount === 0;
    if (wrongCount > 0) {
      el.btnReviewWrong.classList.add('btn-primary');
      el.btnReviewWrong.classList.remove('btn-secondary');
      el.btnRetake.classList.add('btn-secondary');
      el.btnRetake.classList.remove('btn-primary');
      el.btnReviewWrong.style.order = '-1';
    } else {
      el.btnReviewWrong.classList.add('btn-secondary');
      el.btnReviewWrong.classList.remove('btn-primary');
      el.btnRetake.classList.add('btn-primary');
      el.btnRetake.classList.remove('btn-secondary');
      el.btnReviewWrong.style.order = '';
    }
  }

  // ---------- โหมดทบทวนข้อที่ผิด ----------

  function startReview() {
    if (!state.currentUserName) return;
    var wrongRefs = Storage.getWrongQuestions(state.currentUserName);
    var items = wrongRefs.map(function (ref) {
      var found = findQuestionById(ref.examId, ref.questionId);
      if (!found) return null;
      return { examId: ref.examId, question: found.question };
    }).filter(Boolean);

    if (items.length === 0) {
      goToStart();
      return;
    }

    state.mode = 'review';
    state.questions = items;
    state.currentIndex = 0;
    state.resolvedInReview = 0;
    state.streak = 0;
    stopTimer();
    el.timerText.hidden = true;
    renderQuestion();
    showScreen(el.screenQuiz);
  }

  function finishReview() {
    var total = state.questions.length;
    el.reviewDoneText.textContent =
      'ทบทวนไป ' + total + ' ข้อ ตอบถูก ' + state.resolvedInReview + ' ข้อ' +
      (state.resolvedInReview < total ? ' ข้อที่ยังไม่ถูกจะรอให้ลองใหม่ครั้งหน้านะ' : ' ตอบถูกครบทุกข้อเลย');
    showScreen(el.screenReviewDone);
  }

  // ---------- ภาพขยาย ----------

  function openImageModal(src, alt) {
    el.imageModalImg.src = src;
    el.imageModalImg.alt = alt;
    el.imageModal.hidden = false;
  }

  function closeImageModal() {
    el.imageModal.hidden = true;
  }

  // ---------- กล่องยืนยัน (แทน window.confirm) ----------

  var pendingConfirmAction = null;

  function showConfirm(message, onOk) {
    el.confirmText.textContent = message;
    pendingConfirmAction = onOk;
    el.confirmModal.hidden = false;
  }

  function hideConfirm() {
    el.confirmModal.hidden = true;
    pendingConfirmAction = null;
  }

  // ---------- เริ่มต้นแอป ----------

  function bindEvents() {
    el.inputName.addEventListener('blur', updatePinModeForName);
    el.identifyForm.addEventListener('submit', handleIdentifySubmit);
    el.btnBackToStart.addEventListener('click', goToStart);

    el.btnCheck.addEventListener('click', checkAnswer);
    el.btnNext.addEventListener('click', goNext);

    el.questionImage.addEventListener('click', function () {
      openImageModal(el.questionImage.src, el.questionImage.alt);
    });
    el.imageModal.addEventListener('click', closeImageModal);

    el.btnGlobalReview.addEventListener('click', startReview);
    el.btnReviewWrong.addEventListener('click', startReview);
    el.btnRetake.addEventListener('click', function () {
      startQuiz(state.selectedExam);
    });
    el.btnToStart.addEventListener('click', goToStart);
    el.btnReviewDoneToStart.addEventListener('click', goToStart);

    el.btnTheme.addEventListener('click', Theme.toggle);
    Theme.onChange(renderThemeButton);

    el.btnQuit.addEventListener('click', function () {
      var msg = state.mode === 'review'
        ? 'ออกจากการทบทวนไหม ข้อที่ยังไม่ได้ทำจะรอไว้ให้ครั้งหน้า'
        : 'ออกจากข้อสอบชุดนี้ไหม คะแนนรอบนี้จะไม่ถูกบันทึก';
      showConfirm(msg, goToStart);
    });

    el.btnConfirmOk.addEventListener('click', function () {
      var action = pendingConfirmAction;
      hideConfirm();
      if (action) action();
    });
    el.btnConfirmCancel.addEventListener('click', hideConfirm);
    el.confirmModal.addEventListener('click', function (e) {
      if (e.target === el.confirmModal) hideConfirm();
    });

    document.addEventListener('keydown', handleKeys);
  }

  function renderThemeButton() {
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    el.btnTheme.innerHTML = dark ? SUN_ICON : MOON_ICON;
    el.btnTheme.setAttribute('aria-label', dark ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด');
  }

  function handleKeys(e) {
    if (!el.confirmModal.hidden) {
      if (e.key === 'Escape') hideConfirm();
      return;
    }
    if (el.screenQuiz.hidden || !el.imageModal.hidden || e.ctrlKey || e.metaKey || e.altKey) return;
    var n = ['1', '2', '3', '4'].indexOf(e.key);
    if (n < 0) n = LETTERS.indexOf(e.key);
    if (n >= 0 && !state.answeredCurrent) {
      var btn = el.choicesList.querySelectorAll('.choice-btn')[n];
      if (btn) { selectChoice(btn); btn.focus(); }
      e.preventDefault();
    } else if (e.key === 'Enter') {
      if (!el.btnCheck.hidden && !el.btnCheck.disabled) { checkAnswer(); e.preventDefault(); }
      else if (!el.btnNext.hidden) { goNext(); e.preventDefault(); }
    }
  }

  function init() {
    cacheEls();
    bindEvents();

    if (!Storage.isAvailable()) {
      el.storageWarning.hidden = false;
    }
    el.heroArt.innerHTML = Art.hero();
    renderThemeButton();
    ResultSync.flush();

    ExamSource.load(function (data) {
      examsData = { exams: data.exams };
      if (!el.screenStart.hidden) renderStartScreen();
    }, function () {
      el.examList.innerHTML = '<p class="empty-note">โหลดข้อสอบไม่ได้ ลองเช็กอินเทอร์เน็ตแล้วรีเฟรชหน้านี้อีกครั้งนะ</p>';
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
