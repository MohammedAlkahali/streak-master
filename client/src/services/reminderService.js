// client/src/services/reminderService.js

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
  serverTimestamp
} from 'firebase/firestore';

/**
 * Create a new reminder in Firestore.
 * @param {Object} reminder - { habitId?, channel, time, frequency, daysOfWeek?, messageTemplate? }
 * @returns {Promise<string>} The new reminder document ID.
 */
export async function createReminder(reminder) {
  const docRef = await addDoc(collection(db, 'reminders'), {
    ...reminder,
    userId: auth.currentUser.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * React hook to subscribe to the current user's reminders.
 * @returns {Array} List of reminder objects.
 */
export function useUserReminders() {
  const [reminders, setReminders] = React.useState([]);

  React.useEffect(() => {
    const q = query(
      collection(db, 'reminders'),
      where('userId', '==', auth.currentUser.uid)
    );
    const unsubscribe = onSnapshot(q, snapshot => {
      setReminders(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsubscribe;
  }, []);

  return reminders;
}

/**
 * Update fields on an existing reminder.
 * @param {string} id - Reminder document ID.
 * @param {Object} updates - Fields to update.
 */
export async function updateReminder(id, updates) {
  const ref = doc(db, 'reminders', id);
  await updateDoc(ref, {
    ...updates,
    updatedAt: serverTimestamp()
  });
}

/**
 * Delete a reminder by ID.
 * @param {string} id - Reminder document ID.
 */
export async function deleteReminder(id) {
  await deleteDoc(doc(db, 'reminders', id));
}
