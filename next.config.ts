import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // cacheComponents/partialPrefetching (Next 16 defaults) are experimental
  // canary features requiring "use cache" annotations throughout; disabled
  // to avoid build friction across the rest of this build.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
