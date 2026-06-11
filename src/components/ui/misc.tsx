import { cn, getInitials } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  isOnline?: boolean;
}

export function Avatar({ src, name, size = "md", className, isOnline }: AvatarProps) {
  const sizes = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-14 w-14 text-lg" };
  return (
    <div className={cn("relative inline-block", className)}>
      <div className={cn("rounded-full flex items-center justify-center font-semibold overflow-hidden", sizes[size],
        src ? "" : "bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300")}>
        {src ? (
          <img src={src} alt={name || ""} className="h-full w-full object-cover" />
        ) : (
          <span>{name ? getInitials(name) : "?"}</span>
        )}
      </div>
      {isOnline !== undefined && (
        <span className={cn("absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white",
          isOnline ? "bg-green-500" : "bg-gray-400")} />
      )}
    </div>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    default: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
    success: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    danger: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    info: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", variants[variant], className)}>
      {children}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-gray-200 dark:bg-gray-700", className)} />;
}
