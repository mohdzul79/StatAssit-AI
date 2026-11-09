import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

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
