/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    domains: ["images.unsplash.com"],
    unoptimized: process.env.NODE_ENV === "production",
  },
  pageExtensions: ["tsx", "ts", "jsx", "js"],
  swcMinify: true,
  poweredByHeader: false,
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    outputFileTracingExcludes: {
      "*": ["**/tempobook/**"],
    },
    // Ensure proper handling of client components
    serverComponentsExternalPackages: [],
  },
  // Disable static optimization for pages using client hooks
  unstable_disableStaticImages: false,
};

module.exports = nextConfig;
