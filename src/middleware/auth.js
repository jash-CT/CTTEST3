const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const authHeader = req.header('Authorization');
  if (!authHeader) return res.status(401).json({ msg: 'No token, authorization denied' });

  // Expect header 'Authorization: Bearer <token>'
  const parts = authHeader.split(' ');
  if (parts.length !== 2) return res.status(401).json({ msg: 'Token format invalid' });

  const token = parts[1];
  try {
    const secret = process.env.JWT_SECRET || 'secret_change_me';
    const decoded = jwt.verify(token, secret);
    req.user = decoded.user;
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Token is not valid' });
  }
};
