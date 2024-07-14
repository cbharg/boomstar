import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiService from '../services/api';

const PlaylistDetail = ({ setCurrentTrack }) => {
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const data = await apiService.getPlaylist(id);
        setPlaylist(data);
        setEditedName(data.name);
        setEditedDescription(data.description);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch playlist. Please try again.');
        setLoading(false);
      }
    };

    fetchPlaylist();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this playlist?')) {
      try {
        await apiService.deletePlaylist(id);
        navigate('/playlists');
      } catch (err) {
        setError('Failed to delete playlist. Please try again.');
      }
    }
  };

  const handleSongPlay = (song) => {
    setCurrentTrack(song);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updatedPlaylist = await apiService.updatePlaylist(id, {
        name: editedName,
        description: editedDescription,
      });
      setPlaylist(updatedPlaylist);
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update playlist. Please try again.');
    }
  };

  if (loading) return <div>Loading playlist...</div>;
  if (error) return <div>{error}</div>;
  if (!playlist) return <div>Playlist not found.</div>;

  return (
    <div>
      {!isEditing ? (
        <>
          <h2>{playlist.name}</h2>
          <p>{playlist.description}</p>
          <button onClick={handleEdit}>Edit Playlist</button>
        </>
      ) : (
        <form onSubmit={handleUpdate}>
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
          />
          <textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
          />
          <button type="submit">Update Playlist</button>
        </form>
      )}
      <h3>Songs:</h3>
      {playlist.songs.length === 0 ? (
        <p>No songs in this playlist yet.</p>
      ) : (
        <ul>
          {playlist.songs.map(song => (
            <li key={song._id}>
              {song.title}
              <button onClick={() => handleSongPlay(song)}>Play</button>
            </li>
          ))}
        </ul>
      )}
      <button onClick={handleDelete}>Delete Playlist</button>
      <Link to="/playlists">Back to Playlists</Link>
    </div>
  );
};

export default PlaylistDetail;