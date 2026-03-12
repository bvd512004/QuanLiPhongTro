import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './app/App.jsx';
// import AuthProvider from './app/providers/AuthProvider.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Tạm thời không dùng AuthProvider để tránh lỗi khi chưa có AuthContext */}
    <App />
  </StrictMode>,
);
