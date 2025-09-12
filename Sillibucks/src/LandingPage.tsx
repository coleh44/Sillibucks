// src/LandingPage.tsx
import React from 'react';
import './LandingPage.css'; // import the CSS file

interface LandingPageProps {
  onSelectRole: (role: 'buttery' | 'im') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onSelectRole }) => {
  return (
    <div className="landing-container">
      <h1 className="title">Sillibucks</h1>
      <p className="prompt">Who are you?</p>
      <div className="button-row">
        <button className="role-button" onClick={() => onSelectRole('buttery')}>
          <span>Buttery Team</span>
        </button>
        <button className="role-button" onClick={() => onSelectRole('im')}>
          <span>IM Secretary</span>
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
