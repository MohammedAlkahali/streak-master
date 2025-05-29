// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import {
  FaPlus,
  FaFireAlt,
  FaTrashAlt,
  FaTimes,
  FaEdit,
  FaUndo,
} from 'react-icons/fa';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  orderBy,
  limit,
} from 'firebase/firestore';
import ChangeEmailModal from '../components/ChangeEmailModal';
import RemindersModal from '../components/RemindersModal';
import { MILESTONES, BADGE_ICONS } from '../constants/badges';
import { useUserReminders, deleteReminder as deleteReminderService } from '../services/reminderService';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState({});
  const [newHabit, setNewHabit] = useState('');
  const [newHabitDuration, setNewHabitDuration] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(null);
  const [editDuration, setEditDuration] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Reminders state
  const [showRemindersModal, setShowRemindersModal] = useState(false);
  const reminders = useUserReminders();

  // Inject custom heatmap styles
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .react-calendar-heatmap rect {
        width: 8px !important;
        height: 8px !important;
        shape-rendering: crispEdges;
        stroke: #fff;
        stroke-width: 1px;
      }
      .color-empty { fill: #e5e7eb !important; }
      .color-github-1 { fill: #d1fae5 !important; }
      .color-github-2 { fill: #a7f3d0 !important; }
      .color-github-3 { fill: #6ee7b7 !important; }
      .color-github-4 { fill: #34d399 !important; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Auth + fetch habits
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate('/');
        return;
      }
      setUser(currentUser);
      setUsername(localStorage.getItem('username') || currentUser.email);
      const q = query(
        collection(db, 'habits'),
        where('userId', '==', currentUser.uid)
      );
      const unsubSnap = onSnapshot(q, (snap) => {
        setHabits(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      return () => unsubSnap();
    });
    return () => unsub();
  }, [navigate]);

  // Fetch last 30 logs for heatmaps
  useEffect(() => {
    if (!user) return;
    const handlers = habits.map(h => {
      const logsCol = collection(db, 'habits', h.id, 'logs');
      const q = query(logsCol, orderBy('timestamp', 'desc'), limit(30));
      return onSnapshot(q, snap => {
        const counts = {};
        snap.docs.forEach(d => {
          const ts = d.data().timestamp;
          if (!ts) return;
          const day = ts.toDate().toISOString().slice(0, 10);
          counts[day] = (counts[day] || 0) + 1;
        });
        setLogs(prev => ({
          ...prev,
          [h.id]: Object.entries(counts).map(([date, count]) => ({ date, count })),
        }));
      });
    });
    return () => handlers.forEach(unsub => unsub());
  }, [user, habits]);

  // Add new habit
  const addHabit = async () => {
    if (!newHabit || !newHabitDuration || !user) return;
    await addDoc(collection(db, 'habits'), {
      name: newHabit.trim(),
      duration: parseInt(newHabitDuration, 10),
      streak: 0,
      badges: [],
      userId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    setNewHabit('');
    setNewHabitDuration('');
    setIsModalOpen(false);
  };

  // Increment streak + award badge + log
  const incrementStreak = async h => {
    const ref = doc(db, 'habits', h.id);
    const newStreak = h.streak + 1;
    await updateDoc(ref, { streak: newStreak, updatedAt: serverTimestamp() });
    if (MILESTONES.includes(newStreak)) {
      await updateDoc(ref, { badges: arrayUnion(newStreak) });
    }
    await addDoc(collection(ref, 'logs'), { timestamp: serverTimestamp() });
  };

  // Reset, edit, delete, logout
  const resetStreak = async h => {
    if (window.confirm('Reset this streak?')) {
      await updateDoc(doc(db, 'habits', h.id), { streak: 0, updatedAt: serverTimestamp() });
    }
  };
  const editHabit = async (id, name, duration) => {
    await updateDoc(doc(db, 'habits', id), {
      name: name.trim(),
      duration: parseInt(duration, 10),
      updatedAt: serverTimestamp(),
    });
    setEditMode(null);
  };
  const deleteHabit = async id => {
    if (window.confirm('Delete this habit?')) {
      await deleteDoc(doc(db, 'habits', id));
    }
  };
  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('username');
    navigate('/');
  };

  // Helpers
  const calculateProgress = (streak, duration) => {
    const p = duration ? Math.min(100, Math.round((streak / duration) * 100)) : 0;
    return { percent: p, goalMet: streak >= duration };
  };
  const shiftDate = (d, days) => {
    const dt = new Date(d);
    dt.setDate(dt.getDate() + days);
    return dt;
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-pink-100 via-purple-200 to-blue-100 p-6">
      {/* Header */}
      <header className="flex flex-col items-center mb-10">
        <h1 className="text-5xl font-extrabold text-purple-700 drop-shadow-lg">
          Streak Master Dashboard
        </h1>
        <p className="text-gray-700 mt-1">
          Welcome, <strong>{username}</strong>
        </p>
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full"
          >
            Logout
          </button>
          <button
            onClick={() => setShowEmailModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full"
          >
            Change Email
          </button>
        </div>
      </header>

      {/* Motivation Banner */}
      <section className="mb-6 p-4 bg-purple-50 text-purple-700 rounded-xl text-center font-bold text-lg">
        Ignite your streak, fuel your ambition, and win every single day! 🔥
      </section>

      {/* Habits Grid */}
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {habits.map(h => {
          const { percent, goalMet } = calculateProgress(h.streak, h.duration);
          const isEditing = editMode === h.id;
          return (
            <div
              key={h.id}
              className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition border-t-4 border-purple-400"
            >
              {/* Title / Edit */}
              <div className="flex justify-between items-center mb-2">
                {isEditing ? (
                  <div className="flex-1">
                    <input
                      defaultValue={h.name}
                      onBlur={e => editHabit(h.id, e.target.value, editDuration)}
                      className="w-full text-lg font-bold text-purple-600 border-b focus:outline-none"
                    />
                    <input
                      defaultValue={h.duration}
                      type="number"

                      onBlur={e => setEditDuration(e.target.value)}
                      className="w-full text-sm text-gray-500 border-b focus:outline-none mt-1"
                    />
                  </div>
                ) : (
                  <h2 className="text-xl font-bold text-purple-600">{h.name}</h2>
                )}
                <div className="flex gap-2 ml-4">
                  <FaEdit
                    onClick={() => {
                      setEditMode(h.id);
                      setEditDuration(h.duration.toString());
                    }}
                    className="text-blue-500 hover:text-blue-700 cursor-pointer"
                  />
                  <FaTrashAlt
                    onClick={() => deleteHabit(h.id)}
                    className="text-red-500 hover:text-red-700 cursor-pointer"
                  />
                </div>
              </div>

              {/* Stats */}
              <p className="text-sm text-gray-500 mb-1">Goal: {h.duration} days</p>
              <div className="flex items-center gap-2 mb-1 text-sm text-gray-600">
                <FaFireAlt className="text-orange-400" />
                <span>{h.streak} day streak</span>
              </div>
              <p className="text-xs text-gray-500 mb-1">Progress: {percent}%</p>
              {goalMet && <p className="text-green-600 font-semibold">🎉 Goal Achieved!</p>}

              {/* Badges */}
              <div className="flex items-center gap-2 mt-2 mb-2">
                {h.badges?.map(ms => (
                  <span
                    key={ms}
                    className="text-xl transition-transform hover:scale-110"
                    title={`Unlocked ${ms}-day badge!`}
                  >
                    {BADGE_ICONS[ms]}
                  </span>
                ))}
              </div>

              {/* Heatmap */}
              {logs[h.id] && (
                <div className="mt-4">
                  <CalendarHeatmap
                    startDate={shiftDate(new Date(), -29)}
                    endDate={new Date()}
                    values={logs[h.id]}
                    gutterSize={2}
                    cellSize={8}
                    showWeekdayLabels={false}
                    showMonthLabels={false}
                    titleForValue={value =>
                      value && value.date ? `${value.date}: ${value.count} day(s)` : 'No activity'
                    }
                    classForValue={value =>
                      !value ? 'color-empty' : `color-github-${Math.min(value.count, 4)}`
                    }
                  />
                </div>
              )}

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 h-2 rounded-full mt-3 mb-4">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${percent}%`,
                    background: 'linear-gradient(to right,#a78bfa,#f472b6)',
                  }}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => incrementStreak(h)}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-1 rounded"
                >
                  +1 Day
                </button>
                <button
                  onClick={() => resetStreak(h)}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-1 rounded"
                >
                  <FaUndo className="inline mr-1" /> Reset
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Habit FAB */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed top-6 right-6 bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-full shadow-lg flex items-center gap-2"
      >
        <FaPlus /> Add Habit
      </button>

      {/* Reminders FAB */}
      <button
        onClick={() => setShowRemindersModal(true)}
        className="fixed top-20 right-6 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg flex items-center gap-2"
      >
        🕒 Reminders
      </button>

      {/* Reminders Modal */}
      {showRemindersModal && (
        <RemindersModal
          habits={habits}
          isOpen={showRemindersModal}
          onClose={() => setShowRemindersModal(false)}
        />
      )}

      {/* Add Habit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm relative">
            <FaTimes
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500 cursor-pointer"
            />
            <h2 className="text-xl font-bold mb-4 text-center">Add New Habit</h2>
            <input
              type="text"
              placeholder="Habit name"
              value={newHabit}
              onChange={e => setNewHabit(e.target.value)}
              className="w-full mb-3 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <input
              type="number"
              placeholder="Duration (days)"
              value={newHabitDuration}
              onChange={e => setNewHabitDuration(e.target.value)}
              className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <button
              onClick={addHabit}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white p-2 rounded"
            >
              Add Habit
            </button>
          </div>
        </div>
      )}

      {/* Change Email Modal */}
      {showEmailModal && (
        <ChangeEmailModal onClose={() => setShowEmailModal(false)} />
      )}
    </div>
  );
}
