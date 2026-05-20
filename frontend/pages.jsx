/* global React */
const { useState, useEffect, useRef } = React;

// ============ ПЕРЕКЛЮЧАТЕЛЬ ТЕМ ============
function ThemeSwitcher({ theme, setTheme }) {
  const fonts = [
    { id: 'inter',   label: 'Inter',     stack: "'Inter', sans-serif" },
    { id: 'nunito',  label: 'Nunito',    stack: "'Nunito', sans-serif" },
    { id: 'raleway', label: 'Raleway',   stack: "'Raleway', sans-serif" },
    { id: 'ibmplex', label: 'IBM Plex',  stack: "'IBM Plex Sans', sans-serif" },
  ];
  const bgs = [
    { id: 'ivory',     label: 'Слоновая кость', color: '#F5F0E8' },
    { id: 'milk',      label: 'Молочный',        color: '#F0EDE6' },
    { id: 'linen',     label: 'Лён',             color: '#FAF0E6' },
    { id: 'cream',     label: 'Крем',            color: '#FCECCF' },
    { id: 'parchment', label: 'Пергамент',       color: '#EDE4D0' },
  ];
  return (
    <div className="theme-switcher">
      <div className="ts-section-label">Шрифт</div>
      <div className="ts-row">
        {fonts.map(f => (
          <button key={f.id}
            className={`ts-font-btn${theme.font === f.id ? ' ts-font-btn--on' : ''}`}
            style={{fontFamily: f.stack}}
            onClick={() => setTheme({...theme, font: f.id})}>
            {f.label}
          </button>
        ))}
      </div>
      <div className="ts-section-label" style={{marginTop: 14}}>Фон</div>
      <div className="ts-row">
        {bgs.map(b => (
          <button key={b.id}
            className={`ts-bg-swatch${theme.bg === b.id ? ' ts-bg-swatch--on' : ''}`}
            style={{background: b.color}}
            onClick={() => setTheme({...theme, bg: b.id})}
            title={b.label}>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============ ГЛАВНАЯ ============
function PageHome({ course, setCourse, setSection, accent, theme, setTheme }) {
  return (
    <div className="home-page">
      <div className="home-hero">
        <div className="home-flask" aria-hidden="true">
          {window.MoleculeScene && React.createElement(window.MoleculeScene)}
        </div>
        <h2 className="home-greeting">Привет!</h2>
        <p className="home-desc">
          Это онлайн-школа по химии «С&nbsp;нуля».<br/>
          Выбирай сверху, что сдаёшь, и начинай<br/>
          подготовку к экзамену.
        </p>
        <div className="cta-row" style={{justifyContent:'center', columnGap: '40px', rowGap: '14px'}}>
          <button className="btn btn--filled" onClick={() => setSection("learn")}>Начать обучение</button>
          <button className="btn" onClick={() => setSection("schedule")}>Расписание вебинаров</button>
        </div>
      </div>

      {theme && setTheme && (
        <ThemeSwitcher theme={theme} setTheme={setTheme} />
      )}
    </div>
  );
}

function CoursePick({ code, name, desc, color, onPick }) {
  const colors = {
    purple: { c: "var(--tab-purple)", d: "var(--tab-purple-d)" },
    blue:   { c: "var(--tab-blue)",   d: "var(--tab-blue-d)"   },
    green:  { c: "var(--tab-green)",  d: "var(--tab-green-d)"  },
  }[color];
  return (
    <div className="cp" style={{"--c": colors.c, "--cd": colors.d}} onClick={onPick}>
      <div className="cp-tab" />
      <h3>{name}</h3>
      <p>{desc}</p>
    </div>
  );
}

// ============ МОЙ ПРОФИЛЬ ============
function PageProfile({ profile, setProfile, course, accent, onLogout }) {
  const fileRef = useRef(null);
  const onFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setProfile({ ...profile, photo: r.result });
    r.readAsDataURL(f);
  };
  const studyType = profile.studyType || (course === "ses" ? "student" : "school");
  const classOptions = studyType === "student"
    ? ["1 курс", "2 курс", "3 курс", "4 курс", "5 курс", "6 курс"]
    : ["5 класс", "6 класс", "7 класс", "8 класс", "9 класс", "10 класс", "11 класс"];

  const handleDob = (e) => {
    let v = e.target.value.replace(/[^0-9]/g, "");
    if (v.length > 2) v = v.slice(0,2) + "." + v.slice(2);
    if (v.length > 5) v = v.slice(0,5) + "." + v.slice(5);
    if (v.length > 10) v = v.slice(0,10);
    setProfile({...profile, dob: v});
  };

  return (
    <div>
      <PageHeader title="Мой профиль" sub="Личная карточка ученика" accent={accent} />
      <div className="profile-grid">
        <div>
          <label className="photo-slot" onClick={() => fileRef.current && fileRef.current.click()}>
            {profile.photo ? (
              <>
                <img src={profile.photo} alt="" />
                <div className="change-overlay">Сменить фото</div>
              </>
            ) : (
              <>
                <span className="ph-label">фото</span>
                <span className="ph-hint">по желанию</span>
              </>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={onFile} />
          </label>
          <div style={{textAlign: "center", marginTop: 14, fontSize: 15, color: "var(--ink-soft)"}}>
            нажми, чтобы загрузить
          </div>
        </div>

        <div className="stack">
          <div className="field-row">
            <div className="field">
              <span className="field-label">Имя</span>
              <input className="field-value" placeholder="Введите имя" value={profile.firstName || ""} onChange={e => setProfile({...profile, firstName: e.target.value})} />
            </div>
            <div className="field">
              <span className="field-label">Фамилия</span>
              <input className="field-value" placeholder="Введите фамилию" value={profile.lastName || ""} onChange={e => setProfile({...profile, lastName: e.target.value})} />
            </div>
          </div>

          <div className="field">
            <span className="field-label">Дата рождения</span>
            <input className="field-value" placeholder="дд.мм.гггг" maxLength={10} inputMode="numeric"
              value={profile.dob || ""} onChange={handleDob} />
          </div>

          <div className="field-row">
            <div className="field" style={{flexDirection: "column", alignItems: "flex-start", gap: 8, paddingTop: 4}}>
              <span className="field-label">Тип обучения</span>
              <div className="seg">
                <button className={studyType === "school" ? "on" : ""}
                  onClick={() => setProfile({...profile, studyType: "school", grade: ""})}>Школьник</button>
                <button className={studyType === "student" ? "on" : ""}
                  onClick={() => setProfile({...profile, studyType: "student", grade: ""})}>Студент</button>
              </div>
            </div>
            <div className="field" style={{flexDirection: "column", alignItems: "flex-start", gap: 8, paddingTop: 4}}>
              <span className="field-label">{studyType === "student" ? "Курс" : "Класс"}</span>
              <div style={{display: "flex", flexWrap: "wrap", gap: 6}}>
                {classOptions.map(o => (
                  <button key={o}
                    onClick={() => setProfile({...profile, grade: o})}
                    style={{
                      padding: "5px 16px",
                      minWidth: "4.5em",
                      textAlign: "center",
                      border: "1.5px solid var(--ink)",
                      borderRadius: 999,
                      background: profile.grade === o ? "var(--ink)" : "var(--paper)",
                      color: profile.grade === o ? "var(--bg)" : "var(--ink)",
                      fontFamily: "Soyuz Grotesk, sans-serif",
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: "pointer",
                    }}>{o}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="field">
            <span className="field-label">Подписка</span>
            <span className="field-value" style={{display: "flex", alignItems: "center", gap: 12}}>
              {profile.subscription === "none" && <span className="chip chip--err">не оплачена</span>}
              {profile.subscription === "light" && <span className="chip chip--warn">Light · до 14.06.2026</span>}
              {profile.subscription === "pro" && <span className="chip chip--ok">PRO · до 14.06.2026</span>}
            </span>
          </div>

          <div className="field">
            <span className="field-label">Приглашено друзей</span>
            <span className="field-value" style={{display: "flex", alignItems: "center", gap: 10}}>
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                minWidth: 36, height: 36, padding: "0 12px",
                border: "2px solid var(--ink)", borderRadius: 8,
                fontFamily: "Soyuz Grotesk, sans-serif", fontWeight: 800, fontSize: 20
              }}>{profile.invited}</span>
              <span style={{fontSize: 16, color: "var(--ink-soft)"}}>друзей</span>
            </span>
          </div>

          <div className="row" style={{marginTop: 14}}>
            <button className="btn btn--filled" style={{opacity:0.6,cursor:'default'}} title="Изменения сохраняются автоматически">Автосохранение ✓</button>
            <button className="btn btn--ghost" onClick={onLogout}>Выйти из аккаунта</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ РАСПИСАНИЕ ВЕБИНАРОВ ============
function PageSchedule({ course, accent, openLesson }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const defaultFilter = course === "main" ? "oge" : course;
  const [filter, setFilter] = useState(defaultFilter);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setFilter(course === "main" ? "oge" : course);
  }, [course]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/schedule")
      .then(r => r.ok ? r.json() : [])
      .then(data => { if (!cancelled) setEvents(Array.isArray(data) ? data : []); })
      .catch(() => { if (!cancelled) setEvents([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const visibleEvents = events.filter(ev => ev.course === filter);
  const days = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];
  const hours = [];
  for (let h = 7; h <= 21; h++) hours.push(h);
  const ROW_H = 44;
  const HOUR_START = 7;
  const COURSES = [
    { id: "oge", label: "ОГЭ", swatch: "ev--oge" },
    { id: "ege", label: "ЕГЭ", swatch: "ev--ege" },
    { id: "ses", label: "Сессия", swatch: "ev--ses" },
  ];

  const baseStart = new Date(2026, 4, 4);
  const ws = new Date(baseStart); ws.setDate(ws.getDate() + weekOffset * 7);
  const we = new Date(ws); we.setDate(we.getDate() + 6);
  const fmt = (d) => `${d.getDate()} ${["янв","фев","мар","апр","мая","июн","июл","авг","сен","окт","ноя","дек"][d.getMonth()]}`;

  return (
    <div>
      <PageHeader title="Расписание вебинаров" sub="Неделя занятий" accent={accent} />

      <div className="sched-nav">
        <button onClick={() => setWeekOffset(weekOffset - 1)} aria-label="Назад">←</button>
        <span>{fmt(ws)} — {fmt(we)}</span>
        <button onClick={() => setWeekOffset(weekOffset + 1)} aria-label="Вперёд">→</button>
      </div>

      <div className="schedule">
        <div className="sched-grid sched-grid--head">
          <div></div>
          {days.map(d => <div key={d}>{d}</div>)}
        </div>
        <div className="sched-rows" style={{gridAutoRows: `${ROW_H}px`}}>
          {hours.map(h => (
            <React.Fragment key={h}>
              <div className="row-time">{String(h).padStart(2,"0")}:00</div>
              {days.map((_, di) => <div key={di} className="row-cell"></div>)}
            </React.Fragment>
          ))}

          {visibleEvents.map((ev) => {
            const start = timeToHours(ev.start_time);
            const end = timeToHours(ev.end_time);
            const top = (start - HOUR_START) * ROW_H;
            const height = Math.max((end - start) * ROW_H - 6, 36);
            const colWidth = `calc((100% - 60px) / 7)`;
            const left = `calc(60px + ${ev.weekday} * ${colWidth} + 4px)`;
            const width = `calc(${colWidth} - 8px)`;
            return (
              <button key={ev.id}
                type="button"
                className={`sched-event ev--${ev.course}`}
                style={{ top: top + 4, height, left, width }}
                title={`${ev.title} — открыть урок`}
                onClick={() => openLesson && openLesson(ev.lesson_idx, ev.topic, ev.course)}>
                <div className="ev-time">{ev.start_time}–{ev.end_time}</div>
                <div className="ev-title">{ev.title}</div>
                <div className="ev-topic">«{ev.topic}»</div>
              </button>
            );
          })}

          {!loading && visibleEvents.length === 0 && (
            <div className="schedule-empty">В этом разделе расписание пока не добавлено</div>
          )}
        </div>
      </div>

      <div className="schedule-filter-row" aria-label="Фильтр расписания">
        {COURSES.map(c => (
          <Legend
            key={c.id}
            swatch={c.swatch}
            label={c.label}
            active={filter === c.id}
            onClick={() => setFilter(c.id)}
          />
        ))}
        <span className="muted" style={{fontSize: 13}}>Нажмите на раздел, чтобы оставить только его занятия</span>
      </div>
    </div>
  );
}

function timeToHours(value) {
  const [h, m] = String(value || "00:00").split(":").map(n => parseInt(n, 10) || 0);
  return h + m / 60;
}

function Legend({ swatch, label, active, onClick }) {
  return (
    <button type="button" className={`schedule-filter ${active ? "active" : ""}`} onClick={onClick}>
      <span className={`schedule-dot ${swatch}`}></span>
      {label}
    </button>
  );
}

// ============ МОЙ ПРОГРЕСС ============
function PageRating({ course, accent }) {
  const [progress, setProgress] = React.useState(null);

  React.useEffect(() => {
    fetch("/api/my-progress?course=" + course, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(setProgress)
      .catch(() => setProgress(null));
  }, [course]);

  const p = progress || {
    viewed_lessons: 0,
    completed_homework: 0,
    completed_tests: 0,
    avg_test_pct: 0,
    best_test_pct: 0,
    recent_tests: [],
  };

  return (
    <div>
      <PageHeader title="Мой прогресс" sub={`Личная статистика · ${course.toUpperCase()}`} accent={accent} />

      <div className="cards-row">
        <KPI num={p.viewed_lessons} label="Просмотрено уроков" tinted accent={accent} />
        <KPI num={p.completed_homework} label="Сделано ДЗ" accent={accent} />
        <KPI num={p.completed_tests} label="Пройдено тестов" accent={accent} />
      </div>

      <div className="cards-row">
        <KPI num={`${p.avg_test_pct || 0}%`} label="Средний результат тестов" accent={accent} />
        <KPI num={`${p.best_test_pct || 0}%`} label="Лучший результат" accent={accent} />
        <KPI num={p.recent_tests.length} label="Последние попытки" accent={accent} />
      </div>

      <div className="progress-panel">
        <div className="progress-panel-title">История тестов</div>
        {p.recent_tests.length ? (
          <div className="rating-list">
            {p.recent_tests.map((t, i) => (
              <div key={t.id || i} className="rrow me">
                <div className="place">#{i + 1}</div>
                <div className="nm">
                  Тест #{t.quiz_id}
                  <span className="meta">{t.created_at ? new Date(t.created_at).toLocaleDateString("ru-RU") : "дата не указана"}</span>
                </div>
                <div className="pts">{t.score}/{t.total}</div>
                <div className="lvl">{t.pct}%</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="learn-empty">Здесь появятся результаты пройденных тестов</div>
        )}
      </div>

      <div className="muted" style={{marginTop: 18, fontSize: 15, textAlign: "center"}}>
        Статистика видна только по текущему аккаунту.
      </div>
    </div>
  );
}
function KPI({ num, label, tinted, accent }) {
  return (
    <div className={`kpi-card ${tinted ? "tinted" : ""}`}
         style={tinted ? {"--accent-soft": accent.soft} : null}>
      <div className="kpi-num">{num}</div>
      <div className="kpi-label">{label}</div>
    </div>
  );
}

// ============ ОБУЧЕНИЕ ============

const VIDEO_QUALITY_OPTIONS = [
  { id: "auto", label: "авто" },
  { id: "720p", label: "720p" },
  { id: "480p", label: "480p" },
  { id: "source", label: "исходное" },
];

function videoQualitySrc(src, quality) {
  if (!src || quality === "source" || quality === "auto") return src;
  const dot = src.lastIndexOf(".");
  if (dot < 0) return src + "_" + quality + ".mp4";
  return src.slice(0, dot) + "_" + quality + ".mp4";
}

function videoHlsSrc(src, quality) {
  if (!src || quality === "source") return null;
  const dot = src.lastIndexOf(".");
  const root = dot < 0 ? src : src.slice(0, dot);
  if (quality === "auto") return root + "_hls/master.m3u8";
  return root + "_hls/" + quality + ".m3u8";
}

function VideoPlayerInline({ src: videoSrc, poster, accent }) {
  const videoRef = React.useRef(null);
  const progressRef = React.useRef(null);
  const wrapRef = React.useRef(null);
  const pendingTimeRef = React.useRef(null);
  const pendingPlayRef = React.useRef(false);

  const [playing, setPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [volume, setVolume] = React.useState(1);
  const [muted, setMuted] = React.useState(false);
  const [fullscreen, setFullscreen] = React.useState(false);
  const [quality, setQuality] = React.useState("auto");
  const [qualityOpen, setQualityOpen] = React.useState(false);

  const ac  = accent ? accent.c : "var(--tab-yellow)";
  const acd = accent ? accent.d : "var(--tab-yellow-d)";
  const activeSrc = videoQualitySrc(videoSrc, quality);
  const activeHlsSrc = videoHlsSrc(videoSrc, quality);
  const pct = duration ? (currentTime / duration) * 100 : 0;
  const fmt = s => (!s || isNaN(s)) ? "0:00"
    : Math.floor(s / 60) + ":" + Math.floor(s % 60).toString().padStart(2, "0");

  const togglePlay = () => {
    const v = videoRef.current; if (!v) return;
    if (v.paused) v.play().catch(() => {}); else v.pause();
  };

  const seek = e => {
    const bar = progressRef.current; const v = videoRef.current;
    if (!bar || !v || !duration) return;
    const r = bar.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    v.currentTime = Math.max(0, Math.min(1, (clientX - r.left) / r.width)) * duration;
    e.stopPropagation();
  };

  const changeVol = e => {
    const val = parseFloat(e.target.value);
    setVolume(val); setMuted(val === 0);
    if (videoRef.current) videoRef.current.volume = val;
    e.stopPropagation();
  };

  const toggleMute = e => {
    const v = videoRef.current; if (!v) return;
    const next = !muted; v.muted = next; setMuted(next);
    e.stopPropagation();
  };

  const toggleFS = e => {
    const wrap = wrapRef.current; if (!wrap) return;
    if (!document.fullscreenElement) {
      wrap.requestFullscreen && wrap.requestFullscreen();
    } else {
      document.exitFullscreen && document.exitFullscreen();
    }
    e.stopPropagation();
  };

  const changeQuality = (nextQuality, e) => {
    if (e) e.stopPropagation();
    const v = videoRef.current;
    if (v) {
      pendingTimeRef.current = v.currentTime || 0;
      pendingPlayRef.current = !v.paused;
    }
    setQuality(nextQuality);
    setQualityOpen(false);
  };

  const onMetadata = () => {
    const v = videoRef.current; if (!v) return;
    setDuration(v.duration);
    if (pendingTimeRef.current != null) {
      v.currentTime = Math.min(pendingTimeRef.current, v.duration || pendingTimeRef.current);
      pendingTimeRef.current = null;
      if (pendingPlayRef.current) v.play().catch(() => {});
      pendingPlayRef.current = false;
    }
  };

  const onVideoError = () => {
    if (quality !== "source") setQuality("source");
  };

  React.useEffect(() => {
    const v = videoRef.current; if (!v) return;
    let hls = null;
    const fallback = () => {
      if (v.src !== activeSrc) v.src = activeSrc;
    };

    if (activeHlsSrc && v.canPlayType("application/vnd.apple.mpegurl")) {
      v.src = activeHlsSrc;
    } else if (activeHlsSrc && window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ maxBufferLength: 12, backBufferLength: 12 });
      hls.on(window.Hls.Events.ERROR, function(_, data) {
        if (data && data.fatal) { hls.destroy(); hls = null; fallback(); }
      });
      hls.loadSource(activeHlsSrc);
      hls.attachMedia(v);
    } else {
      fallback();
    }

    return () => { if (hls) hls.destroy(); };
  }, [activeHlsSrc, activeSrc]);

  React.useEffect(() => {
    const onFS = () => setFullscreen(document.fullscreenElement === wrapRef.current);
    document.addEventListener("fullscreenchange", onFS);
    return () => document.removeEventListener("fullscreenchange", onFS);
  }, []);

  const btnBase = {
    background:"none",border:"none",color:"rgba(255,255,255,0.8)",
    cursor:"pointer",padding:"3px 5px",fontSize:16,lineHeight:1,
    display:"flex",alignItems:"center",justifyContent:"center",
  };
  const qualityLabel = (VIDEO_QUALITY_OPTIONS.find(q => q.id === quality) || VIDEO_QUALITY_OPTIONS[0]).label;

  return (
    <div ref={wrapRef} style={{
      position:"relative",borderRadius:14,overflow:"hidden",
      background:"#1c130a",border:"2.5px solid var(--ink)",
      boxShadow:"0 12px 28px -16px rgba(68,45,29,0.5)",
      aspectRatio:"16/9",userSelect:"none",cursor:"pointer",
    }} onClick={togglePlay}>
      <div style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:1,
        background:"radial-gradient(ellipse at 30% 20%,rgba(244,197,52,0.07) 0%,transparent 50%)"}} />

      <video ref={videoRef} preload="metadata" playsInline webkit-playsinline="true"
        poster={poster || undefined}
        style={{width:"100%",height:"100%",display:"block",objectFit:"contain",zIndex:0}}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={() => { if(videoRef.current) setCurrentTime(videoRef.current.currentTime); }}
        onLoadedMetadata={onMetadata}
        onError={onVideoError}
      />

      {!playing && (
        <div onClick={e => { e.stopPropagation(); togglePlay(); }} style={{
          position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:3,
          width:72,height:72,borderRadius:"50%",
          border:"2.5px solid rgba(255,255,255,0.9)",
          background:ac,
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:26,color:"var(--ink)",cursor:"pointer",
          animation:"ring-pulse-light 1.8s ease-out infinite",
        }}>&#9654;</div>
      )}

      <div style={{
        position:"absolute",bottom:0,left:0,right:0,zIndex:3,
        padding:"24px 14px 10px",
        background:"linear-gradient(0deg,rgba(0,0,0,0.85) 0%,transparent 100%)",
      }} onClick={e => e.stopPropagation()}>
        <div ref={progressRef} onClick={seek}
          onTouchStart={e=>{e.stopPropagation();seek(e);}}
          onTouchMove={e=>{e.stopPropagation();seek(e);}}
          style={{width:"100%",height:8,background:"rgba(255,255,255,0.2)",borderRadius:99,
            marginBottom:10,cursor:"pointer",position:"relative",touchAction:"none",
            display:"flex",alignItems:"center"}}>
          <div style={{height:"100%",borderRadius:99,
            background:"linear-gradient(90deg,"+ac+","+acd+")",
            width:pct+"%",position:"relative",transition:"width 0.1s linear"}}>
            <div style={{position:"absolute",right:-4,top:"50%",transform:"translateY(-50%)",
              width:11,height:11,borderRadius:"50%",background:ac,
              border:"2px solid #fff",boxShadow:"0 0 5px "+ac}} />
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <button onClick={e=>{e.stopPropagation();togglePlay();}}
            style={{
              width:32,height:32,borderRadius:"50%",flexShrink:0,
              border:"1.5px solid rgba(255,255,255,0.5)",
              background:ac,color:"var(--ink)",
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:12,cursor:"pointer",
            }}>{playing ? "❚❚" : "▶"}</button>

          <button onClick={toggleMute} style={btnBase}>
            {muted||volume===0?"🔇":volume<0.5?"🔉":"🔊"}
          </button>
          <input type="range" min="0" max="1" step="0.05"
            value={muted?0:volume} onChange={changeVol}
            onClick={e=>e.stopPropagation()}
            style={{width:52,accentColor:ac,cursor:"pointer"}} />

          <span style={{color:"rgba(255,255,255,0.75)",fontSize:12,
            fontVariantNumeric:"tabular-nums",letterSpacing:"0.02em"}}>
            {fmt(currentTime)} / {fmt(duration)}
          </span>

          <div style={{flex:1}} />

          <div style={{position:"relative"}}>
            {qualityOpen && (
              <div style={{
                position:"absolute",right:0,bottom:31,zIndex:6,
                minWidth:74,overflow:"hidden",
                borderRadius:10,
                background:"rgba(12,7,4,0.92)",
                boxShadow:"0 10px 24px rgba(0,0,0,0.32)",
                border:"1px solid rgba(255,255,255,0.12)",
              }}>
                {VIDEO_QUALITY_OPTIONS.map(q => (
                  <button key={q.id} onClick={e=>changeQuality(q.id,e)}
                    style={{
                      display:"block",width:"100%",
                      border:"none",
                      background:quality===q.id?ac:"transparent",
                      color:quality===q.id?"var(--ink)":"rgba(255,255,255,0.88)",
                      padding:"7px 10px",
                      fontSize:11,
                      fontWeight:800,
                      textAlign:"center",
                      cursor:"pointer",
                    }}>{q.label}</button>
                ))}
              </div>
            )}
            <button onClick={e=>{e.stopPropagation();setQualityOpen(open=>!open);}}
              style={{
                border:"1px solid rgba(255,255,255,0.35)",
                background:ac,
                color:"var(--ink)",
                borderRadius:999,
                padding:"4px 9px",
                fontSize:11,
                fontWeight:800,
                cursor:"pointer",
                minWidth:52,
              }}>{qualityLabel}</button>
          </div>

          <button onClick={toggleFS} style={btnBase} title="Полный экран">
            {fullscreen ? "✕" : "⛶"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PageLearn({ course, accent, openLesson }) {
  const [courseVideos, setCourseVideos] = React.useState([]);
  const [activePanel, setActivePanel] = React.useState("topics");
  const [sesFaculty, setSesFaculty] = React.useState(null);
  const [selectedVideo, setSelectedVideo] = React.useState(null);
  const topicsRef = React.useRef(null);
  const videosRef = React.useRef(null);

  React.useEffect(() => {
    fetch("/api/videos?course=" + course)
      .then(r => r.json())
      .then(vs => setCourseVideos(vs.filter(v => v.is_active)))
      .catch(() => {});
  }, [course]);

  const [topics, setTopics] = React.useState([]);
  React.useEffect(() => {
    fetch("/api/topics?course=" + course)
      .then(r => r.json())
      .then(data => setTopics(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [course]);

  React.useEffect(() => {
    setActivePanel("topics");
    setSesFaculty(null);
    setSelectedVideo(null);
  }, [course]);

  const scrollTo = ref => {
    window.setTimeout(() => {
      if (ref.current) ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 30);
  };

  const isDentalVideo = video => {
    const text = ((video.title || "") + " " + (video.description || "")).toLowerCase();
    return text.includes("стомат");
  };

  const sesFacultyVideos = faculty => courseVideos.filter(v => (
    faculty === "dental"
      ? (v.faculty === "dental" || (!v.faculty && isDentalVideo(v)))
      : (v.faculty === "medical" || (!v.faculty && !isDentalVideo(v)))
  ));

  const renderVideoDetail = (video, onBack) => (
    <div className="video-detail">
      <button className="learn-back" type="button" onClick={onBack}>
        ← к списку видео
      </button>
      <div className="video-card video-card-open">
        <div className="video-card-title">{video.title}</div>
        <VideoPlayerInline
          src={"/media/videos/" + video.filename}
          poster={video.thumbnail ? "/media/videos/" + video.thumbnail : undefined}
          accent={accent}
        />
        <div className="video-conspect">
          <div className="video-conspect-title">Конспект видео</div>
          <div className="video-conspect-text">
            {video.description || "Конспект скоро появится"}
          </div>
        </div>
      </div>
    </div>
  );

  const renderVideosFolder = (videos, title, emptyText) => (
    <div className="video-folder" ref={videosRef}>
      <div className="video-folder-title">{title}</div>
      {selectedVideo ? (
        renderVideoDetail(selectedVideo, () => setSelectedVideo(null))
      ) : videos.length === 0 ? (
        <div className="learn-empty">{emptyText}</div>
      ) : (
        <div className="video-folder-list">
          {videos.map(v => (
            <button key={v.id} className="video-list-card" type="button" onClick={() => setSelectedVideo(v)}>
              <div className="video-card-title">{v.title}</div>
              {v.description && <div className="video-card-desc">{v.description}</div>}
              <span className="video-list-open">Открыть видео</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  if (course === "ses") {
    const faculties = [
      {
        id: "medical",
        title: "лечебно-педиатрический факультет",
        videos: sesFacultyVideos("medical"),
      },
      {
        id: "dental",
        title: "стоматологический факультет",
        videos: sesFacultyVideos("dental"),
      },
    ];
    const selectedFaculty = faculties.find(f => f.id === sesFaculty);

    return (
      <div>
        <PageHeader title="Обучение" sub="Программа курса · SES" accent={accent} />

        {!selectedFaculty ? (
          <div className="ses-faculty-grid">
            {faculties.map(f => (
              <button
                key={f.id}
                className="ses-faculty-card"
                type="button"
                onClick={() => { setSesFaculty(f.id); setSelectedVideo(null); }}
              >
                <span>{f.title}</span>
                <small>{f.videos.length ? `${f.videos.length} видео` : "видео скоро появятся"}</small>
              </button>
            ))}
          </div>
        ) : (
          <div>
            <button className="learn-back" type="button" onClick={() => { setSesFaculty(null); setSelectedVideo(null); }}>
              ← к факультетам
            </button>
            {renderVideosFolder(
              selectedFaculty.videos,
              selectedFaculty.title,
              "Видеоматериалы для этого факультета пока не добавлены"
            )}
          </div>
        )}
      </div>
    );
  }

  const openTopics = () => {
    setActivePanel("topics");
    setSelectedVideo(null);
    scrollTo(topicsRef);
  };

  const openWebinars = () => {
    setActivePanel("webinars");
    setSelectedVideo(null);
    scrollTo(videosRef);
  };

  return (
    <div>
      <PageHeader title="Обучение" sub={`Программа курса · ${course.toUpperCase()}`} accent={accent} />

      <div className="learn-entry-grid">
        <button className="learn-entry-card" type="button" onClick={openTopics}>
          <span className="learn-entry-num">{topics.length}</span>
          <span className="learn-entry-title">темы</span>
          <small>все темы курса</small>
        </button>
        <button className="learn-entry-card" type="button" onClick={() => { setActivePanel("tasks"); setSelectedVideo(null); }}>
          <span className="learn-entry-title">банк заданий</span>
          <small>тренировка по номерам</small>
        </button>
        <button className="learn-entry-card" type="button" onClick={openWebinars}>
          <span className="learn-entry-title">вебинары</span>
          <small>{courseVideos.length ? `${courseVideos.length} видео` : "папка с видео"}</small>
        </button>
      </div>

      {activePanel === "tasks" ? (
        <div className="learn-empty learn-empty-large">
          Банк заданий в разработке
        </div>
      ) : activePanel === "webinars" ? (
        renderVideosFolder(courseVideos, "Вебинары курса", "Видеоматериалы курса пока не добавлены")
      ) : (
        <React.Fragment>
          <div className="topic-list" ref={topicsRef}>
            {topics.map((t, i) => (
              <div key={i} className="topic"
                   style={{"--accent-soft": accent.soft, "--accent-d": accent.d}}
                   onClick={() => openLesson && openLesson(t.lesson_idx, t.title)}>
                <span className="t-num">{i+1}</span>
                <span className="t-title">{t.title}</span>
                <span className="t-status todo">{"→"}</span>
              </div>
            ))}
          </div>

          <div style={{marginTop: 18, fontSize: 15, color: "var(--ink-soft)", textAlign: "center"}}>
            кликни по теме, чтобы открыть урок с видео и тестом ↑
          </div>
        </React.Fragment>
      )}

    </div>
  );
}

// ============ ОБ ЭКЗАМЕНЕ ============
function PageExam({ course, accent }) {
  const data = {
    oge: {
      title: "Об экзамене · ОГЭ",
      sub: "ЕГЭ для 9 класса · вариант + теория",
      variants: [
        { n: 1, name: "Демо-вариант 2026" },
        { n: 2, name: "Открытый банк ФИПИ" },
        { n: 3, name: "Тренировочный №3" },
      ],
      sections: [
        { tag: "Часть 1", title: "Задания с кратким ответом", count: "1–19" },
        { tag: "Часть 2", title: "Задания с развёрнутым ответом", count: "20–24" },
      ],
    },
    ege: {
      title: "Об экзамене · ЕГЭ",
      sub: "вариант для 11 класса · теория",
      variants: [
        { n: 1, name: "Демо-вариант 2026" },
        { n: 2, name: "Досрочный вариант" },
        { n: 3, name: "Сборник Добротина" },
      ],
      sections: [
        { tag: "Часть 1", title: "Задания с кратким ответом", count: "1–28" },
        { tag: "Часть 2", title: "Задания с развёрнутым ответом", count: "29–34" },
      ],
    },
    ses: {
      title: "Об экзамене · Сессия",
      sub: "химия для медицинских и фарм. специальностей",
      variants: [
        { n: 1, name: "Лечебный, педиатрический ф-т" },
        { n: 2, name: "Стоматологический ф-т" },
        { n: 3, name: "Фармацевтический ф-т" },
      ],
      sections: [
        { tag: "Билет I", title: "Общая и неорганическая химия", count: "1–25" },
        { tag: "Билет II", title: "Биохимия", count: "26–50" },
      ],
    },
  }[course];

  return (
    <div>
      <PageHeader title={data.title} sub={data.sub} accent={accent} />

      <div style={{fontSize: 16, color: "var(--ink-soft)", marginBottom: 10}}>
        варианты:
      </div>
      <div className="variant-grid">
        {data.variants.map(v => (
          <div key={v.n} className="variant-card">
            <span className="v-tag" style={{background: accent.d}}>В{v.n}</span>
            <div className="v-num">Вариант {v.n}</div>
            <div className="v-name">{v.name}</div>
            <div className="v-actions">
              <button className="btn btn--filled">Открыть</button>
              <button className="btn btn--ghost">Скачать PDF</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{fontSize: 16, color: "var(--ink-soft)", margin: "24px 0 10px"}}>
        структура экзамена:
      </div>
      <div className="stack">
        {data.sections.map((s, i) => (
          <div key={i} className="topic" style={{"--accent-soft": accent.soft, "--accent-d": accent.d}}>
            <span className="t-num">{s.tag.split(" ")[1] || s.tag[0]}</span>
            <span className="t-title">{s.title}</span>
            <span className="t-meta">задания {s.count}</span>
            <span className="t-status todo">→</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ ПРИГЛАСИ ДРУГА ============
function PageInvite({ profile, setProfile, accent }) {
  const [copied, setCopied] = useState(false);
  const link = `s-nulya.ru/invite/${profile.firstName.toLowerCase() || "you"}42`;
  const friends = [
    { name: "Артём К.", status: "зарегистрирован · +50 баллов" },
    { name: "Мария В.", status: "перешла по ссылке" },
    { name: "Кирилл Д.", status: "ожидает оплаты" },
  ];

  const copy = () => {
    navigator.clipboard && navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const invite = () => setProfile({ ...profile, invited: profile.invited + 1 });

  return (
    <div>
      <PageHeader title="Пригласи друга" sub="Приведи друга — получи бонус" accent={accent} />

      <div className="invite-wrap">
        <div className="invite-illust">
          <div className="big-num">
            +50
            <small>баллов в рейтинг за каждого друга</small>
          </div>
          <div className="muted" style={{fontSize: 16}}>
            а ещё друг получит -20% на первый месяц подписки 💛
          </div>
        </div>

        <div>
          <div style={{fontSize: 16, color: "var(--ink-soft)", marginBottom: 8}}>
            твоя реферальная ссылка:
          </div>
          <div className="invite-link">
            <input readOnly value={link} />
            <button className="btn btn--filled" onClick={copy}>
              {copied ? "скопировано" : "копировать"}
            </button>
          </div>

          <div className="invite-share">
            <button className="btn share-btn">VK</button>
            <button className="btn share-btn">Telegram</button>
            <button className="btn share-btn">WhatsApp</button>
            <button className="btn btn--accent invite-add" style={{"--accent": accent.c, "--accent-d": accent.d}} onClick={invite}>
              +1 приглашение
            </button>
          </div>

          <div style={{marginTop: 22, fontSize: 16, color: "var(--ink-soft)"}}>
            приглашено: <b key={profile.invited} className="invited-num bump-key" style={{fontFamily: "Soyuz Grotesk, sans-serif", fontSize: 22}}>{profile.invited}</b> {wordFriend(profile.invited)}
          </div>

          <div className="friend-list">
            {friends.slice(0, Math.min(friends.length, profile.invited)).map((f, i) => (
              <div className="friend" key={i}>
                <span className="av">{f.name[0]}</span>
                <span className="fn">{f.name}</span>
                <span className="fs">{f.status}</span>
              </div>
            ))}
            {profile.invited === 0 && (
              <div className="friend" style={{borderStyle: "dashed", color: "var(--ink-faint)"}}>
                <span className="av" style={{background: "var(--paper-edge)"}}>?</span>
                <span className="fn">пока никого не пригласил</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
function wordFriend(n) {
  const r = n % 10, rr = n % 100;
  if (rr >= 11 && rr <= 14) return "друзей";
  if (r === 1) return "друг";
  if (r >= 2 && r <= 4) return "друга";
  return "друзей";
}

// ============ О НАС ============
function PageAbout({ accent }) {
  return (
    <div>
      <PageHeader title="О нас" sub="Кто мы такие и зачем" accent={accent} />
      <div className="about-grid">
        <div>
          <p>
            <b>«С нуля»</b> — онлайн-школа по химии. Готовим школьников к ОГЭ и ЕГЭ,
            а студентов медицинских и фармацевтических факультетов — к сессии.
            Метод: маленькие порции теории, разбор задач на вебинаре и обязательная домашка
            с проверкой куратором.
          </p>
          <p>
            Все материалы — конспекты, банки заданий, пробники — собраны в одной папке.
            Никаких лишних чатов и десятка сервисов: открыл нужную вкладку и занимаешься.
          </p>
          <p>
            Команду собрали действующие репетиторы по химии и кураторы, которые сами
            сдали профильный ЕГЭ на 90+ и поступили в медицинские вузы.
          </p>
        </div>
        <div className="facts">
          <div className="fact"><div className="fn">2 140+</div><div className="fl">учеников за всё время</div></div>
          <div className="fact"><div className="fn">87</div><div className="fl">средний балл наших на ЕГЭ</div></div>
          <div className="fact"><div className="fn">4</div><div className="fl">года школе</div></div>
          <div className="fact"><div className="fn">22</div><div className="fl">куратора в команде</div></div>
        </div>
      </div>
    </div>
  );
}

// ============ ПОМОЩЬ ============
function PageHelp({ accent }) {
  const items = [
    { q: "Как оплатить подписку?", a: "Открой раздел «Обучение · Оплата» в правом верхнем углу. Принимаем карты РФ, СБП и иностранные карты." },
    { q: "Что делать, если пропустил вебинар?", a: "Запись появляется в течение суток в разделе «Расписание». Кликни по карточке вебинара — откроется страница записи." },
    { q: "Когда проверят домашку?", a: "На подписке Light — общая проверка по ответам, на PRO куратор проверяет вручную в течение 48 часов." },
    { q: "Можно ли сменить курс ОГЭ → ЕГЭ?", a: "Да, напиши в чат поддержки. Если осталось время на подписке — переведём остаток дней на новый курс." },
    { q: "Не пришло письмо с подтверждением", a: "Проверь папку «Спам». Если письма нет — нажми «Отправить снова» на странице входа или напиши нам." },
  ];
  const [open, setOpen] = useState(0);
  return (
    <div>
      <PageHeader title="Помощь" sub="Часто задаваемые вопросы" accent={accent} />

      <div className="grid-2">
        <div className="faq">
          {items.map((it, i) => (
            <div key={i} className="faq-item">
              <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)}>
                <span>{it.q}</span>
                <span style={{opacity: 0.5}}>{open === i ? "−" : "+"}</span>
              </button>
              {open === i && <div className="faq-a">{it.a}</div>}
            </div>
          ))}
        </div>
        <div>
          <div className="fact" style={{padding: 20}}>
            <div className="fn" style={{fontSize: 22}}>Остались вопросы?</div>
            <div style={{marginTop: 8, fontSize: 14, lineHeight: 1.5, color: "var(--ink-soft)"}}>
              Напиши нам — отвечаем с 9 до 22 по МСК, обычно в течение 15 минут.
            </div>
            <div className="stack" style={{marginTop: 16}}>
              <button className="btn btn--filled">Написать в чат</button>
              <button className="btn">Telegram-бот</button>
              <button className="btn">help@s-nulya.ru</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ ОПЛАТА ============
function PagePay({ profile, setProfile, accent, currentUser, onLoginRequired }) {
  const setSub = (s) => {
    if (!currentUser) { onLoginRequired && onLoginRequired(); return; }
    setProfile({ ...profile, subscription: s });
  };
  return (
    <div>
      <PageHeader title="Подписка" sub="Выбери тариф" accent={accent} />

      {!currentUser && (
        <div style={{background: 'rgba(68,45,29,0.06)', border: '1.5px solid var(--paper-edge)', borderRadius: 12,
          padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap'}}>
          <span style={{flex: 1, fontSize: 14, color: 'var(--ink-soft)'}}>Чтобы оформить подписку, нужен аккаунт</span>
          <button className="guest-btn-register" onClick={onLoginRequired} style={{fontSize: 13}}>Войти / Регистрация</button>
        </div>
      )}

      <div className="price-grid">
        <div className="price-card">
          <div className="p-name">Подписка Light</div>
          <div className="muted" style={{fontSize: 16, marginTop: 2}}>
            всё базовое для подготовки
          </div>
          <ul>
            <li className="yes"><span className="mark">✓</span>открытые вебинары</li>
            <li className="yes"><span className="mark">✓</span>домашние работы и пробники</li>
            <li className="yes"><span className="mark">✓</span>конспекты, полезные материалы</li>
            <li className="yes"><span className="mark">✓</span>учебные чаты</li>
            <li className="no"><span className="mark">×</span>личный куратор</li>
            <li className="no"><span className="mark">×</span>проверка дом. работ куратором</li>
            <li className="no"><span className="mark">×</span>доп. задания по проблемным темам</li>
          </ul>
          <div className="p-price">2 490 <small>₽/мес</small></div>
          <button className="btn btn--filled" style={{marginTop: 18}}
                  onClick={() => setSub("light")}>
            {currentUser && profile.subscription === "light" ? "Активирована" : "Оформить Light"}
          </button>
        </div>

        <div className="price-card pro">
          <span className="p-tag">рекомендуем</span>
          <div className="p-name">Подписка PRO</div>
          <div className="muted" style={{fontSize: 16, marginTop: 2}}>
            с личным куратором
          </div>
          <ul>
            <li className="yes"><span className="mark">✓</span>открытые вебинары</li>
            <li className="yes"><span className="mark">✓</span>домашние работы и пробники</li>
            <li className="yes"><span className="mark">✓</span>конспекты, полезные материалы</li>
            <li className="yes"><span className="mark">✓</span>учебные чаты</li>
            <li className="yes"><span className="mark">✓</span>личный куратор</li>
            <li className="yes"><span className="mark">✓</span>проверка дом. работ куратором</li>
            <li className="yes"><span className="mark">✓</span>доп. задания по проблемным темам</li>
          </ul>
          <div className="p-price">4 490 <small>₽/мес</small></div>
          <button className="btn btn--accent" style={{marginTop: 18, "--accent": accent.c, "--accent-d": accent.d}}
                  onClick={() => setSub("pro")}>
            {currentUser && profile.subscription === "pro" ? "Активирована" : "Оформить PRO"}
          </button>
        </div>
      </div>

      <div className="price-foot">
        <span>Остались вопросы? <u>Напиши нам.</u></span>
        <span className="muted tiny">оплата картой РФ · СБП · иностранные карты</span>
      </div>
    </div>
  );
}

// ============ Helpers ============
function PageHeader({ title, sub, accent }) {
  return (
    <div style={{marginBottom: 22}}>
      <h2 className="page-title">{title}</h2>
      <div className="page-sub">{sub}</div>
      <div className="h-rule" style={{background: accent.d}}></div>
    </div>
  );
}

Object.assign(window, {
  PageHome, PageProfile, PageSchedule, PageRating,
  PageLearn, PageExam, PageInvite, PageAbout, PageHelp, PagePay,
});
