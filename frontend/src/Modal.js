import React from 'react';
import PreprocessingModal from './PreprocessingModal';
import BlockBuildingModal from "./BlockBuildingModal";
import FieldAndRecordComparisonModal from "./FieldAndRecordComparisonModal";
import ClassificationModal from "./ClassificationModal";

const stepOrder = [
  'DATA_PREPROCESSING',
  'BLOCK_BUILDING',
  'FIELD_AND_RECORD_COMPARISON',
  'CLASSIFICATION',
  'EVALUATION',
];

const BaseModal = ({ isOpen, onClose, workflowId, lastStep }) => {
  const renderStepComponent = () => {
    switch (lastStep) {
      case 'DATA_PREPROCESSING':
        return <PreprocessingModal isOpen={isOpen} onClose={onClose} workflowId={workflowId} lastStep={lastStep} />;
      case 'BLOCK_BUILDING':
        return <BlockBuildingModal isOpen={isOpen} onClose={onClose} workflowId={workflowId} lastStep={lastStep} />;
      case 'FIELD_AND_RECORD_COMPARISON':
        return <FieldAndRecordComparisonModal isOpen={isOpen} onClose={onClose} workflowId={workflowId} lastStep={lastStep} />;
      case 'CLASSIFICATION':
        return <ClassificationModal isOpen={isOpen} onClose={onClose} workflowId={workflowId} lastStep={lastStep}/>
      default:
        return <div>Unknown step</div>;
    }
  };

  if (!isOpen) return null; // Don't render anything if the modal is not open
  if (isOpen && lastStep === 'FIELD_AND_RECORD_COMPARISON') return (<div>{renderStepComponent()}</div>);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000, // Ensure the modal is above everything
      }}
    >
      {/* Hoverable close button with 'Close' label */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '3%',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '10px 20px',
          backgroundColor: 'white',
          borderRadius: '20px',
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
          cursor: 'pointer',
          zIndex: 1100,
          fontSize: '18px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '20px'
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = '#f0f0f0')}
        onMouseOut={(e) => (e.target.style.backgroundColor = 'white')}
      >
        Close
      </div>

      <div
        style={{
          backgroundColor: 'white',
          width: '80%',
          height: '80%',
          borderRadius: '8px',
          padding: '20px',
          position: 'relative',
          overflow: 'auto', // Ensure scroll if content overflows
        }}
      >
        <h2 style={{ textAlign: 'center' }}>Workflow Step: {lastStep}</h2>
        {renderStepComponent()}
      </div>
    </div>
  );
};

export default BaseModal;
