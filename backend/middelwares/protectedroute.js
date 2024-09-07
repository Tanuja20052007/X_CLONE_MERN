import jwt from "jsonwebtoken"
import { User } from "../models/User.js";
export const protectedRoute =async (req,res,next) => {
    try{

        const token = req.cookies.jwt;
        if(!token){
          return  res.status(404).json({error:"Unauthorized , No Token Provided"})
        }
        const decode = jwt.verify(token,process.env.JWT_SECRET);
        // console.log(decode)
        if(!decode){
            return res.status(404).json({error:"No Token Provided"})
        }
        console.log(decode.userId)
    
        const user = await User.findById(decode.userId).select('-password')
        if(!user){
            return res.status(404).json({error:"UNauthorized token not provideds"})
        }

        req.user = user;
        next()
    }
    catch(e){
        console.log(`Error happend at controller ${e.message}`)
    }
}
