import React, {useEffect, useState} from 'react';
import {axiosApi} from "../../axios";
import {MdDelete} from "react-icons/md";
import {Spinner} from "../../utils";
import Input from "../Input";
import Button from "../Button";
import useToast from "../useToast";
import {Address, useAutomation} from "../../context/AutomationContext";

const ShippingAddressInput = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newAddress, setNewAddress] = useState({
    firstName: '',
    lastName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postCode: '',
    county: '',
    phone: ''
  });
  const {showSuccessToast, showErrorToast} = useToast();
  const {
    selectedShippingAddress,
    setSelectedShippingAddress,
    setCurrentStep
  } = useAutomation();

  const fetchAddresses = () => {
    setIsLoading(true);
    axiosApi.get('/shipping_addresses')
      .then((response) => {
        setAddresses(response.data);
      })
      .catch((error) => {
        console.error('Error fetching shipping addresses:', error);
        showErrorToast('Failed to fetch shipping addresses');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const saveAddress = async () => {
    if (!newAddress.firstName || !newAddress.lastName || !newAddress.addressLine1 || !newAddress.city || !newAddress.postCode || !newAddress.county || !newAddress.phone) {
      showErrorToast('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    axiosApi.post('/shipping_addresses', newAddress)
      .then(() => {
        setNewAddress({
          firstName: '',
          lastName: '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          postCode: '',
          county: '',
          phone: ''
        });
        fetchAddresses();
        showSuccessToast('Shipping address saved successfully');
      })
      .catch((error) => {
        console.error('Error saving shipping address:', error);
        showErrorToast(`${error.response.data.error}`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const deleteAddress = async (id: string) => {
    setIsLoading(true);
    axiosApi.delete(`/shipping_addresses/${id}`)
      .then(() => {
        if (selectedShippingAddress?.id === id) {
          setSelectedShippingAddress(null);
        }
        fetchAddresses();
        showSuccessToast('Shipping address deleted successfully');
      })
      .catch((error) => {
        console.error('Error deleting shipping address:', error);
        showErrorToast('Failed to delete shipping address');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const toggleSelection = (address: Address) => {
    setSelectedShippingAddress(address);
  };

  const handleNextStep = () => {
    if (selectedShippingAddress) {
      showSuccessToast('Shipping Addresses saved successfully');
      setCurrentStep(prev => prev + 1);
    } else {
      showErrorToast('Please select at least one shipping address');
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  if (isLoading) {
    return <Spinner/>;
  }

  return (
    <div className="flex flex-row gap-8 fade-in">
      <div className="flex flex-col gap-4 flex-1">
        <div className="font-bold text-lg">Add New Shipping Address</div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            type="text"
            placeholder="John"
            value={newAddress.firstName}
            onChange={(e) => setNewAddress({...newAddress, firstName: e.target.value})}
          />
          <Input
            label="Last Name"
            type="text"
            placeholder="Doe"
            value={newAddress.lastName}
            onChange={(e) => setNewAddress({...newAddress, lastName: e.target.value})}
          />
          <Input
            label="Address Line 1"
            type="text"
            placeholder="123 Main St"
            value={newAddress.addressLine1}
            onChange={(e) => setNewAddress({...newAddress, addressLine1: e.target.value})}
          />
          <Input
            label="Address Line 2 (Optional)"
            type="text"
            placeholder="Apt 4B"
            value={newAddress.addressLine2}
            onChange={(e) => setNewAddress({...newAddress, addressLine2: e.target.value})}
          />
          <Input
            label="City"
            type="text"
            placeholder="New York"
            value={newAddress.city}
            onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
          />
          <Input
            label="Post Code"
            type="text"
            placeholder="10001"
            value={newAddress.postCode}
            onChange={(e) => setNewAddress({...newAddress, postCode: e.target.value})}
          />
          <Input
            label="County"
            type="text"
            placeholder="New York"
            value={newAddress.county}
            onChange={(e) => setNewAddress({...newAddress, county: e.target.value})}
          />
          <Input
            label="Phone"
            type="tel"
            placeholder="123-456-7890"
            value={newAddress.phone}
            onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
          />
        </div>
        <Button onClick={saveAddress}>
          Save Shipping Address
        </Button>
      </div>
      <div className="flex flex-col gap-4 flex-1">
        <div>
          Selected {selectedShippingAddress ? 1 : 0} address(es)
        </div>
        {addresses.length === 0 && <div>No Shipping Addresses Found. Please add one.</div>}
        <div className="grid grid-cols-2 gap-4">
          {addresses.map((address: Address) => (
            <div
              key={address.id}
              className={`p-4 rounded-lg flex flex-col gap-1 shadow-md cursor-pointer transition-colors duration-300 ${
                selectedShippingAddress?.id === address.id ? 'bg-green-600' : 'bg-deep-black-2'
              }`}
              onClick={() => toggleSelection(address)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="font-bold">{address.firstName} {address.lastName}</div>
                <div className="flex gap-2">
                  <MdDelete
                    size={20}
                    className="text-red-500 cursor-pointer hover:text-red-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteAddress(address.id);
                    }}
                  />
                </div>
              </div>
              <div>{address.addressLine1}</div>
              {address.addressLine2 && <div>{address.addressLine2}</div>}
              <div>{address.city}, {address.postCode}</div>
              <div>{address.county}</div>
              <div>{address.phone}</div>
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

export default ShippingAddressInput;