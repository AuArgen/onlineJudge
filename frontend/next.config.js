/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Включает строгий режим React
  trailingSlash: true, // Добавлять слэш в конце URL
  swcMinify: true, // Включить SWC для минификации
  output: 'standalone', // Или 'export' для статического экспорта

};

export default nextConfig;
