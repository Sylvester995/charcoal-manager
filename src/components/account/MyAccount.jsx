import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  User, KeyRound, Mail, CheckCircle,
  AlertCircle, Eye, EyeOff, ShieldCheck, Pencil
} from 'lucide-react';

const MyAccount = () => {
  const { user, updateOwnName, updateOwnEmail, changeOwnPassword } = useAuth();

  // Name form
  const [newName,  setNewName]  = useState('');
  const [nameMsg,  setNameMsg]  = useState(null);

  // Email form
  const [newEmail, setNewEmail] = useState('');
  const [emailMsg, setEmailMsg] = useState(null);

  // Password form
  const [currPw,    setCurrPw]    = useState('');
  const [newPw,     setNewPw]     = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw,    setShowPw]    = useState(false);
  const [pwMsg,     setPwMsg]     = useState(null);

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

  const handleUpdateName = (e) => {
    e.preventDefault();
    setNameMsg(null);
    const result = updateOwnName(newName);
    if (result.success) {
      setNameMsg({ ok: true, text: 'Name updated! The greeting will update on next page load.' });
      setNewName('');
    } else {
      setNameMsg({ ok: false, text: result.message });
    }
  };

  const handleUpdateEmail = (e) => {
    e.preventDefault();
    setEmailMsg(null);
    const result = updateOwnEmail(newEmail);
    if (result.success) {
      setEmailMsg({ ok: true, text: 'Email updated successfully!' });
      setNewEmail('');
    } else {
      setEmailMsg({ ok: false, text: result.message });
    }
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setPwMsg(null);
    if (newPw !== confirmPw) {
      setPwMsg({ ok: false, text: 'New passwords do not match.' });
      return;
    }
    const result = changeOwnPassword(currPw, newPw);
    if (result.success) {
      setPwMsg({ ok: true, text: 'Password changed successfully!' });
      setCurrPw(''); setNewPw(''); setConfirmPw('');
    } else {
      setPwMsg({ ok: false, text: result.message });
    }
  };

  return (
    <div className="space-y-6 max-w-2xl w-full px-1">

      {/* Page header */}
      <div>
        <h2 className="text-3xl font-black text-white tracking-tight">
          My Account
        </h2>
        <p className="text-stone-500 text-sm mt-1">
          Manage your personal login credentials
        </p>
      </div>

      {/* Profile card */}
  <div className="bg-[#161410] border border-[#302b22] rounded-xl p-6">
    <div className="flex items-start gap-4">

    {/* Avatar */}
    <div className="w-14 h-14 rounded-2xl bg-orange-600 flex items-center
      justify-center text-white text-xl font-black flex-shrink-0">
      {user?.name?.charAt(0)}
    </div>

    {/* Info + badge stacked */}
      <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between gap-2">
        <div className="text-white font-bold text-lg leading-tight break-words">
          {user?.name}
        </div>

        {/* Badge — stays in top right, never overflows */}
        <div className={`inline-flex items-center gap-1 px-2 py-1 flex-shrink-0
          rounded-full text-[9px] font-bold uppercase tracking-wider border ${
          user?.role === 'superadmin'
            ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
            : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
        }`}>
          {user?.role === 'superadmin' && <ShieldCheck className="w-3 h-3" />}
          {user?.role}
         </div>
         </div>
         <div className="text-stone-500 text-sm font-mono mt-1">
        @{user?.username}
         </div>
         <div className="text-stone-500 text-sm mt-0.5 break-all">
        {user?.email}
         </div>
       </div>
        </div>
      </div>

      {/* ── UPDATE NAME ── */}
      <div className="bg-[#161410] border border-[#302b22] rounded-xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Pencil className="w-4 h-4 text-orange-400" />
          <h3 className="text-stone-400 text-xs font-bold uppercase tracking-widest">
            Update Display Name
          </h3>
        </div>

        <Message msg={nameMsg} />

        {/* Current name */}
        <div className="bg-[#1e1b16] border border-[#302b22] rounded-lg
          px-4 py-3 mb-4">
          <div className="text-[9px] uppercase tracking-widest text-stone-600 mb-1">
            Current Name
          </div>
          <div className="text-stone-300 text-sm font-semibold">{user?.name}</div>
        </div>

        <form onSubmit={handleUpdateName} className="space-y-4">
          <div>
            <label className="block text-[9px] uppercase tracking-widest
              text-stone-500 mb-2">
              New Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2
                w-4 h-4 text-stone-600" />
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Sylvester McDaniel"
                required
                className="w-full bg-[#1e1b16] border border-[#302b22] rounded-lg
                  pl-10 pr-4 py-3 text-white text-sm placeholder-stone-700
                  focus:outline-none focus:border-orange-600 transition-colors"
              />
            </div>
            <p className="text-[10px] text-stone-600 mt-1">
              This is the name shown in the greeting and topbar
            </p>
          </div>
          <button
            type="submit"
            className="bg-orange-600 hover:bg-orange-500 text-white font-bold
              px-6 py-3 rounded-xl transition-colors flex items-center gap-2"
          >
            <Pencil className="w-4 h-4" />
            Update Name
          </button>
        </form>
      </div>

      {/* ── UPDATE EMAIL ── */}
      <div className="bg-[#161410] border border-[#302b22] rounded-xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Mail className="w-4 h-4 text-orange-400" />
          <h3 className="text-stone-400 text-xs font-bold uppercase tracking-widest">
            Update Email Address
          </h3>
        </div>

        <Message msg={emailMsg} />

        {/* Current email */}
        <div className="bg-[#1e1b16] border border-[#302b22] rounded-lg
          px-4 py-3 mb-4">
          <div className="text-[9px] uppercase tracking-widest text-stone-600 mb-1">
            Current Email
          </div>
          <div className="text-stone-300 text-sm font-mono">{user?.email}</div>
        </div>

        <form onSubmit={handleUpdateEmail} className="space-y-4">
          <div>
            <label className="block text-[9px] uppercase tracking-widest
              text-stone-500 mb-2">
              New Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2
                w-4 h-4 text-stone-600" />
              <input
                type="email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder="Enter new email address"
                required
                className="w-full bg-[#1e1b16] border border-[#302b22] rounded-lg
                  pl-10 pr-4 py-3 text-white text-sm placeholder-stone-700
                  focus:outline-none focus:border-orange-600 transition-colors"
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-orange-600 hover:bg-orange-500 text-white font-bold
              px-6 py-3 rounded-xl transition-colors flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Update Email
          </button>
        </form>
      </div>

      {/* ── CHANGE PASSWORD ── */}
      <div className="bg-[#161410] border border-[#302b22] rounded-xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <KeyRound className="w-4 h-4 text-orange-400" />
          <h3 className="text-stone-400 text-xs font-bold uppercase tracking-widest">
            Change My Password
          </h3>
        </div>

        <Message msg={pwMsg} />

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-[9px] uppercase tracking-widest
              text-stone-500 mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={currPw}
                onChange={e => setCurrPw(e.target.value)}
                placeholder="Enter your current password"
                required
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
              New Password
            </label>
            <input
              type={showPw ? 'text' : 'password'}
              value={newPw}
              onChange={e => setNewPw(e.target.value)}
              placeholder="Min. 6 characters"
              required
              className="w-full bg-[#1e1b16] border border-[#302b22] rounded-lg
                px-4 py-3 text-white text-sm placeholder-stone-700
                focus:outline-none focus:border-orange-600 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[9px] uppercase tracking-widest
              text-stone-500 mb-2">
              Confirm New Password
            </label>
            <input
              type={showPw ? 'text' : 'password'}
              value={confirmPw}
              onChange={e => setConfirmPw(e.target.value)}
              placeholder="Re-enter new password"
              required
              className="w-full bg-[#1e1b16] border border-[#302b22] rounded-lg
                px-4 py-3 text-white text-sm placeholder-stone-700
                focus:outline-none focus:border-orange-600 transition-colors"
            />
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

    </div>
  );
};

export default MyAccount;