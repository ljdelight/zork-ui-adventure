import { execSync } from 'node:child_process';
import { defineConfig } from 'vite';

const git = (args: string) => {
  try {
    return execSync(`git ${args}`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return '';
  }
};

/** The repo's web URL: from GitHub Actions in CI, otherwise from the origin remote (ssh or https). */
function repoUrl(): string {
  if (process.env.GITHUB_REPOSITORY) return `https://github.com/${process.env.GITHUB_REPOSITORY}`;
  const m = git('remote get-url origin').match(/github\.com[:/](.+?)(?:\.git)?$/);
  return m ? `https://github.com/${m[1]}` : '';
}

export default defineConfig({
  base: './',
  define: {
    __COMMIT__: JSON.stringify(git('rev-parse --short HEAD')),
    __REPO_URL__: JSON.stringify(repoUrl()),
  },
});
