// prettier-ignore
const { promises: { readFile } } = require("fs");
const { build, context } = require("esbuild");
const { sassPlugin } = require("esbuild-sass-plugin");

const DEV = process.argv.includes("--dev");
const CSS = process.argv.includes("--css");

/** @type {import('esbuild').BuildOptions} */
const esbuildBase = {
	entryPoints: ["./src/index.js"],
	format: "esm",
	bundle: true,
	minify: true,
	platform: "browser",
	charset: "utf8",
	target: ["firefox78", "chrome78", "safari11.1"],
};

/** @type {import('esbuild').Plugin} */
const kayrosFixPlugin = {
	name: "kayros-fix-plugin",
	setup(build) {
		build.onLoad({ filter: /kayros\.min\.css$/ }, async (args) => {
			const fileContents = await readFile(args.path, "utf8");

			/**
			 * @aegis-framework/kayros.css contains an invalid css, let's fix that
			 */
			const modifiedContents = fileContents.replace("*zoom:1", "zoom:1");

			return {
				contents: modifiedContents,
				loader: "css",
			};
		});
	},
};

/** @type {Record<string, Partial<import('esbuild').BuildOptions>>} */
const builds = {
	esm: {
		format: "esm",
		outfile: "./lib/monogatari.module.js",
		sourcemap: "linked",
	},
	cjs: {
		format: "cjs",
		outfile: "./lib/monogatari.node.js",
		sourcemap: "linked",
		define: {
			"import.meta.url": "location",
		},
	},
	iife: {
		entryPoints: ["./src/browser.js"],
		format: "iife",
		outfile: "./dist/engine/core/monogatari.js",
		globalName: "Monogatari",
		define: {
			"import.meta.url": "location",
		},
	},
	debug: {
		entryPoints: ["./debug/index.js"],
		format: "iife",
		outfile: "./dist/engine/debug/debug.js",
	},
	css: {
		entryPoints: ["./src/index.css"],
		outfile: "./dist/engine/core/monogatari.css",
		plugins: [kayrosFixPlugin, sassPlugin()],
	},
};

async function main() {
	if (DEV) {
		const ctx = await context({
			...esbuildBase,
			...builds["iife"],
			entryPoints: [!CSS ? "./src/index.js" : "./src/index.css"],
			outfile: !CSS
				? "./dist/engine/core/monogatari.js"
				: "./dist/engine/core/monogatari.css",
			plugins: [kayrosFixPlugin, sassPlugin()],
		});

		await ctx.watch();

		if (!CSS) await ctx.serve({ servedir: "./dist", port: 5173 });
	} else {
		for (const key in builds) {
			await build({
				...esbuildBase,
				...builds[key],
			});
		}
	}
}

main();
