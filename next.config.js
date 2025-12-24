/** @type {import('next').NextConfig} */
const nextConfig = {
  // Base path for subdirectory deployment (e.g., /kongreai)
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',

  // Asset prefix for CDN or subdirectory
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '',

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },

  // Output standalone for production
  output: 'standalone',
}

module.exports = nextConfig
