import express from "express";
import { getFollows, followUser, unfollowUser } from "../controllers/follow";
import { authenticate } from "../middlewares/auth";

const router = express.Router();

router.get("/", authenticate, getFollows);
router.post("/", authenticate, followUser);
router.delete("/", authenticate, unfollowUser);

export default router;