import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, Bell, Menu, User, Sparkles, LogOut, RotateCcw } from 'lucide-react';
import DemoResetModal from './DemoResetModal';

export default function Topbar({ onMenuClick }) {
  const navigate = useNavigate();
  const { user, role, logout, getFriendlyRoleTitle } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabel = role ? role.replace('_', ' ') : 'DISPATCHER';

  return (
    <header className="h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30 font-sans">
      {/* Left: Mobile Toggle & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 lg:hidden border border-slate-800"
          aria-label="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full hidden sm:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search delivery ID, village, or corridor..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-900/90 text-xs text-slate-200 placeholder-slate-500 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono"
          />
        </div>
      </div>

      {/* Right: User Role Title & Actions */}
      <div className="flex items-center gap-3">
        {/* Reset Demo Data Action Button */}
        <button
          onClick={() => setResetModalOpen(true)}
          title="Restore application to clean demonstration scenario"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-mono text-amber-300 font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="hidden sm:inline">Reset Demo Data</span>
        </button>

        {/* Friendly Signed-in Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300 font-bold">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>{getFriendlyRoleTitle()}</span>
        </div>

        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-3 animate-fade-in font-mono">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-200 uppercase">System Alerts</span>
                <span className="text-[10px] text-cyan-400">2 Live Alerts</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded bg-slate-950 border border-rose-500/20 text-slate-300">
                  <p className="font-semibold text-rose-400 text-[11px]">HIGH RISK ALERT</p>
                  <p className="text-[11px]">Rampuram Sector 4 — Mud rutting hazard flagged.</p>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-cyan-500/20 text-slate-300">
                  <p className="font-semibold text-cyan-400 text-[11px]">MICROPOOL MATCH</p>
                  <p className="text-[11px]">Pathapatnam & Rampuram bundle available.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Sign Out */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold text-xs font-mono flex items-center justify-center border border-cyan-400/30 shadow-md">
            {user?.full_name ? user.full_name.charAt(0) : 'U'}
          </div>
          <div className="hidden md:block text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-200 truncate max-w-[110px]">
                {user?.full_name || 'RouteNova User'}
              </span>
              <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-400 rounded border border-cyan-500/30 uppercase">
                {roleLabel}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block font-mono">{user?.email || 'user@routenova.com'}</span>
          </div>

          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 border border-slate-800 transition-colors ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <DemoResetModal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        onSuccess={() => window.location.reload()}
      />
    </header>
  );
}
