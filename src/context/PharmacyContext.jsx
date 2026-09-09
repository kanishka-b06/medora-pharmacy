import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  INITIAL_USERS,
  INITIAL_MEDICINES,
  INITIAL_ORDERS,
  INITIAL_SALES,
  INITIAL_AI_SUGGESTIONS,
  INITIAL_ACTIVITIES,
  INITIAL_SETTINGS
} from '../data/initialData';
import { getStockStatus, calculateExpiryRisk } from '../services/aiMatchingEngine';

const PharmacyContext = createContext(null);

export function PharmacyProvider({ children }) {
  // 1. Current Session State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('medora_currentUser') || localStorage.getItem('pharmassist_currentUser');
      if (saved) {
        const u = JSON.parse(saved);
        // Normalize role names
        if (u.role === 'admin') u.role = 'supervisor';
        if (u.role === 'worker') u.role = 'staff';
        if (u.name === 'Dr. Sarah Jenkins' || !u.name || u.name === 'Sarah' || u.username === 'supervisor' || u.id === 'usr-supervisor') {
          u.name = 'Sarah';
          u.role = 'owner';
          u.roleTitle = 'Pharmacy Owner';
          localStorage.setItem('medora_currentUser', JSON.stringify(u));
        }
        if (u.name === 'Alex Rivera') {
          u.name = 'Arun';
          localStorage.setItem('medora_currentUser', JSON.stringify(u));
        }
        return u;
      }
      return null;
    } catch {
      return null;
    }
  });

  // 2. Persistent Collections
  const [medicines, setMedicines] = useState(() => {
    try {
      const saved = localStorage.getItem('medora_medicines') || localStorage.getItem('pharmassist_medicines');
      return saved ? JSON.parse(saved) : INITIAL_MEDICINES;
    } catch {
      return INITIAL_MEDICINES;
    }
  });

  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('medora_orders') || localStorage.getItem('pharmassist_orders');
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [sales, setSales] = useState(() => {
    try {
      const saved = localStorage.getItem('medora_sales') || localStorage.getItem('pharmassist_sales');
      return saved ? JSON.parse(saved) : INITIAL_SALES;
    } catch {
      return INITIAL_SALES;
    }
  });

  const [aiSuggestions, setAiSuggestions] = useState(() => {
    try {
      const saved = localStorage.getItem('medora_ai_suggestions') || localStorage.getItem('pharmassist_ai_suggestions');
      return saved ? JSON.parse(saved) : INITIAL_AI_SUGGESTIONS;
    } catch {
      return INITIAL_AI_SUGGESTIONS;
    }
  });

  const [activities, setActivities] = useState(() => {
    try {
      const saved = localStorage.getItem('medora_activities') || localStorage.getItem('pharmassist_activities');
      return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
    } catch {
      return INITIAL_ACTIVITIES;
    }
  });

  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('medora_users');
      const loaded = saved ? JSON.parse(saved) : INITIAL_USERS;
      return loaded.map((u) => {
        if (u.name === 'Sarah' || u.id === 'usr-supervisor' || u.username === 'supervisor') {
          return { ...u, role: 'owner', roleTitle: 'Pharmacy Owner' };
        }
        return u;
      });
    } catch {
      return INITIAL_USERS;
    }
  });

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('medora_settings');
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  // Active Toasts
  const [toasts, setToasts] = useState([]);

  // Sync state changes to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('medora_currentUser', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('medora_currentUser');
      }
    } catch (e) {
      console.error('Storage sync error:', e);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('medora_medicines', JSON.stringify(medicines));
  }, [medicines]);

  useEffect(() => {
    localStorage.setItem('medora_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('medora_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('medora_ai_suggestions', JSON.stringify(aiSuggestions));
  }, [aiSuggestions]);

  useEffect(() => {
    localStorage.setItem('medora_activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem('medora_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('medora_settings', JSON.stringify(settings));
  }, [settings]);

  // Toast Helpers
  const addToast = (toast) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 4);
    const newToast = { id, type: 'info', duration: 4000, ...toast };
    setToasts((prev) => [...prev, newToast]);

    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Activity Logger Helper
  const logActivity = (action, medicine, details) => {
    const newActivity = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: currentUser ? `${currentUser.name} (${currentUser.username})` : 'System',
      role: currentUser ? currentUser.role : 'system',
      action,
      medicine: typeof medicine === 'string' ? medicine : medicine?.name || 'General',
      details
    };
    setActivities((prev) => [newActivity, ...prev]);
  };

  // Authentication Actions
  const login = (username, password, role) => {
    const trimmedUsername = (username || '').trim().toLowerCase();
    
    // Normalize role selection if provided
    const targetRole = role === 'admin' || role === 'owner' ? 'supervisor' : role === 'worker' ? 'staff' : role;

    // Check credentials against demo users or custom users (by username or email)
    let matchedUser = users.find(
      (u) => (
        u.username.toLowerCase() === trimmedUsername ||
        (u.email && u.email.toLowerCase() === trimmedUsername) ||
        (trimmedUsername === 'owner' && (u.role === 'supervisor' || u.role === 'admin')) ||
        (trimmedUsername === 'supervisor' && (u.role === 'supervisor' || u.role === 'admin')) ||
        (trimmedUsername === 'worker' && (u.role === 'staff' || u.role === 'worker')) ||
        (trimmedUsername === 'staff' && (u.role === 'staff' || u.role === 'worker'))
      ) && u.status === 'active'
    );

    // Fallback for demo users and email matching against INITIAL_USERS
    if (!matchedUser) {
      if (
        trimmedUsername === 'supervisor' ||
        trimmedUsername === 'admin' ||
        trimmedUsername === 'owner' ||
        trimmedUsername === 'kanishka.b6906@gmail.com' ||
        trimmedUsername === 'supervisor@medora.local'
      ) {
        matchedUser = INITIAL_USERS.find(u => u.role === 'supervisor');
      } else if (
        trimmedUsername === 'staff' ||
        trimmedUsername === 'worker1' ||
        trimmedUsername === 'worker' ||
        trimmedUsername === 'staff@medora.local'
      ) {
        matchedUser = INITIAL_USERS.find(u => u.role === 'staff');
      } else {
        matchedUser = INITIAL_USERS.find(u => u.email && u.email.toLowerCase() === trimmedUsername);
      }
    }

    if (!matchedUser) {
      return { success: false, message: 'Invalid username or user account is disabled.' };
    }

    // Role check only if explicitly specified
    if (targetRole && matchedUser.role !== targetRole) {
      return {
        success: false,
        message: `Account "${matchedUser.username}" is configured as ${matchedUser.role === 'supervisor' ? 'Owner / Supervisor' : 'Worker'}.`
      };
    }

    // Password check
    const isOwner = matchedUser.role === 'supervisor' || matchedUser.role === 'admin';
    const validPassword = 
      (isOwner && (
        password === 'owner123' || 
        password === 'owner' || 
        password === 'supervisor123' || 
        password === 'supervisor' || 
        password === 'admin123' ||
        password === 'admin'
      )) ||
      (!isOwner && (
        password === 'worker123' || 
        password === 'worker' || 
        password === 'staff123' || 
        password === 'staff'
      ));

    if (!validPassword && password !== 'demo') {
      return { 
        success: false, 
        message: isOwner 
          ? 'Invalid password. (Demo: owner123 or supervisor123)' 
          : 'Invalid password. (Demo: worker123 or staff123)' 
      };
    }

    const sessionUser = {
      ...matchedUser,
      lastActive: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setCurrentUser(sessionUser);
    
    // Update lastActive in users array
    setUsers((prev) =>
      prev.map((u) => (u.id === matchedUser.id ? { ...u, lastActive: 'Just now' } : u))
    );

    addToast({
      type: 'success',
      title: 'Welcome Back',
      message: `Signed in as ${matchedUser.name} (${isOwner ? 'Owner Management Portal' : 'Worker Portal'})`
    });

    return { success: true, user: sessionUser };
  };

  const logout = () => {
    if (currentUser) {
      logActivity('User Logout', 'System Session', `${currentUser.name} signed out.`);
    }
    setCurrentUser(null);
    localStorage.removeItem('medora_currentUser');
    addToast({
      type: 'info',
      title: 'Signed Out',
      message: 'You have been safely signed out of MEDORA.'
    });
  };

  // Medicine Inventory Management Actions
  const addMedicine = (medicineData) => {
    const newId = `med-${Date.now()}`;
    const newMed = {
      id: newId,
      name: medicineData.name.trim(),
      brandName: medicineData.brandName ? medicineData.brandName.trim() : medicineData.name.trim(),
      activeIngredient: medicineData.activeIngredient.trim(),
      strength: medicineData.strength.trim(),
      dosageForm: medicineData.dosageForm || 'Tablet',
      therapeuticClass: medicineData.therapeuticClass || 'General Medicine',
      rack: medicineData.rack.toUpperCase().trim(),
      shelf: medicineData.shelf.toString().trim(),
      quantity: Math.max(0, parseInt(medicineData.quantity, 10) || 0),
      batchNumber: medicineData.batchNumber.trim().toUpperCase(),
      expiryDate: medicineData.expiryDate,
      price: parseFloat(medicineData.price) || 0,
      lowStockThreshold: parseInt(medicineData.lowStockThreshold, 10) || settings.lowStockThresholdDefault || 10,
      expectedRestockDate: medicineData.expectedRestockDate || '',
      orderStatus: medicineData.orderStatus || 'None',
      supplier: medicineData.supplier || 'Apex Pharma Distributors',
      isDemo: false
    };

    setMedicines((prev) => [newMed, ...prev]);
    logActivity('Medicine Added', newMed.name, `Added with initial stock ${newMed.quantity} units at Rack ${newMed.rack}, Shelf ${newMed.shelf}.`);
    
    addToast({
      type: 'success',
      title: 'Medicine Added',
      message: `${newMed.name} added to inventory.`
    });

    return newMed;
  };

  const updateMedicine = (id, updatedFields) => {
    setMedicines((prev) =>
      prev.map((med) => {
        if (med.id === id) {
          const updated = { ...med, ...updatedFields };
          return updated;
        }
        return med;
      })
    );

    const med = medicines.find((m) => m.id === id);
    logActivity('Medicine Updated', med?.name || id, `Updated medicine specifications/locations.`);

    addToast({
      type: 'success',
      title: 'Medicine Updated',
      message: `Changes saved for ${updatedFields.name || med?.name}.`
    });
  };

  const deleteMedicine = (id) => {
    const med = medicines.find((m) => m.id === id);
    setMedicines((prev) => prev.filter((m) => m.id !== id));
    
    logActivity('Medicine Removed', med?.name || id, `Removed medicine record from inventory.`);

    addToast({
      type: 'info',
      title: 'Medicine Deleted',
      message: `${med?.name || 'Medicine'} removed from inventory.`
    });
  };

  const correctStock = (id, newQuantity, reason = 'Inventory Count Audit') => {
    const targetQty = Math.max(0, parseInt(newQuantity, 10) || 0);
    let medName = '';
    let oldQty = 0;

    setMedicines((prev) =>
      prev.map((med) => {
        if (med.id === id) {
          medName = med.name;
          oldQty = med.quantity;
          return {
            ...med,
            quantity: targetQty
          };
        }
        return med;
      })
    );

    logActivity('Stock Corrected', medName, `Stock adjusted from ${oldQty} → ${targetQty} units (${reason}).`);

    addToast({
      type: 'success',
      title: 'Stock Updated',
      message: `${medName} stock updated from ${oldQty} → ${targetQty}.`
    });
  };

  // Record Sale Action (Core Sales & Dispensing Calculation: Previous - Sold = Remaining)
  const recordSale = (saleData) => {
    const { medicineId, quantitySold, customerType = 'Walk-in Customer', notes = '' } = saleData;
    const qtySold = parseInt(quantitySold, 10);

    const targetMed = medicines.find((m) => m.id === medicineId);
    if (!targetMed) {
      addToast({ type: 'error', title: 'Sale Failed', message: 'Medicine record not found.' });
      return { success: false, message: 'Medicine not found' };
    }

    if (qtySold <= 0) {
      addToast({ type: 'error', title: 'Invalid Quantity', message: 'Sold quantity must be greater than 0.' });
      return { success: false, message: 'Quantity must be > 0' };
    }

    if (qtySold > targetMed.quantity) {
      addToast({
        type: 'error',
        title: 'Insufficient Stock',
        message: `Cannot sell ${qtySold} units. Only ${targetMed.quantity} units currently available.`
      });
      return { success: false, message: 'Insufficient stock' };
    }

    const previousStock = targetMed.quantity;
    const remainingStock = previousStock - qtySold;
    const unitPrice = targetMed.price;
    const totalAmount = unitPrice * qtySold;

    // Update Medicine Stock
    setMedicines((prev) =>
      prev.map((med) => (med.id === medicineId ? { ...med, quantity: remainingStock } : med))
    );

    // Append to Sales Log
    const newSale = {
      id: `sale-${Date.now()}`,
      medicineId,
      medicineName: targetMed.name,
      quantitySold: qtySold,
      unitPrice,
      totalAmount,
      customerType,
      previousStock,
      remainingStock,
      timestamp: new Date().toISOString(),
      recordedBy: currentUser ? `${currentUser.name} (${currentUser.username})` : 'Staff',
      notes
    };

    setSales((prev) => [newSale, ...prev]);

    // Check stock status changes for alert messages
    let statusNotice = '';
    if (remainingStock === 0) {
      statusNotice = ' 🔴 Item is now OUT OF STOCK.';
    } else if (remainingStock <= targetMed.lowStockThreshold) {
      statusNotice = ` 🟠 Item is now LOW STOCK (${remainingStock} units left).`;
    }

    logActivity(
      'Sale Recorded',
      targetMed.name,
      `Sold ${qtySold} units (${settings.currencySymbol}${totalAmount.toFixed(2)}). Stock: ${previousStock} → ${remainingStock}.${statusNotice}`
    );

    addToast({
      type: 'success',
      title: 'Sale Recorded Successfully',
      message: `Stock updated: ${previousStock} → ${remainingStock} units.${statusNotice}`
    });

    return { success: true, sale: newSale, remainingStock };
  };

  // Orders and Restock Actions
  const createOrder = (orderData) => {
    const newOrder = {
      id: `ord-${Date.now()}`,
      medicineId: orderData.medicineId,
      medicineName: orderData.medicineName,
      supplier: orderData.supplier || 'Primary Supplier',
      orderedQuantity: parseInt(orderData.orderedQuantity, 10) || 50,
      orderDate: orderData.orderDate || new Date().toISOString().split('T')[0],
      expectedArrivalDate: orderData.expectedArrivalDate || '',
      status: orderData.status || 'Ordered',
      estimatedCost: parseFloat(orderData.estimatedCost) || 0,
      notes: orderData.notes || '',
      createdBy: currentUser ? currentUser.name : 'Supervisor'
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Update medicine expected restock & order status
    if (orderData.medicineId) {
      setMedicines((prev) =>
        prev.map((med) =>
          med.id === orderData.medicineId
            ? {
                ...med,
                orderStatus: newOrder.status,
                expectedRestockDate: newOrder.expectedArrivalDate
              }
            : med
        )
      );
    }

    logActivity(
      'Restock Order Created',
      newOrder.medicineName,
      `Ordered ${newOrder.orderedQuantity} units from ${newOrder.supplier}. Expected: ${newOrder.expectedArrivalDate || 'TBD'}.`
    );

    addToast({
      type: 'success',
      title: 'Restock Order Placed',
      message: `Order for ${newOrder.orderedQuantity} units of ${newOrder.medicineName} created.`
    });

    return newOrder;
  };

  const updateOrderStatus = (orderId, newStatus, expectedArrivalDate) => {
    let affectedMedId = null;
    let affectedMedName = '';

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          affectedMedId = ord.medicineId;
          affectedMedName = ord.medicineName;
          return {
            ...ord,
            status: newStatus,
            expectedArrivalDate: expectedArrivalDate || ord.expectedArrivalDate
          };
        }
        return ord;
      })
    );

    if (affectedMedId) {
      setMedicines((prev) =>
        prev.map((med) =>
          med.id === affectedMedId
            ? {
                ...med,
                orderStatus: newStatus,
                expectedRestockDate: expectedArrivalDate || med.expectedRestockDate
              }
            : med
        )
      );
    }

    logActivity('Order Status Updated', affectedMedName || orderId, `Order status set to "${newStatus}".`);

    addToast({
      type: 'info',
      title: 'Order Status Updated',
      message: `Order status set to "${newStatus}".`
    });
  };

  // Restock Fulfillment Action
  const receiveRestock = (medicineId, restockData) => {
    const {
      addedQuantity,
      newBatchNumber,
      newExpiryDate,
      newPrice,
      rack,
      shelf,
      orderId
    } = restockData;

    const addQty = parseInt(addedQuantity, 10) || 0;
    let medName = '';
    let prevQty = 0;
    let newTotalQty = 0;

    setMedicines((prev) =>
      prev.map((med) => {
        if (med.id === medicineId) {
          medName = med.name;
          prevQty = med.quantity;
          newTotalQty = prevQty + addQty;
          return {
            ...med,
            quantity: newTotalQty,
            batchNumber: newBatchNumber ? newBatchNumber.toUpperCase().trim() : med.batchNumber,
            expiryDate: newExpiryDate || med.expiryDate,
            price: newPrice !== undefined && newPrice !== '' ? parseFloat(newPrice) : med.price,
            rack: rack ? rack.toUpperCase().trim() : med.rack,
            shelf: shelf ? shelf.toString().trim() : med.shelf,
            orderStatus: 'None',
            expectedRestockDate: ''
          };
        }
        return med;
      })
    );

    // If tied to an active order, mark order as Arrived
    if (orderId) {
      setOrders((prev) =>
        prev.map((ord) => (ord.id === orderId ? { ...ord, status: 'Arrived' } : ord))
      );
    } else {
      setOrders((prev) =>
        prev.map((ord) =>
          ord.medicineId === medicineId && (ord.status === 'Ordered' || ord.status === 'In Transit')
            ? { ...ord, status: 'Arrived' }
            : ord
        )
      );
    }

    logActivity(
      'Restock Completed',
      medName,
      `Restocked +${addQty} units. Stock: ${prevQty} → ${newTotalQty} (AVAILABLE). Batch: ${newBatchNumber || 'Retained'}.`
    );

    addToast({
      type: 'success',
      title: 'Restock Completed 🟢',
      message: `${medName} restocked (+${addQty} units). Total stock is now ${newTotalQty}.`
    });

    return { success: true, newQuantity: newTotalQty };
  };

  // AI Suggestion Decision Logging
  const logAISuggestionDecision = (suggestionObj, decision = 'Approved', notes = '') => {
    const newRecord = {
      id: `ai-sug-${Date.now()}`,
      requestedMedicineId: suggestionObj.requestedMedicine?.id || '',
      requestedMedicineName: suggestionObj.requestedMedicine?.name || 'Requested Medicine',
      requestedStatus: suggestionObj.requestedMedicine?.quantity <= 0 ? 'Out of Stock' : 'Low Stock',
      suggestedMedicineId: suggestionObj.candidate?.id || '',
      suggestedMedicineName: suggestionObj.candidate?.name || 'Suggested Alternative',
      matchScore: suggestionObj.score || 85,
      matchReason: suggestionObj.reasons?.join('; ') || 'Database attribute similarity',
      decision, // 'Approved' | 'Rejected' | 'Ignored' | 'Pending Review'
      reviewedBy: currentUser ? `${currentUser.name} (${currentUser.role})` : 'Pharmacist',
      timestamp: new Date().toISOString(),
      notes: notes || `Human verified match for ${suggestionObj.requestedMedicine?.name}.`
    };

    setAiSuggestions((prev) => [newRecord, ...prev]);

    logActivity(
      `AI Suggestion ${decision}`,
      suggestionObj.candidate?.name || 'Alternative Medicine',
      `Decision "${decision}" for alternative match to ${suggestionObj.requestedMedicine?.name} (${newRecord.matchScore}% match score).`
    );

    addToast({
      type: decision === 'Approved' ? 'success' : decision === 'Rejected' ? 'warning' : 'info',
      title: `AI Alternative ${decision}`,
      message: `Alternative match ${decision.toLowerCase()} for ${suggestionObj.requestedMedicine?.name}.`
    });
  };

  // Staff User Management Actions
  const addUser = (userData) => {
    const newUser = {
      id: `usr-${Date.now()}`,
      username: userData.username.trim().toLowerCase(),
      name: userData.name.trim(),
      role: userData.role || 'staff',
      email: userData.email.trim(),
      status: 'active',
      lastActive: 'Never',
      avatarColor: userData.role === 'supervisor' ? 'bg-teal-600' : 'bg-blue-600',
      roleTitle: userData.roleTitle || (userData.role === 'supervisor' ? 'Pharmacy Supervisor' : 'Pharmacy Staff Dispenser')
    };

    setUsers((prev) => [...prev, newUser]);
    logActivity('Staff Created', 'Staff Management', `Created ${newUser.role} account "${newUser.username}".`);
    
    addToast({
      type: 'success',
      title: 'Staff Account Created',
      message: `User ${newUser.name} (@${newUser.username}) added.`
    });
  };

  const toggleUserStatus = (userId) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newStatus = u.status === 'active' ? 'disabled' : 'active';
          logActivity('Staff Status Changed', 'Staff Management', `Changed @${u.username} status to ${newStatus}.`);
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  const resetUserPassword = (userId) => {
    const u = users.find((x) => x.id === userId);
    addToast({
      type: 'info',
      title: 'Password Reset',
      message: `Password for @${u?.username} reset to "${u?.role === 'supervisor' ? 'supervisor123' : 'staff123'}".`
    });
    logActivity('Password Reset', 'Staff Management', `Reset password for @${u?.username}.`);
  };

  // Settings Actions
  const updateSettings = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    logActivity('Settings Updated', 'System Configuration', 'Updated pharmacy parameters & thresholds.');
    addToast({
      type: 'success',
      title: 'Settings Saved',
      message: 'Configuration updated successfully.'
    });
  };

  // Safe Demo Reset Action
  const resetDemoData = () => {
    setMedicines(INITIAL_MEDICINES);
    setOrders(INITIAL_ORDERS);
    setSales(INITIAL_SALES);
    setAiSuggestions(INITIAL_AI_SUGGESTIONS);
    setActivities(INITIAL_ACTIVITIES);
    setUsers(INITIAL_USERS);
    setSettings(INITIAL_SETTINGS);

    localStorage.setItem('medora_medicines', JSON.stringify(INITIAL_MEDICINES));
    localStorage.setItem('medora_orders', JSON.stringify(INITIAL_ORDERS));
    localStorage.setItem('medora_sales', JSON.stringify(INITIAL_SALES));
    localStorage.setItem('medora_ai_suggestions', JSON.stringify(INITIAL_AI_SUGGESTIONS));
    localStorage.setItem('medora_activities', JSON.stringify(INITIAL_ACTIVITIES));
    localStorage.setItem('medora_users', JSON.stringify(INITIAL_USERS));
    localStorage.setItem('medora_settings', JSON.stringify(INITIAL_SETTINGS));

    logActivity('Demo Data Reset', 'System Reset', 'All inventory, sales, orders, and AI activity reset to clean demo baseline.');

    addToast({
      type: 'success',
      title: 'Demo Reset Successful',
      message: 'All inventory, sales, and demo records have been restored to initial baseline.'
    });
  };

  // Computed Overview Metrics
  const stats = useMemo(() => {
    const totalMedicines = medicines.length;
    let totalStock = 0;
    let availableCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let expiringSoonCount = 0;
    let highExpiryRiskCount = 0;

    const criticalAlerts = [];

    for (const med of medicines) {
      totalStock += med.quantity;
      const stockInfo = getStockStatus(med.quantity, med.lowStockThreshold);
      const expiryInfo = calculateExpiryRisk(med.expiryDate, settings.expiryWarningDays, settings.highRiskExpiryDays);

      if (stockInfo.status === 'out_of_stock') {
        outOfStockCount++;
        criticalAlerts.push({
          id: `alert-oos-${med.id}`,
          type: 'out_of_stock',
          level: 'high',
          medicine: med,
          message: `${med.name} is completely Out of Stock (0 units).`,
          expectedRestock: med.expectedRestockDate
        });
      } else if (stockInfo.status === 'low_stock') {
        lowStockCount++;
        criticalAlerts.push({
          id: `alert-low-${med.id}`,
          type: 'low_stock',
          level: 'medium',
          medicine: med,
          message: `${med.name} is Low Stock (${med.quantity} remaining, threshold: ${med.lowStockThreshold}).`,
          expectedRestock: med.expectedRestockDate
        });
      } else {
        availableCount++;
      }

      if (expiryInfo.status === 'high_risk' || expiryInfo.status === 'expired') {
        highExpiryRiskCount++;
        criticalAlerts.push({
          id: `alert-exp-high-${med.id}`,
          type: 'expiry_high',
          level: 'high',
          medicine: med,
          message: `${med.name} (Batch ${med.batchNumber}) ${expiryInfo.description}.`
        });
      } else if (expiryInfo.status === 'expiring_soon') {
        expiringSoonCount++;
      }
    }

    const pendingOrdersCount = orders.filter((o) => o.status === 'Ordered' || o.status === 'In Transit').length;

    return {
      totalMedicines,
      totalStock,
      availableCount,
      lowStockCount,
      outOfStockCount,
      expiringSoonCount,
      highExpiryRiskCount,
      totalExpiringRisk: expiringSoonCount + highExpiryRiskCount,
      pendingOrdersCount,
      criticalAlerts
    };
  }, [medicines, orders, settings]);

  const value = {
    currentUser,
    medicines,
    orders,
    sales,
    aiSuggestions,
    activities,
    users,
    settings,
    stats,
    login,
    logout,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    correctStock,
    recordSale,
    createOrder,
    updateOrderStatus,
    receiveRestock,
    logAISuggestionDecision,
    addUser,
    toggleUserStatus,
    resetUserPassword,
    updateSettings,
    resetDemoData,
    addToast,
    removeToast,
    logActivity
  };

  return <PharmacyContext.Provider value={value}>{children}</PharmacyContext.Provider>;
}

export function usePharmacy() {
  const context = useContext(PharmacyContext);
  if (!context) {
    throw new Error('usePharmacy must be used within a PharmacyProvider');
  }
  return context;
}
