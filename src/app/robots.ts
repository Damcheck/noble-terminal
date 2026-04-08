import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'], // Protect backend routes from arbitrary web scrapers
    },
    sitemap: 'https://terminal.noblefunded.com/sitemap.xml',
  };
}
