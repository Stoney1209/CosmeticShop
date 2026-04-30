import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // P1: Allow Next.js Image optimization for remote product images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
