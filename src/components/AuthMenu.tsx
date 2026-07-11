
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { LogOut, LogIn, User as UserIcon } from "lucide-react";

export interface AuthMenuProps {
  onNotification?: (message: string) => void;
  onImportSuccess?: () => void;
  onOpenImportTasks?: () => void;
}

export function AuthMenu({
  onNotification,
  onImportSuccess,
  onOpenImportTasks,
}: AuthMenuProps = {}) {
  const [user, setUser] = useState<any | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (onNotification) onNotification("Berhasil daftar! Silakan cek email jika diperlukan, atau langsung masuk.");
      }
      setShowForm(false);
    } catch (e: any) {
      setAuthError(e.message);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const exportAllTasks = () => {
    let globalKey = user ? `globalOverrides_${user.id}` : 'globalOverrides';
    let dataToExport = {};
    const val = localStorage.getItem(globalKey);
    if (val) {
      try {
        dataToExport = JSON.parse(val);
      } catch (e) {}
    }
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup_task.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAllNotes = () => {
    const exportData: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("motivational_notes_")) {
        try {
          const val = localStorage.getItem(key);
          exportData[key] = val ? JSON.parse(val) : null;
        } catch (e) {
          exportData[key] = localStorage.getItem(key);
        }
      }
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup_semua_note_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const processNoteImport = async (fileContent: string) => {
    try {
      if (!fileContent) throw new Error("File kosong");
      const data = JSON.parse(fileContent);
      if (typeof data !== "object" || data === null) throw new Error("Format invalid");

      let isRawArray = Array.isArray(data);
      let validDataToImport: Record<string, any> = {};

      if (isRawArray) {
        validDataToImport["motivational_notes_"] = data;
      } else {
        for (const key in data) {
          if (key.startsWith("motivational_notes_")) {
            validDataToImport[key] = data[key];
          }
        }
      }

      if (Object.keys(validDataToImport).length === 0) {
        if (onNotification) onNotification("Tidak ada note valid yang ditemukan.");
        return;
      }

      let importedCount = 0;
      const promises = [];

      for (const key in validDataToImport) {
        if (key.startsWith("motivational_notes_")) {
          let parsedValue;
          try {
            if (typeof validDataToImport[key] === "string") {
              if (validDataToImport[key].trim() === "") {
                parsedValue = [];
              } else {
                parsedValue = JSON.parse(validDataToImport[key]);
              }
            } else {
              parsedValue = validDataToImport[key];
            }
          } catch (e) {
            continue;
          }

          const stringValue = typeof parsedValue === "object" ? JSON.stringify(parsedValue) : String(parsedValue);
          const newKey = user ? `motivational_notes_${user.id}` : "motivational_notes_";
          localStorage.setItem(newKey, stringValue);
          
          if (user) {
            promises.push(
              supabase.from("settings").upsert({
                user_id: user.id,
                setting_type: 'motivation',
                data: { notes: parsedValue }
              }, { onConflict: 'user_id, setting_type' })
            );
          }
          importedCount++;
        }
      }

      if (promises.length > 0) {
        await Promise.all(promises).catch(e => console.error("Supabase bulk save error:", e));
      }

      if (importedCount === 0) {
        if (onNotification) onNotification("Tidak ada note valid yang ditemukan dalam data ini.");
      } else {
        if (onNotification) onNotification(`Berhasil mengimpor ${importedCount} data note! Memuat ulang...`);
        setTimeout(() => { window.location.reload(); }, 1500);
      }
    } catch (err) {
      if (onNotification) onNotification("Gagal mengimpor. Pastikan data valid (JSON).");
    }
  };

  const importAllNotes = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (onNotification) onNotification("Memulai impor note...");

    const reader = new FileReader();
    reader.onload = async (event) => {
      await processNoteImport(event.target?.result as string);
      e.target.value = "";
    };
    reader.readAsText(file);
  };

  if (user) {
    return (
      <div className="flex flex-col items-end gap-2 relative z-50">
        <div className="flex items-center gap-3 bg-white/10 rounded-full px-3 py-1.5 border border-white/20">
          <UserIcon className="w-4 h-4 text-white" />
          <span className="text-white text-sm font-medium">
            {user.email}
          </span>
          <button
            onClick={logout}
            className="p-1 hover:bg-white/20 rounded-full text-white transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-end gap-2 mt-1 w-full flex-wrap">
          <button
            onClick={exportAllTasks}
            className="text-xs text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-full transition-colors shadow-sm font-medium"
          >
            Ekspor Semua Task
          </button>
          <button
            onClick={() => {
              if (onOpenImportTasks) onOpenImportTasks();
            }}
            className="text-xs text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-full transition-colors shadow-sm font-medium cursor-pointer"
          >
            Impor Task
          </button>
        </div>
        <div className="flex items-center justify-end gap-2 mt-1 w-full flex-wrap">
          <button
            onClick={exportAllNotes}
            className="text-xs text-white bg-teal-600 hover:bg-teal-500 px-3 py-1.5 rounded-full transition-colors shadow-sm font-medium"
          >
            Ekspor Semua Note
          </button>
          <label className="text-xs text-white bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-full transition-colors shadow-sm font-medium cursor-pointer">
            Impor Note
            <input
              type="file"
              accept=".json"
              className="hidden"
              onClick={(e) => {
                e.currentTarget.value = "";
              }}
              onChange={importAllNotes}
            />
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-50">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-white text-emerald-700 hover:bg-emerald-50 px-4 py-2 rounded-full text-sm font-semibold transition-colors shadow-sm"
        >
          <LogIn className="w-4 h-4" />
          <span>Login / Daftar</span>
        </button>
      ) : (
        <div className="absolute top-full right-0 mt-2 w-72 p-4 bg-white rounded-xl shadow-xl border border-gray-100">
          <h3 className="text-gray-900 font-semibold mb-4 text-sm">{isLogin ? 'Login ke Akun Anda' : 'Buat Akun Baru'}</h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white"
            />
            {authError && <p className="text-red-500 text-xs">{authError}</p>}
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-lg text-sm transition-colors">
              {isLogin ? 'Masuk' : 'Daftar'}
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-3 text-center">
            {isLogin ? 'Belum punya akun?' : 'Sudah punya akun?'}
            <button onClick={() => { setIsLogin(!isLogin); setAuthError(null); }} className="ml-1 text-emerald-600 hover:underline">
              {isLogin ? 'Daftar' : 'Masuk'}
            </button>
          </p>
          <button onClick={() => setShowForm(false)} className="mt-3 w-full text-xs text-gray-400 hover:text-gray-600">
            Batal
          </button>
        </div>
      )}
    </div>
  );
}
