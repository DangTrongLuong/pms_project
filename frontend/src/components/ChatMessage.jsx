import React, { useState, useEffect, useRef } from "react";
import "../styles/user/ChatMessage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMessage,
  faTimes,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const ChatMessage = ({ projectId, fetchMembers }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const dropdownRef = useRef(null);
  const messagesEndRef = useRef(null);
  const stompClient = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  String.prototype.hashCode = function () {
    let hash = 0;
    if (this.length === 0) return hash;
    for (let i = 0; i < this.length; i++) {
      const char = this.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSelectedMember(null);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedMember) {
      fetchChatHistory();
      connectWebSocket();
    }
    return () => {
      if (stompClient.current && stompClient.current.connected) {
        stompClient.current.deactivate();
      }
    };
  }, [selectedMember]);

  const handleFetchMembers = async () => {
    if (isOpen) {
      setIsOpen(false);
      setSelectedMember(null);
      setSearchQuery("");
      return;
    }
    const userEmail = localStorage.getItem("userEmail")?.toLowerCase();
    if (!userEmail) {
      console.error("No userEmail found in localStorage");
      return;
    }
    const fetchedMembers = await fetchMembers();
    const filteredMembers = fetchedMembers.filter(
      (member) => member.email.toLowerCase() !== userEmail
    );
    setMembers(filteredMembers || []);
    setIsOpen(true);
  };

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    const authProvider = localStorage.getItem("authProvider");

    if (!refreshToken || authProvider !== "GOOGLE") {
      console.log("No valid refresh token or not Google auth");
      return false;
    }

    try {
      const response = await fetch(
        "http://localhost:8080/api/auth/refresh-token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        }
      );

      const data = await response.json();
      if (data.access_token) {
        localStorage.setItem("accessToken", data.access_token);
        localStorage.setItem(
          "tokenExpiresAt",
          Date.now() + data.expires_in * 1000
        );
        console.log("Access token refreshed successfully");
        return true;
      } else {
        console.error("Failed to refresh token:", data.error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("tokenExpiresAt");
        return false;
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("tokenExpiresAt");
      return false;
    }
  };

  const exchangeTokenForJwt = async () => {
    const authProvider = localStorage.getItem("authProvider");

    if (authProvider !== "GOOGLE") {
      const localToken = localStorage.getItem("accessToken");
      if (localToken) {
        localStorage.setItem("jwtToken", localToken);
        console.log(
          "Using local accessToken as jwtToken for non-Google account"
        );
        return localToken;
      } else {
        console.error("No accessToken found for non-Google account");
        return null;
      }
    }

    const expiresAt = localStorage.getItem("tokenExpiresAt");
    if (expiresAt && parseInt(expiresAt) < Date.now()) {
      const refreshed = await refreshAccessToken();
      if (!refreshed) {
        console.error("Failed to refresh token");
        return null;
      }
    }

    const googleToken = localStorage.getItem("accessToken");
    if (!googleToken) {
      console.error("No Google token found in localStorage");
      return null;
    }

    try {
      console.log("Sending Google token exchange request...");
      const response = await fetch(
        "http://localhost:8080/api/auth/exchange-token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ googleToken }),
          credentials: "include",
        }
      );

      console.log("Exchange response status:", response.status);
      if (response.ok) {
        const data = await response.json();
        console.log("Token exchange successful:", data);
        localStorage.setItem("jwtToken", data.accessToken);
        return data.accessToken;
      } else {
        const errorText = await response.text();
        console.error("Token exchange failed:", response.status, errorText);
        throw new Error(
          `Token exchange failed: ${response.status} - ${errorText}`
        );
      }
    } catch (error) {
      console.error("Error exchanging token:", error);
      return null;
    }
  };

  const connectWebSocket = async () => {
    const userId = localStorage.getItem("userId");
    const userEmail = localStorage.getItem("userEmail")?.toLowerCase();
    const authProvider = localStorage.getItem("authProvider");

    if (!userId || !userEmail) {
      console.error("User not authenticated: missing userId or userEmail");
      return;
    }

    let jwtToken = localStorage.getItem("jwtToken");
    if (!jwtToken) {
      jwtToken = await exchangeTokenForJwt();
      if (!jwtToken) {
        console.error("Failed to get JWT token");
        return;
      }
    }

    if (stompClient.current && stompClient.current.connected) {
      stompClient.current.deactivate();
    }

    const socket = new SockJS("http://localhost:8080/ws-chat");
    stompClient.current = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${jwtToken}`,
      },
      debug: function (str) {
        console.log("STOMP: " + str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.current.onConnect = (frame) => {
      console.log("STOMP connected!", frame);
      setIsConnected(true);

      const chatKey =
        Math.min(
          userEmail.hashCode(),
          selectedMember.email.toLowerCase().hashCode()
        ) +
        "-" +
        Math.max(
          userEmail.hashCode(),
          selectedMember.email.toLowerCase().hashCode()
        );

      stompClient.current.subscribe(
        `/topic/chat/${projectId}/${chatKey}`,
        (msg) => {
          try {
            const newMsg = JSON.parse(msg.body);
            setMessages((prev) => [...prev, newMsg]);
          } catch (error) {
            console.error("Error parsing message:", error);
          }
        }
      );
    };

    stompClient.current.onStompError = (frame) => {
      console.error("STOMP error:", frame);
      setIsConnected(false);
    };

    stompClient.current.onDisconnect = () => {
      console.log("STOMP disconnected");
      setIsConnected(false);
    };

    stompClient.current.onWebSocketError = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };

    stompClient.current.activate();
  };

  const fetchChatHistory = async () => {
    const userId = localStorage.getItem("userId");
    const userEmail = localStorage.getItem("userEmail")?.toLowerCase();
    if (!userId || !userEmail) {
      console.error(
        "User not authenticated for history: missing userId or userEmail"
      );
      return;
    }

    let accessToken = localStorage.getItem("jwtToken");
    if (!accessToken) {
      accessToken = await exchangeTokenForJwt();
      if (!accessToken) {
        console.error("Failed to get JWT token for history");
        return;
      }
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/chat/history?projectId=${projectId}&receiverEmail=${selectedMember.email.toLowerCase()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Response is not JSON:", text);
        return;
      }

      const history = await response.json();
      setMessages(
        history.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      );
    } catch (err) {
      console.error("Error fetching chat history:", err);
    }
  };

  const sendMessage = () => {
    if (
      !newMessage.trim() ||
      !stompClient.current ||
      !selectedMember ||
      !isConnected
    ) {
      console.log("Cannot send message:", {
        hasMessage: !!newMessage.trim(),
        hasClient: !!stompClient.current,
        hasMember: !!selectedMember,
        isConnected: isConnected,
      });
      return;
    }

    try {
      const message = {
        projectId,
        receiverEmail: selectedMember.email.toLowerCase(),
        content: newMessage,
        attachmentUrl: null,
      };

      stompClient.current.publish({
        destination: "/app/sendMessage",
        body: JSON.stringify(message),
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getInitials = (name) =>
    name
      ? name
          .split(" ")
          .map((n) => n.charAt(0))
          .join("")
          .substring(0, 2)
          .toUpperCase()
      : "U";

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

  const handleCloseDropdown = () => {
    setIsOpen(false);
    setSelectedMember(null);
    setSearchQuery("");
    if (stompClient.current && stompClient.current.connected) {
      stompClient.current.deactivate();
    }
    setIsConnected(false);
  };

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const userEmail = localStorage.getItem("userEmail")?.toLowerCase();

  return (
    <div className="members-button-container-chat" ref={dropdownRef}>
      <button
        className="members-button-chat"
        onClick={handleFetchMembers}
        title="View project members"
      >
        <FontAwesomeIcon
          icon={faMessage}
          className="members-button-icon-chat"
        />
      </button>
      {isOpen && (
        <div className="members-dropdown-chat">
          <div className="members-chat-message-send">
            <div className="members-dropdown-header-chat">
              <h3 className="members-dropdown-title-chat">Chat</h3>
            </div>
            <div className="search-input-chat">
              <input
                type="text"
                placeholder="Search member ..."
                className="chat-search-member"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="members-chat-list-focus">
              <ul className="members-list-chat">
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member, index) => (
                    <li
                      key={index}
                      className={`member-item-chat ${
                        selectedMember &&
                        selectedMember.email.toLowerCase() ===
                          member.email.toLowerCase()
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => setSelectedMember(member)}
                    >
                      <div className="member-avatar-chat">
                        {member.avatarUrl ? (
                          <img
                            src={member.avatarUrl}
                            alt={member.name}
                            className="member-avatar-img-chat"
                          />
                        ) : (
                          <div
                            className="member-initials-chat"
                            style={{
                              backgroundColor: getAvatarColor(member.name),
                            }}
                          >
                            {getInitials(member.name)}
                          </div>
                        )}
                      </div>
                      <div className="member-info-chat">
                        <p className="member-name-chat">{member.name}</p>
                      </div>
                    </li>
                  ))
                ) : (
                  <p className="no-members-chat">No members found</p>
                )}
              </ul>
            </div>
          </div>
          <div className="members-chat-message-chat">
            {selectedMember ? (
              <>
                <div className="members-chat-message-chat-name">
                  <div className="name-x">
                    <p>{selectedMember.name}</p>
                  </div>
                  <div>
                    <button
                      className="close-button"
                      onClick={handleCloseDropdown}
                      title="Close"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                </div>
                <div className="members-chat-message-chat-content">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`message-left-right ${
                        msg.senderEmail.toLowerCase() === userEmail
                          ? "right-chat"
                          : "left-chat"
                      }`}
                    >
                      <p>{msg.content}</p>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <div className="members-chat-message-chat-mess">
                  <div className="members-chat-message-chat-mess-content">
                    <input
                      type="text"
                      placeholder="Enter message ..."
                      className="input-chat-mess"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={!isConnected}
                    />
                  </div>
                  <div
                    className={`chat-icon-send ${
                      !isConnected ? "disabled" : ""
                    }`}
                    onClick={sendMessage}
                    style={{
                      opacity: isConnected ? 1 : 0.5,
                      cursor: isConnected ? "pointer" : "not-allowed",
                    }}
                  >
                    <FontAwesomeIcon icon={faPaperPlane} />
                  </div>
                </div>
              </>
            ) : (
              <div className="no-member-selected">
                <p>Select a member to start chatting.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
