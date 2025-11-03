// authFetch.js
// A fetch wrapper that handles JWT access/refresh token logic for OSGB API

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://customers.katipotomasyonu.com/api';

/**
 * Handles logout API call and redirects to login page
 * This function is called when "Invalid token" error is detected
 */
async function handleInvalidToken(refreshToken) {
  try {
    // Call logout API with refresh token
    await fetch(`${API_BASE_URL}/osgb/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.REACT_APP_USER_API_KEY,
      },
      body: JSON.stringify({ refreshToken })
    });
  } catch (error) {
    console.warn('Logout API call failed:', error);
  } finally {
    // Always redirect to login page using relative URL (works in both local and production)
    window.location.href = '/giris';
  }
}

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

  // Check for "Invalid token" error in response body
  if (response.status === 401 || response.status === 403) {
    try {
      const responseClone = response.clone();
      const responseData = await responseClone.json();
      
      // Check if response contains "Invalid token" error
      if (responseData && responseData.error === "Invalid token") {
        console.warn('Invalid token detected, initiating logout and redirect');
        await handleInvalidToken(auth.refreshToken);
        return response; // Return original response (though user will be redirected)
      }
    } catch (parseError) {
      // If response body is not JSON, continue with normal flow
      console.warn('Failed to parse response body for token validation:', parseError);
    }
  }

  // If access token expired (401) but not "Invalid token", try refresh
  if (response.status === 401 && auth.refreshToken) {
    // Try to refresh the access token
    const refreshRes = await fetch(`${API_BASE_URL}/osgb/refresh-token`, {
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
      // Check if refresh token response also has "Invalid token"
      try {
        const refreshData = await refreshRes.json();
        if (refreshData && refreshData.error === "Invalid token") {
          console.warn('Invalid refresh token detected, initiating logout and redirect');
          await handleInvalidToken(auth.refreshToken);
          return response;
        }
      } catch (parseError) {
        // If refresh response body is not JSON, continue with normal flow
      }
      
      // Refresh failed - logout the user
      console.warn('Token refresh failed, logging out user');
      auth.logout();
      // Return the original 401 response
    }
  }
  return response;
}
