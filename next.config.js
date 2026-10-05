/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  experimental: {
    serverComponentsExternalPackages: ['@prisma/adapter-libsql', '@libsql/client'],
  },
};
module.exports = nextConfig;
