import React, { useEffect, useRef } from 'react';

interface PayPalDonateButtonProps {
  onOpenModal?: () => void;
  className?: string;
}

export const PayPalDonateButton: React.FC<PayPalDonateButtonProps> = ({
  onOpenModal,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Ensure the exact PayPal SDK script requested by the user is loaded
  useEffect(() => {
    const scriptSrc =
      'https://www.paypal.com/sdk/js?client-id=BAA3DIIabyVud-YdLEFug1RxOqO_33HBQKtnFWVJAdzXPkE67mr-M8oHDj0RAvck4iStPJxVfXV_aDmPZM&components=hosted-buttons&disable-funding=venmo&currency=USD';

    let scriptTag = document.querySelector<HTMLScriptElement>(
      `script[src="${scriptSrc}"]`
    );

    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.src = scriptSrc;
      scriptTag.async = true;
      document.body.appendChild(scriptTag);
    }
  }, []);

  const handleLaunchGateway = (e?: React.MouseEvent | React.FormEvent) => {
    // Direct browser navigation to PayPal verified donation checkout
    const paypalGatewayUrl =
      'https://www.paypal.com/donate?business=mohdzul@gmail.com&currency_code=USD&item_name=Support+StatAssist+AI+Research';
    
    try {
      window.open(paypalGatewayUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.warn('Direct popup prevented, relying on form target=_blank', err);
    }

    // Also open modal for donation confirmation & additional options
    if (onOpenModal) {
      onOpenModal();
    }
  };

  return (
    <div className={`inline-flex items-center ${className}`}>
      {/* Hidden hosted-buttons mount point for PayPal SDK runtime */}
      <div ref={containerRef} id="paypal-hosted-button-mount" className="hidden" />

      {/* Official PayPal Donate Form & Secure Payment Gateway Button */}
      <form
        action="https://www.paypal.com/donate"
        method="get"
        target="_blank"
        rel="noopener noreferrer"
        onSubmit={handleLaunchGateway}
        className="inline-flex m-0 p-0"
      >
        <input type="hidden" name="business" value="mohdzul@gmail.com" />
        <input
          type="hidden"
          name="item_name"
          value="Support StatAssist AI Research"
        />
        <input type="hidden" name="currency_code" value="USD" />
        <input type="hidden" name="no_recurring" value="0" />

        <button
          type="submit"
          onClick={handleLaunchGateway}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-[#003087] bg-[#ffc439] hover:bg-[#f3ba30] active:scale-95 rounded-lg shadow-sm hover:shadow-md border border-[#e5a822] transition-all cursor-pointer group animate-pulse hover:animate-none"
          title="Donate with PayPal (USD) — Recipient: mohdzul@gmail.com"
        >
          {/* Official Dual-P PayPal Monogram SVG */}
          <svg
            className="w-4 h-4 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.789.789 0 0 1 .778-.667h7.243c2.47 0 4.316.59 5.344 1.71 1.011 1.103 1.353 2.72 1.018 4.808-.052.32-.12.65-.205.99-.861 3.447-3.175 5.568-6.877 5.568H9.362a.789.789 0 0 0-.778.667l-.837 4.298-.671.243z"
              fill="#0079C1"
            />
            <path
              d="M8.584 15.121l1.458-7.481a.789.789 0 0 1 .778-.667h5.378c1.867 0 3.322.446 4.12 1.28.74.776 1.004 1.942.756 3.486-.689 2.758-2.54 4.455-5.5 4.455h-2.19a.789.789 0 0 0-.778.667l-.844 4.33a.53.53 0 0 1-.523.428H8.061a.53.53 0 0 1-.523-.612l1.046-5.886z"
              fill="#00457C"
            />
          </svg>
          <span>Donate with PayPal</span>
          <span className="text-[10px] bg-[#003087]/15 text-[#003087] font-extrabold px-1.5 py-0.5 rounded uppercase">
            USD
          </span>
        </button>
      </form>
    </div>
  );
};
