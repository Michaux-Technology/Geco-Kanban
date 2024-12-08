import React from 'react';
import { Chart } from "react-google-charts";

const GanttChart = ({ tasks }) => {
  const data = [
    [
      { type: "string", label: "Task ID" },
      { type: "string", label: "Task Name" },
      { type: "string", label: "Resource" }, // Add resource column for colors
      { type: "date", label: "Start Date" },
      { type: "date", label: "End Date" },
      { type: "number", label: "Duration" },
      { type: "number", label: "Percent Complete" },
      { type: "string", label: "Dependencies" }
    ],
    ...tasks.map((task, index) => [
      task._id,
      task.title,
      `Resource${index}`, // Unique resource identifier
      new Date(task.begindate),
      new Date(task.enddate),
      task.workingDay,
      task.gauge,
      task.dependencies || null
    ])
  ];

  // Create color mapping for resources
  const colors = {};
  tasks.forEach((task, index) => {
    colors[`Resource${index}`] = task.color;
  });

  return (
    <Chart
      chartType="Gantt"
      width="100%"
      height="400px"
      data={data}
      options={{
        height: 400,
        gantt: {
          trackHeight: 30,
          barCornerRadius: 3,
          palette: tasks.map(task => ({
            color: task.color,
            dark: task.color,
            light: task.color
          }))
        }
      }}
    />
  );
};

export default GanttChart;
