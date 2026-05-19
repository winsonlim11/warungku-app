import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity, AlertCircle, Calendar, Award, Star, Download } from 'lucide-react';

export default function Laporan({ transactions, clearTransactions }) {
  const [timeFilter, setTimeFilter] = useState('all'); // 'today', 'week', 'month', 'all', 'custom'
  const [customDate, setCustomDate] = useState('');

  // 1. Filter Transactions based on time
  const now = new Date();
  const filteredTransactions = transactions.filter(t => {
    if (timeFilter === 'all') return true;
    
    const tDate = new Date(t.timestamp);
    if (timeFilter === 'today') {
      return tDate.toDateString() === now.toDateString();
    }
    if (timeFilter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return tDate >= weekAgo;
    }
    if (timeFilter === 'month') {
      return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
    }
    if (timeFilter === 'custom' && customDate) {
      const selectedDate = new Date(customDate);
      return tDate.toDateString() === selectedDate.toDateString();
    }
    return true;
  });

  // 2. Calculate Metrics based on filtered transactions
  const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.total_price, 0);
  const totalCost = filteredTransactions.reduce((sum, t) => sum + t.total_cost, 0);
  const netProfit = totalRevenue - totalCost;
  const margin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;
  
  const isProfitable = netProfit >= 0;

  // 3. Best Sellers Aggregation
  const productSales = {};
  filteredTransactions.forEach(t => {
    t.items.forEach(item => {
      if (!productSales[item.name]) {
        productSales[item.name] = { qty: 0, revenue: 0 };
      }
      productSales[item.name].qty += item.qty;
      productSales[item.name].revenue += (item.qty * item.price);
    });
  });

  const bestSellers = Object.entries(productSales)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5); // Top 5

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      alert('Tidak ada data untuk diexport pada periode ini.');
      return;
    }

    // Membuat header dan baris data
    const headers = ['Waktu', 'Item', 'Metode Pembayaran', 'Modal', 'Pendapatan', 'Keuntungan'];
    const rows = filteredTransactions.map(t => {
      const date = new Date(t.timestamp).toLocaleString('id-ID');
      const itemsStr = t.items.map(i => `${i.qty}x ${i.name}`).join(' | ');
      const method = t.payment_method || 'Tunai';
      const cost = t.total_cost;
      const price = t.total_price;
      const profit = price - cost;
      
      // Bungkus dengan petik ganda agar item dengan koma/pemisah tidak merusak format CSV
      return `"${date}","${itemsStr}","${method}","${cost}","${price}","${profit}"`;
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    
    // Buat Blob dan download trigger
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan_WarungKu_${timeFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Time Filters & Export */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between p-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-sm">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center px-3 hidden md:flex">
            <Calendar className="w-5 h-5 mr-2 text-indigo-500" />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>Waktu:</span>
          </div>
          <button onClick={() => {setTimeFilter('today'); setCustomDate('');}} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${timeFilter === 'today' ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20' : 'bg-transparent text-[var(--text-muted)] hover:bg-[var(--bg-input)]'}`}>Hari Ini</button>
          <button onClick={() => {setTimeFilter('week'); setCustomDate('');}} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${timeFilter === 'week' ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20' : 'bg-transparent text-[var(--text-muted)] hover:bg-[var(--bg-input)]'}`}>7 Hari</button>
          <button onClick={() => {setTimeFilter('month'); setCustomDate('');}} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${timeFilter === 'month' ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20' : 'bg-transparent text-[var(--text-muted)] hover:bg-[var(--bg-input)]'}`}>Bulan Ini</button>
          <button onClick={() => {setTimeFilter('all'); setCustomDate('');}} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${timeFilter === 'all' ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20' : 'bg-transparent text-[var(--text-muted)] hover:bg-[var(--bg-input)]'}`}>Semua</button>
          
          <input 
            type="date" 
            value={customDate}
            onChange={(e) => {
              setCustomDate(e.target.value);
              if(e.target.value) setTimeFilter('custom');
            }}
            className={`ml-2 px-3 py-1.5 h-[36px] rounded-xl text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300 ${timeFilter === 'custom' ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 text-indigo-700 dark:text-indigo-400' : 'bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--text-muted)] hover:border-slate-400'}`}
            title="Pilih Tanggal Spesifik"
          />
        </div>
        
        <button 
          onClick={handleExportCSV}
          className="w-full md:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-medium shadow-md shadow-emerald-500/30 hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Simpan ke Excel (CSV)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Pendapatan */}
        <div className="premium-card p-6 relative overflow-hidden group hover:-translate-y-1">
          <div className="absolute -right-4 -top-4 p-8 bg-blue-500/5 dark:bg-blue-500/10 rounded-full group-hover:scale-110 transition-transform duration-500">
            <DollarSign className="w-16 h-16 text-blue-500/20 dark:text-blue-400/20" />
          </div>
          <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Total Pendapatan</p>
          <h3 className="text-3xl font-bold text-[var(--text-main)] tracking-tight">Rp{totalRevenue.toLocaleString('id-ID')}</h3>
          <p className="text-xs mt-3 flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
            Dari {filteredTransactions.length} transaksi
          </p>
        </div>

        {/* Total Modal Terpakai */}
        <div className="premium-card p-6 relative overflow-hidden group hover:-translate-y-1">
          <div className="absolute -right-4 -top-4 p-8 bg-slate-500/5 dark:bg-slate-500/10 rounded-full group-hover:scale-110 transition-transform duration-500">
            <Activity className="w-16 h-16 text-slate-500/20 dark:text-slate-400/20" />
          </div>
          <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Modal Barang Terjual</p>
          <h3 className="text-3xl font-bold text-[var(--text-main)] tracking-tight">Rp{totalCost.toLocaleString('id-ID')}</h3>
          <p className="text-xs mt-3 flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <span className="inline-block w-2 h-2 rounded-full bg-slate-400"></span>
            Uang yang diputar kembali
          </p>
        </div>

        {/* Keuntungan Bersih */}
        <div className={`premium-card p-6 relative overflow-hidden group hover:-translate-y-1 border-2 ${isProfitable ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-500/30' : 'bg-red-50/50 dark:bg-red-900/10 border-red-500/30'}`}>
          <div className={`absolute -right-4 -top-4 p-8 rounded-full group-hover:scale-110 transition-transform duration-500 ${isProfitable ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
            {isProfitable ? <TrendingUp className={`w-16 h-16 ${isProfitable ? 'text-emerald-500/20' : 'text-red-500/20'}`} /> : <TrendingDown className={`w-16 h-16 ${isProfitable ? 'text-emerald-500/20' : 'text-red-500/20'}`} />}
          </div>
          <div className="flex items-center justify-between mb-2 relative z-10">
            <p className={`text-sm font-medium ${isProfitable ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              Keuntungan Bersih
            </p>
            <span className={`px-2 py-1 text-xs font-bold rounded-full ${isProfitable ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'}`}>
              Margin: {margin}%
            </span>
          </div>
          <h3 className={`text-3xl font-bold tracking-tight relative z-10 ${isProfitable ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
            {isProfitable ? '+' : '-'} Rp{Math.abs(netProfit).toLocaleString('id-ID')}
          </h3>
          <p className={`text-xs mt-3 flex items-center gap-1 relative z-10 ${isProfitable ? 'text-emerald-600/80 dark:text-emerald-400/80' : 'text-red-600/80 dark:text-red-400/80'}`}>
            {isProfitable ? 'Bisnis Anda menguntungkan! 🎉' : 'Waspada! Bisnis sedang merugi. ⚠️'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Best Sellers Section */}
        <div className="md:col-span-1 premium-card overflow-hidden flex flex-col">
          <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-5 text-white flex items-center gap-3">
            <Award className="w-6 h-6" />
            <h3 className="font-semibold text-lg">Produk Terlaris</h3>
          </div>
          <div className="p-0 flex-1 bg-[var(--bg-input)]">
            {bestSellers.length === 0 ? (
              <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>
                <Star className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p className="text-sm">Belum ada data penjualan.</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-color)]">
                {bestSellers.map((product, idx) => (
                  <div key={product.name} className="p-4 flex items-center justify-between hover:bg-[var(--bg-card)] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' : idx === 1 ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300' : idx === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400' : 'bg-[var(--bg-input)] text-[var(--text-muted)]'}`}>
                        #{idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--text-main)] text-sm">{product.name}</p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Rp{product.revenue.toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-md">{product.qty}x laku</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Transaction History */}
        <div className="md:col-span-2 premium-card overflow-hidden">
          <div className="bg-[var(--bg-card)] p-5 border-b border-[var(--border-color)] flex justify-between items-center">
            <h3 className="font-semibold text-lg" style={{ color: 'var(--text-main)' }}>Riwayat Transaksi</h3>
            {transactions.length > 0 && (
              <button 
                onClick={() => {
                  if(window.confirm('Hapus semua riwayat transaksi? Data ini tidak bisa dikembalikan.')) {
                    clearTransactions();
                  }
                }}
                className="text-xs px-3 py-1.5 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors"
              >
                Hapus Semua Riwayat
              </button>
            )}
          </div>
          <div className="p-0 bg-[var(--bg-input)] h-[400px] overflow-y-auto custom-scrollbar">
            {filteredTransactions.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center h-full justify-center" style={{ color: 'var(--text-muted)' }}>
                <AlertCircle className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-medium text-sm">Tidak ada transaksi pada periode ini.</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-color)]">
                {[...filteredTransactions].reverse().map(t => (
                  <div key={t.id} className="p-5 hover:bg-[var(--bg-card)] transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-md">
                            {new Date(t.timestamp).toLocaleString('id-ID', {
                              day: 'numeric', month: 'short', year: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                          <p className={`text-xs font-medium px-2 py-1 rounded-md ${
                            t.payment_method === 'QRIS' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
                            t.payment_method === 'Transfer' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                            'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          }`}>
                            {t.payment_method || 'Tunai'}
                          </p>
                        </div>
                        <p className="font-medium text-[var(--text-main)]">
                          {t.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-[var(--text-main)]">Rp{t.total_price.toLocaleString('id-ID')}</p>
                        <p className={`text-xs font-medium mt-1 ${t.total_price - t.total_cost >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          Untung: Rp{(t.total_price - t.total_cost).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
