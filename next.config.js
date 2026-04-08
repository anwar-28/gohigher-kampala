/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cloud.appwrite.io'],
  },
  eslint: {
    ignoreDuringBuilds: true, // ignores ESLint errors during build
  },
  typescript: {
    ignoreBuildErrors: true, // ignores TypeScript errors during build
  },
}

module.exports = nextConfig
