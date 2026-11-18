let index = null;            // data/index.json (탭별 과목 목록)
const cache = {};            // 한 번 불러온 과목 파일 보관
let currentQuestions = [];
let currentIdx = 0;
let correctCount = 0;
let checkTab = 'knou';
let currentSubject = null;

const PRIORITY = {
    knou: ["AI 리터러시", "경영전략론", "컴파일러구성", "딥러닝", "자료구조", "C언어", "대학수학", "대학영어", "오픈소스 기반 데이터분석", "클라우드컴퓨팅", "jsp프로그래밍"],
    engineer: ["소프트웨어 설계", "소프트웨어 개발", "데이터베이스 구축", "프로그래밍 언어 활용", "정보시스템 구축 관리"]
};

// 1. 탭 전환
async function filterTab(tabId) {
    checkTab = tabId;
    document.querySelectorAll('.main-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });

    try {
        index ??= await fetch('data/index.json').then(res => res.json());
    } catch (error) {
        console.error(error);
        document.getElementById('subject-list').textContent = '문제 목록을 불러오지 못했습니다.';
        return;
    }
    renderSubjectButtons();
}

// 2. 과목 버튼
function renderSubjectButtons() {
    const subjects = index[checkTab];
    const priority = PRIORITY[checkTab];
    const total = subjects.reduce((sum, s) => sum + s.count, 0);
    document.querySelector('.sub-title').textContent = `총 ${total}문제 (랜덤 출제)`;

    const rank = s => {
        const i = priority.indexOf(s.subject);
        return i === -1 ? priority.length : i;
    };
    const sorted = [...subjects].sort((a, b) => rank(a) - rank(b) || a.subject.localeCompare(b.subject));

    const subjectList = document.getElementById('subject-list');
    subjectList.innerHTML = '';
    const groups = [
        ['내 과목', sorted.filter(s => priority.includes(s.subject))],
        ['다른 과목', sorted.filter(s => !priority.includes(s.subject))]
    ];
    groups.forEach(([label, list]) => {
        if (list.length === 0) return;
        const title = document.createElement('p');
        title.className = 'section-label';
        title.textContent = label;
        const group = document.createElement('div');
        group.className = 'subject-group';
        list.forEach(s => {
            const btn = document.createElement('button');
            btn.className = 'subject-card';
            btn.innerHTML = '<span></span><span class="count"></span>';
            btn.children[0].textContent = s.subject;
            btn.children[1].textContent = `${s.count}문제`;
            btn.onclick = () => startQuiz(s);
            group.appendChild(btn);
        });
        subjectList.append(title, group);
    });
}

// 3. 배열 섞기
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 보기 순서를 섞고 정답 번호를 맞춰줌
function shuffleOptions(q) {
    if (q.options.some(o => o.startsWith('위의'))) return q; // "위의 설명이 모두 옳다" 같은 보기는 순서 유지
    const order = shuffleArray(q.options.map((_, i) => i));
    return { ...q, options: order.map(i => q.options[i]), answer: order.indexOf(q.answer) };
}

// 4. 퀴즈 시작 (클릭한 과목 파일만 불러옴)
async function startQuiz(s) {
    try {
        cache[s.file] ??= await fetch(encodeURI(s.file)).then(res => res.json());
    } catch (error) {
        console.error(error);
        alert('문제를 불러오지 못했습니다.');
        return;
    }

    const questionLimit = s.subject === '자료구조' ? 30 : 25;
    currentQuestions = shuffleArray([...cache[s.file]]).slice(0, questionLimit).map(shuffleOptions);
    currentSubject = s;
    currentIdx = 0;
    correctCount = 0;

    show('quiz-screen');
    document.getElementById('current-subject-title').innerText = s.subject;

    showQuestion();
}

// 5. 문제 화면
function showQuestion() {
    if (currentIdx >= currentQuestions.length) {
        showScoreScreen();
        return;
    }

    const q = currentQuestions[currentIdx];
    document.getElementById('progress-text').innerText = `${currentIdx + 1} / ${currentQuestions.length}`;
    document.getElementById('progress-bar').style.width = `${currentIdx / currentQuestions.length * 100}%`;
    window.scrollTo(0, 0);
    document.getElementById('question-text').innerText = q.question;

    const optionsBox = document.getElementById('options-box');
    optionsBox.innerHTML = '';
    q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerHTML = '<span class="num"></span><span></span>';
        btn.children[0].textContent = idx + 1;
        btn.children[1].textContent = opt;
        btn.onclick = () => checkAnswer(btn, idx, q);
        optionsBox.appendChild(btn);
    });

    document.getElementById('next-btn').hidden = true;
    document.getElementById('result-box').hidden = true;
}

// 6. 정답 체크 (해설은 textContent로 넣어서 <header> 같은 글자가 사라지지 않게)
function checkAnswer(clickedBtn, selectedIndex, q) {
    const allButtons = document.querySelectorAll('.option-btn');
    allButtons.forEach(btn => btn.disabled = true);

    const isCorrect = selectedIndex === q.answer;
    const resultBox = document.getElementById('result-box');
    resultBox.className = isCorrect ? 'correct-box' : 'wrong-box';
    resultBox.innerHTML = '<strong></strong><p class="answer"></p><p></p>';
    const [title, answer, body] = resultBox.children;

    if (isCorrect) {
        correctCount++;
        title.textContent = '정답이에요';
        answer.remove();
    } else {
        clickedBtn.classList.add('wrong');
        title.textContent = '틀렸어요';
        answer.textContent = `정답 ${q.answer + 1}번 · ${q.options[q.answer]}`;
    }
    allButtons[q.answer].classList.add('correct');
    body.textContent = q.explanation;
    resultBox.hidden = false;

    const nextBtn = document.getElementById('next-btn');
    nextBtn.textContent = currentIdx === currentQuestions.length - 1 ? '결과 보기' : '다음 문제';
    nextBtn.hidden = false;
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// 7. 다음 문제
function nextQuestion() {
    currentIdx++;
    showQuestion();
}

// 8. 결과 화면
function showScoreScreen() {
    show('score-screen');

    const total = currentQuestions.length;
    const score = Math.round((correctCount / total) * 100);
    document.getElementById('final-score').innerText = score;
    document.getElementById('score-ring').style.setProperty('--p', score);
    document.getElementById('total-count-display').innerText = total;
    document.getElementById('correct-count-display').innerText = correctCount;
    document.getElementById('wrong-count-display').innerText = total - correctCount;
}

// 9. 홈으로
function goHome() {
    show('home-screen');
}

function retry() {
    startQuiz(currentSubject);
}

function show(id) {
    ['home-screen', 'quiz-screen', 'score-screen'].forEach(s => {
        document.getElementById(s).hidden = s !== id;
    });
    window.scrollTo(0, 0);
}

// PC: 숫자키 1~4로 보기 선택, Enter로 다음 문제
document.addEventListener('keydown', e => {
    if (document.getElementById('quiz-screen').hidden) return;
    const nextBtn = document.getElementById('next-btn');
    if (e.key === 'Enter' && !nextBtn.hidden) nextQuestion();
    const opt = document.querySelectorAll('.option-btn')[e.key - 1];
    if (opt && !opt.disabled) opt.click();
});

window.addEventListener('DOMContentLoaded', () => filterTab('knou'));
