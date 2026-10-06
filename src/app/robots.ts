import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api', '/watch'],
    },
    sitemap: 'https://brinetube.vercel.app/sitemap.xml',
  };
}
