import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    // Initial load: parse token to load user data if available
    useEffect(() => {
        const loadUserFromToken = async () => {
            if (token && !user) {
                try {
                    const response = await api.get('/auth/me');
                    setUser(response.data);
                } catch (error) {
                    console.error('Failed to load user:', error);
                    // Only logout if the token was actually invalid (401)
                    if (error.response?.status === 401) {
                        logout();
                    }
                }
            }
            setLoading(false);
        };
        loadUserFromToken();
    }, [token, user]);

    const register = async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    };

    const verifyOTP = async (email, otp) => {
        const response = await api.post('/auth/verify-otp', { email, otp });
        if (response.data.token) {
            setToken(response.data.token);
            setUser(response.data); 
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    };

    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        if (response.data.token) {
            setToken(response.data.token);
            setUser(response.data);
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, token, register, verifyOTP, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
