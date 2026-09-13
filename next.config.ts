import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Statischer Export für Cloudflare Pages (komplettes Spiel ist client-seitig)
  output: "export",
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
