import type { Article } from "../../types/article";
import { AdminArticleRow } from "./admin-article-row";

type AdminArticleListProps = {
  articles: Article[];
};

export function AdminArticleList({ articles }: AdminArticleListProps) {
  return (
    <main class="page-width cms-main">
      <div class="cms-page-heading">
        <div>
          <p class="eyebrow">CONTENT MANAGEMENT</p>
          <h1>記事を管理</h1>
          <p class="cms-intro">「最近、気になること」と「ブログ記事」の作成、編集、公開状態を管理できます。</p>
        </div>
        <form action="/admin/logout" method="post">
          <button class="button button-secondary" type="submit">ログアウト</button>
        </form>
      </div>
      <div class="cms-list-toolbar">
        <span>{articles.length} 件の記事</span>
        <a class="button button-primary" href="/admin/articles/new">＋ 新しい記事</a>
      </div>
      <section class="cms-article-list" aria-label="記事一覧">
        {articles.length === 0 ? (
          <div class="cms-panel"><p>記事はまだありません。</p></div>
        ) : articles.map((article) => <AdminArticleRow article={article} />)}
      </section>
    </main>
  );
}
