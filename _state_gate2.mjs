import { execSync } from "node:child_process";
import { writeFileSync, statSync } from "node:fs";
import { join, basename } from "node:path";

const cwd = process.cwd();
const L = [];
const run = (g) => { try { return execSync(g, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); } catch (e) { return "ERR:" + String(e.stderr || e.message).trim(); } };

L.push("HEAD===" + run("git --no-pager log -1 --format=%h %s"));
L.push("AHEAD===" + run("git --no-pager rev-list --count @{u}..HEAD 2>&1"));
L.push("PUSHED===" + run("git --no-pager log -1 --format=%cI origin/main"));
L.push("STATUS===" + (run("git --no-pager status --porcelain=v1").replace(/\r?\n/g, " || ") || "(clean)"));

const out = join(cwd, "_state_gate.dat");
writeFileSync(out, L.join("\n"), "utf8");
console.log("GATE-BYTES===" + statSync(out).size);
