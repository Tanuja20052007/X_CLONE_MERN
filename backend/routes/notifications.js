import { Router } from "express";
import express from "express";
import { deleteNotifications, getNotifications } from "../controllers/notification.controller.js";
import { protectedRoute } from "../middelwares/protectedroute.js";
const router = express.Router();

router.get("/getNotifications",protectedRoute,getNotifications)
router.delete("/deleteNotifications",protectedRoute,deleteNotifications)

export default router;