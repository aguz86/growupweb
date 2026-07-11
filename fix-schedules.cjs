const fs = require('fs');
let code = fs.readFileSync('src/hooks/useSchedule.ts', 'utf8');

// Replace getResolvedSchedule, updateScheduleItem, deleteScheduleItem, deleteAllScheduleItems, addScheduleItem

const newLogic = `
  const getResolvedSchedule = (date: Date) => {
      const dStr = format(date, 'yyyy-MM-dd');
      
      // If there's a custom saved schedule for THIS specific date, use it directly!
      if (customSchedules[dStr] && customSchedules[dStr].length > 0) {
          return customSchedules[dStr];
      }
      
      let base = getScheduleForDate(date);
      const dayOfWeek = date.getDay();
      
      if (Object.keys(globalOverrides).length > 0) {
          const baseIds = new Set(base.map(item => item.id));
          
          base = base.map(item => {
              const override = globalOverrides[item.id];
              if (override) {
                  if (override.excludedDays && override.excludedDays.includes(dayOfWeek)) {
                      return item;
                  }
                  if (override.isDeleted) return null;
                  return { ...override, id: item.id };
              }
              return item;
          }).filter(Boolean) as ScheduleItem[];
          
          Object.values(globalOverrides).forEach((override: any) => {
              if (override.isDeleted) return;
              if (!baseIds.has(override.id)) {
                  if (!(override.excludedDays && override.excludedDays.includes(dayOfWeek))) {
                      base.push({ ...override });
                  }
              }
          });
          
          base.sort((a, b) => a.start.localeCompare(b.start));
      }
      
      return base.filter(i => !i.isDeleted);
  };

  const saveDailySchedule = async (dateStr: string, schedule: ScheduleItem[]) => {
      const prefix = user ? \`custom_schedule_\${user.uid}_\${dateStr}\` : \`custom_schedule_\${dateStr}\`;
      setCustomSchedules(prev => ({ ...prev, [dateStr]: schedule }));
      localStorage.setItem(prefix, JSON.stringify(schedule));
      
      if (user) {
          setDoc(doc(db, 'users', user.uid, 'schedules', dateStr), { schedule }, { merge: true })
              .catch(e => console.error("Firebase save error", e));
      }
  };

  const updateScheduleItem = async (dateStr: string, index: number, updatedItem: ScheduleItem, applyMode: 'today' | 'all' | 'all_except' = 'today') => {
      const current = getResolvedSchedule(parse(dateStr, 'yyyy-MM-dd', new Date()));
      const originalItem = current[index];
      
      if (applyMode === 'today') {
          const newSchedule = [...current];
          newSchedule[index] = updatedItem;
          // Sort to maintain order
          newSchedule.sort((a, b) => a.start.localeCompare(b.start));
          await saveDailySchedule(dateStr, newSchedule);
      } else {
          // global override
          const globalPrefix = user ? \`globalOverrides_\${user.uid}\` : 'globalOverrides';
          
          let overrideData = { ...updatedItem };
          if (applyMode === 'all_except') {
              const day = parse(dateStr, 'yyyy-MM-dd', new Date()).getDay();
              // If excluded, ensure it doesn't appear on this day
              if (!overrideData.excludedDays) overrideData.excludedDays = [];
              if (!overrideData.excludedDays.includes(day)) {
                  overrideData.excludedDays.push(day);
              }
          }
          
          const newOverrides = { ...globalOverrides, [originalItem.id]: overrideData };
          setGlobalOverrides(newOverrides);
          localStorage.setItem(globalPrefix, JSON.stringify(newOverrides));
          
          if (user) {
              setDoc(doc(db, 'users', user.uid, 'settings', 'globalOverrides'), { items: newOverrides }, { merge: true })
                  .catch(e => console.error("Firebase save error", e));
          }
      }
  };

  const deleteScheduleItem = async (dateStr: string, index: number, applyMode: 'today' | 'all' | 'all_except' = 'today') => {
      const current = getResolvedSchedule(parse(dateStr, 'yyyy-MM-dd', new Date()));
      const originalItem = current[index];
      
      if (applyMode === 'today') {
          const newSchedule = current.filter((_, i) => i !== index);
          await saveDailySchedule(dateStr, newSchedule);
      } else {
          const updatedItem = { ...originalItem, isDeleted: true };
          await updateScheduleItem(dateStr, index, updatedItem, applyMode);
      }
  };

  const deleteAllScheduleItems = async (dateStr: string) => {
      await saveDailySchedule(dateStr, []);
  };

  const addScheduleItem = async (dateStr: string, newItem: ScheduleItem) => {
      const current = getResolvedSchedule(parse(dateStr, 'yyyy-MM-dd', new Date()));
      const newSchedule = [...current, newItem];
      newSchedule.sort((a, b) => a.start.localeCompare(b.start));
      await saveDailySchedule(dateStr, newSchedule);
  };
`;

code = code.replace(/  const getResolvedSchedule = \(date: Date\) => \{[\s\S]*?  const addScheduleItem = async \(dateStr: string, newItem: ScheduleItem\) => \{[\s\S]*?  \};\n/g, newLogic);

fs.writeFileSync('src/hooks/useSchedule.ts', code);
console.log('Fixed schedules logic');
