import { env } from '$env/dynamic/private';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Vercel system environment variables
	const vercelEnv = env.VERCEL_ENV ?? 'local';
	const vercelUrl = env.VERCEL_URL ?? 'localhost';
	const vercelBranchUrl = env.VERCEL_BRANCH_URL ?? '';
	const vercelProjectProductionUrl = env.VERCEL_PROJECT_PRODUCTION_URL ?? '';
	const vercelRegion = env.VERCEL_REGION ?? '';
	const vercelDeploymentId = env.VERCEL_DEPLOYMENT_ID ?? '';
	const vercelGitCommitRef = env.VERCEL_GIT_COMMIT_REF ?? '';
	const vercelGitCommitSha = env.VERCEL_GIT_COMMIT_SHA ?? '';

	// Database connection environment variables (values set per environment)
	const supabaseUrl = env.SUPABASE_URL ?? '(not set)';
	const supabaseAnonKey = env.SUPABASE_ANON_KEY ?? '(not set)';
	const upstashRedisRestUrl = env.UPSTASH_REDIS_REST_URL ?? '(not set)';
	const databaseUrl = env.DATABASE_URL ?? '(not set)';

	// Mask Vercel domain values to hide team/org identifiers
	const maskDomain = (value: string): string => {
		if (!value) return '';
		// e.g. "demo-app-abc123-teamname.vercel.app" → "demo-app-***.vercel.app"
		const parts = value.split('.');
		if (parts.length >= 3 && parts[parts.length - 2] === 'vercel') {
			const subdomain = parts[0];
			const firstDash = subdomain.indexOf('-');
			const prefix = firstDash > 0 ? subdomain.substring(0, Math.min(firstDash + 4, 12)) : subdomain.substring(0, 8);
			return `${prefix}***.vercel.app`;
		}
		if (value.length <= 12) return value;
		return value.substring(0, 8) + '***';
	};

	// Mask URL values to avoid exposing project identifiers
	const maskUrl = (value: string): string => {
		if (value === '(not set)') return value;
		try {
			const url = new URL(value);
			const host = url.hostname;
			const parts = host.split('.');
			if (parts.length >= 2) {
				return `${url.protocol}//${parts[0].substring(0, 6)}***.${parts.slice(1).join('.')}`;
			}
			return `${url.protocol}//${host.substring(0, 8)}***`;
		} catch {
			return maskValue(value);
		}
	};

	// Mask sensitive values for display
	const maskValue = (value: string): string => {
		if (value === '(not set)') return value;
		if (value.length <= 12) return value;
		return value.substring(0, 8) + '...' + value.substring(value.length - 4);
	};

	return {
		system: {
			vercelEnv,
			vercelUrl: maskDomain(vercelUrl),
			vercelBranchUrl: maskDomain(vercelBranchUrl),
			vercelProjectProductionUrl: maskDomain(vercelProjectProductionUrl),
			vercelRegion,
			vercelDeploymentId: maskValue(vercelDeploymentId),
			vercelGitCommitRef,
			vercelGitCommitSha: maskValue(vercelGitCommitSha)
		},
		database: {
			supabaseUrl: maskUrl(supabaseUrl),
			supabaseAnonKey: maskValue(supabaseAnonKey),
			upstashRedisRestUrl: maskUrl(upstashRedisRestUrl),
			databaseUrl: maskValue(databaseUrl)
		},
		timestamp: new Date().toISOString()
	};
};
