import { Metadata } from 'next';
import NewsClient from './news-client';

export const metadata: Metadata = {
  title: 'News & Analysis - Racing Life',
  description:
    "Latest horse racing news, expert analysis, race previews, and in-depth features from Australia's racing industry.",
  keywords: [
    'racing news',
    'racing analysis',
    'race previews',
    'jockey features',
    'trainer interviews',
    'track analysis',
    'betting strategy',
  ],
};

export default function NewsPage() {
  return <NewsClient />;
}
