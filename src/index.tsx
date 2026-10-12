import { Hono } from "hono";

type Bindings = {
  ASSETS: Fetcher;
  DB: D1Database;
  FILES: R2Bucket;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) =>
  c.html(
    <html lang="ja">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Hono、Cloudflare Workers、D1、R2 を使った Web アプリケーション"
        />
        <link rel="stylesheet" href="/styles.css" />
        <title>Cloudflare Hono Starter</title>
      </head>
      <body class="min-h-screen bg-slate-950 text-slate-100">
        <main class="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-20">
          <p class="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Cloudflare Workers
          </p>
          <h1 class="text-4xl font-bold tracking-tight sm:text-6xl">
            Hono starter
          </h1>
          <p class="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Hono と JSX で動作するアプリケーションです。Tailwind CSS、
            Cloudflare D1、R2 の設定が完了しています。
          </p>
          <div class="mt-10 grid gap-4 sm:grid-cols-3">
            <div class="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <h2 class="font-semibold text-white">Hono / JSX</h2>
              <p class="mt-2 text-sm text-slate-400">Workers 上で HTML を生成</p>
            </div>
            <div class="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <h2 class="font-semibold text-white">D1</h2>
              <p class="mt-2 text-sm text-slate-400">SQLite ベースのリレーショナルデータ</p>
            </div>
            <div class="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <h2 class="font-semibold text-white">R2</h2>
              <p class="mt-2 text-sm text-slate-400">オブジェクトストレージ</p>
            </div>
          </div>
        </main>
      </body>
    </html>,
  ),
);

app.notFound((c) => c.env.ASSETS.fetch(c.req.raw));

export default app;
