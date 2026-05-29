import { useState, useEffect } from 'react';
import { auth, googleProvider } from './firebase/config';
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { ensureUserProfile, testConnection } from './firebase/services';
import { Navbar } from './components/layout/Navbar';
import { Feed } from './components/feed/Feed';
import { AuthOverlay } from './components/auth/AuthOverlay';
import { ProfileModal } from './components/profile/ProfileModal';
import { MessagingOverlay } from './components/messaging/MessagingOverlay';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showMessages, setShowMessages] = useState(false);

  useEffect(() => {
    testConnection();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await ensureUserProfile(user);
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleSignIn = async () => {
    try {
      setAuthError(null);
      await signInWithPopup(auth, googleProvider);
      setShowAuth(false);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        setAuthError("Sign-in cancelled. Please keep the window open until finished.");
      } else if (error.code === 'auth/blocked-at-popup-request') {
        setAuthError("Popup blocked! Please allow popups for this site in your browser settings.");
      } else {
        setAuthError("Authentication failed. Please try again later.");
        console.error("Sign in failed", error);
      }
    }
  };

  const handleSignOut = () => signOut(auth);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-blue-500/10">
      <Navbar 
        user={user} 
        onSignOut={handleSignOut} 
        onSignInClick={() => setShowAuth(true)} 
        onProfileClick={() => setShowProfile(true)}
        onMessagesClick={() => setShowMessages(true)}
      />
      
      <main className="max-w-xl mx-auto pt-24 px-4">
        {user ? (
          <Feed user={user} />
        ) : (
          <div className="text-center py-20 px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-12 rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] border border-slate-100 max-w-md mx-auto"
            >
              <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-blue-600/20">
                <span className="text-3xl font-black text-white">N</span>
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">TheNetFace</h2>
              <p className="text-slate-500 mb-12 leading-relaxed text-base font-medium">
                The ultimate hybrid social environment for designers and architects.
              </p>
              <button
                id="login-btn"
                onClick={handleSignIn}
                className="w-full bg-slate-900 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-slate-900/10 active:scale-95"
              >
                <LogIn size={20} />
                Get Started with Google
              </button>
              <p className="mt-8 text-[10px] text-slate-400 font-bold uppercase tracking-widest">Secure cloud verification</p>
            </motion.div>
          </div>
        )}
      </main>

      <AnimatePresence>
        {showAuth && (
          <AuthOverlay 
            error={authError}
            onClose={() => {
              setShowAuth(false);
              setAuthError(null);
            }} 
            onSignIn={handleSignIn} 
          />
        )}
        {showProfile && user && (
          <ProfileModal 
            uid={user.uid}
            currentUserUid={user.uid}
            profile={user}
            onClose={() => setShowProfile(false)}
          />
        )}
        {showMessages && user && (
          <MessagingOverlay 
            user={user}
            onClose={() => setShowMessages(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
