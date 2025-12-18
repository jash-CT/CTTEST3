const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// GET /api/wallet/balance
router.get('/balance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json({ balance: user.balance });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// POST /api/wallet/add { amount }
router.post('/add', auth, async (req, res) => {
  const { amount } = req.body;
  const n = Number(amount);
  if (!n || n <= 0) return res.status(400).json({ msg: 'Invalid amount' });

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.balance += n;
    await user.save();

    const tx = new Transaction({ user: user._id, type: 'add', amount: n });
    await tx.save();

    res.json({ balance: user.balance, txId: tx._id });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// POST /api/wallet/transfer { toEmail, amount }
router.post('/transfer', auth, async (req, res) => {
  const { toEmail, amount } = req.body;
  const n = Number(amount);
  if (!toEmail || !n || n <= 0) return res.status(400).json({ msg: 'Invalid input' });

  try {
    const from = await User.findById(req.user.id);
    const to = await User.findOne({ email: toEmail.toLowerCase() });
    if (!from || !to) return res.status(404).json({ msg: 'Sender or recipient not found' });
    if (String(from._id) === String(to._id)) return res.status(400).json({ msg: 'Cannot transfer to self' });
    if (from.balance < n) return res.status(400).json({ msg: 'Insufficient balance' });

    from.balance -= n;
    to.balance += n;

    await from.save();
    await to.save();

    const txSent = new Transaction({ user: from._id, type: 'transfer_sent', amount: n, fromUser: from._id, toUser: to._id });
    const txReceived = new Transaction({ user: to._id, type: 'transfer_received', amount: n, fromUser: from._id, toUser: to._id });
    await txSent.save();
    await txReceived.save();

    res.json({ fromBalance: from.balance, toBalance: to.balance, txSent: txSent._id });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// GET /api/wallet/transactions
router.get('/transactions', auth, async (req, res) => {
  try {
    const txs = await Transaction.find({ user: req.user.id }).sort({ createdAt: -1 }).populate('fromUser toUser', 'name email');
    res.json(txs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
