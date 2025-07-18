import multer from "multer";
import path from "path";
import fs from "fs";

const productsDir = "src/uploads/products";
if (!fs.existsSync(productsDir)) {
  fs.mkdirSync(productsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, productsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

export const uploadProduct = multer({
    storage: storage,
    limits: {
      fileSize: 1000 * 1024 // 1000KB limit
    },
    fileFilter: (req, file, cb) => {

      const allowedTypes = ['.png'];
      const ext = path.extname(file.originalname).toLowerCase();
      
      if (file.fieldname === "photo" && allowedTypes.includes(ext)) {
        cb(null, true);
      } else {

        return cb(new Error(JSON.stringify({ 
          status: 400,
          message: "Format file tidak valid. Hanya .png yang diperbolehkan"
        })));
      }
    }
  });
