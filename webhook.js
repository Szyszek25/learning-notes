const http = require('http');
const crypto = require('crypto');
const fetch = require('node-fetch');

// Configuration
const PORT = process.env.PORT || 3000;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || 'Szyszek25/learning-notes';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

// Function to trigger GitHub Actions workflow
async function triggerGitHubAction() {
  if (!GITHUB_TOKEN) {
    console.log('⚠️ No GitHub token provided, skipping GitHub Action trigger');
    return;
  }

  const url = `https://api.github.com/repos/${GITHUB_REPO}/dispatches`;
  const payload = {
    event_type: 'notion_webhook',
    client_payload: {
      timestamp: new Date().toISOString(),
      source: 'notion_webhook'
    }
  };

  try {
    console.log(`🚀 Triggering GitHub Action for ${GITHUB_REPO}...`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'notion-webhook-trigger'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      console.log('✅ GitHub Action triggered successfully');
    } else {
      const errorText = await response.text();
      console.error(`❌ Failed to trigger GitHub Action: ${response.status} ${errorText}`);
    }
  } catch (error) {
    console.error('❌ Error triggering GitHub Action:', error.message);
  }
}

// Function to verify webhook signature (if secret is provided)
function verifyWebhookSignature(body, signature) {
  if (!WEBHOOK_SECRET || !signature) {
    return true; // Skip verification if no secret configured
  }

  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(body)
    .digest('hex');

  return signature === expectedSignature;
}

// HTTP server to handle webhooks
const server = http.createServer((req, res) => {
  // Set CORS headers for development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-webhook-signature');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/webhook') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const signature = req.headers['x-webhook-signature'];
        
        // Verify webhook signature if secret is configured
        if (!verifyWebhookSignature(body, signature)) {
          console.log('❌ Invalid webhook signature');
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid signature' }));
          return;
        }

        console.log('✅ Webhook received at:', new Date().toISOString());
        console.log('📄 Payload preview:', body.substring(0, 200) + (body.length > 200 ? '...' : ''));

        // Trigger the sync
        await triggerGitHubAction();

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          status: 'success', 
          message: 'Webhook processed successfully',
          timestamp: new Date().toISOString()
        }));
      } catch (error) {
        console.error('❌ Error processing webhook:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          error: 'Internal server error',
          timestamp: new Date().toISOString()
        }));
      }
    });
  } else if (req.method === 'GET' && req.url === '/health') {
    // Health check endpoint
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      port: PORT,
      version: '1.0.0'
    }));
  } else if (req.method === 'GET' && req.url === '/') {
    // Basic info endpoint
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      name: 'Learning Notes Webhook Server',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        webhook: '/webhook (POST)'
      },
      timestamp: new Date().toISOString()
    }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      error: 'Not found',
      timestamp: new Date().toISOString()
    }));
  }
});

server.listen(PORT, () => {
  console.log(`Webhook server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Webhook endpoint: http://localhost:${PORT}/webhook`);
});

module.exports = server;