import { Metadata } from 'next';
import AIAnalystClient from './AIAnalystClient';

export const metadata: Metadata = {
  title: 'AI Racing Analyst | Racing Life',
  description:
    'Get expert racing insights powered by AI. Ask anything about horses, races, odds, and form.',
};

export default function AIAnalystPage() {
  return <AIAnalystClient />;
}
