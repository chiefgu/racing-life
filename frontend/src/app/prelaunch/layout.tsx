import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Racing Life - Expert Racing Tips & Odds Comparison',
  description: 'Get daily expert racing tips and odds comparison from Australia\'s top bookmakers. Professional analysis delivered straight to your inbox every morning.',
};

export default function PrelaunchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
