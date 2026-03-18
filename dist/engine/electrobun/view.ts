/**
 * =======================================
 * Monogatari Electrobun View Script
 * =======================================
 *
 * Loaded in the WebView. Exposes window.electrobun with the same
 * { send, on } interface that the Electron preload provides via
 * window.electron, so the engine's DesktopBridge works with both.
 **/

import { Electroview } from "electrobun/view";
import type { MonogatariRPC } from "./index";

const rpc = Electroview.defineRPC<MonogatariRPC>({
	handlers: {
		requests: {},
		messages: {},
	},
});

const callbacks = new Map<string, (args: unknown) => void>();

(window as any).electrobun = {
	send(channel: string, data?: unknown) {
		if (channel === "quit-request") {
			rpc.send["quit-request"]();
		} else if (channel === "window-info-request") {
			rpc.request["window-info-request"](data as any).then((response) => {
				const cb = callbacks.get("window-info-reply");
				if (cb) cb(response);
			});
		} else if (channel === "resize-request") {
			rpc.request["resize-request"](data as any).then((response) => {
				const cb = callbacks.get("resize-reply");
				if (cb) cb(response);
			});
		}
	},

	on(channel: string, callback: (args: unknown) => void) {
		callbacks.set(channel, callback);
	},
};

// Signal that electrobun is available for Platform detection.
(window as any).__electrobun = true;
