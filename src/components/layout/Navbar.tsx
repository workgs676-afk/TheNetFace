import { Search, Bell, Mail, Compass, User, LogOut } from 'lucide-react';
import { motion } from 'motion/react';

interface NavbarProps {
  user: any;
  onSignOut: () => void;
  onSignInClick: () => void;
  onProfileClick: () => void;
  onMessagesClick: () => void;
}

export function Navbar({ user, onSignOut, onSignInClick, onProfileClick, onMessagesClick }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 z-50">
      <div className="max-w-5xl mx-auto h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center font-black text-white text-xl shadow-lg shadow-slate-900/10">N</div>
            <h1 className="text-xl font-black text-slate-900 tracking-tighter hidden sm:block">TheNetFace</h1>
          </div>
          
          <div className="hidden md:flex items-center bg-slate-100 px-5 py-2.5 rounded-2xl w-72 gap-3 border border-transparent focus-within:border-blue-500/20 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/5 transition-all">
            <Search size={18} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Search components..." 
              className="bg-transparent border-none outline-none text-sm w-full text-slate-900 placeholder:text-slate-400 font-medium"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button className="text-slate-400 hover:text-slate-900 transition-colors p-2 hover:bg-slate-50 rounded-xl">
            <Compass size={22} />
          </button>
          
          {user ? (
            <>
              <button className="text-slate-400 hover:text-slate-900 transition-colors p-2 hover:bg-slate-50 rounded-xl relative">
                <Bell size={22} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full border-2 border-white shadow-sm" />
              </button>
              <button 
                onClick={onMessagesClick}
                className="text-slate-400 hover:text-slate-900 transition-colors p-2 hover:bg-slate-50 rounded-xl"
                id="messages-nav-btn"
              >
                <Mail size={22} />
              </button>
              
              <div className="flex items-center gap-4 pl-6 border-l border-slate-200">
                <button 
                  onClick={onProfileClick}
                  className="w-10 h-10 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 hover:ring-4 hover:ring-blue-500/10 transition-all shadow-sm"
                  id="profile-nav-btn"
                >
                  <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                </button>
                <button 
                  id="navbar-signout"
                  onClick={onSignOut}
                  className="text-slate-300 hover:text-red-500 transition-colors p-2"
                  title="Sign Out"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={onSignInClick}
              className="bg-slate-900 text-white text-sm font-bold px-7 py-2.5 rounded-2xl hover:bg-black transition-all shadow-lg shadow-slate-900/10 active:scale-95"
            >
              Log In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
