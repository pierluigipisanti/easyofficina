// Controllo istanza unica
if (localStorage.getItem('appLock')) {
  alert('Un\'istanza dell\'applicazione è già aperta!');
  window.close();
}
localStorage.setItem('appLock', 'true');
const cleanAppLock = () => localStorage.removeItem('appLock');

window.addEventListener('beforeunload', cleanAppLock);
window.addEventListener('pagehide', cleanAppLock);
window.addEventListener('unload', cleanAppLock);

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ColorModeScript } from '@chakra-ui/react';
import './index.css';
import App from './App.jsx';
import theme from './theme';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <App />
  </StrictMode>,
)
