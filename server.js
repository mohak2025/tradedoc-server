const express = require('express');
const path = require('path');
const https = require('https');
const app = express();

app.use(express.json({ limit: '50mb' }));

// Headers for Outlook add-in
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  res.setHeader('Content-Security-Policy', "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; frame-ancestors *");
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  next();
});

// ── PROXY ENDPOINT ─────────────────────────────────────────────────
// Receives extraction requests from the add-in and forwards to Anthropic
app.post('/api/extract', (req, res) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) {
    return res.status(400).json({ error: 'No API key provided' });
  }

  const body = JSON.stringify(req.body);

  const options = {
    hostname: 'api.anthropic.com',
    path: '/v1/messages',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Length': Buffer.byteLength(body)
    }
  };

  const proxyReq = https.request(options, (proxyRes) => {
    let data = '';
    proxyRes.on('data', chunk => data += chunk);
    proxyRes.on('end', () => {
      res.status(proxyRes.statusCode).json(JSON.parse(data));
    });
  });

  proxyReq.on('error', (err) => {
    res.status(500).json({ error: err.message });
  });

  proxyReq.write(body);
  proxyReq.end();
});

// ── STATIC FILES ────────────────────────────────────────────────────
const baseDir = process.env.VERCEL ? '/var/task' : __dirname;

const files = {
  '/taskpane.html':        'text/html',
  '/commands.html':        'text/html',
  '/manifest.xml':         'application/xml',
  '/icon16.png':           'image/png',
  '/icon32.png':           'image/png',
  '/icon80.png':           'image/png',
  '/tradedoc-icon-32.png': 'image/png',
  '/tradedoc-icon-64.png': 'image/png',
};

Object.entries(files).forEach(([route, type]) => {
  app.get(route, (req, res) => {
    res.setHeader('Content-Type', type);
    res.sendFile(path.join(baseDir, route));
  });
});

app.get('/', (req, res) => res.redirect('/taskpane.html'));

module.exports = app;
