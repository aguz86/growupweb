const fs = require('fs');
let code = fs.readFileSync('src/components/EditTaskModal.tsx', 'utf8');

code = code.replace(
  /    if \(item\.excludedDays && item\.excludedDays\.length > 0\) \{\s*setApplyMode\('all_except'\);\s*\} else \{\s*setApplyMode\('today'\);\s*\}/,
  ""
);

fs.writeFileSync('src/components/EditTaskModal.tsx', code);
console.log('Fixed setApplyMode');
