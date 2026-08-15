import type { NextConfig } from "next";
import { execSync } from "child_process";

// Compute version dynamically using Git commits
const getVersion = (): string => {
  try {
    const count = execSync("git rev-list --count HEAD").toString().trim();
    const hash = execSync("git rev-parse --short HEAD").toString().trim();
    return `v1.0.${count}-${hash}`;
  } catch {
    if (process.env.VERCEL_GIT_COMMIT_SHA) {
      const hash = process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7);
      return `v1.0.0-${hash}`;
    }
    return "v1.0.0-dev";
  }
};

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: getVersion(),
  },
};

export default nextConfig;
