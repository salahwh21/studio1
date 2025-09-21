
كيفية حل التحذير

افتح ملف next.config.js (أو next.config.mjs).

أضف الخاصية allowedDevOrigins تحت الإعدادات، مثلاً:

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
  allowedDevOrigins: [
    'http://localhost:3000',
    'https://3000-firebase-al-wameed-delivery-1-1757800056570.cluster-zj37zwdounao2uiqvtma64veco.cloudworkstations.dev'
  ],
};

module.exports = nextConfig;
# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.
