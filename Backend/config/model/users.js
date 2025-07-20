import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    uid:{
        type : String,
        required : true 
    },
    grp_In:[{
        groupId: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ['admin', 'member', 'moderator'],
            default: 'member'
        }
    }]
})

const Users = mongoose.model("Users", userSchema)

export default Users