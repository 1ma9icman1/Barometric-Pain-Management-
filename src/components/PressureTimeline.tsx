import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AppData } from '../types';

export const PressureTimeline = ({ data }: { data: AppData }) => {
  if (!data || !data.hourly || data.hourly.length === 0) return null;

  // Enhance data for chart
  const chartData = data.hourly.map((h, i) => {
    const date = new Date(h.time);
    return {
      ...h,
      pressureInHg: Number((h.pressure * 0.02953).toFixed(2)),
      displayTime: i === 0 ? 'Now' : i === 23 ? '+24h' : (i % 6 === 0 ? `+${i}h` : '')
    };
  });

  const minPressure = Math.min(...chartData.map(d => d.pressureInHg));
  const maxPressure = Math.max(...chartData.map(d => d.pressureInHg));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-transparent p-2 rounded shadow-xl">
          <p className="text-xl font-black text-white flex items-baseline gap-1">
            {payload[0].value.toFixed(2)} <span className="text-[10px] font-bold text-slate-400">inHg</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-transparent rounded-xl p-4 md:p-5 flex flex-col h-full relative overflow-hidden">
      <div className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-4 z-10">
        Pressure Trend (24 Hours)
      </div>
      
      {/* Background Grid Lines simulating the image */}
      <div className="absolute inset-0 top-12 left-4 right-20 bottom-8 flex flex-col justify-between pointer-events-none opacity-20 z-0">
         {[1,2,3,4,5].map(i => <div key={i} className="border-b border-[#3b82f6] w-full h-0"></div>)}
      </div>

      <div className="flex-1 min-h-[200px] z-10 flex">
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -40, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPressure" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="displayTime" 
                stroke="#1e3a5f" 
                tick={{fill: '#64748b', fontSize: 10, fontWeight: 700}} 
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis 
                domain={[minPressure - 0.05, maxPressure + 0.05]} 
                stroke="#1e3a5f" 
                tick={{fill: '#64748b', fontSize: 9, fontWeight: 700}}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => val.toFixed(2)}
                orientation="left"
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="pressureInHg" 
                stroke="#3b82f6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorPressure)" 
                activeDot={{ r: 6, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Right side legend matching the image */}
        <div className="w-24 pl-4 flex flex-col justify-between text-[9px] font-bold tracking-widest uppercase py-2">
           <div className="text-blue-400">STABLE</div>
           <div className="text-blue-300">WATCH</div>
           <div className="text-yellow-500">CAUTION</div>
           <div className="text-orange-500">HIGH RISK</div>
           <div className="text-red-500">SEVERE</div>
        </div>
      </div>
    </div>
  );
};
