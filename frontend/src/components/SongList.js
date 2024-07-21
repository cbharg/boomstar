import React, { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';
import ErrorMessage from './ErrorMessage';
import LoadingIndicator from './LoadingIndicator';
import '../styles/Song.css';
import debounce from 'lodash.debounce';

const SongList = ({ setCurrentTrack }) => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const debouncedSearch = useCallback(
    (callback) => debounce(callback, 300),
    []
  );

  const handleSearch = useCallback((event) => {
    debouncedSearch(() => {
      setSearchTerm(event.target.value);
      setCurrentPage(1);
    })();
  }, [debouncedSearch, setSearchTerm, setCurrentPage]);

  const fetchSongs = async (page) => {
    setLoading(true);
    try {
      console.log(`Fetching songs for page ${page}`);
      const data = await apiService.getPaginatedSongs(page);
      console.log('Received data:', data);
      setSongs(data.songs);
      setTotalPages(data.totalPages);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching songs:', err);
      setError(`Failed to fetch songs. Error: ${err.message}`);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs(currentPage);
  }, [currentPage]);

  const handlePlaySong = (song) => {
    setCurrentTrack(song);
    setSelectedTrack(song);
  };

  const handleSort = (field) => {
    if (field === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const filteredAndSortedSongs = songs
    .filter(song => 
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return sortOrder === 'asc' ? -1 : 1;
      if (a[sortBy] > b[sortBy]) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  if (loading) return <LoadingIndicator />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="song-container">
      <h2 className="song-header">All Songs</h2>
      <input
        type="text"
        placeholder="Search songs..."
        onChange={handleSearch}
        className="search-input"
      />
      {filteredAndSortedSongs.length === 0 ? (
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
            {filteredAndSortedSongs.map(song => (
              <tr key={song._id} className="song-item">
                <td className="song-title">{song.title}</td>
                <td className="song-artist">{song.artist}</td>
                <td>
                  <button onClick={() => handlePlaySong(song)} className="play-button">Play</button>
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
  );
};

export default SongList;