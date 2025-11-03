// TestJWTErrorHandler.js
// Test component to verify JWT error handling functionality
// This component can be imported and used to test the error handling

import React, { useState } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://customers.katipotomasyonu.com/api';

export default function TestJWTErrorHandler() {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  // Test with invalid token to trigger the error handler
  const testInvalidTokenHandling = async () => {
    setLoading(true);
    setTestResult('Testing invalid token handling...');

    try {
      // Make a request with an obviously invalid token
      const response = await fetch(`${API_BASE_URL}/osgb/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer invalid_token_for_testing',
          'x-api-key': process.env.REACT_APP_USER_API_KEY,
        }
      });

      const data = await response.json();
      
      if (data.error === "Invalid token") {
        setTestResult('✅ Invalid token error received - error handler should trigger automatically');
        // The global error handler should now trigger logout and redirect
      } else {
        setTestResult(`❌ Unexpected response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      setTestResult(`❌ Network error: ${error.message}`);
    }

    setLoading(false);
  };

  // Test admin invalid token handling
  const testAdminInvalidTokenHandling = async () => {
    setLoading(true);
    setTestResult('Testing admin invalid token handling...');

    try {
      // Make a request to admin endpoint with invalid token
      const response = await fetch(`${API_BASE_URL}/admin/orders/pending`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer invalid_admin_token_for_testing',
          'x-admin-api-key': process.env.REACT_APP_ADMIN_API_KEY,
        }
      });

      const data = await response.json();
      
      if (data.error === "Invalid token") {
        setTestResult('✅ Admin invalid token error received - admin error handler should trigger automatically');
        // The global error handler should now trigger admin logout and redirect
      } else {
        setTestResult(`❌ Unexpected admin response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      setTestResult(`❌ Admin network error: ${error.message}`);
    }

    setLoading(false);
  };

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header">
          <h5>JWT Error Handler Test Component</h5>
        </div>
        <div className="card-body">
          <p>
            This component tests the automatic JWT error handling implementation.
            When you click the test buttons, it will make API calls with invalid tokens
            to trigger the "Invalid token" response and verify the error handler works.
          </p>
          
          <div className="d-grid gap-2">
            <button 
              className="btn btn-primary" 
              onClick={testInvalidTokenHandling}
              disabled={loading}
            >
              {loading ? 'Testing...' : 'Test User API Invalid Token Handling'}
            </button>
            
            <button 
              className="btn btn-secondary" 
              onClick={testAdminInvalidTokenHandling}
              disabled={loading}
            >
              {loading ? 'Testing...' : 'Test Admin API Invalid Token Handling'}
            </button>
          </div>

          {testResult && (
            <div className="mt-3">
              <h6>Test Result:</h6>
              <div className="alert alert-info">
                <code>{testResult}</code>
              </div>
            </div>
          )}

          <div className="mt-3">
            <small className="text-muted">
              <strong>Expected behavior:</strong>
              <ul>
                <li>User API test should redirect to: /giris (relative URL)</li>
                <li>Admin API test should redirect to: /admin/login (relative URL)</li>
                <li>Logout API should be called automatically before redirect</li>
                <li>Local storage tokens should be cleared</li>
                <li>Redirects work in both local development and production environments</li>
              </ul>
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}