import React, {useState} from 'react';
import {IoMdClose} from "react-icons/io";
import CardDetailsInput from "./inputs/CardDetailsInput";
import {OrderType} from "../context/AutomationContext";
import FinalOrderComponent from "./FinalOrderComponent";

interface Props {
  onClose: () => void;
  order: OrderType;
}

const OrderModal = ({onClose, order}: Props) => {
  const [finalOrder, setFinalOrder] = useState<OrderType | null>(null);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="w-[80%] h-[80%] relative bg-deep-black p-8 overflow-y-scroll custom-scrollbar">
        {finalOrder ?
          <FinalOrderComponent order={finalOrder} onClose={() => onClose()}/>
          :
          (
            <>
              <IoMdClose className="absolute top-[20px] left-[20px] cursor-pointer text-red-500" size={32}
                         onClick={() => onClose()}/>

              <CardDetailsInput order={order} setFinalOrder={setFinalOrder} />
            </>
          )}
      </div>
    </div>
  )
    ;
}


export default OrderModal;