/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Disable turbopack for now as it's causing issues
  // turbopack: {
  //   root: __dirname,
  // },
  // Explicitly set the port for Next.js
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
  // Configure the development server
  serverRuntimeConfig: {
    // Will only be available on the server side
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
};

// Set the port for the Next.js development server
if (process.env.NODE_ENV === 'development') {
  process.env.PORT = '3000';
}

module.exports = nextConfig;
