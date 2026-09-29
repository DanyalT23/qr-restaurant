"use client";
import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';

export default function CheckoutModal() {
  const { 
    cart, setCart, activeOrder, setActiveOrder, 
    currentTable, setOrderStatus, setSavedPaymentMethod, 
    isCheckoutOpen, setIsCheckoutOpen, setShowToast,
    setActiveView, showToast
  } = useAppContext();

  const [step, setStep] = useState(1);
  const [paymentMode, setPaymentMode] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isCheckoutOpen) return null;

  const totalValue = cart.reduce((sum, item) => sum + (item.menuItem.price * item.qty), 0);
  const tax = totalValue * 0.085;
  const service = totalValue * 0.10;
  const grandTotal = totalValue + tax + service;

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setStep(1); // Reset for next time
  };

  const handleFinalPay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      handleClose();
      
      setSavedPaymentMethod(paymentMode);
      setOrderStatus('preparing');
      
      const newActiveOrder = [...activeOrder];
      cart.forEach(cartItem => {
        const existing = newActiveOrder.find(o => o.menuItem.id === cartItem.menuItem.id);
        if (existing) {
          existing.qty += cartItem.qty;
        } else {
          newActiveOrder.push({ ...cartItem });
        }
      });
      setActiveOrder(newActiveOrder);
      
      // Calculate final storage amounts
      let subtotal = 0;
      newActiveOrder.forEach(item => subtotal += item.menuItem.price * item.qty);
      const total = subtotal + (subtotal * 0.085) + (subtotal * 0.10);

      // Save to localStorage 
      const tableData = {
        tableNo: currentTable,
        orderItems: newActiveOrder,
        status: 'preparing',
        paymentMethod: paymentMode,
        totalAmount: total,
        timestamp: Date.now()
      };
      localStorage.setItem(`lumina_table_${currentTable}`, JSON.stringify(tableData));

      // Simulate 30-sec order served response
      setTimeout(() => {
        let raw = localStorage.getItem(`lumina_table_${currentTable}`);
        if (raw) {
          let data = JSON.parse(raw);
          if (data.status !== 'paid') {
             data.status = 'served';
             localStorage.setItem(`lumina_table_${currentTable}`, JSON.stringify(data));
             // storage event listener in context takes care of live update
          }
        }
      }, 30000);

      setCart([]);
      setActiveView('bill');
      showToast('Order Placed Successfully!', 'success');
      
    }, 1500);
  };

  return (
    <div className={`modal active`}>
      <div className="modal-overlay" onClick={handleClose}></div>
      <div className="modal-content bottom-sheet">
        {step === 1 && (
          <div id="checkout-step-1">
            <div className="modal-header">
              <h2>Confirm Order</h2>
              <button className="close-btn" onClick={handleClose}><i className="ri-close-line"></i></button>
            </div>
            <div className="modal-body" style={{ textAlign: "center", padding: "2rem 1.5rem" }}>
              <i className="ri-question-line" style={{ fontSize: "4rem", color: "var(--primary)" }}></i>
              <h3 style={{ margin: "1rem 0", fontFamily: "var(--font-sans)", fontWeight: 500 }}>Is this your final order?</h3>
              <p style={{ color: "var(--text-muted)", marginBottom: "2rem", fontSize: "0.9rem" }}>You won't be able to remove these items once placed.</p>
              <div style={{ display: "flex", gap: "1rem" }}>
                <button className="btn-outline full-width" onClick={handleClose}>No, go back</button>
                <button className="btn-primary full-width" onClick={() => setStep(2)}>Yes, proceed</button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div id="checkout-step-2">
            <div className="modal-header">
              <h2>Payment Details</h2>
              <button className="close-btn" onClick={handleClose}><i className="ri-close-line"></i></button>
            </div>
            <div className="modal-body">
              <div className="payment-methods" style={{ marginBottom: "1.5rem" }}>
                <label className="payment-method">
                  <input type="radio" name="payment_mode" value="card" checked={paymentMode === 'card'} onChange={(e) => setPaymentMode(e.target.value)} />
                  <div className="method-card">
                    <i className="ri-bank-card-line"></i>
                    <span>Card</span>
                  </div>
                </label>
                <label className="payment-method">
                  <input type="radio" name="payment_mode" value="cash" checked={paymentMode === 'cash'} onChange={(e) => setPaymentMode(e.target.value)} />
                  <div className="method-card">
                    <i className="ri-money-dollar-circle-line"></i>
                    <span>Cash</span>
                  </div>
                </label>
              </div>
              
              {paymentMode === 'card' ? (
                <div id="card-details-form">
                  <div className="input-group" style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>Card Number</label>
                    <input type="text" placeholder="0000 0000 0000 0000" className="full-width" maxLength="19" />
                  </div>
                  <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
                    <div className="input-group" style={{ flex: 1 }}>
                      <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>Expiry</label>
                      <input type="text" placeholder="MM/YY" className="full-width" maxLength="5" />
                    </div>
                    <div className="input-group" style={{ flex: 1 }}>
                      <label style={{ display: "block", marginBottom: "0.5rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>CVV</label>
                      <input type="password" placeholder="123" className="full-width" maxLength="4" />
                    </div>
                  </div>
                </div>
              ) : (
                <p id="cash-instruction" style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: "1.5rem" }}>You will pay with cash to your server.</p>
              )}
              
              <button className="btn-primary full-width btn-pay" onClick={handleFinalPay}>
                {isProcessing ? <div className="spinner" style={{ width: "20px", height: "20px", borderWidth: "2px", display: "inline-block", borderTopColor: "#fff" }}></div> : 'Place Order'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
