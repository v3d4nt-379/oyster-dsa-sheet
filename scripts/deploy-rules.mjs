import { readFileSync } from 'fs';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getSecurityRules } from 'firebase-admin/security-rules';

// Read service account
const serviceAccount = JSON.parse(readFileSync(new URL('../service-account.json', import.meta.url)));

// Initialize Firebase Admin
if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

async function deployRules() {
  try {
    const rulesContent = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');
    
    console.log('Creating ruleset...');
    const securityRules = getSecurityRules();
    const ruleset = await securityRules.createRuleset({
      source: {
        files: [
          {
            name: 'firestore.rules',
            content: rulesContent
          }
        ]
      }
    });

    console.log(`Ruleset created: ${ruleset.name}`);
    console.log('Releasing ruleset...');
    await securityRules.releaseFirestoreRuleset(ruleset.name);
    
    console.log('Firestore rules deployed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error deploying rules:', error);
    process.exit(1);
  }
}

deployRules();
