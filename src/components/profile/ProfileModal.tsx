import React, { useState, useEffect } from 'react';
import { UserProfile, Post, subscribeToUserPosts, updateUserProfile } from '../../firebase/services';
import { motion, AnimatePresence } from 'motion/react';
import { X, Edit2, Grid, Bookmark, AtSign, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface ProfileModalProps {
  uid: string;
  currentUserUid: string;
  onClose: () => void;
  profile: UserProfile;
}

export function ProfileModal({ uid, currentUserUid, onClose, profile }: ProfileModalProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(profile.displayName);
  const [editedBio, setEditedBio] = useState(profile.bio || '');
  const isOwnProfile = uid === currentUserUid;

  useEffect(() => {
    const unsubscribe = subscribeToUserPosts(uid, setPosts);
    return unsubscribe;
  }, [uid]);

  const handleUpdate = async () => {
    await updateUserProfile(uid, { displayName: editedName, bio: editedBio });
    setIsEditing(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[110] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.95, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 30 }}
        className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] relative flex flex-col border border-slate-200/50"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 z-10 p-2.5 bg-white/80 rounded-2xl backdrop-blur-md transition-all shadow-xl hover:scale-110"
        >
          <X size={20} />
        </button>

        <div className="overflow-y-auto flex-1 custom-scrollbar">
          {/* Cover Area */}
          <div className="h-44 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative shadow-inner">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
          </div>
          
          <div className="px-10 pb-10 -mt-20 relative">
            <div className="flex justify-between items-end mb-8">
              <div className="w-40 h-40 rounded-[2.5rem] border-[6px] border-white overflow-hidden bg-slate-100 shadow-2xl relative group">
                <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
              </div>
              {isOwnProfile && (
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-white border border-slate-100 text-slate-900 px-7 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-3 shadow-xl shadow-slate-900/5 active:scale-95"
                >
                  <Edit2 size={16} strokeWidth={2.5} />
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-6 mb-10 bg-slate-50 p-8 rounded-[2rem] border border-slate-100 shadow-inner">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mb-2 block ml-1">Identity Display</label>
                  <input 
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-full bg-white border border-slate-100 rounded-2xl px-5 py-4 text-slate-900 outline-none focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/5 transition-all font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mb-2 block ml-1">Project Narrative</label>
                  <textarea 
                    value={editedBio}
                    onChange={(e) => setEditedBio(e.target.value)}
                    className="w-full bg-white border border-slate-100 rounded-2xl px-5 py-4 text-slate-900 outline-none focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/5 transition-all min-h-[120px] font-medium leading-relaxed"
                    placeholder="Tell your story..."
                  />
                </div>
                <button 
                  onClick={handleUpdate}
                  className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold hover:bg-black transition-all w-full shadow-2xl shadow-slate-900/10 active:scale-95"
                >
                  Save Architect Credentials
                </button>
              </div>
            ) : (
              <div className="mb-10">
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-3">{profile.displayName}</h2>
                <div className="flex flex-wrap items-center gap-6 text-slate-400 text-xs mb-6">
                  <div className="flex items-center gap-2 font-black uppercase tracking-widest text-blue-600">
                    <AtSign size={14} strokeWidth={3} />
                    <span>{profile.email.split('@')[0]}</span>
                  </div>
                  <div className="flex items-center gap-2 font-black uppercase tracking-widest">
                    <Calendar size={14} strokeWidth={3} />
                    <span>Joined {profile.createdAt?.toDate ? format(profile.createdAt.toDate(), 'MMM yyyy') : 'Recent'}</span>
                  </div>
                </div>
                <p className="text-slate-500 leading-relaxed text-base font-medium max-w-xl">
                  {profile.bio || "This architect hasn't defined their narrative yet."}
                </p>
              </div>
            )}

            {/* Profile Tabs */}
            <div className="border-t border-slate-100 pt-10">
              <div className="flex gap-10 mb-8 overflow-x-auto custom-scrollbar">
                <button className="flex items-center gap-2.5 pb-5 text-slate-900 border-b-2 border-slate-950 font-black text-xs uppercase tracking-widest">
                  <Grid size={18} strokeWidth={2.5} />
                  Blueprints
                  <span className="bg-slate-100 px-2 py-0.5 rounded-lg text-[10px] ml-1 text-slate-500 tracking-normal">{posts.length}</span>
                </button>
                <button className="flex items-center gap-2.5 pb-5 text-slate-400 hover:text-slate-600 font-black text-xs uppercase tracking-widest transition-colors">
                  <Bookmark size={18} strokeWidth={2.5} />
                  Archived
                </button>
              </div>

              {/* Posts Grid */}
              <div className="grid grid-cols-3 gap-4">
                {posts.length > 0 ? (
                  posts.map(post => (
                    <div key={post.id} className="aspect-square bg-slate-50 rounded-[1.5rem] overflow-hidden group relative cursor-pointer border border-slate-100">
                      <img src={post.imageURL} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <span className="bg-white text-slate-900 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-2xl">View Project</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 py-20 text-center bg-slate-50 rounded-[2rem] border border-slate-100 border-dashed">
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Workspace Empty</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
