import React, { useState, useEffect } from 'react';
import { Comment as CommentType, subscribeToComments, addComment } from '../../firebase/services';
import { motion, AnimatePresence } from 'motion/react';
import { Send, CornerDownRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CommentSectionProps {
  postId: string;
  user: any;
}

export function CommentSection({ postId, user }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToComments(postId, setComments);
    return unsubscribe;
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await addComment(postId, content, replyTo || undefined);
      setContent('');
      setReplyTo(null);
    } catch (error) {
      console.error("Comment failed", error);
    }
  };

  const topLevelComments = comments.filter(c => !c.parentId);

  return (
    <div className="mt-8 pt-8 border-t border-slate-100">
      <div className="space-y-7 mb-8">
        {topLevelComments.map(comment => (
          <CommentItem 
            key={comment.id} 
            comment={comment} 
            allComments={comments} 
            onReply={setReplyTo} 
          />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="relative mt-6">
        {replyTo && (
          <div className="mb-3 flex items-center justify-between bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 shadow-sm">
            <span className="text-[10px] uppercase tracking-widest font-black text-blue-600">
              Replying to {comments.find(c => c.id === replyTo)?.authorName}
            </span>
            <button 
              type="button" 
              onClick={() => setReplyTo(null)}
              className="text-blue-400 hover:text-blue-700 font-bold text-[10px] uppercase tracking-wider"
            >
              Cancel
            </button>
          </div>
        )}
        <div className="flex items-center bg-slate-50 rounded-[1.5rem] p-2 pr-4 border border-slate-100 focus-within:border-blue-500/30 focus-within:bg-white transition-all ring-offset-0 focus-within:ring-4 focus-within:ring-blue-500/5 shadow-inner">
          <input
            id={`comment-input-${postId}`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={replyTo ? "Draft your reply..." : "Comment on blueprint..."}
            className="flex-1 bg-transparent border-none outline-none text-[13px] px-4 py-3 text-slate-800 placeholder:text-slate-400 font-medium"
          />
          <button 
            id={`submit-comment-${postId}`}
            type="submit" 
            disabled={!content.trim()}
            className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-600/20 disabled:bg-slate-200 disabled:shadow-none transition-all hover:bg-blue-500 active:scale-90"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}

interface CommentItemProps {
  key?: React.Key;
  comment: CommentType;
  allComments: CommentType[];
  onReply: (id: string) => void;
}

function CommentItem({ comment, allComments, onReply }: CommentItemProps) {
  const replies = allComments.filter(c => c.parentId === comment.id);

  return (
    <div className="space-y-5">
      <div className="flex gap-4">
        <div className="w-9 h-9 rounded-[0.8rem] overflow-hidden bg-slate-100 border border-slate-200/50 flex-shrink-0 shadow-sm">
          <img src={comment.authorPhoto} alt={comment.authorName} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="bg-slate-50 px-5 py-3.5 rounded-[1.5rem] rounded-tl-none inline-block max-w-full border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-1.5">
              <span className="font-black text-[13px] text-slate-900 tracking-tight">{comment.authorName}</span>
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.05em]">
                {comment.createdAt?.toDate ? formatDistanceToNow(comment.createdAt.toDate(), { addSuffix: true }) : 'now'}
              </span>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">{comment.content}</p>
          </div>
          <div className="flex items-center gap-5 mt-2 ml-1">
            <button 
              onClick={() => onReply(comment.id)}
              className="text-[11px] font-black text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1 uppercase tracking-widest"
            >
              <CornerDownRight size={12} strokeWidth={3} />
              Reply
            </button>
          </div>
        </div>
      </div>

      {replies.length > 0 && (
        <div className="ml-13 space-y-6 border-l-2 border-slate-100/50 pl-6">
          {replies.map(reply => (
            <CommentItem 
              key={reply.id} 
              comment={reply} 
              allComments={allComments} 
              onReply={onReply} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
