import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';
import useAutoLogout from '../hooks/useAutoLogout';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);

  // Load logged in user from localStorage on startup
  useEffect(() => {
    const stored = localStorage.getItem('coal_user');
    if (stored) setUser(JSON.parse(stored));
    fetchUsers();
  }, []);

  

  const fetchUsers = async () => {
    const { data } = await supabase.from('users').select('*');
    if (data) setUsers(data);
    setLoading(false);
  };

const login = async (identifier, password) => {
  console.log('Login attempt:', identifier, password);

  const { data, error } = await supabase
    .from('users')
    .select('*');

  console.log('All users:', data);
  console.log('Error:', error);

  if (error || !data || data.length === 0) {
    return { success: false, message: 'Could not reach database' };
  }
  console.log('Checking:', data.map(u => ({ 
  username: u.username, 
  storedPw: u.password, 
  inputPw: password,
  match: u.password === password 
})));

  const found = data.find(
    u =>
      (u.username === identifier || u.email === identifier) &&
      u.password === password
  );

  console.log('Found user:', found);

  if (!found) {
    return { success: false, message: 'Invalid username, email or password' };
  }

  const userData = {
    id:       found.id,
    username: found.username,
    email:    found.email,
    role:     found.role,
    name:     found.name,
  };
  setUser(userData);
  localStorage.setItem('coal_user', JSON.stringify(userData));
  return { success: true };
};

  const logout = () => {
    setUser(null);
    localStorage.removeItem('coal_user');
  };
  
  // Auto logout after 15 minutes of inactivity
  useAutoLogout(logout);

  // Update own name
  const updateOwnName = async (newName) => {
    if (!user) return { success: false, message: 'Not logged in' };
    if (!newName || newName.trim().length < 2) {
      return { success: false, message: 'Name must be at least 2 characters' };
    }
    const { error } = await supabase
      .from('users')
      .update({ name: newName.trim() })
      .eq('id', user.id);

    if (error) return { success: false, message: error.message };

    const updatedUser = { ...user, name: newName.trim() };
    setUser(updatedUser);
    localStorage.setItem('coal_user', JSON.stringify(updatedUser));
    await fetchUsers();
    return { success: true };
  };

  // Update own email
  const updateOwnEmail = async (newEmail) => {
    if (!user) return { success: false, message: 'Not logged in' };
    if (!newEmail || !newEmail.includes('@')) {
      return { success: false, message: 'Please enter a valid email address' };
    }
    const taken = users.find(u => u.email === newEmail && u.id !== user.id);
    if (taken) {
      return { success: false, message: 'Email already in use by another account' };
    }
    const { error } = await supabase
      .from('users')
      .update({ email: newEmail })
      .eq('id', user.id);

    if (error) return { success: false, message: error.message };

    const updatedUser = { ...user, email: newEmail };
    setUser(updatedUser);
    localStorage.setItem('coal_user', JSON.stringify(updatedUser));
    await fetchUsers();
    return { success: true };
  };

  // Change own password
  const changeOwnPassword = async (currentPassword, newPassword) => {
    if (!user) return { success: false, message: 'Not logged in' };
    const found = users.find(
      u => u.id === user.id && u.password === currentPassword
    );
    if (!found) {
      return { success: false, message: 'Current password is incorrect' };
    }
    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters' };
    }
    if (currentPassword === newPassword) {
      return { success: false, message: 'New password must be different from current' };
    }
    const { error } = await supabase
      .from('users')
      .update({ password: newPassword })
      .eq('id', user.id);

    if (error) return { success: false, message: error.message };
    await fetchUsers();
    return { success: true };
  };

  // Change ANY user's password — superadmin only
  const changePassword = async (userId, newPassword) => {
    if (user?.role !== 'superadmin') {
      return { success: false, message: 'Unauthorized' };
    }
    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters' };
    }
    const { error } = await supabase
      .from('users')
      .update({ password: newPassword })
      .eq('id', userId);

    if (error) return { success: false, message: error.message };
    await fetchUsers();
    return { success: true };
  };

  // Update ANY user's name — superadmin only
  const updateUserName = async (userId, newName) => {
    if (user?.role !== 'superadmin') {
      return { success: false, message: 'Unauthorized' };
    }
    if (!newName || newName.trim().length < 2) {
      return { success: false, message: 'Name must be at least 2 characters' };
    }
    const { error } = await supabase
      .from('users')
      .update({ name: newName.trim() })
      .eq('id', userId);

    if (error) return { success: false, message: error.message };
    await fetchUsers();
    return { success: true };
  };

  // Add new user — superadmin only
  const addUser = async (username, email, password, role, name) => {
    if (user?.role !== 'superadmin') {
      return { success: false, message: 'Unauthorized' };
    }
    if (users.find(u => u.username === username)) {
      return { success: false, message: 'Username already exists' };
    }
    if (users.find(u => u.email === email)) {
      return { success: false, message: 'Email already exists' };
    }
    if (!password || password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters' };
    }
    if (!name || name.trim().length < 2) {
      return { success: false, message: 'Please enter a valid full name' };
    }
    const { error } = await supabase
      .from('users')
      .insert([{ username, email, password, role, name: name.trim() }]);

    if (error) return { success: false, message: error.message };
    await fetchUsers();
    return { success: true };
  };

  // Delete user — superadmin only
  const deleteUser = async (userId) => {
    if (user?.role !== 'superadmin') {
      return { success: false, message: 'Unauthorized' };
    }
    if (userId === user.id) {
      return { success: false, message: 'Cannot delete your own account' };
    }
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) return { success: false, message: error.message };
    await fetchUsers();
    return { success: true };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c0b09] flex items-center
        justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center
            justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white text-2xl">🔥</span>
          </div>
          <p className="text-stone-500 text-sm">Loading Charcoal Manager...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      user, users,
      login, logout,
      updateOwnName, updateOwnEmail, changeOwnPassword,
      changePassword, updateUserName,
      addUser, deleteUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);