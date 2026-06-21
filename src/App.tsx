/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CheckCircle2, Circle, BellDot, BellOff, Clock, Activity, BarChart3, Timer, Volume2, VolumeX, CalendarDays, Edit2, X } from 'lucide-react';
import { useSchedule, playAlarmSound, speakText } from './hooks/useSchedule';
import { cn } from './lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { useEffect, useRef, useState } from 'react';
import { addDays, format, parse } from 'date-fns';
import { id } from 'date-fns/locale';
import { getScheduleForDate, ScheduleItem } from './data/schedule';
import { AuthMenu } from './components/AuthMenu';
import { EditTaskModal } from './components/EditTaskModal';
import { MotivationalNote } from './components/MotivationalNote';

const formatRemainingTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    const sStr = s.toString().padStart(2, '0');
    const mStr = m.toString().padStart(2, '0');
    
    if (h > 0) return `${h}:${mStr}:${sStr}`;
    return `${mStr}:${sStr}`;
};

export default function App() {
  const {
    currentDateStr,
    todaySchedule,
    progress,
    activeItemId,
    remainingSeconds,
    toggleTask,
    isAudioEnabled,
    setIsAudioEnabled,
    volume,
    setVolume,
    weeklyStats,
    getResolvedSchedule,
    updateScheduleItem,
    user
  } = useSchedule();

  const [activeTab, setActiveTab] = useState<'today' | 'upcoming'>('today');
  const [selectedUpcomingDate, setSelectedUpcomingDate] = useState<string>(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [editingTask, setEditingTask] = useState<{ item: ScheduleItem, index: number, dateStr: string } | null>(null);
  const [showActivePopup, setShowActivePopup] = useState(true);

  const activeItemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeItemRef.current && activeTab === 'today') {
        activeItemRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeItemId, activeTab]);

  useEffect(() => {
    if (activeItemId) {
      setShowActivePopup(true);
    }
  }, [activeItemId]);

  const activeItemIndex = todaySchedule.findIndex(i => i.id === activeItemId);
  const activeItem = activeItemIndex >= 0 ? todaySchedule[activeItemIndex] : null;

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        await Notification.requestPermission();
      }
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
    });
  }, []);

  const handleDownloadApp = async () => {
      if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          if (outcome === 'accepted') {
              setDeferredPrompt(null);
          }
      } else {
          alert("Untuk menginstall app ini, gunakan fitur 'Add to Home Screen' atau 'Install App' di menu browser Anda (titik tiga di pojok kanan atas atau icon share di iOS).");
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-red-100 selection:text-red-900 flex flex-col">
      <header className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 text-white py-4 px-6 sticky top-0 z-50 shadow-lg border-b border-black/10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
             <Activity className="w-6 h-6 animate-pulse" />
             <h1 className="text-xl font-extrabold tracking-tight drop-shadow-sm">V3 Progress Tracker</h1>
          </div>
          
          <div className="flex items-center gap-3 bg-black/20 p-1.5 rounded-full backdrop-blur-sm border border-white/10">
            <button 
              onClick={() => {
                  if (!isAudioEnabled) {
                      playAlarmSound(volume); // initial test chime
                      setTimeout(() => {
                         speakText("Sistem alarm pengingat stasiun telah diaktifkan.", volume);
                      }, 3500);
                  }
                  setIsAudioEnabled(!isAudioEnabled);
              }}
              className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all shadow-sm",
                  isAudioEnabled 
                      ? "bg-white text-emerald-700 hover:bg-gray-100" 
                      : "bg-red-500 text-white hover:bg-red-400"
              )}
            >
              {isAudioEnabled ? <BellDot className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              {isAudioEnabled ? "Alarm On" : "Alarm Off"}
            </button>
            
            <div className="flex items-center gap-2 px-3 text-white">
                {volume === 0 ? <VolumeX className="w-4 h-4 opacity-75" /> : <Volume2 className="w-4 h-4 opacity-75" />}
                <input 
                  type="range" 
                  min="0" max="1" step="0.05"
                  value={volume}
                  onChange={(e) => {
                      setVolume(parseFloat(e.target.value));
                  }}
                  className="w-20 accent-emerald-400 opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                />
            </div>
          </div>
          
          <AuthMenu />
        </div>
        
        <MotivationalNote />

        {/* Navigation / Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
          <div className="flex items-center gap-2 border-b border-white/20 pb-px mt-4">
            <button
              onClick={() => setActiveTab('today')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 border-b-2 transition-colors font-medium text-sm rounded-t-lg",
                activeTab === 'today' 
                  ? "bg-white border-white text-emerald-700" 
                  : "border-transparent text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20"
              )}
            >
              <Clock className="w-4 h-4" />
              Hari Ini
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 border-b-2 transition-colors font-medium text-sm rounded-t-lg",
                activeTab === 'upcoming' 
                  ? "bg-white border-white text-emerald-700" 
                  : "border-transparent text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20"
              )}
            >
              <CalendarDays className="w-4 h-4" />
              6 Hari Kedepan
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'today' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Timeline */}
            <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                   <h2 className="text-lg font-semibold flex items-center gap-2">
                       <Clock className="w-5 h-5 text-[#c0392b]" />
                       Jadwal Hari Ini <span className="text-gray-400 text-sm font-normal">({currentDateStr})</span>
                   </h2>
                   <div className="text-sm px-3 py-1 bg-gray-100 rounded-full font-medium text-gray-600">
                       {Object.keys(progress).filter(k => progress[k]).length} / {todaySchedule.length} Selesai
                   </div>
                </div>

                <div className="flex flex-col gap-3 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                  {todaySchedule.map((item) => {
                      const isActive = item.id === activeItemId;
                      const isCompleted = !!progress[item.id];

                      return (
                        <div 
                          key={item.id} 
                          ref={isActive ? activeItemRef : null}
                          className={cn(
                            "relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group transition-all duration-300",
                            isActive ? "opacity-100 scale-[1.02]" : "opacity-80 hover:opacity-100"
                          )}
                        >
                            {/* Marker */}
                            <div className={cn(
                              "flex items-center justify-center w-8 h-8 rounded-full border-4 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2",
                              isActive ? "bg-emerald-500 border-emerald-100 z-10 animate-pulse" : 
                              isCompleted ? "bg-emerald-500 border-white z-10" : "bg-white border-gray-200 z-10"
                            )}>
                                {isCompleted ? <CheckCircle2 className="w-4 h-4 text-white" /> : <div className={cn("w-2 h-2 rounded-full", isActive ? "bg-white" : "bg-transparent")} />}
                            </div>

                            {/* Card */}
                            <div className={cn(
                                "w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border transition-all cursor-pointer shadow-sm",
                                isActive ? "bg-emerald-50/50 border-emerald-500 ring-1 ring-emerald-500" : isCompleted ? "bg-white border-emerald-500" : "bg-white border-gray-100/50 hover:border-gray-300"
                            )}
                                  onClick={() => toggleTask(item.id)}
                            >
                                <div className="flex justify-between items-start mb-1">
                                  <span className={cn(
                                    "font-mono text-xs font-semibold px-2 py-1 rounded",
                                    isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                                  )}>{item.start} - {item.end}</span>
                                  <div className="flex items-center gap-2">
                                      {user && (
                                          <button 
                                            onClick={(e) => { e.stopPropagation(); setEditingTask({ item, index: todaySchedule.indexOf(item), dateStr: currentDateStr }); }}
                                            className="p-1 text-gray-400 hover:text-emerald-600 rounded hover:bg-emerald-50 transition-colors"
                                          >
                                              <Edit2 className="w-3 h-3" />
                                          </button>
                                      )}
                                      <span className="text-xs font-medium text-gray-400">{item.duration}m</span>
                                  </div>
                                </div>
                                <h3 className={cn(
                                    "font-semibold text-sm sm:text-base mt-2",
                                    item.isBreak ? "text-[#c0392b]" : "text-gray-900",
                                    isActive && "text-emerald-800",
                                    isCompleted && "line-through text-gray-400"
                                )}>{item.activity}</h3>
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.notes}</p>
                            </div>
                        </div>
                      )
                  })}
                </div>
            </div>
        </div>

        {/* Right Column: Status & Charts */}
        <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Active Status Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
                <h2 className="text-lg font-semibold mb-4">Status Saat Ini</h2>
                
                {activeItem ? (
                    <div className={cn(
                        "p-5 rounded-xl border-l-4 transition-colors",
                        activeItem.isBreak 
                          ? (remainingSeconds !== null && remainingSeconds <= 60
                              ? "bg-yellow-50 border-yellow-500"
                              : "bg-red-50 border-[#c0392b]")
                          : "bg-green-50 border-green-500"
                    )}>
                        <div className="flex items-center gap-2 mb-2 text-xs font-mono font-bold uppercase tracking-wider text-gray-500">
                             Sedang Berlangsung {activeItem.isBreak ? "(Jeda)" : ""}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{activeItem.activity}</h3>
                        <p className="text-gray-600 text-sm mb-4">{activeItem.notes}</p>
                        
                        {remainingSeconds !== null && (
                            <div className={cn(
                                "my-4 p-5 rounded-2xl border-2 flex flex-col items-center justify-center shadow-inner relative overflow-hidden group transition-colors",
                                activeItem.isBreak 
                                  ? (remainingSeconds <= 60 
                                      ? "bg-gradient-to-br from-yellow-50 to-yellow-500/10 border-yellow-500/20" 
                                      : "bg-gradient-to-br from-red-50 to-[#c0392b]/10 border-[#c0392b]/20")
                                  : "bg-gradient-to-br from-green-50 to-green-500/10 border-green-500/20"
                            )}>
                                <div className={cn(
                                  "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity",
                                  activeItem.isBreak 
                                      ? (remainingSeconds <= 60 ? "bg-yellow-500/5" : "bg-[#c0392b]/5")
                                      : "bg-green-500/5"
                                )}></div>
                                <div className={cn(
                                    "flex items-center gap-2 text-xs font-bold tracking-widest mb-2 uppercase transition-colors",
                                    activeItem.isBreak 
                                      ? (remainingSeconds <= 60 ? "text-yellow-600/80" : "text-[#c0392b]/80")
                                      : "text-green-600/80"
                                )}>
                                    <Timer className="w-4 h-4 animate-pulse" />
                                    <span>Waktu Tersisa</span>
                                </div>
                                <div className={cn(
                                    "text-5xl md:text-6xl font-mono font-extrabold tracking-tighter drop-shadow-sm transition-colors",
                                    activeItem.isBreak 
                                      ? (remainingSeconds <= 60 ? "text-yellow-500" : "text-[#c0392b]")
                                      : "text-green-600"
                                )}>
                                    {formatRemainingTime(remainingSeconds)}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-2 pt-2 border-t border-black/5 mt-2">
                             <Clock className="w-4 h-4 text-gray-400" />
                             <span className="font-mono text-sm font-medium">{activeItem.start} - {activeItem.end} ({activeItem.duration}m)</span>
                        </div>
                    </div>
                ) : (
                    <div className="p-5 rounded-xl bg-gray-50 border border-gray-200 text-center">
                        <p className="text-gray-500 text-sm">Tidak ada jadwal yang aktif saat ini.</p>
                    </div>
                )}

                <div className="mt-8">
                     <h2 className="text-lg font-semibold flex items-center gap-2 mb-6">
                        <BarChart3 className="w-5 h-5 text-gray-500" />
                        Pencapaian Mingguan
                     </h2>
                     <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                                <Tooltip 
                                  cursor={{fill: '#f9fafb'}}
                                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="completed" radius={[4, 4, 0, 0]}>
                                  {weeklyStats.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.date === currentDateStr ? '#10b981' : '#6366f1'} />
                                  ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                     </div>
                </div>
            </div>
          </div>
        </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex overflow-x-auto gap-3 pb-6 px-4 -mx-4 sm:mx-0 sm:px-0 snap-x hide-scrollbar">
                {Array.from({ length: 6 }).map((_, i) => {
                    const targetDate = addDays(new Date(), i + 1);
                    const targetDateStr = format(targetDate, 'yyyy-MM-dd');
                    const dayName = format(targetDate, 'EEEE', { locale: id });
                    const isSelected = selectedUpcomingDate === targetDateStr;
                    
                    return (
                        <button
                            key={targetDateStr}
                            onClick={() => setSelectedUpcomingDate(targetDateStr)}
                            className={cn(
                                "flex-shrink-0 flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border min-w-[90px] sm:min-w-[120px] transition-all snap-center",
                                isSelected 
                                    ? "bg-indigo-500 text-white border-indigo-600 shadow-md transform sm:scale-105" 
                                    : "bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 hover:-translate-y-1"
                            )}
                        >
                            <span className="text-xs sm:text-sm font-semibold">{dayName}</span>
                            <span className="text-xl sm:text-2xl font-bold mt-1">{format(targetDate, 'dd')}</span>
                            <span className={cn("text-[10px] sm:text-xs mt-1 text-center", isSelected ? "text-indigo-100" : "text-gray-500")}>{format(targetDate, 'MMM yyyy', { locale: id })}</span>
                        </button>
                    )
                })}
            </div>

            {(() => {
                const targetDate = new Date(selectedUpcomingDate);
                const dayName = format(targetDate, 'EEEE', { locale: id });
                const schedule = getResolvedSchedule(targetDate);
                return (
                    <div className="bg-indigo-50/50 rounded-2xl p-6 shadow-md border border-indigo-100 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center gap-2 mb-6 border-b border-indigo-100 pb-4">
                            <CalendarDays className="w-5 h-5 text-indigo-600" />
                            <h2 className="text-lg font-bold text-indigo-900">{dayName}, <span className="font-medium text-indigo-500">{selectedUpcomingDate}</span></h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {schedule.map((item, index) => (
                                <div key={index} className={cn(
                                    "p-4 rounded-xl border transition-colors hover:shadow-sm group",
                                    item.isBreak ? "bg-white/50 border-red-100 hover:border-red-200" : "bg-white border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50/80"
                                )}>
                                    <div className="flex justify-between items-start mb-3">
                                        <span className={cn(
                                            "font-mono text-xs font-bold px-2 py-1 rounded shadow-sm",
                                            item.isBreak ? "bg-red-100 text-[#c0392b]" : "bg-white border text-gray-700"
                                        )}>{item.start} - {item.end}</span>
                                        <div className="flex items-center gap-2">
                                            {user && (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); setEditingTask({ item, index, dateStr: selectedUpcomingDate }); }}
                                                    className="p-1 text-gray-400 hover:text-indigo-600 rounded hover:bg-indigo-50 transition-colors"
                                                >
                                                    <Edit2 className="w-3 h-3" />
                                                </button>
                                            )}
                                            <span className={cn(
                                                "text-xs font-medium px-2 py-1 rounded-full",
                                                item.isBreak ? "bg-red-100 text-red-600" : "bg-gray-200 text-gray-600"
                                            )}>{item.duration}m</span>
                                        </div>
                                    </div>
                                    <h3 className={cn(
                                        "font-bold text-sm",
                                        item.isBreak ? "text-[#c0392b]" : "text-gray-900 group-hover:text-emerald-800 transition-colors"
                                    )}>{item.activity}</h3>
                                    <p className={cn(
                                        "text-sm mt-2 line-clamp-2 leading-relaxed transition-colors",
                                        item.isBreak ? "text-red-700/70" : "text-gray-500 group-hover:text-gray-700"
                                    )}>{item.notes}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })()}
          </div>
        )}
      </main>

      {editingTask && (
        <EditTaskModal 
          isOpen={true}
          item={editingTask.item}
          onClose={() => setEditingTask(null)}
          onSave={async (updated) => {
            await updateScheduleItem(editingTask.dateStr, editingTask.index, updated);
            setEditingTask(null);
          }}
        />
      )}

      {/* Floating Active Item Popup */}
      {activeItem && showActivePopup && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 overflow-hidden">
            <button 
                onClick={() => setShowActivePopup(false)} 
                className="absolute top-2 right-2 text-gray-500 hover:text-white bg-white hover:bg-red-500 shadow-md border border-gray-200 hover:border-red-500 rounded-full p-2 z-10 transition-all active:scale-95 group"
                aria-label="Tutup popup"
            >
                <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
            <div className={cn(
                "p-4 border-l-4",
                activeItem.isBreak 
                    ? (remainingSeconds !== null && remainingSeconds <= 60 ? "border-yellow-500 bg-yellow-50/50" : "border-[#c0392b] bg-red-50/50")
                    : "border-emerald-500 bg-emerald-50/50"
            )}>
                <div className="flex items-center gap-2 mb-1">
                    <Activity className={cn(
                        "w-4 h-4 animate-pulse",
                        activeItem.isBreak 
                            ? (remainingSeconds !== null && remainingSeconds <= 60 ? "text-yellow-600" : "text-[#c0392b]")
                            : "text-emerald-600"
                    )} />
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        Sedang Berlangsung {activeItem.isBreak ? "(Jeda)" : ""}
                    </span>
                </div>
                <h3 className="font-bold text-gray-900 truncate pr-6 text-sm">{activeItem.activity}</h3>
                
                {remainingSeconds !== null && (
                    <div className="mt-3 flex items-center justify-between">
                        <div className="text-xs text-gray-500 font-medium flex items-center gap-1">
                            <Timer className="w-3 h-3" /> Sisa Waktu:
                        </div>
                        <div className={cn(
                            "font-mono font-bold text-2xl tracking-tighter drop-shadow-sm",
                            activeItem.isBreak 
                                ? (remainingSeconds <= 60 ? "text-yellow-600" : "text-[#c0392b]")
                                : "text-emerald-700"
                        )}>
                            {formatRemainingTime(remainingSeconds)}
                        </div>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 text-gray-400 py-8 text-center mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-4">
          <p>&copy; {new Date().getFullYear()} V3 Progress Tracker. All rights reserved.</p>
          <button 
            onClick={handleDownloadApp}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-medium transition-colors shadow-sm text-sm"
          >
            Download Web App
          </button>
        </div>
      </footer>
    </div>
  );
}
