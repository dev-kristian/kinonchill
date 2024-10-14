'use client';

import React, { useState, useEffect } from 'react';

interface MediaPlayerProps {
  src: string;
}

const MediaPlayer: React.FC<MediaPlayerProps> = ({ src }) => {
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    // Regenerate the iframe when the src changes
    setIframeKey(prev => prev + 1);
  }, [src]);

  return (
    <div className="w-full h-full">
      <iframe
        key={iframeKey}
        src={src}
        allowFullScreen
        allow="autoplay; encrypted-media"
        className="w-full h-full"
        style={{ aspectRatio: '16 / 9' }}
      ></iframe>
    </div>
  );
};

export default MediaPlayer;