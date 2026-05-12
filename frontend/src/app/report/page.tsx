import React from "react";
import ReportForm from "@/components/ReportForm";

export default function ReportPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-black">
          Issue Hazard Report
        </h1>
        <p className="text-slate-400">
          Report a lost net to warn other vessels and initiate retrieval.
        </p>
      </div>

      <ReportForm />
    </div>
  );
}
