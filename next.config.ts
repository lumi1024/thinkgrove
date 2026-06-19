import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  output: 'standalone',
  webpack: (config, {dev, isServer}) => {
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }
    if (isServer) {
      config.externals = config.externals || [];
      const pushExternal = (pkg: string) => {
        if (Array.isArray(config.externals)) {
          config.externals.push({ [pkg]: `commonjs ${pkg}` });
        } else {
          (config.externals as any)[pkg] = `commonjs ${pkg}`;
        }
      };
      pushExternal('better-sqlite3');
      pushExternal('motion');
    }
    return config;
  },
};

export default nextConfig;
