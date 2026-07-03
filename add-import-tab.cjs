const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const analyticsTab = `              <span className="xs:hidden">Analisis</span>
            </button>`;

const importTaskTab = `
            <button
              onClick={() => setActiveTab("import-tasks")}
              className={cn(
                "flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 border-b-2 transition-colors font-medium text-xs sm:text-sm rounded-t-lg",
                activeTab === "import-tasks"
                  ? "bg-white border-white text-emerald-700"
                  : "border-transparent text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20",
              )}
            >
              <ArrowDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>Impor Task</span>
            </button>`;

code = code.replace(analyticsTab, analyticsTab + importTaskTab);

fs.writeFileSync('src/App.tsx', code);
console.log('Added Import Task tab');
