import React, {useEffect, useState} from 'react';
import {axiosApi} from "../../axios";
import {MdDelete} from "react-icons/md";
import {Spinner} from "../../utils";
import Input from "../Input";
import Button from "../Button";
import useToast from "../useToast";
import {SuperDrugCredential, useAutomation} from "../../context/AutomationContext";

const SuperDrugCredentialsInput = () => {
  const [data, setData] = useState<SuperDrugCredential[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const {showSuccessToast, showErrorToast} = useToast();
  const {totalOrders, selectedSuperDrugCredentials, setSelectedSuperDrugCredentials, setCurrentStep} = useAutomation();

  const fetchData = () => {
    setIsLoading(true);
    axiosApi.get('/superdrug_credentials')
      .then((response: any) => {
        setData(response.data);
      })
      .catch((error: any) => {
        console.error('Error fetching data:', error);
        showErrorToast('Failed to fetch credentials');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const saveData = async () => {
    if (!email || !password) {
      showErrorToast('Please enter both email and password');
      return;
    }
    setIsLoading(true);
    axiosApi.post('/superdrug_credentials', {email, password})
      .then(() => {
        setEmail('');
        setPassword('');
        fetchData();
        showSuccessToast('Credentials saved successfully');
      })
      .catch((error: any) => {
        console.error('Error saving data:', error);
        showErrorToast(`${error.response.data.error}`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const deleteData = async (email: string) => {
    setIsLoading(true);
    axiosApi.delete(`/superdrug_credentials/${email}`)
      .then(() => {
        setSelectedSuperDrugCredentials(prev => prev.filter(cred => cred.email !== email));
        fetchData();
        showSuccessToast('Credentials deleted successfully');
      })
      .catch((error: any) => {
        console.error('Error deleting data:', error);
        showErrorToast('Failed to delete credentials');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const toggleSelection = (credential: SuperDrugCredential) => {
    setSelectedSuperDrugCredentials(prev => {
      if (prev.some(cred => cred.email === credential.email)) {
        return prev.filter(cred => cred.email !== credential.email);
      } else {
        return [...prev, credential];
      }
    });
  };

  const handleNextStep = () => {
    if (selectedSuperDrugCredentials.length === totalOrders) {
      showSuccessToast('Superdrug Credentials selected successfully');
      setCurrentStep(prev => prev + 1);
    } else {
      showErrorToast(`Please select exactly ${totalOrders} credentials`);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return <Spinner/>;
  }

  return (
    <div className="flex flex-row gap-16 fade-in">
      <div className="flex flex-col gap-4 w-[40%]">
        <div className="font-bold text-lg">Create New Superdrug Credentials</div>
        <div className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            placeholder="johndoe@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            placeholder="********"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button onClick={saveData}>
            Save
          </Button>
        </div>
      </div>
      <div className="w-full flex gap-4 flex-col">
        <div>
          Selected {selectedSuperDrugCredentials.length} out of {totalOrders} credentials
        </div>
        {data.length === 0 && <div>0 Credentials Found, Please create one.</div>}
        <div className="w-full flex gap-4 flex-wrap flex-row">
          {data.map((item, index) => {
            const isSelected = selectedSuperDrugCredentials.some(cred => cred.email === item.email);
            return (
              <div
                key={index}
                className='flex bg-deep-black-2 rounded-xl p-4 px-6 justify-between items-center transition-colors duration-200 gap-6 cursor-pointer'
                style={{
                  backgroundColor: isSelected ? '#10b427' : ''
                }}
                onClick={() => toggleSelection(item)}
              >
                <div className="flex flex-col">
                  <div>{item.email}</div>
                  <div>{item.password}</div>
                </div>
                <MdDelete
                  size={24}
                  className="text-red-700 cursor-pointer"
                  onClick={() => deleteData(item.email)}
                />
              </div>
            )
          })}
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

export default SuperDrugCredentialsInput;