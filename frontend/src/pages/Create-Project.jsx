import React, { useEffect, useState } from "react";
import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import "../styles/create-project.css";

const Create_Project_Content = () => {
  const { isSidebarOpen, setProjects } = useSidebar();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    project_name: "",
    description: "",
    project_type: "Scrum",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id === "project-name"
        ? "project_name"
        : id === "project-description"
        ? "description"
        : id]: value,
    }));
  };

  const handleCheckboxChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      project_type: e.target.checked ? "Scrum" : "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.project_name.trim()) {
      setError("Tên dự án là bắt buộc");
      return;
    }

    if (!formData.project_type) {
      setError("Vui lòng chọn loại dự án");
      return;
    }

    setIsLoading(true);

    try {
      const userId = localStorage.getItem("userId");
      const userName = localStorage.getItem("userName");
      const accessToken = localStorage.getItem("accessToken");

      if (!userId || !userName || !accessToken) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(
        "http://localhost:8080/api/projects/create-project",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
            userName: userName,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();
      if (response.ok && data.result) {
        const project = data.result;
        console.log("Project created:", project);

        // Store project in localStorage
        const projects = JSON.parse(localStorage.getItem("projects") || "[]");
        projects.push(project);
        localStorage.setItem("projects", JSON.stringify(projects));

        // Update sidebar projects
        setProjects(projects);

        // Navigate to dashboard
        if (window.progressCallback) {
          window.progressCallback(() => navigate("/dashboard"));
        } else {
          navigate("/dashboard");
        }
      } else {
        throw new Error(data.message || "Failed to create project");
      }
    } catch (err) {
      setError(err.message || "Đã có lỗi xảy ra khi tạo dự án");
      console.error("Create project error:", err);
    } finally {
      setIsLoading(false);
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
                  Điền thông tin dự án ở phía dưới để hoàn thiện việc tạo dự án
                </p>
              </div>
              {error && <p style={{ color: "red" }}>{error}</p>}
              <form onSubmit={handleSubmit} className="create-project-form">
                <div className="create-project-input">
                  <label htmlFor="project-name">
                    Tên dự án <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="text"
                    id="project-name"
                    placeholder="Tên dự án"
                    value={formData.project_name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="create-project-input">
                  <label htmlFor="project-description">
                    Mô tả dự án của bạn
                  </label>
                  <textarea
                    id="project-description"
                    placeholder="Mô tả dự án"
                    rows="5"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="create-project-input-type">
                  <label htmlFor="project-type">
                    Loại dự án <span style={{ color: "red" }}>*</span>
                  </label>
                  <div className="project-type-group">
                    <input
                      type="checkbox"
                      id="project-type"
                      checked={formData.project_type === "Scrum"}
                      onChange={handleCheckboxChange}
                    />
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
                    <button
                      className="btn-add"
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span
                          className="spinner"
                          style={{
                            display: "inline-block",
                            width: "20px",
                            height: "20px",
                            border: "2px solid white",
                            borderTop: "2px solid transparent",
                            borderRadius: "50%",
                            animation: "spin 1s linear infinite",
                          }}
                        ></span>
                      ) : (
                        "Tạo dự án"
                      )}
                    </button>
                  </div>
                </div>
              </form>
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
