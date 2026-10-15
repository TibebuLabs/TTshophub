/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'maxlaefmizyvnsrxybgb.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/nilemart-product-images/**',
      },
    ],
  },
};
export default nextConfig;
