import React, {useState} from 'react';
import {Product, useAutomation} from "../../context/AutomationContext";
import useToast from "../useToast";
import Button from "../Button";

const ProductInput = () => {
  const {products, setProducts, setCurrentStep} = useAutomation();
  const defaultValue = products.map(product => `${product.url} ${product.quantity}`).join('\n');
  const [inputValue, setInputValue] = useState(defaultValue);
  const {showSuccessToast, showErrorToast} = useToast();

  const parseInput = (input: string) => {
    const lines = input.trim().split('\n');
    return lines.map(line => {
      const [url, quantityStr] = line.split(' ');
      const quantity = parseInt(quantityStr, 10);
      return {url, quantity};
    });
  };

  const validate = (parsedProducts: Product[]): boolean => {
    for (const product of parsedProducts) {
      if (!product.url || !product.url.startsWith('https://www.superdrug.com')) {
        showErrorToast('Invalid URL. All URLs must start with https://www.superdrug.com');
        return false;
      }
      if (isNaN(product.quantity) || product.quantity < 1) {
        showErrorToast('Invalid quantity. All quantities must be positive integers.');
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    const parsedProducts = parseInput(inputValue);
    if (validate(parsedProducts)) {
      setProducts(parsedProducts);
      showSuccessToast('Products added successfully');
      setCurrentStep((prevStep) => prevStep + 1);
    }
  };

  return (
    <div className="flex justify-center mt-16 fade-in">
      <div className="flex flex-col gap-6 w-[60%]">
        <div>
          <label htmlFor="productInput" className="block text-sm font-medium mb-1">
            Enter products (one per line, URL followed by quantity):
          </label>
          <textarea
            id="productInput"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full px-3 bg-deep-black-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={10}
            placeholder="https://superdrug.com/link1 2&#10;https://superdrug.com/link2 3"
          />
        </div>
        <Button
          onClick={handleNextStep}
          className="w-full"
        >
          Next Step
        </Button>
      </div>
    </div>
  );
};

export default ProductInput;