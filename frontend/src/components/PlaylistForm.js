import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import ErrorMessage from './ErrorMessage';
import LoadingIndicator from './LoadingIndicator';

const PlaylistForm = ({ playlist, isEditing, onEditComplete }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (playlist && isEditing) {
      setFormData({
        name: playlist.name || '',
        description: playlist.description || '',
      });
    }
  }, [playlist, isEditing]);

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      console.log(`Attempting to ${isEditing ? 'update' : 'create'} playlist:`, formData);
      if (isEditing && playlist && playlist._id) {
        await apiService.updatePlaylist(playlist._id, formData);
        console.log('Playlist updated successfully');
        onEditComplete();
      } else {
        await apiService.createPlaylist(formData);
        console.log('Playlist created successfully');
        navigate('/playlists');
      }
    } catch (err) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} playlist:`, err);
      setError(`Failed to ${isEditing ? 'update' : 'create'} playlist. ${err.message || 'Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <h2>{isEditing ? 'Edit Playlist' : 'Create New Playlist'}</h2>
      {error && <ErrorMessage message={error} />}
      <div>
        <label htmlFor="name">Playlist Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={onChange}
          required
          disabled={isSubmitting}
        />
      </div>
      <div>
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={onChange}
          disabled={isSubmitting}
        />
      </div>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? <LoadingIndicator /> : (isEditing ? 'Update' : 'Create')} Playlist
      </button>
      {isEditing && (
        <button type="button" onClick={onEditComplete} disabled={isSubmitting}>Cancel</button>
      )}
    </form>
  );
};

export default PlaylistForm;