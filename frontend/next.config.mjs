/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@rainbow-me/rainbowkit',
    'ethereum-blockies-base64',
  ],
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'api.universalprofile.cloud' },
      { protocol: 'https', hostname: 'ipfs.io' },
    ],
  },
};

export default nextConfig;
