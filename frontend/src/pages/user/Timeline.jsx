import React, { useState, useEffect } from "react";
import { Calendar, Clock } from "lucide-react";
import "../../styles/user/timeline.css";
import { useParams } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";

const Timeline = () => {
  const { id } = useParams();
  const { projects } = useSidebar();
  const [selectedProject, setSelectedProject] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [tasks, setTasks] = useState([]);
  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    const project = projects.find((p) => p.id === parseInt(id));
    console.log("Selected project from projects:", project);
    setSelectedProject(project || null);
  }, [projects, id]);

  const fetchSprintsAndTasks = async () => {
    if (!selectedProject) return;
    try {
      const userId = localStorage.getItem("userId");
      if (!userId || !accessToken) {
        throw new Error("Vui lòng đăng nhập lại để tiếp tục");
      }

      // Lấy danh sách sprint của dự án
      const sprintResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/api/sprints/project/${selectedProject.id}`,
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

      const sprintsData = await sprintResponse.json();
      console.log("Fetched sprints:", sprintsData);
      setSprints(sprintsData);

      const activeSprint = sprintsData.find(
        (sprint) => sprint.status === "ACTIVE"
      );
      console.log("Active sprint:", activeSprint);
      if (!activeSprint) {
        setTasks([]);
        return;
      }

      // Lấy danh sách task của sprint active
      const taskResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/api/sprints/tasks/${activeSprint.id}`,
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
      // Lọc task có sprintId khớp và ánh xạ COMPLETED thành DONE
      const mappedTasks = tasks
        .filter((task) => task.sprintId === activeSprint.id)
        .map((task) => ({
          ...task,
          status: task.status === "COMPLETED" ? "DONE" : task.status,
        }));
      setTasks(mappedTasks);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchSprintsAndTasks();
  }, [selectedProject]);

  const getTaskDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return "-";
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays}d`;
  };

  return (
    <div className="tab-content">
      <div className="section-header">
        <div className="section-title">
          <h2>Timeline</h2>
          <p>Visual timeline of project tasks</p>
        </div>
        <div className="timeline-controls">
          <Calendar />
          <span>Gantt Chart View</span>
        </div>
      </div>

      <div className="timeline">
        <div className="timeline-header">
          <div className="timeline-grid-header">
            <div className="timeline-col-task">Task</div>
            <div className="timeline-col-assignee">Assignee</div>
            <div className="timeline-col-start">Start Date</div>
            <div className="timeline-col-end">End Date</div>
            <div className="timeline-col-duration">Duration</div>
            <div className="timeline-col-progress">Timeline</div>
          </div>
        </div>

        <div className="timeline-body">
          {tasks.map((task) => (
            <div key={task.id} className="timeline-item">
              <div className="timeline-task-info">
                <div
                  className={`task-priority-indicator priority-${task.priority.toLowerCase()}`}
                />
                <div className="timeline-task-details">
                  <p className="timeline-task-title">{task.title}</p>
                  <p className="timeline-task-type">{task.type || "Task"}</p>
                </div>
              </div>

              <div className="timeline-task-assignee">
                <div className="assignee-avatar">
                  {task.assigneeName
                    ? task.assigneeName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                    : task.assigneeEmail
                    ? task.assigneeEmail
                        .split("@")[0]
                        .substring(0, 2)
                        .toUpperCase()
                    : "?"}
                </div>
                <span>
                  {task.assigneeName || task.assigneeEmail || "Unassigned"}
                </span>
              </div>

              <div className="timeline-date">
                {task.startDate
                  ? new Date(task.startDate).toLocaleDateString()
                  : "Not set"}
              </div>

              <div className="timeline-date">
                {task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString()
                  : "Not set"}
              </div>

              <div className="timeline-duration">
                <Clock />
                <span>{getTaskDuration(task.startDate, task.dueDate)}</span>
              </div>

              <div className="timeline-bar-container">
                <div
                  className={`timeline-bar status-${task.status
                    .toLowerCase()
                    .replace("_", "")}`}
                >
                  <div className="timeline-dates">
                    <span>{task.status}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="timeline-summary">
        <div className="summary-card">
          <h3>Sprint Timeline</h3>
          <div className="sprint-timeline">
            {sprints.length > 0 ? (
              sprints.map((sprint) => (
                <div key={sprint.id} className="sprint-timeline-item">
                  <div className="sprint-info">
                    <p className="sprint-name">{sprint.name}</p>
                    <p className="sprint-dates">
                      {sprint.startDate
                        ? new Date(sprint.startDate).toLocaleDateString()
                        : "Not set"}{" "}
                      -{" "}
                      {sprint.endDate
                        ? new Date(sprint.endDate).toLocaleDateString()
                        : "Not set"}
                    </p>
                  </div>
                  <span
                    className={`sprint-status status-${sprint.status.toLowerCase()}`}
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

        <div className="summary-card">
          <h3>Task Progress</h3>
          <div className="task-progress-summary">
            {["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"].map((status) => {
              const count = tasks.filter((t) => t.status === status).length;
              const percentage =
                tasks.length > 0 ? (count / tasks.length) * 100 : 0;
              return (
                <div key={status} className="progress-item">
                  <span className="progress-label">{status}</span>
                  <div className="progress-container">
                    <div className="progress-bar-small">
                      <div
                        className={`progress-fill-small status-${status
                          .toLowerCase()
                          .replace("_", "")}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="progress-count">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
