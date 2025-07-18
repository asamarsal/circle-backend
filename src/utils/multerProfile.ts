import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "src/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

export const uploadProfile = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "profile") {
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("hanya gambar"));
      }
    } else {
      cb(null, false);
    }
  }
});