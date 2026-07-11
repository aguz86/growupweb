const fs = require('fs');
let code = fs.readFileSync('src/components/AuthMenu.tsx', 'utf8');

const exportRegex = /const exportAllTasks = \(\) => \{[\s\S]*?URL\.revokeObjectURL\(url\);\n  \};/;

const newExport = `const exportAllTasks = () => {
    let globalKey = user ? \`globalOverrides_\${user.uid}\` : 'globalOverrides';
    let dataToExport = {};
    const val = localStorage.getItem(globalKey);
    if (val) {
      try {
        dataToExport = JSON.parse(val);
      } catch (e) {}
    }
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = \`backup_task.json\`;
    a.click();
    URL.revokeObjectURL(url);
  };`;

code = code.replace(exportRegex, newExport);
fs.writeFileSync('src/components/AuthMenu.tsx', code);
console.log('Fixed export');
