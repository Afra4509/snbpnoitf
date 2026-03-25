import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: [
    'straked-keiko-filosus.ngrok-free.dev',
    // also fallback for future urls
    '*.ngrok-free.dev'
  ],
};

export default nextConfig;
