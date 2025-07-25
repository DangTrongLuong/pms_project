import React, { useEffect, useState } from "react";
import { SidebarProvider, useSidebar } from "../../context/SidebarContext";
import { useNavigate } from "react-router-dom";
import "../../styles/user/task.css";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

const TaskContent = () => {
  const { isSidebarOpen, setProjectsSidebar } = useSidebar(); // Thêm setProjectsSidebar để cập nhật dự án
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [selectedSprintId, setSelectedSprintId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All"); // Thêm state để lưu bộ lọc ưu tiên
  const accessToken = localStorage.getItem("accessToken");
  const userId = localStorage.getItem("userId");

  // Lấy danh sách dự án khi component mount
  useEffect(() => {
    const fetchProjects = async () => {
      if (!userId || !accessToken) {
        setError("Vui lòng đăng nhập lại để tiếp tục");
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/projects/my-projects`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
              userId: userId,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              `Error while getting project list: ${response.status}`
          );
        }

        const data = await response.json();
        setProjects(Array.isArray(data) ? data : []);
        setProjectsSidebar(Array.isArray(data) ? data : []); // Cập nhật projects trong SidebarContext
        if (data.length > 0) {
          setSelectedProjectId(data[0].id);
        }
      } catch (err) {
        setError(
          err.message || "An error occurred while retrieving the project list."
        );
        if (err.message.includes("401") || err.message.includes("403")) {
          setError("Your session has expired. Please log in again.");
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [userId, accessToken, navigate, setProjectsSidebar]);

  // Lấy danh sách sprint khi selectedProjectId thay đổi
  useEffect(() => {
    const fetchSprints = async () => {
      if (!selectedProjectId || !accessToken || !userId) {
        setSprints([]);
        setSelectedSprintId(null);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/sprints/project/${selectedProjectId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
              userId: userId,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              `Error while getting sprint list: ${response.status}`
          );
        }

        const data = await response.json();
        setSprints(Array.isArray(data) ? data : []);
        setSelectedSprintId(null); // Mặc định chọn backlog
      } catch (err) {
        setError(
          err.message || "An error occurred while retrieving the sprint list."
        );
        if (err.message.includes("401") || err.message.includes("403")) {
          setError("Your session has expired. Please log in again.");
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSprints();
  }, [selectedProjectId, userId, accessToken, navigate]);

  // Lấy danh sách nhiệm vụ khi selectedProjectId hoặc selectedSprintId thay đổi
  useEffect(() => {
    const fetchTasks = async () => {
      if (!selectedProjectId || !accessToken || !userId) {
        setTasks([]);
        return;
      }

      setIsLoading(true);
      try {
        let url = `${process.env.REACT_APP_API_URL}/api/sprints/tasks/backlog/${selectedProjectId}`;
        if (selectedSprintId) {
          url = `${process.env.REACT_APP_API_URL}/api/sprints/tasks/${selectedSprintId}`;
        }

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              `Error while getting task list: ${response.status}`
          );
        }

        const data = await response.json();
        // Lọc nhiệm vụ theo priorityFilter
        let filteredTasks = Array.isArray(data) ? data : [];
        if (priorityFilter !== "All") {
          filteredTasks = filteredTasks.filter(
            (task) =>
              task.priority.toLowerCase() === priorityFilter.toLowerCase()
          );
        }
        // Lọc nhiệm vụ được giao cho người dùng
        const userTasks = filteredTasks.filter(
          (task) => task.assigneeId === userId
        );
        setTasks(userTasks);
        setError("");
      } catch (err) {
        setError(
          err.message || "An error occurred while retrieving the task list."
        );
        if (err.message.includes("401") || err.message.includes("403")) {
          setError("Your session has expired. Please log in again.");
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [
    selectedProjectId,
    selectedSprintId,
    userId,
    accessToken,
    navigate,
    priorityFilter,
  ]);

  // Xử lý thanh tiến trình
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

  // Hàm xử lý thay đổi mức ưu tiên
  const handlePriorityFilter = (priority) => {
    setPriorityFilter(priority);
  };

  return (
    <div className="container">
      <Navbar />
      <div id="global-progress-bar" className="progress-bar"></div>
      <div className="content-container">
        <div className={`sidebar ${!isSidebarOpen ? "hidden" : ""}`}>
          <Sidebar
            projects={projects}
            selectedProjectId={selectedProjectId}
            setSelectedProjectId={setSelectedProjectId}
            sprints={sprints}
            selectedSprintId={selectedSprintId}
            setSelectedSprintId={setSelectedSprintId}
          />
        </div>
        <div className={`main-container-task ${!isSidebarOpen ? "full" : ""}`}>
          <section className="project" aria-label="Project overview">
            <h2>Project List</h2>
            {isLoading ? (
              <div>Loading...</div>
            ) : error ? (
              <div className="error">{error}</div>
            ) : projects.length === 0 ? (
              <div>No projects</div>
            ) : (
              <div className="project-list">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className={`project-item ${
                      selectedProjectId === project.id ? "selected" : ""
                    }`}
                    onClick={() => {
                      setSelectedProjectId(project.id);
                      setSelectedSprintId(null); // Reset sprint khi chọn dự án mới
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setSelectedProjectId(project.id);
                        setSelectedSprintId(null);
                      }
                    }}
                  >
                    <p>{project.project_name || project.name} </p>
                  </div>
                ))}
              </div>
            )}
          </section>
          <section className="sprint" aria-label="Sprint list">
            <h2>Backlog List</h2>
            <p
              style={{
                fontSize: "17px",
                fontWeight: "bold",
                marginBottom: "5px",
              }}
            >
              Sprint List
            </p>
            {isLoading ? (
              <div>Loading...</div>
            ) : error ? (
              <div className="error">{error}</div>
            ) : sprints.length === 0 && selectedSprintId === null ? (
              <div>No sprints, show backlog</div>
            ) : (
              <div className="sprint-list">
                {sprints.map((sprint) => (
                  <div
                    key={sprint.id}
                    className={`sprint-item ${
                      selectedSprintId === sprint.id ? "selected" : ""
                    }`}
                    onClick={() => setSelectedSprintId(sprint.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setSelectedSprintId(sprint.id);
                      }
                    }}
                  >
                    {sprint.name}
                  </div>
                ))}
              </div>
            )}
          </section>
          <section className="my-task-list" aria-label="Danh sách nhiệm vụ">
            <div className="task-header">
              <h2>Assigned Tasks</h2>
              <div className="filter-container">
                <button
                  className={`filter-btn-all-active ${
                    priorityFilter === "All" ? "active" : ""
                  }`}
                  aria-label="Lọc tất cả mức ưu tiên"
                  onClick={() => handlePriorityFilter("All")}
                >
                  All
                </button>
                <button
                  className={`filter-btn-low-active ${
                    priorityFilter === "Low" ? "active" : ""
                  }`}
                  aria-label="Lọc mức ưu tiên thấp"
                  onClick={() => handlePriorityFilter("Low")}
                >
                  Low
                </button>

                <button
                  className={`filter-btn-medium-active ${
                    priorityFilter === "Medium" ? "active" : ""
                  }`}
                  aria-label="Lọc mức ưu tiên trung bình"
                  onClick={() => handlePriorityFilter("Medium")}
                >
                  Medium
                </button>
                <button
                  className={`filter-btn-high-active ${
                    priorityFilter === "High" ? "active" : ""
                  }`}
                  aria-label="Lọc mức ưu tiên cao"
                  onClick={() => handlePriorityFilter("High")}
                >
                  Hight
                </button>
              </div>
            </div>
            {isLoading ? (
              <div>Loading...</div>
            ) : error ? (
              <div className="error">{error}</div>
            ) : tasks.length === 0 ? (
              <div>No tasks</div>
            ) : (
              <div className="task-list-map">
                <div className="my-task-item my-task-css">
                  <p className="my-task-item-title">Name tasks</p>
                  <div className="my-task-item-priority-div">
                    <p className="my-task-item-priority-div">Priority</p>
                  </div>
                  <p className="my-task-item-status">Status</p>
                </div>
                {tasks.map((task) => (
                  <div key={task.id} className="my-task-item">
                    <p className="my-task-item-title">{task.title}</p>
                    <div className="my-task-item-priority-div">
                      <p
                        className={`my-task-item-priority ${task.priority.toLowerCase()}`}
                      >
                        {task.priority}
                      </p>
                    </div>
                    <p className="my-task-item-status">{task.status}</p>{" "}
                    {/* Hiển thị trạng thái nhiệm vụ */}
                  </div>
                ))}
              </div>
            )}
          </section>
          <div className="empty-my-task">
            <p>Empty</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Task = () => {
  return (
    <SidebarProvider>
      <TaskContent />
    </SidebarProvider>
  );
};

export default Task;
