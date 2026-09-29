"use client";
import React from 'react';
import { useAppContext } from '@/context/AppContext';

export default function CartModal() {
  const { cart, updateCart, isCartOpen, setIsCartOpen, setIsCheckoutOpen } = useAppContext();

  if (!isCartOpen) return null;

  const totalValue = cart.reduce((sum, item) => sum + (item.menuItem.price * item.qty), 0);
  const enabled = cart.length > 0;

  return (
    <div className={`modal active`}>
      <div className="modal-overlay" onClick={() => setIsCartOpen(false)}></div>
      <div className="modal-content bottom-sheet">
        <div className="modal-header">
          <h2>Your Order</h2>
          <button className="close-btn" onClick={() => setIsCartOpen(false)}><i className="ri-close-line"></i></button>
        </div>
        <div className="modal-body">
          {cart.length === 0 ? (
            <div className="empty-state">
              <i className="ri-shopping-cart-2-line"></i>
              <p>Your order is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.menuItem.id} className="cart-item">
                <img src={item.menuItem.img} className="cart-item-img" alt={item.menuItem.name} />
                <div className="cart-item-info">
                  <h4 className="cart-item-title">{item.menuItem.name}</h4>
                  <span className="cart-item-price">${item.menuItem.price.toFixed(2)}</span>
                </div>
                <div className="qty-control">
                  <button className="qty-btn" onClick={() => updateCart(item.menuItem.id, -1)}><i className="ri-subtract-line"></i></button>
                  <span className="qty-val">{item.qty}</span>
                  <button className="qty-btn" onClick={() => updateCart(item.menuItem.id, 1)}><i className="ri-add-line"></i></button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="modal-footer">
          <div className="total-row">
            <span>Total (Excl. taxes)</span>
            <span>${totalValue.toFixed(2)}</span>
          </div>
          <button 
            className="btn-primary full-width" 
            disabled={!enabled}
            onClick={() => {
              setIsCartOpen(false);
              setIsCheckoutOpen(true);
            }}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
