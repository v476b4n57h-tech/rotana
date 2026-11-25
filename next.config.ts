import type { NextConfig } from "next";

// Basic security headers for every page. A strict Content-Security-Policy follows
// in the launch phase (phase 8), once all external sources (Supabase, Turnstile) are known.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    // Inline the (small) stylesheet into the HTML: one network round-trip less before the first paint.
    inlineCss: true,
  },
  images: {
    // Serve modern formats (AVIF, then WebP) at the size each device needs.
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
