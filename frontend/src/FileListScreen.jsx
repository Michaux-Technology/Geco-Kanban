import React, { useState, useEffect, useRef, useCallback } from 'react';
import { API_URL } from './config';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Typography,
  Box
} from '@mui/material';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const FileListScreen = ({ projectId }) => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const initRef = useRef(false);
  const [open, setOpen] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: 'uploadDate',
    direction: 'desc'
  });

  const fetchFiles = useCallback(async () => {
    try {
      if (!projectId) return;
      console.log('Fetching files for project:', projectId);
      const response = await fetch(`${API_URL}/files/${projectId}`);
      const data = await response.json();
      if (data.length > 0 && projectId === data[0].projectId) {
        setFiles(data);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  }, [projectId]);

  const fetchFilesParam = useCallback(async (savedProjectId) => {
    try {
      console.log('fetchFilesParam', savedProjectId)
      const idToUse = savedProjectId || projectId;
      if (!idToUse) return;
      console.log('Fetching files for project:', idToUse);
      const response = await fetch(`${API_URL}/files/${idToUse}`);
      const data = await response.json();
      if (data.length > 0 && idToUse === data[0].projectId) {
        setFiles(data);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  }, [projectId]);

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      localStorage.setItem('currentProjectId', projectId);
      const response = await fetch(`${API_URL}/upload/${projectId}`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        await fetchFiles();
        setFiles(prev => [...prev, data]);
        localStorage.setItem('fileModalState', JSON.stringify(true));
        setOpen(true);
      } else {
        console.error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  };
  
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    
    const savedState = localStorage.getItem('fileModalState');
    if (savedState) {
      setOpen(JSON.parse(savedState));
      fetchFiles();
    }
  }, [fetchFiles]);

  useEffect(() => {
    localStorage.setItem('fileModalState', JSON.stringify(open));
  
    if (open) {
      console.log('Modal is open');
      const savedProjectId = localStorage.getItem('currentProjectId');
      fetchFilesParam(savedProjectId);
    }
  }, [open, fetchFilesParam]);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragActive) setDragActive(true);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragActive) setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const sortFiles = (filesArray) => {
    return [...filesArray].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const filteredAndSortedFiles = sortFiles(
    files.filter(file =>
      file.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
      // Reset input value to allow selecting the same file again
      e.target.value = '';
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      const response = await fetch(`${API_URL}/files/${fileId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setFiles(files.filter(file => file._id !== fileId));
      } else {
        console.error('Error deleting file');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDownloadFile = async (file) => {
    try {
      // Create temporary link for download
      const link = document.createElement('a');
      link.href = `${API_URL}/download/${file._id}`;
      link.setAttribute('download', file.name);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'desc'
        ? 'asc'
        : 'desc'
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
<CloudUploadIcon
  sx={{
    color: 'primary.main',
    fontSize: 50,
    cursor: 'pointer'
  }}
  onClick={() => {
    localStorage.setItem('currentProjectId', projectId);
    fetchFilesParam('currentProjectId');
    setOpen(true);
  }}
/>

<Modal
    open={open}
>
        <ModalDialog sx={{
          maxWidth: '80vw',
          maxHeight: '80vh',
          overflow: 'auto'
        }}>
          <ModalClose onClick={() => setOpen(false)} />

          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
                <FolderIcon sx={{ mr: 1, color: 'primary.main' }} />
                Filed files
              </Typography>

              <TextField
                placeholder="Rechercher un fichier..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Box>

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell onClick={() => handleSort('name')} sx={{ cursor: 'pointer' }}>
                    File name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}
                  </TableCell>

                  <TableCell onClick={() => handleSort('uploadDate')} sx={{ cursor: 'pointer' }}>
                    Filing date {sortConfig.key === 'uploadDate' && (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}
                  </TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAndSortedFiles.length > 0 ? (
                  filteredAndSortedFiles.map((file) => (
                    <TableRow key={file._id} hover>
                      <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                        <InsertDriveFileIcon sx={{ mr: 1, color: 'primary.main' }} />
                        {file.name}
                      </TableCell>
                      <TableCell>{formatDate(file.uploadDate)}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="primary"
                          onClick={() => handleDownloadFile(file)}
                          title="Télécharger"
                          sx={{ padding: '0.5px' }}
                        >
                          <DownloadIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteFile(file._id)} // Change from file.id to file._id
                          title="Supprimer"
                          sx={{ padding: '0.5px' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow key="no-files-row">
                    <TableCell colSpan={4} align="center">
                      <Typography color="text.secondary">No files found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {filteredAndSortedFiles.length > 0 && (
              <Box sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Total : {filteredAndSortedFiles.length} fichier(s)
                </Typography>
              </Box>
            )}


            {/* Update the file input and label section */}
            <Box
              component="form"
              onSubmit={(e) => e.preventDefault()}
              sx={{
                p: 2,
                my: 2,
                border: '2px dashed',
                borderColor: dragActive ? 'primary.main' : 'grey.300',
                borderRadius: 1,
                textAlign: 'center',
                bgcolor: dragActive ? 'action.hover' : 'background.paper',
                cursor: 'pointer'
              }}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="file-upload"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
              <label htmlFor="file-upload" style={{ cursor: 'pointer', width: '100%', height: '100%' }}>
                <CloudUploadIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography>
                  Drag and drop your files here or click to select
                </Typography>
              </label>
            </Box>



          </Paper>
        </ModalDialog>
      </Modal>
    </>
  );
};

export default FileListScreen;
