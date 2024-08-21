import React, { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';
import ErrorMessage from './ErrorMessage';
import LoadingIndicator from './LoadingIndicator';

const PlaylistSongManager = ({ playlistId, onSongsUpdate, addedSongIds }) => {
  const [songs, setSongs] = useState([]);
  const [playlistSongs, setPlaylistSongs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const fetchData = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const [songsData, playlist] = await Promise.all([
        apiService.getAllSongs(page),
        apiService.getPlaylist(playlistId)
      ]);

      if (songsData && songsData.songs) {
        setSongs(prevSongs => {
          const newSongs = songsData.songs.filter(newSong => 
            !prevSongs.some(existingSong => existingSong._id === newSong._id)
          );
          return [...prevSongs, ...newSongs];
        });
        setTotalPages(songsData.totalPages);
      }
      
      if (playlist && playlist.songs) {
        setPlaylistSongs(playlist.songs);
        onSongsUpdate(playlist.songs);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load songs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [playlistId, onSongsUpdate, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const loadMore = useCallback(() => {
    if (!isLoading && page < totalPages) {
      setPage(prevPage => prevPage + 1);
    }
  }, [isLoading, page, totalPages]);

  const addSongToPlaylist = async (songId) => {
    try {
      await apiService.addSongToPlaylist(playlistId, songId);
      const updatedPlaylist = await apiService.getPlaylist(playlistId);
      setPlaylistSongs(updatedPlaylist.songs);
      onSongsUpdate(updatedPlaylist.songs);
    } catch (error) {
      console.error('Failed to add song to playlist:', error);
      setError('Failed to add song to playlist. Please try again.');
    }
  };

  const removeSongFromPlaylist = async (songId) => {
    try {
      await apiService.removeSongFromPlaylist(playlistId, songId);
      const updatedPlaylistSongs = playlistSongs.filter(song => song._id !== songId);
      setPlaylistSongs(updatedPlaylistSongs);
      onSongsUpdate(updatedPlaylistSongs);
    } catch (error) {
      console.error('Failed to remove song from playlist:', error);
      setError('Failed to remove song from playlist. Please try again.');
    }
  };

  const filteredSongs = songs.filter(song => 
    song.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="playlist-container">
      <h2 className="playlist-header">Manage Playlist Songs</h2>
      {error && <ErrorMessage message={error} />}
      <input
        className="search-input"
        type="text"
        placeholder="Search songs..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="song-lists">
        <div className="all-songs">
          <h3 className="playlist-header">All Songs</h3>
          {isLoading && songs.length === 0 ? (
            <LoadingIndicator />
          ) : (
            <>
              <ul>
                {filteredSongs.map(song => (
                  <li key={song._id}>
                    {song.title}
                    <button 
                      onClick={() => addSongToPlaylist(song._id)}
                      disabled={addedSongIds.has(song._id)}
                    >
                      {addedSongIds.has(song._id) ? 'Added' : 'Add'}
                    </button>
                  </li>
                ))}
              </ul>
              {page < totalPages && (
                <button onClick={loadMore} disabled={isLoading}>
                  {isLoading ? 'Loading...' : 'Load More Songs'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistSongManager;