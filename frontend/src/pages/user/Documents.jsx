import React, { useState, useEffect } from "react";
import { FileText, Upload, Download, Trash2, Plus } from "lucide-react";
import "../../styles/user/documents.css";
import { useParams } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";

const Documents = () => {
  const { id } = useParams();
  const { projects, isSidebarOpen } = useSidebar();
  const [selectedProject, setSelectedProject] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    const project = projects.find((p) => p.id === parseInt(id));
    setSelectedProject(project || null);
  }, [projects, id]);

  const fetchDocuments = async () => {
    if (!selectedProject) return;
    try {
      const userId = localStorage.getItem("userId");
      if (!userId || !accessToken) {
        throw new Error("Vui lòng đăng nhập lại để tiếp tục");
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/documents/${selectedProject.id}`,
        {
          method: "GET",
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
          errorData.message || `Lấy tài liệu thất bại: ${response.status}`
        );
      }

      const data = await response.json();
      setDocuments(data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [selectedProject]);

  const handleFileUpload = (files) => {
    if (!files) return;

    const newFiles = Array.from(files).map((file) => file.name);
    // Giả định cập nhật tài liệu vào project (chỉ demo)
    setDocuments((prev) => [
      ...prev,
      ...newFiles.map((name) => ({ name, taskTitle: "Task 1", taskId: 1 })),
    ]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
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
      default:
        return "📎";
    }
  };

  return (
    <div className="document-section">
      <div className="flex items-center justify-between document-header">
        <div>
          <h2 className="document-title">Documents</h2>
          <p className="document-subtitle">
            Manage project files and attachments
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <label className="upload-button flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Upload Files</span>
            <input
              type="file"
              multiple
              className="file-input"
              onChange={(e) => handleFileUpload(e.target.files)}
            />
          </label>
        </div>
      </div>

      <div
        className={`upload-area ${dragOver ? "dragover" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 file-upload-icon mx-auto mb-4" />
        <p className="upload-text">
          Drag and drop files here, or{" "}
          <label className="upload-browse-text cursor-pointer hover:underline">
            browse
            <input
              type="file"
              multiple
              className="file-input"
              onChange={(e) => handleFileUpload(e.target.files)}
            />
          </label>
        </p>
        <p className="upload-support-text">
          Supports: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG, GIF
        </p>
      </div>

      <div className="document-list">
        <div className="document-list-header">
          <div className="flex items-center justify-between">
            <h3 className="document-list-title">
              All Files ({documents.length})
            </h3>
            <div className="flex items-center space-x-2">
              <button className="sort-button">Sort by name</button>
              <button className="sort-button">Sort by date</button>
            </div>
          </div>
        </div>

        {documents.length === 0 ? (
          <div className="document-list-empty">
            <FileText className="w-12 h-12 file-text-icon mx-auto mb-4" />
            <p>No files uploaded yet</p>
            <p className="empty-text">Upload files to get started</p>
          </div>
        ) : (
          <div className="file-list">
            {documents.map((file, index) => (
              <div key={index} className="file-item">
                <div className="file-icon">{getFileIcon(file.name)}</div>
                <div>
                  <p className="file-name">{file.name}</p>
                  <p className="file-task-text">
                    Attached to: {file.taskTitle}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="file-remove" title="Download">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="file-remove" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md-grid-cols-2 gap-6">
        <div className="document-types">
          <h3 className="document-types-title">File Types</h3>
          <div className="space-y-3">
            {["PDF", "Images", "Documents", "Spreadsheets", "Other"].map(
              (type) => {
                const count = Math.floor(Math.random() * 5);
                return (
                  <div key={type} className="flex items-center justify-between">
                    <span className="type-text">{type}</span>
                    <span className="count-text">{count}</span>
                  </div>
                );
              }
            )}
          </div>
        </div>

        <div className="recent-activity">
          <h3 className="recent-activity-title">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 activity-item">
              <div className="activity-icon upload-icon">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <p className="activity-file">homepage_mockup.pdf</p>
                <p className="activity-time">Uploaded 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 activity-item">
              <div className="activity-icon download-icon">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <p className="activity-file">schema_analysis.pdf</p>
                <p className="activity-time">Downloaded 1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documents;
