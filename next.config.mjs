const basePath = "/wuyule";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Subpath hosting on the portfolio (`https://hanjing-laura.vercel.app/wuyule`).
  // `basePath` already prefixes JS/CSS/_next; assetPrefix is only needed for a separate CDN.
  basePath,
  // Portfolio uses trailingSlash: true and rewrites to `/wuyule/`. Default Next
  // 308s `/wuyule/` → `/wuyule`, which the browser applies on the portfolio host
  // and loops. Serve the trailing-slash URL with 200 instead.
  trailingSlash: true,
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] },
  webpack(config) {
    // @imgly/background-removal is loaded only from a browser event. Keep
    // Next's server compilation on the browser-safe ONNX runtime entry.
    config.resolve.alias = {
      ...config.resolve.alias,
      'onnxruntime-web$': `${process.cwd()}/node_modules/onnxruntime-web/dist/ort.min.js`,
      'onnxruntime-web/wasm$': `${process.cwd()}/node_modules/onnxruntime-web/dist/ort.wasm.bundle.min.mjs`,
      'onnxruntime-web/webgpu$': `${process.cwd()}/node_modules/onnxruntime-web/dist/ort.min.js`,
    };
    return config;
  },
};
export default nextConfig;
