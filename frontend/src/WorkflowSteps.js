import React from 'react';
import { useParams } from 'react-router-dom';
import DataProcessingFlow from './DataProcessingFlow';

const WorkflowSteps = () => {
  const { projectId } = useParams();

  return (
    <div>
      <h2>Proces deduplikacji danych dla projektu: {projectId}</h2>
      <DataProcessingFlow />
    </div>
  );
};

export default WorkflowSteps;
