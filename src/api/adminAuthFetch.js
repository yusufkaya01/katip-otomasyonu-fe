// adminAuthFetch.js
// A fetch wrapper that handles JWT token validation for Admin API calls

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

/**
 * Handles logout and redirects to admin login page
 * This function is called when "Invalid token" error is detected
 */
async function handleInvalidAdminToken() {
  try {
    // Clear any admin token from localStorage
    localStorage.removeItem('adminToken');
  } catch (error) {
    console.warn('Failed to clear admin token:', error);
  } finally {
    // Always redirect to admin login page using relative URL (works in both local and production)
    window.location.href = '/admin/login';
  }
}

/**
 * Usage: import adminAuthFetch from '../api/adminAuthFetch';
 * const res = await adminAuthFetch('/admin/orders/pending', { method: 'GET' }, token);
 */
export default async function adminAuthFetch(url, options = {}, token) {
  // Add Authorization header
  const headers = {
    ...(options.headers || {}),
    'Authorization': `Bearer ${token}`,
    'x-admin-api-key': process.env.REACT_APP_ADMIN_API_KEY,
    'Content-Type': 'application/json',
  };
  
  let response = await fetch(url, { ...options, headers });

  // Check for "Invalid token" error in response body
  if (response.status === 401 || response.status === 403) {
    try {
      const responseClone = response.clone();
      const responseData = await responseClone.json();
      
      // Check if response contains "Invalid token" error
      if (responseData && responseData.error === "Invalid token") {
        console.warn('Invalid admin token detected, initiating logout and redirect');
        await handleInvalidAdminToken();
        return response; // Return original response (though user will be redirected)
      }
    } catch (parseError) {
      // If response body is not JSON, continue with normal flow
      console.warn('Failed to parse admin response body for token validation:', parseError);
    }
  }

  return response;
}