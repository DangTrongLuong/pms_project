import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse } from "@fortawesome/free-solid-svg-icons";
import React, { useEffect } from "react";
import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import "../styles/dashboard.css";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const DashboardContent = () => {
  const { isSidebarOpen } = useSidebar();

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

  return (
    <div className="container">
      <Navbar />
      <div id="global-progress-bar" className="progress-bar"></div>
      <div className="content-container">
        <div className={`sidebar ${!isSidebarOpen ? "hidden" : ""}`}>
          <Sidebar />
        </div>
        <div className={`main-container ${!isSidebarOpen ? "full" : ""}`}>
          <div className="dashboard-header">
            <FontAwesomeIcon
              icon={faHouse}
              size="2x"
              className="dashboard-icon"
            />
            <h1 className="dashboard-title">Dashboard</h1>
          </div>
          <div className="dashboard-content">
            <p>Welcome to your dashboard!</p>
            <p>You can view your profile, manage your tasks, and more.</p>
          </div>
          <div className="dashboard-footer">
            <button className="dashboard-back-button">Back to Home</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  return (
    <SidebarProvider>
      <DashboardContent />
    </SidebarProvider>
  );
};

export default Dashboard;
