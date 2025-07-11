import React, { useState, useEffect } from "react";
import "../../styles/user/backlog.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsis,
  faPlus,
  faTrash,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

const Backlog = ({ project }) => {
  const [isCreateSprintOpen, setIsCreateSprintOpen] = useState(false);
  const [sprints, setSprints] = useState([]);
  const [formData, setFormData] = useState({
    backlog_name: "",
    duration: "custom",
    start_date: null,
    end_date: null,
    sprint_goal: "",
    project_id: project.id, // Không cần chuyển thành chuỗi
  });
  const [isActionOpen, setIsActionOpen] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(null);
  const userId = localStorage.getItem("userId");
  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    fetchSprints();
  }, [project.id]);

  const fetchSprints = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/backlog/project/${project.id}`,
        {
          headers: {
            userId,
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setSprints(response.data);
    } catch (error) {
      console.error("Error fetching sprints:", error);
    }
  };

  const handleCreateSprint = () => {
    setFormData({
      backlog_name: "",
      duration: "custom",
      start_date: null,
      end_date: null,
      sprint_goal: "",
      project_id: project.id,
    });
    setIsCreateSprintOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === "duration" && value !== "custom") {
      const weeks = parseInt(value.replace(" tuần", ""));
      const startDate = new Date();
      const endDate = new Date(
        startDate.getTime() + weeks * 7 * 24 * 60 * 60 * 1000
      );
      setFormData((prev) => ({
        ...prev,
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8080/api/backlog/create-backlog",
        {
          ...formData,
          start_date:
            formData.start_date || new Date().toISOString().split("T")[0],
          end_date:
            formData.end_date ||
            new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
        },
        {
          headers: {
            userId,
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setSprints((prev) => [response.data, ...prev]);
      setIsCreateSprintOpen(false);
      setFormData({
        backlog_name: "",
        duration: "custom",
        start_date: null,
        end_date: null,
        sprint_goal: "",
        project_id: project.id,
      });
    } catch (error) {
      console.error("Error creating sprint:", error);
    }
  };

  const handleActionClick = (id) => {
    setIsActionOpen(isActionOpen === id ? null : id);
  };

  const handleDeleteConfirm = (id) => {
    setIsDeleteConfirmOpen(id);
    setIsActionOpen(null);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/backlog/${id}`, {
        headers: {
          userId,
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setSprints((prev) => prev.filter((sprint) => sprint.id !== id));
      setIsDeleteConfirmOpen(null);
    } catch (error) {
      console.error("Error deleting sprint:", error);
    }
  };

  const handleEditClick = (sprint) => {
    setFormData({
      backlog_name: sprint.backlog_name,
      duration: "custom",
      start_date: sprint.start_date,
      end_date: sprint.end_date,
      sprint_goal: sprint.sprint_goal,
      project_id: sprint.project_id,
    });
    setIsEditFormOpen(sprint.id);
    setIsActionOpen(null);
  };

  const handleUpdate = async (id) => {
    try {
      const response = await axios.put(
        `http://localhost:8080/api/backlog/${id}`,
        {
          ...formData,
          start_date:
            formData.start_date || new Date().toISOString().split("T")[0],
          end_date: formData.end_date || new Date().toISOString().split("T")[0],
        },
        {
          headers: {
            userId,
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setSprints((prev) =>
        prev.map((sprint) => (sprint.id === id ? response.data : sprint))
      );
      setIsEditFormOpen(null);
      setFormData({
        backlog_name: "",
        duration: "custom",
        start_date: null,
        end_date: null,
        sprint_goal: "",
        project_id: project.id,
      });
    } catch (error) {
      console.error("Error updating sprint:", error);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.className === "modal-overlay") {
      setIsCreateSprintOpen(false);
      setIsDeleteConfirmOpen(null);
      setIsEditFormOpen(null);
    }
  };

  const handleContainerClick = (e) => {
    if (
      !e.target.closest(".action-menu") &&
      !e.target.closest(".backlog-icon")
    ) {
      setIsActionOpen(null);
    }
  };

  return (
    <div className="backlog-container" onClick={handleContainerClick}>
      {sprints.map((sprint) => (
        <div key={sprint.id} className="backlog-start-container-info">
          <div className="backlog-header-info">
            <div className="backlog-start-info">
              <div className="backlog-info-container">
                <div className="backlog-add-title-info">
                  <div className="backlog-info-name">
                    Sprint: {sprint.backlog_name}
                  </div>
                  <div
                    className="backlog-icon"
                    id={`icon-action-backlog-${sprint.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleActionClick(sprint.id);
                    }}
                  >
                    <FontAwesomeIcon icon={faEllipsis} />
                  </div>
                  {isActionOpen === sprint.id && (
                    <div
                      className="action-menu"
                      onClick={(e) => e.stopPropagation()}
                      style={{ top: "100%", left: "0" }}
                    >
                      <div onClick={() => handleEditClick(sprint)}>
                        <FontAwesomeIcon icon={faEdit} /> Edit Sprint
                      </div>
                      <div onClick={() => handleDeleteConfirm(sprint.id)}>
                        <FontAwesomeIcon icon={faTrash} /> Delete Sprint
                      </div>
                    </div>
                  )}
                </div>
                <div className="backlog-add-date">
                  Time: {sprint.start_date} - {sprint.end_date}
                </div>
                <div className="backlog-add-work-items">
                  Work Items: {sprint.work_items}
                </div>
              </div>
              <div className="backlog-create-sprint-start">
                <button className="backlog-create-button-action-info">
                  Start Sprint
                </button>
              </div>
            </div>
            <div className="backlog-add-info">
              <div className="backlog-end-info">Task List</div>
              <div className="backlog-list-task">
                <div className="backlog-list-task-empty">
                  Your tasks are empty.
                </div>
                <div className="backlog-list-task-list">
                  <div className="backlog-task-in-list">
                    Đây là danh sách task
                  </div>
                </div>
              </div>
              <div className="backlog-list-tast-create">+ Create task</div>
            </div>
          </div>
        </div>
      ))}
      <div className="backlog-start-container">
        <div className="backlog-header">
          <div className="backlog-start">
            <div className="backlog-add-container">
              <div className="backlog-add-title">Backlog</div>
              <div className="backlog-add-date"></div>
              <div className="backlog-add-work-items"></div>
            </div>
          </div>
          <div className="backlog-add">
            <div className="backlog-end">
              <div className="backlog-create-sprint">
                <button
                  className="backlog-create-button"
                  onClick={handleCreateSprint}
                >
                  Create sprint
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="backlog-empty">Your backlog is empty.</div>
        <div className="backlog-create">
          <div className="backlog-create-icon">
            <FontAwesomeIcon icon={faPlus} />
          </div>
          <div className="backlog-create-title">Create task</div>
        </div>
      </div>
      <div style={{ width: "100%", height: "40px" }}></div>

      {isCreateSprintOpen && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div
            className="backlog-create-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="backlog-header-form">
              <div className="backlog-create-text">
                <h3>CREATE SPRINT</h3>
              </div>
              <div className="form-add-backlog">
                <form onSubmit={handleSubmit}>
                  <div className="backlog-field">
                    <label>
                      Sprint name <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="backlog_name"
                      value={formData.backlog_name}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  <div className="backlog-field">
                    <label>Duration</label>
                    <select
                      name="duration"
                      value={formData.duration}
                      onChange={handleFormChange}
                    >
                      <option value="custom">custom</option>
                      <option value="1 tuần">1 week</option>
                      <option value="2 tuần">2 weeks</option>
                      <option value="3 tuần">3 weeks</option>
                      <option value="4 tuần">4 weeks</option>
                    </select>
                  </div>
                  <div className="backlog-field-date">
                    <div className="backlog-field-date-start">
                      <label>Start date</label>
                      <input
                        type="date"
                        name="start_date"
                        value={formData.start_date || ""}
                        onChange={handleFormChange}
                        disabled={formData.duration !== "custom"}
                      />
                    </div>
                    <div className="backlog-field-date-end">
                      <label>End date</label>
                      <input
                        type="date"
                        name="end_date"
                        value={formData.end_date || ""}
                        onChange={handleFormChange}
                        disabled={formData.duration !== "custom"}
                      />
                    </div>
                  </div>
                  <div className="backlog-field">
                    <label>Sprint goal</label>
                    <textarea
                      name="sprint_goal"
                      rows={3}
                      value={formData.sprint_goal}
                      onChange={handleFormChange}
                    ></textarea>
                  </div>
                  <div className="backlog-create-btn">
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => setIsCreateSprintOpen(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-create">
                      Create
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      {isDeleteConfirmOpen && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div
            className="delete-confirm-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="delete-confirm">
              <p>Are you sure you want to delete this sprint?</p>
              <div className="backlog-create-btn">
                <button onClick={() => setIsDeleteConfirmOpen(null)}>
                  Cancel
                </button>
                <button
                  className="delete-bg"
                  onClick={() => handleDelete(isDeleteConfirmOpen)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isEditFormOpen && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div
            className="edit-form-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="backlog-header-form">
              <div className="backlog-create-text">
                <h3>EDIT SPRINT</h3>
              </div>
              <div className="form-add-backlog">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdate(isEditFormOpen);
                  }}
                >
                  <div className="backlog-field">
                    <label>
                      Sprint name <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="backlog_name"
                      value={formData.backlog_name}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  <div className="backlog-field">
                    <label>Duration</label>
                    <select
                      name="duration"
                      value={formData.duration}
                      onChange={handleFormChange}
                    >
                      <option value="custom">custom</option>
                      <option value="1 tuần">1 week</option>
                      <option value="2 tuần">2 weeks</option>
                      <option value="3 tuần">3 weeks</option>
                      <option value="4 tuần">4 weeks</option>
                    </select>
                  </div>
                  <div className="backlog-field-date">
                    <div className="backlog-field-date-start">
                      <label>Start date</label>
                      <input
                        type="date"
                        name="start_date"
                        value={formData.start_date || ""}
                        onChange={handleFormChange}
                        disabled={formData.duration !== "custom"}
                      />
                    </div>
                    <div className="backlog-field-date-end">
                      <label>End date</label>
                      <input
                        type="date"
                        name="end_date"
                        value={formData.end_date || ""}
                        onChange={handleFormChange}
                        disabled={formData.duration !== "custom"}
                      />
                    </div>
                  </div>
                  <div className="backlog-field">
                    <label>Sprint goal</label>
                    <textarea
                      name="sprint_goal"
                      rows={3}
                      value={formData.sprint_goal}
                      onChange={handleFormChange}
                    ></textarea>
                  </div>
                  <div className="backlog-create-btn">
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => setIsEditFormOpen(null)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-create">
                      Update
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Backlog;
