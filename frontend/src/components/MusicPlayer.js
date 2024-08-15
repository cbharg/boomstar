import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import MusicPlayerErrorBoundary from './MusicPlayerErrorBoundary';

const MusicPlayer = ({ currentTrack, onNext, onPrevious }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState('');
  const audioRef = useRef(new Audio());

  useEffect(() => {
    if (currentTrack) {
      audioRef.current.src = currentTrack.url;
      audioRef.current.load();
      setIsPlaying(true);
      audioRef.current.play().catch(err => {
        console.error('Error playing audio:', err);
        setError('Failed to play the track. Please try again.');
        setIsPlaying(false);
      });
    }
  }, [currentTrack]);

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        console.error('Error playing audio:', err);
        setError('Failed to play the track. Please try again.');
      });
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <MusicPlayerErrorBoundary>
    <div className="bg-gray-100 p-4 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{currentTrack?.title || 'No track selected'}</h3>
          <p className="text-sm text-gray-600">{currentTrack?.artist || 'Unknown artist'}</p>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={onPrevious} className="p-2 rounded-full bg-blue-500 text-white" disabled={!onPrevious}>
            <SkipBack size={20} />
          </button>
          <button onClick={togglePlayPause} className="p-2 rounded-full bg-blue-500 text-white" disabled={!currentTrack}>
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button onClick={onNext} className="p-2 rounded-full bg-blue-500 text-white" disabled={!onNext}>
            <SkipForward size={20} />
          </button>
        </div>
      </div>
      <div className="bg-gray-200 h-1 rounded-full">
        <div className="bg-blue-500 h-1 rounded-full w-1/2"></div>
      </div>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
    </MusicPlayerErrorBoundary>
  );
};

export default MusicPlayer;