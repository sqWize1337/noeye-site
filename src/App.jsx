import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Zap, ChevronRight, ShieldAlert, Snowflake, Play, Clock, Loader2, Cpu, ExternalLink, Ticket, Plus, Monitor, Layers, Hash, Gift, Send, LogOut, Activity, Download
} from 'lucide-react';
import Globe from 'react-globe.gl';

// --- FIREBASE SETUP ---
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc, onSnapshot, collection, query, where, getDocs, writeBatch, arrayUnion, increment } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCDKuwp6yfXw6fAb4A-iIHI2omLiqcPYhk",
  authDomain: "noeye-site.firebaseapp.com",
  projectId: "noeye-site",
  storageBucket: "noeye-site.firebasestorage.app",
  messagingSenderId: "708335428781",
  appId: "1:708335428781:web:96b96bba374f54fd305224",
  measurementId: "G-2RXSS7YQE0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const ADMIN_EMAIL = "danielfetisov.0210@gmail.com";

export default function App() {
  const [page, setPage] = useState('home'); 
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [timeLeft, setTimeLeft] = useState("CALCULATING...");
  const [tick, setTick] = useState(0); 

  const globeEl = useRef();

  // Admin/Inputs
  const [genAmount, setGenAmount] = useState(1);
  const [genDays, setGenDays] = useState(30);
  const [singleKeyName, setSingleKeyName] = useState('');
  const [singleKeyDays, setSingleKeyDays] = useState(30);
  const [compDays, setCompDays] = useState(1);
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const [promoInput, setPromoInput] = useState('');

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 5000);
  };

  const arcsData = useMemo(() => [...Array(20).keys()].map(() => ({
    startLat: (Math.random() - 0.5) * 180,
    startLng: (Math.random() - 0.5) * 360,
    endLat: (Math.random() - 0.5) * 180,
    endLng: (Math.random() - 0.5) * 360,
    color: ['#06b6d4', '#ffffff'][Math.floor(Math.random() * 2)]
  })), []);

  // --- GLOBE ---
  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.8;
      globeEl.current.pointOfView({ altitude: 2.2 });
    }
  }, [page]);

  // --- TIMER ---
  useEffect(() => {
    const timerId = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(timerId);
  }, []);

  useEffect(() => {
    if (!userData?.expiry || userData?.subscription === 'none') {
      setTimeLeft(userData?.isFrozen ? "PAUSED" : "INACTIVE");
      return;
    }
    if (userData.isFrozen) { setTimeLeft("FROZEN"); return; }

    const expiryTime = new Date(userData.expiry).getTime();
    const diff = expiryTime - Date.now();

    if (diff <= 0) {
      setTimeLeft("EXPIRED");
      if (userData.subscription !== 'none') updateDoc(doc(db, "users", user.uid), { subscription: 'none' }).catch(() => {});
    } else {
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${d}D ${h}H ${m}M`);
    }
  }, [tick, userData]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const userRef = doc(db, "users", u.uid);
        onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) setUserData(docSnap.data());
          else setDoc(userRef, { email: u.email, subscription: 'none', isFrozen: false, usedPromos: [], lastHwidReset: 0, lastFreezeAction: 0 });
          setAuthLoading(false);
        });
      } else {
        setUserData(null);
        setAuthLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const handleAuth = async () => {
    setActionLoading(true);
    try {
      if (authMode === 'register') {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", res.user.uid), { username: username || email.split('@')[0], email, subscription: 'none', isFrozen: false, hwid: null, usedPromos: [], lastHwidReset: 0, lastFreezeAction: 0 });
      } else await signInWithEmailAndPassword(auth, email, password);
      setPage('dashboard');
    } catch (e) { showToast(e.message, "error"); }
    setActionLoading(false);
  };

  const handleRedeem = async () => {
    if (!promoInput || actionLoading) return;
    setActionLoading(true);
    try {
        const promoRef = doc(db, "promocodes", promoInput.trim().toUpperCase());
        const promoSnap = await getDoc(promoRef);
        if (!promoSnap.exists() || promoSnap.data().usesLeft <= 0) throw new Error("Invalid Key");
        const ms = (promoSnap.data().days || 30) * 86400000;
        const newExp = new Date(Math.max(userData?.expiry ? new Date(userData.expiry).getTime() : 0, Date.now()) + ms).toISOString();
        await updateDoc(doc(db, "users", user.uid), { expiry: newExp, subscription: 'active', isFrozen: false });
        await updateDoc(promoRef, { usesLeft: increment(-1) });
        setPromoInput('');
        showToast("License Sync Complete", "success");
    } catch (e) { showToast(e.message, "error"); }
    setActionLoading(false);
  };

  const resetHwid = async () => {
    const lastReset = userData?.lastHwidReset || 0;
    if (Date.now() - lastReset < 7 * 86400000) {
        const d = Math.ceil((7 * 86400000 - (Date.now() - lastReset)) / 86400000);
        return showToast(`HWID Cooldown: ${d} days`, "error");
    }
    setActionLoading(true);
    try {
        await updateDoc(doc(db, "users", user.uid), { hwid: null, lastHwidReset: Date.now() });
        showToast("HWID Cleared", "success");
    } catch (e) { showToast(e.message, "error"); }
    setActionLoading(false);
  };

  const toggleFreeze = async () => {
    if (!userData?.expiry || actionLoading) return;
    const lastAction = userData?.lastFreezeAction || 0;
    if (Date.now() - lastAction < 7 * 86400000) {
        const d = Math.ceil((7 * 86400000 - (Date.now() - lastAction)) / 86400000);
        return showToast(`Freeze Cooldown: ${d} days`, "error");
    }

    setActionLoading(true);
    try {
      const userRef = doc(db, "users", user.uid);
      if (!userData.isFrozen) {
        const rem = new Date(userData.expiry).getTime() - Date.now();
        await updateDoc(userRef, { isFrozen: true, remainingTime: rem, lastFreezeAction: Date.now() });
        showToast("Time Paused", "info");
      } else {
        const newExp = new Date(Date.now() + userData.remainingTime).toISOString();
        await updateDoc(userRef, { isFrozen: false, expiry: newExp, remainingTime: null, lastFreezeAction: Date.now() });
        showToast("Time Resumed", "success");
      }
    } catch (e) { showToast(e.message, "error"); }
    setActionLoading(false);
  };

  // Admin Tools
  const forgeBatch = async () => {
    setActionLoading(true);
    try {
        const batch = writeBatch(db);
        const codes = [];
        for (let i = 0; i < genAmount; i++) {
            const code = `NE-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
            batch.set(doc(db, "promocodes", code), { days: parseInt(genDays), usesLeft: 1 });
            codes.push(code);
        }
        await batch.commit();
        const element = document.createElement("a");
        element.href = URL.createObjectURL(new Blob([codes.join('\n')], {type: 'text/plain'}));
        element.download = `keys.txt`;
        element.click();
    } catch (e) { showToast(e.message, "error"); }
    setActionLoading(false);
  };

  const issueSingle = async () => {
    if (!singleKeyName) return;
    setActionLoading(true);
    try {
        await setDoc(doc(db, "promocodes", singleKeyName.toUpperCase()), { days: parseInt(singleKeyDays), usesLeft: 1 });
        showToast("Key Issued", "success");
        setSingleKeyName('');
    } catch (e) { showToast(e.message, "error"); }
    setActionLoading(false);
  };

  const globalComp = async () => {
    setActionLoading(true);
    try {
        const q = query(collection(db, "users"), where("subscription", "==", "active"));
        const snap = await getDocs(q);
        const batch = writeBatch(db);
        snap.forEach(d => {
            const current = new Date(d.data().expiry).getTime();
            batch.update(d.ref, { expiry: new Date(current + (compDays * 86400000)).toISOString() });
        });
        await batch.commit();
        showToast(`Updated ${snap.size} users`, "success");
    } catch (e) { showToast(e.message, "error"); }
    setActionLoading(false);
  };

  if (authLoading) return <div className="h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-cyan-500" /></div>;

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-cyan-500 overflow-x-hidden">
      
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none flex items-center justify-center">
        <Globe ref={globeEl} backgroundColor="rgba(0,0,0,0)" globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg" arcsData={arcsData} arcColor="color" width={1200} height={1200} />
      </div>

      <nav className="fixed top-0 w-full z-[100] px-6 py-6 md:px-20 flex justify-between items-center bg-black/50 backdrop-blur-xl border-b border-white/5">
        <img src="/logo.png" alt="NoEye" className="h-7 cursor-pointer" onClick={() => setPage('home')} />
        <div className="flex gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <button onClick={() => setPage('dashboard')} className="p-3 bg-white text-black rounded-2xl"><User size={20}/></button>
              <button onClick={() => signOut(auth).then(() => setPage('home'))} className="p-3 bg-red-500/10 text-red-500 rounded-2xl"><LogOut size={20}/></button>
            </div>
          ) : (
            <button onClick={() => setPage('auth')} className="px-8 py-3 bg-white text-black text-[10px] font-black uppercase rounded-full hover:bg-cyan-500 transition-all">Authorize</button>
          )}
        </div>
      </nav>

      <main className="relative z-10 min-h-screen flex items-center justify-center px-6 md:px-20 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
            
            {page === 'home' && (
                <motion.div key="h" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="w-full flex flex-col items-start justify-center">
                    <h1 className="text-7xl md:text-[10vw] font-black italic uppercase leading-[0.8] tracking-tighter mb-12 select-none">Silent<br/><span className="text-white/5">Justice</span></h1>
                    <button onClick={() => setPage(user ? 'dashboard' : 'auth')} className="flex items-center gap-8 bg-white text-black pl-12 pr-6 py-5 font-black uppercase text-[11px] rounded-full hover:bg-cyan-500 transition-all shadow-2xl">Enter Terminal <ChevronRight size={18}/></button>
                </motion.div>
            )}

            {page === 'dashboard' && user && (
                <motion.div key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 py-32">
                    <div className="lg:col-span-8 space-y-10">
                        <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-[3.5rem] shadow-2xl">
                            <h3 className="text-[10px] font-black uppercase text-white/20 mb-8 tracking-[0.4em] italic flex items-center gap-2"><Ticket size={14}/> License Portal</h3>
                            <div className="flex flex-col md:flex-row gap-4">
                                <input className="flex-1 bg-black border border-white/10 p-6 rounded-3xl text-sm outline-none focus:border-cyan-500 font-mono uppercase" placeholder="NE-XXXX-XXXX" value={promoInput} onChange={e => setPromoInput(e.target.value)} />
                                <button onClick={handleRedeem} className="bg-white text-black px-12 py-6 rounded-3xl font-black uppercase text-[11px] hover:bg-cyan-500">Activate</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[3rem]">
                                <h3 className="text-[10px] font-black uppercase text-white/20 mb-4 tracking-widest"><Activity size={14}/> Sessions</h3>
                                <p className="text-[16px] font-black text-cyan-500 uppercase italic">Virtual Node Active</p>
                                <p className="text-[9px] text-white/20 uppercase font-black mt-2">Active session: {user.email.split('@')[0]}</p>
                            </div>
                            <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[3rem]">
                                <h3 className="text-[10px] font-black uppercase text-white/20 mb-2 tracking-widest"><Cpu size={14}/> Hardware ID</h3>
                                <p className="text-[11px] font-mono text-white/40 truncate mb-4">{userData?.hwid || 'No hardware linked'}</p>
                                <button onClick={resetHwid} className="text-[9px] font-black uppercase text-red-500/50 hover:text-red-500">Reset HWID (7D)</button>
                            </div>
                        </div>

                        {user.email === ADMIN_EMAIL && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-[#0a0a0a] border border-red-500/10 p-8 rounded-[3rem]">
                                        <h4 className="text-[10px] font-black uppercase text-red-500/50 mb-6 flex items-center gap-2"><Layers size={14}/> Bulk Forge</h4>
                                        <div className="flex gap-4 mb-4">
                                            <input type="number" className="w-20 bg-black border border-white/5 p-4 rounded-xl text-xs" value={genAmount} onChange={e => setGenAmount(e.target.value)} />
                                            <input type="number" className="flex-1 bg-black border border-white/5 p-4 rounded-xl text-xs" value={genDays} onChange={e => setGenDays(e.target.value)} />
                                        </div>
                                        <button onClick={forgeBatch} className="w-full py-4 bg-red-500 text-white rounded-2xl font-black uppercase text-[10px]">Generate</button>
                                    </div>
                                    <div className="bg-[#0a0a0a] border border-cyan-500/10 p-8 rounded-[3rem]">
                                        <h4 className="text-[10px] font-black uppercase text-cyan-500/50 mb-6 flex items-center gap-2"><Ticket size={14}/> Single Issue</h4>
                                        <div className="flex gap-4 mb-4">
                                            <input className="flex-1 bg-black border border-white/5 p-4 rounded-xl text-xs font-mono uppercase" value={singleKeyName} onChange={e => setSingleKeyName(e.target.value)} placeholder="Code"/>
                                            <input type="number" className="w-20 bg-black border border-white/5 p-4 rounded-xl text-xs" value={singleKeyDays} onChange={e => setSingleKeyDays(e.target.value)} />
                                        </div>
                                        <button onClick={issueSingle} className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase text-[10px]">Create</button>
                                    </div>
                                </div>
                                <div className="bg-red-500/5 border border-red-500/20 p-8 rounded-[3.5rem] flex items-center justify-between">
                                    <h4 className="text-[11px] font-black uppercase text-red-500 flex items-center gap-4 ml-4 italic"><Zap size={20}/> Compensation</h4>
                                    <div className="flex gap-3">
                                        <input type="number" className="w-16 bg-black border border-red-500/20 p-4 rounded-xl text-xs text-center" value={compDays} onChange={e => setCompDays(e.target.value)} />
                                        <button onClick={globalComp} className="px-8 bg-red-500 text-white rounded-xl font-black uppercase text-[10px]">Add Days</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-4">
                        <div className={`p-10 rounded-[4rem] border sticky top-32 transition-all duration-700 ${userData?.isFrozen ? 'bg-cyan-950/20 border-cyan-400' : 'bg-[#0a0a0a] border-white/5 shadow-2xl'}`}>
                            <div className="flex justify-between items-start mb-16">
                                {userData?.isFrozen ? <Snowflake size={50} className="text-cyan-400 animate-pulse" /> : <Zap size={50} className="text-cyan-500" />}
                                {userData?.expiry && (
                                    <button onClick={toggleFreeze} className="p-5 bg-white/5 rounded-2xl hover:bg-white hover:text-black transition-all">
                                        {userData.isFrozen ? <Play size={20}/> : <Snowflake size={20}/>}
                                    </button>
                                )}
                            </div>
                            <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-4 leading-none">{userData?.isFrozen ? 'Frozen' : 'License'}</h2>
                            <div className="flex items-center gap-3 px-6 py-3 bg-black/50 border border-white/5 rounded-full w-fit">
                                <Clock size={16} className="text-cyan-500"/><span className="text-[20px] font-black uppercase font-mono text-white pt-1">{timeLeft}</span>
                            </div>
                            <button className="mt-16 w-full py-6 bg-white text-black rounded-3xl font-black uppercase text-[11px] hover:bg-cyan-500 transition-all flex items-center justify-center gap-3">
                                <ExternalLink size={18}/> Launch Handshake
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {page === 'auth' && (
                <motion.div key="a" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full flex items-center justify-center">
                    <div className="bg-[#0a0a0a] p-12 rounded-[4rem] w-full max-w-sm border border-white/5 shadow-2xl">
                        <h2 className="text-2xl font-black uppercase italic text-center mb-10 text-cyan-500">{authMode}</h2>
                        <div className="space-y-4">
                            {authMode === 'register' && <input className="w-full bg-black border border-white/10 p-6 rounded-3xl text-sm outline-none focus:border-cyan-500 transition-all" placeholder="IDENTIFIER" value={username} onChange={e => setUsername(e.target.value)} />}
                            <input className="w-full bg-black border border-white/10 p-6 rounded-3xl text-sm outline-none focus:border-cyan-500 transition-all" placeholder="EMAIL" value={email} onChange={e => setEmail(e.target.value)} />
                            <input type="password" className="w-full bg-black border border-white/10 p-6 rounded-3xl text-sm outline-none focus:border-cyan-500 transition-all" placeholder="PASSCODE" value={password} onChange={e => setPassword(e.target.value)} />
                            <button onClick={handleAuth} className="w-full py-6 bg-white text-black rounded-3xl font-black uppercase text-[11px] hover:bg-cyan-500 transition-all mt-4 tracking-widest shadow-xl">Execute Link</button>
                            <p onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-center text-[9px] font-black uppercase text-white/20 mt-8 cursor-pointer hover:text-white transition-all">{authMode === 'login' ? 'Create Node' : 'Existing Node'}</p>
                        </div>
                    </div>
                </motion.div>
            )}

        </AnimatePresence>
      </main>

      <div className="fixed top-24 right-6 z-[1000] flex flex-col gap-3">
        {notifications.map(n => (
          <div key={n.id} className={`px-6 py-4 rounded-2xl backdrop-blur-xl border border-white/10 shadow-2xl text-[10px] font-black uppercase tracking-widest ${n.type === 'error' ? 'text-red-400 bg-red-500/10' : 'text-cyan-400 bg-cyan-500/10'}`}>
            {n.message}
          </div>
        ))}
      </div>
    </div>
  );
}