import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import imageCompression from 'browser-image-compression';
import { supabase } from './Supabase';
import './ChatRoom.css';


const socket = io("http://localhost:8081", {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

function extractChats(response) {
  return response.message;
}

function ChatRoom() {
  const [chats, setChats] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [Base64Img, setBase64Img] = useState('');
  const [selectedGroup, setSelectedGroup] = useState("group123");
  const [selectedGroupName, setSelectedGroupName] = useState("Default Group");
  const [TheUser, setTheUser] = useState('Guest');
  const [userMetadata, setUserMetadata] = useState(null);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [newGroupData, setNewGroupData] = useState({
    groupName: '',
    members: '',
    saveChats: true
  });

  // Default groups that will be replaced by user metadata
  const [userGroups, setUserGroups] = useState([
    { id: "group123", name: "Default Group" },
    { id: "group456", name: "Study Group" },
    { id: "group789", name: "Work Team" }
  ]);

  const User = localStorage.getItem("Username");
  const userEmail = localStorage.getItem("userEmail");

  // Load user metadata from localStorage and/or fetch it from the server
  useEffect(() => {
    // First try to get metadata from localStorage
    const storedMetadata = localStorage.getItem('userMetadata');

    // Get current user from Supabase
    const getCurrentUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
          console.error("Error fetching Supabase user:", error);
          return;
        }

        if (user) {
          console.log("Current Supabase user:", user);

          // Fetch user profile data to get display name
          const { data, error: profileError } = await supabase
            .from('profiles')
            .select('full_name, username')
            .eq('id', user.id)
            .single();

          if (profileError) {
            console.error("Error fetching user profile:", profileError);
          } else if (data) {
            console.log("User profile data:", data);
            // Use full_name if available, otherwise username, otherwise email
            const displayName = data.full_name || data.username || user.email;
            setTheUser(displayName);
            console.log("Set user display name to:", displayName);
          }
        }
      } catch (err) {
        console.error("Error in getCurrentUser:", err);
      }
    };

    // Call the function to get current user
    getCurrentUser();

    if (storedMetadata) {
      try {
        const parsedMetadata = JSON.parse(storedMetadata);
        setUserMetadata(parsedMetadata);
        console.log("Loaded user metadata from localStorage:", parsedMetadata);

        // If the metadata contains groups, use them
        if (parsedMetadata.grp_In && parsedMetadata.grp_In.length > 0) {
          const groups = parsedMetadata.grp_In.map(group => ({
            id: group.groupId,
            name: group.groupName || group.groupId, // Use groupName if available, otherwise use groupId
            role: group.role
          }));
          setUserGroups(groups);

          // Set first group as selected by default
          if (groups.length > 0) {
            setSelectedGroup(groups[0].id);
            setSelectedGroupName(groups[0].name);
          }
        }
      } catch (err) {
        console.error("Error parsing stored metadata:", err);
      }
    }

    // If we have an email, also try to fetch fresh metadata from server
    if (userEmail) {
      fetchUserMetadata(userEmail);
    }
  }, [userEmail]);

  // Function to fetch user metadata from server
  const fetchUserMetadata = async (email) => {
    try {
      const response = await axios.post('http://localhost:5000/api/getUserMetadata', { email });

      if (response.data.success) {
        const metadata = response.data.data;
        setUserMetadata(metadata);
        console.log("Fetched fresh user metadata:", metadata);

        // Update localStorage
        localStorage.setItem('userMetadata', JSON.stringify(metadata));

        // Update groups if available
        if (metadata.grp_In && metadata.grp_In.length > 0) {
          const groups = metadata.grp_In.map(group => ({
            id: group.groupId,
            name: group.groupName || group.groupId,
            role: group.role
          }));
          setUserGroups(groups);
        }
      }
    } catch (error) {
      console.error("Error fetching user metadata:", error);
    }
  };

  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chats]);

  // Function to add a new group to user metadata
  const addGroupToMetadata = async (newGroup) => {
    try {
      if (!userMetadata || !userMetadata.uid) {
        console.error("No user metadata available to update");
        return false;
      }

      // Create new group data with enhanced details
      const newGroupEntry = {
        groupId: newGroup.id,
        groupName: newGroup.name,
        role: "admin", // Creator is admin by default
        createdAt: newGroup.createdAt,
        createdBy: newGroup.createdBy,
        members: newGroup.members,
        saveChats: newGroup.saveChats
      };

      // Create updated metadata
      const updatedGroups = [
        ...userMetadata.grp_In,
        newGroupEntry
      ];

      // Make API call to update user metadata
      const response = await axios.post('http://localhost:5000/api/updateUserGroups', {
        uid: userMetadata.uid,
        email: userEmail,
        newGroup: newGroupEntry
      });

      if (response.data.success) {
        // Update local state
        const updatedMetadata = {
          ...userMetadata,
          grp_In: updatedGroups
        };

        setUserMetadata(updatedMetadata);
        localStorage.setItem('userMetadata', JSON.stringify(updatedMetadata));

        // Update groups list
        setUserGroups(prev => [
          ...prev,
          {
            id: newGroup.id,
            name: newGroup.name,
            role: "admin"
          }
        ]);

        console.log("Group added to metadata:", newGroup);
        return true;
      } else {
        console.error("Failed to update user metadata:", response.data.message);
        return false;
      }
    } catch (error) {
      console.error("Error updating user metadata with new group:", error);
      return false;
    }
  };

  // Function to handle creating a new group
  const handleCreateGroup = async () => {
    try {
      // Validate input
      if (!newGroupData.groupName.trim()) {
        alert("Please enter a group name");
        return;
      }

      // Generate a unique group ID
      const groupId = `group_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      // Create new group object with more details
      const newGroup = {
        id: groupId,
        name: newGroupData.groupName,
        members: newGroupData.members.split(',').map(m => m.trim()).filter(m => m),
        saveChats: newGroupData.saveChats,
        createdBy: TheUser,
        createdAt: new Date().toISOString()
      };

      // First, add the group to user metadata in database
      const success = await addGroupToMetadata(newGroup);

      if (success) {
        // Set this as the selected group
        setSelectedGroup(groupId);
        setSelectedGroupName(newGroupData.groupName);

        // Reset form and close modal
        setNewGroupData({
          groupName: '',
          members: '',
          saveChats: true
        });

        setShowNewGroupModal(false);

        console.log("New group created:", newGroup);
      } else {
        alert("Failed to create new group. Please try again.");
      }
    } catch (error) {
      console.error("Error creating group:", error);
      alert("Error creating group. Please try again.");
    }
  };
  // Function to get current group details from metadata
  const getCurrentGroupDetails = () => {
    if (!userMetadata || !userMetadata.grp_In || userMetadata.grp_In.length === 0) {
      return null;
    }

    const currentGroup = userMetadata.grp_In.find(group => group.groupId === selectedGroup);
    return currentGroup || null;
  };

  // Render group info component
  const GroupInfoPanel = () => {
    const groupDetails = getCurrentGroupDetails();

    if (!groupDetails) {
      return <div className="group-info-panel">
        <h3>{selectedGroupName}</h3>
        <p>No additional information available</p>
      </div>;
    }

    return (
      <div className="group-info-panel">
        <h3>{groupDetails.groupName || groupDetails.groupId}</h3>
        {groupDetails.createdBy && (
          <p>Created by: {groupDetails.createdBy}</p>
        )}
        {groupDetails.createdAt && (
          <p>Created: {new Date(groupDetails.createdAt).toLocaleDateString()}</p>
        )}
        {groupDetails.members && groupDetails.members.length > 0 && (
          <div>
            <p>Members:</p>
            <ul>
              {groupDetails.members.map((member, index) => (
                <li key={index}>{member}</li>
              ))}
            </ul>
          </div>
        )}
        <p>Your role: {groupDetails.role || 'member'}</p>
      </div>
    );
  };

  const handleImage = async function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const options = {
      maxSizeMB: 0.2,             // Max size ~200KB
      maxWidthOrHeight: 500,      // Resize dimensions
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      const reader = new FileReader();

      reader.onloadend = () => {
        const Base64 = reader.result;
        setBase64Img(Base64);
        console.log("Base64 Image String:", Base64Img);
      };

      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Image compression failed:", error);
    }
  };

  // gets the data from the database
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await axios.get(`http://localhost:8081/api/chat/${selectedGroup}`);
        const chatArray = extractChats(res.data);
        // Backend returns "message" which contains the array.
        // We need to map it if the field names are different.
        // Controller returns: { Message: 1, _id: 0, Sender: 1 }
        // ChatRoom expects: Sender, Message, image
        setChats(chatArray);
      } catch (err) {
        console.error("Error fetching chats:", err);
      }
    };

    fetchChats();
  }, [selectedGroup]);

  // Socket connection and message handling
  useEffect(() => {
    // Log current socket state
    console.log("🔌 Socket connected status:", socket.connected);
    console.log("🔌 Socket ID:", socket.id);

    // Socket connection event listeners
    const onConnect = () => {
      console.log("✅ Socket connected successfully! ID:", socket.id);
      // Join the current group room when connected
      socket.emit("joinGroup", selectedGroup);
    };

    const onDisconnect = (reason) => {
      console.log("❌ Socket disconnected. Reason:", reason);
    };

    const onConnectError = (error) => {
      console.error("🚨 Socket connection error:", error.message);
    };

    const onNewMessage = (newMsg) => {
      console.log("📩 Received new message via socket:", newMsg);
      // Only add messages for the currently selected group
      if (newMsg.Grpid === selectedGroup) {
        setChats((prevChats) => {
          // Check if message already exists (to prevent duplicates)
          const isDuplicate = prevChats.some(
            (chat) => 
              chat.Sender === newMsg.Sender && 
              chat.Message === newMsg.Message &&
              chat.image === newMsg.image
          );
          if (isDuplicate) {
            console.log("⚠️ Duplicate message detected, skipping");
            return prevChats;
          }
          return [...prevChats, newMsg];
        });
      }
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("newMessage", onNewMessage);

    // If already connected, join the group
    if (socket.connected) {
      console.log("🔗 Already connected, joining group:", selectedGroup);
      socket.emit("joinGroup", selectedGroup);
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("newMessage", onNewMessage);
    };
  }, [selectedGroup]);

  const handleSend = async () => {
    if (inputMessage.trim() === "" && !Base64Img) {
      // Don't send if both message and image are empty
      return;
    }

    const payload = {
      Group: selectedGroup,
      Sender: TheUser,                                   // Use the display name from Supabase
      Message: inputMessage,
      image: Base64Img || ''  // Ensure image is never undefined
    };

    try {
      // Save to database first
      await axios.post(`http://localhost:8081/api/chat/${selectedGroup}`, payload);

      // Emit to socket - server will broadcast to ALL clients (including sender)
      // The newMessage listener will handle adding it to the chat
      socket.emit("newMessage", { ...payload, Grpid: selectedGroup });

      setInputMessage("");
      setBase64Img('');
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleGroupSelect = (groupId, groupName) => {
    setSelectedGroup(groupId);
    setSelectedGroupName(groupName);
    // Clear current chat messages when changing groups
    setChats([]);
  };

  const handleNewGroupClick = () => {
    setShowNewGroupModal(true);
  };

  const handleCloseModal = () => {
    setShowNewGroupModal(false);
    setNewGroupData({
      groupName: '',
      members: '',
      saveChats: true
    });
  };

  return (
    <>
      <div className="chat-container">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-header">
            <h2>QUORUM</h2>
          </div>

          <div className="new-group-btn">
            <button onClick={handleNewGroupClick}>NEW GRP</button>
          </div>

          <div className="groups-section">

            <div className="groups-list">
              {userGroups.map((group) => (
                <div
                  key={group.id}
                  className={`group-item ${selectedGroup === group.id ? 'active' : ''}`}
                  onClick={() => handleGroupSelect(group.id, group.name)}
                >
                  {group.name}
                </div>
              ))}
            </div>
          </div>

          <div className="settings-section">
            <button>Change Theme</button>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="chat-main">
          {/* Chat Header */}
          <div className="chat-header">
            <div className="group-avatar"></div>
            <span className="group-name">{selectedGroupName}</span>
            <button className="info-button" onClick={() => setShowGroupInfo(prev => !prev)}>
              {showGroupInfo ? 'Hide Info' : 'Group Info'}
            </button>
          </div>

          {/* Group Info Panel (conditionally rendered) */}
          {showGroupInfo && <GroupInfoPanel />}

          {/* Chat Messages Area */}
          <div className="chat-messages">

            <div className="messages-list">
              {chats.map((chat, index) => (
                <div key={index} className="message-item">
                  <strong>{chat.Sender}:</strong> {chat.Message}
                  {chat.image && (
                    <img src={chat.image} alt="shared" className="message-image" />
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="input-area">
            <input
              type="text"
              value={inputMessage}
              placeholder="Enter your message"
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="message-input"
            />

            <button onClick={handleSend} className="send-button">Send Message</button>
          </div>
        </div>
      </div>

      {/* New Group Modal */}
      {showNewGroupModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>Create New Group</h2>
              <button className="close-btn" onClick={handleCloseModal}>✖</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="groupName">Group Name</label>
                <input
                  type="text"
                  id="groupName"
                  placeholder="Enter group name"
                  value={newGroupData.groupName}
                  onChange={(e) => setNewGroupData(prev => ({ ...prev, groupName: e.target.value }))}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="members">Add Members</label>
                <textarea
                  id="members"
                  placeholder="Enter usernames separated by commas (e.g., user1, user2, user3)"
                  value={newGroupData.members}
                  onChange={(e) => setNewGroupData(prev => ({ ...prev, members: e.target.value }))}
                  className="form-textarea"
                  rows="3"
                />
                <small className="form-hint">Enter usernames separated by commas</small>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newGroupData.saveChats}
                    onChange={(e) => setNewGroupData(prev => ({ ...prev, saveChats: e.target.checked }))}
                    className="checkbox-input"
                  />
                  <span className="checkbox-custom"></span>
                  Save chat history for this group
                </label>
                <small className="form-hint">Enable this to store all messages permanently</small>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={handleCloseModal}>
                Cancel
              </button>
              <button className="btn-create" onClick={handleCreateGroup}>
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatRoom;
