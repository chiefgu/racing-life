import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://thepaddock.com.au';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/account/',
          '/ambassadors/dashboard',
          '/ambassadors/articles/*/edit',
          '/ambassadors/articles/new',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
