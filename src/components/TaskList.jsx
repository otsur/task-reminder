import React from 'react';
import { CheckCircle2, Trash2, ChevronRight } from 'lucide-react';
import { formatTime12h, timeToMinutes } from '../utils/taskHelpers';

export default function TaskList({
  tasks,
  selectedDate,
  todayStr,
  currentMinutes,
  onToggleComplete,
  onDeleteTask,
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Schedule for {selectedDate === todayStr ? 'Today' : selectedDate} ({tasks.length})
        </h3>
        <span className="text-xs text-slate-500">Sorted by start time • Saved locally</span>
      </div>

      {tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-8 text-center">
          <p className="text-sm text-slate-400">
            No tasks scheduled for {selectedDate}. Click{' '}
            <strong className="text-slate-200">Add Task</strong> to create one.
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {tasks.map((task) => {
            const startMin = timeToMinutes(task.startTime);
            const endMin = timeToMinutes(task.endTime);
            const isToday = task.date === todayStr;
            const isActive = isToday && currentMinutes >= startMin && currentMinutes < endMin;
            const isPast = isToday && currentMinutes >= endMin;

            return (
              <li
                key={task.id}
                className={`flex items-center justify-between gap-4 p-4 rounded-2xl border transition ${
                  isActive
                    ? 'bg-indigo-600/15 border-indigo-500/50 shadow-md shadow-indigo-950/50'
                    : 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <button
                    onClick={() => onToggleComplete(task.id)}
                    className={`shrink-0 rounded-full p-1 transition ${
                      task.completed ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                    }`}
                    title="Toggle completed"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`font-semibold text-base truncate ${
                          task.completed ? 'line-through text-slate-500' : 'text-white'
                        }`}
                      >
                        {task.name}
                      </span>
                      {isActive && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Now
                        </span>
                      )}
                      {!isActive && isPast && !task.completed && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-slate-800 text-slate-400">
                          Ended
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <span>{formatTime12h(task.startTime)}</span>
                      <ChevronRight className="w-3 h-3 text-slate-600" />
                      <span>{formatTime12h(task.endTime)}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition shrink-0"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
