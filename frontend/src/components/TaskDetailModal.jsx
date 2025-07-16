import React, { useState, useEffect } from "react";
import { X, FileText, MessageSquare, User, Plus } from "lucide-react";
import UploadDocumentModal from "./UploadDocumentModal";
import CommentModal from "./CommentModal";
import "../styles/user/backlog.css";

const TaskDetailModal = ({ isOpen, task, onClose, onUpdate, selectedProject, sprints, suggestedMembers }) => {
  const [documents, setDocuments] = useState([]);
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(null);

  useEffect(() => {
    if (isOpen && task) {
      fetchDocuments();
    }
  }, [isOpen, task]);

  const fetchDocuments = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");
      if (!userId || !accessToken) {
        console.log("Missing userId or accessToken, redirecting to login");
        window.location.href = "/login";
        throw new Error("Vui lòng đăng nhập lại");
      }

      console.log("Fetching documents for taskId:", task.id, "userId:", userId, "accessToken:", accessToken.substring(0, 20) + "...");
      const response = await fetch(`http://localhost:8080/api/documents/task/${task.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          userId: userId,
        },
        mode: "cors",
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.log("Unauthorized: Token may be invalid or expired");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("userId");
          window.location.href = "/login";
          throw new Error("Phiên đăng nhập hết hạn");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Lấy tài liệu thất bại: ${response.status}`
        );
      }

      const documentsData = await response.json();
      setDocuments(Array.isArray(documentsData) ? documentsData : []);
    } catch (err) {
      console.error("Lỗi khi lấy tài liệu:", err);
      alert(err.message || "Không thể lấy tài liệu. Vui lòng thử lại.");
    }
  };

  const fetchComments = async (taskId) => {
    try {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");
      if (!userId || !accessToken) {
        console.log("Missing userId or accessToken, redirecting to login");
        window.location.href = "/login";
        throw new Error("Vui lòng đăng nhập lại");
      }

      console.log("Fetching comments for taskId:", taskId, "userId:", userId, "accessToken:", accessToken.substring(0, 20) + "...");
      const response = await fetch(`http://localhost:8080/api/comments/task/${taskId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          userId: userId,
        },
        mode: "cors",
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.log("Unauthorized: Token may be invalid or expired");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("userId");
          window.location.href = "/login";
          throw new Error("Phiên đăng nhập hết hạn");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Lấy bình luận thất bại: ${response.status}`
        );
      }

      const comments = await response.json();
      return comments;
    } catch (err) {
      console.error("Lỗi khi lấy bình luận:", err);
      alert(err.message || "Không thể lấy bình luận. Vui lòng thử lại.");
      return [];
    }
  };

  const handleUploadDocument = async (file) => {
    try {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");
      if (!userId || !accessToken) {
        console.log("Missing userId or accessToken, redirecting to login");
        window.location.href = "/login";
        throw new Error("Vui lòng đăng nhập lại");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("projectId", selectedProject.id);
      if (task.id) {
        formData.append("taskId", task.id);
      }

      console.log("Uploading document with formData:", Array.from(formData.entries()), "userId:", userId, "accessToken:", accessToken.substring(0, 20) + "...");
      const response = await fetch(`http://localhost:8080/api/documents/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          userId: userId,
        },
        body: formData,
        mode: "cors",
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.log("Unauthorized: Token may be invalid or expired");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("userId");
          window.location.href = "/login";
          throw new Error("Phiên đăng nhập hết hạn");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Tải tài liệu thất bại: ${response.status}`
        );
      }

      await fetchDocuments();
      setShowDocumentForm(false);
    } catch (err) {
      console.error("Lỗi khi tải tài liệu:", err);
      alert(err.message || "Không thể tải tài liệu. Vui lòng thử lại.");
    }
  };

  const handleAddComment = async (taskId, content) => {
    try {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");
      if (!userId || !accessToken) {
        console.log("Missing userId or accessToken, redirecting to login");
        window.location.href = "/login";
        throw new Error("Vui lòng đăng nhập lại");
      }

      console.log("Adding comment for taskId:", taskId, "Content:", content, "userId:", userId, "accessToken:", accessToken.substring(0, 20) + "...");
      const response = await fetch(`http://localhost:8080/api/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          userId: userId,
        },
        body: JSON.stringify({ taskId, content }),
        mode: "cors",
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.log("Unauthorized: Token may be invalid or expired");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("userId");
          window.location.href = "/login";
          throw new Error("Phiên đăng nhập hết hạn");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Thêm bình luận thất bại: ${response.status}`
        );
      }

      setShowCommentModal({ ...showCommentModal, comments: null });
    } catch (err) {
      console.error("Lỗi khi thêm bình luận:", err);
      alert(err.message || "Không thể thêm bình luận. Vui lòng thử lại.");
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="modal-overlay">
      <div className="task-detail-modal">
        <div className="task-detail-modal-header">
          <h3 className="task-detail-modal-title">{task.title}</h3>
          <button onClick={onClose} className="modal-close-btn">
            <X size={16} />
          </button>
        </div>
        <div className="task-detail-modal-content">
          <div className="task-info">
            <p><strong>ID:</strong> {selectedProject.shortName}-{task.id}</p>
            <p><strong>Mô tả:</strong> {task.description || "Không có mô tả"}</p>
            <p><strong>Trạng thái:</strong> {task.status.replace("_", " ")}</p>
            <p><strong>Người thực hiện:</strong> {task.assignee?.name || "Chưa gán"}</p>
            <p><strong>Độ ưu tiên:</strong> {task.priority}</p>
            <p><strong>Ngày bắt đầu:</strong> {task.startDate ? new Date(task.startDate).toLocaleString() : "N/A"}</p>
            <p><strong>Ngày kết thúc:</strong> {task.endDate ? new Date(task.endDate).toLocaleString() : "N/A"}</p>
          </div>

          <div className="documents-section">
            <div className="documents-section-header">
              <h3 className="documents-section-title">Tài liệu đính kèm</h3>
              <button
                className="btn-upload-document"
                onClick={() => setShowDocumentForm(true)}
              >
                <Plus size={16} />
                Tải lên tài liệu
              </button>
            </div>
            <div className="documents-list">
              {documents.length > 0 ? (
                documents.map((document) => (
                  <div key={document.id} className="document-row">
                    <div className="document-icon">
                      <FileText size={16} />
                    </div>
                    <a
                      href={`http://localhost:8080/${document.filePath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="document-name"
                    >
                      {document.fileName}
                    </a>
                    <div className="document-uploaded-by">
                      {document.uploadedBy?.name || "Không rõ"}
                    </div>
                    <div className="document-uploaded-at">
                      {new Date(document.uploadedAt).toLocaleString()}
                    </div>
                    <button
                      className="document-comment-button"
                      onClick={async () => {
                        const comments = await fetchComments(task.id);
                        setShowCommentModal({ taskId: task.id, comments });
                      }}
                    >
                      <MessageSquare size={16} />
                      Bình luận
                    </button>
                  </div>
                ))
              ) : (
                <p className="empty-state">Không có tài liệu nào</p>
              )}
            </div>
          </div>

          <div className="comments-section">
            <div className="comments-section-header">
              <h3 className="comments-section-title">Bình luận</h3>
              <button
                className="btn-add-comment"
                onClick={async () => {
                  const comments = await fetchComments(task.id);
                  setShowCommentModal({ taskId: task.id, comments });
                }}
              >
                <MessageSquare size={16} />
                Thêm bình luận
              </button>
            </div>
          </div>
        </div>
        <UploadDocumentModal
          isOpen={showDocumentForm}
          onClose={() => setShowDocumentForm(false)}
          onSubmit={handleUploadDocument}
        />
        <CommentModal
          isOpen={showCommentModal !== null}
          taskId={showCommentModal?.taskId}
          comments={showCommentModal?.comments}
          onClose={() => setShowCommentModal(null)}
          onSubmit={handleAddComment}
          fetchComments={fetchComments}
        />
      </div>
    </div>
  );
};

export default TaskDetailModal;