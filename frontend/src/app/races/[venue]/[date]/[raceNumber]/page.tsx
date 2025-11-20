import { Metadata } from 'next';
import RacePageClient from './RacePageClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ venue: string; date: string; raceNumber: string }>;
}): Promise<Metadata> {
  const { venue, date, raceNumber } = await params;
  const venueName = venue
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    title: `${venueName} Race ${raceNumber} - ${date} | Racing Life`,
    description: `Live odds comparison for ${venueName} Race ${raceNumber}. Compare 13+ Australian bookmakers, view sectional data, AI racing analyst insights, and expert tips.`,
    keywords: [
      'horse racing odds',
      venueName,
      'odds comparison',
      'racing tips',
      'sectional data',
      'AI racing analyst',
    ],
  };
}

export default async function RacePage({
  params,
}: {
  params: Promise<{ venue: string; date: string; raceNumber: string }>;
}) {
  const resolvedParams = await params;
  return <RacePageClient params={resolvedParams} />;
}
