# Cloudflare Hono starter

Cloudflare Workers 上で Hono と JSX を実行する Web アプリケーションです。Tailwind CSS v4 でスタイルを生成し、D1 をリレーショナルデータ、R2 をオブジェクトストレージとして利用します。

## 技術構成

- **Cloudflare Workers + Wrangler**: アプリケーション実行とデプロイ
- **Hono + JSX**: Workers のリクエスト処理とサーバーサイド HTML
- **Tailwind CSS v4**: `src/styles.css` から `public/styles.css` を生成
- **Cloudflare D1**: `DB` バインディングから `c.env.DB` として利用
- **Cloudflare R2**: `FILES` バインディングから `c.env.FILES` として利用
- **静的ファイル**: Workers Static Assets が `public/` から配信

アプリケーションのエントリーポイントは `src/index.tsx` です。Cloudflare のリソース ID やアカウント認証情報はソースコードに含めず、Wrangler の設定と Cloudflare の環境で管理します。

## セットアップ

Node.js と npm を用意し、依存関係をインストールします。

```sh
npm install
npx wrangler login
```

D1 の接続先は `wrangler.jsonc` の `database_name` / `database_id` で設定します。現在は `my-website-db` と指定された ID を設定済みです。別のデータベースを利用する場合は、D1 の UUID に置き換えてください。

```sh
npx wrangler d1 create my-website-db
```

R2 の接続先は `wrangler.jsonc` の `bucket_name` で設定します。現在は `my-website-r2` を設定済みです。別のバケットを利用する場合は、実際の名前に合わせてください。

```sh
npx wrangler r2 bucket create my-website-files
```

## 開発

次のコマンドを別々のターミナルで実行します。CSS の変更を監視するには `dev:css` を起動してください。

```sh
npm run dev
npm run dev:css
```

`npm run check` は TypeScript の型チェック、`npm run build` は CSS の生成と Wrangler の dry-run ビルドを実行します。npm scripts 経由で実行することで、インストール済みのプロジェクトローカル Wrangler が確実に使用されます。

Cloudflare の Workers Builds を利用する場合は、**Build command** と **Deploy command** の両方を次のように設定してください。

| Cloudflare の設定 | コマンド |
| --- | --- |
| Build command | `npm run build` |
| Deploy command | `npm run deploy` |

Build command はログ上で成功しても、Deploy command を `wrangler deploy` のままにすると、npm script の PATH 設定を通らず `wrangler: not found` で失敗します。Cloudflare の Deploy command からも必ず `npm run deploy` を呼び出してください。Wrangler は通常依存として登録しているため、本番依存のみをインストールする環境でも利用できます。

## D1 マイグレーション

SQL マイグレーションは `migrations/` に追加し、ローカルまたはリモートへ適用します。

```sh
npx wrangler d1 migrations apply DB --local
npx wrangler d1 migrations apply DB --remote
```

D1 は Hono のハンドラーから `c.env.DB`、R2 は `c.env.FILES` で利用します。`/api/health` は D1 に `SELECT 1` を実行し、R2 バケットを読み取り専用で一覧確認して、両方の接続状態を返します。たとえば D1 は `c.env.DB.prepare(...).bind(...).all()`、R2 は `c.env.FILES.put(key, value)` / `c.env.FILES.get(key)` を使用します。

## CMS

記事は D1 の `articles` テーブルで管理します。初回セットアップ時にマイグレーションを適用してください。

```sh
npx wrangler d1 migrations apply DB --local
npx wrangler d1 migrations apply DB --remote
```

開発環境では `.dev.vars`（Git 管理対象外）に管理者用の値を設定します。

```text
ADMIN_PASSWORD=十分に長く推測されにくい管理者パスワード
ADMIN_SESSION_SECRET=32文字以上のランダムな秘密値
```

本番環境では Wrangler secret として登録します。セッション秘密値は `openssl rand -base64 32` などで生成してください。

```sh
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put ADMIN_SESSION_SECRET
```

設定後、`/admin` からログインし、記事の作成・編集・削除、公開/下書きの切り替えができます。公開記事はトップページの「最近、気になること」に表示され、カードから記事詳細を閲覧できます。記事本文はプレーンテキストで、入力した改行を保って表示します。管理セッションは HttpOnly・SameSite Cookie で保持され、12 時間で期限切れになります。

## デプロイ

Cloudflare 認証、D1 の ID、R2 バケットを設定した後、以下を実行します。

```sh
npm run deploy
```
