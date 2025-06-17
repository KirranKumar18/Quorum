import mongoose from "mongoose";

const messagesSchema = new mongoose.Schema({
    Grpid:{
        type:String,
        required:true
    },
    Sender:{
        type:String,
        required:true
    },
    Message:{
        type:String,
        required:false
    },
    image:{
        type:String,
        required:false
    }
},{
    timestamps: true
}
)
 
const Message = mongoose.model("Message",messagesSchema)               //messages --> is my collection name!!

export default Message;