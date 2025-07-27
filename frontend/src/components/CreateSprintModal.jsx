import React, { useState, useEffect, useRef, useContext } from "react";
import { X } from "lucide-react";
import "../styles/user/create-sprint-modal.css";
import { NotificationContext } from "../context/NotificationContext";

const CreateSprintModal = ({
  isOpen,
  onClose,
  onSubmit,
  selectedProject,
  projectStartDate,
  projectEndDate,
}) => {
  const [sprintFormData, setSprintFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    sprintGoal: "",
    duration: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: "" });
  const hasSubmitted = useRef(false);
  const { triggerSuccess } = useContext(NotificationContext);

  const getCurrentDate = () => {
    const now = new Date();
    now.setHours(19, 11, 0, 0);
    return now.toISOString().slice(0, 10);
  };

  useEffect(() => {
    const today = getCurrentDate();
    setSprintFormData((prev) => ({
      ...prev,
      startDate: today,
    }));
  }, []);

  const calculateEndDate = (weeks) => {
    const start = new Date(sprintFormData.startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + weeks * 7);
    return end.toISOString().slice(0, 10);
  };

  const handleDurationChange = (e) => {
    const value = e.target.value;
    setSprintFormData((prev) => {
      if (value === "Custom") {
        return { ...prev, duration: value, endDate: "" };
      } else if (value) {
        const weeks = parseInt(value);
        return { ...prev, duration: value, endDate: calculateEndDate(weeks) };
      }
      return { ...prev, duration: value, endDate: "" };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading || hasSubmitted.current) {
      console.log("Request đang xử lý hoặc đã submit, bỏ qua submit lặp");
      return;
    }
    hasSubmitted.current = true;
    setIsLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      const userName = localStorage.getItem("userName") || "Anonymous";
      const accessToken = localStorage.getItem("accessToken");
      if (!userId || !accessToken || !selectedProject?.id) {
        setErrorModal({
          isOpen: true,
          message: "Vui lòng đăng nhập và chọn dự án hợp lệ",
        });
        return;
      }

      const sprintStart = new Date(sprintFormData.startDate);
      const sprintEnd = new Date(sprintFormData.endDate);
      const projStart = new Date(projectStartDate);
      const projEnd = new Date(projectEndDate);

      if (
        isNaN(sprintStart.getTime()) ||
        isNaN(sprintEnd.getTime()) ||
        isNaN(projStart.getTime()) ||
        isNaN(projEnd.getTime())
      ) {
        setErrorModal({
          isOpen: true,
          message: "Invalid date. Please check again.",
        });
        return;
      }

      if (sprintStart > sprintEnd) {
        setErrorModal({
          isOpen: true,
          message: "The end date must be after the start date.",
        });
        return;
      }

      if (sprintStart < projStart || sprintEnd > projEnd) {
        setErrorModal({
          isOpen: true,
          message: "Sprint time should not exceed project time!",
        });
        return;
      }

      const sprintData = {
        name: sprintFormData.name,
        startDate: sprintFormData.startDate,
        endDate: sprintFormData.endDate,
        sprintGoal: sprintFormData.sprintGoal,
        duration: sprintFormData.duration,
      };

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/sprints/project/${selectedProject.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
            userName: encodeURIComponent(userName),
          },
          body: JSON.stringify(sprintData),
        }
      );

      console.log("Phản hồi từ server:", response.status);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setErrorModal({
          isOpen: true,
          message:
            errorData.message || `Tạo sprint thất bại: ${response.status}`,
        });
        return;
      }

      let newSprint;
      try {
        newSprint = await response.json();
      } catch (jsonError) {
        console.error("Lỗi parse JSON:", jsonError);
        triggerSuccess("Sprint đã được tạo, nhưng không thể parse response.");
        onSubmit({});
        return;
      }

      console.log("Sprint mới được tạo:", newSprint);
      onSubmit(newSprint);
      setSprintFormData({
        name: "",
        startDate: getCurrentDate(),
        endDate: "",
        sprintGoal: "",
        duration: "",
      });
      onClose();
      triggerSuccess(`You have successfully added the sprint.`);
    } catch (err) {
      console.error("Lỗi khi tạo sprint:", err.message);
      if (err.message.includes("401") || err.message.includes("403")) {
        window.location.href = "/login";
      }
      setErrorModal({
        isOpen: true,
        message: err.message || "Không thể tạo sprint. Vui lòng thử lại.",
      });
    } finally {
      setIsLoading(false);
      hasSubmitted.current = false;
    }
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
            <label className="create-sprint-form-label">
              Sprint Name <span style={{ color: "red" }}>*</span>
            </label>
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
          <div className="create-sprint-form-group">
            <label className="create-sprint-form-label">
              Duration <span style={{ color: "red" }}>*</span>
            </label>
            <select
              value={sprintFormData.duration}
              onChange={handleDurationChange}
              className="create-sprint-form-select"
              required
            >
              <option value="">Select duration</option>
              <option value="Custom">Custom</option>
              <option value="1 week">1 week</option>
              <option value="2 weeks">2 weeks</option>
              <option value="3 weeks">3 weeks</option>
              <option value="4 weeks">4 weeks</option>
            </select>
          </div>
          <div className="create-sprint-form-grid">
            <div className="create-sprint-form-group">
              <label className="create-sprint-form-label">
                Start Date <span style={{ color: "red" }}>*</span>
              </label>
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
                min={getCurrentDate()}
                disabled={sprintFormData.duration !== "Custom"}
              />
            </div>
            <div className="create-sprint-form-group">
              <label className="create-sprint-form-label">
                End Date <span style={{ color: "red" }}>*</span>
              </label>
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
                min={sprintFormData.startDate || getCurrentDate()}
                disabled={sprintFormData.duration !== "Custom"}
              />
            </div>
          </div>
          <div className="create-sprint-form-group">
            <label className="create-sprint-form-label">Sprint Goal</label>
            <textarea
              value={sprintFormData.sprintGoal}
              onChange={(e) =>
                setSprintFormData({
                  ...sprintFormData,
                  sprintGoal: e.target.value,
                })
              }
              className="create-sprint-form-input"
              placeholder="Enter sprint goal"
              rows="3"
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
              disabled={isLoading || hasSubmitted.current}
            >
              {isLoading ? "Creating..." : "Create Sprint"}
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

export default CreateSprintModal;
