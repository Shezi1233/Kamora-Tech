import type { NextConfig } from "next";

const apiBaseUrl = process.env.API_BASE_URL?.replace(/\/$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    if (!apiBaseUrl) return [];
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiBaseUrl}/api/v1/:path*`,
      },
      {
        source: "/api/chatbot/:path*",
        destination: `${apiBaseUrl}/api/chatbot/:path*`,
      },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
