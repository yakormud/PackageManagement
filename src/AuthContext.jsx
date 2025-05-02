import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode }  from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(false);
  const [id, setId] = useState(null);
  const [username, setUsername] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    console.log("CONTEXXXXXXT")

    if (storedToken && storedUser) {
        try {
          const decoded = jwtDecode(storedToken);
          //แปลงจาก ms -> s เพราะ jwt-token เก็บเป็น s
          const now = Date.now() / 1000;
  
          if (decoded.exp > now) {
            login(JSON.parse(storedUser), storedToken);
          } else {
            logout();
          }
        } catch (err) {
          console.error("Token decode error:", err);
          logout();
        }
      }
  }, []);

  const login = (userData, token) => {
    setAuth(true);
    setId(userData.id);
    setUsername(userData.username);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setAuth(false);
    setId(null);
    setUsername(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ auth, id, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
