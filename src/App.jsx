import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Clock, Plus, Bell, BellOff, Calendar, Volume2, VolumeX, X } from 'lucide-react';
import CurrentTaskBanner from './components/CurrentTaskBanner';
import AddTaskForm from './components/AddTaskForm';
import TaskList from './components/TaskList';
import {
  getTodayDateString,
  timeToMinutes,
  formatTime12h,
  sortTasksByStartTime,
  loadTasksFromStorage,
  saveTasksToStorage,
  playChimeSound,
} from './utils/taskHelpers';

export default function App() {
  const [tasks, setTasks] = useState(() => loadTasksFromStorage());
  const [selectedDate, setSelectedDate] = useState(() => getTodayDateString());
  const [now, setNow] = useState(() => new Date());

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [formError, setFormError] = useState('');

  const [notifPermission, setNotifPermission] = useState(() =>
    typeof window !== 'undefined' && 'Notification' in window
      ? window.Notification.permission
      : 'unsupported'
  );
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeAlert, setActiveAlert] = useState(null);
  const notifiedTasksRef = useRef(new Set());

  useEffect(() => {
    saveTasksToStorage(tasks);
  }, [tasks]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentSeconds = now.getSeconds();

  const tasksForSelectedDate = useMemo(
    () => sortTasksByStartTime(tasks.filter((t) => t.date === selectedDate)),
    [tasks, selectedDate]
  );

  const todaysTasks = useMemo(
    () => sortTasksByStartTime(tasks.filter((t) => t.date === todayStr)),
    [tasks, todayStr]
  );

  const { currentTask, nextTask, progressPercent, remainingLabel } = useMemo(() => {
    const active = todaysTasks.find(
      (t) => currentMinutes >= timeToMinutes(t.startTime) && currentMinutes < timeToMinutes(t.endTime)
    ) || null;

    const upcoming = todaysTasks.find((t) => timeToMinutes(t.startTime) > currentMinutes) || null;

    let pct = 0;
    let rem = '';
    if (active) {
      const startSec = timeToMinutes(active.startTime) * 60;
      const endSec = timeToMinutes(active.endTime) * 60;
      const nowSec = currentMinutes * 60 + currentSeconds;
      pct = Math.min(100, Math.round(((nowSec - startSec) / Math.max(1, endSec - startSec)) * 100));
      const leftSec = Math.max(0, endSec - nowSec);
      rem = `${Math.floor(leftSec / 60)}m ${String(leftSec % 60).padStart(2, '0')}s left`;
    }

    return { currentTask: active, nextTask: upcoming, progressPercent: pct, remainingLabel: rem };
  }, [todaysTasks, currentMinutes, currentSeconds]);

  useEffect(() => {
    if (!currentTask) return;
    const triggerKey = `${currentTask.id}_${todayStr}_${currentTask.startTime}`;
    if (notifiedTasksRef.current.has(triggerKey)) return;

    notifiedTasksRef.current.add(triggerKey);
    setActiveAlert({
      id: currentTask.id,
      name: currentTask.name,
      timeRange: `${formatTime12h(currentTask.startTime)} – ${formatTime12h(currentTask.endTime)}`,
    });

    if (soundEnabled) playChimeSound();

    if (typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'granted') {
      try {
        new window.Notification(`Task Starting Now: ${currentTask.name}`, {
          body: `${formatTime12h(currentTask.startTime)} – ${formatTime12h(currentTask.endTime)}`,
        });
      } catch {
        // Ignore
      }
    }
  }, [currentTask, todayStr, soundEnabled]);

  useEffect(() => {
    if (!activeAlert) return;
    const t = setTimeout(() => setActiveAlert(null), 8000);
    return () => clearTimeout(t);
  }, [activeAlert]);

  async function handleEnableNotifications() {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    const result = await window.Notification.requestPermission();
    setNotifPermission(result);
  }

  function handleOpenForm() {
    const nextHour = (now.getHours() + 1) % 24;
    setStartTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
    setEndTime(`${String(nextHour).padStart(2, '0')}:00`);
    setTaskName('');
    setFormError('');
    setIsFormOpen(true);
  }

  function handleAddTask(e) {
    e.preventDefault();
    const trimmed = taskName.trim();
    if (!trimmed) return setFormError('Please enter a task name.');
    if (!startTime || !endTime) return setFormError('Please select start and end times.');
    if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
      return setFormError('End time must be later than start time.');
    }

    const newTask = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: trimmed,
      date: selectedDate,
      startTime,
      endTime,
      completed: false,
    };

    setTasks((prev) => sortTasksByStartTime([...prev, newTask]));
    setTaskName('');
    setFormError('');
    setIsFormOpen(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      {activeAlert && (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-full bg-indigo-600 text-white rounded-2xl shadow-2xl border border-indigo-400/40 p-4 flex items-start gap-3 animate-bounce">
          <div className="p-2 bg-white/15 rounded-xl shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-100">Task Starting Now</p>
            <p className="text-base font-bold truncate mt-0.5">{activeAlert.name}</p>
            <p className="text-xs text-indigo-100 mt-0.5">{activeAlert.timeRange}</p>
          </div>
          <button onClick={() => setActiveAlert(null)} className="p-1 rounded-lg hover:bg-white/15">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10 space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Clock className="w-6 h-6 text-indigo-400" />
              Daily Task Reminder
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-sm font-mono text-indigo-300">
              {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <button
              onClick={() => setSoundEnabled((prev) => !prev)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
            <button
              onClick={handleEnableNotifications}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border ${
                notifPermission === 'granted'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-indigo-500/50'
              }`}
            >
              {notifPermission === 'granted' ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
              {notifPermission === 'granted' ? 'Alerts On' : 'Enable Alerts'}
            </button>
          </div>
        </header>

        <CurrentTaskBanner
          currentTask={currentTask}
          nextTask={nextTask}
          progressPercent={progressPercent}
          remainingLabel={remainingLabel}
        />

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            onClick={() => (isFormOpen ? setIsFormOpen(false) : handleOpenForm())}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base shadow-lg shadow-indigo-600/25 transition"
          >
            <Plus className="w-5 h-5" />
            {isFormOpen ? 'Close Form' : 'Add Task'}
          </button>

          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800">
            <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-sm text-slate-200 focus:outline-none"
            />
          </div>
        </div>

        {isFormOpen && (
          <AddTaskForm
            selectedDate={selectedDate}
            taskName={taskName}
            setTaskName={setTaskName}
            startTime={startTime}
            setStartTime={setStartTime}
            endTime={endTime}
            setEndTime={setEndTime}
            formError={formError}
            onSubmit={handleAddTask}
            onCancel={() => setIsFormOpen(false)}
          />
        )}

        <TaskList
          tasks={tasksForSelectedDate}
          selectedDate={selectedDate}
          todayStr={todayStr}
          currentMinutes={currentMinutes}
          onToggleComplete={(id) =>
            setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))
          }
          onDeleteTask={(id) => setTasks((prev) => prev.filter((t) => t.id !== id))}
        />
      </div>
    </div>
  );
}
