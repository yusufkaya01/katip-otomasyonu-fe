// authFetch.js
// A fetch wrapper that handles JWT access/refresh token logic for OSGB API
import { useAuth } from '../context/AuthContext';

/**
 * Usage: import authFetch from '../api/authFetch';
 * const res = await authFetch('/api/osgb/profile', { method: 'GET' }, authContext);
 */
export default async function authFetch(url, options = {}, auth) {
  // Add Authorization header
  const headers = {
    ...(options.headers || {}),
    'Authorization': `Bearer ${auth.accessToken}`,
    'x-api-key': process.env.REACT_APP_USER_API_KEY,
  };
  let response = await fetch(url, { ...options, headers });

  // If access token expired, try refresh
  if (response.status === 401 && auth.refreshToken) {
    // Try to refresh the access token
    const refreshRes = await fetch('https://customers.katipotomasyonu.com/api/osgb/refresh-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.REACT_APP_USER_API_KEY,
      },
      body: JSON.stringify({ refreshToken: auth.refreshToken })
    });
    if (refreshRes.ok) {
      const data = await refreshRes.json();
      if (data.accessToken) {
        // Update access token in context
        auth.updateAccessToken(data.accessToken);
        // Retry original request with new token
        const retryHeaders = {
          ...headers,
          'Authorization': `Bearer ${data.accessToken}`
        };
        response = await fetch(url, { ...options, headers: retryHeaders });
      }
    } else {
      // Refresh failed, logout user
      if (auth.logout) auth.logout();
      // Optionally, redirect to login page here
    }
  }
  return response;
}
