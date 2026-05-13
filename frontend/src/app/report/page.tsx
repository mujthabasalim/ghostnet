"use client";

import ReportForm from "@/components/ReportForm";
import { useLanguage } from "@/context/LanguageContext";

export default function ReportPage() {
  const { t } = useLanguage();
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">
          {t('issue_hazard_report')}
        </h1>
        <p className="text-sm sm:text-base text-slate-400">
          {t('report_description')}
        </p>
      </div>

      <ReportForm />
    </div>
  );
}
