import React from "react";
import ManualExecution from "../components/ManualExecutionComponents/ManualExecution";
import OpenPositions from "../components/ManualExecutionComponents/OpenPositions";
import Orders from "../components/ManualExecutionComponents/Orders";

export default function ManualExecutionPage() {
  return (
    // The main container with a light gray background to match the dashboard look
    <div className="min-h-screen bg-slate-50 p-4">
      {/* Responsive Flex Layout: 
        - Stacks vertically on small screens (flex-col)
        - Side-by-side on large screens (lg:flex-row) 
      */}
      <div className="flex flex-col lg:flex-row h-full">
        {/* === LEFT COLUMN === */}
        {/* Fixed width on larger screens to prevent squishing the smaller tables */}
        <div className="w-full lg:w-[450px] xl:w-[600px] flex flex-col flex-shrink-0">
          {/* We wrap them in divs to ensure they stack perfectly */}
          <div className="w-full">
            <OpenPositions />
          </div>
          <div className="w-full">
            <Orders />
          </div>
        </div>

        {/* === RIGHT COLUMN === */}
        {/* flex-1 allows this section to take up all remaining width */}
        <div className="flex-1 w-full min-w-0 overflow-hidden">
          <ManualExecution />
        </div>
      </div>
    </div>
  );
}
