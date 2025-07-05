import React, { useEffect, useState } from "react";
import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import "../styles/dashboard.css";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import "../styles/my_project.css";

const MyProjects = () => {
  const { isSidebarOpen } = useSidebar();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");
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
          setProjects(data);
          localStorage.setItem("projects", JSON.stringify(data));
        } else {
          throw new Error(data.message || "Failed to fetch projects");
        }
      } catch (err) {
        setError(err.message || "Đã có lỗi xảy ra khi lấy danh sách dự án");
        console.error("Fetch projects error:", err);
      }
    };

    fetchProjects();
  }, []);
  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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
          <h2>Dự án của tôi</h2>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <div className="project-list">
            {projects.map((project) => (
              <div key={project.id} className="project-item">
                <p>
                  <strong>Tên dự án:</strong> {project.project_name}
                </p>
                <p>
                  <strong>Mô tả:</strong> {project.description}
                </p>
                <p>
                  <strong>Loại dự án:</strong> {project.project_type}
                </p>
                <p>
                  <strong>Người tạo:</strong> {project.created_by_name}
                </p>
                <p>
                  <strong>Leader:</strong> {project.leader}
                </p>
                <button
                  className="view-button"
                  onClick={() => navigate(`/project/${project.id}`)}
                >
                  Xem chi tiết
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const MyProject = () => {
  return (
    <SidebarProvider>
      <MyProjects />
    </SidebarProvider>
  );
};

export default MyProject;
