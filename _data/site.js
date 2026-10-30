// Date of the latest commit, filled in at build time (replaces the old GitHub API call in the browser).
const { execSync } = require("node:child_process");

module.exports = () => {
  let date;
  try {
    date = new Date(execSync("git log -1 --format=%cI").toString().trim());
  } catch {
    date = new Date();
  }
  return {
    lastUpdated: date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
  };
};
