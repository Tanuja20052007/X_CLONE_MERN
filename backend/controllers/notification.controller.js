import { Notification } from "../models/notification.model.js";

export const getNotifications = async (req,res)=>{
try{
    const userId = req.user._id;
    const notifications  = await Notification.find({to:userId}).populate({
        path:"from",
        select:"username profileImg"
    });
    await Notification.updateMany({to:userId},{read:true});
    res.status(200).json(notifications);
}
catch(error){
    console.log("Failed to get Notifications");
    res.status(500).json({error:"Internal Server Error at Notifications"})
}
  

}
export const deleteNotifications =  async(req,res)=>{
    try{
        const userId = req.user._id;

        await Notification.deleteMany({to:userId});
        res.status(200).json({message:"Notifications deleed Succesfully !"})

    }
    catch(err){
        console.log("Failed to delete the notifications ");
        res.status(500).json({
          error:"Internal Server Error Happend at notification Deletion"  
        })
    }

}