document.querySelectorAll(".interest-carousel").forEach((carousel) => {
  const track = carousel.querySelector(".interest-track");
  const slides = Array.from(carousel.querySelectorAll(".interest-slide"));
  const previousButton = carousel.querySelector("[data-interest-prev]");
  const nextButton = carousel.querySelector("[data-interest-next]");
  const status = carousel.querySelector(".interest-carousel-status");
  const controls = carousel.querySelector(".interest-carousel-controls");
  const viewport = carousel.querySelector(".interest-carousel-viewport");

  if (!track || !slides.length || !previousButton || !nextButton || !status || !controls || !viewport) {
    return;
  }

  let currentIndex = 0;
  let suppressClick = false;

  const visibleCount = () => window.matchMedia("(max-width: 760px)").matches ? 1 : 3;

  const showIndex = (index) => {
    const count = visibleCount();
    const maxIndex = Math.max(0, slides.length - count);
    currentIndex = Math.max(0, Math.min(index, maxIndex));
    const slideOffset = slides[currentIndex].getBoundingClientRect().left -
      slides[0].getBoundingClientRect().left;
    track.style.transform = `translateX(-${slideOffset}px)`;
    previousButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex === maxIndex;
    controls.hidden = slides.length <= count;
    status.textContent = `${Math.ceil((currentIndex + count) / count)} / ${Math.ceil(slides.length / count)}`;

    slides.forEach((slide, slideIndex) => {
      const isVisible = slideIndex >= currentIndex && slideIndex < currentIndex + count;
      slide.setAttribute("aria-hidden", String(!isVisible));
      slide.inert = !isVisible;
    });
  };

  previousButton.addEventListener("click", () => showIndex(currentIndex - visibleCount()));
  nextButton.addEventListener("click", () => showIndex(currentIndex + visibleCount()));

  let startPoint;
  viewport.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse") return;
    startPoint = { x: event.clientX, y: event.clientY };
  });

  viewport.addEventListener("pointerup", (event) => {
    if (!startPoint) return;
    const deltaX = event.clientX - startPoint.x;
    const deltaY = event.clientY - startPoint.y;
    startPoint = undefined;
    if (Math.abs(deltaX) < 40 || Math.abs(deltaX) < Math.abs(deltaY)) return;

    suppressClick = true;
    window.setTimeout(() => {
      suppressClick = false;
    }, 500);
    showIndex(currentIndex + (deltaX < 0 ? visibleCount() : -visibleCount()));
  });

  viewport.addEventListener("pointercancel", () => {
    startPoint = undefined;
  });

  viewport.addEventListener("click", (event) => {
    if (!suppressClick) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClick = false;
  }, true);

  window.addEventListener("resize", () => showIndex(currentIndex), { passive: true });
  showIndex(0);
});
