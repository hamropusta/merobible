import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

try {
  const existingFetch = typeof window.fetch === 'function' ? window.fetch.bind(window) : undefined;
  if (existingFetch) {
    let currentFetch = existingFetch;
    Object.defineProperty(window, 'fetch', {
      configurable: true,
      enumerable: true,
      get: () => currentFetch,
      set: (fn) => {
        if (typeof fn === 'function') {
          currentFetch = fn;
        }
      },
    });
  }
} catch {
  // Ignore if property is non-configurable
}

createRoot(document.getElementById('root')!).render(<App />);

