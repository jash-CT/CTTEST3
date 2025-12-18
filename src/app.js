const express = require('express');
const app = express();

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/wallet', require('./routes/wallet'));

app.get('/', (req, res) => {
  res.json({ msg: 'Wallet API running' });
});

module.exports = app;
