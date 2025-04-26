export default function SkeletonCard({ className = "" }) {
    return (
      <div className={`animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700 h-48 w-full ${className}`} />
    );
  }
  