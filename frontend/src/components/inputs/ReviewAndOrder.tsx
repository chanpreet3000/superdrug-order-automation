import React, {useState} from 'react';
import {useAutomation} from "../../context/AutomationContext";
import AllOrdersContainer from "../AllOrdersContainer";
import Modal from "./Modal";
import FinalOrderComponent from "../FinalOrderComponent";

const ReviewAndOrder: React.FC = () => {
  const {
    products,
    selectedTopCashbackCredentials,
    selectedShippingAddress,
    allOrders
  } = useAutomation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderIndex, setSelectedOrderIndex] = useState<number | null>(null);

  const handleOrderSuccess = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedOrderIndex((prevIndex) => {
        if (prevIndex !== null && prevIndex < allOrders.length - 1) {
          return prevIndex + 1;
        }
        return null;
      });
      setIsModalOpen(true);
    }, 2 * 1000);
  };

  if (!selectedShippingAddress || !selectedTopCashbackCredentials) {
    return <>INVALID STATE</>;
  }

  return (
    <>
      <div className="flex flex-row gap-8">
        <div className="flex-1 space-y-4">
          <h4 className="font-semibold text-green-400 text-2xl">Common Data</h4>
          <div className="flex flex-col gap-4 bg-deep-black-2 p-4 rounded-xl">
            <div>
              <h4 className="font-semibold text-green-400"> TopCashback Credentials:</h4>
              <p>Email: {selectedTopCashbackCredentials.email}</p>
              <p>Password: {selectedTopCashbackCredentials.password}</p>
            </div>
            <div>
              <h4 className="font-semibold text-green-400">Shipping Address:</h4>
              <p>{`${selectedShippingAddress.firstName} ${selectedShippingAddress.lastName}`}</p>
              <p>{selectedShippingAddress.addressLine1}</p>
              <p>{selectedShippingAddress.addressLine2}</p>
              <p>{`${selectedShippingAddress.city}, ${selectedShippingAddress.postCode}`}</p>
            </div>
            <div>
              <h4 className="font-semibold text-green-400">Products:</h4>
              <ul className="list-inside list-decimal space-y-1">
                {products.map((product, index) => (
                  <li key={index}>{`${product.url} (Quantity: ${product.quantity})`}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-4 flex-[2]">
          <AllOrdersContainer onPlaceOrder={(orderIndex) => {
            setSelectedOrderIndex(orderIndex);
            setIsModalOpen(true);
          }}/>
        </div>
      </div>
      {isModalOpen && selectedOrderIndex !== null && (
        <Modal
          canClose={false}
        >
          <FinalOrderComponent
            order={allOrders[selectedOrderIndex]}
            orderIndex={selectedOrderIndex}
            onSuccessfulOrder={handleOrderSuccess}
            onClose={() => {
              setSelectedOrderIndex(null);
              setIsModalOpen(false);
            }}/>
        </Modal>
      )}
    </>
  );
};

export default ReviewAndOrder;