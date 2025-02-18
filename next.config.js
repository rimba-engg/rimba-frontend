/** @type {import('next').NextConfig} */
const { version } = require('./package.json');
const nextConfig = {
  env: {
    APP_VERSION: version,
  },
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;