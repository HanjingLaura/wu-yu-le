/** @type {import('next').NextConfig} */
const nextConfig = {
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
