import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://thepaddock.com.au';
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/races`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/bookmakers`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ambassadors`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
  ];

  // In production, fetch dynamic pages from API
  // For now, we'll add placeholder dynamic pages
  const dynamicPages: MetadataRoute.Sitemap = [];

  // Example: Add race pages (would be fetched from API)
  // const races = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/races`).then(r => r.json());
  // races.forEach((race: any) => {
  //   dynamicPages.push({
  //     url: `${baseUrl}/races/${race.id}`,
  //     lastModified: new Date(race.startTime),
  //     changeFrequency: 'hourly',
  //     priority: 0.7,
  //   });
  // });

  // Example: Add news article pages (would be fetched from API)
  // const articles = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news`).then(r => r.json());
  // articles.forEach((article: any) => {
  //   dynamicPages.push({
  //     url: `${baseUrl}/news/${article.id}`,
  //     lastModified: new Date(article.publishedAt),
  //     changeFrequency: 'weekly',
  //     priority: 0.6,
  //   });
  // });

  // Example: Add bookmaker pages (would be fetched from API)
  // const bookmakers = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookmakers`).then(r => r.json());
  // bookmakers.forEach((bookmaker: any) => {
  //   dynamicPages.push({
  //     url: `${baseUrl}/bookmakers/${bookmaker.slug}`,
  //     lastModified: new Date(),
  //     changeFrequency: 'weekly',
  //     priority: 0.6,
  //   });
  // });

  // Example: Add ambassador pages (would be fetched from API)
  // const ambassadors = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ambassadors`).then(r => r.json());
  // ambassadors.forEach((ambassador: any) => {
  //   dynamicPages.push({
  //     url: `${baseUrl}/ambassadors/${ambassador.slug}`,
  //     lastModified: new Date(),
  //     changeFrequency: 'weekly',
  //     priority: 0.5,
  //   });
  // });

  return [...staticPages, ...dynamicPages];
}
