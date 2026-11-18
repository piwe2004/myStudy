# myStudy

혼자 시험공부용 CS 문제은행 (방통대 CS / 정보처리기사)

## 문제 추가

1. `data/<탭>/<과목>.json` 파일에 문제를 추가합니다.
   ```json
   { "id": 1, "subject": "자료구조", "question": "...", "options": ["...", "...", "...", "..."], "answer": 0, "explanation": "..." }
   ```
   `answer`는 0부터 시작하는 보기 번호입니다. 보기는 화면에서 랜덤으로 섞입니다.
2. 새 과목이면 `data/index.json`에 `{ "subject", "file", "count" }`를 추가합니다.
