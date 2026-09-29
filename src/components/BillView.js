"use client";
import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';

export default function BillView() {
  const { 
    activeView, setActiveView, 
    activeOrder, currentTable, 
    orderStatus, savedPaymentMethod 
  } = useAppContext();

  const [isProcessing, setIsProcessing] = useState(false);

  let subtotal = 0;
  activeOrder.forEach(item => subtotal += item.menuItem.price * item.qty);
  const tax = subtotal * 0.085;
  const service = subtotal * 0.10;
  const total = subtotal + tax + service;

  const handlePayBill = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      
      const raw = localStorage.getItem(`lumina_table_${currentTable}`);
      if (raw) {
        const data = JSON.parse(raw);
        data.status = 'paid';
        localStorage.setItem(`lumina_table_${currentTable}`, JSON.stringify(data));
      }
      setActiveView('success');
    }, 2000);
  };

  return (
    <div id="bill-view" className={`view ${activeView === 'bill' ? 'active-view' : ''}`}>
      <header className="top-nav">
        <button className="icon-btn" onClick={() => setActiveView('menu')}><i className="ri-arrow-left-s-line"></i></button>
        <h2>Current Order</h2>
        <div style={{ width: "40px" }}></div>
      </header>

      <main className="bill-container">
        {activeOrder.length > 0 && (
          <div id="order-status-banner" className="status-banner" style={{ 
            marginBottom: "1.5rem", padding: "1rem", borderRadius: "10px", 
            background: orderStatus === 'served' ? 'rgba(46, 204, 113, 0.1)' : 'var(--surface-light)', 
            border: orderStatus === 'served' ? '1px solid var(--success)' : 'none',
            display: "flex", alignItems: "center", gap: "1rem" 
          }}>
            {orderStatus === 'served' ? (
              <i className="ri-check-double-line" style={{ color: "var(--success)", fontSize: "1.5rem" }}></i>
            ) : (
              <div className="spinner" style={{ width: "20px", height: "20px", borderWidth: "2px" }}></div>
            )}
            <span style={{ fontWeight: 500, color: orderStatus === 'served' ? 'var(--success)' : 'var(--text-main)' }}>
              {orderStatus === 'served' ? 'Order served on table' : 'Order is preparing...'}
            </span>
          </div>
        )}

        <div className="bill-card">
          <div className="bill-header">
            <h3>Lumina Restaurant</h3>
            <p>Table <span>{currentTable || '--'}</span></p>
          </div>
          
          <div className="bill-items">
            {activeOrder.length === 0 ? (
              <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "1rem" }}>No items ordered yet.</p>
            ) : (
              activeOrder.map(item => (
                <div key={item.menuItem.id} className="bill-item-row">
                  <span className="bill-item-name">{item.menuItem.name}</span>
                  <span className="bill-item-qty">x{item.qty}</span>
                  <span className="bill-item-price">${(item.menuItem.price * item.qty).toFixed(2)}</span>
                </div>
              ))
            )}
          </div>
          
          <div className="bill-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Tax (8.5%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Service Charge (10%)</span>
              <span>${service.toFixed(2)}</span>
            </div>
            <div className="summary-row grand-total">
              <span>Total Bill</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        {activeOrder.length > 0 && orderStatus !== 'paid' && (
          <button className="btn-primary full-width btn-pay" style={{ marginTop: "1rem" }} onClick={handlePayBill} disabled={isProcessing}>
            {isProcessing ? (
              <><div className="spinner" style={{ width: "24px", height: "24px", borderWidth: "2px", display: "inline-block", borderTopColor: "#fff" }}></div> Processing...</>
            ) : (
              <>Pay Bill <span>${total.toFixed(2)}</span></>
            )}
          </button>
        )}
      </main>
    </div>
  );
}
