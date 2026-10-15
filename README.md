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

## ソースコード構成

- `src/index.tsx`: Hono のルートとトップページの組み立て
- `src/components/site-*`: 共通のページ枠、ヘッダー、フッター
- `src/components/home/`: トップページの各セクションとプロフィール・記事カード
- `src/components/cms/`: CMS のログイン、記事一覧・行、編集フォーム、記事詳細
- `src/cms.tsx`: CMS と記事ページのルート、認証、記事データ処理
- `src/types/article.ts`: 記事データの共有型
- `src/styles.css`: Tailwind CSS と各スタイルをまとめるビルド入口
- `src/styles/`: 共通、ホーム、CMS、アクセシビリティ、レスポンシブのスタイル

文章や要素の構成は対応するコンポーネントで、色・余白・レスポンシブ表示などの見た目は `src/styles/` 内の用途別CSSで個別に調整できます。

### 記事CMS

管理画面の記事本文は、空行で段落を分けて入力します。本文ツールバーから見出し（H1〜H3）、リンク、飛びリンク、画像を挿入できます。飛びリンクは「飛び先見出し」でID付きのH2見出しを作成し、「飛びリンク」から同じIDへリンクします。画像はHTTPSなどの画像URLを指定するか、PNG・JPEG・GIF・WebP（最大5MB）をR2へアップロードできます。カード色は赤・黄・緑・青・紫の5色から選べます。掲載場所を「最近、気になること」または「ブログ記事」から選択すると、ホームの各セクションへ表示されます。既存記事は「最近、気になること」に分類されます。

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

### GitHub Codespaces から本番設定する

GitHub Codespaces の Secret は Codespace 内の Wrangler が Cloudflare に接続するための認証情報です。Worker の `ADMIN_PASSWORD` などは別途 Cloudflare に登録する必要があります。

1. Cloudflare API token を作成し、対象アカウントに **Workers Scripts: Edit** と **D1: Edit** の権限を付けます。
2. GitHub リポジトリの **Settings → Secrets and variables → Codespaces** に `CLOUDFLARE_API_TOKEN` を登録します。
3. Codespace を再起動して Secret を読み込んだ後、ターミナルで管理者パスワードとセッション秘密値を Wrangler に登録します。

```sh
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put ADMIN_SESSION_SECRET
```

パスワードと秘密値はプロンプトに入力し、ソースコードやチャットには記載しないでください。登録後、次のコマンドで D1 マイグレーションを適用して Worker をデプロイします。

```sh
npm run deploy
```

`CLOUDFLARE_API_TOKEN` が Codespace のターミナルで参照できない場合は、Codespaces Secret の対象リポジトリ設定と Codespace の再起動を確認してください。

## デプロイ

Cloudflare 認証、D1 の ID、R2 バケットを設定した後、以下を実行します。`npm run deploy` はデプロイ前にリモート D1 の未適用マイグレーションを適用します。CMS を含む Worker を先にデプロイすると、記事テーブルがないためトップページが 500 になります。

```sh
npm run deploy
```

Cloudflare Workers Builds を利用している場合は、Deploy command を `npm run deploy` にしてください。CMS 導入前の Worker がすでにデプロイされている場合も、このコマンドを再実行すれば D1 マイグレーション適用後に Worker が更新されます。
