// DDD Diary - Firebase 설정 파일
// Firebase 콘솔 > 프로젝트 설정 > 내 앱(웹)에서 보이는 firebaseConfig 값을 그대로 붙여 넣으세요.
// 이 값들은 공개되어도 괜찮은 값이에요. 실제 보안은 Firestore 보안 규칙(firestore.rules)이 지켜 줘요.
window.DDD_FIREBASE_CONFIG = {
  apiKey: "AIzaSyCYp7V63CK3vbJzbtLhQrtdklvKS3Ei0X0",
  authDomain: "ddd-diary.firebaseapp.com",
  projectId: "ddd-diary",
  storageBucket: "ddd-diary.firebasestorage.app",
  messagingSenderId: "604060347360",
  appId: "1:604060347360:web:febab445058cffb8acd985"
};
// 로그인 아이디를 Firebase 계정으로 바꿀 때 붙이는 가짜 도메인이에요. 한 번 정하면 바꾸지 마세요.
window.DDD_ID_DOMAIN = "ddd-diary.app";

// 로그인 방식 켜고 끄기 (Firebase 콘솔 Authentication > 로그인 방법에서도 같은 방식을 켜야 해요)
window.DDD_LOGIN = {
  google: true,          // Google 로그인
  kakaoProviderId: "",   // 카카오: Firebase에 OpenID Connect 공급자를 만든 뒤 그 ID(예: "oidc.kakao")를 적으면 버튼이 나와요
  demo: true             // "체험해 보기"(익명 로그인) 버튼
};

// 관심사(책·영화) 정보 검색용 키 (비워 두면 해당 검색만 꺼져요)
window.DDD_API = {
  tmdbKey: "a377ae92d0900f516b8f8fe2443aaa49",           // 영화·드라마: themoviedb.org에서 무료로 받은 API 키(v3 auth)
  googleBooksKey: "AIzaSyCfZGDOdqurCGd0yKwJIyT8CbInwOvJzBQ",    // 책: 비워 둬도 검색돼요. 사용량이 많아지면 Google Cloud에서 받은 키를 넣으세요
  kakaoRestKey: "",      // 책(선택): 카카오 REST API 키. 넣으면 카카오 책 검색을 먼저 써요
  googleMapsKey: ""      // 여행 지도(선택): Google Maps JavaScript API 키. 비워 두면 OpenStreetMap 지도를 써요
};