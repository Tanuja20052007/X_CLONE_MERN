import { json } from "express";
import { Notification } from "../models/notification.model.js";
import Post from "../models/post.js";
import { User } from "../models/User.js";
import { v2 as cloudinary } from "cloudinary"

export const Createpost = async (req, res) => {
    try {

        const { text } = req.body;
        let { img } = req.body;
        const userId = req.user._id.toString();
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not Found" })
        if (!text && !img) {
            res.status(400).json({ error: "Post must contain both image and text !" })
        }
        if (img) {
            const uploadResponse = await cloudinary.uploader.upload(img)
            img = uploadResponse.secure_url;
        }
        const newpost = Post({
            user: userId,
            text,
            img
        })
        await newpost.save();
        res.status(201).json(newpost);
    }
    catch (err) {
        res.status(500).json({ error: "Internal Server error happens" })
        console.log("Eror happend at createdPost Contooller ! ")

    }
}
export const deletePost = async (req, res) => {
    try {
		const post = await Post.findById(req.params.id);
		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		if (post.user.toString() !== req.user._id.toString()) {
			return res.status(401).json({ error: "You are not authorized to delete this post" });
		}

		if (post.img) {
			const imgId = post.img.split("/").pop().split(".")[0];
			await cloudinary.uploader.destroy(imgId);
		}

		await Post.findByIdAndDelete(req.params.id);

		res.status(200).json({ message: "Post deleted successfully" });
	} catch (error) {
		console.log("Error in deletePost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
}
export const commentOnPost = async (req,res)=>{
    try {
		const { text } = req.body;
		const postId = req.params.id;
		const userId = req.user._id;

		if (!text) {
			return res.status(400).json({ error: "Text field is required" });
		}
		const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		const comment = { user: userId, text };

		post.comments.push(comment);
		await post.save();

		res.status(200).json(post);
	} catch (error) {
		console.log("Error in commentOnPost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
   
}
export const likeOrUnlike = async (req,res)=>{

    try {
		const userId = req.user._id;
		const { id: postId } = req.params;

		const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		const userLikedPost = post.likes.includes(userId);

		if (userLikedPost) {
			// Unlike post
			await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
			await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

			const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString());
			res.status(200).json(updatedLikes);
		} else {
			// Like post
			post.likes.push(userId);
			await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
			await post.save();

			const notification = new Notification({
				from: userId,
				to: post.user,
				type: "like",
			});
			await notification.save();

			const updatedLikes = post.likes;
			res.status(200).json(updatedLikes);
		}
	} catch (error) {
		console.log("Error in likeUnlikePost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
   
}
export const getAllposts = async (req,res)=>{
    try {
		const posts = await Post.find()
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		if (posts.length === 0) {
			return res.status(200).json([]);
		}

		res.status(200).json(posts);
	} catch (error) {
		console.log("Error in getAllPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
   
}
export const getLikedposts  = async (req,res)=>{
    const userId = req.params.id;

	try {
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: "User not found" });

		const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		res.status(200).json(likedPosts);
	} catch (error) {
		console.log("Error in getLikedPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
}
export const getFollowingposts = async (req,res)=>{
	try{
		const userId = req.user._id;
		// console.log(userId + " User id in follinwf")
		const user =  await User.findById(userId);
		if(!user) res.status(404).json({error:"User Not Found !"})
			
		const following  = user.following;

		const feedPosts = await Post.find({user:{$in:following}}).sort({createdAt: -1}).populate({
			path:"user",
			select:"-password"
		})
		.populate({
			path:"comments.user",
			select:"-password"
		})
		// console.log(feedPosts)
		res.status(200).json(feedPosts);
	}
	catch(err){
		console.log("Error occured in following posts contoller "+ err.message);
		res.status(500).json({error:"Internal Server Error in getfollwing posts controller !"})
	}
}

export const getUserPosts = async (req,res)=>{
	try{
		const {username} = req.params;
	const user = await User.findOne({username});
	if(!user){
		res.status(404).json({error:"User Not Found !"})
	}
	const posts = await Post.find({user:user._id}).populate({
		path:"user",
		select:"-password"
	}).populate({
		path:"comments.user",
		select:"-password"
	})
	res.status(200).json(posts)
	}
	catch(err){
		console.log("Error is " + err.message);
		return res.status(400).json("Internal Server error at getmy posts ")
	}
}
