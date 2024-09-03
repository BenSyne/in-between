export default {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5001/api/:path*',
      },
      {
        source: '/health',
        destination: 'http://localhost:5001/health',
      },
    ];
  },
};