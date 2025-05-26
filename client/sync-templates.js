// sync-templates.js
const fs   = require('fs');
const path = require('path');
const admin = require('firebase-admin');

// 1) Load your service account key
const keyPath = path.join(__dirname, 'serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(keyPath),
});

async function downloadTemplates() {
  // 2) Fetch all email templates (verifyEmail, resetPassword, etc.)
  const templates = await admin.auth().getEmailTemplates();
  // 3) Write them out to JSON
  fs.writeFileSync(
    path.join(__dirname, 'auth-templates.json'),
    JSON.stringify(templates, null, 2)
  );
  console.log('✅ auth-templates.json has been written');
}

async function uploadTemplates() {
  // 4) Read your edited JSON
  const file = fs.readFileSync(path.join(__dirname, 'auth-templates.json'), 'utf8');
  const templates = JSON.parse(file);
  // 5) Push the changes back into Firebase
  await admin.auth().updateEmailTemplates(templates);
  console.log('🚀 Templates have been applied to Firebase');
}

// CLI interface: node sync-templates.js get    or    node sync-templates.js apply
const action = process.argv[2];
if (action === 'get') downloadTemplates().catch(console.error);
else if (action === 'apply') uploadTemplates().catch(console.error);
else {
  console.error('Usage: node sync-templates.js [get|apply]');
  process.exit(1);
}

