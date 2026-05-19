import React, { useState } from 'react';
import { ShoppingCart, Trash2, CreditCard, Banknote, Landmark, Coffee, UtensilsCrossed, AlertTriangle, Search } from 'lucide-react';

export default function Kasir({ products, addTransaction }) {
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('Tunai');
  const [filterCategory, setFilterCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  const addToCart = (product) => {
    const existing = cart.find(item => item.product_id === product.id);
    const currentQtyInCart = existing ? existing.qty : 0;
    const availableStock = product.stock || 0;

    if (currentQtyInCart >= availableStock) {
      alert(`Stok tidak mencukupi! Sisa stok ${product.name} hanya ${availableStock}.`);
      return;
    }

    if (existing) {
      setCart(cart.map(item => item.product_id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { product_id: product.id, name: product.name, price: product.price, cost: product.cost, qty: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    let total_price = 0;
    let total_cost = 0;
    
    cart.forEach(item => {
      total_price += item.price * item.qty;
      total_cost += item.cost * item.qty;
    });

    addTransaction({
      items: cart,
      total_price,
      total_cost,
      payment_method: paymentMethod
    });
    
    setCart([]);
    setPaymentMethod('Tunai');
    alert('Transaksi berhasil disimpan! Stok otomatis berkurang.');
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  // Filter and search products
  const filteredProducts = products.filter(p => {
    const pCat = p.category || 'Makanan';
    const matchCategory = filterCategory === 'Semua' || pCat === filterCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up">
      {/* Katalog Produk */}
      <div className="lg:col-span-2 space-y-6">
        <div className="premium-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex bg-[var(--bg-input)] p-1 rounded-xl border border-[var(--border-color)] shadow-inner">
            <button 
              onClick={() => setFilterCategory('Semua')} 
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filterCategory === 'Semua' ? 'bg-indigo-500 text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              Semua Menu
            </button>
            <button 
              onClick={() => setFilterCategory('Makanan')} 
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${filterCategory === 'Makanan' ? 'bg-orange-500 text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              <UtensilsCrossed className="w-4 h-4" /> Makanan
            </button>
            <button 
              onClick={() => setFilterCategory('Minuman')} 
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${filterCategory === 'Minuman' ? 'bg-blue-500 text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              <Coffee className="w-4 h-4" /> Minuman
            </button>
          </div>
          
          <div className="relative flex-1 max-w-xs">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="premium-input w-full pl-10 py-2.5 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full text-center p-12 premium-card">
              <p className="text-lg font-medium" style={{ color: 'var(--text-muted)' }}>Tidak ada produk ditemukan.</p>
            </div>
          ) : (
            filteredProducts.map(product => {
              const isMinuman = (product.category || 'Makanan') === 'Minuman';
              const stock = product.stock || 0;
              const isLowStock = stock > 0 && stock <= 5;
              const isOutOfStock = stock === 0;

              return (
                <button 
                  key={product.id}
                  onClick={() => addToCart(product)}
                  disabled={isOutOfStock}
                  className={`premium-card p-5 text-left flex flex-col justify-between h-full transition-all duration-300 ${isOutOfStock ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:-translate-y-1 hover:shadow-xl hover:border-indigo-500/50 cursor-pointer group'}`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className={`p-2.5 rounded-xl ${isMinuman ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400'} ${!isOutOfStock && 'group-hover:scale-110 transition-transform'}`}>
                        {isMinuman ? <Coffee className="w-6 h-6" /> : <UtensilsCrossed className="w-6 h-6" />}
                      </div>
                      {/* Stock Badge */}
                      <span className={`text-[10px] px-2 py-1 rounded-md font-bold flex items-center gap-1 ${isOutOfStock ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400' : isLowStock ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                        {isOutOfStock ? 'HABIS' : `Stok: ${stock}`}
                      </span>
                    </div>
                    <h4 className="font-bold text-[var(--text-main)] text-lg leading-tight mb-1">{product.name}</h4>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[var(--border-color)]">
                    <p className="font-black text-indigo-600 dark:text-indigo-400 text-lg">
                      Rp{product.price.toLocaleString('id-ID')}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Keranjang Kasir */}
      <div className="space-y-6">
        <div className="premium-card h-[calc(100vh-8rem)] min-h-[600px] flex flex-col overflow-hidden sticky top-6">
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-5 flex items-center justify-between text-white shadow-md z-10">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-6 h-6" />
              <h3 className="font-bold text-lg">Keranjang Belanja</h3>
            </div>
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold">{cart.length} item</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[var(--bg-input)] custom-scrollbar">
            {cart.length === 0 ? (
              <div className="h-full flex items-center justify-center flex-col text-slate-400 dark:text-slate-500">
                <ShoppingCart className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-sm font-semibold">Keranjang masih kosong</p>
                <p className="text-xs mt-1">Pilih menu dari katalog di sebelah kiri.</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.product_id} className="flex items-center justify-between p-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-sm animate-fade-in-up">
                  <div className="flex-1">
                    <p className="font-bold text-[var(--text-main)] text-sm">{item.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center justify-center bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400 px-2 py-0.5 rounded text-xs font-black">
                        {item.qty}x
                      </span> 
                      <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                        @ Rp{item.price.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pl-3">
                    <span className="font-black text-[var(--text-main)]">
                      Rp{(item.price * item.qty).toLocaleString('id-ID')}
                    </span>
                    <button 
                      onClick={() => removeFromCart(item.product_id)}
                      className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-5 border-t border-[var(--border-color)] bg-[var(--bg-card)] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
            <div className="mb-4">
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Metode Pembayaran</label>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => setPaymentMethod('Tunai')}
                  className={`flex items-center justify-center py-2 px-2 rounded-lg border ${paymentMethod === 'Tunai' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shadow-inner' : 'border-[var(--border-color)] hover:bg-[var(--bg-input)] text-[var(--text-muted)]'} transition-all`}
                >
                  <Banknote className="w-4 h-4 mr-1.5" />
                  <span className="text-xs font-bold">Tunai</span>
                </button>
                <button 
                  onClick={() => setPaymentMethod('QRIS')}
                  className={`flex items-center justify-center py-2 px-2 rounded-lg border ${paymentMethod === 'QRIS' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shadow-inner' : 'border-[var(--border-color)] hover:bg-[var(--bg-input)] text-[var(--text-muted)]'} transition-all`}
                >
                  <CreditCard className="w-4 h-4 mr-1.5" />
                  <span className="text-xs font-bold">QRIS</span>
                </button>
                <button 
                  onClick={() => setPaymentMethod('Transfer')}
                  className={`flex items-center justify-center py-2 px-2 rounded-lg border ${paymentMethod === 'Transfer' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shadow-inner' : 'border-[var(--border-color)] hover:bg-[var(--bg-input)] text-[var(--text-muted)]'} transition-all`}
                >
                  <Landmark className="w-4 h-4 mr-1.5" />
                  <span className="text-xs font-bold">TF</span>
                </button>
              </div>
            </div>

            <div className="flex items-end justify-between mb-5 bg-[var(--bg-input)] p-3 rounded-xl">
              <span className="font-bold text-sm uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Total</span>
              <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-indigo-400 dark:to-blue-300">
                Rp{cartTotal.toLocaleString('id-ID')}
              </span>
            </div>
            <button 
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="w-full btn-primary bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 shadow-indigo-500/30 hover:shadow-indigo-500/40 py-4 text-lg rounded-xl"
            >
              Bayar Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
