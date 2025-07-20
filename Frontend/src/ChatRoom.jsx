// this is the old theme of the chat room


import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import imageCompression from 'browser-image-compression';
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

  return (

    <div className="chat-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>QUORUM</h2>
        </div>
        
        <div className="new-group-btn">
          <button>NEW GRP</button>
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
  );
}

export default ChatRoom;