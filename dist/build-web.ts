import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { join } from "path";

const OUT_DIR = "./build/web";

// Clean output directory
rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });

// Copy game files
const include = [
  "assets",
  "engine/core",
  "engine/LICENSE",
  "js",
  "style",
  "favicon.ico",
  "manifest.json",
  "service-worker.js",
];

for (const entry of include) {
  cpSync(entry, join(OUT_DIR, entry), { recursive: true });
}

// Copy index.html with debug script removed
const html = readFileSync("index.html", "utf-8");
const cleanedHtml = html
  .replace(/\s*<!-- Debug Library\..*?-->\s*\n/s, "\n")
  .replace(/\s*<script src="\.\/engine\/debug\/debug\.js"><\/script>\s*\n/, "\n");
writeFileSync(join(OUT_DIR, "index.html"), cleanedHtml);

console.log(`Web build output: ${OUT_DIR}`);
