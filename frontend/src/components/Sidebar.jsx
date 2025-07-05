import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faListCheck,
  faUsers,
  faDiagramProject,
  faRocket,
} from "@fortawesome/free-solid-svg-icons";
import "../styles/user/sidebar.css";
import { useSidebar } from "../context/SidebarContext";
import { useNavigate, useLocation, useParams } from "react-router-dom";

const Sidebar = () => {
  const { isSidebarOpen, setProjects, projects } = useSidebar(); // Lấy cả projects từ context
  const [focusedItem, setFocusedItem] = useState("/dashboard");
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentPath = location.pathname;
    setFocusedItem(currentPath);

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
          setProjects(data); // Cập nhật danh sách dự án từ DB
          localStorage.setItem("projects", JSON.stringify(data)); // Lưu cache vào localStorage
        } else {
          throw new Error(data.message || "Failed to fetch projects");
        }
      } catch (err) {
        console.error("Fetch projects error:", err);
        // Nếu lỗi, xóa cache cũ và không hiển thị dự án cũ
        localStorage.removeItem("projects");
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [location.pathname, setProjects]);

  const handleItemClick = (path) => {
    setFocusedItem(path);
    if (window.progressCallback) {
      window.progressCallback(() => navigate(path));
    } else {
      navigate(path);
    }
  };
  const handleItemList = (id) => {
    const basePath = `/project-task/${id}`;
    setFocusedItem(basePath);
    if (window.progressCallback) {
      window.progressCallback(() => navigate(basePath));
    } else {
      navigate(basePath);
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Hiển thị loading trong khi lấy dữ liệu
  }

  return (
    <div
      className="sidebar-container"
      style={{
        transform: isSidebarOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.3s ease-in-out",
      }}
    >
      <div
        className={`sidebar-item ${
          focusedItem === "/dashboard" ? "focused" : ""
        }`}
        onClick={() => handleItemClick("/dashboard")}
      >
        <div className="sidebar-icon">
          <FontAwesomeIcon icon={faHouse} />
        </div>
        <p className="sidebar-home">Trang chủ</p>
      </div>
      <div
        className={`sidebar-item ${
          focusedItem === "/myProject" ? "focused" : ""
        }`}
        onClick={() => handleItemClick("/myProject")}
      >
        <div className="sidebar-icon">
          <FontAwesomeIcon icon={faDiagramProject} />
        </div>
        <p className="sidebar-project">Dự án của tôi</p>
      </div>
      <div
        className={`sidebar-item ${focusedItem === "/task" ? "focused" : ""}`}
        onClick={() => handleItemClick("/task")}
      >
        <div className="sidebar-icon">
          <FontAwesomeIcon icon={faListCheck} />
        </div>
        <p className="sidebar-task">Nhiệm vụ</p>
      </div>
      <div
        className={`sidebar-item ${
          focusedItem === "/members" ? "focused" : ""
        }`}
        onClick={() => handleItemClick("/members")}
      >
        <div className="sidebar-icon">
          <FontAwesomeIcon icon={faUsers} />
        </div>
        <p className="sidebar-member">Thành viên</p>
      </div>

      <hr />
      <div
        className={`sidebar-common-project ${
          focusedItem === "/create-project" ? "focused" : ""
        }`}
      >
        <div className="sidebar-icon-project">
          <div className="sidebar-icon">
            <FontAwesomeIcon icon={faRocket} />
          </div>
          <p className="sidebar-common-project-title">Dự án</p>
        </div>
        <div
          className="sidebar-add-project"
          onClick={() => handleItemClick("/create-project")}
        >
          <p>+</p>
        </div>
      </div>
      <div className="sidebar-display-project">
        {projects.map((project) => (
          <div
            className={`sidebar-project-list ${
              focusedItem === `/project-task/${project.id}` ? "focused" : ""
            }`}
            key={project.id}
            onClick={() => handleItemList(project.id)}
          >
            <div
              className="sidebar-project-item"
              style={{ backgroundColor: project.color, borderRadius: "50px" }}
              // onClick={() => handleItemClick(`/project/${project.id}`)}
            >
              <h3 id="name-summary">{project.short_name}</h3>
            </div>
            <div className="sidebar-project-name">
              <p id="project-name">{project.project_name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
