import React, {useEffect, useState} from 'react';
import {CardDetails, OrderType, useAutomation} from "../context/AutomationContext";
import Button from "./Button";
import Input from "./Input";
import Toggle from "./Toggle";
import {axiosApi} from "../axios";
import useToast from "./useToast";
import {Spinner} from "../utils";

interface Props {
  onPlaceOrder: (order: OrderType) => void;
}

const AllOrdersContainer = ({onPlaceOrder}: Props) => {
  const [cardDetails, setCardDetails] = useState<CardDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const {showErrorToast, showSuccessToast} = useToast();

  const {
    allOrders,
    setAllOrders
  } = useAutomation();

  const fetchCardDetails = () => {
    setIsLoading(true);
    axiosApi.get('/card_details')
      .then((response) => {
        setCardDetails(response.data);
      })
      .catch((error) => {
        console.error('Error fetching card details:', error);
        showErrorToast('Failed to fetch card details');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchCardDetails();
  }, []);

  if (isLoading) {
    return <Spinner/>;
  }

  const handleDeliveryOptionChange = (index: number, isNextDay: boolean) => {
    setAllOrders((prevOrders) => {
      const newOrders = [...prevOrders];
      newOrders[index].deliveryOption = isNextDay ? 'next-day' : 'standard';
      return newOrders;
    });
  };

  const handleCouponCodeChange = (index: number, couponCode: string) => {
    setAllOrders((prevOrders) => {
      const newOrders = [...prevOrders];
      newOrders[index].couponCode = couponCode;
      return newOrders;
    });
  }

  const handleCardChange = (index: number, cardNumber: string) => {
    const selectedCard = cardDetails.find(card => card.number === cardNumber) || null;
    setAllOrders((prevOrders) => {
      const newOrders = [...prevOrders];
      newOrders[index].cardDetails = selectedCard;
      return newOrders;
    });
    showSuccessToast('Card selected successfully');
  };

  const renderOrderCard = (order: OrderType, orderNumber: number) => {
    const {superDrugCredential, couponCode, deliveryOption, cardDetails: selectedCard} = order;
    return (
      <div key={orderNumber}
           className="bg-deep-black-2 p-6 rounded-lg mb-4 text-soft-white hover:bg-deep-black transition-colors duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xl font-bold mb-2">Order #{orderNumber}</div>
          <Button onClick={() => onPlaceOrder(order)} className="text-sm">
            Place Order
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-green-400">Superdrug Credentials:</h4>
            <p>Email: {superDrugCredential.email}</p>
            <p>Password: {superDrugCredential.password}</p>
          </div>

          <div>
            <h4 className="font-semibold text-green-400">Coupon Code:</h4>
            <Input
              label=""
              value={couponCode}
              onChange={(e) => handleCouponCodeChange(orderNumber - 1, e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-green-400">Delivery Option:</h4>
            <Toggle
              label="Next-day Delivery"
              checked={deliveryOption === 'next-day'}
              onChange={(isChecked) => handleDeliveryOptionChange(orderNumber - 1, isChecked)}
            />
          </div>

          <div>
            <h4 className="font-semibold text-green-400">Select Card:</h4>
            <select
              value={selectedCard?.number || ''}
              onChange={(e) => handleCardChange(orderNumber - 1, e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-deep-black-1 text-soft-white"
            >
              {cardDetails.map((card) => (
                <option key={card.number} value={card.number}>
                  {card.number.slice(-4)} - {card.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-row gap-2 justify-between items-center">
        <h2 className="font-semibold text-green-400 text-2xl">All Orders</h2>
        <div
          className="text-sm text-soft-white font-semibold py-3 px-4 rounded-xl flex gap-1 items-center bg-lime-green cursor-pointer ">Re-fetch
          Card Details
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {allOrders.map((order, index) => renderOrderCard(order, index + 1))}
      </div>

    </div>
  );
};

export default AllOrdersContainer;