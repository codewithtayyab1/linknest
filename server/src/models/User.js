const mongoose = require('mongoose');

const themeSchema = new mongoose.Schema(
  {
    primaryColor: { type: String, default: '#6366f1' },
    backgroundColor: { type: String, default: '#ffffff' },
    textColor: { type: String, default: '#111827' },
    font: {
      type: String,
      enum: ['inter', 'roboto', 'poppins', 'mono'],
      default: 'inter',
    },
    layout: {
      type: String,
      enum: ['grid', 'list', 'compact'],
      default: 'grid',
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
      match: [/^[a-z0-9_-]+$/, 'Username may only contain letters, numbers, underscores, and hyphens'],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      trim: true,
      maxlength: 50,
      default: '',
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 300,
      default: '',
    },
    profilePhoto: {
      type: String,
      default: '',
    },
    theme: {
      type: themeSchema,
      default: () => ({}),
    },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil:           { type: Date,   default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
