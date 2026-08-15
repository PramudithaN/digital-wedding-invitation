import type { NextConfig } from "next";
import { execSync } from "child_process";

// Compute version dynamically using Git commits
const getVersion = (): string => {
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
};

export default nextConfig;
