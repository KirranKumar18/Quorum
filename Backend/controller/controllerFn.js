import message from "../config/model/messages.js";
import Users from "../config/model/users.js";
import supabase  from "../supabase.js"


export const fetchChats = async(req,res)=>{
    try {
        // Get the groupId from the query parameters
        const { groupId } = req.query;
        
        // Validate that groupId is provided
        if (!groupId) {
            return res.status(400).json({
                success: false, 
                message: "Group ID is required"
            });
        }
        
        // Query messages for the specific group only
        const Chats = await message.find({ Grpid: groupId }).sort({ createdAt: 1 });
        
        console.log(`Fetched ${Chats.length} messages for group: ${groupId}`);
        
        res.status(200).json({success: true, message: Chats});
    } catch (error) {
        console.log("Error while fetching chats: " + error.message);
        res.status(500).json({success: false, message: "Server error while fetching chats"});
    }
}
 /*                                         *******************************                          */
export const saveChats = async (req,res)=>{
    const messageBody = req.body;
    
    // Validate required fields - only Grpid and Sender are actually required
    if (!messageBody.Grpid || !messageBody.Sender) {
        console.log("Missing required fields:", {
            Grpid: !!messageBody.Grpid,
            Sender: !!messageBody.Sender
        });
        
        return res.status(400).json({
            success: false, 
            message: "Missing required fields (Group ID and Sender are required)"
        });
    }
    
    // Ensure Message or image exists (at least one must be present)
    if (!messageBody.Message && !messageBody.image) {
        console.log("Either Message or image must be provided");
        return res.status(400).json({
            success: false,
            message: "Either Message or image must be provided"
        });
    }

    // Create new message document
    const newMessage = new message(messageBody);

    try {
        // Save the message to the database
        await newMessage.save();

        // Emit the new message to connected clients using Socket.io
        const io = req.app.get('io');
        
        // Emit to the specific group's channel
        io.emit('newMessage', newMessage); // send to all connected clients
        
        console.log(`Message saved for group: ${messageBody.Grpid} from ${messageBody.Sender}`);
        
        res.status(201).json({
            success: true, 
            message: "Message saved successfully",
            data: newMessage
        });
    } catch (error) {
        console.log("Error saving message: " + error.message);
        res.status(500).json({
            success: false, 
            message: "Server error while saving message"
        });
    }
}   
 /*                                         *******************************                          */
export const updateMetadata = async (req, res) => {
    try {
        // Get email from request body or query params (for GET requests)
        const email = req.body.email || req.query.email;
        const isLogin = req.body.isLogin || req.query.isLogin;
        const isNewUser = req.body.isNewUser || req.query.isNewUser;
        
        if (!email) {
            return res.status(400).json({success: false, message: "Email is required (in request body or query params)"});
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({success: false, message: "Invalid email format"});
        }

        // Get or generate a user ID
        let userId;
        try {
            // Try to get a user ID from Supabase
            const { data: userData, error: userError } = await supabase
                .from('profiles') // or any appropriate Supabase table
                .select('id')
                .eq('email', email)
                .single();

            if (userData && userData.id) {
                userId = userData.id;
                console.log("Found user ID from Supabase profiles:", userId);
            } else {
                // Try auth API if available
                try {
                    const { data: authData, error: authError } = await supabase.auth.admin.getUserByEmail(email);
                    if (!authError && authData) {
                        userId = authData.id;
                        console.log("Found user ID from Supabase auth:", userId);
                    }
                } catch (authErr) {
                    console.log("Couldn't access auth admin API:", authErr.message);
                }
                
                // If still no user ID, generate one for testing
                if (!userId) {
                    userId = `user_${Date.now()}_${email.split('@')[0]}`;
                    console.log("Generated test user ID:", userId);
                }
            }
            
            // Check if user metadata already exists
            const existingUser = await Users.findOne({ uid: userId });
            
            if (existingUser) {
                console.log(`Metadata found for user ${email}:`, existingUser);
                
                // For login requests, return the existing metadata
                return res.status(200).json({
                    success: true,
                    message: "User metadata retrieved",
                    data: existingUser,
                    isExisting: true
                });
            } else if (isLogin || isNewUser) {
                // Create new metadata for the user
                const metaData = {
                    uid: userId,
                    grp_In:[{
                        groupId: "ABC grp",
                        role:"admin"
                    },{
                        groupId: "XYZ grp",
                        role:"member"
                    }]
                };
                
                const MD = new Users(metaData);
                await MD.save();
                console.log(`New metadata created for user: ${userId} (${email})`);
                
                return res.status(201).json({
                    success: true,
                    message: "New user metadata created successfully",
                    data: metaData,
                    userEmail: email,
                    userId: userId
                });
            } else {
                // No metadata exists but it's not a login or new user request
                return res.status(404).json({
                    success: false,
                    message: "No metadata exists for this user",
                    userEmail: email
                });
            }
        } catch (dbError) {
            console.error("Database operation error:", dbError);
            return res.status(500).json({
                success: false,
                message: "Database error while processing user metadata",
                error: dbError.message
            });
        }
    } catch (error) {
        console.error("Error in updateMetadata:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
}

/*                                         *******************************                          */
export const getUserMetadata = async (req, res) => {
    try {
        // Get email or uid from request
        const email = req.body.email || req.query.email;
        const uid = req.body.uid || req.query.uid;
        
        if (!email && !uid) {
            return res.status(400).json({
                success: false, 
                message: "Email or user ID is required"
            });
        }

        let query = {};
        
        if (uid) {
            query.uid = uid;
        } else {
            // Try to get user ID from email using Supabase
            try {
                const { data: userData, error: userError } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('email', email)
                    .single();
                
                if (userData && userData.id) {
                    query.uid = userData.id;
                } else {
                    // Try auth API
                    try {
                        const { data: authData, error: authError } = await supabase.auth.admin.getUserByEmail(email);
                        if (!authError && authData) {
                            query.uid = authData.id;
                        }
                    } catch (authErr) {
                        console.log("Auth API not accessible:", authErr.message);
                    }
                }
                
                // If we couldn't find a user ID, create a test query
                if (!query.uid && email) {
                    // Try to find any user metadata that might have been created with a generated ID containing the email username
                    const emailUsername = email.split('@')[0];
                    query.uid = { $regex: emailUsername };
                    console.log("Using regex search for user metadata:", query);
                }
            } catch (supabaseErr) {
                console.error("Supabase error:", supabaseErr);
                return res.status(500).json({
                    success: false,
                    message: "Error looking up user ID",
                    error: supabaseErr.message
                });
            }
        }
        
        // Find user metadata in MongoDB
        const userMetadata = await Users.findOne(query);
        
        if (!userMetadata) {
            return res.status(404).json({
                success: false,
                message: "User metadata not found",
                query: query
            });
        }
        
        console.log(`Metadata for ${email || uid}:`, userMetadata);
        
        return res.status(200).json({
            success: true,
            message: "User metadata retrieved successfully",
            data: userMetadata
        });
        
    } catch (error) {
        console.error("Error in getUserMetadata:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
}

/*                                         *******************************                          */
export const updateUserGroups = async (req, res) => {
    try {
        // Get user ID and new group from request
        const { uid, email, newGroup } = req.body;
        
        if (!uid && !email) {
            return res.status(400).json({ 
                success: false, 
                message: "User ID or email is required" 
            });
        }
        
        if (!newGroup || !newGroup.groupId) {
            return res.status(400).json({ 
                success: false, 
                message: "New group information is required" 
            });
        }
        
        // Find the user by UID or email
        let user;
        if (uid) {
            user = await Users.findOne({ uid });
        } else if (email) {
            // Try to get user ID from Supabase
            try {
                const { data: userData, error: userError } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('email', email)
                    .single();
                
                if (userData && userData.id) {
                    user = await Users.findOne({ uid: userData.id });
                }
                
                // If still no user, try generated ID pattern
                if (!user) {
                    const emailUsername = email.split('@')[0];
                    user = await Users.findOne({ uid: { $regex: emailUsername } });
                }
            } catch (error) {
                console.error("Error looking up user by email:", error);
            }
        }
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User metadata not found" 
            });
        }
        
        // Check if group already exists
        const groupExists = user.grp_In.some(group => group.groupId === newGroup.groupId);
        if (groupExists) {
            return res.status(409).json({ 
                success: true, // Still return success to avoid errors in client
                message: "Group already exists for this user", 
                data: user 
            });
        }
        
        // Add new group to user's groups
        user.grp_In.push({
            groupId: newGroup.groupId,
            role: newGroup.role || 'member'
        });
        
        // Save updated user
        await user.save();
        
        console.log(`Added group ${newGroup.groupId} to user ${user.uid}`);
        
        return res.status(200).json({ 
            success: true, 
            message: "Group added successfully", 
            data: user 
        });
        
    } catch (error) {
        console.error("Error in updateUserGroups:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
}