import React, { useState, useEffect } from "react";
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
import "../styles/navbar.css";
import logo from "../assets/logo.png";
import { useSidebar } from "../context/SidebarContext";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const Navbar = () => {
  const { user } = useUser();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isThemeFormOpen, setIsThemeFormOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userName, setUserName] = useState(localStorage.getItem("userName"));
  const [userEmail, setUserEmail] = useState(
    localStorage.getItem("userEmail") || "user@example.com"
  );

  const [avatarUrl, setAvatarUrl] = useState(localStorage.getItem("avatarUrl"));
  const { isSidebarOpen, toggleSidebar } = useSidebar();
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
        if (user.userName == null) {
          setUserName(storedName);
        } else {
          setUserName(user.userName);
        }
      }
      if (storedEmail) setUserEmail(storedEmail);
      if (storedAvatar) {
        if (user.avatarUrl == null) {
          setUserName(storedName);
        } else {
          setAvatarUrl(user.avatarUrl);
        }
      }
    };

    updateUserInfo();

    // Lắng nghe sự kiện storage để cập nhật real-time
    window.addEventListener("storage", updateUserInfo);
    return () => {
      window.removeEventListener("storage", updateUserInfo);
    };
  }, [user.avatarUrl]);

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const toggleThemeForm = (e) => {
    e.stopPropagation();
    setIsThemeFormOpen(!isThemeFormOpen);
  };

  const handleClickOutside = (event) => {
    if (isProfileOpen && !event.target.closest(".profile-container")) {
      setIsProfileOpen(false);
      setIsThemeFormOpen(false);
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
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("tokenExpiresAt");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("avatarUrl");
    localStorage.removeItem("backgroundUrl");
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
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isProfileOpen]);

  return (
    <div className="navbar-container">
      <div className="navbar-icon-fa-angles" onClick={toggleSidebar}>
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
            <div className="menu-icon" onClick={toggleProfile}>
              <FontAwesomeIcon icon={faEllipsisV} />
            </div>
            {isProfileOpen && (
              <div
                className={`profile-dropdown ${isProfileOpen ? "active" : ""}`}
              >
                <div className="profile-item">
                  <div className="profile-icon">
                    <FontAwesomeIcon icon={faBell} />
                  </div>
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
                          Thông tin cá nhân
                        </li>
                        <li
                          className="profile-dropdown-list-item"
                          onClick={toggleThemeForm}
                        >
                          <FontAwesomeIcon icon={isDarkMode ? faMoon : faSun} />
                          Phong cách
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
                    {isThemeFormOpen && (
                      <div className="theme-form">
                        <div
                          className="theme-option"
                          onClick={(e) => handleThemeChange("light", e)}
                        >
                          <FontAwesomeIcon icon={faSun} />
                          Giao diện sáng
                        </div>
                        <div
                          className="theme-option"
                          onClick={(e) => handleThemeChange("dark", e)}
                        >
                          <FontAwesomeIcon icon={faMoon} />
                          Giao diện tối
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="profile-item">
            <div className="profile-icon">
              <FontAwesomeIcon icon={faBell} />
            </div>
            <div className="profile-name">
              <p id="name">{userName}</p>
            </div>
            <div className="profile-avatar" onClick={toggleProfile}>
              <img src={avatarUrl} id="avatar" />
            </div>
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
                  onClick={toggleThemeForm}
                >
                  <FontAwesomeIcon icon={isDarkMode ? faMoon : faSun} />
                  Phong cách
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
            {isThemeFormOpen && (
              <div className="theme-form">
                <div
                  className="theme-option"
                  onClick={(e) => handleThemeChange("light", e)}
                >
                  <FontAwesomeIcon icon={faSun} />
                  Giao diện sáng
                </div>
                <div
                  className="theme-option"
                  onClick={(e) => handleThemeChange("dark", e)}
                >
                  <FontAwesomeIcon icon={faMoon} />
                  Giao diện tối
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
