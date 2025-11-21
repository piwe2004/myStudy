let allQuestions = [];       
let currentQuestions = [];   
let currentIdx = 0;          

// 1. 데이터 로드
fetch('data.json')
    .then(res => res.json())
    .then(data => {
        allQuestions = data;
        renderSubjectButtons();
    })
    .catch(err => console.error("데이터 로드 실패:", err));

// 2. 메인화면: 과목 버튼 만들기 (내 과목 상단 고정 + 정렬)
function renderSubjectButtons() {
    const subjectList = document.getElementById('subject-list');
    subjectList.innerHTML = ''; 

    // 1) 전체 데이터에서 과목명 추출
    const allSubjects = [...new Set(allQuestions.map(q => q.subject))];

    // 2) 상단에 배치할 '내 과목' 리스트 (원하는 순서대로 적으세요!)
    const myPriority = [
        "C언어",
        "대학수학", 
        "대학영어",
        "오픈소스 기반 데이터분석",
        "클라우드컴퓨팅",
        "jsp프로그래밍"
    ];

    // 3) 정렬 로직: 내 과목은 위로, 나머지는 가나다순
    allSubjects.sort((a, b) => {
        const idxA = myPriority.indexOf(a);
        const idxB = myPriority.indexOf(b);

        // 둘 다 '내 과목'에 있으면 -> 리스트 순서대로 정렬
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        
        // a만 '내 과목'이면 -> a를 앞으로 보냄
        if (idxA !== -1) return -1;
        
        // b만 '내 과목'이면 -> b를 앞으로 보냄
        if (idxB !== -1) return 1;
        
        // 둘 다 아니면(기타 과목) -> 가나다순 정렬
        return a.localeCompare(b);
    });

    // 4) 버튼 생성
    allSubjects.forEach(sub => {
        const btn = document.createElement('button');
        btn.className = 'subject-card';
        
        // (선택사항) 내 과목은 스타일을 다르게 주고 싶다면?
        if (myPriority.includes(sub)) {
            btn.style.border = "2px solid #3498db"; // 파란 테두리 강조
            btn.style.backgroundColor = "#fdfdfd";
        }

        btn.innerText = sub;
        btn.onclick = () => startQuiz(sub);
        subjectList.appendChild(btn);
    });
}

// 3. 배열 무작위 섞기
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 4. 퀴즈 시작 (과목 선택 + 난이도 + 25문제 제한)
function startQuiz(subjectName) {
    const levelSelect = document.getElementById('level-select');
    // 요소가 없을 경우를 대비한 안전 장치
    const selectedLevel = levelSelect ? levelSelect.value : 'all';

    // 1) 필터링
    const filtered = allQuestions.filter(q => {
        const subjectMatch = (q.subject === subjectName);
        const levelMatch = (selectedLevel === 'all') || (q.level === selectedLevel);
        return subjectMatch && levelMatch;
    });
    
    // 2) 예외 처리
    if (filtered.length === 0) {
        alert(`선택하신 조건의 문제가 없습니다.`);
        return;
    }

    // 3) 섞은 뒤 25개만 자르기 (핵심 수정 부분)
    const shuffled = shuffleArray([...filtered]);
    currentQuestions = shuffled.slice(0, 25); // 최대 25문제까지만

    currentIdx = 0;
    
    // 화면 전환
    document.getElementById('home-screen').style.display = 'none';
    document.getElementById('quiz-screen').style.display = 'block';
    document.getElementById('current-subject-title').innerText = subjectName;

    showQuestion();
}

// 5. 문제 화면에 뿌리기
function showQuestion() {
    if (currentIdx >= currentQuestions.length) {
        // 결과 화면 대신 알림 (추후 점수판으로 확장 가능)
        alert("수고하셨습니다! 25문제를 모두 풀었습니다.");
        goHome();
        return;
    }

    const q = currentQuestions[currentIdx];
    
    // 진행 상황 표시
    document.getElementById('progress-text').innerText = `${currentIdx + 1} / ${currentQuestions.length}`;
    document.getElementById('question-text').innerText = q.question;

    const optionsBox = document.getElementById('options-box');
    optionsBox.innerHTML = '';

    q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt;
        // 클릭하면 정답 체크 실행
        btn.onclick = () => checkAnswer(btn, idx, q.answer, q.explanation);
        optionsBox.appendChild(btn);
    });

    // [수정] 다음 문제 버튼은 일단 숨김 (풀어야 나옴)
    const nextBtn = document.getElementById('next-btn');
    nextBtn.style.display = 'none';

    // 결과 박스 초기화
    const resultBox = document.getElementById('result-box');
    resultBox.style.display = 'none';
    resultBox.className = ''; 
}

// 6. 정답 체크 (풀이 강제 로직 추가)
function checkAnswer(clickedBtn, selectedIndex, correctIndex, explanation) {
    const resultBox = document.getElementById('result-box');
    resultBox.style.display = 'block';

    // 정답/오답 UI 처리
    if (selectedIndex === correctIndex) {
        resultBox.className = 'correct-box';
        resultBox.innerHTML = `<strong>✅ 정답입니다!</strong><br><br>${explanation}`;
        clickedBtn.classList.add('correct'); // CSS 스타일링용 클래스 (선택사항)
    } else {
        resultBox.className = 'wrong-box';
        resultBox.innerHTML = `<strong>❌ 틀렸습니다.</strong><br><br>${explanation}`;
        clickedBtn.classList.add('wrong'); // CSS 스타일링용 클래스 (선택사항)
    }

    // [수정] 중복 클릭 방지: 모든 보기 버튼 비활성화
    const allOptions = document.querySelectorAll('.option-btn');
    allOptions.forEach(btn => btn.disabled = true);

    // [수정] 이제서야 '다음 문제' 버튼을 보여줌
    document.getElementById('next-btn').style.display = 'block';
}

// 7. 다음 문제로
function nextQuestion() {
    currentIdx++;
    showQuestion();
}

// 8. 홈으로
function goHome() {
    document.getElementById('quiz-screen').style.display = 'none';
    document.getElementById('home-screen').style.display = 'block';
}