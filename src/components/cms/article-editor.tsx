import type { Article } from "../../types/article";

const articleIcons = ["✳", "⌘", "◉", "✦", "♡", "⚡", "☼", "✿"];

type ArticleEditorProps = {
  article?: Article;
  error?: string;
};

export function ArticleEditor({ article, error = "" }: ArticleEditorProps) {
  const isEditing = article !== undefined;
  return (
    <main class="page-width cms-main">
      <div class="cms-page-heading">
        <div>
          <p class="eyebrow">ARTICLE EDITOR</p>
          <h1>{isEditing ? "記事を編集" : "新しい記事"}</h1>
        </div>
        <a class="text-link" href="/admin">一覧に戻る <span aria-hidden="true">↗</span></a>
      </div>
      <section class="cms-panel">
        {error && <p class="form-error" role="alert">{error}</p>}
        <form
          action={isEditing ? `/admin/articles/${article.id}` : "/admin/articles"}
          method="post"
          class="cms-form"
        >
          <label>
            記事タイトル
            <input name="title" maxlength={100} required value={article?.title ?? ""} />
          </label>
          <label>
            カードの説明
            <textarea name="excerpt" rows={2} maxlength={200} required>{article?.excerpt ?? ""}</textarea>
          </label>
          <label>
            記事本文
            <textarea name="body" rows={14} required>{article?.body ?? ""}</textarea>
            <span class="field-hint">改行はそのまま記事に表示されます。</span>
          </label>
          <div class="form-row">
            <label>
              アイコン
              <select name="icon" required>
                {article?.icon && !articleIcons.includes(article.icon) && (
                  <option value={article.icon} selected>{article.icon}</option>
                )}
                {articleIcons.map((icon) => (
                  <option value={icon} selected={(article?.icon ?? "✳") === icon}>
                    {icon}
                  </option>
                ))}
              </select>
            </label>
            <label>
              カードの色
              <select name="theme">
                <option value="blue" selected={(article?.theme ?? "blue") === "blue"}>ブルー</option>
                <option value="yellow" selected={article?.theme === "yellow"}>イエロー</option>
                <option value="green" selected={article?.theme === "green"}>グリーン</option>
              </select>
            </label>
          </div>
          <label class="checkbox-label">
            <input
              type="checkbox"
              name="published"
              checked={article ? article.published === 1 : true}
            />
            公開する
          </label>
          <div class="form-actions">
            <button class="button button-primary" type="submit">
              {isEditing ? "変更を保存" : "記事を作成"}
            </button>
            <a class="button button-secondary" href="/admin">キャンセル</a>
          </div>
        </form>
      </section>
    </main>
  );
}
