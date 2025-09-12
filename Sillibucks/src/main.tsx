// main.tsx
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import LandingPage from './LandingPage';
import SecretaryPage from './SecretaryPage';
import ButteryPage from './ButteryPage';

const App = () => {
  const [role, setRole] = useState<'landing' | 'buttery' | 'im'>('landing');

  if (role === 'im') {
    return <SecretaryPage />;
  }

  if (role === 'buttery') {
    return <ButteryPage/>;
  }

  return <LandingPage onSelectRole={(role) => setRole(role)} />;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
