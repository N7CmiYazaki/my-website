import type { InterestArticle } from "../../types/article";
import { InterestCarousel } from "./interest-carousel";

type InterestsSectionProps = {
  articles: InterestArticle[];
};

export function InterestsSection({ articles }: InterestsSectionProps) {
  return (
    <section class="interests-section page-width" id="interests" aria-labelledby="interests-title">
      <div class="interests-heading">
        <div>
          <p class="eyebrow">THINGS I LIKE</p>
          <h2 id="interests-title">自分が大事だと思っていること。</h2>
        </div>
        <div class="interests-heading-aside">
          <span class="home-swipe-hint" aria-label="左にスワイプしてブログ記事へ">
            <span aria-hidden="true">←</span> Slide to left
          </span>
          <span class="heading-spark" aria-hidden="true">✳</span>
        </div>
      </div>
      <InterestCarousel articles={articles} label="気になる記事" showMoreOnMobile />
    </section>
  );
}
