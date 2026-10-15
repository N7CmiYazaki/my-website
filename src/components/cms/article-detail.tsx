import type { Article } from "../../types/article";

type ArticleDetailProps = {
  article: Article;
};

export function ArticleDetail({ article }: ArticleDetailProps) {
  const paragraphs = article.body.split(/\n{2,}/).filter((paragraph) => paragraph.trim());
  const dateValue = article.created_at.includes("T")
    ? article.created_at
    : `${article.created_at.replace(" ", "T")}Z`;
  const createdAt = new Date(dateValue);
  const formattedDate = Number.isNaN(createdAt.getTime())
    ? null
    : new Intl.DateTimeFormat("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(createdAt);

  return (
    <main class="page-width article-main">
      <a class="text-link article-back" href="/#interests">
        <span aria-hidden="true">←</span> 記事一覧へ戻る
      </a>
      <article class={`article-detail interest-${article.theme}`}>
        <header class="article-header">
          <div class="article-category">
            <span class="interest-icon article-icon" aria-hidden="true">{article.icon}</span>
            <span>最近、気になること</span>
          </div>
          <h1>{article.title}</h1>
          <p class="article-excerpt">{article.excerpt}</p>
          {formattedDate && (
            <p class="article-date">
              <time datetime={article.created_at}>{formattedDate}</time>
            </p>
          )}
        </header>
        <div class="article-body">
          {paragraphs.map((paragraph) => <p>{paragraph}</p>)}
        </div>
      </article>
      <footer class="article-footer">
        <a class="article-footer-link" href="/#interests">
          <span aria-hidden="true">←</span>
          <span>記事一覧に戻る</span>
        </a>
      </footer>
    </main>
  );
}
