import React, { useState } from 'react';
import { Package, Plus, Trash2, Edit2, Coffee, UtensilsCrossed, AlertTriangle } from 'lucide-react';

export default function Inventory({ products, addProduct, updateProduct, deleteProduct }) {
  const [newProduct, setNewProduct] = useState({ name: '', cost: '', price: '', category: 'Makanan', stock: '' });
  const [editingProductId, setEditingProductId] = useState(null);
  const [filterCategory, setFilterCategory] = useState('Semua');

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.cost || !newProduct.price || !newProduct.stock) return;
    
    if (editingProductId) {
      updateProduct(editingProductId, {
        name: newProduct.name,
        cost: Number(newProduct.cost),
        price: Number(newProduct.price),
        category: newProduct.category || 'Makanan',
        stock: Number(newProduct.stock)
      });
      setEditingProductId(null);
    } else {
      addProduct({
        name: newProduct.name,
        cost: Number(newProduct.cost),
        price: Number(newProduct.price),
        category: newProduct.category || 'Makanan',
        stock: Number(newProduct.stock)
      });
    }
    setNewProduct({ name: '', cost: '', price: '', category: 'Makanan', stock: '' });
  };

  const handleEditClick = (product) => {
    setNewProduct({ 
      name: product.name, 
      cost: product.cost, 
      price: product.price,
      category: product.category || 'Makanan',
      stock: product.stock || 0
    });
    setEditingProductId(product.id);
  };

  const cancelEdit = () => {
    setNewProduct({ name: '', cost: '', price: '', category: 'Makanan', stock: '' });
    setEditingProductId(null);
  };

  const filteredProducts = products.filter(p => {
    const pCat = p.category || 'Makanan';
    return filterCategory === 'Semua' || pCat === filterCategory;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      <div className="premium-card overflow-hidden">
        <div className={`p-6 flex items-center gap-3 text-white ${editingProductId ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-emerald-500 to-emerald-600'}`}>
          <Package className="w-8 h-8" />
          <div>
            <h3 className="font-bold text-xl">{editingProductId ? 'Edit Data Produk' : 'Tambah Produk Baru'}</h3>
            <p className="text-sm opacity-90">{editingProductId ? 'Perbarui harga, modal, atau sisa stok produk Anda.' : 'Masukkan produk baru ke dalam gudang toko Anda.'}</p>
          </div>
        </div>
        <div className="p-8">
          <form onSubmit={handleAddProduct} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Nama Produk</label>
                <input 
                  type="text" 
                  className="premium-input py-3"
                  value={newProduct.name}
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  placeholder="Contoh: Kopi Bubuk"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Kategori</label>
                <select 
                  className="premium-input w-full appearance-none py-3 bg-white dark:bg-slate-800"
                  value={newProduct.category}
                  onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                >
                  <option value="Makanan">Makanan</option>
                  <option value="Minuman">Minuman</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Stok Awal (Pcs)</label>
                <input 
                  type="number" 
                  className="premium-input py-3"
                  value={newProduct.stock}
                  onChange={e => setNewProduct({...newProduct, stock: e.target.value})}
                  placeholder="Contoh: 50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Harga Modal (Rp)</label>
                <input 
                  type="number" 
                  className="premium-input py-3"
                  value={newProduct.cost}
                  onChange={e => setNewProduct({...newProduct, cost: e.target.value})}
                  placeholder="Contoh: 5000"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Harga Jual (Rp)</label>
                <input 
                  type="number" 
                  className="premium-input py-3"
                  value={newProduct.price}
                  onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                  placeholder="Contoh: 8000"
                />
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <button 
                type="submit"
                className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 text-white shadow-lg ${editingProductId ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/30 hover:shadow-amber-500/40 hover:-translate-y-1' : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:-translate-y-1'}`}
              >
                {editingProductId ? <Edit2 className="w-6 h-6" /> : <Plus className="w-6 h-6" />} 
                {editingProductId ? 'Simpan Perubahan' : 'Tambahkan ke Gudang'}
              </button>
              {editingProductId && (
                <button 
                  type="button"
                  onClick={cancelEdit}
                  className="py-4 px-8 rounded-xl font-bold border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="premium-card overflow-hidden">
        <div className="p-6 border-b border-[var(--border-color)] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h4 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>Katalog Gudang</h4>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Total {filteredProducts.length} jenis produk tersimpan.</p>
          </div>
          <div className="flex bg-[var(--bg-input)] p-1 rounded-xl border border-[var(--border-color)] shadow-inner">
            <button 
              onClick={() => setFilterCategory('Semua')} 
              className={`flex-1 md:flex-none px-5 py-2 rounded-lg text-sm font-bold transition-all ${filterCategory === 'Semua' ? 'bg-emerald-500 text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              Semua
            </button>
            <button 
              onClick={() => setFilterCategory('Makanan')} 
              className={`flex-1 md:flex-none px-5 py-2 rounded-lg text-sm font-bold transition-all ${filterCategory === 'Makanan' ? 'bg-emerald-500 text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              Makanan
            </button>
            <button 
              onClick={() => setFilterCategory('Minuman')} 
              className={`flex-1 md:flex-none px-5 py-2 rounded-lg text-sm font-bold transition-all ${filterCategory === 'Minuman' ? 'bg-emerald-500 text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              Minuman
            </button>
          </div>
        </div>

        <div className="p-0 bg-[var(--bg-input)]">
          {filteredProducts.length === 0 ? (
            <div className="p-16 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
              <h3 className="text-lg font-bold text-[var(--text-main)] mb-1">Gudang Kosong</h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Belum ada produk untuk kategori ini. Silakan tambahkan di atas.</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-color)]">
              {filteredProducts.map(product => {
                const isMinuman = (product.category || 'Makanan') === 'Minuman';
                const stock = product.stock || 0;
                const isLowStock = stock <= 5;
                const isOutOfStock = stock === 0;

                return (
                  <div key={product.id} className="p-5 flex items-center justify-between hover:bg-[var(--bg-card)] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isMinuman ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400'}`}>
                        {isMinuman ? <Coffee className="w-6 h-6" /> : <UtensilsCrossed className="w-6 h-6" />}
                      </div>
                      <div>
                        <p className="font-bold text-[var(--text-main)] text-lg mb-1">{product.name}</p>
                        <div className="flex items-center gap-3">
                          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                            Jual: Rp{product.price.toLocaleString('id-ID')}
                          </p>
                          <span className="text-slate-300 dark:text-slate-600">|</span>
                          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                            Modal: Rp{product.cost.toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Sisa Stok</p>
                        <span className={`px-3 py-1 rounded-lg font-bold text-sm flex items-center gap-1.5 justify-end ${isOutOfStock ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400' : isLowStock ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                          {isOutOfStock && <AlertTriangle className="w-4 h-4" />}
                          {stock} Pcs
                        </span>
                      </div>
                      <div className="flex items-center gap-2 border-l border-[var(--border-color)] pl-6">
                        <button 
                          onClick={() => handleEditClick(product)}
                          className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all hover:shadow-sm"
                          title="Edit Produk"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => {
                            if(window.confirm(`Hapus ${product.name} dari gudang?`)) {
                              deleteProduct(product.id);
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all hover:shadow-sm"
                          title="Hapus Produk"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
