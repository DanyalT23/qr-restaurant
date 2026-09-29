"use client";
import React from 'react';
import { useAppContext } from '@/context/AppContext';

export default function MenuView() {
  const { 
    activeView, setActiveView, 
    currentTable, cart, updateCart, 
    activeCategory, setActiveCategory,
    setIsCartOpen, menuData
  } = useAppContext();

  const categories = ['All', 'Starters', 'Mains', 'Desserts', 'Drinks'];
  const filteredItems = activeCategory === 'All' 
    ? menuData 
    : menuData.filter(item => item.category === activeCategory);

  const cartTotalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div id="menu-view" className={`view ${activeView === 'menu' ? 'active-view' : ''}`}>
      <header className="top-nav">
        <div className="nav-brand">
          <span>Table <strong>{currentTable || '--'}</strong></span>
        </div>
        <div className="nav-actions">
          <button className="icon-btn" onClick={() => setActiveView('bill')}>
            <i className="ri-receipt-line"></i>
          </button>
          <button className="cart-btn" onClick={() => setIsCartOpen(true)}>
            <i className="ri-shopping-bag-3-line"></i>
            {cartTotalItems > 0 && <span className="badge">{cartTotalItems}</span>}
          </button>
        </div>
      </header>

      <div className="categories-wrapper">
        <div className="categories-scroll">
          {categories.map(cat => (
            <button key={cat} 
              className={`category-pill ${cat === activeCategory ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <main className="menu-container">
        {filteredItems.map(item => {
          const cartItem = cart.find(c => c.menuItem.id === item.id);
          const qty = cartItem ? cartItem.qty : 0;
          
          return (
            <div key={item.id} className="menu-item">
              <img src={item.img} alt={item.name} className="item-img" loading="lazy" />
              <div className="item-details">
                <div>
                  <div className="item-header">
                    <h3 className="item-title">{item.name}</h3>
                    <span className="item-price">${item.price.toFixed(2)}</span>
                  </div>
                  <p className="item-desc">{item.desc}</p>
                </div>
                <div className="item-actions">
                  {qty > 0 ? (
                    <div className="qty-control">
                      <button className="qty-btn" onClick={() => updateCart(item.id, -1)}><i className="ri-subtract-line"></i></button>
                      <span className="qty-val">{qty}</span>
                      <button className="qty-btn" onClick={() => updateCart(item.id, 1)}><i className="ri-add-line"></i></button>
                    </div>
                  ) : (
                    <button className="add-btn" onClick={() => updateCart(item.id, 1)}>Add to Order</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}
