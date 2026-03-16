import React, { createContext, useState, useEffect } from 'react';
import { Storage } from '../utils/storage';
import client from '../api/client';

export const AuthContext = createContext();

export const AuthProvider = ({ children, onAuthChange }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const token = await Storage.getItem('token');
            const userData = await Storage.getItem('user');
            if (token && userData) {
                setUser(JSON.parse(userData));
            }
        } catch (e) {
            console.log(e);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email, password) => {
        const res = await client.post('/auth/login', { email, password });
        await Storage.setItem('token', res.data.token);
        await Storage.setItem('user', JSON.stringify(res.data.user));
        setUser(res.data.user);
    };

    const register = async (name, email, password) => {
        await client.post('/auth/register', { name, email, password });
    };

    const logout = async () => {
        try {
            await Storage.removeItem('token');
            await Storage.removeItem('user');
            setUser(null);
            if (onAuthChange) onAuthChange();
        } catch (e) {
            console.log("Logout error:", e);
        }
    };

    const updateProfile = async (data) => {
        const res = await client.put('/auth/profile', data);
        await Storage.setItem('user', JSON.stringify(res.data));
        setUser(res.data);
        return res.data;
    };

    const changePassword = async (currentPassword, newPassword) => {
        const res = await client.put('/auth/password', { currentPassword, newPassword });
        return res.data;
    };

    const registerShop = async (shopData) => {
        const res = await client.post('/shop-requests/register', shopData);
        return res.data;
    };

    const refreshUser = async () => {
        try {
            const res = await client.get('/auth/me');
            await Storage.setItem('user', JSON.stringify(res.data));
            setUser(res.data);
            return res.data;
        } catch (e) {
            console.log("Refresh user error:", e);
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            isLoading, 
            login, 
            register, 
            logout, 
            updateProfile, 
            changePassword,
            refreshUser,
            registerShop 
        }}>
            {children}
        </AuthContext.Provider>
    );
};
