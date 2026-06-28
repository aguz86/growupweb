import { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Edit2, Check } from 'lucide-react';
import { cn } from '../lib/utils';

export function MotivationalNote() {
    const [note, setNote] = useState("Tulis motivasi harianmu di sini...");
    const [isEditing, setIsEditing] = useState(false);
    const [tempNote, setTempNote] = useState(note);
    const [user, setUser] = useState(auth.currentUser);

    useEffect(() => {
        return auth.onAuthStateChanged(setUser);
    }, []);

    useEffect(() => {
        const localNote = localStorage.getItem('motivational_note');
        if (localNote) setNote(localNote);

        if (user) {
            getDoc(doc(db, 'users', user.uid, 'settings', 'motivation')).then(snap => {
                if (snap.exists() && snap.data().note) {
                    setNote(snap.data().note);
                    localStorage.setItem('motivational_note', snap.data().note);
                }
            });
        }
    }, [user]);

    const saveNote = async () => {
        setNote(tempNote);
        setIsEditing(false);
        localStorage.setItem('motivational_note', tempNote);
        
        if (user) {
            try {
                await setDoc(doc(db, 'users', user.uid, 'settings', 'motivation'), { note: tempNote }, { merge: true });
            } catch (e) {
                console.error("Error saving note", e);
            }
        }
    };

    if (isEditing) {
        return (
            <div className="flex flex-col sm:flex-row items-start gap-2 mt-6 mb-4 px-4 sm:px-6 max-w-7xl mx-auto w-full animate-in fade-in duration-200">
                <textarea 
                    value={tempNote}
                    onChange={(e) => setTempNote(e.target.value)}
                    className="flex-1 bg-yellow-50 text-gray-800 placeholder-gray-400 border-2 border-yellow-400 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 w-full min-h-[80px] resize-y"
                    placeholder="Apa motivasimu hari ini?"
                    autoFocus
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) {
                            saveNote();
                        }
                    }}
                />
                <button 
                    onClick={saveNote}
                    className="flex items-center justify-center gap-2 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-500 transition-colors whitespace-nowrap self-end sm:self-auto"
                >
                    <Check className="w-4 h-4" />
                    Simpan
                </button>
            </div>
        );
    }

    return (
        <div className="mt-6 mb-4 px-4 sm:px-6 max-w-7xl mx-auto w-full animate-in fade-in duration-200">
            <div className="group relative bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 shadow-sm w-full transition-all hover:shadow-md">
                <p className="text-gray-800 text-sm font-medium whitespace-pre-wrap leading-relaxed">
                    {note}
                </p>
                <button 
                    onClick={() => {
                        setTempNote(note);
                        setIsEditing(true);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full text-yellow-600 hover:text-yellow-800 hover:bg-yellow-200 opacity-0 group-hover:opacity-100 transition-all"
                    title="Edit Motivasi"
                >
                    <Edit2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
