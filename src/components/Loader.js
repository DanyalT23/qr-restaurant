"use client";
import React, { useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';

export default function Loader() {
  const { activeView, setActiveView } = useAppContext();

  useEffect(() => {
    // Hide the very first loader after 1.5s 
    // Usually this runs only on initial mount if activeView is 'loader'
    if (activeView === 'loader') {
      const t = setTimeout(() => {
        setActiveView('welcome');
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [activeView, setActiveView]);

  return (
    <div id="loader" className={`view ${activeView === 'loader' ? 'active-view' : ''}`}>
      <div className="loader-content">
        <div className="spinner"></div>
        <h2>Lumina</h2>
        <p>Preparing your experience...</p>
      </div>
    </div>
  );
}
