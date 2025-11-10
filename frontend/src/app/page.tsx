import { Metadata } from 'next';
import HomeClient from './home-client';

export const metadata: Metadata = {
  title: 'Racing Life - Australian Horse Racing Odds Comparison & News',
  description: 'Compare live odds from Australia\'s top bookmakers including TAB, Sportsbet, Ladbrokes, and Neds. Get expert racing tips, news with sentiment analysis, and find the best betting prices.',
  keywords: [
    'horse racing odds',
    'odds comparison',
    'Australian racing',
    'TAB',
    'Sportsbet',
    'Ladbrokes',
    'Neds',
    'racing tips',
    'racing news',
    'betting odds',
  ],
};

export default function Home() {
  return <HomeClient />;
}
