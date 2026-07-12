import { useState, useEffect } from 'react';
import { ScheduleItem } from '../data/schedule';
import { X, Save, Trash2 } from 'lucide-react';

interface EditTaskModalProps {
  item: ScheduleItem;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedItem: ScheduleItem) => void;
  onDelete?: () => void;
}

export function EditTaskModal({ item, isOpen, onClose, onSave, onDelete }: EditTaskModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState<ScheduleItem>(item);
  

  const DAYS = [
    { value: 1, label: 'Senin' },
    { value: 2, label: 'Selasa' },
    { value: 3, label: 'Rabu' },
    { value: 4, label: 'Kamis' },
    { value: 5, label: 'Jumat' },
    { value: 6, label: 'Sabtu' },
    { value: 0, label: 'Minggu' },
  ];

  useEffect(() => {
    setFormData(item);

    setIsSaving(false);
    setIsDeleting(false);
  }, [item, isOpen]);

  if (!isOpen) return null;

  const handleIncludeDayToggle = (day: number) => {
    const currentExcluded = formData.excludedDays || [];
    // If it's currently excluded, we want to include it (remove from excluded)
    // If it's currently included, we want to exclude it (add to excluded)
    if (currentExcluded.includes(day)) {
      setFormData({ ...formData, excludedDays: currentExcluded.filter(d => d !== day) });
    } else {
      setFormData({ ...formData, excludedDays: [...currentExcluded, day] });
    }
  };

  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return 0;
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    
    let duration = (endH * 60 + endM) - (startH * 60 + startM);
    if (duration < 0) duration += 24 * 60; // if it spans midnight
    return duration;
  };

  const handleSave = async () => {
      setIsSaving(true);
      try {
          await onSave(formData);
          onClose();
      } catch (e) {
          console.error(e);
          alert("Terjadi kesalahan saat menyimpan");
      } finally {
          setIsSaving(false);
      }
  };

  const handleDelete = async () => {
      if (!onDelete) return;
      setIsDeleting(true);
      try {
          await onDelete();
          onClose();
      } catch (e) {
          console.error(e);
          alert("Terjadi kesalahan saat menghapus");
      } finally {
          setIsDeleting(false);
      }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 flex justify-between items-center border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-bold text-lg text-gray-900">Edit Task</h3>
          <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[60vh] sm:max-h-[70vh]">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Start Time</label>
              <input type="time" value={formData.start} onChange={e => {
                const newStart = e.target.value;
                setFormData({ ...formData, start: newStart, duration: calculateDuration(newStart, formData.end) });
              }} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">End Time</label>
              <input type="time" value={formData.end} onChange={e => {
                const newEnd = e.target.value;
                setFormData({ ...formData, end: newEnd, duration: calculateDuration(formData.start, newEnd) });
              }} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white" />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Duration (minutes)</label>
            <input type="number" value={formData.duration} onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Activity Name</label>
            <input type="text" value={formData.activity} onChange={e => setFormData({ ...formData, activity: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Notes</label>
            <textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white resize-none" />
          </div>


          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">Pengecualian Hari (Tampil Kecuali di Hari Berikut)</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => {
                const isExcluded = (formData.excludedDays || []).includes(day.value);
                return (
                  <button
                    key={day.value}
                    onClick={() => handleIncludeDayToggle(day.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      isExcluded 
                        ? 'bg-red-100 text-red-700 border border-red-200' 
                        : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5">Hijau = Tampil, Merah = Dikecualikan</p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer mt-2 w-max p-2 -ml-2 rounded-lg hover:bg-gray-50 transition-colors">
            <input type="checkbox" checked={formData.isBreak} onChange={e => setFormData({ ...formData, isBreak: e.target.checked })} className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
            <span className="text-sm font-medium text-gray-700">This is a break</span>
          </label>
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-between items-center gap-3">
          <div className="w-full sm:w-auto">
            {onDelete && (
              <button onClick={handleDelete} disabled={isSaving || isDeleting} className="w-full sm:w-auto flex justify-center items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100 disabled:opacity-50">
                <Trash2 className="w-4 h-4" />
                {isDeleting ? "Menghapus..." : "Hapus Task Ini"}
              </button>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button onClick={onClose} disabled={isSaving || isDeleting} className="w-full sm:w-auto justify-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50">
              Batal
            </button>
            <button onClick={handleSave} disabled={isSaving || isDeleting} className="w-full sm:w-auto flex justify-center items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg transition-colors shadow-sm disabled:opacity-50">
              <Save className="w-4 h-4" />
              {isSaving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
