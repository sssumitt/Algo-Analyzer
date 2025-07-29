/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // no rewrites needed; all auth endpoints are served by Next itself
};

module.exports = nextConfig;
