import React, { useState, useEffect, useContext, useRef } from "react";
import { UserPlus, Mail, MoreHorizontal, Crown, User, X } from "lucide-react";
import "../../styles/user/people.css";
import { useParams } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";
import { NotificationContext } from "../../context/NotificationContext";

const People = () => {
  const { id } = useParams();
  const { projects, isSidebarOpen } = useSidebar();
  const { triggerSuccess, triggerError } = useContext(NotificationContext);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberEmails, setNewMemberEmails] = useState([]);
  const [emailInput, setEmailInput] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("USER");
  const [emailSuggestions, setEmailSuggestions] = useState([]);
  const [actionMenu, setActionMenu] = useState(null);
  const [isLeader, setIsLeader] = useState(false);
  const actionRef = useRef(null);
  const accessToken = localStorage.getItem("accessToken");
  const userId = localStorage.getItem("userId");
  const currentUserEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    if (projects && projects.length > 0) {
      const project = projects.find((p) => p.id === parseInt(id));
      setSelectedProject(project || null);
    }
  }, [projects, id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionRef.current && !actionRef.current.contains(event.target)) {
        setActionMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const refreshToken = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/auth/refresh-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refreshToken: localStorage.getItem("refreshToken"),
          }),
        }
      );
      const data = await response.json();
      if (response.ok && data.access_token) {
        localStorage.setItem("accessToken", data.access_token);
        localStorage.setItem(
          "tokenExpiresAt",
          Date.now() + data.expires_in * 1000
        );
        return data.access_token;
      }
      throw new Error("Không thể làm mới token");
    } catch (err) {
      console.error("Lỗi làm mới token:", err);
      localStorage.clear();
      window.location.href = "/login";
      throw err;
    }
  };

  const fetchPeople = async () => {
    if (!selectedProject) return;
    try {
      let token = accessToken;
      if (!userId || !token) {
        throw new Error("Vui lòng đăng nhập lại để tiếp tục");
      }

      let response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/members/project/${selectedProject.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            userId: userId,
          },
        }
      );

      if (response.status === 401) {
        token = await refreshToken();
        response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/members/project/${selectedProject.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              userId: userId,
            },
          }
        );
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Lấy danh sách thành viên thất bại: ${response.status}`
        );
      }

      const data = await response.json();
      setSelectedProject({
        ...selectedProject,
        team: Array.isArray(data) ? data : [],
      });

      const currentMember = data.find(
        (member) => member.email === currentUserEmail
      );
      setIsLeader(currentMember && currentMember.role === "LEADER");
    } catch (err) {
      console.error("Fetch error:", err);
      triggerError(err.message || "Lấy danh sách thành viên thất bại");
    }
  };

  const fetchEmailSuggestions = async (query) => {
    if (!query.trim()) {
      setEmailSuggestions([]);
      return;
    }
    try {
      const response = await fetch(
        `${
          process.env.REACT_APP_API_URL
        }/api/members/search?query=${encodeURIComponent(query)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setEmailSuggestions(Array.isArray(data) ? data : []);
      } else {
        setEmailSuggestions([]);
      }
    } catch (err) {
      console.error("Fetch email suggestions error:", err);
      setEmailSuggestions([]);
    }
  };

  useEffect(() => {
    fetchPeople();
  }, [selectedProject]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchEmailSuggestions(emailInput);
    }, 300);
    return () => clearTimeout(debounce);
  }, [emailInput]);

  const handleAddMember = async () => {
    if (!isLeader) {
      triggerError("Chỉ trưởng nhóm mới có thể thêm thành viên");
      return;
    }

    if (!newMemberEmails.length || !selectedProject) {
      triggerError("Vui lòng nhập ít nhất một email hợp lệ");
      return;
    }

    try {
      let token = accessToken;
      if (!userId || !token) {
        throw new Error("Vui lòng đăng nhập lại để tiếp tục");
      }

      const addedMembers = [];
      for (const email of newMemberEmails) {
        let response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/members/project/${selectedProject.id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              userId: userId,
            },
            body: JSON.stringify({ email, role: newMemberRole }),
          }
        );

        if (response.status === 401) {
          token = await refreshToken();
          response = await fetch(
            `${process.env.REACT_APP_API_URL}/api/members/project/${selectedProject.id}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                userId: userId,
              },
              body: JSON.stringify({ email, role: newMemberRole }),
            }
          );
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          triggerError(
            `Thêm ${email} thất bại: ${errorData.message || response.status}`
          );
          continue;
        }

        const addedMember = await response.json();
        addedMembers.push(addedMember);
        triggerSuccess(`Đã thêm ${email} thành công`);
      }

      setSelectedProject({
        ...selectedProject,
        team: [...(selectedProject.team || []), ...addedMembers],
      });
      setNewMemberEmails([]);
      setEmailInput("");
      setNewMemberRole("USER");
      setShowAddMember(false);
      setEmailSuggestions([]);
    } catch (err) {
      console.error("Add members error:", err);
      triggerError(err.message || "Thêm thành viên thất bại");
    }
  };

  const handleRemoveMember = async (projectId, email) => {
    if (!isLeader) {
      triggerError("Chỉ trưởng nhóm mới có thể xóa thành viên");
      return;
    }

    try {
      let token = accessToken;
      if (!userId || !token) {
        throw new Error("Vui lòng đăng nhập lại để tiếp tục");
      }

      let response = await fetch(
        `${
          process.env.REACT_APP_API_URL
        }/api/members/project/${projectId}/email/${encodeURIComponent(email)}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            userId: userId,
          },
        }
      );

      if (response.status === 401) {
        token = await refreshToken();
        response = await fetch(
          `${
            process.env.REACT_APP_API_URL
          }/api/members/project/${projectId}/email/${encodeURIComponent(
            email
          )}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              userId: userId,
            },
          }
        );
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Delete member failed: ${response.status}`
        );
      }

      await fetchPeople();
      setActionMenu(null);
      triggerSuccess(`Successfully removed ${email} from the project`);
    } catch (err) {
      console.error("Remove member error:", err);
      triggerError(err.message || "Delete member failed");
    }
  };

  const handleTransferLeader = async (projectId, email) => {
    if (!isLeader) {
      triggerError("Chỉ trưởng nhóm mới có thể chuyển quyền trưởng nhóm");
      return;
    }

    try {
      let token = accessToken;
      if (!userId || !token) {
        throw new Error("Please login again to continue");
      }

      let response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/members/project/${projectId}/transfer-leader`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            userId: userId,
          },
          body: JSON.stringify({ email }),
        }
      );

      if (response.status === 401) {
        token = await refreshToken();
        response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/members/project/${projectId}/transfer-leader`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              userId: userId,
            },
            body: JSON.stringify({ email }),
          }
        );
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Team leader transfer failed: ${response.status}`
        );
      }

      await fetchPeople();
      setActionMenu(null);
      triggerSuccess(`transferred team leader to ${email}`);
    } catch (err) {
      console.error("Transfer leader error:", err);
      triggerError(err.message || "Team leader transfer failed");
    }
  };

  const handleActionClick = (member, event) => {
    const rect = event.target.getBoundingClientRect();
    setActionMenu({
      memberEmail: member.email,
      projectId: selectedProject.id,
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    });
  };

  const handleEmailSelect = (email) => {
    setNewMemberEmails((prev) => {
      if (!prev.includes(email)) {
        return [...prev, email];
      }
      return prev;
    });
    setEmailInput("");
    setEmailSuggestions([]);
  };

  const handleRemoveEmail = (emailToRemove) => {
    setNewMemberEmails((prev) =>
      prev.filter((email) => email !== emailToRemove)
    );
  };

  const handleEmailInputChange = (e) => {
    const value = e.target.value;
    setEmailInput(value);
    if (value.includes(",")) {
      const emails = value
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email && !newMemberEmails.includes(email));
      setNewMemberEmails((prev) => [...prev, ...emails]);
      setEmailInput("");
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "LEADER":
        return <Crown className="role-icon role-lead" />;
      case "USER":
        return <User className="role-icon role-member" />;
      default:
        return <User className="role-icon role-member" />;
    }
  };

  const getTasksAssigned = (memberName) => {
    return (selectedProject?.tasks || []).filter(
      (task) => task.assignee === memberName
    ).length;
  };

  const getTasksCompleted = (memberName) => {
    return (selectedProject?.tasks || []).filter(
      (task) => task.assignee === memberName && task.status === "DONE"
    ).length;
  };

  return (
    <div className="people-section">
      <div className="people-container">
        <div className="people-header">
          <h3>Team Members ({selectedProject?.team?.length || 0})</h3>
          {isLeader && (
            <button
              onClick={() => setShowAddMember(true)}
              className="add-member-btn"
            >
              <UserPlus />
              <span>Add Member</span>
            </button>
          )}
        </div>
        {showAddMember && isLeader && (
          <div className="add-people-form">
            <h3>Add Team Member</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="text"
                  value={emailInput}
                  onChange={handleEmailInputChange}
                  placeholder="Enter a email"
                  className="form-input"
                  autoComplete="off"
                />
                {emailSuggestions.length > 0 && (
                  <ul className="email-suggestions-add">
                    {emailSuggestions.map((suggestion) => (
                      <li
                        key={suggestion.email}
                        onClick={() => handleEmailSelect(suggestion.email)}
                        className="suggestion-item"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "8px",
                          cursor: "pointer",
                          borderBottom: "1px solid #e2e8f0",
                        }}
                      >
                        <div
                          className="suggestion-avatar"
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            backgroundColor: suggestion.avatarUrl
                              ? "transparent"
                              : "#d1d5db",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            fontWeight: "500",
                          }}
                        >
                          {suggestion.avatarUrl ? (
                            <img
                              src={suggestion.avatarUrl}
                              alt="Avatar"
                              style={{
                                width: "100%",
                                height: "100%",
                                borderRadius: "50%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            suggestion.name?.substring(0, 2).toUpperCase()
                          )}
                        </div>
                        <div className="suggestion-info">
                          <span
                            style={{
                              fontWeight: "500",
                              color: "#172b4d",
                            }}
                          >
                            {suggestion.name || "Unknown"}
                          </span>
                          <span
                            style={{
                              fontSize: "12px",
                              color: "#6b778c",
                              display: "block",
                            }}
                          >
                            {suggestion.email}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {newMemberEmails.length > 0 && (
                  <div
                    className="email-chips"
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      marginTop: "8px",
                    }}
                  >
                    {newMemberEmails.map((email) => (
                      <div
                        key={email}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          background: "#e0e0e0",
                          borderRadius: "16px",
                          padding: "4px 8px",
                          fontSize: "14px",
                        }}
                      >
                        {email}
                        <button
                          onClick={() => handleRemoveEmail(email)}
                          style={{
                            marginLeft: "8px",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "0",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="form-group-add-member">
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <div className="form-actions-inline">
                    <select
                      value={newMemberRole}
                      onChange={(e) => setNewMemberRole(e.target.value)}
                      className="form-select"
                    >
                      <option value="USER">Member</option>
                    </select>

                    <button onClick={handleAddMember} className="btn-primary">
                      Add
                    </button>
                    <button
                      onClick={() => setShowAddMember(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {actionMenu && isLeader && (
          <div
            className="action-menu"
            ref={actionRef}
            style={{
              position: "absolute",
              top: actionMenu.top,
              left: actionMenu.right,
              background: "white",
              border: "1px solid #ccc",
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
              zIndex: 1000,
            }}
          >
            <button
              onClick={() =>
                handleRemoveMember(actionMenu.projectId, actionMenu.memberEmail)
              }
              className="action-button"
            >
              Remove Member
            </button>
            <button
              onClick={() =>
                handleTransferLeader(
                  actionMenu.projectId,
                  actionMenu.memberEmail
                )
              }
              className="action-button"
            >
              Transfer Leader
            </button>
          </div>
        )}

        <div className="people-list">
          {(selectedProject?.team || []).map((member) => (
            <div key={member.id} className="person-item">
              <div className="person-info-section">
                <div className="person-avatar">
                  {member.avatarUrl ? (
                    <img src={member.avatarUrl} alt="Avatar" />
                  ) : (
                    member.name?.substring(0, 2).toUpperCase()
                  )}
                </div>
                <div className="person-info">
                  <div className="person-name-section">
                    <h4 className="person-name">{member.name}</h4>
                    {getRoleIcon(member.role)}
                  </div>
                  <div className="person-contact">
                    <Mail />
                    <p className="person-email">{member.email}</p>
                  </div>
                </div>
              </div>

              <div className="person-stats">
                <div className="person-task-stats">
                  <p className="stat-value">
                    {getTasksAssigned(member.name)} tasks
                  </p>
                  <p className="stat-label">
                    {getTasksCompleted(member.name)} completed
                  </p>
                </div>

                <span
                  className={`person-role role-${member.role.toLowerCase()}`}
                >
                  {member.role === "LEADER" ? "Lead" : "Member"}
                </span>

                {member.role !== "LEADER" && isLeader && (
                  <div className="person-actions">
                    <button
                      className="person-action-btn"
                      onClick={(e) => handleActionClick(member, e)}
                    >
                      <MoreHorizontal />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="people-summary">
        <div className="summary-card">
          <h3>Role Distribution</h3>
          <div className="role-distribution">
            {["LEADER", "USER"].map((role) => {
              const count = (selectedProject?.team || []).filter(
                (member) => member.role === role
              ).length;
              return (
                <div key={role} className="role-item">
                  <div className="role-info">
                    {getRoleIcon(role)}
                    <span className="role-label">
                      {role === "LEADER" ? "Lead" : "Member"}
                    </span>
                  </div>
                  <span className="role-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="summary-card">
          <h3>Team Activity</h3>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon activity-success">
                <User />
              </div>
              <div className="activity-details">
                <p className="activity-title">John Doe completed 3 tasks</p>
                <p className="activity-time">2 hours ago</p>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon activity-primary">
                <UserPlus />
              </div>
              <div className="activity-details">
                <p className="activity-title">Jane Smith joined the project</p>
                <p className="activity-time">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default People;
