import { ShieldCheck } from 'lucide-react';

export function NavBar(props: any) {
  const { isDark, currentPage, setCurrentPage, setSelectedUser, scrollToConsole } = props;
  return (
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between shadow-sm transition-all duration-300 ${isDark ? 'bg-earth-cocoa/95 border-earth-bg/15 text-earth-bg' : 'bg-[#F7F1DE]/90 border-earth-sage/35 text-earth-cocoa'}`}>
        <div className="flex items-center gap-3">
          <div className={`border p-2 rounded-xl transition-all duration-300 ${isDark ? 'bg-earth-bg/10 border-earth-bg/25 text-earth-sage' : 'bg-earth-sage/20 border-earth-sage/40 text-earth-cocoa'}`}>
            <ShieldCheck className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className={`text-lg font-bold tracking-tight flex items-center gap-2 ${isDark ? 'text-earth-bg' : 'text-earth-cocoa'}`}>
              SubSentry <span className={`text-[10px] border px-1.5 py-0.5 rounded font-bold ${isDark ? 'bg-earth-bg/10 border-earth-bg/25 text-earth-bg' : 'bg-earth-sage/20 border-earth-sage/40 text-earth-cocoa'}`}>v4.0.0</span>
            </h1>
            <p className={`text-[10px] font-semibold ${isDark ? 'text-earth-bg/60' : 'text-earth-cocoa/60'}`}>Smart Subscription & Customer Experience Optimizer</p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider">
          <button 
            onClick={() => {
              setCurrentPage('marketing');
              setSelectedUser(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} 
            className="hover:text-earth-clay text-earth-cocoa/75 transition-colors cursor-pointer font-bold"
          >
            Overview
          </button>
          <button 
            onClick={() => {
              setCurrentPage('marketing');
              setSelectedUser(null);
              setTimeout(() => scrollToConsole(), 100);
            }} 
            className="hover:text-earth-clay text-earth-cocoa/75 transition-colors cursor-pointer font-bold"
          >
            Customer Health Tracker
          </button>
        </nav>

        {/* CTA Launch Buttons */}
        <div className="flex items-center gap-3">
          {currentPage !== 'marketing' && (
            <button 
              onClick={() => {
                setCurrentPage('marketing');
                setSelectedUser(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all duration-200 cursor-pointer ${
                isDark 
                  ? 'bg-earth-bg hover:bg-earth-sage text-earth-cocoa' 
                  : 'bg-earth-cocoa hover:bg-earth-clay text-earth-bg'
              }`}
            >
              Overview
            </button>
          )}
          
          {currentPage !== 'client_console' && (
            <button 
              onClick={() => {
                setCurrentPage('client_console');
                setSelectedUser(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all duration-200 cursor-pointer ${
                isDark 
                  ? 'bg-earth-bg hover:bg-earth-sage text-earth-cocoa' 
                  : 'bg-earth-cocoa hover:bg-earth-clay text-earth-bg'
              }`}
            >
              Dashboard Console
            </button>
          )}

          {currentPage !== 'client_dashboard' && (
            <button 
              onClick={() => {
                setCurrentPage('client_dashboard');
                setSelectedUser(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all duration-200 cursor-pointer ${
                isDark 
                  ? 'bg-earth-bg hover:bg-earth-sage text-earth-cocoa' 
                  : 'bg-earth-cocoa hover:bg-earth-clay text-earth-bg'
              }`}
            >
              Client Dashboard
            </button>
          )}
        </div>
      </header>
  );
}
