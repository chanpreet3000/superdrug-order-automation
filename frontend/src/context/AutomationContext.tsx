import React, {createContext, useState, useContext, ReactNode} from 'react';
import SuperDrugCredentialsInput from "../components/inputs/SuperDrugCredentialsInput";
import TotalOrdersInput from "../components/inputs/TotalOrdersInput";
import ProductInput from "../components/inputs/ProductInput";
import TopCashbackCredentialsInput from "../components/inputs/TopCashbackCredentialsInput";
import CouponCodeInput from "../components/inputs/CouponCodeInput";
import ShippingAddressInput from "../components/inputs/ShippingAddressInput";
import ReviewAndOrder from "../components/inputs/ReviewAndOrder";

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
export type DeliveryOption = 'standard' | 'next-day';

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
  used: number;
};

export type OrderType = {
  products: Product[];
  superDrugCredential: SuperDrugCredential;
  topCashbackCredential: TopCashbackCredential;
  couponCode: string;
  shippingAddress: Address;
  billingAddress: Address;
  cardDetails?: CardDetails;
  deliveryOption: DeliveryOption;
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
  selectedCouponCodes: string[];
  setSelectedCouponCodes: React.Dispatch<React.SetStateAction<string[]>>;
  selectedShippingAddresses: Address[];
  setSelectedShippingAddresses: React.Dispatch<React.SetStateAction<Address[]>>;
  selectedBillingAddresses: Address[];
  setSelectedBillingAddresses: React.Dispatch<React.SetStateAction<Address[]>>;
  selectedCardDetails: CardDetails[];
  setSelectedCardDetails: React.Dispatch<React.SetStateAction<CardDetails[]>>;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  getCurrentStepComponent: () => React.ReactNode;
  getCurrentStepName: () => string;
  totalSteps: number;
  selectedDeliveryOptions: DeliveryOption[];
  setSelectedDeliveryOptions: React.Dispatch<React.SetStateAction<DeliveryOption[]>>;
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
    'name': 'Shipping Address',
    'component': ShippingAddressInput
  },
  {
    'name': 'Review & Order',
    'component': ReviewAndOrder
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
  selectedCouponCodes: [],
  setSelectedCouponCodes: () => {
  },
  selectedShippingAddresses: [],
  setSelectedShippingAddresses: () => {
  },
  selectedBillingAddresses: [],
  setSelectedBillingAddresses: () => {
  },
  selectedCardDetails: [],
  setSelectedCardDetails: () => {
  },
  currentStep: 0,
  setCurrentStep: () => {
  },
  getCurrentStepComponent: () => <></>,
  getCurrentStepName: () => '',
  totalSteps: steps.length,
  selectedDeliveryOptions: [],
  setSelectedDeliveryOptions: () => {
  },
});

// Create a provider component
export const AutomationProvider: React.FC<{ children: ReactNode }> = ({children}) => {
  const [totalOrders, setTotalOrders] = useState<number>(1);
  const [products, setProducts] = useState<Product[]>([{
    url: 'https://www.superdrug.com/make-up/face/face-primer/elf-power-grip-primer/p/816693',
    quantity: 2
  }]);
  const [selectedSuperDrugCredentials, setSelectedSuperDrugCredentials] = useState<SuperDrugCredential[]>([]);
  const [selectedTopCashbackCredentials, setSelectedTopCashbackCredentials] = useState<TopCashbackCredential[]>([]);
  const [selectedCouponCodes, setSelectedCouponCodes] = useState<string[]>([]);
  const [selectedShippingAddresses, setSelectedShippingAddresses] = useState<Address[]>([]);
  const [selectedBillingAddresses, setSelectedBillingAddresses] = useState<Address[]>([]);
  const [selectedCardDetails, setSelectedCardDetails] = useState<CardDetails[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedDeliveryOptions, setSelectedDeliveryOptions] = useState<DeliveryOption[]>([]);

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
    selectedCouponCodes,
    setSelectedCouponCodes,
    selectedShippingAddresses,
    setSelectedShippingAddresses,
    selectedBillingAddresses,
    setSelectedBillingAddresses,
    selectedCardDetails,
    setSelectedCardDetails,
    currentStep,
    setCurrentStep,
    getCurrentStepComponent,
    getCurrentStepName,
    totalSteps: steps.length,
    selectedDeliveryOptions,
    setSelectedDeliveryOptions,
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