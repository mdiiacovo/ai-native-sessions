// deck.js — scroll-snap presentation engine with dots, skip-slides, and Leave-behind (PDF).
// Shared by session1.html and session2.html. Injects its own chrome; slides are the
// existing .slide sections. Matches the workshop deck UX.
(function () {
  const deck = document.querySelector(".deck");
  const slides = Array.from(document.querySelectorAll(".slide"));
  if (!deck || !slides.length) return;

  slides.forEach((s, i) => { s.dataset.idx = i; });

  const HKEY = "deck-hidden:" + (document.title || location.pathname);
  let hidden = new Set(JSON.parse(localStorage.getItem(HKEY) || "[]"));
  let cur = 0;

  const progress = document.querySelector(".progress");
  const counter = document.querySelector(".counter");

  const dots = document.createElement("div");
  dots.id = "dots";
  document.body.appendChild(dots);

  const outline = document.createElement("div");
  outline.id = "outline";
  outline.innerHTML =
    '<div class="head"><h3>Slides &mdash; show / hide for delivery</h3>' +
    '<button class="obtn" id="ol-all">Show all</button>' +
    '<button class="obtn" id="ol-close">Done</button></div>' +
    '<p class="hint2">Uncheck any slide to skip it during the talk. Saved on this device. ' +
    'Shortcuts: &larr;/&rarr; navigate &middot; o this panel &middot; h hide current &middot; p download PDF.</p><ul id="ol-list"></ul>';
  document.body.appendChild(outline);
  const olList = outline.querySelector("#ol-list");

  let bar = document.querySelector(".deck-bar");
  if (!bar) { bar = document.createElement("div"); bar.className = "deck-bar"; document.body.appendChild(bar); }
  const slidesBtn = document.createElement("button");
  slidesBtn.textContent = "Slides \u25a4";
  slidesBtn.title = "Show / hide slides (o)";
  const pdfBtn = document.createElement("button");
  pdfBtn.className = "pdf";
  pdfBtn.textContent = "\ud83d\udcc4 Leave-behind";
  pdfBtn.title = "Download a PDF to leave with the customer (p)";
  bar.appendChild(slidesBtn);
  bar.appendChild(pdfBtn);

  function title(s) {
    const h = s.querySelector("h1, h2");
    return (h ? h.textContent : "Slide").trim().slice(0, 70);
  }
  function visible() { return slides.filter(s => !hidden.has(+s.dataset.idx)); }

  function applyHidden() {
    slides.forEach(s => s.classList.toggle("is-hidden", hidden.has(+s.dataset.idx)));
    buildDots();
    if (hidden.has(cur)) { const v = visible(); if (v.length) cur = +v[0].dataset.idx; }
    update();
  }
  function buildDots() {
    const v = visible();
    dots.innerHTML = "";
    v.forEach(s => {
      const b = document.createElement("button");
      b.title = title(s);
      b.dataset.idx = s.dataset.idx;
      b.onclick = () => goto(+s.dataset.idx);
      dots.appendChild(b);
    });
    markDots();
  }
  function markDots() {
    dots.querySelectorAll("button").forEach(b => b.classList.toggle("active", +b.dataset.idx === cur));
  }
  function update() {
    const v = visible();
    const i = v.findIndex(s => +s.dataset.idx === cur);
    if (counter) counter.textContent = (i < 0 ? 1 : i + 1) + " / " + v.length;
    if (progress) progress.style.width = (((i < 0 ? 0 : i) + 1) / Math.max(v.length, 1)) * 100 + "%";
    markDots();
  }
  function goto(idx) { const el = slides[idx]; if (el) el.scrollIntoView(); }
  function step(dir) {
    const v = visible();
    let i = v.findIndex(s => +s.dataset.idx === cur);
    if (i < 0) i = 0;
    const ni = Math.min(Math.max(i + dir, 0), v.length - 1);
    goto(+v[ni].dataset.idx);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { cur = +e.target.dataset.idx; update(); } });
  }, { threshold: 0.55 });
  slides.forEach(s => io.observe(s));

  function toggleHide(idx) {
    if (hidden.has(idx)) hidden.delete(idx); else hidden.add(idx);
    localStorage.setItem(HKEY, JSON.stringify([...hidden]));
    applyHidden(); buildOutline();
  }
  function buildOutline() {
    olList.innerHTML = "";
    slides.forEach(s => {
      const idx = +s.dataset.idx, off = hidden.has(idx);
      const li = document.createElement("li");
      li.className = off ? "off" : "";
      li.innerHTML = '<span class="oi">' + (idx + 1) + '</span><span class="ot">' +
        title(s).replace(/</g, "&lt;") + '</span><span class="oe">' + (off ? "Hidden" : "Shown") + "</span>";
      li.onclick = () => toggleHide(idx);
      olList.appendChild(li);
    });
  }

  slidesBtn.onclick = () => outline.classList.add("open");
  pdfBtn.onclick = () => window.print();
  outline.querySelector("#ol-close").onclick = () => outline.classList.remove("open");
  outline.querySelector("#ol-all").onclick = () => {
    hidden.clear(); localStorage.setItem(HKEY, "[]"); applyHidden(); buildOutline();
  };

  const nextBtn = document.getElementById("next");
  const prevBtn = document.getElementById("prev");
  if (nextBtn) nextBtn.onclick = () => step(1);
  if (prevBtn) prevBtn.onclick = () => step(-1);

  document.addEventListener("keydown", (e) => {
    if (["ArrowRight", "ArrowDown", "PageDown", " "].includes(e.key)) { e.preventDefault(); step(1); }
    else if (["ArrowLeft", "ArrowUp", "PageUp"].includes(e.key)) { e.preventDefault(); step(-1); }
    else if (e.key === "Home") { const v = visible(); if (v.length) goto(+v[0].dataset.idx); }
    else if (e.key === "End") { const v = visible(); if (v.length) goto(+v[v.length - 1].dataset.idx); }
    else if (e.key === "o" || e.key === "O") { outline.classList.toggle("open"); }
    else if (e.key === "h" || e.key === "H") { toggleHide(cur); }
    else if (e.key === "p" || e.key === "P") { window.print(); }
    else if (e.key === "f" || e.key === "F") {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen();
      else document.exitFullscreen();
    }
  });

  applyHidden();
  buildOutline();
})();
