import React, { useEffect, useState } from "react";
import { SidebarProvider, useSidebar } from "../../context/SidebarContext";
import "../../styles/user/dashboard.css";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

const MembersContext = () => {
  const { isSidebarOpen } = useSidebar();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const accessToken = localStorage.getItem("accessToken");

        if (!userId || !accessToken) {
          throw new Error("User not authenticated");
        }

        const response = await fetch(
          "http://localhost:8080/api/auth/get-users",
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
          setUsers(data);
        } else {
          throw new Error(data.message || "Failed to fetch users");
        }
      } catch (err) {
        setError(
          err.message || "An error occurred while fetching the list of members"
        );
        console.error("Fetch users error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
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
          <h1>Members</h1>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <p style={{ color: "red" }}>{error}</p>
          ) : (
            <div>
              {users.map((user) => (
                <div key={user.id}>
                  <p>
                    <strong>Name:</strong> {user.name || "No name provided"}
                  </p>
                  <p>
                    <strong>Email:</strong> {user.email || "No email provided"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Members = () => {
  return (
    <SidebarProvider>
      <MembersContext />
    </SidebarProvider>
  );
};

export default Members;