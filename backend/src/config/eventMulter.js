import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';

// Configure storage for event images
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/events/images';
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
    cb(null, `event-image-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// Configure storage for event videos
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/events/videos';
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
    cb(null, `event-video-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// File filter for images
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// File filter for videos
const videoFilter = (req, file, cb) => {
  const allowedTypes = /mp4|avi|mov|wmv|flv|webm|mkv/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = /video\//;
  const mimetypeMatch = mimetype.test(file.mimetype);

  if (extname && mimetypeMatch) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed (mp4, avi, mov, wmv, flv, webm, mkv)'));
  }
};

// Configure multer for images
export const uploadEventImage = multer({
  storage: imageStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for images
  },
  fileFilter: imageFilter,
});

// Configure multer for videos
export const uploadEventVideo = multer({
  storage: videoStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos
  },
  fileFilter: videoFilter,
});

// Configure multer for mixed media (images and videos)
export const uploadEventMedia = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const isVideo = /video\//.test(file.mimetype);
      const dir = isVideo ? 'uploads/events/videos' : 'uploads/events/images';
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
      const isVideo = /video\//.test(file.mimetype);
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const prefix = isVideo ? 'event-video' : 'event-image';
      cb(null, `${prefix}-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
  }),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
    const allowedVideoTypes = /mp4|avi|mov|wmv|flv|webm|mkv/;
    const extname = path.extname(file.originalname).toLowerCase();
    const isImage = allowedImageTypes.test(extname) && /image\//.test(file.mimetype);
    const isVideo = allowedVideoTypes.test(extname) && /video\//.test(file.mimetype);

    if (isImage || isVideo) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  },
});
