import React, { createContext, useState, useEffect } from 'react';
import api from './utils/api';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const auth = useState(null);

    return (
        <AuthContext.Provider value={{ }}>
            {auth === null ? <div>Loading...</div> : children}
        </AuthContext.Provider>
    );
};

export default AuthContext;