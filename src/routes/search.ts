import express from "express";
import { searchUsers } from "../controllers/search";
import { authenticate } from "../middlewares/auth";

const router = express.Router();

router.get("/", authenticate, searchUsers);

export default router;