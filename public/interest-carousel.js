document.querySelectorAll(".interest-carousel").forEach((carousel) => {
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
    track.style.transform = `translateX(-${currentPage * 100}%)`;
    previousButton.disabled = currentPage === 0;
    nextButton.disabled = currentPage === pages.length - 1;
    status.textContent = `${currentPage + 1} / ${pages.length}`;

    pages.forEach((page, index) => {
      const isCurrentPage = index === currentPage;
      page.setAttribute("aria-hidden", String(!isCurrentPage));
      page.inert = !isCurrentPage;
    });
  };

  previousButton.addEventListener("click", () => showPage(currentPage - 1));
  nextButton.addEventListener("click", () => showPage(currentPage + 1));
  showPage(0);
});
