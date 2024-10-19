import React, {useEffect, useState} from 'react';
import {axiosApi} from "../axios";
import useToast from "./useToast";
import {Spinner} from "../utils";

interface OrderDetailsType {
  superdrugCredentials: { email: string; password: string };
  topCashbackCredentials: { email: string; password: string };
  products: Array<{ url: string; quantity: number }>;
  couponCode: string;
  shippingDetails: {
    firstName: string;
    lastName: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    postCode: string;
    county: string;
    phone: string;
  };
  cardDetails: {
    number: string;
    name: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
  };
  orderDetails: string;
  timestamp: string;
  isStandardDelivery: boolean;
}

const OrderInfo = ({order}: { order: OrderDetailsType }) => {
  const [isClicked, setIsClicked] = useState(false);
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const {
    orderDetails,
    shippingDetails,
    superdrugCredentials,
    cardDetails,
    timestamp,
    products,
    topCashbackCredentials,
    couponCode
  } = order;
  return (
    <div className="bg-deep-black-1 p-6 rounded-xl flex flex-col gap-4 cursor-pointer"
         style={{
           transition: 'all 0.3s',
           border: isClicked ? '2px solid #10B981' : '2px solid transparent',
         }}
         onClick={() => setIsClicked((isClicked) => !isClicked)}>
      <div className="font-bold text-xl">Order Number: #{timestamp}</div>
      <div className="grid grid-cols-2 gap-4 ">
        <div>
          <h4 className="font-semibold text-green-400">Order Summary:</h4>
          {orderDetails.split('\n').map((line, i) => (
            <p key={i} className="text-white">{line}</p>
          ))}
        </div>
        <div>
          <h4 className="font-semibold text-green-400">Shipping Address:</h4>
          <p>{`${shippingDetails.firstName} ${shippingDetails.lastName}`}</p>
          <p>{shippingDetails.addressLine1}</p>
          <p>{shippingDetails.addressLine2}</p>
          <p>{`${shippingDetails.city}, ${shippingDetails.postCode}`}</p>
        </div>
        {isClicked &&
          <>
            <div>
              <h4 className="font-semibold text-green-400">Superdrug Credentials:</h4>
              <p>Email: {superdrugCredentials.email}</p>
              <p>Password: {superdrugCredentials.password}</p>
            </div>

            <div>
              <h4 className="font-semibold text-green-400">TopCashback Credentials:</h4>
              <p>Email: {topCashbackCredentials.email}</p>
              <p>Password: {topCashbackCredentials.password}</p>
            </div>

            <div>
              <h4 className="font-semibold text-green-400">Coupon Code:</h4>
              <p>{couponCode || 'None'}</p>
            </div>

            <div>
              <h4 className="font-semibold text-green-400">Card Details:</h4>
              <p className="text-white">Card Number: {cardDetails.number}</p>
              <p className="text-white">Name on Card: {cardDetails.name}</p>
              <p className="text-white">Expiry: {cardDetails.expiryMonth}/{cardDetails.expiryYear}</p>
            </div>
            <div>
              <h4 className="font-semibold text-green-400">Delivery Option:</h4>
              <p className="text-white">{order.isStandardDelivery ? 'Standard' : 'Next-day'}</p>
            </div>
            <div className="mt-4">
              <h4 className="font-semibold text-green-400">Timestamp:</h4>
              <p className="text-white">{formatDate(timestamp)}</p>
            </div>
            <div>
              <h4 className="font-semibold text-green-400">Products:</h4>
              <ul className="list-inside list-decimal space-y-1">
                {products.map((product, index) => (
                  <li key={index}>{`${product.url} (Quantity: ${product.quantity})`}</li>
                ))}
              </ul>
            </div>
          </>
        }
      </div>
    </div>
  );
}

const OrderDetails = () => {
  const [orderDetails, setOrderDetails] = useState<OrderDetailsType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const {showErrorToast} = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    await axiosApi.get('/order_details')
      .then((response) => {
        setOrderDetails(response.data)
      })
      .catch((error) => {
        showErrorToast(error.message ?? 'An error occurred');
      }).finally(() => {
        setIsLoading(false);
      })
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    isLoading ?
      <Spinner/>
      :
      (
        <div className="flex flex-col gap-4">
          {
            orderDetails.map((order, index) => <OrderInfo order={order} key={index}/>)
          }
        </div>
      )
  )
};

export default OrderDetails;