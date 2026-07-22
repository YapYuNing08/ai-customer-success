import { Home, LayoutDashboard, UserCheck } from 'lucide-react';

export function NavBar(props: any) {
  const { isDark, currentPage, setCurrentPage, setSelectedUser } = props;

  const tabs = [
    { id: 'marketing', label: 'Overview', icon: Home },
    { id: 'client_console', label: 'CSM Dashboard', icon: LayoutDashboard },
    { id: 'client_dashboard', label: 'Customer UI', icon: UserCheck },
  ];

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md border-b px-4 sm:px-6 py-3 flex items-center justify-between gap-2 shadow-sm transition-all duration-300 ${isDark ? 'bg-earth-cocoa/95 border-earth-bg/15 text-earth-bg' : 'bg-[#F7F1DE]/95 border-earth-sage/35 text-earth-cocoa'}`}>
      {/* Brand logo & title */}
      <div
        onClick={() => {
          setCurrentPage('marketing');
          setSelectedUser(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className="flex items-center gap-2 sm:gap-3 cursor-pointer group min-w-0"
      >
        <img src="/falcon-icon.png" alt="Falcon360 logo" className="w-8 h-8 sm:w-9 sm:h-9 object-contain group-hover:scale-105 transition-transform shrink-0" />
        <div className="text-left min-w-0">
          <h1 className={`text-sm sm:text-base font-extrabold tracking-tight flex items-center gap-2 font-serif ${isDark ? 'text-earth-bg' : 'text-earth-cocoa'}`}>
            Falcon360
          </h1>
          <p className={`hidden sm:block text-[10.5px] font-medium ${isDark ? 'text-earth-bg/60' : 'text-earth-cocoa/65'}`}>
            Smart Subscription & Customer Experience Optimizer
          </p>
        </div>
      </div>

      {/* Modern 3-Way Segmented Control Switcher */}
      <div className={`p-1 rounded-xl flex items-center gap-1 border shadow-inner transition-all shrink-0 ${
        isDark ? 'bg-earth-bg/10 border-earth-bg/20' : 'bg-earth-sage/20 border-earth-sage/35'
      }`}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentPage === tab.id || (tab.id === 'client_console' && currentPage === 'insight');
          
          return (
            <button
              key={tab.id}
              onClick={() => {
                setCurrentPage(tab.id);
                if (tab.id !== 'insight') {
                  setSelectedUser(null);
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              title={tab.label}
              aria-label={tab.label}
              className={`flex items-center gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                isActive
                  ? isDark
                    ? 'bg-earth-bg text-earth-cocoa shadow-md font-extrabold scale-[1.02]'
                    : 'bg-earth-cocoa text-earth-bg shadow-md font-extrabold scale-[1.02]'
                  : isDark
                    ? 'text-earth-bg/70 hover:text-earth-bg hover:bg-earth-bg/10'
                    : 'text-earth-cocoa/75 hover:text-earth-cocoa hover:bg-earth-cocoa/10'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? (isDark ? 'text-earth-cocoa' : 'text-earth-bg') : 'opacity-70'}`} />
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
