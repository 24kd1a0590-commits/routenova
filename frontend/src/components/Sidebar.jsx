import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Truck,
  PlusCircle,
  Share2,
  BarChart3,
  Car,
  FileCheck2,
  Settings,
  Radio,
  Zap,
  Navigation,
  MapPin,
  Sparkles,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { role } = useAuth();
  const uRole = (role || 'DISPATCHER').toUpperCase();

  let navItems = [];

  if (uRole === 'DRIVER') {
    navItems = [
      { label: 'Expo Presentation', icon: Sparkles, path: '/demo', badge: 'Demo' },
      { label: 'Assigned Routes', icon: Navigation, path: '/driver', highlight: true },
      { label: 'Delivery History', icon: Truck, path: '/deliveries' },
      { label: 'Report Outcome', icon: FileCheck2, path: '/outcomes' },
    ];
  } else if (uRole === 'SHIPPER') {
    navItems = [
      { label: 'Expo Presentation', icon: Sparkles, path: '/demo', badge: 'Demo' },
      { label: 'Create Delivery', icon: PlusCircle, path: '/deliveries/new', highlight: true },
      { label: 'Track Shipments', icon: Truck, path: '/deliveries' },
      { label: 'Destination Intelligence', icon: MapPin, path: '/destinations' },
      { label: 'Micropooling', icon: Share2, path: '/pooling' },
    ];
  } else if (uRole === 'FLEET_MANAGER') {
    navItems = [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
      { label: 'Expo Presentation', icon: Sparkles, path: '/demo', badge: 'Demo' },
      { label: 'Fleet Registry', icon: Car, path: '/vehicles', highlight: true },
      { label: 'Destinations', icon: MapPin, path: '/destinations' },
      { label: 'Deliveries', icon: Truck, path: '/deliveries' },
      { label: 'Analytics', icon: BarChart3, path: '/analytics' },
      { label: 'Outcome Evidence', icon: FileCheck2, path: '/outcomes' },
    ];
  } else {
    // ADMIN and DISPATCHER
    navItems = [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
      { label: 'Expo Presentation', icon: Sparkles, path: '/demo', badge: 'Expo' },
      { label: 'Deliveries', icon: Truck, path: '/deliveries', badge: 'Active' },
      { label: 'New Delivery', icon: PlusCircle, path: '/deliveries/new', highlight: true },
      { label: 'Destination Intelligence', icon: MapPin, path: '/destinations' },
      { label: 'Micropooling', icon: Share2, path: '/pooling', badge: 'Pools' },
      { label: 'Analytics', icon: BarChart3, path: '/analytics' },
      { label: 'Vehicles', icon: Car, path: '/vehicles' },
      { label: 'Local Evidence', icon: FileCheck2, path: '/outcomes' },
      { label: 'Settings', icon: Settings, path: '/settings' },
    ];
  }


  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-slate-950/95 border-r border-slate-800/80 z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Branding */}
        <div>
          <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-800/80">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-100 font-mono tracking-wider text-base">
                  ROUTE<span className="text-cyan-400">NOVA</span>
                </span>
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                Rural Logistics
              </p>
            </div>
          </div>

          {/* Nav List */}
          <nav className="p-3 space-y-1">
            <div className="px-3 py-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400">
              {uRole.replace('_', ' ')} Navigation
            </div>

            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                        : item.highlight
                        ? 'bg-slate-900 text-slate-200 hover:bg-slate-850 hover:text-white border border-slate-800 hover:border-slate-700'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <IconComponent
                      className={`w-4 h-4 transition-colors ${
                        item.highlight ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom System Status */}
        <div className="p-3 border-t border-slate-800/80">
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <div>
                <p className="text-xs font-medium text-slate-200 font-mono">System Status</p>
                <p className="text-[10px] text-slate-400 font-mono">Role Boundary Active</p>
              </div>
            </div>
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          </div>
        </div>
      </aside>
    </>
  );
}
