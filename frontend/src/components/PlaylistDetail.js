import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import ErrorMessage from './ErrorMessage';
import LoadingIndicator from './LoadingIndicator';

const PlaylistDetail = ({ setCurrentTrack }) => {
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const data = await apiService.getPlaylist(id);
        setPlaylist(data);
        setEditedName(data.name);
        setEditedDescription(data.description);
      } catch (err) {
        setError('Failed to fetch playlist. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylist();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this playlist?')) {
      setIsDeleting(true);
      try {
        await apiService.deletePlaylist(id);
        navigate('/playlists');
      } catch (err) {
        setError('Failed to delete playlist. Please try again.');
        setIsDeleting(false);
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
    setIsUpdating(true);
    try {
      const updatedPlaylist = await apiService.updatePlaylist(id, {
        name: editedName,
        description: editedDescription,
      });
      setPlaylist(updatedPlaylist);
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update playlist. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <LoadingIndicator />;
  if (error) return <ErrorMessage message={error} />;
  if (!playlist) return <ErrorMessage message="Playlist not found." />;

  return (
    <div>
      {!isEditing ? (
        <>
          <h2>{playlist.name}</h2>
          <p>{playlist.description}</p>
          <button onClick={handleEdit} disabled={isDeleting}>Edit Playlist</button>
        </>
      ) : (
        <form onSubmit={handleUpdate}>
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            disabled={isUpdating}
          />
          <textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            disabled={isUpdating}
          />
          <button type="submit" disabled={isUpdating}>
            {isUpdating ? <LoadingIndicator /> : 'Update Playlist'}
          </button>
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
      <button onClick={handleDelete} disabled={isDeleting || isEditing}>
        {isDeleting ? <LoadingIndicator /> : 'Delete Playlist'}
      </button>
    </div>
  );
};

export default PlaylistDetail;