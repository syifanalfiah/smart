const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Activity = require('../models/Activity');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/activities/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'activity-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    
    if (extname) {
      cb(null, true);
    } else {
      cb(new Error('File type tidak diperbolehkan'));
    }
  }
});

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const { date, category, startDate, endDate } = req.query;
    
    let query = { user: req.userId };
    
    if (date) {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      query.date = {
        $gte: targetDate,
        $lt: nextDay
      };
    }
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (category) {
      query.category = category;
    }

    const activities = await Activity.find(query)
      .sort({ date: -1, startTime: 1 });

    res.json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data',
      error: error.message
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const activity = await Activity.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Kegiatan tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan',
      error: error.message
    });
  }
});

router.post('/', [
  body('title').trim().notEmpty().withMessage('Judul wajib diisi'),
  body('category').isIn(['kuliah', 'organisasi', 'personal', 'other']).withMessage('Kategori tidak valid'),
  body('date').isISO8601().withMessage('Format tanggal tidak valid'),
  body('startTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Format waktu mulai tidak valid (HH:MM)'),
  body('endTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Format waktu selesai tidak valid (HH:MM)')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const activityData = {
      ...req.body,
      user: req.userId
    };

    const activity = new Activity(activityData);
    await activity.save();

    res.status(201).json({
      success: true,
      message: 'Kegiatan berhasil ditambahkan',
      data: activity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menambahkan kegiatan',
      error: error.message
    });
  }
});

router.put('/:id', [
  body('title').optional().trim().notEmpty().withMessage('Judul tidak boleh kosong'),
  body('category').optional().isIn(['kuliah', 'organisasi', 'personal', 'other']).withMessage('Kategori tidak valid'),
  body('date').optional().isISO8601().withMessage('Format tanggal tidak valid'),
  body('startTime').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Format waktu mulai tidak valid'),
  body('endTime').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Format waktu selesai tidak valid')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const activity = await Activity.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Kegiatan tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'Kegiatan berhasil diupdate',
      data: activity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat update kegiatan',
      error: error.message
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const activity = await Activity.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Kegiatan tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'Kegiatan berhasil dihapus'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menghapus kegiatan',
      error: error.message
    });
  }
});

router.post('/:id/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File wajib diupload'
      });
    }

    const activity = await Activity.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Kegiatan tidak ditemukan'
      });
    }

    activity.attachments.push({
      filename: req.file.originalname,
      path: `/uploads/activities/${req.file.filename}`
    });

    await activity.save();

    res.json({
      success: true,
      message: 'File berhasil diupload',
      data: activity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat upload file',
      error: error.message
    });
  }
});

router.get('/analytics/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = { user: req.userId };
    if (startDate && endDate) {
      dateFilter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const activities = await Activity.find(dateFilter);

    const categoryStats = {};
    let totalHours = 0;

    activities.forEach(act => {
      const start = new Date(`2000-01-01T${act.startTime}`);
      const end = new Date(`2000-01-01T${act.endTime}`);
      const hours = (end - start) / 3600000;

      if (!categoryStats[act.category]) {
        categoryStats[act.category] = {
          count: 0,
          totalHours: 0
        };
      }

      categoryStats[act.category].count++;
      categoryStats[act.category].totalHours += hours;
      totalHours += hours;
    });

    res.json({
      success: true,
      data: {
        totalActivities: activities.length,
        totalHours: Math.round(totalHours * 10) / 10,
        categoryStats,
        completionRate: activities.length > 0 
          ? Math.round((activities.filter(a => a.isCompleted).length / activities.length) * 100)
          : 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil analytics',
      error: error.message
    });
  }
});

module.exports = router;