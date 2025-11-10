import { Race, Horse, NewsArticle, Bookmaker, Ambassador } from '@/types';

export interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

export function generateRaceStructuredData(
  race: Race,
  horses: Horse[],
  url: string
): StructuredData {
  const raceDate = new Date(race.startTime);

  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: race.raceName,
    description: `${race.raceName} at ${race.meetingLocation}. ${race.distance}m race on ${race.trackCondition} track.`,
    startDate: raceDate.toISOString(),
    endDate: new Date(raceDate.getTime() + 10 * 60 * 1000).toISOString(), // Assume 10 min duration
    location: {
      '@type': 'Place',
      name: `${race.meetingLocation} Racecourse`,
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'AU',
        addressRegion: race.meetingLocation,
      },
    },
    sport: 'Horse Racing',
    eventStatus:
      race.status === 'upcoming'
        ? 'https://schema.org/EventScheduled'
        : 'https://schema.org/EventPostponed',
    competitor: horses.map((horse) => ({
      '@type': 'Person',
      name: horse.name,
      additionalName: `#${horse.number}`,
      jobTitle: 'Racehorse',
    })),
    url,
  };
}

export function generateArticleStructuredData(article: NewsArticle, url: string): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.rewrittenContent || article.content.substring(0, 200),
    articleBody: article.rewrittenContent || article.content,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: {
      '@type': 'Person',
      name: article.author || 'The Paddock Editorial Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'The Paddock',
      logo: {
        '@type': 'ImageObject',
        url: 'https://thepaddock.com.au/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    keywords: [
      ...article.entities.horses,
      ...article.entities.jockeys,
      ...article.entities.trainers,
      'horse racing',
      'racing news',
    ].join(', '),
  };
}

export function generateAmbassadorArticleStructuredData(
  article: any,
  ambassador: Ambassador,
  url: string
): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    articleBody: article.content,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: {
      '@type': 'Person',
      name: ambassador.name,
      description: ambassador.bio,
      url: `https://thepaddock.com.au/ambassadors/${ambassador.slug}`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'The Paddock',
      logo: {
        '@type': 'ImageObject',
        url: 'https://thepaddock.com.au/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    keywords: article.tags?.join(', ') || 'horse racing, racing tips',
  };
}

export function generateBookmakerStructuredData(
  bookmaker: Bookmaker,
  _url: string
): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: bookmaker.name,
    url: bookmaker.affiliateLink,
    description: `${bookmaker.name} - Australian bookmaker offering ${bookmaker.features.join(', ')}`,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: bookmaker.rating,
      bestRating: 5,
      worstRating: 1,
      ratingCount: 100, // Would be dynamic in production
    },
    offers: bookmaker.currentPromotions.map((promo) => ({
      '@type': 'Offer',
      name: promo.title,
      description: promo.description,
      validThrough: promo.validUntil,
      url: bookmaker.affiliateLink,
    })),
    sameAs: [bookmaker.affiliateLink],
  };
}

export function generateBreadcrumbStructuredData(
  items: Array<{ name: string; url: string }>
): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateWebsiteStructuredData(): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'The Paddock',
    description: 'Australian horse racing odds comparison and news with sentiment analysis',
    url: 'https://thepaddock.com.au',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://thepaddock.com.au/races?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateOrganizationStructuredData(): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'The Paddock',
    description: 'Australian horse racing odds comparison and news platform',
    url: 'https://thepaddock.com.au',
    logo: 'https://thepaddock.com.au/logo.png',
    sameAs: ['https://twitter.com/thepaddockau', 'https://facebook.com/thepaddockau'],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'support@thepaddock.com.au',
    },
  };
}
