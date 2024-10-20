import React from 'react';
import axios from 'axios';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import { API_URL } from './config';
import { Droppable } from 'react-beautiful-dnd';
import Task from './Task';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';


import { TextField } from '@mui/material';

const Column = ({ status, title, tasks, editingColumn, projectId, setTasks, onColumnDeleted, handleColumnNameEdit, handleColumnNameSave, columnNames, setColumnNames, handleEditTask, handleDeleteTask, handleLike, setShowMessaging, handleCommentCount, totalLikes, showMessaging, commentText, handleCommentChange, handleComment, toggleMessaging, messagingStates }) => {

  const [openConfirmDialog, setOpenConfirmDialog] = React.useState(false);
  const [columnToDelete, setColumnToDelete] = React.useState(null);

  const handleDeleteColumn = (columnId) => {
    setColumnToDelete(columnId);
    setOpenConfirmDialog(true);
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


  return (
    <>
      <div className="columnTitleDescription">
        <div className={`columnTitle${status === 'todo' ? '1' : status === 'inProgress' ? '2' : '3'}`} onClick={() => handleColumnNameEdit(status)}>
          {editingColumn === status ? (
            <TextField
              value={columnNames[status]}
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
          ) : (<>
            <h2 className="columnTitle">{title}</h2>
          </>
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