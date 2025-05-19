import multer from 'multer';
import path from 'path';

// Multer storage setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Custom middleware wrapper for single file upload
const uploadSingleFile = (fieldName) => {
  return (req, res, next) => {
    const singleUpload = upload.single(fieldName);
    singleUpload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
      } else if (err) {
        return res.status(500).json({ error: 'File upload failed' });
      }
      next();
    });
  };
};

export default uploadSingleFile;
