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

D1 データベースを作成し、表示された ID を `wrangler.jsonc` の `database_id` に設定します。

```sh
npx wrangler d1 create my-website-db
```

R2 バケットを作成します。バケット名は `wrangler.jsonc` の `bucket_name` と一致させてください。

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

Cloudflare の Workers Builds を利用する場合は、ビルドコマンドに `npm run build` を設定してください。デプロイコマンドを個別に指定する場合は `npm run deploy` を設定します。シェルから `wrangler` を直接呼ぶのではなく、npm script 経由で実行してください。Wrangler は通常依存として登録しているため、本番依存のみをインストールする環境でも利用できます。

## D1 マイグレーション

SQL マイグレーションは `migrations/` に追加し、ローカルまたはリモートへ適用します。

```sh
npx wrangler d1 migrations apply DB --local
npx wrangler d1 migrations apply DB --remote
```

D1 は Hono のハンドラーから `c.env.DB`、R2 は `c.env.FILES` で利用します。たとえば D1 は `c.env.DB.prepare(...).bind(...).all()`、R2 は `c.env.FILES.put(key, value)` / `c.env.FILES.get(key)` を使用します。

## デプロイ

Cloudflare 認証、D1 の ID、R2 バケットを設定した後、以下を実行します。

```sh
npm run deploy
```
