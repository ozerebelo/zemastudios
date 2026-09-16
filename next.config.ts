import type { NextConfig } from "next";

const config: NextConfig = {
  serverExternalPackages: ["archiver", "postgres"],
};

export default config;
