import React, { useState, useEffect } from "react";
import { X, MessageSquare } from "lucide-react";
import "../styles/user/backlog.css";

const CommentModal = ({ isOpen, documentId, taskId, comments, onClose, onSubmit, fetchComments }) => {
  const [commentText, setCommentText] = useState("");
  const [commentList, setCommentList] = useState(comments || []);

  useEffect(() => {
    if (isOpen && (documentId || taskId) && !comments) {
      const url = taskId
        ? `http://localhost:8080/api/comments/task/${taskId}`
        : `http://localhost:8080/api/comments/${documentId}`;
      fetchComments(url).then((data) => setCommentList(data));
    }
  }, [isOpen, documentId, taskId, comments, fetchComments]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) {
      alert("Vui lòng nhập nội dung bình luận");
      return;
    }
    onSubmit(taskId || documentId, commentText);
    setCommentText("");
  };

  if (!isOpen || (!documentId && !taskId)) return null;

  return (
    <div className="modal-overlay">
      <div className="comment-modal">
        <div className="comment-modal-header">
          <h3 className="comment-modal-title">Bình luận</h3>
          <button onClick={onClose} className="modal-close-btn">
            <X size={16} />
          </button>
        </div>
        <div className="comment-modal-content">
          <div className="comments-list">
            {commentList.length > 0 ? (
              commentList.map((comment) => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-header">
                    <span className="comment-user">{comment.user?.name || "Không rõ"}</span>
                    <span className="comment-date">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="comment-content">{comment.content}</p>
                </div>
              ))
            ) : (
              <p className="no-comments">Chưa có bình luận nào</p>
            )}
          </div>
          <form onSubmit={handleSubmit}>
            <div className="comment-form-group">
              <label className="comment-form-label">Thêm bình luận</label>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="comment-form-input"
                placeholder="Viết bình luận của bạn..."
                rows="4"
              />
            </div>
            <div className="comment-modal-actions">
              <button type="button" onClick={onClose} className="btn-cancel">
                Hủy
              </button>
              <button type="submit" className="btn-add-comment">
                Thêm bình luận
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;