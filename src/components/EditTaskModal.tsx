import { useState, useEffect } from 'react';
import { ScheduleItem } from '../data/schedule';
import { X, Save } from 'lucide-react';

interface EditTaskModalProps {
  item: ScheduleItem;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedItem: ScheduleItem, applyMode: 'today' | 'all' | 'all_except') => void;
}

export function EditTaskModal({ item, isOpen, onClose, onSave }: EditTaskModalProps) {
  const [formData, setFormData] = useState<ScheduleItem>(item);
  const [applyMode, setApplyMode] = useState<'today' | 'all' | 'all_except'>('today');

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
    if (item.excludedDays && item.excludedDays.length > 0) {
      setApplyMode('all_except');
    } else {
      setApplyMode('today');
    }
  }, [item]);

  if (!isOpen) return null;

  const handleExcludeDayToggle = (day: number) => {
    const currentExcluded = formData.excludedDays || [];
    if (currentExcluded.includes(day)) {
      setFormData({ ...formData, excludedDays: currentExcluded.filter(d => d !== day) });
    } else {
      setFormData({ ...formData, excludedDays: [...currentExcluded, day] });
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
        
        <div className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Start Time</label>
              <input type="time" value={formData.start} onChange={e => setFormData({ ...formData, start: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">End Time</label>
              <input type="time" value={formData.end} onChange={e => setFormData({ ...formData, end: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white" />
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

          <label className="flex items-center gap-2 cursor-pointer mt-2 w-max p-2 -ml-2 rounded-lg hover:bg-gray-50 transition-colors">
            <input type="checkbox" checked={formData.isBreak} onChange={e => setFormData({ ...formData, isBreak: e.target.checked })} className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
            <span className="text-sm font-medium text-gray-700">This is a break</span>
          </label>
          
          <div className="mt-2 p-3 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-700 mb-1">Terapkan Perubahan:</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="applyMode" value="today" checked={applyMode === 'today'} onChange={() => { setApplyMode('today'); setFormData({ ...formData, excludedDays: [] }); }} className="text-emerald-600 focus:ring-emerald-500" />
              <span className="text-sm text-gray-700">Hanya hari ini saja</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="applyMode" value="all" checked={applyMode === 'all'} onChange={() => { setApplyMode('all'); setFormData({ ...formData, excludedDays: [] }); }} className="text-emerald-600 focus:ring-emerald-500" />
              <span className="text-sm text-gray-700">Semua hari (Setiap hari di jam ini)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="applyMode" value="all_except" checked={applyMode === 'all_except'} onChange={() => setApplyMode('all_except')} className="text-emerald-600 focus:ring-emerald-500" />
              <span className="text-sm text-gray-700">Semua hari kecuali...</span>
            </label>
            
            {applyMode === 'all_except' && (
              <div className="ml-6 mt-1 flex flex-wrap gap-2">
                {DAYS.map(day => (
                  <label key={day.value} className="flex items-center gap-1.5 cursor-pointer bg-white px-2 py-1 border border-gray-200 rounded-md">
                    <input 
                      type="checkbox" 
                      checked={(formData.excludedDays || []).includes(day.value)}
                      onChange={() => handleExcludeDayToggle(day.value)}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                    />
                    <span className="text-xs text-gray-700">{day.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={() => { onSave(formData, applyMode); onClose(); }} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg transition-colors shadow-sm">
            <Save className="w-4 h-4" />
            Save Task
          </button>
        </div>
      </div>
    </div>
  );
}
