/* eslint-disable */
// Firebase Cloud Function: Sends scheduled reminders every 5 minutes.
const { onSchedule } = require('firebase-functions/v2/scheduler');
const logger = require('firebase-functions/logger');
const admin = require('firebase-admin');

// Initialize the default Firebase app
admin.initializeApp();

/**
 * Scheduled function to process reminders:
 * - Runs every 5 minutes in the Asia/Muscat timezone.
 * - Queries reminders matching the current time.
 * - Filters by frequency and days of week.
 * - Enqueues emails via Firestore extension or sends push via FCM.
 * - Marks reminders as sent for today.
 */
exports.sendScheduledReminders = onSchedule(
  {
    schedule: 'every 5 minutes',
    timeZone: 'Asia/Muscat',     // Local time zone
    region: 'us-central1',        // Ensure region matches your deployment
  },
  async () => {
    // Build local date/time in Asia/Muscat
    const localNow = new Date(
      new Date().toLocaleString('en-US', { timeZone: 'Asia/Muscat' })
    );

    // Format current time and date
    const HH = String(localNow.getHours()).padStart(2, '0');
    const MM = String(localNow.getMinutes()).padStart(2, '0');
    const currentTime = `${HH}:${MM}`;              // e.g. "14:05"

    const today = localNow.toISOString().slice(0, 10); // YYYY-MM-DD
    const weekday = localNow.getDay();                 // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    logger.info(`Checking reminders for ${currentTime}`);

    const db = admin.firestore();

    // Fetch reminders scheduled for this exact time
    const snap = await db
      .collection('reminders')
      .where('time', '==', currentTime)
      .get();

    if (snap.empty) {
      logger.info(`No reminders due at ${currentTime}`);
      return null;
    }

    const batch = db.batch();

    for (const docSnap of snap.docs) {
      const data = docSnap.data();

      // Skip if already sent today
      if (data.lastSentDate === today) continue;

      // Determine if reminder should be sent based on frequency and daysOfWeek
      const { frequency, daysOfWeek = [] } = data;
      const shouldSend =
        frequency === 'daily' ||
        ((frequency === 'weekly' || frequency === 'custom') && daysOfWeek.includes(weekday));
      if (!shouldSend) continue;

      // Debug: log reminder details
      logger.info('Enqueuing mail for:', {
        id: docSnap.id,
        channel: data.channel,
        userEmail: data.userEmail,
        time: data.time,
        frequency: data.frequency,
        daysOfWeek: data.daysOfWeek,
      });

      // 1) Enqueue email via Firestore-Send-Email extension
      if (data.channel === 'email' && data.userEmail) {
        const mailRef = db.collection('mail').doc();
        batch.set(mailRef, {
          to: data.userEmail,
          message: {
            subject: data.messageTemplate
              ? data.messageTemplate.split('\n')[0]
              : 'Streak Master Reminder',
            text: data.messageTemplate || "Don't break the chain!",
          },
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      // 2) Send push notification via Firebase Cloud Messaging
      if (data.channel === 'push' && data.fcmToken) {
        admin.messaging()
          .sendToDevice(data.fcmToken, {
            notification: {
              title: 'Habit Reminder',
              body: data.messageTemplate || "Don't forget your streak!",
            },
          })
          .catch((err) => logger.error('FCM error:', err));
      }

      // 3) Mark reminder as sent today
      batch.update(docSnap.ref, { lastSentDate: today });
    }

    // Commit batched writes
    await batch.commit();
    logger.info(`Processed reminders at ${currentTime}`);
    return null;
  }
);
