import express from "express";
import { getLikes, likeThread, unlikeThread } from "../controllers/like";
import { authenticate } from "../middlewares/auth";

const router = express.Router();

router.get("/", authenticate, getLikes);
router.post("/", authenticate, likeThread);
router.delete("/:thread_id", authenticate, unlikeThread);

export default router;