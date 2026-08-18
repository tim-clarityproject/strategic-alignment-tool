import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../config/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setLoading(false);
        setAuthError(null);
      }, (error) => {
        console.error('Auth state change error:', error);
        setAuthError(error.message);
        setLoading(false);
      });
      return unsubscribe;
    } catch (error) {
      console.error('AuthProvider initialization error:', error);
      setAuthError(error.message);
      setLoading(false);
    }
  }, []);

  const signup = async (email, password, displayName) => {
    try {
      console.log('Attempting signup with email:', email);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Signup successful:', result.user.uid);
      await updateProfile(result.user, { displayName });
      setAuthError(null);
      return result.user;
    } catch (error) {
      console.error('Signup error:', error.code, error.message);
      setAuthError(error.message);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Attempting login with email:', email);
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful:', result.user.uid);
      setAuthError(null);
      return result.user;
    } catch (error) {
      console.error('Login error:', error.code, error.message);
      setAuthError(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setAuthError(null);
    } catch (error) {
      console.error('Logout error:', error);
      setAuthError(error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout, authError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
