import React, { useState, useEffect, useCallback } from "react";
import { Search, Plus, MoreHorizontal } from "lucide-react";
import "../../styles/user/progress.css";
import { useParams } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";
import CreateTaskModal from "../../components/CreateTaskModal";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const Progress = () => {
  const { id } = useParams();
  const { projects } = useSidebar();
  const [selectedProject, setSelectedProject] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [assigneeEmail, setAssigneeEmail] = useState("");
  const [error, setError] = useState("");
  const [activeColumn, setActiveColumn] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activeSprint, setActiveSprint] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [groupBy, setGroupBy] = useState("status");
  const [members, setMembers] = useState([]);
  const accessToken = localStorage.getItem("accessToken");

  const fetchMembers = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId || !accessToken) {
        throw new Error("User not authenticated");
      }
      const response = await fetch(
        `http://localhost:8080/api/members/project/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setMembers(data);
      } else {
        throw new Error(data.message || "Failed to fetch members");
      }
    } catch (err) {
      console.error("Fetch members error:", err);
    }
  }, [id, accessToken]);

  useEffect(() => {
    if (projects.length > 0) {
      const project = projects.find((p) => p.id === parseInt(id));
      setSelectedProject(project || null);
    }
    if (id) fetchMembers();
  }, [projects, id, fetchMembers]);

  const fetchSprintsAndTasks = useCallback(async () => {
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
      setActiveSprint(activeSprint);

      if (!activeSprint) {
        setError("Không có sprint active để thêm nhiệm vụ!");
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
      setTasks(tasks);
      setError("");
    } catch (err) {
      setError(err.message || "Đã có lỗi xảy ra khi lấy dữ liệu");
      if (err.message.includes("401") || err.message.includes("403")) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }
    }
  }, [selectedProject, accessToken]);

  useEffect(() => {
    fetchSprintsAndTasks();
  }, [fetchSprintsAndTasks]);

  const handleAddTask = async (column) => {
    if (!newTaskTitle.trim() || !dueDate || !assigneeEmail.trim()) {
      setError(
        "Vui lòng điền tiêu đề, ngày hoàn thành, và email người được giao!"
      );
      return;
    }

    try {
      const userId = localStorage.getItem("userId");
      if (!userId || !accessToken || !activeSprint) {
        throw new Error("Vui lòng đăng nhập lại để tiếp tục");
      }

      const response = await fetch(
        `http://localhost:8080/api/backlog/task/${
          activeSprint.id
        }?taskTitle=${encodeURIComponent(
          newTaskTitle
        )}&description=${encodeURIComponent(
          description
        )}&assigneeEmail=${encodeURIComponent(
          assigneeEmail
        )}&dueDate=${encodeURIComponent(dueDate)}&priority=${encodeURIComponent(
          priority
        )}`,
        {
          method: "POST",
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
          errorData.message || `Tạo nhiệm vụ thất bại: ${response.status}`
        );
      }

      setNewTaskTitle("");
      setDescription("");
      setPriority("Medium");
      setDueDate("");
      setAssigneeEmail("");
      setError("");
      setActiveColumn(null);
      fetchSprintsAndTasks();
      alert("Nhiệm vụ được tạo thành công!");
    } catch (err) {
      setError(err.message || "Đã có lỗi xảy ra khi tạo nhiệm vụ");
      if (err.message.includes("401") || err.message.includes("403")) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId || !accessToken) {
        throw new Error("Vui lòng đăng nhập lại để tiếp tục");
      }

      const response = await fetch(
        `http://localhost:8080/api/backlog/task/${taskId}/status?status=${encodeURIComponent(
          newStatus
        )}`,
        {
          method: "PUT",
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
            `Cập nhật trạng thái thất bại: ${response.status}`
        );
      }

      fetchSprintsAndTasks();
      setSelectedTask(null);
    } catch (err) {
      setError(err.message || "Đã có lỗi xảy ra khi cập nhật trạng thái");
      if (err.message.includes("401") || err.message.includes("403")) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "priority-high";
      case "Medium":
        return "priority-medium";
      case "Low":
        return "priority-low";
      default:
        return "priority-default";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "Story":
        return "type-story";
      case "Bug":
        return "type-bug";
      case "Task":
        return "type-task";
      default:
        return "type-default";
    }
  };

  const filteredTasks = tasks
    .filter(
      (task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description &&
          task.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .filter((task) => filterStatus === "all" || task.status === filterStatus)
    .filter(
      (task) => filterPriority === "all" || task.priority === filterPriority
    );

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceColumn = source.droppableId;
    const destColumn = destination.droppableId;
    if (sourceColumn === destColumn && source.index === destination.index)
      return;

    const updatedTasks = Array.from(tasks);
    const [movedTask] = updatedTasks.splice(source.index, 1);
    movedTask.status = destColumn; // Cập nhật trạng thái
    updatedTasks.splice(destination.index, 0, movedTask);

    setTasks(updatedTasks);
    handleUpdateTaskStatus(movedTask.id, destColumn);
  };

  const renderBoard = () => {
    const columns = [
      { id: "TODO", title: "TO DO", color: "bg-gray", guidance: true },
      { id: "IN_PROGRESS", title: "IN PROGRESS", color: "bg-blue" },
      { id: "IN REVIEW", title: "IN REVIEW", color: "bg-yellow" },
      { id: "DONE", title: "DONE ✅", color: "bg-green" },
    ];

    return (
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-board">
          <div className="kanban-header">
            <div className="search-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search board..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {members.map((member, index) => (
                <img
                  key={index}
                  src={member.avatarUrl}
                  alt={member.name}
                  title={member.name}
                  className="member-avatar"
                />
              ))}
            </div>
            <div className="grouping-dropdown">
              <select
                className="filter-select"
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
              >
                <option value="status">Group by Status</option>
                <option value="assignee">Group by Assignee</option>
                <option value="priority">Group by Priority</option>
              </select>
            </div>
            <div className="progress-filters">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN REVIEW">In Review</option>
                <option value="DONE">Done</option>
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
          </div>
          <div className="kanban-columns">
            {columns.map((column) => (
              <Droppable droppableId={column.id} key={column.id}>
                {(provided) => (
                  <div
                    className="kanban-column"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <div className="column-header">
                      <h3 className="column-title">{column.title}</h3>
                      <button
                        className="add-task-btn"
                        onClick={() => setActiveColumn(column.id)}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="column-tasks">
                      {column.guidance && (
                        <>
                          <p className="column-guidance">
                            Get started in the backlog – Plan and start a sprint
                            to see work here.
                          </p>
                          <button
                            className="go-to-backlog-btn"
                            onClick={() =>
                              (window.location.href = `/project-task/${id}/backlog`)
                            }
                          >
                            Go to Backlog
                          </button>
                        </>
                      )}
                      {filteredTasks
                        .filter((task) => task.status === column.id)
                        .map((task, index) => (
                          <Draggable
                            key={task.id}
                            draggableId={task.id.toString()}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                className="board-task-card"
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => setSelectedTask(task)}
                              >
                                <div className="board-task-meta">
                                  <h4 className="board-task-title">
                                    {task.title}
                                  </h4>
                                  <button className="task-more-btn">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </button>
                                </div>
                                <p className="board-task-desc">
                                  {task.description || "Không có mô tả"}
                                </p>
                                <div className="board-task-meta">
                                  <div className="task-type-priority">
                                    <span
                                      className={`task-type ${getTypeColor(
                                        task.type
                                      )}`}
                                    >
                                      {task.type}
                                    </span>
                                    <span
                                      className={`task-priority ${getPriorityColor(
                                        task.priority
                                      )}`}
                                    >
                                      {task.priority}
                                    </span>
                                  </div>
                                  <div className="task-assignee">
                                    {task.assignee && (
                                      <div className="assignee-avatar">
                                        <span className="assignee-initials">
                                          {task.assignee.email
                                            .split("@")[0]
                                            .substring(0, 2)
                                            .toUpperCase()}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </div>
      </DragDropContext>
    );
  };

  if (!selectedProject) return <div>Loading...</div>;

  return (
    <div className="progress-container">
      <div className="progress-content">
        {activeSprint ? (
          renderBoard()
        ) : (
          <div className="no-active-sprint">
            Không có sprint active. Vui lòng bắt đầu một sprint trong phần
            Backlog.
          </div>
        )}
      </div>
      {activeColumn && (
        <CreateTaskModal
          isOpen={!!activeColumn}
          onClose={() => setActiveColumn(null)}
          onSubmit={(taskData) => {
            handleAddTask(taskData.status.toUpperCase());
          }}
          selectedProject={selectedProject}
          editingTask={null}
        />
      )}
      {selectedTask && (
        <CreateTaskModal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onSubmit={(updatedTask) => {
            handleUpdateTaskStatus(selectedTask.id, updatedTask.status);
            fetchSprintsAndTasks(); // Cập nhật lại danh sách sau khi chỉnh sửa
          }}
          selectedProject={selectedProject}
          editingTask={selectedTask}
        />
      )}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default Progress;
