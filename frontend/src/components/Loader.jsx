import React from "react";

export default function Loader({ size = "md" }) {
  const sizeClass =
    size === "sm" ? "h-4 w-4" : size === "lg" ? "h-12 w-12" : "h-6 w-6";

  return (
    <div className="flex justify-center items-center">
      <div
        className={`animate-spin rounded-full border-4 border-t-transparent border-gray-400 dark:border-gray-600 ${sizeClass}`}
      />
    </div>
  );
}
