"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

const defaultMenuData = [
  { id: 1, category: 'Starters', name: 'Truffle Arancini', desc: 'Crispy risotto balls filled with wild mushrooms and truffle oil.', price: 14.00, img: 'https://images.unsplash.com/photo-1541014741259-de529411b96a?q=80&w=300&auto=format&fit=crop' },
  { id: 2, category: 'Starters', name: 'Wagyu Carpaccio', desc: 'Thinly sliced wagyu beef, parmigiano, and capers.', price: 22.00, img: 'https://images.unsplash.com/photo-1546221523-93ad2112ae7c?q=80&w=300&auto=format&fit=crop' },
  { id: 3, category: 'Mains', name: 'Pan-Seared Scallops', desc: 'Hokkaido scallops, cauliflower purée.', price: 38.00, img: 'https://images.unsplash.com/photo-1626804475297-4160aeae2326?q=80&w=300&auto=format&fit=crop' },
  { id: 4, category: 'Mains', name: 'Dry-Aged Ribeye', desc: '12oz bone-in ribeye, whipped potatoes.', price: 65.00, img: 'https://images.unsplash.com/photo-1554522904-8979c6d17df9?q=80&w=300&auto=format&fit=crop' },
  { id: 5, category: 'Mains', name: 'Lobster Ravioli', desc: 'Handmade pasta stuffed with fresh lobster.', price: 34.00, img: 'https://images.unsplash.com/photo-1621510456681-2330135e5871?q=80&w=300&auto=format&fit=crop' },
  { id: 6, category: 'Desserts', name: 'Dark Chocolate Tart', desc: '70% Valrhona chocolate, salted caramel center.', price: 16.00, img: 'https://images.unsplash.com/photo-1649931215160-c3d31bdedce3?q=80&w=300&auto=format&fit=crop' },
  { id: 7, category: 'Desserts', name: 'Madagascar Vanilla Crème Brûlée', desc: 'Classic French custard with a caramelized sugar crust.', price: 14.00, img: 'https://images.unsplash.com/photo-1472555794301-77353b152fb7?q=80&w=300&auto=format&fit=crop' },
  { id: 8, category: 'Drinks', name: 'Signature Old Fashioned', desc: 'Smoked bourbon, raw sugar, angostura bitters.', price: 18.00, img: 'https://images.unsplash.com/photo-1597075687490-8f673c6c17f6?q=80&w=300&auto=format&fit=crop' },
  { id: 9, category: 'Drinks', name: 'Espresso Martini', desc: 'Premium vodka, fresh espresso, coffee liqueur.', price: 16.00, img: 'https://images.unsplash.com/photo-1625904835711-0bd63d414a1a?q=80&w=300&auto=format&fit=crop' }
];

export function AppProvider({ children }) {
  const [menuData, setMenuData] = useState([]);
  const [activeView, setActiveView] = useState('loader');
  const [currentTable, setCurrentTable] = useState(null);
  const [cart, setCart] = useState([]);
  const [activeOrder, setActiveOrder] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  
  const [orderStatus, setOrderStatus] = useState('preparing');
  const [savedPaymentMethod, setSavedPaymentMethod] = useState('card');
  const [toasts, setToasts] = useState([]);

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Storage listener for Admin sync
  useEffect(() => {
    // Load menu on mount
    const savedMenu = localStorage.getItem('lumina_menu');
    if (savedMenu) {
      setMenuData(JSON.parse(savedMenu));
    } else {
      setMenuData(defaultMenuData);
      localStorage.setItem('lumina_menu', JSON.stringify(defaultMenuData));
    }

    const handleStorage = (e) => {
      // Menu sync
      if (e.key === 'lumina_menu' && e.newValue) {
        setMenuData(JSON.parse(e.newValue));
      }

      if (currentTable && e.key === `lumina_table_${currentTable}`) {
        if (!e.newValue) {
          showToast('Your session was closed by the restaurant.', 'info');
          resetSession();
          return;
        }
        try {
          const data = JSON.parse(e.newValue);
          if (data.status !== orderStatus) {
            setOrderStatus(data.status);
            if (activeView === 'bill' && data.status === 'served') {
              showToast('Your order is served!', 'success');
            }
          }
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [currentTable, orderStatus, activeView]);

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const resetSession = () => {
    setCurrentTable(null);
    setCart([]);
    setActiveOrder([]);
    setActiveCategory('All');
    setOrderStatus('preparing');
    setSavedPaymentMethod('card');
    setActiveView('welcome');
    setIsCartOpen(false);
    setIsCheckoutOpen(false);
  };

  const updateCart = (itemId, change) => {
    setCart(prev => {
      const existing = prev.find(item => item.menuItem.id === itemId);
      if (existing) {
        const nextQty = existing.qty + change;
        if (nextQty <= 0) return prev.filter(item => item.menuItem.id !== itemId);
        return prev.map(item => item.menuItem.id === itemId ? { ...item, qty: nextQty } : item);
      } else if (change > 0) {
        const menuItem = menuData.find(m => m.id === itemId);
        return [...prev, { menuItem, qty: change }];
      }
      return prev;
    });
  };

  return (
    <AppContext.Provider value={{
      activeView, setActiveView,
      currentTable, setCurrentTable,
      cart, setCart, updateCart,
      activeOrder, setActiveOrder,
      activeCategory, setActiveCategory,
      orderStatus, setOrderStatus,
      savedPaymentMethod, setSavedPaymentMethod,
      isCartOpen, setIsCartOpen,
      isCheckoutOpen, setIsCheckoutOpen,
      toasts, showToast, resetSession,
      menuData, setMenuData
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);
