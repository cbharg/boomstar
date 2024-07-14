import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

const PlaylistSongManager = ({ playlistId }) => {
  const [songs, setSongs] = useState([]);
  const [playlistSongs, setPlaylistSongs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch all songs and playlist songs when component mounts
    fetchSongs();
    fetchPlaylistSongs();
  }, [playlistId]);

  const fetchSongs = async () => {
    try {
      const allSongs = await apiService.getAllSongs();
      setSongs(allSongs);
    } catch (error) {
      console.error('Failed to fetch songs:', error);
    }
  };

  const fetchPlaylistSongs = async () => {
    try {
      const playlist = await apiService.getPlaylist(playlistId);
      setPlaylistSongs(playlist.songs);
    } catch (error) {
      console.error('Failed to fetch playlist songs:', error);
    }
  };

  const addSongToPlaylist = async (songId) => {
    try {
      await apiService.addSongToPlaylist(playlistId, songId);
      fetchPlaylistSongs();
    } catch (error) {
      console.error('Failed to add song to playlist:', error);
    }
  };

  const removeSongFromPlaylist = async (songId) => {
    try {
      await apiService.removeSongFromPlaylist(playlistId, songId);
      fetchPlaylistSongs();
    } catch (error) {
      console.error('Failed to remove song from playlist:', error);
    }
  };

  const filteredSongs = songs.filter(song => 
    song.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="playlist-song-manager">
      <h2>Manage Playlist Songs</h2>
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
