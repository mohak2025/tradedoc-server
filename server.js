const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Headers required for Outlook add-in
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  res.setHeader('Content-Security-Policy', "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; frame-ancestors *");
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  next();
});

// Serve specific files explicitly
const files = {
  '/taskpane.html':        { file: 'taskpane.html',        type: 'text/html' },
  '/commands.html':        { file: 'commands.html',        type: 'text/html' },
  '/manifest.xml':         { file: 'manifest.xml',         type: 'application/xml' },
  '/icon16.png':           { file: 'icon16.png',           type: 'image/png' },
  '/icon32.png':           { file: 'icon32.png',           type: 'image/png' },
  '/icon80.png':           { file: 'icon80.png',           type: 'image/png' },
  '/tradedoc-icon-32.png': { file: 'tradedoc-icon-32.png', type: 'image/png' },
  '/tradedoc-icon-64.png': { file: 'tradedoc-icon-64.png', type: 'image/png' },
};

Object.entries(files).forEach(([route, { file, type }]) => {
  app.get(route, (req, res) => {
    const filePath = path.join(process.cwd(), file);
    res.setHeader('Content-Type', type);
    res.sendFile(filePath);
  });
});

app.get('/', (req, res) => {
  res.redirect('/taskpane.html');
});

app.use((req, res) => {
  res.status(404).send('Not found');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`TradeDoc on port ${PORT}`));

module.exports = app;
