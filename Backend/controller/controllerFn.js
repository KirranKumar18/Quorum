import message from "../config/model/messages.js";
import Users from "../config/model/users.js";
import { supabase } from "../../Frontend/src/Supabase.js"
// import React from "react";
// import { useState } from "react";

// const [userState,setuserState] = useState('user_ABC')

export const fetchChats = async(req,res)=>{

    try {
        const Chats = await message.find({})                                        // DB QUERY
        res.status(200).json({success:true, message:Chats})
        // console.log(Chats)
    } catch (error) {
        console.log(" error while fetching "+error.message)
        res.status(500).json({success: false, message :"ur missing some feild"})
    }
}
 /*                                         *******************************                          */
export const saveChats = async (req,res)=>{

    const messageBody = req.body
if (!messageBody.Grpid || !messageBody.Sender || !messageBody.Message || !messageBody.image) {
  console.log("Missing fields:", {
    Grpid: !!messageBody.Grpid,
    Sender: !!messageBody.Sender,
    Message: !!messageBody.Message,
    image: !!messageBody.image
  });}

    const newMessage = new message(messageBody)

    try {
        await newMessage.save();

        const io = req.app.get('io');
    io.emit('newMessage', newMessage); // send to all connected clients

        res.status(201).json({success:true, message: `data added ${newMessage}`})
        console.log("chats sent to db succesfully")

    } catch (error) {
            console.log("ther is this error "+ error.message)
            res.status(500).json({success: false, message :"Server error"})
    }
    
}   
 /*                                         *******************************                          */
export const updateMetadata = async (req, res) => {
    
    // get data from supabase [ AUTHENTICATOIN ]
    try{
        const { data: users, error} = await supabase.from('user_profiles').select('id')
        if(error){
            console.error("there was an error",error)
            res.status(500).json({success: false, message: "Error fetching user data"})
        }
        else{
            console.log("Users data retrived !!")
            const userIds = users.map(user => user.id)
            //console.log("User IDs:", userIds)
           // res.status(200).json({success: true, data: users, ids: userIds})
            
        }
    }
    catch(error){ 
            console.error("an error occured",error)
            res.status(500).json({success: false, message: "Server error"})
    }

    //  now make METADATA in mongodb using the data from supabase

    try {
        
        const metaData = {
             uid: "kirran",
            grp_In:[{
            groupId: "ABC grp",
            role:"admin"
            },{
            groupId: "XYZ grp",
            role:"member"
            }]
        }
        const MD = new Users(metaData)
        await MD.save()
        res.status(201).json({status:"succes",message: metaData})
        console.log(metaData)


    } catch (error) {
        console.error("it didnt work ",error)
    }
}
