import React from 'react';
import {IoMdContacts, IoMdInformationCircleOutline} from "react-icons/io";
import {Link} from "react-router-dom";

function Navbar() {
  return (
    <div className="w-full flex flex-row items-center justify-between">
      <div className="text-xl text-lime-green font-bold">SuperDrug Order Automation</div>
      <div className="flex flex-row gap-4 items-center">
        <button
          className="bg-deep-black-1 text-soft-white text-sm font-semibold py-3 px-4 rounded-xl flex gap-1 items-center">
          <IoMdInformationCircleOutline size={18}/>
          <div>How To Use</div>
        </button>
        <Link to="https://chanpreet-portfolio.vercel.app/#connect" target="_blank">
          <button
            className="bg-lime-green text-soft-white text-sm font-semibold py-3 px-4 rounded-xl flex gap-1 items-center">
            <IoMdContacts size={18}/>
            <div>Contact Developer</div>
          </button>
        </Link>
      </div>
    </div>
  );
}

export default Navbar;