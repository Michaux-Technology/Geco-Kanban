import React, { useState } from 'react';
import { Upload, File, UploadCloud } from 'lucide-react';

const FileUploadScreen = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(files);
  };

  const handleUpload = () => {
    // Logique de téléchargement à implémenter
    console.log('Fichiers à télécharger:', selectedFiles);
  };

  const removeFile = (fileToRemove) => {
    setSelectedFiles(selectedFiles.filter(file => file !== fileToRemove));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Déposer des Fichiers</h2>
        
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-300 ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <input 
            type="file" 
            multiple 
            className="hidden" 
            id="fileInput"
            onChange={handleFileSelect}
          />
          <label 
            htmlFor="fileInput" 
            className="cursor-pointer flex flex-col items-center"
          >
            <UploadCloud className="text-gray-500 w-12 h-12 mb-4" />
            <p className="text-gray-600 mb-2">
              Glissez et déposez vos fichiers ou 
              <span className="text-blue-600 ml-1 hover:underline">
                parcourir
              </span>
            </p>
            <p className="text-xs text-gray-500">
              Types de fichiers acceptés : Tous
            </p>
          </label>
        </div>

        {selectedFiles.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              Fichiers sélectionnés
            </h3>
            <ul className="space-y-2">
              {selectedFiles.map((file, index) => (
                <li 
                  key={index} 
                  className="flex items-center justify-between bg-gray-100 p-3 rounded-lg"
                >
                  <div className="flex items-center">
                    <File className="w-6 h-6 text-blue-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(1)} Ko
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeFile(file)}
                    className="text-red-500 hover:bg-red-100 p-2 rounded-full"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6">
          <button 
            onClick={handleUpload}
            disabled={selectedFiles.length === 0}
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 
                       transition-colors duration-300 flex items-center justify-center
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="mr-2" />
            Télécharger {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUploadScreen;