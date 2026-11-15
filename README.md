# DDD Diary (Design · Do · Develop) — GitHub + Firebase 판 · v2

하루를 설계하고(Design), 실천하고(Do), 돌아보며 성장하는(Develop) 다이어리예요.

## 이번 업데이트(v2)에서 바뀐 것

1. **Google 로그인**, **체험해 보기(테스트 계정)** 추가 · 카카오 로그인은 설정하면 켜져요
2. **체험 계정**: 가입 없이 다이어리를 써 볼 수 있고, 사진·회원 기능은 막혀 있어요. 관리자 메뉴에서 체험 기록을 지울 수 있어요
3. **관심사 메뉴**: 책, 영화·드라마, 여행을 기본으로 제공하고, 관심사를 직접 추가·삭제할 수 있어요
   - 책: Google 도서(또는 카카오) 검색으로 표지·기본 정보·평점 자동 입력
   - 영화·드라마: TMDB 검색으로 포스터·감독·출연·평점 자동 입력 (키 필요)
   - 여행: 지도(OpenStreetMap)에 다녀온 곳 표시, 장소 검색, 여행 일기, 사진
4. **모바일 하루 화면**: 시간표가 화면 폭에 딱 맞고, 처음에는 칠하기가 꺼져 있어 자유롭게 스크롤돼요 (카테고리를 고르면 칠하기가 켜져요)
5. **인쇄·PDF**: 모두 **A4 세로**, 책처럼 펼치면 **왼쪽·오른쪽 2쪽**이 한 주(또는 한 달)가 되는 좌철 제본용으로 바뀌었어요

---

## 업데이트 순서 (이미 v1을 쓰고 있다면)

### ① 파일 바꾸기
GitHub 저장소에서 **Add file > Upload files** → 아래 파일을 끌어다 놓고 **Commit changes**
- `index.html`
- `firebase-adapter.js`
- `firebase-config.js` (내 Firebase 값은 이미 들어 있어요. 아래 ④에서 키를 더 넣을 수 있어요)
- `firestore.rules`, `README.md` (참고용)

### ② 보안 규칙 다시 게시하기 (꼭!)
Firebase 콘솔 → **Firestore Database → 규칙** 탭 → 내용을 모두 지우고 새 `firestore.rules` 내용을 붙여 넣기 → **게시**
> 체험 계정과 관심사 기능이 이 규칙에 들어 있어서, 게시하지 않으면 새 기능이 저장되지 않아요.

### ③ 로그인 방법 켜기
Firebase 콘솔 → **보안 → Authentication → 로그인 방법** 탭 → **새 제공업체 추가**
- **Google**: 사용 설정 → 프로젝트 지원 이메일 고르기 → 저장
- **익명**: 사용 설정 → 저장 (체험해 보기 버튼용)

> Google 로그인 창이 안 뜨면, *Authentication → 설정 → 승인된 도메인*에 `내깃허브아이디.github.io`가 있는지 확인하세요.

### ④ (선택) 영화·드라마 검색 키 넣기 — TMDB
1. https://www.themoviedb.org 회원가입 → 오른쪽 위 프로필 → **설정 → API** → API 키 요청(개인·교육 용도)
2. 발급된 **API 키(v3 auth)** 를 복사해서 `firebase-config.js`의 `tmdbKey: ""` 따옴표 안에 붙여 넣고 저장 → GitHub에 다시 업로드
- 책 검색은 키 없이도 돼요(Google 도서). 카카오 REST API 키가 있으면 `kakaoRestKey`에 넣어 한국 책 검색을 먼저 쓸 수 있어요(브라우저 정책에 따라 안 되면 자동으로 Google 도서를 써요).
- 키는 GitHub에 공개돼요. 혹시 남이 쓰는 것 같으면 TMDB 설정에서 키를 다시 만들면 돼요.

### ⑤ 확인
사이트를 새로고침 → 로그인 화면에 **Google로 계속하기**, **가입 없이 체험해 보기** 버튼이 보이면 성공!

---

## 카카오 · 네이버 로그인에 대해

- **카카오**: Firebase의 *OpenID Connect* 공급자로 연결할 수 있어요. 다만 이 기능은 Firebase를 *Identity Platform*으로 업그레이드해야 하고, 보통 **종량제(Blaze) 요금제**가 필요해요.
  1. Kakao Developers에서 앱을 만들고 *카카오 로그인*과 *OpenID Connect*를 켜요
  2. Redirect URI: `https://ddd-diary.firebaseapp.com/__/auth/handler`
  3. Firebase *로그인 방법 → 새 제공업체 → OpenID Connect*: 이름 `kakao`(공급자 ID `oidc.kakao`), 클라이언트 ID = 카카오 REST API 키, 발급자 = `https://kauth.kakao.com`, 클라이언트 보안 비밀 = 카카오 Client Secret
  4. `firebase-config.js`에서 `kakaoProviderId: "oidc.kakao"` 로 바꾸면 카카오 버튼이 나와요
- **네이버**: Firebase가 직접 지원하지 않아요. 네이버 로그인을 붙이려면 *Cloud Functions*(Blaze 요금제)로 서버 코드를 만들어야 해서 이번 버전에는 넣지 않았어요.

---

## 처음부터 설치하는 경우 (v1과 같아요)

1. Firebase 프로젝트 만들기 → 웹 앱 등록 → `firebase-config.js`에 설정 값 넣기
2. Authentication → 로그인 방법: **이메일/비밀번호**, **Google**, **익명** 켜기
3. Firestore Database 만들기(서울 `asia-northeast3`, 프로덕션 모드) → 규칙 탭에 `firestore.rules` 붙여 넣고 게시
4. GitHub 공개 저장소에 파일 올리기 → Settings → Pages(main / root) → 주소 생성 → Firebase *승인된 도메인*에 `아이디.github.io` 추가
5. 사이트에서 회원가입 → Firebase *Authentication → 사용자*에서 내 UID 복사 → Firestore에 `admin`(컬렉션) / `roles`(문서) / `owner`(string) = UID 저장 → 새로고침하면 관리자 메뉴가 보여요

---

## 인쇄해서 책으로 만들기 (좌철 제본)

- 인쇄·PDF → **빈 양식(손으로 쓰기) → 연간(1년 한 권)** 을 고르면 표지가 오른쪽 1쪽, 그다음부터 왼쪽·오른쪽 펼침면 순서로 한 권이 만들어져요.
  - 표지 → Look Back | Look Forward → 연간 달력 | 월별 계획 → 실천 체크표 | 분기 계획 → 1월 월간(펼침면) → 1월 주간들(주마다 펼침면) → 2월 …
- 한 주·한 달만 뽑아 기존 책에 끼울 때는 **"제본용: 맨 앞에 빈 쪽 넣기"** 를 켜면 펼침면이 맞아요.
- 프린터 설정: **A4 세로**, **양면 인쇄(긴 가장자리 넘김)**, 여백 없음, 배경 그래픽 켜기
- 1년 한 권은 쪽수가 많아 "PDF 파일로 만들기"는 몇 분 걸려요. **인쇄 → PDF로 저장**이 훨씬 빨라요.

## 체험(테스트) 계정

- 로그인 화면의 **가입 없이 체험해 보기** → 바로 다이어리를 써 볼 수 있어요.
- 막혀 있는 것: 사진 올리기, 회원 가입 정보, 담당 선생님 연결, 관리자·승인 기능
- 관리자 메뉴 → **체험(테스트) 계정**에서 체험 기록을 하나씩 또는 한꺼번에(7일 넘게 안 쓴 것만도) 지울 수 있어요.
- 체험 계정 자체(익명 사용자)는 Firebase Authentication 목록에 남지만 기록이 없어 문제는 없어요. 필요하면 콘솔에서 지우면 돼요.

## 지도·검색 서비스 이용 안내

- 지도: OpenStreetMap 타일, 장소 검색: OpenStreetMap Nominatim (무료, 출처 표시 필요, 지나치게 많은 요청은 제한될 수 있어요)
- 영화·드라마 정보: TMDB API 사용 (TMDB가 보증하거나 인증한 서비스는 아니에요)
- 책 정보: Google 도서 API (선택: 카카오 책 검색)

## 개인정보 주의

학생 이름·건강·가정사 같은 민감한 정보는 번호나 이니셜로 적고, 학교·교육청의 개인정보 지침을 따라 주세요.
