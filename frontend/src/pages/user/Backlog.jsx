import React, { useState, useEffect, useCallback } from "react";
import { Plus, Search, MoreVertical } from "lucide-react";
import "../../styles/user/backlog.css";
import "../../styles/user/project_task.css";
import { useParams } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";
import { MessageSquare } from "lucide-react";
import CreateTaskModal from "../../components/CreateTaskModal";
import CreateSprintModal from "../../components/CreateSprintModal";

const Backlog = () => {
  const { id } = useParams();
  const { projects } = useSidebar();
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [backlogs, setBacklogs] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showSprintForm, setShowSprintForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  useEffect(() => {
    if (projects.length > 0) {
      const project = projects.find((p) => p.id === parseInt(id));
      setSelectedProject(project || null);
    }
  }, [projects, id]);

  const fetchBacklogsAndTasks = useCallback(async () => {
    if (!selectedProject) return;
    try {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");
      if (!userId || !accessToken) {
        throw new Error("Vui lòng đăng nhập lại để tiếp tục");
      }

      const backlogResponse = await fetch(
        `http://localhost:8080/api/backlog/sprints/${selectedProject.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
          },
          credentials: "include",
        }
      );

      if (!backlogResponse.ok) {
        if (backlogResponse.status === 401 || backlogResponse.status === 403) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("userId");
          setTimeout(() => {
            window.location.href = "/login";
          }, 2000);
          throw new Error("Phiên đăng nhập hết hạn. Đang chuyển hướng...");
        }
        const errorData = await backlogResponse.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Lấy sprint thất bại: ${backlogResponse.status}`
        );
      }

      const backlogsData = await backlogResponse.json();
      setBacklogs(Array.isArray(backlogsData) ? backlogsData : []);

      const activeBacklog = backlogsData.find((b) => b.status === "ACTIVE");
      if (activeBacklog) {
        const taskResponse = await fetch(
          `http://localhost:8080/api/backlog/tasks/${activeBacklog.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
              userId: userId,
            },
            credentials: "include",
          }
        );

        if (!taskResponse.ok) {
          if (taskResponse.status === 401 || taskResponse.status === 403) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("userId");
            setTimeout(() => {
              window.location.href = "/login";
            }, 2000);
            throw new Error("Phiên đăng nhập hết hạn. Đang chuyển hướng...");
          }
          const errorData = await taskResponse.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Lấy task thất bại: ${taskResponse.status}`
          );
        }

        const tasksData = await taskResponse.json();
        setTasks(Array.isArray(tasksData) ? tasksData : []);
      } else {
        setTasks([]);
      }
    } catch (err) {
      console.error(err.message || "Đã có lỗi xảy ra khi lấy dữ liệu");
      alert(err.message || "Không thể tải dữ liệu. Vui lòng thử lại.");
    }
  }, [selectedProject]);

  useEffect(() => {
    fetchBacklogsAndTasks();
  }, [fetchBacklogsAndTasks]);

  const handleAddTask = async (newTask) => {
    try {
      setTasks((prevTasks) => [...prevTasks, newTask]);
      await fetchBacklogsAndTasks();
    } catch (err) {
      console.error("Lỗi khi cập nhật danh sách task:", err);
      alert("Không thể cập nhật danh sách task. Vui lòng thử lại.");
    }
  };

  const handleAddSprint = async (newSprint) => {
    try {
      setBacklogs((prevBacklogs) => [...prevBacklogs, newSprint]);
      await fetchBacklogsAndTasks();
    } catch (err) {
      console.error("Lỗi khi cập nhật danh sách sprint:", err);
      alert("Không thể cập nhật danh sách sprint. Vui lòng thử lại.");
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "text-red-600 bg-red-50";
      case "Medium":
        return "text-yellow-600 bg-yellow-50";
      case "Low":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const filteredTasks = tasks
    .filter((task) => filterStatus === "all" || task.status === filterStatus)
    .filter(
      (task) =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description &&
          task.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      const priorityOrder = { High: 3, Medium: 2, Low: 1 };
      return (
        (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
      );
    });

  const backlogTasks = filteredTasks.filter((task) => !task.backlog);

  if (!selectedProject) return <div>Loading...</div>;

  const activeBacklog = backlogs.find((b) => b.status === "ACTIVE");

  return (
    <div className="backlog-section">
      <div className="section-header">
        <div className="header-actions">
          <button
            onClick={() => setShowSprintForm(true)}
            className="btn btn-primary"
          >
            <Plus size={20} />
            <span>Create Sprint</span>
          </button>
          <button
            onClick={() => setShowTaskForm(true)}
            className="btn btn-success"
          >
            <Plus size={20} />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-container-section">
          <div style={{ position: "relative" }}>
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Status</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="IN_REVIEW">In Review</option>
          <option value="COMPLETED">Done</option>
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Priority</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      <div className="sprints-container">
        {backlogs &&
          Array.isArray(backlogs) &&
          backlogs.map((backlog) => (
            <div key={backlog.id} className="sprint-card">
              <div className="sprint-header">
                <div
                  className="sprint-title-row"
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <h3 className="sprint-title">{backlog.backlogName}</h3>
                  <div>
                    <span className="sprint-dates">
                      {backlog.startDate} - {backlog.endDate}
                    </span>
                    <button className="more-button">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
                <div className="sprint-stats">
                  <span>Total: {backlog.workItems || 0}</span>
                  <span>
                    To Do:{" "}
                    {
                      tasks.filter(
                        (t) =>
                          t.backlog?.id === backlog.id && t.status === "TODO"
                      ).length
                    }
                  </span>
                  <span>
                    In Progress:{" "}
                    {
                      tasks.filter(
                        (t) =>
                          t.backlog?.id === backlog.id &&
                          t.status === "IN_PROGRESS"
                      ).length
                    }
                  </span>
                  <span>
                    Done:{" "}
                    {
                      tasks.filter(
                        (t) =>
                          t.backlog?.id === backlog.id &&
                          t.status === "COMPLETED"
                      ).length
                    }
                  </span>
                </div>
              </div>
              <div className="sprint-content">
                {tasks.filter((task) => task.backlog?.id === backlog.id)
                  .length > 0 ? (
                  <div className="tasks-list">
                    {tasks
                      .filter((task) => task.backlog?.id === backlog.id)
                      .map((task) => (
                        <div
                          key={task.id}
                          className="border-t border-r border-b border-l border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">
                                {task.title}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {task.description || "Không có mô tả"}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                                  task.priority
                                )}`}
                              >
                                {task.priority}
                              </span>
                              <div className="text-xs text-gray-500">
                                Hạn chót:{" "}
                                {task.dueDate
                                  ? new Date(task.dueDate).toLocaleDateString()
                                  : "Không có"}
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-700">
                                  {task.assignee?.email
                                    ?.split("@")[0]
                                    ?.substring(0, 2)
                                    ?.toUpperCase() || "N/A"}
                                </span>
                              </div>
                              <span className="text-sm text-gray-600">
                                {task.assignee?.email || "Chưa gán"}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MessageSquare className="w-4 h-4 text-gray-400" />
                              <span className="text-xs text-gray-500">0</span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="empty-state">No tasks in this sprint</p>
                )}
              </div>
            </div>
          ))}

        <div className="sprint-card">
          <div className="sprint-header">
            <h3 className="sprint-title">Backlog</h3>
            <p style={{ fontSize: "14px", color: "#6B778C", marginTop: "4px" }}>
              {backlogTasks.length} tasks not assigned to any sprint
            </p>
          </div>
          <div className="sprint-content">
            {backlogTasks && backlogTasks.length > 0 ? (
              <div className="tasks-list">
                {backlogTasks.map((task) => (
                  <div
                    key={task.id}
                    className="border-t border-r border-b border-l border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div classNameName="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {task.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {task.description || "Không có mô tả"}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                        <div className="text-xs text-gray-500">
                          Hạn chót:{" "}
                          {task.dueDate
                            ? new Date(task.dueDate).toLocaleDateString()
                            : "Không có"}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-700">
                            {task.assignee?.email
                              ?.split("@")[0]
                              ?.substring(0, 2)
                              ?.toUpperCase() || "N/A"}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {task.assignee?.email || "Chưa gán"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-500">0</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-state">No tasks in backlog</p>
            )}
          </div>
        </div>
      </div>

      <CreateTaskModal
        isOpen={showTaskForm}
        onClose={() => setShowTaskForm(false)}
        onSubmit={handleAddTask}
        selectedProject={selectedProject}
        editingTask={null}
        activeBacklogId={activeBacklog?.id}
      />

      <CreateSprintModal
        isOpen={showSprintForm}
        onClose={() => setShowSprintForm(false)}
        onSubmit={handleAddSprint}
        selectedProject={selectedProject}
      />
    </div>
  );
};

export default Backlog;