'use client';

import { useState } from 'react';
import { Facebook, Twitter, Linkedin, Link as LinkIcon, Check } from 'lucide-react';
import { NewsArticle } from '@/types';

interface SocialShareProps {
  article: NewsArticle;
}

export default function SocialShare({ article }: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = article.title;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText
    )}&url=${encodeURIComponent(shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
  };

  return (
    <div className="border-y border-gray-200 py-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-serif font-bold text-gray-900 mb-1">Share this article</h3>
          <p className="text-sm text-gray-600">
            Help spread the word about quality racing journalism
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Twitter */}
          <a
            href={shareLinks.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-black hover:bg-gray-800 text-white transition-colors"
            aria-label="Share on Twitter"
          >
            <Twitter className="w-5 h-5" />
          </a>

          {/* Facebook */}
          <a
            href={shareLinks.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            aria-label="Share on Facebook"
          >
            <Facebook className="w-5 h-5" />
          </a>

          {/* LinkedIn */}
          <a
            href={shareLinks.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-blue-700 hover:bg-blue-800 text-white transition-colors"
            aria-label="Share on LinkedIn"
          >
            <Linkedin className="w-5 h-5" />
          </a>

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="p-3 bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
            aria-label="Copy link"
          >
            {copied ? <Check className="w-5 h-5 text-green-600" /> : <LinkIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
