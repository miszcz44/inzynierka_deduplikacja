import React from 'react';
import DataPreprocessingSidebar from './DataPreprocessingSidebar';
import BlockBuildingSidebar from './BlockBuildingSidebar';
import ComparisonSidebar from './ComparisonSidebar';

const StepSidebarFactory = ({ workflowId, stepId, onSave, onCancel, sharedState }) => {
  switch (stepId) {
    case '2':
      return (
        <DataPreprocessingSidebar
          onSave={onSave}
          onCancel={onCancel}
          sharedState={sharedState}
        />
      );
      case '3':
      return (
        <BlockBuildingSidebar
          onSave={onSave}
          onCancel={onCancel}
        />
      );
      case '4': // Assuming '4' is the ID for this step
        return (
          <ComparisonSidebar
            workflowId={workflowId}
            onSave={(selectedAlgorithms) => {
              console.log('Comparison step saved with:', selectedAlgorithms);
            }}
            onCancel={onCancel}
          />
        );
    default:
      return null; // No sidebar if the step isn't recognized
  }
};

export default StepSidebarFactory;
