import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import "../styles/user/create-task-modal.css";

const CreateTaskModal = ({
  isOpen,
  onClose,
  onSubmit,
  selectedProject,
  editingTask,
  activeSprintId,
  sprints,
  suggestedMembers = [],
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    assigneeEmail: "",
    startDate: "",
    endDate: "",
    projectId: selectedProject?.id || null,
    sprintId: activeSprintId || null,
  });
  const [sprintStartDate, setSprintStartDate] = useState(null);
  const [sprintEndDate, setSprintEndDate] = useState(null);
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: "" });
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [localSuggestedMembers, setLocalSuggestedMembers] =
    useState(suggestedMembers);
  const assigneeInputRef = useRef(null);
  const dropdownRef = useRef(null);

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  };

  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title,
        description: editingTask.description || "",
        priority: editingTask.priority || "Medium",
        assigneeEmail: editingTask.assigneeEmail || "",
        startDate: editingTask.startDate
          ? new Date(editingTask.startDate).toISOString().slice(0, 16)
          : "",
        endDate: editingTask.endDate
          ? new Date(editingTask.endDate).toISOString().slice(0, 16)
          : "",
        projectId: editingTask.projectId || selectedProject?.id || null,
        sprintId: editingTask.sprintId || null,
      });
      setSelectedMember(
        editingTask.assigneeEmail
          ? {
              email: editingTask.assigneeEmail,
              name: editingTask.assigneeName,
              avatarUrl: editingTask.assigneeAvatarUrl,
            }
          : null
      );
    } else {
      setFormData({
        title: "",
        description: "",
        priority: "Medium",
        assigneeEmail: "",
        startDate: "",
        endDate: "",
        projectId: selectedProject?.id || null,
        sprintId: activeSprintId || null,
      });
      setSelectedMember(null);
    }
    setLocalSuggestedMembers(suggestedMembers);

    if (formData.sprintId) {
      const selectedSprint = sprints.find(
        (s) => s.id === parseInt(formData.sprintId)
      );
      if (selectedSprint) {
        setSprintStartDate(selectedSprint.startDate);
        setSprintEndDate(selectedSprint.endDate);
      } else {
        setSprintStartDate(null);
        setSprintEndDate(null);
      }
    } else {
      setSprintStartDate(null);
      setSprintEndDate(null);
    }
  }, [
    editingTask,
    selectedProject,
    activeSprintId,
    suggestedMembers,
    formData.sprintId,
    sprints,
  ]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsSuggesting(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAssigneeSearch = async (query) => {
    try {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");
      if (!userId || !accessToken || !selectedProject?.id) {
        setErrorModal({
          isOpen: true,
          message: "Vui lòng đăng nhập và chọn dự án hợp lệ",
        });
        return;
      }
      const response = await fetch(
        `${
          process.env.REACT_APP_API_URL
        }/api/members/search?query=${encodeURIComponent(query)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
          },
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setLocalSuggestedMembers(data || []);
        setIsSuggesting(true);
      } else {
        setLocalSuggestedMembers([]);
        setIsSuggesting(false);
      }
    } catch (err) {
      console.error("Lỗi khi gợi ý thành viên:", err);
      setLocalSuggestedMembers([]);
      setIsSuggesting(false);
      if (err.message.includes("401") || err.message.includes("403")) {
        window.location.href = "/login";
      }
    }
  };

  const handleSelectMember = (member) => {
    setFormData({ ...formData, assigneeEmail: member.email });
    setSelectedMember(member);
    setIsSuggesting(false);
    assigneeInputRef.current?.focus();
  };

  const handleSprintChange = (e) => {
    const sprintId = e.target.value === "" ? null : parseInt(e.target.value);
    setFormData({ ...formData, sprintId });
    if (sprintId) {
      const selectedSprint = sprints.find((s) => s.id === sprintId);
      if (selectedSprint) {
        setSprintStartDate(selectedSprint.startDate);
        setSprintEndDate(selectedSprint.endDate);
      } else {
        setSprintStartDate(null);
        setSprintEndDate(null);
      }
    } else {
      setSprintStartDate(null);
      setSprintEndDate(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");
      if (!userId || !accessToken || !formData.projectId) {
        setErrorModal({
          isOpen: true,
          message: "Vui lòng đăng nhập và chọn dự án hợp lệ",
        });
        return;
      }
      if (formData.sprintId) {
        const sprint = sprints.find(
          (s) => s.id === parseInt(formData.sprintId)
        );
        if (!sprint || !["PLANNED", "ACTIVE"].includes(sprint.status)) {
          setErrorModal({
            isOpen: true,
            message:
              "Sprint không hợp lệ hoặc không ở trạng thái PLANNED/ACTIVE",
          });
          return;
        }

        const taskStart = new Date(formData.startDate);
        const taskEnd = new Date(formData.endDate);
        const sprStart = new Date(sprintStartDate);
        const sprEnd = new Date(sprintEndDate);

        if (
          isNaN(taskStart.getTime()) ||
          isNaN(taskEnd.getTime()) ||
          (sprintStartDate && isNaN(sprStart.getTime())) ||
          (sprintEndDate && isNaN(sprEnd.getTime()))
        ) {
          setErrorModal({
            isOpen: true,
            message: "Invalid date. Please check again.",
          });
          return;
        }

        if (taskStart > taskEnd) {
          setErrorModal({
            isOpen: true,
            message: "The end date must be after the start date of the sprint.",
          });
          return;
        }

        if (
          sprintStartDate &&
          sprintEndDate &&
          (taskStart < sprStart || taskEnd > sprEnd)
        ) {
          setErrorModal({
            isOpen: true,
            message: "Task duration must not exceed sprint duration!",
          });
          return;
        }
      }

      const taskData = {
        title: formData.title,
        description: formData.description,
        assigneeEmail: formData.assigneeEmail,
        startDate: formData.startDate
          ? new Date(formData.startDate).toISOString()
          : null,
        endDate: formData.endDate
          ? new Date(formData.endDate).toISOString()
          : null,
        priority: formData.priority,
        projectId: formData.projectId,
        sprintId: formData.sprintId,
      };

      onSubmit(taskData);
      onClose();
    } catch (err) {
      console.error(err.message || "Đã có lỗi xảy ra khi tạo nhiệm vụ");
      setErrorModal({
        isOpen: true,
        message: err.message || "Không thể tạo nhiệm vụ. Vui lòng thử lại.",
      });
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const names = name.split(" ");
    return names
      .map((n) => n.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const getAvatarColor = (name) => {
    if (!name) return "#cccccc";
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEEAD",
      "#D4A5A5",
      "#9B59B6",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const ErrorModal = ({ isOpen, message, onClose }) => {
    if (!isOpen) return null;
    return (
      <div className="error-modal-overlay">
        <div className="error-modal">
          <div className="error-modal-header">
            <h3 className="error-modal-title">Error</h3>
            <button
              type="button"
              onClick={onClose}
              className="error-modal-close"
            >
              <X size={20} />
            </button>
          </div>
          <div className="error-modal-content">
            <p>{message}</p>
          </div>
          <div className="error-modal-actions">
            <button type="button" onClick={onClose} className="error-modal-btn">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="create-task-modal-overlay">
      <div className="create-task-modal">
        <div className="create-task-modal-header">
          <h2 className="create-task-modal-title">
            {editingTask ? "Edit Task" : "Create New Task"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="create-task-modal-close"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="create-task-modal-content">
          <div className="create-task-form-group">
            <label className="create-task-form-label">
              Sprint <span style={{ color: "red" }}>*</span>
            </label>
            <select
              value={formData.sprintId || ""}
              onChange={handleSprintChange}
              className="create-task-form-select"
            >
              <option value="">Select a sprint</option>
              {sprints?.map((sprint) => (
                <option key={sprint.id} value={sprint.id}>
                  {sprint.name} ({sprint.status})
                </option>
              ))}
            </select>
          </div>
          <div className="create-task-form-group">
            <label className="create-task-form-label">
              Title <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              className="create-task-form-input"
              placeholder="Enter task title"
            />
          </div>
          <div className="create-task-form-group">
            <label className="create-task-form-label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="create-task-form-textarea"
              placeholder="Enter task description"
            />
          </div>

          <div className="create-task-form-group create-task-form-grid">
            <div className="create-task-form-group">
              <label className="create-task-form-label">
                Start Date <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.startDate}
                required
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                min={getCurrentDateTime()}
                className="create-task-form-input"
              />
            </div>
            <div className="create-task-form-group">
              <label className="create-task-form-label">
                End Date <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                min={formData.startDate || getCurrentDateTime()}
                className="create-task-form-input"
              />
            </div>
          </div>

          <div className="create-task-form-group">
            <label className="create-task-form-label">
              Priority <span style={{ color: "red" }}>*</span>
            </label>
            <select
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value })
              }
              className="create-task-form-select"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="create-task-form-actions">
            <button
              type="button"
              onClick={onClose}
              className="create-task-btn create-task-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="create-task-btn create-task-btn-primary"
            >
              {editingTask ? "Update Task" : "Create Task"}
            </button>
          </div>
        </form>
        <ErrorModal
          isOpen={errorModal.isOpen}
          message={errorModal.message}
          onClose={() => setErrorModal({ isOpen: false, message: "" })}
        />
      </div>
    </div>
  );
};

const styles = `
  .assignee-selector {
    position: relative;
    width: 100%;
  }
  .selected-assignee {
    display: flex;
    align-items: center;
    padding: 8px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    cursor: pointer;
    background: #fff;
  }
  .assignee-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    margin-right: 8px;
    object-fit: cover;
  }
  .assignee-initials {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
    color: #fff;
  }
  .assignee-name {
    font-weight: 500;
    color: #172b4d;
  }
  .assignee-email {
    color: #6b778c;
    font-size: 12px;
    margin-left: 8px;
  }
  .assignee-suggestion-list {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    max-height: 200px;
    overflow-y: auto;
    z-index: 1000;
    margin-top: 4px;
  }
  .assignee-suggestion-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    cursor: pointer;
  }
  .assignee-suggestion-item:hover {
    background-color: #f0f0f0;
  }
  .assignee-info {
    display: flex;
    flex-direction: column;
  }
  .error-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
  }
  .error-modal {
    background: #fff;
    border-radius: 8px;
    width: 400px;
    max-width: 90%;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    overflow: hidden;
  }
  .error-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #e0e0e0;
  }
  .error-modal-title {
    font-size: 18px;
    font-weight: 600;
    color: #d32f2f;
  }
  .error-modal-close {
    background: none;
    border: none;
    cursor: pointer;
    color: #172b4d;
  }
  .error-modal-content {
    padding: 16px;
    font-size: 14px;
    color: #172b4d;
  }
  .error-modal-actions {
    padding: 16px;
    display: flex;
    justify-content: flex-end;
  }
  .error-modal-btn {
    background: #d32f2f;
    color: #fff;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  }
  .error-modal-btn:hover {
    background: #b71c1c;
  }
`;

const styleSheet = new CSSStyleSheet();
styleSheet.replaceSync(styles);
document.adoptedStyleSheets = [...document.adoptedStyleSheets, styleSheet];

export default CreateTaskModal;
