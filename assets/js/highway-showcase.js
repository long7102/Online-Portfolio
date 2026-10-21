(() => {
  const track = document.getElementById("showcase-track");
  if (!track) return;

  const slides = [...track.querySelectorAll(".showcase-slide")];
  const previous = document.querySelector(".showcase-prev");
  const next = document.querySelector(".showcase-next");
  const count = document.querySelector(".showcase-count");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const activeIndex = () => {
    const left = track.scrollLeft;
    return slides.reduce((best, slide, index) =>
      Math.abs(slide.offsetLeft - track.offsetLeft - left) <
      Math.abs(slides[best].offsetLeft - track.offsetLeft - left) ? index : best, 0);
  };

  const update = () => {
    const index = activeIndex();
    count.textContent = `${String(index + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
    previous.disabled = index === 0;
    next.disabled = index === slides.length - 1;
  };

  const goTo = (index) => {
    const target = slides[Math.max(0, Math.min(slides.length - 1, index))];
    track.scrollTo({
      left: target.offsetLeft - track.offsetLeft,
      behavior: reducedMotion.matches ? "instant" : "smooth"
    });
  };

  previous.addEventListener("click", () => goTo(activeIndex() - 1));
  next.addEventListener("click", () => goTo(activeIndex() + 1));
  track.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    goTo(activeIndex() + (event.key === "ArrowRight" ? 1 : -1));
  });
  track.addEventListener("scroll", () => requestAnimationFrame(update), { passive: true });
  window.addEventListener("resize", update);
  update();
})();

