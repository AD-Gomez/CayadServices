import React from 'react';


interface Step {
  label: string;
  description: string;
  title?: string
  span?: string
  img?: any
}

interface VerticalStepperProps {
  steps: Step[];
  activeStep: number;
  onNext: () => void;
  onBack: () => void;
  onComplete: () => void;
}

const VerticalStepper: React.FC<VerticalStepperProps> = ({ steps, activeStep, onNext, onBack, onComplete }) => {
  return (
    <div className="flex flex-col">
      {steps.map((step, index) => (
        <div key={index} className="flex h-max mb-4">
          <div className="flex flex-col items-center">
            <div
              className={`w-12 h-12 flex items-center justify-center rounded-full text-white ${index <= activeStep ? 'bg-[#00a1ef]' : 'bg-gray-300'
                }`}
            >
              {index + 1}
            </div>
            {index < steps.length - 1 && (
              <div className="flex flex-col items-center h-full">
                <div
                  className={`w-0.5 flex-1 ${index < activeStep ? 'bg-btn-blue' : 'bg-gray-300'
                    }`}
                />
              </div>
            )}
          </div>
          <div className="ml-4 flex-1">
            <div
              className={`transition-all duration-300 ${index === activeStep ? 'max-h-max' : 'max-h-10'
                } overflow-hidden`}
            >
              <div
                className={`text-lg font-medium ${index <= activeStep ? 'text-btn-blue' : 'text-gray-500'
                  }`}
              >
                {step.label}
              </div>
              {index === activeStep && (
                <div className='w-full flex xs:flex-col '>
                  <div className='w-[55%] xs:w-[100%] sm:w-[100%] xs:mb-8 sm:mb-8 flex flex-col justify-center'>
                    <div className=' mb-8 text-[38px]'>{step?.title}</div>
                    <div className="text-base w-[80%] xs:w-[90%] sm:w-[90%] text-gray-500 ">
                      {step.span &&
                        <span className='text-btn-blue text-base mr-[2px]'>{step.span}</span>
                      }
                      {step.description}
                    </div>
                  </div>
                  <div className='max-w-[400px] max-h-[400px]'>
                    {step?.img &&
                      <img src={step.img.src} />
                    }
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      <div className="flex mt-4">
        <button
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded mr-2"
          onClick={onBack}
          disabled={activeStep === 0}
        >
          Back
        </button>
        {activeStep < steps.length - 1 ? (
          <button
            className="bg-btn-blue text-white px-4 py-2 rounded"
            onClick={onNext}
          >
            Next
          </button>
        ) : (
          <button
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={onComplete}
          >
            Complete
          </button>
        )}
      </div>
    </div>
  );
};

export default VerticalStepper;
