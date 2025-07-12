import React, { useState, useEffect, useRef } from "react";
import { X, MessageSquare, Send } from "lucide-react";
import "../styles/user/create-task-modal.css";

const CreateTaskModal = ({
  isOpen,
  onClose,
  onSubmit,
  selectedProject,
  editingTask,
  activeSprintId,
  sprints,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    assigneeEmail: "",
    dueDate: "",
    projectId: selectedProject?.id || null,
    sprintId: activeSprintId || null,
  });

  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);
  const [suggestedMembers, setSuggestedMembers] = useState([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const assigneeInputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title,
        description: editingTask.description || "",
        priority: editingTask.priority || "Medium",
        assigneeEmail: editingTask.assignee?.email || "",
        dueDate: editingTask.dueDate
          ? new Date(editingTask.dueDate).toISOString().slice(0, 16)
          : "",
        projectId: editingTask.project?.id || selectedProject?.id || null,
        sprintId: editingTask.sprint?.id || null,
      });
      setSelectedMember(
        editingTask.assignee
          ? {
              email: editingTask.assignee.email,
              name: editingTask.assignee.name,
              avatarUrl: editingTask.assignee.avatarUrl,
            }
          : null
      );
      setComments(editingTask.comments || []);
    } else {
      setFormData({
        title: "",
        description: "",
        priority: "Medium",
        assigneeEmail: "",
        dueDate: "",
        projectId: selectedProject?.id || null,
        sprintId: activeSprintId || null,
      });
      setSelectedMember(null);
      setComments([]);
    }
  }, [editingTask, selectedProject, activeSprintId]);

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
    if (query.length < 2) {
      setSuggestedMembers([]);
      setIsSuggesting(false);
      return;
    }
    try {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");
      if (!userId || !accessToken || !selectedProject?.id) {
        throw new Error("Vui lòng đăng nhập và chọn dự án hợp lệ");
      }
      const response = await fetch(
        `http://localhost:8080/api/members/search?query=${encodeURIComponent(
          query
        )}`,
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
        setSuggestedMembers(data || []);
        setIsSuggesting(true);
      } else {
        setSuggestedMembers([]);
        setIsSuggesting(false);
      }
    } catch (err) {
      console.error("Lỗi khi gợi ý thành viên:", err);
      setSuggestedMembers([]);
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
    assigneeInputRef.current.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");
      if (!userId || !accessToken || !formData.projectId) {
        throw new Error("Vui lòng đăng nhập và chọn dự án hợp lệ");
      }
      if (formData.sprintId) {
        const sprint = sprints.find(
          (s) => s.id === parseInt(formData.sprintId)
        );
        if (!sprint || !["PLANNED", "ACTIVE"].includes(sprint.status)) {
          throw new Error(
            "Sprint không hợp lệ hoặc không ở trạng thái PLANNED/ACTIVE"
          );
        }
      }

      const taskData = {
        title: formData.title,
        description: formData.description,
        assigneeEmail: formData.assigneeEmail,
        dueDate: formData.dueDate
          ? new Date(formData.dueDate).toISOString().split("T")[0]
          : null,
        priority: formData.priority,
        projectId: formData.projectId,
        sprintId: formData.sprintId,
      };

      onSubmit(taskData);
      onClose();
    } catch (err) {
      console.error(err.message || "Đã có lỗi xảy ra khi tạo nhiệm vụ");
      alert(err.message || "Không thể tạo nhiệm vụ. Vui lòng thử lại.");
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now(),
      user: "Current User",
      text: newComment,
      timestamp: new Date().toISOString(),
    };

    setComments([...comments, comment]);
    setNewComment("");
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
            <label className="create-task-form-label">Sprint</label>
            <select
              value={formData.sprintId || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sprintId:
                    e.target.value === "" ? null : parseInt(e.target.value),
                })
              }
              className="create-task-form-select"
            >
              <option value="">Backlog</option>
              {sprints.map((sprint) => (
                <option key={sprint.id} value={sprint.id}>
                  {sprint.name} ({sprint.status})
                </option>
              ))}
            </select>
          </div>
          <div className="create-task-form-group">
            <label className="create-task-form-label">Title *</label>
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
          <div className="create-task-form-group">
            <label className="create-task-form-label">Assignee</label>
            <div className="assignee-selector" ref={dropdownRef}>
              {selectedMember ? (
                <div
                  className="selected-assignee"
                  onClick={() => setIsSuggesting(true)}
                >
                  <img
                    src={selectedMember.avatarUrl || "/default-avatar.png"}
                    alt="Avatar"
                    className="assignee-avatar"
                  />
                  <span className="assignee-name">{selectedMember.name}</span>
                  <span className="assignee-email">{selectedMember.email}</span>
                </div>
              ) : (
                <input
                  type="text"
                  ref={assigneeInputRef}
                  value={formData.assigneeEmail}
                  onChange={(e) => {
                    setFormData({ ...formData, assigneeEmail: e.target.value });
                    handleAssigneeSearch(e.target.value);
                  }}
                  onFocus={() => handleAssigneeSearch(formData.assigneeEmail)}
                  className="create-task-form-input"
                  placeholder="Search for a member..."
                />
              )}
              {isSuggesting && suggestedMembers.length > 0 && (
                <ul className="assignee-suggestion-list">
                  {suggestedMembers.slice(0, 8).map((member, index) => (
                    <li
                      key={index}
                      onClick={() => handleSelectMember(member)}
                      className="assignee-suggestion-item"
                    >
                      <img
                        src={member.avatarUrl || "/default-avatar.png"}
                        alt="Avatar"
                        className="assignee-avatar"
                      />
                      <div className="assignee-info">
                        <span className="assignee-name">{member.name}</span>
                        <span className="assignee-email">{member.email}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="create-task-form-group create-task-form-grid">
            <div className="create-task-form-group">
              <label className="create-task-form-label">Priority</label>
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
            <div className="create-task-form-group">
              <label className="create-task-form-label">Due Date</label>
              <input
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                className="create-task-form-input"
              />
            </div>
          </div>
          {editingTask && (
            <div className="create-task-comment-section">
              <div className="create-task-comment-header">
                <MessageSquare size={20} style={{ color: "#6b778c" }} />
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: 500,
                    color: "#172b4d",
                  }}
                >
                  Comments
                </h3>
              </div>
              <div className="create-task-comment-list">
                {comments.map((comment) => (
                  <div key={comment.id} className="create-task-comment-item">
                    <div className="create-task-comment-meta">
                      <span className="create-task-comment-author">
                        {comment.user}
                      </span>
                      <span className="create-task-comment-time">
                        {new Date(comment.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="create-task-comment-text">{comment.text}</p>
                  </div>
                ))}
              </div>
              <div className="create-task-comment-input-group">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="create-task-comment-input"
                />
                <button
                  type="button"
                  onClick={handleAddComment}
                  className="create-task-comment-btn"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          )}
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
`;
const styleSheet = new CSSStyleSheet();
styleSheet.replaceSync(styles);
document.adoptedStyleSheets = [styleSheet];

export default CreateTaskModal;
