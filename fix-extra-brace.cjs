const fs = require('fs');
let code = fs.readFileSync('src/hooks/useSchedule.ts', 'utf8');

code = code.replace(
  '  }\n  };\n  const deleteScheduleItem',
  '  };\n  const deleteScheduleItem'
);

fs.writeFileSync('src/hooks/useSchedule.ts', code);
console.log('Fixed extra brace');
