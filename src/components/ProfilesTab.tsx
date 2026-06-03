/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TrailerProfile } from '../types';
import { Plus, User, FileEdit, Trash2, Check, Sparkles, AlertCircle } from 'lucide-react';

interface ProfilesTabProps {
  trailers: TrailerProfile[];
  activeId: string;
  onSwitchActive: (id: string) => void;
  onAddTrailer: (newTrailer: TrailerProfile) => void;
  onEditTrailer: (updated: TrailerProfile) => void;
  onDeleteTrailer: (id: string) => void;
}

export const ProfilesTab: React.FC<ProfilesTabProps> = ({
  trailers,
  activeId,
  onSwitchActive,
  onAddTrailer,
  onEditTrailer,
  onDeleteTrailer,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(2024);
  
  // Custom Spec form states
  const [freshCap, setFreshCap] = useState(50);
  const [grayCap, setGrayCap] = useState(40);
  const [blackCap, setBlackCap] = useState(30);
  const [tirePsi, setTirePsi] = useState(65);
  const [hitchLbs, setHitchLbs] = useState(600);
  const [cargoLbs, setCargoLbs] = useState(1500);

  const activeTrailer = trailers.find(t => t.id === activeId) || trailers[0];

  const handleStartAdd = () => {
    setName('');
    setModel('');
    setYear(new Date().getFullYear());
    setFreshCap(45);
    setGrayCap(35);
    setBlackCap(30);
    setTirePsi(65);
    setHitchLbs(550);
    setCargoLbs(1400);
    setIsAdding(true);
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    if (!activeTrailer) return;
    setName(activeTrailer.name);
    setModel(activeTrailer.model);
    setYear(activeTrailer.year);
    setFreshCap(activeTrailer.specs.freshWaterCapacityGallons);
    setGrayCap(activeTrailer.specs.grayWaterCapacityGallons);
    setBlackCap(activeTrailer.specs.blackWaterCapacityGallons);
    setTirePsi(activeTrailer.specs.recommendedTirePressurePsi);
    setHitchLbs(activeTrailer.specs.hitchWeightLbs);
    setCargoLbs(activeTrailer.specs.cargoCapacityLbs);
    setIsEditing(true);
    setIsAdding(false);
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newId = `trailer-${Date.now()}`;
    const newProfile: TrailerProfile = {
      id: newId,
      name: name.trim(),
      model: model.trim() || 'Generic Travel Trailer',
      year: year,
      specs: {
        freshWaterCapacityGallons: freshCap,
        grayWaterCapacityGallons: grayCap,
        blackWaterCapacityGallons: blackCap,
        recommendedTirePressurePsi: tirePsi,
        hitchWeightLbs: hitchLbs,
        cargoCapacityLbs: cargoLbs
      },
      status: {
        freshWaterLevelPercent: 50,
        grayWaterLevelPercent: 0,
        blackWaterLevelPercent: 0,
        batteryVoltage: 12.6,
        tirePressurePsiFrontLeft: tirePsi,
        tirePressurePsiFrontRight: tirePsi,
        tirePressurePsiRearLeft: tirePsi,
        tirePressurePsiRearRight: tirePsi,
      }
    };

    onAddTrailer(newProfile);
    setIsAdding(false);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !activeTrailer) return;

    const updatedProfile: TrailerProfile = {
      ...activeTrailer,
      name: name.trim(),
      model: model.trim(),
      year: year,
      specs: {
        freshWaterCapacityGallons: freshCap,
        grayWaterCapacityGallons: grayCap,
        blackWaterCapacityGallons: blackCap,
        recommendedTirePressurePsi: tirePsi,
        hitchWeightLbs: hitchLbs,
        cargoCapacityLbs: cargoLbs
      }
    };

    onEditTrailer(updatedProfile);
    setIsEditing(false);
  };

  return (
    <div id="profiles-manager-tab" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-800 dark:text-emerald-50">Trailer Profiles Management</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Configure specifications and select the active towable rig.</p>
        </div>
        <button
          onClick={handleStartAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-xl shadow-xs text-sm transition-colors text-center cursor-pointer touch-target-height justify-center"
        >
          <Plus className="w-4 h-4" />
          Add Trailer Profile
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Lister */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="font-sans font-semibold text-xs text-slate-400 uppercase tracking-widest">Available Rigs</h3>
          <div className="space-y-3">
            {trailers.map((t) => {
              const isActive = t.id === activeId;
              return (
                <div
                  key={t.id}
                  onClick={() => onSwitchActive(t.id)}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all duration-200 relative group flex items-start gap-3.5 ${
                    isActive
                      ? 'bg-emerald-50/50 dark:bg-[#1a2e1d] border-emerald-500/70 dark:border-emerald-700'
                      : 'bg-white dark:bg-[#1c221c] border-slate-100 dark:border-emerald-950/20 hover:border-slate-300 dark:hover:border-emerald-800/40'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl transition-colors ${
                    isActive ? 'bg-emerald-600 text-white' : 'bg-slate-50 dark:bg-emerald-950/40 text-slate-400 group-hover:text-slate-500'
                  }`}>
                    <User className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 dark:text-emerald-100 truncate text-[15px]">{t.name}</span>
                      {isActive && (
                        <span className="text-[10px] font-bold text-center uppercase tracking-wide px-2 py-0.5 bg-emerald-600 text-white rounded-full">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{t.year} {t.model}</p>
                    <div className="flex gap-3 mt-1.5 font-mono text-[10px] text-slate-400 font-semibold">
                      <span>{t.specs.freshWaterCapacityGallons} Gal H2O</span>
                      <span>•</span>
                      <span>{t.specs.cargoCapacityLbs} Lbs Max</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Viewer or Editor Area */}
        <div className="lg:col-span-2">
          {(!isAdding && !isEditing) && activeTrailer && (
            <div className="bg-white dark:bg-[#1c221c] rounded-2xl border border-slate-100 dark:border-emerald-950/30 p-6 space-y-6">
              <div className="flex justify-between items-start border-b border-slate-100 dark:border-emerald-950/20 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-emerald-100">{activeTrailer.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{activeTrailer.year} {activeTrailer.model}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleStartEdit}
                    className="p-2 text-slate-600 hover:text-emerald-700 bg-slate-50 hover:bg-slate-100 dark:text-slate-300 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/40 border border-slate-200 dark:border-emerald-900/25 rounded-xl cursor-pointer transition-colors"
                    title="Edit trailer specifications"
                  >
                    <FileEdit className="w-5 h-5" />
                  </button>
                  {trailers.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`Are you absolutely sure you want to remove the profile "${activeTrailer.name}" and delete all linked lists of inventory, checklists and tasks?`)) {
                          onDeleteTrailer(activeTrailer.id);
                        }
                      }}
                      className="p-2 text-rose-600 hover:text-white hover:bg-rose-600 bg-rose-50 dark:bg-rose-950/10 dark:hover:bg-rose-600 border border-rose-200 dark:border-rose-900/20 rounded-xl cursor-pointer transition-colors"
                      title="Delete profile"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Specs detailed overview */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Trailer Configuration details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-emerald-950/10 border border-slate-100 dark:border-emerald-950/20 rounded-xl flex flex-col justify-between">
                    <span className="text-xs font-semibold text-slate-400">Model Name & Year</span>
                    <span className="font-semibold text-slate-700 dark:text-emerald-100 text-sm mt-1">{activeTrailer.year}</span>
                    <span className="text-xs text-slate-500 mt-0.5">{activeTrailer.model}</span>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-emerald-950/10 border border-slate-100 dark:border-emerald-950/20 rounded-xl flex flex-col justify-between">
                    <span className="text-xs font-semibold text-slate-400">Fresh Water Tank Capacity</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-emerald-100 text-lg mt-1">{activeTrailer.specs.freshWaterCapacityGallons} Gallons</span>
                    <span className="text-xs text-slate-400 mt-0.5">Potable drinking storage limit</span>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-emerald-950/10 border border-slate-100 dark:border-emerald-950/20 rounded-xl flex flex-col justify-between">
                    <span className="text-xs font-semibold text-slate-400">Gray Water Tank Capacity</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-emerald-100 text-lg mt-1">{activeTrailer.specs.grayWaterCapacityGallons} Gallons</span>
                    <span className="text-xs text-slate-400 mt-0.5 font-medium">Sinks and shower drain storage</span>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-emerald-950/10 border border-slate-100 dark:border-emerald-950/20 rounded-xl flex flex-col justify-between">
                    <span className="text-xs font-semibold text-slate-400">Black Water Tank Capacity</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-emerald-100 text-lg mt-1">{activeTrailer.specs.blackWaterCapacityGallons} Gallons</span>
                    <span className="text-xs text-slate-400 mt-0.5 font-medium">Marine toilet holding storage</span>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-emerald-950/10 border border-slate-100 dark:border-emerald-950/20 rounded-xl flex flex-col justify-between">
                    <span className="text-xs font-semibold text-slate-400">Recommended Lug Torque & Tire pressure</span>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300 text-lg mt-1">{activeTrailer.specs.recommendedTirePressurePsi} PSI Cold</span>
                    <span className="text-xs text-slate-400 mt-0.5">Required cold pressure safety level</span>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-emerald-950/10 border border-slate-100 dark:border-emerald-950/20 rounded-xl flex flex-col justify-between">
                    <span className="text-xs font-semibold text-slate-400">Hitch Latch Weight (Tongue)</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-emerald-100 text-lg mt-1">{activeTrailer.specs.hitchWeightLbs} Lbs</span>
                    <span className="text-xs text-slate-400 mt-0.5">Downward hitch force on tow vehicle towbar</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-200/40 dark:border-emerald-900/20 rounded-xl flex items-start gap-2 text-xs text-emerald-800 dark:text-emerald-400 leading-relaxed font-sans mt-2">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                  <div>
                    <strong>Pro-Tip for Multi-User Teams:</strong> Selecting this rig instantly switches the inventory sheets, scheduled maintenance tasks, and checklists to match. All edits carry over instantly and are securely saved in offline localStorage.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Create or Edit */}
          {(isAdding || isEditing) && (
            <form onSubmit={isAdding ? handleSubmitAdd : handleSubmitEdit} className="bg-white dark:bg-[#1c221c] rounded-2xl border border-slate-100 dark:border-emerald-950/30 p-6 space-y-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-emerald-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                {isAdding ? 'Configure New Trailer Profile' : `Modify Specifications for "${name}"`}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Custom Friendly Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. My Lakeside Escape"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-hidden text-sm dark:bg-[#141814] dark:border-emerald-900/60 dark:text-emerald-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Model Year</label>
                  <input
                    type="number"
                    required
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    min={1950}
                    max={new Date().getFullYear() + 2}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-hidden text-sm dark:bg-[#141814] dark:border-emerald-900/60 dark:text-emerald-50"
                  />
                </div>

                <div className="sm:col-span-3 space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Manufacturer & Model Specifications</label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. Airstream Flying Cloud 23FB"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:outline-hidden text-sm dark:bg-[#141814] dark:border-emerald-900/60 dark:text-emerald-50"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-emerald-950/20 my-4" />

              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Tank Capacities & Weights</h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Fresh Water (Gals)</label>
                  <input
                    type="number"
                    min="5"
                    max="150"
                    value={freshCap}
                    onChange={(e) => setFreshCap(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-hidden text-sm dark:bg-[#141814] dark:border-emerald-900/60 dark:text-emerald-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Gray Waste (Gals)</label>
                  <input
                    type="number"
                    min="0"
                    max="150"
                    value={grayCap}
                    onChange={(e) => setGrayCap(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-hidden text-sm dark:bg-[#141814] dark:border-emerald-900/60 dark:text-emerald-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Black Waste (Gals)</label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={blackCap}
                    onChange={(e) => setBlackCap(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-hidden text-sm dark:bg-[#141814] dark:border-emerald-900/60 dark:text-emerald-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Recommended PSI</label>
                  <input
                    type="number"
                    min="30"
                    max="120"
                    value={tirePsi}
                    onChange={(e) => setTirePsi(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-hidden text-sm dark:bg-[#141814] dark:border-emerald-900/60 dark:text-emerald-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Hitch Load (Lbs)</label>
                  <input
                    type="number"
                    min="100"
                    max="3000"
                    value={hitchLbs}
                    onChange={(e) => setHitchLbs(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-hidden text-sm dark:bg-[#141814] dark:border-emerald-900/60 dark:text-emerald-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Cargo Limit (Lbs)</label>
                  <input
                    type="number"
                    min="200"
                    max="10000"
                    value={cargoLbs}
                    onChange={(e) => setCargoLbs(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-hidden text-sm dark:bg-[#141814] dark:border-emerald-900/60 dark:text-emerald-50"
                  />
                </div>
              </div>

              {isAdding && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 rounded-xl text-xs space-y-1">
                  <strong>✨ AI Trailer Booster Activated:</strong>
                  <p>Registering this trailer will automatically generate 3 detailed operational checklists, 5 standard storage bins, and 6 recurring maintenance intervals based on trailer specifications.</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl dark:border-emerald-900/40 dark:text-slate-300 dark:hover:bg-emerald-950/20 text-sm cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-xl text-sm cursor-pointer transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Save Trailer Profile
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
