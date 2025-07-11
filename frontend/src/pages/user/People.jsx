import React, { useState, useEffect } from "react";
import { UserPlus, Mail, MoreHorizontal, Crown, User } from "lucide-react";
import "../../styles/user/people.css";
import { useParams } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";

const People = () => {
  const { id } = useParams();
  const { projects, isSidebarOpen } = useSidebar();
  const [selectedProject, setSelectedProject] = useState(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("Member");
  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    if (projects && projects.length > 0) {
      const project = projects.find((p) => p.id === parseInt(id));
      setSelectedProject(project || null);
    }
  }, [projects, id]);

  const fetchPeople = async () => {
    if (!selectedProject) return;
    try {
      const userId = localStorage.getItem("userId");
      if (!userId || !accessToken) {
        throw new Error("Vui lòng đăng nhập lại để tiếp tục");
      }

      const response = await fetch(
        `http://localhost:8080/api/people/${selectedProject.id}`,
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
          errorData.message ||
            `Lấy danh sách thành viên thất bại: ${response.status}`
        );
      }

      const data = await response.json();
      setSelectedProject({
        ...selectedProject,
        team: Array.isArray(data) ? data : [],
      });
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchPeople();
  }, [selectedProject]);

  const handleAddMember = async () => {
    if (!newMemberEmail.trim() || !selectedProject) return;

    const newMember = {
      id: Date.now(),
      name: newMemberEmail
        .split("@")[0]
        .replace(/[._]/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase()),
      email: newMemberEmail,
      role: newMemberRole,
      avatar: newMemberEmail.split("@")[0].substring(0, 2).toUpperCase(),
      projectId: selectedProject.id,
    };

    try {
      const userId = localStorage.getItem("userId");
      if (!userId || !accessToken) {
        throw new Error("Vui lòng đăng nhập lại để tiếp tục");
      }

      const response = await fetch(`http://localhost:8080/api/people`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          userId: userId,
        },
        body: JSON.stringify(newMember),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Thêm thành viên thất bại: ${response.status}`
        );
      }

      const addedMember = await response.json();
      setSelectedProject({
        ...selectedProject,
        team: [...(selectedProject.team || []), addedMember],
      });
      setNewMemberEmail("");
      setNewMemberRole("Member");
      setShowAddMember(false);
    } catch (err) {
      console.error("Add member error:", err);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "Lead":
        return <Crown className="role-icon role-lead" />;
      case "Reviewer":
        return <User className="role-icon role-reviewer" />;
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
      (task) => task.assignee === memberName && task.status === "Done"
    ).length;
  };

  return (
    <div className="people-section">
      <div className="people-header">
        <h3 className="people-header h3">Thành viên</h3>
        <button
          onClick={() => setShowAddMember(true)}
          className="add-member-btn"
        >
          <UserPlus />
          <span>Add Member</span>
        </button>
      </div>

      {showAddMember && (
        <div className="add-people-form">
          <h3>Add Team Member</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                placeholder="user@company.com"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value)}
                className="form-select"
              >
                <option value="Member">Member</option>
                <option value="Lead">Lead</option>
                <option value="Reviewer">Reviewer</option>
              </select>
            </div>
            <div className="form-actions-inline">
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
      )}

      <div className="people-container">
        <div className="people-header">
          <h3>Team Members ({selectedProject?.team?.length || 0})</h3>
        </div>

        <div className="people-list">
          {(selectedProject?.team || []).map((member) => (
            <div key={member.id} className="person-item">
              <div className="person-info-section">
                <div className="person-avatar">{member.avatar}</div>
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
                  {member.role}
                </span>

                <div className="person-actions">
                  <button className="person-action-btn">
                    <MoreHorizontal />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="people-summary">
        <div className="summary-card">
          <h3>Role Distribution</h3>
          <div className="role-distribution">
            {["Lead", "Member", "Reviewer"].map((role) => {
              const count = (selectedProject?.team || []).filter(
                (member) => member.role === role
              ).length;
              return (
                <div key={role} className="role-item">
                  <div className="role-info">
                    {getRoleIcon(role)}
                    <span className="role-label">{role}</span>
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
