import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fra.cloud.appwrite.io",
        pathname: "/v1/storage/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co", 
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com", 
      },
    ],
  },
};

export default nextConfig;
