import React, { useEffect, useState, useRef } from "react";
import { SidebarProvider, useSidebar } from "../../context/SidebarContext";
import "../../styles/user/dashboard.css";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import "../../styles/user/my_project.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";

const MyProjects = () => {
  const { isSidebarOpen, setProjectsSidebar } = useSidebar();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");
  const { id } = useParams();
  const [actionMenu, setActionMenu] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [transferConfirm, setTransferConfirm] = useState(null);
  const [members, setMembers] = useState({});
  const actionRef = useRef(null);

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
      try {
        const userId = localStorage.getItem("userId");
        const accessToken = localStorage.getItem("accessToken");

        if (!userId || !accessToken) {
          throw new Error("User not authenticated");
        }

        const response = await fetch(
          "http://localhost:8080/api/projects/my-projects",
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
          setProjects(data);
          setProjectsSidebar(data);
          localStorage.setItem("projects", JSON.stringify(data));

          // Fetch members for each project
          const membersData = {};
          for (const project of data) {
            const membersResponse = await fetch(
              `http://localhost:8080/api/members/project/${project.id}`,
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
        setError(err.message || "Đã có lỗi xảy ra khi lấy danh sách dự án");
        console.error("Fetch projects error:", err);
      }
    };

    fetchProjects();
  }, [setProjectsSidebar]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionRef.current && !actionRef.current.contains(event.target)) {
        setActionMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

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
        `http://localhost:8080/api/members/project/${projectId}/email/${encodeURIComponent(
          email
        )}`,
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
        throw new Error(data.message || "Failed to delete member");
      }

      // Refresh project list
      const fetchResponse = await fetch(
        "http://localhost:8080/api/projects/my-projects",
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
        setProjects(data);
        setProjectsSidebar(data);
        localStorage.setItem("projects", JSON.stringify(data));

        // Refresh members for the project
        const membersResponse = await fetch(
          `http://localhost:8080/api/members/project/${projectId}`,
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
      setError(err.message || "Error deleting member");
      console.error("Delete member error:", err);
    }
  };

  const handleTransferLeader = async (projectId, email) => {
    try {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");

      const response = await fetch(
        `http://localhost:8080/api/members/project/${projectId}/transfer-leader`,
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

      // Refresh project list
      const fetchResponse = await fetch(
        "http://localhost:8080/api/projects/my-projects",
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
        setProjects(data);
        setProjectsSidebar(data);
        localStorage.setItem("projects", JSON.stringify(data));

        // Refresh members for the project
        const membersResponse = await fetch(
          `http://localhost:8080/api/members/project/${projectId}`,
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

  const isLeader = (projectId, email) => {
    const projectMembers = members[projectId] || [];
    const member = projectMembers.find((m) => m.email === email);
    return member && member.role === "LEADER";
  };

  const currentUserEmail = localStorage.getItem("userEmail");

  const canManageMembers = (projectId) => {
    return isLeader(projectId, currentUserEmail);
  };

  return (
    <div className="container">
      <Navbar />
      <div id="global-progress-bar" className="progress-bar"></div>
      <div className="content-container">
        <div className={`sidebar ${!isSidebarOpen ? "hidden" : ""}`}>
          <Sidebar />
        </div>
        <div className={`main-container ${!isSidebarOpen ? "full" : ""}`}>
          <h2>Dự án của tôi</h2>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <div className="project-list">
            {projects.map((project) => (
              <div key={project.id} className="project-item">
                <p>
                  <strong>Tên dự án:</strong> {project.project_name}
                </p>
                {project.description && (
                  <p>
                    <strong>Mô tả:</strong> {project.description}
                  </p>
                )}
                <p>
                  <strong>Loại dự án:</strong> {project.project_type}
                </p>
                <p>
                  <strong>Thời gian bắt đầu:</strong> {project.start_date}
                </p>
                <p>
                  <strong>Thời gian kết thúc:</strong> {project.end_date}
                </p>
                <p>
                  <strong>Người tạo:</strong> {project.created_by_name}
                </p>
                <p>
                  <strong>Leader:</strong> {project.leader}
                </p>
                {project.members && (
                  <div className="member-list">
                    <strong>Thành viên:</strong>
                    <ul>
                      {project.members.split(", ").map((member, index) => (
                        <li key={index}>
                          {member}
                          {canManageMembers(project.id) && (
                            <div className="action-delete-change">
                              <FontAwesomeIcon
                                icon={faEllipsis}
                                onClick={(e) =>
                                  handleActionClick(project.id, member, e)
                                }
                              />
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <button
                  className="view-button"
                  onClick={() =>
                    handleItemClick(`/project-task/${project.id}/progress`)
                  }
                >
                  Xem chi tiết
                </button>
              </div>
            ))}
          </div>
        </div>
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
              Xóa thành viên
            </button>
          )}
          {actionMenu.memberEmail !== currentUserEmail && (
            <button
              onClick={() => setTransferConfirm(actionMenu)}
              className="action-button"
            >
              Chuyển leader
            </button>
          )}
        </div>
      )}

      {deleteConfirm && deleteConfirm.memberEmail !== currentUserEmail && (
        <div className="modal-overlay">
          <div className="confirm-dialog">
            <h3>Xác nhận xóa thành viên</h3>
            <p>
              Bạn có chắc muốn xóa thành viên {deleteConfirm.memberEmail} khỏi
              dự án?
            </p>
            <div className="form-buttons">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="cancel-button"
              >
                Hủy
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
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {transferConfirm && transferConfirm.memberEmail !== currentUserEmail && (
        <div className="modal-overlay">
          <div className="confirm-dialog">
            <h3>Xác nhận chuyển leader</h3>
            <p>
              Bạn có chắc muốn chuyển vai trò leader cho{" "}
              {transferConfirm.memberEmail}?
            </p>
            <div className="form-buttons">
              <button
                onClick={() => setTransferConfirm(null)}
                className="cancel-button"
              >
                Hủy
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
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
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
