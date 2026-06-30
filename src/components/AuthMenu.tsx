import React, { useState, useEffect } from "react";
import { auth, googleSignIn } from "../lib/firebase";
import { signOut, User } from "firebase/auth";
import { LogOut, LogIn, User as UserIcon } from "lucide-react";

export function AuthMenu() {
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      console.log("Auth state changed:", u ? u.email : "null");
      setUser(u);
    });
    return unsub;
  }, []);

  const login = async () => {
    setAuthError(null);
    try {
      console.log("Starting sign in with popup...");
      const result = await googleSignIn();
      console.log("Sign in successful:", result.user.email);
      setUser(result.user);
    } catch (e: any) {
      if (e.code === 'auth/popup-closed-by-user') {
        // Silently ignore or set a mild error, user closed popup
        return;
      }
      
      console.error("Login fail", e);
      if (e.code === 'auth/unauthorized-domain' || (e.message && e.message.includes('auth/unauthorized-domain'))) {
        setAuthError(`Akses Ditolak. Tambahkan domain berikut di Firebase Console (Authentication > Settings > Authorized domains): ${window.location.hostname}`);
      } else {
        setAuthError(`Gagal login: ${e.message}`);
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const exportAllTasks = () => {
    const exportData: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('productivity_') || key.startsWith('custom_schedule_') || key.startsWith('globalOverrides'))) {
            exportData[key] = localStorage.getItem(key) || '';
        }
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_semua_task_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importAllTasks = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const data = JSON.parse(event.target?.result as string);
              for (const key in data) {
                  localStorage.setItem(key, data[key]);
              }
              alert('Data task berhasil diimpor! Memuat ulang...');
              window.location.reload();
          } catch(err) {
              alert('Gagal mengimpor file. Pastikan file backup valid.');
          }
      };
      reader.readAsText(file);
  };

  if (user) {
    return (
      <div className="flex flex-col items-end gap-2 relative">
        <div className="flex items-center gap-3 bg-white/10 rounded-full px-3 py-1.5 border border-white/20">
          <UserIcon className="w-4 h-4 text-white" />
          <span className="text-white text-sm font-medium">{user.displayName || user.email}</span>
          <button onClick={logout} className="p-1 hover:bg-white/20 rounded-full text-white transition-colors" title="Log Out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2 mt-1">
            <button onClick={exportAllTasks} className="text-xs text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-full transition-colors shadow-sm font-medium">
                Ekspor Semua Task
            </button>
            <label className="text-xs text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-full transition-colors shadow-sm font-medium cursor-pointer">
                Impor Task
                <input type="file" accept=".json" className="hidden" onChange={importAllTasks} />
            </label>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button onClick={login} className="flex items-center gap-2 bg-white text-emerald-700 hover:bg-emerald-50 px-4 py-2 rounded-full text-sm font-semibold transition-colors shadow-sm">
        <LogIn className="w-4 h-4" />
        <span>Login</span>
      </button>
      {authError && (
        <div className="absolute top-full right-0 mt-2 w-72 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl shadow-lg z-50">
          <p className="font-semibold mb-1">Error Login</p>
          <p>{authError}</p>
        </div>
      )}
    </div>
  );
}
