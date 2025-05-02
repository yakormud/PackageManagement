import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const RequireAuth = ({ children }) => {
  const { auth } = useContext(AuthContext);

  if (!auth) {
    console.log("AUTH PROTECTED WITH REQUIREAUTH")
    return <Navigate to="/login" />;
  }

  return children;
};

export default RequireAuth;

