import React from 'react';
import { render, fireEvent, waitFor, screen, act } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import RegistrationForm from '../components/RegistrationForm';
import apiService from '../services/api';

// Mock the api service
jest.mock('../services/api', () => ({
  register: jest.fn(),
  isAuthenticated: jest.fn(),
  login: jest.fn(),
  getUserData: jest.fn(),
}));

// Mock the useNavigate hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

const renderRegistrationForm = () => {
  return render(
    <Router>
      <AuthProvider>
        <RegistrationForm />
      </AuthProvider>
    </Router>
  );
};

describe('RegistrationForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders registration form', () => {
    renderRegistrationForm();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /register/i})).toBeInTheDocument();
  });

  test('shows error when passwords do not match', async () => {
    renderRegistrationForm();
    
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'DifferentPassword123!' } });
    fireEvent.click(screen.getByRole('button', {name: /register/i}));

    await waitFor(() => {
      expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument();
    });
  });

  test('shows error for weak password', async () => {
    renderRegistrationForm();
    
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'weak' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'weak' } });
    fireEvent.click(screen.getByRole('button', {name: /register/i}));

    await waitFor(() => {
      expect(screen.getByText(/Password must be at least 8 characters long/i)).toBeInTheDocument();
    });
  });

  test('calls api.register with correct data on valid submission', async () => {
    renderRegistrationForm();
    
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'StrongPass1!' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'StrongPass1!' } });
    
    apiService.register.mockResolvedValueOnce({ user: { username: 'testuser' }, token: 'fake-token' });
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: /register/i}));
    });

    await waitFor(() => {
      expect(apiService.register).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'StrongPass1!'
      });
    });
  });

  test('displays error message on registration failure', async () => {
    renderRegistrationForm();
    
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'StrongPass1!' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'StrongPass1!' } });
    
    const errorMessage = 'Registration failed. Please try again.';
    apiService.register.mockRejectedValueOnce({response: { status: 500 } });
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: /register/i}));
    });

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('handles server error with specific message', async () => {
    renderRegistrationForm();
    
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'StrongPass1!' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'StrongPass1!' } });
    
    const errorMessage = 'Username already exists';
    apiService.register.mockRejectedValueOnce({ response: { status: 409, data: { message: errorMessage } } });
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: /register/i}));
    });

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('handles network error', async () => {
    renderRegistrationForm();
    
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'StrongPass1!' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'StrongPass1!' } });
    
    const errorMessage = 'No response from server. Please check your internet connection and try again.';
    apiService.register.mockRejectedValueOnce({ request: {} });
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: /register/i}));
    });

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });


  test('successful registration redirects user', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);

    renderRegistrationForm();
    
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'StrongPass1!' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'StrongPass1!' } });
    
    apiService.register.mockResolvedValueOnce({ user: { username: 'testuser' }, token: 'fake-token' });
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: /register/i}));
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
});