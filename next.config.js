/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    });
    return config;
  },
};

const url = new URL(process.env.NEXT_PUBLIC_BACKEND_URL);

module.exports = {
  images: {
    domains: ['localhost', url.hostname],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  ...nextConfig
};
