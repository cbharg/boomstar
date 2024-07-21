import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../services/api';
import ErrorMessage from './ErrorMessage';
import LoadingIndicator from './LoadingIndicator';
import '../styles/Playlist.css';

const PlaylistList = ({ setCurrentTrack }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPlaylists = async () => {
    try {
      const data = await apiService.getUserPlaylists();
      setPlaylists(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch playlists. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const handlePlayFirstSong = async (playlistId) => {
    try {
      const playlist = await apiService.getPlaylist(playlistId);
      if (playlist.songs && playlist.songs.length > 0) {
        setCurrentTrack(playlist.songs[0]);
      }
    } catch (err) {
      console.error('Failed to play first song:', err);
      setError('Failed to play the first song. Please try again.');
    }
  };

  if (loading) return <LoadingIndicator />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="playlist-container">
      <h2 className="playlist-header">Your Playlists</h2>
      {playlists.length === 0 ? (
        <p className="empty-playlist-message">You haven't created any playlists yet.</p>
      ) : (
        <ul className="playlist-list">
          {playlists.map(playlist => (
            <li key={playlist._id} className="playlist-item">
              <Link to={`/playlist/${playlist._id}`} className="playlist-link">{playlist.name}</Link>
              <button onClick={() => handlePlayFirstSong(playlist._id)}>Play First Song</button>
              <Link to={`/playlist/${playlist._id}`} className="edit-button">View/Edit</Link>
            </li>
          ))}
        </ul>
      )}
      <Link to="/create-playlist" className="create-playlist-button">Create New Playlist</Link>
    </div>
  );
};

export default PlaylistList;