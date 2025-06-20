import React from 'react';

function AuthLayout({ children }) {
  return (
    <div className="d-flex flex-column min-vh-100">
      <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        {children}
      </div>
    </div>
  );
}

export default AuthLayout;
