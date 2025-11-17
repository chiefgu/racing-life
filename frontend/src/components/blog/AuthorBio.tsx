'use client';

import Image from 'next/image';
import { Twitter, Linkedin, Mail } from 'lucide-react';
import { NewsArticle } from '@/types';

interface AuthorBioProps {
  article: NewsArticle & {
    authorImage?: string;
    authorBio?: string;
    authorSocial?: {
      twitter?: string;
      linkedin?: string;
      email?: string;
    };
  };
}

export default function AuthorBio({ article }: AuthorBioProps) {
  if (!article.author) return null;

  const defaultBio =
    'Racing journalist with over 10 years of experience covering Australian racing. Passionate about form analysis and uncovering the stories behind the sport.';

  return (
    <div className="bg-gray-50 border border-gray-200 p-8">
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Author Photo */}
        {article.authorImage && (
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
              <Image
                src={article.authorImage}
                alt={article.author}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Author Info */}
        <div className="flex-1">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Written by
          </div>
          <h3 className="text-2xl font-serif font-bold text-gray-900 mb-3">
            {article.author}
          </h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            {article.authorBio || defaultBio}
          </p>

          {/* Social Links */}
          {article.authorSocial && (
            <div className="flex items-center gap-3">
              {article.authorSocial.twitter && (
                <a
                  href={article.authorSocial.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white hover:bg-gray-100 border border-gray-300 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4 text-gray-700" />
                </a>
              )}
              {article.authorSocial.linkedin && (
                <a
                  href={article.authorSocial.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white hover:bg-gray-100 border border-gray-300 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4 text-gray-700" />
                </a>
              )}
              {article.authorSocial.email && (
                <a
                  href={`mailto:${article.authorSocial.email}`}
                  className="p-2 bg-white hover:bg-gray-100 border border-gray-300 transition-colors"
                  aria-label="Email"
                >
                  <Mail className="w-4 h-4 text-gray-700" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
