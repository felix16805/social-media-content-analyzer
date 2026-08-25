import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent clickjacking
  { key: "X-Frame-Options", value: "DENY" },
  // Prevent MIME type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Control referrer information
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable access to sensitive browser features
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // Force HTTPS (only effective on Vercel/production where HTTPS is guaranteed)
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Content Security Policy
  // - default-src 'self'             only load from same origin by default
  // - script-src 'self' 'unsafe-eval' needed for Next.js HMR + webpack
  // - style-src 'self' 'unsafe-inline' needed for Tailwind inline styles
  // - img-src *                       allow images from any source (user uploads previews)
  // - font-src 'self' fonts.gstatic   Google Fonts
  // - connect-src 'self' localhost    allow fetches to self + local backend
  // - worker-src blob: 'self'          pdfjs-dist worker served from /public
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob:",
      "connect-src 'self' http://localhost:4000",
      "worker-src blob: 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Use standalone output only when building for Docker.
  // Vercel manages its own output format and errors if standalone is set.
  ...(process.env.DOCKER_BUILD === "1" ? { output: "standalone" } : {}),

  // Add security headers to all responses
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

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
