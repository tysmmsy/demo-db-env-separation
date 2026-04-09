<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();

	const envColor = (env: string) => {
		switch (env) {
			case 'production':
				return '#e53e3e';
			case 'preview':
				return '#dd6b20';
			case 'development':
				return '#38a169';
			default:
				return '#718096';
		}
	};
</script>

<svelte:head>
	<title>DB環境分離デモ</title>
</svelte:head>

<main>
	<h1>データベース環境分離デモ</h1>
	<p class="description">
		Vercelの環境変数システムにより、環境ごとに異なるデータベース接続を設定できます。
		このページでは、現在のデプロイ環境でどの環境変数が有効かを表示しています。
	</p>

	<section class="card">
		<h2>現在の環境</h2>
		<div class="env-badge" style="background-color: {envColor(data.system.vercelEnv)}">
			{data.system.vercelEnv}
		</div>
		<p class="timestamp">描画日時: {data.timestamp}</p>
	</section>

	<section class="card">
		<h2>Vercelシステム環境変数</h2>
		<p class="note">
			Vercelのプロジェクト設定で「Automatically expose System Environment Variables」を有効にすると自動で設定されます。
		</p>
		<table>
			<thead>
				<tr>
					<th>変数名</th>
					<th>値</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td><code>VERCEL_ENV</code></td>
					<td><span class="value">{data.system.vercelEnv}</span></td>
				</tr>
				<tr>
					<td><code>VERCEL_URL</code></td>
					<td><span class="value">{data.system.vercelUrl}</span></td>
				</tr>
				<tr>
					<td><code>VERCEL_BRANCH_URL</code></td>
					<td><span class="value">{data.system.vercelBranchUrl || '(未設定)'}</span></td>
				</tr>
				<tr>
					<td><code>VERCEL_PROJECT_PRODUCTION_URL</code></td>
					<td><span class="value">{data.system.vercelProjectProductionUrl || '(未設定)'}</span></td>
				</tr>
				<tr>
					<td><code>VERCEL_REGION</code></td>
					<td><span class="value">{data.system.vercelRegion || '(ビルド時のみ)'}</span></td>
				</tr>
				<tr>
					<td><code>VERCEL_DEPLOYMENT_ID</code></td>
					<td><span class="value">{data.system.vercelDeploymentId || '(未設定)'}</span></td>
				</tr>
				<tr>
					<td><code>VERCEL_GIT_COMMIT_REF</code></td>
					<td><span class="value">{data.system.vercelGitCommitRef || '(未設定)'}</span></td>
				</tr>
				<tr>
					<td><code>VERCEL_GIT_COMMIT_SHA</code></td>
					<td><span class="value">{data.system.vercelGitCommitSha || '(未設定)'}</span></td>
				</tr>
			</tbody>
		</table>
	</section>

	<section class="card">
		<h2>データベース接続変数</h2>
		<p class="note">
			Vercelのプロジェクト設定で環境ごとに設定される変数です。
			ProductionとPreviewで異なるデータベースインスタンスを指定できます。
		</p>
		<table>
			<thead>
				<tr>
					<th>変数名</th>
					<th>値</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td><code>SUPABASE_URL</code></td>
					<td><span class="value">{data.database.supabaseUrl}</span></td>
				</tr>
				<tr>
					<td><code>SUPABASE_ANON_KEY</code></td>
					<td><span class="value">{data.database.supabaseAnonKey}</span></td>
				</tr>
				<tr>
					<td><code>UPSTASH_REDIS_REST_URL</code></td>
					<td><span class="value">{data.database.upstashRedisRestUrl}</span></td>
				</tr>
				<tr>
					<td><code>DATABASE_URL</code></td>
					<td><span class="value">{data.database.databaseUrl}</span></td>
				</tr>
			</tbody>
		</table>
	</section>

	<section class="card explanation">
		<h2>仕組み</h2>
		<div class="flow">
			<div class="flow-step">
				<div class="step-number">1</div>
				<div>
					<strong>環境ごとに環境変数を設定する</strong>
					<p>Vercelのプロジェクト設定で、Production、Preview、Developmentそれぞれに異なる値を設定します。</p>
				</div>
			</div>
			<div class="flow-step">
				<div class="step-number">2</div>
				<div>
					<strong>デプロイ時にVercelが適切な値を注入する</strong>
					<p>Preview環境（PR）にデプロイするとPreview用の環境変数が使用されます。Productionデプロイ時はProduction用の値が使用されます。</p>
				</div>
			</div>
			<div class="flow-step">
				<div class="step-number">3</div>
				<div>
					<strong>アプリが自動的に正しいデータベースに接続する</strong>
					<p>コードの変更は不要です。同じコードが環境に応じて異なるデータベースに接続します。</p>
				</div>
			</div>
		</div>
	</section>

	<section class="card">
		<h2>CLIでの設定例</h2>
		<pre><code># Production（本番用Supabaseプロジェクト）
echo "https://xxx-prod.supabase.co" | vercel env add SUPABASE_URL production --force

# Preview（開発用Supabaseプロジェクト）
echo "https://xxx-dev.supabase.co" | vercel env add SUPABASE_URL preview --force

# Development
echo "https://xxx-dev.supabase.co" | vercel env add SUPABASE_URL development --force</code></pre>
	</section>
</main>

<style>
	:global(body) {
		margin: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
		background: #f7f7f7;
		color: #333;
	}

	main {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
	}

	h1 {
		font-size: 1.8rem;
		margin-bottom: 0.5rem;
	}

	.description {
		color: #666;
		margin-bottom: 2rem;
		line-height: 1.6;
	}

	.card {
		background: #fff;
		border-radius: 8px;
		padding: 1.5rem;
		margin-bottom: 1.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.card h2 {
		font-size: 1.2rem;
		margin-top: 0;
		margin-bottom: 1rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid #eee;
	}

	.env-badge {
		display: inline-block;
		color: #fff;
		padding: 0.5rem 1.5rem;
		border-radius: 4px;
		font-size: 1.2rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.timestamp {
		color: #999;
		font-size: 0.85rem;
		margin-top: 0.75rem;
	}

	.note {
		color: #666;
		font-size: 0.9rem;
		margin-bottom: 1rem;
		line-height: 1.5;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th {
		text-align: left;
		padding: 0.5rem;
		font-size: 0.85rem;
		color: #999;
		border-bottom: 1px solid #eee;
	}

	td {
		padding: 0.5rem;
		border-bottom: 1px solid #f4f4f4;
		font-size: 0.9rem;
	}

	code {
		background: #f0f0f0;
		padding: 0.15rem 0.4rem;
		border-radius: 3px;
		font-size: 0.85rem;
	}

	.value {
		font-family: 'SF Mono', 'Fira Code', monospace;
		font-size: 0.85rem;
		word-break: break-all;
	}

	.flow {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.flow-step {
		display: flex;
		gap: 1rem;
		align-items: flex-start;
	}

	.step-number {
		flex-shrink: 0;
		width: 2rem;
		height: 2rem;
		background: #0070f3;
		color: #fff;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		font-size: 0.9rem;
	}

	.flow-step p {
		margin: 0.25rem 0 0;
		color: #666;
		font-size: 0.9rem;
		line-height: 1.5;
	}

	pre {
		background: #1a1a2e;
		color: #e0e0e0;
		padding: 1rem;
		border-radius: 6px;
		overflow-x: auto;
		font-size: 0.85rem;
		line-height: 1.6;
	}

	pre code {
		background: none;
		padding: 0;
		color: inherit;
	}
</style>
