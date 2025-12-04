import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';

// Configure storage for organization images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/organizations';
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    } catch (e) {
      return cb(e);
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `org-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// File filter to only accept images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp, svg)'));
  }
};

// Configure multer for organizations
export const organizationUpload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});
