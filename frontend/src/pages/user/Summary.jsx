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
        throw new Error("Please log in again to continue");
      }

      const sprintResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/api/backlog/sprints/${selectedProject.id}`,
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
          errorData.message ||
            `Failed to fetch sprints: ${sprintResponse.status}`
        );
      }

      const sprints = await sprintResponse.json();
      const activeSprint = sprints.find((sprint) => sprint.status === "ACTIVE");
      if (!activeSprint) {
        setTasks([]);
        setError("No active sprint to fetch tasks!");
        return;
      }

      const taskResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/api/backlog/tasks/${activeSprint.id}`,
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
          errorData.message || `Failed to fetch tasks: ${taskResponse.status}`
        );
      }

      const tasks = await taskResponse.json();
      setTasks(tasks);
      setError("");
    } catch (err) {
      setError(err.message || "An error occurred while fetching data");
      if (err.message.includes("401") || err.message.includes("403")) {
        setError("Your session has expired. Please log in again.");
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
        throw new Error("Please log in again to continue");
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/members/project/${selectedProject.id}`,
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
          errorData.message || `Failed to fetch members: ${response.status}`
        );
      }

      const data = await response.json();
      setMembers(data);
      setError("");
    } catch (err) {
      setError(err.message || "An error occurred while fetching members");
      if (err.message.includes("401") || err.message.includes("403")) {
        setError("Your session has expired. Please log in again.");
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
            <h3>Project Information</h3>
            <div className="detail-list">
              <div className="detail-item">
                <span className="detail-label">Created Date</span>
                <span className="detail-value">
                  {new Date(selectedProject.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Project Lead</span>
                <span className="detail-value">
                  {selectedProject.lead || "Not specified"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status</span>
                <span className="detail-value">
                  {selectedProject.status || "Active"}
                </span>
              </div>
            </div>
          </div>

          <div className="detail-section">
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
                <span className="detail-value">{taskStats.done}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="summary-details">
          <div className="detail-section">
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
                <span className="detail-value">{priorityStats.low}</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>Team Members</h3>
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
          <h3>Progress Overview</h3>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray">
            {taskStats.done} / {taskStats.total} tasks completed
          </p>
        </div>
      </div>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default Summary;
