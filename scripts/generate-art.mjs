#!/usr/bin/env node
// Pre-generates card art into public/art/ and writes public/art/manifest.json.
// Usage: node scripts/generate-art.mjs [--dry-run] [--only <key>] [--limit <n>]
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "art");
const manifestPath = join(outDir, "manifest.json");
const table = JSON.parse(readFileSync(join(root, "src", "share", "art", "prompts.json"), "utf8"));
const EXTENSIONS = ["png", "jpg", "webp"];
const TIMEOUT_MS = 10 * 60_000;

function parseArgs(argv) {
  const args = { dryRun: false, only: null, limit: Infinity };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--dry-run") args.dryRun = true;
    else if (arg === "--only") args.only = argv[++i];
    else if (arg === "--limit") args.limit = Number(argv[++i]);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (args.only !== null && !Object.hasOwn(table.keys, args.only)) {
    throw new Error(`Unknown art key "${args.only}". Known: ${Object.keys(table.keys).join(", ")}`);
  }
  if (Number.isNaN(args.limit) || args.limit < 0) throw new Error("--limit needs a non-negative number");
  return args;
}

/** Values already in the environment win over .env.local. */
function loadEnvLocal() {
  const path = join(root, ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || line.trim().startsWith("#")) continue;
    const [, name, rawValue] = match;
    const value = rawValue.replace(/^(['"])(.*)\1$/, "$2");
    if (process.env[name] === undefined) process.env[name] = value;
  }
}

function buildPrompt(entry) {
  return `${entry.prompt} ${table.styles[entry.style]} ${table.suffix}`;
}

function existingFile(key) {
  return EXTENSIONS.map((ext) => `${key}.${ext}`).find((file) => existsSync(join(outDir, file)));
}

function sniffExtension(bytes) {
  if (bytes[0] === 0x89 && bytes[1] === 0x50) return "png";
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return "jpg";
  if (bytes.subarray(8, 12).toString("latin1") === "WEBP") return "webp";
  return "png";
}

function writeManifest() {
  const manifest = {};
  for (const key of Object.keys(table.keys)) {
    const file = existingFile(key);
    if (file) manifest[key] = file;
  }
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

async function generate(config, key) {
  const res = await fetch(`${config.baseUrl}/images/generations`, {
    method: "POST",
    headers: { authorization: `Bearer ${config.apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({ model: config.model, prompt: buildPrompt(table.keys[key]), n: 1, size: table.size, response_format: "b64_json" }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const raw = (await res.text()).trim();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${raw.slice(0, 300)}`);
  const b64 = JSON.parse(raw)?.data?.[0]?.b64_json;
  if (typeof b64 !== "string" || !b64) throw new Error(`No b64_json in response: ${raw.slice(0, 300)}`);
  return Buffer.from(b64, "base64");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  loadEnvLocal();
  const config = {
    apiKey: process.env.MEME_ART_API_KEY?.trim() ?? "",
    baseUrl: (process.env.MEME_ART_BASE_URL?.trim() || "https://argolink.io/v1").replace(/\/+$/, ""),
    model: process.env.MEME_ART_MODEL?.trim() || "gpt-image-2",
  };
  const keys = (args.only ? [args.only] : Object.keys(table.keys)).filter((key) => {
    const file = existingFile(key);
    if (file) console.log(`skip  ${key} (public/art/${file} exists)`);
    return !file;
  });
  const todo = keys.slice(0, args.limit);

  console.log(`${todo.length} to generate with ${config.model} at ${config.baseUrl}${args.dryRun ? " (dry run)" : ""}`);
  if (args.dryRun) {
    for (const key of todo) console.log(`would generate ${key}\n  ${buildPrompt(table.keys[key])}`);
    return;
  }
  if (!config.apiKey) throw new Error("MEME_ART_API_KEY is not set (environment or .env.local).");

  mkdirSync(outDir, { recursive: true });
  let failures = 0;
  for (const key of todo) {
    const started = Date.now();
    process.stdout.write(`gen   ${key} ... `);
    try {
      const bytes = await generate(config, key);
      const file = `${key}.${sniffExtension(bytes)}`;
      writeFileSync(join(outDir, file), bytes);
      writeManifest();
      console.log(`ok ${file} ${(bytes.length / 1024).toFixed(0)} KiB in ${((Date.now() - started) / 1000).toFixed(0)}s`);
    } catch (error) {
      failures += 1;
      console.log(`FAILED: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  const manifest = writeManifest();
  console.log(`manifest: ${Object.keys(manifest).length} of ${Object.keys(table.keys).length} keys have art`);
  if (failures) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
