import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import ErrorMessage from './ErrorMessage';
import LoadingIndicator from './LoadingIndicator';
import SongList from './SongList';
import PlaylistDetailErrorBoundary from './PlaylistDetailErrorBoundary';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const PlaylistDetail = ({ setCurrentTrack }) => {
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [removingSongId, setRemovingSongId] = useState(null);
  const [showAddSongs, setShowAddSongs] = useState(false);
  const [addedSongIds, setAddedSongIds] = useState(new Set(playlist?.songs.map(song => song._id) || []));
  const { id } = useParams();
  const navigate = useNavigate();

  
  const fetchPlaylist = useCallback(async () => {
    try {
      const data = await apiService.getPlaylist(id);
      console.log("Fetched playlist data:", JSON.stringify(data, null, 2));
      console.log("Songs in playlist:", data.songs);
      setPlaylist(data);
      setEditedName(data.name);
      setEditedDescription(data.description);
    } catch (err) {
      console.error("Error fetching playlist:", err);
      if (err.response && err.response.status === 401) {
        // Token expired, redirect to login
        navigate('/login');
      } else {
        setError('Failed to fetch playlist. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchPlaylist();
  }, [fetchPlaylist]);

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

  const handleAddSong = async (song) => {
    try {
      if (!addedSongIds.has(song._id)) {
        await apiService.addSongToPlaylist(id, song._id);
        setAddedSongIds(prev => new Set(prev).add(song._id));
        await fetchPlaylist();
      } else {
        setError('Song already exists in the playlist.');
      }
    } catch (err) {
      console.error("Error adding song to playlist:", err);
      setError('Failed to add song to playlist. Please try again.');
    }
  };

  const handleRemoveSong = async (songId) => {
    setRemovingSongId(songId);
    try {
      console.log(`Removing song ${songId}`);
      await apiService.removeSongFromPlaylist(id, songId);
      setPlaylist(prevPlaylist => ({
        ...prevPlaylist,
        songs: prevPlaylist.songs.filter(song => song._id !== songId)
      }));
      setAddedSongIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(songId);
        return newSet;
      });
      //update localStorage
      const storedSongs = JSON.parse(localStorage.getItem(`addedSongs_${id}`) || '[]');
      localStorage.setItem(`addedSongs_${id}`, JSON.stringify(storedSongs.filter(id => id !== songId)));
    } catch (err) {
      console.error("Error removing song from playlist:", err);
      setError('Failed to remove song from playlist. Please try again.');
    } finally {
      setRemovingSongId(null);
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(playlist.songs);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setPlaylist(prevPlaylist => ({...prevPlaylist, songs: items}));

    try {
      await apiService.reorderPlaylistSongs(id, items.map(song => song._id));
      await fetchPlaylist(); // Fetch the updated playlist from the server
    } catch (err) {
      console.error("Error reordering songs:", err);
      setError('Failed to update song order. Please try again.');
      await fetchPlaylist(); // Fetch the original playlist order from the server
    }
  };

  if (loading) return <LoadingIndicator />;
  if (error) return <ErrorMessage message={error} />;
  if (!playlist) return <ErrorMessage message="Playlist not found." />;

  return (
    <PlaylistDetailErrorBoundary>
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
        <h3>Songs in Playlist:</h3>
        {playlist.songs.length === 0 ? (
          <p>No songs in this playlist yet.</p>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="playlist">
              {(provided) => (
                <ul {...provided.droppableProps} ref={provided.innerRef}>
                  {playlist.songs.map((song, index) => (
                    <Draggable key={`${song._id}-${index}`} draggableId={`${song._id}-${index}`} index={index}>
                    {(provided) => (
                      <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        {song.title ? `${song.title} - ${song.artist}` : `Loading... (ID: ${song})`}
                        <button onClick={() => handleSongPlay(song)}>Play</button>
                        <button 
                          onClick={() => handleRemoveSong(song._id || song)}
                          disabled={removingSongId === (song._id || song)}
                        >     
                          {removingSongId === (song._id || song) ? 'Removing...' : 'Remove'}
                        </button>
                      </li>
                    )}
                  </Draggable>
                ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        )}
        <button onClick={() => setShowAddSongs(!showAddSongs)}>
          {showAddSongs ? 'Hide Song List' : 'Add Songs'}
        </button>
        {showAddSongs && (
          <SongList
            setCurrentTrack={setCurrentTrack}
            onSongSelect={handleAddSong}
            excludeSongs={Array.from(addedSongIds)}
            playlistId={id}
          />
        )}
        <button onClick={handleDelete} disabled={isDeleting || isEditing}>
          {isDeleting ? <LoadingIndicator /> : 'Delete Playlist'}
        </button>
      </div>
    </PlaylistDetailErrorBoundary>
  );
};

export default PlaylistDetail;