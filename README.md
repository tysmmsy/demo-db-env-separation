# demo-db-env-separation

Vercelの環境変数システムを利用して、デプロイ環境（Production / Preview / Development）ごとに異なるデータベース接続情報を切り替えるデモアプリケーションです。

## 概要

このアプリは、Vercelが各デプロイ環境に自動で注入する環境変数を画面上に表示します。
環境ごとに色分けされたバッジ（赤: Production、オレンジ: Preview、緑: Development）で、現在どの環境にデプロイされているかをひと目で確認できます。

環境ごとにデータベース接続先を分離することで、本番データを誤って操作するリスクを防ぎます。

## 技術スタック

- SvelteKit
- TypeScript
- Vercel Adapter (`@sveltejs/adapter-vercel`)

## セットアップ

### 依存パッケージのインストール

```bash
pnpm install
```

### ローカル開発

```bash
pnpm dev
```

### Vercelへのデプロイ

```bash
vercel deploy
```

## 環境変数

以下の環境変数をVercelのプロジェクト設定で環境ごとに設定できます。いずれも任意（Optional）です。

- `SUPABASE_URL` - Supabaseの接続URL
- `SUPABASE_ANON_KEY` - Supabaseの匿名キー
- `UPSTASH_REDIS_REST_URL` - Upstash RedisのREST URL
- `DATABASE_URL` - データベース接続文字列

Vercelのシステム環境変数（`VERCEL_ENV`、`VERCEL_URL`など）は、プロジェクト設定で「Automatically expose System Environment Variables」を有効にすると自動で設定されます。

## 検証手順

### Step 1: Production環境の確認

1. Vercelにプロジェクトをリンクし、Productionデプロイを実行する
   ```bash
   vercel --prod
   ```
2. デプロイされたURLにアクセスする
3. 以下を確認する
   - 赤色のPRODUCTIONバッジが表示されている
   - `VERCEL_ENV` の値が `production` になっている
   - Vercelのシステム環境変数（`VERCEL_URL`など）が正しく表示されている

### Step 2: Preview環境の確認

1. Previewデプロイを実行する
   ```bash
   vercel deploy
   ```
2. デプロイされたPreview URLにアクセスする
3. 以下を確認する
   - オレンジ色のPREVIEWバッジが表示されている
   - `VERCEL_ENV` の値が `preview` になっている
   - Production環境とは異なるURLが `VERCEL_URL` に表示されている

### Step 3: 環境ごとのDB接続情報の分離確認（任意）

1. 環境ごとにダミーのDB接続値を設定する
   ```bash
   # Production環境用
   echo "https://xxx-prod.supabase.co" | vercel env add SUPABASE_URL production --force

   # Preview環境用
   echo "https://xxx-dev.supabase.co" | vercel env add SUPABASE_URL preview --force

   # Development環境用
   echo "https://xxx-dev.supabase.co" | vercel env add SUPABASE_URL development --force
   ```
2. それぞれの環境に再デプロイする
   ```bash
   vercel --prod
   vercel deploy
   ```
3. 各環境のURLにアクセスし、「データベース接続変数」セクションに異なる値が表示されていることを確認する

## セキュリティに関する注意事項

- データベース接続情報はマスク処理されて表示されます。URLのホスト名やキーの一部のみが表示され、完全な値は露出しません。
- `.env` ファイルはGitの管理対象外です。機密情報をリポジトリにコミットしないでください。
- このデモは環境変数の切り替え動作を確認するためのものです。本番環境では接続情報を画面に表示しないでください。
