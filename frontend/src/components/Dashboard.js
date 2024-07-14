import React, { useEffect, useState } from 'react';
import apiService from '../services/api';
import LogoutButton from './LogoutButton';
import PlaylistList from './PlaylistList';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [authTestResult, setAuthTestResult] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await apiService.getUserData();
        setUserData(data);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        setError('Failed to load user data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (apiService.isAuthenticated()) {
      fetchUserData();
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleTestAuth = async () => {
    try {
      const result = await apiService.testAuth();
      setAuthTestResult(result.message);
    } catch (error) {
      setAuthTestResult('Authentication test failed');
      console.error('Authentication test failed:', error);
    }
  };

  if (!apiService.isAuthenticated()) {
    return <div>Please log in to view this page.</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Welcome to your Dashboard</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {userData ? (
        <div>
          <p>Username: {userData.username}</p>
          <p>Email: {userData.email}</p>
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