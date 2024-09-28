import React, {useEffect, useState} from 'react';
import {axiosApi} from "../../axios";
import {MdDelete} from "react-icons/md";
import {Spinner} from "../../utils";
import Input from "../Input";
import Button from "../Button";
import useToast from "../useToast";
import {useAutomation} from "../../context/AutomationContext";

const CouponCodeInput: React.FC = () => {
  const [coupons, setCoupons] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [newCoupon, setNewCoupon] = useState<string>('');
  const {showSuccessToast, showErrorToast} = useToast();
  const {
    selectedCouponCode,
    setSelectedCouponCode,
    setCurrentStep
  } = useAutomation();

  const fetchCoupons = () => {
    setIsLoading(true);
    axiosApi.get('/coupons')
      .then((response: any) => {
        setCoupons(response.data);
      })
      .catch((error: any) => {
        console.error('Error fetching coupons:', error);
        showErrorToast('Failed to fetch coupons');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const saveCoupon = async () => {
    if (!newCoupon) {
      showErrorToast('Please enter a coupon code');
      return;
    }
    setIsLoading(true);
    axiosApi.post('/coupons', {code: newCoupon})
      .then(() => {
        setNewCoupon('');
        fetchCoupons();
        showSuccessToast('Coupon saved successfully');
      })
      .catch((error: any) => {
        console.error('Error saving coupon:', error);
        showErrorToast(`${error.response.data.error}`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const deleteCoupon = async (code: string) => {
    setIsLoading(true);
    axiosApi.delete(`/coupons/${code}`)
      .then(() => {
        if (selectedCouponCode === code) {
          setSelectedCouponCode('');
        }
        fetchCoupons();
        showSuccessToast('Coupon deleted successfully');
      })
      .catch((error: any) => {
        console.error('Error deleting coupon:', error);
        showErrorToast('Failed to delete coupon');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleSelection = (coupon: string) => {
    setSelectedCouponCode(coupon);
  };

  const handleNextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  if (isLoading) {
    return <Spinner/>;
  }

  return (
    <div className="flex flex-row gap-16 fade-in">
      <div className="flex flex-col gap-4 w-[40%]">
        <div className="font-bold text-lg">Add New Coupon Code</div>
        <div className="flex flex-col gap-4">
          <Input
            label="Coupon Code"
            type="text"
            placeholder="Enter coupon code"
            value={newCoupon}
            onChange={(e) => setNewCoupon(e.target.value)}
          />
          <Button onClick={saveCoupon}>
            Save
          </Button>
        </div>
      </div>
      <div className="w-full flex gap-4 flex-col">
        <div>
          Selected Coupon: {selectedCouponCode || 'None'}
        </div>
        {coupons.length === 0 && <div>No Coupons Found. Please add one.</div>}
        <div className="w-full flex gap-4 flex-wrap flex-row">
          {coupons.map((coupon, index) => (
            <div
              key={index}
              className='flex bg-deep-black-2 rounded-xl p-4 px-6 justify-between items-center transition-colors duration-200 gap-6 cursor-pointer'
              style={{
                backgroundColor: selectedCouponCode === coupon ? '#10b427' : ''
              }}
              onClick={() => handleSelection(coupon)}
            >
              <div>{coupon}</div>
              <MdDelete
                size={24}
                className="text-red-700 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteCoupon(coupon);
                }}
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
  );
};

export default CouponCodeInput;