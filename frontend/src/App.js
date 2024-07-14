import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import RegistrationForm from './components/RegistrationForm';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import PlaylistList from './components/PlaylistList';
import PlaylistForm from './components/PlaylistForm';
import PlaylistDetail from './components/PlaylistDetail';
import MusicPlayer from './components/MusicPlayer';
import './styles/Playlist.css'

function App() {
  const [currentTrack, setCurrentTrack] = useState(null);

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <h1>Fanrise Music Platform</h1>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<RegistrationForm />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/playlists" element={<PlaylistList setCurrentTrack={setCurrentTrack} />} />
            <Route path="/create-playlist" element={<PlaylistForm />} />
            <Route path="/playlist/:id" element={<PlaylistDetail setCurrentTrack={setCurrentTrack} />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              {/* Add more protected routes here as needed */}
            </Route>
          </Routes>
          {currentTrack && <MusicPlayer track={currentTrack} />}
        </div>
      </Router>
    </AuthProvider>
  );
}

function Home() {
  return (
    <div>
      <h2>Welcome to Fanrise</h2>
      <nav>
        <ul>
          <li><a href="/register">Register</a></li>
          <li><a href="/login">Login</a></li>
          <li><a href="/dashboard">Dashboard</a></li>
        </ul>
      </nav>
    </div>
  );
}

export default App;