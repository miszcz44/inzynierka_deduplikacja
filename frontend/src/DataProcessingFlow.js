import React, { useEffect, useState } from 'react';
import ReactFlow, { MiniMap, Controls, Background, useNodesState, useEdgesState } from 'react-flow-renderer';
import './css/Sidebar.css';
import StepSidebarFactory from './StepSidebarFactory';
import { useParams } from "react-router-dom";

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

const stepOrder = [
  'DATA_PREPROCESSING',
  'BLOCK_BUILDING',
  'FIELD_AND_RECORD_COMPARISON',
  'CLASSIFICATION',
  'EVALUATION',
];

const DataProcessingFlow = () => {
  const { workflowId } = useParams();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [workflowData, setWorkflowData] = useState(null);
  const [activeStepId, setActiveStepId] = useState(null);
  const [lastStep, setLastStep] = useState(null);
  const [checkboxValues, setCheckboxValues] = useState({
    lowercase: false,
    removeDiacritics: false,
    removePunctuation: false,
  });

  const initialStyles = initialNodes.map((node) => ({ id: node.id, style: node.style }));


  useEffect(() => {
    loadWorkflowData();
    fetchLastStep();
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

  const fetchLastStep = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/workflow-step/${workflowId}/last-step`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const lastStepData = await response.json();
        setLastStep(lastStepData); // Save the last step
        updateNodeStyles(lastStepData);
      } else {
        console.error('Failed to fetch last step');
      }
    } catch (error) {
      console.error('Error fetching last step:', error);
    }
  };

 const updateNodeStyles = (lastStep) => {
  const lastStepIndex = stepOrder.indexOf(lastStep);
  const currentStepIndex = lastStepIndex + 1;

  // Reset all node styles and labels to their initial state
  setNodes((prevNodes) =>
    prevNodes.map((node) => {
      const originalNode = initialNodes.find((n) => n.id === node.id); // Find matching initial node
      return {
        ...node,
        style: { ...originalNode.style }, // Reset style
        data: { ...node.data, label: originalNode.data.label }, // Reset label
      };
    })
  );

  // Apply styles based on lastStep
  setNodes((prevNodes) =>
    prevNodes.map((node, index) => {
      if (index === lastStepIndex) {
        // Style for the previous step
        return {
          ...node,
          style: { ...node.style, background: '#FFDF85', fontWeight: 'bold' },
        };
      } else if (index === currentStepIndex) {
        // Style for the current step
        return {
          ...node,
          style: { ...node.style, background: '#FFD700', border: '2px solid #000' },
        };
      } else if (index > currentStepIndex) {
        // Disable future steps
        const originalNode = initialNodes.find((n) => n.id === node.id); // Use original node for label
        return {
          ...node,
          style: { ...node.style, opacity: 0.5, pointerEvents: 'none' },
          data: { ...node.data, label: `${originalNode.data.label} (Locked)` }, // Append "(Locked)"
        };
      }

      return node; // Keep the rest unchanged
    })
  );
};


  const handleNodeClick = (event, node) => {
    // Allow interaction only with the current step or earlier
    const nodeStepIndex = stepOrder.indexOf(node.data.label.replace(' (Locked)', ''));
    const lastStepIndex = stepOrder.indexOf(lastStep);
    if (nodeStepIndex <= lastStepIndex + 1) {
      setActiveStepId(node.id); // Set the active step ID
    }
  };

  const handleSave = () => {
    console.log('Saved');

    // Find the current step index using activeStepId
    const currentNode = nodes.find((node) => node.id === activeStepId);
    const currentStepIndex = nodes.findIndex((node) => node.id === activeStepId);

    if (currentStepIndex !== -1) {
      // Get the corresponding step from stepOrder
      const currentStepKey = stepOrder[activeStepId-2];
      // Update lastStep (frontend logic only)
      setLastStep(currentStepKey);

      // Trigger node styles update via updateNodeStyles
      updateNodeStyles(currentStepKey);
    }

    // Close sidebar
    setActiveStepId(null);
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

      {activeStepId && (
        <StepSidebarFactory
          workflowId={workflowId}
          stepId={activeStepId}
          lastStep={lastStep}
          onSave={handleSave}
          onCancel={handleCancel}
          sharedState={{ checkboxValues, setCheckboxValues }} // This is where the error originates
        />
      )}
    </div>
  );
};

export default DataProcessingFlow;
