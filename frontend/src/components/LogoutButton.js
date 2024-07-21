import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from './ErrorMessage';
import LoadingIndicator from './LoadingIndicator';

const LogoutButton = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    setError('');
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      setError('Logout failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleLogout} disabled={isLoading}>
        {isLoading ? <LoadingIndicator /> : 'Logout'}
      </button>
      {error && <ErrorMessage message={error} />}
    </div>
  );
};

export default LogoutButton;