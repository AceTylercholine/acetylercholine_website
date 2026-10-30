// Only the .njk pages are templates; every other file in the repo is copied to _site unchanged.
const fs = require("node:fs");
const path = require("node:path");

const SKIP = new Set([".git", "_drafts", ".github", ".claude", "node_modules", "_site", "_includes", "_data",
  "eleventy.config.js", "package.json", "package-lock.json", "netlify.toml", ".gitignore", "README.md"]);

function staticFiles(dir = ".") {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const rel = path.posix.join(dir, entry.name);
    if (dir === "." && SKIP.has(entry.name)) return [];
    if (entry.isDirectory()) return staticFiles(rel);
    return entry.name.endsWith(".njk") ? [] : [rel];
  });
}

module.exports = function (eleventyConfig) {
  for (const file of staticFiles()) eleventyConfig.addPassthroughCopy(file);

  return {
    templateFormats: ["njk"],
    dir: { input: ".", includes: "_includes", data: "_data", output: "_site" },
  };
};
