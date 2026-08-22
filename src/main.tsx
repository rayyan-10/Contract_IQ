import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from '@/context/AuthContext';
import { AppProvider } from '@/context/AppContext';
import { PredictionProvider } from '@/context/PredictionContext';
import { AppRouter } from '@/routes/AppRouter';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <AppProvider>
        <PredictionProvider>
          <AppRouter />
        </PredictionProvider>
      </AppProvider>
    </AuthProvider>
  </React.StrictMode>
);
