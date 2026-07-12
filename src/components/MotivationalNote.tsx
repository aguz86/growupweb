
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, X, Quote, Shuffle, GripVertical } from 'lucide-react';

interface MotivationalNoteProps {
  onNotification?: (msg: string) => void;
}

export function MotivationalNote({ onNotification }: MotivationalNoteProps) {
  const [notes, setNotes] = useState<string[]>([
    "Fokus pada proses, bukan hanya hasil.",
    "Lakukan sedikit lebih baik hari ini daripada kemarin.",
    "Konsistensi mengalahkan intensitas."
  ]);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);


  const sanitizeNotes = (raw: any): string[] => {
    if (!Array.isArray(raw)) return [];
    return raw.map(item => {
      if (typeof item === 'string') return item;
      if (typeof item === 'object' && item !== null) {
        return item.content || item.text || item.note || JSON.stringify(item);
      }
      return String(item);
    });
  };

  const loadNotes = async () => {
    const key = user ? `motivational_notes_${user.id}` : 'motivational_notes_';
    const local = localStorage.getItem(key);
    
    if (user) {
        try {
            const { data, error } = await supabase
              .from('settings')
              .select('data')
              .eq('user_id', user.id)
              .eq('setting_type', 'motivation')
              .single();
              
            if (!error && data?.data?.notes) {
                setNotes(sanitizeNotes(data.data.notes));
                localStorage.setItem(key, JSON.stringify(data.data.notes));
            } else if (local) {
                setNotes(sanitizeNotes(JSON.parse(local)));
            }
        } catch(e) {
            if (local) setNotes(sanitizeNotes(JSON.parse(local)));
        }
    } else if (local) {
        setNotes(sanitizeNotes(JSON.parse(local)));
    }
  };

  useEffect(() => {
      loadNotes();
  }, [user]);

  const saveNotes = async (newNotes: string[]) => {
      setNotes(newNotes);
      const key = user ? `motivational_notes_${user.id}` : 'motivational_notes_';
      localStorage.setItem(key, JSON.stringify(newNotes));
      
      if (user) {
          try {
              await supabase.from('settings').upsert({
                user_id: user.id,
                setting_type: 'motivation',
                data: { notes: newNotes }
              }, { onConflict: 'user_id, setting_type' });
          } catch(e) {
              console.error("Supabase save error", e);
          }
      }
  };

  const addNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNote.trim()) {
      saveNotes([...notes, newNote.trim()]);
      setNewNote("");
      setCurrentNoteIndex(notes.length);
      if (onNotification) onNotification("Note ditambahkan");
    }
  };

  const deleteNote = (index: number) => {
    const next = notes.filter((_, i) => i !== index);
    saveNotes(next);
    if (currentNoteIndex >= next.length) {
      setCurrentNoteIndex(Math.max(0, next.length - 1));
    }
    if (onNotification) onNotification("Note dihapus");
  };

  const randomizeNote = () => {
    if (notes.length > 1) {
        let nextIndex;
        do {
            nextIndex = Math.floor(Math.random() * notes.length);
        } while (nextIndex === currentNoteIndex);
        setCurrentNoteIndex(nextIndex);
    }
  };

  if (notes.length === 0 && !isEditing) {
      return (
          <div className="w-full max-w-2xl mx-auto mb-6">
              <button 
                onClick={() => setIsEditing(true)}
                className="text-white/70 hover:text-white text-sm flex items-center gap-2 transition-colors mx-auto"
              >
                  <Plus className="w-4 h-4" /> Tambah Quote Motivasi
              </button>
          </div>
      );
  }

  return (
    <div className="w-full max-w-2xl mx-auto mb-6">
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 blur-xl rounded-full opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
        <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center shadow-2xl">
          <Quote className="w-8 h-8 text-white/20 absolute top-4 left-4" />
          
          <div className="min-h-[3rem] flex items-center justify-center">
            {isEditing ? (
                <div className="w-full max-w-md mx-auto text-left">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-white font-semibold">Edit Notes</h4>
                        <button onClick={() => setIsEditing(false)} className="text-white/60 hover:text-white p-1 rounded-full transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {notes.map((note, idx) => (
                            <div key={idx} className="flex items-start gap-2 bg-white/5 p-2 rounded-lg border border-white/10">
                                <GripVertical className="w-4 h-4 text-white/30 mt-1 cursor-grab" />
                                <p className="text-white/80 text-sm flex-1">{note}</p>
                                <button onClick={() => deleteNote(idx)} className="text-red-400 hover:text-red-300 p-1 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={addNote} className="flex gap-2">
                        <input
                            type="text"
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            placeholder="Ketik quote baru..."
                            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        />
                        <button type="submit" disabled={!newNote.trim()} className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-white/10 disabled:text-white/30 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                            Tambah
                        </button>
                    </form>
                </div>
            ) : (
                <div className="relative z-10 px-8">
                    <p className="text-lg md:text-xl font-medium text-white/90 leading-relaxed tracking-wide">
                        "{notes[currentNoteIndex]}"
                    </p>
                </div>
            )}
          </div>
          
          {!isEditing && (
              <div className="absolute right-4 bottom-4 flex gap-2">
                  {notes.length > 1 && (
                      <button 
                        onClick={randomizeNote}
                        className="text-white/40 hover:text-white/80 p-1.5 rounded-full transition-colors"
                        title="Acak Quote"
                      >
                          <Shuffle className="w-4 h-4" />
                      </button>
                  )}
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="text-white/40 hover:text-white/80 p-1.5 rounded-full transition-colors"
                    title="Edit Quotes"
                  >
                      <Plus className="w-4 h-4" />
                  </button>
              </div>
          )}
        </div>
      </div>
    </div>
  );
}
