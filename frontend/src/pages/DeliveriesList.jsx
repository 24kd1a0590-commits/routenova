import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import DeliveryCard from '../components/DeliveryCard';
import EmptyState from '../components/EmptyState';
import { DELIVERIES } from '../data/seedData';
import { PlusCircle, Search, Filter, RefreshCw } from 'lucide-react';

export default function DeliveriesList() {
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');

  const filtered = DELIVERIES.filter((d) => {
    const matchesSearch =
      d.id.toLowerCase().includes(search.toLowerCase()) ||
      d.customer.toLowerCase().includes(search.toLowerCase()) ||
      d.destination.toLowerCase().includes(search.toLowerCase());
    const matchesRisk = riskFilter === 'ALL' || d.riskLevel === riskFilter;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Rural Deliveries Registry"
        description="Monitor and evaluate all rural dispatches across Green Valley logistics corridors"
        badge={`${DELIVERIES.length} Total Dispatches`}
        actions={
          <Link
            to="/deliveries/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Rural Delivery</span>
          </Link>
        }
      />

      {/* Filter & Search Toolbar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by ID, village, or customer..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 text-xs text-slate-200 placeholder-slate-500 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500/50 font-mono"
          />
        </div>

        {/* Risk Filter Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Risk:
          </span>
          {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((risk) => (
            <button
              key={risk}
              onClick={() => setRiskFilter(risk)}
              className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-all ${
                riskFilter === risk
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {risk}
            </button>
          ))}
        </div>
      </div>

      {/* Deliveries Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((delivery) => (
            <DeliveryCard key={delivery.id} delivery={delivery} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Deliveries Match Filter"
          message="Try adjusting your search keywords or risk level filters."
          action={
            <button
              onClick={() => {
                setSearch('');
                setRiskFilter('ALL');
              }}
              className="px-3 py-1.5 bg-slate-800 text-slate-200 rounded-lg text-xs font-mono hover:bg-slate-700 inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Filters
            </button>
          }
        />
      )}
    </div>
  );
}
