// deck.js — minimal slide navigation engine
(function () {
  const slides = Array.from(document.querySelectorAll(".slide"));
  const total = slides.length;
  let idx = 0;

  const progress = document.querySelector(".progress");
  const counter = document.querySelector(".counter");

  function clamp(n) {
    return Math.max(0, Math.min(total - 1, n));
  }

  function show(n) {
    idx = clamp(n);
    slides.forEach((s, i) => s.classList.toggle("active", i === idx));
    if (progress) progress.style.width = ((idx + 1) / total) * 100 + "%";
    if (counter) counter.textContent = idx + 1 + " / " + total;
    if (history.replaceState) history.replaceState(null, "", "#" + (idx + 1));
  }

  function next() { show(idx + 1); }
  function prev() { show(idx - 1); }

  document.addEventListener("keydown", (e) => {
    if (["ArrowRight", "PageDown", " "].includes(e.key)) { e.preventDefault(); next(); }
    else if (["ArrowLeft", "PageUp"].includes(e.key)) { e.preventDefault(); prev(); }
    else if (e.key === "Home") { e.preventDefault(); show(0); }
    else if (e.key === "End") { e.preventDefault(); show(total - 1); }
    else if (e.key === "f" || e.key === "F") {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen();
      else document.exitFullscreen();
    }
  });

  // Click right half = next, left half = prev (ignore clicks on links/buttons)
  document.querySelector(".deck").addEventListener("click", (e) => {
    if (e.target.closest("a, button")) return;
    if (e.clientX > window.innerWidth / 2) next();
    else prev();
  });

  const nextBtn = document.getElementById("next");
  const prevBtn = document.getElementById("prev");
  if (nextBtn) nextBtn.addEventListener("click", (e) => { e.stopPropagation(); next(); });
  if (prevBtn) prevBtn.addEventListener("click", (e) => { e.stopPropagation(); prev(); });

  // Start on hash slide if present
  const start = parseInt((location.hash || "").replace("#", ""), 10);
  show(Number.isFinite(start) && start > 0 ? start - 1 : 0);
})();
