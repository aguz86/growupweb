const fs = require('fs');
let code = fs.readFileSync('src/hooks/useSchedule.ts', 'utf8');

// 1. In getResolvedSchedule, remove customSchedules entirely
code = code.replace(
  "return customSchedules[dStr] ? customSchedules[dStr].filter(i => !i.isDeleted) : base.filter(i => !i.isDeleted);",
  "return base.filter(i => !i.isDeleted);"
);

// 2. updateScheduleItem - just operate on globalOverrides
const updateFuncRegex = /const updateScheduleItem = async \([\s\S]*?\} else \{\s*const baseSchedule[\s\S]*?Promise\.all\(updatePromises\)\.catch\(e => console\.error\("Firebase save error", e\)\);\s*\}\s*\}/;

const newUpdateFunc = `const updateScheduleItem = async (dateStr: string, index: number, updatedItem: ScheduleItem, applyMode: 'today' | 'all' | 'all_except' = 'all') => {
      const current = getResolvedSchedule(parse(dateStr, 'yyyy-MM-dd', new Date()));
      const originalItem = current[index];
      const globalPrefix = user ? \`globalOverrides_\${user.uid}\` : 'globalOverrides';
      
      const newOverrides = { ...globalOverrides, [originalItem.id]: updatedItem };
      setGlobalOverrides(newOverrides);
      localStorage.setItem(globalPrefix, JSON.stringify(newOverrides));
      
      if (user) {
          setDoc(doc(db, 'users', user.uid, 'settings', 'globalOverrides'), { items: newOverrides }, { merge: true })
              .catch(e => console.error("Firebase save error", e));
      }
  }`;
code = code.replace(updateFuncRegex, newUpdateFunc);

// 3. addScheduleItem
const addFuncRegex = /const addScheduleItem = async \([\s\S]*?\}\s*};\s*\/\/\s*Timer loop/;
const newAddFunc = `const addScheduleItem = async (dateStr: string, newItem: ScheduleItem) => {
      const globalPrefix = user ? \`globalOverrides_\${user.uid}\` : 'globalOverrides';
      
      const newOverrides = { ...globalOverrides, [newItem.id]: newItem };
      setGlobalOverrides(newOverrides);
      localStorage.setItem(globalPrefix, JSON.stringify(newOverrides));
      
      if (user) {
          setDoc(doc(db, 'users', user.uid, 'settings', 'globalOverrides'), { items: newOverrides }, { merge: true })
              .catch(e => console.error("Firebase save error", e));
      }
  };
  // Timer loop`;
code = code.replace(addFuncRegex, newAddFunc);

// 4. deleteAllScheduleItems
const deleteAllRegex = /const deleteAllScheduleItems = async \(dateStr: string\) => \{[\s\S]*?\};/;
const newDeleteAll = `const deleteAllScheduleItems = async (dateStr: string) => {
      const globalPrefix = user ? \`globalOverrides_\${user.uid}\` : 'globalOverrides';
      setGlobalOverrides({});
      localStorage.removeItem(globalPrefix);
      if (user) {
          setDoc(doc(db, 'users', user.uid, 'settings', 'globalOverrides'), { items: {} })
              .catch(e => console.error("Firebase save error", e));
      }
  };`;
code = code.replace(deleteAllRegex, newDeleteAll);

fs.writeFileSync('src/hooks/useSchedule.ts', code);
console.log('Simplified schedule logic');
