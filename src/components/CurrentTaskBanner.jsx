import React from 'react';
import { Play } from 'lucide-react';
import { formatTime12h } from '../utils/taskHelpers';

export default function CurrentTaskBanner({
  currentTask,
  nextTask,
  progressPercent,
  remainingLabel,
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600/25 via-slate-900 to-slate-900 border border-indigo-500/30 p-6 sm:p-8 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/20">
          <span
            className={`w-2 h-2 rounded-full ${
              currentTask ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
            }`}
          />
          {currentTask ? 'Current Active Task' : 'Current Status'}
        </span>
        {currentTask && (
          <span className="text-xs font-mono text-indigo-200 bg-slate-950/60 px-2.5 py-1 rounded-lg">
            {remainingLabel}
          </span>
        )}
      </div>

      {currentTask ? (
        <div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white break-words">
            {currentTask.name}
          </h2>
          <p className="text-base sm:text-lg text-indigo-200 mt-2 font-medium">
            {formatTime12h(currentTask.startTime)} – {formatTime12h(currentTask.endTime)}
          </p>

          <div className="mt-5">
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>Progress</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-200">
            No active task right now
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-2">
            {nextTask ? (
              <span className="inline-flex items-center gap-1.5 text-indigo-300">
                <Play className="w-4 h-4" />
                Up next: <strong className="text-white">{nextTask.name}</strong> at{' '}
                {formatTime12h(nextTask.startTime)}
              </span>
            ) : (
              'Add a task below to schedule your day.'
            )}
          </p>
        </div>
      )}
    </section>
  );
}
