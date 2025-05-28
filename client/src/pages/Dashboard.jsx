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

  // --- AUTH & USER META ---
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');

  // --- HABITS STATE ---
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState({});
  const [newHabit, setNewHabit] = useState('');
  const [newHabitDuration, setNewHabitDuration] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(null);
  const [editDuration, setEditDuration] = useState('');

  // --- EMAIL MODAL ---
  const [showEmailModal, setShowEmailModal] = useState(false);

  // --- REMINDERS STATE via hook ---
  const reminders = useUserReminders();
  const [showRemindersModal, setShowRemindersModal] = useState(false);

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

  // Auth & load habits
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, currentUser => {
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
      const unsubSnap = onSnapshot(q, snap => {
        setHabits(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      return () => unsubSnap();
    });
    return () => unsub();
  }, [navigate]);

  // Load last 30 logs for each habit
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

  // Add a new habit
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

  // Increment streak & log
  const incrementStreak = async h => {
    const ref = doc(db, 'habits', h.id);
    const newStreak = h.streak + 1;
    await updateDoc(ref, { streak: newStreak, updatedAt: serverTimestamp() });
    if (MILESTONES.includes(newStreak)) {
      await updateDoc(ref, { badges: arrayUnion(newStreak) });
    }
    await addDoc(collection(ref, 'logs'), { timestamp: serverTimestamp() });
  };

  // Reset, edit, delete habit
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

  // Delete a reminder
  const handleDeleteReminder = async id => {
    if (!window.confirm('Delete this reminder?')) return;
    try {
      await deleteReminderService(id);
    } catch (err) {
      console.error('Failed to delete reminder', err);
      alert('Could not delete reminder. Please try again.');
    }
  };

  // Logout & change email
  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('username');
    navigate('/');
  };

  // Helpers
  const calculateProgress = (streak, duration) => {
    const percent = duration ? Math.min(100, Math.round((streak / duration) * 100)) : 0;
    return { percent, goalMet: streak >= duration };
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
          <button onClick={handleLogout} className="btn btn-danger">
            Logout
          </button>
          <button onClick={() => setShowEmailModal(true)} className="btn btn-primary">
            Change Email
          </button>
        </div>
      </header>

      {/* Motivation Banner */}
      <section className="mb-6 p-4 bg-purple-50 text-purple-700 rounded-xl text-center font-bold">
        Ignite your streak, fuel your ambition, and win every single day! 🔥
      </section>

      {/* Habits Grid */}
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {habits.map(h => {
          const { percent, goalMet } = calculateProgress(h.streak, h.duration);
          const isEditing = editMode === h.id;
          return (
            <div key={h.id} className="habit-card">
              <div className="card-header d-flex justify-content-between">
                {isEditing ? (
                  <div className="w-100">
                    <input
                      defaultValue={h.name}
                      onBlur={e => editHabit(h.id, e.target.value, editDuration)}
                      className="form-control mb-1"
                    />
                    <input
                      defaultValue={h.duration}
                      type="number"
                      onBlur={e => setEditDuration(e.target.value)}
                      className="form-control"
                    />
                  </div>
                ) : (
                  <h2>{h.name}</h2>
                )}
                <div className="icon-group">
                  <FaEdit onClick={() => { setEditMode(h.id); setEditDuration(h.duration.toString()); }} />
                  <FaTrashAlt onClick={() => deleteHabit(h.id)} />
                </div>
              </div>

              <p>Goal: {h.duration} days</p>
              <div className="d-flex align-items-center mb-2">
                <FaFireAlt /> <span className="ms-2">{h.streak} day streak</span>
              </div>
              <p>Progress: {percent}%</p>
              {goalMet && <p className="text-success">🎉 Goal Achieved!</p>}

              <div className="badge-bar">
                {h.badges?.map(ms => (
                  <span key={ms} title={`Unlocked ${ms}-day badge!`}>
                    {BADGE_ICONS[ms]}
                  </span>
                ))}
              </div>

              {logs[h.id] && (
                <CalendarHeatmap
                  startDate={shiftDate(new Date(), -29)}
                  endDate={new Date()}
                  values={logs[h.id]}
                  gutterSize={2}
                  cellSize={8}
                  showWeekdayLabels={false}
                  showMonthLabels={false}
                  titleForValue={v => (v && v.date ? `${v.date}: ${v.count}` : 'No activity')}
                  classForValue={v => (!v ? 'color-empty' : `color-github-${Math.min(v.count, 4)}`)}
                />
              )}

              <div className="progress mt-3 mb-3">
                <div
                  className="progress-bar"
                  style={{
                    width: `${percent}%`,
                    background: 'linear-gradient(to right,#a78bfa,#f472b6)',
                  }}
                />
              </div>

              <div className="d-flex gap-2">
                <button onClick={() => incrementStreak(h)} className="btn btn-success flex-fill">
                  +1 Day
                </button>
                <button onClick={() => resetStreak(h)} className="btn btn-warning flex-fill">
                  <FaUndo /> Reset
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Habit FAB */}
      <button onClick={() => setIsModalOpen(true)} className="fab-add">
        <FaPlus /> Add Habit
      </button>

      {/* Reminders FAB */}
      <button onClick={() => setShowRemindersModal(true)} className="fab-reminder">
        🕒 Reminders
      </button>

      {/* Reminders Modal */}
      {showRemindersModal && (
        <RemindersModal
          reminders={reminders}
          onDelete={handleDeleteReminder}
          onClose={() => setShowRemindersModal(false)}
        />
      )}

      {/* Add Habit Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <FaTimes onClick={() => setIsModalOpen(false)} className="modal-close" />
            <h2>Add New Habit</h2>
            <input
              type="text"
              placeholder="Habit name"
              value={newHabit}
              onChange={e => setNewHabit(e.target.value)}
            />
            <input
              type="number"
              placeholder="Duration (days)"
              value={newHabitDuration}
              onChange={e => setNewHabitDuration(e.target.value)}
            />
            <button onClick={addHabit}>Add Habit</button>
          </div>
        </div>
      )}

      {/* Change Email Modal */}
      {showEmailModal && <ChangeEmailModal onClose={() => setShowEmailModal(false)} />}
    </div>
  );
}
