/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef, useContext } from "react";
import { SidebarProvider, useSidebar } from "../../context/SidebarContext";
import "../../styles/user/dashboard.css";
import "../../styles/user/my_project.css";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { NotificationContext } from "../../context/NotificationContext";

// Utility functions
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getInitials = (name = "") => {
  if (!name || typeof name !== "string") return "";
  const names = name.split(" ").map((n) => n[0]);
  return names.length > 0 ? names.join("").toUpperCase() : "";
};

const mapStatusToFrontend = (backendStatus) => {
  const statusMap = {
    IN_PROGRESS: "ACTIVE",
    COMPLETED: "COMPLETED",
    PLANNING: "Planning",
  };
  return statusMap[backendStatus] || "ACTIVE";
};

const mapTypeToFrontend = (backendType) => {
  if (!backendType) return "Kanban";
  return (
    backendType.charAt(0).toUpperCase() + backendType.slice(1).toLowerCase()
  );
};

// SearchBar Component
const SearchBar = ({ searchQuery, onSearchChange }) => {
  return (
    <div className="search-container">
      <i className="fas fa-search search-icon"></i>
      <input
        type="text"
        className="search-input"
        placeholder="Search projects..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        aria-label="Search projects"
      />
    </div>
  );
};

// Dropdown Component
const Dropdown = ({ label, options, selected, onSelect, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === selected);

  return (
    <div className={`dropdown ${className}`} ref={dropdownRef}>
      <button
        className={`dropdown-button ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={label}
      >
        <span>{selectedOption ? selectedOption.label : label}</span>
        <i className={`fas fa-chevron-${isOpen ? "up" : "down"}`}></i>
      </button>
      {isOpen && (
        <div className="dropdown-menu">
          {options.map((option) => (
            <div
              key={option.value}
              className={`dropdown-item ${
                selected === option.value ? "selected" : ""
              }`}
              onClick={() => {
                onSelect(option.value);
                setIsOpen(false);
              }}
            >
              {option.icon && <i className={option.icon}></i>}
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// StatsBar Component
const StatsBar = ({ projects }) => {
  const stats = {
    total: projects.length,
    active: projects.filter((p) => p.status === "ACTIVE").length,
    completed: projects.filter((p) => p.status === "COMPLETED").length,
  };

  return (
    <div className="stats-bar">
      <div className="stat-item">
        <div className="stat-number">{stats.total}</div>
        <div className="stat-label">Total Projects</div>
      </div>
      <div className="stat-item">
        <div className="stat-number">{stats.active}</div>
        <div className="stat-label">Active</div>
      </div>
      <div className="stat-item">
        <div className="stat-number">{stats.completed}</div>
        <div className="stat-label">Completed</div>
      </div>
    </div>
  );
};

// EditProjectModal Component
const EditProjectModal = ({ project, onClose, onUpdate }) => {
  const today = new Date().toISOString().split("T")[0];
  const [formData, setFormData] = useState({
    project_name: project?.project_name || "",
    description: project?.description || "",
    start_date: project?.start_date
      ? new Date(project.start_date).toISOString().split("T")[0]
      : "",
    end_date: project?.end_date
      ? new Date(project.end_date).toISOString().split("T")[0]
      : "",
  });
  const [errors, setErrors] = useState({
    project_name: "",
    start_date: "",
    end_date: "",
  });

  const validateForm = (data) => {
    const newErrors = {
      project_name: "",
      start_date: "",
      end_date: "",
    };
    let isValid = true;

    // Only validate project_name if it's provided and changed
    if (data.project_name && data.project_name !== project.project_name) {
      if (!data.project_name.trim()) {
        newErrors.project_name = "Project name is required.";
        isValid = false;
      }
    }

    // Only validate start_date if it's provided and changed
    if (
      data.start_date &&
      data.start_date !==
        (project.start_date
          ? new Date(project.start_date).toISOString().split("T")[0]
          : "")
    ) {
      if (new Date(data.start_date) < new Date(today)) {
        newErrors.start_date = "Start date cannot be in the past.";
        isValid = false;
      }
    }

    // Only validate end_date if it's provided and changed
    if (
      data.end_date &&
      data.end_date !==
        (project.end_date
          ? new Date(project.end_date).toISOString().split("T")[0]
          : "")
    ) {
      if (data.start_date && data.end_date < data.start_date) {
        newErrors.end_date = "End date cannot be before start date.";
        isValid = false;
      }
      if (new Date(data.end_date) < new Date(today)) {
        newErrors.end_date = "End date cannot be in the past.";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);
    validateForm(updatedFormData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Check if at least one field has changed
    const hasChanges =
      formData.project_name !== project.project_name ||
      formData.description !== (project.description || "") ||
      formData.start_date !==
        (project.start_date
          ? new Date(project.start_date).toISOString().split("T")[0]
          : "") ||
      formData.end_date !==
        (project.end_date
          ? new Date(project.end_date).toISOString().split("T")[0]
          : "");

    if (!hasChanges) {
      setErrors({ ...errors, project_name: "No changes detected." });
      return;
    }

    if (validateForm(formData)) {
      // Only include changed fields in the update payload
      const updatePayload = {};
      if (formData.project_name !== project.project_name) {
        updatePayload.project_name = formData.project_name;
      }
      if (formData.description !== (project.description || "")) {
        updatePayload.description = formData.description;
      }
      if (
        formData.start_date !==
        (project.start_date
          ? new Date(project.start_date).toISOString().split("T")[0]
          : "")
      ) {
        updatePayload.start_date = formData.start_date;
      }
      if (
        formData.end_date !==
        (project.end_date
          ? new Date(project.end_date).toISOString().split("T")[0]
          : "")
      ) {
        updatePayload.end_date = formData.end_date;
      }

      onUpdate(project.id, updatePayload);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Edit Project</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group-edit-project">
            <label htmlFor="project_name">Project Name</label>
            <input
              type="text"
              id="project_name"
              name="project_name"
              value={formData.project_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group-edit-project">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>
          <div className="start-end-edit-project">
            <div className="form-group-edit-project">
              <label htmlFor="start_date">
                Start Date <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                required
                value={formData.start_date}
                onChange={handleChange}
                min={today}
              />
            </div>
            <div className="form-group-edit-project">
              <label htmlFor="end_date">
                End Date <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="date"
                id="end_date"
                name="end_date"
                required
                value={formData.end_date}
                onChange={handleChange}
                min={formData.start_date || today}
              />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

// ProjectCard Component
const ProjectCard = ({
  project,
  onViewDetails,
  onActionClick,
  canManageMembers,
  currentUserEmail,
  onEditClick,
  onDeleteClick,
  currentUser,
}) => {
  const leadName = project.leader || "Unknown";
  const membersList = (project.members || "").split(", ").filter(Boolean);
  const memberColors = useRef({});

  const generateLightColor = () => {
    const r = Math.floor(Math.random() * 156) + 100; // 100–255
    const g = Math.floor(Math.random() * 156) + 100;
    const b = Math.floor(Math.random() * 156) + 100;
    return `rgb(${r}, ${g}, ${b})`;
  };

  const getActiveColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "project-active";
      case "COMPLETED":
        return "project-completed";
      default:
        return "status-default";
    }
  };

  return (
    <div className="project-card" onClick={() => onViewDetails(project.id)}>
      <div className="name-button-change">
        <div className="project-card-type-badge">
          <div className="project-card-title">
            <h3>{project.project_name || "Unnamed Project"}</h3>
          </div>
          <div className="project-type-badge">
            ({mapTypeToFrontend(project.project_type)})
          </div>
        </div>
        <div className="project-card-status">
          <div
            className={`project-card-status-content ${getActiveColor(
              project.status
            )}`}
          >
            {project.status}
          </div>
        </div>
      </div>

      <p className="project-card-description">
        Description: {project.description || "No description"}
      </p>
      <div className="project-card-footer">
        <div className="project-card-date">
          Start: {formatDate(project.start_date)}
        </div>
        <div className="project-lead">
          <div className="lead-avatar">
            Leader: <span>{leadName}</span>
          </div>
        </div>
      </div>
      <div className="project-team">
        <div className="team-label">Members</div>
        <div className="team-avatars">
          {membersList.slice(0, 4).map((member, index) => {
            if (!memberColors.current[member]) {
              memberColors.current[member] = generateLightColor();
            }
            return (
              <div
                key={index}
                className="team-avatar"
                title={member}
                style={{
                  backgroundColor: memberColors.current[member],
                  color: "#000",
                }}
              >
                {getInitials(member)}
                {canManageMembers && member !== currentUserEmail && (
                  <div className="action-delete-change">
                    <FontAwesomeIcon
                      icon={faEllipsis}
                      onClick={(e) => {
                        e.stopPropagation();
                        onActionClick(project.id, member, e);
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
          {membersList.length > 4 && (
            <div
              className="team-avatar team-more"
              title={`+${membersList.length - 4} more members`}
            >
              {`+${membersList.length - 4}`}
            </div>
          )}
        </div>
      </div>
      {currentUser === leadName && (
        <div className="btn-edit-delete-project">
          <div className="btn-edit-card-project">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditClick(project);
              }}
            >
              Edit Project
            </button>
          </div>
          <div className="btn-delete-card">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteClick(project.id);
              }}
            >
              Delete Project
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ProjectsList Component
const ProjectsList = ({
  projects,
  viewMode,
  loading,
  navigate,
  handleViewDetails,
  handleActionClick,
  canManageMembers,
  currentUserEmail,
  onEditClick,
  onDeleteClick,
  currentUser,
}) => {
  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        Loading projects...
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="empty-state">
        <i className="fas fa-folder-open" />
        <h3>No projects found</h3>
        <p>Try adjusting your search or filter criteria.</p>
      </div>
    );
  }

  return (
    <div className={viewMode === "grid" ? "projects-grid" : "projects-list"}>
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onViewDetails={handleViewDetails}
          onActionClick={handleActionClick}
          canManageMembers={canManageMembers(project.id)}
          currentUserEmail={currentUserEmail}
          onEditClick={onEditClick}
          onDeleteClick={onDeleteClick}
          currentUser={currentUser}
        />
      ))}
    </div>
  );
};

// Main MyProjects Component
const MyProjects = () => {
  const { isSidebarOpen, setProjectsSidebar } = useSidebar();
  const navigate = useNavigate();
  const { id } = useParams();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState("grid");
  const [error, setError] = useState("");
  const [actionMenu, setActionMenu] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [transferConfirm, setTransferConfirm] = useState(null);
  const [deleteProjectConfirm, setDeleteProjectConfirm] = useState(null);
  const [editProject, setEditProject] = useState(null);
  const [members, setMembers] = useState({});
  const [loading, setLoading] = useState(true);
  const actionRef = useRef(null);
  const currentUserEmail = localStorage.getItem("userEmail");
  const currentUser = localStorage.getItem("userName");
  const { triggerSuccess } = useContext(NotificationContext);

  useEffect(() => {
    window.progressCallback = (navigateCallback) => {
      const progress = document.getElementById("global-progress-bar");
      if (progress) {
        progress.style.width = "0%";
        progress.style.display = "block";
        let width = 0;
        const interval = setInterval(() => {
          if (width >= 100) {
            clearInterval(interval);
            progress.style.display = "none";
            if (navigateCallback) navigateCallback();
          } else {
            width += 15;
            progress.style.width = width + "%";
            progress.style.transition = "width 0.3s linear";
          }
        }, 100);
      }
    };
    return () => {
      delete window.progressCallback;
    };
  }, []);

  const handleItemClick = (path) => {
    if (window.progressCallback) {
      window.progressCallback(() => navigate(path));
    } else {
      navigate(path);
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const userId = localStorage.getItem("userId");
        const accessToken = localStorage.getItem("accessToken");

        if (!userId || !accessToken) {
          throw new Error("User not authenticated");
        }

        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/projects/my-projects`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
              userId: userId,
            },
          }
        );

        const data = await response.json();
        if (response.ok) {
          const mappedProjects = data.map((project) => ({
            ...project,
            status: mapStatusToFrontend(project.status || "ACTIVE"),
            project_type: project.project_type || "kanban",
            progress: project.progress || 0,
          }));
          setProjects(mappedProjects);
          setFilteredProjects(mappedProjects);
          setProjectsSidebar(mappedProjects);
          localStorage.setItem("projects", JSON.stringify(mappedProjects));

          const membersData = {};
          for (const project of data) {
            const membersResponse = await fetch(
              `${process.env.REACT_APP_API_URL}/api/members/project/${project.id}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${accessToken}`,
                  userId: userId,
                },
              }
            );
            const membersDataResponse = await membersResponse.json();
            if (membersResponse.ok) {
              membersData[project.id] = membersDataResponse;
            }
          }
          setMembers(membersData);
        } else {
          throw new Error(data.message || "Failed to fetch projects");
        }
      } catch (err) {
        setError(
          err.message || "An error occurred while fetching the project list"
        );
        console.error("Fetch projects error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [setProjectsSidebar]);

  useEffect(() => {
    const filterAndSortProjects = () => {
      let filtered = [...projects];

      if (searchQuery.trim()) {
        filtered = filtered.filter((project) =>
          project.project_name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
        );
      }

      if (statusFilter !== "all") {
        filtered = filtered.filter(
          (project) => project.status === statusFilter
        );
      }

      if (typeFilter !== "all") {
        filtered = filtered.filter(
          (project) => mapTypeToFrontend(project.project_type) === typeFilter
        );
      }

      filtered.sort((a, b) => {
        switch (sortBy) {
          case "name":
            return (a.project_name || "").localeCompare(b.project_name || "");
          case "name-desc":
            return (b.project_name || "").localeCompare(a.project_name || "");
          case "progress":
            return (a.progress || 0) - (b.progress || 0);
          case "progress-desc":
            return (b.progress || 0) - (a.progress || 0);
          case "creation-date":
            return new Date(a.start_date || 0) - new Date(b.start_date || 0);
          case "creation-date-desc":
            return new Date(b.start_date || 0) - new Date(a.start_date || 0);
          default:
            return 0;
        }
      });

      setFilteredProjects(filtered);
    };

    filterAndSortProjects();
  }, [searchQuery, statusFilter, typeFilter, sortBy, projects]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionRef.current && !actionRef.current.contains(event.target)) {
        setActionMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleActionClick = (projectId, memberEmail, event) => {
    const rect = event.target.getBoundingClientRect();
    setActionMenu({
      projectId,
      memberEmail,
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    });
  };

  const handleDeleteMember = async (projectId, email) => {
    try {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");

      const response = await fetch(
        `${
          process.env.REACT_APP_API_URL
        }/api/members/project/${projectId}/email/${encodeURIComponent(email)}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to remove member");
      }

      const fetchResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/api/projects/my-projects`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
          },
        }
      );

      const data = await fetchResponse.json();
      if (fetchResponse.ok) {
        const mappedProjects = data.map((project) => ({
          ...project,
          status: mapStatusToFrontend(project.status || "ACTIVE"),
          project_type: project.project_type || "kanban",
          progress: project.progress || 0,
        }));
        setProjects(mappedProjects);
        setFilteredProjects(mappedProjects);
        setProjectsSidebar(mappedProjects);
        localStorage.setItem("projects", JSON.stringify(mappedProjects));

        const membersResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/api/members/project/${projectId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
              userId: userId,
            },
          }
        );
        const membersDataResponse = await membersResponse.json();
        if (membersResponse.ok) {
          setMembers((prev) => ({
            ...prev,
            [projectId]: membersDataResponse,
          }));
        }
      } else {
        throw new Error(data.message || "Failed to fetch projects");
      }

      setDeleteConfirm(null);
      setActionMenu(null);
    } catch (err) {
      setError(err.message || "Error removing member");
      console.error("Delete member error:", err);
    }
  };

  const handleTransferLeader = async (projectId, email) => {
    try {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/members/project/${projectId}/transfer-leader`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
          },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to transfer leader");
      }

      const fetchResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/api/projects/my-projects`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
          },
        }
      );

      const data = await fetchResponse.json();
      if (fetchResponse.ok) {
        const mappedProjects = data.map((project) => ({
          ...project,
          status: mapStatusToFrontend(project.status || "ACTIVE"),
          project_type: project.project_type || "kanban",
          progress: project.progress || 0,
        }));
        setProjects(mappedProjects);
        setFilteredProjects(mappedProjects);
        setProjectsSidebar(mappedProjects);
        localStorage.setItem("projects", JSON.stringify(mappedProjects));

        const membersResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/api/members/project/${projectId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
              userId: userId,
            },
          }
        );
        const membersDataResponse = await membersResponse.json();
        if (membersResponse.ok) {
          setMembers((prev) => ({
            ...prev,
            [projectId]: membersDataResponse,
          }));
        }
      } else {
        throw new Error(data.message || "Failed to fetch projects");
      }

      setTransferConfirm(null);
      setActionMenu(null);
    } catch (err) {
      setError(err.message || "Error transferring leader");
      console.error("Transfer leader error:", err);
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/projects/delete/${projectId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete project");
      }

      const fetchResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/api/projects/my-projects`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
          },
        }
      );

      const data = await fetchResponse.json();
      if (fetchResponse.ok) {
        const mappedProjects = data.map((project) => ({
          ...project,
          status: mapStatusToFrontend(project.status || "ACTIVE"),
          project_type: project.project_type || "kanban",
          progress: project.progress || 0,
        }));
        setProjects(mappedProjects);
        setFilteredProjects(mappedProjects);
        setProjectsSidebar(mappedProjects);
        localStorage.setItem("projects", JSON.stringify(mappedProjects));
      } else {
        throw new Error(data.message || "Failed to fetch projects");
      }

      setDeleteProjectConfirm(null);
      triggerSuccess("The project has been successfully deleted.");
    } catch (err) {
      setError(err.message || "Error deleting project");
      console.error("Delete project error:", err);
    }
  };

  const handleEditClick = (project) => {
    setEditProject(project);
  };

  const handleUpdateProject = async (projectId, formData) => {
    try {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/projects/${projectId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update project");
      }

      const updatedProject = await response.json();
      const mappedProject = {
        ...updatedProject,
        status: mapStatusToFrontend(updatedProject.status || "ACTIVE"),
        project_type: updatedProject.project_type || "kanban",
        progress: updatedProject.progress || 0,
      };

      const updatedProjects = projects.map((p) =>
        p.id === projectId ? mappedProject : p
      );
      setProjects(updatedProjects);
      setFilteredProjects(updatedProjects);
      setProjectsSidebar(updatedProjects);
      localStorage.setItem("projects", JSON.stringify(updatedProjects));

      setEditProject(null);
      triggerSuccess("The project has been successfully updated.");
    } catch (err) {
      setError(err.message || "Error updating project");
      console.error("Update project error:", err);
    }
  };

  const handleDeleteClick = (projectId) => {
    setDeleteProjectConfirm({ projectId });
  };

  const isLeader = (projectId, email) => {
    const projectMembers = members[projectId] || [];
    const member = projectMembers.find((m) => m.email === email);
    return member && member.role === "LEADER";
  };

  const canManageMembers = (projectId) => {
    return isLeader(projectId, currentUserEmail);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setTypeFilter("all");
    setSortBy("name");
  };

  const handleViewDetails = (projectId) => {
    handleItemClick(`/project-task/${projectId}/backlog`);
  };

  const statusOptions = [
    { value: "all", label: "All Statuses", icon: "fas fa-list" },
    { value: "ACTIVE", label: "Active", icon: "fas fa-play-circle" },
    { value: "COMPLETED", label: "Completed", icon: "fas fa-check-circle" },
  ];

  const sortOptions = [
    { value: "name", label: "Name (A-Z)", icon: "fas fa-sort-alpha-down" },
    { value: "name-desc", label: "Name (Z-A)", icon: "fas fa-sort-alpha-up" },
    {
      value: "progress",
      label: "Progress (Low-High)",
      icon: "fas fa-sort-numeric-down",
    },
    {
      value: "progress-desc",
      label: "Progress (High-Low)",
      icon: "fas fa-sort-numeric-up",
    },
    {
      value: "creation-date",
      label: "Creation Date (Old-New)",
      icon: "fas fa-calendar-alt",
    },
    {
      value: "creation-date-desc",
      label: "Creation Date (New-Old)",
      icon: "fas fa-calendar-alt",
    },
  ];

  return (
    <div className="my-project-container">
      <Navbar />
      <div id="global-progress-bar" className="progress-bar"></div>
      <div className="content-container">
        <div className={`sidebar ${!isSidebarOpen ? "hidden" : ""}`}>
          <Sidebar />
        </div>
        <div className="my-project-content">
          <div className="project-list-container">
            <div className="page-header">
              <div className="page-title-section">
                <h1 className="section-title">My Projects</h1>
                <p className="page-subtitle">
                  Manage and track all your projects in one place
                </p>
              </div>
              <div className="page-actions-container">
                <div className="page-actions">
                  <button
                    className="btn-create btn-primary-create"
                    onClick={() => navigate("/create-project")}
                    aria-label="Create New Project"
                  >
                    <i className="fas fa-plus"></i>Create New Project
                  </button>
                </div>
              </div>
            </div>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <div className="summary-section">
              <StatsBar projects={filteredProjects} />
            </div>

            <div className="controls-section">
              <div className="controls-left">
                <SearchBar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />
                <Dropdown
                  label="Filter by Status"
                  options={statusOptions}
                  selected={statusFilter}
                  onSelect={setStatusFilter}
                  className="filter-dropdown"
                />
                <Dropdown
                  label="Sort by"
                  options={sortOptions}
                  selected={sortBy}
                  onSelect={setSortBy}
                  className="sort-dropdown"
                />
              </div>
            </div>

            <div className="projects-container">
              <ProjectsList
                projects={filteredProjects}
                viewMode={viewMode}
                loading={loading}
                navigate={navigate}
                handleViewDetails={handleViewDetails}
                handleActionClick={handleActionClick}
                canManageMembers={canManageMembers}
                currentUserEmail={currentUserEmail}
                onEditClick={handleEditClick}
                onDeleteClick={handleDeleteClick}
                currentUser={currentUser}
              />
            </div>

            {actionMenu && (
              <div
                className="action-menu"
                ref={actionRef}
                style={{
                  top: actionMenu.top,
                  left: actionMenu.left,
                }}
              >
                {actionMenu.memberEmail !== currentUserEmail && (
                  <button
                    onClick={() => setDeleteConfirm(actionMenu)}
                    className="action-button"
                  >
                    Remove Member
                  </button>
                )}
                {actionMenu.memberEmail !== currentUserEmail && (
                  <button
                    onClick={() => setTransferConfirm(actionMenu)}
                    className="action-button"
                  >
                    Transfer Leader
                  </button>
                )}
              </div>
            )}

            {deleteConfirm &&
              deleteConfirm.memberEmail !== currentUserEmail && (
                <div className="modal-overlay">
                  <div className="confirm-dialog">
                    <h3>Confirm Member Removal</h3>
                    <p>
                      Are you sure you want to remove{" "}
                      {deleteConfirm.memberEmail} from the project?
                    </p>
                    <div className="form-buttons">
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="cancel-button"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteMember(
                            deleteConfirm.projectId,
                            deleteConfirm.memberEmail
                          )
                        }
                        className="confirm-button"
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                </div>
              )}

            {transferConfirm &&
              transferConfirm.memberEmail !== currentUserEmail && (
                <div className="modal-overlay">
                  <div className="confirm-dialog">
                    <h3>Confirm Leader Transfer</h3>
                    <p>
                      Are you sure you want to transfer the leader role to{" "}
                      {transferConfirm.memberEmail}?
                    </p>
                    <div className="form-buttons">
                      <button
                        onClick={() => setTransferConfirm(null)}
                        className="cancel-button"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() =>
                          handleTransferLeader(
                            transferConfirm.projectId,
                            transferConfirm.memberEmail
                          )
                        }
                        className="confirm-button"
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                </div>
              )}

            {deleteProjectConfirm && (
              <div className="modal-overlay">
                <div className="confirm-dialog">
                  <h3>Confirm Project Deletion</h3>
                  <p>
                    Are you sure you want to delete this project? This action
                    cannot be undone.
                  </p>
                  <div className="form-buttons">
                    <button
                      onClick={() => setDeleteProjectConfirm(null)}
                      className="cancel-button"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteProject(deleteProjectConfirm.projectId)
                      }
                      className="confirm-button"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            )}

            {editProject && (
              <EditProjectModal
                project={editProject}
                onClose={() => setEditProject(null)}
                onUpdate={handleUpdateProject}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MyProject = () => {
  return (
    <SidebarProvider>
      <MyProjects />
    </SidebarProvider>
  );
};

export default MyProject;
