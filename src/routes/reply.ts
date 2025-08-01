import express from "express";
import { createReply, getReplies } from "../controllers/reply";
import { authenticate } from "../middlewares/auth";

const router = express.Router();

router.get("/", authenticate, getReplies);
router.post("/", authenticate, createReply);

export default router;