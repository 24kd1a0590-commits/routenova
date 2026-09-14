import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import MetricCard from '../components/MetricCard';
import RiskBadge from '../components/RiskBadge';
import ExplainabilityModal from '../components/ExplainabilityModal';
import {
  SYSTEM_STATS as FALLBACK_STATS,
  DELIVERY_ALERTS as FALLBACK_ALERTS,
  RECENT_DELIVERIES as FALLBACK_RECENT,
  IMPACT_METRICS as FALLBACK_METRICS,
} from '../data/seedData';
import { SHIPMENTS } from '../data/index';
import { getDashboardSummaryAsync, getShipmentsAsync, getVehiclesAsync } from '../services/dataService';
import {
  Truck,
  AlertTriangle,
  Share2,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  ChevronRight,
  Activity,
  PlusCircle,
  BarChart3,
  Car,
  CheckCircle2,
  Clock,
  Wifi,
  WifiOff,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, role, getFriendlyRoleTitle } = useAuth();
  const uRole = (role || 'DISPATCHER').toUpperCase();

  const [selectedDeliveryForModal, setSelectedDeliveryForModal] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    systemStats: FALLBACK_STATS,
    deliveryAlerts: FALLBACK_ALERTS,
    recentDeliveries: FALLBACK_RECENT,
    impactMetrics: FALLBACK_METRICS,
    isBackendConnected: false,
  });

  const [allShipments, setAllShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([getDashboardSummaryAsync(), getShipmentsAsync()]).then(([sumRes, shipRes]) => {
      if (isMounted) {
        if (sumRes) setDashboardData(sumRes);
        if (shipRes && shipRes.shipments) setAllShipments(shipRes.shipments);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = dashboardData.systemStats || FALLBACK_STATS;
  const alerts = dashboardData.deliveryAlerts || FALLBACK_ALERTS;
  const isConnected = dashboardData.isBackendConnected;

  // Friendly role-based top greeting
  const getGreeting = () => {
    const name = user?.name ? `, ${user.name}` : '';
    switch (uRole) {
      case 'DRIVER':
        return {
          title: `Good morning, Driver${name}! 🚚`,
          subtitle: 'Your assigned delivery routes are ready. Review navigation notes & update progress.',
        };
      case 'SHIPPER':
        return {
          title: `Good morning, Shipper${name}! 📦`,
          subtitle: 'Your rural shipments are tracked and actively monitored by RouteNova.',
        };
      case 'FLEET_MANAGER':
        return {
          title: `Good morning, Fleet Manager${name}! 🚗`,
          subtitle: 'Fleet availability and payload capacity utilization are active.',
        };
      default:
        return {
          title: `Good morning, Dispatcher${name}! 👋`,
          subtitle: 'Your deliveries are evaluated and ready for optimal pre-dispatch assignment.',
        };
    }
  };

  const greeting = getGreeting();

  // Priority Delivery Alerts sorted by: 1. High Risk, 2. Urgency, 3. Loss
  const priorityAlerts = useMemo(() => {
    const items = [...alerts];
    return items.sort((a, b) => {
      if (a.riskType === 'HIGH RISK' && b.riskType !== 'HIGH RISK') return -1;
      if (a.riskType !== 'HIGH RISK' && b.riskType === 'HIGH RISK') return 1;
      return 0;
    });
  }, [alerts]);

  // Daily Chart Trend Data
  const riskTrendData = [
    { day: 'Mon', total: 24, highRisk: 6, lossSaved: 2100 },
    { day: 'Tue', total: 30, highRisk: 4, lossSaved: 3200 },
    { day: 'Wed', total: 28, highRisk: 5, lossSaved: 2800 },
    { day: 'Thu', total: 35, highRisk: 3, lossSaved: 3900 },
    { day: 'Fri', total: 42, highRisk: 7, lossSaved: 4800 },
    { day: 'Sat', total: 22, highRisk: 2, lossSaved: 1950 },
    { day: 'Sun', total: 18, highRisk: 1, lossSaved: 1400 },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-16 font-sans">
      {/* 1. TOP FRIENDLY ROLE GREETING */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-slate-950/95 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                {getFriendlyRoleTitle()} CONTROL CENTER
              </span>
              {isConnected ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  <Wifi className="w-3 h-3 text-emerald-400" /> FASTAPI BACKEND LIVE
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  <WifiOff className="w-3 h-3 text-amber-400" /> DEMO MODE ACTIVE
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
              {greeting.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-sans mt-1 max-w-xl leading-relaxed">
              {greeting.subtitle}
            </p>
          </div>

          <div className="shrink-0 flex items-center space-x-3">
            <Link
              to="/deliveries/new"
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold text-xs flex items-center space-x-2 shadow-xl shadow-cyan-500/20 transition active:scale-[0.98]"
            >
              <Zap className="w-4 h-4 fill-current text-cyan-200" />
              <span>Evaluate New Dispatch</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. MAIN METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Total Shipments"
          value={stats.totalDeliveries || 10}
          subtitle="Processed in current cycle"
          trend="+14% this week"
          trendPositive={true}
          icon={Truck}
          iconColor="text-cyan-400"
          iconBg="bg-cyan-500/10"
        />
        <MetricCard
          title="At-Risk Deliveries"
          value={stats.atRiskDeliveries || 3}
          subtitle="Require 4x4 or pooling action"
          trend="Attention Needed"
          trendPositive={false}
          icon={AlertTriangle}
          iconColor="text-rose-400"
          iconBg="bg-rose-500/10"
          borderAccent="border-rose-500/20"
        />
        <MetricCard
          title="Active Pools"
          value={stats.activePoolMatches || 4}
          subtitle="Shared corridor candidates"
          trend="+3 new matches"
          trendPositive={true}
          icon={Share2}
          iconColor="text-indigo-400"
          iconBg="bg-indigo-500/10"
        />
        <MetricCard
          title="Dispatched"
          value={stats.activeVehicles || 2}
          subtitle="Vehicles currently on route"
          trend="Live active tracking"
          trendPositive={true}
          icon={CheckCircle2}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/10"
        />
        <MetricCard
          title="Estimated Avoidable Loss"
          value={stats.avoidableLossSaved || "$14,850"}
          subtitle="Prevented failure & trip costs"
          trend="74.2% saved"
          trendPositive={true}
          icon={TrendingDown}
          iconColor="text-amber-400"
          iconBg="bg-amber-500/10"
        />
      </div>

      {/* 3. LARGE VISUAL QUICK ACTION LAUNCHER */}
      <div className="space-y-3">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Quick Operational Launchpad
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
          <button
            onClick={() => navigate('/deliveries/new')}
            className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/60 to-slate-900 border border-cyan-500/40 hover:border-cyan-400 text-white font-bold flex flex-col items-center text-center space-y-2 transition-all hover:scale-[1.02] shadow-xl group"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition">
              <PlusCircle className="w-5 h-5" />
            </div>
            <span className="text-sm">📦 New Delivery</span>
            <span className="text-[10px] text-slate-400 font-normal">Evaluate shipment suitability</span>
          </button>

          <button
            onClick={() => navigate('/analytics')}
            className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/40 hover:border-indigo-400 text-white font-bold flex flex-col items-center text-center space-y-2 transition-all hover:scale-[1.02] shadow-xl group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition">
              <BarChart3 className="w-5 h-5" />
            </div>
            <span className="text-sm">🧠 Analyze Delivery</span>
            <span className="text-[10px] text-slate-400 font-normal">Loss math & reliability charts</span>
          </button>

          <button
            onClick={() => navigate('/pooling')}
            className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/40 hover:border-emerald-400 text-white font-bold flex flex-col items-center text-center space-y-2 transition-all hover:scale-[1.02] shadow-xl group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition">
              <Share2 className="w-5 h-5" />
            </div>
            <span className="text-sm">🤝 Find Pool</span>
            <span className="text-[10px] text-slate-400 font-normal">Combine shared corridor loads</span>
          </button>

          <button
            onClick={() => navigate('/vehicles')}
            className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/60 to-slate-900 border border-amber-500/40 hover:border-amber-400 text-white font-bold flex flex-col items-center text-center space-y-2 transition-all hover:scale-[1.02] shadow-xl group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition">
              <Car className="w-5 h-5" />
            </div>
            <span className="text-sm">🚚 View Fleet</span>
            <span className="text-[10px] text-slate-400 font-normal">Ground clearance & payload status</span>
          </button>
        </div>
      </div>

      {/* 4. MAIN WORKBENCH: PRIORITY DELIVERIES ALERTS & RECOMMENDED ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT 2 COLS: PRIORITY DELIVERY ALERTS ("Deliveries That Need Attention") */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Deliveries That Need Attention
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Sorted by risk severity, dispatch urgency, and potential financial loss.
              </p>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/30 uppercase font-bold">
              Action Required ({priorityAlerts.length})
            </span>
          </div>

          <div className="space-y-3">
            {priorityAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border space-y-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  alert.color === 'rose'
                    ? 'bg-rose-500/10 border-rose-500/40 text-slate-200'
                    : alert.color === 'cyan'
                    ? 'bg-cyan-500/10 border-cyan-500/40 text-slate-200'
                    : 'bg-amber-500/10 border-amber-500/40 text-slate-200'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 font-mono">
                    <span className="font-bold text-white text-sm">⚠️ {alert.village}</span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                        alert.color === 'rose'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                          : alert.color === 'cyan'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                      }`}
                    >
                      {alert.riskType}
                    </span>
                  </div>
                  {/* One Simple Sentence Explanation */}
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {alert.message}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono italic">
                    Recommendation: {alert.recommendation}
                  </p>
                </div>

                <div className="shrink-0">
                  <button
                    onClick={() => navigate(`/deliveries/${alert.deliveryId || 'RN-2026-8801'}`)}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 font-mono text-xs font-bold transition flex items-center space-x-1.5 shadow"
                  >
                    <span>Review Delivery</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COL: RECOMMENDED OPERATIONAL ACTIONS */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Recommended Actions
            </h2>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              Smart Engine
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {/* Action Item 1 */}
            <div
              onClick={() => navigate('/deliveries/RN-2026-8801')}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 transition cursor-pointer space-y-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-cyan-400 font-bold group-hover:underline">1. Review Rampuram Delivery</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Switch vehicle to 4x4 Mini Truck before morning dispatch to avoid $420 expected mud loss.
              </p>
            </div>

            {/* Action Item 2 */}
            <div
              onClick={() => navigate('/pooling')}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/40 transition cursor-pointer space-y-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-indigo-400 font-bold group-hover:underline">2. Pool 3 Compatible Shipments</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400" />
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Combine Pathapatnam & Rampuram parcels on shared Green Valley corridor to save $465.
              </p>
            </div>

            {/* Action Item 3 */}
            <div
              onClick={() => navigate('/vehicles')}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 transition cursor-pointer space-y-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-amber-400 font-bold group-hover:underline">3. Vehicle Tata Ace 4x4 Nearly Full</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400" />
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Current payload utilization at 85% capacity. Check remaining payload before assigning additional weight.
              </p>
            </div>

            {/* Action Item 4 */}
            <div
              onClick={() => navigate('/outcomes')}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 transition cursor-pointer space-y-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 font-bold group-hover:underline">4. Review Salur Operational Log</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400" />
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Driver reported seasonal mud swelling on wooden bridge. Weight cap of 3.5T enforced.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. BOTTOM SECTION: RECENT EVALUATIONS TABLE & RISK OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Recent Evaluations List */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Truck className="w-4 h-4 text-cyan-400" />
              Recent Pre-Dispatch Evaluations
            </h2>
            <Link
              to="/deliveries"
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold"
            >
              <span>View All Shipments</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="pb-3 font-semibold">Delivery ID</th>
                  <th className="pb-3 font-semibold">Recipient</th>
                  <th className="pb-3 font-semibold">Destination</th>
                  <th className="pb-3 font-semibold">Risk State</th>
                  <th className="pb-3 font-semibold">Loss Opt.</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {SHIPMENTS.slice(0, 5).map((del) => (
                  <tr key={del.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 font-bold text-cyan-400">{del.id}</td>
                    <td className="py-3 text-slate-200">{del.sender}</td>
                    <td className="py-3 text-slate-400">{del.destination}</td>
                    <td className="py-3">
                      <RiskBadge level={del.riskLevel} score={del.failureProbability} />
                    </td>
                    <td className="py-3 font-bold text-emerald-400">
                      ${del.lossComparison?.pooled?.expectedLoss || (del.riskLevel === 'HIGH' ? 78 : 62)}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => navigate(`/deliveries/${del.id}`)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-700 text-[10px] font-bold"
                      >
                        Explain Decision
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Delivery Risk Trend Mini Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Daily Dispatch Volume
            </h2>
            <span className="text-[10px] font-mono text-slate-500">Weekly Cycle</span>
          </div>

          <p className="text-xs text-slate-400 font-mono">
            Dispatches processed vs. operational loss saved ($)
          </p>

          <div className="h-52 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskTrendData}>
                <defs>
                  <linearGradient id="dashTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={10} fontFamily="monospace" />
                <YAxis stroke="#64748b" fontSize={10} fontFamily="monospace" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.5rem',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                />
                <Area type="monotone" dataKey="total" stroke="#06b6d4" fillOpacity={1} fill="url(#dashTotal)" name="Dispatches" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
