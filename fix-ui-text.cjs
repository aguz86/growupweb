const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
    'Alokasi Waktu (Minggu Ini)',
    'Alokasi Waktu'
);

code = code.replace(
    /                  <p className="text-sm text-gray-500">\s*Mulai Senin hingga Hari Ini.\s*<\/p>/g,
    ''
);

fs.writeFileSync('src/App.tsx', code);
console.log('Fixed UI text');
