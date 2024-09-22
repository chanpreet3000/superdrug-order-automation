import React, {useState} from 'react';
import Navbar from "./Navbar";

interface Step {
  name: string;
  component: React.ReactNode;
}

const steps: Step[] = [{
  name: 'Step 1',
  component: <div>
    <div>Step1</div>
  </div>,
}, {
  name: 'Step 2',
  component: <div>Step 2</div>,
}, {
  name: 'Step 3',
  component: <div>Step 3</div>,
}, {
  name: 'Step 4',
  component: <div>Step 4</div>,
}, {
  name: 'Step 5',
  component: <div>Step 5</div>,
}];

function App() {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div className="min-h-screen bg-deep-black flex flex-col gap-8 text-white p-8">
      <Navbar/>
      <div className="flex-1 p-8 flex flex-row gap-8 w-full">
        <div className="flex flex-col w-[250px] rounded-xl gap-4 ">
          {steps.map((step, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className="w-full rounded-lg py-2.5 text-sm font-medium leading-5 bg-lime-green text-soft-white"
              style={{
                backgroundColor: currentStep === index ? '#f7f7ff' : currentStep > index ? '#2AC416' : '#1f2525',
                color: currentStep === index ? '#1f2525' : currentStep > index ? '#f7f7ff' : '#f7f7ff',
                transition: 'all 0.3s ease',
                transform: currentStep === index ? 'translateX(5%)' : '',
                fontWeight: currentStep === index ? 'bold' : 'normal',
              }}
            >
              {step.name}
            </button>
          ))}
        </div>
        <div className="h-full flex-grow-0 bg-deep-black-1 w-full rounded-xl p-6">
          {steps.map((step, index) => {
            if (currentStep === index) {
              return step.component;
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
}

export default App;