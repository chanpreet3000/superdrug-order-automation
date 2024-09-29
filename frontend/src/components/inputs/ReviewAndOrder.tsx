import React, {useState} from 'react';
import {useAutomation} from "../../context/AutomationContext";
import Button from "../Button";
import OrderModal from "../OrderModal";

const ReviewAndOrder: React.FC = () => {
  const {
    totalOrders,
    products,
    selectedSuperDrugCredentials,
    selectedTopCashbackCredentials,
    selectedCouponCodes,
    selectedShippingAddresses,
    selectedBillingAddresses,
  } = useAutomation();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const renderOrderCard = (orderNumber: number) => {
    const superDrugCredential = selectedSuperDrugCredentials[orderNumber - 1];
    const shippingAddress = selectedShippingAddresses[0];
    const billingAddress = selectedBillingAddresses[0];

    return (
      <div key={orderNumber}
           className="bg-deep-black-2 p-6 rounded-lg mb-4 text-soft-white hover:bg-deep-black transition-colors duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-bold mb-2">Order #{orderNumber}</div>
          <Button
            onClick={() => setIsModalOpen(true)}
          >
            Place Order
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-green-400">Shipping Address:</h4>
            <p>{`${shippingAddress.firstName} ${shippingAddress.lastName}`}</p>
            <p>{shippingAddress.addressLine1}</p>
            <p>{shippingAddress.addressLine2}</p>
            <p>{`${shippingAddress.city}, ${shippingAddress.postCode}`}</p>
          </div>

          <div>
            <h4 className="font-semibold text-green-400">Billing Address:</h4>
            <p>{`${billingAddress.firstName} ${billingAddress.lastName}`}</p>
            <p>{billingAddress.addressLine1}</p>
            <p>{billingAddress.addressLine2}</p>
            <p>{`${billingAddress.city}, ${billingAddress.postCode}`}</p>
          </div>
          <div>
            <h4 className="font-semibold text-green-400">Superdrug Credentials:</h4>
            <p>Email: {superDrugCredential.email}</p>
            <p>Password: {superDrugCredential.password}</p>
          </div>

          <div>
            <h4 className="font-semibold text-green-400">TopCashback Credentials:</h4>
            <p>Email: {selectedTopCashbackCredentials[0].email}</p>
            <p>Password: {selectedTopCashbackCredentials[0].password}</p>
          </div>

          <div className="mt-4">
            <h4 className="font-semibold text-green-400">Coupon Code:</h4>
            <p>{selectedCouponCodes[orderNumber - 1] || 'None'}</p>
          </div>
        </div>
        <div className="mt-4">
          <h4 className="font-semibold text-green-400">Products:</h4>
          <ul className="list-disc list-inside">
            {products.map((product, index) => (
              <li key={index}>{`${product.url} (Quantity: ${product.quantity})`}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="max-w-4xl mx-auto">
        {Array.from({length: totalOrders}, (_, i) => renderOrderCard(i + 1))}
      </div>
      {isModalOpen && (
        <OrderModal setIsModelOpen={setIsModalOpen}/>
      )}
    </>
  );
};

export default ReviewAndOrder;