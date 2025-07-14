/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/img-redundant-alt */
import React, { useState, useEffect } from "react";
import { SidebarProvider, useSidebar } from "../../context/SidebarContext";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrashCan } from "@fortawesome/free-regular-svg-icons";
import "../../styles/user/profile.css";
import { useUser } from "../../context/UserContext";

const ProfileContent = () => {
  const { isSidebarOpen } = useSidebar();
  const { user, setUser } = useUser();
  const [userName, setUserName] = useState(
    localStorage.getItem("userName") || "User"
  );
  const [userEmail, setUserEmail] = useState(
    localStorage.getItem("userEmail") || "user@example.com"
  );
  const [avatarUrl, setAvatarUrl] = useState(
    localStorage.getItem("avatarUrl") ||
      `${process.env.REACT_APP_API_URL}/uploads/avatars/default-avatar.png`
  );
  const [backgroundUrl, setBackgroundUrl] = useState(
    localStorage.getItem("backgroundUrl" || "")
  );
  const [role, setRole] = useState(localStorage.getItem("role") || "USER");
  const [createdAt, setCreatedAt] = useState(
    localStorage.getItem("created_at") || ""
  );
  const [showEditNameForm, setShowEditNameForm] = useState(false);
  const [newName, setNewName] = useState(userName);
  const [showConfirmForm, setShowConfirmForm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");

  useEffect(() => {
    // Update state from localStorage
    const storedName = localStorage.getItem("userName");
    const storedEmail = localStorage.getItem("userEmail");
    const storedAvatar = localStorage.getItem("avatarUrl");
    const storedBackground = localStorage.getItem("backgroundUrl");
    const storedRole = localStorage.getItem("role");
    const storedCreatedAt = localStorage.getItem("created_at");

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
        setAvatarUrl(storedAvatar);
      } else {
        setAvatarUrl(user.avatarUrl);
      }
    }
    if (storedBackground) {
      if (user.backgroundUrl == null) {
        setBackgroundUrl(storedBackground);
      } else {
        setBackgroundUrl(user.backgroundUrl);
      }
    }
    if (storedRole) setRole(storedRole);
    if (storedCreatedAt) setCreatedAt(storedCreatedAt);

    // Update DOM
    document.getElementById("full-name").textContent = storedName || "User";
    document.getElementById("email").textContent =
      storedEmail || "user@example.com";
    document.getElementById("role").textContent = storedRole || "USER";
    document.getElementById("created-at").textContent = storedCreatedAt || "";
    document.getElementById("profile-img").src =
      storedAvatar ||
      `${process.env.REACT_APP_API_URL}/uploads/avatars/default-avatar.png`;
    const coverImg = document.getElementById("cover-img");
    if (coverImg) {
      coverImg.src = user.backgroundUrl || "";
      coverImg.classList.toggle("visible", !!user.backgroundUrl);
    }
    document.getElementById("remove-cover-btn").style.display = storedBackground
      ? "block"
      : "none";

    window.progressCallback = (navigateCallback) => {
      const progress = document.getElementById("global-progress-bar");
      if (progress) {
        progress.style.width = "0%";
        progress.style.display = "block";
        let width = 0;
        const interval = setInterval(() => {
          if (width >= 100) {
            clearInterval(interval);
            progress.style.display = "none";
            if (navigateCallback) navigateCallback();
          } else {
            width += 15;
            progress.style.width = width + "%";
            progress.style.transition = "width 0.3s linear";
          }
        }, 100);
      }
    };
    return () => {
      delete window.progressCallback;
    };
  }, [
    userName,
    userEmail,
    avatarUrl,
    backgroundUrl,
    role,
    createdAt,
    user.userName,
    user.avatarUrl,
    user.backgroundUrl,
  ]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large! Please select a file smaller than 5MB.");
      return;
    }

    const storedEmail = localStorage.getItem("userEmail");
    const token = localStorage.getItem("accessToken");

    const formData = new FormData();
    formData.append("avatar", file);
    formData.append("email", storedEmail);

    try {
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/auth/upload-avatar`,
        {
          method: "POST",
          headers: headers,
          credentials: "include",
          body: formData,
        }
      );
      const data = await response.json();
      if (response.ok) {
        const newAvatarUrl = data.avatarUrl;
        setAvatarUrl(newAvatarUrl);
        setUser({ ...user, avatarUrl: newAvatarUrl });
        localStorage.setItem("avatarUrl", newAvatarUrl);
        document.getElementById("profile-img").src = newAvatarUrl;
      } else {
        console.error("Failed to upload avatar:", data.message);
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
    }
  };

  const handleBackgroundChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large! Please select a file smaller than 5MB.");
      return;
    }
    const storedEmail = localStorage.getItem("userEmail");
    const token = localStorage.getItem("accessToken");
    console.log("userEmail:", localStorage.getItem("userEmail"));
    console.log("accessToken:", localStorage.getItem("accessToken"));

    const formData = new FormData();
    formData.append("background", file);
    formData.append("email", storedEmail);

    try {
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/auth/upload-background`,
        {
          method: "POST",
          headers: headers,
          credentials: "include",
          body: formData,
        }
      );
      const data = await response.json();
      if (response.ok) {
        const newBackgroundUrl = data.backgroundUrl;
        setBackgroundUrl(newBackgroundUrl);
        setUser({ ...user, backgroundUrl: newBackgroundUrl });
        localStorage.setItem("backgroundUrl", newBackgroundUrl);
        const coverImg = document.getElementById("cover-img");
        if (coverImg) {
          coverImg.src = newBackgroundUrl;
          coverImg.classList.add("visible");
        }
        document.getElementById("remove-cover-btn").style.display = "block";
      } else {
        console.error("Failed to upload background:", data.message);
      }
    } catch (error) {
      console.error("Error uploading background:", error);
    }
  };

  const handleRemoveBackground = () => {
    const storedEmail = localStorage.getItem("userEmail");
    const token = localStorage.getItem("accessToken");
    console.log("userEmail:", localStorage.getItem("userEmail"));
    console.log("accessToken:", localStorage.getItem("accessToken"));
    setConfirmMessage("Are you sure you want to remove the background image?");
    setConfirmAction(() => async () => {
      try {
        const headers = {
          "Content-Type": "application/json",
        };

        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/auth/remove-background`,
          {
            method: "POST",
            headers: headers,
            credentials: "include",
            body: JSON.stringify({ email: storedEmail }),
          }
        );
        if (response.ok) {
          setBackgroundUrl("");
          localStorage.removeItem("backgroundUrl");
          document.getElementById("cover-img").src = "";
          document.getElementById("remove-cover-btn").style.display = "none";
        } else {
          console.error("Failed to remove background");
        }
      } catch (error) {
        console.error("Error removing background:", error);
      }
      setShowConfirmForm(false);
    });
    setShowConfirmForm(true);
  };

  const handleEditName = () => {
    setShowEditNameForm(true);
  };

  const handleUpdateName = async () => {
    const storedEmail = localStorage.getItem("userEmail");
    const token = localStorage.getItem("accessToken");
    console.log("userEmail:", localStorage.getItem("userEmail"));
    console.log("accessToken:", localStorage.getItem("accessToken"));
    setConfirmMessage("Are you sure you want to update your name?");
    setConfirmAction(() => async () => {
      try {
        const headers = {
          "Content-Type": "application/json",
        };

        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/auth/update-user/${storedEmail}`,
          {
            method: "PUT",
            headers: headers,
            credentials: "include",
            body: JSON.stringify({ name: newName }),
          }
        );
        if (response.ok) {
          setUserName(newName);
          setUser({ ...user, userName: newName });
          localStorage.setItem("userName", newName);
          document.getElementById("full-name").textContent = newName;
          setShowEditNameForm(false);
        } else {
          console.error("Failed to update name");
        }
      } catch (error) {
        console.error("Error updating name:", error);
      }
      setShowConfirmForm(false);
    });
    setShowConfirmForm(true);
  };

  return (
    <div className="container">
      <Navbar />
      <div id="global-progress-bar" className="progress-bar"></div>
      <div className="content-container">
        <div className={`sidebar ${!isSidebarOpen ? "hidden" : ""}`}>
          <Sidebar />
        </div>
        <div className={`main-container ${!isSidebarOpen ? "full" : ""}`}>
          <div className="profile-container-cover">
            <div className="cover-image">
              <img src={backgroundUrl} className="cover-img" id="cover-img" />
              <div className="cover-buttons">
                <input
                  type="file"
                  id="background-input"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleBackgroundChange}
                />
                <button
                  className="add-cover-btn"
                  id="add-cover-btn"
                  onClick={() =>
                    document.getElementById("background-input").click()
                  }
                >
                  <FontAwesomeIcon icon={faPenToSquare} />
                  Add Background Image
                </button>
                <button
                  className="remove-cover-btn"
                  id="remove-cover-btn"
                  style={{ display: backgroundUrl ? "block" : "none" }}
                  onClick={handleRemoveBackground}
                >
                  <FontAwesomeIcon icon={faTrashCan} />
                  Remove Background Image
                </button>
              </div>
            </div>

            <div className="profile-container-info">
              <div className="profile-person">
                <div className="personal-img">
                  <img
                    id="profile-img"
                    src={avatarUrl}
                    alt="Profile Picture"
                    className="profile-img"
                  />
                </div>
                <input
                  type="file"
                  id="avatar-input"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleAvatarChange}
                />
                <button
                  id="edit-avatar-btn"
                  className="edit-btn"
                  onClick={() =>
                    document.getElementById("avatar-input").click()
                  }
                >
                  Edit Picture
                </button>
                <button
                  id="edit-info-btn"
                  className="edit-btn-info"
                  onClick={handleEditName}
                >
                  Edit Information
                </button>
              </div>
              <div className="profile-info">
                <h2>Personal Information</h2>
                <div className="info-field">
                  <label>
                    Full Name: <span id="full-name">{userName}</span>
                  </label>
                </div>
                <div className="info-field">
                  <label>
                    Email: <span id="email">{userEmail}</span>
                  </label>
                </div>
                <div className="info-field">
                  <label>
                    Role: <span id="role">{role}</span>
                  </label>
                </div>
                <div className="info-field">
                  <label>
                    Created At: <span id="created-at">{createdAt}</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="space"></div>
          </div>
        </div>
      </div>

      {showEditNameForm && (
        <div className="modal">
          <div className="modal-content">
            <h3>Update Full Name</h3>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter new full name"
            />
            <button onClick={handleUpdateName}>Update</button>
            <button onClick={() => setShowEditNameForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {showConfirmForm && (
        <div className="modal">
          <div className="modal-content">
            <h3>Confirm</h3>
            <p>{confirmMessage}</p>
            <button onClick={confirmAction}>Confirm</button>
            <button onClick={() => setShowConfirmForm(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

const Profile = () => {
  return (
    <SidebarProvider>
      <ProfileContent />
    </SidebarProvider>
  );
};

export default Profile;
