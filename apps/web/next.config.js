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
};

export default nextConfig;