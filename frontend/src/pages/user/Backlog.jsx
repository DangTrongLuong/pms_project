import React from "react";

import "../../styles/user/dashboard.css";

const Backlog = ({ project }) => {
  return (
    <div>
      <h2>Đây là Backlog của {project.project_name}</h2>
    </div>
  );
};

export default Backlog;
