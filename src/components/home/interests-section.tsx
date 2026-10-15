import type { InterestArticle } from "../../types/article";
import { InterestCard } from "./interest-card";

type InterestsSectionProps = {
  articles: InterestArticle[];
};

export function InterestsSection({ articles }: InterestsSectionProps) {
  return (
    <section class="interests-section page-width" id="interests" aria-labelledby="interests-title">
      <div class="interests-heading">
        <div>
          <p class="eyebrow">THINGS I LIKE</p>
          <h2 id="interests-title">最近、気になること</h2>
        </div>
        <span class="heading-spark" aria-hidden="true">✳</span>
      </div>
      {articles.length > 0 && (
        <div class="interest-carousel" aria-label="気になる記事">
          <div class="interest-track">
            <div class="interest-track-group">
              {articles.map((article, index) => (
                <InterestCard article={article} number={index + 1} />
              ))}
            </div>
            <div class="interest-track-group" aria-hidden="true">
              {articles.map((article, index) => (
                <InterestCard article={article} number={index + 1} isDuplicate />
              ))}
            </div>
          </div>
        </div>
      )}
      <div class="interest-grid interest-mobile-grid">
        {articles.slice(0, 3).map((article, index) => (
          <InterestCard article={article} number={index + 1} />
        ))}
      </div>
      {articles.length > 3 && (
        <details class="interest-mobile-more">
          <summary>
            <span class="interest-more-open">もっと見る</span>
            <span class="interest-more-close">閉じる</span>
          </summary>
          <div class="interest-grid">
            {articles.slice(3).map((article, index) => (
              <InterestCard article={article} number={index + 4} />
            ))}
          </div>
        </details>
      )}
    </section>
  );
}
