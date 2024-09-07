import { Notification } from "../models/notification.model.js";
import { User } from "../models/User.js";
import {v2 as cloudinary} from "cloudinary";

export const getUserProfile = async (req, res) => {
    console.log(req.params)
    const { username } = req.params;
    try {
        const user = await User.findOne({ username }).select("-password")
        if (!user) {
            return res.status(404).json({ error: "No User Found" })
        }
        res.status(200).json(user)
    }
    catch (err) {
        console.log("Error happend in the contoller " + err.message)
        res.status(500).json({ error: "Server Error" + err.message })
    }
}
export const followOrUnfollowUser = async (req, res) => {
    // Extract the target user ID from the request parameters
    try {
        const { id } = req.params;

        // Find the target user and the current user by their IDs
        const userTomodify = await User.findById(id);
        const currentUser = await User.findById(req.user._id);

        // Check if the current user is trying to follow/unfollow themselves
        if (id === req.user._id.toString()) {
            res.status(400).json({ error: "You cannot follow / Unfollow Yourself" });
            return;
        }

        // Check if either the target user or current user is not found
        if (!userTomodify || !currentUser) {
            res.status(404).json({ error: "User Not Found!" });
            return;
        }

        // Check if the current user is already following the target user
        const isFollowing = currentUser.following.includes(id);

        if (isFollowing) {
            // Unfollow the target user
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
            res.status(200).json({ message: "User Unfollowed Successfully!" });
        } else {
            // Follow the target user
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });

            const newNotification = Notification({
                type: "follow",
                from: req.user._id,
                to: userTomodify._id

            })
            await newNotification.save()
            res.status(200).json({ message: "User Followed Successfully!" });

            // Send Notification to user (implementation needed)
        }
    } catch (err) {
        console.log("Error happened in the followOrUnfollowUser controller " + err.message);
        res.status(500).json({ error: "Server Error: " + err.message });
    }
};
export const getSuggestdUsers = async (req, res) => {

    try {
        const userId = req.user._id;
        const usersFollwedByme = await User.findById(userId).select("following");
        const users = await User.aggregate([
            {
                $match:{
                    _id:{$ne:userId}
                }
                //To filter the documents present in User Collection 
            },
            {
                //IN this pipeline from above the values will be taken
                $sample:{size:10}
            }
        ]);
        const filterdUsers = users.filter((user) => !usersFollwedByme.following.includes(user._id))
        const suggesstedusers   = filterdUsers.slice(0,4);
        suggesstedusers.forEach(user => user.password = null);
        res.status(200).json(suggesstedusers);

    }
    catch (err) {
        console.log("Error happened in the GetSUggestedUsers controller " + err.message);
        res.status(500).json({ error: "Server Error: " + err.message });
    }
}
 export const updateUser = async (req,res)=>{
    const { fullName, email, username, currentPassword, newPassword, bio, link } = req.body;
	let { profileImg, coverImg } = req.body;

	const userId = req.user._id;

	try {
		let user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "User not found" });

		if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
			return res.status(400).json({ error: "Please provide both current password and new password" });
		}

		if (currentPassword && newPassword) {
			const isMatch = await bcrypt.compare(currentPassword, user.password);
			if (!isMatch) return res.status(400).json({ error: "Current password is incorrect" });
			if (newPassword.length < 6) {
				return res.status(400).json({ error: "Password must be at least 6 characters long" });
			}

			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(newPassword, salt);
		}

		if (profileImg) {
			if (user.profileImg) {
				// https://res.cloudinary.com/dyfqon1v6/image/upload/v1712997552/zmxorcxexpdbh8r0bkjb.png
				await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
			}

			const uploadedResponse = await cloudinary.uploader.upload(profileImg);
			profileImg = uploadedResponse.secure_url;
		}

		if (coverImg) {
			if (user.coverImg) {
				await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
			}

			const uploadedResponse = await cloudinary.uploader.upload(coverImg);
			coverImg = uploadedResponse.secure_url;
		}

		user.fullName = fullName || user.fullName;
		user.email = email || user.email;
		user.username = username || user.username;
		user.bio = bio || user.bio;
		user.link = link || user.link;
		user.profileImg = profileImg || user.profileImg;
		user.coverImg = coverImg || user.coverImg;

		user = await user.save();

		// password should be null in response
		user.password = null;

		return res.status(200).json(user);
	} catch (error) {
		console.log("Error in updateUser: ", error.message);
		res.status(500).json({ error: error.message });
	}

 }