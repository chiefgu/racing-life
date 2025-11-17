import { Metadata } from 'next';
import BlogPostClient from './BlogPostClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Article | Racing Life`,
    description: 'Read the latest racing news and analysis',
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;

  return <BlogPostClient slug={slug} />;
}
