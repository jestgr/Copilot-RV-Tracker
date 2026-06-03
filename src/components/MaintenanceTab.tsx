/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MaintenanceTask, MaintenanceLogEntry } from '../types';
import { 
  Wrench, 
  CheckCircle, 
  Calendar, 
  Plus, 
  Clock, 
  History, 
  DollarSign, 
  AlertTriangle, 
  CheckCheck,
  Tag,
  PenTool,
  Trash2
} from 'lucide-react';

interface MaintenanceTabProps {
  tasks: MaintenanceTask[];
  logs: MaintenanceLogEntry[];
  trailerId: string;
  onAddTask: (newTask: MaintenanceTask) => void;
  onDeleteTask: (id: string) => void;
  onLogCompleted: (userId: string, taskId: string, log: Omit<MaintenanceLogEntry, 'id' | 'trailerId' | 'taskId' | 'taskTitle'>) => void;
}

export const MaintenanceTab: React.FC<MaintenanceTabProps> = ({
  tasks,
  logs,
  trailerId,
  onAddTask,
  onDeleteTask,
  onLogCompleted,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  
  // Create New Task Form State
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState<MaintenanceTask['category']>('Safety');
  const [taskMonths, setTaskMonths] = useState(6);
  const [taskMiles, setTaskMiles] = useState(0);
  const [taskNotes, setTaskNotes] = useState('');

  // Complete Log Form state (Active Completion Overlay)
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [logNotes, setLogNotes] = useState('');
  const [logMileage, setLogMileage] = useState(0);
  const [logCost, setLogCost] = useState(0);
  const [logBy, setLogBy] = useState('Owner');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);

  const activeCompletingTask = tasks.find(t => t.id === completingTaskId);

  // Filter Tasks
  const categories = ['All', 'Safety', 'Chassis', 'Plumbing', 'Electrical', 'Exterior', 'Interior'];
  
  const getDueStatus = (task: MaintenanceTask) => {
    if (!task.dueDate) return 'OK';
    const dueTime = new Date(task.dueDate).getTime();
    const nowTime = new Date().getTime();
    const diffDays = Math.ceil((dueTime - nowTime) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'DUE_NOW';
    if (diffDays <= 30) return 'UPCOMING';
    return 'OK';
  };

  const filteredTasks = tasks.filter(task => {
    if (task.trailerId !== trailerId) return false;
    if (filterCategory !== 'All' && task.category !== filterCategory) return false;
    
    if (filterStatus === 'Due Now') {
      return getDueStatus(task) === 'DUE_NOW';
    }
    if (filterStatus === 'Upcoming') {
      return getDueStatus(task) === 'UPCOMING' || getDueStatus(task) === 'DUE_NOW';
    }
    
    return true;
  });

  const getDueBadgeStyle = (status: string, dateStr: string) => {
    if (status === 'DUE_NOW') {
      return 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/20 dark:border-rose-900/40 animate-pulse';
    }
    if (status === 'UPCOMING') {
      return 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/20 dark:border-amber-900/40';
    }
    
    // Normal date format readable
    return 'text-slate-500 bg-slate-50 border-slate-200 dark:text-emerald-400 dark:bg-emerald-950/10 dark:border-emerald-950/30';
  };

  const formattedDate = (dString: string) => {
    if (!dString) return 'Not recorded';
    try {
      const d = new Date(dString);
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dString;
    }
  };

  const handleSubmitAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    // Due date calculation
    const d = new Date();
    d.setMonth(d.getMonth() + taskMonths);

    const newTask: MaintenanceTask = {
      id: `task-${Date.now()}`,
      trailerId,
      title: taskTitle.trim(),
      category: taskCategory,
      status: 'pending',
      intervalMonths: taskMonths,
      intervalMiles: taskMiles,
      lastCompletedDate: '',
      dueDate: d.toISOString().split('T')[0],
      dueMiles: taskMiles,
      notes: taskNotes.trim()
    };

    onAddTask(newTask);
    setIsAddingTask(false);
    setTaskTitle('');
    setTaskNotes('');
  };

  const handleOpenCompleteForm = (taskId: string) => {
    setCompletingTaskId(taskId);
    setLogNotes('');
    setLogMileage(0);
    setLogCost(0);
    setLogBy('Owner');
    setLogDate(new Date().toISOString().split('T')[0]);
  };

  const handleConfirmCompletion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingTaskId) return;

    onLogCompleted('user-1', completingTaskId, {
      completedDate: logDate,
      mileage: logMileage,
      performedBy: logBy,
      notes: logNotes.trim(),
      invoiceCost: logCost,
    });

    setCompletingTaskId(null);
  };

  return (
    <div id="maintenance-tab-container" className="space-y-6">
      
      {/* Top Banner and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-800 dark:text-emerald-50">Maintenance & Log Checks</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Keep your trailer roadworthy by tracking routine checklists and services.</p>
        </div>
        {!isAddingTask && !completingTaskId && (
          <button
            onClick={() => setIsAddingTask(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-xl shadow-xs text-sm transition-colors cursor-pointer touch-target-height justify-center"
          >
            <Plus className="w-4 h-4" />
            Add Custom Task
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Scheduled Tasks Ledger */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Controls Bar */}
          <div className="bg-white dark:bg-[#1c221c] p-4 rounded-xl border border-slate-100 dark:border-emerald-950/20 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.slice(0, 5).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    filterCategory === cat
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-slate-50 dark:bg-emerald-950/20 text-slate-600 border-slate-150 hover:bg-slate-100 dark:text-slate-300 dark:border-emerald-900/30'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex gap-2 text-xs font-semibold">
              <button
                onClick={() => setFilterStatus('All')}
                className={`px-2.5 py-1.5 rounded-lg border cursor-pointer ${
                  filterStatus === 'All'
                    ? 'bg-slate-800 dark:bg-emerald-900 text-white'
                    : 'bg-white dark:bg-[#141814] text-slate-500 border-slate-200 dark:border-emerald-900/30'
                }`}
              >
                All List
              </button>
              <button
                onClick={() => setFilterStatus('Due Now')}
                className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1 cursor-pointer ${
                  filterStatus === 'Due Now'
                    ? 'bg-rose-600 text-white'
                    : 'bg-white dark:bg-[#141814] text-rose-600 border-rose-200 dark:border-rose-950'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Due Now
              </button>
            </div>
          </div>

          {/* New Task Entry Form */}
          {isAddingTask && (
            <form onSubmit={handleSubmitAddTask} className="bg-white dark:bg-[#1c221c] p-5 rounded-2xl border border-slate-150 dark:border-emerald-700/40 space-y-4">
              <h3 className="font-bold font-sans text-slate-800 dark:text-emerald-50">Create Custom Maintenance Step</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Service/Task Title</label>
                  <input
                    type="text"
                    required
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="e.g. Inspect fire extinguisher & LP alarm dates"
                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-500 dark:bg-[#141814] dark:border-emerald-950 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Operating Area/Category</label>
                  <select
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value as any)}
                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm dark:bg-[#141814] dark:border-emerald-950 dark:text-slate-100 focus:outline-hidden focus:border-emerald-500"
                  >
                    <option value="Safety">Safety Check</option>
                    <option value="Chassis">Undercarriage / Chassis</option>
                    <option value="Plumbing">Water / Plumbing</option>
                    <option value="Electrical">Power / Electrical</option>
                    <option value="Exterior">Exterior Structure</option>
                    <option value="Interior">Interior Cabinetry</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase">Interval (Months)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="36"
                      value={taskMonths}
                      onChange={(e) => setTaskMonths(parseInt(e.target.value) || 0)}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm dark:bg-[#141814] dark:border-emerald-950 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase">Interval (Miles)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="50000"
                      value={taskMiles}
                      onChange={(e) => setTaskMiles(parseInt(e.target.value) || 0)}
                      className="w-full mt-1 px-3 py-1.5 border border-slate-200 rounded-xl text-sm dark:bg-[#141814] dark:border-emerald-950 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Performance Procedures / Notes</label>
                  <textarea
                    value={taskNotes}
                    onChange={(e) => setTaskNotes(e.target.value)}
                    placeholder="Enter manual procedure steps, recommended tools or grease specifications..."
                    rows={2}
                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-500 dark:bg-[#141814] dark:border-emerald-950 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 text-sm">
                <button
                  type="button"
                  onClick={() => setIsAddingTask(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg dark:border-emerald-900/40 dark:text-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors font-semibold cursor-pointer"
                >
                  Create Schedule
                </button>
              </div>
            </form>
          )}

          {/* Completing Task Inline Log Entry Modal */}
          {completingTaskId && activeCompletingTask && (
            <form onSubmit={handleConfirmCompletion} className="bg-[#fbfcfa] dark:bg-[#1e261e] p-5 rounded-2xl border-2 border-emerald-600/60 shadow-lg space-y-4">
              <div className="flex gap-2.5 items-center pb-2 border-b border-slate-150 dark:border-emerald-900/35">
                <PenTool className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-bounce" />
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-emerald-50 font-sans">Complete Service: {activeCompletingTask.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-emerald-300/60">Log standard specs to save in trailer historical ledger.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Service Completed On</label>
                  <input
                    type="date"
                    required
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="w-full mt-1 p-2 bg-white dark:bg-[#141814] border border-slate-200 dark:border-emerald-900/70 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Current Trailer Hub Mileage</label>
                  <input
                    type="number"
                    min="0"
                    value={logMileage}
                    onChange={(e) => setLogMileage(parseInt(e.target.value) || 0)}
                    className="w-full mt-1 p-2 bg-white dark:bg-[#141814] border border-slate-200 dark:border-emerald-900/70 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Invoice Cost ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={logCost}
                    onChange={(e) => setLogCost(parseInt(e.target.value) || 0)}
                    className="w-full mt-1 p-2 bg-white dark:bg-[#141814] border border-slate-200 dark:border-emerald-900/70 rounded-lg text-xs font-mono"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Detailed Service Entries / Technician Report</label>
                  <textarea
                    required
                    placeholder="Identify findings, replacement material serials, pressures adjusted, brand lubes used, etc."
                    value={logNotes}
                    onChange={(e) => setLogNotes(e.target.value)}
                    rows={3}
                    className="w-full mt-1 p-2 bg-white dark:bg-[#141814] border border-slate-200 dark:border-emerald-900/70 rounded-lg text-xs font-sans focus:outline-hidden focus:border-emerald-600"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Work Performed By</label>
                  <div className="flex gap-2 mt-1">
                    {['Owner', 'Mobile RV Tech', 'OEM Dealership Service Shop'].map((who) => (
                      <button
                        key={who}
                        type="button"
                        onClick={() => setLogBy(who)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md border cursor-pointer ${
                          logBy === who
                            ? 'bg-emerald-700 text-white border-emerald-700'
                            : 'bg-white dark:bg-[#141814] text-slate-600 border-slate-200 dark:text-slate-300 dark:border-emerald-900/45'
                        }`}
                      >
                        {who}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setCompletingTaskId(null)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 dark:border-emerald-900/40 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold cursor-pointer hover:shadow-md cursor-pointer"
                >
                  Log Work Entry
                </button>
              </div>
            </form>
          )}

          {/* Cards List rendering */}
          {filteredTasks.length === 0 ? (
            <div className="p-8 bg-white dark:bg-[#1c221c] border border-slate-100 dark:border-emerald-950/20 text-center rounded-2xl">
              <CheckCircle className="w-10 h-10 text-emerald-600/40 mx-auto mb-2" />
              <p className="text-slate-500 dark:text-slate-400 font-sans font-medium text-sm">No scheduled maintenance tasks matched this filter.</p>
              <button 
                onClick={() => { setFilterCategory('All'); setFilterStatus('All'); }}
                className="text-xs text-emerald-600 font-semibold underline mt-1 cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredTasks.map((task) => {
                const statusStr = getDueStatus(task);
                return (
                  <div
                    key={task.id}
                    className="p-4 bg-white dark:bg-[#1c221c] border border-slate-100 dark:border-emerald-950/30 rounded-2xl flex flex-col sm:flex-row sm:items-start justify-between gap-4 shadow-2xs hover:border-slate-200 dark:hover:border-emerald-800/20 transition-all font-sans relative group"
                  >
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      <div className="p-2.5 bg-slate-50 dark:bg-emerald-950/40 text-slate-500 dark:text-emerald-400 rounded-xl shrink-0">
                        <Wrench className="w-5 h-5" />
                      </div>
                      
                      <div className="space-y-1 min-w-0 pr-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-semibold text-slate-800 dark:text-emerald-100 text-[15px] leading-tight break-words">{task.title}</h4>
                          <span className="text-[9px] font-extrabold uppercase bg-slate-100 dark:bg-emerald-950/30 text-slate-500 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-slate-200/40 dark:border-emerald-900/20">
                            {task.category}
                          </span>
                        </div>

                        {task.notes && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal line-clamp-2 md:line-clamp-none">
                            {task.notes}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1.5 text-[11px] font-mono font-medium text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Interval: {task.intervalMonths > 0 ? `${task.intervalMonths} Mon` : ''} 
                            {task.intervalMonths && task.intervalMiles ? ' / ' : ''}
                            {task.intervalMiles > 0 ? `${task.intervalMiles} Mi` : ''}
                          </span>
                          {task.lastCompletedDate && (
                            <span className="flex items-center gap-1 text-emerald-600/75 dark:text-emerald-400/80">
                              <CheckCheck className="w-3.5 h-3.5" />
                              Last: {formattedDate(task.lastCompletedDate)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-end shrink-0 justify-between sm:justify-start gap-2 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-emerald-950/20">
                      <div className={`px-2.5 py-1 text-2xs font-extrabold font-mono uppercase tracking-wide border rounded-full text-center ${getDueBadgeStyle(statusStr, task.dueDate)}`}>
                        {statusStr === 'DUE_NOW' ? '⚠️ DUE NOW' : statusStr === 'UPCOMING' ? '🕒 UPCOMING' : `📅 Due ${formattedDate(task.dueDate)}`}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenCompleteForm(task.id)}
                          className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl flex items-center gap-1 transition-colors cursor-pointer touch-target-height inline-flex justify-center"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          Complete
                        </button>
                        {/* Custom non-predefined task deletion */}
                        {!task.id.startsWith(`${trailerId}-maint-`) && (
                          <button
                            onClick={() => {
                              if (confirm(`Remove scheduled maintenance task "${task.title}"?`)) {
                                onDeleteTask(task.id);
                              }
                            }}
                            className="p-1 px-2 text-rose-600 bg-rose-50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-950/50 rounded-xl hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Historical Service Logs Ledger */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center gap-2">
            <History className="w-4.5 h-4.5 text-emerald-700 dark:text-emerald-400" />
            <h3 className="font-sans font-bold text-xs uppercase tracking-widest text-slate-400">Past Service Logs</h3>
          </div>

          <div className="bg-white dark:bg-[#1c221c] border border-slate-100 dark:border-emerald-950/30 rounded-2xl p-4 space-y-4">
            {logs.filter(l => l.trailerId === trailerId).length === 0 ? (
              <div className="p-8 text-center text-slate-400 border border-dashed border-slate-100 dark:border-emerald-950/10 rounded-xl font-sans">
                <p className="text-sm">No service logs on record yet.</p>
                <p className="text-2xs text-slate-400 mt-1">Select a task as Complete to generate its first ledger history entries.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {logs
                  .filter(l => l.trailerId === trailerId)
                  .map((log) => {
                    return (
                      <div
                        key={log.id}
                        className="p-3 bg-slate-50/50 dark:bg-emerald-950/10 rounded-xl border border-slate-100/60 dark:border-emerald-950/20 font-sans space-y-2 relative"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-slate-800 dark:text-emerald-100 text-xs lines-clamp-1">{log.taskTitle}</h4>
                            <span className="text-[10px] font-mono text-slate-400">{formattedDate(log.completedDate)}</span>
                          </div>
                          {log.invoiceCost > 0 && (
                            <div className="flex items-center font-mono font-bold text-xs text-emerald-700 dark:text-emerald-400">
                              <DollarSign className="w-3 h-3 shrink-0" />
                              {log.invoiceCost}
                            </div>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-600 dark:text-slate-300 italic pl-2 border-l-2 border-slate-300 dark:border-emerald-800">
                          "{log.notes}"
                        </p>

                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono font-medium">
                          <span>By: {log.performedBy}</span>
                          {log.mileage > 0 && (
                            <span>Mileage: {log.mileage} mi</span>
                          )}
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
