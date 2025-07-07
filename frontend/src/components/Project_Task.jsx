import React, { useEffect, useState, useRef } from "react";
import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "../styles/user/dashboard.css";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBarsProgress,
  faGlobe,
  faUserPlus,
  faMagnifyingGlass,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import "../styles/user/project_task.css";
import Backlog from "../pages/user/Backlog";
import Progress from "../pages/user/Progress";

const ProjectTaskContent = () => {
  const { isSidebarOpen, setProjectsSidebar } = useSidebar();
  const { id } = useParams();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [focusedItem, setFocusedItem] = useState(`/project-task/${id}/backlog`);
  const [members, setMembers] = useState([]); // Danh sách thành viên
  const navigate = useNavigate();
  const location = useLocation();

  // State for member addition form
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [formError, setFormError] = useState("");
  const searchRef = useRef(null);

  const fetchMembers = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");

      if (!userId || !accessToken) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(
        `http://localhost:8080/api/members/project/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setMembers(data);
      } else {
        throw new Error(data.message || "Failed to fetch members");
      }
    } catch (err) {
      console.error("Fetch members error:", err);
    }
  };

  useEffect(() => {
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
  }, []);

  const handleItemClick = (path) => {
    if (id) {
      const newPath = `/project-task/${id}${path}`;
      setFocusedItem(newPath);
      if (window.progressCallback) {
        window.progressCallback(() => navigate(newPath));
      } else {
        navigate(newPath);
      }
    } else {
      setFocusedItem(path);
      if (window.progressCallback) {
        window.progressCallback(() => navigate(path));
      } else {
        navigate(path);
      }
    }
  };

  const fetchProjects = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");

      if (!userId || !accessToken) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(
        "http://localhost:8080/api/projects/my-projects",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setProjects(data);
        setProjectsSidebar(data);
        localStorage.setItem("projects", JSON.stringify(data));
      } else {
        throw new Error(data.message || "Failed to fetch projects");
      }
    } catch (err) {
      setError(err.message || "Đã có lỗi xảy ra khi lấy danh sách dự án");
      console.error("Fetch projects error:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchProjects();
    if (id) fetchMembers();
  }, [id]);

  useEffect(() => {
    // Lắng nghe thay đổi avatarUrl từ localStorage
    const updateMembersOnAvatarChange = () => {
      const currentAvatarUrl = localStorage.getItem("avatarUrl");
      if (currentAvatarUrl) {
        fetchMembers(); // Làm mới danh sách thành viên khi avatarUrl thay đổi
      }
    };
    window.addEventListener("storage", updateMembersOnAvatarChange);

    return () => {
      window.removeEventListener("storage", updateMembersOnAvatarChange);
    };
  }, []);

  useEffect(() => {
    setFocusedItem(location.pathname);
  }, [location.pathname]);

  // Handle search for users
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchQuery.trim()) {
        setSuggestions([]);
        return;
      }

      try {
        const userId = localStorage.getItem("userId");
        const accessToken = localStorage.getItem("accessToken");

        const response = await fetch(
          `http://localhost:8080/api/members/search?query=${encodeURIComponent(
            searchQuery
          )}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
              userId: userId,
            },
          }
        );

        const data = await response.json();
        if (response.ok) {
          setSuggestions(data);
        } else {
          setFormError(data.message || "Failed to fetch users");
        }
      } catch (err) {
        setFormError("Error fetching users");
        console.error("Search error:", err);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Handle click outside to close form
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddMemberClick = () => {
    setIsAddMemberOpen(true);
  };

  const handleSelectMember = (member) => {
    if (!selectedMembers.some((m) => m.email === member.email)) {
      setSelectedMembers([...selectedMembers, member]);
    }
    setSearchQuery("");
    setSuggestions([]);
  };

  const handleRemoveMember = (email) => {
    setSelectedMembers(selectedMembers.filter((m) => m.email !== email));
  };

  const handleConfirmMembers = async () => {
    if (selectedMembers.length === 0) {
      setFormError("Please select at least one member");
      return;
    }

    try {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");

      for (const member of selectedMembers) {
        await fetch(`http://localhost:8080/api/members/project/${id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
          },
          body: JSON.stringify({ email: member.email }),
        }).then(async (response) => {
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.message || "Failed to add member");
          }
        });
      }

      // Cập nhật danh sách thành viên sau khi thêm thành công
      await fetchMembers();
      await fetchProjects();
      setIsConfirmOpen(false);
      setIsAddMemberOpen(false);
      setSelectedMembers([]);
      setFormError("");
    } catch (err) {
      setFormError(err.message || "Error adding members");
      console.error("Add members error:", err);
    }
  };

  const selectedProject = projects.find(
    (project) => project.id === parseInt(id)
  );
  const isBacklog = location.pathname.includes("/backlog");
  const isProgress = location.pathname.includes("/progress");

  return (
    <div className="container">
      <Navbar />
      <div id="global-progress-bar" className="progress-bar"></div>
      <div className="content-container">
        <div className={`sidebar ${!isSidebarOpen ? "hidden" : ""}`}>
          <Sidebar />
        </div>
        <div className={`main-container ${!isSidebarOpen ? "full" : ""}`}>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <p style={{ color: "red" }}>{error}</p>
          ) : selectedProject ? (
            <div className="project-container-select">
              <div className="project-header">
                <div className="project-header-title" style={{ fontSize: 17 }}>
                  Dự án
                </div>
                <div className="project-header-name">
                  <div
                    className="project-header-bg"
                    style={{ backgroundColor: selectedProject.color }}
                  >
                    <h3>{selectedProject.short_name}</h3>
                  </div>
                  <div className="project-header-name-content">
                    {selectedProject.project_name}
                  </div>
                </div>
                <div className="project-header-navbar">
                  <div
                    className={`project-header-navbar-items ${
                      focusedItem === `/project-task/${id}/backlog`
                        ? "focused"
                        : ""
                    }`}
                    onClick={() => handleItemClick("/backlog")}
                  >
                    <div className="sidebar-icon-header">
                      <FontAwesomeIcon icon={faGlobe} />
                    </div>
                    <p className="sidebar-globe">Backlog</p>
                  </div>
                  <div
                    className={`project-header-navbar-items ${
                      focusedItem === `/project-task/${id}/progress`
                        ? "focused"
                        : ""
                    }`}
                    onClick={() => handleItemClick("/progress")}
                  >
                    <div className="sidebar-icon-header">
                      <FontAwesomeIcon icon={faBarsProgress} />
                    </div>
                    <p className="sidebar-progress">Bảng nhiệm vụ</p>
                  </div>
                  <div
                    className="project-header-navbar-items"
                    onClick={handleAddMemberClick}
                  >
                    <div className="sidebar-icon-header">
                      <FontAwesomeIcon icon={faUserPlus} />
                    </div>
                    <p className="sidebar-progress">Thêm thành viên</p>
                  </div>
                </div>
              </div>

              <div className="project-action-bellow-navbar">
                <div className="project-action-find">
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                  <div className="project-action-find-input">
                    <input
                      type="text"
                      placeholder="Tìm kiếm..."
                      className="project-action-find-input-text"
                    />
                  </div>
                </div>
                <div className="project-action-name-list">
                  {members.map((member, index) => (
                    <img
                      key={index}
                      src={member.avatarUrl}
                      alt={member.name}
                      title={member.name}
                      className="member-avatar"
                    />
                  ))}
                </div>
              </div>
              {isBacklog && <Backlog project={selectedProject} />}
              {isProgress && <Progress project={selectedProject} />}
            </div>
          ) : (
            <p>Không tìm thấy dự án.</p>
          )}
        </div>
      </div>

      {/* Add Member Form */}
      {isAddMemberOpen && (
        <div className="modal-overlay">
          <div className="add-member-form" ref={searchRef}>
            <h3>Thêm thành viên</h3>
            <div className="search-container">
              <input
                type="text"
                placeholder="Nhập tên hoặc email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {suggestions.length > 0 && (
                <ul className="suggestions-list">
                  {suggestions.map((suggestion) => (
                    <li
                      key={suggestion.email}
                      onClick={() => handleSelectMember(suggestion)}
                      className="suggestion-item"
                    >
                      <img
                        src={suggestion.avatarUrl}
                        alt={suggestion.name}
                        className="suggestion-avatar"
                      />
                      <div>
                        <p>{suggestion.name}</p>
                        <p>{suggestion.email}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {formError && <p style={{ color: "red" }}>{formError}</p>}
            <div className="selected-members">
              {selectedMembers.map((member) => (
                <div key={member.email} className="selected-member">
                  <img
                    src={member.avatarUrl}
                    alt={member.name}
                    className="member-avatar"
                  />
                  <span>{member.name}</span>
                  <FontAwesomeIcon
                    icon={faTimes}
                    onClick={() => handleRemoveMember(member.email)}
                    className="remove-member"
                  />
                </div>
              ))}
            </div>
            <div className="form-buttons">
              <button
                onClick={() => setIsAddMemberOpen(false)}
                className="cancel-button"
              >
                Hủy
              </button>
              <button
                onClick={() => setIsConfirmOpen(true)}
                className="confirm-button"
                disabled={selectedMembers.length === 0}
              >
                Thêm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {isConfirmOpen && (
        <div className="modal-overlay">
          <div className="confirm-dialog">
            <h3>Xác nhận thêm thành viên</h3>
            <p>Bạn có chắc muốn thêm các thành viên sau vào dự án?</p>
            <ul>
              {selectedMembers.map((member) => (
                <li key={member.email}>
                  {member.name} ({member.email})
                </li>
              ))}
            </ul>
            <div className="form-buttons">
              <button
                onClick={() => setIsConfirmOpen(false)}
                className="cancel-button"
              >
                Hủy
              </button>
              <button onClick={handleConfirmMembers} className="confirm-button">
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProjectTask = () => {
  return (
    <SidebarProvider>
      <ProjectTaskContent />
    </SidebarProvider>
  );
};

export default ProjectTask;
