// (Giữ nguyên từ phiên trước, chỉ cập nhật comment)
import React, { useState, useEffect, useRef } from 'react';
import { X, MessageSquare, Send } from 'lucide-react';
import '../styles/user/create-task-modal.css';

const CreateTaskModal = ({
  isOpen,
  onClose,
  onSubmit,
  selectedProject,
  editingTask,
  activeBacklogId,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    assignee: "",
    dueDate: "",
  });

  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);
  const [suggestedEmails, setSuggestedEmails] = useState([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const assigneeInputRef = useRef(null);

  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title,
        description: editingTask.description || "",
        priority: editingTask.priority || "Medium",
        assignee: editingTask.assignee?.email || "",
        dueDate: editingTask.dueDate
          ? new Date(editingTask.dueDate).toISOString().slice(0, 16)
          : "",
      });
      setComments(editingTask.comments || []);
    } else {
      setFormData({
        title: "",
        description: "",
        priority: "Medium",
        assignee: "",
        dueDate: "",
      });
      setComments([]);
    }
  }, [editingTask]);

  const handleAssigneeChange = async (e) => {
    const value = e.target.value;
    setFormData({ ...formData, assignee: value });

    if (value.length > 2) {
      try {
        const userId = localStorage.getItem("userId");
        const accessToken = localStorage.getItem("accessToken");
        if (!userId || !accessToken) throw new Error("Vui lòng đăng nhập lại");
        const response = await fetch(
          `http://localhost:8080/api/users/suggest?query=${encodeURIComponent(value)}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'userId': userId,
            },
            credentials: "include",
          }
        );
        if (response.ok) {
          const data = await response.json();
          setSuggestedEmails(data.map(user => user.email) || []);
          setIsSuggesting(true);
        } else {
          setSuggestedEmails([]);
        }
      } catch (err) {
        console.error("Lỗi khi gợi ý email:", err);
        setSuggestedEmails([]);
        if (err.message.includes("401") || err.message.includes("403")) {
          window.location.href = "/login";
        }
      }
    } else {
      setSuggestedEmails([]);
      setIsSuggesting(false);
    }
  };

  const handleSelectSuggestion = (email) => {
    setFormData({ ...formData, assignee: email });
    setSuggestedEmails([]);
    setIsSuggesting(false);
    assigneeInputRef.current.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");
      if (!userId || !accessToken || !activeBacklogId) {
        throw new Error("Vui lòng đăng nhập và chọn sprint hợp lệ");
      }

      const response = await fetch(
        `http://localhost:8080/api/backlog/task/${activeBacklogId}`,
        {
          method: "POST",
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${accessToken}`,
            'userId': userId,
          },
          body: new URLSearchParams({
            taskTitle: formData.title,
            description: formData.description,
            assigneeEmail: formData.assignee,
            dueDate: formData.dueDate,
            priority: formData.priority,
          }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Tạo nhiệm vụ thất bại: ${response.status}`);
      }

      const newTask = await response.json();
      onSubmit(newTask);
      onClose();
    } catch (err) {
      console.error(err.message || "Đã có lỗi xảy ra khi tạo nhiệm vụ");
      if (err.message.includes("401") || err.message.includes("403")) {
        window.location.href = "/login";
      }
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
            <input
              type="email"
              ref={assigneeInputRef}
              value={formData.assignee}
              onChange={handleAssigneeChange}
              className="create-task-form-input"
              placeholder="Enter assignee email"
              required
            />
            {isSuggesting && suggestedEmails.length > 0 && (
              <ul className="suggestion-list">
                {suggestedEmails.map((email, index) => (
                  <li
                    key={index}
                    onClick={() => handleSelectSuggestion(email)}
                    className="suggestion-item"
                  >
                    {email}
                  </li>
                ))}
              </ul>
            )}
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
  .suggestion-list {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    max-height: 150px;
    overflow-y: auto;
    z-index: 10;
    margin-top: 2px;
  }
  .suggestion-item {
    padding: 8px 12px;
    cursor: pointer;
  }
  .suggestion-item:hover {
    background-color: #f0f0f0;
  }
`;
const styleSheet = new CSSStyleSheet();
styleSheet.replaceSync(styles);
document.adoptedStyleSheets = [styleSheet];

export default CreateTaskModal;