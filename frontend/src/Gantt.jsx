import React from 'react';
import { Chart } from "react-google-charts";

const GanttChart = ({ tasks }) => {
  //console.log('Tasks in GanttChart:', tasks);
  const data = [
    [
      { type: "string", label: "Task ID" },
      { type: "string", label: "Task Name" },
      { type: "date", label: "Start Date" },
      { type: "date", label: "End Date" },
      { type: "number", label: "Duration" },
      { type: "number", label: "Percent Complete" },
      { type: "string", label: "Dependencies" },
    ],
    ...tasks.map(task => [
      task._id,
      task.title,
      new Date(task.begindate),
      new Date(task.enddate),
      task.workingDay,
      task.gauge,
      task.dependencies || null,
    ])
  ];

  console.log('Data in GanttChart:', data);
  return (
    <Chart
      chartType="Gantt"
      width="100%"
      height="400px"
      data={data}
      options={{
        height: 400,
        gantt: {
          trackHeight: 30
        }
      }}
    />
  );
};

export default GanttChart;
