"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { UploadStep } from "./UploadStep";
import { VerifyStep } from "./VerifyStep";
import { SaveStep } from "./SaveStep";
// import { ReviewStep } from "@/components/import/ReviewStep";
// import { SaveStep } from "@/components/import/SaveStep";

const stepConfig = [
  { id: 1, key: "upload", title: "رفع الملف" },
  { id: 2, key: "verify", title: "التحقق" },
  { id: 3, key: "review", title: "المراجعة" },
  { id: 4, key: "save", title: "الحفظ" },
];

function ImportContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get current step from URL (e.g., ?step=verify). Default to 'upload'.
  const currentStepKey = searchParams.get("step") || "upload";

  // Find the index of the current step to determine Stepper UI states
  const currentStepIndex = stepConfig.findIndex(
    (s) => s.key === currentStepKey,
  );

  // Helper function to securely update the URL parameters
  const changeStep = (newStepKey: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("step", newStepKey);
    // Pushes the new URL without refreshing the page
    router.push(`${pathname}?${params.toString()}`);
  };

  // Render the correct component based on the URL
  const renderCurrentStep = () => {
    switch (currentStepKey) {
      case "upload":
        return <UploadStep onNext={() => changeStep("verify")} />;
      case "verify":
        return (
          <VerifyStep
            onNext={() => changeStep("review")}
            onPrev={() => changeStep("upload")}
          />
        );
      case "save":
        return <SaveStep onReset={() => changeStep("upload")} />;
      // case "review":
      //   return <ReviewStep onNext={() => changeStep("save")} onPrev={() => changeStep("verify")} />;
      // case "save":
      //   return <SaveStep />;
      default:
        return <UploadStep onNext={() => changeStep("verify")} />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Universal Page Header */}
      <div className="flex flex-col items-start text-right">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          استيراد الأسئلة من JSON
        </h1>
        <p className="text-sm text-slate-500">
          رفع ملف JSON، التحقق، المراجعة، والحفظ
        </p>
      </div>

      {/* Dynamic Stepper */}
      <div className="flex items-center justify-between w-full overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
        {stepConfig.map((step, index) => {
          // Logic to determine if a step is done, active, or upcoming
          const isCompleted = index < currentStepIndex;
          const isActive = index === currentStepIndex;

          return (
            <div key={step.id} className={`flex items-center ${index < stepConfig.length - 1 ? "flex-1" : ""}`}>
              <div className="flex items-center gap-2 md:gap-3 shrink-0">
                <div
                  className={`flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full text-xs md:text-sm font-bold shrink-0 transition-colors ${
                    isCompleted || isActive
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {step.id}
                </div>
                <span
                  className={`text-xs md:text-sm font-bold whitespace-nowrap transition-colors ${
                    isCompleted || isActive
                      ? "text-emerald-500"
                      : "text-slate-500"
                  }`}
                >
                  {step.title}
                </span>
              </div>

              {/* Connecting Line */}
              {index < stepConfig.length - 1 && (
                <div
                  className={`flex-1 mx-3 md:mx-6 h-px transition-colors ${
                    isCompleted ? "bg-emerald-500" : "bg-slate-200"
                  }`}
                ></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Render the active child component */}
      <div className="mt-8">{renderCurrentStep()}</div>
    </div>
  );
}

export default function ImportOrchestratorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">جاري التحميل...</div>}>
      <ImportContent />
    </Suspense>
  );
}
