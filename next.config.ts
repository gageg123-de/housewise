import type { NextConfig } from "next";
import { basePath } from "./lib/site-config";

const nextConfig: NextConfig = {
  output: "export",
  assetPrefix: basePath || undefined,
  trailingSlash: false,
  images: { unoptimized: true },
};

export default nextConfig;
