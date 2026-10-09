#!/usr/bin/env node
/**
 * Validates this repository with the TravStats app's own template engine, so
 * "valid" means the same here and in the app: every file `index.json` names
 * must exist, pass the v2 envelope validator, agree with its index line and
 * pass every one of its own test cases; every `.json` in a domain folder must
 * be named in the index.
 *
 *   TRAVSTATS_BACKEND=../TravStats/backend node scripts/validate.mjs
 *
 * TRAVSTATS_BACKEND is a TravStats checkout's `backend/` directory with its
 * dependencies installed (`npm ci`). In CI, clone the app next to this
 * repository and set the variable. Exit code 0 on success, 1 on any problem,
 * 2 when the app checkout is missing.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const backend = path.resolve(process.env.TRAVSTATS_BACKEND ?? "../TravStats/backend");
const script = path.join(backend, "scripts", "validate-template-repo.ts");

if (!existsSync(script)) {
  console.error(`No TravStats backend at ${backend} (set TRAVSTATS_BACKEND).`);
  process.exit(2);
}

const run = spawnSync("npx", ["tsx", script, repo], { cwd: backend, stdio: "inherit" });
process.exit(run.status ?? 1);
