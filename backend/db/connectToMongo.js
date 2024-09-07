import mongoose from "mongoose";

export const connect = async () =>{
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`Mongo DB Connected at ${conn.connection.host}`)
    }
    catch(e){
        console.log(e.message)
        process.exit(1)
    }
}