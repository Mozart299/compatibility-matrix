/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: 'https://compatibility-matrix.vercel.app' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS' },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
          },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'https://random-maria-mozart299-46512b0e.koyeb.app/api/v1/:path*',
      },
      {
        source: '/google-auth/:path*',
        destination: 'https://random-maria-mozart299-46512b0e.koyeb.app/api/v1/auth/:path*',
      },
    ];
  },

  env: {
    NEXT_PUBLIC_API_URL: '/api/v1',
  },
};

export default nextConfig;