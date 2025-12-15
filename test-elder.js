// relay-server/test-elder.js
// Simple script to test elder pairing without the elder app

const axios = require('axios');

const SERVER_URL = 'http://172.20.10.2:3000';
const ELDER_ID = 'elder_test_' + Date.now();

async function generatePairingCode() {
  try {
    console.log('🔑 Generating pairing code for elder:', ELDER_ID);
    
    const response = await axios.post(`${SERVER_URL}/api/elder/generate-code`, {
      elderId: ELDER_ID,
    });

    const { code, expiresAt } = response.data.data;
    
    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log('  ✅ PAIRING CODE GENERATED');
    console.log('═══════════════════════════════════════════');
    console.log('');
    console.log('  📱 CODE:', code);
    console.log('  ⏰ Expires:', new Date(expiresAt).toLocaleString());
    console.log('  🆔 Elder ID:', ELDER_ID);
    console.log('');
    console.log('  👉 Enter this code in your Guardian App');
    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log('');

    return { code, elderId: ELDER_ID };
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  generatePairingCode();
}

module.exports = { generatePairingCode };