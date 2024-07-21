import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import LogoutButton from './LogoutButton';
import PlaylistList from './PlaylistList';
import ErrorMessage from './ErrorMessage';
import LoadingIndicator from './LoadingIndicator';

const Dashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [authTestResult, setAuthTestResult] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated()) {
        try {
          await apiService.getUserData(); // This should update the user in AuthContext
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          setError('Failed to load user data. Please try again later.');
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [isAuthenticated]);

  const handleTestAuth = async () => {
    try {
      const result = await apiService.testAuth();
      setAuthTestResult(result.message);
    } catch (error) {
      setAuthTestResult('Authentication test failed');
      console.error('Authentication test failed:', error);
    }
  };

  if (!isAuthenticated()) {
    return <div>Please log in to view this page.</div>;
  }

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <div>
      <h1>Welcome to your Dashboard</h1>
      {error && <ErrorMessage message={error} />}
      {user ? (
        <div>
          <p>Username: {user.username}</p>
          <p>Email: {user.email}</p>
          {/* Add more user data fields as needed */}
        </div>
      ) : (
        <p>No user data available.</p>
      )}
      <PlaylistList />
      <button onClick={handleTestAuth}>Test Authentication</button>
      {authTestResult && <p>Auth Test Result: {authTestResult}</p>}
      <LogoutButton />
    </div>
  );
};

export default Dashboard;