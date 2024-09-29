import React, {useEffect, useState} from 'react';
import {axiosApi} from "../../axios";
import {MdDelete, MdEmail} from "react-icons/md";
import {Spinner} from "../../utils";
import Input from "../Input";
import Button from "../Button";
import useToast from "../useToast";
import {TopCashbackCredential, useAutomation} from "../../context/AutomationContext";
import {PiPasswordFill} from "react-icons/pi";

const TopCashbackCredentialsInput = () => {
  const [data, setData] = useState<TopCashbackCredential[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const {showSuccessToast, showErrorToast} = useToast();
  const {
    selectedTopCashbackCredentials,
    setSelectedTopCashbackCredentials,
    setCurrentStep
  } = useAutomation();

  const fetchData = () => {
    setIsLoading(true);
    axiosApi.get('/topcashback_credentials')
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
    axiosApi.post('/topcashback_credentials', {email, password})
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
    axiosApi.delete(`/topcashback_credentials/${email}`)
      .then(() => {
        setSelectedTopCashbackCredentials(prev => prev.filter(cred => cred.email !== email));
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

  const toggleSelection = (credential: TopCashbackCredential) => {
    setSelectedTopCashbackCredentials([credential]);
  };

  const handleNextStep = () => {
    if (selectedTopCashbackCredentials.length === 1) {
      showSuccessToast('Topcashback Credentials selected successfully');
      setCurrentStep(prev => prev + 1);
    } else {
      showErrorToast(`Please select only 1 credentials`);
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
          Selected {selectedTopCashbackCredentials.length} out of 1 credentials
        </div>
        {data.length === 0 && <div>0 Credentials Found, Please create one.</div>}
        <div className="grid grid-cols-2 gap-4">
          {data.map((item, index) => {
            const isSelected = selectedTopCashbackCredentials.some(cred => cred.email === item.email);
            return (
              <div
                key={index}
                className='flex bg-deep-black-2 rounded-xl p-4 px-6 justify-between items-center transition-colors duration-200 cursor-pointer gap-2'
                style={{
                  backgroundColor: isSelected ? '#10b427' : ''
                }}
                onClick={() => toggleSelection(item)}
              >
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center gap-1">
                    <MdEmail size={16} className="flex-grow-0 flex-shrink-0"/>
                    <div>{item.email}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <PiPasswordFill size={16} className="flex-grow-0 flex-shrink-0"/>
                    <div>{item.password}</div>
                  </div>
                </div>
                <MdDelete size={20} onClick={() => deleteData(item.email)}
                          className="cursor-pointer text-red-500 w-5"/>
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

export default TopCashbackCredentialsInput;