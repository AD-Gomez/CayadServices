// App.tsx
import React, { useState } from 'react';
import VerticalStepper from './ProgressBar';
import why1 from "../../public/img/why1.webp";
import why2 from "../../public/img/why2.webp";
import why3 from "../../public/img/why3.webp";
const steps = [
  {
    label: 'Step 1',
  title: 'Quote and Book Your Auto Transport',
  description: ' Enter your pickup and delivery info to get a free quote in seconds. Choose your transport type, confirm your price, and book online — fast, secure, and backed by a reliable car transportation company.',
  span: 'Tap or click to get your instant vehicle shipping quote',
    img: why1,
    hasButton: true
  },
  {
    label: 'Step 2',
  title: 'We’ll Pick Up Your Car',
  description: 'Our Driver meets you where it’s most convenient — even at home or work. It’s flexible, secure, and handled by trusted vehicle transport pros.',

    img: why2
  },
  {
    label: 'Step 3',
  title: 'Receive Your Car',
  description: 'The driver will call ahead as your car arrives. Meet them at your driveway or any agreed spot. Fast, reliable vehicle delivery — handled by trusted auto transport professionals.',

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
