"use client";
import React, { useState, useEffect } from 'react';
import ToastContainer from '@/components/ToastContainer';
import { useAppContext } from '@/context/AppContext';
import './admin.css';

export default function AdminPage() {
  const { showToast } = useAppContext();
  
  // Navigation State
  const [currentTab, setCurrentTab] = useState('orders'); // orders, menu, analytics
  
  // Live Orders State
  const [activeData, setActiveData] = useState({});
  const [maxTable, setMaxTable] = useState(50);
  const [currentViewedTableNo, setCurrentViewedTableNo] = useState(null);

  // Menu Management State
  const [menuItems, setMenuItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  
  // Analytics State
  const [invoices, setInvoices] = useState([]);
  const [selectedAnalyticsTable, setSelectedAnalyticsTable] = useState(null);

  // --- Live Orders Logic ---
  const loadTables = () => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('lumina_table_')) {
            try {
                const parsed = JSON.parse(localStorage.getItem(key));
                if (parsed && typeof parsed.tableNo !== 'undefined') {
                    data[parseInt(parsed.tableNo)] = parsed;
                }
            } catch (e) {}
        }
    }
    setActiveData(data);
    setMaxTable(50);
  };

  const markTableServed = () => {
    if (!currentViewedTableNo) return;
    const key = `lumina_table_${currentViewedTableNo}`;
    try {
        const raw = localStorage.getItem(key);
        if (raw) {
            const data = JSON.parse(raw);
            data.status = 'served';
            localStorage.setItem(key, JSON.stringify(data));
            showToast(`Table ${data.tableNo} marked as served`, 'success');
            loadTables();
            setActiveData(prev => ({
              ...prev,
              [currentViewedTableNo]: { ...prev[currentViewedTableNo], status: 'served' }
            }));
        }
    } catch (e) {}
  };

  const clearTable = () => {
    if (!currentViewedTableNo) return;
    
    // Check if table is paid to save as invoice
    const t = activeData[currentViewedTableNo];
    if (t && t.status === 'paid') {
      const existingInvoices = JSON.parse(localStorage.getItem('lumina_invoices') || '[]');
      existingInvoices.push({
        ...t,
        invoiceId: `INV-${Date.now()}`,
        clearedAt: Date.now()
      });
      localStorage.setItem('lumina_invoices', JSON.stringify(existingInvoices));
    }

    localStorage.removeItem(`lumina_table_${currentViewedTableNo}`);
    showToast(`Table ${currentViewedTableNo} cleared from system`, 'info');
    setCurrentViewedTableNo(null);
    loadTables();
  };

  // --- Menu Management Logic ---
  const loadMenu = () => {
    const savedMenu = localStorage.getItem('lumina_menu');
    if (savedMenu) setMenuItems(JSON.parse(savedMenu));
  };

  const saveMenuItem = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newItem = {
      id: editingItem ? editingItem.id : Date.now(),
      name: formData.get('name'),
      desc: formData.get('desc'),
      price: parseFloat(formData.get('price')),
      category: formData.get('category'),
      img: formData.get('img') || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300&auto=format&fit=crop'
    };
    
    let updatedMenu;
    if (editingItem) {
      updatedMenu = menuItems.map(item => item.id === editingItem.id ? newItem : item);
    } else {
      updatedMenu = [...menuItems, newItem];
    }
    
    setMenuItems(updatedMenu);
    localStorage.setItem('lumina_menu', JSON.stringify(updatedMenu));
    // Trigger global storage event so AppContext loads the new menu across tabs immediately
    window.dispatchEvent(new Event('storage'));
    
    setEditingItem(null);
    e.target.reset();
    showToast(`Menu item ${editingItem ? 'updated' : 'added'}!`, 'success');
  };

  const deleteMenuItem = (id) => {
    if(!window.confirm("Are you sure you want to delete this menu item?")) return;
    const updatedMenu = menuItems.filter(item => item.id !== id);
    setMenuItems(updatedMenu);
    localStorage.setItem('lumina_menu', JSON.stringify(updatedMenu));
    window.dispatchEvent(new Event('storage'));
    showToast('Menu item deleted', 'info');
  };

  // --- Analytics Logic ---
  const loadInvoices = () => {
    const saved = JSON.parse(localStorage.getItem('lumina_invoices') || '[]');
    setInvoices(saved);
  };

  // Global Polling
  useEffect(() => {
    loadTables();
    loadMenu();
    loadInvoices();
    const interval = setInterval(() => {
        if(currentTab === 'orders') loadTables();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentTab]);

  const getTimeAgo = (timestamp) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 min ago';
    if (minutes < 60) return `${minutes} mins ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hr${hours > 1 ? 's' : ''} ago`;
  };

  // --- Render Helpers ---
  const renderLiveOrders = () => {
      let activeTablesCount = 0;
      let preparingCount = 0;
      let revenue = 0;
      const cards = [];

      for (let i = 1; i <= maxTable; i++) {
          const t = activeData[i];
          if (t) {
            activeTablesCount++;
            if (t.status === 'preparing') preparingCount++;
            revenue += t.totalAmount || 0;

            let statusClass = 'bg-preparing';
            let statusText = 'Preparing';
            if (t.status === 'served') { statusClass = 'bg-served'; statusText = 'Served'; }
            if (t.status === 'paid') { statusClass = 'bg-paid'; statusText = 'Paid'; }

            const itemQty = t.orderItems ? t.orderItems.reduce((acc, item) => acc + item.qty, 0) : 0;
            const persons = t.persons || 2; // Default to 2 if not provided by customer app

            cards.push(
                <div key={i} className="admin-table-card" onClick={() => setCurrentViewedTableNo(i)}>
                    <div className="card-top">
                        <div className="table-ident">
                            <h3>Table {i}</h3>
                            <p>{getTimeAgo(t.timestamp)}</p>
                        </div>
                        <span className={`admin-badge ${statusClass}`}>{statusText}</span>
                    </div>
                    <div className="card-bottom">
                        <span className="card-items">{itemQty} Items &bull; <i className="ri-user-line"></i> {persons}</span>
                        <span className="card-amount">${(t.totalAmount || 0).toFixed(2)}</span>
                    </div>
                </div>
            );
          } else {
            cards.push(
                <div key={i} className="admin-table-card inactive">
                    <div className="card-top" style={{ marginBottom: 0 }}>
                        <div className="table-ident">
                            <h3 style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>Table {i}</h3>
                        </div>
                        <span className="admin-badge bg-empty">Empty</span>
                    </div>
                </div>
            );
          }
      }

      return (
          <>
            <header className="admin-topbar">
                <div className="topbar-info">
                    <h1>Live Orders</h1>
                    <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <button className="btn-primary" onClick={() => { loadTables(); showToast('Data refreshed', 'success'); }}>
                    <i className="ri-refresh-line"></i> Refresh
                </button>
            </header>
            <div className="admin-content">
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon"><i className="ri-table-alt-line"></i></div>
                        <div className="stat-info">
                            <h3>Active Tables</h3>
                            <p>{activeTablesCount} / {maxTable}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ color: '#f39c12', background: 'rgba(243, 156, 18, 0.1)' }}><i className="ri-fire-line"></i></div>
                        <div className="stat-info">
                            <h3>Preparing Orders</h3>
                            <p>{preparingCount}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ color: '#2ecc71', background: 'rgba(46, 204, 113, 0.1)' }}><i className="ri-money-dollar-circle-line"></i></div>
                        <div className="stat-info">
                            <h3>Today's Revenue</h3>
                            <p>${revenue.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
                <div className="tables-section-header">
                    <h2>Live Table Status</h2>
                </div>
                <div className="admin-tables-grid">
                    {cards}
                </div>
            </div>
          </>
      );
  };

  const renderMenuManagement = () => (
      <>
        <header className="admin-topbar">
            <div className="topbar-info">
                <h1>Menu Management</h1>
                <p>Add, edit, and delete items from your digital menu.</p>
            </div>
            {editingItem && (
                <button className="btn-outline" onClick={() => setEditingItem(null)}>
                    Cancel Editing
                </button>
            )}
        </header>
        <div className="admin-content">
            <form className="admin-form" onSubmit={saveMenuItem}>
                <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-sans)', margin: 0 }}>
                    {editingItem ? 'Edit Menu Item' : 'Add New Item'}
                </h2>
                <div className="form-row">
                    <div className="admin-form-group">
                        <label>Item Name</label>
                        <input name="name" type="text" required defaultValue={editingItem?.name || ''} placeholder="e.g. Truffle Fries" />
                    </div>
                    <div className="admin-form-group" style={{ flex: '0 0 150px' }}>
                        <label>Price ($)</label>
                        <input name="price" type="number" step="0.01" required defaultValue={editingItem?.price || ''} placeholder="0.00" />
                    </div>
                    <div className="admin-form-group" style={{ flex: '0 0 200px' }}>
                        <label>Category</label>
                        <select name="category" required defaultValue={editingItem?.category || 'Starters'}>
                            <option value="Starters">Starters</option>
                            <option value="Mains">Mains</option>
                            <option value="Desserts">Desserts</option>
                            <option value="Drinks">Drinks</option>
                        </select>
                    </div>
                </div>
                <div className="admin-form-group">
                    <label>Description</label>
                    <textarea name="desc" rows="2" required defaultValue={editingItem?.desc || ''} placeholder="Briefly describe the item..."></textarea>
                </div>
                <div className="admin-form-group">
                    <label>Image URL</label>
                    <input name="img" type="url" defaultValue={editingItem?.img || ''} placeholder="https://..." />
                </div>
                <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', padding: '12px 30px' }}>
                    {editingItem ? 'Save Changes' : 'Add Menu Item'}
                </button>
            </form>

            <div className="tables-section-header">
                <h2>Current Menu Items ({menuItems.length})</h2>
            </div>
            <div className="menu-list-grid">
                {menuItems.map(item => (
                    <div key={item.id} className="menu-admin-card">
                        <img src={item.img} alt={item.name} className="menu-admin-img" loading="lazy" />
                        <div className="menu-admin-info">
                            <div>
                                <h4>{item.name}</h4>
                                <p>{item.desc}</p>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                                <span className="menu-admin-price">${item.price.toFixed(2)}</span>
                                <div className="menu-admin-actions">
                                    <button className="btn-edit" onClick={() => setEditingItem(item)}><i className="ri-pencil-line"></i> Edit</button>
                                    <button className="btn-delete" onClick={() => deleteMenuItem(item.id)}><i className="ri-delete-bin-line"></i></button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </>
  );

  const renderAnalytics = () => {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const recentInvoices = invoices.filter(inv => inv.clearedAt >= sevenDaysAgo);
      
      const tablesData = {};
      for (let i = 1; i <= 50; i++) {
        tablesData[i] = { count: 0, revenue: 0, invoices: [] };
      }
      
      recentInvoices.forEach(inv => {
         const tno = parseInt(inv.tableNo);
         if(tablesData[tno]) {
             tablesData[tno].count++;
             tablesData[tno].revenue += inv.totalAmount || 0;
             tablesData[tno].invoices.push(inv);
         }
      });

      return (
          <>
            <header className="admin-topbar">
                <div className="topbar-info">
                    <h1>Table Analytics</h1>
                    <p>Total invoices generated over the last 7 days per table.</p>
                </div>
            </header>
            <div className="admin-content">
                <div className="analytics-grid">
                    {Object.keys(tablesData).map(tableNo => {
                        const data = tablesData[tableNo];
                        return (
                            <div key={tableNo} className="analytics-card" onClick={() => {
                                if(data.count > 0) setSelectedAnalyticsTable({ tableNo, data });
                                else showToast(`No invoices for Table ${tableNo} in the last 7 days`, 'info');
                            }}>
                                <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-sans)', marginBottom: '0.5rem' }}>Table {tableNo}</h2>
                                <h3>{data.count}</h3>
                                <p>Invoices</p>
                                {data.count > 0 && <span style={{ color: 'var(--success)', fontSize: '0.9rem', marginTop: '0.5rem', fontWeight: 600 }}>${data.revenue.toFixed(2)}</span>}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Invoices Modal Drawer */}
            <div className={`admin-modal-overlay ${selectedAnalyticsTable ? 'active' : ''}`} onClick={(e) => {
                if (e.target.classList.contains('admin-modal-overlay')) setSelectedAnalyticsTable(null);
            }}>
                <div className="admin-drawer">
                    <div className="drawer-header">
                        <h2>Table <span>{selectedAnalyticsTable?.tableNo}</span> History</h2>
                        <button className="drawer-close" onClick={() => setSelectedAnalyticsTable(null)}>
                            <i className="ri-close-line"></i>
                        </button>
                    </div>
                    <div className="drawer-body">
                        {selectedAnalyticsTable && selectedAnalyticsTable.data.invoices.map((inv, idx) => (
                            <div key={idx} style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.8rem', borderBottom: '1px dashed var(--border-color)' }}>
                                    <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>{inv.invoiceId}</strong>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        {new Date(inv.clearedAt).toLocaleDateString()} {new Date(inv.clearedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Payment Method:</span>
                                    <strong style={{ textTransform: 'capitalize' }}>{inv.paymentMethod}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', marginTop: '0.5rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Amount Paid:</span>
                                    <strong style={{ color: 'var(--text-main)' }}>${(inv.totalAmount || 0).toFixed(2)}</strong>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          </>
      );
  };

  const currentViewedTable = currentViewedTableNo ? activeData[currentViewedTableNo] : null;

  return (
    <div className="admin-layout">
        {/* Sidebar */}
        <aside className="admin-sidebar">
            <div className="admin-brand">
                <h2>Lumina.</h2>
            </div>
            <nav className="admin-nav">
                <div className={`nav-item ${currentTab === 'orders' ? 'active' : ''}`} onClick={() => setCurrentTab('orders')}>
                    <i className="ri-dashboard-line"></i>
                    <span>Live Orders</span>
                </div>
                <div className={`nav-item ${currentTab === 'menu' ? 'active' : ''}`} onClick={() => setCurrentTab('menu')}>
                    <i className="ri-restaurant-line"></i>
                    <span>Menu Management</span>
                </div>
                <div className={`nav-item ${currentTab === 'analytics' ? 'active' : ''}`} onClick={() => setCurrentTab('analytics')}>
                    <i className="ri-pie-chart-line"></i>
                    <span>Table-wise Invoices</span>
                </div>
            </nav>
        </aside>

        {/* Dynamic Main Content */}
        <main className="admin-main">
            {currentTab === 'orders' && renderLiveOrders()}
            {currentTab === 'menu' && renderMenuManagement()}
            {currentTab === 'analytics' && renderAnalytics()}
        </main>

        {/* Drawer Order Info for Live Orders */}
        <div className={`admin-modal-overlay ${currentViewedTableNo && currentTab === 'orders' ? 'active' : ''}`} onClick={(e) => {
            if (e.target.classList.contains('admin-modal-overlay')) setCurrentViewedTableNo(null);
        }}>
            <div className="admin-drawer">
                <div className="drawer-header">
                    <h2>Table <span>{currentViewedTable?.tableNo}</span></h2>
                    <button className="drawer-close" onClick={() => setCurrentViewedTableNo(null)}>
                        <i className="ri-close-line"></i>
                    </button>
                </div>
                <div className="drawer-body">
                    {currentViewedTable && (
                        <>
                            <div className="drawer-status-bar">
                                <span className={`admin-badge bg-${currentViewedTable.status}`}>
                                    {currentViewedTable.status.toUpperCase()}
                                </span>
                                <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{getTimeAgo(currentViewedTable.timestamp)}</span>
                            </div>
                            
                            <div className="drawer-summary">
                                <div className="summary-item">
                                    <span>Method</span>
                                    <strong>{currentViewedTable.paymentMethod} {currentViewedTable.status === 'paid' ? '(PAID)' : ''}</strong>
                                </div>
                                <div className="summary-item">
                                    <span>Persons</span>
                                    <strong><i className="ri-user-line"></i> {currentViewedTable.persons || 2}</strong>
                                </div>
                                <div className="summary-item" style={{ marginTop: "0.5rem", paddingTop: "0.8rem", borderTop: "1px dashed var(--border-color)" }}>
                                    <span>Final Total</span>
                                    <strong className="highlight">${(currentViewedTable.totalAmount || 0).toFixed(2)}</strong>
                                </div>
                            </div>

                            <div className="drawer-orders">
                                <h3>Order Contents</h3>
                                <div className="order-list">
                                    {currentViewedTable.orderItems?.map((item, idx) => (
                                        <div key={idx} className="order-row">
                                            <div className="order-name">
                                                <span className="order-qty">{item.qty}x</span>
                                                <span style={{ color: "var(--text-main)" }}>{item.menuItem.name}</span>
                                            </div>
                                            <strong>${((item.menuItem.price || 0) * item.qty).toFixed(2)}</strong>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
                {currentViewedTable && (
                    <div className="drawer-footer">
                        {currentViewedTable.status === 'preparing' && (
                            <button className="btn-primary" onClick={markTableServed}>Mark Served</button>
                        )}
                        <button className="btn-outline" style={{ borderColor: "var(--error)", color: "var(--error)" }} onClick={clearTable}>Clear Table</button>
                    </div>
                )}
            </div>
        </div>
        
        <ToastContainer />
    </div>
  );
}
