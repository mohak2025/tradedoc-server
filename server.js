const express = require('express');
const path = require('path');
const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  res.setHeader('Content-Security-Policy', "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; frame-ancestors *");
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  next();
});

// In Vercel serverless, files are at /var/task/
const baseDir = process.env.VERCEL ? '/var/task' : __dirname;

app.use(express.static(baseDir));

app.get('/', (req, res) => {
  res.sendFile(path.join(baseDir, 'taskpane.html'));
});

app.get('/taskpane.html', (req, res) => {
  res.sendFile(path.join(baseDir, 'taskpane.html'));
});

app.get('/commands.html', (req, res) => {
  res.sendFile(path.join(baseDir, 'commands.html'));
});

app.get('/manifest.xml', (req, res) => {
  res.setHeader('Content-Type', 'application/xml');
  res.sendFile(path.join(baseDir, 'manifest.xml'));
});

module.exports = app;
