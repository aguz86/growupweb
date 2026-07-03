const fs = require('fs');
const content = fs.readFileSync('src/data/schedule.ts', 'utf8');

function extractArray(name) {
    const regex = new RegExp(`export const ${name}: ScheduleItem\\[\\] = \\[(.*?)\\];`, 's');
    const match = content.match(regex);
    if (match) {
        // Fix trailing commas if any, though it should be valid JSON in the string
        let jsonStr = '[' + match[1] + ']';
        return eval(jsonStr); // use eval since it's an object literal string in TS
    }
    return [];
}

const wd = extractArray('weekdaySchedule');
const sat = extractArray('saturdaySchedule');
const sun = extractArray('sundaySchedule');

function checkOverlaps(arr, name) {
    console.log(`Checking ${name}...`);
    let hasError = false;
    // Sort by start time
    arr.sort((a, b) => a.start.localeCompare(b.start));
    
    for (let i = 0; i < arr.length - 1; i++) {
        const curr = arr[i];
        const next = arr[i+1];
        if (curr.start === next.start) {
            console.log(`- Duplicate start time ${curr.start} in ${curr.id} and ${next.id}`);
            hasError = true;
        } else if (curr.end > next.start && curr.end !== '00:00' && next.start !== '00:00' && curr.start !== '23:50') {
            console.log(`- Overlap: ${curr.id} ends at ${curr.end}, but ${next.id} starts at ${next.start}`);
            hasError = true;
        }
    }
    if (!hasError) console.log(`  No overlaps found in ${name}.`);
}

checkOverlaps(wd, 'weekdaySchedule');
checkOverlaps(sat, 'saturdaySchedule');
checkOverlaps(sun, 'sundaySchedule');
