import React, { useState, useEffect } from "react";
import { Calendar, Clock } from "lucide-react";
import "../../styles/user/timeline.css";
import { useParams } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";

const Timeline = () => {
  const { id } = useParams();
  const { projects, isSidebarOpen } = useSidebar();
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    const project = projects.find((p) => p.id === parseInt(id));
    console.log("Selected project from projects:", project);
    setSelectedProject(project || null);
  }, [projects, id]);

  const fetchTasks = async () => {
    if (!selectedProject) return;
    try {
      const userId = localStorage.getItem("userId");
      if (!userId || !accessToken) {
        throw new Error("Vui lòng đăng nhập lại để tiếp tục");
      }

      const sprintResponse = await fetch(
        `http://localhost:8080/api/backlog/sprints/${selectedProject.id}`,
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
          errorData.message || `Lấy sprint thất bại: ${sprintResponse.status}`
        );
      }

      const sprints = await sprintResponse.json();
      const activeSprint = sprints.find((sprint) => sprint.status === "ACTIVE");
      console.log("Active sprint:", activeSprint);
      if (!activeSprint) {
        setTasks([]);
        return;
      }

      const taskResponse = await fetch(
        `http://localhost:8080/api/backlog/tasks/${activeSprint.id}`,
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
          errorData.message || `Lấy task thất bại: ${taskResponse.status}`
        );
      }

      const tasks = await taskResponse.json();
      console.log("Fetched tasks:", tasks);
      setTasks(tasks);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [selectedProject]);

  const getTaskDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "red";
      case "Medium":
        return "orange";
      case "Low":
        return "green";
      default:
        return "gray";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Done":
        return "green";
      case "In Progress":
        return "blue";
      case "In Review":
        return "yellow";
      default:
        return "gray";
    }
  };

  return (
    <div className="timeline-section">
      <div className="task-table">
        <div className="table-header">
          <div className="table-cell col-task">Task</div>
          <div className="table-cell col-assignee">Assignee</div>
          <div className="table-cell col-start">Start Date</div>
          <div className="table-cell col-end">End Date</div>
          <div className="table-cell col-duration">Duration</div>
          <div className="table-cell col-timeline">Timeline</div>
        </div>
        <div className="table-body">
          {tasks.map((task) => (
            <div key={task.id} className="table-row">
              <div className="table-cell col-task">
                <div className="task-info">
                  <span
                    className="priority-dot"
                    style={{ backgroundColor: getPriorityColor(task.priority) }}
                  />
                  <div>
                    <p className="task-title">{task.title}</p>
                    <p className="task-type">{task.type}</p>
                  </div>
                </div>
              </div>
              <div className="table-cell col-assignee">
                <div className="assignee-info">
                  <span className="assignee-avatar">
                    {task.assignee
                      ? task.assignee.email
                          .split("@")[0]
                          .substring(0, 2)
                          .toUpperCase()
                      : "?"}
                  </span>
                  <span className="assignee-name">
                    {task.assignee?.email || "Unassigned"}
                  </span>
                </div>
              </div>
              <div className="table-cell col-start">
                <p className="date-text">
                  {task.startDate
                    ? new Date(task.startDate).toLocaleDateString()
                    : "Not set"}
                </p>
              </div>
              <div className="table-cell col-end">
                <p className="date-text">
                  {task.endDate
                    ? new Date(task.endDate).toLocaleDateString()
                    : "Not set"}
                </p>
              </div>
              <div className="table-cell col-duration">
                <div className="duration-info">
                  <Clock size={12} />
                  <span className="duration-text">
                    {task.startDate && task.endDate
                      ? `${getTaskDuration(task.startDate, task.endDate)}d`
                      : "-"}
                  </span>
                </div>
              </div>
              <div className="table-cell col-timeline">
                <div className="timeline-bar-container">
                  <div
                    className={`timeline-bar ${
                      task.status === "Done"
                        ? "done"
                        : task.status === "In Progress"
                        ? "in-progress"
                        : task.status === "In Review"
                        ? "in-review"
                        : "default"
                    }`}
                  />
                  <span className="timeline-status">{task.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sprint-timeline">
        <h3 className="timeline-subtitle">Sprint Timeline</h3>
        <div className="sprint-list">
          {selectedProject?.sprints?.length > 0 ? (
            selectedProject.sprints.map((sprint) => (
              <div key={sprint.id} className="sprint-item">
                <div className="sprint-details">
                  <p className="sprint-name">{sprint.name}</p>
                  <p className="sprint-dates">
                    {new Date(sprint.startDate).toLocaleDateString()} -{" "}
                    {new Date(sprint.endDate).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className="sprint-status"
                  style={{
                    backgroundColor:
                      sprint.status === "Active"
                        ? "#e3fcef"
                        : sprint.status === "Completed"
                        ? "#e6f0fa"
                        : "#f4f5f7",
                    color:
                      sprint.status === "Active"
                        ? "#006644"
                        : sprint.status === "Completed"
                        ? "#0052cc"
                        : "#6b778c",
                  }}
                >
                  {sprint.status}
                </span>
              </div>
            ))
          ) : (
            <div className="error-message">Không có sprint nào</div>
          )}
        </div>
      </div>

      <div className="task-progress">
        <h3 className="timeline-subtitle">Task Progress</h3>
        <div className="progress-list">
          {["To Do", "In Progress", "In Review", "Done"].map((status) => {
            const count = tasks.filter((t) => t.status === status).length;
            const percentage =
              tasks.length > 0 ? (count / tasks.length) * 100 : 0;
            return (
              <div key={status} className="progress-item">
                <span className="progress-status">{status}</span>
                <div className="progress-bar-container">
                  <div
                    className="progress-bar"
                    style={{
                      backgroundColor: getStatusColor(status),
                      width: `${percentage}%`,
                    }}
                  />
                </div>
                <span className="progress-count">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
