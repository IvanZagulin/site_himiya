/* global React */
const { useState, useEffect, useRef } = React;

// ============ ГЛАВНАЯ ============
function PageHome({ course, setCourse, setSection, accent }) {
  return (
    <div>
      <div className="hero">
        <div>
          <div className="tiny muted" style={{marginBottom: 16}}>Онлайн-школа по химии</div>
          <h1>С нуля<span style={{color: accent.d}}>.</span></h1>
          <p className="sub">
            Подготовка к ОГЭ, ЕГЭ и сессии по химии — в формате папки с конспектами,
            вебинарами и заданиями. Выбери папку сверху и начинай готовиться к экзамену.
          </p>
          <div className="cta-row">
            <button className="btn btn--filled" onClick={() => setSection("learn")}>Начать обучение</button>
            <button className="btn" onClick={() => setSection("schedule")}>Расписание вебинаров</button>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          {window.MoleculeScene && <window.MoleculeScene />}
        </div>
      </div>

      <div className="course-pick">
        <CoursePick code="oge" name="ОГЭ" desc="9 класс — 30 тем, 320 задач" color="purple" onPick={() => { setCourse("oge"); setSection("learn"); }} />
        <CoursePick code="ege" name="ЕГЭ" desc="10–11 класс — 48 тем" color="blue" onPick={() => { setCourse("ege"); setSection("learn"); }} />
        <CoursePick code="ses" name="Сессия" desc="1–2 курс — медицина, фарм" color="green" onPick={() => { setCourse("ses"); setSection("learn"); }} />
      </div>
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
          <div style={{textAlign: "center", marginTop: 14, fontFamily: "Caveat, cursive", fontSize: 18, color: "var(--ink-soft)"}}>
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
                fontFamily: "Unbounded", fontWeight: 800, fontSize: 20
              }}>{profile.invited}</span>
              <span style={{fontFamily: "Caveat, cursive", fontSize: 22, color: "var(--ink-soft)"}}>друзей</span>
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
  // Sample events keyed by course
  const allEvents = {
    oge: [
      { day: 0, start: 11.5, end: 15.0, num: 1, title: "ОГЭ · Занятие 1", topic: "Строение атома", type: "oge" },
      { day: 3, start: 12.0, end: 15.0, num: 2, title: "ОГЭ · Занятие 2", topic: "Химическая связь", type: "oge" },
    ],
    ege: [
      { day: 2, start: 15.5, end: 18.5, num: 5, title: "ЕГЭ · Занятие 5", topic: "Оксиды и гидроксиды", type: "ege" },
      { day: 5, start: 10.0, end: 13.0, num: 6, title: "ЕГЭ · Занятие 6", topic: "Кислоты", type: "ege" },
    ],
    ses: [
      { day: 1, start: 18.0, end: 20.0, num: 3, title: "Сессия · Занятие 3", topic: "Растворы", type: "ses" },
      { day: 4, start: 19.0, end: 21.0, num: 4, title: "Сессия · Занятие 4", topic: "Буферные системы", type: "ses" },
    ],
  };
  // Show both course-specific + cross-course events for richness
  const events = [
    ...allEvents.oge,
    ...allEvents.ege,
    ...allEvents.ses,
  ];

  const days = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];
  const hours = [];
  for (let h = 7; h <= 21; h++) hours.push(h);
  const ROW_H = 44;
  const HOUR_START = 7;

  // Compute week label
  const baseStart = new Date(2026, 4, 4); // Mon 4 May 2026
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

          {events.map((ev, i) => {
            const top = (ev.start - HOUR_START) * ROW_H;
            const height = (ev.end - ev.start) * ROW_H - 4;
            const colWidth = `calc((100% - 60px) / 7)`;
            const left = `calc(60px + ${ev.day} * ${colWidth} + 4px)`;
            const width = `calc(${colWidth} - 8px)`;
            const dim = ev.type !== course ? 0.45 : 1;
            return (
              <div key={i}
                className={`sched-event ev--${ev.type}`}
                style={{
                  top: top + 4, height,
                  left, width,
                  opacity: dim,
                }}
                title={`${ev.title} — открыть урок`}
                onClick={() => openLesson && openLesson(ev.num, ev.topic, ev.type)}>
                <div className="ev-time">{tt(ev.start)}–{tt(ev.end)}</div>
                <div className="ev-title">{ev.title}</div>
                <div className="ev-topic">«{ev.topic}»</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="row" style={{marginTop: 18, gap: 16, flexWrap: "wrap"}}>
        <Legend swatch="ev--oge" label="ОГЭ" />
        <Legend swatch="ev--ege" label="ЕГЭ" />
        <Legend swatch="ev--ses" label="Сессия" />
        <span className="muted" style={{fontSize: 13}}>Текущая вкладка выделена ярче · остальные курсы приглушены</span>
      </div>
    </div>
  );
}

function tt(v) {
  const h = Math.floor(v); const m = Math.round((v - h) * 60);
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
}

function Legend({ swatch, label }) {
  return (
    <span className="row" style={{gap: 6, fontSize: 13, fontWeight: 600}}>
      <span className={`sched-event ${swatch}`} style={{position: "static", width: 16, height: 16, padding: 0, borderWidth: 2}}></span>
      {label}
    </span>
  );
}

// ============ МОЙ РЕЙТИНГ ============
function PageRating({ course, accent }) {
  const data = [
    { p: 1, name: "Алина Сафина", meta: "11 класс · Казань", pts: 4820, lvl: "магистр" },
    { p: 2, name: "Тимур Хасанов", meta: "11 класс · Уфа", pts: 4650, lvl: "магистр" },
    { p: 3, name: "Юлия Кравцова", meta: "10 класс · Москва", pts: 4310, lvl: "адепт" },
    { p: 4, name: "Денис Зорин", meta: "11 класс · СПб", pts: 4120, lvl: "адепт" },
    { p: 5, name: "Полина Лесная", meta: "10 класс · Пермь", pts: 3990, lvl: "адепт" },
    { p: 12, name: "Ты", meta: "11 класс · твой город", pts: 2840, lvl: "ученик", me: true },
    { p: 13, name: "Михаил Озеров", meta: "11 класс · Нск", pts: 2790, lvl: "ученик" },
  ];
  return (
    <div>
      <PageHeader title="Мой рейтинг" sub={`Топ учеников · поток ${course.toUpperCase()}`} accent={accent} />

      <div className="cards-row">
        <KPI num="2 840" label="Мои баллы" tinted accent={accent} />
        <KPI num="12" label="Место в рейтинге" accent={accent} />
        <KPI num="86%" label="Средний результат" accent={accent} />
      </div>

      <div className="rating-list">
        {data.map(r => (
          <div key={r.p} className={`rrow ${r.me ? "me" : ""}`}>
            <div className={`place ${r.p <= 3 ? "medal" : ""}`}>
              {r.p <= 3 ? ["🥇","🥈","🥉"][r.p-1] : `№${r.p}`}
            </div>
            <div className="nm">
              {r.name}
              <span className="meta">{r.meta}</span>
            </div>
            <div className="pts">{r.pts.toLocaleString("ru-RU")}</div>
            <div className="lvl">{r.lvl}</div>
          </div>
        ))}
      </div>

      <div className="muted" style={{marginTop: 18, fontFamily: "Caveat, cursive", fontSize: 20, textAlign: "center"}}>
        +10 баллов за домашку · +25 за пробник · +50 за приведённого друга
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

// ── Компактный плеер для списка курса ──
function VideoPlayerInline({ src: videoSrc, accent }) {
  const videoRef = React.useRef(null);
  const progressRef = React.useRef(null);

  const [playing, setPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [volume, setVolume] = React.useState(1);
  const [muted, setMuted] = React.useState(false);

  const ac  = accent ? accent.c : "var(--tab-yellow)";
  const acd = accent ? accent.d : "var(--tab-yellow-d)";
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
    v.currentTime = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * duration;
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

  const btnBase = {
    background:"none",border:"none",color:"rgba(255,255,255,0.8)",
    cursor:"pointer",padding:"3px 5px",fontSize:16,lineHeight:1,
    display:"flex",alignItems:"center",justifyContent:"center",
  };

  return (
    <div style={{
      position:"relative",borderRadius:14,overflow:"hidden",
      background:"#1c130a",border:"2.5px solid var(--ink)",
      boxShadow:"0 12px 28px -16px rgba(68,45,29,0.5)",
      aspectRatio:"16/9",userSelect:"none",cursor:"pointer",
    }} onClick={togglePlay}>
      <div style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:1,
        background:"radial-gradient(ellipse at 30% 20%,rgba(244,197,52,0.07) 0%,transparent 50%)"}} />

      <video ref={videoRef} src={videoSrc} preload="auto" playsInline webkit-playsinline="true"
        style={{width:"100%",height:"100%",display:"block",objectFit:"contain",zIndex:0}}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={() => { if(videoRef.current) setCurrentTime(videoRef.current.currentTime); }}
        onLoadedMetadata={() => { if(videoRef.current) setDuration(videoRef.current.duration); }}
        onClick={togglePlay}
      />

      {/* Centre play */}
      {!playing && (
        <div onClick={togglePlay} style={{
          position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:3,
          width:72,height:72,borderRadius:"50%",
          border:"2.5px solid rgba(255,255,255,0.9)",
          background:ac,
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:26,color:"var(--ink)",cursor:"pointer",
          animation:"ring-pulse-light 1.8s ease-out infinite",
        }}>&#9654;</div>
      )}

      {/* Controls */}
      <div style={{
        position:"absolute",bottom:0,left:0,right:0,zIndex:3,
        padding:"24px 14px 10px",
        background:"linear-gradient(0deg,rgba(0,0,0,0.85) 0%,transparent 100%)",
      }}>
        <div ref={progressRef} onClick={seek}
          style={{width:"100%",height:4,background:"rgba(255,255,255,0.2)",borderRadius:99,
            marginBottom:10,cursor:"pointer",position:"relative"}}>
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
        </div>
      </div>
    </div>
  );
}

function PageLearn({ course, accent, openLesson }) {
  const [courseVideos, setCourseVideos] = React.useState([]);

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

  return (
    <div>
      <PageHeader title="Обучение" sub={`Программа курса · ${course.toUpperCase()}`} accent={accent} />

      <div className="cards-row">
        <KPI num={topics.length} label="Всего тем" tinted accent={accent} />
      </div>

      <div className="topic-list">
        {topics.map((t, i) => (
          <div key={i} className="topic"
               style={{"--accent-soft": accent.soft, "--accent-d": accent.d}}
               onClick={() => openLesson && openLesson(i + 1, t.title)}>
            <span className="t-num">{i+1}</span>
            <span className="t-title">{t.title}</span>
            <span className="t-status todo">{"→"}</span>
          </div>
        ))}
      </div>

      <div style={{marginTop: 18, fontFamily: "Caveat, cursive", fontSize: 20, color: "var(--ink-soft)", textAlign: "center"}}>
        кликни по теме, чтобы открыть урок с видео и тестом ↑
      </div>

      {courseVideos.length > 0 && (
        <div style={{marginTop: 28}}>
          <div style={{fontWeight: 700, fontSize: 16, marginBottom: 14, color: "var(--ink)"}}>
            Видеоматериалы курса
          </div>
          <div style={{display: "flex", flexDirection: "column", gap: 20}}>
            {courseVideos.map(v => (
              <div key={v.id} style={{
                background: "var(--paper, #fff9f0)",
                border: "2px solid var(--ink)",
                borderRadius: 14,
                padding: "16px 18px",
                boxShadow: "3px 3px 0 var(--ink)",
              }}>
                <div style={{fontWeight: 700, fontSize: 15, marginBottom: v.description ? 6 : 12, color: "var(--ink)"}}>
                  {v.title}
                </div>
                {v.description && (
                  <div style={{fontSize: 13, color: "var(--ink-soft)", marginBottom: 12}}>
                    {v.description}
                  </div>
                )}
                <VideoPlayerInline src={"/media/videos/" + v.filename} accent={accent} />
              </div>
            ))}
          </div>
        </div>
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

      <div style={{fontFamily: "Caveat, cursive", fontSize: 22, color: "var(--ink-soft)", marginBottom: 10}}>
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

      <div style={{fontFamily: "Caveat, cursive", fontSize: 22, color: "var(--ink-soft)", margin: "24px 0 10px"}}>
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
          <div className="muted" style={{fontFamily: "Caveat, cursive", fontSize: 22}}>
            а ещё друг получит -20% на первый месяц подписки 💛
          </div>
        </div>

        <div>
          <div style={{fontFamily: "Caveat, cursive", fontSize: 22, color: "var(--ink-soft)", marginBottom: 8}}>
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

          <div style={{marginTop: 22, fontFamily: "Caveat, cursive", fontSize: 22, color: "var(--ink-soft)"}}>
            приглашено: <b key={profile.invited} className="invited-num bump-key" style={{fontFamily: "Unbounded", fontSize: 26}}>{profile.invited}</b> {wordFriend(profile.invited)}
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

// ============ ОПЛАТА (sub-section of Обучение) ============
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
          <div className="muted" style={{fontFamily: "Caveat, cursive", fontSize: 20, marginTop: 2}}>
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
          <div className="muted" style={{fontFamily: "Caveat, cursive", fontSize: 20, marginTop: 2}}>
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

// Export to window so app.jsx can grab them
Object.assign(window, {
  PageHome, PageProfile, PageSchedule, PageRating,
  PageLearn, PageExam, PageInvite, PageAbout, PageHelp, PagePay,
});
