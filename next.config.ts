import type { NextConfig } from "next";

// Basis-beveiligingsheaders voor elke pagina.
// Een strikte Content-Security-Policy volgt in de lanceringsfase (fase 8),
// zodra alle externe bronnen (Supabase, Turnstile) bekend zijn.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
