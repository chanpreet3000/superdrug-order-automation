import React, {} from 'react';
import {IoMdClose} from "react-icons/io";


interface Props {
  children: React.ReactNode;
  onClose?: () => void;
  canClose?: boolean;
}

const Modal: React.FC<Props> = ({onClose, children, canClose = true}: Props) => {

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 fade-in">
      <div className="w-[80%] h-[80%] relative bg-deep-black p-12 overflow-y-scroll custom-scrollbar rounded-2xl">
        {canClose &&
          <div className="absolute top-4 left-4">
            <button onClick={onClose} className="text-red-600">
              <IoMdClose size={24} className=""/>
            </button>
          </div>}

        {children}
      </div>
    </div>
  );
};

export default Modal;