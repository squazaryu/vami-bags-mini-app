import React from 'react';
import './ProgressBar.css';

interface Step {
  id: number;
  title: string;
  icon: string;
  completed: boolean;
  active: boolean;
  clickable: boolean;
}

interface ProgressBarProps {
  steps: Step[];
  onStepClick: (stepId: number) => void;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ steps, onStepClick }) => {
  const completedSteps = steps.filter(step => step.completed).length;
  const progress = (completedSteps / steps.length) * 100;

  return (
    <div className="interactive-progress-container">
      <div className="steps-bar">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`step-item ${step.active ? 'active' : ''} ${step.completed ? 'completed' : ''} ${step.clickable ? 'clickable' : ''}`}
            onClick={() => step.clickable ? onStepClick(step.id) : undefined}
          >
            <div className="step-icon">
              {step.completed ? '✓' : step.icon}
            </div>
            <div className="step-title">{step.title}</div>
          </div>
        ))}
      </div>
      <div className="liquid-progress-bar">
        <div 
          className="liquid-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar; 