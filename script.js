let allQuestions = [];       
let currentQuestions = [];   
let currentIdx = 0;
let correctCount = 0; // [추가] 맞은 개수 저장 변수
let checkTab = 'knou';
// 1. 데이터 로드
async function getData(tabId){
    const checkDataUrl = tabId === 'knou' || !tabId ? 'data.json' : 'data2.json';
    checkTab = tabId;
    try{
        const res = await fetch(checkDataUrl);
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
    
        // 성공 시: success와 데이터를 함께 리턴
        allQuestions = data;
        renderSubjectButtons();
    } catch (error) {
        // 실패 시: success를 false로 하고 에러 메시지 포함
        console.error("API Request Error:", error);
        return { success: false, error: error.message };
    }
}

// 2. 메인화면: 과목 버튼 만들기
function renderSubjectButtons() {
    const subjectList = document.getElementById('subject-list');
    subjectList.innerHTML = ''; 

    const allSubjects = [...new Set(allQuestions.map(q => q.subject))];
    // 내 과목 우선순위 정렬
    let myPriority = [];

    if(checkTab === 'knou'){
        myPriority = ["C언어", "대학수학", "대학영어", "오픈소스 기반 데이터분석", "클라우드컴퓨팅", "jsp프로그래밍"];
    }else{
        myPriority = ["소프트웨어 설계", "소프트웨어 개발", "데이터베이스 구축", "프로그래밍 언어 활용", "정보시스템 구축 관리"];
    }

    allSubjects.sort((a, b) => {
        const idxA = myPriority.indexOf(a);
        const idxB = myPriority.indexOf(b);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.localeCompare(b);
    });

    allSubjects.forEach(sub => {
        const btn = document.createElement('button');
        btn.className = 'subject-card';
        if (myPriority.includes(sub)) {
            btn.style.border = "2px solid #3498db";
            btn.style.backgroundColor = "#fdfdfd";
        }
        btn.innerText = sub;
        btn.onclick = () => startQuiz(sub);
        subjectList.appendChild(btn);
    });

    allSubjects.forEach(sub => {
        const btn = document.createElement('button');
        btn.className = 'subject-card';
        if (myPriority.includes(sub)) {
            btn.style.border = "2px solid #3498db";
            btn.style.backgroundColor = "#fdfdfd";
        }
        btn.innerText = sub;

        btn.setAttribute('data-category', checkTab);

        btn.onclick = () => startQuiz(sub);
        subjectList.appendChild(btn);
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

// 4. 퀴즈 시작
function startQuiz(subjectName) {
    const levelSelect = document.getElementById('level-select');
    const selectedLevel = levelSelect ? levelSelect.value : 'all';

    const filtered = allQuestions.filter(q => {
        const subjectMatch = (q.subject === subjectName);
        const levelMatch = (selectedLevel === 'all') || (q.level === selectedLevel);
        return subjectMatch && levelMatch;
    });
    
    if (filtered.length === 0) {
        alert(`선택하신 조건의 문제가 없습니다.`);
        return;
    }

    const shuffled = shuffleArray([...filtered]);
    currentQuestions = shuffled.slice(0, 25); // 최대 25문제

    // [초기화] 게임 시작할 때 점수 초기화
    currentIdx = 0;
    correctCount = 0;
    
    document.getElementById('home-screen').style.display = 'none';
    document.getElementById('score-screen').style.display = 'none'; // 결과 화면 숨김
    document.getElementById('quiz-screen').style.display = 'block';
    document.getElementById('current-subject-title').innerText = subjectName;

    showQuestion();
}

// 5. 문제 화면 뿌리기
function showQuestion() {
    // [수정] 마지막 문제까지 다 풀었으면 결과 화면으로 이동
    if (currentIdx >= currentQuestions.length) {
        showScoreScreen();
        return;
    }

    const q = currentQuestions[currentIdx];
    
    document.getElementById('progress-text').innerText = `${currentIdx + 1} / ${currentQuestions.length}`;
    document.getElementById('question-text').innerText = q.question;

    const optionsBox = document.getElementById('options-box');
    optionsBox.innerHTML = '';

    q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt;
        btn.onclick = () => checkAnswer(btn, idx, q.answer, q.explanation);
        optionsBox.appendChild(btn);
    });

    document.getElementById('next-btn').style.display = 'none';
    const resultBox = document.getElementById('result-box');
    resultBox.style.display = 'none';
    resultBox.className = ''; 
}

// 6. 정답 체크
function checkAnswer(clickedBtn, selectedIndex, correctIndex, explanation) {
    const resultBox = document.getElementById('result-box');
    resultBox.style.display = 'block';

    const allButtons = document.querySelectorAll('.option-btn');
    allButtons.forEach(btn => btn.disabled = true);

    if (selectedIndex === correctIndex) {
        // [추가] 정답이면 카운트 증가
        correctCount++;
        
        clickedBtn.classList.add('correct');
        resultBox.className = 'correct-box';
        resultBox.innerHTML = `<strong>🎉 정답입니다!</strong><br><br>${explanation}`;
    } else {
        clickedBtn.classList.add('wrong');
        resultBox.className = 'wrong-box';
        const correctOptionText = currentQuestions[currentIdx].options[correctIndex];
        resultBox.innerHTML = `<strong>❌ 틀렸습니다.</strong><br>정답: ${correctOptionText}<br><br>${explanation}`;
        
        allButtons[correctIndex].classList.add('correct');
    }

    document.getElementById('next-btn').style.display = 'block';
}

// 7. 다음 문제
function nextQuestion() {
    currentIdx++;
    showQuestion();
}

// 8. [추가] 결과 화면 보여주기 (성적표)
function showScoreScreen() {
    document.getElementById('quiz-screen').style.display = 'none';
    document.getElementById('score-screen').style.display = 'flex'; // Flex로 중앙 정렬

    // 점수 계산
    const total = currentQuestions.length;
    const score = Math.round((correctCount / total) * 100);

    // 화면에 뿌리기
    document.getElementById('final-score').innerText = score;
    document.getElementById('total-count-display').innerText = total;
    document.getElementById('correct-count-display').innerText = correctCount;
    document.getElementById('wrong-count-display').innerText = total - correctCount;
}

// 9. 홈으로
function goHome() {
    document.getElementById('score-screen').style.display = 'none';
    document.getElementById('quiz-screen').style.display = 'none';
    document.getElementById('home-screen').style.display = 'block';
}