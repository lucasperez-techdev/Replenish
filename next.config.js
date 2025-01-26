// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Optional: Enables React's Strict Mode
  images: {
    domains: ['firebasestorage.googleapis.com'], // Allow images from Firebase Storage
  },
};

module.exports = nextConfig;
