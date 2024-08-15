import React from 'react';
import '../styles/LoadingIndicator.css'; 

const LoadingIndicator = ({ overlay }) => {
  return (
    <div className={`loading-indicator ${overlay ? 'overlay' : ''}`}>
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  );
};

export default LoadingIndicator;