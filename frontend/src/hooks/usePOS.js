import { useState, useEffect } from 'react';

export function usePOS() {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('umkm_products');
    return saved ? JSON.parse(saved) : [];
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('umkm_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('umkm_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('umkm_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addProduct = (product) => {
    setProducts([...products, { ...product, id: Date.now().toString() }]);
  };

  const updateProduct = (id, updatedProduct) => {
    setProducts(products.map(p => p.id === id ? { ...p, ...updatedProduct } : p));
  };

  const deleteProduct = (id) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const addTransaction = (transaction) => {
    // transaction should contain: { items: [{product_id, qty, price, cost}], total_price, total_cost, timestamp }
    setTransactions([...transactions, { ...transaction, id: Date.now().toString(), timestamp: new Date().toISOString() }]);
    
    // Decrement stock
    setProducts(prevProducts => {
      let newProducts = [...prevProducts];
      transaction.items.forEach(item => {
        newProducts = newProducts.map(p => {
          if (p.id === item.product_id) {
            const currentStock = p.stock || 0;
            return { ...p, stock: Math.max(0, currentStock - item.qty) };
          }
          return p;
        });
      });
      return newProducts;
    });
  };

  const clearTransactions = () => {
    setTransactions([]);
  };

  return {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    transactions,
    addTransaction,
    clearTransactions
  };
}
