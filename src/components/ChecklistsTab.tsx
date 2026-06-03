/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Checklist, ChecklistStep, ChecklistSubStep } from '../types';
import { 
  ClipboardList, 
  Sparkles, 
  Play, 
  Check, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  PenTool, 
  Loader2, 
  AlertCircle,
  FileText,
  BookmarkCheck,
  Video
} from 'lucide-react';

interface ChecklistsTabProps {
  checklists: Checklist[];
  trailerId: string;
  onAddChecklist: (newChk: Checklist) => void;
  onDeleteChecklist: (id: string) => void;
  onUpdateChecklist: (updatedChk: Checklist) => void;
}

export const ChecklistsTab: React.FC<ChecklistsTabProps> = ({
  checklists,
  trailerId,
  onAddChecklist,
  onDeleteChecklist,
  onUpdateChecklist,
}) => {
  const [activeChecklistId, setActiveChecklistId] = useState<string | null>(null);
  
  // Collapsed steps manager tracking state (step-id -> boolean)
  const [collapsedSteps, setCollapsedSteps] = useState<Record<string, boolean>>({});

  const [isCreatingChecklist, setIsCreatingChecklist] = useState(false);
  const [creationMethod, setCreationMethod] = useState<'manual' | 'ai'>('ai');

  // Manual Checklist Form state
  const [manualTitle, setManualTitle] = useState('');
  const [manualCategory, setManualCategory] = useState<Checklist['category']>('Custom');
  const [manualNotes, setManualNotes] = useState('');

  // AI Bulk Parse Paste State
  const [pastedText, setPastedText] = useState('');
  const [isLlmParsing, setIsLlmParsing] = useState(false);
  const [aiError, setAiError] = useState('');
  
  // AI Preview State (the structured result from server to review before saving)
  const [aiPreview, setAiPreview] = useState<{ name: string; steps: Array<{ title: string; notes: string; substeps: Array<{ title: string }> }> } | null>(null);

  const activeChecklist = checklists.find(c => c.id === activeChecklistId && c.trailerId === trailerId) || 
                          checklists.filter(c => c.trailerId === trailerId)[0];

  // Auto-set the active checklist if null on loaded check
  if (!activeChecklistId && checklists.filter(c => c.trailerId === trailerId).length > 0) {
    const list = checklists.filter(c => c.trailerId === trailerId)[0];
    if (list) setActiveChecklistId(list.id);
  }

  const toggleStepCollapse = (stepId: string) => {
    setCollapsedSteps(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  const handleSubstepToggle = (stepId: string, substepId: string) => {
    if (!activeChecklist) return;

    const updatedSteps = activeChecklist.steps.map((step) => {
      if (step.id !== stepId) return step;

      const updatedSubsteps = step.substeps.map((sub) => {
        if (sub.id !== substepId) return sub;
        return { ...sub, isCompleted: !sub.isCompleted };
      });

      // Recalculate if all substeps are checked to mark the parent step completed as well
      const allDone = updatedSubsteps.every(s => s.isCompleted);
      
      return {
        ...step,
        isCompleted: allDone,
        substeps: updatedSubsteps
      };
    });

    onUpdateChecklist({
      ...activeChecklist,
      steps: updatedSteps
    });
  };

  const handleStepCompletionToggle = (stepId: string) => {
    if (!activeChecklist) return;

    const updatedSteps = activeChecklist.steps.map((step) => {
      if (step.id !== stepId) return step;
      const targetState = !step.isCompleted;
      
      // Checking parent step checks or unchecks all children
      const updatedSubsteps = step.substeps.map(sub => ({
        ...sub,
        isCompleted: targetState
      }));

      return {
        ...step,
        isCompleted: targetState,
        substeps: updatedSubsteps
      };
    });

    onUpdateChecklist({
      ...activeChecklist,
      steps: updatedSteps
    });
  };

  const handleResetChecklist = () => {
    if (!activeChecklist) return;
    
    const resetSteps = activeChecklist.steps.map(step => ({
      ...step,
      isCompleted: false,
      substeps: step.substeps.map(sub => ({ ...sub, isCompleted: false }))
    }));

    onUpdateChecklist({
      ...activeChecklist,
      steps: resetSteps
    });
  };

  const calculateProgress = (chk: Checklist) => {
    let totalSubsteps = 0;
    let completedSubsteps = 0;

    chk.steps.forEach((step) => {
      if (step.substeps.length === 0) {
        // Fallback to step itself if no substep children exist
        totalSubsteps += 1;
        if (step.isCompleted) completedSubsteps += 1;
      } else {
        step.substeps.forEach((sub) => {
          totalSubsteps += 1;
          if (sub.isCompleted) completedSubsteps += 1;
        });
      }
    });

    if (totalSubsteps === 0) return 0;
    return Math.round((completedSubsteps / totalSubsteps) * 100);
  };

  // Submit AI parse handler
  const handleAiParse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedText.trim()) return;

    setIsLlmParsing(true);
    setAiError('');
    setAiPreview(null);

    try {
      const response = await fetch('/api/parse-checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: pastedText }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      if (!data || !data.steps) {
        throw new Error('Server returned an empty or invalid checklist structure.');
      }

      setAiPreview(data);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Checklist parse failed. Make sure your server is online and your Gemini API secrets key are active.');
    } finally {
      setIsLlmParsing(false);
    }
  };

  const handleSaveAiPreviewChecklist = () => {
    if (!aiPreview) return;

    // Convert preview objects to the concrete Checklist types with unique identifiers
    const mappedSteps: ChecklistStep[] = aiPreview.steps.map((rawStep, pIndex) => {
      const stepId = `step-ai-${Date.now()}-${pIndex}`;
      return {
        id: stepId,
        title: rawStep.title || `Phase ${pIndex + 1}`,
        isCompleted: false,
        notes: rawStep.notes || '',
        substeps: (rawStep.substeps || []).map((rawSub, sIndex) => ({
          id: `${stepId}-sub-${sIndex}`,
          title: rawSub.title,
          isCompleted: false
        }))
      };
    });

    const newChk: Checklist = {
      id: `chk-ai-${Date.now()}`,
      trailerId,
      name: aiPreview.name || 'AI Generated Checklist',
      category: 'Custom',
      isPredefined: false,
      steps: mappedSteps
    };

    onAddChecklist(newChk);
    setActiveChecklistId(newChk.id);
    setIsCreatingChecklist(false);
    setPastedText('');
    setAiPreview(null);
  };

  const handleSaveManualChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;

    const newChk: Checklist = {
      id: `chk-custom-${Date.now()}`,
      trailerId,
      name: manualTitle.trim(),
      category: manualCategory,
      isPredefined: false,
      notes: manualNotes.trim(),
      steps: [
        {
          id: `step-man-${Date.now()}-1`,
          title: 'Initial General Steps',
          isCompleted: false,
          notes: 'Write adjustments or checks in the edit view.',
          substeps: [
            { id: `sub-man-1-1`, title: 'Verify layout and clearance', isCompleted: false },
            { id: `sub-man-1-2`, title: 'Begin checklist checkoffs', isCompleted: false },
          ]
        }
      ]
    };

    onAddChecklist(newChk);
    setActiveChecklistId(newChk.id);
    setIsCreatingChecklist(false);
    setManualTitle('');
    setManualNotes('');
  };

  const currentProgress = activeChecklist ? calculateProgress(activeChecklist) : 0;

  return (
    <div id="checklists-tab" className="space-y-6">
      
      {/* Tab bar header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-800 dark:text-emerald-50">Interactive Rig Checklists</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Step-by-step procedures to travel, setup camp, or winterize, verified offline-first.</p>
        </div>

        {!isCreatingChecklist && (
          <button
            onClick={() => {
              setIsCreatingChecklist(true);
              setAiPreview(null);
              setAiError('');
            }}
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-sm transition-all shadow-xs cursor-pointer justify-center"
          >
            <Sparkles className="w-4 h-4" />
            Build New Checklist
          </button>
        )}
      </div>

      {isCreatingChecklist ? (
        /* CREATOR WIZARD WRAPPER */
        <div className="bg-white dark:bg-[#1c221c] p-6 rounded-2xl border border-slate-100 dark:border-emerald-950/30 space-y-6 font-sans">
          
          <div className="flex justify-between items-start border-b border-slate-100 dark:border-emerald-950/20 pb-3">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-emerald-100">Checklist Creation Wizard</h3>
              <p className="text-xs text-slate-500">Pick a pipeline method below to save a checklist into your trailer profile.</p>
            </div>
            <button
              onClick={() => setIsCreatingChecklist(false)}
              className="text-xs text-slate-400 hover:text-rose-600 underline cursor-pointer"
            >
              Cancel & Back
            </button>
          </div>

          {/* Creation Mode selector tabs */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCreationMethod('ai')}
              className={`flex-1 py-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                creationMethod === 'ai'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-500 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-700'
                  : 'bg-white dark:bg-[#141814] text-slate-500 border-slate-150 dark:border-[#252c25]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              AI Magic Bulk Parse (Paste Notes)
            </button>
            <button
              type="button"
              onClick={() => setCreationMethod('manual')}
              className={`flex-1 py-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                creationMethod === 'manual'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-500 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-700'
                  : 'bg-white dark:bg-[#141814] text-slate-500 border-slate-150 dark:border-[#252c25]'
              }`}
            >
              <PenTool className="w-4 h-4" />
              Manual Blueprint Form
            </button>
          </div>

          {/* Core Creation Methods */}
          {creationMethod === 'manual' ? (
            <form onSubmit={handleSaveManualChecklist} className="space-y-4 max-w-xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Checklist Title</label>
                  <input
                    type="text"
                    required
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="e.g. My Custom Winter Prep"
                    className="w-full mt-1 px-3 py-2 border border-slate-200 focus:outline-hidden focus:border-emerald-600 rounded-xl text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Category</label>
                  <select
                    value={manualCategory}
                    onChange={(e) => setManualCategory(e.target.value as any)}
                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden"
                  >
                    <option value="Travel">Travel</option>
                    <option value="Set Up">Set Up</option>
                    <option value="Break Down">Break Down</option>
                    <option value="Winterize">Winterization</option>
                    <option value="Dewinterize">Dewinterization</option>
                    <option value="Custom">Custom checklist</option>
                  </select>
                </div>

                <div className="sm:col-span-3 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Overview description / Notes</label>
                  <textarea
                    value={manualNotes}
                    onChange={(e) => setManualNotes(e.target.value)}
                    placeholder="e.g. Specific details regarding plumbing valves or gas levels..."
                    rows={2}
                    className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Create Skeleton Checklist
                </button>
              </div>
            </form>
          ) : (
            /* AI BULK PARSE METHOD */
            <div className="space-y-6">
              
              {!aiPreview ? (
                /* Text Area Input */
                <form onSubmit={handleAiParse} className="space-y-4 max-w-3xl mx-auto">
                  <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-150 dark:border-emerald-900/35 rounded-2xl flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 animate-pulse" />
                    <div className="text-xs text-emerald-800 dark:text-emerald-300 leading-normal">
                      <strong>AI Power-Checklist Builder:</strong> Copy any unstructured text list (e.g., instructions from trailer user guides, campground manuals, email blogs, or forum threads) and paste it below. The built-in Gemini model will decipher and isolate checklist groupings, step phases, and operational checkpoints.
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase">Paste Unstructured Text checklist</label>
                    <textarea
                      required
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      placeholder="e.g. For our camper we first run around the block checking stabilizers. Then make sure slide clearance is empty. Next, do coupler lock, plug 7-way connection, hook up chains crisscrossed. Before towing, secure toilet and lock kitchen overhead pantry..."
                      rows={8}
                      className="w-full mt-1 p-4 border border-slate-200 dark:border-emerald-900/40 rounded-2xl text-xs focus:outline-hidden focus:border-emerald-500 dark:bg-[#141814] dark:text-slate-100"
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="submit"
                      disabled={isLlmParsing || !pastedText.trim()}
                      className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer inline-flex items-center gap-2"
                    >
                      {isLlmParsing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Gemini deciphering steps...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Construct with AI
                        </>
                      )}
                    </button>
                  </div>

                  {aiError && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30 rounded-xl text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 animate-bounce" />
                      <span>{aiError}</span>
                    </div>
                  )}
                </form>
              ) : (
                /* structured Preview Area */
                <div className="max-w-3xl mx-auto space-y-4">
                  <div className="p-3 bg-emerald-100/40 dark:bg-[#252c25] border border-emerald-500/30 rounded-xl text-xs text-slate-700 dark:text-emerald-100 flex items-center justify-between">
                    <span><strong>Review Preview:</strong> Check if steps are structured properly before saving them.</span>
                    <button
                      type="button"
                      onClick={() => setAiPreview(null)}
                      className="text-xs underline text-emerald-800 font-bold dark:text-emerald-300 cursor-pointer"
                    >
                      Re-paste Text
                    </button>
                  </div>

                  {/* Generated Outline */}
                  <div className="border border-slate-150 dark:border-emerald-900/40 rounded-2xl p-5 bg-white dark:bg-[#141814] space-y-4 shadow-xs">
                    <h4 className="font-bold text-slate-800 dark:text-emerald-50 font-sans text-base">Checklist Name: "{aiPreview.name}"</h4>
                    
                    <div className="space-y-4 pt-2">
                      {aiPreview.steps.map((step, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 dark:bg-emerald-950/20 rounded-xl border border-slate-100/75 dark:border-emerald-950/15 space-y-1.5 text-xs text-left">
                          <span className="font-bold text-slate-700 dark:text-emerald-200">Phase {idx + 1}: {step.title}</span>
                          {step.notes && <p className="text-[11px] text-slate-400 italic mb-1">"{step.notes}"</p>}
                          <div className="space-y-1 pl-4">
                            {(step.substeps || []).map((sub, sIdx) => (
                              <div key={sIdx} className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium leading-none">
                                <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span className="truncate">{sub.title}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setAiPreview(null)}
                      className="px-4 py-2 border border-slate-200 text-slate-600 dark:border-emerald-900/40 dark:text-slate-350 rounded-xl text-sm hover:bg-slate-50 cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAiPreviewChecklist}
                      className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold transition-all hover:shadow-md cursor-pointer"
                    >
                      Save to Trailer Profile
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      ) : (
        /* STANDARD RENDER: List Checklists and progress trackers */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* List navigation side-column */}
          <div className="lg:col-span-1 space-y-3.5">
            <h3 className="font-sans font-bold text-xs uppercase text-slate-400 tracking-wider">Select Active List</h3>
            
            <div className="space-y-2">
              {checklists.filter(c => c.trailerId === trailerId).map((chk) => {
                const isActive = activeChecklistId === chk.id;
                const progress = calculateProgress(chk);
                
                return (
                  <button
                    key={chk.id}
                    onClick={() => setActiveChecklistId(chk.id)}
                    className={`w-full p-3.5 rounded-2xl border text-left flex flex-col font-sans transition-all cursor-pointer relative group ${
                      isActive
                        ? 'bg-emerald-50/50 dark:bg-[#1a2d1a] border-emerald-500/70 dark:border-emerald-800'
                        : 'bg-white dark:bg-[#1c221c] text-slate-700 border-slate-100 dark:border-emerald-950/20 hover:border-slate-300 dark:hover:border-emerald-800/40'
                    }`}
                  >
                    <div className="flex justify-between items-start w-full gap-2 text-slate-800 dark:text-slate-100">
                      <span className="font-bold text-sm truncate pr-1 block dark:text-emerald-100">{chk.name}</span>
                      <span className="text-[10px] font-mono font-bold bg-slate-50 dark:bg-[#141814] px-1.5 py-0.5 rounded-full text-slate-500 border border-slate-200/40 shrink-0">
                        {chk.category}
                      </span>
                    </div>

                    <div className="w-full flex items-center gap-2 mt-2 pt-1 border-t border-slate-100/50 dark:border-emerald-950/10">
                      <div className="flex-1 h-1.5 bg-slate-100 dark:bg-emerald-950/60 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${progress === 100 ? 'bg-emerald-600' : 'bg-slate-400'}`} 
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono font-extrabold text-slate-400 shrink-0">{progress}%</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Checklist Step Sheet Main Arena */}
          <div className="lg:col-span-3">
            {activeChecklist ? (
              <div className="bg-white dark:bg-[#1c221c] rounded-3xl border border-slate-100 dark:border-emerald-950/30 p-6 space-y-6">
                
                {/* Header card details */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-emerald-950/20 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold uppercase py-0.5 px-2 text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/40 rounded-md">
                        {activeChecklist.category} Guide
                      </span>
                      {activeChecklist.isPredefined && (
                        <span className="text-[10px] font-mono font-bold px-1.5 text-slate-400 bg-slate-50 dark:bg-[#1a1e1a] rounded-sm">Predefined Blueprint</span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-emerald-100 leading-tight">{activeChecklist.name}</h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleResetChecklist}
                      className="px-3.5 py-2 text-xs font-semibold text-slate-600 bg-slate-50 dark:text-slate-350 dark:bg-[#252c25] hover:bg-slate-100 border border-slate-200 dark:border-emerald-800/10 rounded-xl transition-colors cursor-pointer"
                    >
                      Reset Checks
                    </button>

                    {!activeChecklist.isPredefined && (
                      <button
                        onClick={() => {
                          if (confirm(`Delete the custom checklist "${activeChecklist.name}"? This cannot be undone.`)) {
                            onDeleteChecklist(activeChecklist.id);
                            setActiveChecklistId(null);
                          }
                        }}
                        className="p-2 text-rose-600 hover:text-white hover:bg-rose-650 bg-rose-50 dark:bg-[#2e1d1d] dark:hover:bg-rose-600 rounded-xl transition-colors shrink-0 cursor-pointer"
                        title="Delete checklist blueprint"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress bar banner */}
                <div className="p-4 bg-slate-50 dark:bg-emerald-950/10 border border-slate-150/40 dark:border-emerald-950/15 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 shrink-0 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                      <ClipboardList className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Trailer Checkoff Progression</span>
                      <h4 className="text-slate-800 dark:text-emerald-100 font-bold font-sans text-sm mt-0.5">
                        {currentProgress === 100 ? '✅ All checks satisfied! Safe to roll!' : 'Verify steps in sequence to proceed.'}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-24 sm:w-36 h-2 bg-slate-100 dark:bg-emerald-950/60 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${currentProgress === 100 ? 'bg-emerald-600' : 'bg-emerald-700'}`} 
                        style={{ width: `${currentProgress}%` }}
                      />
                    </div>
                    <span className="text-sm font-mono font-bold font-extrabold text-slate-700 dark:text-emerald-100">{currentProgress}%</span>
                  </div>
                </div>

                {/* Main Steps Render */}
                <div className="space-y-4">
                  {activeChecklist.steps.map((step, idx) => {
                    const isCollapsed = collapsedSteps[step.id];
                    const completedSubsCount = step.substeps.filter(s => s.isCompleted).length;
                    const totalSubsCount = step.substeps.length;
                    
                    return (
                      <div
                        key={step.id}
                        className={`border rounded-2xl overflow-hidden font-sans transition-all ${
                          step.isCompleted 
                            ? 'border-emerald-500/40 dark:border-emerald-900/40 bg-white dark:bg-[#1a1e1a]' 
                            : 'border-slate-150 dark:border-emerald-950/20 bg-white dark:bg-[#1c221c]'
                        }`}
                      >
                        {/* Step Header Block */}
                        <div className="p-4 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-[#141814]/50 hover:bg-slate-50 transition-colors select-none">
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            {/* Checkmark target box (Tap to toggle all) */}
                            <button
                              onClick={() => handleStepCompletionToggle(step.id)}
                              className={`w-5.5 h-5.5 shrink-0 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                                step.isCompleted
                                  ? 'bg-emerald-600 border-emerald-600 text-white'
                                  : 'border-slate-200 hover:border-slate-350 dark:border-emerald-900/40 bg-white dark:bg-[#1a2d1a]'
                              }`}
                              title={step.isCompleted ? 'Uncheck all' : 'Check all'}
                            >
                              {step.isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </button>

                            <div className="min-w-0" onClick={() => toggleStepCollapse(step.id)}>
                              <h4 className={`text-sm font-semibold leading-snug cursor-pointer ${
                                step.isCompleted ? 'text-slate-500 line-through dark:text-emerald-305/70' : 'text-slate-800 dark:text-emerald-50'
                              }`}>
                                {idx + 1}. {step.title}
                              </h4>
                              <p className="text-[11px] text-slate-450 dark:text-slate-400 mt-0.5 line-clamp-1">{step.notes}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            {/* Subparts counter indicator */}
                            {totalSubsCount > 0 && (
                              <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-emerald-950/40 text-slate-500 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                                {completedSubsCount}/{totalSubsCount} Done
                              </span>
                            )}

                            {/* Collapse control toggle */}
                            <button
                              type="button"
                              onClick={() => toggleStepCollapse(step.id)}
                              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                            >
                              {isCollapsed ? <ChevronDown className="w-4.5 h-4.5" /> : <ChevronUp className="w-4.5 h-4.5" />}
                            </button>
                          </div>
                        </div>

                        {/* Collapsible Substep panel */}
                        {!isCollapsed && (
                          <div className="border-t border-slate-100 dark:border-emerald-950/20 p-4 space-y-3.5 bg-white dark:bg-[#1c221c]/30">
                            
                            {/* Inner Step Note Detail */}
                            {step.notes && (
                              <div className="p-3 bg-slate-50/50 dark:bg-[#141814]/30 border border-slate-100 dark:border-emerald-950/10 rounded-xl text-xs text-slate-500 dark:text-slate-400 font-sans italic pr-4 pl-3">
                                <strong>Safety / Performance Procedures:</strong> {step.notes}
                              </div>
                            )}

                            {/* Youtube/Video helper link if any */}
                            {step.videoLink && (
                              <div className="flex items-center gap-2">
                                <a
                                  href={step.videoLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/50 dark:text-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-900/40 px-2.5 py-1.5 rounded-lg hover:underline cursor-pointer"
                                  title="Open learning manual video on external browser"
                                >
                                  <Video className="w-3.5 h-3.5 text-rose-600 shrink-0 select-none animate-pulse" />
                                  Watch Instruction video Guide
                                </a>
                                <span className="text-[10px] text-slate-400 select-none">(Safe external link)</span>
                              </div>
                            )}

                            {/* Substeps Checkboxes Stack */}
                            {step.substeps.length === 0 ? (
                              <div className="p-2 text-center text-[11px] text-slate-400 italic">No individual substeps checklist registered under this phase.</div>
                            ) : (
                              <div className="space-y-2 pl-4 border-l-2 border-slate-100 dark:border-emerald-950/10">
                                {step.substeps.map((sub) => {
                                  return (
                                    <div
                                      key={sub.id}
                                      onClick={() => handleSubstepToggle(step.id, sub.id)}
                                      className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer select-none transition-colors hover:bg-slate-50/70 dark:hover:bg-[#141814]/30`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={sub.isCompleted}
                                        onChange={() => {}} // toggled on container tap
                                        className="mt-0.5 w-4.5 h-4.5 accent-emerald-600 rounded bg-white border-slate-200 cursor-pointer text-white flex-shrink-0"
                                      />
                                      <span className={`text-[13px] font-sans transition-colors leading-snug ${
                                        sub.isCompleted 
                                          ? 'text-slate-400 line-through dark:text-slate-500' 
                                          : 'text-slate-700 dark:text-emerald-100 font-medium'
                                      }`}>
                                        {sub.title}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>
            ) : (
              <div className="p-12 text-center bg-white dark:bg-[#1c221c] border border-slate-100 dark:border-emerald-950/20 rounded-3xl">
                <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-slate-700 dark:text-emerald-100">No Checklists on Record</h4>
                <p className="text-xs text-slate-400 mt-1">Configure or load checklists above to track activities during trailer operation.</p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
