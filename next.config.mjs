/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // three.js and its ecosystem ship ESM that Next transpiles fine, but the
  // VRM packages occasionally need transpilation depending on the version.
  transpilePackages: ["three", "@pixiv/three-vrm", "@pixiv/three-vrm-animation"],
  experimental: {
    // API routes that spawn local binaries (piper) need the Node.js runtime.
    serverComponentsExternalPackages: [],
  },
};

export default nextConfig;
