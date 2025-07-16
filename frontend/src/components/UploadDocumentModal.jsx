import React, { useState } from "react";
import { X, FileText } from "lucide-react";
import "../styles/user/backlog.css";

const UploadDocumentModal = ({ isOpen, onClose, onSubmit }) => {
  const [file, setFile] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      alert("Vui lòng chọn một tệp để tải lên");
      return;
    }
    onSubmit(file);
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
                Select File *
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="create-sprint-form-input"
                accept=".pdf,.doc,.docx,.jpg,.png"
              />
            </div>
            <div className="upload-document-modal-actions">
              <button type="button" onClick={onClose} className="btn-cancel">
                Cancel
              </button>
              <button type="submit" className="btn-upload-document">
                Upload
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadDocumentModal;