import React, { useState, useEffect } from "react";
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { auth, db } from "../lib/firebase";
import {
  doc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
} from "firebase/firestore";

interface ImportTasksViewProps {
  onBack: () => void;
  onNotification: (msg: string) => void;
  onImportSuccess: () => void;
}

export function ImportTasksView({
  onBack,
  onNotification,
  onImportSuccess,
}: ImportTasksViewProps) {
  const [user, setUser] = useState(auth.currentUser);
  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSimulatingUpload, setIsSimulatingUpload] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(setUser);
    return unsub;
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setUploadProgress(0);
    setUploadComplete(false);

    // Simulate upload progress
    setIsSimulatingUpload(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsSimulatingUpload(false);
        setUploadComplete(true);
        // Read file content when "upload" is complete
        const reader = new FileReader();
        reader.onload = (event) => {
          setFileContent(event.target?.result as string);
        };
        reader.readAsText(selected);
      }
    }, 100);
  };

  const processTaskImport = async (fileContent: string) => {
    try {
      if (!fileContent) throw new Error("File kosong");
      const data = JSON.parse(fileContent);
      if (typeof data !== "object" || data === null)
        throw new Error("Format invalid");

      let validDataToImport: Record<string, any> = {};

      const processTask = (item: any) => {
        const id = item.id;
        const start = item.start;
        const end = item.end;
        const activity =
          item.activity || item.activityName || item.title || item.task;
        const duration = item.duration || 0;

        if (!id || !start || !end || !activity) return;

        let excludedDays = item.excludedDays || [];
        if (!excludedDays || excludedDays.length === 0) {
          if (id.startsWith("we-") || id.startsWith("we_")) {
            excludedDays = [1, 2, 3, 4, 5];
          } else if (id.startsWith("wd-") || id.startsWith("wd_")) {
            excludedDays = [0, 6];
          }
        }

        if (
          !validDataToImport[id] ||
          (validDataToImport[id].excludedDays &&
            validDataToImport[id].excludedDays.length === 0 &&
            excludedDays.length > 0)
        ) {
          validDataToImport[id] = {
            id,
            start,
            end,
            duration,
            activity,
            notes: item.notes || item.description || item.desc || "",
            isBreak: !!item.isBreak,
            isDeleted: false,
            excludedDays,
          };
        }
      };

      const traverseData = (obj: any) => {
        if (Array.isArray(obj)) {
          obj.forEach((item) => {
            if (typeof item === "object" && item !== null) {
              if (
                item.activity ||
                item.activityName ||
                item.title ||
                item.task
              ) {
                processTask(item);
              } else {
                traverseData(item);
              }
            }
          });
        } else if (typeof obj === "object" && obj !== null) {
          const values = Object.values(obj);
          const isTaskDict =
            values.length > 0 &&
            values.every(
              (v: any) =>
                typeof v === "object" &&
                v !== null &&
                (v.activity || v.activityName || v.title || v.task),
            );

          if (isTaskDict) {
            for (const key in obj) {
              processTask(obj[key]);
            }
          } else {
            for (const key in obj) {
              if (key.includes("productivity_")) continue;
              if (typeof obj[key] === "string") {
                try {
                  const parsed = JSON.parse(obj[key]);
                  traverseData(parsed);
                } catch (e) {}
              } else {
                traverseData(obj[key]);
              }
            }
          }
        }
      };

      traverseData(data);

      if (Object.keys(validDataToImport).length === 0) {
        if (onNotification)
          onNotification(
            "Tidak ada data task yang dikenali. Pastikan JSON berisi array task atau objek backup yang valid.",
          );
        return false;
      }

      // clear existing schedules for current user/anonymous to prevent old tasks from staying
      const customPrefix = user
        ? `custom_schedule_${user.uid}_`
        : "custom_schedule_";
      const globalPrefix = user
        ? `globalOverrides_${user.uid}`
        : "globalOverrides";
      const productivityPrefix = user
        ? `productivity_${user.uid}_`
        : "productivity_";

      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.startsWith(customPrefix) ||
            key === globalPrefix ||
            key.startsWith(productivityPrefix))
        ) {
          if (
            !user &&
            key.startsWith("custom_schedule_") &&
            key.split("_").length > 3
          )
            continue;
          if (
            !user &&
            key.startsWith("productivity_") &&
            key.split("_").length > 2
          )
            continue;
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));

      if (user) {
        try {
          const schedulesSnap = await getDocs(
            collection(db, "users", user.uid, "schedules"),
          );
          await Promise.all(schedulesSnap.docs.map((d) => deleteDoc(d.ref)));
          const progressSnap = await getDocs(
            collection(db, "users", user.uid, "progress"),
          );
          await Promise.all(progressSnap.docs.map((d) => deleteDoc(d.ref)));
          await deleteDoc(
            doc(db, "users", user.uid, "settings", "globalOverrides"),
          );
        } catch (e) {
          console.error("Failed to clear Firebase docs:", e);
        }
      }

      const promises = [];
      let importedCount = 0;

      // Group validDataToImport items into a globalOverrides object if they are schedule items
      let itemsObj: Record<string, any> = {};

      for (const key in validDataToImport) {
        itemsObj[validDataToImport[key].id] = validDataToImport[key];
      }

      let dateMatch = null; // Since we extract them flat, we just put them in globalOverrides

      const stringValue = JSON.stringify(itemsObj);
      const newKey = user ? `globalOverrides_${user.uid}` : "globalOverrides";
      localStorage.setItem(newKey, stringValue);

      if (user) {
        promises.push(
          setDoc(
            doc(db, "users", user.uid, "settings", "globalOverrides"),
            { items: itemsObj },
            { merge: true },
          ),
        );
      }
      importedCount += Object.keys(itemsObj).length;

      if (promises.length > 0) {
        await Promise.all(promises).catch((e) =>
          console.error("Firebase bulk save error:", e),
        );
      }

      if (importedCount === 0) {
        if (onNotification)
          onNotification("Gagal memproses data task yang valid.");
        return false;
      } else {
        if (onNotification)
          onNotification(`Berhasil mengimpor ${importedCount} data task!`);
        return true;
      }
    } catch (err) {
      console.error("Import tasks error:", err);
      if (onNotification) {
        onNotification(
          "Gagal mengimpor file. Pastikan file backup valid (JSON).",
        );
      }
      return false;
    }
  };

  const handleCommit = async () => {
    if (!fileContent) return;
    setIsCommitting(true);
    const success = await processTaskImport(fileContent);
    setIsCommitting(false);
    if (success) {
      onImportSuccess();
      onBack();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali
      </button>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Impor Task</h2>
        <p className="text-slate-500 mb-8">
          Upload file JSON backup task Anda untuk memulihkan atau mentransfer
          data jadwal Anda.
        </p>

        <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 text-center hover:bg-slate-50 transition-colors relative">
          <input
            type="file"
            accept=".json"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileChange}
            disabled={isSimulatingUpload || isCommitting}
          />
          <div className="flex flex-col items-center gap-3">
            <UploadCloud className="w-10 h-10 text-slate-400" />
            <div className="text-slate-600 font-medium">
              {file ? file.name : "Klik atau seret file JSON ke sini"}
            </div>
            <div className="text-slate-400 text-sm">
              Maksimal 5MB. Hanya format JSON.
            </div>
          </div>
        </div>

        {isSimulatingUpload && (
          <div className="mt-6">
            <div className="flex justify-between text-sm text-slate-600 mb-2">
              <span>Mengunggah {file?.name}...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-200 ease-out"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {uploadComplete && !isSimulatingUpload && (
          <div className="mt-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
              <CheckCircle2 className="w-5 h-5" />
              <div className="flex-1">
                <div className="font-semibold text-sm">
                  File berhasil diunggah
                </div>
                <div className="text-emerald-600/80 text-xs">
                  Siap untuk dikomit ke sistem.
                </div>
              </div>
            </div>

            <button
              onClick={handleCommit}
              disabled={isCommitting}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              {isCommitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Menyimpan ke sistem...
                </>
              ) : (
                "Komit Perubahan"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
