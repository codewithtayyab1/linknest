const mongoose = require('mongoose');
const Analytics = require('../models/Analytics');

exports.getSummary = async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.userId);

  const [result] = await Analytics.aggregate([
    { $match: { user: userId } },
    {
      $facet: {
        typeCounts: [
          { $group: { _id: '$type', count: { $sum: 1 } } },
        ],
        clicksPerLink: [
          { $match: { type: 'click' } },
          { $group: { _id: '$link', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          {
            $lookup: {
              from: 'links',
              localField: '_id',
              foreignField: '_id',
              as: 'linkDoc',
            },
          },
          { $unwind: { path: '$linkDoc', preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: 0,
              linkId: '$_id',
              title:  { $ifNull: ['$linkDoc.title', 'Deleted link'] },
              url:    { $ifNull: ['$linkDoc.url',   ''] },
              clicks: '$count',
            },
          },
        ],
      },
    },
  ]);

  const counts = Object.fromEntries(result.typeCounts.map(({ _id, count }) => [_id, count]));

  res.json({
    totalViews:    counts.view  || 0,
    totalClicks:   counts.click || 0,
    clicksPerLink: result.clicksPerLink,
  });
};

exports.getBreakdown = async (req, res) => {
  const userId       = new mongoose.Types.ObjectId(req.userId);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [result] = await Analytics.aggregate([
    { $match: { user: userId } },
    {
      $facet: {
        byDevice: [
          { $group: { _id: '$device', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $project: { _id: 0, device: '$_id', count: 1 } },
        ],
        topReferrers: [
          { $match: { referrer: { $ne: '' } } },
          { $group: { _id: '$referrer', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 },
          { $project: { _id: 0, referrer: '$_id', count: 1 } },
        ],
        viewsLast7Days: [
          { $match: { type: 'view', createdAt: { $gte: sevenDaysAgo } } },
          {
            $group: {
              _id:   { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
          { $project: { _id: 0, date: '$_id', count: 1 } },
        ],
      },
    },
  ]);

  res.json(result);
};
