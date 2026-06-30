const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['view', 'click'],
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    link: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Link',
      default: null,
    },
    referrer: {
      type: String,
      default: '',
    },
    device: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop', 'unknown'],
      default: 'unknown',
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model('Analytics', analyticsSchema);
