import React, { useState, useEffect, useRef } from "react";
import "../styles/user/ChatAi.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faPaperPlane,
  faBars,
  faPenSquare,
} from "@fortawesome/free-solid-svg-icons";
import chatbotIcon from "../assets/chatbot.png";

const ChatAi = ({ projectId, fetchMembers }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isCreateConversationOpen, setIsCreateConversationOpen] =
    useState(false);
  const [conversationName, setConversationName] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const dropdownRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const modalRef = useRef(null);

  // Fetch list conversations
  const fetchConversations = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("User ID not found. Please log in again.");
      return;
    }

    try {
      const response = await fetch(
        "https://n8n.quanliduan-pms.site/webhook/get-list_conversation",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": "230605",
          },
          body: JSON.stringify({ userId }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch conversations: ${response.status}`);
      }

      const data = await response.json();
      const mappedMembers = data.map((conv, index) => ({
        name: conv.name_conversation,
        id: conv.id,
        email: `conv${conv.id}@example.com`, // Generated for compatibility
      }));
      setMembers(mappedMembers);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      alert("Failed to load conversations. Please try again.");
    }
  };

  // Load conversations when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchConversations();
    }
  }, [isOpen]);

  // Fetch message history when selecting a conversation
  const fetchMessageHistory = async (conversationId) => {
    setIsLoadingMessages(true);
    setMessages([]);

    try {
      const response = await fetch(
        "https://n8n.quanliduan-pms.site/webhook/get_mess-conversation",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": "230605",
          },
          body: JSON.stringify({ conversation_id: conversationId }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch message history: ${response.status}`);
      }

      const data = await response.json();
      if (typeof data === "object" && !Array.isArray(data)) {
        setMessages([]); // Display "no messages yet" in UI
      } else {
        const mappedMessages = data.map((msg) => ({
          content: msg.message,
          messageBy: msg.message_by, // Use message_by directly
          timestamp: msg.sended_at,
        }));
        setMessages(mappedMessages);
      }
    } catch (error) {
      console.error("Error fetching message history:", error);
      alert("Failed to load message history. Please try again.");
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // When selecting a member, fetch history
  useEffect(() => {
    if (selectedMember && selectedMember.id) {
      fetchMessageHistory(selectedMember.id);
    }
  }, [selectedMember]);

  // Đóng dropdown khi nhấn ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSelectedMember(null);
        setSearchQuery("");
        setIsMobileMenuOpen(false);
      }
      if (
        isCreateConversationOpen &&
        modalRef.current &&
        !modalRef.current.contains(event.target)
      ) {
        setIsCreateConversationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCreateConversationOpen]);

  // Xử lý mở/đóng danh sách thành viên
  const handleToggleMembers = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setSelectedMember(null);
      setSearchQuery("");
    }
  };

  // Xử lý mở/đóng menu mobile
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Xử lý gửi tin nhắn
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedMember || !selectedMember.id) return;

    const userMsg = {
      content: newMessage,
      messageBy: "USER",
      timestamp: new Date().toISOString(),
    };
    setMessages([...messages, userMsg]);
    setNewMessage("");
    setIsTyping(true); // Show typing indicator

    const payload = {
      conversation_id: selectedMember.id,
      message: newMessage,
    };

    try {
      const response = await fetch(
        "https://n8n.quanliduan-pms.site/webhook/chatbot_web_active",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": "230605",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`);
      }

      const data = await response.json();
      setIsTyping(false);
      if (data && data.length > 0 && data[0].output) {
        typeMessage(data[0].output); // Type out AI response
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
      setIsTyping(false);
    }
  };

  // Typing effect for AI message
  const typeMessage = (text) => {
    let i = 0;
    const aiMsg = {
      content: "",
      messageBy: "AI_AGENT",
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, aiMsg]);

    const typingInterval = setInterval(() => {
      if (i < text.length) {
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          updatedMessages[updatedMessages.length - 1].content = text.slice(
            0,
            i + 1
          );
          return updatedMessages;
        });
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, 50); // 50ms per character
  };

  // Xử lý nhấn Enter để gửi tin nhắn
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  // Xử lý tạo cuộc trò chuyện mới
  const handleCreateConversation = async () => {
    if (!conversationName.trim()) {
      alert("Conversation name is required!");
      return;
    }

    const userName = localStorage.getItem("userName");
    const userId = localStorage.getItem("userId");

    if (!userName || !userId) {
      alert("User information not found. Please log in again.");
      return;
    }

    const payload = {
      name: conversationName,
      userName,
      userId,
    };

    try {
      const response = await fetch(
        "https://n8n.quanliduan-pms.site/webhook/create_conversation",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": "230605",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to create conversation: ${response.status}`);
      }

      alert("Conversation created successfully!");
      setConversationName("");
      setIsCreateConversationOpen(false);
      fetchConversations();
    } catch (error) {
      console.error("Error creating conversation:", error);
      alert("Failed to create conversation. Please try again.");
    }
  };

  // Cuộn xuống cuối danh sách tin nhắn
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Lấy chữ cái đầu của tên
  const getInitials = (name) =>
    name
      ? name
          .split(" ")
          .map((n) => n.charAt(0))
          .join("")
          .substring(0, 2)
          .toUpperCase()
      : "U";

  // Lấy màu avatar
  const getAvatarColor = (name) => {
    if (!name) return "#cccccc";
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEEAD",
      "#D4A5A5",
      "#9B59B6",
    ];
    return colors[name.charCodeAt(0) % colors.length];
  };

  // Đóng dropdown
  const handleCloseDropdown = () => {
    setIsOpen(false);
    setSelectedMember(null);
    setSearchQuery("");
  };

  // Lọc thành viên theo tìm kiếm
  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="ai-button-container" ref={dropdownRef}>
      <button
        className="ai-button"
        onClick={handleToggleMembers}
        title="Open AI Chat"
      >
        <img src={chatbotIcon} alt="Chatbot" className="ai-button-icon" />
      </button>
      {isOpen && (
        <div className="ai-dropdown">
          <button className="ai-hamburger-button" onClick={toggleMobileMenu}>
            <FontAwesomeIcon icon={faBars} />
          </button>
          <div className={`ai-members-list ${isMobileMenuOpen ? "open" : ""}`}>
            <div className="ai-dropdown-header">
              <h3 className="ai-dropdown-title">AI Chat</h3>
              <div
                className="ai-create-icon"
                onClick={() => setIsCreateConversationOpen(true)}
              >
                <FontAwesomeIcon icon={faPenSquare} />
              </div>
            </div>
            <div className="ai-search-input">
              <input
                type="text"
                placeholder="Search conversation ..."
                className="ai-search-member"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="ai-members-list-focus">
              <ul className="ai-members-list-items">
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member, index) => (
                    <li
                      key={index}
                      className={`ai-member-item ${
                        selectedMember && selectedMember.email === member.email
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => {
                        setSelectedMember(member);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <div className="ai-member-avatar">
                        <div
                          className="ai-member-initials"
                          style={{
                            backgroundColor: getAvatarColor(member.name),
                          }}
                        >
                          {getInitials(member.name)}
                        </div>
                      </div>
                      <div className="ai-member-info">
                        <p className="ai-member-name">{member.name}</p>
                      </div>
                    </li>
                  ))
                ) : (
                  <p className="ai-no-members">No members found</p>
                )}
              </ul>
            </div>
          </div>
          {isMobileMenuOpen && (
            <div className="ai-mobile-overlay" onClick={toggleMobileMenu}></div>
          )}
          <div className="ai-chat-content">
            {selectedMember ? (
              <div className="ai-chat-container-send">
                <div className="ai-chat-header">
                  <div className="ai-chat-name">
                    <p>{selectedMember.name}</p>
                  </div>
                  <button
                    className="ai-close-button"
                    onClick={handleCloseDropdown}
                    title="Close"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
                <div className="ai-chat-messages-chat">
                  {isLoadingMessages ? (
                    <div className="loading-chat">
                      <p>Loading messages...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="no-chat-mess">
                      <p>no messages yet.</p>
                    </div>
                  ) : (
                    messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`ai-message ${
                          msg.messageBy === "USER"
                            ? "ai-message-right"
                            : "ai-message-left"
                        }`}
                      >
                        <p>{msg.content}</p>
                      </div>
                    ))
                  )}
                  {isTyping && (
                    <div className="ai-message-left ai-typing-indicator">
                      <span>...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div className="ai-chat-input">
                  <div className="ai-chat-input-content">
                    <input
                      type="text"
                      placeholder="Enter message ..."
                      className="ai-input-message"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                  </div>
                  <div className="ai-send-icon" onClick={sendMessage}>
                    <FontAwesomeIcon icon={faPaperPlane} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="ai-no-selection">
                <p>Select a member to start chatting.</p>
              </div>
            )}
          </div>
          {isCreateConversationOpen && (
            <div className="ai-popup-overlay">
              <div className="ai-popup-modal" ref={modalRef}>
                <div className="ai-popup-header">
                  <h3 className="ai-popup-title">Create New Conversation</h3>
                  <button
                    className="ai-close-button"
                    onClick={() => setIsCreateConversationOpen(false)}
                    title="Close"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
                <div className="ai-popup-content">
                  <input
                    type="text"
                    placeholder="Enter name conversation ..."
                    className="ai-input-conversation-name"
                    value={conversationName}
                    onChange={(e) => setConversationName(e.target.value)}
                  />
                </div>
                <div className="ai-popup-actions">
                  <button
                    className="ai-popup-create-button"
                    onClick={handleCreateConversation}
                  >
                    Create
                  </button>
                  <button
                    className="ai-popup-cancel-button"
                    onClick={() => setIsCreateConversationOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatAi;
