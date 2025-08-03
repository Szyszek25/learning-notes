#!/usr/bin/env node

// Simple test script for webhook functionality
const http = require('http');

const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3000';

async function testWebhook() {
  console.log('Testing webhook functionality...');
  console.log(`Target URL: ${WEBHOOK_URL}`);

  // Test health endpoint
  try {
    console.log('\n1. Testing health endpoint...');
    const response = await fetch(`${WEBHOOK_URL}/health`);
    const data = await response.json();
    console.log('✅ Health check passed:', data);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return;
  }

  // Test webhook endpoint
  try {
    console.log('\n2. Testing webhook endpoint...');
    const testPayload = {
      test: true,
      timestamp: new Date().toISOString(),
      source: 'test-script'
    };

    const response = await fetch(`${WEBHOOK_URL}/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Webhook test passed:', data);
    } else {
      console.log('⚠️ Webhook test returned error:', data);
    }
  } catch (error) {
    console.log('❌ Webhook test failed:', error.message);
  }

  console.log('\nTest completed!');
}

// Import fetch for older Node.js versions
async function importFetch() {
  if (typeof fetch === 'undefined') {
    const { default: fetch } = await import('node-fetch');
    global.fetch = fetch;
  }
}

if (require.main === module) {
  importFetch().then(testWebhook).catch(console.error);
}

module.exports = { testWebhook };