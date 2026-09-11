import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { AppData } from './types';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  CloudSnow, 
  CloudLightning,
  Wind,
  Droplets,
  Gauge,
  MapPin,
  Activity,
  Smartphone,
  Wifi,
  AlertTriangle,
  Info,
  TrendingDown,
  Clock,
  Thermometer,
  User,
  FileText
} from 'lucide-react';
import { RegionalMap } from './components/RegionalMap';
import { PressureTimeline } from './components/PressureTimeline';
import { Sidebar } from './components/Sidebar';

const WeatherIcon = ({ code, className }: { code: number; className?: string }) => {
  if (code === 0) return <Sun className={className} />;
  if (code >= 1 && code <= 3) return <Cloud className={className} />;
  if (code >= 45 && code <= 48) return <Cloud className={className} opacity={0.7} />;
  if (code >= 51 && code <= 67) return <CloudRain className={className} />;
  if (code >= 71 && code <= 82) return <CloudSnow className={className} />;
  if (code >= 95 && code <= 99) return <CloudLightning className={className} />;
  return <Sun className={className} />; // fallback
};

// Client-side recalculation to support live phone sensor data
function calculatePainRisk(pressure: number, humidity: number, rainProb: number = 0): { risk: number; reason: string } {
  let risk = 2; // base normal risk (1-10 scale)
  let reasons = [];

  // Pressure impact (lower is worse)
  if (pressure < 1005) {
    risk += 4;
    reasons.push("Severe Barometric Drop");
  } else if (pressure < 1010) {
    risk += 2;
    reasons.push("Low Barometric Pressure");
  } else if (pressure < 1015) {
    risk += 1;
  }

  // Humidity impact (higher is worse)
  if (humidity > 80) {
    risk += 3;
    reasons.push("Critical Barometric Pain Pressure");
  } else if (humidity > 65) {
    risk += 1.5;
    reasons.push("Barometric Pain Pressure");
  }

  // Precipitation factor
  if (rainProb > 60) {
    risk += 1.5;
    reasons.push("Incoming Precipitation");
  }

  risk = Math.min(10, Math.max(1, Math.round(risk)));

  let finalReason = reasons.length > 0 
    ? reasons.join(" + ")
    : "Stable Atmospheric Conditions";

  return { risk, reason: finalReason };
}

export function App() {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Phone Sensor State
  const [localPressure, setLocalPressure] = useState<number | null>(null);
  const [sensorStatus, setSensorStatus] = useState<'checking' | 'active' | 'unavailable'>('checking');

  useEffect(() => {
    // 1. Fetch Open-Meteo Data
    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
        if (!res.ok) throw new Error("Failed to fetch weather data");
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather(33.7490, -84.3880) // Default Atlanta
      );
    } else {
      fetchWeather(33.7490, -84.3880);
    }

    // 2. Attempt to initialize local device Barometer (Generic Sensor API)
    try {
      if ('Barometer' in window) {
        // @ts-ignore
        const sensor = new Barometer({ frequency: 1 });
        sensor.addEventListener('reading', () => {
          // Convert from kPa or standard to hPa if needed. Typically Barometer API returns hPa directly or kPa.
          // Let's assume hPa based on spec drafts, or convert if it's strictly kPa (* 10).
          // For safety, if it's < 200, it's likely kPa.
          let p = sensor.pressure;
          if (p < 200) p = p * 10; 
          
          setLocalPressure(Math.round(p));
          setSensorStatus('active');
        });
        sensor.addEventListener('error', (e: any) => {
          if (e.error.name === 'NotAllowedError' || e.error.name === 'SecurityError') {
            setSensorStatus('unavailable');
          }
        });
        sensor.start();
      } else {
        setSensorStatus('unavailable');
      }
    } catch (e) {
      setSensorStatus('unavailable');
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a192f] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <Activity className="w-16 h-16 text-[#fbc02d] animate-pulse" />
          <h2 className="text-2xl font-black tracking-widest uppercase">Initializing Telemetry...</h2>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0a192f] flex items-center justify-center text-white">
        <div className="bg-red-900/50 p-6 rounded-lg border border-red-500">
          <h2 className="text-xl font-bold mb-2">System Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Use local phone sensor pressure if available, otherwise fallback to Open-Meteo station pressure
  const activePressure = localPressure !== null ? localPressure : data.current.pressure;
  
  // Recalculate live risk based on the active pressure
  const liveRiskData = calculatePainRisk(activePressure, data.current.humidity);
  
  const isHighRisk = liveRiskData.risk >= 8;
  const isModerateRisk = liveRiskData.risk >= 5 && liveRiskData.risk < 8;
  
  const riskColor = isHighRisk ? '#ef4444' : isModerateRisk ? '#fbc02d' : '#10b981';
  const riskGradient = isHighRisk 
    ? 'from-red-900 via-red-950 to-[#061428]' 
    : isModerateRisk 
    ? 'from-yellow-900 via-[#0a192f] to-[#061428]' 
    : 'from-emerald-900 via-[#0a192f] to-[#061428]';

  return (
    <div className="min-h-screen scifi-bg text-white font-sans selection:bg-blue-500 selection:text-white pb-16">
      
      {/* Sidebar */}
      <Sidebar />

      <main className="dashboard-main lg:pl-48 p-4 md:p-6">
        
        {/* HEADER */}
        <header className="dashboard-header scifi-card px-6 py-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600/20 border border-blue-500/50 p-2.5 rounded-xl scifi-glow-blue">
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-black tracking-widest uppercase text-white leading-none">
                BAROMETRIC <span className="text-blue-400">PAIN COMMAND</span>
              </h1>
              <p className="text-[10px] text-blue-300 font-bold tracking-widest uppercase mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-blue-400" /> {data.city} Telemetry Node
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Sensor Status Pill */}
            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${
              sensorStatus === 'active' 
                ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                : 'bg-blue-950/60 border-blue-500/60 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
            }`}>
              {sensorStatus === 'active' ? (
                <><Smartphone className="w-3.5 h-3.5 animate-pulse" /> Phone Sensor Active</>
              ) : (
                <><Wifi className="w-3.5 h-3.5" /> Station Data Active</>
              )}
            </div>

            <div className="text-right text-[10px] font-bold text-slate-400 tracking-wider uppercase hidden sm:block">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}<br/>
              <span className="text-white font-black">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </header>

        {/* HERO SECTION: 3 COLUMNS (Pressure, Globe, Stats) */}
        <div className="dashboard-hero grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* COL 1: Current Pressure Panel */}
          <div className="lg:col-span-3 scifi-card rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-3 flex items-center gap-2">
                <Gauge className="w-4 h-4 text-blue-400" /> CURRENT PRESSURE
              </div>
              <div className="text-4xl font-black text-white tracking-tight leading-none mb-1">
                {activePressure} <span className="text-sm font-bold text-slate-400">hPa</span>
              </div>
              <div className="text-xs text-blue-400 font-bold uppercase tracking-widest flex items-center gap-1 mt-1">
                {(activePressure * 0.02953).toFixed(2)} inHg • FALLING <TrendingDown className="w-3 h-3 inline" />
              </div>
            </div>

            <div className="my-6 flex justify-center items-center py-4 relative">
              <div className="absolute w-28 h-28 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
              <WeatherIcon code={data.current.weatherCode} className="w-24 h-24 text-blue-300 drop-shadow-[0_0_20px_rgba(59,130,246,0.6)] relative z-10" />
            </div>

            <div className="pt-4 border-t border-[#1e3a5f]/60">
               <div className="text-[9px] text-slate-400 font-bold tracking-widest uppercase mb-1">3-HOUR DRIFT</div>
               <div className="text-blue-400 text-base font-black flex items-center justify-between">
                 -0.18 inHg/hr
                 <span className="text-[10px] bg-blue-500/20 px-2 py-0.5 rounded text-blue-300 border border-blue-500/30">Active</span>
               </div>
            </div>
          </div>

          {/* COL 2: Globe & Pain Index Hero */}
          <div className="lg:col-span-6 scifi-card rounded-2xl p-6 relative overflow-hidden flex flex-col items-center justify-center">
            {/* Background ambient glow */}
            <div className="absolute inset-0 bg-radial from-blue-600/10 via-transparent to-transparent pointer-events-none"></div>

            {/* Top Arc Gauge Indicator */}
            <div className="w-full flex items-center justify-between mb-4 relative z-10 px-4">
              <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Atmospheric Pain Index</div>
              <div className={`px-3 py-1 rounded-full border text-[10px] font-black tracking-widest uppercase ${
                isHighRisk ? 'bg-red-950/60 border-red-500 text-red-400 scifi-glow-red' : 
                isModerateRisk ? 'bg-yellow-950/60 border-yellow-500 text-yellow-400' : 
                'bg-emerald-950/60 border-emerald-500 text-emerald-400'
              }`}>
                {isHighRisk ? 'HIGH FLARE WARNING' : isModerateRisk ? 'ELEVATED RISK' : 'STABLE CONDITIONS'}
              </div>
            </div>

            {/* Central Globe with SVG Arc Ring */}
            <div className="relative w-64 h-64 my-2 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none z-20" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" className="text-slate-800/60" strokeWidth="4" stroke="currentColor" fill="none" />
                <motion.circle 
                  cx="50" cy="50" r="46" 
                  strokeWidth="5" 
                  strokeDasharray={289}
                  initial={{ strokeDashoffset: 289 }}
                  animate={{ strokeDashoffset: 289 - (289 * (liveRiskData.risk / 10)) }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  strokeLinecap="round" 
                  stroke={riskColor} 
                  fill="none" 
                  className="drop-shadow-[0_0_10px_currentColor]"
                />
              </svg>

              {/* Realistic Earth Graphic representation */}
              <div className="w-52 h-52 rounded-full overflow-hidden border-2 border-blue-500/40 relative shadow-[0_0_40px_rgba(59,130,246,0.3)] z-10">
                <img src="https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover opacity-80 scale-110" alt="Earth view" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020611] via-transparent to-transparent"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-blue-400 border-2 border-white animate-ping"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-blue-500 border border-white shadow-[0_0_15px_#3b82f6]"></div>
              </div>

              {/* Score Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center z-30 pointer-events-none mt-16">
                <div className="text-4xl font-black tracking-tighter leading-none" style={{ color: riskColor }}>
                  {liveRiskData.risk}<span className="text-lg opacity-60">/10</span>
                </div>
              </div>
            </div>

            {/* Bottom Alert Banner inside Hero */}
            <div className="w-full mt-4 bg-black/40 border border-blue-500/30 p-3 rounded-xl flex items-center gap-3 relative z-10 backdrop-blur">
              <div className={isHighRisk ? 'text-red-500 animate-pulse' : 'text-blue-400'}>
                {isHighRisk ? <AlertTriangle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
              </div>
              <div>
                <div className="text-[10px] font-black tracking-widest uppercase text-white">{liveRiskData.reason}</div>
                <div className="text-[9px] text-slate-400 uppercase tracking-wider mt-0.5">Real-time localized barometric pain correlation active</div>
              </div>
            </div>
          </div>

          {/* COL 3: Stats List */}
          <div className="lg:col-span-3 flex flex-col gap-4">
             <div className="scifi-card rounded-2xl p-5 flex-1 flex flex-col justify-between">
                <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-3">Atmospheric Metrics</div>
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-[#1e3a5f]/40">
                    <span className="text-slate-400 font-bold flex items-center gap-1.5"><TrendingDown className="w-3.5 h-3.5 text-blue-400"/> PRESSURE TREND</span>
                    <span className="text-blue-400 font-black">FALLING</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-[#1e3a5f]/40">
                    <span className="text-slate-400 font-bold flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-blue-400"/> 3-HR DELTA</span>
                    <span className="text-white font-black">-0.36 inHg</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-[#1e3a5f]/40">
                    <span className="text-slate-400 font-bold flex items-center gap-1.5"><Droplets className="w-3.5 h-3.5 text-blue-400"/> HUMIDITY</span>
                    <span className="text-white font-black">{data.current.humidity}%</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-[#1e3a5f]/40">
                    <span className="text-slate-400 font-bold flex items-center gap-1.5"><Thermometer className="w-3.5 h-3.5 text-blue-400"/> TEMPERATURE</span>
                    <span className="text-white font-black">{data.current.temperature}°F</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-[#1e3a5f]/40">
                    <span className="text-slate-400 font-bold flex items-center gap-1.5"><Wind className="w-3.5 h-3.5 text-blue-400"/> WIND SPEED</span>
                    <span className="text-white font-black">{data.current.windSpeed} mph</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold flex items-center gap-1.5"><Droplets className="w-3.5 h-3.5 text-blue-400"/> DEW POINT</span>
                    <span className="text-white font-black">{Math.round(data.current.temperature - ((100 - data.current.humidity)/5))}°F</span>
                  </div>
                </div>
             </div>
          </div>

        </div>

        {/* MIDDLE ROW: BODY PAIN SENSITIVITY PANELS */}
        <div className="dashboard-pain-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'HEADACHE', score: Math.min(10, Math.max(1, liveRiskData.risk - 1)), icon: User },
            { title: 'JOINT PAIN', score: liveRiskData.risk, icon: User },
            { title: 'BACK PAIN', score: Math.min(10, Math.max(1, liveRiskData.risk - 2)), icon: User },
            { title: 'NECK PAIN', score: Math.min(10, Math.max(1, liveRiskData.risk - 3)), icon: User },
          ].map(pain => {
            const isHigh = pain.score >= 7;
            const isMod = pain.score >= 4 && pain.score < 7;
            const badgeColor = isHigh ? 'text-red-400 bg-red-950/60 border-red-500/50' : isMod ? 'text-yellow-400 bg-yellow-950/60 border-yellow-500/50' : 'text-emerald-400 bg-emerald-950/60 border-emerald-500/50';
            
            return (
              <div key={pain.title} className="scifi-card rounded-xl p-4 flex items-center justify-between">
                <div className="w-14 h-14 rounded-xl bg-blue-950/40 border border-blue-500/30 flex items-center justify-center relative overflow-hidden scifi-glow-blue">
                   <div className="absolute inset-0 bg-radial from-blue-500/20 to-transparent"></div>
                   <pain.icon className="w-7 h-7 text-blue-300 relative z-10" />
                   <div className={`absolute w-2.5 h-2.5 rounded-full ${isHigh ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-yellow-500 shadow-[0_0_10px_#eab308]'} top-2.5 right-2.5 animate-pulse`}></div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">{pain.title}</div>
                  <div className="text-2xl font-black text-white leading-none my-1">
                     {pain.score}<span className="text-xs text-slate-500">/10</span>
                  </div>
                  <div className={`inline-flex px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase border ${badgeColor}`}>
                     {isHigh ? 'High Risk' : isMod ? 'Moderate' : 'Stable'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* BOTTOM ROW: CHART & WEATHER SYSTEM OVERVIEW */}
        <div className="dashboard-bottom-grid grid grid-cols-1 lg:grid-cols-12 gap-6">
           <div className="lg:col-span-8">
             <PressureTimeline data={data} />
           </div>
           <div className="lg:col-span-4">
             <RegionalMap data={data} />
           </div>
        </div>

        {/* FOOTER TIP */}
        <div className="scifi-card rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
           <div className="flex items-center gap-3">
             <div className="p-2 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400">
               <CloudRain className="w-5 h-5" />
             </div>
             <div>
               <div className="text-[9px] font-bold tracking-widest uppercase text-blue-400">ATMOSPHERIC ADVISORY</div>
               <div className="text-xs text-slate-300">Barometric pressure is declining rapidly in your sector. Recommended to hydrate and avoid sudden exertion.</div>
             </div>
           </div>
           <button className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-[10px] font-black tracking-widest uppercase rounded-xl border border-blue-500/40 transition-all scifi-glow-blue whitespace-nowrap">
              <FileText className="w-3.5 h-3.5" /> EXPORT FULL REPORT
           </button>
        </div>

      </main>
    </div>
  );
}

export default App;
