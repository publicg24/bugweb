const express = require('express');
const multer = require('multer');
const Photo = require('../Photo');
const auth = require('../authMiddleware');
const path = require('path');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

router.post('/upload', auth, upload.single('photo'), async (req, res) => {
  try {
    const photo = new Photo({
      url: `/uploads/${req.file.filename}`,
      user: req.user,
    });
    await photo.save();
    res.status(201).json(photo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const photos = await Photo.find({ user: req.user }).sort({ createdAt: -1 });
    res.json(photos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
