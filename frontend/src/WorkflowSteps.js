import React from 'react';
import { useParams } from 'react-router-dom';
import DataProcessingFlow from './DataProcessingFlow';

const WorkflowSteps = () => {
  const { projectId } = useParams();

  return (
    <div>
      <DataProcessingFlow />
    </div>
  );
};

export default WorkflowSteps;