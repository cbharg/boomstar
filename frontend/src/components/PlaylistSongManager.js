import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import ErrorMessage from './ErrorMessage';
import LoadingIndicator from './LoadingIndicator';

const PlaylistSongManager = ({ playlistId }) => {
  const [songs, setSongs] = useState([]);
  const [playlistSongs, setPlaylistSongs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [playlistId]);

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [allSongs, playlist] = await Promise.all([
        apiService.getAllSongs(),
        apiService.getPlaylist(playlistId)
      ]);
      setSongs(allSongs);
      setPlaylistSongs(playlist.songs);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load songs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const addSongToPlaylist = async (songId) => {
    setError('');
    try {
      await apiService.addSongToPlaylist(playlistId, songId);
      await fetchData();
    } catch (error) {
      console.error('Failed to add song to playlist:', error);
      setError('Failed to add song to playlist. Please try again.');
    }
  };

  const removeSongFromPlaylist = async (songId) => {
    setError('');
    try {
      await apiService.removeSongFromPlaylist(playlistId, songId);
      await fetchData();
    } catch (error) {
      console.error('Failed to remove song from playlist:', error);
      setError('Failed to remove song from playlist. Please try again.');
    }
  };

  const filteredSongs = songs.filter(song => 
    song.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <LoadingIndicator />;

  return (
    <div className="playlist-song-manager">
      <h2>Manage Playlist Songs</h2>
      {error && <ErrorMessage message={error} />}
      <input
        type="text"
        placeholder="Search songs..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="song-lists">
        <div className="all-songs">
          <h3>All Songs</h3>
          <ul>
            {filteredSongs.map(song => (
              <li key={song._id}>
                {song.title}
                <button onClick={() => addSongToPlaylist(song._id)}>Add</button>
              </li>
            ))}
          </ul>
        </div>
        <div className="playlist-songs">
          <h3>Playlist Songs</h3>
          <ul>
            {playlistSongs.map(song => (
              <li key={song._id}>
                {song.title}
                <button onClick={() => removeSongFromPlaylist(song._id)}>Remove</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PlaylistSongManager;