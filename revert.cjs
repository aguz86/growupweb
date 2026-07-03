const fs = require('fs');
let code = fs.readFileSync('src/components/AuthMenu.tsx', 'utf8');

// 1. Remove states
code = code.replace(/  const \[isPasteModalOpen, setIsPasteModalOpen\] = useState\(false\);\n  const \[pasteContent, setPasteContent\] = useState\(""\);\n  const \[pasteType, setPasteType\] = useState<"tasks" \| "notes">\("tasks"\);\n/g, '');

// 2. Remove buttons in the UI
code = code.replace(/<div className="flex items-center justify-end gap-2 mt-1 w-full flex-wrap">\s*<button onClick=\{exportAllTasks\}.*?>\s*Ekspor File\s*<\/button>\s*<label.*?>\s*Impor File\s*<input.*?onChange=\{importAllTasks\}.*?\/>\s*<\/label>\s*<button\s*onClick=\{.*\}\s*className="flex items-center gap-1 text-xs text-indigo-700 bg-indigo-100 hover:bg-indigo-200 px-3 py-1\.5 rounded-full transition-colors shadow-sm font-bold"\s*title="Paste JSON Task secara manual"\s*>\s*<ClipboardPaste className="w-3 h-3" \/> Paste Task\s*<\/button>\s*<\/div>/, `<div className="flex items-center justify-end gap-2 mt-1 w-full flex-wrap">
            <button onClick={exportAllTasks} className="text-xs text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-full transition-colors shadow-sm font-medium">
                Ekspor Semua Task
            </button>
            <label className="text-xs text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-full transition-colors shadow-sm font-medium cursor-pointer">
                Impor Task
                <input type="file" accept=".json" className="hidden" onClick={(e) => { e.currentTarget.value = ''; }} onChange={importAllTasks} />
            </label>
        </div>`);

code = code.replace(/<div className="flex items-center justify-end gap-2 mt-1 w-full flex-wrap">\s*<button onClick=\{exportAllNotes\}.*?>\s*Ekspor Note\s*<\/button>\s*<label.*?>\s*Impor Note\s*<input.*?onChange=\{importAllNotes\}.*?\/>\s*<\/label>\s*<button\s*onClick=\{.*\}\s*className="flex items-center gap-1 text-xs text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-3 py-1\.5 rounded-full transition-colors shadow-sm font-bold"\s*title="Paste JSON Note secara manual"\s*>\s*<ClipboardPaste className="w-3 h-3" \/> Paste Note\s*<\/button>\s*<\/div>/, `<div className="flex items-center justify-end gap-2 mt-1 w-full flex-wrap">
            <button onClick={exportAllNotes} className="text-xs text-white bg-teal-600 hover:bg-teal-500 px-3 py-1.5 rounded-full transition-colors shadow-sm font-medium">
                Ekspor Semua Note
            </button>
            <label className="text-xs text-white bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-full transition-colors shadow-sm font-medium cursor-pointer">
                Impor Note
                <input type="file" accept=".json" className="hidden" onClick={(e) => { e.currentTarget.value = ''; }} onChange={importAllNotes} />
            </label>
        </div>`);

// 3. Remove Paste Modal
code = code.replace(/\{\/\* Paste JSON Modal \*\/\}.*?\}\)\}/s, '');

// 4. Update imports to remove ClipboardPaste and X
code = code.replace(/ClipboardPaste, X/g, '');
code = code.replace(/, }/g, '}');

fs.writeFileSync('src/components/AuthMenu.tsx', code);
console.log("Reverted Paste Feature UI");
