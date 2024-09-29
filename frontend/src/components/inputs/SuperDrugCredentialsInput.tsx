import React, {useState, useEffect} from 'react';
import {MdDelete, MdEmail} from 'react-icons/md';
import useToast from "../useToast";
import Button from "../Button";
import {useAutomation} from "../../context/AutomationContext";
import Input from "../Input";
import {PiPasswordFill} from "react-icons/pi";

const SuperDrugCredentialsInput = () => {
  const {selectedSuperDrugCredentials, setSelectedSuperDrugCredentials, setCurrentStep, totalOrders} = useAutomation();
  const defaultPassword = selectedSuperDrugCredentials.length > 0 ? selectedSuperDrugCredentials[0].password : '';
  const defaultEmails = selectedSuperDrugCredentials.map(cred => cred.email).join('\n');

  const [emails, setEmails] = useState(defaultEmails);
  const [password, setPassword] = useState(defaultPassword);
  const {showSuccessToast, showErrorToast} = useToast();

  useEffect(() => {
    const emailList = emails.split('\n').filter(email => email.trim() !== '');
    setSelectedSuperDrugCredentials(emailList.map(email => ({email, password})));
  }, [emails, password]);

  const handleDeleteSingle = (index: number) => {
    const newEmails = emails.split('\n');
    newEmails.splice(index, 1);
    setEmails(newEmails.join('\n'));
    showSuccessToast('Email deleted');
  };

  const handleNextStep = () => {
    if (selectedSuperDrugCredentials.length === totalOrders) {
      showSuccessToast('Superdrug Credentials selected successfully');
      setCurrentStep(prev => prev + 1);
    } else {
      showErrorToast(`Please select exactly ${totalOrders} credentials`);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-row gap-8">
        <div className="flex flex-col gap-4 flex-[4]">
          <Input
            label="Password For All"
            placeholder="********"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex flex-col ">
            <label htmlFor="emails" className="text-sm font-medium">
              Emails
            </label>
            <textarea
              id="emails"
              className="px-3 py-2 bg-deep-black-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder="Enter emails, one per line"
              rows={12}
            />
          </div>
        </div>

        <div className="flex-[6] space-y-4">
          <div className="flex flex-col">
            <p className="text-lime-green">Required exactly {totalOrders} credentials</p>
            <p>{selectedSuperDrugCredentials.length} email(s) entered</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {selectedSuperDrugCredentials.map((cred, index) => (
              <div key={index} className="flex justify-between items-center bg-deep-black-2 p-4 rounded-xl text-sm">
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center gap-1">
                    <MdEmail size={16} className="flex-grow-0 flex-shrink-0"/>
                    <div>{cred.email}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <PiPasswordFill size={16} className="flex-grow-0 flex-shrink-0"/>
                    <div>{cred.password}</div>
                  </div>
                </div>
                <MdDelete size={20} onClick={() => handleDeleteSingle(index)}
                          className="cursor-pointer text-red-500 w-5"/>
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

export default SuperDrugCredentialsInput;