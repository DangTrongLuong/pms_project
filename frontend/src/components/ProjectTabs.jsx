
import React from "react";
import { BarChart, List, Layout, Clock, FileText, Users } from "lucide-react";

const ProjectTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: "summary", label: "Tổng quan", icon: BarChart },
    { id: "backlog", label: "Backlog", icon: List },
    { id: "board", label: "Bảng", icon: Layout },
    { id: "timeline", label: "Dòng thời gian", icon: Clock },
    { id: "documents", label: "Tài liệu", icon: FileText },
    { id: "people", label: "Thành viên", icon: Users },
  ];

  return (
    <div
      style={{
        display: "flex",
        borderBottom: "1px solid #e5e7eb", /* Thanh gạch ngang sát tab */
        padding: "0 20px",
        margin: 0, /* Loại bỏ khoảng trắng trên */
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px", /* Giảm gap để gọn hơn */
            padding: "6px 14px", /* Padding nhỏ gọn */
            borderBottom:
              activeTab === tab.id
                ? "2px solid #3b82f6" /* Viền dưới rõ nét cho tab active */
                : "2px solid transparent", /* Không viền cho tab không active */
            color: activeTab === tab.id ? "#3b82f6" : "#6b7280", /* Màu chữ */
            fontWeight: 500,
            fontSize: "14px",
            cursor: "pointer",
            transition: "all 0.2s",
            background: "none",
            border: "none",
            fontFamily: "Arial, sans-serif",
          }}
          onMouseOver={(e) => {
            if (activeTab !== tab.id) {
              e.target.style.color = "#7F4CE7"; /* Màu tím khi hover */
              e.target.style.borderBottomColor = "#e5e7eb"; /* Màu nhạt khi hover */
            }
          }}
          onMouseOut={(e) => {
            if (activeTab !== tab.id) {
              e.target.style.color = "#6b7280";
              e.target.style.borderBottomColor = "transparent";
            }
          }}
        >
          <tab.icon style={{ width: "16px", height: "16px" }} />
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default ProjectTabs;
