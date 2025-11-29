/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'logo.clearbit.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  allowedDevOrigins: [
    'https://61d3aebb-18f7-456b-bc47-a9278154b11b-00-2jw4z6d864bdc.pike.replit.dev',
    'http://localhost:5000',
    'http://0.0.0.0:5000'
  ],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "https://61d3aebb-18f7-456b-bc47-a9278154b11b-00-2jw4z6d864bdc.pike.replit.dev"
          },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" }
        ]
      }
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
      allowedOrigins: ['*'],
    },
  },
};

export default nextConfig;
