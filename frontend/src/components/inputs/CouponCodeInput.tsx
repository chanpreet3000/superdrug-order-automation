import React, {useState, useEffect} from 'react';
import {MdDelete} from 'react-icons/md';
import {axiosApi} from "../../axios";
import {Spinner} from "../../utils";
import Button from "../Button";
import useToast from "../useToast";
import {useAutomation} from "../../context/AutomationContext";

const CouponCodeInput: React.FC = () => {
  const [coupons, setCoupons] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [newCoupons, setNewCoupons] = useState<string>('');
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

  const saveCoupons = async () => {
    if (!newCoupons.trim()) {
      showErrorToast('Please enter at least one coupon code');
      return;
    }
    setIsLoading(true);
    const couponsArray = newCoupons.split('\n').filter(coupon => coupon.trim() !== '');

    axiosApi.post('/coupons', {codes: couponsArray})
      .then((response) => {
        setNewCoupons('');
        fetchCoupons();
        showSuccessToast(response.data.message);
      })
      .catch((error) => {
        console.error('Error saving coupons:', error);
        showErrorToast(`Failed to save coupons: ${error.response?.data?.message || error.message}`);
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
    setSelectedCouponCode(prevSelected => prevSelected === coupon ? '' : coupon);
  };

  const handleNextStep = () => {
    const selectedCoupon = selectedCouponCode || 'None';
    showSuccessToast('Selected Coupon: ' + selectedCoupon);
    setCurrentStep(prev => prev + 1);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  if (isLoading) {
    return <Spinner/>;
  }

  return (
    <div className="flex flex-row gap-8 fade-in">
      <div className="flex flex-col gap-4 flex-[4]">
        <div className="font-bold text-lg">Add New Coupon Codes</div>
        <div className="flex flex-col gap-4">
          <label htmlFor="newCoupons" className="text-sm font-medium text-soft-white">
            Coupon Codes (one per line)
          </label>
          <textarea
            id="newCoupons"
            className="px-3 py-2 bg-deep-black-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={newCoupons}
            onChange={(e) => setNewCoupons(e.target.value)}
            placeholder="Enter coupon codes, one per line"
            rows={10}
          />
          <Button onClick={saveCoupons}>
            Save Coupons
          </Button>
        </div>
      </div>
      <div className="w-full flex gap-4 flex-col flex-[6]">
        <div className="text-soft-white">
          Selected Coupon: {selectedCouponCode || 'None'}
        </div>
        {coupons.length === 0 && <div className="text-soft-white">No Coupons Found. Please add one.</div>}
        <div className="w-full grid grid-cols-3 gap-2">
          {coupons.map((coupon, index) => (
            <div
              key={index}
              className={`flex bg-deep-black-2 rounded-xl p-4 justify-between items-center transition-colors duration-200 gap-6 cursor-pointer ${
                selectedCouponCode === coupon ? 'bg-lime-green' : ''
              }`}
              onClick={() => handleSelection(coupon)}
            >
              <div className="text-soft-white">{coupon}</div>
              <MdDelete
                size={20}
                className="text-red-700 cursor-pointer flex-shrink-0 flex-grow-0"
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