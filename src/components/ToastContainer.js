"use client";
import React from 'react';
import { useAppContext } from '@/context/AppContext';

export default function ToastContainer() {
  const { toasts } = useAppContext();

  return (
    <div id="toast-container">
      {toasts.map((t) => {
        let icon = 'ri-information-line';
        let color = 'var(--primary)';
        if (t.type === 'success') { icon = 'ri-check-line'; color = 'var(--success)'; }
        if (t.type === 'error') { icon = 'ri-error-warning-line'; color = 'var(--error)'; }

        return (
          <div key={t.id} className="toast show" style={{ borderLeftColor: color }}>
            <i className={icon} style={{ color }}></i>
            <span style={{ color: '#fff' }}>{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}
