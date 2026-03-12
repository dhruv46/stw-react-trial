import React from "react";
import ManualExecution from "../components/ManualExecutionComponents/ManualExecution";
import OpenPositions from "../components/ManualExecutionComponents/OpenPositions";
import Orders from "../components/ManualExecutionComponents/Orders";

export default function ManualExecutionPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="flex flex-col lg:flex-row h-full">
        {/* LEFT COLUMN - 30% */}
        <div className="w-full lg:w-[40%] flex flex-col flex-shrink-0">
          <div className="w-full">
            <OpenPositions />
          </div>

          <div className="w-full">
            <Orders />
          </div>
        </div>

        {/* RIGHT COLUMN - 70% */}
        <div className="w-full lg:w-[60%] min-w-0 overflow-hidden">
          <ManualExecution />
        </div>
      </div>
    </div>
  );
}
