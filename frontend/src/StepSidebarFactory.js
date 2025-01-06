import React, {useEffect} from 'react';
import DataPreprocessingSidebar from './DataPreprocessingSidebar';
import BlockBuildingSidebar from './BlockBuildingSidebar';
import ComparisonSidebar from './ComparisonSidebar';
import ClassificationSidebar from './ClassificationSidebar';
import StatisticsView from "./StatisticsView";
import {useNavigate} from "react-router-dom";

const StepSidebarFactory = ({ workflowId, stepId, lastStep, onSave, onCancel, sharedState }) => {

  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    if (stepId === '6') {
      navigate(`/workflow/statistics/${workflowId}`); // Redirect to the statistics.py view
    }
  }, [stepId, workflowId, navigate]);

  switch (stepId) {
    case '2':
      return (
        <DataPreprocessingSidebar
          workflowId={workflowId}
          onSave={onSave}
          onCancel={onCancel}
          lastStep={lastStep} // Pass lastStep
          activeStepId={stepId}
          sharedState={sharedState}
        />
      );
      case '3':
      return (
        <BlockBuildingSidebar
          workflowId={workflowId}
          onSave={onSave}
          lastStep={lastStep} // Pass lastStep
          activeStepId={stepId}
          onCancel={onCancel}
        />
      );
      case '4': // Assuming '4' is the ID for this step
        return (
          <ComparisonSidebar
            workflowId={workflowId}
            lastStep={lastStep} // Pass lastStep
            activeStepId={stepId}
            onSave={onSave}
            onCancel={onCancel}
          />
        );
      case '5': // Assuming '4' is the ID for this step
        return (
          <ClassificationSidebar
            workflowId={workflowId}
            lastStep={lastStep} // Pass lastStep
            activeStepId={stepId}
            onSave={onSave}
            onCancel={onCancel}
          />
        );
    case '6':
      return (<StatisticsView/>);
    default:
      return null; // No sidebar if the step isn't recognized
  }
};

export default StepSidebarFactory;
