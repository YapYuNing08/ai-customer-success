
export function ModelAnalyticsModal({ onClose }: { onClose: () => void }) {
  return (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300"
          onClick={onClose}
        >
          <div 
            className="bg-[#4E220F] border border-earth-sage/30 rounded-3xl max-w-4xl w-full p-6 text-left relative shadow-2xl flex flex-col gap-4 animate-scaleUp max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-earth-sage/20 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-earth-sage tracking-wider">Behind the Scenes</span>
                <h2 className="text-lg font-bold text-earth-bg mt-0.5">How Accurate Are Our Predictions?</h2>
              </div>
              <button 
                onClick={onClose}
                className="text-earth-bg/60 hover:text-earth-bg text-sm font-bold cursor-pointer bg-earth-bg/5 hover:bg-earth-bg/10 px-3 py-1.5 rounded-xl transition-all"
              >
                Close
              </button>
            </div>

            {/* Model Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
              <div className="bg-earth-bg/5 border border-earth-sage/15 p-4 rounded-2xl">
                <span className="text-[9px] font-bold text-earth-sage/75 block">LEARNED FROM</span>
                <span className="text-base font-extrabold text-earth-bg mt-1 block">7,043 Real Customers</span>
                <span className="text-[10px] text-earth-bg/50 mt-0.5 block">Real subscription histories, incl. who left and why</span>
              </div>
              <div className="bg-earth-bg/5 border border-earth-sage/15 p-4 rounded-2xl">
                <span className="text-[9px] font-bold text-earth-sage/75 block">HOW IT PREDICTS</span>
                <span className="text-base font-extrabold text-earth-bg mt-1 block">Pattern Recognition</span>
                <span className="text-[10px] text-earth-bg/50 mt-0.5 block">AI that learns from past customer behavior</span>
              </div>
              <div className="bg-earth-bg/5 border border-earth-sage/15 p-4 rounded-2xl">
                <span className="text-[9px] font-bold text-earth-sage/75 block">PREDICTION QUALITY</span>
                <span className="text-base font-extrabold text-earth-sage mt-1 block">83 / 100</span>
                <span className="text-[10px] text-earth-bg/50 mt-0.5 block">Reliably tells at-risk customers apart from loyal ones</span>
              </div>
              <div className="bg-earth-bg/5 border border-earth-sage/15 p-4 rounded-2xl">
                <span className="text-[9px] font-bold text-earth-sage/75 block">OVERALL ACCURACY</span>
                <span className="text-base font-extrabold text-earth-bg mt-1 block">80.5%</span>
                <span className="text-[10px] text-earth-bg/50 mt-0.5 block">Right about 8 out of 10 customers it has never seen</span>
              </div>
            </div>

            {/* Plot Evaluation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {/* Confusion Matrix Card */}
              <div className="bg-earth-bg/5 border border-earth-sage/15 p-5 rounded-2xl flex flex-col gap-3">
                <h4 className="text-xs font-bold text-earth-bg uppercase tracking-wider">Predictions vs. What Really Happened</h4>
                <img src="/confusion_matrix.png" alt="Chart comparing predictions with real outcomes" className="w-full h-auto rounded-xl border border-earth-sage/20 object-cover bg-white" />
                <p className="text-[10px] text-earth-bg/60 leading-normal">
                  <strong>What this means</strong>: We tested the system on 1,359 customers it had never seen. It correctly flagged <strong>168 customers who really did leave</strong> and correctly cleared <strong>968 who stayed</strong> — so your team gets real warnings, not constant false alarms.
                </p>
              </div>

              {/* ROC Curve Card */}
              <div className="bg-earth-bg/5 border border-earth-sage/15 p-5 rounded-2xl flex flex-col gap-3">
                <h4 className="text-xs font-bold text-earth-bg uppercase tracking-wider">Telling At-Risk From Loyal Customers</h4>
                <img src="/roc_auc_curve.png" alt="Chart showing how well the system separates at-risk customers from loyal ones" className="w-full h-auto rounded-xl border border-earth-sage/20 object-cover bg-white" />
                <p className="text-[10px] text-earth-bg/60 leading-normal">
                  <strong>What this means</strong>: This chart measures how well SubSentry separates customers likely to leave from loyal ones. It scores <strong>83 out of 100</strong> — well above chance (50) — so the risk scores you see are dependable at any customer volume.
                </p>
              </div>
            </div>
          </div>
        </div>
  );
}
