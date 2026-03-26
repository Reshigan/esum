/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  transpilePackages: ['@esum/shared-types', '@esum/ui-components', '@esum/utils'],
};

module.exports = nextConfig;
