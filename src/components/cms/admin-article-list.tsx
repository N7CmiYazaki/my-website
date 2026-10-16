import type { Article } from "../../types/article";
import { AdminArticleRow } from "./admin-article-row";

type AdminArticleListProps = {
  articles: Article[];
};

export function AdminArticleList({ articles }: AdminArticleListProps) {
  const interestArticles = articles.filter((article) => article.article_type === "interest");
  const blogArticles = articles.filter((article) => article.article_type === "blog");

  return (
    <main class="page-width cms-main">
      <div class="cms-page-heading">
        <div>
          <p class="eyebrow">CONTENT MANAGEMENT</p>
          <h1>記事を管理</h1>
          <p class="cms-intro">「自分が大事だと思っていること」と「ブログ記事」の作成、編集、公開状態を管理できます。</p>
        </div>
        <form action="/admin/logout" method="post">
          <button class="button button-secondary" type="submit">ログアウト</button>
        </form>
      </div>
      <div class="cms-list-toolbar">
        <span>{articles.length} 件の記事</span>
        <a class="button button-primary" href="/admin/articles/new">＋ 新しい記事</a>
      </div>
      <div
        class="cms-section-carousel"
        data-section-carousel
        data-next-status="スワイプしてブログ記事へ"
        data-previous-status="スワイプして自分が大事だと思っていることへ"
      >
        <div class="home-section-track">
          <div class="home-section-panel" data-home-panel>
            <section class="cms-article-list-panel" aria-labelledby="cms-interests-title">
              <div class="cms-list-section-heading">
                <h2 id="cms-interests-title">自分が大事だと思っていること</h2>
                <span>{interestArticles.length} 件</span>
                <span class="home-swipe-hint" aria-label="左にスワイプしてブログ記事へ">
                  <span aria-hidden="true">←</span> Slide to left
                </span>
              </div>
              <section class="cms-article-list" aria-label="自分が大事だと思っていることの記事">
                {interestArticles.length === 0
                  ? <div class="cms-panel"><p>記事はまだありません。</p></div>
                  : interestArticles.map((article) => <AdminArticleRow article={article} />)}
              </section>
            </section>
          </div>
          <div class="home-section-panel" data-home-panel>
            <section class="cms-article-list-panel" aria-labelledby="cms-blog-title">
              <div class="cms-list-section-heading">
                <h2 id="cms-blog-title">ブログ記事</h2>
                <span>{blogArticles.length} 件</span>
                <span class="home-swipe-hint" aria-label="右にスワイプして自分が大事だと思っていることへ">
                  Slide to right <span aria-hidden="true">→</span>
                </span>
              </div>
              <section class="cms-article-list" aria-label="ブログ記事">
                {blogArticles.length === 0
                  ? <div class="cms-panel"><p>記事はまだありません。</p></div>
                  : blogArticles.map((article) => <AdminArticleRow article={article} />)}
              </section>
            </section>
          </div>
        </div>
        <div class="home-section-controls">
          <button
            class="interest-carousel-button"
            type="button"
            data-home-prev
            aria-label="自分が大事だと思っていることへ戻る"
            disabled
          >
            ←
          </button>
          <span class="home-section-hint" data-home-status aria-live="polite">
            スワイプしてブログ記事へ
          </span>
          <button
            class="interest-carousel-button"
            type="button"
            data-home-next
            aria-label="ブログ記事を見る"
          >
            →
          </button>
        </div>
      </div>
    </main>
  );
}
