// App.tsx
import React, { useState } from 'react';
import VerticalStepper from './ProgressBar';
import step1 from '../../public/img/open_circle_a.webp'
import step2 from '../../public/img/open_circle_b.jpeg'
import step3 from '../../public/img/open_circle_c.webp'

const steps = [
  {
    label: 'Step 1', title: 'OUR VISION',
    description: 'Our goal is to become one of the best cost effective shipping services, servicing the widest range of individual customers, corporations of any size and business partners within the United States.',
    img: step1,
  },
  {
    label: 'Step 2',
    description: 'At Cayad, our mission is to deliver a 5-star vehicle-shipping experience to every customer by blending innovative solutions with commitment to service excellence',
    title: 'OUR MISSION',
    img: step2
  },
  {
    label: 'Step 3',
    description: 'Our core value is to have a FAMILY TEAM where all members use “WE” instead of “I” to deal with any case.',
    title: 'OUR VALUES',
    img: step3
  },
];

const StepVision: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleComplete = () => {
  };

  return (
    <div className="w-[80%] flex flex-col items-center justify-center">
      <VerticalStepper
        steps={steps}
        activeStep={activeStep}
        onNext={handleNext}
        onBack={handleBack}
        onComplete={handleComplete}
      />
    </div>
  );
};

export default StepVision;
