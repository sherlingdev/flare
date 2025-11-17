import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react'],
  },

  // Production source maps for better debugging (optional, can disable for smaller bundle)
  productionBrowserSourceMaps: false, // Set to true if you want source maps in production

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.xe.com',
        port: '',
        pathname: '/svgs/flags/**',
      },
    ],
  },

  // Compression
  compress: true,

  // Webpack configuration to optimize cache performance for large locale strings
  webpack: (config) => {
    // Suppress webpack cache warnings for large strings (locale files)
    const originalInfrastructureLogging = config.infrastructureLogging;
    config.infrastructureLogging = {
      ...(originalInfrastructureLogging || {}),
      level: 'error', // Only show errors, suppress warnings
    };

    // Ignore the PackFileCacheStrategy warning about serializing big strings
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /node_modules/,
      },
      /Serializing big strings/,
      /PackFileCacheStrategy/,
    ];

    return config;
  },
};

export default nextConfig;
