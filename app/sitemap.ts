import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://amerigam.com';
  const staticRoutes = ['', '/login', '/signup', '/communities'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }));
  return staticRoutes;
}

