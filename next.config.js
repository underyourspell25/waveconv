/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['fluent-ffmpeg'],
  async rewrites() {
    return [
      {
        source: '/converted/:path*',
        destination: '/api/static/:path*'
      }
    ];
  }
};

module.exports = nextConfig;