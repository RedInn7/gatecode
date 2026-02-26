/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Long-lived cache for static assets (JS/CSS/images)
  headers: async () => [
    {
      source: "/_next/static/:path*",
      headers: [
        { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
      ],
    },
    {
      source: "/data/:path*",
      headers: [
        { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
      ],
    },
  ],
};

module.exports = nextConfig;
