import React from 'react';
import useThumbnailStore from '../store/thumbnailStore';

const DownloadButton = () => {
  const { selectedVariationId, variations, stageRef } = useThumbnailStore();

  const handleDownload = () => {
    // Make sure we have a Konva Stage
    if (!stageRef?.current) {
      console.error('No stageRef found.');
      return;
    }

    // Pick a filename
    const selectedVariation = variations.find(v => v.id === selectedVariationId);
    const headline = selectedVariation?.text.headline || 'thumbnail';
    const filename = `${headline.toLowerCase().replace(/\s+/g, '-')}.png`;

    // Convert Stage to dataURL
    const dataUrl = stageRef.current.toDataURL({ pixelRatio: 1 });

    // Create a download link
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button onClick={handleDownload}>
      Download PNG
    </button>
  );
};

export default DownloadButton;
