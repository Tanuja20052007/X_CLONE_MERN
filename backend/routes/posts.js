import express from "express";
import { protectedRoute } from "../middelwares/protectedroute.js";
import { Createpost,deletePost ,getUserPosts,commentOnPost, likeOrUnlike, getAllposts, getLikedposts,getFollowingposts} from "../controllers/posts.controller.js";
const router = express.Router();

router.post("/create",protectedRoute,Createpost);
router.get("/following",protectedRoute,getFollowingposts)
router.get("/getall",protectedRoute,getAllposts)
router.post("/comment/:id",protectedRoute,commentOnPost);
router.get("/likes/:id",protectedRoute,getLikedposts)
router.get("/user/:username",protectedRoute,getUserPosts)
router.post("/like/:id",protectedRoute,likeOrUnlike);
router.delete("/:id",protectedRoute,deletePost);
// router.post("/like/:id",protectedRoute,likeUnlikePost);
// router.post("/comment/:id",protectedRoute,)


export default router;