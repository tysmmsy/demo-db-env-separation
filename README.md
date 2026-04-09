# DB環境分離デモアプリケーション

Vercelの環境変数システムを利用して、デプロイ環境(Production / Preview / Development)ごとに異なるデータベース接続情報を切り替えるデモアプリケーションです。

## 概要

このアプリは、Vercelが各デプロイ環境に自動で注入する環境変数を画面上に表示します。
環境ごとに色分けされたバッジ(赤: Production、オレンジ: Preview、緑: Development)で、現在どの環境にデプロイされているかをひと目で確認できます。

環境ごとにデータベース接続先を分離することで、本番データを誤って操作するリスクを防ぎます。

## 技術スタック

- SvelteKit
- TypeScript
- Vercel Adapter (@sveltejs/adapter-vercel)

## ファイル構成と変更箇所

```
src/
  routes/
    +page.server.ts    # サーバーサイドで環境変数を読み取り（新規追加）
    +page.svelte       # 環境変数の表示UI（新規追加）
    +layout.svelte     # レイアウト
  app.html             # HTMLテンプレート
```

## 実装の解説

### サーバーサイドでの環境変数読み取り (src/routes/+page.server.ts)

`$env/dynamic/private` からVercelのシステム環境変数とDB接続情報を読み取ります。
URL・キーなどの機密情報はマスク処理してからクライアントに返します。

```typescript
import { env } from '$env/dynamic/private';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  // Vercelシステム環境変数
  const vercelEnv = env.VERCEL_ENV ?? 'local';
  const vercelUrl = env.VERCEL_URL ?? 'localhost';

  // DB接続用環境変数（環境ごとに異なる値が注入される）
  const supabaseUrl = env.SUPABASE_URL ?? '(not set)';
  const databaseUrl = env.DATABASE_URL ?? '(not set)';

  // マスク処理してクライアントに返す
  return {
    system: { vercelEnv, vercelUrl: maskDomain(vercelUrl) },
    database: { supabaseUrl: maskUrl(supabaseUrl), databaseUrl: maskValue(databaseUrl) }
  };
};
```

マスク関数:
- `maskDomain()`: Vercelのデプロイドメインからチーム名等を除去します
- `maskUrl()`: DB接続URLのホスト名を短縮表示します
- `maskValue()`: キーやトークンの中間部分を隠します

### クライアントサイドでの表示 (src/routes/+page.svelte)

環境に応じたバッジ色の切り替えと、テーブルでの環境変数一覧表示を行います。

```svelte
<script lang="ts">
  let { data }: { data: PageData } = $props();

  const envColor = (env: string) => {
    switch (env) {
      case 'production': return '#e53e3e';   // 赤
      case 'preview': return '#dd6b20';       // オレンジ
      case 'development': return '#38a169';   // 緑
      default: return '#718096';              // グレー
    }
  };
</script>

<div class="env-badge" style="background-color: {envColor(data.system.vercelEnv)}">
  {data.system.vercelEnv}
</div>
```

## セットアップ

### インストール

```bash
pnpm install
```

### ローカル開発

```bash
pnpm dev
```

### Vercelへのデプロイ

```bash
vercel deploy        # Preview
vercel deploy --prod # Production
```

## 環境変数

以下の環境変数をVercelのプロジェクト設定で環境ごとに設定できます。いずれも任意です。

| 変数名 | 説明 |
|--------|------|
| SUPABASE_URL | Supabaseの接続URL |
| SUPABASE_ANON_KEY | Supabaseの匿名キー |
| UPSTASH_REDIS_REST_URL | Upstash RedisのREST URL |
| DATABASE_URL | データベース接続文字列 |

Vercelのシステム環境変数(VERCEL_ENV、VERCEL_URLなど)は、プロジェクト設定で「Automatically expose System Environment Variables」を有効にすると自動で設定されます。

## 検証手順

### 手順1: Production環境の確認

1. Vercelにデプロイします
   ```bash
   vercel deploy --prod
   ```
2. デプロイされたURLにアクセスします
3. 以下を確認します
   - 赤色のPRODUCTIONバッジが表示されている
   - VERCEL_ENVの値がproductionになっている
   - Vercelのシステム環境変数(VERCEL_URLなど)が正しく表示されている

### 手順2: Preview環境の確認

1. Previewデプロイを実行します
   ```bash
   vercel deploy
   ```
2. デプロイされたPreview URLにアクセスします
3. 以下を確認します
   - オレンジ色のPREVIEWバッジが表示されている
   - VERCEL_ENVの値がpreviewになっている
   - Production環境とは異なるURLがVERCEL_URLに表示されている

### 手順3: 環境ごとのDB接続情報の分離確認(任意)

1. 環境ごとにダミーのDB接続値を設定します
   ```bash
   echo "https://xxx-prod.supabase.co" | vercel env add SUPABASE_URL production --force
   echo "https://xxx-dev.supabase.co" | vercel env add SUPABASE_URL preview --force
   ```
2. それぞれの環境に再デプロイします
3. 各環境のURLにアクセスし、「データベース接続変数」セクションに異なる値が表示されていることを確認します

## セキュリティに関する注意事項

- データベース接続情報はマスク処理されて表示されます。URLのホスト名やキーの一部のみが表示され、完全な値は露出しません
- Vercelのデプロイドメインに含まれるチーム名もマスク処理されます
- .envファイルはGitの管理対象外です。機密情報をリポジトリにコミットしないでください
- このデモは環境変数の切り替え動作を確認するためのものです。本番環境では接続情報を画面に表示しないでください
