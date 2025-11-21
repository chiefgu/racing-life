'use client';

import { useState, useEffect, useRef } from 'react';
import EditorialHeader from '@/components/layout/EditorialHeader';
import ModernFooter from '@/components/layout/ModernFooter';
import {
  MessageSquare,
  Send,
  Plus,
  Trash2,
  Menu,
  X,
  Pin,
  PinOff,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// Import widgets (add more as needed based on AI response)
import OddsComparisonWidget from '@/components/chat/OddsComparisonWidget';
// TODO: Import other widgets when implementing full widget system
// import FormGuideCard from '@/components/chat/FormGuideCard';
// import HorseComparison from '@/components/chat/HorseComparison';
// etc...

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  widgets?: string[]; // Widget types to display
}

interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

interface PinnedWidget {
  id: string;
  type: string;
  title: string;
}

const POPULAR_QUESTIONS = [
  "What are today's best betting opportunities?",
  'Show me the form guide for the next race at Flemington',
  'Which jockeys have the best strike rate this season?',
  'Compare the top 3 horses in Race 4 at Randwick',
  'What track conditions favor leaders today?',
  "What's the market saying about the Melbourne Cup?",
];

const EXAMPLE_QUERIES = [
  { icon: '🏇', text: 'Analyze Thunder Bolt in Race 4', category: 'Horse Analysis' },
  { icon: '📊', text: 'Compare odds across bookmakers', category: 'Odds' },
  { icon: '🎯', text: 'Track bias at Flemington today', category: 'Track Conditions' },
  { icon: '⚡', text: 'Speed map for the Cup', category: 'Race Strategy' },
];

const GUEST_MESSAGE_LIMIT = 10;

export default function AIAnalystClient() {
  // Conversation management
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Chat states
  const [inputValue, setInputValue] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);

  // UI states
  const [showHowToUse, setShowHowToUse] = useState(false);
  const [pinnedWidgets, setPinnedWidgets] = useState<PinnedWidget[]>([]);

  // Rate limiting
  const [messageCount, setMessageCount] = useState(0);
  const [isLoggedIn] = useState(false); // TODO: Connect to auth

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Check if first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem('ai-analyst-visited');
    if (!hasVisited) {
      setShowHowToUse(true);
      localStorage.setItem('ai-analyst-visited', 'true');
    }

    // Load conversations from localStorage
    const savedConversations = localStorage.getItem('conversations');
    if (savedConversations) {
      const parsed = JSON.parse(savedConversations);
      const conversationsWithDates = parsed.map((conv: Conversation) => ({
        ...conv,
        createdAt: new Date(conv.createdAt),
        updatedAt: new Date(conv.updatedAt),
        messages: conv.messages.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      }));
      setConversations(conversationsWithDates);
    }

    // Load pinned widgets
    const savedPinnedWidgets = localStorage.getItem('pinned-widgets');
    if (savedPinnedWidgets) {
      setPinnedWidgets(JSON.parse(savedPinnedWidgets));
    }
  }, []);

  // Save conversations to localStorage
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  // Save pinned widgets to localStorage
  useEffect(() => {
    localStorage.setItem('pinned-widgets', JSON.stringify(pinnedWidgets));
  }, [pinnedWidgets]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, activeConversationId]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  const createNewConversation = () => {
    const newConv: Conversation = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setConversations([newConv, ...conversations]);
    setActiveConversationId(newConv.id);
  };

  const deleteConversation = (id: string) => {
    setConversations(conversations.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId(conversations[0]?.id || null);
    }
  };

  const clearCurrentChat = () => {
    if (activeConversationId && activeConversation) {
      const updated = conversations.map((c) =>
        c.id === activeConversationId ? { ...c, messages: [], updatedAt: new Date() } : c
      );
      setConversations(updated);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Check rate limiting for guests
    if (!isLoggedIn && messageCount >= GUEST_MESSAGE_LIMIT) {
      alert('Guest users are limited to 10 messages. Please sign in for unlimited access.');
      return;
    }

    let convId = activeConversationId;

    // Create new conversation if none exists
    if (!convId) {
      const newConv: Conversation = {
        id: Date.now().toString(),
        title: inputValue.slice(0, 50) + (inputValue.length > 50 ? '...' : ''),
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setConversations([newConv, ...conversations]);
      convId = newConv.id;
      setActiveConversationId(convId);
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    // Add user message
    const updatedConversations = conversations.map((c) =>
      c.id === convId
        ? {
            ...c,
            messages: [...c.messages, userMessage],
            updatedAt: new Date(),
            title: c.messages.length === 0 ? inputValue.slice(0, 50) : c.title,
          }
        : c
    );

    if (!activeConversationId) {
      const newConv = {
        id: convId,
        title: inputValue.slice(0, 50) + (inputValue.length > 50 ? '...' : ''),
        messages: [userMessage],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setConversations([newConv, ...conversations]);
    } else {
      setConversations(updatedConversations);
    }

    setInputValue('');
    setIsAiTyping(true);
    setMessageCount(messageCount + 1);

    // Simulate AI response (TODO: Replace with actual API call)
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          "I'm analyzing your query about " +
          inputValue +
          ". Here's what I found based on the latest racing data...",
        timestamp: new Date(),
        widgets: inputValue.toLowerCase().includes('odd') ? ['odds'] : [],
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                messages: [...c.messages, aiMessage],
                updatedAt: new Date(),
              }
            : c
        )
      );
      setIsAiTyping(false);
    }, 2000);
  };

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
    inputRef.current?.focus();
  };

  const togglePinWidget = (widgetType: string, widgetTitle: string) => {
    const existing = pinnedWidgets.find((w) => w.type === widgetType);
    if (existing) {
      setPinnedWidgets(pinnedWidgets.filter((w) => w.type !== widgetType));
    } else {
      setPinnedWidgets([
        ...pinnedWidgets,
        { id: Date.now().toString(), type: widgetType, title: widgetTitle },
      ]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <EditorialHeader />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col overflow-hidden"
            >
              {/* Sidebar Header */}
              <div className="p-4 border-b border-gray-200">
                <button
                  onClick={createNewConversation}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-primary text-white font-semibold hover:bg-brand-primary-intense transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New Chat
                </button>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto p-2">
                <div className="space-y-1">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={`group flex items-center gap-2 px-3 py-2 rounded cursor-pointer transition-colors ${
                        conv.id === activeConversationId
                          ? 'bg-white border border-brand-primary'
                          : 'hover:bg-white'
                      }`}
                      onClick={() => setActiveConversationId(conv.id)}
                    >
                      <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="flex-1 text-sm text-gray-900 truncate">{conv.title}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conv.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-600 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Popular Questions */}
              <div className="border-t border-gray-200 p-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Popular Questions
                </h3>
                <div className="space-y-2">
                  {POPULAR_QUESTIONS.slice(0, 3).map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickQuestion(question)}
                      className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-white rounded border border-transparent hover:border-brand-primary transition-all"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pinned Widgets */}
              {pinnedWidgets.length > 0 && (
                <div className="border-t border-gray-200 p-4 max-h-48 overflow-y-auto">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Pin className="w-3.5 h-3.5" />
                    Pinned
                  </h3>
                  <div className="space-y-2">
                    {pinnedWidgets.map((widget) => (
                      <div
                        key={widget.id}
                        className="flex items-center justify-between px-3 py-2 bg-white rounded border border-gray-200"
                      >
                        <span className="text-xs text-gray-900 truncate flex-1">
                          {widget.title}
                        </span>
                        <button
                          onClick={() => togglePinWidget(widget.type, widget.title)}
                          className="ml-2 p-1 hover:text-red-600 transition-colors"
                        >
                          <PinOff className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ad Space */}
              <div className="border-t border-gray-200 p-4 bg-gradient-to-br from-brand-primary to-brand-primary-intense">
                <div className="text-center text-white">
                  <div className="text-xs font-semibold mb-1">Advertisement</div>
                  <div className="text-[10px] opacity-80">Sponsored Content</div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="border-b border-gray-200 px-6 py-4 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                >
                  {isSidebarOpen ? (
                    <X className="w-5 h-5 text-gray-600" />
                  ) : (
                    <Menu className="w-5 h-5 text-gray-600" />
                  )}
                </button>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-brand-primary" />
                    AI Racing Analyst
                  </h1>
                  <p className="text-xs text-gray-500">
                    {isLoggedIn
                      ? 'Unlimited messages'
                      : `${GUEST_MESSAGE_LIMIT - messageCount} messages remaining as guest`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowHowToUse(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                >
                  <HelpCircle className="w-4 h-4" />
                  How to Use
                </button>
                {activeConversation && activeConversation.messages.length > 0 && (
                  <button
                    onClick={clearCurrentChat}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear Chat
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {!activeConversation || activeConversation.messages.length === 0 ? (
              <div className="max-w-4xl mx-auto">
                {/* Welcome Screen */}
                <div className="text-center mb-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-primary/10 rounded-full mb-4">
                    <Sparkles className="w-8 h-8 text-brand-primary" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">AI Racing Analyst</h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Get expert racing insights powered by AI. Ask anything about horses, races,
                    odds, form guides, and more.
                  </p>
                </div>

                {/* Example Queries */}
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">Try asking about:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {EXAMPLE_QUERIES.map((example, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickQuestion(example.text)}
                        className="text-left p-4 bg-white border border-gray-200 hover:border-brand-primary hover:shadow-sm transition-all rounded group"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{example.icon}</span>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900 group-hover:text-brand-primary transition-colors">
                              {example.text}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{example.category}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-6">
                {activeConversation.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-3xl ${
                        message.role === 'user'
                          ? 'bg-brand-primary text-white rounded-lg px-4 py-3'
                          : 'w-full'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 bg-brand-primary/10 rounded-full flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-brand-primary" />
                          </div>
                          <span className="text-xs font-semibold text-gray-500">AI Analyst</span>
                        </div>
                      )}
                      <div
                        className={message.role === 'user' ? 'text-sm' : 'text-sm text-gray-900'}
                      >
                        {message.content}
                      </div>

                      {/* Render widgets if present */}
                      {message.widgets && message.widgets.includes('odds') && (
                        <div className="mt-4">
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
                            ]}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isAiTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 rounded-lg">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: '0.2s' }}
                        />
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: '0.4s' }}
                        />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 px-6 py-4 bg-white">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Ask anything about racing..."
                    rows={1}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    style={{ minHeight: '48px', maxHeight: '200px' }}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isAiTyping}
                  className="px-6 py-3 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-primary-intense disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>
              <div className="mt-2 text-xs text-gray-500 text-center">
                Press Shift+Enter for new line, Enter to send
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* How to Use Modal */}
      <AnimatePresence>
        {showHowToUse && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowHowToUse(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none"
            >
              <div
                className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        How to Use AI Racing Analyst
                      </h2>
                      <p className="text-gray-600">
                        Get the most out of your AI-powered racing insights
                      </p>
                    </div>
                    <button
                      onClick={() => setShowHowToUse(false)}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        1. Ask Any Racing Question
                      </h3>
                      <p className="text-gray-600 mb-2">
                        Type your question in plain English. The AI understands queries about:
                      </p>
                      <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                        <li>Horse form and statistics</li>
                        <li>Odds comparisons</li>
                        <li>Track conditions and bias</li>
                        <li>Jockey and trainer performance</li>
                        <li>Race predictions and insights</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        2. Multiple Conversations
                      </h3>
                      <p className="text-gray-600">
                        Create separate chats for different races or topics. Click "New Chat" to
                        start a fresh conversation. All your chats are saved automatically.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        3. Pin Important Widgets
                      </h3>
                      <p className="text-gray-600">
                        Click the pin icon on any widget to save it to your sidebar for quick access
                        later.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        4. Guest vs Logged In
                      </h3>
                      <p className="text-gray-600">
                        Guest users get {GUEST_MESSAGE_LIMIT} messages. Sign in for unlimited access
                        and to save your conversation history across devices.
                      </p>
                    </div>

                    <div className="bg-brand-light p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Pro Tips:</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Be specific in your questions for better insights</li>
                        <li>• Use the example queries to get started</li>
                        <li>• Ask follow-up questions to dig deeper</li>
                        <li>• Clear your chat anytime to start fresh</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setShowHowToUse(false)}
                      className="px-6 py-2 bg-brand-primary text-white font-semibold rounded hover:bg-brand-primary-intense transition-colors"
                    >
                      Got it!
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ModernFooter />
    </div>
  );
}
