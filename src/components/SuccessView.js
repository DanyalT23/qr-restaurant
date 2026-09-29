"use client";
import React from 'react';
import { useAppContext } from '@/context/AppContext';

export default function SuccessView() {
  const { activeView, resetSession, activeOrder, savedPaymentMethod, currentTable } = useAppContext();

  let subtotal = 0;
  activeOrder.forEach(item => subtotal += item.menuItem.price * item.qty);
  const total = subtotal + (subtotal * 0.085) + (subtotal * 0.10);

  return (
    <div id="success-view" className={`view ${activeView === 'success' ? 'active-view' : ''}`}>
      <div className="success-content receipt-card">
        <div className="success-icon-container">
          <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
            <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
          </svg>
        </div>
        <h2>Bill Paid!</h2>
        
        <div className="receipt-details" style={{ background: "var(--surface-color)", padding: "1.5rem", borderRadius: "10px", margin: "1.5rem 0", border: "1px dashed var(--border-color)" }}>
          <h3 style={{ marginBottom: "1rem", color: "var(--primary)" }}>Lumina Restaurant</h3>
          <p style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", color: "var(--text-muted)" }}>
            <span>Table No:</span> <strong style={{ color: "var(--text-main)" }}>{currentTable || '--'}</strong>
          </p>
          <p style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", color: "var(--text-muted)" }}>
            <span>Amount Paid:</span> <strong style={{ color: "var(--text-main)", fontSize: "1.2rem" }}>${total.toFixed(2)}</strong>
          </p>
          <p style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)" }}>
            <span>Method:</span> <strong style={{ color: "var(--text-main)", textTransform: "capitalize" }}>Paid via {savedPaymentMethod}</strong>
          </p>
        </div>
        
        <div className="management-note" style={{ background: "rgba(46, 204, 113, 0.1)", padding: "1rem", borderRadius: "10px", borderLeft: "4px solid var(--success)", textAlign: "left", marginBottom: "2rem" }}>
          <i className="ri-shield-check-line" style={{ color: "var(--success)", fontSize: "1.5rem", marginBottom: "0.5rem", display: "block" }}></i>
          <p style={{ fontSize: "0.9rem", color: "#fff" }}>Please show this screen to the restaurant management upon exiting.</p>
        </div>
        
        <div className="receipt-actions">
          <button className="btn-primary full-width" onClick={resetSession}>Leave Table</button>
        </div>
      </div>
    </div>
  );
}
