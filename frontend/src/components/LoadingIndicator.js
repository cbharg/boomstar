import React from 'react';
import '../styles/LoadingIndicator.css'; 

const LoadingIndicator = () => {
  return (
    <div className="loading-indicator">
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  );
};

export default LoadingIndicator; 