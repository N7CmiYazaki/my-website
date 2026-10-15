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
          <h2 id="interests-title">最近、気になること</h2>
        </div>
        <span class="heading-spark" aria-hidden="true">✳</span>
      </div>
      <InterestCarousel articles={articles} label="気になる記事" showMoreOnMobile />
    </section>
  );
}
