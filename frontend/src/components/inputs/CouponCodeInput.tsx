import React, {useState, useEffect} from 'react';
import {MdDelete} from 'react-icons/md';
import Button from "../Button";
import useToast from "../useToast";
import {useAutomation} from "../../context/AutomationContext";

const MultiCouponCodeInput = () => {
  const {allOrders, setAllOrders, setCurrentStep, totalOrders} = useAutomation();
  const defaultCouponCodes = allOrders.map((order) => order.couponCode).join('\n').trim();
  const [newCoupons, setNewCoupons] = useState(defaultCouponCodes);
  const {showSuccessToast, showErrorToast} = useToast();
  const couponList = newCoupons.split('\n').filter(coupon => coupon.trim() !== '');

  useEffect(() => {
    setAllOrders((prevOrders) => prevOrders.map((order, index) => ({
      ...order,
      couponCode: couponList[index] || ''
    })));
  }, [newCoupons]);

  const handleDeleteSingle = (index: number) => {
    const newCouponList = newCoupons.split('\n');
    newCouponList.splice(index, 1);
    setNewCoupons(newCouponList.join('\n'));
    showSuccessToast('Coupon code deleted');
  };

  const handleNextStep = () => {
    if (couponList.length <= totalOrders) {
      showSuccessToast('Coupon codes selected successfully');
      setCurrentStep(prev => prev + 1);
    } else {
      showErrorToast(`Please select atmost ${totalOrders} coupon codes`);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-row gap-8">
        <div className="flex flex-col gap-4 flex-[4]">
          <div className="flex flex-col">
            <label htmlFor="coupons" className="text-sm font-medium">
              Coupon Codes
            </label>
            <textarea
              id="coupons"
              className="px-3 py-2 bg-deep-black-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={newCoupons}
              onChange={(e) => setNewCoupons(e.target.value)}
              placeholder="Enter coupon codes, one per line"
              rows={12}
            />
          </div>
        </div>

        <div className="flex-[6] space-y-4">
          <div className="flex flex-col">
            <p className="text-lime-green">Required atmost {totalOrders} coupon codes</p>
            <p>{couponList.length} coupon code(s) entered</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {allOrders.filter((order)=>order.couponCode).map((order, index) => (
              <div key={index} className="flex justify-between items-center bg-deep-black-2 p-4 rounded-xl text-sm">
                <div className="flex-1 overflow-hidden">
                  <div>{order.couponCode}</div>
                </div>
                <MdDelete
                  size={20}
                  onClick={() => handleDeleteSingle(index)}
                  className="cursor-pointer text-red-500 w-5"
                />
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button onClick={handleNextStep}>
              Next Step
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiCouponCodeInput;