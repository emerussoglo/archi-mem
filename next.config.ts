import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  outputFileTracingIncludes: {
    '/api/**/*': ['./public/data/notices.json'],
    '/explorer/**/*': ['./public/data/notices.json'],
  },
};

export default nextConfig;
