const fs = require('fs');
let code = fs.readFileSync('src/hooks/useSchedule.ts', 'utf8');

code = code.replace(
    'const today = new Date();\n    const start = startOfWeek(today, { weekStartsOn: 1 }); // Monday\n    const end = endOfWeek(today, { weekStartsOn: 1 }); // Sunday',
    'const today = new Date();\n    const end = today;\n    const start = addDays(today, -6); // 7 days (today + 6 past days)'
);

fs.writeFileSync('src/hooks/useSchedule.ts', code);
console.log('Fixed analytics time range');
