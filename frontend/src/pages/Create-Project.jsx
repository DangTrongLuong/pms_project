import React, { useEffect } from "react";
import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import "../styles/dashboard.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import "../styles/create-project.css";

const Create_Project_Content = () => {
  const { isSidebarOpen } = useSidebar();

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

  return (
    <div className="container">
      <Navbar />
      <div id="global-progress-bar" className="progress-bar"></div>
      <div className="content-container">
        <div className={`sidebar ${!isSidebarOpen ? "hidden" : ""}`}>
          <Sidebar />
        </div>
        <div className={`main-container ${!isSidebarOpen ? "full" : ""}`}>
          <div className="create-project-container">
            <div className="create-project-header">
              <div className="create-project-title">
                <h2>Tạo dự án mới</h2>
                <p>
                  Điền thông tin dự án ở phía dưới để hoàn tiện việc tạo dự án
                </p>
              </div>
              <div className="create-project-form">
                <div className="create-project-input">
                  <label htmlFor="project-name">
                    Tên dự án <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="text"
                    id="project-name"
                    placeholder="Tên dự án"
                  />
                </div>
                <div className="create-project-input">
                  <label htmlFor="project-description">
                    Mô tả dự án của bạn
                  </label>
                  <textarea
                    type="text"
                    id="project-description"
                    placeholder="Mô tả dự án"
                    rows="5"
                  />
                </div>
                <div className="create-project-input-type">
                  <label htmlFor="project-type">
                    Loại dự án <span style={{ color: "red" }}>*</span>
                  </label>
                  <div className="project-type-group">
                    <input type="checkbox" id="project-type" />
                    <div className="type">
                      <h3>Scrum</h3>
                      <p>
                        Tiến nhanh tới mục tiêu dự án của bạn bằng bảng, danh
                        sách công việc tồn đọng và mốc thời gian
                      </p>
                    </div>
                  </div>
                </div>
                <div className="project-button">
                  <div className="create-button">
                    <button className="btn-add" type="submit">
                      Tạo dự án
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Create_Project = () => {
  return (
    <SidebarProvider>
      <Create_Project_Content />
    </SidebarProvider>
  );
};

export default Create_Project;
