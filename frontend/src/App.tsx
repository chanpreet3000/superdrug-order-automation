import React from 'react';
import Navbar from "./Navbar";
import {FaArrowLeft, FaArrowRight} from "react-icons/fa";
import SuperDrugCredentials from "./components/SuperDrugCredentials";
import {Toaster} from "react-hot-toast";

function App() {
  return (
    <div className="h-screen bg-deep-black flex flex-col gap-8 text-white p-8 items-center">
      <Navbar/>
      <Toaster position="top-center"/>
      <div className="rounded-2xl bg-deep-black-1 flex-1 w-[80%] h-full flex flex-col overflow-hidden">
        <div className="w-full py-4 px-8 bg-deep-black-2 flex justify-between items-center">
          <FaArrowLeft size={16} className="cursor-pointer"/>
          <div className="font-bold">Title of the Page</div>
          <FaArrowRight size={16} className="invisible"/>
        </div>
        <div className="w-full flex-1 custom-scrollbar overflow-y-scroll p-8">
          <SuperDrugCredentials/>
        </div>
      </div>
    </div>
  );
}

export default App;