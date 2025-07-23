import React from 'react';
import { useAuth } from '../context/AuthContext';

function DebugPage() {
  const { user, loading, accessToken, refreshToken } = useAuth();
  
  return (
    <div className="container py-5">
      <h2>Debug Information</h2>
      <div className="card p-4">
        <div><strong>Loading:</strong> {loading ? 'true' : 'false'}</div>
        <div><strong>User:</strong> {user ? 'exists' : 'null'}</div>
        <div><strong>Access Token:</strong> {accessToken ? 'exists' : 'null'}</div>
        <div><strong>Refresh Token:</strong> {refreshToken ? 'exists' : 'null'}</div>
        <div><strong>User Object:</strong></div>
        <pre style={{backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px', fontSize: '12px'}}>
          {user ? JSON.stringify(user, null, 2) : 'null'}
        </pre>
        <div><strong>localStorage Data:</strong></div>
        <pre style={{backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px', fontSize: '12px'}}>
          osgbUser: {localStorage.getItem('osgbUser') || 'null'}<br/>
          osgbAccessToken: {localStorage.getItem('osgbAccessToken') || 'null'}<br/>
          osgbRefreshToken: {localStorage.getItem('osgbRefreshToken') || 'null'}
        </pre>
      </div>
    </div>
  );
}

export default DebugPage;
