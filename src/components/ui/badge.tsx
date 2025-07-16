import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border font-medium transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground border-border hover:bg-accent hover:text-accent-foreground",
        success: 
          "border-transparent bg-basketball-green-100 text-basketball-green-800 hover:bg-basketball-green-200 dark:bg-basketball-green-900 dark:text-basketball-green-100",
        warning:
          "border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-100",
        basketball:
          "border-transparent bg-basketball-orange-100 text-basketball-orange-800 hover:bg-basketball-orange-200 dark:bg-basketball-orange-900 dark:text-basketball-orange-100",
        court:
          "border-transparent bg-basketball-blue-100 text-basketball-blue-800 hover:bg-basketball-blue-200 dark:bg-basketball-blue-900 dark:text-basketball-blue-100",
        gradient:
          "border-transparent bg-gradient-to-r from-basketball-orange-500 to-basketball-blue-500 text-white hover:from-basketball-orange-600 hover:to-basketball-blue-600",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-sm",
        lg: "px-3 py-1.5 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  removable?: boolean;
  onRemove?: () => void;
}

function Badge({ 
  className, 
  variant, 
  size, 
  removable, 
  onRemove, 
  children, 
  ...props 
}: BadgeProps) {
  return (
    <div 
      className={cn(badgeVariants({ variant, size }), className)} 
      {...props}
    >
      {children}
      {removable && onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 h-4 w-4 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors inline-flex items-center justify-center"
          aria-label="Remove badge"
        >
          <span className="text-xs">×</span>
        </button>
      )}
    </div>
  );
}

// Status Badge for specific use cases
export interface StatusBadgeProps {
  status: "active" | "inactive" | "pending" | "completed" | "error";
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function StatusBadge({ status, className, size = "md" }: StatusBadgeProps) {
  const statusConfig = {
    active: { variant: "success" as const, label: "Active" },
    inactive: { variant: "secondary" as const, label: "Inactive" },
    pending: { variant: "warning" as const, label: "Pending" },
    completed: { variant: "basketball" as const, label: "Completed" },
    error: { variant: "destructive" as const, label: "Error" },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} size={size} className={className}>
      <span className="inline-block w-2 h-2 rounded-full bg-current mr-1.5"></span>
      {config.label}
    </Badge>
  );
}

// Position Badge for basketball positions
export interface PositionBadgeProps {
  position: "PG" | "SG" | "SF" | "PF" | "C";
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function PositionBadge({ position, className, size = "md" }: PositionBadgeProps) {
  const positionColors = {
    PG: "court",
    SG: "basketball", 
    SF: "success",
    PF: "warning",
    C: "destructive"
  } as const;

  const positionLabels = {
    PG: "Point Guard",
    SG: "Shooting Guard",
    SF: "Small Forward", 
    PF: "Power Forward",
    C: "Center"
  };

  return (
    <Badge 
      variant={positionColors[position]} 
      size={size} 
      className={className}
      title={positionLabels[position]}
    >
      {position}
    </Badge>
  );
}

// Difficulty Badge for training exercises
export interface DifficultyBadgeProps {
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function DifficultyBadge({ difficulty, className, size = "md" }: DifficultyBadgeProps) {
  const difficultyConfig = {
    beginner: { variant: "success" as const, label: "Beginner" },
    intermediate: { variant: "warning" as const, label: "Intermediate" },
    advanced: { variant: "basketball" as const, label: "Advanced" },
    expert: { variant: "destructive" as const, label: "Expert" },
  };

  const config = difficultyConfig[difficulty];

  return (
    <Badge variant={config.variant} size={size} className={className}>
      {config.label}
    </Badge>
  );
}

// Count Badge for showing numbers
export interface CountBadgeProps {
  count: number;
  maxCount?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function CountBadge({ count, maxCount = 999, className, size = "md" }: CountBadgeProps) {
  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();
  
  return (
    <Badge 
      variant="basketball" 
      size={size} 
      className={cn("font-bold", className)}
    >
      {displayCount}
    </Badge>
  );
}

export { Badge, badgeVariants };