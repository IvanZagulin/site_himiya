/* global React */

// ============ ДАННЫЕ УРОКОВ ============
const LESSONS = {
  oge: {
    1: {
      title: "Строение атома",
      duration: "42 мин",
      difficulty: "базовый",
      description: [
        "На этом занятии разбираем, как устроен атом: из чего состоит ядро, как электроны распределяются по орбиталям и почему именно так — а не как-то иначе.",
        "После урока ты сможешь сходу написать электронную конфигурацию любого элемента первых четырёх периодов и объяснить, почему медь и хром — исключения из правила Хунда."
      ],
      goals: [
        "Различать протоны, нейтроны, электроны",
        "Записывать электронные формулы элементов 1–4 периодов",
        "Определять валентные электроны и степень окисления",
        "Понимать порядок заполнения орбиталей по принципу Паули"
      ],
      materials: [],
      quiz: [
        {
          q: "Сколько электронов на внешнем энергетическом уровне у атома натрия (Na)?",
          opts: ["1", "2", "7", "8"],
          correct: 0,
        },
        {
          q: "Какая электронная конфигурация соответствует атому хлора (Cl)?",
          opts: [
            "1s² 2s² 2p⁶ 3s² 3p⁵",
            "1s² 2s² 2p⁶ 3s² 3p⁴",
            "1s² 2s² 2p⁶ 3s¹ 3p⁶",
            "1s² 2s² 2p⁵ 3s² 3p⁶",
          ],
          correct: 0,
        },
        {
          q: "У какого элемента число протонов равно 16?",
          opts: ["Кислород (O)", "Сера (S)", "Кремний (Si)", "Селен (Se)"],
          correct: 1,
        },
        {
          q: "Изотопы одного и того же элемента отличаются:",
          opts: [
            "числом протонов",
            "числом электронов",
            "числом нейтронов",
            "зарядом ядра",
          ],
          correct: 2,
        },
        {
          q: "Какое из утверждений о строении атома верно?",
          opts: [
            "Электрон имеет положительный заряд",
            "Масса протона приблизительно равна массе нейтрона",
            "Нейтрон находится на электронной оболочке",
            "Атом водорода содержит два протона",
          ],
          correct: 1,
        },
      ],
    },
  },
  ege: {
    1: {
      title: "Строение атома и электронные конфигурации",
      duration: "58 мин",
      difficulty: "профильный",
      description: [
        "Развёрнутый разбор темы для ЕГЭ: квантовые числа, форма s, p, d, f орбиталей, правила Хунда и Клечковского.",
        "Затронем неочевидные случаи — почему у Cr и Cu электрон «проваливается» с 4s на 3d, и как это спрашивают в задании 1.",
      ],
      goals: [
        "Записывать полные и сокращённые электронные конфигурации до 4 периода",
        "Понимать связь между конфигурацией и положением в таблице",
        "Решать задание 1 ЕГЭ без ошибок",
        "Объяснять исключения из правила Хунда",
      ],
      materials: [],
      quiz: [
        {
          q: "Какой элемент имеет электронную конфигурацию [Ar] 3d⁵ 4s¹?",
          opts: ["Марганец (Mn)", "Хром (Cr)", "Железо (Fe)", "Ванадий (V)"],
          correct: 1,
        },
        {
          q: "Сколько неспаренных электронов в атоме азота в основном состоянии?",
          opts: ["1", "2", "3", "5"],
          correct: 2,
        },
        {
          q: "У какой пары элементов число валентных электронов одинаково?",
          opts: [
            "Na и Mg",
            "C и Si",
            "O и S",
            "Верны варианты 2 и 3",
          ],
          correct: 3,
        },
        {
          q: "Электронная конфигурация иона Fe³⁺:",
          opts: [
            "[Ar] 3d⁵",
            "[Ar] 3d⁶ 4s²",
            "[Ar] 3d⁴ 4s¹",
            "[Ar] 4s² 3d³",
          ],
          correct: 0,
        },
        {
          q: "Правило Хунда утверждает, что:",
          opts: [
            "Электроны заполняют сначала орбитали с меньшей энергией",
            "На одной орбитали не может быть электронов с одинаковым спином",
            "В пределах подуровня электроны располагаются по одному в каждой орбитали, сохраняя параллельные спины",
            "Электронные пары образуются только в s-орбиталях",
          ],
          correct: 2,
        },
      ],
    },
  },
  ses: {
    1: {
      title: "Растворы. Способы выражения концентрации",
      duration: "65 мин",
      difficulty: "вуз",
      description: [
        "Базовый блок для медицинских специальностей. Все способы выражения концентрации: массовая доля, молярная, моляльная, нормальная, титр.",
        "Особое внимание — расчётным задачам из билетов прошлых лет.",
      ],
      goals: [
        "Различать массовую, молярную, нормальную концентрацию",
        "Решать задачи на разведение и смешивание растворов",
        "Применять закон эквивалентов",
        "Готовить растворы заданной концентрации",
      ],
      materials: [],
      quiz: [
        {
          q: "Чему равна массовая доля растворённого вещества, если в 200 г раствора содержится 30 г соли?",
          opts: ["10%", "15%", "20%", "30%"],
          correct: 1,
        },
        {
          q: "Молярная концентрация — это:",
          opts: [
            "число молей вещества в 1 кг растворителя",
            "число молей вещества в 1 л раствора",
            "число эквивалентов в 1 л раствора",
            "масса вещества в 100 г растворителя",
          ],
          correct: 1,
        },
        {
          q: "Сколько граммов NaOH (М=40) нужно для приготовления 500 мл 0.2 М раствора?",
          opts: ["2 г", "4 г", "8 г", "40 г"],
          correct: 1,
        },
        {
          q: "Закон эквивалентов гласит, что:",
          opts: [
            "Вещества реагируют в одинаковых массовых соотношениях",
            "Вещества реагируют в эквивалентных количествах",
            "Эквивалент кислоты всегда равен её молярной массе",
            "Эквивалент равен числу Авогадро",
          ],
          correct: 1,
        },
        {
          q: "Изотоническим называют раствор, который:",
          opts: [
            "имеет ту же температуру, что и кровь",
            "имеет то же осмотическое давление, что и плазма крови",
            "содержит только натрий и хлор",
            "приготовлен на дистиллированной воде",
          ],
          correct: 1,
        },
      ],
    },
  },
};

function getLesson(course, idx) {
  const c = LESSONS[course] || LESSONS.ege;
  // Always return at least lesson 1 as default; create fallback per topic index
  return c[idx] || c[1];
}


// ============ КАСТОМНЫЙ ВИДЕОПЛЕЕР ============
const LESSON_VIDEO_QUALITY_OPTIONS = [
  { id: "720p", label: "720p" },
  { id: "480p", label: "480p" },
  { id: "source", label: "исходное" },
];

function lessonVideoQualitySrc(src, quality) {
  if (!src || quality === "source") return src;
  const dot = src.lastIndexOf(".");
  if (dot < 0) return src + "_" + quality + ".mp4";
  return src.slice(0, dot) + "_" + quality + ".mp4";
}

function VideoPlayer({ src: videoSrc, accent, onDuration }) {
  const videoRef = React.useRef(null);
  const progressRef = React.useRef(null);
  const wrapRef = React.useRef(null);
  const hideTimer = React.useRef(null);
  const pendingTimeRef = React.useRef(null);
  const pendingPlayRef = React.useRef(false);

  const [playing, setPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [volume, setVolume] = React.useState(1);
  const [muted, setMuted] = React.useState(false);
  const [showControls, setShowControls] = React.useState(true);
  const [fullscreen, setFullscreen] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);
  const [quality, setQuality] = React.useState("720p");

  const ac  = accent ? accent.c : "var(--tab-yellow)";
  const acd = accent ? accent.d : "var(--tab-yellow-d)";
  const activeSrc = lessonVideoQualitySrc(videoSrc, quality);
  const pct = duration ? (currentTime / duration) * 100 : 0;
  const fmt = s => (!s || isNaN(s)) ? "0:00"
    : Math.floor(s / 60) + ":" + Math.floor(s % 60).toString().padStart(2, "0");

  const togglePlay = React.useCallback(() => {
    const v = videoRef.current; if (!v) return;
    if (v.paused) { v.play().catch(() => {}); }
    else { v.pause(); }
  }, []);

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
  };

  const onMetadata = () => {
    const v = videoRef.current; if (!v) return;
    const d = v.duration;
    setDuration(d); setLoaded(true); if(onDuration)onDuration(d);
    if (pendingTimeRef.current != null) {
      v.currentTime = Math.min(pendingTimeRef.current, d || pendingTimeRef.current);
      pendingTimeRef.current = null;
      if (pendingPlayRef.current) v.play().catch(() => {});
      pendingPlayRef.current = false;
    }
  };

  const onVideoError = () => {
    if (quality !== "source") setQuality("source");
  };

  const resetHide = () => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    if (playing) hideTimer.current = setTimeout(() => setShowControls(false), 2800);
  };

  React.useEffect(() => {
    const onFS = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFS);
    return () => {
      document.removeEventListener("fullscreenchange", onFS);
      clearTimeout(hideTimer.current);
    };
  }, []);

  React.useEffect(() => {
    if (playing) { hideTimer.current = setTimeout(() => setShowControls(false), 2800); }
    else { clearTimeout(hideTimer.current); setShowControls(true); }
  }, [playing]);

  const btnBase = {
    background: "none", border: "none", color: "rgba(255,255,255,0.8)",
    cursor: "pointer", padding: "4px 6px", fontSize: 18, lineHeight: 1,
    display: "flex", alignItems: "center", justifyContent: "center",
  };

  return (
    <div ref={wrapRef} onMouseMove={resetHide} onTouchStart={resetHide} onMouseLeave={() => playing && setShowControls(false)}
      style={{
        position: "relative", borderRadius: 18, overflow: "hidden",
        background: "#1c130a", border: "2.5px solid var(--ink)",
        boxShadow: "0 20px 40px -28px rgba(68,45,29,0.55)",
        aspectRatio: "16/9",
        userSelect: "none", cursor: "pointer",
      }} onClick={togglePlay}>

      {/* gradient overlay */}
      <div style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:1,
        background:"radial-gradient(ellipse at 30% 20%, rgba(244,197,52,0.07) 0%,transparent 50%),radial-gradient(ellipse at 70% 80%, rgba(181,138,198,0.07) 0%,transparent 50%)"}} />

      <video ref={videoRef} src={activeSrc} preload="metadata" playsInline webkit-playsinline="true"
        style={{width:"100%",height:"100%",display:"block",objectFit:"contain",zIndex:0}}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={() => { if(videoRef.current) setCurrentTime(videoRef.current.currentTime); }}
        onLoadedMetadata={onMetadata}
        onError={onVideoError}
      />

      {/* Centre play button */}
      {!playing && (
        <div onClick={e => { e.stopPropagation(); togglePlay(); }}
          style={{
            position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:3,
            width:92,height:92,borderRadius:"50%",
            border:"3px solid rgba(255,255,255,0.9)",
            background:ac,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:34,color:"var(--ink)",cursor:"pointer",
            animation:"ring-pulse-light 1.8s ease-out infinite",
          }}>&#9654;</div>
      )}

      {/* Controls */}
      <div style={{
        position:"absolute",bottom:0,left:0,right:0,zIndex:3,
        padding:"32px 18px 14px",
        background:"linear-gradient(0deg,rgba(0,0,0,0.85) 0%,transparent 100%)",
        transition:"opacity 0.25s",
        opacity: showControls ? 1 : 0,
        pointerEvents: showControls ? "auto" : "none",
      }}>
        {/* Progress bar */}
        <div ref={progressRef} onClick={seek}
          onTouchStart={e=>{e.stopPropagation();seek(e);}}
          onTouchMove={e=>{e.stopPropagation();seek(e);}}
          style={{width:"100%",height:12,background:"rgba(255,255,255,0.2)",borderRadius:99,
            marginBottom:12,cursor:"pointer",position:"relative",touchAction:"none",
            display:"flex",alignItems:"center"}}>
          <div style={{
            height:"100%",borderRadius:99,
            background:"linear-gradient(90deg,"+ac+","+acd+")",
            width:pct+"%",position:"relative",transition:"width 0.1s linear",
          }}>
            <div style={{position:"absolute",right:-5,top:"50%",transform:"translateY(-50%)",
              width:13,height:13,borderRadius:"50%",background:ac,
              border:"2px solid #fff",boxShadow:"0 0 6px "+ac}} />
          </div>
        </div>
        {/* Button row */}
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={e=>{e.stopPropagation();togglePlay();}}
            style={{
              width:38,height:38,borderRadius:"50%",flexShrink:0,
              border:"2px solid rgba(255,255,255,0.5)",
              background:ac,color:"var(--ink)",
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:14,cursor:"pointer",
            }}>{playing ? "❚❚" : "▶"}</button>

          <button onClick={toggleMute} style={btnBase}>
            {muted||volume===0?"🔇":volume<0.5?"🔉":"🔊"}
          </button>
          <input type="range" min="0" max="1" step="0.05"
            value={muted?0:volume} onChange={changeVol}
            onClick={e=>e.stopPropagation()}
            style={{width:64,accentColor:ac,cursor:"pointer"}} />

          <span style={{color:"rgba(255,255,255,0.75)",fontSize:13,
            fontVariantNumeric:"tabular-nums",letterSpacing:"0.02em"}}>
            {fmt(currentTime)} / {fmt(duration)}
          </span>

          <div style={{flex:1}} />

          <div style={{display:"flex",alignItems:"center",gap:5}}>
            {LESSON_VIDEO_QUALITY_OPTIONS.map(q => (
              <button key={q.id} onClick={e=>changeQuality(q.id,e)}
                style={{
                  border:"1px solid rgba(255,255,255,0.35)",
                  background:quality===q.id?ac:"rgba(0,0,0,0.28)",
                  color:quality===q.id?"var(--ink)":"rgba(255,255,255,0.82)",
                  borderRadius:999,
                  padding:"4px 8px",
                  fontSize:12,
                  fontWeight:700,
                  cursor:"pointer",
                }}>{q.label}</button>
            ))}
          </div>

          <button onClick={toggleFS} style={btnBase} title="Полный экран">
            {fullscreen ? "✕" : "⛶"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ СТРАНИЦА УРОКА ============
function PageLesson({ course, lessonIndex, topicTitle, onBack, accent }) {
  const c = course === "main" ? "ege" : course;
  const lesson = getLesson(c, lessonIndex);
  const useTitle = topicTitle || lesson.title;

  const [phase, setPhase] = React.useState("video"); // video | quiz | done
  const [qIdx, setQIdx] = React.useState(0);
  const [answers, setAnswers] = React.useState({});
  const [revealed, setRevealed] = React.useState(false);
  const [videoUrl, setVideoUrl] = React.useState(null);
  const [videoDurSec, setVideoDurSec] = React.useState(0);
  const [dbQuiz, setDbQuiz] = React.useState(null);
  const [docs, setDocs] = React.useState([]);
  const [submitted, setSubmitted] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/videos?course=" + c)
      .then(r => r.json())
      .then(videos => {
        const v = videos.find(v => v.lesson_idx == lessonIndex);
        if (v) setVideoUrl("/media/videos/" + v.filename);
      }).catch(() => {});

    fetch("/api/quizzes?course=" + c + "&lesson_idx=" + lessonIndex)
      .then(r => r.json())
      .then(quizzes => { if (quizzes.length) setDbQuiz(quizzes[0]); })
      .catch(() => {});

    fetch("/api/docs?course=" + c + "&lesson_idx=" + lessonIndex)
      .then(r => r.json())
      .then(setDocs)
      .catch(() => {});
  }, [c, lessonIndex]);

  const quizQuestions = React.useMemo(() => {
    if (dbQuiz && dbQuiz.questions && dbQuiz.questions.length) {
      return dbQuiz.questions.map(q => ({
        text: q.text, opts: q.options, correct: q.correct, dbId: q.id
      }));
    }
    return (lesson.quiz || []).map(q => ({
      text: q.q, opts: q.opts, correct: q.correct, dbId: null
    }));
  }, [dbQuiz, lesson.quiz]);

  const totalQ = quizQuestions.length;
  const current = quizQuestions[qIdx] || quizQuestions[0];
  const selected = answers[qIdx];

  const pickAnswer = (i) => { if (revealed) return; setAnswers({ ...answers, [qIdx]: i }); };
  const reveal = () => { if (selected == null) return; setRevealed(true); };
  const next = () => {
    if (qIdx + 1 < totalQ) { setQIdx(qIdx + 1); setRevealed(false); }
    else { submitQuiz(); setPhase("done"); }
  };
  const backToVideo = () => { setPhase("video"); setQIdx(0); setAnswers({}); setRevealed(false); setSubmitted(false); };
  const restart = () => { setPhase("quiz"); setQIdx(0); setAnswers({}); setRevealed(false); setSubmitted(false); };

  const submitQuiz = () => {
    if (submitted || !dbQuiz) return;
    setSubmitted(true);
    const apiAnswers = {};
    quizQuestions.forEach((q, i) => {
      if (q.dbId != null && answers[i] != null) apiAnswers[q.dbId] = answers[i];
    });
    fetch("/api/quiz-results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quiz_id: dbQuiz.id, answers: apiAnswers })
    }).catch(() => {});
  };

  const correctCount = quizQuestions.reduce((acc, q, i) => acc + (answers[i] === q.correct ? 1 : 0), 0);
  const pct = totalQ ? Math.round((correctCount / totalQ) * 100) : 0;
  const russianMark = pct >= 90 ? 5 : pct >= 75 ? 4 : pct >= 50 ? 3 : 2;
  const gradeColor = russianMark === 5 ? "var(--tab-green-d)"
                   : russianMark === 4 ? "var(--tab-yellow-d)"
                   : russianMark === 3 ? "#d97a3a" : "#b85454";
  const gradeMsg = russianMark === 5 ? "Идеально! Можно переходить к следующей теме."
                 : russianMark === 4 ? "Отличный результат. Ещё чуть-чуть и будет 5."
                 : russianMark === 3 ? "Тему стоит повторить — пересмотри конспект."
                 : "Без паники! Возвращайся к видео и попробуй ещё раз.";

  const fmtDur = s => {
    if (!s) return lesson.duration || "";
    return Math.floor(s / 60) + " мин";
  };

  return (
    <div>
      <button className="lesson-back" onClick={onBack}>← к списку тем</button>
      <PageHeader title={useTitle}
        sub={"урок " + lessonIndex + " · " + fmtDur(videoDurSec) + " · " + (lesson.difficulty || "")}
        accent={accent} />

      <div className="lesson-meta">
        <span className="chip" style={{background: accent.soft, borderColor: accent.d}}>Тема {lessonIndex}</span>
        {(videoDurSec || lesson.duration) && (
          <span className="chip">{"видео · " + fmtDur(videoDurSec)}</span>
        )}
        {totalQ > 0 && <span className="chip">{"тест · " + totalQ + " вопросов"}</span>}
      </div>

      {videoUrl ? (
        <VideoPlayer src={videoUrl} accent={accent} onDuration={setVideoDurSec} />
      ) : (
        <div className="video-shell" style={{"--accent": accent.c, "--accent-d": accent.d}}>
          <div className="video-play">&#9654;</div>
          <div className="video-overlay">
            <div>
              <div className="vt">{useTitle}</div>
              <div className="vd">{"видеоразбор · " + (lesson.duration || "")}</div>
            </div>
            <div className="vd">HD &middot; 1080p</div>
          </div>
        </div>
      )}

      <div className="lesson-body">
        <div className="lesson-content">
          {lesson.description && lesson.description.length > 0 && (
            <React.Fragment>
              <h3>Что разберём</h3>
              {lesson.description.map((p, i) => <p key={i}>{p}</p>)}
            </React.Fragment>
          )}
          {lesson.goals && lesson.goals.length > 0 && (
            <React.Fragment>
              <h3>После урока ты сможешь</h3>
              <ul>{lesson.goals.map((g, i) => <li key={i}>{g}</li>)}</ul>
            </React.Fragment>
          )}
        </div>

        <aside className="lesson-side">
          <div className="side-card" style={{"--accent-d": accent.d}}>
            <h4>Прогресс</h4>
            {totalQ > 0 && (
              <React.Fragment>
                <div style={{fontSize: 13, color: "var(--ink-soft)"}}>
                  {"тест — " + (phase === "done" ? "пройден" : qIdx + "/" + totalQ)}
                </div>
                <div className="progress-bar">
                  <div style={{width: (phase === "done" ? totalQ : qIdx) / Math.max(totalQ,1) * 100 + "%"}}></div>
                </div>
              </React.Fragment>
            )}
          </div>

          {(docs.length > 0 || (lesson.materials && lesson.materials.length > 0)) && (
            <div className="side-card">
              <h4>Материалы</h4>
              <ul>
                {docs.length > 0 ? docs.map((d, i) => (
                  <li key={i}>
                    <span className="b"></span>
                    <span>
                      <a href={"/media/docs/" + d.filename} target="_blank" rel="noopener"
                         style={{fontWeight: 700, color: "var(--ink)", textDecoration: "none"}}>
                        {d.title}
                      </a><br/>
                      <span style={{color: "var(--ink-soft)", fontSize: 12}}>
                        {"PDF · " + (d.size_bytes ? (d.size_bytes/1024/1024).toFixed(1)+" МБ" : "")}
                      </span>
                    </span>
                  </li>
                )) : lesson.materials.map((m, i) => (
                  <li key={i}>
                    <span className="b"></span>
                    <span>
                      <b>{m.name}</b><br/>
                      <span style={{color: "var(--ink-soft)", fontSize: 12}}>{m.size}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="side-card">
            <h4>Куратор</h4>
            <div style={{display: "flex", alignItems: "center", gap: 10}}>
              <div style={{
                width: 42, height: 42, borderRadius: "50%",
                background: accent.c, border: "2px solid var(--ink)",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, fontSize: 14,
              }}>МС</div>
              <div style={{fontSize: 13, lineHeight: 1.3}}>
                <b>Мария Соколова</b><br/>
                <span style={{color: "var(--ink-soft)"}}>отвечает в чате</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {totalQ > 0 && (
        <div className="quiz-block" id="quiz" style={{"--accent": accent.c, "--accent-d": accent.d, "--accent-soft": accent.soft}}>
          {phase === "video" && (
            <div style={{textAlign: "center", padding: "30px 0"}}>
              <h3 style={{fontWeight: 800, fontSize: 24, margin: "0 0 10px"}}>
                Готов проверить себя?
              </h3>
              <p style={{margin: "0 0 22px", color: "var(--ink-soft)", fontSize: 15}}>
                {totalQ + " вопросов · оценка по пятибалльной шкале"}
              </p>
              <button className="btn btn--filled" onClick={() => setPhase("quiz")}>
                Начать тест
              </button>
            </div>
          )}

          {phase === "quiz" && current && (
            <div>
              <div className="quiz-head">
                <h3>{"Тест: " + useTitle}</h3>
                <div className="quiz-progress">{"вопрос " + (qIdx + 1) + " из " + totalQ}</div>
              </div>
              <div className="progress-bar" style={{marginBottom: 22}}>
                <div style={{width: (qIdx + (revealed ? 1 : 0)) / totalQ * 100 + "%"}}></div>
              </div>
              <div className="q-card" key={qIdx}>
                <div className="q-text">{current.text}</div>
                <div className="q-options">
                  {current.opts.map((opt, i) => {
                    const letter = ["А","Б","В","Г","Д"][i];
                    let cls = "q-opt";
                    if (revealed) {
                      if (i === current.correct) cls += " correct";
                      else if (i === selected) cls += " wrong";
                    } else if (selected === i) cls += " selected";
                    return (
                      <button key={i} className={cls} onClick={() => pickAnswer(i)} disabled={revealed}>
                        <span className="marker">{letter}</span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="quiz-nav">
                  <button className="btn btn--ghost" onClick={backToVideo}>
                    {"← к видео"}
                  </button>
                  {!revealed ? (
                    <button className="btn btn--filled" onClick={reveal} disabled={selected == null}>
                      Проверить ответ
                    </button>
                  ) : (
                    <button className="btn btn--filled" onClick={next}>
                      {qIdx + 1 < totalQ ? "Следующий вопрос →" : "Показать результат"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {phase === "done" && (
            <div className="grade-screen">
              <div className="grade-circle" style={{"--grade-color": gradeColor, "--grade-pct": pct}}>
                <div className="grade-num">{pct}<small>%</small></div>
              </div>
              <div className="grade-label">{correctCount + " из " + totalQ + " правильно"}</div>
              <div className="grade-mark" style={{"--accent-soft": accent.soft, "--accent-d": accent.d}}>
                {"оценка — " + russianMark + " " + (russianMark === 5 ? "(отлично)" : russianMark === 4 ? "(хорошо)" : russianMark === 3 ? "(удовл.)" : "(неуд.)")}
              </div>
              <div className="grade-msg">{gradeMsg}</div>
              <div style={{display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap"}}>
                <button className="btn btn--ghost" onClick={backToVideo}>{"← к видео"}</button>
                <button className="btn" onClick={restart}>пройти заново</button>
                <button className="btn btn--filled" onClick={onBack}>к списку тем</button>
              </div>
              <div style={{marginTop: 36, textAlign: "left"}}>
                <h4 style={{fontWeight: 800, fontSize: 14, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 14}}>
                  Разбор ответов
                </h4>
                <div className="stack">
                  {quizQuestions.map((q, i) => {
                    const ok = answers[i] === q.correct;
                    return (
                      <div key={i} className="side-card" style={{
                        borderColor: ok ? "var(--tab-green-d)" : "#b85454",
                        background: ok ? "#EBF5E4" : "#FBEEEE",
                      }}>
                        <div style={{display: "flex", gap: 10, alignItems: "flex-start"}}>
                          <span style={{
                            width: 24, height: 24, borderRadius: "50%",
                            background: ok ? "var(--tab-green-d)" : "#b85454",
                            color: "#fff", fontWeight: 800, fontSize: 13,
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0, marginTop: 2,
                          }}>{ok ? "✓" : "×"}</span>
                          <div>
                            <div style={{fontWeight: 700, fontSize: 14, marginBottom: 4}}>{q.text}</div>
                            <div style={{fontSize: 13, color: "var(--ink-soft)"}}>
                              {"правильный ответ: "}
                              <b style={{color: "var(--ink)"}}>{q.opts[q.correct]}</b>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { PageLesson, LESSONS });
