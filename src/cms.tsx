import { Hono } from "hono";
import type { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import type { JSX } from "hono/jsx/jsx-runtime";
import type { Bindings } from "./env";

type Article = {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  icon: string;
  theme: "blue" | "yellow" | "green";
  published: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

const cms = new Hono<{ Bindings: Bindings }>();
const sessionCookie = "admin_session";
const sessionLifetime = 60 * 60 * 12;
const textEncoder = new TextEncoder();

function document(title: string, content: JSX.Element, description = title) {
  return (
    <html lang="ja">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={description} />
        <link rel="stylesheet" href="/styles.css" />
        <title>{title} — Yazaki</title>
      </head>
      <body>
        <header class="site-header">
          <a class="wordmark" href="/" aria-label="Yazaki ホーム">
            <span class="wordmark-mark" aria-hidden="true">Y</span>
            <span>Yazaki</span>
          </a>
          <nav class="site-nav" aria-label="メインナビゲーション">
            <a href="/">ホーム</a>
            <a href="/admin">管理画面</a>
          </nav>
        </header>
        {content}
        <footer class="site-footer">
          <a class="wordmark footer-wordmark" href="/">
            <span class="wordmark-mark" aria-hidden="true">Y</span>
            <span>Yazaki</span>
          </a>
          <p>Made with curiosity <span aria-hidden="true">✳</span></p>
          <a class="back-to-top" href="/">ホームへ戻る ↑</a>
        </footer>
      </body>
    </html>
  );
}

function configReady(
  env: Bindings,
): env is Bindings & { ADMIN_PASSWORD: string; ADMIN_SESSION_SECRET: string } {
  return Boolean(
    env.ADMIN_PASSWORD &&
      env.ADMIN_SESSION_SECRET &&
      textEncoder.encode(env.ADMIN_SESSION_SECRET).length >= 32,
  );
}

async function passwordMatches(input: string, expected: string) {
  const [inputHash, expectedHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", textEncoder.encode(input)),
    crypto.subtle.digest("SHA-256", textEncoder.encode(expected)),
  ]);
  const inputBytes = new Uint8Array(inputHash);
  const expectedBytes = new Uint8Array(expectedHash);
  let difference = 0;
  for (let index = 0; index < inputBytes.length; index += 1) {
    difference |= inputBytes[index] ^ expectedBytes[index];
  }
  return difference === 0;
}

async function sessionKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function encodeBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function decodeBase64Url(value: string) {
  if (!/^[A-Za-z0-9_-]{43}$/.test(value)) return null;
  const binary = atob(value.replaceAll("-", "+").replaceAll("_", "/") + "=");
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function createSessionToken(secret: string) {
  const expiresAt = String(Date.now() + sessionLifetime * 1000);
  const key = await sessionKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, textEncoder.encode(expiresAt));
  return `${expiresAt}.${encodeBase64Url(new Uint8Array(signature))}`;
}

async function hasAdminSession(cookie: string | undefined, secret: string) {
  if (!cookie) return false;
  const [expiresAt, signature, extra] = cookie.split(".");
  if (extra !== undefined || !/^\d{13}$/.test(expiresAt)) return false;
  const expiration = Number(expiresAt);
  if (expiration <= Date.now() || expiration > Date.now() + sessionLifetime * 1000) return false;
  const signatureBytes = decodeBase64Url(signature);
  if (!signatureBytes) return false;
  return crypto.subtle.verify(
    "HMAC",
    await sessionKey(secret),
    signatureBytes,
    textEncoder.encode(expiresAt),
  );
}

async function adminRequired(c: Context<{ Bindings: Bindings }>) {
  if (!configReady(c.env)) {
    return c.text("管理者認証が設定されていません。README の CMS セットアップ手順を確認してください。", 503);
  }
  if (
    !(await hasAdminSession(
      getCookie(c, sessionCookie),
      c.env.ADMIN_SESSION_SECRET,
    ))
  ) {
    return c.redirect("/admin", 303);
  }
  return null;
}

function loginPage(error = "") {
  return document(
    "管理者ログイン",
    <main class="page-width cms-main">
      <section class="cms-panel login-panel">
        <p class="eyebrow">ADMINISTRATOR</p>
        <h1>管理画面にログイン</h1>
        <p class="cms-intro">記事を編集するには管理者パスワードを入力してください。</p>
        {error && <p class="form-error" role="alert">{error}</p>}
        <form action="/admin/login" method="post" class="cms-form">
          <label>
            管理者パスワード
            <input name="password" type="password" autocomplete="current-password" required />
          </label>
          <button class="button button-primary" type="submit">ログイン</button>
        </form>
      </section>
    </main>,
  );
}

function articleForm(article?: Article, error = "") {
  const isEditing = article !== undefined;
  return document(
    isEditing ? "記事を編集" : "記事を作成",
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
              <input name="icon" maxlength={8} required value={article?.icon ?? "✳"} />
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
    </main>,
  );
}

function articleFields(body: Record<string, unknown>) {
  const readText = (key: string, maxLength: number) => {
    const value = body[key];
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed.length > 0 && trimmed.length <= maxLength ? trimmed : null;
  };

  const title = readText("title", 100);
  const excerpt = readText("excerpt", 200);
  const articleBody = readText("body", 20000);
  const icon = readText("icon", 8);
  const theme = readText("theme", 10);
  if (
    !title ||
    !excerpt ||
    !articleBody ||
    !icon ||
    (theme !== "blue" && theme !== "yellow" && theme !== "green")
  ) {
    return null;
  }
  return {
    title,
    excerpt,
    body: articleBody,
    icon,
    theme,
    published: body.published === "on" ? 1 : 0,
  };
}

cms.get("/articles/:id", async (c) => {
  const article = await c.env.DB.prepare(
    "SELECT * FROM articles WHERE id = ? AND published = 1",
  )
    .bind(c.req.param("id"))
    .first<Article>();
  if (!article) {
    return c.html(
      document("記事が見つかりません", <main class="page-width cms-main"><h1>記事が見つかりませんでした</h1><a class="text-link" href="/#interests">記事一覧に戻る</a></main>),
      404,
    );
  }
  return c.html(
    document(
      article.title,
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
      </main>,
      article.excerpt,
    ),
  );
});

cms.get("/admin", async (c) => {
  if (!configReady(c.env)) {
    return c.text("管理者認証が設定されていません。README の CMS セットアップ手順を確認してください。", 503);
  }
  if (
    !(await hasAdminSession(
      getCookie(c, sessionCookie),
      c.env.ADMIN_SESSION_SECRET,
    ))
  ) {
    return c.html(loginPage());
  }
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM articles ORDER BY sort_order, created_at DESC",
  ).all<Article>();
  return c.html(
    document(
      "記事管理",
      <main class="page-width cms-main">
        <div class="cms-page-heading">
          <div>
            <p class="eyebrow">CONTENT MANAGEMENT</p>
            <h1>記事を管理</h1>
            <p class="cms-intro">記事の作成、編集、公開状態を管理できます。</p>
          </div>
          <form action="/admin/logout" method="post">
            <button class="button button-secondary" type="submit">ログアウト</button>
          </form>
        </div>
        <div class="cms-list-toolbar">
          <span>{results.length} 件の記事</span>
          <a class="button button-primary" href="/admin/articles/new">＋ 新しい記事</a>
        </div>
        <section class="cms-article-list" aria-label="記事一覧">
          {results.length === 0 ? (
            <div class="cms-panel"><p>記事はまだありません。</p></div>
          ) : results.map((article) => (
            <article class="cms-list-item" key={article.id}>
              <div class={`interest-icon list-icon interest-${article.theme}`} aria-hidden="true">{article.icon}</div>
              <div class="cms-list-copy">
                <h2>{article.title}</h2>
                <p>{article.excerpt}</p>
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
          ))}
        </section>
      </main>,
    ),
  );
});

cms.post("/admin/login", async (c) => {
  if (!configReady(c.env)) {
    return c.text("管理者認証が設定されていません。README の CMS セットアップ手順を確認してください。", 503);
  }
  const body = await c.req.parseBody();
  const password = typeof body.password === "string" ? body.password : "";
  if (!(await passwordMatches(password, c.env.ADMIN_PASSWORD))) {
    return c.html(loginPage("パスワードが正しくありません。"), 401);
  }
  setCookie(c, sessionCookie, await createSessionToken(c.env.ADMIN_SESSION_SECRET), {
    path: "/admin",
    httpOnly: true,
    secure: new URL(c.req.url).protocol === "https:",
    sameSite: "Strict",
    maxAge: sessionLifetime,
  });
  return c.redirect("/admin", 303);
});

cms.post("/admin/logout", async (c) => {
  const unauthorized = await adminRequired(c);
  if (unauthorized) return unauthorized;
  setCookie(c, sessionCookie, "", {
    path: "/admin",
    httpOnly: true,
    secure: new URL(c.req.url).protocol === "https:",
    sameSite: "Strict",
    maxAge: 0,
  });
  return c.redirect("/admin", 303);
});

cms.get("/admin/articles/new", async (c) => {
  const unauthorized = await adminRequired(c);
  if (unauthorized) return unauthorized;
  return c.html(articleForm());
});

cms.get("/admin/articles/:id/edit", async (c) => {
  const unauthorized = await adminRequired(c);
  if (unauthorized) return unauthorized;
  const article = await c.env.DB.prepare("SELECT * FROM articles WHERE id = ?")
    .bind(c.req.param("id"))
    .first<Article>();
  if (!article) return c.text("記事が見つかりません。", 404);
  return c.html(articleForm(article));
});

cms.post("/admin/articles", async (c) => {
  const unauthorized = await adminRequired(c);
  if (unauthorized) return unauthorized;
  const body = await c.req.parseBody();
  const fields = articleFields(body);
  if (!fields) return c.html(articleForm(undefined, "入力内容を確認してください。"), 400);
  const maxOrder = await c.env.DB.prepare("SELECT MAX(sort_order) AS max_order FROM articles")
    .first<{ max_order: number | null }>();
  await c.env.DB.prepare(
    `INSERT INTO articles (id, title, excerpt, body, icon, theme, published, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(crypto.randomUUID(), fields.title, fields.excerpt, fields.body, fields.icon, fields.theme, fields.published, (maxOrder?.max_order ?? 0) + 1)
    .run();
  return c.redirect("/admin", 303);
});

cms.post("/admin/articles/:id", async (c) => {
  const unauthorized = await adminRequired(c);
  if (unauthorized) return unauthorized;
  const body = await c.req.parseBody();
  const fields = articleFields(body);
  if (!fields) {
    const article = await c.env.DB.prepare("SELECT * FROM articles WHERE id = ?")
      .bind(c.req.param("id"))
      .first<Article>();
    if (!article) return c.text("記事が見つかりません。", 404);
    return c.html(articleForm(article, "入力内容を確認してください。"), 400);
  }
  const result = await c.env.DB.prepare(
    `UPDATE articles
     SET title = ?, excerpt = ?, body = ?, icon = ?, theme = ?, published = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
  )
    .bind(fields.title, fields.excerpt, fields.body, fields.icon, fields.theme, fields.published, c.req.param("id"))
    .run();
  if (result.meta.changes === 0) return c.text("記事が見つかりません。", 404);
  return c.redirect("/admin", 303);
});

cms.post("/admin/articles/:id/delete", async (c) => {
  const unauthorized = await adminRequired(c);
  if (unauthorized) return unauthorized;
  const result = await c.env.DB.prepare("DELETE FROM articles WHERE id = ?")
    .bind(c.req.param("id"))
    .run();
  if (result.meta.changes === 0) return c.text("記事が見つかりません。", 404);
  return c.redirect("/admin", 303);
});

export default cms;
