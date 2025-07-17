import React, { useState } from "react";
import { X, FileText } from "lucide-react";
import "../styles/user/backlog.css";

const UploadDocumentModal = ({ isOpen, onClose, onSubmit }) => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Kiểm tra định dạng và kích thước tệp
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Định dạng tệp không được hỗ trợ. Chỉ chấp nhận .pdf, .doc, .docx, .jpg, .png");
      setFile(null);
      return;
    }
    if (selectedFile.size > maxSize) {
      setError("Tệp quá lớn. Kích thước tối đa là 5MB.");
      setFile(null);
      return;
    }

    setError(null);
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Vui lòng chọn một tệp để tải lên");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await onSubmit(file);
      setFile(null);
    } catch (err) {
      setError(err.message || "Không thể tải tài liệu. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="upload-document-modal">
        <div className="upload-document-modal-header">
          <h3 className="upload-document-modal-title">Upload Document</h3>
          <button onClick={onClose} className="modal-close-btn">
            <X size={16} />
          </button>
        </div>
        <div className="upload-document-modal-content">
          <form onSubmit={handleSubmit}>
            <div className="create-sprint-form-group">
              <label className="create-sprint-form-label">
                Select File * <span style={{ color: "red" }}>(Max 5MB)</span>
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="create-sprint-form-input"
                accept=".pdf,.doc,.docx,.jpg,.png"
                disabled={isLoading}
              />
              {file && (
                <p className="file-selected">Selected: {file.name}</p>
              )}
              {error && (
                <p className="error-message" style={{ color: "red" }}>
                  {error}
                </p>
              )}
            </div>
            <div className="upload-document-modal-actions">
              <button
                type="button"
                onClick={onClose}
                className="btn-cancel"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-upload-document"
                disabled={isLoading}
              >
                {isLoading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadDocumentModal;