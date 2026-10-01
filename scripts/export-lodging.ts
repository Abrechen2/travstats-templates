/**
 * Export the TravStats app's built-in lodging templates into `lodging/`.
 *
 * A one-off authoring tool, not part of any runtime: no TravStats release reads
 * `lodging/` yet, and nothing here is needed to use the files it writes. It
 * exists so the copies in this repository are generated from the app's source
 * rather than retyped, and so the `$source` note on each file names exactly
 * which app commit it came from.
 *
 * Usage, from a checkout of the app (github.com/Abrechen2/TravStats), inside
 * `backend/` so `tsx` and the app's TypeScript settings are at hand:
 *
 *   npx tsx <this-repo>/scripts/export-lodging.ts --app <app-checkout> --out <this-repo>/lodging [--branch <name>]
 *
 * `--branch` only labels the `$source` note, for a detached checkout.
 *
 * It writes one `<issuer>.json` per entry of `LODGING_TEMPLATES` in
 * `backend/src/services/lodging/templates/builtins.ts`, as the data stands in
 * that file (no field is added, renamed or dropped), plus a top-level `$source`
 * string. Existing files of the same name are overwritten.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const BUILTINS = "backend/src/services/lodging/templates/builtins.ts";

function arg(name: string): string {
  const i = process.argv.indexOf(name);
  const value = i >= 0 ? process.argv[i + 1] : undefined;
  if (!value) throw new Error(`missing ${name} <path>`);
  return path.resolve(value);
}

function gitRevision(appDir: string): { commit: string; branch: string } {
  const git = (...a: string[]): string =>
    execFileSync("git", ["-C", appDir, ...a], { encoding: "utf8" }).trim();
  return { commit: git("rev-parse", "HEAD"), branch: git("rev-parse", "--abbrev-ref", "HEAD") };
}

async function main(): Promise<void> {
  const appDir = arg("--app");
  const outDir = arg("--out");
  const source = path.join(appDir, BUILTINS);
  if (!fs.existsSync(source)) throw new Error(`not found: ${source}`);

  const mod = (await import(pathToFileURL(source).href)) as {
    LODGING_TEMPLATES?: ReadonlyArray<{ id: string }>;
  };
  const templates = mod.LODGING_TEMPLATES;
  if (!Array.isArray(templates) || templates.length === 0) {
    throw new Error(`${BUILTINS} exports no LODGING_TEMPLATES`);
  }

  const rev = gitRevision(appDir);
  const commit = rev.commit;
  // A detached worktree has no branch name; --branch states it instead.
  const branchFlag = process.argv.indexOf("--branch");
  const branch = branchFlag >= 0 ? process.argv[branchFlag + 1] : rev.branch;
  fs.mkdirSync(outDir, { recursive: true });
  for (const template of templates) {
    const issuer = template.id.replace(/^lodging:/, "");
    if (!/^[a-z0-9-]+$/.test(issuer)) throw new Error(`unexpected id: ${template.id}`);
    const note =
      `Generated from ${BUILTINS} in Abrechen2/TravStats at commit ${commit}` +
      ` (${branch === "HEAD" ? "detached" : `branch ${branch}`}) by scripts/export-lodging.ts.` +
      " No TravStats release reads this file yet; the app's built-in copy is the one in use.";
    const file = path.join(outDir, `${issuer}.json`);
    fs.writeFileSync(file, `${JSON.stringify({ $source: note, ...template }, null, 2)}\n`);
    process.stdout.write(`wrote ${file}\n`);
  }
}

main().catch((err: unknown) => {
  process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
