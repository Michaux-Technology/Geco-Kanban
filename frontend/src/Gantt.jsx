import React from 'react';
import { Paper, Box, Typography } from '@mui/material';

const Gantt = ({ tasks }) => {


  const validTasks = tasks.filter(task => {
    return task.begindate != null &&
      task.enddate != null &&
      task.begindate !== '' &&
      task.enddate !== '';
  }).sort((a, b) => new Date(a.begindate) - new Date(b.begindate));

  if (validTasks.length === 0) {
    return null;
  }

  const startDate = new Date(Math.min(...validTasks.map(t => new Date(t.begindate))));
  const endDate = new Date(Math.max(...validTasks.map(t => new Date(t.enddate))));
  const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

  console.log('Filtered tasks:', validTasks);

  const getTaskPosition = (task) => {
    const start = new Date(task.begindate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(task.enddate);
    end.setHours(23, 59, 59, 999);
  
    const left = ((start - startDate) / (1000 * 60 * 60 * 24)) / totalDays * 90; // Changed from 100 to 90
    const width = ((end - start) / (1000 * 60 * 60 * 24)) / totalDays * 90; // Changed from 100 to 90
    return { left: `${left}%`, width: `${width}%` };
  };

  return (
    <Paper sx={{ p: 1, width: '98%', height: '100%', maxHeight: 'calc(80vh - 200px)' }}>
      <Box sx={{ width: '100%', height: '100%', overflow: 'auto' }}>
        {validTasks.map((task) => (

          <Box key={task._id} sx={{ position: 'relative', height: 40, mb: 1 }}>
            <Typography variant="body2" sx={{
              position: 'absolute',
              left: 0,
              width: '120px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontSize: '0.8rem'
            }}>

              <b>{task.title}</b>
              <br />
              <span style={{ fontSize: '0.6rem' }}>
                {new Date(task.begindate).toLocaleDateString()} - {new Date(task.enddate).toLocaleDateString()}
              </span>
            </Typography>
            <Box
              sx={{
                position: 'absolute',
                left: '130px',
                right: 0,
                height: '100%',
                width: 'calc(89%)',
                backgroundColor: '#f5f5f5',
                borderLeft: '1px solid #ddd'
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  height: '40%',
                  top: '25%',
                  backgroundColor: task.color || '#ff9800',
                  borderRadius: 1,
                  ...getTaskPosition(task),
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0 4px',
                  alignItems: 'center',
                  color: '#fff',
                  fontSize: '0.7rem',
                  minWidth: '100px',
                }}
              >
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default Gantt;