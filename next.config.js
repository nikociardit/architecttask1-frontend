/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // API configuration
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*'
      }
    ]
  },
  
  // Environment variables
  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:8000',
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:8000/api'
  },
  
  // Disable x-powered-by header
  poweredByHeader: false,
  
  // Enable experimental features for better performance
  experimental: {
    optimizeCss: true
  }
}

module.exports = nextConfig
