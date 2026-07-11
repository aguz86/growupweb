const fs = require('fs');
let code = fs.readFileSync('src/components/EditTaskModal.tsx', 'utf8');

// replace applyMode in interface
code = code.replace(
  "onSave: (updatedItem: ScheduleItem, applyMode: 'today' | 'all' | 'all_except') => void;\n  onDelete?: (applyMode: 'today' | 'all' | 'all_except') => void;",
  "onSave: (updatedItem: ScheduleItem) => void;\n  onDelete?: () => void;"
);

// remove state for applyMode
code = code.replace(
  "const [applyMode, setApplyMode] = useState<'today' | 'all' | 'all_except'>('today');",
  ""
);

// handleSave
code = code.replace(
  /await onSave\(formData, applyMode\);/g,
  "await onSave(formData);"
);

// handleDelete
code = code.replace(
  /await onDelete\(applyMode\);/g,
  "await onDelete();"
);

// remove the apply mode UI completely
const uiRegex = /<div className="mt-2 p-3 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-2">[\s\S]*?<\/div>\s*<\/div>/;
code = code.replace(uiRegex, "");

fs.writeFileSync('src/components/EditTaskModal.tsx', code);
console.log('Simplified EditTaskModal');
