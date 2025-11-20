'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  Video,
  MessageSquare,
  ArrowRight,
  Heart,
  Share2,
  Bookmark,
  Play,
  Volume2,
  VolumeX,
} from 'lucide-react';
import EditorialHeader from '@/components/layout/EditorialHeader';
import ModernFooter from '@/components/layout/ModernFooter';
import { cn } from '@/lib/cn';

type Category = 'all' | 'news' | 'analysis' | 'previews' | 'features' | 'videos';
type ContentType = 'article' | 'video';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  category: Category;
  contentType: ContentType;
  publishedAt: string;
  readTime: string;
  featuredImage: string;
  tags: string[];
  isFeatured?: boolean;
  isLarge?: boolean;
  relatedRace?: {
    venue: string;
    raceNumber: number;
  };
}

interface ShortVideo {
  id: string;
  title: string;
  description: string;
  creator: {
    name: string;
    avatar: string;
    handle: string;
  };
  thumbnail: string;
  videoUrl?: string;
  views: string;
  likes: string;
  comments: string;
  publishedAt: string;
  tags: string[];
}

export default function NewsClient() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  // Start with all videos muted for autoplay to work
  const [mutedVideos, setMutedVideos] = useState<Set<string>>(
    new Set(['v1', 'v2', 'v3', 'v4', 'v5', 'v6'])
  );
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  const [bookmarkedVideos, setBookmarkedVideos] = useState<Set<string>>(new Set());
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  // Premium mock articles
  const mockArticles: Article[] = [
    {
      id: '1',
      title: 'The Underdogs Who Could Steal the Melbourne Cup',
      excerpt:
        'In a field dominated by European imports and Australian champions, three overlooked contenders possess the rare combination of form, fitness, and favourable conditions to cause the upset of the decade. Our deep dive into barrier draws, track bias, and historical precedents reveals why the bookmakers may have missed the mark.',
      author: {
        name: 'Sarah Mitchell',
        avatar:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
        role: 'Chief Racing Analyst',
      },
      category: 'analysis',
      contentType: 'article',
      publishedAt: '2 hours ago',
      readTime: '12 min',
      featuredImage: '/blog2.jpg',
      tags: ['Melbourne Cup', 'Value Betting', 'Form Analysis'],
      isFeatured: true,
      relatedRace: { venue: 'Flemington', raceNumber: 7 },
    },
    {
      id: '2',
      title: 'How Heavy 8 Changes Everything at Rosehill',
      excerpt:
        "Track conditions aren't just numbers—they're the silent architect of race outcomes. A forensic analysis of wet weather racing.",
      author: {
        name: 'Tom Richardson',
        avatar:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        role: 'Track Specialist',
      },
      category: 'analysis',
      contentType: 'article',
      publishedAt: '4 hours ago',
      readTime: '8 min',
      featuredImage: '/blog3.jpg',
      tags: ['Track Conditions', 'Rosehill'],
      isLarge: true,
    },
    {
      id: '3',
      title: 'Inside the Mind of James McDonald',
      excerpt:
        "What separates good jockeys from great ones? A rare conversation with racing's most analytical rider about split-second decisions at 60km/h.",
      author: {
        name: 'Emma Chen',
        avatar:
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
        role: 'Features Editor',
      },
      category: 'features',
      contentType: 'article',
      publishedAt: '6 hours ago',
      readTime: '15 min',
      featuredImage: '/blog1.jpg',
      tags: ['Jockeys', 'Interview', 'J. McDonald'],
      isLarge: true,
    },
    {
      id: '4',
      title: 'Thunder Bolt vs Golden Arrow: The Match Race Within the Race',
      excerpt:
        "Flemington's Group 3 isn't just another Saturday—it's a strategic chess match between two champion trainers. Breaking down the barrier battle, pace scenarios, and the one factor that could decide everything.",
      author: {
        name: 'Michael Wong',
        avatar:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        role: 'Race Preview Editor',
      },
      category: 'previews',
      contentType: 'video',
      publishedAt: '8 hours ago',
      readTime: '10 min',
      featuredImage:
        'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&h=600&fit=crop&q=80',
      tags: ['Flemington', 'Group 3', 'Thunder Bolt'],
      relatedRace: { venue: 'Flemington', raceNumber: 4 },
    },
    {
      id: '5',
      title: 'Chris Waller Breaks Silence on Spring Carnival Strategy',
      excerpt:
        "The championship trainer reveals his three-pronged approach to the biggest carnival of the year—and the dark horse nobody's talking about.",
      author: {
        name: 'Lisa Thompson',
        avatar:
          'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face',
        role: 'Senior Correspondent',
      },
      category: 'news',
      contentType: 'article',
      publishedAt: '10 hours ago',
      readTime: '7 min',
      featuredImage:
        'https://images.unsplash.com/photo-1534609104632-c1d58b9a1e6e?w=800&h=600&fit=crop&q=80',
      tags: ['Chris Waller', 'Spring Carnival', 'Breaking'],
    },
    {
      id: '6',
      title: 'The Mathematics of Value Betting',
      excerpt:
        "Understanding implied probability, overround, and expected value—the three pillars of profitable wagering that bookmakers don't want you to master.",
      author: {
        name: 'David Park',
        avatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
        role: 'Betting Analyst',
      },
      category: 'analysis',
      contentType: 'article',
      publishedAt: '12 hours ago',
      readTime: '11 min',
      featuredImage: '/blog2.jpg',
      tags: ['Betting Strategy', 'Value', 'Mathematics'],
    },
    {
      id: '7',
      title: "Randwick Track Walk: What the Numbers Don't Tell You",
      excerpt:
        "Surface penetrometry reads 4.8, but our ground-level analysis reveals why that figure doesn't capture the full picture.",
      author: {
        name: 'Rachel Green',
        avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
        role: 'Track Reporter',
      },
      category: 'news',
      contentType: 'video',
      publishedAt: '14 hours ago',
      readTime: '5 min',
      featuredImage: '/blog3.jpg',
      tags: ['Randwick', 'Track Analysis'],
    },
    {
      id: '8',
      title: 'Lightning Strike: Anatomy of a Champion in the Making',
      excerpt:
        "Six starts. Four wins. One setback that revealed more about this horse's character than any victory ever could. The complete story of racing's brightest rising star.",
      author: {
        name: 'Tom Richardson',
        avatar:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        role: 'Track Specialist',
      },
      category: 'features',
      contentType: 'article',
      publishedAt: '1 day ago',
      readTime: '14 min',
      featuredImage: '/blog1.jpg',
      tags: ['Lightning Strike', 'Deep Dive', 'Rising Stars'],
    },
  ];

  // Mock short form videos - memoized to prevent useEffect dependency issues
  const mockShortVideos: ShortVideo[] = useMemo(
    () => [
      {
        id: 'v1',
        title: 'Race Replay: Flemington R7 - Incredible Finish! 🏇',
        description:
          "You won't believe this photo finish! Thunder Bolt edges out Golden Arrow in the dying strides. Watch the replay from 3 different angles.",
        creator: {
          name: 'Racing Life',
          avatar:
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
          handle: '@racinglife',
        },
        thumbnail: '/blog1.jpg',
        videoUrl:
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        views: '124K',
        likes: '8.2K',
        comments: '342',
        publishedAt: '2h ago',
        tags: ['Race Replay', 'Flemington', 'Photo Finish'],
      },
      {
        id: 'v2',
        title: 'Track Walk: Why Randwick is Racing Slow Today 🌧️',
        description:
          "Heavy 8 conditions at Randwick - here's what the penetrometer readings mean for today's races. Quick 60 second breakdown.",
        creator: {
          name: 'Track Insights',
          avatar:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
          handle: '@trackinsights',
        },
        thumbnail: '/blog3.jpg',
        videoUrl:
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        views: '89K',
        likes: '5.1K',
        comments: '218',
        publishedAt: '4h ago',
        tags: ['Track Conditions', 'Randwick', 'Weather'],
      },
      {
        id: 'v3',
        title: "James McDonald's Winning Move - Breakdown 🎯",
        description:
          'Watch how J-Mac positioned himself perfectly on the turn and found the gap that won the race. Pure masterclass in race riding.',
        creator: {
          name: 'Form Guide Pro',
          avatar:
            'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
          handle: '@formguidepro',
        },
        thumbnail: '/blog2.jpg',
        videoUrl:
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        views: '156K',
        likes: '12.3K',
        comments: '567',
        publishedAt: '6h ago',
        tags: ['Jockey Analysis', 'Strategy', 'J. McDonald'],
      },
      {
        id: 'v4',
        title: 'Behind the Scenes: Morning Track Work at Flemington 🌅',
        description:
          'Ever wondered what happens before race day? Join us trackside at 5am for morning gallops and watch these champions train.',
        creator: {
          name: 'Inside Racing',
          avatar:
            'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face',
          handle: '@insideracing',
        },
        thumbnail:
          'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&h=1000&fit=crop&q=80',
        videoUrl:
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        views: '203K',
        likes: '18.7K',
        comments: '891',
        publishedAt: '8h ago',
        tags: ['Behind the Scenes', 'Training', 'Flemington'],
      },
      {
        id: 'v5',
        title: 'This Horse Was $101 and WON! 💰',
        description:
          "The biggest upset of the year! From last place to first in the final furlong. Here's the full story of the $101 winner.",
        creator: {
          name: 'Racing Upsets',
          avatar:
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
          handle: '@racingupsets',
        },
        thumbnail:
          'https://images.unsplash.com/photo-1534609104632-c1d58b9a1e6e?w=600&h=1000&fit=crop&q=80',
        videoUrl:
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        views: '342K',
        likes: '29.1K',
        comments: '1.2K',
        publishedAt: '12h ago',
        tags: ['Upset', 'Long Shot', 'Winner'],
      },
      {
        id: 'v6',
        title: 'Quick Form Guide: Caulfield R3 🔥',
        description:
          '30 second form guide for Race 3 at Caulfield. Top 3 picks, key stats, and what to watch for.',
        creator: {
          name: 'Racing Life',
          avatar:
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
          handle: '@racinglife',
        },
        thumbnail:
          'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&h=1000&fit=crop&q=80',
        videoUrl:
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        views: '67K',
        likes: '4.2K',
        comments: '156',
        publishedAt: '1h ago',
        tags: ['Form Guide', 'Caulfield', 'Tips'],
      },
    ],
    []
  );

  // Filter articles
  const filteredArticles =
    selectedCategory === 'all'
      ? mockArticles
      : mockArticles.filter((a) => a.category === selectedCategory);

  const featuredArticle = filteredArticles.find((a) => a.isFeatured);
  const largeArticles = filteredArticles.filter((a) => a.isLarge && !a.isFeatured);
  const regularArticles = filteredArticles.filter((a) => !a.isFeatured && !a.isLarge);

  // Autoplay on scroll for videos
  useEffect(() => {
    if (selectedCategory !== 'videos') return;

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.7, // Video needs to be 70% visible
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        const videoId = entry.target.getAttribute('data-video-id');
        if (!videoId) return;

        const videoEl = videoRefs.current[videoId];
        if (!videoEl) return;

        if (entry.isIntersecting) {
          // Video is in viewport, play it
          videoEl.play().catch(() => {
            // Autoplay failed, likely due to browser policy
            console.log('Autoplay prevented');
          });
          setPlayingVideoId(videoId);
        } else {
          // Video is out of viewport, pause it
          videoEl.pause();
          if (playingVideoId === videoId) {
            setPlayingVideoId(null);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe all video elements
    mockShortVideos.forEach((video) => {
      const videoEl = videoRefs.current[video.id];
      if (videoEl) {
        observer.observe(videoEl);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [selectedCategory, mockShortVideos, playingVideoId]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <EditorialHeader />

      <main className="flex-1">
        {/* Minimal Header */}
        <section className="border-b border-gray-900">
          <div className="max-w-[1400px] mx-auto px-6 py-8">
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">News & Analysis</h1>
            <p className="text-gray-600">
              Expert insights, deep dives, and the stories that matter in Australian racing
            </p>
          </div>
        </section>

        {/* Category Filter - Minimal */}
        <section className="bg-gray-50 border-b border-gray-200 sticky top-[104px] z-40">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="flex items-center justify-between py-4">
              <nav className="flex items-center gap-1 overflow-x-auto">
                {[
                  { id: 'all', label: 'Latest' },
                  { id: 'videos', label: 'Short Videos', mobileOnly: true },
                  { id: 'analysis', label: 'Analysis' },
                  { id: 'features', label: 'Features' },
                  { id: 'previews', label: 'Previews' },
                  { id: 'news', label: 'News' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id as Category)}
                    className={cn(
                      'px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap',
                      selectedCategory === cat.id
                        ? 'text-brand-primary border-b-2 border-brand-primary'
                        : 'text-gray-600 hover:text-gray-900',
                      cat.mobileOnly && 'md:hidden'
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </nav>

              <div className="hidden lg:flex items-center gap-4">
                <button className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                  <Search className="w-4 h-4" />
                  Search
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Short Form Video Feed - TikTok Style */}
        {selectedCategory === 'videos' ? (
          <section className="bg-black h-screen md:h-auto md:min-h-screen overflow-hidden">
            <div className="h-full md:h-auto">
              {/* Header - Hide on mobile for full immersion */}
              <div className="hidden md:block sticky top-[104px] z-30 bg-black/95 backdrop-blur-sm border-b border-gray-800 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">For You</h2>
                    <p className="text-sm text-gray-400 mt-1">
                      Racing highlights, tips & behind-the-scenes
                    </p>
                  </div>
                  <Video className="w-6 h-6 text-brand-accent" />
                </div>
              </div>

              {/* Video Feed with snap scrolling - hide scrollbar for clean mobile experience */}
              <div className="snap-y snap-mandatory overflow-y-scroll h-screen md:h-[calc(100vh-104px)] scrollbar-hide">
                {mockShortVideos.map((video) => (
                  <div
                    key={video.id}
                    className="relative bg-black snap-start snap-always h-screen md:h-[calc(100vh-104px)]"
                  >
                    {/* Video Container */}
                    <div className="relative h-full flex items-center justify-center bg-black">
                      {/* Video Player - 9:16 aspect ratio centered */}
                      <div className="relative w-full h-full max-w-[600px]">
                        {video.videoUrl ? (
                          <video
                            ref={(el) => {
                              if (el) videoRefs.current[video.id] = el;
                            }}
                            data-video-id={video.id}
                            src={video.videoUrl}
                            poster={video.thumbnail}
                            loop
                            playsInline
                            muted={mutedVideos.has(video.id)}
                            className="absolute inset-0 w-full h-full object-cover"
                            onClick={() => {
                              const videoEl = videoRefs.current[video.id];
                              if (videoEl) {
                                if (videoEl.paused) {
                                  videoEl.play();
                                  setPlayingVideoId(video.id);
                                } else {
                                  videoEl.pause();
                                  setPlayingVideoId(null);
                                }
                              }
                            }}
                          />
                        ) : (
                          <Image
                            src={video.thumbnail}
                            alt={video.title}
                            fill
                            className="object-cover"
                          />
                        )}

                        {/* Play/Pause Overlay - only show when paused */}
                        {playingVideoId !== video.id && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                              <Play className="w-8 h-8 text-white ml-1" />
                            </div>
                          </div>
                        )}

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                        {/* Content Overlay - Bottom */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-auto">
                          {/* Creator Info */}
                          <div className="flex items-center gap-3 mb-4">
                            <Image
                              src={video.creator.avatar}
                              alt={video.creator.name}
                              width={48}
                              height={48}
                              className="rounded-full border-2 border-white"
                            />
                            <div className="flex-1">
                              <div className="font-bold text-white">{video.creator.name}</div>
                              <div className="text-sm text-gray-300">{video.creator.handle}</div>
                            </div>
                            <button className="px-4 py-1.5 bg-brand-primary hover:bg-brand-primary-intense text-white font-bold text-sm rounded-full transition-colors">
                              Follow
                            </button>
                          </div>

                          {/* Title & Description */}
                          <div className="mb-4">
                            <h3 className="text-white font-bold text-lg mb-2 leading-tight">
                              {video.title}
                            </h3>
                            <p className="text-gray-300 text-sm leading-relaxed line-clamp-2">
                              {video.description}
                            </p>
                          </div>

                          {/* Tags */}
                          <div className="flex gap-2 flex-wrap">
                            {video.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-white/10 backdrop-blur-sm text-white text-xs font-medium rounded"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Right Side Actions */}
                        <div className="absolute right-4 bottom-24 flex flex-col gap-6">
                          {/* Like */}
                          <button
                            onClick={() => {
                              const newLiked = new Set(likedVideos);
                              if (newLiked.has(video.id)) {
                                newLiked.delete(video.id);
                              } else {
                                newLiked.add(video.id);
                              }
                              setLikedVideos(newLiked);
                            }}
                            className="flex flex-col items-center gap-1 group"
                          >
                            <div
                              className={cn(
                                'w-12 h-12 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors',
                                likedVideos.has(video.id) ? 'bg-red-500' : 'bg-white/10'
                              )}
                            >
                              <Heart
                                className={cn(
                                  'w-6 h-6 transition-all',
                                  likedVideos.has(video.id) ? 'fill-white text-white' : 'text-white'
                                )}
                              />
                            </div>
                            <span className="text-white text-xs font-bold">{video.likes}</span>
                          </button>

                          {/* Comment */}
                          <button
                            onClick={() => {
                              alert('Comment feature coming soon!');
                            }}
                            className="flex flex-col items-center gap-1 group"
                          >
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
                              <MessageSquare className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-white text-xs font-bold">{video.comments}</span>
                          </button>

                          {/* Bookmark */}
                          <button
                            onClick={() => {
                              const newBookmarked = new Set(bookmarkedVideos);
                              if (newBookmarked.has(video.id)) {
                                newBookmarked.delete(video.id);
                              } else {
                                newBookmarked.add(video.id);
                              }
                              setBookmarkedVideos(newBookmarked);
                            }}
                            className="flex flex-col items-center gap-1 group"
                          >
                            <div
                              className={cn(
                                'w-12 h-12 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors',
                                bookmarkedVideos.has(video.id) ? 'bg-brand-accent' : 'bg-white/10'
                              )}
                            >
                              <Bookmark
                                className={cn(
                                  'w-6 h-6 transition-all',
                                  bookmarkedVideos.has(video.id)
                                    ? 'fill-white text-white'
                                    : 'text-white'
                                )}
                              />
                            </div>
                          </button>

                          {/* Share */}
                          <button
                            onClick={() => {
                              if (navigator.share) {
                                navigator.share({
                                  title: video.title,
                                  text: video.description,
                                  url: window.location.href,
                                });
                              } else {
                                alert('Share link copied to clipboard!');
                                navigator.clipboard.writeText(window.location.href);
                              }
                            }}
                            className="flex flex-col items-center gap-1 group"
                          >
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
                              <Share2 className="w-6 h-6 text-white" />
                            </div>
                          </button>

                          {/* Sound Toggle */}
                          <button
                            onClick={() => {
                              const newMuted = new Set(mutedVideos);
                              const videoEl = videoRefs.current[video.id];
                              if (newMuted.has(video.id)) {
                                newMuted.delete(video.id);
                                if (videoEl) videoEl.muted = false;
                              } else {
                                newMuted.add(video.id);
                                if (videoEl) videoEl.muted = true;
                              }
                              setMutedVideos(newMuted);
                            }}
                            className="flex flex-col items-center gap-1 group"
                          >
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
                              {mutedVideos.has(video.id) ? (
                                <VolumeX className="w-6 h-6 text-white" />
                              ) : (
                                <Volume2 className="w-6 h-6 text-white" />
                              )}
                            </div>
                          </button>
                        </div>

                        {/* Top Right Info */}
                        <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                          <div className="px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full">
                            <span className="text-white text-xs font-bold">
                              {video.views} views
                            </span>
                          </div>
                          <div className="px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full">
                            <span className="text-white text-xs">{video.publishedAt}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Load More */}
                <div className="snap-start snap-always h-screen md:h-[calc(100vh-104px)] flex items-center justify-center bg-black">
                  <button className="px-8 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold rounded-full transition-colors">
                    Load More Videos
                  </button>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <>
            {/* Featured Hero - Full Bleed */}
            {featuredArticle && selectedCategory === 'all' && (
              <section className="relative bg-black">
                <Link href={`/news/${featuredArticle.id}`} className="block group">
                  <div className="relative h-[70vh] min-h-[600px]">
                    {/* Background Image */}
                    <Image
                      src={featuredArticle.featuredImage}
                      alt={featuredArticle.title}
                      fill
                      className="object-cover opacity-60 group-hover:opacity-70 transition-opacity duration-500"
                      priority
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

                    {/* Content */}
                    <div className="absolute inset-0 flex items-end">
                      <div className="max-w-[1400px] mx-auto px-6 w-full pb-12 lg:pb-16">
                        <div className="max-w-4xl">
                          {/* Category Badge */}
                          <div className="inline-block mb-4">
                            <span className="px-3 py-1 bg-brand-secondary text-white text-xs font-bold uppercase tracking-wider">
                              {featuredArticle.category}
                            </span>
                          </div>

                          {/* Headline */}
                          <h2 className="text-4xl lg:text-6xl font-serif font-bold text-white mb-6 leading-[1.1] group-hover:text-brand-accent transition-colors">
                            {featuredArticle.title}
                          </h2>

                          {/* Excerpt */}
                          <p className="text-lg lg:text-xl text-gray-300 mb-8 leading-relaxed max-w-3xl">
                            {featuredArticle.excerpt}
                          </p>

                          {/* Meta */}
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-3">
                              <Image
                                src={featuredArticle.author.avatar}
                                alt={featuredArticle.author.name}
                                width={48}
                                height={48}
                                className="rounded-full border-2 border-white/20"
                              />
                              <div>
                                <div className="font-bold text-white">
                                  {featuredArticle.author.name}
                                </div>
                                <div className="text-gray-400">{featuredArticle.author.role}</div>
                              </div>
                            </div>
                            <div className="h-4 w-px bg-gray-600" />
                            <div className="flex items-center gap-4 text-gray-400">
                              <span>{featuredArticle.publishedAt}</span>
                              <span>·</span>
                              <span>{featuredArticle.readTime} read</span>
                            </div>
                          </div>

                          {/* Read More */}
                          <div className="mt-6">
                            <span className="inline-flex items-center gap-2 text-white font-semibold group-hover:gap-3 transition-all">
                              Read Full Story
                              <ArrowRight className="w-5 h-5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </section>
            )}

            {/* Main Content - Editorial Grid */}
            <section className="py-16 bg-white">
              <div className="max-w-[1400px] mx-auto px-6">
                <div className="grid lg:grid-cols-12 gap-12">
                  {/* Main Column */}
                  <div className="lg:col-span-8">
                    {/* Large Featured Articles */}
                    {largeArticles.length > 0 && (
                      <div className="mb-16 space-y-12">
                        {largeArticles.map((article) => (
                          <Link
                            key={article.id}
                            href={`/news/${article.id}`}
                            className="block group"
                          >
                            <article className="border-b border-gray-200 pb-12">
                              {/* Category */}
                              <div className="mb-3">
                                <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">
                                  {article.category}
                                </span>
                              </div>

                              {/* Title */}
                              <h3 className="text-3xl lg:text-4xl font-serif font-bold text-brand-dark-intense mb-4 leading-tight group-hover:text-brand-primary transition-colors">
                                {article.title}
                              </h3>

                              {/* Excerpt */}
                              <p className="text-lg text-brand-dark-muted leading-relaxed mb-6">
                                {article.excerpt}
                              </p>

                              {/* Featured Image */}
                              <div className="relative aspect-[16/9] mb-6 overflow-hidden rounded">
                                <Image
                                  src={article.featuredImage}
                                  alt={article.title}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                {article.contentType === 'video' && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                    <div className="w-16 h-16 bg-white/95 rounded-full flex items-center justify-center">
                                      <Video className="w-8 h-8 text-brand-primary" />
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Meta Row */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Image
                                    src={article.author.avatar}
                                    alt={article.author.name}
                                    width={40}
                                    height={40}
                                    className="rounded-full"
                                  />
                                  <div>
                                    <div className="text-sm font-semibold text-gray-900">
                                      {article.author.name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {article.publishedAt} · {article.readTime}
                                    </div>
                                  </div>
                                </div>

                                {/* Tags */}
                                <div className="hidden sm:flex gap-2">
                                  {article.tags.slice(0, 2).map((tag) => (
                                    <span
                                      key={tag}
                                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </article>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Section Divider */}
                    <div className="mb-12 pb-6 border-b-4 border-gray-900">
                      <h2 className="text-2xl font-serif font-bold text-gray-900">More Stories</h2>
                    </div>

                    {/* Regular Articles - 2 Column Grid */}
                    <div className="grid md:grid-cols-2 gap-x-8 gap-y-12">
                      {regularArticles.map((article) => (
                        <Link key={article.id} href={`/news/${article.id}`} className="block group">
                          <article>
                            {/* Image */}
                            <div className="relative aspect-[4/3] mb-4 overflow-hidden rounded">
                              <Image
                                src={article.featuredImage}
                                alt={article.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              {article.contentType === 'video' && (
                                <div className="absolute top-3 right-3">
                                  <div className="w-10 h-10 bg-white/95 rounded-full flex items-center justify-center">
                                    <Video className="w-5 h-5 text-brand-primary" />
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Category */}
                            <div className="mb-2">
                              <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">
                                {article.category}
                              </span>
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-serif font-bold text-gray-900 mb-3 leading-tight group-hover:text-brand-primary transition-colors">
                              {article.title}
                            </h3>

                            {/* Excerpt */}
                            <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-3">
                              {article.excerpt}
                            </p>

                            {/* Meta */}
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span className="font-semibold text-gray-700">
                                {article.author.name}
                              </span>
                              <span>·</span>
                              <span>{article.readTime}</span>
                            </div>
                          </article>
                        </Link>
                      ))}
                    </div>

                    {/* Load More */}
                    <div className="mt-16 text-center">
                      <button className="inline-flex items-center gap-2 px-8 py-4 border-2 border-gray-900 text-gray-900 font-bold hover:bg-gray-900 hover:text-white transition-colors">
                        Load More Stories
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="lg:col-span-4">
                    <div className="sticky top-32 space-y-8">
                      {/* AI Analyst CTA - Premium */}
                      <div className="relative overflow-hidden rounded-lg bg-brand-primary-intense p-8">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
                        <div className="relative">
                          <h3 className="text-xl font-serif font-bold text-white mb-3">
                            Your Personal Racing Analyst
                          </h3>
                          <p className="text-sm text-white/80 mb-6 leading-relaxed">
                            Track your favourite horses, jockeys, and trainers. Get instant alerts
                            on form changes, odds movements, and race entries.
                          </p>

                          <div className="space-y-3 mb-8 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-1 h-1 rounded-full bg-brand-accent"></div>
                              <span className="text-white/90">Real-time performance tracking</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-1 h-1 rounded-full bg-brand-accent"></div>
                              <span className="text-white/90">Personalised race alerts</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-1 h-1 rounded-full bg-brand-accent"></div>
                              <span className="text-white/90">Form guide insights</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-1 h-1 rounded-full bg-brand-accent"></div>
                              <span className="text-white/90">Market movement notifications</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-1 h-1 rounded-full bg-brand-accent"></div>
                              <span className="text-white/90">Historical statistics & trends</span>
                            </div>
                          </div>

                          <Link
                            href="/onboarding"
                            className="block w-full bg-white hover:bg-gray-100 text-black text-center font-semibold py-4 px-4 transition-colors"
                          >
                            Get Started
                          </Link>

                          <p className="text-xs text-white/60 text-center mt-4">
                            Free • No credit card required
                          </p>
                        </div>
                      </div>

                      {/* Trending Now */}
                      <div className="border-t-4 border-gray-900 pt-6">
                        <h3 className="text-xl font-serif font-bold text-gray-900 mb-6">
                          Trending Now
                        </h3>
                        <div className="space-y-6">
                          {mockArticles.slice(0, 4).map((article, idx) => (
                            <Link
                              key={article.id}
                              href={`/news/${article.id}`}
                              className="block group"
                            >
                              <div className="flex gap-4">
                                <div className="text-3xl font-serif font-bold text-gray-200 group-hover:text-brand-primary transition-colors">
                                  {(idx + 1).toString().padStart(2, '0')}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-serif font-bold text-gray-900 mb-1 leading-tight group-hover:text-brand-primary transition-colors">
                                    {article.title}
                                  </h4>
                                  <div className="text-xs text-gray-500">
                                    {article.author.name} · {article.readTime}
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Newsletter Signup */}
                      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <h3 className="font-serif font-bold text-gray-900 mb-2">The Daily Brief</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Expert analysis delivered to your inbox every morning.
                        </p>
                        <input
                          type="email"
                          placeholder="Your email"
                          className="w-full px-4 py-2 border border-gray-300 rounded mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        />
                        <button className="w-full bg-brand-primary hover:bg-brand-primary-intense text-white font-semibold py-2 px-4 rounded transition-colors text-sm">
                          Subscribe
                        </button>
                      </div>

                      {/* Tags Cloud */}
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">
                          Popular Topics
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {[
                            'Melbourne Cup',
                            'Group 1',
                            'Flemington',
                            'Betting Strategy',
                            'Track Conditions',
                            'Form Guide',
                            'Spring Carnival',
                          ].map((tag) => (
                            <button
                              key={tag}
                              className="px-3 py-1.5 border border-gray-300 hover:border-brand-primary hover:text-brand-primary text-gray-700 text-xs font-medium rounded transition-colors"
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <ModernFooter />
    </div>
  );
}
