import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, restore user and tokens from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('osgbUser');
    const storedAccessToken = localStorage.getItem('osgbAccessToken');
    const storedRefreshToken = localStorage.getItem('osgbRefreshToken');
    let parsedUser = null;
    if (storedUser) {
      try {
        parsedUser = JSON.parse(storedUser);
      } catch (e) {
        parsedUser = null;
      }
    }
    // Merge tokens into user object for compatibility
    if (parsedUser) {
      if (storedAccessToken) parsedUser.accessToken = storedAccessToken;
      if (storedRefreshToken) parsedUser.refreshToken = storedRefreshToken;
      setUser(parsedUser);
    } else {
      setUser(null);
    }
    setAccessToken(storedAccessToken || null);
    setRefreshToken(storedRefreshToken || null);
    setLoading(false);
  }, []);

  // When user or tokens change, update localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('osgbUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('osgbUser');
    }
    if (accessToken) {
      localStorage.setItem('osgbAccessToken', accessToken);
    } else {
      localStorage.removeItem('osgbAccessToken');
    }
    if (refreshToken) {
      localStorage.setItem('osgbRefreshToken', refreshToken);
    } else {
      localStorage.removeItem('osgbRefreshToken');
    }
  }, [user, accessToken, refreshToken]);

  // Login: set user and tokens
  const login = ({ user: userObj, accessToken, refreshToken }) => {
    // Merge tokens into user object for compatibility
    const mergedUser = { ...userObj, accessToken, refreshToken };
    setUser(mergedUser);
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
  };

  // Logout: call BE logout API, then clear user and tokens
  const logout = async () => {
    try {
      if (refreshToken) {
        await fetch('https://customers.katipotomasyonu.com/api/osgb/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.REACT_APP_USER_API_KEY,
          },
          body: JSON.stringify({ refreshToken })
        });
      }
    } catch (e) {
      // Ignore errors, always clear tokens
    } finally {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
    }
  };

  // Update user (e.g. after profile update)
  const updateUser = (userObj) => {
    // If tokens are not present in userObj, merge from state
    const mergedUser = {
      ...userObj,
      accessToken: userObj.accessToken || accessToken,
      refreshToken: userObj.refreshToken || refreshToken,
    };
    setUser(mergedUser);
  };

  // Update access token only (after refresh)
  const updateAccessToken = (newToken) => {
    setAccessToken(newToken);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, refreshToken, login, logout, updateUser, updateAccessToken, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
