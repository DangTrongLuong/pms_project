import React, {
  useEffect,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";
import html2pdf from "html2pdf.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const Chart = forwardRef(({ type = "projects" }, ref) => {
  const [projectData, setProjectData] = useState([]); // Bar and line data: project creations
  const [memberData, setMemberData] = useState([]); // Bar and line data: member registrations
  const chartRef = useRef(null);
  const userId = localStorage.getItem("userId");
  const accessToken = localStorage.getItem("accessToken");

  // Calculate dates for the current month
  const getDateRange = () => {
    const dates = [];
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      dates.push(date.toISOString().split("T")[0]);
    }
    return dates;
  };

  // Calculate months for the current year
  const getMonthRange = () => {
    const months = [];
    const year = new Date().getFullYear();

    for (let month = 0; month < 12; month++) {
      const date = new Date(year, month, 1);
      const monthYear = date.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      });
      months.push(monthYear);
    }
    return months;
  };

  // Fetch data for charts
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (type === "projects") {
          // Fetch data: project creations
          console.log(`${process.env.REACT_APP_API_URL}`);
          const projectResponse = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/projects/daily-count`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                userId: userId,
              },
            }
          );
          const dates = getDateRange();
          const projectCounts = dates.map(
            (date) => projectResponse.data[date] || 0
          );
          setProjectData(projectCounts);
        } else if (type === "members") {
          // Fetch data: member registrations
          const memberResponse = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/auth/monthly-count`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                userId: userId,
              },
            }
          );
          const months = getMonthRange();
          const memberCounts = months.map((month) => {
            const monthKey =
              month.split(" ")[0].toLowerCase() + "-" + month.split(" ")[1];
            return memberResponse.data[monthKey] || 0;
          });
          setMemberData(memberCounts);
        }
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    };

    fetchData();
  }, [accessToken, userId, type]);

  const dates = getDateRange();
  const months = getMonthRange();

  // Project chart data (bar + line)
  const projectChartData = {
    labels: dates,
    datasets: [
      {
        type: "bar",
        label: "Projects Created (Daily, Bar Chart)",
        data: projectData,
        backgroundColor: "rgba(76, 175, 80)", // Green with transparency
        borderColor: "#4CAF50",
        borderWidth: 1,
        yAxisID: "y",
        order: 1,
      },
      {
        type: "line",
        label: "Projects Created (Daily, Line Chart)",
        data: projectData, // Same data as bar chart
        backgroundColor: "#FF9800",
        borderColor: "#FF9800",
        borderWidth: 2,
        fill: false,
        tension: 0.3,
        pointRadius: 4, // Make points more visible
        yAxisID: "y1",
        order: 0,
      },
    ],
  };

  // Member chart data (bar + line)
  const memberChartData = {
    labels: months,
    datasets: [
      {
        type: "bar",
        label: "Members Registered (Monthly, Bar Chart)",
        data: memberData,
        backgroundColor: "rgba(33, 150, 243)", // Blue with transparency
        borderColor: "#2196F3",
        borderWidth: 1,
        yAxisID: "y",
        order: 1,
      },
      {
        type: "line",
        label: "Members Registered (Monthly, Line Chart)",
        data: memberData, // Same data as bar chart
        backgroundColor: "#E91E63",
        borderColor: "#E91E63",
        borderWidth: 2,
        fill: false,
        tension: 0.3,
        pointRadius: 4, // Make points more visible
        yAxisID: "y1",
        order: 0,
      },
    ],
  };

  // Chart options with dual y-axes
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "", font: { size: 16 } },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Count" },
        ticks: { stepSize: 1, precision: 0 },
        position: "left",
      },
      y1: {
        beginAtZero: true,
        title: { display: true, text: "Count" },
        ticks: { stepSize: 1, precision: 0 },
        position: "right",
        grid: { drawOnChartArea: false },
      },
      x: {
        title: { display: true, text: "Time Period" },
      },
    },
  };

  // Export handler
  const handleExport = () => {
    if (chartRef.current) {
      const chartElement = chartRef.current;
      html2pdf()
        .from(chartElement)
        .set({
          margin: [10, 10, 10, 10],
          filename: `${
            type === "projects" ? "projects_created" : "members_registered"
          }.pdf`,
          html2canvas: { scale: 2 },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .save();
    } else {
      console.error("chartRef is not defined");
    }
  };

  // Expose handleExport to parent via ref
  useImperativeHandle(ref, () => ({
    handleExport,
  }));

  // Render chart based on type
  return (
    <div className="chart-container" style={{ width: "100%" }}>
      <div className="chart-wrapper" ref={chartRef}>
        <Bar
          data={type === "projects" ? projectChartData : memberChartData}
          options={{
            ...options,
            plugins: {
              ...options.plugins,
              title: {
                ...options.plugins.title,
                text:
                  type === "projects"
                    ? "Projects Created "
                    : "Members Registered",
              },
            },
          }}
        />
      </div>
    </div>
  );
});

export default Chart;
