// FIX: Changed React import to namespace import `* as React` to resolve widespread JSX intrinsic element type errors, which likely stem from a project configuration that requires this import style.
import * as React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// FIX: Moved the global JSX type definition for 'dotlottie-wc' to App.tsx. Declaring it in this entry file was causing React's base JSX types to be overridden.
// This move ensures that React's intrinsic element types are available before the JSX namespace is augmented.

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