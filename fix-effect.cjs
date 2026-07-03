const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const effectCode = `  useEffect(() => {
    if (!user && activeTab === 'import-tasks') {
      setActiveTab('today');
    }
  }, [user, activeTab]);

`;

code = code.replace(effectCode, '');

// Now we insert it AFTER the declaration of activeTab
const activeTabDecl = '  const [activeTab, setActiveTab] = useState<\n    "today" | "upcoming" | "analytics" | "import-tasks"\n  >("today");';

// Let's just find `const [activeTab` and inject after the statement
code = code.replace(/  const \[activeTab.*?\] = useState<.*?>\("today"\);/s, match => {
  return match + '\n\n' + effectCode;
});

fs.writeFileSync('src/App.tsx', code);
console.log('Fixed effect');
