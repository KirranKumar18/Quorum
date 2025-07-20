import message from "../config/model/messages.js";
import Users from "../config/model/users.js";
import supabase  from "../supabase.js"


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
    try {
        // Get email from request body
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({success: false, message: "Email is required in request body"});
        }

        // Direct query to get user from Supabase auth table by email
        const { data: users, error} = await supabase.auth.admin.listUsers()
        
        if(error){
            console.error("Error fetching users from auth:", error);
            return res.status(500).json({success: false, message:"Error fetching users from auth", error: error.message})
        }
        
        // Filter for the specific user by email (now dynamic)
        const targetUser = users.users.find(user => user.email === email);
        
        if(!targetUser) {
            return res.status(404).json({success: false, message: `User with email ${email} not found`});
        }

        console.log("User found:", targetUser);

        // Check if user metadata already exists
        const existingUser = await Users.findOne({ uid: targetUser.id });
        if (existingUser) {
            return res.status(409).json({
                success: false, 
                message: "Metadata already exists for this user",
                data: existingUser
            });
        }

        // Create metadata for the specific user
        const metaData = {
            uid: targetUser.id,
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
        console.log(`Metadata saved for user: ${targetUser.id} (${email})`);

        res.status(201).json({
            success: true, 
            message: "Metadata created successfully", 
            data: metaData,
            userEmail: targetUser.email,
            userId: targetUser.id
        });

    } catch (error) {
        console.error("Error in updateMetadata:", error)
        res.status(500).json({success: false, message: "Server error", error: error.message})
    }
}
 