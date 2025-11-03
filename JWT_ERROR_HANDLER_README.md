# JWT Error Handler Implementation - Testing Guide

## 📋 **Implementation Summary**

The JWT error handler has been successfully implemented to automatically handle "Invalid token" responses from the backend API. Here's what was added:

### **Files Modified/Created:**

1. **`src/api/authFetch.js`** - Enhanced with JWT error detection and handling
2. **`src/utils/jwtErrorHandler.js`** - Global fetch interceptor for all API calls
3. **`src/api/adminAuthFetch.js`** - Admin-specific JWT error handling
4. **`src/App.js`** - Initialized global error handler
5. **`src/components/TestJWTErrorHandler.js`** - Test component for verification
6. **`GUIDE_FOR_FE_JWT.md`** - Updated documentation

### **Key Features:**

✅ **Automatic Detection**: Detects `{"error":"Invalid token"}` in all API responses
✅ **Smart Routing**: Different handling for user vs admin APIs  
✅ **Logout API Call**: Automatically calls logout endpoint with refresh token
✅ **Token Cleanup**: Clears localStorage tokens  
✅ **Automatic Redirect**: Redirects to appropriate login page
✅ **Global Coverage**: Works with all fetch calls, not just authFetch

---

## 🧪 **Testing the Implementation**

### **Method 1: Using the Test Component**

1. Import the test component in any page:
```javascript
import TestJWTErrorHandler from '../components/TestJWTErrorHandler';

// Add to your component's JSX:
<TestJWTErrorHandler />
```

2. Click the test buttons to trigger invalid token scenarios
3. Verify automatic logout and redirect behavior

### **Method 2: Manual Testing with Browser DevTools**

1. Open browser DevTools → Network tab
2. Make any API call from the application
3. In DevTools, right-click the request → "Edit and Resend"
4. Modify the response to return `{"error":"Invalid token"}`
5. Verify the automatic logout and redirect

### **Method 3: Backend Testing**

1. Configure your backend to return `{"error":"Invalid token"}` for specific requests
2. Make API calls from the frontend
3. Verify automatic handling occurs

### **Method 4: Token Expiry Simulation**

1. In browser DevTools → Application → Local Storage
2. Modify the `osgbAccessToken` to an invalid value
3. Make authenticated API calls
4. Verify the error handling triggers

---

## 🔧 **Configuration**

### **Redirect URLs**

The current implementation redirects to:
- **User APIs**: `/giris` (relative URL - works in all environments)
- **Admin APIs**: `/admin/login` (relative URL - works in all environments)

The implementation uses relative URLs that automatically work in:
- Local development (e.g., `http://localhost:3000/giris`)
- Production environments (e.g., `https://yourdomain.com/giris`)
- Any custom domain or port configuration

To change these URLs, update the following files:
- `src/utils/jwtErrorHandler.js` (lines 15 and 29)
- `src/api/authFetch.js` (line 22)
- `src/api/adminAuthFetch.js` (line 11)

### **API Endpoints**

The logout API called is:
- **User logout**: `POST /api/osgb/logout`
- **Admin logout**: No API call (just token cleanup)

### **Headers and API Keys**

Make sure these environment variables are set:
```bash
REACT_APP_API_BASE_URL=your_api_base_url
REACT_APP_USER_API_KEY=your_user_api_key
REACT_APP_ADMIN_API_KEY=your_admin_api_key
```

---

## 🎯 **Expected Behavior**

When an API returns `{"error":"Invalid token"}`:

1. **Detection**: Error is automatically detected in response
2. **API Call**: Logout endpoint is called with refresh token (user APIs only)
3. **Cleanup**: All authentication tokens are removed from localStorage
4. **Redirect**: User is redirected to appropriate login page
5. **Logging**: Console logs are generated for debugging

### **Console Output Example**
```
Invalid token detected, initiating logout and redirect
Invalid admin token detected, initiating logout and redirect
```

---

## 🐛 **Troubleshooting**

### **Common Issues:**

1. **Redirect not working**
   - Check console for JavaScript errors
   - Verify the redirect URLs are accessible
   - Check if `window.location.href` is being called

2. **Error handler not triggered**
   - Verify API actually returns `{"error":"Invalid token"}`
   - Check browser Network tab for response body
   - Ensure global error handler is initialized

3. **Logout API failing**
   - Check if refresh token exists in localStorage
   - Verify API key and endpoint are correct
   - Check CORS settings if making cross-origin requests

### **Debug Steps:**

1. Open browser DevTools → Console
2. Look for error handler log messages
3. Check Network tab for API calls
4. Verify localStorage tokens are cleared after error

---

## 📚 **Related Documentation**

- **`GUIDE_FOR_FE_JWT.md`** - Complete JWT implementation guide
- **`src/context/AuthContext.js`** - Authentication state management
- **`src/api/authFetch.js`** - Enhanced fetch utility with error handling

---

## ✅ **Implementation Checklist**

- [x] Global fetch interceptor implemented
- [x] Enhanced authFetch with error handling
- [x] Admin API error handling
- [x] Automatic logout API call
- [x] Token cleanup functionality
- [x] Automatic redirect implementation
- [x] Test component created
- [x] Documentation updated
- [x] Error logging implemented
- [x] User/Admin API differentiation

The implementation is complete and ready for testing!