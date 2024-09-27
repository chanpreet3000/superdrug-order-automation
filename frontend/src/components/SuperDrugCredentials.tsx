import React, {useEffect, useState} from 'react';
import {axiosApi} from "../axios";
import {MdDelete} from "react-icons/md";
import {Divider, Spinner} from "../utils";
import Input from "./Input";
import Button from "./Button";
import useToast from "./useToast";

interface SuperDrugCredentialsResponse {
  email: string;
  password: string;
}

const SuperDrugCredentials = () => {
  const [data, setData] = useState<SuperDrugCredentialsResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const {showSuccessToast, showErrorToast} = useToast();

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
        showErrorToast('Failed to save credentials');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const deleteData = async (email: string) => {
    setIsLoading(true);
    axiosApi.delete(`/superdrug_credentials/${email}`)
      .then(() => {
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

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return <Spinner/>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="w-full flex gap-4 flex-col">
        {data.length === 0 && <div>0 Credentials Found, Please create one.</div>}
        {data.map((item, index) => (
          <div key={index} className="flex w-full bg-deep-black-2 rounded-xl p-4 px-6 justify-between items-center">
            <div className="flex flex-col">
              <div>{item.email}</div>
              <div>{item.password}</div>
            </div>
            <MdDelete
              size={24}
              className="text-red-600 cursor-pointer"
              onClick={() => deleteData(item.email)}
            />
          </div>
        ))}
      </div>
      <Divider/>
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
    </div>
  );
};

export default SuperDrugCredentials;