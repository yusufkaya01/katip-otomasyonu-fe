import React from 'react';

export default function PageLoadingSpinner({ show = false, fullscreen = false }) {
  if (!show) return null;
  return (
    <div
      className={fullscreen ? 'position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75' : 'd-flex align-items-center justify-content-center'}
      style={fullscreen ? { zIndex: 2000 } : {}}
    >
      <div className="spinner-border text-primary" style={{ width: 48, height: 48 }} role="status">
        <span className="visually-hidden">Yükleniyor...</span>
      </div>
    </div>
  );
}
