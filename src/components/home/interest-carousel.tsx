import type { InterestArticle } from "../../types/article";
import { InterestCard } from "./interest-card";

type InterestCarouselProps = {
  articles: InterestArticle[];
  label: string;
};

export function InterestCarousel({ articles, label }: InterestCarouselProps) {
  if (articles.length === 0) return null;

  return (
    <div class="interest-carousel" aria-roledescription="カルーセル" aria-label={label}>
      <div class="interest-carousel-viewport">
        <div class="interest-track">
          {articles.map((article, index) => (
            <div
              class="interest-slide"
              role="group"
              aria-roledescription="スライド"
              aria-label={`${index + 1} / ${articles.length}`}
              aria-hidden={index > 2 ? "true" : undefined}
              inert={index > 2 ? true : undefined}
            >
              <InterestCard article={article} number={index + 1} />
            </div>
          ))}
        </div>
      </div>
      {articles.length > 1 && (
        <div class="interest-carousel-controls">
          <button class="interest-carousel-button" type="button" data-interest-prev aria-label="前の記事">
            ←
          </button>
          <span class="interest-carousel-status" aria-live="polite">1 / {articles.length}</span>
          <button class="interest-carousel-button" type="button" data-interest-next aria-label="次の記事">
            →
          </button>
        </div>
      )}
    </div>
  );
}
