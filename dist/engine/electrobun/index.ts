/**
 * =======================================
 * Monogatari Electrobun Configuration
 * =======================================
 *
 * Main process — runs in Bun via Electrobun.
 **/

import {
	BrowserWindow,
	BrowserView,
	Utils,
	type RPCSchema,
} from "electrobun/bun";

export type MonogatariRPC = {
	bun: RPCSchema<{
		requests: {
			"window-info-request": {
				params: {
					title?: string;
					resizable?: boolean;
				};
				response: {
					resizable: boolean;
					minWidth: number;
					minHeight: number;
					maxWidth: number;
					maxHeight: number;
				};
			};
			"resize-request": {
				params: {
					width?: number;
					height?: number;
					fullscreen?: boolean;
				};
				response: {
					fullscreen: boolean;
					width?: number;
					height?: number;
				};
			};
		};
		messages: {
			"quit-request": void;
		};
	}>;
	webview: RPCSchema<{
		requests: {};
		messages: {};
	}>;
};

const monogatariRPC = BrowserView.defineRPC<MonogatariRPC>({
	handlers: {
		requests: {
			"window-info-request": async ({ title, resizable }) => {
				if (title) {
					win.setTitle(title);
				}

				const minWidth = 640;
				const minHeight = 360;

				// Use reasonable defaults for max dimensions.
				// Electrobun does not expose a screen-size API yet.
				const maxWidth = 3840;
				const maxHeight = 2160;

				return {
					resizable: resizable !== false,
					minWidth,
					minHeight,
					maxWidth,
					maxHeight,
				};
			},

			"resize-request": async ({ width, height, fullscreen }) => {
				if (fullscreen) {
					win.setFullScreen(true);
				} else if (width && height) {
					win.setFullScreen(false);
					win.setSize(width, height);
				}

				return {
					fullscreen: fullscreen ?? false,
					width,
					height,
				};
			},
		},

		messages: {
			"quit-request": () => {
				win.close();
			},
		},
	},
});

const win = new BrowserWindow({
	title: "",
	url: "views://mainview/index.html",
	frame: {
		width: 960,
		height: 540,
		x: 0,
		y: 0,
	},
	rpc: monogatariRPC,
});

win.on("close", () => {
	Utils.quit();
});
