# OSGB Authentication APIs - JWT Token Management
## Login, Logout, Refresh Token Implementation Guide

---

## 🔐 **Authentication APIs**

### **1. Login API**

```http
POST /api/osgb/login
```

**Headers Required:**
```http
Content-Type: application/json
x-api-key: {YOUR_API_KEY}
```

**Request Body:**
```json
{
  "email": "customer@example.com",     // OR use customer_id instead
  "password": "userpassword123"
}
```

**Alternative with Customer ID:**
```json
{
  "customer_id": "1234567890",         // 10-digit customer ID
  "password": "userpassword123"
}
```

**Success Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIzLCJjdXN0b21lcl9pZCI6IjEyMzQ1Njc4OTAiLCJpYXQiOjE2OTg1MjgwMDAsImV4cCI6MTY5ODU3MTIwMH0.example",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIzLCJjdXN0b21lcl9pZCI6IjEyMzQ1Njc4OTAiLCJpYXQiOjE2OTg1MjgwMDAsImV4cCI6MTcwMTEyMDAwMH0.example",
  "user": {
    "id": 123,
    "customer_id": "1234567890",
    "email": "customer@example.com",
    "phone": "5551234567",
    "first_name": "John",
    "last_name": "Doe",
    "company_name": "Example OSGB Ltd.",
    "osgb_id": "OSGB-1234",
    "city": "Istanbul",
    "district": "Kadikoy",
    "address": "Example Street No:123",
    "is_active": true,
    "email_verified": true,
    "marketing_emails_consent": false,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-10-28T09:15:30.000Z",
    "last_login": "2024-10-28T09:15:30.000Z"
  },
  "licenseKey": "ABCD123456"
}
```

**Error Responses:**
```json
// 401 - Invalid credentials
{
  "error": "INVALID_CREDENTIALS"
}

// 429 - Rate limit exceeded (10 attempts per 15 minutes)
{
  "error": "Too many login attempts, please try again later."
}

// 500 - Internal server error
{
  "error": "INTERNAL_ERROR",
  "details": "Database connection failed"
}
```

---

### **2. Refresh Token API**

```http
POST /api/osgb/refresh-token
```

**Headers Required:**
```http
Content-Type: application/json
```

**⚠️ Note:** No `x-api-key` or `Authorization` header required for this endpoint.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIzLCJjdXN0b21lcl9pZCI6IjEyMzQ1Njc4OTAiLCJpYXQiOjE2OTg1MjgwMDAsImV4cCI6MTcwMTEyMDAwMH0.example"
}
```

**Success Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIzLCJjdXN0b21lcl9pZCI6IjEyMzQ1Njc4OTAiLCJpYXQiOjE2OTg1MzE2MDAsImV4cCI6MTY5ODU3NDgwMH0.newtoken"
}
```

**Error Responses:**
```json
// 400 - Missing refresh token
{
  "error": "REFRESH_TOKEN_REQUIRED"
}

// 401 - Invalid or expired refresh token
{
  "error": "INVALID_REFRESH_TOKEN"
}

// 500 - Internal server error
{
  "error": "INTERNAL_ERROR",
  "details": "Database connection failed"
}
```

---

### **3. Logout API**

```http
POST /api/osgb/logout
```

**Headers Required:**
```http
Content-Type: application/json
```

**⚠️ Note:** No `x-api-key` or `Authorization` header required for this endpoint.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIzLCJjdXN0b21lcl9pZCI6IjEyMzQ1Njc4OTAiLCJpYXQiOjE2OTg1MjgwMDAsImV4cCI6MTcwMTEyMDAwMH0.example"
}
```

**Success Response (200):**
```json
{
  "success": true
}
```

**Error Responses:**
```json
// 400 - Missing refresh token
{
  "error": "REFRESH_TOKEN_REQUIRED"
}

// 500 - Internal server error
{
  "error": "INTERNAL_ERROR",
  "details": "Database connection failed"
}
```

---

## 🏗️ **JWT Token Structure**

### **Access Token Payload:**
```json
{
  "id": 123,                     // User database ID
  "customer_id": "1234567890",   // 10-digit customer identifier
  "iat": 1698528000,            // Issued at (Unix timestamp)
  "exp": 1698571200             // Expires at (Unix timestamp - 12 hours later)
}
```

### **Refresh Token Payload:**
```json
{
  "id": 123,                     // User database ID  
  "customer_id": "1234567890",   // 10-digit customer identifier
  "iat": 1698528000,            // Issued at (Unix timestamp)
  "exp": 1701120000             // Expires at (Unix timestamp - 30 days later)
}
```

### **Token Expiration Times:**
- **Access Token**: 12 hours (`JWT_ACCESS_TOKEN_EXPIRES_IN=12h`)
- **Refresh Token**: 30 days (`JWT_REFRESH_TOKEN_EXPIRES_IN=30d`)

---

## � **JWT "Invalid Token" Error Handling Implementation**

### **Automatic Error Detection and Logout**

The application now includes automatic handling of "Invalid token" responses from the backend. When any API call receives this specific error, the system will automatically:

1. **Detect the error**: Check response body for `{"error":"Invalid token"}`
2. **Call logout API**: Send refresh token to logout endpoint
3. **Clear local storage**: Remove all authentication tokens
4. **Redirect user**: Navigate to appropriate login page

### **Implementation Details**

**1. Global Fetch Interceptor (Applied to ALL fetch calls):**
```javascript
// Located in: src/utils/jwtErrorHandler.js
// Automatically initialized in App.js

// For user APIs - redirects to: http://192.168.1.115:3001/giris
// For admin APIs - redirects to: http://192.168.1.115:3001/admin/login
```

**2. Enhanced authFetch for User APIs:**
```javascript
// Located in: src/api/authFetch.js
// Used by components that import authFetch utility

// Automatically calls: POST /api/osgb/logout
// With refresh token in request body
// Then redirects to login page
```

**3. Admin API Support:**
```javascript
// Located in: src/api/adminAuthFetch.js
// Available for admin components (optional usage)

// Clears admin tokens and redirects to admin login
```

### **How It Works**

```javascript
// Example API response that triggers the handler:
{
  "error": "Invalid token"
}

// Automatic sequence:
1. Error detected in fetch response
2. Determine if user or admin API
3. Call appropriate logout endpoint with refresh token
4. Clear localStorage tokens
5. Redirect to login page using relative URLs
```

### **Configuration**

The error handler is configured to redirect to relative URLs that work in all environments:
- **User login**: `/giris` (adapts to current domain/port)
- **Admin login**: `/admin/login` (adapts to current domain/port)

This ensures the redirects work correctly in:
- Local development (e.g., `http://localhost:3000/giris`)
- Production (e.g., `https://yourdomain.com/giris`)
- Any custom domain or port configuration

To change these URLs, update the handler files:
- `src/utils/jwtErrorHandler.js`
- `src/api/authFetch.js`
- `src/api/adminAuthFetch.js`

### **Testing the Implementation**

You can test this functionality by:
1. Making an API call with an invalid/expired token
2. Server should respond with `{"error":"Invalid token"}`
3. Verify automatic logout and redirect occurs

---

## �💻 **Frontend JWT Token Handling**

### **1. Token Storage Strategy**

```javascript
// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'osgb_access_token',
  REFRESH_TOKEN: 'osgb_refresh_token',
  USER_DATA: 'osgb_user_data',
  LICENSE_KEY: 'osgb_license_key'
};

// Store tokens after successful login
function storeAuthTokens(loginResponse) {
  const { accessToken, refreshToken, user, licenseKey } = loginResponse;
  
  // Store in localStorage (consider sessionStorage or httpOnly cookies for production)
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  localStorage.setItem(STORAGE_KEYS.LICENSE_KEY, licenseKey);
  
  console.log('Tokens stored successfully');
}

// Retrieve tokens
function getStoredTokens() {
  return {
    accessToken: localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
    refreshToken: localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
    userData: JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_DATA) || 'null'),
    licenseKey: localStorage.getItem(STORAGE_KEYS.LICENSE_KEY)
  };
}

// Clear all tokens
function clearStoredTokens() {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  localStorage.removeItem(STORAGE_KEYS.LICENSE_KEY);
  
  console.log('All tokens cleared');
}
```

### **2. API Client Setup with Automatic Token Refresh**

```javascript
import axios from 'axios';

const API_BASE_URL = 'https://api.katipotomasyonu.com';
const API_KEY = 'your-api-key-here';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY
  }
});

// Request interceptor - Add access token to requests
apiClient.interceptors.request.use(
  (config) => {
    // Add access token to authorization header for all requests except refresh/logout
    if (!config.url.includes('/refresh-token') && !config.url.includes('/logout')) {
      const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle token expiration and auto-refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and access token expired
    if (error.response?.status === 401 && 
        error.response?.data?.error === 'Invalid token' &&
        !originalRequest._retry) {
      
      originalRequest._retry = true;

      try {
        console.log('Access token expired, attempting refresh...');
        
        // Get refresh token
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call refresh token API
        const refreshResponse = await axios.post(`${API_BASE_URL}/api/osgb/refresh-token`, {
          refreshToken: refreshToken
        });

        const { accessToken: newAccessToken } = refreshResponse.data;

        // Update stored access token
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);

        // Update the original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        console.log('Token refreshed successfully, retrying original request');
        
        // Retry the original request
        return apiClient(originalRequest);

      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError.response?.data);
        
        // Refresh failed - clear tokens and redirect to login
        clearStoredTokens();
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

### **3. Authentication Functions**

```javascript
// Login function
async function login(credentials) {
  try {
    const response = await apiClient.post('/api/osgb/login', {
      email: credentials.email,           // or customer_id
      password: credentials.password
    });

    // Store tokens and user data
    storeAuthTokens(response.data);

    return {
      success: true,
      data: response.data
    };

  } catch (error) {
    console.error('Login failed:', error.response?.data);
    
    return {
      success: false,
      error: error.response?.data?.error || 'LOGIN_FAILED',
      message: getErrorMessage(error.response?.data?.error)
    };
  }
}

// Logout function
async function logout() {
  try {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    
    if (refreshToken) {
      // Call logout API to invalidate refresh token on server
      await axios.post(`${API_BASE_URL}/api/osgb/logout`, {
        refreshToken: refreshToken
      });
      console.log('Logout API call successful');
    }

  } catch (error) {
    console.error('Logout API failed:', error.response?.data);
    // Continue with local cleanup even if API call fails
  } finally {
    // Always clear local tokens
    clearStoredTokens();
    
    // Redirect to login page
    window.location.href = '/login';
  }
}

// Manual token refresh (optional - usually handled automatically)
async function refreshAccessToken() {
  try {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(`${API_BASE_URL}/api/osgb/refresh-token`, {
      refreshToken: refreshToken
    });

    const { accessToken } = response.data;
    
    // Update stored access token
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    
    return accessToken;

  } catch (error) {
    console.error('Manual token refresh failed:', error.response?.data);
    clearStoredTokens();
    throw error;
  }
}

// Check if user is authenticated
function isAuthenticated() {
  const { accessToken, refreshToken } = getStoredTokens();
  return !!(accessToken && refreshToken);
}

// Get error message for user display
function getErrorMessage(errorCode) {
  const errorMessages = {
    'INVALID_CREDENTIALS': 'E-posta/müşteri numarası veya şifre hatalı.',
    'REFRESH_TOKEN_REQUIRED': 'Oturum bilgisi eksik. Lütfen tekrar giriş yapın.',
    'INVALID_REFRESH_TOKEN': 'Oturum süresi dolmuş. Lütfen tekrar giriş yapın.',
    'INTERNAL_ERROR': 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.',
    'LOGIN_FAILED': 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.'
  };
  
  return errorMessages[errorCode] || 'Bir hata oluştu. Lütfen tekrar deneyin.';
}
```

### **4. Application Initialization**

```javascript
// Initialize authentication state on app startup
function initializeAuth() {
  const { accessToken, refreshToken, userData } = getStoredTokens();
  
  if (accessToken && refreshToken) {
    console.log('User authenticated:', userData?.email || userData?.customer_id);
    
    // Set authorization header for future requests
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    
    return {
      isAuthenticated: true,
      user: userData
    };
  } else {
    console.log('User not authenticated');
    return {
      isAuthenticated: false,
      user: null
    };
  }
}

// Call on app startup
const authState = initializeAuth();
```

### **5. React Hook Example**

```javascript
import { useState, useEffect, useContext, createContext } from 'react';

// Auth Context
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state on component mount
    const authState = initializeAuth();
    setUser(authState.user);
    setLoading(false);
  }, []);

  const loginUser = async (credentials) => {
    const result = await login(credentials);
    if (result.success) {
      setUser(result.data.user);
    }
    return result;
  };

  const logoutUser = async () => {
    await logout();
    setUser(null);
  };

  const value = {
    user,
    login: loginUser,
    logout: logoutUser,
    isAuthenticated: !!user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Usage in components
function Dashboard() {
  const { user, logout, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please login to access this page.</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.first_name}!</h1>
      <p>License Key: {localStorage.getItem(STORAGE_KEYS.LICENSE_KEY)}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

---

## ⚠️ **Important Security Considerations**

### **1. Token Storage Security**
```javascript
// ✅ Recommended for production
// Store refresh token in httpOnly cookie
// Store access token in memory or sessionStorage

// ⚠️ Current implementation (acceptable for development)
// Both tokens in localStorage

// Example secure storage setup
const TokenStorage = {
  setAccessToken: (token) => {
    // Store in memory for maximum security
    window.accessToken = token;
  },
  
  getAccessToken: () => {
    return window.accessToken;
  },
  
  setRefreshToken: (token) => {
    // Set httpOnly cookie (requires backend support)
    document.cookie = `refreshToken=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000`; // 30 days
  }
};
```

### **2. Token Validation**
```javascript
// Validate token expiry before making requests
function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true; // Invalid token format
  }
}

// Check before API calls
function makeAuthenticatedRequest(endpoint, options = {}) {
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  
  if (!accessToken || isTokenExpired(accessToken)) {
    console.log('Access token expired, interceptor will handle refresh');
  }
  
  return apiClient(endpoint, options);
}
```

### **3. Error Handling Best Practices**
```javascript
// Handle different error scenarios
function handleAuthError(error) {
  const errorCode = error.response?.data?.error;
  
  switch (errorCode) {
    case 'INVALID_CREDENTIALS':
      alert('Giriş bilgileri hatalı. Lütfen kontrol edin.');
      break;
      
    case 'INVALID_REFRESH_TOKEN':
      alert('Oturumunuz sona ermiş. Tekrar giriş yapmanız gerekiyor.');
      clearStoredTokens();
      window.location.href = '/login';
      break;
      
    case 'REFRESH_TOKEN_REQUIRED':
      alert('Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
      clearStoredTokens();
      window.location.href = '/login';
      break;
      
    default:
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
  }
}
```

---

## 🎯 **Quick Implementation Checklist**

- [ ] Set up axios interceptors for automatic token refresh
- [ ] Store both access and refresh tokens securely
- [ ] Handle 401 errors with automatic retry after refresh
- [ ] Clear tokens on logout and authentication failures
- [ ] Initialize auth state on app startup
- [ ] Validate token expiry before critical operations
- [ ] Implement proper error handling for all auth scenarios
- [ ] Test token refresh flow thoroughly
- [ ] Test logout functionality (both client and server-side)
- [ ] Handle network errors gracefully