import React, {createContext, useState, useContext, ReactNode, useEffect} from 'react';
import SuperDrugCredentialsInput from "../components/inputs/SuperDrugCredentialsInput";
import TotalOrdersInput from "../components/inputs/TotalOrdersInput";
import ProductInput from "../components/inputs/ProductInput";
import TopCashbackCredentialsInput from "../components/inputs/TopCashbackCredentialsInput";
import CouponCodeInput from "../components/inputs/CouponCodeInput";
import ShippingAddressInput from "../components/inputs/ShippingAddressInput";
import ReviewAndOrder from "../components/inputs/ReviewAndOrder";
import {axiosApi} from "../axios";
import useToast from "../components/useToast";

export type Product = {
  url: string;
  quantity: number;
};

export type Credentials = {
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
  uid: string;
  superDrugCredential: Credentials;
  couponCode: string;
  cardDetails: CardDetails | null;
  deliveryOption: DeliveryOption;
};

export type ResultType = {
  uid: string;
  result: 'error' | 'success' | 'in-progress';
  message: string;
}

interface AutomationContextType {
  totalOrders: number;
  setTotalOrders: React.Dispatch<React.SetStateAction<number>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  selectedTopCashbackCredentials: Credentials | null;
  setSelectedTopCashbackCredentials: React.Dispatch<React.SetStateAction<Credentials | null>>;
  selectedShippingAddress: Address | null;
  setSelectedShippingAddress: React.Dispatch<React.SetStateAction<Address | null>>;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  getCurrentStepComponent: () => React.ReactNode;
  getCurrentStepName: () => string;
  totalSteps: number;
  allOrders: OrderType[];
  setAllOrders: React.Dispatch<React.SetStateAction<OrderType[]>>;
  results: ResultType[];
  setResults: React.Dispatch<React.SetStateAction<ResultType[]>>;
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
    'name': 'Top Cashback Credentials',
    'component': TopCashbackCredentialsInput
  },
  {
    'name': 'Superdrug Credentials',
    'component': SuperDrugCredentialsInput
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
  selectedTopCashbackCredentials: null,
  setSelectedTopCashbackCredentials: () => {
  },
  selectedShippingAddress: null,
  setSelectedShippingAddress: () => {
  },
  currentStep: 0,
  setCurrentStep: () => {
  },
  getCurrentStepComponent: () => <></>,
  getCurrentStepName: () => '',
  totalSteps: steps.length,
  allOrders: [],
  setAllOrders: () => {
  },
  results: [],
  setResults: () => {

  }
});

export const AutomationProvider: React.FC<{ children: ReactNode }> = ({children}) => {
  const [totalOrders, setTotalOrders] = useState<number>(1);
  const [products, setProducts] = useState<Product[]>([{
    url: 'https://www.superdrug.com/make-up/face/face-primer/elf-power-grip-primer/p/816693',
    quantity: 2
  }]);
  const [selectedTopCashbackCredentials, setSelectedTopCashbackCredentials] = useState<Credentials | null>(null);
  const [selectedShippingAddress, setSelectedShippingAddress] = useState<Address | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [allOrders, setAllOrders] = useState<OrderType[]>([]);
  const [cardDetails, setCardDetails] = useState<CardDetails[]>([]);
  const [results, setResults] = useState<ResultType[]>([])
  const {showErrorToast} = useToast();

  const fetchCardDetails = () => {
    axiosApi.get('/card_details')
      .then((response) => {
        setCardDetails(response.data);
      })
      .catch(() => {
        showErrorToast('Failed to fetch card details');
      });
  };

  useEffect(() => {
    fetchCardDetails();
  }, []);

  const generateUid = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  useEffect(() => {
    const orders = []
    for (let i = 0; i < totalOrders; i++) {
      orders.push({
        uid: generateUid(),
        superDrugCredential: {email: '', password: ''},
        couponCode: '',
        deliveryOption: 'standard',
        cardDetails: cardDetails ? cardDetails[0] : null
      } as OrderType);
    }
    setAllOrders(orders);
  }, [totalOrders, cardDetails])

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
    selectedTopCashbackCredentials,
    setSelectedTopCashbackCredentials,
    selectedShippingAddress,
    setSelectedShippingAddress,
    currentStep,
    setCurrentStep,
    getCurrentStepComponent,
    getCurrentStepName,
    totalSteps: steps.length,
    allOrders,
    setAllOrders,
    results,
    setResults
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