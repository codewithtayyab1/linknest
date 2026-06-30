const Link = require('../models/Link');

exports.getMyLinks = async (req, res) => {
  const links = await Link.find({ user: req.userId }).sort({ order: 1 });
  res.json({ links });
};

exports.createLink = async (req, res) => {
  const { title, url, icon } = req.body;

  if (!title || !url) {
    return res.status(400).json({ message: 'title and url are required' });
  }

  const count = await Link.countDocuments({ user: req.userId });
  const link = await Link.create({ user: req.userId, title, url, icon, order: count });

  res.status(201).json({ link });
};

exports.updateLink = async (req, res) => {
  const link = await Link.findById(req.params.id);

  if (!link) return res.status(404).json({ message: 'Link not found' });
  if (link.user.toString() !== req.userId) return res.status(403).json({ message: 'Forbidden' });

  const { title, url, icon, isActive } = req.body;
  if (title !== undefined) link.title = title;
  if (url !== undefined) link.url = url;
  if (icon !== undefined) link.icon = icon;
  if (isActive !== undefined) link.isActive = isActive;

  await link.save();
  res.json({ link });
};

exports.deleteLink = async (req, res) => {
  const link = await Link.findById(req.params.id);

  if (!link) return res.status(404).json({ message: 'Link not found' });
  if (link.user.toString() !== req.userId) return res.status(403).json({ message: 'Forbidden' });

  await link.deleteOne();
  res.json({ message: 'Link deleted' });
};

exports.reorderLinks = async (req, res) => {
  const { links } = req.body;

  if (!Array.isArray(links) || links.length === 0) {
    return res.status(400).json({ message: 'links must be a non-empty array of { id, order }' });
  }

  const ids = links.map((l) => l.id);
  const owned = await Link.find({ _id: { $in: ids }, user: req.userId });

  if (owned.length !== ids.length) {
    return res.status(403).json({ message: 'One or more links not found or not owned by you' });
  }

  await Promise.all(
    links.map(({ id, order }) => Link.updateOne({ _id: id }, { $set: { order } }))
  );

  res.json({ message: 'Order updated' });
};
