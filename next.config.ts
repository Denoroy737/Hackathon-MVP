import type { NextConfig } from 'next';
const config: NextConfig = {
  allowedDevOrigins: ['127.0.0.1', 'localhost', '*.e2b.app'],
  poweredByHeader: false,
  devIndicators: false,
  experimental: { cpus: 2 },
};
export default config;
