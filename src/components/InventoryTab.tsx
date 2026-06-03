/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { StorageLocation, InventoryItem } from '../types';
import { 
  Package, 
  MapPin, 
  Plus, 
  Trash2, 
  Minus, 
  AlertCircle, 
  Tag, 
  FolderPlus, 
  Upload, 
  Image as ImageIcon,
  Check,
  Search,
  ChevronRight
} from 'lucide-react';

interface InventoryTabProps {
  items: InventoryItem[];
  locations: StorageLocation[];
  trailerId: string;
  onAddItem: (newItem: InventoryItem) => void;
  onDeleteItem: (id: string) => void;
  onUpdateQty: (id: string, delta: number) => void;
  onAddLocation: (newLoc: StorageLocation) => void;
  onDeleteLocation: (id: string) => void;
}

// Preset beautiful emojis for camping items/locations
const ITEM_PRESETS = [
  { char: '🏕️', label: 'Camp Chair / Gear' },
  { char: '🚰', label: 'Fresh Hose / Filter' },
  { char: '💩', label: 'Drain System / Sewer' },
  { char: '🍳', label: 'Skillet / Kitchen' },
  { char: '🧻', label: 'Toilet Paper' },
  { char: '🔧', label: 'Wrench / Hand Tool' },
  { char: '🔌', label: 'Electric Cord / Surge' },
  { char: '🕯️', label: 'Torch / Lantern' },
  { char: '🩹', label: 'First Aid Kit' },
  { char: '🛏️', label: 'Pillow / Linen' },
];

const LOCATION_PRESETS = [
  { char: '🚪', label: 'Exterior Hatch' },
  { char: '🛏️', label: 'Internal Cabinet' },
  { char: '🍳', label: 'Kitchen Closet' },
  { char: '📦', label: 'Bumper Container' },
  { char: '🛠️', label: 'Tongue Tool Box' },
];

export const InventoryTab: React.FC<InventoryTabProps> = ({
  items,
  locations,
  trailerId,
  onAddItem,
  onDeleteItem,
  onUpdateQty,
  onAddLocation,
  onDeleteLocation,
}) => {
  const [selectedLocationFilter, setSelectedLocationFilter] = useState<string>('All');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [searchString, setSearchString] = useState<string>('');

  // Location Creator Drawer State
  const [isAddingLoc, setIsAddingLoc] = useState(false);
  const [locName, setLocName] = useState('');
  const [locDesc, setLocDesc] = useState('');
  const [locSelectedPreset, setLocSelectedPreset] = useState('🚪');
  const [locImageBase64, setLocImageBase64] = useState<string>('');

  // Item Creator Form State
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState<InventoryItem['category']>('Camping Gear');
  const [itemLocId, setItemLocId] = useState('');
  const [itemQty, setItemQty] = useState(1);
  const [itemMinQty, setItemMinQty] = useState(1);
  const [itemNotes, setItemNotes] = useState('');
  const [itemSelectedPreset, setItemSelectedPreset] = useState('🏕️');
  const [itemImageBase64, setItemImageBase64] = useState<string>('');

  // Drop-Zone states
  const [isDraggingLocImage, setIsDraggingLocImage] = useState(false);
  const [isDraggingItemImage, setIsDraggingItemImage] = useState(false);

  const locFileInputRef = useRef<HTMLInputElement>(null);
  const itemFileInputRef = useRef<HTMLInputElement>(null);

  const filteredLocations = locations.filter(l => l.trailerId === trailerId);
  const filteredItems = items.filter(item => {
    if (item.trailerId !== trailerId) return false;
    
    // Safety check if location filter is active
    if (selectedLocationFilter !== 'All' && item.storageLocationId !== selectedLocationFilter) return false;
    
    // Category check
    if (selectedCategoryFilter !== 'All' && item.category !== selectedCategoryFilter) return false;
    
    // Search query check
    if (searchString.trim() !== '') {
      return item.name.toLowerCase().includes(searchString.toLowerCase()) || 
             item.notes.toLowerCase().includes(searchString.toLowerCase());
    }

    return true;
  });

  // Base64 Reader Helper
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'loc' | 'item') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (target === 'loc') {
          setLocImageBase64(reader.result as string);
          setLocSelectedPreset(''); // clear preset if custom uploaded
        } else {
          setItemImageBase64(reader.result as string);
          setItemSelectedPreset('');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent, target: 'loc' | 'item') => {
    e.preventDefault();
    if (target === 'loc') setIsDraggingLocImage(true);
    else setIsDraggingItemImage(true);
  };

  const handleDragLeave = (e: React.DragEvent, target: 'loc' | 'item') => {
    e.preventDefault();
    if (target === 'loc') setIsDraggingLocImage(false);
    else setIsDraggingItemImage(false);
  };

  const handleDrop = (e: React.DragEvent, target: 'loc' | 'item') => {
    e.preventDefault();
    if (target === 'loc') {
      setIsDraggingLocImage(false);
    } else {
      setIsDraggingItemImage(false);
    }

    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (target === 'loc') {
          setLocImageBase64(reader.result as string);
          setLocSelectedPreset('');
        } else {
          setItemImageBase64(reader.result as string);
          setItemSelectedPreset('');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locName.trim()) return;

    const newLoc: StorageLocation = {
      id: `loc-${Date.now()}`,
      trailerId,
      name: locName.trim(),
      description: locDesc.trim() || 'No description provided.',
      image: locSelectedPreset ? locSelectedPreset : locImageBase64,
    };

    onAddLocation(newLoc);
    setIsAddingLoc(false);
    setLocName('');
    setLocDesc('');
    setLocImageBase64('');
    setLocSelectedPreset('🚪');
  };

  const handleSubmitItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    const targetLocId = itemLocId || (filteredLocations[0]?.id || '');
    if (!targetLocId) {
      alert('Please define at least one Storage Location first before cataloging gear.');
      return;
    }

    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      trailerId,
      name: itemName.trim(),
      category: itemCategory,
      quantity: Math.max(0, itemQty),
      storageLocationId: targetLocId,
      minQuantity: Math.max(0, itemMinQty),
      notes: itemNotes.trim(),
      image: itemSelectedPreset ? itemSelectedPreset : itemImageBase64,
    };

    onAddItem(newItem);
    setIsAddingItem(false);
    setItemName('');
    setItemNotes('');
    setItemQty(1);
    setItemMinQty(1);
    setItemImageBase64('');
    setItemSelectedPreset('🏕️');
  };

  return (
    <div id="inventory-tab-container" className="space-y-6">
      
      {/* Tab Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-800 dark:text-emerald-50">Trailer Gear Inventory</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Map your supplies, set target minimum levels, and organize items by specific lockers.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setIsAddingLoc(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/40 text-slate-700 dark:text-emerald-300 border border-slate-200 dark:border-emerald-900/25 font-semibold rounded-xl text-sm transition-colors cursor-pointer justify-center"
          >
            <FolderPlus className="w-4 h-4" />
            New Storage Place
          </button>
          
          <button
            onClick={() => {
              if (filteredLocations.length === 0) {
                alert('Please define a Storage Location first.');
                return;
              }
              setItemLocId(filteredLocations[0].id);
              setIsAddingItem(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-xl shadow-xs text-sm transition-colors cursor-pointer justify-center"
          >
            <Plus className="w-4 h-4" />
            Add Gear / Supplies
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side Navigation: Storage Locations lists */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-sans font-bold text-xs uppercase text-slate-400 tracking-wider">Storage Bins ({filteredLocations.length})</h3>
          </div>

          {/* Location details card creator form */}
          {isAddingLoc && (
            <form onSubmit={handleSubmitLocation} className="p-4 bg-slate-50 dark:bg-emerald-950/10 rounded-2xl border border-dashed border-emerald-500/40 space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-700 dark:text-emerald-300 font-sans">New Storage Compartment</span>
                <button 
                  type="button" 
                  onClick={() => setIsAddingLoc(false)}
                  className="text-xs text-slate-400 underline cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="space-y-3 font-sans">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Compartment Title</label>
                  <input
                    type="text"
                    required
                    value={locName}
                    onChange={(e) => setLocName(e.target.value)}
                    placeholder="e.g. Under Cabinet Cabinet"
                    className="w-full mt-1 p-2 bg-white dark:bg-[#141814] border border-slate-200 dark:border-emerald-900/70 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Brief Location Description</label>
                  <input
                    type="text"
                    value={locDesc}
                    onChange={(e) => setLocDesc(e.target.value)}
                    placeholder="e.g. Lower shelf below microwave."
                    className="w-full mt-1 p-2 bg-white dark:bg-[#141814] border border-slate-200 dark:border-emerald-900/70 rounded-lg text-xs"
                  />
                </div>

                {/* Preset Picker */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Or select a Preset Symbology</label>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {LOCATION_PRESETS.map(pre => (
                      <button
                        key={pre.char}
                        type="button"
                        onClick={() => {
                          setLocSelectedPreset(pre.char);
                          setLocImageBase64('');
                        }}
                        className={`p-2 bg-white dark:bg-[#1c221c] text-sm border rounded-lg transition-colors cursor-pointer ${
                          locSelectedPreset === pre.char 
                            ? 'border-emerald-600 ring-2 ring-emerald-500/10 bg-emerald-50/20 dark:bg-emerald-950/30' 
                            : 'border-slate-100 hover:border-slate-300 dark:border-emerald-900/30'
                        }`}
                        title={pre.label}
                      >
                        {pre.char}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image upload drop zone */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Or Upload Custom Bins Photo</label>
                  <div
                    onDragOver={handleDragOver}
                    onDragEnter={(e) => handleDragEnter(e, 'loc')}
                    onDragLeave={(e) => handleDragLeave(e, 'loc')}
                    onDrop={(e) => handleDrop(e, 'loc')}
                    onClick={() => locFileInputRef.current?.click()}
                    className={`p-3 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all duration-205 flex flex-col items-center ${
                      isDraggingLocImage 
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' 
                        : 'border-slate-200 hover:border-slate-300 dark:border-emerald-900/10 hover:bg-slate-100/50'
                    }`}
                  >
                    <input
                      type="file"
                      ref={locFileInputRef}
                      onChange={(e) => handleFileChange(e, 'loc')}
                      accept="image/*"
                      className="hidden"
                    />
                    {locImageBase64 ? (
                      <div className="relative w-full h-16 flex items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 overflow-hidden">
                        <img src={locImageBase64} alt="Preview" className="h-full object-cover rounded-lg" />
                        <span className="absolute bottom-1 right-1 text-[8px] bg-emerald-600 text-white rounded px-1">Done</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-slate-400 mb-1" />
                        <p className="text-[9px] text-slate-500 dark:text-slate-400">Click or Drag & Drop location image</p>
                      </>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Save Compartment
                </button>
              </div>
            </form>
          )}

          {/* Locations Navigation list */}
          <div className="space-y-2">
            <button
              onClick={() => setSelectedLocationFilter('All')}
              className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between font-sans transition-all cursor-pointer ${
                selectedLocationFilter === 'All'
                  ? 'bg-slate-800 dark:bg-[#252c25] text-white border-slate-800'
                  : 'bg-white dark:bg-[#1c221c] text-slate-700 dark:text-slate-200 border-slate-100 dark:border-emerald-950/15 hover:border-slate-200'
              }`}
            >
              <span className="flex items-center gap-2.5 font-semibold text-sm">
                <Package className="w-4.5 h-4.5 shrink-0" />
                All Storage Containers
              </span>
              <span className="text-xs font-mono font-bold font-medium opacity-70">
                {items.filter(item => item.trailerId === trailerId).length}
              </span>
            </button>

            {filteredLocations.map((loc) => {
              const isActive = selectedLocationFilter === loc.id;
              const belongsCount = items.filter(i => i.trailerId === trailerId && i.storageLocationId === loc.id).length;
              return (
                <div
                  key={loc.id}
                  className={`w-full rounded-xl border font-sans transition-all flex items-stretch overflow-hidden group ${
                    isActive
                      ? 'bg-emerald-50/50 dark:bg-[#1e2a1e] text-slate-800 dark:text-emerald-100 border-emerald-500/70 dark:border-emerald-800'
                      : 'bg-white dark:bg-[#1c221c] text-slate-700 dark:text-slate-200 border-slate-100 dark:border-emerald-950/15'
                  }`}
                >
                  <button
                    onClick={() => setSelectedLocationFilter(loc.id)}
                    className="flex-1 p-3.5 text-left flex items-start gap-3 cursor-pointer"
                  >
                    {/* Location Image Or preset visual rendering */}
                    <div className="w-9 h-9 shrink-0 rounded-lg bg-slate-50 dark:bg-[#141814] flex items-center justify-center font-bold relative border border-slate-100/50 dark:border-emerald-900/10">
                      {loc.image && loc.image.length < 5 ? (
                        <span className="text-xl">{loc.image}</span>
                      ) : loc.image ? (
                        <img src={loc.image} alt={loc.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <MapPin className="w-4.5 h-4.5 text-slate-400" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-baseline gap-1">
                        <span className="font-bold text-xs truncate leading-tight dark:text-emerald-100 block">{loc.name}</span>
                        <span className="text-[10px] font-mono font-bold text-slate-400 shrink-0">{belongsCount} items</span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5" title={loc.description}>{loc.description}</p>
                    </div>
                  </button>

                  {/* Detach Location option */}
                  <button
                    onClick={() => {
                      if (belongsCount > 0) {
                        alert(`Cannot delete storage place "${loc.name}" because it currently holds ${belongsCount} items. Move them first!`);
                      } else if (confirm(`Remove custom storage place "${loc.name}"?`)) {
                        onDeleteLocation(loc.id);
                        if (isActive) setSelectedLocationFilter('All');
                      }
                    }}
                    className="p-2.5 text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/10 transition-colors border-l border-slate-100/40 dark:border-emerald-950/10 shrink-0 flex items-center justify-center cursor-pointer"
                    title="Remove Bin"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side Column: Item Inventory Sheet */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Filters shelf */}
          <div className="bg-white dark:bg-[#1c221c] p-4 rounded-xl border border-slate-100 dark:border-emerald-950/20 flex flex-col sm:flex-row gap-3 shadow-2xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchString}
                onChange={(e) => setSearchString(e.target.value)}
                placeholder="Search inventory gear, notes, identifiers..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 focus:border-emerald-600 focus:outline-hidden rounded-xl dark:bg-[#141814] dark:border-emerald-900/60 dark:text-emerald-50"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="px-3.5 py-2 text-xs font-semibold bg-slate-50 dark:bg-emerald-950/40 text-slate-700 dark:text-emerald-200 border border-slate-200 dark:border-emerald-900/30 rounded-xl focus:outline-hidden"
              >
                <option value="All">All Categories</option>
                <option value="Kitchen">Kitchen Supplies</option>
                <option value="Safety">Safety Equipment</option>
                <option value="Camping Gear">Camp Gear / Outdoors</option>
                <option value="Setup & Hitch">Hitching / Setup</option>
                <option value="Tools">Mechanical Tools</option>
                <option value="Bedding">Sleeping Bedding</option>
                <option value="Bathroom">Toiletries / Bathroom</option>
                <option value="Other">Other Miscellaneous</option>
              </select>
            </div>
          </div>

          {/* New Item Form */}
          {isAddingItem && (
            <form onSubmit={handleSubmitItem} className="bg-white dark:bg-[#1c221c] p-5 rounded-2xl border border-slate-150 dark:border-emerald-700/40 space-y-4 font-sans">
              <h3 className="font-bold border-b border-slate-100 dark:border-emerald-950/20 pb-2 text-slate-800 dark:text-emerald-50">Log New Gear Item</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Gear Title / Name</label>
                  <input
                    type="text"
                    required
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="e.g. Cast Iron Dutch Oven Lodge"
                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm justify-center focus:outline-hidden focus:border-emerald-500 dark:bg-[#141814]' dark:border-emerald-950 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Camp Category</label>
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value as any)}
                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm dark:bg-[#141814] dark:border-emerald-950 focus:outline-hidden focus:border-emerald-500"
                  >
                    <option value="Kitchen">Kitchen</option>
                    <option value="Safety">Safety</option>
                    <option value="Camping Gear">Camping Gear</option>
                    <option value="Setup & Hitch">Setup & Hitch</option>
                    <option value="Tools">Tools</option>
                    <option value="Bedding">Bedding</option>
                    <option value="Bathroom">Bathroom</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Storage Bin Destination</label>
                  <select
                    required
                    value={itemLocId}
                    onChange={(e) => setItemLocId(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm dark:bg-[#141814] dark:border-emerald-950 focus:outline-hidden"
                  >
                    {filteredLocations.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Starting Quantity</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={itemQty}
                      onChange={(e) => setItemQty(parseInt(e.target.value) || 0)}
                      className="w-full mt-1 p-2 border border-slate-200 rounded-xl text-sm dark:bg-[#141814] dark:border-emerald-950"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Min Alert Stock</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={itemMinQty}
                      onChange={(e) => setItemMinQty(parseInt(e.target.value) || 0)}
                      className="w-full mt-1 p-2 border border-slate-200 rounded-xl text-sm dark:bg-[#141814] dark:border-emerald-950"
                    />
                  </div>
                </div>

                {/* Preset Item symbol selection */}
                <div className="space-y-1 sm:col-span-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Select Gear Illustration (Icon)</label>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {ITEM_PRESETS.map(p => (
                      <button
                        key={p.char}
                        type="button"
                        onClick={() => {
                          setItemSelectedPreset(p.char);
                          setItemImageBase64('');
                        }}
                        className={`p-2 bg-white dark:bg-[#1c221c] border rounded-lg hover:border-slate-350 transition-colors cursor-pointer ${
                          itemSelectedPreset === p.char 
                            ? 'border-emerald-600 ring-2 ring-emerald-500/10 bg-emerald-50/20' 
                            : 'border-slate-100 dark:border-emerald-900/30'
                        }`}
                        title={p.label}
                      >
                        {p.char}
                      </button>
                    ))}
                  </div>
                </div>

                {/* File custom photo upload drop and select */}
                <div className="sm:col-span-3 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Or Drag & Drop Custom Gear Photo/Image</label>
                  <div
                    onDragOver={handleDragOver}
                    onDragEnter={(e) => handleDragEnter(e, 'item')}
                    onDragLeave={(e) => handleDragLeave(e, 'item')}
                    onDrop={(e) => handleDrop(e, 'item')}
                    onClick={() => itemFileInputRef.current?.click()}
                    className={`p-4 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${
                      isDraggingItemImage 
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' 
                        : 'border-slate-200 hover:border-slate-300 dark:border-emerald-900/20 hover:bg-slate-50/40'
                    }`}
                  >
                    <input
                      type="file"
                      ref={itemFileInputRef}
                      onChange={(e) => handleFileChange(e, 'item')}
                      accept="image/*"
                      className="hidden"
                    />
                    {itemImageBase64 ? (
                      <div className="relative w-full h-16 flex items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 overflow-hidden">
                        <img src={itemImageBase64} alt="Preview" className="h-full object-cover rounded-lg" />
                        <span className="absolute bottom-1 right-1 text-[8px] bg-emerald-600 text-white rounded px-1">Selected</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="w-5 h-5 text-slate-400 mb-1" />
                        <span className="text-[11px] text-slate-500">Choose file or drag image here (base64 offline storage)</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-3 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Gear Notes (Brand, manual specs, check items)</label>
                  <textarea
                    value={itemNotes}
                    onChange={(e) => setItemNotes(e.target.value)}
                    placeholder="Enter serial numbers, expiry dates, hookup directions..."
                    rows={2}
                    className="w-full mt-1 p-2 bg-white dark:bg-[#141814] border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingItem(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 dark:border-emerald-900/40 dark:text-slate-350 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Save to Gear sheet
                </button>
              </div>
            </form>
          )}

          {/* Ledger Items rendering */}
          <div className="space-y-3">
            {filteredItems.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-[#1c221c] border border-slate-100 dark:border-emerald-950/20 rounded-2xl">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-2.5" />
                <h4 className="font-sans font-bold text-slate-600 dark:text-slate-300">Inventory sheet is empty.</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">This location or category does not contain any cataloged items. Tap "Add Gear" above to save first supplies.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredItems.map((item) => {
                  const itemLoc = locations.find(l => l.id === item.storageLocationId);
                  const isLow = item.quantity <= item.minQuantity;
                  
                  return (
                    <div
                      key={item.id}
                      className="p-4 bg-white dark:bg-[#1c221c] border border-slate-100 dark:border-emerald-950/20 rounded-2xl shadow-2xs hover:border-slate-200 dark:hover:border-emerald-800/20 transition-all font-sans relative flex flex-col justify-between gap-3.5 group"
                    >
                      <div className="flex items-start gap-3.5">
                        
                        {/* Custom photo or emoji display */}
                        <div className="w-11 h-11 shrink-0 rounded-xl bg-slate-50 dark:bg-[#141814] flex items-center justify-center border border-slate-100/50 dark:border-emerald-900/20 overflow-hidden">
                          {item.image && item.image.length < 5 ? (
                            <span className="text-2xl select-none">{item.image}</span>
                          ) : item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-slate-450" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-800 dark:text-emerald-100 text-[14px] truncate leading-tight block" title={item.name}>
                              {item.name}
                            </h4>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase">
                            <span className="bg-slate-100 dark:bg-[#252c25] px-1.5 py-0.5 rounded-sm dark:text-emerald-400 truncate max-w-[80px]">
                              {item.category}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 truncate text-[10px] text-slate-500 max-w-[120px]">
                              <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                              {itemLoc ? itemLoc.name : 'Unknown compartment'}
                            </span>
                          </div>

                          {item.notes && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-1 leading-normal" title={item.notes}>
                              {item.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Touch Friendly quantity selectors and trash button */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100/40 dark:border-emerald-950/10">
                        <div className="flex items-center gap-1">
                          {isLow && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold font-mono text-rose-700 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/25 border border-rose-200/40 shrink-0 flex items-center gap-0.5">
                              <AlertCircle className="w-3.5 h-3.5" />
                              Low Stock ({item.minQuantity} min)
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Trash button */}
                          <button
                            onClick={() => {
                              if (confirm(`Remove custom gear item "${item.name}" from inventory?`)) {
                                onDeleteItem(item.id);
                              }
                            }}
                            className="p-1.5 text-slate-310 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-950/10 rounded-lg cursor-pointer transition-colors"
                            title="Delete Item"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>

                          <div className="flex items-center bg-slate-50 dark:bg-[#141814] p-1.5 gap-1 border border-slate-150 dark:border-emerald-900/30 rounded-xl">
                            <button
                              onClick={() => {
                                if (item.quantity > 0) onUpdateQty(item.id, -1);
                              }}
                              className="w-8 h-8 rounded-lg bg-white dark:bg-[#1e251e] border border-slate-150 dark:border-emerald-900/40 text-slate-600 hover:bg-slate-100 dark:text-slate-355 flex items-center justify-center cursor-pointer font-bold shadow-3xs"
                              title="Decrease Quantity"
                            >
                              <Minus className="w-4 h-4" />
                            </button>

                            <span className="w-10 text-center text-sm font-bold font-mono text-slate-800 dark:text-slate-100 select-none">
                              {item.quantity}
                            </span>

                            <button
                              onClick={() => onUpdateQty(item.id, 1)}
                              className="w-8 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 border border-emerald-650 text-white flex items-center justify-center cursor-pointer font-bold shadow-3xs"
                              title="Increase Quantity"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
