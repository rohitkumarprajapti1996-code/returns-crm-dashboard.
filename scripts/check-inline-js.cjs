const fs = require("node:fs");
const vm = require("node:vm");

const files = ["index.html", "docs/index.html"];
let failed = false;

for (const file of files) {
  const html = fs.readFileSync(file, "utf8");
  const scriptTags = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)];
  const inlineScripts = scriptTags.filter((match) => !/\bsrc\s*=/i.test(match[1]));
  if (inlineScripts.length === 0) {
    console.error("FAIL: " + file + ": no inline JavaScript blocks found.");
    failed = true;
    continue;
  }

  inlineScripts.forEach((match, index) => {
    try {
      new vm.Script(match[2], { filename: file + ":inline-script-" + (index + 1) });
      console.log("PASS: " + file + " inline JavaScript block " + (index + 1) + " parses.");
    } catch (error) {
      failed = true;
      console.error("FAIL: " + file + " inline JavaScript block " + (index + 1) + ": " + error.message);
    }
  });

  const checks = [
    ["login handler exists", /function\s+localLogin\s*\(/.test(html)],
    ["Print Projection upload handler exists", /function\s+projectionFilePicked\s*\(/.test(html)],
    ["duplicate All File Pipelines section is absent", !html.includes("All File Pipelines")],
    ["original dashboard pipeline renderer exists", /function\s+pipe\s*\(/.test(html)],
  ];
  for (const [label, ok] of checks) {
    console.log((ok ? "PASS" : "FAIL") + ": " + file + ": " + label);
    if (!ok) failed = true;
  }
}

if (failed) process.exit(1);
