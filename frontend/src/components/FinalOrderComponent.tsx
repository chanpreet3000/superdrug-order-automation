import React, {useEffect, useState} from 'react';
import {OrderType} from "../context/AutomationContext";
import {Spinner} from "../utils";
import {axiosApi} from "../axios";
import {IoMdCloseCircleOutline} from "react-icons/io";
import {PiConfettiBold} from "react-icons/pi";
import Button from "./Button";

interface Props {
  onClose: () => void;
  order: OrderType;
}

const FinalOrderComponent = ({order, onClose}: Props) => {
  const {
    shippingAddress,
    superDrugCredential,
    topCashbackCredential,
    couponCode,
    products
  } = order;

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>();
  const [error, setError] = useState<any>(true);

  const startBot = async () => {
    setIsLoading(true);
    axiosApi.post('/process-order', {
      superdrugCredentials: order.superDrugCredential,
      topCashbackCredentials: order.topCashbackCredential,
      products: order.products,
      couponCode: order.couponCode,
      shippingDetails: order.shippingAddress,
      cardDetails: order.cardDetails,
    })
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        setError(error.response.data);
      })
      .finally(() => {
        setIsLoading(false);
      });

  }
  useEffect(() => {
    startBot();
  }, [])


  return (
    <div className="p-4 relative w-full flex flex-row gap-16 ">
      <div className="flex-1">
        <div className="text-2xl font-bold">Order Details</div>
        <div className="grid grid-cols-1 gap-4 mt-4">
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
          <div>
            <h4 className="font-semibold text-green-400">Card Details:</h4>
            <p>Name: {order.cardDetails ? order.cardDetails.name : 'None'}</p>
            <p>Number: {order.cardDetails ? order.cardDetails.number : 'None'}</p>
            <div>
              <span>Expires: </span>
              <span>{order.cardDetails ? order.cardDetails.expiryMonth : 'None'}/</span>
              <span>{order.cardDetails ? order.cardDetails.expiryYear : 'None'}</span>
            </div>
            <p>CVV: {order.cardDetails ? order.cardDetails.cvv : 'None'}</p>
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
      <div className="flex-1 flex flex-col gap-4">
        <div className="text-2xl font-bold text-center">Order Status</div>
        {
          isLoading ?
            (
              <div className="flex flex-col items-center gap-4">
                <div>To go back or quit, just close the browser.</div>
                <Spinner/>
              </div>
            )
            :
            (
              error ?
                (
                  <div className="flex flex-col gap-8 items-center">
                    <div
                      className="w-full flex flex-col gap-2 items-center bg-red-600 rounded-2xl p-4 text-center fade-in">
                      <IoMdCloseCircleOutline size={70}/>
                      <div>Error processing order</div>
                      <div>{error.message ?? 'Something else went wrong. Please contact developer.'} </div>
                      <div>{error.error_message ?? 'Something else went wrong. Please contact developer.'} </div>
                    </div>
                    <Button onClick={() => onClose()}>Close Modal</Button>
                  </div>
                )
                :
                (
                  <div className="flex flex-col gap-8 items-center">
                    <div
                      className="w-full flex flex-col gap-2 items-center bg-green-600 rounded-2xl p-4 text-center fade-in">
                      <PiConfettiBold size={70}/>
                      <div>Order Placed Successfully</div>
                      <div>Order ID: {data?.data ?? 'No ID Found'}</div>
                    </div>
                    <Button onClick={() => onClose()}>Close Modal</Button>
                  </div>
                )
            )
        }

      </div>
    </div>
  );
};

export default FinalOrderComponent;