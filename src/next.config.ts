
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    appDir: true,
  },
  // Your Next.js configuration options go here.
  // For example:
  // images: {
  //   domains: ['example.com'],
  // },
  allowedDevOrigins: [
    'http://localhost:3000',
    'https://3000-firebase-al-wameed-delivery-1-1757800056570.cluster-zj37zwdounao2uiqvtma64veco.cloudworkstations.dev',
    'https://6000-firebase-al-wameed-delivery-1-1757800056570.cluster-zj37zwdounao2uiqvtma64veco.cloudworkstations.dev'
  ],
};

export default nextConfig;
