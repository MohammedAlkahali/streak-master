import React from 'react';
import { db, auth } from '../firebase';
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';

/**
 * reminderService: CRUD operations and hooks for managing reminders in Firestore.
 */

/**
 * Create a new reminder for the current user.
 * @param {Object} reminderData - Fields: habitId, channel, time, frequency, daysOfWeek, messageTemplate.
 * @returns {Promise<string>} The Firestore document ID of the created reminder.
 */
export async function createReminder(reminderData) {
  const reminderRef = await addDoc(collection(db, 'reminders'), {
    ...reminderData,
    userId: auth.currentUser.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return reminderRef.id;
}

/**
 * Custom React hook to subscribe to reminders for the authenticated user.
 * @returns {Array<Object>} Array of reminder objects with id and data fields.
 */
export function useUserReminders() {
  const [reminders, setReminders] = React.useState([]);

  React.useEffect(() => {
    if (!auth.currentUser) return;

    // Query reminders belonging to the current user
    const remindersQuery = query(
      collection(db, 'reminders'),
      where('userId', '==', auth.currentUser.uid)
    );

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(remindersQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReminders(data);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return reminders;
}

/**
 * Update specific fields of an existing reminder.
 * @param {string} id - Reminder document ID.
 * @param {Object} updates - Key/value pairs of fields to update.
 * @returns {Promise<void>}
 */
export async function updateReminder(id, updates) {
  const reminderRef = doc(db, 'reminders', id);
  await updateDoc(reminderRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a reminder by its document ID.
 * @param {string} id - Reminder document ID.
 * @returns {Promise<void>}
 */
export async function deleteReminder(id) {
  const reminderRef = doc(db, 'reminders', id);
  await deleteDoc(reminderRef);
}
