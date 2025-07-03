import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faListCheck,
  faUsers,
  faDiagramProject,
  faRocket,
} from "@fortawesome/free-solid-svg-icons";
import "../styles/sidebar.css";
import { useSidebar } from "../context/SidebarContext";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
  const { isSidebarOpen } = useSidebar();
  const [focusedItem, setFocusedItem] = useState("/dashboard"); // Mặc định focus Trang chủ
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Cập nhật focusedItem dựa trên đường dẫn hiện tại
    const currentPath = location.pathname;
    setFocusedItem(currentPath);
  }, [location.pathname]);

  const handleItemClick = (path) => {
    setFocusedItem(path);
    if (window.progressCallback) {
      window.progressCallback(() => navigate(path));
    } else {
      navigate(path);
    }
  };

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
      <div  className={`sidebar-common-project ${focusedItem === "/create-project" ? "focused" : ""}`}>
        <div className="sidebar-icon-project">
          <div className="sidebar-icon">
            <FontAwesomeIcon icon={faRocket} />
          </div>
          <p className="sidebar-common-project-title">Dự án</p>
        </div>
        <div className="sidebar-add-project" onClick={() => handleItemClick("/create-project")}>
          <p>+</p>
        </div>
      </div>
      <div className="sidebar-display-project">
        <div className="sidebar-project-list">
          <div className="sidebar-project-item">
            <h3 id="name-summary">M</h3>
          </div>
          <div className="sidebar-project-name">
            <p id="project-name">Mẫu dự án</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
