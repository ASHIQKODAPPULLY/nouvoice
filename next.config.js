/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    domains: ["images.unsplash.com"],
    unoptimized: process.env.NODE_ENV === "production",
  },
  pageExtensions: ["tsx", "ts", "jsx", "js"],
  productionBrowserSourceMaps: false,
  swcMinify: true,
  poweredByHeader: false,
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  distDir: ".next",
  experimental: {
    outputFileTracingExcludes: {
      "*": ["**/tempobook/**"],
    },
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
