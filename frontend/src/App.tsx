import React from 'react';
import Navbar from "./Navbar";
import {FaArrowLeft, FaArrowRight} from "react-icons/fa";
import {Toaster} from "react-hot-toast";
import {Divider} from "./utils";
import {useAutomation} from "./context/AutomationContext";

function App() {
  const {getCurrentStepName, getCurrentStepComponent, currentStep, setCurrentStep} = useAutomation();

  return (
    <div className="h-screen bg-deep-black flex flex-col gap-8 text-white p-8 items-center">
      <Navbar/>
      <Toaster position="top-center"/>
      <div className="rounded-2xl bg-deep-black-1 flex-1 w-[80%] h-full flex flex-col overflow-hidden">
        <div>
          <div className="w-full py-4 px-8 bg-deep-black-1 flex justify-between items-center">
            <FaArrowLeft
              size={16}
              className="cursor-pointer"
              style={{
                visibility: currentStep === 0 ? 'hidden' : 'visible'
              }}
              onClick={() => {
                setCurrentStep((prevStep) => prevStep - 1);
              }}
            />
            <div className="font-bold text-xl">{getCurrentStepName()}</div>
            <FaArrowRight size={16} className="invisible"/>
          </div>
          <Divider height="1px" color="#ffffffcc"/>
        </div>
        <div className="w-full flex-1 custom-scrollbar overflow-y-scroll p-8">
          {getCurrentStepComponent()}
        </div>
      </div>
    </div>
  );
}

export default App;