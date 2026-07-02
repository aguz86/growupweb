export type ScheduleItem = {
  id: string;
  start: string; // HH:mm format
  end: string;   // HH:mm format
  duration: number; // in minutes
  activity: string;
  notes: string;
  isBreak: boolean;
  excludedDays?: number[]; // 0 = Sunday, 1 = Monday, etc.
  isDeleted?: boolean; // Flag to indicate if the task is deleted across global schedule
};

export const weekdaySchedule: ScheduleItem[] = [];

export const saturdaySchedule: ScheduleItem[] = [];

export const sundaySchedule: ScheduleItem[] = [];

export const getScheduleForDate = (date: Date): ScheduleItem[] => {
  const day = date.getDay(); // 0 is Sunday, 6 is Saturday
  if (day === 0) return sundaySchedule;
  if (day === 6) return saturdaySchedule;
  return weekdaySchedule;
};

// Deprecated fallback for compatibility if someone still uses it, but prefer getScheduleForDate
export const scheduleData: ScheduleItem[] = weekdaySchedule;


