import React from 'react';
import {IoMdClose} from "react-icons/io";
import CardDetailsInput from "./inputs/CardDetailsInput";

interface Props {
  setIsModelOpen: (value: boolean) => void;
}

const OrderModal = ({setIsModelOpen}: Props) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="w-[80%] h-[80%] relative bg-deep-black p-8">
        <IoMdClose className="absolute top-[20px] left-[20px] cursor-pointer text-red-500" size={32}
                   onClick={() => setIsModelOpen(false)}/>

        <CardDetailsInput/>
      </div>
    </div>
  );
}


export default OrderModal;