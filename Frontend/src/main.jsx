import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// ============================================
// CONFIGURACIÓN DE DAYJS
// ============================================
import './config/dayjs';

// ============================================
// CONFIGURACIÓN DE AXIOS
// ============================================
import './config/axios';

// ============================================
// RENDERIZADO DE LA APLICACIÓN
// ============================================
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);