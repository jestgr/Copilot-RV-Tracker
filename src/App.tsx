/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  DEFAULT_TRAILERS, 
  getDefaultStorageLocations, 
  getDefaultChecklists, 
  getDefaultMaintenanceTasks, 
  getDefaultInventory 
} from './data/predefined';
import { TrailerProfile, StorageLocation, Checklist, MaintenanceTask, InventoryItem, MaintenanceLogEntry } from './types';
import { TrailerSpecs } from './components/TrailerSpecs';
import { ProfilesTab } from './components/ProfilesTab';
import { MaintenanceTab } from './components/MaintenanceTab';
import { InventoryTab } from './components/InventoryTab';
import { ChecklistsTab } from './components/ChecklistsTab';
import { 
  Compass, 
  ClipboardList, 
  Package, 
  Wrench, 
  User, 
  Sun, 
  Moon, 
  ChevronDown,
  Droplet,
  Zap,
  Gauge,
  AlertTriangle
} from 'lucide-react';

export default function App() {
  // Theme state 'light' | 'dark'
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('app_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light'; // Default to a gorgeous light theme matching AllTrails
  });

  // Main active navigation tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'checklists' | 'inventory' | 'maintenance' | 'profiles'>('dashboard');

  // Core structured data states
  const [trailers, setTrailers] = useState<TrailerProfile[]>([]);
  const [activeTrailerId, setActiveTrailerId] = useState<string>('');
  const [locations, setLocations] = useState<StorageLocation[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [logs, setLogs] = useState<MaintenanceLogEntry[]>([]);

  // Open active trailer profile drop-down selector status in header
  const [headerSelectorOpen, setHeaderSelectorOpen] = useState(false);

  // Initialize data with localStorage hook or load predefined assets
  useEffect(() => {
    // 1. Trailers
    const savedTrailers = localStorage.getItem('trailer_profiles');
    let loadedTrailers: TrailerProfile[] = [];
    if (savedTrailers) {
      try {
        loadedTrailers = JSON.parse(savedTrailers);
      } catch (e) {
        console.error('Failed to parse trailer profiles', e);
      }
    }
    if (loadedTrailers.length === 0) {
      loadedTrailers = DEFAULT_TRAILERS;
      localStorage.setItem('trailer_profiles', JSON.stringify(loadedTrailers));
    }
    setTrailers(loadedTrailers);

    // 2. Active ID
    const savedActiveId = localStorage.getItem('active_trailer_id');
    const actId = savedActiveId && loadedTrailers.some(t => t.id === savedActiveId) ? savedActiveId : loadedTrailers[0].id;
    setActiveTrailerId(actId);

    // 3. Locations
    const savedLocations = localStorage.getItem('trailer_locations');
    let loadedLocations: StorageLocation[] = [];
    if (savedLocations) {
      try { loadedLocations = JSON.parse(savedLocations); } catch {}
    }
    if (loadedLocations.length === 0) {
      // Seed default storage places for all initialized profiles
      loadedTrailers.forEach(t => {
        loadedLocations.push(...getDefaultStorageLocations(t.id));
      });
      localStorage.setItem('trailer_locations', JSON.stringify(loadedLocations));
    }
    setLocations(loadedLocations);

    // 4. Inventory items
    const savedItems = localStorage.getItem('trailer_inventory');
    let loadedItems: InventoryItem[] = [];
    if (savedItems) {
      try { loadedItems = JSON.parse(savedItems); } catch {}
    }
    if (loadedItems.length === 0) {
      loadedTrailers.forEach(t => {
        loadedItems.push(...getDefaultInventory(t.id));
      });
      localStorage.setItem('trailer_inventory', JSON.stringify(loadedItems));
    }
    setItems(loadedItems);

    // 5. Checklists
    const savedChecklists = localStorage.getItem('trailer_checklists');
    let loadedChecklists: Checklist[] = [];
    if (savedChecklists) {
      try { loadedChecklists = JSON.parse(savedChecklists); } catch {}
    }
    if (loadedChecklists.length === 0) {
      loadedTrailers.forEach(t => {
        loadedChecklists.push(...getDefaultChecklists(t.id));
      });
      localStorage.setItem('trailer_checklists', JSON.stringify(loadedChecklists));
    }
    setChecklists(loadedChecklists);

    // 6. Maintenance tasks
    const savedTasks = localStorage.getItem('trailer_maintenance_tasks');
    let loadedTasks: MaintenanceTask[] = [];
    if (savedTasks) {
      try { loadedTasks = JSON.parse(savedTasks); } catch {}
    }
    if (loadedTasks.length === 0) {
      loadedTrailers.forEach(t => {
        loadedTasks.push(...getDefaultMaintenanceTasks(t.id));
      });
      localStorage.setItem('trailer_maintenance_tasks', JSON.stringify(loadedTasks));
    }
    setTasks(loadedTasks);

    // 7. Maintenance Log Entries
    const savedLogs = localStorage.getItem('trailer_maintenance_logs');
    let loadedLogs: MaintenanceLogEntry[] = [];
    if (savedLogs) {
      try { loadedLogs = JSON.parse(savedLogs); } catch {}
    }
    // Starts empty
    setLogs(loadedLogs);
  }, []);

  // Update theme classes on body element
  useEffect(() => {
    localStorage.setItem('app_theme', theme);
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Persists helper routines on updates
  const updateLocalStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const handleUpdateStatus = (updatedStatus: Partial<TrailerProfile['status']>) => {
    const updated = trailers.map(t => {
      if (t.id !== activeTrailerId) return t;
      return {
        ...t,
        status: {
          ...t.status,
          ...updatedStatus
        }
      };
    });
    setTrailers(updated);
    updateLocalStorage('trailer_profiles', updated);
  };

  const handleAddTrailer = (newTrailer: TrailerProfile) => {
    const updated = [...trailers, newTrailer];
    setTrailers(updated);
    updateLocalStorage('trailer_profiles', updated);

    // Bootstrap! Instantly populate checklists, storage places, items & tasks
    // linked to this specific trailer model
    const newLocs = [...locations, ...getDefaultStorageLocations(newTrailer.id)];
    setLocations(newLocs);
    updateLocalStorage('trailer_locations', newLocs);

    const newChecklists = [...checklists, ...getDefaultChecklists(newTrailer.id)];
    setChecklists(newChecklists);
    updateLocalStorage('trailer_checklists', newChecklists);

    const newTasks = [...tasks, ...getDefaultMaintenanceTasks(newTrailer.id)];
    setTasks(newTasks);
    updateLocalStorage('trailer_maintenance_tasks', newTasks);

    const newItems = [...items, ...getDefaultInventory(newTrailer.id)];
    setItems(newItems);
    updateLocalStorage('trailer_inventory', newItems);

    setActiveTrailerId(newTrailer.id);
    localStorage.setItem('active_trailer_id', newTrailer.id);
  };

  const handleEditTrailer = (updatedTrailer: TrailerProfile) => {
    const updated = trailers.map(t => t.id === updatedTrailer.id ? updatedTrailer : t);
    setTrailers(updated);
    updateLocalStorage('trailer_profiles', updated);
  };

  const handleDeleteTrailer = (id: string) => {
    const updatedTrailers = trailers.filter(t => t.id !== id);
    setTrailers(updatedTrailers);
    updateLocalStorage('trailer_profiles', updatedTrailers);

    // Clean linked data
    const updatedLocs = locations.filter(l => l.trailerId !== id);
    setLocations(updatedLocs);
    updateLocalStorage('trailer_locations', updatedLocs);

    const updatedItems = items.filter(i => i.trailerId !== id);
    setItems(updatedItems);
    updateLocalStorage('trailer_inventory', updatedItems);

    const updatedChecklists = checklists.filter(c => c.trailerId !== id);
    setChecklists(updatedChecklists);
    updateLocalStorage('trailer_checklists', updatedChecklists);

    const updatedTasks = tasks.filter(t => t.trailerId !== id);
    setTasks(updatedTasks);
    updateLocalStorage('trailer_maintenance_tasks', updatedTasks);

    const updatedLogs = logs.filter(l => l.trailerId !== id);
    setLogs(updatedLogs);
    updateLocalStorage('trailer_maintenance_logs', updatedLogs);

    // Switch active id
    const nextActive = updatedTrailers[0]?.id || '';
    setActiveTrailerId(nextActive);
    localStorage.setItem('active_trailer_id', nextActive);
  };

  const handleSwitchTrailer = (id: string) => {
    setActiveTrailerId(id);
    localStorage.setItem('active_trailer_id', id);
    setHeaderSelectorOpen(false);
  };

  const handleAddTask = (newTask: MaintenanceTask) => {
    const updated = [...tasks, newTask];
    setTasks(updated);
    updateLocalStorage('trailer_maintenance_tasks', updated);
  };

  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    updateLocalStorage('trailer_maintenance_tasks', updated);
  };

  const handleLogCompleted = (
    userId: string, 
    taskId: string, 
    logData: Omit<MaintenanceLogEntry, 'id' | 'trailerId' | 'taskId' | 'taskTitle'>
  ) => {
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) return;

    // 1. Create a new log entry
    const newLogEntry: MaintenanceLogEntry = {
      id: `log-${Date.now()}`,
      trailerId: activeTrailerId,
      taskId,
      taskTitle: targetTask.title,
      completedDate: logData.completedDate,
      mileage: logData.mileage,
      performedBy: logData.performedBy,
      notes: logData.notes,
      invoiceCost: logData.invoiceCost,
    };

    const updatedLogs = [newLogEntry, ...logs];
    setLogs(updatedLogs);
    updateLocalStorage('trailer_maintenance_logs', updatedLogs);

    // 2. Update the parent task state
    const nextDue = new Date(logData.completedDate);
    if (targetTask.intervalMonths > 0) {
      nextDue.setMonth(nextDue.getMonth() + targetTask.intervalMonths);
    } else {
      nextDue.setMonth(nextDue.getMonth() + 6); // default to 6 months if one-off
    }

    const updatedTasks = tasks.map(t => {
      if (t.id !== taskId) return t;
      return {
        ...t,
        lastCompletedDate: logData.completedDate,
        dueDate: nextDue.toISOString().split('T')[0],
        dueMiles: logData.mileage + (t.intervalMiles || 1000)
      };
    });

    setTasks(updatedTasks);
    updateLocalStorage('trailer_maintenance_tasks', updatedTasks);
  };

  // Inventory actions
  const handleAddItem = (newItem: InventoryItem) => {
    const updated = [...items, newItem];
    setItems(updated);
    updateLocalStorage('trailer_inventory', updated);
  };

  const handleDeleteItem = (id: string) => {
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
    updateLocalStorage('trailer_inventory', updated);
  };

  const handleUpdateQty = (id: string, delta: number) => {
    const updated = items.map(item => {
      if (item.id !== id) return item;
      return { ...item, quantity: Math.max(0, item.quantity + delta) };
    });
    setItems(updated);
    updateLocalStorage('trailer_inventory', updated);
  };

  const handleAddLocation = (newLoc: StorageLocation) => {
    const updated = [...locations, newLoc];
    setLocations(updated);
    updateLocalStorage('trailer_locations', updated);
  };

  const handleDeleteLocation = (id: string) => {
    const updated = locations.filter(l => l.id !== id);
    setLocations(updated);
    updateLocalStorage('trailer_locations', updated);
  };

  // Checklists Actions
  const handleAddChecklist = (newChk: Checklist) => {
    const updated = [...checklists, newChk];
    setChecklists(updated);
    updateLocalStorage('trailer_checklists', updated);
  };

  const handleDeleteChecklist = (id: string) => {
    const updated = checklists.filter(c => c.id !== id);
    setChecklists(updated);
    updateLocalStorage('trailer_checklists', updated);
  };

  const handleUpdateChecklist = (updatedChk: Checklist) => {
    const updated = checklists.map(c => c.id === updatedChk.id ? updatedChk : c);
    setChecklists(updated);
    updateLocalStorage('trailer_checklists', updated);
  };

  const activeTrailer = trailers.find(t => t.id === activeTrailerId) || trailers[0];

  // Global Urgent Alert flags counts
  const dueTasksCount = tasks.filter(t => {
    if (t.trailerId !== activeTrailerId) return false;
    if (!t.dueDate) return false;
    const dueTime = new Date(t.dueDate).getTime();
    const nowTime = new Date().getTime();
    return Math.ceil((dueTime - nowTime) / (1000 * 60 * 60 * 24)) <= 0;
  }).length;

  const lowStockCount = items.filter(i => i.trailerId === activeTrailerId && i.quantity <= i.minQuantity).length;

  return (
    <div className="min-h-screen bg-[#f7f9f7] dark:bg-[#121612] text-slate-800 dark:text-slate-100 flex flex-col selection:bg-emerald-100 dark:selection:bg-emerald-900/30 transition-colors duration-200">
      
      {/* Top Professional Header Bar */}
      <header className="bg-white dark:bg-[#181d18] border-b border-slate-200/60 dark:border-emerald-950/20 sticky top-0 z-40 px-4 py-3.5 shadow-3xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo Brand / AllTrails style font */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-emerald-700 dark:bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm">
              <Compass className="w-5 h-5 animate-spin-slow rotate-12 text-emerald-100" />
            </div>
            <div>
              <span className="font-serif font-black tracking-tight text-lg text-emerald-800 dark:text-emerald-400">COPILOT</span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-[#a3b899] dark:text-emerald-500 block leading-none font-sans">Outdoor Rig Companion</span>
            </div>
          </div>

          {/* Center Multi-trailer switch panel dropdown */}
          {activeTrailer && (
            <div className="relative font-sans">
              <button
                onClick={() => setHeaderSelectorOpen(!headerSelectorOpen)}
                className="px-4 py-2 bg-slate-50 border border-slate-200/70 hover:bg-slate-100 dark:bg-emerald-950/25 dark:border-emerald-900/40 dark:text-emerald-50 rounded-full font-bold text-xs sm:text-xs flex items-center gap-2 cursor-pointer shadow-3xs select-none hover:shadow-2xs leading-none"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="truncate max-w-[130px] font-semibold">{activeTrailer.name}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              {headerSelectorOpen && (
                <div className="absolute top-11 left-1/2 -translate-x-1/2 w-[220px] bg-white dark:bg-[#1c221c] border border-slate-200 dark:border-emerald-900/40 rounded-2xl shadow-xl z-50 p-1.5 animate-in fade-in duration-200">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-450 dark:text-slate-400 tracking-wider">
                    Select Active Trailer
                  </div>
                  <div className="space-y-0.5">
                    {trailers.map((trail) => {
                      const isActive = trail.id === activeTrailerId;
                      return (
                        <button
                          key={trail.id}
                          onClick={() => handleSwitchTrailer(trail.id)}
                          className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-xl flex items-center justify-between cursor-pointer ${
                            isActive 
                              ? 'bg-emerald-50/75 dark:bg-[#253825] text-emerald-900 dark:text-emerald-250 font-bold' 
                              : 'text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-emerald-950/20'
                          }`}
                        >
                          <div>
                            <p className="font-bold truncate">{trail.name}</p>
                            <p className="text-[10px] opacity-70 font-mono mt-0.5">{trail.year} {trail.model}</p>
                          </div>
                          {isActive && <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400"></div>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Extra tools / Dark Mode toggle */}
          <div className="flex items-center gap-1">
            
            {/* Quick alert bar indicator bubbles */}
            {activeTrailer && (
              <div className="hidden sm:flex items-center gap-2 mr-2">
                {dueTasksCount > 0 && (
                  <button 
                    onClick={() => setActiveTab('maintenance')}
                    className="p-1 px-2.5 text-rose-700 bg-rose-50 dark:text-rose-450 dark:bg-rose-950/20 rounded-full font-mono text-[10px] font-bold border border-rose-150 flex items-center gap-1 cursor-pointer"
                    title={`${dueTasksCount} overdue maintenance items`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    {dueTasksCount} Due
                  </button>
                )}
                {lowStockCount > 0 && (
                  <button 
                    onClick={() => setActiveTab('inventory')}
                    className="p-1 px-2.5 text-amber-700 bg-amber-50 dark:text-amber-450 dark:bg-amber-950/20 rounded-full font-mono text-[10px] font-bold border border-amber-150 flex items-center gap-1 cursor-pointer"
                    title={`${lowStockCount} low stock gear items`}
                  >
                    <Package className="w-3.5 h-3.5 shrink-0" />
                    {lowStockCount} low
                  </button>
                )}
              </div>
            )}

            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2.5 hover:bg-slate-100 dark:hover:bg-emerald-950/30 rounded-full cursor-pointer transition-colors text-slate-500 dark:text-slate-400"
              title={theme === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
            </button>
          </div>

        </div>
      </header>

      {/* Main Container Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 pb-24">
        {activeTrailer ? (
          <div>
            
            {/* Tab view routing switchboard */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-serif font-bold text-slate-900 dark:text-emerald-50 tracking-tight flex items-center gap-2">
                    Trailer Dashboard
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Real-time tank indicators, TPMS blueprint, and rig stats.</p>
                </div>
                <TrailerSpecs trailer={activeTrailer} onUpdateStatus={handleUpdateStatus} />
              </div>
            )}

            {activeTab === 'checklists' && (
              <ChecklistsTab
                checklists={checklists}
                trailerId={activeTrailerId}
                onAddChecklist={handleAddChecklist}
                onDeleteChecklist={handleDeleteChecklist}
                onUpdateChecklist={handleUpdateChecklist}
              />
            )}

            {activeTab === 'inventory' && (
              <InventoryTab
                items={items}
                locations={locations}
                trailerId={activeTrailerId}
                onAddItem={handleAddItem}
                onDeleteItem={handleDeleteItem}
                onUpdateQty={handleUpdateQty}
                onAddLocation={handleAddLocation}
                onDeleteLocation={handleDeleteLocation}
              />
            )}

            {activeTab === 'maintenance' && (
              <MaintenanceTab
                tasks={tasks}
                logs={logs}
                trailerId={activeTrailerId}
                onAddTask={handleAddTask}
                onDeleteTask={handleDeleteTask}
                onLogCompleted={handleLogCompleted}
              />
            )}

            {activeTab === 'profiles' && (
              <ProfilesTab
                trailers={trailers}
                activeId={activeTrailerId}
                onSwitchActive={handleSwitchTrailer}
                onAddTrailer={handleAddTrailer}
                onEditTrailer={handleEditTrailer}
                onDeleteTrailer={handleDeleteTrailer}
              />
            )}

          </div>
        ) : (
          <div className="p-12 text-center max-w-lg mx-auto bg-white rounded-3xl border border-slate-150">
            <Compass className="w-12 h-12 text-emerald-700 animate-spin-slow mx-auto mb-3" />
            <h3 className="font-bold text-lg text-slate-800">No active trailer</h3>
            <p className="text-xs text-slate-500 mt-1">Please reload the companion app or initialize a profile in the Profiles tab.</p>
          </div>
        )}
      </main>

      {/* Bottom Floating Touch-Friendly Navigation Bar (AllTrails Inspired) */}
      <nav id="bottom-dock-nav" className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#181d18] border-t border-slate-205/65 dark:border-emerald-950/40 py-2.5 px-4 z-40 shadow-xl max-w-lg mx-auto md:max-w-xl sm:left-1/2 sm:-translate-x-1/2 sm:rounded-t-3xl border-l border-r border-[#ececec]/20">
        <div className="grid grid-cols-5 items-center text-center">
          
          {/* Dashboard */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 border-0 cursor-pointer outline-hidden transition-all ${
              activeTab === 'dashboard'
                ? 'text-emerald-700 dark:text-emerald-400 font-bold scale-102'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
            }`}
            title="Dashboard Overview"
          >
            <Compass className="w-5.5 h-5.5" />
            <span className="text-[10px] tracking-tight font-sans">Gauges</span>
          </button>

          {/* Checklists */}
          <button
            onClick={() => setActiveTab('checklists')}
            className={`flex flex-col items-center gap-1 border-0 cursor-pointer outline-hidden transition-all relative ${
              activeTab === 'checklists'
                ? 'text-emerald-700 dark:text-emerald-400 font-bold scale-102'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
            }`}
            title="Rig Checklists"
          >
            <ClipboardList className="w-5.5 h-5.5" />
            <span className="text-[10px] tracking-tight font-sans">Checklists</span>
          </button>

          {/* Inventory */}
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex flex-col items-center gap-1 border-0 cursor-pointer outline-hidden transition-all relative ${
              activeTab === 'inventory'
                ? 'text-emerald-700 dark:text-emerald-400 font-bold scale-102'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
            }`}
            title="Gear Inventory"
          >
            {lowStockCount > 0 && (
              <span className="absolute top-0 right-4 w-2 h-2 rounded-full bg-amber-500 text-[1px]"></span>
            )}
            <Package className="w-5.5 h-5.5" />
            <span className="text-[10px] tracking-tight font-sans">Inventory</span>
          </button>

          {/* Maintenance */}
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`flex flex-col items-center gap-1 border-0 cursor-pointer outline-hidden transition-all relative ${
              activeTab === 'maintenance'
                ? 'text-emerald-700 dark:text-emerald-400 font-bold scale-102'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
            }`}
            title="Maintenance & scheduler"
          >
            {dueTasksCount > 0 && (
              <span className="absolute top-0 right-4 w-2 h-2 rounded-full bg-rose-600 text-[1px]"></span>
            )}
            <Wrench className="w-5.5 h-5.5" />
            <span className="text-[10px] tracking-tight font-sans">Service</span>
          </button>

          {/* Trailers Profile */}
          <button
            onClick={() => setActiveTab('profiles')}
            className={`flex flex-col items-center gap-1 border-0 cursor-pointer outline-hidden transition-all ${
              activeTab === 'profiles'
                ? 'text-emerald-700 dark:text-emerald-400 font-bold scale-102'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
            }`}
            title="Rig Profiles"
          >
            <User className="w-5.5 h-5.5" />
            <span className="text-[10px] tracking-tight font-sans">Profiles</span>
          </button>

        </div>
      </nav>

    </div>
  );
}
