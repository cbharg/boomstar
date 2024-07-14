import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';

const MusicPlayer = ({ currentTrack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(new Audio(currentTrack?.url));

  useEffect(() => {
    if (currentTrack) {
      audioRef.current.src = currentTrack.url;
      audioRef.current.load();
      setIsPlaying(true);
      audioRef.current.play();
    }
  }, [currentTrack]);

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{currentTrack?.title || 'No track selected'}</h3>
          <p className="text-sm text-gray-600">{currentTrack?.artist || 'Unknown artist'}</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full bg-blue-500 text-white">
            <SkipBack size={20} />
          </button>
          <button onClick={togglePlayPause} className="p-2 rounded-full bg-blue-500 text-white">
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button className="p-2 rounded-full bg-blue-500 text-white">
            <SkipForward size={20} />
          </button>
        </div>
      </div>
      <div className="bg-gray-200 h-1 rounded-full">
        <div className="bg-blue-500 h-1 rounded-full w-1/2"></div>
      </div>
    </div>
  );
};

export default MusicPlayer; 
