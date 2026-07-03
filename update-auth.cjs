const fs = require('fs');
let code = fs.readFileSync('src/components/AuthMenu.tsx', 'utf8');

// Update props interface
code = code.replace(
  'export interface AuthMenuProps {\n  onNotification?: (message: string) => void;\n  onImportSuccess?: () => void;\n}',
  'export interface AuthMenuProps {\n  onNotification?: (message: string) => void;\n  onImportSuccess?: () => void;\n  onOpenImportTasks?: () => void;\n}'
);

// Update destructuring
code = code.replace(
  '}: AuthMenuProps = {}) {',
  '  onOpenImportTasks,\n}: AuthMenuProps = {}) {'
);

// We want to replace the `Impor Task` label and input with a button.
const replaceLabel = `<button onClick={() => { if (onOpenImportTasks) onOpenImportTasks(); }} className="text-xs text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-full transition-colors shadow-sm font-medium cursor-pointer">
            Impor Task
          </button>`;

code = code.replace(/<label className="text-xs text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-full transition-colors shadow-sm font-medium cursor-pointer">[\s\S]*?<\/label>/, replaceLabel);

// We need to remove processTaskImport completely, from `const processTaskImport = ` down to its final `};`
const startIdx = code.indexOf('const processTaskImport = async');
if (startIdx !== -1) {
    // let's find the `importAllTasks` to remove it as well
    const importAllTasksIdx = code.indexOf('const importAllTasks = async', startIdx);
    if (importAllTasksIdx !== -1) {
        const importAllNotesIdx = code.indexOf('const exportAllNotes =', importAllTasksIdx);
        if (importAllNotesIdx !== -1) {
            code = code.substring(0, startIdx) + code.substring(importAllNotesIdx);
        }
    }
}

fs.writeFileSync('src/components/AuthMenu.tsx', code);
console.log('Done');
