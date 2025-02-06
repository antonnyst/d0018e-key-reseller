import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:slug*',
        destination: "http://localhost:3333/:slug*",
      },
    ]
  },
};

export default nextConfig;
