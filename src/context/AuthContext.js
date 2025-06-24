import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // On mount, restore user from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('osgbUser');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        setUser(null);
      }
    }
  }, []);

  // When user changes, update localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('osgbUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('osgbUser');
    }
  }, [user]);

  // Login: set user
  const login = (userObj) => {
    setUser(userObj);
  };

  // Logout: clear user
  const logout = () => {
    setUser(null);
  };

  // Update user (e.g. after profile update)
  const updateUser = (userObj) => {
    setUser(userObj);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
