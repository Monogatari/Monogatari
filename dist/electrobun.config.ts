import type { ElectrobunConfig } from "electrobun";

export default {
	app: {
		name: "My Game",
		identifier: "com.example.mygame",
		version: "0.1.0",
	},
	build: {
		buildFolder: "build/electrobun",
		artifactFolder: "build/electrobun/artifacts",
		bun: {
			entrypoint: "engine/electrobun/index.ts",
		},
		views: {
			mainview: {
				entrypoint: "engine/electrobun/view.ts",
			},
		},
		copy: {
			"index.html": "views/mainview/index.html",
			"engine/core": "views/mainview/engine/core",
			"engine/debug": "views/mainview/engine/debug",
			"assets": "views/mainview/assets",
			"js": "views/mainview/js",
			"style": "views/mainview/style",
		},
		linux: {
			bundleCEF: false,
		},
		mac: {
			bundleCEF: false,
		},
		win: {
			bundleCEF: false,
		},
	},
} satisfies ElectrobunConfig;
