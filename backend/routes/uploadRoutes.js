const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');

router.post('/', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }
    
    res.json({ url: req.file.path });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
