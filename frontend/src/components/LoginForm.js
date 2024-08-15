import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from './ErrorMessage';
import LoadingIndicator from './LoadingIndicator';
import './LoginForm.css';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const { email, password } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    console.log('LoginForm: Submitting login form');
    try {
      console.log('LoginForm: Calling login function');
      const result = await login(email, password);
      console.log('LoginForm: Received result from login:', result);
      if (result.success) {
        console.log('LoginForm: Login successful, navigating to dashboard');
        navigate('/dashboard');
      } else {
        console.log('LoginForm: Login failed, setting error');
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('LoginForm: Caught error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      console.log('LoginForm: Setting isLoading to false');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="login-form">
      {error && <ErrorMessage message={error} />}
      <div className="input-group">
        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          placeholder="Enter your email"
          name="email"
          value={email}
          onChange={onChange}
          required
          disabled={isLoading}
        />
      </div>
      <div className="input-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          placeholder="Enter your password"
          name="password"
          value={password}
          onChange={onChange}
          minLength="6"
          required
          disabled={isLoading}
        />
      </div>
      <button type="submit" disabled={isLoading} className="login-button">
        {isLoading ? <LoadingIndicator /> : 'Login'}
      </button>
    </form>
  );
};

export default LoginForm;