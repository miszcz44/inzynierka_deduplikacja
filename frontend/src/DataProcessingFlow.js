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

    setNodes((prevNodes) =>
      prevNodes.map((node, index) => {
        const step = stepOrder[index];

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
          return {
            ...node,
            style: { ...node.style, opacity: 0.5, pointerEvents: 'none' },
            data: { ...node.data, label: `${node.data.label} (Locked)` },
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

    if (activeStepId && workflowData) {
      const activeNode = nodes.find((node) => node.id === activeStepId);
      const lastStepLabel = activeNode ? activeNode.data.label : null;

      if (lastStepLabel) {
        // Update the `last_step` in the frontend (workflowData state)
        setWorkflowData((prevData) => ({
          ...prevData,
          last_step: lastStepLabel, // Set the last step as the label of the active step
        }));

        // Find the index of the current active node to manage styles for next and previous steps
        const activeNodeIndex = nodes.findIndex((node) => node.id === activeStepId);

        // Update the nodes to handle previous and next steps
        setNodes((prevNodes) => {
          // Clone the previous nodes array to safely mutate
          const updatedNodes = [...prevNodes];

          // Loop through all nodes and update styles based on their position relative to the active step
          updatedNodes.forEach((node, index) => {
            if (index < activeNodeIndex) {
              // Previous steps should be white (resetting their color)
              updatedNodes[index] = {
                ...node,
                style: { ...node.style, background: 'white', border: '1px solid #777' },
              };
            } else if (index === activeNodeIndex) {
              // The active step stays as it is (or you can highlight it if needed)
              updatedNodes[index] = {
                ...node,
                style: { ...node.style, background: '#ff0', border: '1px solid #ff0' }, // Optional: highlight active step
              };
            } else if (index === activeNodeIndex + 1) {
              // The next step should be unblocked (change color to indicate clickable)
              updatedNodes[index] = {
                ...node,
                style: { ...node.style, background: '#ff0', border: '1px solid #ff0' }, // Highlight next step
              };
            } else {
              // Steps after the next one should remain "blocked"
              updatedNodes[index] = {
                ...node,
                style: { ...node.style, background: '#ddd', border: '1px solid #777' }, // Grey color for blocked steps
              };
            }
          });

          return updatedNodes;
        });
      }
    }

    // Close the sidebar after saving
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
          onSave={handleSave}
          onCancel={handleCancel}
          sharedState={{ checkboxValues, setCheckboxValues }}
        />
      )}
    </div>
  );
};

export default DataProcessingFlow;
