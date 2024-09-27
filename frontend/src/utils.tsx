import {FaSpinner} from "react-icons/fa";
import React from "react";


export const Spinner = () => {
  return (
    <div className="w-full h-full flex justify-center items-center">
      <FaSpinner className="animate-spin" size={44}/>
    </div>
  );
}


export const Divider = () => {
  return (
    <div className="bg-[#ffffff66] h-[2px] w-full rounded-2xl">
    </div>
  );
}