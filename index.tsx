// FIX: Changed to default React import to resolve JSX intrinsic element type errors.
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// FIX: Added global type definition for 'dotlottie-wc' custom element here.
// This is the main entry point, ensuring types are augmented correctly.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'dotlottie-wc': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { src: string; autoplay: boolean; loop: boolean; style?: React.CSSProperties }, HTMLElement>;
    }
  }
}

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