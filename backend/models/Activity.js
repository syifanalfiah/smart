const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Judul kegiatan wajib diisi'],
    trim: true,
    maxlength: [100, 'Judul maksimal 100 karakter']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Deskripsi maksimal 500 karakter']
  },
  category: {
    type: String,
    enum: ['kuliah', 'organisasi', 'personal', 'other'],
    default: 'other',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Tanggal wajib diisi']
  },
  startTime: {
    type: String,
    required: [true, 'Waktu mulai wajib diisi'],
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format waktu harus HH:MM']
  },
  endTime: {
    type: String,
    required: [true, 'Waktu selesai wajib diisi'],
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format waktu harus HH:MM']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Lokasi maksimal 100 karakter']
  },
  attachments: [{
    filename: String,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

activitySchema.index({ user: 1, date: -1 });
activitySchema.index({ user: 1, category: 1 });

activitySchema.pre('save', function(next) {
  if (this.startTime && this.endTime) {
    const start = new Date(`2000-01-01T${this.startTime}`);
    const end = new Date(`2000-01-01T${this.endTime}`);
    
    if (end <= start) {
      next(new Error('Waktu selesai harus lebih besar dari waktu mulai'));
      return;
    }
  }
  next();
});

module.exports = mongoose.model('Activity', activitySchema);