const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const reservedUsernames = require('../config/reservedUsernames');

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

const safeUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  displayName: user.displayName,
  bio: user.bio,
  profilePhoto: user.profilePhoto,
  theme: user.theme,
  createdAt: user.createdAt,
});

exports.signup = async (req, res) => {
  const { username, email, password } = req.body;

  if (reservedUsernames.includes(username.toLowerCase())) {
    return res.status(400).json({ message: 'That username is not available' });
  }

  const existing = await User.findOne({
    $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }],
  });
  if (existing) {
    const field = existing.username === username.toLowerCase() ? 'username' : 'email';
    return res.status(409).json({ message: `That ${field} is already taken` });
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({ username, email, password: hashed });

  res.status(201).json({ token: signToken(user._id), user: safeUser(user) });
};

exports.me = async (req, res) => {
  const user = await User.findById(req.userId).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user: safeUser(user) });
};

exports.updateProfile = async (req, res) => {
  const { displayName, bio, profilePhoto, theme } = req.body;
  const updates = {};
  if (displayName  !== undefined) updates.displayName  = displayName;
  if (bio          !== undefined) updates.bio          = bio;
  if (profilePhoto !== undefined) updates.profilePhoto = profilePhoto;
  if (theme        !== undefined) updates.theme        = theme;

  const user = await User.findByIdAndUpdate(
    req.userId,
    { $set: updates },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user: safeUser(user) });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  // active lock check
  if (user.lockUntil && user.lockUntil > Date.now()) {
    const mins = Math.ceil((user.lockUntil - Date.now()) / 60_000);
    return res.status(423).json({
      message: `Account locked. Try again in ${mins} minute${mins === 1 ? '' : 's'}.`,
    });
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    // if a previous lock expired, start the counter fresh
    const base     = user.lockUntil && user.lockUntil <= Date.now() ? 0 : user.failedLoginAttempts;
    const attempts = base + 1;
    const update   = { failedLoginAttempts: attempts, lockUntil: null };
    if (attempts >= 5) update.lockUntil = new Date(Date.now() + 15 * 60_000);

    await User.updateOne({ _id: user._id }, { $set: update });

    if (attempts >= 5) {
      return res.status(423).json({ message: 'Account locked for 15 minutes after too many failed attempts.' });
    }
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // success — clear lockout state
  await User.updateOne({ _id: user._id }, { $set: { failedLoginAttempts: 0, lockUntil: null } });

  res.json({ token: signToken(user._id), user: safeUser(user) });
};
