import { watch } from "fs";
import { join, extname } from "path";

const PORT = Number(process.env.PORT) || 5100;
const ROOT = import.meta.dir;

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg",
  ".wav": "audio/wav",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

const LIVE_RELOAD_SCRIPT = `
<script>
(function() {
  var ws = new WebSocket("ws://" + location.host + "/__reload");
  ws.onmessage = function() { location.reload(); };
  ws.onclose = function() {
    setTimeout(function() { location.reload(); }, 1000);
  };
})();
</script>
`;

const reloadSockets = new Set<ServerWebSocket<unknown>>();

// Watch for file changes
const WATCH_DIRS = ["js", "style", "engine/core", "engine/debug", "."];
for (const dir of WATCH_DIRS) {
  watch(join(ROOT, dir), { recursive: dir !== "." }, () => {
    for (const ws of reloadSockets) {
      ws.send("reload");
    }
  });
}

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    let pathname = url.pathname === "/" ? "/index.html" : url.pathname;

    // Upgrade WebSocket for live-reload
    if (pathname === "/__reload") {
      if (req.headers.get("upgrade") === "websocket") {
        return undefined; // Let the websocket handler deal with it
      }
      return new Response("WebSocket only", { status: 400 });
    }

    const filePath = join(ROOT, pathname);
    const file = Bun.file(filePath);

    if (!(await file.exists())) {
      return new Response("Not Found", { status: 404 });
    }

    // Inject live-reload script into HTML
    const ext = extname(pathname);
    if (ext === ".html") {
      const html = await file.text();
      const injected = html.replace("</body>", `${LIVE_RELOAD_SCRIPT}</body>`);
      return new Response(injected, {
        headers: { "Content-Type": "text/html" },
      });
    }

    return new Response(file, {
      headers: {
        "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
      },
    });
  },
  websocket: {
    open(ws) {
      reloadSockets.add(ws);
    },
    close(ws) {
      reloadSockets.delete(ws);
    },
    message() {},
  },
});

console.log(`Dev server running at http://localhost:${PORT}`);
