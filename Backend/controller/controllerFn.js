import message from "../config/model/messages.js";


export const fetchChats = async(req,res)=>{

    try {
        const Chats = await message.find({})                                        // DB QUERY
        res.status(200).json({success:true, message:Chats})
        console.log(Chats)
    } catch (error) {
        console.log(" error while fetching "+error.message)
        res.status(500).json({success: false, message :"ur missing some feild"})
    }
}

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