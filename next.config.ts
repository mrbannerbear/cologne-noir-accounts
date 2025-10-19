import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',      // the route to match
        destination: '/orders', // where to redirect
        permanent: true,  // set true for 301 permanent redirect
      },
    ];
  },
};

export default nextConfig;
