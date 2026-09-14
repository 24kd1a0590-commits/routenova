import React from 'react';
import { Inbox, AlertCircle } from 'lucide-react';

export default function EmptyState({ title = 'No Data Found', message = 'There are no records matching your request.', action = null, icon: Icon = Inbox }) {
  return (
    <div className="glass-panel p-12 rounded-xl border border-slate-800 text-center flex flex-col items-center justify-center">
      <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-slate-200 font-mono mb-1">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm mb-6">{message}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
