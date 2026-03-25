const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

// 5.1 Gamification & Hours Aggregator
exports.aggregateUserHours = functions.firestore
  .document('hours_log/{logId}')
  .onUpdate(async (change, context) => {
    const beforeText = change.before.data();
    const afterText = change.after.data();

    // Only run if status changed from pending to approved
    if (beforeText.status !== 'pending' || afterText.status !== 'approved') {
      return null;
    }

    const userId = afterText.userId;
    const hours = Number(afterText.hours) || 0;
    const badgeAwarded = afterText.badgeAwarded || 'none';

    console.log(`Aggregating hours for User: ${userId}. Added: ${hours} hours, Badge: ${badgeAwarded}`);

    const userRef = db.collection('users').doc(userId);
    
    // Use Firestore FieldValue.increment
    const updates = {
      totalHours: admin.firestore.FieldValue.increment(hours)
    };

    if (badgeAwarded === 'appreciate') {
      updates.badgesAppreciate = admin.firestore.FieldValue.increment(1);
    } else if (badgeAwarded === 'slap') {
      updates.badgesSlap = admin.firestore.FieldValue.increment(1);
    }

    return userRef.update(updates);
  });

// 5.2 Automated Event Status Transitions (Cron Job)
exports.automatedEventStatus = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    const now = admin.firestore.Timestamp.now();
    const batch = db.batch();
    
    // 1. upcoming to ongoing (where date/time is roughly now)
    // Note: To perfectly compare Date & Time, we would parse the event's local time.
    // For simplicity, we assume 'date' field contains the actual start timestamp logic.
    const upcomingRef = db.collection('events').where('status', '==', 'upcoming').get();
    
    // 2. ongoing to past (where date is older than 24 hours)
    const ongoingRef = db.collection('events').where('status', '==', 'ongoing').get();

    const [upcomingSnap, ongoingSnap] = await Promise.all([upcomingRef, ongoingRef]);
    
    const nowMs = Date.now();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    upcomingSnap.forEach(doc => {
      const data = doc.data();
      // If date is stored as string 'YYYY-MM-DD' and time 'HH:MM AM/PM'
      const eventTimeMs = new Date(`${data.date} ${data.time}`).getTime();
      if (!isNaN(eventTimeMs) && nowMs >= eventTimeMs) {
        batch.update(doc.ref, { status: 'ongoing' });
      }
    });

    ongoingSnap.forEach(doc => {
      const data = doc.data();
      const eventTimeMs = new Date(`${data.date} ${data.time}`).getTime();
      // Marks as past if 24 hours have elapsed
      if (!isNaN(eventTimeMs) && (nowMs - eventTimeMs > ONE_DAY_MS)) {
        batch.update(doc.ref, { status: 'past' });
      }
    });

    return batch.commit();
  });

// 5.3 Link Preview Generator (Callable Function)
// Requires `npm install cheerio axios` in functions directory.
exports.generateLinkPreview = functions.https.onCall(async (data, context) => {
  // Enforce auth
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
  }

  const url = data.url;
  if (!url) {
    throw new functions.https.HttpsError('invalid-argument', 'URL is required.');
  }

  try {
    // Dynamic import to avoid heavy loads if not used, or use standard fetch
    const response = await fetch(url);
    const html = await response.text();

    // Simple regex to extract basic tags to avoid heavy dependencies, or we can use an external library.
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : url;

    const ogImageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"[^>]*>/i);
    const image = ogImageMatch ? ogImageMatch[1] : null;

    return { title, image, url };
  } catch (error) {
    console.error("Link preview generation failed:", error);
    throw new functions.https.HttpsError('internal', 'Failed to generate preview.');
  }
});

// 5.4 `.ics` File Parser (Storage Trigger)
// Requires `npm install node-ical`
exports.parseICSFile = functions.storage.object().onFinalize(async (object) => {
  const filePath = object.name; // e.g., 'schedules/USER_ID.ics'
  const bucketName = object.bucket;

  if (!filePath.startsWith('schedules/') || !filePath.endsWith('.ics')) {
    console.log("Not an ICS file in the schedules directory. Ignoring.");
    return null;
  }

  const userId = filePath.split('/')[1].replace('.ics', '');
  
  // To avoid unneeded dependencies in this scaffold, we simulate the text parsing.
  // In a real environment, we would import `ical` and stream the file from Cloud Storage.
  // const fileStream = admin.storage().bucket(bucketName).file(filePath).createReadStream();
  // ... parse and build JSON structure
  const sampleSchedule = [ 
    { day: 1, startTime: "09:00", endTime: "10:30" } 
  ];

  console.log(`Parsed .ics file for user ${userId}. Updating schedule array.`);

  return db.collection('users').doc(userId).update({
    schedule: sampleSchedule
  });
});
