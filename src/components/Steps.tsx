// App.tsx
import React, { useState } from 'react';
import VerticalStepper from './ProgressBar';
import why1 from '../../public/img/why1.webp';
import why2 from "../../public/img/why2.webp";
import why3 from "../../public/img/why3.webp";
const steps = [
  {
    label: 'Step 1', title: 'Quote and book your order',
    description: 'in seconds (we’re talking finger-snapping fast!). Call or chat online with one of our advisors. After that, go ahead and compare with competition, we know you want to!',
    span: 'Click—or tap—here for an instant online quote',
    img: why1
  },
  {
    label: 'Step 2',
    description: 'Schedule your pickup date, time and an easy-to-access pickup location with your trucker. You can even release your car while you’re at work.',
    title: 'We pick up your vehicle',
    img: why2
  },
  {
    label: 'Step 3',
    description: 'Reuniting you and your vehicle is an exciting moment—and one we look forward to at Cayad Auto Transport! Your trucker will call you when your vehicle is almost home so you can greet them both right at your own driveway (or a nearby agreed-upon location).',
    title: 'Receive your vehicle',
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
        onComplete={handleComplete}
      />
    </div>
  );
};

export default Step;
