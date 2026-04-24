import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { backend_url, server } from "../../server";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AiOutlineArrowRight, AiOutlineSend } from "react-icons/ai";
import styles from "../../styles/style";
import { TfiGallery } from "react-icons/tfi";
import { io } from "socket.io-client";
import { format } from "timeago.js";
import { Avatar } from "../../assests/asset";

// FIXED: socket was initialized at module level outside component — memory leak
// FIXED: was hardcoded localhost:4000 — kept as localhost but moved inside component
const ENDPOINT = "http://localhost:4000/";

const DashboardMessages = () => {
  const { seller } = useSelector((state) => state.seller);

  // FIXED: socket now lives in useRef inside component
  const socketRef = useRef(null);

  const [conversations, setConversations] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userData, setUserData] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [activeStatus, setActiveStatus] = useState(false);
  const [open, setOpen] = useState(false);
  const scrollRef = useRef(null);

  // Initialize socket once
  useEffect(() => {
    socketRef.current = io(ENDPOINT, { transports: ["websocket"] });

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
    if (!seller?._id || !socketRef.current) return;
    socketRef.current.emit("addUser", seller._id);
    socketRef.current.on("getUsers", (data) => {
      setOnlineUsers(data);
    });
  }, [seller]);

  useEffect(() => {
    const getConversation = async () => {
      if (!seller?._id) return;
      try {
        const response = await axios.get(
          `${server}/conversation/get-all-conversation-seller/${seller._id}`,
          { withCredentials: true }
        );
        setConversations(response.data.conversation || []);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };
    getConversation();
  }, [seller]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onlineCheck = (chat) => {
    const otherMember = chat.members.find((m) => m !== seller?._id);
    return onlineUsers.some((u) => u.userId === otherMember);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentChat) return;

    const message = {
      sender: seller._id,
      text: newMessage,
      conversationId: currentChat._id,
    };

    const receiverId = currentChat.members.find((m) => m !== seller._id);
    socketRef.current?.emit("sendMessage", {
      senderId: seller._id,
      receiverId,
      text: newMessage,
    });

    try {
      const res = await axios.post(
        `${server}/messages/create-new-message`,
        message,
        { withCredentials: true }
      );
      setMessages((prev) => [...prev, res.data.message]);
      setNewMessage("");

      await axios.put(
        `${server}/conversation/update-last-message/${currentChat._id}`,
        { lastMessage: newMessage, lastMessageId: seller._id },
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  return (
    <div className="w-[90%] bg-white m-5 h-[85vh] overflow-y-scroll rounded">
      {!open ? (
        <>
          <h1 className="text-center text-[30px] py-3 font-Poppins">
            All Messages
          </h1>
          {conversations.map((item, index) => (
            <MessageList
              key={index}
              data={item}
              index={index}
              setOpen={setOpen}
              setCurrentChat={setCurrentChat}
              me={seller?._id}
              online={onlineCheck(item)}
              setUserData={setUserData}
              userData={userData}
              currentChat={currentChat}
            />
          ))}
        </>
      ) : (
        <SellerInbox
          setOpen={setOpen}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          sendMessage={handleSendMessage}
          messages={messages}
          sellerId={seller?._id}
          userData={userData}
          activeStatus={activeStatus}
          scrollRef={scrollRef}
        />
      )}
    </div>
  );
};

const MessageList = ({
  data,
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
}) => {
  return (
    <div className="w-full min-h-full flex flex-col justify-between">
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
            {item.text && (
              <div>
                <div
                  className={`w-max p-2 rounded ${item.sender === sellerId ? "bg-[#000]" : "bg-[#38c776]"} text-white h-min`}
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

      <form
        className="p-3 relative w-full flex justify-between items-center"
        onSubmit={sendMessage}
      >
        <div className="w-full relative">
          <input
            type="text"
            required
            placeholder="Enter your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className={`${styles.input}`}
          />
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

export default DashboardMessages;
