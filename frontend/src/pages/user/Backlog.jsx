import React from "react";
import "../../styles/user/backlog.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis, faPlus } from "@fortawesome/free-solid-svg-icons";

const Backlog = ({ project }) => {
  return (
    <div className="backlog-container">
      <div className="backlog-start-container">
        <div className="backlog-header">
          <div className="backlog-start">
            <div className="backlog-add-container">
              <div className="backlog-add-title">Backlog</div>
              <div className="backlog-add-date"></div>
              <div className="backlog-add-work-items"></div>
            </div>
          </div>
          <div className="backlog-add">
            <di className="backlog-end">
              <div className="backlog-create-sprint">
                <button className="backlog-create-button">Create sprints</button>
              </div>
              <div className="backlog-icon">
                <FontAwesomeIcon icon={faEllipsis} />
              </div>
            </di>
          </div>
        </div>
        <div className="backlog-empty">Your backlog is empty</div>
        <div className="backlog-create">
          <div className="backlog-create-icon">
            <FontAwesomeIcon icon={faPlus} />
          </div>
          <div className="backlog-create-title">Create tasks</div>
        </div>
      </div>
    </div>
  );
};

export default Backlog;
