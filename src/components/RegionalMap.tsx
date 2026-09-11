import React from 'react';
import { AppData } from '../types';

export const RegionalMap = ({ data }: { data: AppData }) => {
  return (
    <div className="bg-transparent border border-[#1e3a5f] rounded-xl p-4 flex flex-col h-full relative overflow-hidden">
      <div className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-3 z-10">Weather System Overview</div>
      <div className="flex-1 rounded-lg overflow-hidden border border-[#1e3a5f] relative min-h-[200px] bg-transparent">
        {/* Mock Satellite/Radar Image */}
        <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen scale-110" alt="Satellite view" />
        
        {/* Overlay Weather Systems */}
        <svg className="absolute inset-0 w-full h-full z-10" viewBox="0 0 400 200" preserveAspectRatio="none">
           {/* Cold Front Line */}
           <path d="M 30 150 Q 150 180 300 50" fill="none" stroke="#3b82f6" strokeWidth="3" />
           {/* Cold Front Triangles */}
           <polygon points="100,152 110,138 120,154" fill="#3b82f6" />
           <polygon points="180,165 190,151 200,167" fill="#3b82f6" />
           <polygon points="260,105 270,91 280,107" fill="#3b82f6" />

           {/* Warm Front Line */}
           <path d="M 230 40 Q 300 120 380 150" fill="none" stroke="#ef4444" strokeWidth="3" />
           {/* Warm Front Semi-circles */}
           <path d="M 250 65 A 12 12 0 0 1 270 85" fill="#ef4444" />
           <path d="M 310 115 A 12 12 0 0 1 330 135" fill="#ef4444" />
        </svg>

        {/* High/Low Pressure Centers */}
        <div className="absolute top-1/4 left-1/4 w-8 h-8 rounded-full border-2 border-blue-500 flex items-center justify-center text-blue-500 text-[10px] font-black bg-blue-500/20 backdrop-blur z-20 shadow-[0_0_15px_rgba(59,130,246,0.5)]">H</div>
        
        <div className="absolute top-1/4 right-[30%] w-8 h-8 rounded-full border-2 border-red-500 flex items-center justify-center text-red-500 text-[10px] font-black bg-red-500/20 backdrop-blur z-20 shadow-[0_0_15px_rgba(239,68,68,0.5)]">
           L
           {/* Animated rings around Low */}
           <div className="absolute w-16 h-16 rounded-full border border-red-500/30 animate-ping"></div>
           <div className="absolute w-24 h-24 rounded-full border border-red-500/10"></div>
        </div>
      </div>
      <button className="mt-3 w-full py-2 bg-transparent text-blue-400 hover:text-blue-300 text-[10px] font-bold tracking-widest rounded border border-[#1e3a5f] transition-colors relative z-10">
         VIEW FULL RADAR MAP
      </button>
    </div>
  );
};
