import express from "express";
import { getThreads, createThread, getThreadDetail } from "../controllers/thread";
import { authenticate } from "../middlewares/auth";
import { uploadThread } from "../utils/multerThread";
import { handleUploadError } from "../middlewares/error-fileupload";


const router = express.Router();

router.get("/", authenticate, getThreads);
router.post("/", 
  authenticate, 
  uploadThread.single('image'), 
  handleUploadError,
  createThread
);
router.get("/:id", authenticate, getThreadDetail);

export default router;