import { ShieldAlert } from 'lucide-react';

export function OutageAlertModal({ onClose, onNavigate }: { onClose: () => void; onNavigate: (tab: 'grid' | 'customers') => void }) {
  return (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300 animate-fadeIn"
          onClick={onClose}
        >
          <div 
            className="bg-[#efe9d2] border-2 border-status-critical text-earth-cocoa rounded-3xl max-w-md w-full p-6 text-left relative shadow-2xl flex flex-col gap-4 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning Header Icon */}
            <div className="flex items-center gap-4">
              <div className="bg-status-critical/20 text-status-critical p-3 rounded-full border border-status-critical/30 w-fit animate-pulse">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-extrabold text-status-critical tracking-wider">Falcon360 Incident Injection</span>
                <h2 className="text-lg font-serif font-black text-earth-cocoa mt-0.5">Outage Injected!</h2>
              </div>
            </div>

            {/* Modal Body */}
            <div className="text-xs text-earth-cocoa/80 leading-relaxed border-y border-earth-sage/20 py-4 flex flex-col gap-2">
              <p>
                A simulated regional server outage incident has been successfully injected into your active database.
              </p>
              <div className="bg-earth-bg/40 p-3 rounded-xl border border-earth-sage/15 flex flex-col gap-1.5 mt-1">
                <div className="flex justify-between font-bold">
                  <span>Injected Incident:</span>
                  <span className="text-status-critical font-extrabold">US-West Node latency spike</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Impacted Accounts:</span>
                  <span className="text-earth-clay font-extrabold">Northwind, Summit, Singapore Tech</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Simulation Status:</span>
                  <span className="text-status-risk font-extrabold animate-pulse">Real-time Churn Calculation Active</span>
                </div>
              </div>
              <p className="text-[10px] text-earth-cocoa/65 italic mt-1 leading-normal">
                Check the Customer Health Grid and check the Customers Directory list to view AI-powered rescue plan updates.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 justify-end mt-2">
              <button 
                onClick={() => onNavigate('grid')}
                className="px-4 py-2.5 bg-[#e4ddc3] hover:bg-[#d8cfb3] text-earth-cocoa font-bold text-xs rounded-xl transition-all cursor-pointer border border-earth-sage/20"
              >
                Go to Grid
              </button>
              
              <button 
                onClick={() => onNavigate('customers')}
                className="px-4 py-2.5 bg-earth-cocoa hover:bg-earth-clay text-earth-bg font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md"
              >
                Investigate Customers
              </button>
            </div>
          </div>
        </div>
  );
}
