// client/src/components/RemindersModal.jsx
import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import {
  createReminder
} from '../services/reminderService';

export default function RemindersModal({
  habits,       // array of { id, name }
  isOpen,       // boolean
  onClose       // fn to close modal
}) {
  const [habitId, setHabitId]       = useState('');
  const [channel, setChannel]       = useState('email');
  const [time, setTime]             = useState('08:00');
  const [frequency, setFrequency]   = useState('daily');
  const [daysOfWeek, setDaysOfWeek] = useState([]);
  const [message, setMessage]       = useState("Don't forget your habit!");
  const [loading, setLoading]       = useState(false);

  if (!isOpen) return null;

  const handleToggleDay = (day) => {
    setDaysOfWeek(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createReminder({
        habitId: habitId || null,
        channel,
        time,
        frequency,
        daysOfWeek: (frequency === 'custom' || frequency === 'weekly') ? daysOfWeek : [],
        messageTemplate: message
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to save reminder.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md relative space-y-4"
      >
        <FaTimes
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 cursor-pointer"
        />

        <h3 className="text-xl font-bold">New Reminder</h3>

        {/* Habit selector */}
        <select
          value={habitId}
          onChange={e => setHabitId(e.target.value)}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-400"
        >
          <option value="">— All Habits —</option>
          {habits.map(h => (
            <option key={h.id} value={h.id}>{h.name}</option>
          ))}
        </select>

        {/* Channel */}
        <div className="flex gap-4">
          {['email','push'].map(c => (
            <label key={c} className="flex items-center gap-1">
              <input
                type="radio"
                name="channel"
                value={c}
                checked={channel===c}
                onChange={e => setChannel(e.target.value)}
              />
              {c.charAt(0).toUpperCase()+c.slice(1)}
            </label>
          ))}
        </div>

        {/* Time */}
        <div>
          <label className="block text-sm mb-1">Time</label>
          <input
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-400"
            required
          />
        </div>

        {/* Frequency */}
        <select
          value={frequency}
          onChange={e => setFrequency(e.target.value)}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-400"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="custom">Custom Days</option>
        </select>

        {/* Days of Week (if needed) */}
        {['weekly','custom'].includes(frequency) && (
          <div className="grid grid-cols-7 gap-1 text-xs text-center">
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map((label, i) => (
              <button
                type="button"
                key={i}
                onClick={() => handleToggleDay(i)}
                className={`py-1 rounded ${
                  daysOfWeek.includes(i)
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Message */}
        <textarea
          rows="2"
          value={message}
          onChange={e => setMessage(e.target.value)}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-400"
        />

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded border"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Saving…' : 'Save Reminder'}
          </button>
        </div>
      </form>
    </div>
  );
}
