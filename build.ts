import { mkdir } from 'fs/promises';
import { join } from 'path';

const OUT_DIR = './dist/engine/core';
const SRC_DIR = './src';

const commonBuildOptions = {
	target: 'browser' as const,
	format: 'esm' as const,
	sourcemap: 'linked' as const,
	minify: true,
};

/**
 * Build the ES module version
 */
async function buildModule(): Promise<void> {
	console.log('📦 Building ES module...');

	const result = await Bun.build({
		entrypoints: [join(SRC_DIR, 'index.js')],
		outdir: OUT_DIR,
		naming: 'monogatari.module.js',
		...commonBuildOptions,
	});

	if (!result.success) {
		console.error('❌ Module build failed:');
		for (const log of result.logs) {
			console.error(log);
		}
		process.exit(1);
	}

	console.log('✅ ES module built successfully');
}

/**
 * Build the browser bundle version
 */
async function buildBrowser(): Promise<void> {
	console.log('🌐 Building browser bundle...');

	const result = await Bun.build({
		entrypoints: [join(SRC_DIR, 'browser.ts')],
		outdir: OUT_DIR,
		naming: 'monogatari.js',
		target: 'browser',
		format: 'iife',
		sourcemap: 'linked',
		minify: true,
	});

	if (!result.success) {
		console.error('❌ Browser build failed:');
		for (const log of result.logs) {
			console.error(log);
		}
		process.exit(1);
	}

	console.log('✅ Browser bundle built successfully');
}

/**
 * Build CSS
 */
async function buildCSS(): Promise<void> {
	console.log('🎨 Building CSS...');

	const result = await Bun.build({
		entrypoints: [join(SRC_DIR, 'index.css')],
		outdir: OUT_DIR,
		naming: 'monogatari.css',
		minify: true,
		sourcemap: 'linked',
	});

	if (!result.success) {
		console.error('❌ CSS build failed:');
		for (const log of result.logs) {
			console.error(log);
		}
		process.exit(1);
	}

	console.log('✅ CSS built successfully');
}

/**
 * Build TypeScript declaration files
 */
async function buildTypes(): Promise<void> {
	console.log('📝 Building type declarations...');

	const proc = Bun.spawn(['tsc', '--emitDeclarationOnly', '--declarationDir', './dist/types'], {
		stdout: 'inherit',
		stderr: 'inherit',
	});

	const exitCode = await proc.exited;

	if (exitCode !== 0) {
		console.error('❌ Type declarations build failed');
		process.exit(1);
	}

	console.log('✅ Type declarations built successfully');
}

async function watchMode(): Promise<void> {
	console.log('👀 Starting watch mode...');

	// Initial build
	await Promise.all([buildBrowser(), buildCSS()]);

	// Watch for changes
	const srcWatcher = Bun.spawn(['bun', 'build', join(SRC_DIR, 'browser.ts'),
		'--target', 'browser',
		'--format', 'iife',
		'--outdir', OUT_DIR,
		'--watch'
	], {
		stdout: 'inherit',
		stderr: 'inherit',
	});

	console.log('🔄 Watching for changes... (Press Ctrl+C to stop)');

	// Keep process alive
	await srcWatcher.exited;
}

// Parse CLI arguments
const args = process.argv.slice(2);
const flags = new Set(args);

// Ensure output directory exists
await mkdir(OUT_DIR, { recursive: true });

// Execute based on flags
if (flags.has('--watch')) {
	await watchMode();
} else if (flags.has('--module')) {
	await buildModule();
} else if (flags.has('--browser')) {
	await buildBrowser();
} else if (flags.has('--css')) {
	await buildCSS();
} else if (flags.has('--types')) {
	await buildTypes();
} else {
	// Build all
	console.log('🚀 Starting full build...\n');

	await Promise.all([
		buildModule(),
		buildBrowser(),
		buildCSS(),
	]);

	await buildTypes();

	console.log('\n🎉 Build completed successfully!');
}
