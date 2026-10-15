import type { Article } from "../../types/article";
import type { JSX } from "hono/jsx/jsx-runtime";

type ArticleDetailProps = {
  article: Article;
};

function safeContentUrl(url: string) {
  const value = url.trim();
  return (
    value.startsWith("#") ||
    (value.startsWith("/") && !value.startsWith("//")) ||
    /^https?:\/\//i.test(value) ||
    /^mailto:/i.test(value)
  );
}

function safeImageUrl(url: string) {
  const value = url.trim();
  return (
    (value.startsWith("/") && !value.startsWith("//")) ||
    /^https?:\/\//i.test(value)
  );
}

function renderInline(text: string): JSX.Element {
  return (
    <>
      {text.split(/(\[[^\]]+\]\([^)]+\))/g).map((part) => {
        const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
        if (link && safeContentUrl(link[2])) {
          return <a href={link[2]}>{link[1]}</a>;
        }
        return part;
      })}
    </>
  );
}

function renderBody(body: string) {
  return body
    .split(/\n[ \t]*\n+/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, index) => {
      const heading = /^(#{1,3})\s+(.+?)(?:\s+\{#([A-Za-z][A-Za-z0-9_-]*)\})?$/.exec(block);
      if (heading) {
        const level = heading[1].length;
        const text = heading[2];
        const id = heading[3] ?? `section-${index + 1}`;
        if (level === 1) return <h1 id={id}>{renderInline(text)}</h1>;
        if (level === 2) return <h2 id={id}>{renderInline(text)}</h2>;
        return <h3 id={id}>{renderInline(text)}</h3>;
      }

      const image = /^!\[([^\]]*)\]\(([^)\s]+)\)$/.exec(block);
      if (image && safeImageUrl(image[2])) {
        return <figure><img src={image[2]} alt={image[1]} loading="lazy" /></figure>;
      }

      return (
        <p>
          {block.split("\n").map((line, lineIndex) => (
            <>
              {lineIndex > 0 && <br />}
              {renderInline(line)}
            </>
          ))}
        </p>
      );
    });
}

export function ArticleDetail({ article }: ArticleDetailProps) {
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
      <article class="article-detail" data-theme={article.theme}>
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
          {renderBody(article.body)}
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
