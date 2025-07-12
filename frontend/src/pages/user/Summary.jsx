import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import "../../styles/user/summary.css";
import { useParams } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";

const Summary = () => {
  const { id } = useParams();
  const { projects } = useSidebar();
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    if (projects.length > 0) {
      const project = projects.find((p) => p.id === parseInt(id));
      setSelectedProject(project || null);
    }
  }, [projects, id]);

  const fetchTasks = async () => {
    if (!selectedProject) return;
    try {
      const userId = localStorage.getItem("userId");
      if (!userId || !accessToken) {
<<<<<<< HEAD
        throw new Error("Please log in again to continue");
      }

      const sprintResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/api/backlog/sprints/${selectedProject.id}`,
=======
        throw new Error("Vui lòng đăng nhập lại để tiếp tục");
      }

      const sprintResponse = await fetch(
        `http://localhost:8080/api/backlog/sprints/${selectedProject.id}`,
>>>>>>> minhdan
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
          },
        }
      );

      if (!sprintResponse.ok) {
        const errorData = await sprintResponse.json().catch(() => ({}));
        throw new Error(
<<<<<<< HEAD
          errorData.message ||
            `Failed to fetch sprints: ${sprintResponse.status}`
=======
          errorData.message || `Lấy sprint thất bại: ${sprintResponse.status}`
>>>>>>> minhdan
        );
      }

      const sprints = await sprintResponse.json();
      const activeSprint = sprints.find((sprint) => sprint.status === "ACTIVE");
      if (!activeSprint) {
        setTasks([]);
<<<<<<< HEAD
        setError("No active sprint to fetch tasks!");
=======
        setError("Không có sprint active để lấy nhiệm vụ!");
>>>>>>> minhdan
        return;
      }

      const taskResponse = await fetch(
<<<<<<< HEAD
        `${process.env.REACT_APP_API_URL}/api/backlog/tasks/${activeSprint.id}`,
=======
        `http://localhost:8080/api/backlog/tasks/${activeSprint.id}`,
>>>>>>> minhdan
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
          },
        }
      );

      if (!taskResponse.ok) {
        const errorData = await taskResponse.json().catch(() => ({}));
        throw new Error(
<<<<<<< HEAD
          errorData.message || `Failed to fetch tasks: ${taskResponse.status}`
=======
          errorData.message || `Lấy nhiệm vụ thất bại: ${taskResponse.status}`
>>>>>>> minhdan
        );
      }

      const tasks = await taskResponse.json();
      setTasks(tasks);
      setError("");
    } catch (err) {
<<<<<<< HEAD
      setError(err.message || "An error occurred while fetching data");
      if (err.message.includes("401") || err.message.includes("403")) {
        setError("Your session has expired. Please log in again.");
=======
      setError(err.message || "Đã có lỗi xảy ra khi lấy dữ liệu");
      if (err.message.includes("401") || err.message.includes("403")) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
>>>>>>> minhdan
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }
    }
  };

  const fetchMembers = async () => {
    if (!selectedProject) return;
    try {
      const userId = localStorage.getItem("userId");
      if (!userId || !accessToken) {
<<<<<<< HEAD
        throw new Error("Please log in again to continue");
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/members/project/${selectedProject.id}`,
=======
        throw new Error("Vui lòng đăng nhập lại để tiếp tục");
      }

      const response = await fetch(
        `http://localhost:8080/api/members/project/${selectedProject.id}`,
>>>>>>> minhdan
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
<<<<<<< HEAD
          errorData.message || `Failed to fetch members: ${response.status}`
=======
          errorData.message ||
            `Lấy danh sách thành viên thất bại: ${response.status}`
>>>>>>> minhdan
        );
      }

      const data = await response.json();
      setMembers(data);
      setError("");
    } catch (err) {
<<<<<<< HEAD
      setError(err.message || "An error occurred while fetching members");
      if (err.message.includes("401") || err.message.includes("403")) {
        setError("Your session has expired. Please log in again.");
=======
      setError(err.message || "Đã có lỗi xảy ra khi lấy danh sách thành viên");
      if (err.message.includes("401") || err.message.includes("403")) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
>>>>>>> minhdan
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchMembers();
  }, [selectedProject]);

  const taskStats = {
    total: tasks.length,
    done: tasks.filter((t) => t.status === "DONE").length,
    inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    todo: tasks.filter((t) => t.status === "TODO").length,
    inReview: tasks.filter((t) => t.status === "IN_REVIEW").length,
  };

  const priorityStats = {
    high: tasks.filter((t) => t.priority === "High").length,
    medium: tasks.filter((t) => t.priority === "Medium").length,
    low: tasks.filter((t) => t.priority === "Low").length,
  };

  const progressPercentage =
    taskStats.total > 0
      ? Math.round((taskStats.done / taskStats.total) * 100)
      : 0;

  if (!selectedProject) return <div>Loading...</div>;

  return (
    <div className="summary-container">
      <div className="tab-content">
        <div className="summary-grid">
          <div className="summary-card">
<<<<<<< HEAD
            <h3>Total Tasks</h3>
            <p className="stat-value">{taskStats.total}</p>
          </div>
          <div className="summary-card">
            <h3>Completed</h3>
            <p className="stat-value text-green">{taskStats.done}</p>
          </div>
          <div className="summary-card">
            <h3>In Progress</h3>
            <p className="stat-value text-blue">{taskStats.inProgress}</p>
          </div>
          <div className="summary-card">
            <h3>Progress</h3>
=======
            <h3>Tổng số nhiệm vụ</h3>
            <p className="stat-value">{taskStats.total}</p>
          </div>
          <div className="summary-card">
            <h3>Hoàn thành</h3>
            <p className="stat-value text-green">{taskStats.done}</p>
          </div>
          <div className="summary-card">
            <h3>Đang thực hiện</h3>
            <p className="stat-value text-blue">{taskStats.inProgress}</p>
          </div>
          <div className="summary-card">
            <h3>Tiến độ</h3>
>>>>>>> minhdan
            <p className="stat-value text-purple">{progressPercentage}%</p>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="summary-details">
          <div className="detail-section">
<<<<<<< HEAD
            <h3>Project Information</h3>
            <div className="detail-list">
              <div className="detail-item">
                <span className="detail-label">Created Date</span>
=======
            <h3>Thông tin dự án</h3>
            <div className="detail-list">
              <div className="detail-item">
                <span className="detail-label">Ngày tạo</span>
>>>>>>> minhdan
                <span className="detail-value">
                  {new Date(selectedProject.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="detail-item">
<<<<<<< HEAD
                <span className="detail-label">Project Lead</span>
                <span className="detail-value">
                  {selectedProject.lead || "Not specified"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status</span>
=======
                <span className="detail-label">Trưởng dự án</span>
                <span className="detail-value">
                  {selectedProject.lead || "Chưa xác định"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Trạng thái</span>
>>>>>>> minhdan
                <span className="detail-value">
                  {selectedProject.status || "Active"}
                </span>
              </div>
            </div>
          </div>

          <div className="detail-section">
<<<<<<< HEAD
            <h3>Task Allocation</h3>
            <div className="detail-list">
              <div className="detail-item">
                <span className="detail-label">To Do</span>
                <span className="detail-value">{taskStats.todo}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">In Progress</span>
                <span className="detail-value">{taskStats.inProgress}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">In Review</span>
                <span className="detail-value">{taskStats.inReview}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Completed</span>
=======
            <h3>Phân bổ nhiệm vụ</h3>
            <div className="detail-list">
              <div className="detail-item">
                <span className="detail-label">Cần làm</span>
                <span className="detail-value">{taskStats.todo}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Đang thực hiện</span>
                <span className="detail-value">{taskStats.inProgress}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Đang xem xét</span>
                <span className="detail-value">{taskStats.inReview}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Hoàn thành</span>
>>>>>>> minhdan
                <span className="detail-value">{taskStats.done}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="summary-details">
          <div className="detail-section">
<<<<<<< HEAD
            <h3>Priority Breakdown</h3>
            <div className="detail-list">
              <div className="detail-item">
                <span className="detail-label">High Priority</span>
                <span className="detail-value">{priorityStats.high}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Medium Priority</span>
                <span className="detail-value">{priorityStats.medium}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Low Priority</span>
=======
            <h3>Phân loại ưu tiên</h3>
            <div className="detail-list">
              <div className="detail-item">
                <span className="detail-label">Ưu tiên cao</span>
                <span className="detail-value">{priorityStats.high}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Ưu tiên trung bình</span>
                <span className="detail-value">{priorityStats.medium}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Ưu tiên thấp</span>
>>>>>>> minhdan
                <span className="detail-value">{priorityStats.low}</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
<<<<<<< HEAD
            <h3>Team Members</h3>
=======
            <h3>Thành viên nhóm</h3>
>>>>>>> minhdan
            <div className="team-members">
              {members.map((member, index) => (
                <div key={index} className="team-member">
                  <div className="member-avatar">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <span className="member-name">{member.name}</span>
                    <p className="member-role">{member.role || "Member"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="summary-card">
<<<<<<< HEAD
          <h3>Progress Overview</h3>
=======
          <h3>Tổng quan tiến độ</h3>
>>>>>>> minhdan
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray">
<<<<<<< HEAD
            {taskStats.done} / {taskStats.total} tasks completed
=======
            {taskStats.done} / {taskStats.total} nhiệm vụ hoàn thành
>>>>>>> minhdan
          </p>
        </div>
      </div>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default Summary;
