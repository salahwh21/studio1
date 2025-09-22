
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    appDir: true,
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.ttf$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/fonts/[hash][ext]',
      },
    });

    return config;
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
