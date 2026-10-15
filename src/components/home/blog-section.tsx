import type { InterestArticle } from "../../types/article";
import { InterestCarousel } from "./interest-carousel";

type BlogSectionProps = {
  articles: InterestArticle[];
};

export function BlogSection({ articles }: BlogSectionProps) {
  return (
    <section class="blog-section" aria-labelledby="blog-title">
      <div class="page-width">
        <div class="blog-heading">
          <div>
            <p class="eyebrow">LATEST NOTES</p>
            <h2 id="blog-title">ブログ記事</h2>
            <p class="blog-description">気づいたことや、学んだことを記事にしています。</p>
          </div>
          <div class="blog-heading-aside">
            <span class="home-swipe-hint" aria-label="右にスワイプして最近、気になることへ戻る">
              Slide to right <span aria-hidden="true">→</span>
            </span>
            <span class="blog-heading-mark" aria-hidden="true">✎</span>
          </div>
        </div>
        {articles.length > 0
          ? <InterestCarousel articles={articles} label="ブログ記事" />
          : <p class="blog-empty">ブログ記事を準備中です。</p>}
      </div>
    </section>
  );
}
