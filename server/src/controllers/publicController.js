const User = require('../models/User');
const Link = require('../models/Link');
const Analytics = require('../models/Analytics');
const parseDevice = require('../utils/parseDevice');

const getAnalyticsMeta = (req) => ({
  referrer: req.headers.referer || req.headers.referrer || '',
  device: parseDevice(req.headers['user-agent']),
});

exports.getPublicProfile = async (req, res) => {
  const user = await User.findOne({ username: req.params.username.toLowerCase() }).select(
    'username displayName bio profilePhoto theme'
  );

  if (!user) return res.status(404).json({ message: 'Profile not found' });

  const links = await Link.find({ user: user._id, isActive: true })
    .sort({ order: 1 })
    .select('title url icon order clicks');

  // fire-and-forget: don't block the response on the write
  Analytics.create({ type: 'view', user: user._id, ...getAnalyticsMeta(req) }).catch(() => {});

  res.json({
    profile: {
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      profilePhoto: user.profilePhoto,
      theme: user.theme,
    },
    links,
  });
};

exports.trackClick = async (req, res) => {
  const user = await User.findOne({ username: req.params.username.toLowerCase() }).select('_id');
  if (!user) return res.status(404).json({ message: 'Profile not found' });

  const link = await Link.findOne({ _id: req.params.linkId, user: user._id, isActive: true });
  if (!link) return res.status(404).json({ message: 'Link not found' });

  await Promise.all([
    Link.updateOne({ _id: link._id }, { $inc: { clicks: 1 } }),
    Analytics.create({ type: 'click', user: user._id, link: link._id, ...getAnalyticsMeta(req) }),
  ]);

  res.json({ message: 'Click recorded' });
};
