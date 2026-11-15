/* DDD Diary - Firebase 연결 어댑터
   Claude 아티팩트에서 쓰던 저장소(window.claude.use)와 같은 모양의 함수를 Firebase로 만들어 줘요.
   그래서 index.html의 화면 코드는 거의 그대로 쓸 수 있어요. */
(function(){
  "use strict";
  var V = "10.12.2"; // Firebase JS SDK 버전 (고정)
  window.DDD_FB = true;
  document.documentElement.classList.add("fb");
  var CFG = window.DDD_FIREBASE_CONFIG || {};
  var DOMAIN = window.DDD_ID_DOMAIN || "ddd-diary.app";
  var fb = null;

  var ready = (async function(){
    if(!CFG.apiKey || /여기에/.test(CFG.apiKey)) throw new Error("firebase-config.js에 Firebase 설정 값을 넣어 주세요.");
    var base = "https://www.gstatic.com/firebasejs/" + V + "/";
    var mods = await Promise.all([import(base+"firebase-app.js"), import(base+"firebase-auth.js"), import(base+"firebase-firestore.js")]);
    var A = mods[1], F = mods[2];
    var app = mods[0].initializeApp(CFG);
    var auth = A.getAuth(app);
    var db = F.getFirestore(app);
    try{ await A.getRedirectResult(auth); }catch(e){ window.DDD_REDIRECT_ERROR = e; }
    await new Promise(function(res){ var un = A.onAuthStateChanged(auth, function(){ un(); res(); }); });
    fb = {app:app, auth:auth, db:db, A:A, F:F};
    return fb;
  })();

  var CODES = {"permission-denied":"permission_denied","unavailable":"unavailable","resource-exhausted":"quota_exceeded","invalid-argument":"invalid_argument","not-found":"not_found","failed-precondition":"failed_precondition"};
  function err(e){ var x = new Error(e && e.message || "error"); x.code = CODES[e && e.code] || (e && e.code) || "error"; return x; }
  function wrapDoc(s){ return {id:s.id, exists:s.exists(), data:function(){ return s.data(); }, metadata:{fromCache:s.metadata.fromCache, hasPendingWrites:s.metadata.hasPendingWrites}}; }
  function wrapQuery(q){ var docs = q.docs.map(wrapDoc); return {docs:docs, size:q.size, empty:q.empty, metadata:{fromCache:q.metadata.fromCache}, docChanges:function(){ return q.docChanges(); }}; }
  function docApi(path){
    var F = fb.F, ref = F.doc(fb.db, path);
    return {
      set:function(d){ return F.setDoc(ref, d).catch(function(e){ throw err(e); }); },
      update:function(d){ return F.updateDoc(ref, d).catch(function(e){ throw err(e); }); },
      "delete":function(){ return F.deleteDoc(ref).catch(function(e){ throw err(e); }); },
      get:function(){ return F.getDoc(ref).then(wrapDoc).catch(function(e){ throw err(e); }); },
      onSnapshot:function(cb, onErr){ return F.onSnapshot(ref, function(s){ cb(wrapDoc(s)); }, function(e){ console.warn("[DDD] "+path, e); onErr && onErr(err(e)); }); },
      collection:function(n){ return colApi(path + "/" + n); }
    };
  }
  function colApi(path){
    var F = fb.F, ref = F.collection(fb.db, path);
    return {
      doc:function(id){ return docApi(path + "/" + id); },
      get:function(){ return F.getDocs(ref).then(wrapQuery).catch(function(e){ throw err(e); }); },
      onSnapshot:function(cb, onErr){ return F.onSnapshot(ref, function(q){ cb(wrapQuery(q)); }, function(e){ console.warn("[DDD] "+path, e); onErr && onErr(err(e)); }); }
    };
  }
  var dbApi = {doc:docApi, collection:colApi};

  var roleCache = null;
  async function roles(){
    if(roleCache) return roleCache;
    var u = fb.auth.currentUser; if(!u) return {owner:false, manager:false};
    var owner = false, manager = false;
    try{ var r = await fb.F.getDoc(fb.F.doc(fb.db, "admin/roles")); owner = r.exists() && r.data().owner === u.uid; }catch(e){}
    try{ var c = await fb.F.getDoc(fb.F.doc(fb.db, "admin/config")); manager = c.exists() && Array.isArray(c.data().managerIds) && c.data().managerIds.indexOf(u.uid) >= 0; }catch(e){}
    roleCache = {owner:owner, manager:manager};
    return roleCache;
  }
  var userApi = {
    id: async function(){ return fb.auth.currentUser ? fb.auth.currentUser.uid : null; },
    isOwner: async function(){ return (await roles()).owner; },
    canEdit: async function(){ var r = await roles(); return r.owner || r.manager; },
    me: async function(){
      var u = fb.auth.currentUser; if(!u) return null;
      var pd = (u.providerData && u.providerData[0]) || null; var prov = u.isAnonymous ? "anonymous" : (pd ? pd.providerId : "password");
      var mail = u.email || (pd && pd.email) || "";
      var lid = u.isAnonymous ? "guest" : (prov === "password" ? mail.split("@")[0] : (mail || (pd && pd.uid) || u.uid));
      return {id:u.uid, name:u.displayName || (pd && pd.displayName) || null, email:null, loginId:lid, provider:prov, anonymous:!!u.isAnonymous};
    },
    profiles: async function(){ return {}; }
  };
  var downloads = {
    save: async function(o){
      var blob = o.data instanceof Blob ? o.data : new Blob([o.data]);
      var url = URL.createObjectURL(blob); var a = document.createElement("a");
      a.href = url; a.download = o.filename || "download"; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function(){ URL.revokeObjectURL(url); }, 5000);
      return "saved";
    }
  };

  window.claude = {
    use: async function(name){
      try{ await ready; }catch(e){ console.error("[DDD] Firebase 초기화 실패:", e); window.DDD_INIT_ERROR = e.message; return null; }
      if(name === "db") return dbApi;
      if(name === "user") return userApi;
      if(name === "downloads") return downloads;
      return null; // Google Drive(mcp) 등은 아직 연결하지 않았어요.
    }
  };

  var email = function(id){ return String(id).trim().toLowerCase() + "@" + DOMAIN; };
  window.DDD_AUTH = {
    ready: ready,
    signIn: async function(id, pw){ await ready; return fb.A.signInWithEmailAndPassword(fb.auth, email(id), pw); },
    signUp: async function(id, pw){ await ready; return fb.A.createUserWithEmailAndPassword(fb.auth, email(id), pw); },
    signOut: async function(){ await ready; return fb.A.signOut(fb.auth); },
    signInGoogle: async function(){ await ready; var p = new fb.A.GoogleAuthProvider(); p.setCustomParameters({prompt:"select_account"});
      try{ return await fb.A.signInWithPopup(fb.auth, p); }catch(e){ if(/popup-blocked|operation-not-supported-in-this-environment/.test(e.code||"")) return fb.A.signInWithRedirect(fb.auth, p); throw e; } },
    signInOidc: async function(providerId){ await ready; var p = new fb.A.OAuthProvider(providerId); p.addScope("openid");
      try{ return await fb.A.signInWithPopup(fb.auth, p); }catch(e){ if(/popup-blocked/.test(e.code||"")) return fb.A.signInWithRedirect(fb.auth, p); throw e; } },
    signInDemo: async function(){ await ready; return fb.A.signInAnonymously(fb.auth); },
    changePassword: async function(oldPw, newPw){ await ready; var u = fb.auth.currentUser; var cred = fb.A.EmailAuthProvider.credential(u.email, oldPw); await fb.A.reauthenticateWithCredential(u, cred); await fb.A.updatePassword(u, newPw); },
    deleteAccount: async function(){ await ready; var u = fb.auth.currentUser; if(u) await fb.A.deleteUser(u); },
    message: function(e){
      var c = e && e.code || "";
      if(/invalid-credential|wrong-password|user-not-found|invalid-email/.test(c)) return "아이디나 비밀번호가 맞지 않아요.";
      if(/email-already-in-use/.test(c)) return "이미 쓰고 있는 아이디예요. 다른 아이디를 골라 주세요.";
      if(/weak-password/.test(c)) return "비밀번호는 6자 이상으로 정해 주세요.";
      if(/too-many-requests/.test(c)) return "너무 많이 시도했어요. 잠시 뒤 다시 해 주세요.";
      if(/network/.test(c)) return "인터넷 연결을 확인해 주세요.";
      if(/requires-recent-login/.test(c)) return "보안을 위해 로그아웃 후 다시 로그인한 다음 시도해 주세요.";
      if(/popup-closed-by-user|cancelled-popup-request/.test(c)) return "로그인 창이 닫혔어요. 다시 시도해 주세요.";
      if(/operation-not-allowed|admin-restricted-operation/.test(c)) return "이 로그인 방식이 아직 켜져 있지 않아요. 관리자가 Firebase 콘솔에서 켜야 해요.";
      if(/unauthorized-domain/.test(c)) return "이 주소가 Firebase의 승인된 도메인에 없어요. 관리자에게 알려 주세요.";
      if(/account-exists-with-different-credential/.test(c)) return "같은 이메일로 다른 방식의 계정이 이미 있어요. 처음 가입한 방식으로 로그인해 주세요.";
      return "처리하지 못했어요. 잠시 뒤 다시 시도해 주세요. (" + c + ")";
    }
  };
})();
