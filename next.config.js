/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // When building for GitHub Pages deployment
  // Comment these out for local development
  // Uncomment for production build
  // output: 'export', // Outputs a static website
  // trailingSlash: true, // Add trailing slashes to all URLs
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
    // Uncomment this for static export to GitHub Pages
    // unoptimized: true, // Required for static export
  },
}

module.exports = nextConfig 