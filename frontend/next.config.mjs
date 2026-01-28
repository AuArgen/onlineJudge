/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone", // Optimize for Docker
  experimental: {
    // reactCompiler: true,
  },
};

export default nextConfig;
