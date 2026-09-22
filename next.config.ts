import type { NextConfig } from "next";
import os from "os";

function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const ips: string[] = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  return ips;
}

const localIPs = getLocalIPs();

const nextConfig: NextConfig = {
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  allowedDevOrigins: [...localIPs, ...localIPs.map(ip => `http://${ip}:3001`), 'localhost', '127.0.0.1'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
      // Supabase Storage — all project buckets
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.supabase.io' },
      // Local dev Supabase
      { protocol: 'http', hostname: '127.0.0.1' },
    ],
  },
};

export default nextConfig;
