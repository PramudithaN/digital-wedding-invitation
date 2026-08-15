import type { NextConfig } from "next";
import { execSync } from "child_process";

// Compute version dynamically using Git commits
const getVersion = (): string => {
  const isVercel = !!process.env.VERCEL;

  // On Vercel, prioritize the GitHub API count to bypass the shallow git clone limit
  if (isVercel) {
    try {
      const headers = execSync('curl -s -I "https://api.github.com/repos/PramudithaN/digital-wedding-invitation/commits?sha=main&per_page=1"', { timeout: 3000 }).toString();
      const match = headers.match(/page=(\d+)>; rel="last"/);
      if (match && match[1]) {
        return `v1.0.${match[1]}`;
      }
    } catch {
      // Ignore and fallback
    }
  }

  // Fallback to local git count
  try {
    const count = execSync("git rev-list --count HEAD").toString().trim();
    return `v1.0.${count}`;
  } catch {
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
};

export default nextConfig;
