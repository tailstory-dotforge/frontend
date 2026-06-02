// @ts-check

import { execSync } from "node:child_process";
import cloudflare from "@astrojs/cloudflare";
import preact from "@astrojs/preact";
import { defineConfig } from "astro/config";

// Get the short Git commit hash at build time
const getGitCommitHash = () => {
  try {
    return execSync("git rev-parse --short HEAD", { encoding: "utf-8" }).trim();
  } catch (_error) {
    return "unknown";
  }
};

// https://astro.build/config
export default defineConfig({
  integrations: [preact()],
  output: "server",
  adapter: cloudflare(),
  vite: {
    build: {
      minify: false,
    },
    define: {
      __GIT_COMMIT_HASH__: JSON.stringify(getGitCommitHash()),
    },
  },
});
