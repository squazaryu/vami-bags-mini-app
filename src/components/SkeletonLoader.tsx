import React from 'react';
import './SkeletonLoader.css';

interface SkeletonLoaderProps {
  type?: 'card' | 'text' | 'button';
  lines?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type = 'card', lines = 1 }) => {
  if (type === 'text') {
    return (
      <div className="skeleton-text">
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index} className="skeleton-line" />
        ))}
      </div>
    );
  }

  if (type === 'button') {
    return <div className="skeleton-button" />;
  }

  return <div className="skeleton-card" />;
};

export default SkeletonLoader; 