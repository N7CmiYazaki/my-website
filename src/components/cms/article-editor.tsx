import type { Article } from "../../types/article";

const articleIcons = ["✳", "⌘", "◉", "✦", "♡", "⚡", "☼", "✿"];
const articleThemes = [
  { value: "red", label: "レッド" },
  { value: "yellow", label: "イエロー" },
  { value: "green", label: "グリーン" },
  { value: "blue", label: "ブルー" },
  { value: "purple", label: "パープル" },
] as const;

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
            <div class="article-editor-toolbar" aria-label="本文の書式">
              <button type="button" data-insert-prefix="# ">H1</button>
              <button type="button" data-insert-prefix="## ">H2</button>
              <button type="button" data-insert-prefix="### ">H3</button>
              <button type="button" data-insert-link>リンク</button>
              <button type="button" data-insert-anchor>飛びリンク</button>
              <button type="button" data-insert-heading-anchor>飛び先見出し</button>
              <button type="button" data-insert-image-url>画像URL</button>
              <button type="button" data-upload-image>画像をアップロード</button>
              <input
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                data-image-file
                hidden
              />
            </div>
            <textarea name="body" rows={18} required data-article-body>{article?.body ?? ""}</textarea>
            <span class="field-hint">
              空行で段落を分けます。書式ボタンを使うか、
              <code># 見出し</code>、<code>## 見出し</code>、<code>### 見出し</code>、
              <code>[リンク文字](https://...)</code>、<code>![画像の説明](画像URL)</code> の形式で記述できます。
              飛びリンク先には <code>## 見出し {"{#section-id}"}</code> のようにIDを付けてください。
            </span>
            <span class="field-hint" role="status" data-editor-status></span>
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
                {articleThemes.map((theme) => (
                  <option
                    value={theme.value}
                    selected={(article?.theme ?? "blue") === theme.value}
                  >
                    {theme.label}
                  </option>
                ))}
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
