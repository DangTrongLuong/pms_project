import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import "../styles/user/create-sprint-modal.css";

const CreateSprintModal = ({ isOpen, onClose, onSubmit, selectedProject }) => {
  const [sprintFormData, setSprintFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    sprintGoal: "",
    duration: "",
  });

  useEffect(() => {
    const today = new Date();
    today.setHours(13, 34, 0, 0); // 01:34 PM +07, 11/07/2025
    setSprintFormData((prev) => ({
      ...prev,
      startDate: today.toISOString().slice(0, 10),
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem("userId");
      const userName = localStorage.getItem("userName") || "Anonymous";
      const accessToken = localStorage.getItem("accessToken");
      if (!userId || !accessToken || !selectedProject?.id) {
        throw new Error("Vui lòng đăng nhập và chọn dự án hợp lệ");
      }

      const sprintData = {
        name: sprintFormData.name,
        startDate: sprintFormData.startDate,
        endDate: sprintFormData.endDate,
        sprintGoal: sprintFormData.sprintGoal,
        duration: sprintFormData.duration,
      };

      const response = await fetch(
        `http://localhost:8080/api/sprints/project/${selectedProject.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
            userName: userName,
          },
          body: JSON.stringify(sprintData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Tạo sprint thất bại: ${response.status}`
        );
      }

      const newSprint = await response.json();
      onSubmit(newSprint);
      onClose();
    } catch (err) {
      console.error(err.message || "Đã có lỗi xảy ra khi tạo sprint");
      if (err.message.includes("401") || err.message.includes("403")) {
        window.location.href = "/login";
      }
      alert(err.message || "Không thể tạo sprint. Vui lòng thử lại.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="create-sprint-modal-overlay">
      <div className="create-sprint-modal">
        <div className="create-sprint-modal-header">
          <h2 className="create-sprint-modal-title">Create New Sprint</h2>
          <button
            type="button"
            onClick={onClose}
            className="create-sprint-modal-close"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="create-sprint-modal-content">
          <div className="create-sprint-form-group">
            <label className="create-sprint-form-label">Sprint Name *</label>
            <input
              type="text"
              required
              value={sprintFormData.name}
              onChange={(e) =>
                setSprintFormData({
                  ...sprintFormData,
                  name: e.target.value,
                })
              }
              className="create-sprint-form-input"
              placeholder="Enter sprint name"
            />
          </div>
          <div className="create-sprint-form-grid">
            <div className="create-sprint-form-group">
              <label className="create-sprint-form-label">Start Date *</label>
              <input
                type="date"
                required
                value={sprintFormData.startDate}
                onChange={(e) =>
                  setSprintFormData({
                    ...sprintFormData,
                    startDate: e.target.value,
                  })
                }
                className="create-sprint-form-input"
                min={new Date().toISOString().slice(0, 10)}
              />
            </div>
            <div className="create-sprint-form-group">
              <label className="create-sprint-form-label">End Date *</label>
              <input
                type="date"
                required
                value={sprintFormData.endDate}
                onChange={(e) =>
                  setSprintFormData({
                    ...sprintFormData,
                    endDate: e.target.value,
                  })
                }
                className="create-sprint-form-input"
                min={
                  sprintFormData.startDate ||
                  new Date().toISOString().slice(0, 10)
                }
              />
            </div>
          </div>
          <div className="create-sprint-form-group">
            <label className="create-sprint-form-label">Sprint Goal</label>
            <input
              type="text"
              value={sprintFormData.sprintGoal}
              onChange={(e) =>
                setSprintFormData({
                  ...sprintFormData,
                  sprintGoal: e.target.value,
                })
              }
              className="create-sprint-form-input"
              placeholder="Enter sprint goal"
            />
          </div>
          <div className="create-sprint-form-group">
            <label className="create-sprint-form-label">Duration</label>
            <input
              type="text"
              value={sprintFormData.duration}
              onChange={(e) =>
                setSprintFormData({
                  ...sprintFormData,
                  duration: e.target.value,
                })
              }
              className="create-sprint-form-input"
              placeholder="Thời gian dự kiến"
            />
          </div>
          <div className="create-sprint-form-actions">
            <button
              type="button"
              onClick={onClose}
              className="create-sprint-btn create-sprint-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="create-sprint-btn create-sprint-btn-primary"
            >
              Create Sprint
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSprintModal;
