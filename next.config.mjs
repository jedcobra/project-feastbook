const basePath = process.env.NEXT_BASE_PATH || '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(process.env.NEXT_STATIC_EXPORT ? { output: 'export' } : {}),
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  trailingSlash: true,
};

export default nextConfig;
