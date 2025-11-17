'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle, Flag, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/cn';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  replies?: Comment[];
  isModerated?: boolean;
  isFlagged?: boolean;
}

interface CommentsProps {
  articleId: string;
}

export default function Comments({ articleId: _articleId }: CommentsProps) {
  const { isAuthenticated, user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      userId: 'user1',
      userName: 'John Smith',
      content:
        'Great analysis! I completely agree with your assessment of the track conditions. Looking forward to see how it plays out.',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      upvotes: 12,
      downvotes: 1,
      replies: [
        {
          id: '1-1',
          userId: 'user2',
          userName: 'Sarah Johnson',
          content: 'Agreed! The rain could really change the dynamics of the race.',
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          upvotes: 5,
          downvotes: 0,
        },
      ],
    },
    {
      id: '2',
      userId: 'user3',
      userName: 'Mike Williams',
      content: 'Interesting perspective on the jockey change. Hadn\'t considered that angle.',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      upvotes: 8,
      downvotes: 2,
    },
  ]);

  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !isAuthenticated || !user) return;

    const comment: Comment = {
      id: Date.now().toString(),
      userId: user.id || 'current-user',
      userName: user.name || 'Anonymous',
      content: newComment,
      createdAt: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
    };

    setComments([comment, ...comments]);
    setNewComment('');
  };

  const handleSubmitReply = (commentId: string) => {
    if (!replyContent.trim() || !isAuthenticated || !user) return;

    const reply: Comment = {
      id: `${commentId}-${Date.now()}`,
      userId: user.id || 'current-user',
      userName: user.name || 'Anonymous',
      content: replyContent,
      createdAt: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
    };

    setComments(
      comments.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), reply],
          };
        }
        return comment;
      })
    );

    setReplyContent('');
    setReplyingTo(null);
  };

  const handleVote = (commentId: string, voteType: 'up' | 'down') => {
    if (!isAuthenticated) return;

    setComments(
      comments.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            upvotes: voteType === 'up' ? comment.upvotes + 1 : comment.upvotes,
            downvotes: voteType === 'down' ? comment.downvotes + 1 : comment.downvotes,
          };
        }
        // Handle replies
        if (comment.replies) {
          return {
            ...comment,
            replies: comment.replies.map((reply) => {
              if (reply.id === commentId) {
                return {
                  ...reply,
                  upvotes: voteType === 'up' ? reply.upvotes + 1 : reply.upvotes,
                  downvotes: voteType === 'down' ? reply.downvotes + 1 : reply.downvotes,
                };
              }
              return reply;
            }),
          };
        }
        return comment;
      })
    );
  };

  const handleFlag = (commentId: string) => {
    if (!isAuthenticated) return;
    // TODO: Implement flag/report functionality
    console.log('Flagged comment:', commentId);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={cn('border-b border-gray-200 pb-6 last:border-0', isReply && 'pl-12')}>
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {comment.userAvatar ? (
              <div
                style={{ backgroundImage: `url(${comment.userAvatar})` }}
                className="w-full h-full bg-cover bg-center"
                role="img"
                aria-label={comment.userName}
              />
            ) : (
              <UserIcon className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900">{comment.userName}</span>
            <span className="text-sm text-gray-500">{formatTimeAgo(comment.createdAt)}</span>
          </div>

          <p className="text-gray-800 leading-relaxed mb-3">{comment.content}</p>

          {/* Actions */}
          <div className="flex items-center gap-4 text-sm">
            {/* Upvote */}
            <button
              onClick={() => handleVote(comment.id, 'up')}
              disabled={!isAuthenticated}
              className="flex items-center gap-1 text-gray-600 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>{comment.upvotes}</span>
            </button>

            {/* Downvote */}
            <button
              onClick={() => handleVote(comment.id, 'down')}
              disabled={!isAuthenticated}
              className="flex items-center gap-1 text-gray-600 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ThumbsDown className="w-4 h-4" />
              <span>{comment.downvotes}</span>
            </button>

            {/* Reply */}
            {!isReply && (
              <button
                onClick={() => setReplyingTo(comment.id)}
                disabled={!isAuthenticated}
                className="flex items-center gap-1 text-gray-600 hover:text-brand-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Reply</span>
              </button>
            )}

            {/* Flag */}
            <button
              onClick={() => handleFlag(comment.id)}
              disabled={!isAuthenticated}
              className="flex items-center gap-1 text-gray-600 hover:text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ml-auto"
            >
              <Flag className="w-4 h-4" />
            </button>
          </div>

          {/* Reply Form */}
          {replyingTo === comment.id && (
            <div className="mt-4">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-brand-primary resize-none"
                rows={3}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleSubmitReply(comment.id)}
                  disabled={!replyContent.trim()}
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-primary-intense text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Post Reply
                </button>
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyContent('');
                  }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-6 space-y-6">
              {comment.replies.map((reply) => (
                <CommentItem key={reply.id} comment={reply} isReply />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="border-t border-gray-200 pt-12">
      <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
        Comments ({comments.length})
      </h2>
      <p className="text-gray-600 mb-8">Join the conversation about this article</p>

      {/* Comment Form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmitComment} className="mb-12">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-brand-primary resize-none"
            rows={4}
          />
          <div className="flex justify-between items-center mt-3">
            <p className="text-sm text-gray-600">
              Logged in as <span className="font-semibold">{user?.name}</span>
            </p>
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="px-6 py-3 bg-brand-primary hover:bg-brand-primary-intense text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Post Comment
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-12 p-6 bg-gray-50 border border-gray-200 text-center">
          <p className="text-gray-700 mb-4">You must be signed in to comment</p>
          <a
            href="/onboarding"
            className="inline-block px-6 py-3 bg-brand-primary hover:bg-brand-primary-intense text-white font-semibold transition-colors"
          >
            Sign In to Comment
          </a>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-8">
        {comments.length > 0 ? (
          comments.map((comment) => <CommentItem key={comment.id} comment={comment} />)
        ) : (
          <div className="text-center py-12 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
}
