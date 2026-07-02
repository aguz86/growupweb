import React, { useState, useEffect } from "react";
import { auth, googleSignIn, db } from "../lib/firebase";
import { signOut, User } from "firebase/auth";
import { doc, setDoc, collection, getDocs, deleteDoc } from "firebase/firestore";
import { LogOut, LogIn, User as UserIcon } from "lucide-react";

export interface AuthMenuProps {
  onNotification?: (message: string) => void;
  onImportSuccess?: () => void;
}

export function AuthMenu({ onNotification, onImportSuccess }: AuthMenuProps = {}) {
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
    const exportData: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('productivity_') || key.startsWith('custom_schedule_') || key.startsWith('globalOverrides'))) {
            try {
                const val = localStorage.getItem(key);
                exportData[key] = val ? JSON.parse(val) : null;
            } catch (e) {
                exportData[key] = localStorage.getItem(key);
            }
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

  const importAllTasks = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (onNotification) onNotification('Memulai impor task...');
      
      const reader = new FileReader();
      reader.onload = async (event) => {
          try {
              const fileContent = event.target?.result as string;
              if (!fileContent) throw new Error("File kosong");
              const data = JSON.parse(fileContent);
              if (typeof data !== 'object' || data === null) throw new Error("Format invalid");
              
              let validDataToImport: Record<string, any> = {};
              
              let dataArray = null;
              if (Array.isArray(data)) {
                  dataArray = data;
              } else if (typeof data === 'object' && data !== null) {
                  // Check if it's a backup file
                  const hasBackupKeys = Object.keys(data).some(k => k.includes('globalOverrides') || k.includes('custom_schedule_') || k.includes('productivity_'));
                  if (hasBackupKeys) {
                      for (const key in data) {
                          if (key.includes('globalOverrides') || key.includes('custom_schedule_') || key.includes('productivity_')) {
                              validDataToImport[key] = data[key];
                          }
                      }
                  } else {
                      // Try to find an array inside the object
                      for (const key in data) {
                          if (Array.isArray(data[key]) && data[key].length > 0) {
                              dataArray = data[key];
                              break;
                          }
                      }
                  }
              }

              if (dataArray) {
                  const itemsObj: any = {};
                  let currentStartHour = 8;
                  let currentStartMin = 0;

                  const formatTime = (h: number, m: number) => 
                      `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

                  dataArray.forEach((item: any, index: number) => {
                      if (typeof item === 'object' && item !== null) {
                          const activity = item.activity || item.activityName || item.category || item.title || item.name || item.task || `Task ${index + 1}`;
                          const duration = parseInt(item.duration || item.durationMinutes) || 60;
                          
                          let start = item.start;
                          if (!start) {
                              start = formatTime(currentStartHour, currentStartMin);
                              currentStartMin += duration;
                              while (currentStartMin >= 60) {
                                  currentStartMin -= 60;
                                  currentStartHour++;
                              }
                          }

                          // Calculate end time
                          const [sH, sM] = start.split(':').map(Number);
                          let eM = sM + duration;
                          let eH = sH + Math.floor(eM / 60);
                          eM = eM % 60;
                          const end = formatTime(eH, eM);
                          
                          itemsObj[start] = {
                              id: item.id || `imported_${Math.random().toString(36).substr(2, 9)}`,
                              start: start,
                              end: end,
                              duration: duration,
                              activity: activity,
                              notes: item.notes || item.description || item.desc || '',
                              isBreak: !!item.isBreak,
                              isDeleted: false,
                              excludedDays: item.excludedDays || []
                          };
                      }
                  });
                  if (Object.keys(itemsObj).length > 0) {
                      validDataToImport['globalOverrides'] = itemsObj;
                  }
              }

              if (Object.keys(validDataToImport).length === 0) {
                  if (onNotification) onNotification('Tidak ada data task yang dikenali. Pastikan JSON berisi array task atau objek backup yang valid.');
                  e.target.value = '';
                  return;
              }
              
              // clear existing schedules for current user/anonymous to prevent old tasks from staying
              const customPrefix = user ? `custom_schedule_${user.uid}_` : 'custom_schedule_';
              const globalPrefix = user ? `globalOverrides_${user.uid}` : 'globalOverrides';
              const productivityPrefix = user ? `productivity_${user.uid}_` : 'productivity_';
              
              const keysToRemove = [];
              for (let i = 0; i < localStorage.length; i++) {
                  const key = localStorage.key(i);
                  if (key && (key.startsWith(customPrefix) || key === globalPrefix || key.startsWith(productivityPrefix))) {
                      if (!user && key.startsWith('custom_schedule_') && key.split('_').length > 3) continue;
                      if (!user && key.startsWith('productivity_') && key.split('_').length > 2) continue;
                      keysToRemove.push(key);
                  }
              }
              keysToRemove.forEach(k => localStorage.removeItem(k));

              if (user) {
                  try {
                      const schedulesSnap = await getDocs(collection(db, 'users', user.uid, 'schedules'));
                      await Promise.all(schedulesSnap.docs.map(d => deleteDoc(d.ref)));
                      const progressSnap = await getDocs(collection(db, 'users', user.uid, 'progress'));
                      await Promise.all(progressSnap.docs.map(d => deleteDoc(d.ref)));
                      await deleteDoc(doc(db, 'users', user.uid, 'settings', 'globalOverrides'));
                  } catch (e) {
                      console.error("Failed to clear Firebase docs:", e);
                  }
              }

              const promises = [];
              let importedCount = 0;

              for (const key in validDataToImport) {
                  let dateMatch = key.match(/\d{4}-\d{2}-\d{2}$/);
                  
                  let parsedValue;
                  try {
                      if (typeof validDataToImport[key] === 'string') {
                          if (validDataToImport[key].trim() === '') {
                              parsedValue = key.includes('custom_schedule_') ? [] : {};
                          } else {
                              parsedValue = JSON.parse(validDataToImport[key]);
                          }
                      } else {
                          parsedValue = validDataToImport[key];
                      }
                  } catch (e) {
                      console.warn("Invalid JSON for key", key, validDataToImport[key]);
                      continue; // Skip invalid JSON
                  }

                  const stringValue = typeof parsedValue === 'object' ? JSON.stringify(parsedValue) : String(parsedValue);

                  if (key.includes('globalOverrides')) {
                      const newKey = user ? `globalOverrides_${user.uid}` : 'globalOverrides';
                      localStorage.setItem(newKey, stringValue);
                      if (user) promises.push(setDoc(doc(db, 'users', user.uid, 'settings', 'globalOverrides'), { items: parsedValue }));
                      importedCount += Object.keys(parsedValue).length || 1;
                  } else if (key.includes('custom_schedule_') && dateMatch) {
                      const dateStr = dateMatch[0];
                      const newKey = user ? `custom_schedule_${user.uid}_${dateStr}` : `custom_schedule_${dateStr}`;
                      localStorage.setItem(newKey, stringValue);
                      if (user) promises.push(setDoc(doc(db, 'users', user.uid, 'schedules', dateStr), { schedule: parsedValue }));
                      importedCount += Array.isArray(parsedValue) ? parsedValue.length : 1;
                  } else if (key.includes('productivity_') && dateMatch) {
                      const dateStr = dateMatch[0];
                      const newKey = user ? `productivity_${user.uid}_${dateStr}` : `productivity_${dateStr}`;
                      localStorage.setItem(newKey, stringValue);
                      if (user) promises.push(setDoc(doc(db, 'users', user.uid, 'progress', dateStr), { progress: parsedValue }, { merge: true }));
                      // Don't count productivity to task count, but increment by 1 so it doesn't say 0 if only productivity imported
                      if (importedCount === 0) importedCount = 1;
                  }
              }
              
              if (promises.length > 0) {
                  await Promise.all(promises).catch(e => console.error("Firebase bulk save error:", e));
              }

              if (importedCount === 0) {
                  if (onNotification) onNotification('Gagal memproses data task yang valid.');
              } else {
                  if (onNotification) onNotification(`Berhasil mengimpor ${importedCount} data task!`);
                  if (onImportSuccess) {
                      onImportSuccess();
                  } else {
                      setTimeout(() => {
                          window.location.reload();
                      }, 1500);
                  }
              }
          } catch(err) {
              console.error("Import tasks error:", err);
              if (onNotification) {
                  onNotification('Gagal mengimpor file. Pastikan file backup valid (JSON).');
              }
          } finally {
              e.target.value = '';
          }
      };
      reader.readAsText(file);
  };

  const exportAllNotes = () => {
    const exportData: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('motivational_notes_')) {
            try {
                const val = localStorage.getItem(key);
                exportData[key] = val ? JSON.parse(val) : null;
            } catch (e) {
                exportData[key] = localStorage.getItem(key);
            }
        }
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_semua_note_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importAllNotes = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (onNotification) onNotification('Memulai impor note...');
      
      const reader = new FileReader();
      reader.onload = async (event) => {
          try {
              const fileContent = event.target?.result as string;
              if (!fileContent) throw new Error("File kosong");
              const data = JSON.parse(fileContent);
              if (typeof data !== 'object' || data === null) throw new Error("Format invalid");
              
              let isRawArray = Array.isArray(data);
              
              let validDataToImport: Record<string, any> = {};
              
              if (isRawArray) {
                  // User uploaded a raw array of notes, let's map it to motivational_notes_
                  validDataToImport['motivational_notes_'] = data;
              } else {
                  for (const key in data) {
                      if (key.startsWith('motivational_notes_')) {
                          validDataToImport[key] = data[key];
                      }
                  }
              }

              if (Object.keys(validDataToImport).length === 0) {
                  if (onNotification) onNotification('Tidak ada note valid yang ditemukan dalam file ini.');
                  e.target.value = '';
                  return;
              }
              
              let importedCount = 0;
              const promises = [];

              for (const key in validDataToImport) {
                  if (key.startsWith('motivational_notes_')) {
                      let parsedValue;
                      try {
                          if (typeof validDataToImport[key] === 'string') {
                              if (validDataToImport[key].trim() === '') {
                                  parsedValue = [];
                              } else {
                                  parsedValue = JSON.parse(validDataToImport[key]);
                              }
                          } else {
                              parsedValue = validDataToImport[key];
                          }
                      } catch (e) {
                          console.warn("Invalid JSON for note key", key);
                          continue;
                      }
                      
                      const stringValue = typeof parsedValue === 'object' ? JSON.stringify(parsedValue) : String(parsedValue);
                      const newKey = user ? `motivational_notes_${user.uid}` : 'motivational_notes_';
                      localStorage.setItem(newKey, stringValue);
                      if (user) {
                          promises.push(setDoc(doc(db, 'users', user.uid, 'settings', 'motivation'), { notes: parsedValue }, { merge: true }));
                      }
                      importedCount++;
                  }
              }

              if (promises.length > 0) {
                  await Promise.all(promises).catch(e => console.error("Firebase bulk save error:", e));
              }

              if (importedCount === 0) {
                  if (onNotification) onNotification('Tidak ada note valid yang ditemukan dalam file ini.');
              } else {
                  if (onNotification) onNotification(`Berhasil mengimpor ${importedCount} data note! Memuat ulang...`);
                  setTimeout(() => {
                      window.location.reload();
                  }, 1500);
              }
          } catch(err) {
              console.error("Import notes error:", err);
              if (onNotification) {
                  onNotification('Gagal mengimpor file. Pastikan file backup valid (JSON).');
              }
          } finally {
              e.target.value = '';
          }
      };
      reader.readAsText(file);
  };

  if (user) {
    return (
      <div className="flex flex-col items-end gap-2 relative z-50">
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
                <input type="file" accept=".json" className="hidden" onClick={(e) => { e.currentTarget.value = ''; }} onChange={importAllTasks} />
            </label>
        </div>
        <div className="flex items-center gap-2 mt-1">
            <button onClick={exportAllNotes} className="text-xs text-white bg-teal-600 hover:bg-teal-500 px-3 py-1.5 rounded-full transition-colors shadow-sm font-medium">
                Ekspor Semua Note
            </button>
            <label className="text-xs text-white bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-full transition-colors shadow-sm font-medium cursor-pointer">
                Impor Note
                <input type="file" accept=".json" className="hidden" onClick={(e) => { e.currentTarget.value = ''; }} onChange={importAllNotes} />
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
