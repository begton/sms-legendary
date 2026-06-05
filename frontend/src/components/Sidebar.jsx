import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { LogOut, Menu, X } from 'lucide-react';

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/stockin', label: 'Stock In' },
  { to: '/stockout', label: 'Stock Out' },
  { to: '/report', label: 'Stock Report' },
  { to: '/users', label: 'Users' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <>
      {/* Mobile toggle */}
      <button onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 bg-blue-800 text-white p-2 rounded-lg shadow-lg">
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay */}
      {open && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-slate-950 text-slate-100 z-50 transform transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>

        {/* Close mobile */}
        <button onClick={() => setOpen(false)} className="md:hidden absolute top-4 right-4 text-slate-300">
          <X className="h-5 w-5" />
        </button>

        {/* Logo */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">
              <span className="text-sm font-semibold text-slate-100">D</span>
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">DAB Enterprise</p>
              <p className="text-slate-400 text-xs">Store Management</p>
            </div>
          </div>
        </div>

        {/* User */}
        <div className="px-6 py-4 border-b border-blue-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
              {user?.user_name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold">{user?.user_name}</p>
              <p className="text-blue-300 text-xs">Logged in</p>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="p-4 space-y-1 flex-1">
          {links.map(({ to, label }) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`
              }>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout}
            className="w-full px-4 py-3 rounded-xl text-sm font-medium text-slate-100 bg-slate-800 hover:bg-slate-700 transition-all duration-200">
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
