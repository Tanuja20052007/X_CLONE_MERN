import express from "express";
import { getUserProfile,followOrUnfollowUser ,getSuggestdUsers,updateUser} from "../controllers/user.contoller.js";
import { protectedRoute } from "../middelwares/protectedroute.js";
const router =express.Router()

router.get("/profile/:username",protectedRoute,getUserProfile);
router.get("/suggested",protectedRoute,getSuggestdUsers)
router.post("/follow/:id",protectedRoute,followOrUnfollowUser)
router.post("/update", protectedRoute, updateUser);
// router.get("/suggested",)


export default router;