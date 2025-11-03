// jwtErrorHandler.js
// Global fetch interceptor to handle "Invalid token" responses

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://customers.katipotomasyonu.com/api';

/**
 * Handles logout API call and redirects to login page for user APIs
 */
async function handleUserInvalidToken() {
  try {
    const refreshToken = localStorage.getItem('osgbRefreshToken');
    if (refreshToken) {
      // Call logout API with refresh token
      await fetch(`${API_BASE_URL}/osgb/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.REACT_APP_USER_API_KEY,
        },
        body: JSON.stringify({ refreshToken })
      });
    }
  } catch (error) {
    console.warn('User logout API call failed:', error);
  } finally {
    // Clear user tokens
    localStorage.removeItem('osgbUser');
    localStorage.removeItem('osgbAccessToken');
    localStorage.removeItem('osgbRefreshToken');
    // Redirect to login page using relative URL
    window.location.href = '/giris';
  }
}

/**
 * Handles logout and redirects to admin login page for admin APIs
 */
async function handleAdminInvalidToken() {
  try {
    // Clear admin token
    localStorage.removeItem('adminToken');
  } catch (error) {
    console.warn('Failed to clear admin token:', error);
  } finally {
    // Redirect to admin login page using relative URL
    window.location.href = '/admin/login';
  }
}

/**
 * Determines if a URL is an admin API call
 */
function isAdminAPI(url) {
  return url.includes('/admin/') || url.includes('admin');
}

/**
 * Global fetch interceptor for handling JWT errors
 */
function setupJWTErrorHandler() {
  // Store the original fetch function
  const originalFetch = window.fetch;

  // Override the global fetch function
  window.fetch = async function(...args) {
    const response = await originalFetch.apply(this, args);
    
    // Only check for JWT errors in API responses
    const url = args[0];
    if (typeof url === 'string' && (url.includes('/api/') || url.includes('api'))) {
      // Check for "Invalid token" error in response body
      if (response.status === 401 || response.status === 403) {
        try {
          const responseClone = response.clone();
          const responseData = await responseClone.json();
          
          // Check if response contains "Invalid token" error
          if (responseData && responseData.error === "Invalid token") {
            console.warn('Invalid token detected in global fetch interceptor');
            
            // Determine if this is an admin or user API call
            if (isAdminAPI(url)) {
              await handleAdminInvalidToken();
            } else {
              await handleUserInvalidToken();
            }
          }
        } catch (parseError) {
          // If response body is not JSON or already consumed, continue with normal flow
          console.warn('Failed to parse response body in JWT error handler:', parseError);
        }
      }
    }
    
    return response;
  };
}

export default setupJWTErrorHandler;