import React, { useState, useEffect } from 'react';
import { SketchPicker } from 'react-color';
import Modal from '@mui/material/Modal';
import axios from 'axios';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import { API_URL } from './config';
import { Droppable } from 'react-beautiful-dnd';
import Task from './Task';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import Box from '@mui/material/Box';


import { TextField } from '@mui/material';

const Column = ({ status, title, tasks, editingColumn, projectId, setTasks, onColumnDeleted, handleColumnNameEdit, handleColumnNameSave, columnNames, setColumnNames, handleEditTask, handleDeleteTask, handleLike, setShowMessaging, handleCommentCount, totalLikes, showMessaging, commentText, handleCommentChange, handleComment, toggleMessaging, messagingStates }) => {

  console.log("title:", title)
  console.log("columnNames.color:", title.color)

  useEffect(() => {
    if (columnNames[status]?.color) {
      setColumnHeaderColor(columnNames[status].color);
    }
  }, [columnNames, status]);

  const [columnHeaderColor, setColumnHeaderColor] = useState(title.color);


  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);


  const [openConfirmDialog, setOpenConfirmDialog] = React.useState(false);
  const [columnToDelete, setColumnToDelete] = React.useState(null);



  const handleDeleteColumn = (columnId) => {
    setColumnToDelete(columnId);
    setOpenConfirmDialog(true);
  };

  const handleColumnColorChange = () => {
    setIsColorPickerOpen(true);
  };

  const confirmDeleteColumn = async () => {
    if (columnToDelete) {
      try {
        await axios.delete(`${API_URL}/projects/${projectId}/columns/${columnToDelete}`);
        setColumnNames(prevColumnNames => {
          const updatedColumnNames = { ...prevColumnNames };
          delete updatedColumnNames[columnToDelete];
          return updatedColumnNames;
        });
        setTasks(prevTasks => prevTasks.filter(task => task.status !== columnToDelete));
        if (typeof onColumnDeleted === 'function') {
          onColumnDeleted(columnToDelete);
        }
      } catch (error) {
        console.error('Error deleting column:', error);
      }
    }
    setOpenConfirmDialog(false);
  };

  const handleColorChange = async (color) => {
    try {
      const response = await axios.put(`${API_URL}/projects/${projectId}/columns/${status}/color`, {
        color: color.hex
      });
      setColumnHeaderColor(color.hex);
      setIsColorPickerOpen(false);
    } catch (error) {
      console.error('Error updating column color:', error);
    }
  };

  return (
    <>
      <Modal
        open={isColorPickerOpen}
        onClose={() => setIsColorPickerOpen(false)}
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
        }}>
          <SketchPicker
            color={columnHeaderColor}
            onChangeComplete={handleColorChange}
          />
        </Box>
      </Modal>

      <div className="columnTitleDescription" >


        <div
          className={`columnTitle${status === 'todo' ? '1' : status === 'inProgress' ? '2' : '3'}`}
          style={{ backgroundColor: columnHeaderColor }}
          onClick={() => handleColumnNameEdit(status)}
        >
          {editingColumn === status ? (
            <TextField
              value={typeof columnNames[status] === 'string' ? columnNames[status] : columnNames[status]?.name || ''}
              onChange={(e) => setColumnNames(prev => ({ ...prev, [status]: e.target.value }))}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleColumnNameSave(status, columnNames[status]);
                }
              }}
              autoFocus
              variant="standard"
              InputProps={{
                style: { color: 'white', fontSize: '1.5em' }
              }}
            />
          ) : (
            <h2 className="columnTitle">
              {typeof columnNames[status] === 'string' ? columnNames[status] : columnNames[status]?.name || ''}
            </h2>
          )}
        </div>

        <div className="column">
          <Droppable droppableId={status} direction="vertical">
            {provided => (
              <div ref={provided.innerRef} className="task-list">
                {tasks
                  .filter(task => task.status === status)
                  .sort((a, b) => a.order - b.order)
                  .map((task, index) => (
                    <Task
                      key={task._id + '-' + task.comments.length}
                      task={task}
                      index={index}
                      handleEditTask={handleEditTask}
                      handleDeleteTask={handleDeleteTask}
                      handleLike={handleLike}
                      setShowMessaging={setShowMessaging}
                      handleCommentCount={handleCommentCount}
                      totalLikes={totalLikes}
                      toggleMessaging={toggleMessaging}
                      showMessaging={messagingStates[task._id] || false}
                      commentText={commentText}
                      handleCommentChange={handleCommentChange}
                      handleComment={handleComment}

                    />
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          <IconButton
            aria-label="delete column"
            onClick={() => handleDeleteColumn(status)}
            size="small"
          >
            <DeleteIcon />
          </IconButton>

          <IconButton
            onClick={() => handleColumnColorChange(status)}
            size="small"
            sx={{ marginLeft: 1 }}
          >
            <ColorLensIcon fontSize="small" />
          </IconButton>

        </div>

      </div>

      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Column Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this column? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)}>Cancel</Button>
          <Button onClick={confirmDeleteColumn} autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

    </>
  );
}
export default Column;


// Application created by Valery-Jerome Michaux
// Copyrights can be viewed on Github
// https://github.com/Michaux-Technology/Geco-Kanban