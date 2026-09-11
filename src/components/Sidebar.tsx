import React from 'react';
import { Home, History, TrendingUp, Calendar, Bell, Sliders, FileText, Settings, CloudLightning } from 'lucide-react';

export const Sidebar = () => {
  return (
    <aside className="w-64 lg:w-48 scifi-card flex flex-col h-screen fixed left-0 top-0 z-50">
      <div className="p-6 flex items-center gap-3 border-b border-[#1e3a5f]/40">
        <div className="p-2 rounded-lg bg-blue-600/20 border border-blue-500/40 scifi-glow-blue">
          <CloudLightning className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h1 className="text-xs font-black text-white leading-tight tracking-wider">BAROMETRIC<br/>PAIN MONITOR</h1>
          <p className="text-[8px] text-blue-400/80 uppercase tracking-widest mt-0.5">Live Weather Intelligence</p>
        </div>
      </div>
      
      <nav className="flex-1 px-3 space-y-1.5 mt-4">
        <a href="#" className="flex items-center gap-3 px-4 py-3 bg-blue-600/25 text-blue-400 rounded-xl border border-blue-500/50 scifi-glow-blue">
          <Home className="w-4 h-4" />
          <span className="text-xs font-bold tracking-wider">DASHBOARD</span>
        </a>
        {[
          { icon: History, label: 'HISTORY' },
          { icon: TrendingUp, label: 'TRENDS' },
          { icon: Calendar, label: 'FORECAST' },
          { icon: Bell, label: 'ALERTS', badge: 2 },
          { icon: Sliders, label: 'SENSITIVITY' },
          { icon: FileText, label: 'REPORTS' },
          { icon: Settings, label: 'SETTINGS' },
        ].map((item) => (
          <a key={item.label} href="#" className="flex items-center justify-between px-4 py-3 text-slate-400 hover:text-white hover:bg-blue-900/20 rounded-xl transition-all group border border-transparent hover:border-blue-500/20">
            <div className="flex items-center gap-3">
              <item.icon className="w-4 h-4 group-hover:text-blue-400 transition-colors" />
              <span className="text-xs font-bold tracking-wider">{item.label}</span>
            </div>
            {item.badge && (
              <span className="bg-red-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full shadow-[0_0_10px_#ef4444]">{item.badge}</span>
            )}
          </a>
        ))}
      </nav>

      <div className="p-4 m-3 scifi-card rounded-xl">
        <div className="flex items-start gap-2.5">
          <div className="mt-1">
             <div className="w-3 h-3 rounded-full border-2 border-blue-400 flex items-center justify-center scifi-glow-blue">
                <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
             </div>
          </div>
          <div>
            <div className="text-[9px] text-slate-400 tracking-widest uppercase">Data Source</div>
            <div className="text-xs text-white font-bold mb-2">NOAA + Local Sensors</div>
            <div className="text-[9px] text-slate-400 tracking-widest uppercase">Last Updated</div>
            <div className="text-xs text-white font-bold">{new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-bold tracking-widest uppercase mt-3 pt-2.5 border-t border-[#1e3a5f]/60">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse"></div>
          All Systems Operational
        </div>
      </div>
    </aside>
  );
};
