import multer from "multer";
import path from "path";
import fs from "fs";

const threadUploadsDir = "src/uploads/threads";
if (!fs.existsSync(threadUploadsDir)) {
  fs.mkdirSync(threadUploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, threadUploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

export const uploadThread = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(JSON.stringify({ 
        status: 400,
        message: "Only .jpg, .jpeg, and .png files are allowed"
      })));
    }
  }
});