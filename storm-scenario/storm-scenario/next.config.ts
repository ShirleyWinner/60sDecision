import type { NextConfig } from 'next';

/**
 * The debrief calls OpenRouter from a server route so the API key never
 * reaches the browser, so this is a normal Node-backed Next app rather than
 * a static export. Run it with `next dev`, or `next build && next start`.
 */
const nextConfig: NextConfig = {};

export default nextConfig;
