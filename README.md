# DDD Diary (Design · Do · Develop) — GitHub + Firebase 판

하루를 설계하고(Design), 실천하고(Do), 돌아보며 성장하는(Develop) 다이어리예요.
이 폴더는 Claude 아티팩트로 만든 DDD Diary를 **GitHub Pages(화면)** + **Firebase(로그인·저장)** 로 옮긴 버전이에요.

## 들어 있는 파일

| 파일 | 하는 일 |
|---|---|
| `index.html` | 다이어리 화면 전체 (기존 기능 그대로) |
| `firebase-config.js` | 내 Firebase 프로젝트 정보를 넣는 곳 (**꼭 수정**) |
| `firebase-adapter.js` | 화면 코드와 Firebase를 이어 주는 연결 코드 (수정 불필요) |
| `firestore.rules` | 데이터 보안 규칙 (Firebase 콘솔에 붙여 넣기) |
| `.nojekyll` | GitHub Pages용 빈 파일 (없어도 동작) |

---

## 1단계. Firebase 프로젝트 만들기 (약 10분)

1. https://console.firebase.google.com 에 Google 계정으로 로그인 → **프로젝트 추가**
   - 이름 예: `ddd-diary` / Google 애널리틱스는 꺼도 돼요.
2. **웹 앱 등록**: 프로젝트 개요 화면의 `</>`(웹) 아이콘 → 앱 닉네임 `ddd-diary-web` → (Firebase 호스팅은 체크하지 않음) → 등록
3. 화면에 나오는 `firebaseConfig = { apiKey: ..., ... }` 값을 복사해서 **`firebase-config.js`** 의 같은 자리에 붙여 넣으세요.
4. **로그인 켜기**: 왼쪽 메뉴 *빌드 > Authentication* → 시작하기 → *로그인 방법* 탭 → **이메일/비밀번호** → 사용 설정 → 저장
5. **데이터베이스 만들기**: *빌드 > Firestore Database* → 데이터베이스 만들기
   - 위치: `asia-northeast3 (서울)` 추천 (나중에 못 바꿔요)
   - **프로덕션 모드**로 시작
6. **보안 규칙 넣기**: Firestore의 *규칙* 탭 → 내용을 모두 지우고 `firestore.rules` 파일 내용을 붙여 넣기 → **게시**

> `firebase-config.js`의 값은 공개돼도 괜찮아요. 실제 보안은 6번의 보안 규칙이 지켜요.

## 2단계. GitHub에 올리고 주소 만들기 (약 5분)

1. https://github.com 로그인 → 오른쪽 위 `+` → **New repository**
   - 이름 예: `ddd-diary` / **Public** (무료 GitHub Pages는 공개 저장소 필요) → Create
2. 저장소 화면에서 **Add file > Upload files** → `index.html`, `firebase-config.js`, `firebase-adapter.js` (+ `firestore.rules`, `README.md`) 끌어다 놓기 → **Commit changes**
3. 저장소의 **Settings > Pages** → Source: *Deploy from a branch* → Branch: `main` / `/(root)` → Save
4. 1~2분 뒤 `https://내깃허브아이디.github.io/ddd-diary/` 주소가 생겨요.
5. **Firebase에 이 주소 허용하기**: Firebase 콘솔 *Authentication > 설정 > 승인된 도메인* → 도메인 추가 → `내깃허브아이디.github.io`

## 3단계. 나를 최고 관리자로 지정하기 (처음 한 번만)

1. 새 주소에 들어가 **회원가입** 탭에서 내 아이디·비밀번호를 만들고, 이름 등을 적어 가입해요. ("승인 전이에요" 화면이 나오면 정상이에요.)
2. Firebase 콘솔 *Authentication > 사용자* 에서 내 아이디(`아이디@ddd-diary.app`) 줄의 **사용자 UID** 를 복사해요.
3. *Firestore Database > 데이터* → **컬렉션 시작**
   - 컬렉션 ID: `admin`
   - 문서 ID: `roles`
   - 필드: `owner` / 유형 `string` / 값: 복사한 UID → 저장
4. 다이어리 화면을 새로고침하면 **관리자** 메뉴가 보여요.

## 4단계. 회원 받기

- 학생·선생님께 주소를 알려 주면, 각자 **회원가입 → 가입 신청** 해요.
- 관리자 메뉴에서 **승인** 하면 바로 쓸 수 있어요. (초대 코드로 가입하면 자동 승인)
- **중간 관리자(담당 선생님)**: 관리자 메뉴의 회원 표에서 "중간 관리자로" → 그 선생님이 **로그아웃 후 다시 로그인** 하면 "우리 반" 메뉴가 생겨요.

---

## 달라진 점 / 아직 안 되는 것

- **로그인**: 이제 Claude 계정 없이 *아이디 + 비밀번호(6자 이상)* 로 가입해요. (Firebase 안에서는 `아이디@ddd-diary.app` 형태로 저장돼요.)
- **비밀번호 변경**: 마이페이지에서 본인이 바꿔요.
- **비밀번호 분실**: 이메일이 없는 아이디 방식이라 자동 재설정이 안 돼요. 관리자가 대신 바꿔 주려면 Firebase *Cloud Functions*(유료 Blaze 요금제)가 필요해요. 그 전까지는 관리자가 Authentication에서 계정을 지우고 다시 가입하게 해야 하며, 이때 기존 기록은 새 계정으로 옮겨지지 않아요.
- **Google Drive·시트 연동**: 아직 꺼져 있어요. 사진은 압축해서 Firestore에 바로 저장돼요(장당 약 200KB). 사진이 많아지면 Firebase Storage로 옮기는 걸 추천해요.
- **PDF·CSV 내려받기**: 브라우저 다운로드로 바로 받아져요. 인쇄 → "PDF로 저장"도 그대로 돼요.

## 비용

Firebase 무료(Spark) 요금제로 시작할 수 있어요. Firestore는 하루 읽기·쓰기 횟수와 저장 용량에 무료 한도가 있어서, 한 학급 규모라면 대부분 무료 안에서 쓸 수 있어요. 정확한 한도는 Firebase 요금 페이지에서 확인하세요.

## 업데이트하는 법

코드를 고친 새 `index.html`이 생기면 GitHub 저장소에서 같은 이름으로 다시 업로드(Commit)하면 1~2분 뒤 반영돼요. 데이터는 Firebase에 있어서 그대로 남아요.

## 개인정보 주의

학생 이름·건강·가정사 같은 민감한 정보는 번호나 이니셜로 적고, 학교·교육청의 개인정보 지침을 따라 주세요.
