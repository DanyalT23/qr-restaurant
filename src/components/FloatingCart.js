"use client";
import React from 'react';
import { useAppContext } from '@/context/AppContext';

export default function FloatingCart() {
  const { activeView, cart, setIsCartOpen } = useAppContext();

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalValue = cart.reduce((sum, item) => sum + (item.menuItem.price * item.qty), 0);

  if (activeView !== 'menu' || totalItems === 0) return null;

  return (
    <div id="floating-cart" className="floating-cart">
      <div className="fc-info">
        <span>{totalItems === 1 ? '1 item' : `${totalItems} items`}</span>
        <span>${totalValue.toFixed(2)}</span>
      </div>
      <button className="btn-primary fc-btn" onClick={() => setIsCartOpen(true)}>View Order</button>
    </div>
  );
}
