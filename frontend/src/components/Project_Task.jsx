import React, { useEffect, useState, useRef, useContext } from "react";
import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "../styles/user/dashboard.css";
import "../styles/user/project_task.css";
import "../styles/user/tabs.css";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Search } from "lucide-react";
import Backlog from "../pages/user/Backlog";
import Progress from "../pages/user/Progress";
import Summary from "../pages/user/Summary";
import Timeline from "../pages/user/Timeline";
import Comments from "../pages/user/Comments";
import Documents from "../pages/user/Documents";
import People from "../pages/user/People";
import ProjectTabs from "./ProjectTabs";
import { NotificationContext } from "../context/NotificationContext";

const ProjectTaskContent = () => {
  const { isSidebarOpen, setProjectsSidebar } = useSidebar();
  const { id } = useParams();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [members, setMembers] = useState([]);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("summary");
  const [isLeader, setIsLeader] = useState(false);
  const accessToken = localStorage.getItem("accessToken");
  const userName = localStorage.getItem("userName");
  const [showConfirmForm, setShowConfirmForm] = useState(false);
  const navigate = useNavigate();
  const progressRef = useRef(null);
  const { triggerSuccess } = useContext(NotificationContext);

  const fetchMembers = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");

      if (!userId || !accessToken) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/members/project/${id}`,
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
        setMembers(data);
      } else {
        throw new Error(data.message || "Failed to fetch members");
      }
      const currentMember = data.find((member) => member.name === userName);
      if (currentMember && currentMember.role === "LEADER") {
        setIsLeader(true);
      } else {
        setIsLeader(false);
      }
    } catch (err) {
      console.error("Fetch members error:", err);
    }
  };

  const fetchProjects = async () => {
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
        setProjects(data);
        setProjectsSidebar(data);
        localStorage.setItem("projects", JSON.stringify(data));
      } else {
        throw new Error(data.message || "Failed to fetch projects");
      }
    } catch (err) {
      setError(err.message || "Đã có lỗi xảy ra khi lấy danh sách dự án");
      console.error("Fetch projects error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    if (id) fetchMembers();
  }, [id]);

  useEffect(() => {
    const updateMembersOnAvatarChange = () => {
      const currentAvatarUrl = localStorage.getItem("avatarUrl");
      if (currentAvatarUrl) {
        fetchMembers();
      }
    };
    window.addEventListener("storage", updateMembersOnAvatarChange);

    return () => {
      window.removeEventListener("storage", updateMembersOnAvatarChange);
    };
  }, []);

  useEffect(() => {
    const tab = location.pathname.split("/").pop() || "summary";
    setActiveTab(tab);
  }, [location.pathname]);

  const selectedProject = projects.find(
    (project) => project.id === parseInt(id)
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "summary":
        return <Summary project={selectedProject} />;
      case "backlog":
        return (
          <Backlog project={selectedProject} setActiveTab={setActiveTab} />
        );
      case "board":
        return (
          <Progress project={selectedProject} setActiveTab={setActiveTab} />
        );
      case "timeline":
        return (
          <Timeline project={selectedProject} setActiveTab={setActiveTab} />
        );
      case "documents":
        return (
          <Documents project={selectedProject} setActiveTab={setActiveTab} />
        );
      case "people":
        return <People project={selectedProject} setActiveTab={setActiveTab} />;
      default:
        return <Summary project={selectedProject} />;
    }
  };

  const handleCompleteProject = () => {
    setShowConfirmForm(true);
  };

  const handleConfirmComplete = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");

      if (!userId || !accessToken) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/projects/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
          },
          body: JSON.stringify({
            status: "COMPLETED",
          }),
        }
      );

      if (response.ok) {
        const updatedProject = await response.json();
        const updatedProjects = projects.map((project) =>
          project.id === parseInt(id)
            ? { ...project, status: updatedProject.status }
            : project
        );
        setProjects(updatedProjects);
        setProjectsSidebar(updatedProjects);
        localStorage.setItem("projects", JSON.stringify(updatedProjects));
        setShowConfirmForm(false);
        triggerSuccess("The project has been completed.");
      } else {
        throw new Error("Failed to complete project");
      }
    } catch (err) {
      console.error("Error completing project:", err);
      alert(err.message || "Không thể hoàn thành dự án. Vui lòng thử lại.");
    }
  };

  const handleCompleteProjectNavigate = () => {
    const progress = progressRef.current;
    if (progress) {
      progress.style.width = "0%";
      progress.style.display = "block";
      let width = 0;
      const interval = setInterval(() => {
        if (width >= 100) {
          clearInterval(interval);
          progress.style.display = "none";
          navigate("/myProject");
        } else {
          width += 10;
          progress.style.width = width + "%";
          progress.style.transition = "width 0.3s linear";
        }
      }, 100);
    }
  };

  const handleCancelComplete = () => {
    setShowConfirmForm(false);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!selectedProject) return <p>Project not found.</p>;

  return (
    <div className="container">
      <Navbar />
      <div id="global-progress-bar" className="progress-bar"></div>
      <div className="content-container">
        <div className={`sidebar ${!isSidebarOpen ? "hidden" : ""}`}>
          <Sidebar />
        </div>
        <div className={`main-container ${!isSidebarOpen ? "full" : ""}`}>
          <div className="project-detail">
            <div className="project-header">
              <div
                className="project-title-section"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <div className="project-header-name">
                  <div className="project-header-tittle-bg">
                    <div
                      className="project-header-bg"
                      style={{ backgroundColor: selectedProject.color }}
                    >
                      <h3>{selectedProject.short_name}</h3>
                    </div>
                    <div>
                      <h1 className="project-title">
                        {selectedProject.project_name}
                      </h1>
                    </div>
                  </div>
                  <div className="project-completed-leader">
                    {isLeader && selectedProject.status === "ACTIVE" && (
                      <div
                        className="btn-complete-project-leader"
                        onClick={handleCompleteProject}
                      >
                        Complete Project
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <ProjectTabs
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                  />
                </div>
              </div>
            </div>
            <div className="project-content">
              <div className="tab-content">{renderTabContent()}</div>
            </div>
          </div>
        </div>
      </div>

      {showConfirmForm && (
        <div className="modal-overlay-completed">
          <div className="confirm-modal-completed">
            <h3>Confirm Project Completion</h3>
            <p>Are you sure you want to complete this project?</p>
            <div className="modal-actions-completed">
              <button
                className="btn-cancel-completed"
                onClick={handleCancelComplete}
              >
                Cancel
              </button>
              <button
                className="btn-confirm-completed"
                onClick={() => {
                  handleConfirmComplete();
                  handleCompleteProjectNavigate();
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProjectTask = () => {
  return (
    <SidebarProvider>
      <ProjectTaskContent />
    </SidebarProvider>
  );
};

export default ProjectTask;
