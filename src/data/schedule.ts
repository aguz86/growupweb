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

export const weekdaySchedule: ScheduleItem[] = [
  {"start":"00:00","end":"05:00","duration":300,"activity":"Waktunya Tidur","notes":"Istirahat Malam.","isBreak":false,"id":"wd-0"},
  {"start":"05:00","end":"05:20","duration":20,"activity":"Ibadah Subuh","notes":"Fokus Ibadah.","isBreak":false,"id":"wd-1"},
  {"start":"05:20","end":"06:15","duration":55,"activity":"Tidur Lanjut","notes":"Istirahat Tahap 2.","isBreak":false,"id":"wd-2"},
  {"start":"06:15","end":"07:00","duration":45,"activity":"Sarapan & Mandi","notes":"Makan pagi dan mandi.","isBreak":false,"id":"wd-3"},
  {"start":"07:00","end":"07:50","duration":50,"activity":"Perjalanan Kerja","notes":"Berangkat kerja.","isBreak":false,"id":"wd-4"},
  {"start":"07:50","end":"16:30","duration":520,"activity":"Kerja Formal","notes":"Fokus kerja.","isBreak":false,"id":"wd-5"},
  {"start":"16:30","end":"16:40","duration":10,"activity":"Jeda Pulang","notes":"Persiapan pulang.","isBreak":true,"id":"wd-6"},
  {"start":"16:40","end":"17:00","duration":20,"activity":"Arrive Home","notes":"Tiba di rumah.","isBreak":false,"id":"wd-7"},
  {"start":"17:00","end":"17:25","duration":25,"activity":"Masak & Mandi","notes":"Kebersihan dan persiapan energi.","isBreak":false,"id":"wd-8"},
  {"start":"17:25","end":"17:50","duration":25,"activity":"Rekap Finansial","notes":"Catat pengeluaran & cek portofolio harian.","isBreak":false,"id":"wd-9"},
  {"start":"17:50","end":"18:10","duration":20,"activity":"Ibadah Maghrib","notes":"Durasi 20 Menit.","isBreak":false,"id":"wd-10"},
  {"start":"18:10","end":"18:35","duration":25,"activity":"Airdrop Session","notes":"Sesi rutin harian (check-in/daily tasks).","isBreak":false,"id":"wd-11"},
  {"start":"18:35","end":"18:50","duration":15,"activity":"Jeda Makan Malam","notes":"Waktu untuk makan malam (15 Menit).","isBreak":true,"id":"wd-12"},
  {"start":"18:50","end":"19:00","duration":10,"activity":"Ibadah Isya","notes":"Fokus ibadah (10 menit).","isBreak":false,"id":"wd-13"},
  {"start":"19:00","end":"19:50","duration":50,"activity":"Kursus Marketing","notes":"Fokus Belajar Intensif (50 Menit).","isBreak":false,"id":"wd-14"},
  {"start":"19:50","end":"20:00","duration":10,"activity":"Jeda Istirahat","notes":"Minum air putih & jalan.","isBreak":true,"id":"wd-15"},
  {"start":"20:00","end":"20:30","duration":30,"activity":"Programming Basic","notes":"Penguatan logika/fondasi koding (30 Menit).","isBreak":false,"id":"wd-16"},
  {"start":"20:30","end":"20:40","duration":10,"activity":"Jeda Istirahat","notes":"Penyegaran mental.","isBreak":true,"id":"wd-17"},
  {"start":"20:40","end":"21:10","duration":30,"activity":"Vibecoding","notes":"Koding santai/flow state (30 Menit).","isBreak":false,"id":"wd-18"},
  {"start":"21:10","end":"21:20","duration":10,"activity":"Jeda Istirahat","notes":"Relaksasi sejenak sebelum eksperimen.","isBreak":true,"id":"wd-19"},
  {"start":"21:20","end":"21:50","duration":30,"activity":"Eksperimen","notes":"Sesi eksplorasi bebas (30 Menit).","isBreak":false,"id":"wd-20"},
  {"start":"21:50","end":"22:20","duration":30,"activity":"Kursus Desain","notes":"Fokus Desain (30 Menit).","isBreak":false,"id":"wd-21"},
  {"start":"22:20","end":"22:30","duration":10,"activity":"Jeda Istirahat","notes":"Relaksasi mata.","isBreak":true,"id":"wd-22"},
  {"start":"22:30","end":"22:50","duration":20,"activity":"YouTube Short Production","notes":"Editing video (20 Menit).","isBreak":false,"id":"wd-23"},
  {"start":"22:50","end":"23:10","duration":20,"activity":"Jeda Istirahat + Masak","notes":"Persiapan bekal.","isBreak":true,"id":"wd-24"},
  {"start":"23:10","end":"23:30","duration":20,"activity":"Job Reward Recehan","notes":"Fokus tugas mikro (20 Menit).","isBreak":false,"id":"wd-25"},
  {"start":"23:30","end":"23:50","duration":20,"activity":"Wind Down","notes":"Persiapan tidur malam.","isBreak":false,"id":"wd-26"},
  {"start":"23:50","end":"00:00","duration":10,"activity":"Waktunya Tidur","notes":"Mulai Istirahat Malam.","isBreak":false,"id":"wd-27"}
];

export const saturdaySchedule: ScheduleItem[] = [
  {"start":"00:00","end":"05:00","duration":300,"activity":"Waktunya Tidur","notes":"Istirahat Malam.","isBreak":false,"id":"sat-0","excludedDays":[3,4,1,5,2,0]},
  {"start":"05:00","end":"05:20","duration":20,"activity":"Ibadah Subuh","notes":"Fokus Ibadah.","isBreak":false,"id":"sat-1","excludedDays":[3,4,1,5,0,2]},
  {"start":"05:20","end":"06:15","duration":55,"activity":"Tidur Lanjut","notes":"Istirahat Tahap 2.","isBreak":false,"id":"sat-2","excludedDays":[4,2,5,0,3,1]},
  {"start":"06:15","end":"07:00","duration":45,"activity":"Sarapan & Mandi","notes":"Makan pagi dan mandi.","isBreak":false,"id":"sat-3","excludedDays":[3,4,1,2,0,5]},
  {"start":"07:00","end":"07:50","duration":50,"activity":"Perjalanan Kerja","notes":"Berangkat kerja.","isBreak":false,"id":"sat-4","excludedDays":[3,4,1,2,5,0]},
  {"start":"07:50","end":"13:30","duration":340,"activity":"Kerja Formal","notes":"Fokus kerja (setengah hari).","isBreak":false,"id":"sat-5","excludedDays":[2,5,4,1,0,3]},
  {"start":"13:30","end":"13:40","duration":10,"activity":"Jeda","notes":"Istirahat sejenak.","isBreak":true,"id":"sat-6","excludedDays":[3,1,2,5,4,0]},
  {"start":"13:40","end":"14:40","duration":60,"activity":"Cuci Baju & Mandi","notes":"Tugas harian.","isBreak":false,"id":"sat-7","excludedDays":[1,2,4,5,3,0]},
  {"start":"14:40","end":"15:30","duration":50,"activity":"Santai + Ashar","notes":"Relaksasi.","isBreak":false,"id":"sat-8","excludedDays":[3,4,1,2,5,0]},
  {"start":"15:30","end":"16:00","duration":30,"activity":"MICROSTOCK","notes":"Review / upload asset.","isBreak":false,"id":"sat-9","excludedDays":[2,5,1,4,3,0]},
  {"start":"16:00","end":"16:10","duration":10,"activity":"Jeda","notes":"Istirahat.","isBreak":true,"id":"sat-10"},
  {"start":"16:10","end":"16:30","duration":20,"activity":"MICROSTOCK ","notes":"Tugas online.","isBreak":false,"id":"sat-11","excludedDays":[3,1,2,4,5,0]},
  {"start":"16:30","end":"16:40","duration":10,"activity":"Jeda","notes":"Persiapan akhir pekan.","isBreak":true,"id":"sat-12","excludedDays":[2,5,1,4,3,0]},
  {"activity":"SCALEVCUAN/FASTRACK","duration":25,"end":"17:00","excludedDays":[3,5,2,1,4,0],"id":"sat-13","isBreak":false,"notes":"Tiba di rumah.","start":"16:35"},
  {"activity":"SCALEVCUAN/FASTRACK","duration":25,"end":"17:00","excludedDays":[3,5,2,1,4,0],"id":"sun-21","isBreak":false,"notes":"Tiba di rumah.","start":"16:35"},
  {"start":"17:00","end":"17:25","duration":25,"activity":"Masak & Mandi","notes":"Kebersihan dan persiapan energi.","isBreak":false,"id":"sat-14","excludedDays":[1,3,4,2,5,0]},
  {"start":"17:25","end":"17:50","duration":25,"activity":"Rekap Finansial","notes":"Catat pengeluaran & cek portofolio harian.","isBreak":false,"id":"sat-15","excludedDays":[2,5,4,1,3,0]},
  {"start":"17:50","end":"18:10","duration":20,"activity":"Ibadah Maghrib","notes":"Durasi 20 Menit.","isBreak":false,"id":"sat-16","excludedDays":[2,5,4,1,0,3]},
  {"start":"18:10","end":"18:35","duration":25,"activity":"Airdrop Session","notes":"Sesi rutin harian (check-in/daily tasks).","isBreak":false,"id":"sat-17","excludedDays":[3,1,2,5,4,0]},
  {"start":"18:35","end":"18:50","duration":15,"activity":"Jeda Makan Malam","notes":"Waktu untuk makan malam (15 Menit).","isBreak":true,"id":"sat-18","excludedDays":[3,4,5,0,2,1]},
  {"start":"18:50","end":"19:00","duration":10,"activity":"Ibadah Isya","notes":"Fokus ibadah (10 menit).","isBreak":false,"id":"sat-19","excludedDays":[3,1,2,5,0,4]},
  {"start":"19:00","end":"19:50","duration":50,"activity":"CONTENT MARKETING ","notes":"Fokus Belajar Intensif (50 Menit).","isBreak":false,"id":"sat-20","excludedDays":[4,5,1,2,3,0]},
  {"start":"19:50","end":"20:00","duration":10,"activity":"Jeda Istirahat","notes":"Minum air putih & jalan.","isBreak":true,"id":"sat-21","excludedDays":[3,1,2,5,4,0]},
  {"start":"20:00","end":"20:30","duration":30,"activity":"Programming Basic","notes":"Penguatan logika/fondasi koding (30 Menit).","isBreak":false,"id":"sat-22","excludedDays":[2,5,4,1,3,0]},
  {"start":"20:30","end":"20:40","duration":10,"activity":"Jeda Istirahat","notes":"Penyegaran mental.","isBreak":true,"id":"sat-23","excludedDays":[3,1,2,5,4,0]},
  {"start":"20:40","end":"21:10","duration":30,"activity":"VIBE:ORDERHUB","notes":"Koding santai/flow state (30 Menit).","isBreak":false,"id":"sat-24","excludedDays":[2,5,3,1,4,0]},
  {"start":"21:10","end":"21:20","duration":10,"activity":"Jeda Istirahat","notes":"Relaksasi sejenak.","isBreak":true,"id":"sat-25","excludedDays":[4,2,1,5,3,0]},
  {"start":"21:20","end":"21:50","duration":30,"activity":"JARGONFX","notes":"Sesi eksplorasi bebas (30 Menit).","isBreak":false,"id":"sat-26","excludedDays":[3,1,2,4,5,0]},
  {"start":"21:50","end":"22:20","duration":30,"activity":"Kursus Desain","notes":"Fokus Desain (30 Menit).","isBreak":false,"id":"sat-27","excludedDays":[2,4,3,1,5,0]},
  {"start":"22:20","end":"22:30","duration":10,"activity":"Jeda Istirahat","notes":"Relaksasi mata.","isBreak":true,"id":"sat-28","excludedDays":[2,5,4,1,3,0]},
  {"start":"22:30","end":"22:50","duration":20,"activity":"CLIPPER/YouTube/FB Pro","notes":"Editing video (20 Menit).","isBreak":false,"id":"sat-29","excludedDays":[2,5,4,1,3,0]},
  {"start":"22:50","end":"23:10","duration":20,"activity":"Jeda Istirahat + Masak","notes":"Persiapan bekal.","isBreak":true,"id":"sat-30","excludedDays":[3,1,2,5,4,0]},
  {"start":"23:10","end":"23:30","duration":20,"activity":"Job Reward Recehan","notes":"Fokus tugas mikro (20 Menit).","isBreak":false,"id":"sat-31","excludedDays":[2,5,4,3,1,0]},
  {"start":"23:30","end":"23:50","duration":20,"activity":"Wind Down","notes":"Persiapan tidur malam.","isBreak":false,"id":"sat-32","excludedDays":[3,1,2,5,4,0]},
  {"start":"23:50","end":"00:00","duration":10,"activity":"Jam Santai","notes":"Malam minggu santai.","isBreak":false,"id":"sat-33","excludedDays":[2,5,4,3,1,0]}
];

export const sundaySchedule: ScheduleItem[] = [
  {"start":"00:00","end":"01:00","duration":60,"activity":"Jam Santai","notes":"Waktu luang.","isBreak":false,"id":"sun-0"},
  {"activity":"Stop & Persiapan Tidur","duration":15,"end":"01:15","excludedDays":[4,5,1,2,3,6],"id":"sun-1","isBreak":false,"notes":"Wind down.","start":"01:00"},
  {"activity":"Tidur Dini Hari","duration":225,"end":"05:00","excludedDays":[5,4,6,1,2,3],"id":"sun-2","isBreak":true,"notes":"Istirahat malam.","start":"01:15"},
  {"start":"05:00","end":"05:20","duration":20,"activity":"Ibadah Subuh","notes":"Fokus Ibadah.","isBreak":false,"id":"sun-3"},
  {"start":"05:20","end":"08:30","duration":190,"activity":"Lanjut Tidur","notes":"Istirahat akhir pekan.","isBreak":false,"id":"sun-4"},
  {"activity":"UPGRADE SKILL/CARI PELUANG INCOME DAILY","duration":30,"end":"08:30","excludedDays":[4,1,2,5,3,6],"id":"custom-1782606023554","isBreak":false,"notes":"Upgrade skill software/Bahasa Inggris/Income Real Time","start":"08:00"},
  {"activity":"Jam Santai Pagi | OPSI N8N","duration":40,"end":"09:10","excludedDays":[5,2,1,4,3,6],"id":"sun-5","isBreak":false,"notes":"Santai pagi. jika tidak keluar kursus N8N","start":"08:30"},
  {"activity":"Cuci & Service Motor","duration":40,"end":"09:50","excludedDays":[5,2,1,4,3,6],"id":"sun-6","isBreak":false,"notes":"Cuci Motor / gunakan waktu untuk cuci baju/ TASK PRODUKTIF ","start":"09:10"},
  {"activity":"Jeda","duration":10,"end":"10:00","excludedDays":[5,2,1,4,3,6],"id":"sun-7","isBreak":true,"notes":"Istirahat.","start":"09:50"},
  {"activity":"NOTION TEMPLATE CREATOR ","duration":50,"end":"10:50","excludedDays":[1,4,2,5,3,6],"id":"sun-8","isBreak":false,"notes":"Fokus build NOTION TEMPLATE ","start":"10:00"},
  {"activity":"Jeda","duration":10,"end":"11:00","excludedDays":[5,2,1,4,3,6],"id":"sun-9","isBreak":true,"notes":"Istirahat.","start":"10:50"},
  {"activity":"Posting Etalase/Jargonpayment /AIRDROP","duration":20,"end":"11:20","excludedDays":[2,1,5,4,3,6],"id":"sun-10","isBreak":false,"notes":"Update. cari airdrop ","start":"11:00"},
  {"activity":"Istirahat & Dzuhur","duration":70,"end":"12:30","excludedDays":[5,2,6,3,4,1],"id":"sun-11","isBreak":true,"notes":"Makan dan santai.","start":"11:20"},
  {"activity":"VIBE: JARGONPDF","duration":40,"end":"13:10","excludedDays":[5,4,2,1,3,6],"id":"sun-12","isBreak":false,"notes":"Latihan coding/VIBE JARGONPDF","start":"12:30"},
  {"activity":"DEVOPS CLOUD ENGINEER ","duration":20,"end":"13:30","excludedDays":[5,4,2,1,3,6],"id":"sun-13","isBreak":false,"notes":"Belajar dan setup cloud engineer. python dll","start":"13:10"},
  {"start":"13:30","end":"13:40","duration":10,"activity":"Jeda","notes":"Istirahat.","isBreak":true,"id":"sun-14"},
  {"start":"13:40","end":"14:40","duration":60,"activity":"DevOps Session","notes":"Belajar dan setup.","isBreak":false,"id":"sun-15"},
  {"start":"14:40","end":"15:30","duration":50,"activity":"Istirahat & Ashar","notes":"Istirahat sore.","isBreak":true,"id":"sun-16"},
  {"start":"15:30","end":"16:00","duration":30,"activity":"YouTube / FBRPO","notes":"Manajemen konten.","isBreak":false,"id":"sun-17"},
  {"activity":"Jeda","duration":10,"end":"16:10","excludedDays":[5,4,2,1,3,6],"id":"sun-18","isBreak":true,"notes":"Istirahat.","start":"16:00"},
  {"start":"16:10","end":"16:30","duration":20,"activity":"Airdrop Minggu","notes":"Cek tugas akhir pekan.","isBreak":false,"id":"sun-19"},
  {"start":"16:30","end":"16:40","duration":10,"activity":"Jeda","notes":"Persiapan akhir pekan.","isBreak":true,"id":"sun-20"},
  {"start":"17:00","end":"17:25","duration":25,"activity":"Masak & Mandi","notes":"Kebersihan dan persiapan energi.","isBreak":false,"id":"sun-22"},
  {"start":"17:25","end":"17:50","duration":25,"activity":"Rekap Finansial","notes":"Catat pengeluaran & cek portofolio harian.","isBreak":false,"id":"sun-23"},
  {"start":"17:50","end":"18:10","duration":20,"activity":"Ibadah Maghrib","notes":"Durasi 20 Menit.","isBreak":false,"id":"sun-24"},
  {"start":"18:10","end":"18:35","duration":25,"activity":"Airdrop Session","notes":"Sesi rutin harian (check-in/daily tasks).","isBreak":false,"id":"sun-25"},
  {"start":"18:35","end":"18:50","duration":15,"activity":"Jeda Makan Malam","notes":"Waktu untuk makan malam (15 Menit).","isBreak":true,"id":"sun-26"},
  {"start":"18:50","end":"19:00","duration":10,"activity":"Ibadah Isya","notes":"Fokus ibadah (10 menit).","isBreak":false,"id":"sun-27"},
  {"start":"19:00","end":"19:50","duration":50,"activity":"Kursus Marketing","notes":"Fokus Belajar Intensif (50 Menit).","isBreak":false,"id":"sun-28"},
  {"start":"19:50","end":"20:00","duration":10,"activity":"Jeda Istirahat","notes":"Minum air putih & jalan.","isBreak":true,"id":"sun-29"},
  {"start":"20:00","end":"20:30","duration":30,"activity":"Programming Basic","notes":"Penguatan logika/fondasi koding (30 Menit).","isBreak":false,"id":"sun-30"},
  {"start":"20:30","end":"20:40","duration":10,"activity":"Jeda Istirahat","notes":"Penyegaran mental.","isBreak":true,"id":"sun-31"},
  {"start":"20:40","end":"21:10","duration":30,"activity":"Vibecoding","notes":"Koding santai/flow state (30 Menit).","isBreak":false,"id":"sun-32"},
  {"start":"21:10","end":"21:20","duration":10,"activity":"Jeda Istirahat","notes":"Relaksasi sejenak sebelum eksperimen.","isBreak":true,"id":"sun-33"},
  {"start":"21:20","end":"21:50","duration":30,"activity":"Eksperimen","notes":"Sesi eksplorasi bebas (30 Menit).","isBreak":false,"id":"sun-34"},
  {"start":"21:50","end":"22:20","duration":30,"activity":"Kursus Desain","notes":"Fokus Desain (30 Menit).","isBreak":false,"id":"sun-35"},
  {"start":"22:20","end":"22:30","duration":10,"activity":"Jeda Istirahat","notes":"Relaksasi mata.","isBreak":true,"id":"sun-36"},
  {"start":"22:30","end":"22:50","duration":20,"activity":"YouTube Short Production","notes":"Editing video (20 Menit).","isBreak":false,"id":"sun-37"},
  {"start":"22:50","end":"23:10","duration":20,"activity":"Jeda Istirahat + Masak","notes":"Persiapan bekal.","isBreak":true,"id":"sun-38"},
  {"start":"23:10","end":"23:30","duration":20,"activity":"Job Reward Recehan","notes":"Fokus tugas mikro (20 Menit).","isBreak":false,"id":"sun-39"},
  {"start":"23:30","end":"23:50","duration":20,"activity":"Wind Down","notes":"Persiapan tidur malam.","isBreak":false,"id":"sun-40"},
  {"start":"23:50","end":"00:00","duration":10,"activity":"Waktunya Tidur","notes":"Mulai Istirahat Malam.","isBreak":false,"id":"sun-41"}
];

export const getScheduleForDate = (date: Date): ScheduleItem[] => {
  const day = date.getDay(); // 0 is Sunday, 6 is Saturday
  if (day === 0) return sundaySchedule;
  if (day === 6) return saturdaySchedule;
  return weekdaySchedule;
};

// Deprecated fallback for compatibility if someone still uses it, but prefer getScheduleForDate
export const scheduleData: ScheduleItem[] = weekdaySchedule;


