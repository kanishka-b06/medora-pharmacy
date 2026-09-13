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
      let loaded = saved ? JSON.parse(saved) : [...INITIAL_USERS];
      // Filter out any legacy stockkeeper accounts
      loaded = loaded.filter((u) => u.role !== 'stockkeeper' && u.username !== 'stockkeeper');
      const existingUsernames = new Set(loaded.map((u) => u.username?.toLowerCase()));
      INITIAL_USERS.forEach((initUser) => {
        if (!existingUsernames.has(initUser.username?.toLowerCase())) {
          loaded.push(initUser);
        }
      });
      return loaded;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('medora_settings') || localStorage.getItem('pharmassist_settings');
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [toasts, setToasts] = useState([]);

  // LocalStorage Synchronization
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('medora_currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('medora_currentUser');
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

  // Toast System
  const addToast = ({ type = 'info', title, message, duration = 4000 }) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Activity Logger
  const logActivity = (action, target, details, performedBy = null) => {
    const userString = performedBy || (currentUser ? `${currentUser.name} (${currentUser.username})` : 'System');
    const newActivity = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      action,
      target,
      details,
      performedBy: userString,
      timestamp: new Date().toISOString()
    };
    setActivities((prev) => [newActivity, ...prev]);
    return newActivity;
  };

  // Auth Operations
  const login = (username, password) => {
    if (!username || !password) {
      return { success: false, message: 'Please provide both username and password.' };
    }

    const trimmedUsername = username.trim().toLowerCase();
    const trimmedPassword = password.trim();

    let matchedUser = users.find(
      (u) =>
        u.username.toLowerCase() === trimmedUsername ||
        (u.email && u.email.toLowerCase() === trimmedUsername)
    );

    // Default prototype fallback checks
    if (!matchedUser) {
      if (
        trimmedUsername === 'supervisor' ||
        trimmedUsername === 'admin' ||
        trimmedUsername === 'owner' ||
        trimmedUsername === 'sarah' ||
        trimmedUsername === 'kanishka.b6906@gmail.com'
      ) {
        matchedUser = INITIAL_USERS.find((u) => u.id === 'usr-supervisor') || {
          id: 'usr-supervisor',
          username: 'supervisor',
          name: 'Sarah',
          role: 'owner',
          email: 'kanishka.b6906@gmail.com',
          status: 'active',
          avatarColor: 'bg-teal-600',
          roleTitle: 'Pharmacy Owner'
        };
      } else if (
        trimmedUsername === 'staff' ||
        trimmedUsername === 'worker' ||
        trimmedUsername === 'arun' ||
        trimmedUsername === 'staff@medora.local'
      ) {
        matchedUser = INITIAL_USERS.find((u) => u.id === 'usr-staff') || {
          id: 'usr-staff',
          username: 'staff',
          name: 'Arun',
          role: 'staff',
          email: 'staff@medora.local',
          status: 'active',
          avatarColor: 'bg-blue-600',
          roleTitle: 'Pharmacy Staff Dispenser'
        };
      }
    }

    if (!matchedUser) {
      return { success: false, message: 'Account not found. Please check your credentials.' };
    }

    if (matchedUser.status === 'inactive') {
      return { success: false, message: 'This account has been deactivated. Please contact the administrator.' };
    }

    const isSupervisor =
      matchedUser.role === 'supervisor' || matchedUser.role === 'admin' || matchedUser.role === 'owner';
    const isWorker =
      matchedUser.role === 'staff' || matchedUser.role === 'worker';

    const isValidPassword =
      trimmedPassword === 'admin123' ||
      trimmedPassword === 'supervisor123' ||
      trimmedPassword === 'staff123' ||
      trimmedPassword === 'worker123' ||
      trimmedPassword === 'demo123' ||
      trimmedPassword === 'password' ||
      trimmedPassword === `${matchedUser.username}123` ||
      (isSupervisor && trimmedPassword === 'supervisor123') ||
      (isWorker && trimmedPassword === 'staff123');

    if (!isValidPassword) {
      return { success: false, message: 'Incorrect password. Please try again.' };
    }

    const normalizedUser = {
      ...matchedUser,
      role: isSupervisor ? 'owner' : 'staff',
      roleTitle: isSupervisor ? 'Pharmacy Owner' : 'Pharmacy Staff Dispenser'
    };

    setCurrentUser(normalizedUser);

    setUsers((prev) =>
      prev.map((u) => (u.id === normalizedUser.id ? { ...u, lastActive: 'Just now' } : u))
    );

    logActivity('User Login', normalizedUser.name, `Logged into ${isSupervisor ? 'Owner' : 'Worker'} Portal.`, normalizedUser.name);

    addToast({
      type: 'success',
      title: `Welcome, ${normalizedUser.name}!`,
      message: `Signed in to ${isSupervisor ? 'Owner' : 'Worker'} Portal.`
    });

    return { success: true, user: normalizedUser };
  };

  const logout = () => {
    if (currentUser) {
      logActivity('User Logout', currentUser.name, 'Signed out of system session.');
    }
    setCurrentUser(null);
    localStorage.removeItem('medora_currentUser');
    addToast({ type: 'info', title: 'Signed Out', message: 'You have been logged out securely.' });
  };

  const switchUserRole = (targetRole) => {
    if (!currentUser) return;
    const isOwner = targetRole === 'admin' || targetRole === 'supervisor' || targetRole === 'owner';
    const updated = {
      ...currentUser,
      role: isOwner ? 'owner' : 'staff',
      roleTitle: isOwner ? 'Pharmacy Owner' : 'Pharmacy Staff Dispenser'
    };
    setCurrentUser(updated);
    addToast({
      type: 'info',
      title: 'Portal Switched',
      message: `Switched view to ${isOwner ? 'Owner' : 'Worker'} mode.`
    });
  };

  // Medicine Inventory CRUD
  const addMedicine = (medicineData) => {
    const newId = `med-${Date.now().toString().slice(-4)}`;
    const parsedQty = parseInt(medicineData.quantity, 10) || 0;
    const parsedPrice = parseFloat(medicineData.price) || 0;
    const parsedLowStock = parseInt(medicineData.lowStockThreshold, 10) || settings.lowStockThresholdDefault || 10;

    const newMed = {
      id: newId,
      name: medicineData.name.trim(),
      brandName: medicineData.brandName?.trim() || medicineData.name.trim(),
      activeIngredient: medicineData.activeIngredient.trim(),
      strength: medicineData.strength.trim(),
      dosageForm: medicineData.dosageForm || 'Tablet',
      therapeuticClass: medicineData.therapeuticClass?.trim() || 'General Medicine',
      rack: medicineData.rack.toUpperCase().trim(),
      shelf: medicineData.shelf.toString().trim(),
      quantity: parsedQty,
      batchNumber: medicineData.batchNumber ? medicineData.batchNumber.toUpperCase().trim() : `B${Math.floor(100 + Math.random() * 900)}`,
      expiryDate: medicineData.expiryDate,
      price: parsedPrice,
      lowStockThreshold: parsedLowStock,
      expectedRestockDate: medicineData.expectedRestockDate || '',
      orderStatus: medicineData.orderStatus || 'None',
      supplier: medicineData.supplier?.trim() || 'General Medical Supplies',
      notes: medicineData.notes || '',
      isDemo: false
    };

    setMedicines((prev) => [newMed, ...prev]);

    logActivity(
      'Medicine Added',
      newMed.name,
      `New medicine registered in Rack ${newMed.rack}, Shelf ${newMed.shelf} (${newMed.quantity} units, Batch ${newMed.batchNumber}).`
    );

    addToast({
      type: 'success',
      title: 'Medicine Added Successfully',
      message: `${newMed.name} added at Rack ${newMed.rack} → Shelf ${newMed.shelf}.`
    });

    return newMed;
  };

  const updateMedicine = (id, medicineData) => {
    let updatedRecord = null;
    let oldRecord = null;

    setMedicines((prev) =>
      prev.map((med) => {
        if (med.id === id) {
          oldRecord = med;
          updatedRecord = {
            ...med,
            ...medicineData,
            name: medicineData.name !== undefined ? medicineData.name.trim() : med.name,
            activeIngredient: medicineData.activeIngredient !== undefined ? medicineData.activeIngredient.trim() : med.activeIngredient,
            strength: medicineData.strength !== undefined ? medicineData.strength.trim() : med.strength,
            rack: medicineData.rack !== undefined ? medicineData.rack.toUpperCase().trim() : med.rack,
            shelf: medicineData.shelf !== undefined ? medicineData.shelf.toString().trim() : med.shelf,
            quantity: medicineData.quantity !== undefined ? parseInt(medicineData.quantity, 10) : med.quantity,
            price: medicineData.price !== undefined ? parseFloat(medicineData.price) : med.price,
            batchNumber: medicineData.batchNumber !== undefined ? medicineData.batchNumber.toUpperCase().trim() : med.batchNumber
          };
          return updatedRecord;
        }
        return med;
      })
    );

    if (updatedRecord) {
      logActivity(
        'Medicine Updated',
        updatedRecord.name,
        `Updated location/details: Rack ${updatedRecord.rack} → Shelf ${updatedRecord.shelf}, Stock: ${updatedRecord.quantity}.`
      );

      addToast({
        type: 'success',
        title: 'Medicine Details Updated',
        message: `${updatedRecord.name} details saved.`
      });
    }

    return updatedRecord;
  };

  const deleteMedicine = (id) => {
    const target = medicines.find((m) => m.id === id);
    if (!target) return false;

    setMedicines((prev) => prev.filter((m) => m.id !== id));

    logActivity('Medicine Deleted', target.name, `Removed from inventory (Rack ${target.rack}, Shelf ${target.shelf}).`);

    addToast({
      type: 'warning',
      title: 'Medicine Removed',
      message: `${target.name} was removed from the inventory registry.`
    });

    return true;
  };

  const correctStock = (id, newQuantity, reason = 'Inventory audit') => {
    const targetQty = Math.max(0, parseInt(newQuantity, 10) || 0);
    let medName = '';
    let oldQty = 0;
    let targetMed = null;

    setMedicines((prev) =>
      prev.map((med) => {
        if (med.id === id) {
          medName = med.name;
          oldQty = med.quantity;
          targetMed = { ...med, quantity: targetQty };
          return targetMed;
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

  // Record Sale Action (Previous - Sold = Remaining)
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
    const updatedMed = { ...targetMed, quantity: remainingStock };
    setMedicines((prev) =>
      prev.map((med) => (med.id === medicineId ? updatedMed : med))
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

  // Orders and Restock
  const createOrder = (orderData) => {
    const newOrder = {
      id: `po-${Date.now().toString().slice(-4)}`,
      medicineId: orderData.medicineId || '',
      medicineName: orderData.medicineName || 'Medicine Restock',
      supplier: orderData.supplier || 'Apex Pharma Distributors',
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
        prev.map((med) => {
          if (med.id === orderData.medicineId) {
            return {
              ...med,
              orderStatus: newOrder.status,
              expectedRestockDate: newOrder.expectedArrivalDate
            };
          }
          return med;
        })
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
        prev.map((med) => {
          if (med.id === affectedMedId) {
            return {
              ...med,
              orderStatus: newStatus,
              expectedRestockDate: expectedArrivalDate || med.expectedRestockDate
            };
          }
          return med;
        })
      );
    }

    logActivity('Order Status Updated', affectedMedName || orderId, `Order status set to "${newStatus}".`);

    addToast({
      type: 'info',
      title: 'Order Status Updated',
      message: `Order status set to "${newStatus}".`
    });
  };

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
        prev.map((ord) => {
          if (ord.medicineId === medicineId && (ord.status === 'Ordered' || ord.status === 'In Transit')) {
            return { ...ord, status: 'Arrived' };
          }
          return ord;
        })
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
      pharmacistDecision: decision,
      pharmacistNotes: notes,
      timestamp: new Date().toISOString(),
      reviewedBy: currentUser ? `${currentUser.name} (${currentUser.role === 'owner' ? 'Owner' : 'Staff'})` : 'Pharmacist'
    };

    setAiSuggestions((prev) => [newRecord, ...prev]);

    logActivity(
      `AI Alternative ${decision}`,
      `${newRecord.suggestedMedicineName} (for ${newRecord.requestedMedicineName})`,
      `Match score: ${newRecord.matchScore}%. Decision: ${decision}.`
    );

    addToast({
      type: decision === 'Approved' ? 'success' : decision === 'Rejected' ? 'warning' : 'info',
      title: `Alternative ${decision}`,
      message: `Recommendation ${decision.toLowerCase()} by ${newRecord.reviewedBy}.`
    });

    return newRecord;
  };

  // Staff User Management
  const addUser = (userData) => {
    const newUser = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      username: userData.username.toLowerCase().trim(),
      name: userData.name.trim(),
      role: userData.role || 'staff',
      email: userData.email?.trim() || `${userData.username}@medora.local`,
      status: 'active',
      lastActive: 'Never',
      avatarColor: userData.avatarColor || 'bg-teal-600',
      roleTitle: userData.roleTitle || 'Pharmacy Assistant'
    };

    setUsers((prev) => [...prev, newUser]);
    logActivity('User Account Created', newUser.name, `New user registered: @${newUser.username} (${newUser.roleTitle}).`);
    addToast({
      type: 'success',
      title: 'User Account Created',
      message: `Account for ${newUser.name} created successfully.`
    });
    return newUser;
  };

  const toggleUserStatus = (userId) => {
    let userName = '';
    let newStatus = '';
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          userName = u.name;
          newStatus = u.status === 'active' ? 'inactive' : 'active';
          return { ...u, status: newStatus };
        }
        return u;
      })
    );

    logActivity('User Status Toggled', userName, `Status set to ${newStatus}.`);
    addToast({
      type: 'info',
      title: 'User Status Updated',
      message: `${userName} is now ${newStatus}.`
    });
  };

  const resetUserPassword = (userId) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    logActivity('Password Reset', target.name, `Password reset to default prototype credentials.`);
    addToast({
      type: 'success',
      title: 'Password Reset',
      message: `Password for ${target.name} reset to "${target.username}123".`
    });
  };

  // System Settings Update
  const updateSettings = (newSettings) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      return updated;
    });
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
    localStorage.removeItem('medora_batches');
    localStorage.removeItem('medora_notifications');

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

    medicines.forEach((med) => {
      totalStock += med.quantity;
      const stockInfo = getStockStatus(med.quantity, med.lowStockThreshold || settings.lowStockThresholdDefault || 10);
      if (stockInfo.status === 'available') availableCount += 1;
      else if (stockInfo.status === 'low_stock') lowStockCount += 1;
      else if (stockInfo.status === 'out_of_stock') outOfStockCount += 1;

      const expiryInfo = calculateExpiryRisk(
        med.expiryDate,
        settings.expiryWarningDays || 90,
        settings.highRiskExpiryDays || 30
      );
      if (expiryInfo.status === 'high_risk') highExpiryRiskCount += 1;
      else if (expiryInfo.status === 'expiring_soon') expiringSoonCount += 1;

      if (stockInfo.status === 'out_of_stock') {
        criticalAlerts.push({
          type: 'out_of_stock',
          medicine: med,
          message: `${med.name} is completely out of stock.`
        });
      }
      if (expiryInfo.status === 'high_risk') {
        criticalAlerts.push({
          type: 'high_expiry_risk',
          medicine: med,
          message: `${med.name} (Batch ${med.batchNumber}) expires in ${expiryInfo.daysRemaining} days!`
        });
      }
    });

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
    // Auth
    login,
    logout,
    switchUserRole,
    // Medicine CRUD
    addMedicine,
    updateMedicine,
    deleteMedicine,
    correctStock,
    recordSale,
    // Orders
    createOrder,
    updateOrderStatus,
    receiveRestock,
    // AI
    logAISuggestionDecision,
    // User management
    addUser,
    toggleUserStatus,
    resetUserPassword,
    updateSettings,
    resetDemoData,
    // Toasts & logging
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
