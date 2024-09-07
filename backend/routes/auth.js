import express from "express";
import { signup ,login,logout, getMe} from "../controllers/auth.controller.js";
import { protectedRoute } from "../middelwares/protectedroute.js";
const authRouter = express.Router()
authRouter.get("/me",protectedRoute,getMe)
authRouter.post("/signup",signup)
authRouter.post("/login",login)
authRouter.post("/logout",logout)


export default authRouter;