import React, { useEffect, useState } from 'react';
import ReactFlow, { MiniMap, Controls, Background, useNodesState, useEdgesState } from 'react-flow-renderer';
import './css/Sidebar.css';
import StepSidebarFactory from './StepSidebarFactory';
import { useParams } from "react-router-dom";

// Initial nodes and edges data
const initialNodes = [
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
  const [workflowData, setWorkflowData] = useState(null);
  const [activeStepId, setActiveStepId] = useState(null);
  const [checkboxValues, setCheckboxValues] = useState({
    lowercase: false,
    removeDiacritics: false,
    removePunctuation: false,
  });

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
    setActiveStepId(node.id); // Set the active step ID
  };

  const handleSave = () => {
    console.log('Saved:', checkboxValues);
    setActiveStepId(null); // Close sidebar after saving
  };

  const handleCancel = () => {
    setActiveStepId(null); // Close sidebar without saving
  };

  return (
    <div style={{ display: 'flex', height: '800px' }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <h2>Data deduplication process: {workflowData ? workflowData.title : 'Loading...'}</h2>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          defaultViewport={defaultViewport}
          fitView
          onNodeClick={handleNodeClick}
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>

      {/* Dynamically render the appropriate sidebar */}
      {activeStepId && (
        <StepSidebarFactory
          stepId={activeStepId}
          onSave={handleSave}
          onCancel={handleCancel}
          sharedState={{ checkboxValues, setCheckboxValues }}
        />
      )}
    </div>
  );
};

export default DataProcessingFlow;