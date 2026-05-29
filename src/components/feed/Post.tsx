import React, { useState, useEffect } from 'react';
import { Post as PostType, toggleLike, subscribeToLikeStatus } from '../../firebase/services';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { CommentSection } from './CommentSection';

interface PostProps {
  key?: React.Key;
  post: PostType;
  user: any;
}

export function Post({ post, user }: PostProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToLikeStatus(post.id, setIsLiked);
    return unsubscribe;
  }, [post.id]);

  const handleLike = async () => {
    if (!isLiked) setIsLikeAnimating(true);
    await toggleLike(post.id, isLiked);
    if (!isLiked) {
      setTimeout(() => setIsLikeAnimating(false), 1000);
    }
  };

  return (
    <motion.article 
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-[3rem] overflow-hidden shadow-[0_24px_48px_-12px_rgba(0,0,0,0.06)] border border-slate-100"
    >
      {/* Post Header */}
      <div className="p-7 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-50 flex-shrink-0 border border-slate-100 shadow-sm">
            <img src={post.authorPhoto} alt={post.authorName} className="w-full h-full object-cover" />
          </div>
          <div>
            <h4 className="font-black text-slate-900 leading-none mb-1 text-[15px] tracking-tight">{post.authorName}</h4>
            <span className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">
              {post.createdAt?.toDate ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }) : 'just now'}
            </span>
          </div>
        </div>
        <button className="text-slate-300 hover:text-slate-900 p-2 hover:bg-slate-50 rounded-xl transition-all">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Media Container */}
      <div className="relative group mx-4 rounded-[2rem] overflow-hidden shadow-inner border border-slate-100">
        <div 
          className="aspect-square bg-slate-50 cursor-pointer active:scale-[0.99] transition-transform duration-300"
          onDoubleClick={handleLike}
        >
          <img src={post.imageURL} alt="Post content" className="w-full h-full object-cover" />
        </div>
        
        <AnimatePresence>
          {isLikeAnimating && (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.8, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <Heart size={100} className="text-white fill-white drop-shadow-[0_0_40px_rgba(255,255,255,0.8)]" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Interactions */}
      <div className="p-7">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-6">
            <button 
              id={`like-btn-${post.id}`}
              onClick={handleLike}
              className={`flex items-center gap-2 group transition-all transform active:scale-90 ${isLiked ? 'text-red-500' : 'text-slate-300 hover:text-red-500'}`}
            >
              <Heart size={26} className={isLiked ? 'fill-current pointer-events-none' : 'group-hover:fill-red-50 transition-all'} />
              <span className="font-extrabold text-[15px] tracking-tight">{post.likesCount}</span>
            </button>
            <button 
              id={`comment-btn-${post.id}`}
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 text-slate-300 hover:text-blue-600 transition-all group"
            >
              <MessageCircle size={26} className="group-hover:fill-blue-50 transition-all" />
              <span className="font-extrabold text-[15px] tracking-tight">{post.commentsCount}</span>
            </button>
            <button className="text-slate-300 hover:text-emerald-500 transition-all">
              <Share2 size={26} />
            </button>
          </div>
        </div>

        {/* Caption */}
        <div className="space-y-1 bg-slate-50/50 p-5 rounded-2xl border border-slate-100/50 shadow-sm">
          <p className="text-slate-700 leading-relaxed text-sm">
            <span className="font-black mr-3 text-slate-900 tracking-tight">{post.authorName}</span>
            {post.caption}
          </p>
        </div>

        {/* Comments Toggle */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <CommentSection postId={post.id} user={user} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}
