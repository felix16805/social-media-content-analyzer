import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use standalone output only when building for Docker.
  // Vercel manages its own output format and errors if standalone is set.
  ...(process.env.DOCKER_BUILD === "1" ? { output: "standalone" } : {}),
  // Silence the "webpack config without turbopack config" warning.
  // We only need the webpack alias for production builds; in dev Turbopack
  // resolves the missing canvas module gracefully.
  turbopack: {},
  webpack: (config) => {
    // pdfjs-dist optionally imports 'canvas' for server-side rendering.
    // Alias it to false so webpack doesn't fail when canvas is not installed.
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    return config;
  },
};

export default nextConfig;
