module.exports = {
  serverRuntimeConfig: {
    apiUrl: 'http://localhost:5001',
  },
  publicRuntimeConfig: {
    apiUrl: process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5001/api',
  },
}