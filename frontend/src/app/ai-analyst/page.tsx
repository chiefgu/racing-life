import { Metadata } from 'next';
import AIAnalystPage from './AIAnalystPage';

export const metadata: Metadata = {
  title: 'AI Racing Analyst | Racing Life',
  description:
    'Get expert racing insights powered by AI. Ask anything about horses, races, odds, and form.',
};

export default function Page() {
  return <AIAnalystPage />;
}
