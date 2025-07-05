import React from "react";

const Progress = ({ project }) => {
  if (!project) return null; // Không render nếu project là undefined
  return (
    <div>
      <h2>Đây là Bảng nhiệm vụ của {project.project_name}</h2>
    </div>
  );
};

export default Progress;
