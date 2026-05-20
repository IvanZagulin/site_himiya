(function () {
  const oldCanvas = document.getElementById("fx-canvas");
  if (oldCanvas) oldCanvas.remove();

  const canvas = document.createElement("canvas");
  canvas.id = "fx-canvas";
  canvas.style.cssText = "position:fixed;top:0;left:0;pointer-events:none;z-index:9999;";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = window.innerWidth  * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width  = window.innerWidth  + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  const ELEMENTS = [
    {s:"H"}, {s:"He"}, {s:"C"}, {s:"N"}, {s:"O"}, {s:"F"},
    {s:"Na"}, {s:"Mg"}, {s:"Al"}, {s:"Si"}, {s:"P"}, {s:"S"},
    {s:"Cl"}, {s:"K"}, {s:"Ca"}, {s:"Fe"}, {s:"Cu"}, {s:"Zn"},
    {s:"Br"}, {s:"Ag"}, {s:"I"}, {s:"Au"}, {s:"Hg"}, {s:"Pb"},
  ];
  const COLORS = ["#f4c534", "#f97316", "#ef4444", "#a78bfa", "#fb923c"];
  const particles = [];

  function activeBounds() {
    const area = document.querySelector(".folder") || document.querySelector(".app");
    if (!area) return null;
    return area.getBoundingClientRect();
  }

  function inside(rect, x, y) {
    return rect && x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }

  function spawnTrail(x, y) {
    const el = ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)];
    particles.push({
      kind: "trail",
      x: x + (Math.random() - 0.5) * 14,
      y: y + (Math.random() - 0.5) * 14,
      vx: (Math.random() - 0.5) * 1.6,
      vy: -0.6 - Math.random() * 1.2,
      life: 1,
      decay: 0.018 + Math.random() * 0.008,
      size: 12 + Math.random() * 10,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      text: el.s,
      rot: (Math.random() - 0.5) * 0.6,
      rotation: (Math.random() - 0.5) * 0.4,
    });
  }

  function spawnBubble(x, y) {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    particles.push({
      kind: "bubble",
      x: x + (Math.random() - 0.5) * 20,
      y: y + (Math.random() - 0.5) * 20,
      vx: (Math.random() - 0.5) * 1.2,
      vy: -0.5 - Math.random() * 1.0,
      life: 1,
      decay: 0.022 + Math.random() * 0.01,
      r: 4 + Math.random() * 8,
      color,
    });
  }

  let lastTrail = 0;
  window.addEventListener("pointermove", function (e) {
    const rect = activeBounds();
    if (!inside(rect, e.clientX, e.clientY)) return;
    const now = performance.now();
    if (now - lastTrail < 50) return;
    lastTrail = now;
    if (Math.random() < 0.55) spawnTrail(e.clientX, e.clientY);
    else spawnBubble(e.clientX, e.clientY);
  });

  let last = performance.now();
  function tick(now) {
    const dt = Math.min(50, now - last);
    last = now;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const rect = activeBounds();
    ctx.save();
    if (rect) {
      ctx.beginPath();
      ctx.rect(rect.left, rect.top, rect.width, rect.height);
      ctx.clip();
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= p.decay * (dt / 16.6);
      if (p.life <= 0 || (rect && !inside(rect, p.x, p.y))) {
        particles.splice(i, 1);
        continue;
      }
      p.x += p.vx;
      p.y += p.vy;

      if (p.kind === "trail") {
        p.vy += 0.03;
        p.rotation += p.rot * 0.02;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life * p.life);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.font = `800 ${p.size}px Unbounded, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.fillText(p.text, 0, 0);
        ctx.restore();
      } else {
        p.vy -= 0.01;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life) * 0.7;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.globalAlpha = Math.max(0, p.life) * 0.15;
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.restore();
      }
    }

    ctx.restore();
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();
