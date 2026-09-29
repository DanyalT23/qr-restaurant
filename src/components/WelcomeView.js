"use client";
import React, { useState, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useAppContext } from '@/context/AppContext';

export default function WelcomeView() {
  const { activeView, setActiveView, setCurrentTable, setActiveOrder, setOrderStatus, setSavedPaymentMethod, setIsOrderPlaced, showToast } = useAppContext();
  const [showScanMode, setShowScanMode] = useState(true);
  const [tableInput, setTableInput] = useState('');
  const [scanner, setScanner] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    return () => {
      if (scanner && isScanning) {
        scanner.stop().catch(console.error);
      }
    };
  }, [scanner, isScanning]);

  const startScanner = async () => {
    let html5QrcodeScanner = scanner;
    if (!html5QrcodeScanner) {
      html5QrcodeScanner = new Html5Qrcode("qr-reader");
      setScanner(html5QrcodeScanner);
    }
    
    setIsScanning(true);
    try {
      await html5QrcodeScanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          stopScanner(html5QrcodeScanner);
          let scannedTable = decodedText;
          if (decodedText.startsWith('table:')) {
            scannedTable = decodedText.split(':')[1];
          } else if (decodedText.includes('?table=')) {
            const urlParams = new URLSearchParams(decodedText.split('?')[1]);
            scannedTable = urlParams.get('table');
          }
          
          const tableInt = parseInt(scannedTable);
          if (!isNaN(tableInt) && tableInt > 0) {
            setTableInput(tableInt);
            showToast('QR Scanned! Table ' + tableInt, 'success');
            startSession(tableInt);
          } else {
            showToast('Invalid QR Code. Please scan a valid table QR.', 'error');
          }
        },
        (errorMessage) => {}
      );
    } catch (err) {
      showToast("Error starting camera", "error");
      console.error(err);
      setIsScanning(false);
    }
  };

  const stopScanner = (s = scanner) => {
    if (s && isScanning) {
      s.stop().then(() => {
        setIsScanning(false);
      }).catch(err => console.error("Failed to stop scanner", err));
    }
  };

  const startSession = (tableNo) => {
    if (!tableNo || tableNo < 1) {
      showToast('Please enter a valid table number', 'error');
      return;
    }
    
    setCurrentTable(tableNo);
    
    const savedSession = localStorage.getItem(`lumina_table_${tableNo}`);
    if (savedSession) {
      try {
        const data = JSON.parse(savedSession);
        setActiveOrder(data.orderItems || []);
        setOrderStatus(data.status || 'preparing');
        setSavedPaymentMethod(data.paymentMethod || 'card');
      } catch(e) {}
    }

    setActiveView('menu');
    showToast(`Welcome to Table ${tableNo}`, 'success');
  };

  return (
    <div id="welcome-view" className={`view ${activeView === 'welcome' ? 'active-view' : ''}`}>
      <div className="welcome-background"></div>
      <div className="welcome-content">
        <h1 className="brand-title">Lumina</h1>
        <p className="subtitle">Elevated Culinary Journeys</p>
        
        {showScanMode ? (
          <div className="scan-container">
            <div id="qr-reader" style={{ width: "100%", maxWidth: "300px", margin: "0 auto", display: isScanning ? "block" : "none", borderRadius: "16px", overflow: "hidden", marginBottom: "1rem" }}></div>
            {!isScanning && (
              <div className="qr-frame">
                <i className="ri-qr-scan-2-line"></i>
              </div>
            )}
            <p id="scan-instruction">{isScanning ? "Scanning for QR code..." : "Scan table QR code to begin"}</p>
            
            <div className="table-input-group" style={{ marginTop: "1.5rem" }}>
              {!isScanning ? (
                <button className="btn-primary full-width" onClick={startScanner}>
                  <i className="ri-camera-lens-line"></i> Start Scanner
                </button>
              ) : (
                <button className="btn-outline full-width" onClick={() => stopScanner()}>
                  <i className="ri-close-line"></i> Stop Scanner
                </button>
              )}
              <button className="btn-text" style={{ marginTop: "0.5rem" }} onClick={() => {
                stopScanner();
                setShowScanMode(false);
              }}>Enter manually instead</button>
            </div>
          </div>
        ) : (
          <div className="scan-container">
            <div className="qr-frame">
              <i className="ri-keyboard-line"></i>
            </div>
            <p>Enter table number</p>
            <div className="table-input-group">
              <input 
                type="number" 
                placeholder="Table No." 
                min="1" max="50"
                value={tableInput}
                onChange={(e) => setTableInput(e.target.value)}
              />
              <button className="btn-primary" onClick={() => startSession(tableInput)}>View Menu</button>
              <button className="btn-text" style={{ marginTop: "0.5rem" }} onClick={() => setShowScanMode(true)}>Back to scanner</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
