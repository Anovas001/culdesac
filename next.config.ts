import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keeps the production image small: Docker runs the traced Node server rather
  // than carrying the full Next.js build toolchain.
  output: "standalone",
};

export default nextConfig;
