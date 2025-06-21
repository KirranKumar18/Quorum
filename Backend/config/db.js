import mongoose from "mongoose";


export const connectDB = async ()=>{

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected ${conn.connection.host}`)
    } catch (error) {
        console.log(`there is an error ${error.message}`)
        process.exit(1)  //   1 ->  fail  0-> success
        
    }
}