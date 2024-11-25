import React from 'react';
import DataPreprocessingSidebar from './DataPreprocessingSidebar';
import BlockBuildingSidebar from './BlockBuildingSidebar';

const StepSidebarFactory = ({ stepId, onSave, onCancel, sharedState }) => {
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
    default:
      return null; // No sidebar if the step isn't recognized
  }
};

export default StepSidebarFactory;
