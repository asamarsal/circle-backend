import express from "express";
import { getProfile, updateProfile } from "../controllers/profile";
import { authenticate } from "../middlewares/auth";
import { uploadProfile } from "../utils/multerProfile";
import { handleUploadError } from "../middlewares/error-fileupload";

const router = express.Router();

router.get("/", authenticate, getProfile);
router.put("/", 
  authenticate, 
  uploadProfile.single('photo_profile'),
  handleUploadError,
  updateProfile
);

export default router;