import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import imageCompression from 'browser-image-compression';


const socket = io("http://localhost:5000");

function extractChats(response) {
  return response.message;
}

function ChatRoom() {
  const [chats, setChats] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [Base64Img ,setBase64Img]= useState('');
  
  const User= localStorage.getItem("Username");
  
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
        const res = await axios.get("http://localhost:5000/api/chatRoom");
        const chatArray = extractChats(res.data);
        setChats(chatArray);
      } catch (err) {
        console.error("Error fetching chats:", err);
      }
    };

    fetchChats();
  }, []);

  // used to send the data to the database
  useEffect(() => {
    socket.on("newMessage", (newMsg) => {
      setChats((prevChats) => [...prevChats, newMsg]);
    });

    return () => {
      socket.off("newMessage");
    };
  }, []);

  const handleSend = async () => {
    if (inputMessage.trim() === "") return;

    const payload = {
      Grpid: "group123",
      Sender: User,
      Message: inputMessage,
      image: Base64Img
    };

    try {
      await axios.post("http://localhost:5000/api/messageSave", payload);
      setInputMessage(""); 
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div>
      <h2>Chat Messages</h2>
      <ul>
        {chats.map((chat, index) => (
          <li key={index}>
            <strong>{chat.Sender}:</strong> {chat.Message}
          </li>
        ))}
      </ul>
      
   
      <input
        type="text"
        value={inputMessage}
        placeholder="Enter your message"
        onChange={(e) => setInputMessage(e.target.value)}
         onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />

<input type="file"  accept="image/*" onChange={handleImage}/>
      
      <button onClick={handleSend}>Send Message</button>
    </div>
  );
}

export default ChatRoom;