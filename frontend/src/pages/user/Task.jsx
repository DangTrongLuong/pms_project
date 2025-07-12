import React, { useEffect, useState } from "react";
import { SidebarProvider, useSidebar } from "../../context/SidebarContext";
import { useNavigate } from "react-router-dom";
import "../../styles/user/dashboard.css";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

const TaskContent = () => {
  const { isSidebarOpen } = useSidebar();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);

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
    // Giả định fetch danh sách task từ API (cần endpoint backend)
    const fetchTasks = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const accessToken = localStorage.getItem("accessToken");

        if (!userId || !accessToken) {
          throw new Error("User not authenticated");
        }

        const response = await fetch(
<<<<<<< HEAD
          `${process.env.REACT_APP_API_URL}/api/backlog/tasks`, // Cần endpoint thực tế
=======
          "http://localhost:8080/api/backlog/tasks", // Cần endpoint thực tế
>>>>>>> minhdan
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
          throw new Error("Failed to fetch tasks");
        }

        const data = await response.json();
        setTasks(data);
      } catch (err) {
        console.error("Fetch tasks error:", err);
      }
    };

    fetchTasks();
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
          <h1>Danh Sách Nhiệm Vụ</h1>
          {tasks.length > 0 ? (
            <ul>
              {tasks.map((task) => (
                <li key={task.id} onClick={() => navigate(`/task/${task.id}`)}>
                  {task.title} (Trạng thái: {task.status})
                </li>
              ))}
            </ul>
          ) : (
            <p>Không có nhiệm vụ nào.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const Task = () => {
  return (
    <SidebarProvider>
      <TaskContent />
    </SidebarProvider>
  );
};

export default Task;
