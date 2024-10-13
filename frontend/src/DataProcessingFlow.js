import React, { useEffect, useState } from 'react';
import ReactFlow, { MiniMap, Controls, Background, useNodesState, useEdgesState } from 'react-flow-renderer';
import './css/Sidebar.css';
import { useParams } from "react-router-dom";

const initialNodes = [
  { id: '1', data: { label: 'Data Reading' }, position: { x: 100, y: 100 }, style: { padding: '10px', border: '1px solid #777', background: '#fff' } },
  { id: '2', data: { label: 'Data Pre-processing' }, position: { x: 100, y: 200 }, style: { padding: '10px', border: '1px solid #777', background: '#fff' } },
  { id: '3', data: { label: 'Block Building' }, position: { x: 100, y: 300 }, style: { padding: '10px', border: '1px solid #777', background: '#fff' } },
  { id: '4', data: { label: 'Field and Record Comparison' }, position: { x: 100, y: 400 }, style: { padding: '10px', border: '1px solid #777', background: '#fff' } },
  { id: '5', data: { label: 'Classification' }, position: { x: 100, y: 500 }, style: { padding: '10px', border: '1px solid #777', background: '#fff' } },
  { id: '6', data: { label: 'Evaluation' }, position: { x: 100, y: 600 }, style: { padding: '10px', border: '1px solid #777', background: '#fff' } },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
  { id: 'e3-4', source: '3', target: '4' },
  { id: 'e4-5', source: '4', target: '5' },
  { id: 'e5-6', source: '5', target: '6' },
];

const defaultViewport = { x: 0, y: 0, zoom: 1.5 };

const DataProcessingFlow = () => {
  const { workflowId } = useParams();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [workflowData, setWorkflowData] = useState(null);

  useEffect(() => {
    loadWorkflowData();
  }, [workflowId]);

  const loadWorkflowData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8000/api/workflows/${workflowId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setWorkflowData(data);
        } else {
          console.error('Failed to fetch workflow data');
        }
      } catch (error) {
        console.error('Error fetching workflow data:', error);
      }
    };

  const handleNodeClick = (event, node) => {
    if (node.id === '1') {
      setIsSidebarOpen(true);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file && (file.type === 'application/json' || file.name.endsWith('.csv'))) {
      setSelectedFile(file);
      setFileError(null);
    } else {
      setSelectedFile(null);
      setFileError('Please select a valid CSV or JSON file');
    }
  };

  const handleCancel = () => {
    setIsSidebarOpen(false);
    setFileError(null);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setFileError('No file selected or invalid file type.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/workflows/${workflowId}/set-file`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        alert('File uploaded successfully');
        await loadWorkflowData()
      } else {
        alert('Failed to upload file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }

    setIsSidebarOpen(false);
  };

  return (
    <div
      className={`flow-container ${isSidebarOpen ? 'flow-disable-interaction' : ''}`}
      style={{ height: '800px', border: '1px solid #ddd', position: 'relative' }}
    >
      <h2>Data deduplication process: {workflowData ? workflowData.title : 'Loading...'}</h2>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        defaultViewport={defaultViewport}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>

      {isSidebarOpen && (
        <div className="sidebar">
          <h3>Upload File for Data Reading</h3>
          {workflowData && workflowData.filename && (
            <p>Current File: {workflowData.filename}</p>
          )}
          <input type="file" onChange={handleFileChange} />
          <button variant="primary" onClick={handleSubmit}>Upload</button>
          {fileError && <p style={{ color: 'red' }}>{fileError}</p>}
          <button
            className="mt-2"
            style={{
              backgroundColor: '#ccc',
              color: '#000',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease',
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#627577'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ccc'}
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default DataProcessingFlow;
