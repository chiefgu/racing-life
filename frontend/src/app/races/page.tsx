import { Metadata } from 'next';
import RacesClient from './races-client';

export const metadata: Metadata = {
  title: "Today's Races - Racing Life",
  description:
    "View all today's horse races across Australia. Live race updates, form guides, and detailed race information.",
  keywords: ["today's races", 'horse racing', 'Australian racing', 'race schedule', 'live racing'],
};

export default function RacesPage() {
  return <RacesClient />;
}
