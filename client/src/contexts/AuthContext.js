import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }

        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('mbtiType');
            setUser(null);
          }
          throw new Error('Failed to check authentication');
        }

        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('mbtiType');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const register = async (username, email, password, mbtiType) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Attempting registration with:', {
        url: `${process.env.REACT_APP_API_URL}/api/auth/register`,
        username,
        email,
        mbtiType
      });

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username,
          email,
          password,
          mbtiType
        })
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.message || 'Failed to register';
        console.error('Registration failed:', {
          status: response.status,
          message: errorMessage
        });
        throw new Error(errorMessage);
      }

      if (!data.token) {
        console.error('No token received from server');
        throw new Error('Registration failed - no token received');
      }

      localStorage.setItem('token', data.token);
      if (data.user?.mbtiType) {
        localStorage.setItem('mbtiType', data.user.mbtiType);
      }
      setUser(data.user);

      console.log('Registration successful');
      return data.user;
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Attempting login with:', {
        url: `${process.env.REACT_APP_API_URL}/api/auth/login`,
        email
      });

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.message || 'Failed to login';
        console.error('Login failed:', {
          status: response.status,
          message: errorMessage
        });
        throw new Error(errorMessage);
      }

      if (!data.token) {
        console.error('No token received from server');
        throw new Error('Authentication failed - no token received');
      }

      // Store token and user data
      localStorage.setItem('token', data.token);
      if (data.user?.mbtiType) {
        localStorage.setItem('mbtiType', data.user.mbtiType);
      }
      
      // Set user state
      setUser(data.user);
      
      console.log('Login successful');
      return data.user;
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'An unexpected error occurred during login');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (token) {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          console.error('Logout failed:', response.statusText);
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('mbtiType');
      setUser(null);
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    register,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 