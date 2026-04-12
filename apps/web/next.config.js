/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    unoptimized: true,
  },
  // Enable compression for faster loading
  compress: true,
  // Optimize output for Vercel deployment
  output: 'standalone',
};

export default nextConfig;