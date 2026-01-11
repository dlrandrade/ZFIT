

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');

if (container) {
  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    // Fix: Accessing 'react_mounted' on window via type assertion to any to resolve TypeScript property missing error
    (window as any).react_mounted = true;
    console.log("ZFIT: Core montado com sucesso.");
  } catch (error) {
    console.error("ZFIT: Falha ao renderizar App:", error);
  }
}