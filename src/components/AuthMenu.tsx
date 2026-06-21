import { useState, useEffect } from "react";
import { auth, googleProvider } from "../lib/firebase";
import { signInWithPopup, signOut, User } from "firebase/auth";
import { LogOut, LogIn, User as UserIcon } from "lucide-react";

export function AuthMenu() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(setUser);
    return unsub;
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error("Login fail", e);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  if (user) {
    return (
      <div className="flex items-center gap-3 bg-white/10 rounded-full px-3 py-1.5 border border-white/20">
        <UserIcon className="w-4 h-4 text-white" />
        <span className="text-white text-sm font-medium">{user.displayName || user.email}</span>
        <button onClick={logout} className="p-1 hover:bg-white/20 rounded-full text-white transition-colors" title="Log Out">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button onClick={login} className="flex items-center gap-2 bg-white text-emerald-700 hover:bg-emerald-50 px-4 py-2 rounded-full text-sm font-semibold transition-colors shadow-sm">
      <LogIn className="w-4 h-4" />
      <span>Login</span>
    </button>
  );
}
