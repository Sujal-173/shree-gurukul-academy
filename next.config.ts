import type { NextConfig } from "next";

const cspScript = process.env.NODE_ENV === "production" ? "script-src 'self' 'unsafe-inline'" : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";
const cspConnect = process.env.NODE_ENV === "production" ? "connect-src 'self' https://api.cloudinary.com" : "connect-src 'self' ws: wss: https://api.cloudinary.com";
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Content-Security-Policy", value: `default-src 'self'; img-src 'self' data: blob: https://res.cloudinary.com; ${cspScript}; style-src 'self' 'unsafe-inline'; ${cspConnect}; font-src 'self' data:; form-action 'self'; base-uri 'self'; frame-ancestors 'none'` },
  ...(process.env.NODE_ENV === "production" ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }] : []),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return [
      { source: "/admissions", destination: "/admission", permanent: true },
      { source: "/admissions/:path*", destination: "/admission/:path*", permanent: true },
    ];
  },
};
export default nextConfig;
