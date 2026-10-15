import { Hono } from "hono";
import type { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import type { JSX } from "hono/jsx/jsx-runtime";
import { AdminArticleList } from "./components/cms/admin-article-list";
import { ArticleDetail } from "./components/cms/article-detail";
import { ArticleEditor } from "./components/cms/article-editor";
import { LoginPage } from "./components/cms/login-page";
import { SiteDocument } from "./components/site-document";
import type { Article } from "./types/article";
import type { Bindings } from "./env";

const cms = new Hono<{ Bindings: Bindings }>();
const sessionCookie = "admin_session";
const sessionLifetime = 60 * 60 * 12;
const textEncoder = new TextEncoder();
const articleHeaderLinks = [
  { href: "/", label: "ホーム" },
  { href: "/#interests", label: "記事一覧" },
];

function adminDocument(
  title: string,
  content: JSX.Element,
  description = title,
  headerLinks = [
    { href: "/", label: "ホーム" },
    { href: "/admin", label: "管理画面" },
  ],
) {
  return (
    <SiteDocument
      title={`${title} — Yazaki`}
      description={description}
      brand="Yazaki"
      mark="Y"
      headerLinks={headerLinks}
      footerLinks={[{ href: "/", label: "ホームへ戻る ↑" }]}
    >
      {content}
    </SiteDocument>
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
  return adminDocument("管理者ログイン", <LoginPage error={error} />);
}

function articleForm(article?: Article, error = "") {
  return adminDocument(
    article ? "記事を編集" : "記事を作成",
    <ArticleEditor article={article} error={error} />,
  );
}

function notFoundArticlePage() {
  return adminDocument(
    "記事が見つかりません",
    <main class="page-width cms-main">
      <h1>記事が見つかりませんでした</h1>
      <a class="text-link" href="/#interests">記事一覧に戻る</a>
    </main>,
    "記事が見つかりません",
    articleHeaderLinks,
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
  const articleType = readText("article_type", 10);
  const articleThemes = ["red", "yellow", "green", "blue", "purple"];
  if (
    !title ||
    !excerpt ||
    !articleBody ||
    !icon ||
    !theme ||
    !articleThemes.includes(theme) ||
    (articleType !== "interest" && articleType !== "blog")
  ) {
    return null;
  }
  return {
    title,
    excerpt,
    body: articleBody,
    icon,
    theme,
    articleType,
    published: body.published === "on" ? 1 : 0,
  };
}

function imageFormat(bytes: Uint8Array) {
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return { extension: "png", contentType: "image/png" };
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { extension: "jpg", contentType: "image/jpeg" };
  }
  const gifVersion = String.fromCharCode(...bytes.slice(3, 6));
  if (
    bytes.length >= 6 &&
    String.fromCharCode(...bytes.slice(0, 3)) === "GIF" &&
    (gifVersion === "87a" || gifVersion === "89a")
  ) {
    return { extension: "gif", contentType: "image/gif" };
  }
  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  ) {
    return { extension: "webp", contentType: "image/webp" };
  }
  return null;
}

cms.get("/article-images/:key", async (c) => {
  const key = c.req.param("key");
  if (!/^[0-9a-f-]{36}\.(png|jpg|gif|webp)$/.test(key)) {
    return c.text("画像が見つかりません。", 404);
  }
  const image = await c.env.FILES.get(key);
  if (!image) return c.text("画像が見つかりません。", 404);
  return new Response(image.body, {
    headers: {
      "Content-Type": image.httpMetadata?.contentType ?? "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
});

cms.post("/admin/article-images", async (c) => {
  const unauthorized = await adminRequired(c);
  if (unauthorized) return unauthorized;
  const body = await c.req.parseBody();
  const file = body.image;
  if (typeof File === "undefined" || !(file instanceof File)) {
    return c.json({ error: "画像ファイルを選択してください。" }, 400);
  }
  if (file.size === 0) return c.json({ error: "空の画像はアップロードできません。" }, 400);
  if (file.size > 5 * 1024 * 1024) {
    return c.json({ error: "画像は5MB以下にしてください。" }, 413);
  }

  const format = imageFormat(new Uint8Array(await file.slice(0, 12).arrayBuffer()));
  if (!format) {
    return c.json({ error: "PNG、JPEG、GIF、WebP形式の画像を選択してください。" }, 415);
  }

  const key = `${crypto.randomUUID()}.${format.extension}`;
  await c.env.FILES.put(key, file.stream(), {
    httpMetadata: {
      contentType: format.contentType,
      cacheControl: "public, max-age=31536000, immutable",
    },
  });
  return c.json({ url: `/article-images/${key}` });
});

cms.get("/articles/:id", async (c) => {
  const article = await c.env.DB.prepare(
    "SELECT * FROM articles WHERE id = ? AND published = 1",
  )
    .bind(c.req.param("id"))
    .first<Article>();
  if (!article) return c.html(notFoundArticlePage(), 404);
  return c.html(
    adminDocument(
      article.title,
      <ArticleDetail article={article} />,
      article.excerpt,
      articleHeaderLinks,
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
    adminDocument("記事管理", <AdminArticleList articles={results} />),
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
    `INSERT INTO articles (id, title, excerpt, body, icon, theme, article_type, published, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(crypto.randomUUID(), fields.title, fields.excerpt, fields.body, fields.icon, fields.theme, fields.articleType, fields.published, (maxOrder?.max_order ?? 0) + 1)
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
     SET title = ?, excerpt = ?, body = ?, icon = ?, theme = ?, article_type = ?, published = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
  )
    .bind(fields.title, fields.excerpt, fields.body, fields.icon, fields.theme, fields.articleType, fields.published, c.req.param("id"))
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
