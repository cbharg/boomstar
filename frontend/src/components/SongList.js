import React, { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';
import ErrorMessage from './ErrorMessage';
import LoadingIndicator from './LoadingIndicator';
import '../styles/Song.css';
import SearchInput from './SearchInput';
import useDebounce from '../hooks/useDebounce';
import SongListErrorBoundary from './SongListErrorBoundary';


const SongList = ({ setCurrentTrack, onSongSelect, excludeSongs = [], playlistId }) => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const fetchSongs = useCallback(async (page, search, sort, order) => {
    setLoading(true);
    setError('');
    try {
      console.log(`Fetching songs for page ${page} with search term: ${search}, sortBy: ${sort}, sortOrder: ${order}`);
      const data = await apiService.getPaginatedSongs(page, 10, search, sort, order);
      console.log('Received data:', data);
      setSongs(data.songs);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Error fetching songs:', err);
      setError(err.message || 'Failed to fetch songs. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSongs(currentPage, debouncedSearchTerm, sortBy, sortOrder);
  }, [fetchSongs, currentPage, debouncedSearchTerm, sortBy, sortOrder]);


  const handleSearch = useCallback((event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  }, []);

  const resetSearch = useCallback(() => {
    setSearchTerm('');
    setCurrentPage(1);
  }, []);

  const handlePlaySong = (song) => {
    setCurrentTrack(song);
    setSelectedTrack(song);
  };

  const handleSort = (field) => {
    setIsProcessing(true);
    if (field === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
    setIsProcessing(false);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const [addedSongs, setAddedSongs] = useState(() => {
    try {
      const savedSongs = localStorage.getItem(`addedSongs_${playlistId}`);
      return new Set(savedSongs ? JSON.parse(savedSongs) : excludeSongs);
    } catch (error) {
      console.error('Error loading saved songs:', error);
      return new Set(excludeSongs);
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(`addedSongs_${playlistId}`, JSON.stringify(Array.from(addedSongs)));
    } catch (error) {
      console.error('Error saving added songs:', error);
    }
  }, [addedSongs, playlistId]);

  const handleAddToPlaylist = async (song) => {
    if (!addedSongs.has(song._id)) {
      try {
        await onSongSelect(song);
        setAddedSongs(prev => new Set(prev).add(song._id));
      } catch (error) {
        console.error('Failed to add song:', error);
        // Show error message to user
      }
    }
  };

  if (loading) return <LoadingIndicator />;

  return (
    <SongListErrorBoundary>
    <div className="song-container">
      {isProcessing && <LoadingIndicator overlay />}
      <h2 className="song-header">All Songs</h2>
      <SearchInput value={searchTerm} onChange={handleSearch} />
      <button onClick={resetSearch}>Reset Search</button>

      {/* New section for search and sort information */}
      <div className="search-sort-info">
        {searchTerm && <p>Searching for: "{searchTerm}"</p>}
        <p>Sorted by: {sortBy} ({sortOrder === 'asc' ? 'ascending' : 'descending'})</p>
      </div>

      {error && <ErrorMessage message={error} />}

      {songs.length === 0 ? (
        <p className="empty-song-message">No songs available.</p>
      ) : (
        <>
          <table className="song-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('title')} className="sortable-header">
                  Title {sortBy === 'title' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('artist')} className="sortable-header">
                  Artist {sortBy === 'artist' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
            {songs.map((song, index) => (
              <tr key={`${song._id}-${index}`} className="song-item">
                <td className="song-title">{song.title}</td>
                <td className="song-artist">{song.artist}</td>
                <td>
                  <button onClick={() => handlePlaySong(song)} className="play-button">Play</button>
                  {onSongSelect && (
                    <button 
                      onClick={() => handleAddToPlaylist(song)} 
                      className="add-button"
                      disabled={addedSongs.has(song._id)}
                    >
                      {addedSongs.has(song._id) ? 'Added to Playlist' : 'Add to Playlist'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          </table>
          <div className="pagination">
            <button 
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>{currentPage} of {totalPages}</span>
            <button 
              onClick={() => handlePageChange(currentPage + 1)} 
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
          <div className="now-playing">
            {selectedTrack ? (
              <p>Now playing: {selectedTrack.title} by {selectedTrack.artist}</p>
            ) : (
              <p>No track selected</p>
            )}
          </div>
        </>
       )}
      </div>
    </SongListErrorBoundary>
  );
};

export default SongList;