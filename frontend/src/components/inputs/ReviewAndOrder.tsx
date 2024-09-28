import React from 'react';
import useToast from '../useToast';
import {useAutomation} from "../../context/AutomationContext";
import Button from "../Button";

const ReviewAndOrder: React.FC = () => {
  const {
    totalOrders,
    products,
    selectedSuperDrugCredentials,
    selectedTopCashbackCredentials,
    selectedCouponCode,
    selectedShippingAddresses,
    selectedBillingAddresses,
    selectedCardDetails,
  } = useAutomation();

  const {showSuccessToast} = useToast();

  const handleOrder = (orderNumber: number) => {
    showSuccessToast(`Order #${orderNumber} placed successfully!`);
  };

  const renderOrderCard = (orderNumber: number) => {
    const superDrugCredential = selectedSuperDrugCredentials[orderNumber - 1];
    const cardDetailsIndex = Math.floor((orderNumber - 1) % selectedCardDetails.length);
    const cardDetails = selectedCardDetails[cardDetailsIndex];
    const shippingAddress = selectedShippingAddresses[0];
    const billingAddress = selectedBillingAddresses[0];

    return (
      <div key={orderNumber}
           className="bg-deep-black-2 p-6 rounded-lg mb-4 text-soft-white hover:bg-deep-black transition-colors duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-bold mb-2">Order #{orderNumber}</div>
          <Button
            onClick={() => handleOrder(orderNumber)}
          >
            Place Order
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-lime-green">Shipping Address:</h4>
            <p>{`${shippingAddress.firstName} ${shippingAddress.lastName}`}</p>
            <p>{shippingAddress.addressLine1}</p>
            <p>{shippingAddress.addressLine2}</p>
            <p>{`${shippingAddress.city}, ${shippingAddress.postCode}`}</p>
          </div>

          <div>
            <h4 className="font-semibold text-lime-green">Billing Address:</h4>
            <p>{`${billingAddress.firstName} ${billingAddress.lastName}`}</p>
            <p>{billingAddress.addressLine1}</p>
            <p>{billingAddress.addressLine2}</p>
            <p>{`${billingAddress.city}, ${billingAddress.postCode}`}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="mt-4">
            <h4 className="font-semibold text-lime-green">Superdrug Credentials:</h4>
            <p>Email: {superDrugCredential.email}</p>
          </div>

          <div className="mt-4">
            <h4 className="font-semibold text-lime-green">TopCashback Credentials:</h4>
            <p>Email: {selectedTopCashbackCredentials[0].email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="mt-4">
            <h4 className="font-semibold text-lime-green">Card Details:</h4>
            <p>Card Number &nbsp;&nbsp;: {cardDetails.number}</p>
            <p>Name on Card : {cardDetails.name}</p>
          </div>

          <div className="mt-4">
            <h4 className="font-semibold text-lime-green">Coupon Code:</h4>
            <p>{selectedCouponCode || 'None'}</p>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="font-semibold text-lime-green">Products:</h4>
          <ul>
            {products.map((product, index) => (
              <li key={index}>{`${product.url} (Quantity: ${product.quantity})`}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      {Array.from({length: totalOrders}, (_, i) => renderOrderCard(i + 1))}
    </div>
  );
};

export default ReviewAndOrder;