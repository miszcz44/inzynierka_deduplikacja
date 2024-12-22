import React from 'react';
import PreprocessingModal from './PreprocessingModal'; // Assuming PreprocessingModal is in the same folder

const stepOrder = [
  'DATA_PREPROCESSING',
  'BLOCK_BUILDING',
  'FIELD_AND_RECORD_COMPARISON',
  'CLASSIFICATION',
  'EVALUATION',
];

const BaseModal = ({ isOpen, onClose, workflowId, lastStep }) => {
  // Determine which step to display based on lastStep value
  const renderStepComponent = () => {
    switch (lastStep) {
      case 'DATA_PREPROCESSING':
        return <PreprocessingModal isOpen={isOpen} onClose={onClose} workflowId={workflowId} lastStep={lastStep} />;
      // Add other cases for different steps as needed, for example:
      // case 'BLOCK_BUILDING':
      //   return <BlockBuildingModal isOpen={isOpen} onClose={onClose} />;
      // case 'FIELD_AND_RECORD_COMPARISON':
      //   return <FieldAndRecordComparisonModal isOpen={isOpen} onClose={onClose} />;
      // case 'CLASSIFICATION':
      //   return <ClassificationModal isOpen={isOpen} onClose={onClose} />;
      // case 'EVALUATION':
      //   return <EvaluationModal isOpen={isOpen} onClose={onClose} />;
      default:
        return <div>Unknown step</div>;
    }
  };

  if (!isOpen) return null; // Don't render anything if the modal is not open

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
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            width: '5%', // 5% of the modal width
            height: '5%', // 5% of the modal height
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: '24px',
            color: 'black', // Set color to black
            cursor: 'pointer',
            padding: '0',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontWeight: 'bold',
          }}
        >
          X
        </button>

        <h2 style={{ textAlign: 'center' }}>Workflow Step: {lastStep}</h2>

        {renderStepComponent()}
      </div>
    </div>
  );
};

export default BaseModal;
