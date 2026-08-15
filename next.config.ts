import type { NextConfig } from "next";
import { execSync } from "child_process";

// Compute version dynamically using Git commits
const getVersion = (): string => {
  try {
    const count = execSync("git rev-list --count HEAD").toString().trim();
    return `v1.0.${count}`;
  } catch {
    try {
      // Fallback: Query GitHub API using curl to fetch total commits count from headers
      const headers = execSync('curl -s -I "https://api.github.com/repos/PramudithaN/digital-wedding-invitation/commits?sha=main&per_page=1"', { timeout: 3000 }).toString();
      const match = headers.match(/page=(\d+)>; rel="last"/);
      if (match && match[1]) {
        return `v1.0.${match[1]}`;
      }
    } catch {
      // Fallback if curl or GitHub API fails
    }
    return "v1.0.0";
  }
};

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: getVersion(),
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
