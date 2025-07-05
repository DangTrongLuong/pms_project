import React, { useEffect, useState } from "react";
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
} from "@fortawesome/free-solid-svg-icons";
import "../styles/user/project_task.css";
import Backlog from "../pages/user/Backlog";
import Progress from "../pages/user/Progress";

const ProjectTaskContent = () => {
  const { isSidebarOpen } = useSidebar();
  const { id } = useParams(); // Lấy id từ URL
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [focusedItem, setFocusedItem] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

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
      // Giữ id và thêm route phụ
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

  useEffect(() => {
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
          setProjects(data); // Cập nhật danh sách dự án
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

    fetchProjects();
  }, []);

  // Lọc dự án dựa trên id từ URL
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
                      focusedItem === "/backlog" ? "focused" : ""
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
                      focusedItem === "/progress" ? "focused" : ""
                    }`}
                    onClick={() => handleItemClick("/progress")}
                  >
                    <div className="sidebar-icon-header">
                      <FontAwesomeIcon icon={faBarsProgress} />
                    </div>
                    <p className="sidebar-progress">Bảng nhiệm vụ</p>
                  </div>
                  <div className="project-header-navbar-items">
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
                <div className="project-action-name-list"></div>
                <div className="project-action-button">
                  <button className="project-action-complete">
                    Hoàn thành Sprint
                  </button>
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
