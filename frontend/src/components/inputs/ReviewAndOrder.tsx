import React, {useState} from 'react';
import {
  Product,
  SuperDrugCredential,
  TopCashbackCredential,
  Address,
  OrderType,
  useAutomation
} from "../../context/AutomationContext";
import Button from "../Button";
import OrderModal from "../OrderModal";


function generateOrdersArray(
  totalOrders: number,
  products: Product[],
  selectedSuperDrugCredentials: SuperDrugCredential[],
  selectedTopCashbackCredentials: TopCashbackCredential[],
  selectedCouponCodes: string[],
  selectedShippingAddresses: Address[],
  selectedBillingAddresses: Address[]
): OrderType[] {
  const orders: OrderType[] = [];

  for (let i = 0; i < totalOrders; i++) {
    orders.push({
      products: products,
      superDrugCredential: selectedSuperDrugCredentials[i],
      topCashbackCredential: selectedTopCashbackCredentials[0],
      couponCode: i < selectedCouponCodes.length ? selectedCouponCodes[i] : "",
      shippingAddress: selectedShippingAddresses[0],
      billingAddress: selectedBillingAddresses[0],
    });
  }

  return orders;
}

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
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);

  const orders = generateOrdersArray(totalOrders, products, selectedSuperDrugCredentials, selectedTopCashbackCredentials, selectedCouponCodes, selectedShippingAddresses, selectedBillingAddresses);

  const onClose = () => {
    setSelectedOrder(null);
    setIsModalOpen(false);
  }

  const onOpen = (order: OrderType) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  }

  const renderOrderCard = (order: OrderType, orderNumber: number) => {
    const {topCashbackCredential, superDrugCredential, shippingAddress, billingAddress, products, couponCode} = order;
    return (
      <div key={orderNumber}
           className="bg-deep-black-2 p-6 rounded-lg mb-4 text-soft-white hover:bg-deep-black transition-colors duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-bold mb-2">Order #{orderNumber}</div>
          <Button
            onClick={() => onOpen(order)}
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
          {/*<div>*/}
          {/*  <h4 className="font-semibold text-green-400">Billing Address:</h4>*/}
          {/*  <p>{`${billingAddress.firstName} ${billingAddress.lastName}`}</p>*/}
          {/*  <p>{billingAddress.addressLine1}</p>*/}
          {/*  <p>{billingAddress.addressLine2}</p>*/}
          {/*  <p>{`${billingAddress.city}, ${billingAddress.postCode}`}</p>*/}
          {/*</div>*/}
          <div>
            <h4 className="font-semibold text-green-400">Superdrug Credentials:</h4>
            <p>Email: {superDrugCredential.email}</p>
            <p>Password: {superDrugCredential.password}</p>
          </div>

          <div>
            <h4 className="font-semibold text-green-400">TopCashback Credentials:</h4>
            <p>Email: {topCashbackCredential.email}</p>
            <p>Password: {topCashbackCredential.password}</p>
          </div>

          <div>
            <h4 className="font-semibold text-green-400">Coupon Code:</h4>
            <p>{couponCode || 'None'}</p>
          </div>
        </div>
        <div className="mt-4">
          <h4 className="font-semibold text-green-400">Products:</h4>
          <ul className="list-inside list-decimal space-y-1">
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
        {orders.map((order, index) => renderOrderCard(order, index + 1))}
      </div>
      {isModalOpen && selectedOrder && (
        <OrderModal onClose={onClose} order={selectedOrder}/>
      )}
    </>
  );
};

export default ReviewAndOrder;