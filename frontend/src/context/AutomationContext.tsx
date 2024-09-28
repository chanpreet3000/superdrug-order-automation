import React, {createContext, useState, useContext, ReactNode} from 'react';
import SuperDrugCredentialsInput from "../components/inputs/SuperDrugCredentialsInput";
import TotalOrdersInput from "../components/inputs/TotalOrdersInput";
import ProductInput from "../components/inputs/ProductInput";
import TopCashbackCredentialsInput from "../components/inputs/TopCashbackCredentialsInput";
import CouponCodeInput from "../components/inputs/CouponCodeInput";
import CardDetailsInput from "../components/inputs/CardDetailsInput";
import ShippingAddressInput from "../components/inputs/ShippingAddressInput";

export type Product = {
  url: string;
  quantity: number;
};

export type SuperDrugCredential = {
  email: string;
  password: string;
};

export type TopCashbackCredential = {
  email: string;
  password: string;
};

export type Address = {
  id: string;
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postCode: string;
  county: string;
  phone: string;
};

export type CardDetails = {
  number: string;
  name: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
};

interface AutomationContextType {
  totalOrders: number;
  setTotalOrders: React.Dispatch<React.SetStateAction<number>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  selectedSuperDrugCredentials: SuperDrugCredential[];
  setSelectedSuperDrugCredentials: React.Dispatch<React.SetStateAction<SuperDrugCredential[]>>;
  selectedTopCashbackCredentials: TopCashbackCredential[];
  setSelectedTopCashbackCredentials: React.Dispatch<React.SetStateAction<TopCashbackCredential[]>>;
  selectedCouponCode: string;
  setSelectedCouponCode: React.Dispatch<React.SetStateAction<string>>;
  selectedAddresses: Address[];
  setSelectedAddresses: React.Dispatch<React.SetStateAction<Address[]>>;
  selectedCardDetails: CardDetails[];
  setSelectedCardDetails: React.Dispatch<React.SetStateAction<CardDetails[]>>;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  getCurrentStepComponent: () => React.ReactNode;
  getCurrentStepName: () => string;
  totalSteps: number;
}

interface Steps {
  name: string;
  component: React.FC;
}

const steps: Steps[] = [
  {
    'name': 'Total Orders',
    'component': TotalOrdersInput
  },
  {
    'name': 'Product Url & Quantities',
    'component': ProductInput
  },
  {
    'name': 'Superdrug Credentials',
    'component': SuperDrugCredentialsInput
  },
  {
    'name': 'Top Cashback Credentials',
    'component': TopCashbackCredentialsInput
  },
  {
    'name': 'Superdrug Coupon Code',
    'component': CouponCodeInput
  },
  {
    'name': 'Card Details',
    'component': CardDetailsInput
  },
  {
    'name': 'Shipping Address',
    'component': ShippingAddressInput
  },
  {
    'name': 'Billing Address',
    'component': () => <></>
  },
  {
    'name': 'Review & Submit',
    'component': () => <></>
  }
]

// Create the context
const AutomationContext = createContext<AutomationContextType>({
  totalOrders: 1,
  setTotalOrders: () => {
  },
  products: [],
  setProducts: () => {
  },
  selectedSuperDrugCredentials: [],
  setSelectedSuperDrugCredentials: () => {
  },
  selectedTopCashbackCredentials: [],
  setSelectedTopCashbackCredentials: () => {
  },
  selectedCouponCode: '',
  setSelectedCouponCode: () => {
  },
  selectedAddresses: [],
  setSelectedAddresses: () => {
  },
  selectedCardDetails: [],
  setSelectedCardDetails: () => {
  },
  currentStep: 0,
  setCurrentStep: () => {
  },
  getCurrentStepComponent: () => <></>,
  getCurrentStepName: () => '',
  totalSteps: steps.length
});

// Create a provider component
export const AutomationProvider: React.FC<{ children: ReactNode }> = ({children}) => {
  const [totalOrders, setTotalOrders] = useState<number>(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSuperDrugCredentials, setSelectedSuperDrugCredentials] = useState<SuperDrugCredential[]>([]);
  const [selectedTopCashbackCredentials, setSelectedTopCashbackCredentials] = useState<TopCashbackCredential[]>([]);
  const [selectedCouponCode, setSelectedCouponCode] = useState<string>('');
  const [selectedAddresses, setSelectedAddresses] = useState<Address[]>([]);
  const [selectedCardDetails, setSelectedCardDetails] = useState<CardDetails[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);

  const getCurrentStepComponent = () => {
    const StepComponent = steps[currentStep].component;
    return <StepComponent/>;
  }

  const getCurrentStepName = () => {
    return steps[currentStep].name;
  }
  const value = {
    totalOrders,
    setTotalOrders,
    products,
    setProducts,
    selectedSuperDrugCredentials,
    setSelectedSuperDrugCredentials,
    selectedTopCashbackCredentials,
    setSelectedTopCashbackCredentials,
    selectedCouponCode,
    setSelectedCouponCode,
    selectedAddresses,
    setSelectedAddresses,
    selectedCardDetails,
    setSelectedCardDetails,
    currentStep,
    setCurrentStep,
    getCurrentStepComponent,
    getCurrentStepName,
    totalSteps: steps.length
  };

  return (
    <AutomationContext.Provider value={value}>
      {children}
    </AutomationContext.Provider>
  );
};

export const useAutomation = () => {
  return useContext(AutomationContext);
};