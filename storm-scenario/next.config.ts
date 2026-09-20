import type { NextConfig } from 'next';

/**
 * The game is entirely client-side, so it ships as a static export.
 * `next build` writes `out/`; the `build` script copies that to `dist/`,
 * which is the directory any static file server should be pointed at.
 */
const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
