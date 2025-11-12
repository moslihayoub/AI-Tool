// FIX: Changed React import to default to resolve JSX intrinsic element type errors.
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// FIX: Moved global type definition for 'dotlottie-wc' custom element to types.ts to fix issue with overwritten JSX intrinsic elements.

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);