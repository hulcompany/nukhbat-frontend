"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";

export default function UnitError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-7xl mx-auto p-1 pb-8" dir="rtl">
      <ErrorState message={error.message} onRetry={unstable_retry} />
    </div>
  );
}
