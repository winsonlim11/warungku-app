import React, { useState, useEffect } from 'react';
import { MessageSquare, LineChart, ShoppingBag, Moon, Sun, Store, Lock, Key, Package } from 'lucide-react';
import TanyaAI from './components/TanyaAI';
import Kasir from './components/Kasir';
import Laporan from './components/Laporan';
import Inventory from './components/Inventory';
import { usePOS } from './hooks/usePOS';

function App() {
  const [activeTab, setActiveTab] = useState('kasir');
  
  // Security States
  const [appUnlocked, setAppUnlocked] = useState(() => {
    if (typeof window !== 'undefined') return sessionStorage.getItem('appUnlocked') === 'true';
    return false;
  });
  const [laporanUnlocked, setLaporanUnlocked] = useState(() => {
    if (typeof window !== 'undefined') return sessionStorage.getItem('laporanUnlocked') === 'true';
    return false;
  });
  const [stokUnlocked, setStokUnlocked] = useState(() => {
    if (typeof window !== 'undefined') return sessionStorage.getItem('stokUnlocked') === 'true';
    return false;
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  
  const posState = usePOS();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  // App Lock Render
  if (!appUnlocked) {
    return <LockScreen type="app" onUnlock={() => {
      setAppUnlocked(true);
      sessionStorage.setItem('appUnlocked', 'true');
    }} />;
  }

  const renderContent = () => {
    if (activeTab === 'kasir') return <Kasir products={posState.products} addTransaction={posState.addTransaction} />;
    
    // Check if Stok is locked
    if (activeTab === 'stok' && !stokUnlocked) {
      return <LockScreen type="stok" onUnlock={() => {
        setStokUnlocked(true);
        sessionStorage.setItem('stokUnlocked', 'true');
      }} />;
    }

    if (activeTab === 'stok') return <Inventory products={posState.products} addProduct={posState.addProduct} updateProduct={posState.updateProduct} deleteProduct={posState.deleteProduct} />;

    // Check if Laporan/AI is locked
    if ((activeTab === 'laporan' || activeTab === 'tanya-ai') && !laporanUnlocked) {
      return <LockScreen type="laporan" onUnlock={() => {
        setLaporanUnlocked(true);
        sessionStorage.setItem('laporanUnlocked', 'true');
      }} />;
    }

    if (activeTab === 'laporan') return <Laporan transactions={posState.transactions} clearTransactions={posState.clearTransactions} />;
    if (activeTab === 'tanya-ai') return <TanyaAI transactions={posState.transactions} products={posState.products} />;
  };

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300 bg-[var(--bg-main)] text-[var(--text-main)]">
      {/* Header */}
      <header className="glass-header sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/20 blur-[2px] rounded-xl"></div>
                <Store className="w-6 h-6 text-white relative z-10" strokeWidth={2.5} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-teal-500 dark:from-emerald-400 dark:to-teal-300 group-hover:opacity-80 transition-opacity">
                Warung<span className="font-light">Ku</span>
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Desktop Navigation */}
              <nav className="hidden md:flex space-x-2 bg-[var(--bg-input)] p-1 rounded-xl backdrop-blur-md border border-[var(--border-color)]">
                <TabButton 
                  active={activeTab === 'kasir'} 
                  onClick={() => setActiveTab('kasir')}
                  icon={<ShoppingBag size={18} />}
                  label="Kasir"
                />
                <TabButton 
                  active={activeTab === 'stok'} 
                  onClick={() => setActiveTab('stok')}
                  icon={<Package size={18} />}
                  label="Gudang"
                  locked={!stokUnlocked}
                />
                <TabButton 
                  active={activeTab === 'laporan'} 
                  onClick={() => setActiveTab('laporan')}
                  icon={<LineChart size={18} />}
                  label="Laporan"
                  locked={!laporanUnlocked}
                />
                <TabButton 
                  active={activeTab === 'tanya-ai'} 
                  onClick={() => setActiveTab('tanya-ai')}
                  icon={<MessageSquare size={18} />}
                  label="Asisten AI"
                  locked={!laporanUnlocked}
                />
              </nav>

              <div className="flex items-center gap-2">
                <button 
                  onClick={toggleDarkMode}
                  className="p-2 rounded-full bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-emerald-500 border border-[var(--border-color)] transition-colors"
                  title="Ganti Tema"
                >
                  {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <button 
                  onClick={() => {
                    sessionStorage.removeItem('appUnlocked');
                    sessionStorage.removeItem('laporanUnlocked');
                    sessionStorage.removeItem('stokUnlocked');
                    setAppUnlocked(false);
                    setLaporanUnlocked(false);
                    setStokUnlocked(false);
                    setActiveTab('kasir');
                  }}
                  className="p-2 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-100 dark:border-red-900/30 transition-colors"
                  title="Kunci Aplikasi"
                >
                  <Lock size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className="md:hidden flex overflow-x-auto border-t border-[var(--border-color)] bg-[var(--bg-card)] px-2 py-1">
          <div className="flex w-full space-x-1">
             <MobileTabButton 
                active={activeTab === 'kasir'} 
                onClick={() => setActiveTab('kasir')}
                icon={<ShoppingBag size={18} />}
                label="Kasir"
              />
              <MobileTabButton 
                active={activeTab === 'stok'} 
                onClick={() => setActiveTab('stok')}
                icon={<Package size={18} />}
                label="Gudang"
                locked={!stokUnlocked}
              />
              <MobileTabButton 
                active={activeTab === 'laporan'} 
                onClick={() => setActiveTab('laporan')}
                icon={<LineChart size={18} />}
                label="Laporan"
                locked={!laporanUnlocked}
              />
              <MobileTabButton 
                active={activeTab === 'tanya-ai'} 
                onClick={() => setActiveTab('tanya-ai')}
                icon={<MessageSquare size={18} />}
                label="Asisten AI"
                locked={!laporanUnlocked}
              />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fade-in-up">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

// Lock Screen Component
function LockScreen({ type, onUnlock }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const correctPassword = type === 'app' ? '12345' : 'winwin';
  const title = type === 'app' ? 'Sistem Terkunci' : type === 'stok' ? 'Akses Gudang Terkunci' : 'Akses Keuangan Terkunci';
  const desc = type === 'app' ? 'Masukkan PIN untuk membuka sistem kasir.' : type === 'stok' ? 'Masukkan sandi pemilik untuk mengelola data produk.' : 'Masukkan sandi pemilik untuk melihat laporan.';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === correctPassword) {
      onUnlock();
    } else {
      setError(true);
      setPassword('');
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className={`min-h-[80vh] flex items-center justify-center p-4 ${type === 'app' ? 'min-h-screen bg-[var(--bg-main)]' : ''}`}>
      <div className={`premium-card p-8 w-full max-w-sm text-center ${error ? 'animate-pulse border-red-500' : ''}`}>
        <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
          {type === 'app' ? <Lock className="w-8 h-8 text-emerald-500" /> : <Key className="w-8 h-8 text-indigo-500" />}
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-main)] mb-2">{title}</h2>
        <p className="text-[var(--text-muted)] text-sm mb-6">{desc}</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="password" 
            autoFocus
            className={`premium-input text-center text-xl tracking-widest ${error ? 'border-red-500 text-red-500' : ''}`}
            placeholder="••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          {error && <p className="text-red-500 text-xs">Sandi salah. Coba lagi.</p>}
          <button type="submit" className="w-full btn-primary bg-slate-800 hover:bg-slate-900 dark:bg-emerald-600 dark:hover:bg-emerald-700 shadow-none">
            Buka Kunci
          </button>
        </form>
      </div>
    </div>
  );
}

// Subcomponents for tabs
function TabButton({ active, onClick, icon, label, locked }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 py-2 px-4 rounded-lg font-medium text-sm transition-all duration-300 relative ${
        active 
          ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' 
          : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
      }`}
    >
      {icon}
      <span>{label}</span>
      {locked && <Lock className="w-3 h-3 absolute top-1 right-1 opacity-50" />}
    </button>
  );
}

function MobileTabButton({ active, onClick, icon, label, locked }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center justify-center py-2 px-1 space-y-1 text-[11px] font-medium rounded-lg transition-all duration-300 relative ${
        active 
          ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30' 
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
    >
      {icon}
      <span>{label}</span>
      {locked && <Lock className="w-3 h-3 absolute top-1 right-2 opacity-50" />}
    </button>
  );
}

export default App;
