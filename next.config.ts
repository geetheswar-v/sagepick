import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [70, 80, 90],

    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "image.tmdb.org",
      },
    ],
  },
};

export default nextConfig;
