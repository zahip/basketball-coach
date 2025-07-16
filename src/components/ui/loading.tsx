import * as React from "react";
import { cn } from "@/lib/utils";

// Loading Spinner Component
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12",
    xl: "h-16 w-16"
  };

  return (
    <div 
      className={cn(
        "animate-spin rounded-full border-2 border-muted-foreground/20 border-t-basketball-orange-500",
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// Skeleton Components
interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-muted/50",
        className
      )}
    />
  );
}

// Card Skeleton
export function CardSkeleton() {
  return (
    <div className="card-enhanced space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

// Team Card Skeleton
export function TeamCardSkeleton() {
  return (
    <div className="card-enhanced">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>
    </div>
  );
}

// List Skeleton
export function ListSkeleton({ items = 3 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <TeamCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Button Skeleton
export function ButtonSkeleton() {
  return <Skeleton className="h-9 w-20 rounded-lg" />;
}

// Loading State with Message
interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function LoadingState({ 
  message = "Loading...", 
  size = "md",
  className 
}: LoadingStateProps) {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center space-y-4 py-8",
        className
      )}
    >
      <LoadingSpinner size={size} />
      <p className="text-sm text-muted-foreground animate-pulse-subtle">
        {message}
      </p>
    </div>
  );
}

// Empty State Component
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  className 
}: EmptyStateProps) {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center space-y-4 py-12 text-center",
        className
      )}
    >
      {icon && (
        <div className="text-muted-foreground/50 text-4xl">
          {icon}
        </div>
      )}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground max-w-md">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="pt-2">
          {action}
        </div>
      )}
    </div>
  );
}

// Error State Component
interface ErrorStateProps {
  title?: string;
  message?: string;
  retry?: () => void;
  className?: string;
}

export function ErrorState({ 
  title = "Something went wrong", 
  message = "Please try again later", 
  retry,
  className 
}: ErrorStateProps) {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center space-y-4 py-12 text-center",
        className
      )}
    >
      <div className="text-destructive text-4xl">
        ⚠️
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          {message}
        </p>
      </div>
      {retry && (
        <button
          onClick={retry}
          className="btn-primary"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

// Progress Bar Component
interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function ProgressBar({ 
  value, 
  max = 100, 
  className, 
  size = "md" 
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const sizeClasses = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4"
  };

  return (
    <div 
      className={cn(
        "w-full bg-muted rounded-full overflow-hidden",
        sizeClasses[size],
        className
      )}
    >
      <div
        className="h-full bg-gradient-to-r from-basketball-orange-500 to-basketball-orange-600 transition-all duration-300 ease-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

export default {
  LoadingSpinner,
  Skeleton,
  CardSkeleton,
  TeamCardSkeleton,
  ListSkeleton,
  ButtonSkeleton,
  LoadingState,
  EmptyState,
  ErrorState,
  ProgressBar
};