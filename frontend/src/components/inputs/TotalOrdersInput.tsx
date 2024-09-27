import React, {useState, useEffect} from 'react';
import Button from '../Button';
import {useAutomation} from "../../context/AutomationContext";
import Input from "../Input";
import useToast from "../useToast";

const TotalOrdersInput = () => {
  const {totalOrders, setTotalOrders, setCurrentStep} = useAutomation();
  const [inputValue, setInputValue] = useState(totalOrders.toString());
  const {showSuccessToast, showErrorToast} = useToast();


  useEffect(() => {
    if (totalOrders === 0) {
      setTotalOrders(1);
    }
  }, []);


  const validate = (): boolean => {
    if (inputValue === '') {
      showErrorToast('Please enter a valid positive integer');
      return false;
    }

    const parsedValue = parseInt(inputValue, 10);
    if (isNaN(parsedValue) || !Number.isInteger(parsedValue) || parsedValue < 1) {
      showErrorToast('Please enter a valid positive integer');
      return false;
    } else {
      showSuccessToast('Total orders set successfully');
      return true;
    }
  }

  const handleNextStep = () => {
    if (validate()) {
      setTotalOrders(parseInt(inputValue, 10));
      setCurrentStep((prevStep) => prevStep + 1);
    }
  };

  return (
    <div className="flex justify-center mt-16 fade-in">
      <div className="flex flex-col gap-6 w-[40%]">
        <Input
          label="How many orders would you like to place?"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          id="totalOrders"
          type="number"
          min="1"
          step="1"
        />
        <Button
          onClick={() => handleNextStep()}
          className="w-full"
        >
          Next Step
        </Button>
      </div>
    </div>
  );
};

export default TotalOrdersInput;