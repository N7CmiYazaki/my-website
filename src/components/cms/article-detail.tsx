import type { Article } from "../../types/article";

type ArticleDetailProps = {
  article: Article;
};

export function ArticleDetail({ article }: ArticleDetailProps) {
  return (
    <main class="page-width article-main">
      <a class="text-link article-back" href="/#interests">← 最近、気になること</a>
      <article class={`article-detail interest-${article.theme}`}>
        <div class="interest-icon article-icon" aria-hidden="true">{article.icon}</div>
        <h1>{article.title}</h1>
        <p class="article-excerpt">{article.excerpt}</p>
        <div class="article-divider"></div>
        <div class="article-body">{article.body}</div>
      </article>
      <a class="text-link" href="/#interests">ほかの記事も読む <span aria-hidden="true">↗</span></a>
    </main>
  );
}
