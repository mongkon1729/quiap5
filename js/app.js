(function () {
  'use strict';

  var examsData = { exams: [] };

  var state = {
    currentUserName: null, // username (key for saved progress)
    displayName: '',
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
    el.browseTitle = document.getElementById('browseTitle');
    el.browseCrumbs = document.getElementById('browseCrumbs');
    el.searchInput = document.getElementById('searchInput');
    el.summaryArt = document.getElementById('summaryArt');
    el.summaryArtSide = document.getElementById('summaryArtSide');
    el.syncStatus = document.getElementById('syncStatus');
    el.sideNav = document.getElementById('sideNav');
    el.btnSideReview = document.getElementById('btnSideReview');
    el.sidePromoText = document.getElementById('sidePromoText');
    el.recentBlock = document.getElementById('recentBlock');
    el.recentList = document.getElementById('recentList');
    el.achieveList = document.getElementById('achieveList');
    el.achieveSub = document.getElementById('achieveSub');
    el.suggestList = document.getElementById('suggestList');
    el.heroShelf = document.getElementById('heroShelf');
    el.heroCard = el.heroTitle.closest('.hero');
    el.examList = document.getElementById('examList');
    el.reviewEntry = document.getElementById('reviewEntry');
    el.btnGlobalReview = document.getElementById('btnGlobalReview');
    el.reviewCount = document.getElementById('reviewCount');

    el.screenIdentify = document.getElementById('screen-identify');
    el.identifyExamTitle = document.getElementById('identifyExamTitle');
    el.identifyForm = document.getElementById('identifyForm');
    el.knownUserName = document.getElementById('knownUserName');
    el.btnNotMe = document.getElementById('btnNotMe');
    el.screenLogin = document.getElementById('screen-login');
    el.loginForm = document.getElementById('loginForm');
    el.loginUser = document.getElementById('loginUser');
    el.loginPass = document.getElementById('loginPass');
    el.loginError = document.getElementById('loginError');
    el.btnLogin = document.getElementById('btnLogin');
    el.btnShowPass = document.getElementById('btnShowPass');
    el.bottomNav = document.getElementById('bottomNav');
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
    [el.screenLogin, el.screenStart, el.screenIdentify, el.screenQuiz, el.screenSummary, el.screenReviewDone].forEach(function (s) {
      s.hidden = s !== screenEl;
    });
    document.body.classList.toggle('in-quiz', screenEl !== el.screenStart && screenEl !== el.screenLogin);
    document.body.classList.toggle('need-login', screenEl === el.screenLogin);
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
    el.userChipName.textContent = state.displayName || '';
    if (state.currentUserName) {
      el.heroTitle.textContent = 'สวัสดี ' + state.displayName;
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

  // ---------- เลือกวิชา → บท → เรื่อง → ชุดข้อสอบ ----------

  var subjectOf = ExamSource.subjectOf;
  var unitOf = ExamSource.unitOf;
  var lessonOf = ExamSource.lessonOf;
  var groupBy = ExamSource.groupBy;

  function readNav() {
    var parts = (window.location.hash.replace(/^#\/?/, '') || '').split('/').map(function (p) {
      try { return decodeURIComponent(p); } catch (e) { return ''; }
    });
    return { subject: parts[0] || '', unit: parts[1] || '', lesson: parts[2] || '' };
  }

  function navHash() {
    return '#/' + Array.prototype.slice.call(arguments).filter(Boolean).map(encodeURIComponent).join('/');
  }

  function doneOf(exams) {
    if (!state.currentUserName) return null;
    return exams.filter(function (e) { return Storage.getBestScore(state.currentUserName, e.id); }).length;
  }

  function progressText(exams) {
    var done = doneOf(exams);
    return done === null ? exams.length + ' ชุด' : 'ทำแล้ว ' + done + ' / ' + exams.length + ' ชุด';
  }

  function navCard(opts, i) {
    var done = doneOf(opts.exams);
    opts.pct = done === null ? null : Math.round(done / opts.exams.length * 100);
    opts.delay = i * 60;
    var box = document.createElement('div');
    box.innerHTML = ExamSource.navCardHtml(opts);
    return box.firstChild;
  }

  function renderCrumbs(items) {
    if (!items.length) { el.browseCrumbs.hidden = true; el.browseCrumbs.innerHTML = ''; return; }
    el.browseCrumbs.hidden = false;
    var back = items.length > 1 ? items[items.length - 2].href : '#/';
    el.browseCrumbs.innerHTML = '<a class="btn btn-sm crumb-back" href="' + back + '">‹ ย้อนกลับ</a>' +
      '<ol><li><a href="#/">ทุกวิชา</a></li>' + items.map(function (it, i) {
        return i === items.length - 1
          ? '<li aria-current="page">' + escapeHtml(it.label) + '</li>'
          : '<li><a href="' + it.href + '">' + escapeHtml(it.label) + '</a></li>';
      }).join('') + '</ol>';
  }

  function renderBrowse() {
    var nav = readNav();
    var all = examsData.exams;
    var query = (el.searchInput.value || '').trim().toLowerCase();
    if (query) {
      var found = all.filter(function (e) {
        return [e.title, e.subject, e.unit, e.lesson, e.strand].join(' ').toLowerCase().indexOf(query) >= 0;
      });
      el.heroCard.hidden = true;
      renderCrumbs([]);
      el.browseTitle.textContent = 'ผลการค้นหา';
      el.examCount.textContent = found.length + ' ชุด';
      el.examList.className = 'nav-list';
      el.examList.innerHTML = '';
      if (found.length) appendExamCards(found, '');
      else el.examList.innerHTML = '<p class="empty-note">ไม่พบชุดข้อสอบที่ตรงกับ "' + escapeHtml(el.searchInput.value.trim()) + '" ลองพิมพ์คำอื่นดูนะ</p>';
      return;
    }
    var bySubject = groupBy(all, function (e) { return subjectOf(e).name; });
    var subject = bySubject.find(function (g) { return g.key === nav.subject; });
    var theme = subject ? subjectOf(subject.items[0]) : null;
    var units = subject ? groupBy(subject.items, unitOf) : [];
    var unit = units.find(function (g) { return g.key === nav.unit; });
    var lessons = unit ? groupBy(unit.items.filter(lessonOf), lessonOf) : [];
    var lesson = lessons.find(function (g) { return g.key === nav.lesson; });

    el.examList.innerHTML = '';
    el.heroCard.hidden = !!subject;

    if (!subject) {
      renderCrumbs([]);
      el.browseTitle.textContent = 'เลือกวิชา';
      el.examCount.textContent = bySubject.length + ' วิชา • ' + all.length + ' ชุด';
      el.examList.className = 'nav-grid';
      bySubject.forEach(function (g, i) {
        var t = subjectOf(g.items[0]);
        el.examList.appendChild(navCard({ href: navHash(g.key), title: g.key, sub: progressText(g.items), theme: t, big: true, exams: g.items }, i));
      });
      return;
    }

    var crumbs = [{ label: subject.key, href: navHash(subject.key) }];
    if (!unit) {
      renderCrumbs(crumbs);
      el.browseTitle.textContent = subject.key;
      el.examCount.textContent = units.length + ' บท';
      el.examList.className = 'nav-list';
      units.forEach(function (g, i) {
        var nLessons = groupBy(g.items.filter(lessonOf), lessonOf).length;
        el.examList.appendChild(navCard({
          href: navHash(subject.key, g.key),
          kicker: String(g.items[0].unit || '').trim() ? 'บทที่ ' + (i + 1) : '',
          title: g.key,
          sub: (nLessons ? nLessons + ' เรื่อง • ' : '') + progressText(g.items),
          theme: theme, exams: g.items
        }, i));
      });
      return;
    }

    crumbs.push({ label: unit.key, href: navHash(subject.key, unit.key) });
    if (!lesson) {
      renderCrumbs(crumbs);
      el.browseTitle.textContent = unit.key;
      var loose = unit.items.filter(function (e) { return !lessonOf(e); });
      el.examCount.textContent = [lessons.length ? lessons.length + ' เรื่อง' : '', loose.length ? loose.length + ' ชุดรวมทั้งบท' : '']
        .filter(Boolean).join(' • ');
      el.examList.className = 'nav-list';
      lessons.forEach(function (g, i) {
        el.examList.appendChild(navCard({
          href: navHash(subject.key, unit.key, g.key),
          kicker: 'เรื่องที่ ' + (i + 1), title: g.key, sub: progressText(g.items), theme: theme, exams: g.items
        }, i));
      });
      if (loose.length) appendExamCards(loose, lessons.length ? 'ชุดข้อสอบรวมทั้งบท' : '');
      return;
    }

    crumbs.push({ label: lesson.key, href: navHash(subject.key, unit.key, lesson.key) });
    renderCrumbs(crumbs);
    el.browseTitle.textContent = lesson.key;
    el.examCount.textContent = lesson.items.length + ' ชุด';
    el.examList.className = 'nav-list';
    appendExamCards(lesson.items, '');
  }

  function appendExamCards(exams, heading) {
    if (heading) {
      var h = document.createElement('h3');
      h.className = 'nav-subhead';
      h.textContent = heading;
      el.examList.appendChild(h);
    }
    var grid = document.createElement('div');
    grid.className = 'exam-grid';
    exams.forEach(function (exam) {
      grid.appendChild(examCard(exam, examsData.exams.indexOf(exam)));
    });
    el.examList.appendChild(grid);
  }

  function examCard(exam, i) {
    var best = state.currentUserName ? Storage.getBestScore(state.currentUserName, exam.id) : null;
    var pct = best ? Math.round((best.score / best.total) * 100) : 0;
    var setNo = ExamSource.setNumber(exam, examsData.exams);
    var chips = [exam.lesson || (exam.unit ? exam.unit : ''), exam.difficulty, exam.grade].filter(Boolean);
    var card = document.createElement('article');
    card.className = 'exam-card';
    card.style.animationDelay = ((i % 8) * 60) + 'ms';
    card.innerHTML =
      '<div class="cover">' + Art.cover(i, ExamSource.pictureFor(exam, examsData.exams)) +
        '<span class="cover-badge">' + exam.questions.length + ' ข้อ</span>' +
        (setNo ? '<span class="set-badge">ชุดที่ ' + setNo + '</span>' : '') +
      '</div>' +
      '<div class="exam-card-body">' +
        '<div class="exam-kind"><img class="kind-icon" src="img/3d/memo.png" alt="" />แบบทดสอบ' +
          (exam.examType ? '<span class="kind-dot">•</span><span class="kind-type">' + escapeHtml(exam.examType) + '</span>' : '') + '</div>' +
        '<h3>' + escapeHtml(exam.title) + '</h3>' +
        (chips.length ? '<div class="exam-chips">' + chips.map(function (c) { return '<span>' + escapeHtml(c) + '</span>'; }).join('') + '</div>' : '') +
        '<div class="exam-foot">' +
          (best
            ? '<span class="exam-progress"><span class="ring" style="--p:' + pct + '"></span><span>คะแนนสูงสุด <b>' + best.score + '/' + best.total + '</b></span></span>'
            : '<span class="exam-progress muted">' + (state.currentUserName ? 'ยังไม่เริ่ม' : '⏱ ' + (exam.timeLimitMinutes || 15) + ' นาที') + '</span>') +
          '<button type="button" class="btn btn-outline btn-sm btn-start-exam">' + (best ? 'ทำอีกครั้ง' : 'เริ่ม') + '</button>' +
        '</div>' +
      '</div>';
    card.querySelector('.btn-start-exam').addEventListener('click', function () {
      openIdentifyScreen(exam);
    });
    return card;
  }

  // ---------- เมนูข้าง ทำล่าสุด ความก้าวหน้า ชุดแนะนำ ----------

  var HOME_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>';
  var REVIEW_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>';
  var TEACHER_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>';

  function renderSideNav() {
    var nav = readNav();
    var subjects = groupBy(examsData.exams, function (e) { return subjectOf(e).name; });
    var item = function (href, icon, label, active) {
      return '<a class="side-link' + (active ? ' active' : '') + '" href="' + href + '"' + (active ? ' aria-current="page"' : '') + '>' +
        '<span class="side-link-icon">' + icon + '</span><span>' + escapeHtml(label) + '</span></a>';
    };
    el.sideNav.innerHTML = item('#/', HOME_ICON, 'หน้าแรก', !nav.subject) +
      subjects.map(function (g) {
        return item(navHash(g.key), ExamSource.pic(subjectOf(g.items[0]).img, subjectOf(g.items[0]).icon), g.key, nav.subject === g.key);
      }).join('') +
      '<button type="button" class="side-link" id="sideReviewLink"><span class="side-link-icon">' + REVIEW_ICON + '</span><span>ทบทวนข้อที่ผิด</span></button>' +
      item('teacher.html', TEACHER_ICON, 'สำหรับคุณครู', false);
    document.getElementById('sideReviewLink').addEventListener('click', startReviewOrHint);
  }

  function startReviewOrHint() {
    var n = state.currentUserName ? Storage.getWrongQuestions(state.currentUserName).length : 0;
    if (n > 0) { startReview(); return; }
    var hint = 'ตอนนี้ยังไม่มีข้อที่ตอบผิด เก่งมากเลย ลองทำชุดใหม่เพิ่มดูนะ';
    el.sidePromoText.textContent = hint;
    if (window.matchMedia('(max-width: 1023px)').matches) showConfirm(hint, null, 'ตกลง');
  }

  function renderSideColumn() {
    var all = examsData.exams;
    var user = state.currentUserName;

    // ทำล่าสุด (เหมือนแถว Ongoing)
    var done = user ? all.filter(function (e) { return Storage.getBestScore(user, e.id); }) : [];
    var showRecent = done.length && !readNav().subject && !(el.searchInput.value || '').trim();
    el.recentBlock.hidden = !showRecent;
    el.recentList.innerHTML = '';
    if (showRecent) done.slice(0, 4).forEach(function (e) { el.recentList.appendChild(examCard(e, all.indexOf(e))); });

    // ความก้าวหน้าต่อวิชา
    var subjects = groupBy(all, function (e) { return subjectOf(e).name; });
    el.achieveSub.textContent = user ? 'ทำครบทุกชุดในวิชาเพื่อเก็บดาว' : 'ใส่ชื่อตอนเริ่มทำข้อสอบ แล้วจะเห็นความคืบหน้าตรงนี้';
    el.achieveList.innerHTML = subjects.map(function (g) {
      var t = subjectOf(g.items[0]);
      var n = user ? g.items.filter(function (e) { return Storage.getBestScore(user, e.id); }).length : 0;
      var pct = Math.round(n / g.items.length * 100);
      return '<a class="achieve-row" href="' + navHash(g.key) + '"><span class="achieve-icon" style="background:' + t.c1 + '">' + ExamSource.pic(t.img, t.icon) + '</span>' +
        '<span class="achieve-body"><span class="achieve-top"><b>' + escapeHtml(g.key) + '</b><span>' + (pct === 100 ? '⭐ ' : '') + n + '/' + g.items.length + ' ชุด</span></span>' +
        '<span class="bar"><span style="width:' + pct + '%"></span></span></span></a>';
    }).join('');

    // ชุดแนะนำ (เหมือน Best sales)
    var fresh = all.filter(function (e) { return !user || !Storage.getBestScore(user, e.id); });
    var picks = (fresh.length ? fresh : all).slice(0, 5);
    el.suggestList.innerHTML = '';
    picks.forEach(function (e) {
      var t = subjectOf(e);
      var row = document.createElement('div');
      row.className = 'suggest-row';
      row.innerHTML = '<span class="suggest-thumb" style="background:' + t.c1 + '">' + ExamSource.pic(t.img, t.icon) + '</span>' +
        '<span class="suggest-body"><b>' + escapeHtml(e.title) + '</b><span>⭐ ' + e.questions.length + ' ข้อ • ' + escapeHtml(t.name) + '</span></span>' +
        '<button type="button" class="btn btn-primary suggest-btn">ทำ</button>';
      row.querySelector('button').addEventListener('click', function () { openIdentifyScreen(e); });
      el.suggestList.appendChild(row);
    });
  }

  function renderStartScreen() {
    renderUserChip();
    renderBrowse();
    renderSideNav();
    renderSideColumn();

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
    if (!state.currentUserName) { showLogin(); return; }
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
    el.knownUserName.textContent = state.displayName;
    showScreen(el.screenIdentify);
  }

  function handleIdentifySubmit(evt) {
    evt.preventDefault();
    if (!state.currentUserName) { showLogin(); return; }
    state.timerEnabled = el.toggleTimer.checked;
    startQuiz(state.selectedExam);
  }

  // ---------- เข้าสู่ระบบ ----------

  function setSignedIn(session) {
    state.currentUserName = session ? session.username : null;
    state.displayName = session ? Account.displayName(session) : '';
    if (session) Storage.ensureProfile(session.username, state.displayName);
  }

  function showLogin(message) {
    stopTimer();
    setSignedIn(null);
    el.loginForm.reset();
    el.loginError.hidden = !message;
    el.loginError.textContent = message || '';
    showScreen(el.screenLogin);
    setTimeout(function () { el.loginUser.focus(); }, 50);
  }

  function handleLogin(evt) {
    evt.preventDefault();
    var user = el.loginUser.value.trim();
    var pass = el.loginPass.value.trim();
    el.loginError.hidden = true;
    if (!user || !pass) {
      el.loginError.textContent = !user ? 'พิมพ์ชื่อผู้ใช้ก่อนนะ' : 'พิมพ์รหัสผ่านก่อนนะ';
      el.loginError.hidden = false;
      return;
    }
    el.btnLogin.disabled = true;
    el.btnLogin.textContent = 'กำลังตรวจสอบ...';
    Account.login(user, pass).then(function (session) {
      setSignedIn(session);
      goToStart();
    }, function (err) {
      el.loginError.textContent = err.message;
      el.loginError.hidden = false;
      el.loginPass.select();
    }).then(function () {
      el.btnLogin.disabled = false;
      el.btnLogin.textContent = 'เข้าสู่ระบบ';
    });
  }

  function askLogout() {
    showConfirm('ออกจากระบบของ "' + state.displayName + '" ไหม คะแนนและข้อที่เคยผิดเก็บไว้ครบ เข้าสู่ระบบใหม่เมื่อไหร่ก็เห็นเหมือนเดิม', function () {
      Account.logout();
      el.heroTitle.textContent = 'วันนี้ฝึกทำข้อสอบกันไหม';
      el.heroSub.textContent = 'เลือกวิชาด้านล่างได้เลย ทำทีละข้อ มีเฉลยให้ทุกข้อ';
      showLogin();
    }, 'ออกจากระบบ');
  }

  function scrollToEl(node) {
    if (node) node.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function onBottomNav(e) {
    var btn = e.target.closest('[data-bn]');
    if (!btn) return;
    var what = btn.dataset.bn;
    if (what === 'review') startReviewOrHint();
    else if (what === 'progress') scrollToEl(el.achieveList.closest('.side-card'));
    else if (what === 'me') askLogout();
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
          Account.pushProgress();
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
    if (state.currentUserName) Account.pushProgress();

    var sending = null;
    if (attempted > 0 && state.currentUserName) {
      sending = ResultSync.submit({
        timestamp: new Date().toISOString(),
        student: state.displayName || state.currentUserName,
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
    showSyncStatus(sending);
    showScreen(el.screenSummary);
  }

  function showSyncStatus(sending) {
    var box = el.syncStatus;
    if (!sending) { box.hidden = true; return; }
    box.hidden = false;
    box.className = 'sync-status is-sending';
    box.textContent = 'กำลังส่งคะแนนให้คุณครู...';
    sending.then(function (sent) {
      box.className = 'sync-status ' + (sent ? 'is-sent' : 'is-queued');
      box.textContent = sent
        ? '✓ ส่งคะแนนให้คุณครูแล้ว'
        : 'ยังส่งคะแนนไม่ได้ (ไม่มีอินเทอร์เน็ต) ไม่ต้องห่วง เว็บจะส่งให้เองเมื่อต่อเน็ตได้';
    });
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
      message = 'ไม่เป็นไรนะ ต้นกล้าก็ค่อยๆ โต ลองทบทวนข้อที่ผิด แล้วกลับมาทำใหม่กัน';
    }

    // a picture for every result, so every child leaves with something nice
    var art = stars === 3 ? ['trophy', 'party_popper'] : (stars === 2 ? ['sports_medal', 'glowing_star'] : ['seedling', 'sun']);
    el.summaryArt.src = 'img/3d/' + art[0] + '.png';
    el.summaryArtSide.src = 'img/3d/' + art[1] + '.png';
    el.summaryArtSide.hidden = false;
    el.summaryArt.classList.remove('pop-in');
    void el.summaryArt.offsetWidth;
    el.summaryArt.classList.add('pop-in');

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

  function showConfirm(message, onOk, okLabel) {
    el.btnConfirmOk.textContent = okLabel || 'ออกเลย';
    el.btnConfirmCancel.hidden = !onOk;
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
    el.identifyForm.addEventListener('submit', handleIdentifySubmit);
    el.loginForm.addEventListener('submit', handleLogin);
    el.btnShowPass.addEventListener('click', function () {
      var show = el.loginPass.type === 'password';
      el.loginPass.type = show ? 'text' : 'password';
      el.btnShowPass.textContent = show ? 'ซ่อนรหัส' : 'ดูรหัส';
      el.btnShowPass.setAttribute('aria-pressed', String(show));
    });
    el.btnNotMe.addEventListener('click', askLogout);
    el.userChip.addEventListener('click', askLogout);
    el.bottomNav.addEventListener('click', onBottomNav);
    el.btnBackToStart.addEventListener('click', goToStart);

    el.btnCheck.addEventListener('click', checkAnswer);
    el.btnNext.addEventListener('click', goNext);

    el.questionImage.addEventListener('click', function () {
      openImageModal(el.questionImage.src, el.questionImage.alt);
    });
    el.imageModal.addEventListener('click', closeImageModal);

    el.btnGlobalReview.addEventListener('click', startReview);
    el.btnSideReview.addEventListener('click', startReviewOrHint);
    el.searchInput.addEventListener('input', function () {
      if (el.screenStart.hidden) goToStart();
      renderStartScreen();
    });
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
    el.heroArt.innerHTML = Art.scene('books', 'graduation_cap', 'pencil');
    el.heroShelf.innerHTML = Art.scene('trophy', 'glowing_star', 'light_bulb');
    renderThemeButton();
    ResultSync.flush();

    var session = Account.getSession();
    setSignedIn(session);
    if (!session) showLogin();
    else Account.refreshProgress().then(function (changed) {
      if (changed === 'signedOut') showLogin('คุณครูเปลี่ยนรหัสผ่านของบัญชีนี้แล้ว เข้าสู่ระบบด้วยรหัสใหม่นะ');
      else if (changed && !el.screenStart.hidden) renderStartScreen();
    });

    window.addEventListener('hashchange', function () {
      el.searchInput.value = '';
      if (el.screenStart.hidden) return;
      renderStartScreen();
      window.scrollTo(0, 0);
    });

    ExamSource.load(function (data) {
      examsData = { exams: data.exams.filter(function (e) { return e.status !== 'draft'; }) };
      if (!el.screenStart.hidden && state.currentUserName) renderStartScreen();
    }, function () {
      el.examList.innerHTML = '<p class="empty-note">โหลดข้อสอบไม่ได้ ลองเช็กอินเทอร์เน็ตแล้วรีเฟรชหน้านี้อีกครั้งนะ</p>';
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
