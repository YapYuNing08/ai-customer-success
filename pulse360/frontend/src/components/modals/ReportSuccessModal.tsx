import { ShieldCheck, Download } from 'lucide-react';
import { downloadReport } from '../../utils/reports';

export function ReportSuccessModal({ data, onClose }: { data: any; onClose: () => void }) {
  return (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300 animate-fadeIn"
          onClick={onClose}
        >
          <div 
            className="bg-[#efe9d2] border-2 border-earth-sage text-earth-cocoa rounded-3xl max-w-md w-full p-6 text-left relative shadow-2xl flex flex-col gap-4 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Success Header Icon */}
            <div className="flex items-center gap-4">
              <div className="bg-status-healthy/20 text-status-healthy p-3 rounded-full border border-status-healthy/30 w-fit">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-extrabold text-earth-clay tracking-wider">Falcon360 Success Engine</span>
                <h2 className="text-lg font-serif font-black text-earth-cocoa mt-0.5">Report Generated!</h2>
              </div>
            </div>

            {/* Modal Body */}
            <div className="text-xs text-earth-cocoa/80 leading-relaxed border-y border-earth-sage/20 py-4 flex flex-col gap-2">
              <p>
                A new report has been compiled successfully using live customer success telemetry data.
              </p>
              <div className="bg-earth-bg/40 p-3 rounded-xl border border-earth-sage/15 flex flex-col gap-1.5 mt-1">
                <div className="flex justify-between font-bold">
                  <span>Report Name:</span>
                  <span className="text-earth-clay font-extrabold truncate max-w-[200px]">{data.reportName}</span>
                </div>
                {data.distressedCount > 0 && (
                  <div className="flex justify-between font-bold">
                    <span>At-Risk Customers Audited:</span>
                    <span className="text-status-risk font-extrabold">{data.distressedCount} Accounts</span>
                  </div>
                )}
                <div className="flex justify-between font-bold">
                  <span>Report Status:</span>
                  <span className="text-status-healthy font-extrabold">Ready / Downloadable</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 justify-end mt-2">
              <button 
                onClick={onClose}
                className="px-4 py-2.5 bg-[#e4ddc3] hover:bg-[#d8cfb3] text-earth-cocoa font-bold text-xs rounded-xl transition-all cursor-pointer border border-earth-sage/20"
              >
                Close & View Library
              </button>
              
              <button 
                onClick={() => {
                  if (data.report) downloadReport(data.report);
                  onClose();
                }}
                className="px-4 py-2.5 bg-earth-cocoa hover:bg-earth-clay text-earth-bg font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Report (.md)</span>
              </button>
            </div>
          </div>
        </div>
  );
}
