const fs = require("node:fs");
const vm = require("node:vm");

const html = fs.readFileSync("index.html", "utf8");
const scriptTags = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)];
const inlineScripts = scriptTags.filter((match) => !/\bsrc\s*=/i.test(match[1]));
if (inlineScripts.length === 0) {
  console.error("FAIL: no inline JavaScript blocks found.");
  process.exit(1);
}

let failed = false;
inlineScripts.forEach((match, index) => {
  try {
    new vm.Script(match[2], { filename: "index.html:inline-script-" + (index + 1) });
    console.log("PASS: inline JavaScript block " + (index + 1) + " parses.");
  } catch (error) {
    failed = true;
    console.error("FAIL: inline JavaScript block " + (index + 1) + ": " + error.message);
  }
});

const checks = [
  ["login handler exists", /function\s+localLogin\s*\(/.test(html)],
  ["Print Projection upload handler exists", /function\s+projectionFilePicked\s*\(/.test(html)],
  ["duplicate All File Pipelines section is absent", !html.includes("All File Pipelines")],
  ["original dashboard pipeline renderer exists", /function\s+pipe\s*\(/.test(html)],
];
for (const [label, ok] of checks) {
  console.log((ok ? "PASS" : "FAIL") + ": " + label);
  if (!ok) failed = true;
}

if (failed) process.exit(1);
