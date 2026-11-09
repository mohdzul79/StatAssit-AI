import React, { useState, useEffect } from 'react';
import { X, Check, Lock, ShieldCheck } from 'lucide-react';

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DonateModal: React.FC<DonateModalProps> = ({ isOpen, onClose }) => {
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setIsSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-[#faf8f5] rounded-3xl shadow-2xl border border-amber-200/50 max-w-md w-full overflow-hidden text-slate-800 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Soft warm golden ambient glow radiating from top */}
        <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-[#f9e1bb]/80 via-[#f9e1bb]/25 to-transparent pointer-events-none" />

        {/* Modal Header */}
        <div className="relative px-6 pt-5 pb-3 flex items-center justify-between">
          <div className="flex items-center">
            {/* Golden Heart Icon */}
            <svg
              className="w-7 h-7 drop-shadow-xs"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                fill="url(#goldHeartGradient)"
              />
              <defs>
                <linearGradient
                  id="goldHeartGradient"
                  x1="2"
                  y1="3"
                  x2="22"
                  y2="21.35"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#f59e0b" />
                  <stop offset="1" stopColor="#d97706" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <h3 className="font-semibold text-lg sm:text-xl text-slate-900 tracking-tight text-center flex-1 px-2">
            Support StatAssist AI
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5 stroke-[2]" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="relative p-6 pt-2 space-y-4">
          {isSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center">
                <Check className="w-7 h-7 stroke-[2.5]" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">
                Thank you for your generous support!
              </h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                Thank you for supporting StatAssist AI via PayPal (<span className="font-mono font-medium text-slate-800">mohdzul@gmail.com</span>). Your contribution helps keep high-precision empirical algorithms universally accessible to scholars and students worldwide.
              </p>
              <div className="pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Return to Workspace
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Primary Action Button & PayPal ID Integration */}
              <div className="pt-1">
                <form
                  action="https://www.paypal.com/donate"
                  method="get"
                  target="_blank"
                  rel="noopener noreferrer"
                  onSubmit={() => {
                    try {
                      window.open('https://www.paypal.com/donate?business=mohdzul@gmail.com&currency_code=USD&item_name=Support+StatAssist+AI+Research', '_blank', 'noopener,noreferrer');
                    } catch (e) {
                      console.warn(e);
                    }
                    setIsSuccess(true);
                  }}
                  className="space-y-3"
                >
                  <input type="hidden" name="business" value="mohdzul@gmail.com" />
                  <input
                    type="hidden"
                    name="item_name"
                    value="Support StatAssist AI Research"
                  />
                  <input type="hidden" name="currency_code" value="USD" />
                  <input type="hidden" name="no_recurring" value="0" />

                  {/* PayPal Verified ID Badge */}
                  <div className="flex items-center justify-between px-3.5 py-2.5 bg-blue-50/80 border border-blue-200/80 rounded-xl text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-md bg-[#003087] text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 shadow-2xs">
                        P
                      </span>
                      <span className="font-semibold text-slate-700 shrink-0">PayPal ID:</span>
                      <span className="font-mono font-bold text-blue-900 truncate">
                        mohdzul@gmail.com
                      </span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">
                        USD
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Verified
                    </span>
                  </div>

                  {/* Secure PayPal Payment Gateway Button */}
                  <button
                    type="submit"
                    onClick={() => {
                      try {
                        window.open('https://www.paypal.com/donate?business=mohdzul@gmail.com&currency_code=USD&item_name=Support+StatAssist+AI+Research', '_blank', 'noopener,noreferrer');
                      } catch (e) {
                        console.warn(e);
                      }
                      setIsSuccess(true);
                    }}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-[#003087] via-[#004bba] to-[#0070ba] hover:from-[#002569] hover:via-[#003e9c] hover:to-[#005ea6] text-white font-semibold text-sm sm:text-base rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-between gap-3 cursor-pointer active:scale-[0.99] border border-blue-400/30 group"
                    title="Proceed through official PayPal Secure Payment gateway (USD)"
                  >
                    <div className="flex items-center gap-2.5">
                      {/* PayPal Monogram Logo */}
                      <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center p-1 backdrop-blur-xs border border-white/20 group-hover:bg-white/25 transition-colors">
                        <svg className="w-5 h-5 text-amber-300 fill-current" viewBox="0 0 24 24">
                          <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.789.789 0 0 1 .778-.667h7.243c2.47 0 4.316.59 5.344 1.71 1.011 1.103 1.353 2.72 1.018 4.808-.052.32-.12.65-.205.99-.861 3.447-3.175 5.568-6.877 5.568H9.362a.789.789 0 0 0-.778.667l-.837 4.298-.671.243z" fill="#0079C1" />
                          <path d="M19.143 8.563c-.052.32-.12.65-.205.99-.861 3.447-3.175 5.568-6.877 5.568H9.362a.789.789 0 0 0-.778.667l-1.393 7.151a.53.53 0 0 1-.523.428H3.32a.53.53 0 0 1-.523-.612L5.13 8.563h14.013z" fill="#00457C" opacity="0.3" />
                          <path d="M8.584 15.121l1.458-7.481a.789.789 0 0 1 .778-.667h5.378c1.867 0 3.322.446 4.12 1.28.74.776 1.004 1.942.756 3.486-.689 2.758-2.54 4.455-5.5 4.455h-2.19a.789.789 0 0 0-.778.667l-.844 4.33a.53.53 0 0 1-.523.428H8.061a.53.53 0 0 1-.523-.612l1.046-5.886z" fill="#0079C1" />
                        </svg>
                      </div>
                      <div className="text-left flex flex-col">
                        <span className="leading-tight font-bold text-white text-sm sm:text-base">
                          PayPal Secure Payment
                        </span>
                        <span className="text-[11px] text-blue-200 font-normal">
                          Official 256-bit SSL Gateway • USD
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 text-white text-xs font-semibold shrink-0 group-hover:bg-white/20 transition-colors">
                      <Lock className="w-3.5 h-3.5 text-amber-300" />
                      <span>Pay Securely</span>
                    </div>
                  </button>

                  {/* Trust & Protection Assurance */}
                  <div className="flex items-center justify-center gap-2 pt-0.5 text-[11px] text-slate-500 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>256-Bit SSL Encrypted • PayPal Buyer Protection</span>
                  </div>
                </form>
              </div>

              {/* DuitNow Section */}
              <div className="text-center pt-1 pb-1">
                <p className="text-xs text-slate-600 font-normal">
                  Or Scan to Pay via DuitNow (MYR):
                </p>

                <div className="flex items-center justify-center gap-3 mt-2.5">
                  {/* Left Corner Scan Bracket */}
                  <div className="w-3.5 h-6 flex flex-col justify-between">
                    <div className="w-2.5 h-2 border-t-2 border-l-2 border-slate-500 rounded-tl-xs" />
                    <div className="w-2.5 h-2 border-b-2 border-l-2 border-slate-500 rounded-bl-xs" />
                  </div>

                  {/* DuitNow QR Image */}
                  <div className="p-0.5 bg-white rounded-md shadow-2xs">
                    <img
                      src="/duitnow_qr.png"
                      alt="Malaysia National QR DuitNow"
                      className="w-20 h-auto object-contain rounded-xs"
                    />
                  </div>

                  {/* Right Corner Scan Bracket */}
                  <div className="w-3.5 h-6 flex flex-col justify-between items-end">
                    <div className="w-2.5 h-2 border-t-2 border-r-2 border-slate-500 rounded-tr-xs" />
                    <div className="w-2.5 h-2 border-b-2 border-r-2 border-slate-500 rounded-br-xs" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

