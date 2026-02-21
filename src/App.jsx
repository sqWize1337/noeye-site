import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, Activity, Shield, Terminal, Send, Users, 
  Settings, Monitor, Smartphone, Cpu, 
  Zap, Lock, EyeOff, Radio, MessageSquare, Globe as GlobeIcon, Database
} from 'lucide-react';
import Globe from 'react-globe.gl';

// --- ЛЕГЕНДАРНЫЙ ГЛОБУС ---
const LegendaryGlobe = () => {
    const globeEl = useRef();
    const arcsData = useMemo(() => [...Array(45).keys()].map(() => ({
        startLat: (Math.random() - 0.5) * 180,
        startLng: (Math.random() - 0.5) * 360,
        endLat: (Math.random() - 0.5) * 180,
        endLng: (Math.random() - 0.5) * 360,
        color: ['#06b6d4', '#ffffff', '#22d3ee'][Math.floor(Math.random() * 3)]
    })), []);

    const pointsData = useMemo(() => [...Array(600).keys()].map(() => ({
        lat: (Math.random() - 0.5) * 180,
        lng: (Math.random() - 0.5) * 360,
        size: Math.random() * 0.4,
        color: '#06b6d4'
    })), []);

    useEffect(() => {
        if (globeEl.current) {
          globeEl.current.controls().autoRotate = true;
          globeEl.current.controls().autoRotateSpeed = 0.6;
          globeEl.current.pointOfView({ altitude: 2.1 });
        }
    }, []);

    return (
      <div className="absolute right-[-25%] md:right-[-10%] top-0 w-[150%] md:w-[85%] h-full pointer-events-none opacity-80 mix-blend-lighten">
          <Globe
              ref={globeEl}
              backgroundColor="rgba(0,0,0,0)"
              globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
              atmosphereColor="#06b6d4"
              atmosphereAltitude={0.25}
              arcsData={arcsData}
              arcColor={'color'}
              arcDashAnimateTime={2000}
              arcStroke={1.2}
              pointsData={pointsData}
              pointRadius="size"
              pointColor="color"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#030303] via-[#030303]/20 to-transparent" />
      </div>
    );
};

// --- SECURED ADMIN PANEL ---
const AdminPanel = ({ onClose }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [pass, setPass] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const SECURE_HASH = "noeye2026"; 

  const handleLogin = useCallback(() => {
    if (isLocked) return;
    const cleanPass = pass.replace(/[<>'"&/]/g, "");
    if (cleanPass === SECURE_HASH) {
      setIsAuth(true);
      setAttempts(0);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setPass('');
      if (newAttempts >= 3) {
        setIsLocked(true);
        setTimeout(() => { setIsLocked(false); setAttempts(0); }, 30000);
      }
    }
  }, [pass, attempts, isLocked]);

  const userStats = useMemo(() => {
    const ua = navigator.userAgent;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);
    return {
      device: isMobile ? "Mobile Node" : "Workstation",
      icon: isMobile ? <Smartphone size={14}/> : <Monitor size={14}/>,
      browser: ua.includes("Chrome") ? "Chrome" : "Secure-Agent"
    };
  }, []);

  if (!isAuth) return (
    <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 font-mono text-white">
      <div className="max-w-sm w-full bg-[#080808] border border-white/10 p-8 rounded-3xl text-center">
        <Lock className={`mx-auto mb-4 ${isLocked ? 'text-red-500 animate-pulse' : 'text-cyan-500'}`} size={32} />
        <h2 className="text-xs font-black tracking-[0.4em] uppercase mb-6 italic">Secure Entry</h2>
        <input 
          type="password" disabled={isLocked}
          className="w-full bg-black border border-white/10 p-4 rounded-xl text-cyan-400 text-center outline-none mb-4 focus:border-cyan-500/50" 
          placeholder={isLocked ? "LOCKED" : "ACCESS_KEY"}
          value={pass} onChange={(e) => setPass(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
        />
        <button onClick={handleLogin} disabled={isLocked} className="w-full bg-white text-black py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-cyan-500 transition-all">Connect</button>
        <button onClick={onClose} className="mt-4 text-[9px] text-white/20 uppercase tracking-widest block w-full text-center hover:text-white transition-colors">Abort</button>
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[1000] bg-[#020202] text-white font-mono p-4 md:p-12 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center border-b border-white/5 pb-8">
            <div className="flex items-center gap-4">
                <img src="/logo.png" className="w-10 h-10" alt="logo" />
                <div>
                    <h2 className="text-lg font-black uppercase italic tracking-tighter tracking-widest">NoEye <span className="text-cyan-500">Root_Console</span></h2>
                    <span className="text-[9px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"/> Encrypted_Link_Active</span>
                </div>
            </div>
            <button onClick={onClose} className="px-6 py-2 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-red-500 transition-all">Terminate</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-4 bg-white/[0.03] text-[10px] font-black uppercase tracking-widest flex items-center justify-between border-b border-white/5">
                    <span>Live Traffic Monitor</span>
                    <span className="text-red-500 italic drop-shadow-[0_0_5px_rgba(239,68,68,0.4)]">Fuck Cheathunters</span>
                </div>
                <table className="w-full text-left text-[9px] uppercase tracking-widest">
                    <thead className="text-white/20">
                        <tr className="border-b border-white/5">
                            <th className="p-5">Node_ID</th>
                            <th className="p-5">Platform</th>
                            <th className="p-5">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="bg-cyan-500/5 border-b border-white/5">
                            <td className="p-5 text-cyan-400 font-black italic">LOCAL_ROOT (YOU)</td>
                            <td className="p-5 flex items-center gap-2 text-white/80">{userStats.icon} {userStats.device} / {userStats.browser}</td>
                            <td className="p-5 text-green-500">AUTHORIZED</td>
                        </tr>
                        <tr className="opacity-20 hover:opacity-100 transition-opacity">
                            <td className="p-5">NODE_X_SCAN</td>
                            <td className="p-5">SYSTEM / KERNEL</td>
                            <td className="p-5 text-cyan-500">BYPASSED</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className="bg-black border border-white/10 rounded-2xl p-6 h-64 overflow-y-auto font-mono text-[9px] text-white/30 space-y-1 scrollbar-hide">
                <div className="flex items-center gap-2 text-cyan-500 mb-2 font-bold uppercase tracking-widest border-b border-white/5 pb-2">
                    <Terminal size={14} /> Kernel_Shell
                </div>
                <p className="text-green-500 font-black tracking-widest">[AUTH] INTEGRITY: 100%</p>
                <p>[PROC] Virtualizing system environment...</p>
                <p>[NET] TLS 1.3 Handshake established</p>
                <p>[OK] Registry_Traces purged.</p>
                <p className="text-cyan-500 font-bold mt-2 uppercase italic tracking-widest">/// NOEYE_CORE_READY</p>
                <p className="animate-pulse">_</p>
            </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- MAIN APPLICATION ---
export default function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [online, setOnline] = useState(531);
  
  const tgLink = "https://t.me/NoEyeCleaner";
  const dsLink = "https://discord.gg/BNPVbzEzcv";
  const downloadLink = "https://mega.nz/file/tYsU1QII#ko4C4rcoe8T0XR37SZnxDcOEqQz7bDPMK0nFL3LhT_o";

  useEffect(() => {
    const updateOnline = () => {
      const hour = new Date(new Date().toLocaleString("en-US", {timeZone: "Europe/Moscow"})).getHours();
      let base = (hour >= 9 && hour < 18) ? 515 : (hour >= 18 && hour < 24) ? 790 : 210;
      setOnline(Math.floor(base + Math.random() * 15));
    };
    updateOnline();
    const int = setInterval(updateOnline, 45000); 
    return () => clearInterval(int);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#030303] text-white font-sans antialiased overflow-x-hidden selection:bg-cyan-500 selection:text-black">
      <AnimatePresence>{isAdminOpen && <AdminPanel onClose={() => setIsAdminOpen(false)} />}</AnimatePresence>

      {/* NAVIGATION */}
      <nav className="fixed top-0 w-full z-50 p-6 md:px-20 md:py-10 flex justify-between items-center mix-blend-difference">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setIsAdminOpen(true)}>
            <img src="/logo.png" alt="Logo" className="w-10 h-10 md:w-12 md:h-12 object-contain group-hover:rotate-6 transition-transform" />
            <div className="flex flex-col">
                <span className="text-[8px] md:text-[9px] font-black tracking-[0.3em] text-white/30 uppercase leading-none mb-1">Status: Stable</span>
                <span className="text-xl md:text-2xl font-bold tracking-tighter uppercase italic leading-none">NoEye<span className="text-white/20">.Lab</span></span>
            </div>
        </div>
        
        <div className="flex items-center gap-8">
            <div className="hidden lg:flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
                <a href={tgLink} target="_blank" rel="noreferrer" className="hover:text-cyan-500 transition-colors">Telegram</a>
                <a href={dsLink} target="_blank" rel="noreferrer" className="hover:text-cyan-500 transition-colors">Discord</a>
            </div>
            <div className="flex items-center gap-3 px-5 py-2 bg-white/[0.03] border border-white/10 rounded-full font-mono">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_12px_#22c55e]" />
              <span className="text-[10px] font-bold tracking-[0.1em]">{online} NODES</span>
            </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative h-screen flex items-center px-6 md:px-20 overflow-hidden border-b border-white/5">
        <LegendaryGlobe />
        <div className="relative z-10 w-full lg:grid lg:grid-cols-12">
            <div className="lg:col-span-8">
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="inline-flex items-center gap-3 mb-6 px-4 py-1 border-l-2 border-red-500 bg-red-500/5 backdrop-blur-sm">
                    <span className="text-red-500 text-[10px] font-black uppercase tracking-[0.4em] italic drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">
                        FUCK CHEATHUNTERS 
                    </span>
                </motion.div>

                <h1 className="text-[18vw] lg:text-[12vw] font-bold leading-[0.8] tracking-tighter uppercase italic mb-8">
                    Silent<br />
                    <span className="text-white/10 not-italic tracking-[-0.05em]">Justice</span>
                </h1>
                
                <div className="mt-8 md:mt-12 border-t border-white/10 pt-10 max-w-md">
                    <p className="text-gray-500 text-[9px] md:text-[10px] uppercase tracking-[0.3em] leading-relaxed mb-10 font-medium">
                        Professional Kernel-Level Trace Purge Solution. <br />
                        <span className="text-cyan-500 font-bold block mt-2 tracking-widest uppercase italic">Infrastructure: Fully Undetected</span>
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <a href={downloadLink} target="_blank" rel="noreferrer" className="flex justify-center items-center gap-4 bg-white text-black px-10 py-5 hover:bg-cyan-500 transition-all text-[10px] font-black uppercase tracking-widest rounded-sm">
                            <Download size={18} /> Access Core
                        </a>
                        <a href={tgLink} target="_blank" rel="noreferrer" className="flex justify-center items-center gap-4 bg-white/5 border border-white/10 px-8 py-5 hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-widest">
                            <Send size={16} /> Telegram
                        </a>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* TECHNICAL SPECIFICATIONS SECTION */}
      <section className="py-32 px-6 md:px-20 bg-[#050505] relative z-10">
          <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                  <div className="max-w-2xl">
                    <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-6">Technical_Capabilities</h2>
                    <p className="text-white/30 text-[11px] uppercase tracking-[0.3em] leading-loose">
                        Наши алгоритмы работают на уровне ядра, обеспечивая глубокую очистку системы от любых цифровых отпечатков.
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-5xl font-black text-cyan-500 italic drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]">Ring 0</div>
                    <div className="text-[9px] text-white/20 uppercase font-bold tracking-[0.4em] mt-2">Access Level</div>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { title: "Trace Cleaner", desc: "Глубокое удаление записей в реестре, файловых логов и скрытых теневых данных античитов.", icon: <EyeOff /> },
                    { title: "Network Shield", desc: "Маскировка сетевых протоколов и очистка кэша DNS для предотвращения идентификации.", icon: <Radio /> },
                    { title: "Memory Guard", desc: "Шифрование данных в оперативной памяти для защиты от сигнатурного сканирования.", icon: <Database /> }
                  ].map((item, i) => (
                    <div key={i} className="p-8 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all group cursor-default">
                        <div className="text-cyan-500 mb-6 group-hover:scale-110 transition-transform duration-500 group-hover:text-white">{item.icon}</div>
                        <h3 className="text-lg font-bold uppercase italic tracking-tighter mb-4">{item.title}</h3>
                        <p className="text-[10px] text-white/30 uppercase tracking-widest leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
              </div>
          </div>
      </section>

      {/* FOOTER */}
      <footer className="p-12 md:p-24 border-t border-white/5 bg-[#010101] relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex flex-col items-center md:items-start">
                <div className="flex items-center gap-4 mb-4">
                    <img src="/logo.png" className="w-8 h-8 opacity-40 grayscale" alt="logo" />
                    <span className="text-2xl font-black tracking-tighter uppercase italic">NoEye<span className="text-white/20">.Lab</span></span>
                </div>
                <span className="text-[8px] uppercase tracking-[0.5em] font-bold text-white/20">Protocol established 2026 // Kernel Solutions</span>
            </div>
            
            <div className="flex gap-10 text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
                <a href={tgLink} target="_blank" rel="noreferrer" className="hover:text-cyan-500 transition-colors">Telegram</a>
                <a href={dsLink} target="_blank" rel="noreferrer" className="hover:text-cyan-500 transition-colors">Discord</a>
                <a href={downloadLink} target="_blank" rel="noreferrer" className="hover:text-cyan-500 transition-colors">Download</a>
            </div>

            <div className="text-[10px] font-black italic text-red-500/30 uppercase tracking-widest">
                Fuck Cheathunters 
            </div>
        </div>
      </footer>
    </div>
  );
}