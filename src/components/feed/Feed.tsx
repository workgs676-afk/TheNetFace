import React, { useState, useEffect } from 'react';
import { Post as PostType, subscribeToPosts, createPost } from '../../firebase/services';
import { Post } from './Post';
import { motion, AnimatePresence } from 'motion/react';
import { Image, Send, X } from 'lucide-react';

interface FeedProps {
  user: any;
}

export function Feed({ user }: FeedProps) {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [isComposing, setIsComposing] = useState(false);
  const [caption, setCaption] = useState('');
  const [imageURL, setImageURL] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeToPosts(setPosts);
    return unsubscribe;
  }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption || !imageURL) return;

    try {
      await createPost(caption, imageURL);
      setCaption('');
      setImageURL('');
      setIsComposing(false);
    } catch (error) {
      console.error("Post failed", error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Compose Section */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] border border-slate-100/80 mb-10">
        {!isComposing ? (
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200/50 shadow-sm">
              <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
            </div>
            <button 
              id="compose-post-btn"
              onClick={() => setIsComposing(true)}
              className="flex-1 bg-slate-50 text-slate-400 text-left px-7 py-4 rounded-2xl hover:bg-slate-100/80 transition-all border border-transparent hover:border-slate-200/50 font-medium text-sm"
            >
              What's the project today? Share a post...
            </button>
          </div>
        ) : (
          <motion.form 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            onSubmit={handlePost} 
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-black text-slate-900 tracking-tight text-lg">New Blueprint</h3>
              <button 
                type="button"
                onClick={() => setIsComposing(false)}
                className="p-2 text-slate-300 hover:text-slate-600 transition-colors hover:bg-slate-50 rounded-xl"
              >
                <X size={20} />
              </button>
            </div>
            
            <textarea
              id="caption-input"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Structure your thoughts..."
              className="w-full bg-slate-50 rounded-2xl p-5 min-h-[120px] outline-none text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all border border-transparent focus:border-blue-500/10 font-medium leading-relaxed"
            />
            
            <div className="flex items-center bg-slate-50 rounded-2xl px-5 py-4 gap-4 border border-transparent focus-within:border-blue-500/20 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/5 transition-all">
              <Image size={20} className="text-blue-600" />
              <input
                id="image-url-input"
                type="text"
                value={imageURL}
                onChange={(e) => setImageURL(e.target.value)}
                placeholder="Architectural render URL..."
                className="bg-transparent border-none outline-none text-sm w-full text-slate-900 placeholder:text-slate-400 font-medium"
              />
            </div>

            <AnimatePresence>
              {imageURL && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative aspect-video rounded-[2rem] overflow-hidden bg-slate-50 border border-slate-100 shadow-inner"
                >
                  <img src={imageURL} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => setImageURL('')}
                    className="absolute top-4 right-4 p-2 bg-white/80 text-slate-900 rounded-full backdrop-blur-md hover:bg-white transition-all shadow-xl"
                  >
                    <X size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-end pt-2">
              <button
                id="submit-post-btn"
                type="submit"
                disabled={!caption || !imageURL}
                className="bg-slate-900 disabled:bg-slate-100 disabled:text-slate-300 text-white font-bold px-10 py-4 rounded-2xl flex items-center gap-3 hover:bg-black transition-all shadow-xl shadow-slate-900/10 active:scale-95"
              >
                <Send size={18} />
                Deploy
              </button>
            </div>
          </motion.form>
        )}
      </div>

      {/* Feed List */}
      <div className="space-y-10 pb-24">
        <AnimatePresence mode="popLayout">
          {posts.map((post) => (
            <Post key={post.id} post={post} user={user} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
