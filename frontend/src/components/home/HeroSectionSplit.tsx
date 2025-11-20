'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { TrendingDown, TrendingUp, Search, X, BarChart3, FileText, Info } from 'lucide-react';
import AnimatedOrb from '@/components/shared/AnimatedOrb';
import { Shimmer } from '@/components/ui/Shimmer';
import { AnimatePresence, motion } from 'framer-motion';
import OddsComparisonWidget from '@/components/chat/OddsComparisonWidget';
import FormGuideCard from '@/components/chat/FormGuideCard';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  showOddsWidget?: boolean;
  showFormGuide?: boolean;
  quickActions?: Array<{
    label: string;
    icon: 'odds' | 'form' | 'info';
    action: () => void;
  }>;
  suggestions?: string[];
}

function CountdownTimer({ targetTime }: { targetTime: Date }) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isCalculating, setIsCalculating] = useState(true);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const difference = targetTime.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft('LIVE NOW');
        setIsCalculating(false);
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }

      setIsCalculating(false);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [targetTime]);

  if (isCalculating) {
    return <span className="text-brand-dark-muted/50">--:--</span>;
  }

  return <span>{timeLeft}</span>;
}

export default function HeroSectionSplit() {
  // Loading states
  const [isLoadingMarketMovers, setIsLoadingMarketMovers] = useState(true);
  const [isLoadingRaces, setIsLoadingRaces] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Chat states
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  // Typewriter animation states
  const [placeholderText, setPlaceholderText] = useState('');
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  // Create target times (using today's date with specific times)
  const now = new Date();

  const race1Time = new Date(now);
  race1Time.setHours(14, 15, 0, 0); // 2:15 PM
  if (race1Time < now) race1Time.setDate(race1Time.getDate() + 1);

  const race2Time = new Date(now);
  race2Time.setHours(14, 45, 0, 0); // 2:45 PM
  if (race2Time < now) race2Time.setDate(race2Time.getDate() + 1);

  const race3Time = new Date(now);
  race3Time.setHours(15, 20, 0, 0); // 3:20 PM
  if (race3Time < now) race3Time.setDate(race3Time.getDate() + 1);

  // Generate dynamic example queries based on today's races
  const exampleQueries = [
    'Best odds for R4 Flemington',
    'Track conditions at Randwick',
    'Thunder Bolt form guide',
    'Race results today',
  ];

  // Load saved chat history on mount
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem('racingLifeChatHistory');
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages) as Array<
          Omit<ChatMessage, 'timestamp'> & { timestamp: string }
        >;
        // Convert timestamp strings back to Date objects
        const messagesWithDates: ChatMessage[] = parsed.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(messagesWithDates);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  }, []);

  // Save chat history when messages change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem('racingLifeChatHistory', JSON.stringify(messages));
      } catch (error) {
        console.error('Failed to save chat history:', error);
      }
    }
  }, [messages]);

  // Simulate data loading
  useEffect(() => {
    // Simulate market movers loading (in production, this would be an API call)
    const marketMoversTimer = setTimeout(() => {
      setIsLoadingMarketMovers(false);
    }, 1500);

    // Simulate race data loading (in production, this would be an API call)
    const racesTimer = setTimeout(() => {
      setIsLoadingRaces(false);
    }, 1200);

    return () => {
      clearTimeout(marketMoversTimer);
      clearTimeout(racesTimer);
    };
  }, []);

  // Typewriter effect (disabled when chat is expanded)
  useEffect(() => {
    if (isChatExpanded) return;

    const prompts = [
      'What are the best odds for Flemington R4?',
      'Which horse has the best recent form?',
      'What are the track conditions at Randwick?',
      'Who are the top jockeys today?',
    ];

    const currentPrompt = prompts[currentPromptIndex];
    let timeout: NodeJS.Timeout;

    if (isTyping) {
      // Typing animation
      if (placeholderText.length < currentPrompt.length) {
        timeout = setTimeout(() => {
          setPlaceholderText(currentPrompt.slice(0, placeholderText.length + 1));
        }, 80); // Typing speed
      } else {
        // Pause at the end before backspacing
        timeout = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
      }
    } else {
      // Backspacing animation
      if (placeholderText.length > 0) {
        timeout = setTimeout(() => {
          setPlaceholderText(placeholderText.slice(0, -1));
        }, 50); // Backspacing speed (faster)
      } else {
        // Move to next prompt
        setCurrentPromptIndex((prevIndex) => (prevIndex + 1) % prompts.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeout);
  }, [placeholderText, isTyping, currentPromptIndex, isChatExpanded]);

  // Scroll within the messages container only (doesn't affect page scroll)
  useEffect(() => {
    if (
      isChatExpanded &&
      lastMessageRef.current &&
      messagesContainerRef.current &&
      messages.length > 0
    ) {
      const container = messagesContainerRef.current;
      const lastMessage = messages[messages.length - 1];

      // Small delay to let the message render
      setTimeout(() => {
        // Calculate position of last message relative to container
        const messageElement = lastMessageRef.current;
        if (messageElement) {
          const containerRect = container.getBoundingClientRect();
          const messageRect = messageElement.getBoundingClientRect();

          // Calculate how much to scroll to show the top of the message
          const scrollAmount = messageRect.top - containerRect.top + container.scrollTop;

          if (lastMessage.role === 'assistant') {
            // For AI messages, scroll to show the top
            container.scrollTo({
              top: scrollAmount,
              behavior: 'smooth',
            });
          } else {
            // For user messages, scroll to bottom
            container.scrollTo({
              top: container.scrollHeight,
              behavior: 'smooth',
            });
          }
        }
      }, 100);
    }
  }, [messages, isChatExpanded]);

  // Handle closing chat
  const handleCloseChat = () => {
    setIsChatExpanded(false);
    setSearchQuery('');
    // Clear chat history
    setMessages([]);
    localStorage.removeItem('racingLifeChatHistory');
  };

  // Handle escape key to close chat
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isChatExpanded) {
        handleCloseChat();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChatExpanded]);

  // Handle chat submission
  const handleSubmitChat = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!searchQuery.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: searchQuery.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setSearchQuery('');
    setIsChatExpanded(true);
    setIsAiTyping(true);

    // Reset textarea height and auto-focus the input after sending
    setTimeout(() => {
      if (chatInputRef.current) {
        chatInputRef.current.style.height = 'auto';
        chatInputRef.current.focus();
      }
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    }, 100);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const query = userMessage.content.toLowerCase();
      let aiMessage: ChatMessage;

      // Demo: Show odds widget for odds-related queries
      if (query.includes('odds') || query.includes('price')) {
        aiMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Here are the current odds for Thunder Bolt across all major bookmakers. TAB currently has the best price at $3.50. You can click any bookmaker to place your bet.`,
          timestamp: new Date(),
          showOddsWidget: true,
          quickActions: [
            {
              label: 'View Form Guide',
              icon: 'form',
              action: () => alert('Show form guide'),
            },
            {
              label: 'Track Performance',
              icon: 'info',
              action: () => alert('Show track stats'),
            },
          ],
          suggestions: ['How does Thunder Bolt perform on Good 4?', 'Who is the jockey?'],
        };
      }
      // Demo: Show form guide for form-related queries
      else if (query.includes('form') || query.includes('performance') || query.includes('runs')) {
        aiMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Here's the complete form guide for Thunder Bolt. This 5-year-old gelding has strong recent form with 2 wins from the last 5 starts. Particularly impressive at this distance.`,
          timestamp: new Date(),
          showFormGuide: true,
          quickActions: [
            {
              label: 'Compare Odds',
              icon: 'odds',
              action: () => alert('Show odds comparison'),
            },
            {
              label: 'Jockey Stats',
              icon: 'info',
              action: () => alert('Show jockey statistics'),
            },
          ],
          suggestions: ['What are the odds for this horse?', 'Show track record at Flemington'],
        };
      }
      // Default response
      else {
        aiMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `I understand you're asking about "${userMessage.content}". I can help you with odds comparison, form analysis, track records, jockey statistics, and more. Try asking about odds or form to see interactive cards!`,
          timestamp: new Date(),
          suggestions: [
            'Show me the best odds for Thunder Bolt',
            "What is Lightning Strike's recent form?",
          ],
        };
      }

      setMessages((prev) => [...prev, aiMessage]);
      setIsAiTyping(false);

      // Auto-focus input again after AI responds
      setTimeout(() => {
        chatInputRef.current?.focus();
      }, 100);
    }, 1500);
  };

  return (
    <section className="bg-white">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Main Hero Area */}
        <div className="py-12 border-b border-brand-ui-muted">
          <div className="grid lg:grid-cols-[2fr,1fr] gap-12">
            {/* Left: News-style Layout */}
            <div>
              {/* AI Racing Analyst Hero */}
              <div ref={chatContainerRef} className="mb-8 pb-8 border-b border-brand-ui">
                <div className="flex flex-col">
                  {/* Header with Orb */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0">
                      <AnimatedOrb size="medium" energy={5} />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-2">
                        Racing Life Analyst
                      </div>
                      <h1 className="text-4xl lg:text-5xl font-serif font-bold text-brand-dark-intense leading-tight">
                        Ask Anything About Racing
                      </h1>
                    </div>
                  </div>

                  {/* Description */}
                  <AnimatePresence mode="wait">
                    {!isChatExpanded && (
                      <motion.p
                        initial={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-lg text-brand-dark-muted leading-relaxed mb-4"
                      >
                        From beginner basics to expert analysis. Get instant answers, compare odds
                        from top bookmakers, and discover winning insights for every level.
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* Search Bar - Only show when chat is NOT expanded */}
                  <AnimatePresence mode="wait">
                    {!isChatExpanded && (
                      <motion.form
                        initial={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        onSubmit={handleSubmitChat}
                        className="mb-3 overflow-hidden"
                      >
                        <div className="relative bg-white rounded-full shadow-md hover:shadow-lg focus-within:shadow-lg transition-shadow border border-gray-200 focus-within:border-brand-primary">
                          <div className="flex items-center px-4 py-3">
                            <Search className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                            <textarea
                              ref={inputRef}
                              value={searchQuery}
                              onChange={(e) => {
                                setSearchQuery(e.target.value);
                                // Auto-resize textarea
                                e.target.style.height = 'auto';
                                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSubmitChat();
                                }
                              }}
                              placeholder={`${placeholderText}${placeholderText ? '|' : ''}`}
                              rows={1}
                              className="flex-1 text-base outline-none focus:outline-none text-gray-900 placeholder-gray-400 resize-none overflow-y-auto"
                              style={{ maxHeight: '120px', minHeight: '24px' }}
                            />
                            <button
                              type="submit"
                              className="ml-2 bg-brand-primary hover:bg-brand-primary-intense text-white px-4 py-2 rounded-full font-semibold transition-colors text-sm flex-shrink-0"
                            >
                              Ask AI
                            </button>
                          </div>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  {/* Example Query Tags */}
                  <AnimatePresence mode="wait">
                    {!isChatExpanded && (
                      <motion.div
                        initial={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-2 gap-1.5 md:flex md:flex-wrap overflow-hidden"
                      >
                        {exampleQueries.map((query, index) => (
                          <button
                            key={index}
                            onClick={() => setSearchQuery(query)}
                            className="text-xs bg-brand-light hover:bg-white border border-gray-200 hover:border-brand-primary text-gray-600 hover:text-brand-primary px-2.5 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis"
                          >
                            "{query}"
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Chat Interface */}
                  <AnimatePresence mode="wait">
                    {isChatExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4, ease: 'easeInOut' }}
                        className="overflow-hidden mt-4"
                      >
                        <div className="relative bg-gray-50 rounded-lg border border-gray-200">
                          {/* Close Button */}
                          <button
                            onClick={handleCloseChat}
                            className="absolute top-3 right-3 z-10 p-1.5 bg-white hover:bg-gray-100 rounded-full transition-colors shadow-sm"
                            aria-label="Close chat"
                          >
                            <X className="w-4 h-4 text-gray-600" />
                          </button>

                          {/* Chat Messages */}
                          <div
                            ref={messagesContainerRef}
                            className="p-6 pt-12 max-h-96 overflow-y-auto space-y-4"
                          >
                            {messages.map((message, index) => {
                              const isLastMessage = index === messages.length - 1;
                              return (
                                <motion.div
                                  key={message.id}
                                  ref={isLastMessage ? lastMessageRef : null}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}
                                >
                                  <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                                      message.role === 'user'
                                        ? 'bg-brand-primary text-white'
                                        : 'bg-white text-gray-900 border border-gray-200'
                                    }`}
                                  >
                                    <p className="text-sm leading-relaxed">{message.content}</p>
                                    <span
                                      className={`text-xs mt-1 block ${
                                        message.role === 'user' ? 'text-white/70' : 'text-gray-500'
                                      }`}
                                    >
                                      {message.timestamp.toLocaleTimeString('en-AU', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </span>
                                  </div>

                                  {/* Widgets */}
                                  {message.role === 'assistant' && (
                                    <>
                                      {message.showOddsWidget && (
                                        <div className="w-full max-w-md mt-2">
                                          <OddsComparisonWidget
                                            horseName="Thunder Bolt"
                                            race="Flemington R4 · 1400m"
                                            bookmakerOdds={[
                                              {
                                                bookmaker: 'TAB',
                                                logo: '/logos/tab.png',
                                                odds: 3.5,
                                                wasOdds: 3.8,
                                                url: 'https://tab.com.au',
                                              },
                                              {
                                                bookmaker: 'Sportsbet',
                                                logo: '/logos/sportsbet.jpeg',
                                                odds: 3.6,
                                                url: 'https://sportsbet.com.au',
                                              },
                                              {
                                                bookmaker: 'Ladbrokes',
                                                logo: '/logos/ladbrokes.png',
                                                odds: 3.7,
                                                wasOdds: 3.5,
                                                url: 'https://ladbrokes.com.au',
                                              },
                                              {
                                                bookmaker: 'Bet365',
                                                logo: '/logos/bet365.png',
                                                odds: 3.8,
                                                url: 'https://bet365.com.au',
                                              },
                                            ]}
                                          />
                                        </div>
                                      )}

                                      {message.showFormGuide && (
                                        <div className="w-full max-w-md mt-2">
                                          <FormGuideCard
                                            horseName="Thunder Bolt"
                                            age={5}
                                            sex="Gelding"
                                            trainer="C. Waller"
                                            jockey="J. McDonald"
                                            weight="58.5kg"
                                            barrier={4}
                                            careerStats={{
                                              starts: 18,
                                              wins: 6,
                                              places: 4,
                                              prize: '$425k',
                                            }}
                                            recentForm={[
                                              {
                                                date: '12 Jan',
                                                track: 'Randwick',
                                                distance: '1400m',
                                                position: 1,
                                                totalRunners: 12,
                                                trackCondition: 'Good 4',
                                                time: '1:22.45',
                                              },
                                              {
                                                date: '28 Dec',
                                                track: 'Flemington',
                                                distance: '1400m',
                                                position: 2,
                                                totalRunners: 14,
                                                trackCondition: 'Soft 5',
                                                time: '1:23.12',
                                              },
                                              {
                                                date: '15 Dec',
                                                track: 'Caulfield',
                                                distance: '1600m',
                                                position: 1,
                                                totalRunners: 10,
                                                trackCondition: 'Good 3',
                                                time: '1:34.67',
                                              },
                                              {
                                                date: '1 Dec',
                                                track: 'Moonee Valley',
                                                distance: '1400m',
                                                position: 5,
                                                totalRunners: 12,
                                                trackCondition: 'Good 4',
                                                time: '1:23.89',
                                              },
                                              {
                                                date: '18 Nov',
                                                track: 'Flemington',
                                                distance: '1200m',
                                                position: 3,
                                                totalRunners: 16,
                                                trackCondition: 'Firm 2',
                                                time: '1:09.23',
                                              },
                                            ]}
                                            trackRecord={{
                                              starts: 4,
                                              wins: 2,
                                              places: 1,
                                            }}
                                            distanceRecord={{
                                              starts: 8,
                                              wins: 4,
                                              places: 2,
                                            }}
                                          />
                                        </div>
                                      )}

                                      {/* Quick Action Buttons */}
                                      {message.quickActions && message.quickActions.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                          {message.quickActions.map((action, idx) => (
                                            <button
                                              key={idx}
                                              onClick={action.action}
                                              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 hover:border-brand-primary text-gray-700 hover:text-brand-primary rounded-full text-xs font-medium transition-colors"
                                            >
                                              {action.icon === 'odds' && (
                                                <BarChart3 className="w-3.5 h-3.5" />
                                              )}
                                              {action.icon === 'form' && (
                                                <FileText className="w-3.5 h-3.5" />
                                              )}
                                              {action.icon === 'info' && (
                                                <Info className="w-3.5 h-3.5" />
                                              )}
                                              {action.label}
                                            </button>
                                          ))}
                                        </div>
                                      )}

                                      {/* Contextual Suggestions */}
                                      {message.suggestions && message.suggestions.length > 0 && (
                                        <div className="mt-3 space-y-1.5">
                                          <div className="text-xs text-gray-500 font-medium">
                                            You might also ask:
                                          </div>
                                          {message.suggestions.map((suggestion, idx) => (
                                            <button
                                              key={idx}
                                              onClick={() => setSearchQuery(suggestion)}
                                              className="block w-full text-left px-3 py-2 bg-gray-50 hover:bg-white border border-gray-200 hover:border-brand-primary text-gray-700 hover:text-brand-primary rounded-lg text-xs transition-colors"
                                            >
                                              {suggestion}
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                    </>
                                  )}
                                </motion.div>
                              );
                            })}

                            {/* AI Typing Indicator */}
                            {isAiTyping && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex justify-start"
                              >
                                <div className="bg-white text-gray-900 border border-gray-200 rounded-2xl px-4 py-3">
                                  <div className="flex gap-1">
                                    <span
                                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                      style={{ animationDelay: '0ms' }}
                                    ></span>
                                    <span
                                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                      style={{ animationDelay: '150ms' }}
                                    ></span>
                                    <span
                                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                      style={{ animationDelay: '300ms' }}
                                    ></span>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </div>

                          {/* Input at Bottom of Chat */}
                          <div className="border-t border-gray-200 bg-white rounded-b-lg p-4">
                            <form onSubmit={handleSubmitChat}>
                              <div className="relative bg-gray-50 rounded-full border border-gray-200 focus-within:border-brand-primary transition-colors">
                                <div className="flex items-center px-4 py-3">
                                  <textarea
                                    ref={chatInputRef}
                                    value={searchQuery}
                                    onChange={(e) => {
                                      setSearchQuery(e.target.value);
                                      // Auto-resize textarea
                                      e.target.style.height = 'auto';
                                      e.target.style.height =
                                        Math.min(e.target.scrollHeight, 120) + 'px';
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmitChat();
                                      }
                                    }}
                                    placeholder="Ask a follow-up question..."
                                    rows={1}
                                    className="flex-1 text-base outline-none focus:outline-none text-gray-900 placeholder-gray-400 bg-transparent resize-none overflow-y-auto"
                                    style={{ maxHeight: '120px', minHeight: '24px' }}
                                  />
                                  <button
                                    type="submit"
                                    className="ml-2 bg-brand-primary hover:bg-brand-primary-intense text-white px-4 py-2 rounded-full font-semibold transition-colors text-sm flex-shrink-0"
                                  >
                                    Send
                                  </button>
                                </div>
                              </div>
                            </form>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Secondary Stories Grid */}
              <AnimatePresence mode="wait">
                {!isChatExpanded && (
                  <motion.div
                    initial={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.3 }}
                    className="grid md:grid-cols-3 gap-6 overflow-hidden"
                  >
                    {/* Story 1 - Featured News */}
                    <div className="border-l-4 border-gray-300 pl-4">
                      <div className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-2">
                        Featured Story
                      </div>
                      <h3 className="text-xl font-serif font-bold text-brand-dark-intense mb-2 leading-tight hover:text-brand-primary transition-colors cursor-pointer">
                        Melbourne Cup 2025: Dark Horses Set to Upset Favourites
                      </h3>
                      <p className="text-sm text-brand-dark-muted mb-3">
                        Our analysts break down the overlooked contenders that could deliver serious
                        returns in this year's race that stops a nation.
                      </p>
                      <div className="flex items-center gap-2 text-xs text-brand-dark-muted">
                        <div className="w-6 h-6 rounded-full bg-brand-light-intense overflow-hidden">
                          <Image
                            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face"
                            alt="Sarah Mitchell"
                            width={24}
                            height={24}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="font-medium">Sarah Mitchell</span>
                        <span>·</span>
                        <span>2h ago</span>
                      </div>
                    </div>

                    {/* Story 2 - Market Movers */}
                    <div className="border-l-4 border-gray-300 pl-4">
                      {isLoadingMarketMovers ? (
                        <div className="flex flex-col gap-3">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="space-y-1.5">
                              <Shimmer className="h-4 w-20 mb-2" />
                              <Shimmer className="h-5 w-32 mb-1" />
                              <div className="flex justify-between items-center">
                                <Shimmer className="h-3 w-28" />
                                <Shimmer className="h-5 w-16" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {/* Market Steamer 1 */}
                          <div>
                            <div className="flex items-center gap-1 mb-0.5">
                              <TrendingDown className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
                              <span className="text-[10px] md:text-xs font-bold text-green-600 uppercase tracking-wider">
                                Steamer
                              </span>
                            </div>
                            <div className="space-y-0.5">
                              <div className="flex items-baseline justify-between gap-2">
                                <a
                                  href="#race-randwick-r6"
                                  className="text-sm md:text-base font-bold text-brand-dark-intense hover:text-brand-primary transition-colors truncate"
                                >
                                  Lightning Strike
                                </a>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <span className="text-[10px] md:text-xs text-brand-dark-muted line-through">
                                    $5.20
                                  </span>
                                  <span className="text-xs md:text-sm font-bold text-green-600">$4.20</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <a
                                  href="#race-randwick-r6"
                                  className="text-[10px] md:text-xs text-brand-dark-muted hover:text-brand-primary transition-colors truncate"
                                >
                                  Randwick R6 · 1200m
                                </a>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <span className="text-[10px] md:text-xs text-brand-dark-muted">Best</span>
                                  <a
                                    href="#race-randwick-r6"
                                    className="w-8 h-4 md:w-10 md:h-5 bg-white rounded flex items-center justify-center p-0.5 hover:opacity-80 transition-opacity"
                                  >
                                    <Image
                                      src="/logos/sportsbet.jpeg"
                                      alt="Sportsbet"
                                      width={28}
                                      height={14}
                                      className="object-contain"
                                    />
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Market Steamer 2 */}
                          <div>
                            <div className="flex items-center gap-1 mb-0.5">
                              <TrendingDown className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
                              <span className="text-[10px] md:text-xs font-bold text-green-600 uppercase tracking-wider">
                                Steamer
                              </span>
                            </div>
                            <div className="space-y-0.5">
                              <div className="flex items-baseline justify-between gap-2">
                                <a
                                  href="#race-caulfield-r8"
                                  className="text-sm md:text-base font-bold text-brand-dark-intense hover:text-brand-primary transition-colors truncate"
                                >
                                  Golden Arrow
                                </a>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <span className="text-[10px] md:text-xs text-brand-dark-muted line-through">
                                    $7.50
                                  </span>
                                  <span className="text-xs md:text-sm font-bold text-green-600">$6.20</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <a
                                  href="#race-caulfield-r8"
                                  className="text-[10px] md:text-xs text-brand-dark-muted hover:text-brand-primary transition-colors truncate"
                                >
                                  Caulfield R8 · 2400m
                                </a>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <span className="text-[10px] md:text-xs text-brand-dark-muted">Best</span>
                                  <a
                                    href="#race-caulfield-r8"
                                    className="w-8 h-4 md:w-10 md:h-5 bg-white rounded flex items-center justify-center p-0.5 hover:opacity-80 transition-opacity"
                                  >
                                    <Image
                                      src="/logos/ladbrokes.png"
                                      alt="Ladbrokes"
                                      width={28}
                                      height={14}
                                      className="object-contain"
                                    />
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Divider */}
                          <div className="border-t border-brand-ui"></div>

                          {/* Market Drifter */}
                          <div>
                            <div className="flex items-center gap-1 mb-0.5">
                              <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-red-600" />
                              <span className="text-[10px] md:text-xs font-bold text-red-600 uppercase tracking-wider">
                                Drifter
                              </span>
                            </div>
                            <div className="space-y-0.5">
                              <div className="flex items-baseline justify-between gap-2">
                                <a
                                  href="#race-flemington-r4"
                                  className="text-sm md:text-base font-bold text-brand-dark-intense hover:text-brand-primary transition-colors truncate"
                                >
                                  Storm Warning
                                </a>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <span className="text-[10px] md:text-xs text-brand-dark-muted line-through">
                                    $3.80
                                  </span>
                                  <span className="text-xs md:text-sm font-bold text-red-600">$4.60</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <a
                                  href="#race-flemington-r4"
                                  className="text-[10px] md:text-xs text-brand-dark-muted hover:text-brand-primary transition-colors truncate"
                                >
                                  Flemington R4 · 1400m
                                </a>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <span className="text-[10px] md:text-xs text-brand-dark-muted">Best</span>
                                  <a
                                    href="#race-flemington-r4"
                                    className="w-8 h-4 md:w-10 md:h-5 bg-white rounded flex items-center justify-center p-0.5 hover:opacity-80 transition-opacity"
                                  >
                                    <Image
                                      src="/logos/tab.png"
                                      alt="TAB"
                                      width={28}
                                      height={14}
                                      className="object-contain"
                                    />
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Story 3 - Analysis */}
                    <div className="border-l-4 border-gray-300 pl-4">
                      <div className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                        Expert Analysis
                      </div>
                      <h3 className="text-xl font-serif font-bold text-brand-dark-intense mb-2 leading-tight hover:text-brand-primary transition-colors cursor-pointer">
                        Jockey Form Guide: Who's Hot This Week
                      </h3>
                      <p className="text-sm text-brand-dark-muted mb-3">
                        J. Smith continues dominant run with three wins from five starts across
                        metropolitan tracks. Our analysis highlights strong performance on soft
                        ground conditions.
                      </p>
                      <div className="flex items-center gap-2 text-xs text-brand-dark-muted">
                        <div className="w-6 h-6 rounded-full bg-brand-light-intense overflow-hidden">
                          <Image
                            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
                            alt="Tom Richardson"
                            width={24}
                            height={24}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="font-medium">Tom Richardson</span>
                        <span>·</span>
                        <span>4 hours ago</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right: Advertisement Banner */}
            <div className="hidden lg:flex lg:justify-end">
              <div className="sticky top-24">
                <div className="border border-brand-ui-muted overflow-hidden bg-white inline-block h-[600px]">
                  <Image
                    src="/tab-advert.png"
                    alt="TAB Advertisement"
                    width={400}
                    height={600}
                    className="h-full w-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6">
        {/* Live Odds Strip */}
        <div className="py-8 border-b border-brand-ui-muted">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-brand-dark-intense uppercase tracking-wide">
              Next to Jump
            </h2>
            <span className="text-sm font-medium text-brand-dark-intense hover:text-brand-primary-intense border-b border-brand-dark-intense hover:border-brand-primary-intense cursor-pointer transition-colors">
              View all races →
            </span>
          </div>

          {/* Horizontal Scrolling Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {isLoadingRaces ? (
              // Loading skeleton for race cards
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border border-brand-ui rounded-lg overflow-hidden">
                    <div className="bg-brand-light-intense px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <Shimmer className="h-3 w-24" />
                          <Shimmer className="h-4 w-32" />
                        </div>
                        <div className="space-y-2">
                          <Shimmer className="h-3 w-16" />
                          <Shimmer className="h-5 w-20" />
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-white">
                      <div className="mb-3">
                        <Shimmer className="h-3 w-20 mb-2" />
                        <Shimmer className="h-5 w-28" />
                      </div>
                      <div className="flex items-end justify-between">
                        <div className="space-y-2">
                          <Shimmer className="h-3 w-16" />
                          <Shimmer className="h-7 w-16" />
                        </div>
                        <div className="space-y-2">
                          <Shimmer className="h-3 w-20" />
                          <Shimmer className="h-7 w-14" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                {/* Race Card 1 */}
                <div className="group cursor-default">
                  <div className="border border-brand-ui hover:border-brand-ui-intense transition-colors rounded-lg overflow-hidden">
                    <div className="bg-brand-secondary text-white px-3 py-2 animate-pulse-subtle">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[10px] opacity-75 mb-0.5">FLEMINGTON · R4</div>
                          <div className="font-semibold text-sm">1400m · Good 4</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] opacity-75 mb-0.5">STARTS IN</div>
                          <div className="font-bold text-base">
                            <CountdownTimer targetTime={race1Time} />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-white">
                      <div className="mb-2">
                        <div className="text-[10px] text-brand-dark-muted mb-0.5">FAVOURITE</div>
                        <div className="font-semibold text-brand-dark-intense text-base">
                          Thunder Bolt
                        </div>
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="text-[10px] text-brand-dark-muted mb-0.5">BEST ODDS</div>
                          <div className="text-xl font-bold text-brand-accent-intense">$3.50</div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="text-[10px] text-brand-dark-muted">BOOKMAKER</div>
                          <div className="w-12 h-6 bg-white rounded-md flex items-center justify-center p-0.5">
                            <Image
                              src="/logos/tab.png"
                              alt="TAB"
                              width={35}
                              height={18}
                              className="object-contain rounded"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Race Card 2 */}
                <div className="group cursor-default">
                  <div className="border border-brand-ui hover:border-brand-ui-intense transition-colors rounded-lg overflow-hidden">
                    <div className="bg-brand-primary text-white px-3 py-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[10px] opacity-75 mb-0.5">RANDWICK · R6</div>
                          <div className="font-semibold text-sm">1200m · Soft 5</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] opacity-75 mb-0.5">STARTS IN</div>
                          <div className="font-bold text-base">
                            <CountdownTimer targetTime={race2Time} />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-white">
                      <div className="mb-2">
                        <div className="text-[10px] text-brand-dark-muted mb-0.5">FAVOURITE</div>
                        <div className="font-semibold text-brand-dark-intense text-base">
                          Lightning Strike
                        </div>
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="text-[10px] text-brand-dark-muted mb-0.5">BEST ODDS</div>
                          <div className="text-xl font-bold text-brand-accent-intense">$4.20</div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="text-[10px] text-brand-dark-muted">BOOKMAKER</div>
                          <div className="w-12 h-6 bg-white rounded-md flex items-center justify-center p-0.5">
                            <Image
                              src="/logos/sportsbet.jpeg"
                              alt="Sportsbet"
                              width={35}
                              height={18}
                              className="object-contain rounded"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Race Card 3 */}
                <div className="group cursor-default">
                  <div className="border border-brand-ui hover:border-brand-ui-intense transition-colors rounded-lg overflow-hidden">
                    <div className="bg-brand-primary text-white px-3 py-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[10px] opacity-75 mb-0.5">CAULFIELD · R8</div>
                          <div className="font-semibold text-sm">2400m · Good 3</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] opacity-75 mb-0.5">STARTS IN</div>
                          <div className="font-bold text-base">
                            <CountdownTimer targetTime={race3Time} />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-white">
                      <div className="mb-2">
                        <div className="text-[10px] text-brand-dark-muted mb-0.5">FAVOURITE</div>
                        <div className="font-semibold text-brand-dark-intense text-base">
                          Storm Chaser
                        </div>
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="text-[10px] text-brand-dark-muted mb-0.5">BEST ODDS</div>
                          <div className="text-xl font-bold text-brand-accent-intense">$5.50</div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="text-[10px] text-brand-dark-muted">BOOKMAKER</div>
                          <div className="w-12 h-6 bg-white rounded-md flex items-center justify-center p-0.5">
                            <Image
                              src="/logos/ladbrokes.png"
                              alt="Ladbrokes"
                              width={35}
                              height={18}
                              className="object-contain rounded"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
