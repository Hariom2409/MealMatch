/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Conditional config based on deployment target
  ...(process.env.VERCEL 
    ? {
        // Vercel-specific config - default Next.js behavior for Vercel deployment
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
        },
      } 
    : {
        // GitHub Pages config
        output: 'export',
        trailingSlash: true,
        distDir: 'out',
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
          unoptimized: true, // Required for static export
        },
      })
}

module.exports = nextConfig 