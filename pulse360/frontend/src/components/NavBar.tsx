export function NavBar(props: any) {
  const { isDark, currentPage, setCurrentPage, setSelectedUser, scrollToConsole } = props;
  return (
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between shadow-sm transition-all duration-300 ${isDark ? 'bg-earth-cocoa/95 border-earth-bg/15 text-earth-bg' : 'bg-[#F7F1DE]/90 border-earth-sage/35 text-earth-cocoa'}`}>
        <div className="flex items-center gap-3">
          <img src="/falcon-icon.png" alt="Falcon360 logo" className="w-10 h-10 object-contain" />
          <div>
            <h1 className={`text-lg font-bold tracking-tight flex items-center gap-2 ${isDark ? 'text-earth-bg' : 'text-earth-cocoa'}`}>
              Falcon360 
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
              Customer Portal
            </button>
          )}
        </div>
      </header>
  );
}
