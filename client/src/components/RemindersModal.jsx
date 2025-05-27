import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { createReminder } from '../services/reminderService';

/**
 * RemindersModal component for scheduling habit reminders.
 * Props:
 *  - habits: array of { id, name } objects for habit selection.
 *  - isOpen: boolean indicating modal visibility.
 *  - onClose: function to close the modal.
 */
export default function RemindersModal({ habits, isOpen, onClose }) {
  // --- Local state for form inputs ---
  const [habitId, setHabitId] = useState('');             // Selected habit ID (or empty for all)
  const [channel, setChannel] = useState('email');        // Notification channel ('email' or 'push')
  const [time, setTime] = useState('08:00');              // Reminder time
  const [frequency, setFrequency] = useState('daily');    // Frequency: daily, weekly, or custom days
  const [daysOfWeek, setDaysOfWeek] = useState([]);       // Selected days for weekly/custom frequency
  const [message, setMessage] = useState("Don't forget your habit!"); // Custom message
  const [loading, setLoading] = useState(false);          // Submission loading state

  // If modal is not open, render nothing
  if (!isOpen) return null;

  /**
   * Toggle a day index in the daysOfWeek array.
   * Allows selecting custom days for reminders.
   */
  const toggleDay = (dayIndex) => {
    setDaysOfWeek(prev =>
      prev.includes(dayIndex)
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex]
    );
  };

  /**
   * Handle form submission to create a new reminder.
   * Uses the createReminder service, then closes the modal.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createReminder({
        habitId: habitId || null,
        channel,
        time,
        frequency,
        daysOfWeek: ['weekly', 'custom'].includes(frequency) ? daysOfWeek : [],
        messageTemplate: message,
      });
      onClose();
    } catch (err) {
      console.error('Error saving reminder:', err);
      alert('Failed to save reminder.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="modal-card bg-white p-6 rounded-xl shadow-lg w-full max-w-md space-y-4 relative">
        {/* Close icon */}
        <FaTimes onClick={onClose} className="close-icon absolute top-3 right-3 cursor-pointer text-gray-500 hover:text-red-500" />

        <h3 className="text-xl font-bold">New Reminder</h3>

        {/* Habit selector dropdown */}
        <label className="block">
          <span className="text-sm font-medium">Habit</span>
          <select
            value={habitId}
            onChange={e => setHabitId(e.target.value)}
            className="input-field w-full"
          >
            <option value="">— All Habits —</option>
            {habits.map(h => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </label>

        {/* Notification channel radio buttons */}
        <div className="flex gap-4">
          {['email', 'push'].map(c => (
            <label key={c} className="flex items-center gap-1">
              <input
                type="radio"
                name="channel"
                value={c}
                checked={channel === c}
                onChange={e => setChannel(e.target.value)}
              />
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </label>
          ))}
        </div>

        {/* Time input */}
        <label className="block">
          <span className="text-sm font-medium">Time</span>
          <input
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            className="input-field w-full"
            required
          />
        </label>

        {/* Frequency selector */}
        <label className="block">
          <span className="text-sm font-medium">Frequency</span>
          <select
            value={frequency}
            onChange={e => setFrequency(e.target.value)}
            className="input-field w-full"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="custom">Custom Days</option>
          </select>
        </label>

        {/* Days of week buttons for weekly/custom */}
        {['weekly', 'custom'].includes(frequency) && (
          <div className="grid grid-cols-7 gap-1 text-xs text-center">
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map((label, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => toggleDay(idx)}
                className={`py-1 rounded ${daysOfWeek.includes(idx) ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Custom message textarea */}
        <label className="block">
          <span className="text-sm font-medium">Message</span>
          <textarea
            rows={2}
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="input-field w-full"
          />
        </label>

        {/* Action buttons */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn-secondary px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary px-4 py-2 rounded"
          >
            {loading ? 'Saving…' : 'Save Reminder'}
          </button>
        </div>
      </form>
    </div>
  );
}
