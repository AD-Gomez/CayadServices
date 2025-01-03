// App.tsx
import React, { useState } from 'react';
import VerticalStepper from './ProgressBar';
import why1 from "../../public/img/why1.webp";
import why2 from "../../public/img/why2.webp";
import why3 from "../../public/img/why3.webp";
const steps = [
  {
    label: 'Step 1', title: 'Quote and book your order',
    description: 'in just seconds—fast, easy, and seamless! Need assistance? Our specialist team is ready to provide personalized support. With unbeatable market prices and top-tier service, you’re in great hands.',
    span: 'Click—or tap—here to get an instant online quote',
    img: why1,
    hasButton: true
  },
  {
    label: 'Step 2',
    description: 'Easily schedule your pickup date, time, and a convenient location with your trucker. You can even hand over your keys while you are at work—hassle-free and completely on your terms.',
    title: 'We’ll pick up your car',
    img: why2
  },
  {
    label: 'Step 3',
    description: 'At Cayad Auto Transport, we make reuniting you with your car an effortless experience. Your trucker will give you a call as your car approaches, so you can welcome it right in your driveway—or at a nearby agreed location. Fast, reliable, and stress-free service from start to finish!',
    title: 'Receive your car',
    img: why3
  },
];

const Step: React.FC = () => {
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
      />
    </div>
  );
};

export default Step;
