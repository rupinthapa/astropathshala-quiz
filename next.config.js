/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Disable turbopack for now as it's causing issues
  // turbopack: {
  //   root: __dirname,
  // },
};

module.exports = nextConfig;
