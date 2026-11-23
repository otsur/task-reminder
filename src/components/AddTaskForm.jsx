import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function AddTaskForm({
  selectedDate,
  taskName,
  setTaskName,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  formError,
  onSubmit,
  onCancel,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4 shadow-lg"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">Schedule a New Task</h3>
        <span className="text-xs text-slate-400">Date: {selectedDate}</span>
      </div>

      {formError && (
        <div className="flex items-center gap-2 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {formError}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5">
          Task Name
        </label>
        <input
          type="text"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          placeholder="e.g., Morning Standup, Study Algorithms, Gym"
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Start Time
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            End Time
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition"
        >
          Save Task
        </button>
      </div>
    </form>
  );
}
