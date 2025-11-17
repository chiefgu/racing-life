'use client';

import { useState } from 'react';
import { NewsArticle } from '@/types';
import EntityCardModal from './EntityCardModal';

interface BlogPostContentProps {
  article: NewsArticle;
}

export default function BlogPostContent({ article }: BlogPostContentProps) {
  const [selectedEntity, setSelectedEntity] = useState<{
    name: string;
    type: 'horse' | 'jockey' | 'trainer';
  } | null>(null);

  // Function to detect and make entity mentions clickable
  const renderContentWithEntities = (content: string) => {
    let processedContent = content;
    const allEntities = [
      ...article.entities.horses.map((h) => ({ name: h, type: 'horse' as const })),
      ...article.entities.jockeys.map((j) => ({ name: j, type: 'jockey' as const })),
      ...article.entities.trainers.map((t) => ({ name: t, type: 'trainer' as const })),
    ];

    // Sort by length (longest first) to avoid partial replacements
    allEntities.sort((a, b) => b.name.length - a.name.length);

    // Split content into paragraphs
    const paragraphs = processedContent.split('\n\n');

    return paragraphs.map((paragraph, pIndex) => {
      if (!paragraph.trim()) return null;

      let parts: (string | JSX.Element)[] = [paragraph];

      // Replace entity mentions with clickable spans
      allEntities.forEach((entity, entityIndex) => {
        const newParts: (string | JSX.Element)[] = [];

        parts.forEach((part, partIndex) => {
          if (typeof part === 'string') {
            const regex = new RegExp(`\\b(${entity.name})\\b`, 'g');
            const splits = part.split(regex);

            splits.forEach((split, splitIndex) => {
              if (split === entity.name) {
                newParts.push(
                  <button
                    key={`${pIndex}-${entityIndex}-${partIndex}-${splitIndex}`}
                    onClick={() => setSelectedEntity(entity)}
                    className="text-brand-primary hover:text-brand-primary-intense font-medium underline decoration-dotted underline-offset-2 cursor-pointer transition-colors"
                  >
                    {split}
                  </button>
                );
              } else if (split) {
                newParts.push(split);
              }
            });
          } else {
            newParts.push(part);
          }
        });

        parts = newParts;
      });

      return (
        <p key={pIndex} className="text-lg font-serif text-gray-800 leading-relaxed mb-8">
          {parts}
        </p>
      );
    });
  };

  return (
    <>
      <article className="prose prose-lg max-w-none">
        {/* Article Content with Generous Spacing */}
        <div className="text-gray-800">
          {renderContentWithEntities(article.content || article.rewrittenContent || '')}
        </div>
      </article>

      {/* Entity Card Modal */}
      {selectedEntity && (
        <EntityCardModal
          entity={selectedEntity}
          onClose={() => setSelectedEntity(null)}
        />
      )}
    </>
  );
}
