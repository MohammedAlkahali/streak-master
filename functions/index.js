/* eslint-disable */
const { onSchedule } = require("firebase-functions/v2/scheduler");
const logger          = require("firebase-functions/logger");
const admin           = require("firebase-admin");

admin.initializeApp();

exports.sendScheduledReminders = onSchedule(
  {
    schedule: "every 5 minutes",
    timeZone: "Asia/Muscat",
    region:   "us-central1", // ensure your function lives in the same region
  },
  async () => {
    // Build a Date in Asia/Muscat
    const localNow = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Muscat" })
    );

    const HH = String(localNow.getHours()).padStart(2, "0");
    const MM = String(localNow.getMinutes()).padStart(2, "0");
    const currentTime = `${HH}:${MM}`;              // "HH:MM"
    const today       = localNow.toISOString().slice(0, 10); // "YYYY-MM-DD"
    const weekday     = localNow.getDay();                 // 0=Sun…6=Sat

    logger.info(`Checking reminders for ${currentTime}`);

    const db   = admin.firestore();
    const snap = await db
      .collection("reminders")
      .where("time", "==", currentTime)
      .get();

    if (snap.empty) {
      logger.info(`No reminders due at ${currentTime}`);
      return null;
    }

    const batch = db.batch();

    for (const docSnap of snap.docs) {
      const data = docSnap.data();

      // Only one send per day
      if (data.lastSentDate === today) {
        continue;
      }

      // Check frequency / days-of-week
      const { frequency, daysOfWeek = [] } = data;
      const shouldSend =
        frequency === "daily" ||
        (
          (frequency === "weekly" || frequency === "custom") &&
          daysOfWeek.includes(weekday)
        );

      if (!shouldSend) {
        continue;
      }

      // ───────────────────────────────────────────
      // 🚩 DEBUG LOG: see what’s about to be enqueued
      logger.info("Enqueuing mail for:", {
        id:         docSnap.id,
        channel:    data.channel,
        userEmail:  data.userEmail,
        time:       data.time,
        frequency:  data.frequency,
        daysOfWeek: data.daysOfWeek,
      });
      // ───────────────────────────────────────────

      // 1) ENQUEUE EMAIL via Firestore‐Send‐Email extension
      if (data.channel === "email" && data.userEmail) {
        const mailRef = db.collection("mail").doc();
        batch.set(mailRef, {
          to: data.userEmail,
          message: {
            subject: data.messageTemplate
              ? data.messageTemplate.split("\n")[0]
              : "Streak Master Reminder",
            text: data.messageTemplate || "Don't break the chain!",
          },
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      // 2) SEND PUSH via FCM directly
      if (data.channel === "push" && data.fcmToken) {
        admin
          .messaging()
          .sendToDevice(data.fcmToken, {
            notification: {
              title: "Habit Reminder",
              body: data.messageTemplate || "Don't forget your streak!",
            },
          })
          .catch(err => logger.error("FCM error:", err));
      }

      // 3) MARK as sent today
      batch.update(docSnap.ref, { lastSentDate: today });
    }

    await batch.commit();
    logger.info(`Processed reminders at ${currentTime}`);
    return null;
  }
);
