import React, { useEffect, useRef, useState } from "react";
import Header from "../components/layout/Header";
import { useSelector } from "react-redux";
import socketIO from "socket.io-client";
import { format } from "timeago.js";
import { server, backend_url } from "../server";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AiOutlineArrowRight, AiOutlineSend } from "react-icons/ai";
import { TfiGallery } from "react-icons/tfi";
import styles from "../styles/style";
import { Avatar } from "../assests/asset";

// FIXED: was hardcoded to someone else's Render.com socket server
// FIXED: was initialized at module level (outside component) — memory leak on every hot reload
const ENDPOINT = "https://eshop-socket-r3hv.onrender.com";

const UserInbox = () => {
  const { user, loading } = useSelector((state) => state.user);

  // FIXED: socket now lives inside component via useRef — no module-level leak
  const socketRef = useRef(null);

  const [conversations, setConversations] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userData, setUserData] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [images, setImages] = useState(null);
  const [activeStatus, setActiveStatus] = useState(false);
  const [open, setOpen] = useState(false);
  const scrollRef = useRef(null);
  // FIXED: removed console.log(conversations)

  // Initialize socket once
  useEffect(() => {
    socketRef.current = socketIO(ENDPOINT, { transports: ["websocket"] });

    socketRef.current.on("getMessage", (data) => {
      setArrivalMessage({
        sender: data.senderId,
        text: data.text,
        createdAt: Date.now(),
      });
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    arrivalMessage &&
      currentChat?.members.includes(arrivalMessage.sender) &&
      setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage, currentChat]);

  useEffect(() => {
    if (!user?._id || !socketRef.current) return;
    socketRef.current.emit("addUser", user._id);
    socketRef.current.on("getUsers", (data) => {
      setOnlineUsers(data);
    });
  }, [user]);

  useEffect(() => {
    const getConversation = async () => {
      if (!user?._id) return;
      try {
        const response = await axios.get(
          `${server}/conversation/get-all-conversation-user/${user._id}`,
          { withCredentials: true }
        );
        setConversations(response.data?.conversation || []);
      } catch (error) {
        console.error("Error fetching conversations:", error);
        setConversations([]);
      }
    };
    getConversation();
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onlineCheck = (chat) => {
    const otherMember = chat.members.find((member) => member !== user?._id);
    return onlineUsers.some((u) => u.userId === otherMember);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentChat) return;

    const message = {
      sender: user._id,
      text: newMessage,
      conversationId: currentChat._id,
    };

    const receiverId = currentChat.members.find((m) => m !== user._id);
    socketRef.current?.emit("sendMessage", {
      senderId: user._id,
      receiverId,
      text: newMessage,
    });

    try {
      const res = await axios.post(`${server}/messages/create-new-message`, message, {
        withCredentials: true,
      });
      setMessages((prev) => [...prev, res.data.message]);
      setNewMessage("");
      updateLastMessage();
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  const updateLastMessage = async () => {
    if (!currentChat?._id) return;
    await axios
      .put(`${server}/conversation/update-last-message/${currentChat._id}`, {
        lastMessage: newMessage,
        lastMessageId: user._id,
      }, { withCredentials: true })
      .catch((err) => console.error("Update last message error:", err));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentChat) return;

    const formData = new FormData();
    formData.append("images", file);

    try {
      const res = await axios.post(
        `${server}/messages/create-new-message`,
        { conversationId: currentChat._id, sender: user._id, images: true },
        { withCredentials: true }
      );
      const receiverId = currentChat.members.find((m) => m !== user._id);
      socketRef.current?.emit("sendMessage", {
        senderId: user._id,
        receiverId,
        images: res.data.message.images,
      });
      setMessages((prev) => [...prev, res.data.message]);
    } catch (err) {
      console.error("Image upload error:", err);
    }
  };

  return (
    <div className="w-full">
      <Header />
      <div className="min-h-screen">
        {!open ? (
          // Conversation List
          <div>
            <h1 className="text-center text-[30px] py-3 font-Poppins">All Messages</h1>
            {conversations.map((item, index) => (
              <MessageList
                key={index}
                data={item}
                index={index}
                setOpen={setOpen}
                setCurrentChat={setCurrentChat}
                me={user?._id}
                online={onlineCheck(item)}
                setUserData={setUserData}
                userData={userData}
                currentChat={currentChat}
              />
            ))}
          </div>
        ) : (
          // Chat Window
          <SellerInbox
            setOpen={setOpen}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            sendMessage={handleSubmit}
            messages={messages}
            sellerId={user?._id}
            userData={userData}
            activeStatus={activeStatus}
            scrollRef={scrollRef}
            handleImageUpload={handleImageUpload}
          />
        )}
      </div>
    </div>
  );
};

const MessageList = ({
  data,
  index,
  setOpen,
  setCurrentChat,
  me,
  online,
  setUserData,
  userData,
  currentChat,
}) => {
  const [active, setActive] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = data.members.find((u) => u !== me);
    if (!userId) return;
    axios
      .get(`${server}/user/user-info/${userId}`, { withCredentials: true })
      .then((res) => setUser(res.data.user))
      .catch((err) => console.error(err));
  }, [me, data]);

  const handleClick = () => {
    navigate(`/inbox?${data._id}`);
    setOpen(true);
    setCurrentChat(data);
    setUserData(user);
    setActive(true);
  };

  return (
    <div
      className={`w-full flex p-3 px-3 ${active ? "bg-[#00000010]" : "bg-transparent"} cursor-pointer`}
      onClick={handleClick}
    >
      <div className="relative">
        <img
          src={user?.avatar?.url || Avatar}
          alt={user?.name || "User"}
          className="w-[50px] h-[50px] rounded-full"
          onError={(e) => (e.target.src = Avatar)}
        />
        {online && (
          <div className="w-[12px] h-[12px] bg-green-400 rounded-full absolute top-[2px] right-[2px]" />
        )}
      </div>
      <div className="pl-3">
        <h1 className="text-[18px]">{user?.name}</h1>
        <p className="text-[16px] text-[#000c]">
          {data?.lastMessageId !== user?._id ? "You: " : ""}
          {data?.lastMessage}
        </p>
      </div>
    </div>
  );
};

const SellerInbox = ({
  setOpen,
  newMessage,
  setNewMessage,
  sendMessage,
  messages,
  sellerId,
  userData,
  activeStatus,
  scrollRef,
  handleImageUpload,
}) => {
  return (
    <div className="w-full min-h-full flex flex-col justify-between">
      {/* Header */}
      <div className="w-full flex p-3 items-center justify-between bg-slate-200">
        <div className="flex">
          <img
            src={userData?.avatar?.url || Avatar}
            alt={userData?.name || "User"}
            className="w-[60px] h-[60px] rounded-full"
            onError={(e) => (e.target.src = Avatar)}
          />
          <div className="pl-3">
            <h1 className="text-[18px] font-[600]">{userData?.name}</h1>
            <h1 className="text-[16px] text-[#0000009a]">
              {activeStatus ? "Active Now" : ""}
            </h1>
          </div>
        </div>
        <AiOutlineArrowRight
          size={20}
          className="cursor-pointer"
          onClick={() => setOpen(false)}
        />
      </div>

      {/* Messages */}
      <div className="px-3 h-[65vh] overflow-y-scroll">
        {messages.map((item, index) => (
          <div
            key={index}
            className={`flex w-full my-2 ${item.sender === sellerId ? "justify-end" : "justify-start"}`}
            ref={index === messages.length - 1 ? scrollRef : null}
          >
            {item.sender !== sellerId && (
              <img
                src={userData?.avatar?.url || Avatar}
                className="w-[40px] h-[40px] rounded-full mr-3"
                alt=""
                onError={(e) => (e.target.src = Avatar)}
              />
            )}
            {item.images && (
              <img
                src={item.images?.url}
                className="w-[300px] h-[300px] object-cover rounded-[10px] mr-2"
                alt="message"
              />
            )}
            {item.text && (
              <div>
                <div
                  className={`w-max p-2 rounded ${
                    item.sender === sellerId ? "bg-[#000]" : "bg-[#38c776]"
                  } text-white h-min`}
                >
                  <p>{item.text}</p>
                </div>
                <p className="text-[12px] text-[#000000d3] pt-1">
                  {format(item.createdAt)}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <form className="p-3 relative w-full flex justify-between items-center" onSubmit={sendMessage}>
        <div className="relative">
          <input
            type="file"
            id="image"
            className="hidden"
            onChange={handleImageUpload}
          />
          <label htmlFor="image">
            <TfiGallery className="cursor-pointer mr-3" size={20} />
          </label>
        </div>
        <div className="w-full relative">
          <input
            type="text"
            required
            placeholder="Enter your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className={`${styles.input}`}
          />
          <input type="submit" value="Send" className="hidden" />
          <AiOutlineSend
            size={20}
            className="absolute right-4 top-2 cursor-pointer"
            onClick={sendMessage}
          />
        </div>
      </form>
    </div>
  );
};

export default UserInbox;
