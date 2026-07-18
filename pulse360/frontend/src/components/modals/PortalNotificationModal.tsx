import { Check, Info } from 'lucide-react';

export function PortalNotificationModal({ notification, onDismiss }: { notification: { title: string; message: string; type: 'success' | 'info' | 'warning' }; onDismiss: () => void }) {
  return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn font-sans">
          <div className="bg-[#fcfaf2] border-2 border-earth-sage/40 rounded-3xl p-6 shadow-2xl max-w-sm w-full mx-4 text-left flex flex-col gap-4 animate-scaleUp text-earth-cocoa">
            <div className="flex items-start gap-3.5">
              <div className={`p-3 rounded-2xl shrink-0 ${
                notification.type === 'success' 
                  ? 'bg-[#276B2B]/10 text-[#276B2B] border border-[#276B2B]/20' 
                  : 'bg-earth-sage/15 text-earth-clay border border-earth-sage/25'
              }`}>
                {notification.type === 'success' ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Info className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="font-extrabold text-earth-cocoa text-base leading-tight tracking-tight">{notification.title}</h3>
                <p className="text-xs text-earth-cocoa/75 mt-2.5 leading-relaxed">{notification.message}</p>
              </div>
            </div>
            
            <button 
              onClick={onDismiss}
              className="w-full bg-earth-cocoa hover:bg-earth-clay text-earth-bg font-extrabold text-xs py-2.5 rounded-xl transition-all cursor-pointer text-center mt-1 shadow-sm"
            >
              Dismiss
            </button>
          </div>
        </div>
  );
}
