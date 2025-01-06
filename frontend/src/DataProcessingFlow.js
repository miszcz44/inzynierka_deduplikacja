import React, { useEffect, useState } from 'react';
import ReactFlow, { MiniMap, Controls, Background, useNodesState, useEdgesState } from 'react-flow-renderer';
import './css/Sidebar.css';
import StepSidebarFactory from './StepSidebarFactory';
import { useParams } from "react-router-dom";
import PreprocessingModal from './PreprocessingModal';
import Modal from "./Modal"; // Import the Modal component
import { BackButton, HomeButton } from './Buttons';
import './css/DataProcessingFlow.css';

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

  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility

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

    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        const originalNode = initialNodes.find((n) => n.id === node.id);
        return {
          ...node,
          style: { ...originalNode.style },
          data: { ...node.data, label: originalNode.data.label },
        };
      })
    );

    setNodes((prevNodes) =>
      prevNodes.map((node, index) => {
        if (index === lastStepIndex) {
          return {
            ...node,
            style: { ...node.style, background: '#FFDF85', fontWeight: 'bold' },
          };
        } else if (index === currentStepIndex) {
          return {
            ...node,
            style: { ...node.style, background: '#FFD700', border: '2px solid #000' },
          };
        } else if (index > currentStepIndex) {
          const originalNode = initialNodes.find((n) => n.id === node.id);
          return {
            ...node,
            style: { ...node.style, opacity: 0.5, pointerEvents: 'none' },
            data: { ...node.data, label: `${originalNode.data.label} (Locked)` },
          };
        }
        return node;
      })
    );
  };

  const handleNodeClick = (event, node) => {
    const nodeStepIndex = stepOrder.indexOf(node.data.label.replace(' (Locked)', ''));
    const lastStepIndex = stepOrder.indexOf(lastStep);
    if (nodeStepIndex <= lastStepIndex + 1) {
      setActiveStepId(node.id);
    }
  };

  const handleSave = () => {
    console.log('Saved');
    const currentNode = nodes.find((node) => node.id === activeStepId);
    const currentStepIndex = nodes.findIndex((node) => node.id === activeStepId);

    if (currentStepIndex !== -1) {
      const currentStepKey = stepOrder[activeStepId - 2];
      setLastStep(currentStepKey);
      updateNodeStyles(currentStepKey);
    }

    setActiveStepId(null);
  };

  const handleCancel = () => {
    setActiveStepId(null);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Only render the modal and open button if lastStep is not null
  const shouldOpenModal = lastStep !== null;

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <BackButton/>
      <HomeButton/>
      <div style={{ flex: 1, position: 'relative', height: '100%' }}>
        
        <div className="title-container">
          <h2>Data deduplication process: {workflowData ? workflowData.title : 'Loading...'}</h2>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          defaultViewport={defaultViewport}
          fitView
          onNodeClick={handleNodeClick}
        >
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
          sharedState={{ checkboxValues, setCheckboxValues }}
        />
      )}

      {/* Only show the "Open Modal" button if the lastStep exists */}
      {shouldOpenModal && !isModalOpen && lastStep !== 'CLASSIFICATION' && (
        <button
          style={{
            position: 'fixed',
            left: '20px',
            bottom: '30px',
            width: '10%',
            padding: '10px 0',
            background: '#FF4500',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            zIndex: 1001, // Ensure the button is above other elements
          }}
          onClick={openModal}
        >
          Open Modal
        </button>
      )}

      {/* Modal component */}
      {shouldOpenModal && <Modal isOpen={isModalOpen} onClose={closeModal} workflowId={workflowId} lastStep={lastStep} />}
    </div>
  );
};

export default DataProcessingFlow;
