import type { Article } from "../../types/article";

type AdminArticleRowProps = {
  article: Article;
};

export function AdminArticleRow({ article }: AdminArticleRowProps) {
  return (
    <article class="cms-list-item">
      <div class={`interest-icon list-icon interest-${article.theme}`} aria-hidden="true">{article.icon}</div>
      <div class="cms-list-copy">
        <h2>{article.title}</h2>
        <p>{article.article_type === "blog" ? "ブログ記事" : "自分が大事だと思っていること"} ・ {article.excerpt}</p>
      </div>
      <span class={`status-badge ${article.published ? "status-published" : "status-draft"}`}>
        {article.published ? "公開中" : "下書き"}
      </span>
      <div class="cms-list-actions">
        {article.published === 1 && <a href={`/articles/${article.id}`}>表示</a>}
        <a href={`/admin/articles/${article.id}/edit`}>編集</a>
        <form action={`/admin/articles/${article.id}/delete`} method="post">
          <button class="danger-link" type="submit">削除</button>
        </form>
      </div>
    </article>
  );
}
