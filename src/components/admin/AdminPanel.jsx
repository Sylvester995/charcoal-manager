import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Shield, KeyRound, UserPlus, Trash2, Pencil,
  CheckCircle, AlertCircle, Eye, EyeOff, Mail, X, Check
} from 'lucide-react';

const ROLES = ['admin', 'manager', 'viewer'];

const RoleBadge = ({ role }) => {
  const styles = {
    superadmin: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/25',
    admin:      'bg-orange-500/10 text-orange-400 border-orange-500/25',
    manager:    'bg-blue-500/10   text-blue-400   border-blue-500/25',
    viewer:     'bg-stone-500/10  text-stone-400  border-stone-500/25',
  };
  return (
    <span className={`text-[9px] font-bold uppercase tracking-wider
      px-2 py-1 rounded-full border ${styles[role] || styles.viewer}`}>
      {role}
    </span>
  );
};

const AdminPanel = () => {
  const { user, users, changePassword, updateUserName, addUser, deleteUser } = useAuth();

  // Inline name editing
  const [editNameId,  setEditNameId]  = useState(null);
  const [editNameVal, setEditNameVal] = useState('');
  const [nameMsg,     setNameMsg]     = useState(null);

  // Password change
  const [pwUserId,  setPwUserId]  = useState('');
  const [newPw,     setNewPw]     = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw,    setShowPw]    = useState(false);
  const [pwMsg,     setPwMsg]     = useState(null);

  // Add user
  const [newUsername, setNewUsername] = useState('');
  const [newName,     setNewName]     = useState('');
  const [newEmail,    setNewEmail]    = useState('');
  const [newRole,     setNewRole]     = useState('viewer');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPw,   setShowNewPw]   = useState(false);
  const [addMsg,      setAddMsg]      = useState(null);

  // Delete
  const [deleteId, setDeleteId] = useState(null);
  const [delMsg,   setDelMsg]   = useState(null);

  if (user?.role !== 'superadmin') {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Shield className="w-12 h-12 mb-4 text-red-500" />
        <p className="text-white font-bold text-lg">Access Denied</p>
        <p className="text-stone-500 text-sm mt-1">
          Only Super Admin can access this panel.
        </p>
      </div>
    );
  }

  const Message = ({ msg }) => {
    if (!msg) return null;
    return (
      <div className={`flex items-center gap-2 rounded-lg px-4 py-3 mb-4 ${
        msg.ok
          ? 'bg-green-950/40 border border-green-700/40'
          : 'bg-red-950/40  border border-red-700/40'
      }`}>
        {msg.ok
          ? <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
          : <AlertCircle className="w-4 h-4 text-red-400   flex-shrink-0" />
        }
        <p className={`text-sm ${msg.ok ? 'text-green-400' : 'text-red-400'}`}>
          {msg.text}
        </p>
      </div>
    );
  };

  const startEditName = (u) => {
    setEditNameId(u.id);
    setEditNameVal(u.name);
    setNameMsg(null);
  };

  const handleSaveName = async (userId) => {
    const result = await updateUserName(userId, editNameVal);
    if (result.success) {
      setNameMsg({ ok: true, text: 'Name updated successfully!' });
      setEditNameId(null);
      setTimeout(() => setNameMsg(null), 3000);
    } else {
      setNameMsg({ ok: false, text: result.message });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMsg(null);
    if (!pwUserId) {
      setPwMsg({ ok: false, text: 'Please select a user.' });
      return;
    }
    if (newPw !== confirmPw) {
      setPwMsg({ ok: false, text: 'Passwords do not match.' });
      return;
    }
    const result = await changePassword(Number(pwUserId), newPw);
    if (result.success) {
      setPwMsg({ ok: true, text: 'Password changed successfully!' });
      setPwUserId(''); setNewPw(''); setConfirmPw('');
    } else {
      setPwMsg({ ok: false, text: result.message });
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddMsg(null);
    const result = await addUser(newUsername, newEmail, newPassword, newRole, newName);
    if (result.success) {
      setAddMsg({ ok: true, text: `User "${newUsername}" added successfully!` });
      setNewUsername(''); setNewName('');
      setNewEmail('');    setNewPassword('');
      setNewRole('viewer');
    } else {
      setAddMsg({ ok: false, text: result.message });
    }
  };

  const handleDelete = async (id) => {
    const result = await deleteUser(id);
    if (result.success) {
      setDelMsg({ ok: true, text: 'User deleted successfully.' });
      setTimeout(() => setDelMsg(null), 3000);
    } else {
      setDelMsg({ ok: false, text: result.message });
    }
    setDeleteId(null);
  };

  return (
    <div className="space-y-6 max-w-4xl">

      <div>
        <h2 className="text-3xl font-black text-white tracking-tight">
          Admin Panel
        </h2>
        <p className="text-stone-500 text-sm mt-1">
          Manage users and passwords — Super Admin only
        </p>
      </div>

      <div className="flex items-center gap-3 bg-yellow-950/20 border
        border-yellow-700/25 rounded-xl px-5 py-4">
        <Shield className="w-4 h-4 text-yellow-400 flex-shrink-0" />
        <p className="text-yellow-300 text-sm">
          You are logged in as <strong>Super Admin</strong>.
          To change your own name or password, visit{' '}
          <strong>My Account</strong> in the sidebar.
        </p>
      </div>

      {/* ── USERS TABLE ── */}
      <div className="bg-[#161410] border border-[#302b22] rounded-xl p-6">
        <h3 className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-5">
          All Users
        </h3>
        <Message msg={delMsg} />
        <Message msg={nameMsg} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#302b22]">
                {['Name', 'Username', 'Email', 'Role', 'Actions'].map(h => (
                  <th key={h}
                    className="text-left text-[9px] uppercase tracking-widest
                      text-stone-600 pb-3 pr-4 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}
                  className="border-b border-[#302b22]/50
                    hover:bg-orange-500/5 transition-colors">

                  {/* Name — inline editable */}
                  <td className="py-3 pr-4">
                    {editNameId === u.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editNameVal}
                          onChange={e => setEditNameVal(e.target.value)}
                          className="bg-[#1e1b16] border border-orange-600 rounded-lg
                            px-3 py-1.5 text-white text-xs focus:outline-none w-36"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveName(u.id)}
                          className="text-green-400 hover:text-green-300 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditNameId(null)}
                          className="text-stone-500 hover:text-white transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white whitespace-nowrap">
                          {u.name}
                        </span>
                        {u.id === user.id && (
                          <span className="text-[9px] text-yellow-400 font-mono">
                            (you)
                          </span>
                        )}
                        {u.role !== 'superadmin' && (
                          <button
                            onClick={() => startEditName(u)}
                            className="text-stone-700 hover:text-orange-400
                              transition-colors ml-1"
                            title="Edit name"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </td>

                  <td className="py-3 pr-4 font-mono text-stone-400 text-xs">
                    {u.username}
                  </td>
                  <td className="py-3 pr-4 text-stone-400 text-xs whitespace-nowrap">
                    {u.email}
                  </td>
                  <td className="py-3 pr-4">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="py-3">
                    {u.role === 'superadmin' ? (
                      <span className="text-stone-700 text-xs">Protected</span>
                    ) : deleteId === u.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="text-[10px] bg-red-600 hover:bg-red-500
                            text-white px-2 py-1 rounded font-bold transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteId(null)}
                          className="text-[10px] text-stone-500 hover:text-white
                            px-2 py-1 rounded border border-[#302b22] transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteId(u.id)}
                        className="text-stone-700 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── CHANGE PASSWORD ── */}
      <div className="bg-[#161410] border border-[#302b22] rounded-xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <KeyRound className="w-4 h-4 text-orange-400" />
          <h3 className="text-stone-400 text-xs font-bold uppercase tracking-widest">
            Change User Password
          </h3>
        </div>
        <Message msg={pwMsg} />
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[9px] uppercase tracking-widest
                text-stone-500 mb-2">
                Select User
              </label>
              <select
                value={pwUserId}
                onChange={e => setPwUserId(e.target.value)}
                className="w-full bg-[#1e1b16] border border-[#302b22] rounded-lg
                  px-4 py-3 text-white text-sm focus:outline-none
                  focus:border-orange-600 transition-colors"
              >
                <option value="">-- Choose user --</option>
                {users
                  .filter(u => u.role !== 'superadmin')
                  .map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.username})
                    </option>
                  ))
                }
              </select>
            </div>
            <div>
              <label className="block text-[9px] uppercase tracking-widest
                text-stone-500 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full bg-[#1e1b16] border border-[#302b22] rounded-lg
                    px-4 pr-10 py-3 text-white text-sm placeholder-stone-700
                    focus:outline-none focus:border-orange-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                    text-stone-600 hover:text-white transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[9px] uppercase tracking-widest
                text-stone-500 mb-2">
                Confirm Password
              </label>
              <input
                type={showPw ? 'text' : 'password'}
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                placeholder="Re-enter password"
                className="w-full bg-[#1e1b16] border border-[#302b22] rounded-lg
                  px-4 py-3 text-white text-sm placeholder-stone-700
                  focus:outline-none focus:border-orange-600 transition-colors"
              />
            </div>
          </div>
          {newPw && confirmPw && (
            <p className={`text-xs ${
              newPw === confirmPw ? 'text-green-400' : 'text-red-400'
            }`}>
              {newPw === confirmPw ? '✓ Passwords match' : '✗ Passwords do not match'}
            </p>
          )}
          <button
            type="submit"
            className="bg-orange-600 hover:bg-orange-500 text-white font-bold
              px-6 py-3 rounded-xl transition-colors flex items-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            Change Password
          </button>
        </form>
      </div>

      {/* ── ADD NEW USER ── */}
      <div className="bg-[#161410] border border-[#302b22] rounded-xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <UserPlus className="w-4 h-4 text-orange-400" />
          <h3 className="text-stone-400 text-xs font-bold uppercase tracking-widest">
            Add New User
          </h3>
        </div>
        <Message msg={addMsg} />
        <form onSubmit={handleAddUser} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-[9px] uppercase tracking-widest
                text-stone-500 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Sylvester McDaniel"
                required
                className="w-full bg-[#1e1b16] border border-[#302b22] rounded-lg
                  px-4 py-3 text-white text-sm placeholder-stone-700
                  focus:outline-none focus:border-orange-600 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase tracking-widest
                text-stone-500 mb-2">
                Username
              </label>
              <input
                type="text"
                value={newUsername}
                onChange={e => setNewUsername(e.target.value)}
                placeholder="e.g. sylvester"
                required
                className="w-full bg-[#1e1b16] border border-[#302b22] rounded-lg
                  px-4 py-3 text-white text-sm placeholder-stone-700
                  focus:outline-none focus:border-orange-600 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase tracking-widest
                text-stone-500 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2
                  w-4 h-4 text-stone-600" />
                <input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="user@example.com"
                  required
                  className="w-full bg-[#1e1b16] border border-[#302b22] rounded-lg
                    pl-10 pr-4 py-3 text-white text-sm placeholder-stone-700
                    focus:outline-none focus:border-orange-600 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-[9px] uppercase tracking-widest
                text-stone-500 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showNewPw ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                  className="w-full bg-[#1e1b16] border border-[#302b22] rounded-lg
                    px-4 pr-10 py-3 text-white text-sm placeholder-stone-700
                    focus:outline-none focus:border-orange-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                    text-stone-600 hover:text-white transition-colors"
                >
                  {showNewPw
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye    className="w-4 h-4" />
                  }
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[9px] uppercase tracking-widest
                text-stone-500 mb-2">
                Role
              </label>
              <select
                value={newRole}
                onChange={e => setNewRole(e.target.value)}
                className="w-full bg-[#1e1b16] border border-[#302b22] rounded-lg
                  px-4 py-3 text-white text-sm focus:outline-none
                  focus:border-orange-600 transition-colors"
              >
                {ROLES.map(r => (
                  <option key={r} value={r}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="bg-orange-600 hover:bg-orange-500 text-white font-bold
              px-6 py-3 rounded-xl transition-colors flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Add User
          </button>
        </form>
      </div>

    </div>
  );
};

export default AdminPanel;