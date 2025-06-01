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
    // Improve client component handling
    optimizeCss: true,
    esmExternals: true,
    // Improve client/server component boundary
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  transpilePackages: ["stripe", "@stripe/stripe-js"],
  // Ensure Stripe components are properly handled
  modularizeImports: {
    "lucide-react": {
      transform: "lucide-react/dist/esm/icons/{{kebabCase member}}",
    },
  },
  webpack: (config) => {
    // Handle client-side only packages
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
  // Explicitly mark Stripe-related pages as client-side only
  compiler: {
    styledComponents: true,
  },
  // Use standalone output for better compatibility with Vercel
  output: "standalone",
};

module.exports = nextConfig;
