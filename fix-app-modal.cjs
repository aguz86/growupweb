const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "onSave={async (updated, applyMode) => {",
  "onSave={async (updated) => {"
);
code = code.replace(
  "updated,\n              applyMode,",
  "updated,"
);

code = code.replace(
  "onDelete={async (applyMode) => {",
  "onDelete={async () => {"
);
code = code.replace(
  "editingTask.index,\n              applyMode,",
  "editingTask.index,"
);

fs.writeFileSync('src/App.tsx', code);
console.log('Fixed App modal usage');
