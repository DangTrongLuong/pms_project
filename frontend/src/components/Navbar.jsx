import React, { useState, useEffect, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAnglesLeft,
  faMagnifyingGlass,
  faBell,
  faArrowRightFromBracket,
  faMoon,
  faAnglesRight,
  faEllipsisV,
} from "@fortawesome/free-solid-svg-icons";
import { faUser, faSun } from "@fortawesome/free-regular-svg-icons";
import "../styles/user/navbar.css";
import logo from "../assets/logo.png";
import { useSidebar } from "../context/SidebarContext";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { NotificationContext } from "../context/NotificationContext";

const Navbar = () => {
  const { user } = useUser();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isThemeFormOpen, setIsThemeFormOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userName, setUserName] = useState(localStorage.getItem("userName"));
  const [userEmail, setUserEmail] = useState(
    localStorage.getItem("userEmail") || "user@example.com"
  );
  const [avatarUrl, setAvatarUrl] = useState(localStorage.getItem("avatarUrl"));
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { isSidebarOpen, toggleSidebar, setProjectsSidebar } = useSidebar();
  const { triggerSuccess, triggerError } = useContext(NotificationContext);
  const navigate = useNavigate();

  useEffect(() => {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setIsDarkMode(prefersDark);
    document.body.classList.toggle("dark-mode", prefersDark);

    const updateUserInfo = () => {
      const storedName = localStorage.getItem("userName");
      const storedEmail = localStorage.getItem("userEmail");
      const storedAvatar = localStorage.getItem("avatarUrl");

      if (storedName) {
        setUserName(user.userName || storedName);
      }
      if (storedEmail) {
        setUserEmail(storedEmail);
      }
      if (storedAvatar) {
        setAvatarUrl(user.avatarUrl || storedAvatar);
      }
    };

    updateUserInfo();
    window.addEventListener("storage", updateUserInfo);

    const handleNotificationUpdate = () => {
      fetchNotifications();
    };
    window.addEventListener("notificationUpdate", handleNotificationUpdate);

    return () => {
      window.removeEventListener("storage", updateUserInfo);
      window.removeEventListener(
        "notificationUpdate",
        handleNotificationUpdate
      );
    };
  }, [user.avatarUrl, user.userName]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const userId = localStorage.getItem("userId");
      const email = localStorage.getItem("userEmail");

      if (!token || !userId || !email) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(
        `${
          process.env.REACT_APP_API_URL
        }/api/notifications/recipient/${encodeURIComponent(email)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            userId: userId,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();
      const notificationsArray = Array.isArray(data) ? data : [];
      setNotifications(notificationsArray);
      const unread = notificationsArray.filter(
        (n) => n.status === "UNREAD"
      ).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Fetch notifications error:", err);
      triggerError("Không thể tải thông báo. Vui lòng thử lại.");
    }
  };

  const markNotificationsAsRead = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        throw new Error("User not authenticated");
      }

      for (const notification of notifications.filter(
        (n) => n.status === "UNREAD"
      )) {
        await fetch(
          `${process.env.REACT_APP_API_URL}/api/notifications/${notification.id}/read`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              userId: userId,
            },
          }
        );
      }
      setUnreadCount(0);
      fetchNotifications();
    } catch (err) {
      console.error("Mark notifications as read error:", err);
      triggerError("Không thể đánh dấu thông báo đã đọc. Vui lòng thử lại.");
    }
  };

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/projects/my-projects`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            userId: userId,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Lấy danh sách dự án thất bại: ${response.status}`
        );
      }

      const data = await response.json();
      setProjectsSidebar(data);
      localStorage.setItem("projects", JSON.stringify(data));
    } catch (err) {
      console.error("Fetch projects error:", err);
      triggerError(err.message || "Lấy danh sách dự án thất bại");
    }
  };

  const handleAcceptInvitation = async (notificationId) => {
    try {
      const token = localStorage.getItem("accessToken");
      const userId = localStorage.getItem("userId");
      const userEmail = localStorage.getItem("userEmail");

      if (!token || !userId || !userEmail) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/members/invitation/${notificationId}/accept`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            userId: userId,
            userEmail: userEmail,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to accept invitation");
      }

      const memberData = await response.json();
      triggerSuccess("Accepted invitation to join the project.");

      // Cập nhật danh sách dự án trong SidebarContext
      await fetchProjects(); // Gọi API để lấy danh sách dự án mới
      fetchNotifications(); // Cập nhật danh sách thông báo
    } catch (err) {
      console.error("Accept invitation error:", err);
      triggerError(
        err.message || "Không thể chấp nhận lời mời. Vui lòng thử lại."
      );
    }
  };

  const handleDeclineInvitation = async (notificationId) => {
    try {
      const token = localStorage.getItem("accessToken");
      const userId = localStorage.getItem("userId");
      const userEmail = localStorage.getItem("userEmail");

      if (!token || !userId || !userEmail) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/members/invitation/${notificationId}/decline`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            userId: userId,
            userEmail: userEmail,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to decline invitation");
      }

      triggerSuccess("Refused invitation to join the project.");
      fetchNotifications();
    } catch (err) {
      console.error("Decline invitation error:", err);
      triggerError(
        err.message || "Không thể từ chối lời mời. Vui lòng thử lại."
      );
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
    setIsNotificationsOpen(false);
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    setIsProfileOpen(false);
    if (!isNotificationsOpen) {
      markNotificationsAsRead();
    }
  };

  const toggleThemeForm = (e) => {
    e.stopPropagation();
    setIsThemeFormOpen(!isThemeFormOpen);
  };

  const handleClickOutside = (event) => {
    if (
      isProfileOpen &&
      !event.target.closest(".profile-container") &&
      !event.target.closest(".navbar-icon-fa-angles")
    ) {
      setIsProfileOpen(false);
      setIsThemeFormOpen(false);
    }
    if (
      isNotificationsOpen &&
      !event.target.closest(".profile-icon") &&
      !event.target.closest(".notification-dropdown")
    ) {
      setIsNotificationsOpen(false);
    }
  };

  const handleThemeChange = (theme, e) => {
    if (e && typeof e.stopPropagation === "function") {
      e.stopPropagation();
    }
    setIsDarkMode(theme === "dark");
    document.body.classList.toggle("dark-mode", theme === "dark");
  };

  const handleLogout = (e) => {
    e.stopPropagation();
    localStorage.clear();
    window.location.href = "/login";
  };

  const handleClickProfile = (path) => {
    if (window.progressCallback) {
      window.progressCallback(() => navigate(path));
    } else {
      navigate(path, { replace: true });
    }
    setIsProfileOpen(false);
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isProfileOpen, isNotificationsOpen]);

  return (
    <div className="navbar-container">
      <div
        className="navbar-icon-fa-angles"
        onClick={() => {
          console.log("Toggle sidebar clicked");
          toggleSidebar();
        }}
      >
        <FontAwesomeIcon icon={isSidebarOpen ? faAnglesLeft : faAnglesRight} />
      </div>
      <div className="navbar-logo">
        <img src={logo} alt="logo" className="logo" />
      </div>
      <div className="navbar-input">
        <div className="icon-find">
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </div>
        <div className="input-group">
          <input type="text" placeholder="Search" id="search" />
        </div>
      </div>

      <div className="profile-container">
        {window.innerWidth <= 768 ? (
          <>
            <div className="profile-response">
              <div className="profile-icon" onClick={toggleNotifications}>
                <FontAwesomeIcon icon={faBell} />
                {unreadCount > 0 && (
                  <div className="number-notification">{unreadCount}</div>
                )}
              </div>
              <div className="menu-icon" onClick={toggleProfile}>
                <FontAwesomeIcon icon={faEllipsisV} />
              </div>
            </div>
            {isProfileOpen && (
              <div
                className={`profile-dropdown ${isProfileOpen ? "active" : ""}`}
              >
                <div className="profile-item">
                  <div className="profile-name">
                    <p id="name">{userName}</p>
                  </div>
                  <div className="profile-avatar" onClick={toggleProfile}>
                    <img src={avatarUrl} id="avatar" />
                  </div>
                </div>
                {isProfileOpen && (
                  <>
                    <div className="profile-dropdown-info">
                      <div className="profile-dropdown-img">
                        <img src={avatarUrl} id="avatar-info" />
                      </div>
                      <div className="profile-dropdown-name">
                        <h3 id="name">{userName}</h3>
                        <p id="email">{userEmail}</p>
                      </div>
                    </div>
                    <div className="profile-dropdown-list">
                      <ul>
                        <li
                          className="profile-dropdown-list-item"
                          onClick={() => handleClickProfile("/my_profile")}
                        >
                          <FontAwesomeIcon icon={faUser} />
                          Personal Information
                        </li>
                        <li
                          className="profile-dropdown-list-item"
                          onClick={handleLogout}
                        >
                          <FontAwesomeIcon icon={faArrowRightFromBracket} />
                          Log out
                        </li>
                      </ul>
                    </div>
                  </>
                )}
              </div>
            )}
            {isNotificationsOpen && (
              <div className="notification-dropdown">
                <div className="notification-list">
                  {notifications.length === 0 ? (
                    <p className="no-notifications">No notifications</p>
                  ) : (
                    notifications.map((notification) => (
                      <div key={notification.id} className="notification-item">
                        <div className="notification-avatar">
                          <img src={notification.userAvatarUrl} alt="Avatar" />
                        </div>
                        <div className="notification-content">
                          <p>{notification.message}</p>
                          <p className="notification-time">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                          {notification.invitationStatus === "PENDING" && (
                            <div className="notification-actions">
                              <button
                                className="accept-button"
                                onClick={() =>
                                  handleAcceptInvitation(notification.id)
                                }
                              >
                                Accept
                              </button>
                              <button
                                className="decline-button"
                                onClick={() =>
                                  handleDeclineInvitation(notification.id)
                                }
                              >
                                Decline
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="profile-item">
            <div className="profile-icon" onClick={toggleNotifications}>
              <FontAwesomeIcon icon={faBell} />
              {unreadCount > 0 && (
                <div className="number-notification">{unreadCount}</div>
              )}
            </div>
            <div className="profile-name">
              <p id="name">{userName}</p>
            </div>
            <div className="profile-avatar" onClick={toggleProfile}>
              <img src={avatarUrl} id="avatar" />
            </div>
            {isNotificationsOpen && (
              <div className="notification-dropdown">
                <div className="notification-list">
                  {notifications.length === 0 ? (
                    <div className="no-notifications">
                      <p>No notifications</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div key={notification.id} className="notification-item">
                        <div className="notification-avatar">
                          <img src={notification.userAvatarUrl} alt="Avatar" />
                        </div>
                        <div className="notification-content">
                          <p>
                            {notification.message.replace(/\s*\([^)]*\)/, "")}
                          </p>
                          <p className="notification-time">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                          {notification.invitationStatus === "PENDING" && (
                            <div className="notification-actions">
                              <button
                                className="accept-button"
                                onClick={() =>
                                  handleAcceptInvitation(notification.id)
                                }
                              >
                                Accept
                              </button>
                              <button
                                className="decline-button"
                                onClick={() =>
                                  handleDeclineInvitation(notification.id)
                                }
                              >
                                Decline
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        {isProfileOpen && window.innerWidth > 768 && (
          <div className="profile-dropdown">
            <div className="profile-dropdown-info">
              <div className="profile-dropdown-img">
                <img src={avatarUrl} id="avatar-info" />
              </div>
              <div className="profile-dropdown-name">
                <h3 id="name">{userName}</h3>
                <p id="email">{userEmail}</p>
              </div>
            </div>
            <div className="profile-dropdown-list">
              <ul>
                <li
                  className="profile-dropdown-list-item"
                  onClick={() => handleClickProfile("/my_profile")}
                >
                  <FontAwesomeIcon icon={faUser} />
                  Thông tin cá nhân
                </li>
                <li
                  className="profile-dropdown-list-item"
                  onClick={handleLogout}
                >
                  <FontAwesomeIcon icon={faArrowRightFromBracket} />
                  Đăng xuất
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
