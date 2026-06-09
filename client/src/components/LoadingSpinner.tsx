import React from 'react';

const LoadingSpinner: React.FC<{ size?: string }> = ({ size }) => (
  <div className="loading-container">
    <div className="spinner" style={size ? { width: size, height: size } : {}} />
  </div>
);

export default LoadingSpinner;
