let allQuestions = [];       // 전체 데이터 담는 통
let currentQuestions = [];   // 현재 선택된 과목의 문제들 (섞인 상태)
let currentIdx = 0;          // 현재 풀고 있는 문제 번호

// 1. 데이터 로드
fetch('data.json')
    .then(res => res.json())
    .then(data => {
        allQuestions = data;
        renderSubjectButtons();
    })
    .catch(err => console.error("데이터 로드 실패:", err));

// 2. 메인화면: 과목 버튼 만들기
function renderSubjectButtons() {
    const subjectList = document.getElementById('subject-list');
    subjectList.innerHTML = ''; // 초기화

    // 중복 제거해서 과목명만 추출
    const subjects = [...new Set(allQuestions.map(q => q.subject))];

    subjects.forEach(sub => {
        const btn = document.createElement('button');
        btn.className = 'subject-card';
        btn.innerText = sub;
        btn.onclick = () => startQuiz(sub);
        subjectList.appendChild(btn);
    });
}

// 3. [핵심] 배열 무작위 섞기 (Fisher-Yates Shuffle)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 4. 퀴즈 시작 (과목 선택 시)
function startQuiz(subjectName) {
    // 4-1. 해당 과목 문제만 필터링
    const filtered = allQuestions.filter(q => q.subject === subjectName);
    
    // 4-2. 필터링된 문제를 '랜덤'으로 섞어서 저장
    currentQuestions = shuffleArray([...filtered]); 
    
    if (currentQuestions.length === 0) {
        alert("준비된 문제가 없습니다.");
        return;
    }

    currentIdx = 0;
    
    // 화면 전환
    document.getElementById('home-screen').style.display = 'none';
    document.getElementById('quiz-screen').style.display = 'block';
    document.getElementById('current-subject-title').innerText = subjectName;

    showQuestion();
}

// 5. 문제 화면에 뿌리기
function showQuestion() {
    // 끝까지 다 풀었는지 확인
    if (currentIdx >= currentQuestions.length) {
        alert("모든 문제를 다 푸셨습니다! 메인으로 돌아갑니다.");
        goHome();
        return;
    }

    const q = currentQuestions[currentIdx];
    
    // 진행 상황 표시 (예: 1 / 20)
    document.getElementById('progress-text').innerText = `${currentIdx + 1} / ${currentQuestions.length}`;

    // 문제 텍스트
    document.getElementById('question-text').innerText = q.question;

    // 보기 버튼 생성
    const optionsBox = document.getElementById('options-box');
    optionsBox.innerHTML = '';

    q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt;
        btn.onclick = () => checkAnswer(idx, q.answer, q.explanation);
        optionsBox.appendChild(btn);
    });

    // 결과(해설)창 숨기기
    const resultBox = document.getElementById('result-box');
    resultBox.style.display = 'none';
    resultBox.className = ''; // 클래스 초기화
}

// 6. 정답 체크
function checkAnswer(selectedIndex, correctIndex, explanation) {
    const resultBox = document.getElementById('result-box');
    const explanationText = document.getElementById('explanation-text');
    
    resultBox.style.display = 'block';

    if (selectedIndex === correctIndex) {
        resultBox.className = 'correct-box';
        resultBox.innerHTML = `<strong>✅ 정답입니다!</strong><br><br>${explanation}`;
        // 정답이면 1.5초 뒤 자동으로 다음 문제로 (선택 사항)
        // setTimeout(nextQuestion, 1500);
    } else {
        resultBox.className = 'wrong-box';
        resultBox.innerHTML = `<strong>❌ 틀렸습니다.</strong><br><br>${explanation}`;
    }
}

// 7. 다음 문제로 넘어가기 버튼
function nextQuestion() {
    currentIdx++;
    showQuestion();
}

// 8. 홈으로 나가기
function goHome() {
    document.getElementById('quiz-screen').style.display = 'none';
    document.getElementById('home-screen').style.display = 'block';
}
