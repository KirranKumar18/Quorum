// this is the old theme of the chat room


import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import imageCompression from 'browser-image-compression';
import { supabase } from './Supabase';
import './ChatRoom.css';


const socket = io("http://localhost:5000");

function extractChats(response) {
  return response.message;
}

function ChatRoom() {
  const [chats, setChats] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [Base64Img, setBase64Img] = useState('');
  const [selectedGroup, setSelectedGroup] = useState("group123");
  const [selectedGroupName, setSelectedGroupName] = useState("Default Group");
  const [TheUser, setTheUser] = useState('Guest')
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [newGroupData, setNewGroupData] = useState({
    groupName: '',
    members: '',
    saveChats: true
  });
  
  // Default 3 groups for now - later will be fetched from user metadata
  const [userGroups, setUserGroups] = useState([
    { id: "group123", name: "Default Group" },
    { id: "group456", name: "Study Group" },
    { id: "group789", name: "Work Team" }
  ]);
   
  const User = localStorage.getItem("Username");
  
const handleImage = async function(event) {
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
        const res = await axios.get(`http://localhost:5000/api/chatRoom?groupId=${selectedGroup}`);
        const chatArray = extractChats(res.data);
        setChats(chatArray);
      } catch (err) {
        console.error("Error fetching chats:", err);
      }
    };

    fetchChats();
  }, [selectedGroup]);

  // used to send the data to the database
  useEffect(() => {
    // Socket connection event listeners
    socket.on("connect", () => {
      console.log("✅ Socket connected successfully!");
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    socket.on("newMessage", (newMsg) => {
    
      setChats((prevChats) => [...prevChats, newMsg]);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("newMessage");
    };
  }, []);

  const handleSend = async () => {
    if (inputMessage.trim() === "") return;

    const payload = {
      Grpid: selectedGroup,
      Sender: "User",                                   // now fixing this
      Message: inputMessage,
      image: Base64Img
    };

    try {
      await axios.post("http://localhost:5000/api/messageSave", payload);
      setInputMessage(""); 
      setBase64Img('');
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleGroupSelect = (groupId, groupName) => {
    setSelectedGroup(groupId);
    setSelectedGroupName(groupName);
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

  const handleCreateGroup = async () => {
    if (!newGroupData.groupName.trim()) {
      alert("Please enter a group name");
      return;
    }

    try {
      // Here you would make an API call to create the group
      const newGroupId = `group_${Date.now()}`;
      const newGroup = {
        id: newGroupId,
        name: newGroupData.groupName,
        members: newGroupData.members.split(',').map(m => m.trim()).filter(m => m),
        saveChats: newGroupData.saveChats
      };

      // Add to userGroups state
      setUserGroups(prev => [...prev, { id: newGroupId, name: newGroupData.groupName }]);
      
      console.log("New group created:", newGroup);
      handleCloseModal();
      
      // Optionally switch to the new group
      setSelectedGroup(newGroupId);
      setSelectedGroupName(newGroupData.groupName);
      
    } catch (error) {
      console.error("Error creating group:", error);
    }
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
        </div>
        
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
                onChange={(e) => setNewGroupData(prev => ({...prev, groupName: e.target.value}))}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="members">Add Members</label>
              <textarea
                id="members"
                placeholder="Enter usernames separated by commas (e.g., user1, user2, user3)"
                value={newGroupData.members}
                onChange={(e) => setNewGroupData(prev => ({...prev, members: e.target.value}))}
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
                  onChange={(e) => setNewGroupData(prev => ({...prev, saveChats: e.target.checked}))}
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