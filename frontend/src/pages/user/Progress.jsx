import React from "react";
import "../../styles/user/progress.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

const Progress = ({ project }) => {
  if (!project) return null; // Không render nếu project là undefined
  return (
    <div className="progress-container">
      <div className="progress-container-work" id="todo">
        <div className="progress-title">
          <p>CÔNG VIỆC CẦN LÀM</p>
        </div>
        <div className="progress-list-task">
          <div className="add-subtask">
            <div className="add-subtask-icon">
              <FontAwesomeIcon icon={faPlus} />
            </div>
            <div className="add-subtask-text">
              <p>Thêm nhiệm vụ</p>
            </div>
          </div>
          {/* <div className="progress-subtask"></div> */}
        </div>
      </div>
      <div className="progress-container-work" id="in_progress">
        <div className="progress-title">
          <p>CÔNG VIỆC ĐANG LÀM</p>
        </div>
        <div className="progress-list-task">
          <div className="add-subtask">
            <div className="add-subtask-icon">
              <FontAwesomeIcon icon={faPlus} />
            </div>
            <div className="add-subtask-text">
              <p>Thêm nhiệm vụ</p>
            </div>
          </div>
          {/* <div className="progress-subtask"></div> */}
        </div>
      </div>
      <div className="progress-container-work" id="in_review">
        <div className="progress-title">
          <p>CÔNG VIỆC ĐANG REVIEW</p>
        </div>
        <div className="progress-list-task">
          <div className="add-subtask">
            <div className="add-subtask-icon">
              <FontAwesomeIcon icon={faPlus} />
            </div>
            <div className="add-subtask-text">
              <p>Thêm nhiệm vụ</p>
            </div>
          </div>
          {/* <div className="progress-subtask"></div> */}
        </div>
      </div>
      <div className="progress-container-work" id="done">
        <div className="progress-title">
          <p>CÔNG VIỆC ĐÃ XONG</p>
        </div>
        <div className="progress-list-task">
          <div className="add-subtask">
            <div className="add-subtask-icon">
              <FontAwesomeIcon icon={faPlus} />
            </div>
            <div className="add-subtask-text">
              <p>Thêm nhiệm vụ</p>
            </div>
          </div>
          {/* <div className="progress-subtask"></div> */}
        </div>
      </div>
    </div>
  );
};

export default Progress;
