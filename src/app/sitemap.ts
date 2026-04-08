import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://terminal.noblefunded.com',
      lastModified: new Date(),
      changeFrequency: 'always', // Terminal data constantly changes
      priority: 1,
    },
  ];
}
