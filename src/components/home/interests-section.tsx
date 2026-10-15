import type { InterestArticle } from "../../types/article";
import { InterestCard } from "./interest-card";

type InterestsSectionProps = {
  articles: InterestArticle[];
};

export function InterestsSection({ articles }: InterestsSectionProps) {
  const pages = Array.from(
    { length: Math.ceil(articles.length / 3) },
    (_, pageIndex) => articles.slice(pageIndex * 3, pageIndex * 3 + 3),
  );

  return (
    <section class="interests-section page-width" id="interests" aria-labelledby="interests-title">
      <div class="interests-heading">
        <div>
          <p class="eyebrow">THINGS I LIKE</p>
          <h2 id="interests-title">最近、気になること</h2>
        </div>
        <span class="heading-spark" aria-hidden="true">✳</span>
      </div>
      {pages.length > 0 && (
        <div class="interest-carousel" aria-roledescription="カルーセル" aria-label="気になる記事">
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
              <button class="interest-carousel-button" type="button" data-interest-prev aria-label="前の3件">
                ←
              </button>
              <span class="interest-carousel-status" aria-live="polite">1 / {pages.length}</span>
              <button class="interest-carousel-button" type="button" data-interest-next aria-label="次の3件">
                →
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
