/* global React, ReactDOM, useState, useEffect */
/* useState/useEffect are declared globally in pages.jsx */

// ── Error Boundary ────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error('[ErrorBoundary]', error, info); }
  render() {
    if (this.state.error) {
      return React.createElement('div', { style: { textAlign: 'center', padding: '64px 24px' } },
        React.createElement('div', { style: { fontSize: 52, marginBottom: 16 } }, '⚠️'),
        React.createElement('h3', { style: { fontFamily: '"Soyuz Grotesk",sans-serif', margin: '0 0 12px' } }, 'Что-то пошло не так'),
        React.createElement('p', { style: { color: 'var(--ink-soft)', margin: '0 0 24px', fontSize: 14 } }, this.state.error.message),
        React.createElement('button', { className: 'btn btn--filled', onClick: () => this.setState({ error: null }) }, 'Попробовать снова')
      );
    }
    return this.props.children;
  }
}

// ── Global error logging ──────────────────────────────────────────
window.onerror = (msg, src, line, col, err) => { console.error('[JS]', msg, src + ':' + line); };
window.onunhandledrejection = e => { console.error('[Promise]', e.reason); };

// ── Auth helpers (cookie-based, no localStorage) ──────────────────
const apiFetch = (url, opts = {}) => fetch(url, { credentials: 'include', ...opts });

function parseHash(hash) {
  if (!hash || hash.length <= 1) return null;
  const parts = hash.slice(1).split('/');
  const course = parts[0];
  const validCourses = ['main', 'oge', 'ege', 'ses'];
  if (!course || !validCourses.includes(course)) return null;
  return {
    course,
    section: parts[1] || (course === 'main' ? 'home' : 'learn'),
    lessonNum: parts[2] ? parseInt(parts[2], 10) : null,
  };
}

function buildHash(course, section, lesson) {
  if (lesson) return '#' + course + '/learn/' + lesson.idx;
  if (course === 'main' && section === 'home') return '#main';
  return '#' + course + '/' + section;
}


const COURSES = [
  { id: "main", name: "Главная", color: "yellow",
    c: "var(--tab-yellow)", d: "var(--tab-yellow-d)", soft: "#FDE7B6" },
  { id: "oge", name: "ОГЭ", color: "purple",
    c: "var(--tab-purple)", d: "var(--tab-purple-d)", soft: "#EFE0F5" },
  { id: "ege", name: "ЕГЭ", color: "blue",
    c: "var(--tab-blue)",   d: "var(--tab-blue-d)",   soft: "#DDEEF8" },
  { id: "ses", name: "Сессия", color: "green",
    c: "var(--tab-green)",  d: "var(--tab-green-d)",  soft: "#DFEEDA" },
];

const SECTIONS = [
  { id: "profile",  label: "Мой профиль",         num: "2" },
  { id: "schedule", label: "Расписание вебинаров", num: "6" },
  { id: "rating",   label: "Мой прогресс",         num: "4" },
  { id: "pay",      label: "Подписка",             num: "3" },
  { id: "exam",     label: "Об экзамене",          num: "5" },
  { id: "invite",   label: "Пригласи друга",       num: "" },
  { id: "about",    label: "О нас",                num: "" },
  { id: "help",     label: "Помощь",               num: "1" },
];

const DEFAULT_PROFILE = {
  firstName: '',
  lastName: '',
  dob: '',
  grade: '11 класс',
  studyType: 'school',
  subscription: 'none',
  invited: 0,
  photo: null,
};

function profileFromApi(d) {
  return {
    ...DEFAULT_PROFILE,
    firstName: d.firstName || '',
    lastName: d.lastName || '',
    dob: d.dob || '',
    grade: d.grade || '11 класс',
    studyType: d.studyType || 'school',
    subscription: d.subscription || 'none',
    invited: d.invitedCount || 0,
    photo: d.photoUrl || null,
  };
}

function profileToPayload(p) {
  return {
    firstName: p.firstName || '',
    lastName: p.lastName || '',
    dob: p.dob || '',
    grade: p.grade || '',
    studyType: p.studyType || 'school',
    subscription: p.subscription || 'none',
    photoUrl: p.photo || null,
  };
}

function AuthScreen({ onLogin, onClose, initialMode }) {
  const [mode, setMode] = React.useState(initialMode || 'login');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [code, setCode] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const doLogin = async () => {
    setError(''); setLoading(true);
    try {
      const r = await apiFetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await r.json();
      if (!r.ok) { if (r.status === 403 && data.detail === "Email не подтверждён") { await apiFetch("/api/auth/resend-code", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ email }) }).catch(()=>{}); setMode("verify"); setError("Код подтверждения отправлен на почту"); return; } setError(data.detail || "Ошибка входа"); return; }
      const me = await apiFetch('/api/auth/me');
      const user = await me.json();
      onLogin(user);
    } catch(e) { setError('Ошибка сети'); } finally { setLoading(false); }
  };

  const doRegister = async () => {
    setError('');
    if (password.length < 8) { setError('Пароль должен быть не менее 8 символов'); return; }
    if (!/[A-Za-z]/.test(password)) { setError('Пароль должен содержать хотя бы одну букву'); return; }
    if (!/[0-9]/.test(password)) { setError('Пароль должен содержать хотя бы одну цифру'); return; }
    if (password !== confirm) { setError('Пароли не совпадают'); return; }
    setLoading(true);
    try {
      const r = await apiFetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await r.json();
      if (!r.ok) { setError(data.detail || 'Ошибка регистрации'); return; }
      setMode('verify');
    } catch(e) { setError('Ошибка сети'); } finally { setLoading(false); }
  };

  const doVerify = async () => {
    setError(''); setLoading(true);
    try {
      const r = await apiFetch('/api/auth/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, code }) });
      const data = await r.json();
      if (!r.ok) { setError(data.detail || 'Неверный код'); return; }
      const me = await apiFetch('/api/auth/me');
      const user = await me.json();
      onLogin(user);
    } catch(e) { setError('Ошибка сети'); } finally { setLoading(false); }
  };

  const doResend = async () => {
    setError('');
    try {
      await apiFetch('/api/auth/resend-code', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
    } catch(e) {}
  };

  return (
    React.createElement('div', { className: 'auth-screen' },
      React.createElement('div', { className: 'auth-card' },
        onClose && React.createElement('button', {
          onClick: onClose,
          style: { position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#A08060', lineHeight: 1 }
        }, '×'),
        React.createElement('div', { className: 'auth-brand' }, 'с нуля', React.createElement('span', { className: 'dot' }, '.')),
        React.createElement('div', { className: 'auth-sub' }, 'онлайн-школа по химии'),
        error && React.createElement('div', { className: 'auth-error' }, error),
        mode === 'login' && React.createElement(React.Fragment, null,
          React.createElement('div', { className: 'auth-title' }, 'Вход'),
          React.createElement('input', { className: 'auth-input', type: 'email', placeholder: 'Email', value: email, onChange: e => setEmail(e.target.value) }),
          React.createElement('input', { className: 'auth-input', type: 'password', placeholder: 'Пароль', value: password, onChange: e => setPassword(e.target.value), onKeyDown: e => e.key === 'Enter' && doLogin() }),
          React.createElement('button', { className: 'auth-btn', onClick: doLogin, disabled: loading }, 'Войти'),
          React.createElement('div', { className: 'auth-links' },
            React.createElement('button', { className: 'auth-link', onClick: () => { setMode('register'); setError(''); } }, 'Зарегистрироваться'),
            React.createElement('button', { className: 'auth-link', onClick: () => { setMode('forgot'); setError(''); } }, 'Забыли пароль?')
          )
        ),
        mode === 'register' && React.createElement(React.Fragment, null,
          React.createElement('div', { className: 'auth-title' }, 'Регистрация'),
          React.createElement('input', { className: 'auth-input', type: 'email', placeholder: 'Email', value: email, onChange: e => setEmail(e.target.value) }),
          React.createElement('input', { className: 'auth-input', type: 'password', placeholder: 'Пароль', value: password, onChange: e => setPassword(e.target.value) }),
          React.createElement('div', { style: { fontSize: '12px', color: '#aaa', marginTop: '-10px', marginBottom: '8px', lineHeight: '1.4' } }, 'Минимум 8 символов, буквы и цифры'),
          React.createElement('input', { className: 'auth-input', type: 'password', placeholder: 'Повторите пароль', value: confirm, onChange: e => setConfirm(e.target.value), onKeyDown: e => e.key === 'Enter' && doRegister() }),
          React.createElement('button', { className: 'auth-btn', onClick: doRegister, disabled: loading }, 'Зарегистрироваться'),
          React.createElement('div', { className: 'auth-links' },
            React.createElement('button', { className: 'auth-link', onClick: () => { setMode('login'); setError(''); } }, 'Уже есть аккаунт? Войти')
          )
        ),
        mode === 'verify' && React.createElement(React.Fragment, null,
          React.createElement('div', { className: 'auth-title' }, 'Подтверждение email'),
          React.createElement('div', { className: 'auth-code-hint' }, 'Код отправлен на ', React.createElement('strong', null, email)),
          React.createElement('input', { className: 'auth-input code', type: 'text', placeholder: '000000', maxLength: 6, value: code, onChange: e => setCode(e.target.value), onKeyDown: e => e.key === 'Enter' && doVerify() }),
          React.createElement('button', { className: 'auth-btn', onClick: doVerify, disabled: loading }, 'Подтвердить'),
          React.createElement('div', { className: 'auth-links' },
            React.createElement('button', { className: 'auth-link', onClick: doResend }, 'Отправить снова')
          )
        ),
        mode === 'forgot' && React.createElement(React.Fragment, null,
          React.createElement('div', { className: 'auth-title' }, 'Восстановление пароля'),
          React.createElement('div', { className: 'auth-code-hint' }, 'Обратитесь к администратору для сброса пароля.'),
          React.createElement('div', { className: 'auth-links' },
            React.createElement('button', { className: 'auth-link', onClick: () => { setMode('login'); setError(''); } }, 'Вернуться к входу')
          )
        )
      )
    )
  );
}

function AuthRequired({ onLogin, accent }) {
  return (
    <div style={{textAlign:'center', padding:'64px 24px'}}>
      <div style={{fontSize:52, marginBottom:16, opacity:0.6}}>🔐</div>
      <h3 style={{fontSize:22, margin:'0 0 10px', fontFamily:'"Soyuz Grotesk",sans-serif'}}>Нужна авторизация</h3>
      <p style={{color:'var(--ink-soft)', margin:'0 0 28px', fontSize:15}}>Этот раздел доступен только зарегистрированным пользователям</p>
      <button className="btn btn--filled" onClick={onLogin}
        style={{background: accent.d, border:'none', color:'#fff', fontSize:15}}>
        Войти / Зарегистрироваться
      </button>
    </div>
  );
}

function App() {
  const [course, setCourse] = useState("main");
  const [section, setSection] = useState("home");
  const [lesson, setLesson] = useState(null);
  const [flipKey, setFlipKey] = useState(0);
  const [flipping, setFlipping] = useState(false);

  // Auth state
  const [appReady, setAppReady] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState(null);
  const [showAuth, setShowAuth] = React.useState(false);
  const [authInitMode, setAuthInitMode] = React.useState('login');

  const openLogin = () => { setAuthInitMode('login'); setShowAuth(true); };
  const openRegister = () => { setAuthInitMode('register'); setShowAuth(true); };

  // ── Profile state (backend-stored) ──────────────────────────────
  const [profile, setProfile] = React.useState(DEFAULT_PROFILE);
  const [profileReady, setProfileReady] = React.useState(false);
  const [profileSaved, setProfileSaved] = React.useState(false);
  const [profileSaving, setProfileSaving] = React.useState(false);
  const [profileSaveError, setProfileSaveError] = React.useState(false);
  const saveTimerRef = React.useRef(null);
  const savedNoticeTimerRef = React.useRef(null);
  const lastSavedProfileRef = React.useRef(null);

  const showProfileSaved = () => {
    clearTimeout(savedNoticeTimerRef.current);
    setProfileSaved(true);
    savedNoticeTimerRef.current = setTimeout(() => setProfileSaved(false), 2000);
  };

  const saveProfileNow = React.useCallback((nextProfile = profile) => {
    if (!currentUser) return Promise.resolve();
    const payload = profileToPayload(nextProfile);
    setProfileSaving(true);
    setProfileSaveError(false);
    return apiFetch('/api/profile/', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(r => {
        if (!r.ok) throw new Error('profile save failed');
        lastSavedProfileRef.current = JSON.stringify(payload);
        showProfileSaved();
        return r.json();
      })
      .catch(() => setProfileSaveError(true))
      .finally(() => setProfileSaving(false));
  }, [currentUser, profile]);

  // Load profile from API when user changes
  React.useEffect(() => {
    let cancelled = false;
    clearTimeout(saveTimerRef.current);
    setProfileSaved(false);
    setProfileSaveError(false);
    if (!currentUser) {
      setProfile(DEFAULT_PROFILE);
      setProfileReady(false);
      lastSavedProfileRef.current = null;
      return () => { cancelled = true; };
    }
    setProfileReady(false);
    apiFetch('/api/profile/')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (cancelled) return;
        const nextProfile = d ? profileFromApi(d) : DEFAULT_PROFILE;
        lastSavedProfileRef.current = JSON.stringify(profileToPayload(nextProfile));
        setProfile(nextProfile);
        setProfileReady(true);
      })
      .catch(() => { if (!cancelled) setProfileReady(true); });
    return () => { cancelled = true; };
  }, [currentUser]);

  // Auto-save profile to API with debounce (1.5s after last change)
  React.useEffect(() => {
    if (!currentUser || !profileReady) return;
    const payload = profileToPayload(profile);
    if (JSON.stringify(payload) === lastSavedProfileRef.current) return;
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => saveProfileNow(profile), 1200);
    return () => clearTimeout(saveTimerRef.current);
  }, [profile, currentUser, profileReady, saveProfileNow]);

  // ── Check auth on mount via cookie ──────────────────────────────
  React.useEffect(() => {
    apiFetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(user => { if (user) setCurrentUser(user); })
      .catch(() => {})
      .finally(() => setAppReady(true));
  }, []);

  // ── Logout ───────────────────────────────────────────────────────
  const doLogout = () => {
    apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setCurrentUser(null);
    setProfile(DEFAULT_PROFILE);
    setProfileReady(false);
    lastSavedProfileRef.current = null;
  };

  // Read hash on mount + listen for browser back/forward
  React.useEffect(() => {
    const applyHash = () => {
      const parsed = parseHash(window.location.hash);
      if (!parsed) return;
      setCourse(parsed.course);
      if (parsed.lessonNum) {
        setSection("learn");
        const c = parsed.course === "main" ? "ege" : parsed.course;
        const lessonData = LESSONS && LESSONS[c] && LESSONS[c][parsed.lessonNum];
        setLesson({ idx: parsed.lessonNum, title: lessonData ? lessonData.title : "" });
      } else {
        setSection(parsed.section);
        setLesson(null);
      }
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  // Update hash when state changes
  React.useEffect(() => {
    const hash = buildHash(course, section, lesson);
    if (window.location.hash !== hash) {
      window.history.replaceState(null, "", hash);
    }
  }, [course, section, lesson]);

  const activeCourse = COURSES.find(c => c.id === course);
  const accent = { c: activeCourse.c, d: activeCourse.d, soft: activeCourse.soft };

  // Trigger flip animation on course/section/lesson change
  useEffect(() => {
    setFlipKey(k => k + 1);
    setFlipping(true);
    const t = setTimeout(() => setFlipping(false), 800);
    return () => clearTimeout(t);
  }, [course, section, lesson]);

  const onTabClick = (cId) => {
    if (cId === course) return;
    setLesson(null);
    setCourse(cId);
    if (cId === "main") setSection("home");
    else if (section === "home") setSection("learn");
  };

  const onSectionClick = (sId) => {
    if (sId === section && !lesson) return;
    setLesson(null);
    setSection(sId);
  };

  const openLesson = (idx, title, forceCourse) => {
    if (forceCourse && forceCourse !== course) setCourse(forceCourse);
    setLesson({ idx, title });
    setTimeout(() => {
      const paper = document.querySelector(".paper");
      if (paper) paper.scrollTop = 0;
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 60);
  };

  if (!appReady) return React.createElement('div', { className: 'auth-loading' }, 'Загрузка...');

  // Render active page
  let body;
  if (lesson) {
    body = <PageLesson course={course} lessonIndex={lesson.idx} topicTitle={lesson.title} onBack={() => setLesson(null)} accent={accent} />;
  } else if (course === "main" && section === "home") {
    body = <PageHome course={course}
      setCourse={(c)=>{setCourse(c); setSection("learn"); setLesson(null);}}
      setSection={(s)=>{setSection(s); setLesson(null);}} accent={accent} />;
  } else if (section === "profile") {
    body = currentUser
      ? <PageProfile
          profile={profile}
          setProfile={setProfile}
          course={course}
          accent={accent}
          onLogout={doLogout}
          onSave={() => saveProfileNow(profile)}
          ready={profileReady}
          saving={profileSaving}
          saved={profileSaved}
          saveError={profileSaveError}
        />
      : <AuthRequired onLogin={openLogin} accent={accent} />;
  } else if (section === "schedule") {
    body = <PageSchedule course={course} accent={accent} openLesson={openLesson} />;
  } else if (section === "rating") {
    body = <PageRating course={course === "main" ? "ege" : course} accent={accent} />;
  } else if (section === "learn") {
    body = <PageLearn
      course={course === "main" ? "ege" : course}
      accent={accent}
      openLesson={openLesson} />;
  } else if (section === "pay") {
    body = <PagePay profile={profile} setProfile={setProfile} accent={accent} currentUser={currentUser} onLoginRequired={openLogin} />;
  } else if (section === "exam") {
    body = <PageExam accent={accent} />;
  } else if (section === "invite") {
    body = currentUser
      ? <PageInvite profile={profile} setProfile={setProfile} accent={accent} />
      : <AuthRequired onLogin={openLogin} accent={accent} />;
  } else if (section === "about") {
    body = <PageAbout accent={accent} />;
  } else if (section === "help") {
    body = <PageHelp accent={accent} />;
  }

  const isHomeScreen = course === "main" && section === "home" && !lesson;

  return (
    <div className="app">
      {/* Auth modal overlay */}
      {showAuth && !currentUser && (
        <div className="auth-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowAuth(false); }}>
          <AuthScreen
            initialMode={authInitMode}
            onClose={() => setShowAuth(false)}
            onLogin={user => { setCurrentUser(user); setShowAuth(false); }}
          />
        </div>
      )}

      <div className="brand-row">
        <div className="brand">
          с нуля<span className="dot">.</span>{" "}
          <span style={{opacity:0.5, fontWeight:500, fontSize:14, letterSpacing:"0.15em", textTransform:"uppercase", marginLeft:8}}>
            онлайн-школа по химии
          </span>
        </div>
        {currentUser ? (
          <div className="brand-meta">
            {profile.firstName ? profile.firstName + ' ' + profile.lastName : currentUser.email} ·{" "}
            {profile.subscription === "none" && "без подписки"}
            {profile.subscription === "light" && "Light"}
            {profile.subscription === "pro" && "PRO"}
            {" · "}
            {profileSaved && <span style={{fontSize:11,color:'var(--tab-green-d)',marginRight:6}}>✓ сохранено</span>}
            <button className="logout-btn" onClick={doLogout}>Выйти</button>
          </div>
        ) : (
          <div className="guest-auth-row">
            <button className="guest-btn-login" onClick={openLogin}>Войти</button>
            <button className="guest-btn-register" onClick={openRegister}>Регистрация</button>
          </div>
        )}
      </div>

      <div className="folder" data-screen-label={`Course: ${activeCourse.name}`}>
        <div className="tabs">
          {COURSES.map(c => (
            <button
              key={c.id}
              className={`tab tab--${c.color} ${course === c.id ? "active" : ""}`}
              onClick={() => onTabClick(c.id)}
            >{c.name}</button>
          ))}
        </div>

        <div className={`folder-body ${isHomeScreen ? "folder-body--home" : ""} ${flipping ? "flipping" : ""}`}
             style={{"--accent": accent.c, "--accent-d": accent.d}}>
          {!isHomeScreen && (
            <nav className="index">
              <IndexItem
                num=""
                label="Главная"
                active={course === "main" && section === "home" && !lesson}
                onClick={() => { setCourse("main"); setSection("home"); setLesson(null); }}
              />
              {SECTIONS.map(s => (
                <IndexItem
                  key={s.id}
                  num={s.num}
                  label={s.label}
                  active={section === s.id && !lesson}
                  onClick={() => onSectionClick(s.id)}
                />
              ))}
              <div className="index-foot">
                стр. 1/3 · 15л<br/>
                <span style={{fontSize: 14}}>с нуля. ©2026</span>
              </div>
            </nav>
          )}

          <main className="paper" key={flipKey}>
            <ErrorBoundary>
            {body}
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </div>
  );
}

function IndexItem({ num, label, active, onClick }) {
  return (
    <button className={`index-item ${active ? "active" : ""}`} onClick={onClick}>
      <span style={{flex: 1}}>{label}</span>
      <span className="num">{num}</span>
    </button>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
