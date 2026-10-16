document.querySelectorAll("[data-interest-carousel]").forEach((carousel) => {
  const track = carousel.querySelector(".interest-track");
  const pages = Array.from(carousel.querySelectorAll(".interest-page"));
  const previousButton = carousel.querySelector("[data-interest-prev]");
  const nextButton = carousel.querySelector("[data-interest-next]");
  const status = carousel.querySelector(".interest-carousel-status");

  if (!track || !pages.length || !previousButton || !nextButton || !status) {
    return;
  }

  let currentPage = 0;

  const showPage = (pageIndex) => {
    currentPage = Math.max(0, Math.min(pageIndex, pages.length - 1));
    const offset = pages[currentPage].getBoundingClientRect().left -
      pages[0].getBoundingClientRect().left;
    track.style.transform = `translateX(-${offset}px)`;
    previousButton.disabled = currentPage === 0;
    nextButton.disabled = currentPage === pages.length - 1;
    status.textContent = `${currentPage + 1} / ${pages.length}`;

    pages.forEach((page, index) => {
      const isCurrent = index === currentPage;
      page.setAttribute("aria-hidden", String(!isCurrent));
      page.inert = !isCurrent;
    });
  };

  previousButton.addEventListener("click", () => showPage(currentPage - 1));
  nextButton.addEventListener("click", () => showPage(currentPage + 1));
  window.addEventListener("resize", () => showPage(currentPage), { passive: true });
  showPage(0);
});

document.querySelectorAll("[data-section-carousel]").forEach((carousel) => {
  const track = carousel.querySelector(".home-section-track");
  const panels = Array.from(carousel.querySelectorAll("[data-home-panel]"));
  const previousButton = carousel.querySelector("[data-home-prev]");
  const nextButton = carousel.querySelector("[data-home-next]");
  const status = carousel.querySelector("[data-home-status]");
  const mobileQuery = window.matchMedia("(max-width: 760px)");

  if (!track || panels.length < 2 || !previousButton || !nextButton || !status) {
    return;
  }

  let currentPanel = 0;
  let startPoint;
  let suppressClick = false;

  const showPanel = (index) => {
    currentPanel = Math.max(0, Math.min(index, panels.length - 1));
    const offset = panels[currentPanel].getBoundingClientRect().left -
      panels[0].getBoundingClientRect().left;
    track.style.transform = `translateX(-${offset}px)`;
    panels.forEach((panel, panelIndex) => {
      const isCurrent = panelIndex === currentPanel;
      panel.setAttribute("aria-hidden", String(!isCurrent));
      panel.inert = !isCurrent;
    });
    previousButton.disabled = currentPanel === 0;
    nextButton.disabled = currentPanel === panels.length - 1;
    status.textContent = mobileQuery.matches
      ? currentPanel === 0
        ? carousel.dataset.nextStatus || "スワイプしてブログ記事を見る"
        : carousel.dataset.previousStatus || "スワイプして最近、気になることへ戻る"
      : "矢印でセクションを切り替え";
  };

  previousButton.addEventListener("click", () => showPanel(currentPanel - 1));
  nextButton.addEventListener("click", () => showPanel(currentPanel + 1));

  carousel.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    startPoint = { x: event.clientX, y: event.clientY };
  });

  carousel.addEventListener("pointerup", (event) => {
    if (!startPoint) return;
    const deltaX = event.clientX - startPoint.x;
    const deltaY = event.clientY - startPoint.y;
    startPoint = undefined;
    if (Math.abs(deltaX) < 50 || Math.abs(deltaX) < Math.abs(deltaY)) return;

    suppressClick = true;
    window.setTimeout(() => {
      suppressClick = false;
    }, 500);
    showPanel(currentPanel + (deltaX < 0 ? 1 : -1));
  });

  carousel.addEventListener("pointercancel", () => {
    startPoint = undefined;
  });

  carousel.addEventListener("click", (event) => {
    if (!suppressClick) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClick = false;
  }, true);

  mobileQuery.addEventListener("change", () => showPanel(currentPanel));
  window.addEventListener("resize", () => showPanel(currentPanel), { passive: true });
  showPanel(0);
});

document.querySelectorAll(".interest-mobile-more").forEach((details) => {
  const summary = details.querySelector("summary");
  const closeButton = details.querySelector("[data-interest-close]");
  if (!summary || !closeButton) return;

  details.addEventListener("toggle", () => {
    if (details.open) {
      summary.tabIndex = -1;
      summary.setAttribute("aria-hidden", "true");
    } else {
      summary.tabIndex = 0;
      summary.removeAttribute("aria-hidden");
    }
  });

  closeButton.addEventListener("click", () => {
    details.open = false;
    summary.focus();
  });
});
