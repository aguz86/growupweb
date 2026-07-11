const fs = require('fs');
let code = fs.readFileSync('src/hooks/useSchedule.ts', 'utf8');

code = code.replace(
  /const override = globalOverrides\[item\.id\] \|\| globalOverrides\[item\.start\];/g,
  'const override = globalOverrides[item.id];'
);

code = code.replace(
  /if \(!baseIds\.has\(override\.id\) && !baseIds\.has\(override\.start\)\) \{/g,
  'if (!baseIds.has(override.id)) {'
);

fs.writeFileSync('src/hooks/useSchedule.ts', code);
console.log('Fixed double task logic');
