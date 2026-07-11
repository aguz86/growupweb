const fs = require('fs');
let code = fs.readFileSync('src/hooks/useSchedule.ts', 'utf8');

const syncLogic = `
  useEffect(() => {
    if (!user) return;
    
    // Listen to all schedules for this user to sync across devices seamlessly
    import('firebase/firestore').then(({ collection, onSnapshot }) => {
        const schedulesRef = collection(db, 'users', user.uid, 'schedules');
        const unsubSchedules = onSnapshot(schedulesRef, (snap) => {
            const loadedSchedules: Record<string, ScheduleItem[]> = {};
            snap.forEach(docSnap => {
                loadedSchedules[docSnap.id] = docSnap.data().schedule;
                localStorage.setItem(\`custom_schedule_\${user.uid}_\${docSnap.id}\`, JSON.stringify(docSnap.data().schedule));
            });
            setCustomSchedules(prev => ({ ...prev, ...loadedSchedules }));
        });
        
        return () => unsubSchedules();
    });
  }, [user]);
`;

code = code.replace(/  \/\/ Fetch Firebase schedules when user logs in/g, syncLogic + '\n  // Fetch Firebase schedules when user logs in');

fs.writeFileSync('src/hooks/useSchedule.ts', code);
console.log('Fixed sync logic');
