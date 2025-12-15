// relay-server/mock-elder.js
// Simulates an elder device for testing

const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

const SERVER_URL = 'ws://192.168.137.150:3000';
const ELDER_ID = process.argv[2] || 'elder_test_' + Date.now();

let ws = null;
let batteryLevel = 85;

console.log('');
console.log('═══════════════════════════════════════════');
console.log('  🧓 Mock Elder Device Starting');
console.log('═══════════════════════════════════════════');
console.log('  Elder ID:', ELDER_ID);
console.log('═══════════════════════════════════════════');
console.log('');

// Connect to relay server
function connect() {
  const wsUrl = `${SERVER_URL}?deviceId=${ELDER_ID}&type=elder`;
  console.log('🔌 Connecting to:', wsUrl);
  
  ws = new WebSocket(wsUrl);

  ws.on('open', () => {
    console.log('✅ Connected to relay server');
    console.log('');
    console.log('Waiting for guardian requests...');
    console.log('');
    
    // Simulate battery drain
    setInterval(() => {
      if (batteryLevel > 15) {
        batteryLevel -= Math.floor(Math.random() * 3);
      }
    }, 30000); // Every 30 seconds
  });

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      handleMessage(message);
    } catch (error) {
      console.error('❌ Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('🔌 Disconnected from relay server');
    console.log('Reconnecting in 3 seconds...');
    setTimeout(connect, 3000);
  });

  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error.message);
  });
}

function handleMessage(message) {
  const { type, from, requestId } = message;
  
  console.log('📨 Received message:', type, 'from', from);

  switch (type) {
    case 'CONNECTION_ACK':
      console.log('✅ Connection acknowledged by server');
      break;

    case 'GET_STATE':
      handleGetState(from, requestId, message.payload);
      break;

    case 'GET_MEDICATIONS':
      handleGetMedications(from, requestId);
      break;

    case 'UPDATE_MEDICATIONS':
      handleUpdateMedications(from, requestId, message.payload);
      break;

    case 'GET_ALERT_HISTORY':
      handleGetAlertHistory(from, requestId);
      break;

    case 'GET_HEALTH_HISTORY':
      handleGetHealthHistory(from, requestId);
      break;

    default:
      console.log('⚠️  Unknown message type:', type);
  }
}

function handleGetState(guardianId, requestId, payload) {
  console.log('📤 Sending STATE_RESPONSE');

  const response = {
    type: 'STATE_RESPONSE',
    from: ELDER_ID,
    to: guardianId,
    requestId: requestId,
    payload: {
      elder: {
        name: 'pati',
        age: 75,
        batteryLevel: batteryLevel,
        lastHeartbeat: new Date().toISOString(),
      },
      recentAlerts: [
        {
          id: 'alert_1',
          type: 'MISSED_MED',
          triggeredAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          resolved: false,
        },
        {
          id: 'alert_2',
          type: 'LOW_BATTERY',
          triggeredAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
          resolved: true,
        },
      ],
      medicationSummary: {
        todayTotal: 4,
        takenToday: 3,
        missedToday: 1,
      },
    },
    timestamp: new Date().toISOString(),
  };

  ws.send(JSON.stringify(response));
  console.log('✅ STATE_RESPONSE sent');
  console.log('');
}

function handleGetMedications(guardianId, requestId) {
  console.log('📤 Sending MEDICATIONS_RESPONSE');

  const response = {
    type: 'MEDICATIONS_RESPONSE',
    from: ELDER_ID,
    to: guardianId,
    requestId: requestId,
    payload: {
      medications: [
        {
          id: 'med_1',
          name: 'Aspirin',
          dosage: '100mg',
          instructions: 'Take with food',
        },
        {
          id: 'med_2',
          name: 'Metformin',
          dosage: '500mg',
          instructions: 'Take twice daily',
        },
        {
          id: 'med_3',
          name: 'Lisinopril',
          dosage: '10mg',
          instructions: 'Take in morning',
        },
      ],
      schedules: [
        {
          id: 'sched_1',
          medicationId: 'med_1',
          time: '09:00',
          daysOfWeek: [1, 2, 3, 4, 5],
          enabled: true,
        },
        {
          id: 'sched_2',
          medicationId: 'med_2',
          time: '09:00',
          daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
          enabled: true,
        },
        {
          id: 'sched_3',
          medicationId: 'med_2',
          time: '21:00',
          daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
          enabled: true,
        },
        {
          id: 'sched_4',
          medicationId: 'med_3',
          time: '08:00',
          daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
          enabled: true,
        },
      ],
      logs: [
        {
          id: 'log_1',
          medicationId: 'med_1',
          scheduleId: 'sched_1',
          scheduledTime: new Date().toISOString(),
          takenAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          status: 'taken',
        },
      ],
    },
    timestamp: new Date().toISOString(),
  };

  ws.send(JSON.stringify(response));
  console.log('✅ MEDICATIONS_RESPONSE sent');
  console.log('');
}

function handleUpdateMedications(guardianId, requestId, payload) {
  console.log('📤 Sending UPDATE_ACK');
  console.log('   Updates received:', JSON.stringify(payload, null, 2));

  const response = {
    type: 'UPDATE_ACK',
    from: ELDER_ID,
    to: guardianId,
    requestId: requestId,
    payload: {
      success: true,
      message: 'Medications updated successfully',
    },
    timestamp: new Date().toISOString(),
  };

  ws.send(JSON.stringify(response));
  console.log('✅ UPDATE_ACK sent');
  console.log('');
}

function handleGetAlertHistory(guardianId, requestId) {
  console.log('📤 Sending ALERT_HISTORY_RESPONSE');

  const response = {
    type: 'ALERT_HISTORY_RESPONSE',
    from: ELDER_ID,
    to: guardianId,
    requestId: requestId,
    payload: {
      alerts: [
        {
          id: 'alert_1',
          type: 'MISSED_MED',
          triggeredAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          resolved: false,
        },
        {
          id: 'alert_2',
          type: 'LOW_BATTERY',
          triggeredAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          resolved: true,
        },
        {
          id: 'alert_3',
          type: 'INACTIVITY',
          triggeredAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          resolved: true,
        },
      ],
    },
    timestamp: new Date().toISOString(),
  };

  ws.send(JSON.stringify(response));
  console.log('✅ ALERT_HISTORY_RESPONSE sent');
  console.log('');
}

function handleGetHealthHistory(guardianId, requestId) {
  console.log('📤 Sending HEALTH_HISTORY_RESPONSE');

  const response = {
    type: 'HEALTH_HISTORY_RESPONSE',
    from: ELDER_ID,
    to: guardianId,
    requestId: requestId,
    payload: {
      checkIns: [
        {
          id: 'checkin_1',
          date: new Date().toISOString(),
          mood: 4,
          painLevel: 2,
          sleepQuality: 3,
          notes: 'Feeling good today',
        },
        {
          id: 'checkin_2',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          mood: 3,
          painLevel: 3,
          sleepQuality: 4,
          notes: 'Slept well',
        },
      ],
    },
    timestamp: new Date().toISOString(),
  };

  ws.send(JSON.stringify(response));
  console.log('✅ HEALTH_HISTORY_RESPONSE sent');
  console.log('');
}

// Send periodic heartbeat to simulate alive elder
setInterval(() => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    // Just a keepalive, no actual message needed
    // The connection itself shows elder is online
  }
}, 30000);

// Start connection
connect();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down mock elder...');
  if (ws) {
    ws.close();
  }
  process.exit(0);
});