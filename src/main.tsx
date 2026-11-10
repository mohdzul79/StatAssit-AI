import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ensure standard top-of-page view and disable browser restoring middle-of-page offsets
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
}

// Filter third-party telemetry notices from external SDKs (e.g. PayPal)
window.addEventListener('error', (event) => {
  if (
    typeof event.message === 'string' &&
    (event.message.includes('ncps_button_container_missing') || event.message.includes('spb-container'))
  ) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(<App />);
