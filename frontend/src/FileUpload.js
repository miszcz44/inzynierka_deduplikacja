import React, { useState } from 'react';
import api from './api';

const FileUpload = ({ userId }) => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const onFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const onFileUpload = async () => {
    if (!file) {
      setMessage('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post(`/api/upload/${userId}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage(response.data.message);
    } catch (error) {
      setMessage('File upload failed');
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div>
      <h1>Upload a File</h1>
      <input type="file" onChange={onFileChange} />
      <button onClick={onFileUpload}>Upload</button>
      <p>{message}</p>
    </div>
  );
};

export default FileUpload;
