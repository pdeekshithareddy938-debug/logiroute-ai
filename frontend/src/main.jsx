import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

const container = document.getElementById('root');
if (!window.__reactRoot) {
  window.__reactRoot = ReactDOM.createRoot(container);
}
window.__reactRoot.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
