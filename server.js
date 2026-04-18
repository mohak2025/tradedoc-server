const express = require('express');
const path = require('path');
const app = express();

// Set headers required for Outlook add-in on every request
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader(
    'Content-Security-Policy',
    "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; frame-ancestors *"
  );
  next();
});

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'taskpane.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`TradeDoc running on port ${PORT}`));

module.exports = app;
