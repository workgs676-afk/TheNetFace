import React, { useState, useEffect } from 'react';
import { 
  Conversation, 
  Message, 
  UserProfile, 
  subscribeToConversations, 
  subscribeToMessages, 
  sendMessage, 
  subscribeToAllUsers,
  getOrCreateConversation
} from '../../firebase/services';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Search, MessageSquare, Plus, CornerDownLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface MessagingOverlayProps {
  user: any;
  onClose: () => void;
}

export function MessagingOverlay({ user, onClose }: MessagingOverlayProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsubConv = subscribeToConversations(setConversations);
    const unsubUsers = subscribeToAllUsers(setUsers);
    return () => {
      unsubConv();
      unsubUsers();
    };
  }, []);

  const handleStartChat = async (otherUid: string) => {
    const id = await getOrCreateConversation(otherUid);
    setActiveConvId(id);
    setShowNewChat(false);
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
        className="bg-white w-full max-w-4xl h-[700px] rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] relative flex border border-slate-200/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sidebar: Conversations */}
        <div className="w-85 border-r border-slate-100 flex flex-col bg-slate-50/30">
          <div className="p-8 border-b border-slate-100/80 flex justify-between items-center bg-white">
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Inboxes</h2>
            <button 
              onClick={() => setShowNewChat(true)}
              className="p-3 bg-slate-900 rounded-2xl text-white hover:bg-black transition-all shadow-xl shadow-slate-900/10 active:scale-90"
            >
              <Plus size={20} strokeWidth={3} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
            {conversations.map(conv => {
              const otherId = conv.participants.find(p => p !== user.uid);
              const otherUser = users.find(u => u.uid === otherId);
              
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-[1.5rem] transition-all group ${
                    activeConvId === conv.id 
                    ? 'bg-white border border-slate-200 shadow-xl shadow-slate-900/5 ring-4 ring-slate-100' 
                    : 'hover:bg-white border border-transparent hover:border-slate-100'
                  }`}
                >
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 flex-shrink-0 shadow-sm relative group-hover:scale-105 transition-transform">
                    <img src={otherUser?.photoURL || ''} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-left overflow-hidden flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-black text-slate-900 truncate text-[15px] tracking-tight">
                        {otherUser?.displayName || 'Loading...'}
                      </p>
                    </div>
                    <p className="text-[13px] text-slate-400 truncate font-medium">
                      {conv.lastMessage || 'Open a new transmission'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-[#FDFDFD]">
          {activeConvId ? (
            <ChatWindow 
              conversationId={activeConvId} 
              user={user} 
              otherUser={users.find(u => users.find(u2 => u2.uid === conversations.find(c => c.id === activeConvId)?.participants.find(p => p !== user.uid))?.uid === u.uid)}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
              <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mb-8 border border-slate-100 shadow-[0_20px_40px_rgba(0,0,0,0.04)]">
                <MessageSquare size={44} strokeWidth={1} />
              </div>
              <p className="font-black text-xl text-slate-900 tracking-tighter">Your Workspace Inbox</p>
              <p className="text-sm mt-3 font-medium text-slate-400">Select a project thread to continue collaborating</p>
            </div>
          )}
        </div>

        {/* New Chat Modal Overlaid in sidebar area or standalone */}
        <AnimatePresence>
          {showNewChat && (
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="absolute inset-0 z-20 bg-white flex flex-col border-r border-slate-100"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Architect Directory</h2>
                <button 
                  onClick={() => setShowNewChat(false)} 
                  className="p-2.5 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>
              <div className="p-6">
                <div className="flex items-center bg-slate-50 rounded-2xl px-5 py-4 gap-4 border border-transparent focus-within:border-blue-500/20 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/5 transition-all">
                  <Search size={20} className="text-slate-400" />
                  <input 
                    placeholder="Search the directory..." 
                    className="bg-transparent border-none outline-none text-[15px] w-full text-slate-900 placeholder:text-slate-400 font-medium"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-6 pb-8 space-y-3 custom-scrollbar">
                {users.filter(u => u.uid !== user.uid && u.displayName.toLowerCase().includes(search.toLowerCase())).map(u => (
                  <button 
                    key={u.uid}
                    onClick={() => handleStartChat(u.uid)}
                    className="w-full flex items-center gap-5 p-5 hover:bg-slate-50 rounded-[2rem] border border-transparent hover:border-slate-100 transition-all group"
                  >
                    <div className="w-16 h-16 rounded-[1.8rem] overflow-hidden border border-slate-100 shadow-sm transition-transform group-hover:scale-105">
                      <img src={u.photoURL} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-left leading-tight overflow-hidden">
                      <p className="font-black text-slate-900 text-[15px] tracking-tight">{u.displayName}</p>
                      <p className="text-xs text-slate-400 mt-1 font-black uppercase tracking-widest text-[10px]">@{u.email.split('@')[0]}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

function ChatWindow({ conversationId, user, otherUser }: { conversationId: string, user: any, otherUser?: UserProfile }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');

  useEffect(() => {
    const unsub = subscribeToMessages(conversationId, setMessages);
    return unsub;
  }, [conversationId]);

  const onSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const currentText = text;
    setText('');
    await sendMessage(conversationId, currentText);
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="p-8 border-b border-slate-100 flex items-center gap-5 bg-white/70 backdrop-blur-xl">
        <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-sm relative">
          <img src={otherUser?.photoURL || ''} alt="" className="w-full h-full object-cover" />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
        </div>
        <div className="leading-tight">
          <h3 className="font-black text-slate-900 tracking-tighter text-lg">{otherUser?.displayName || 'Loading...'}</h3>
          <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest leading-none">Transmission Active</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-10 space-y-6 custom-scrollbar bg-slate-50/20">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.senderId === user.uid ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-5 rounded-[2rem] shadow-sm ${
              msg.senderId === user.uid 
              ? 'bg-slate-900 text-white rounded-tr-none' 
              : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
            }`}>
              <p className="text-[14px] leading-relaxed font-medium">{msg.text}</p>
              <p className={`text-[10px] mt-2 font-black uppercase tracking-widest ${msg.senderId === user.uid ? 'text-slate-400' : 'text-slate-300'}`}>
                {msg.createdAt?.toDate ? formatDistanceToNow(msg.createdAt.toDate(), { addSuffix: true }) : 'transmitting...'}
              </p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={onSend} className="p-8 border-t border-slate-100 bg-white">
        <div className="flex items-center gap-4 bg-slate-50 rounded-[1.8rem] px-6 py-3 border border-slate-100 focus-within:border-blue-500/20 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/5 transition-all shadow-inner">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type a message for the team..."
            className="flex-1 bg-transparent border-none outline-none py-4 text-sm text-slate-900 placeholder:text-slate-400 font-medium"
          />
          <button 
            type="submit" 
            disabled={!text.trim()}
            className="p-3.5 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-900/10 disabled:bg-slate-100 disabled:text-slate-300 transition-all hover:bg-black active:scale-90"
          >
            <Send size={20} strokeWidth={2.5} />
          </button>
        </div>
      </form>
    </div>
  );
}
