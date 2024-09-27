import {FaSpinner} from "react-icons/fa";
import React from "react";


export const Spinner = () => {
  return (
    <div className="w-full h-full flex justify-center items-center">
      <FaSpinner className="animate-spin" size={44}/>
    </div>
  );
}


export const Divider = ({height, color}: { height?: string, color?: string }) => {
  return (
    <div className="w-full rounded-2xl"
         style={{
           height: height ?? '2px',
           backgroundColor: color ?? '#ffffff66'
         }}>
    </div>
  );
}