import React, { useEffect, useState } from "react";
import { SidebarProvider, useSidebar } from "../../context/SidebarContext";
import { useNavigate } from "react-router-dom";
import "../../styles/user/dashboard.css";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import "../../styles/user/create-project.css";

const Create_Project_Content = () => {
  const { isSidebarOpen, setProjects } = useSidebar();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    project_name: "",
    description: "",
    project_type: "Scrum",
    start_date: "",
    end_date: "",
    userName: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    project_name: "",
    project_type: "",
    start_date: "",
    end_date: "",
  });

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
    // Validation cho project_name
    if (id === "project-name" && !value.trim()) {
      setErrors((prev) => ({ ...prev, project_name: "Tên dự án là bắt buộc" }));
    } else if (id === "project-name") {
      setErrors((prev) => ({ ...prev, project_name: "" }));
    }
  };

  const handleDateChange = (e) => {
    const { id, value } = e.target;
    // Validation ngay khi nhập
    let errorMsg = "";
    if (value) {
      const [year, month, day] = value.split("-").map(Number);
      if (year < 1900 || year > 2100) {
        errorMsg = "Năm không hợp lệ.";
      } else if (month < 1 || month > 12) {
        errorMsg = "Tháng phải từ 1 đến 12.";
      } else {
        const daysInMonth = new Date(year, month, 0).getDate();
        if (day < 1 || day > daysInMonth) {
          errorMsg = "Ngày không hợp lệ cho tháng này.";
        }
      }
    }
    setErrors((prev) => ({ ...prev, [id]: errorMsg }));
    if (!errorMsg) {
      setFormData((prev) => ({
        ...prev,
        [id]: value,
      }));
    }
  };

  const handleCheckboxChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      project_type: e.target.checked ? "Scrum" : "",
    }));
    // Validation cho project_type
    if (!e.target.checked) {
      setErrors((prev) => ({
        ...prev,
        project_type: "Vui lòng chọn loại dự án",
      }));
    } else {
      setErrors((prev) => ({ ...prev, project_type: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Kiểm tra lỗi trước khi submit
    const newErrors = {
      project_name: !formData.project_name.trim()
        ? "Tên dự án là bắt buộc"
        : "",
      project_type: !formData.project_type ? "Vui lòng chọn loại dự án" : "",
      start_date: formData.start_date
        ? validateDate(formData.start_date)
          ? ""
          : "Ngày bắt đầu không hợp lệ."
        : "",
      end_date: formData.end_date
        ? validateDate(formData.end_date)
          ? ""
          : "Ngày kết thúc không hợp lệ."
        : "",
    };
    setErrors(newErrors);

    if (Object.values(newErrors).some((error) => error)) return;

    // Kiểm tra thứ tự ngày
    if (
      formData.start_date &&
      formData.end_date &&
      new Date(formData.end_date) < new Date(formData.start_date)
    ) {
      setErrors((prev) => ({
        ...prev,
        end_date: "Ngày kết thúc phải sau ngày bắt đầu.",
      }));
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
          },
          body: JSON.stringify({ ...formData, userName }),
        }
      );

      const data = await response.json();
      if (response.ok && data.result) {
        const project = data.result;
        console.log("Project created:", project);

        const projects = JSON.parse(localStorage.getItem("projects") || "[]");
        projects.push(project);
        localStorage.setItem("projects", JSON.stringify(projects));

        setProjects(projects);

        if (window.progressCallback) {
          window.progressCallback(() => navigate("/dashboard"));
        } else {
          navigate("/dashboard");
        }
      } else {
        throw new Error(data.message || "Failed to create project");
      }
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        general: err.message || "Đã có lỗi xảy ra khi tạo dự án",
      }));
      console.error("Create project error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const validateDate = (dateStr) => {
    if (!dateStr) return true; // Cho phép trống
    const [year, month, day] = dateStr.split("-").map(Number);
    return (
      year >= 1900 &&
      year <= 2100 &&
      month >= 1 &&
      month <= 12 &&
      day >= 1 &&
      day <= new Date(year, month, 0).getDate()
    );
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
              {errors.general && (
                <p style={{ color: "red" }}>{errors.general}</p>
              )}
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
                  {errors.project_name && (
                    <p
                      style={{
                        color: "red",
                        marginTop: -12,
                        marginBottom: 6,
                        fontSize: 15,
                      }}
                    >
                      {errors.project_name}
                    </p>
                  )}
                </div>
                <div className="create-project-input">
                  <label htmlFor="project-description">
                    Mô tả dự án của bạn
                  </label>
                  <textarea
                    id="project-description"
                    placeholder="Mô tả dự án"
                    rows="3"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="create-project-input">
                  <label htmlFor="start_date">
                    Ngày bắt đầu <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="date"
                    id="start_date"
                    value={formData.start_date}
                    onChange={handleDateChange}
                  />
                  {errors.start_date && (
                    <p
                      style={{
                        color: "red",
                        marginTop: -12,
                        marginBottom: 6,
                        fontSize: 15,
                      }}
                    >
                      {errors.start_date}
                    </p>
                  )}
                </div>
                <div className="create-project-input">
                  <label htmlFor="end_date">
                    Ngày kết thúc <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="date"
                    id="end_date"
                    value={formData.end_date}
                    onChange={handleDateChange}
                  />
                  {errors.end_date && (
                    <p
                      style={{
                        color: "red",
                        marginTop: -12,
                        marginBottom: 6,
                        fontSize: 15,
                      }}
                    >
                      {errors.end_date}
                    </p>
                  )}
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
                  {errors.project_type && (
                    <p style={{ color: "red" }}>{errors.project_type}</p>
                  )}
                </div>

                <div className="project-button">
                  <div className="create-button">
                    <button
                      className="btn-add"
                      type="submit"
                      disabled={
                        isLoading ||
                        Object.values(errors).some((error) => error)
                      }
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
