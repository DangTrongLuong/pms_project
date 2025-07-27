import React, { useState, useEffect, useRef } from "react";
import {
  X,
  MessageSquare,
  Send,
  Upload,
  Download,
  Trash2,
  FileText,
  Calendar,
  User,
} from "lucide-react";
import "../styles/user/task-detail.css";
import { useSidebar } from "../context/SidebarContext";

const TaskDetailModal = ({
  task,
  onClose,
  onUpdateTask,
  selectedProject,
  setParentActiveTab,
}) => {
  console.log("TaskDetailModal props:", {
    task: !!task,
    onClose: typeof onClose,
    onUpdateTask: typeof onUpdateTask,
    selectedProject: !!selectedProject,
    setParentActiveTab: typeof setParentActiveTab,
  });
  const [comment, setComment] = useState("");
  const [documents, setDocuments] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState("details");
  const modalRef = useRef(null);
  const { projects } = useSidebar();
  const accessToken = localStorage.getItem("accessToken");
  const userId = localStorage.getItem("userId");
  const avatar_url = localStorage.getItem("avatarUrl");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    if (task && selectedProject) {
      fetchDocuments();
      fetchTasks();
    }
  }, [task, selectedProject]);

  const fetchDocuments = async () => {
    if (!task || !selectedProject) return;
    try {
      if (!userId || !accessToken) {
        alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        window.location.href = "/login";
        return;
      }
      const response = await fetch(
        `http://localhost:8080/api/documents/${selectedProject.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
          },
        }
      );
      if (response.status === 401 || response.status === 403) {
        alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        window.location.href = "/login";
        return;
      }
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Lấy tài liệu thất bại: ${response.status}`
        );
      }
      const data = await response.json();
      const taskDocuments = data.filter((doc) => doc.taskId === task.id);
      setDocuments(taskDocuments);
    } catch (err) {
      console.error("Fetch documents error:", err);
      alert(err.message || "Không thể tải tài liệu. Vui lòng thử lại.");
    }
  };

  const fetchTasks = async () => {
    if (!selectedProject) return;
    try {
      if (!userId || !accessToken) {
        alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        window.location.href = "/login";
        return;
      }
      const sprintsResponse = await fetch(
        `http://localhost:8080/api/sprints/project/${selectedProject.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
          },
        }
      );
      if (sprintsResponse.status === 401 || sprintsResponse.status === 403) {
        alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        window.location.href = "/login";
        return;
      }
      if (!sprintsResponse.ok) {
        const errorData = await sprintsResponse.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Lấy danh sách sprint thất bại: ${sprintsResponse.status}`
        );
      }
      const sprints = await sprintsResponse.json();
      const activeSprint = sprints.find((sprint) => sprint.status === "ACTIVE");

      let allTasks = [];
      if (activeSprint) {
        const tasksResponse = await fetch(
          `http://localhost:8080/api/sprints/tasks/${activeSprint.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
              userId: userId,
            },
          }
        );
        if (tasksResponse.status === 401 || tasksResponse.status === 403) {
          alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
          window.location.href = "/login";
          return;
        }
        if (!tasksResponse.ok) {
          const errorData = await tasksResponse.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              `Lấy danh sách task thất bại: ${tasksResponse.status}`
          );
        }
        const tasksData = await tasksResponse.json();
        allTasks = [...tasksData];
      }
      setTasks(allTasks);
    } catch (err) {
      console.error("Fetch tasks error:", err);
      setTasks([]);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    try {
      if (!userId || !accessToken) {
        alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        window.location.href = "/login";
        return;
      }
      const response = await fetch(
        `http://localhost:8080/api/documents/${documentId}/delete`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
          },
        }
      );
      if (response.status === 401 || response.status === 403) {
        alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        window.location.href = "/login";
        return;
      }
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Xóa tài liệu thất bại: ${response.status}`
        );
      }
      setDocuments(documents.filter((doc) => doc.id !== documentId));
    } catch (err) {
      console.error("Delete document error:", err);
      alert(err.message || "Không thể xóa tài liệu. Vui lòng thử lại.");
    }
  };

  const handleAddComment = async (documentId) => {
    if (!comment.trim()) return;
    try {
      if (!userId || !accessToken) {
        alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        window.location.href = "/login";
        return;
      }
      const response = await fetch(
        `http://localhost:8080/api/documents/${documentId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
          },
          body: JSON.stringify({ text: comment }),
        }
      );
      if (response.status === 401 || response.status === 403) {
        alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        window.location.href = "/login";
        return;
      }
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Thêm bình luận thất bại: ${response.status}`
        );
      }
      const newComment = await response.json();
      setDocuments(
        documents.map((doc) =>
          doc.id === documentId
            ? { ...doc, comments: [...(doc.comments || []), newComment] }
            : doc
        )
      );
      setComment("");
    } catch (err) {
      console.error("Comment error:", err);
      alert(err.message || "Không thể thêm bình luận. Vui lòng thử lại.");
    }
  };

  const handleSwitchToDocumentsTab = () => {
    console.log("Switching to documents tab");
    if (typeof setParentActiveTab === "function") {
      setParentActiveTab("documents");
    } else {
      console.error(
        "setParentActiveTab is not a function:",
        setParentActiveTab
      );
    }
  };
  const handleDownload = async (documentId, fileName) => {
    try {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");
      if (!userId || !accessToken) {
        throw new Error("Vui lòng đăng nhập lại để tiếp tục");
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/documents/${documentId}/download`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Tải xuống thất bại: ${response.status}`
        );
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      alert(err.message || "Không thể tải xuống tài liệu. Vui lòng thử lại.");
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type) => {
    switch (type) {
      case "pdf":
        return "📄";
      case "doc":
      case "docx":
        return "📝";
      case "xls":
      case "xlsx":
        return "📊";
      case "ppt":
      case "pptx":
        return "📈";
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return "🖼️";
      case "css":
        return "🎨";
      case "js":
        return "📜";
      case "sketch":
      case "xd":
        return "🎨";
      default:
        return "📎";
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

  const getTypeColor = (type) => {
    switch (type) {
      case "Story":
        return "text-green-600 bg-green-50";
      case "Bug":
        return "text-red-600 bg-red-50";
      case "Task":
        return "text-blue-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (!task) return null;

  return (
    <div className="modal-overlay">
      <div
        className="task-modal"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-section">
            <h3 className="modal-title">
              {selectedProject.shortName}Task {task.taskNumber} {task.title}
            </h3>
            <p className="modal-subtitle">
              <User size={12} /> {task.assigneeName || "Unknown"} •{" "}
              <Calendar size={12} /> {new Date(task.createdAt).toLocaleString()}
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-tabs">
          <p style={{ fontSize: "17px", fontWeight: "600" }}>Description</p>
          <p>{task.description || "No description available"}</p>
        </div>

        <div className="modal-content-details">
          <div className="documents-comments-section">
            <div className="documents-section">
              <div className="documents-header-details">
                <div className="file-text-documents">
                  <FileText size={16} />
                  <span>Document ({documents.length})</span>
                </div>
                {/* <div className="btn-upload-input">
                  <button
                    className="btn btn-upload-file-details"
                    onClick={handleSwitchToDocumentsTab}
                  >
                    <Upload size={16} />
                    Upload Now
                  </button>
                </div> */}
              </div>
              {documents.length > 0 ? (
                <div className="documents-list">
                  {documents.map((doc) => (
                    <div key={doc.id} className="document-item-details">
                      <div className="file-info">
                        <div className="file-icon">{getFileIcon(doc.type)}</div>
                        <div className="file-details">
                          <p className="file-name">{doc.name}</p>
                          <div className="file-meta">
                            <span className="file-uploader">
                              <User size={12} /> {doc.uploaderName}
                            </span>
                            <span className="file-date">
                              <Calendar size={12} />{" "}
                              {new Date(doc.uploadDate).toLocaleDateString()}
                            </span>
                            <span className="file-size">
                              {formatFileSize(doc.size)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="file-actions">
                        <a
                          href={doc.url}
                          download
                          className="file-action-btn"
                          title="Tải xuống"
                          onClick={() => handleDownload(doc.id, doc.name)}
                        >
                          <Download size={16} />
                        </a>
                        <button
                          className="file-action-btn file-remove"
                          title="Xóa"
                          onClick={() => handleDeleteDocument(doc.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <p className="no-results">No documents yet.</p>
                  <p className="no-results">
                    Please go to Document to add documents.
                  </p>
                </div>
              )}
            </div>

            <div className="comments-section">
              {documents.map((doc) => (
                <div key={doc.id} className="document-comments-details">
                  <div className="comments-header">
                    <MessageSquare size={16} />
                    <span>Comments ({doc.comments?.length || 0})</span>
                  </div>
                  {doc.comments && doc.comments.length > 0 ? (
                    <div className="comments-list">
                      {doc.comments.map((comment) => (
                        <div key={comment.id} className="comment-item">
                          <div className="comment-avatar">
                            {comment.avatar ? (
                              <img src={comment.avatar} alt={comment.user} />
                            ) : (
                              <span>
                                {comment.user?.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="comment-content">
                            <p className="comment-text">{comment.text}</p>
                            <div className="comment-header">
                              <span className="comment-author">
                                {comment.user}
                              </span>
                              <span className="comment-time">
                                {new Date(comment.timestamp).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-results">No comments yet</p>
                  )}
                  <div className="comment-form">
                    <div className="comment-input-container">
                      <div className="current-user-avatar">
                        <img src={avatar_url}></img>
                      </div>
                      <input
                        type="text"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Comments..."
                        className="comment-input"
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && comment.trim()) {
                            handleAddComment(doc.id);
                            setComment("");
                          }
                        }}
                      />
                      <button
                        className="btn-send-comment"
                        onClick={() => {
                          if (comment.trim()) {
                            handleAddComment(doc.id);
                            setComment("");
                          }
                        }}
                        disabled={!comment.trim()}
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="task-details">
            <h3>Details</h3>
            <div className="detail-item">
              <span className="detail-label">Type:</span>
              <span className={`detail-value ${getTypeColor(task.type)}`}>
                {task.type || "Task"}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Status:</span>
              <span className="detail-value">{task.status}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Priority:</span>
              <span
                className={`detail-value ${getPriorityColor(task.priority)}`}
              >
                {task.priority}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Implementer:</span>
              <span className="detail-value">
                {task.assigneeName || "Not assigned yet"}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Start date:</span>
              <span className="detail-value">
                {task.startDate
                  ? new Date(task.startDate).toLocaleDateString()
                  : "Chưa đặt"}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">End date:</span>
              <span className="detail-value">
                {task.endDate
                  ? new Date(task.endDate).toLocaleDateString()
                  : "Chưa đặt"}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Describe:</span>
              <span className="detail-value description">
                {task.description || "No description available"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
