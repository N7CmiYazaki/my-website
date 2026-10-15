import type { InterestArticle } from "../../types/article";
import { InterestCard } from "./interest-card";

type InterestCarouselProps = {
  articles: InterestArticle[];
  label: string;
  showMoreOnMobile?: boolean;
};

export function InterestCarousel({
  articles,
  label,
  showMoreOnMobile = false,
}: InterestCarouselProps) {
  if (articles.length === 0) return null;
  const pages = Array.from(
    { length: Math.ceil(articles.length / 3) },
    (_, pageIndex) => articles.slice(pageIndex * 3, pageIndex * 3 + 3),
  );

  return (
    <>
      <div
        class={`interest-carousel${showMoreOnMobile ? " interest-carousel-expandable" : ""}`}
        data-interest-carousel
        aria-roledescription="カルーセル"
        aria-label={label}
      >
        <div class="interest-carousel-viewport">
          <div class="interest-track">
            {pages.map((pageArticles, pageIndex) => (
              <div
                class="interest-page interest-grid"
                role="group"
                aria-roledescription="スライド"
                aria-label={`${pageIndex + 1} / ${pages.length}`}
                aria-hidden={pageIndex > 0 ? "true" : undefined}
                inert={pageIndex > 0 ? true : undefined}
              >
                {pageArticles.map((article, articleIndex) => (
                  <InterestCard
                    article={article}
                    number={pageIndex * 3 + articleIndex + 1}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        {pages.length > 1 && (
          <div class="interest-carousel-controls">
            <button class="interest-carousel-button" type="button" data-interest-prev aria-label="前の3件" disabled>
              ←
            </button>
            <span class="interest-carousel-status" aria-live="polite">1 / {pages.length}</span>
            <button class="interest-carousel-button" type="button" data-interest-next aria-label="次の3件">
              →
            </button>
          </div>
        )}
      </div>
      {showMoreOnMobile && (
        <div class="interest-mobile-list">
          <div class="interest-grid">
            {articles.slice(0, 3).map((article, index) => (
              <InterestCard article={article} number={index + 1} />
            ))}
          </div>
          {articles.length > 3 && (
            <details class="interest-mobile-more">
              <summary>もっと見る</summary>
              <div class="interest-grid">
                {articles.slice(3).map((article, index) => (
                  <InterestCard article={article} number={index + 4} />
                ))}
              </div>
              <button class="interest-mobile-close" type="button" data-interest-close>
                閉じる <span aria-hidden="true">↑</span>
              </button>
            </details>
          )}
        </div>
      )}
    </>
  );
}
