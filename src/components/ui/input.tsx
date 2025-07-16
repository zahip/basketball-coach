import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-all placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-input",
        error: "border-destructive focus:ring-destructive",
        success: "border-basketball-green-500 focus:ring-basketball-green-500",
        warning: "border-yellow-500 focus:ring-yellow-500",
      },
      size: {
        sm: "h-8 px-3 py-1 text-xs",
        md: "h-10 px-3 py-2 text-sm",
        lg: "h-12 px-4 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant, 
    size, 
    type, 
    label, 
    description, 
    error, 
    success, 
    icon, 
    iconPosition = "left",
    ...props 
  }, ref) => {
    const inputId = React.useId();
    const descriptionId = React.useId();
    const errorId = React.useId();
    const successId = React.useId();

    // Determine the variant based on error/success states
    const computedVariant = error ? "error" : success ? "success" : variant;

    const inputElement = (
      <input
        id={inputId}
        type={type}
        className={cn(
          inputVariants({ variant: computedVariant, size }),
          icon && iconPosition === "left" && "pl-10",
          icon && iconPosition === "right" && "pr-10",
          className
        )}
        ref={ref}
        aria-describedby={cn(
          description && descriptionId,
          error && errorId,
          success && successId
        )}
        aria-invalid={error ? "true" : "false"}
        {...props}
      />
    );

    const content = (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={inputId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {icon && (
            <div className={cn(
              "absolute top-1/2 transform -translate-y-1/2 text-muted-foreground",
              iconPosition === "left" ? "left-3" : "right-3"
            )}>
              {icon}
            </div>
          )}
          {inputElement}
        </div>

        {description && (
          <p id={descriptionId} className="text-sm text-muted-foreground">
            {description}
          </p>
        )}

        {error && (
          <p id={errorId} className="text-sm text-destructive flex items-center gap-1">
            <span className="text-xs">⚠️</span>
            {error}
          </p>
        )}

        {success && (
          <p id={successId} className="text-sm text-basketball-green-600 flex items-center gap-1">
            <span className="text-xs">✅</span>
            {success}
          </p>
        )}
      </div>
    );

    return content;
  }
);

Input.displayName = "Input";

// Search Input Component
export interface SearchInputProps extends Omit<InputProps, "icon" | "iconPosition"> {
  onSearch?: (value: string) => void;
  onClear?: () => void;
  showClearButton?: boolean;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onSearch, onClear, showClearButton = true, ...props }, ref) => {
    const [value, setValue] = React.useState(props.value || "");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);
      onSearch?.(newValue);
      props.onChange?.(e);
    };

    const handleClear = () => {
      setValue("");
      onClear?.();
    };

    return (
      <div className="relative">
        <Input
          {...props}
          ref={ref}
          value={value}
          onChange={handleChange}
          icon={<span className="text-lg">🔍</span>}
          iconPosition="left"
          className={cn("pr-10", props.className)}
        />
        {showClearButton && value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <span className="text-sm">×</span>
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";

// Number Input Component
export interface NumberInputProps extends Omit<InputProps, "type"> {
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number | undefined) => void;
  showButtons?: boolean;
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ min, max, step = 1, onValueChange, showButtons = true, ...props }, ref) => {
    const [value, setValue] = React.useState<string>(props.value?.toString() || "");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);
      
      const numValue = newValue === "" ? undefined : parseFloat(newValue);
      onValueChange?.(numValue);
      props.onChange?.(e);
    };

    const increment = () => {
      const currentValue = parseFloat(value) || 0;
      const newValue = Math.min(currentValue + step, max || Infinity);
      setValue(newValue.toString());
      onValueChange?.(newValue);
    };

    const decrement = () => {
      const currentValue = parseFloat(value) || 0;
      const newValue = Math.max(currentValue - step, min || -Infinity);
      setValue(newValue.toString());
      onValueChange?.(newValue);
    };

    return (
      <div className="relative">
        <Input
          {...props}
          ref={ref}
          type="number"
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          className={cn(showButtons && "pr-16", props.className)}
        />
        {showButtons && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col">
            <button
              type="button"
              onClick={increment}
              className="h-4 w-6 text-xs bg-muted hover:bg-muted-foreground/20 rounded-t border border-input flex items-center justify-center transition-colors"
              aria-label="Increment"
            >
              +
            </button>
            <button
              type="button"
              onClick={decrement}
              className="h-4 w-6 text-xs bg-muted hover:bg-muted-foreground/20 rounded-b border border-input border-t-0 flex items-center justify-center transition-colors"
              aria-label="Decrement"
            >
              -
            </button>
          </div>
        )}
      </div>
    );
  }
);

NumberInput.displayName = "NumberInput";

// Textarea Component
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  resize?: "none" | "both" | "horizontal" | "vertical";
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className, 
    label, 
    description, 
    error, 
    success, 
    resize = "vertical",
    ...props 
  }, ref) => {
    const textareaId = React.useId();
    const descriptionId = React.useId();
    const errorId = React.useId();
    const successId = React.useId();

    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={textareaId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}
        
        <textarea
          id={textareaId}
          className={cn(
            "flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus:ring-destructive",
            success && "border-basketball-green-500 focus:ring-basketball-green-500",
            resize === "none" && "resize-none",
            resize === "both" && "resize",
            resize === "horizontal" && "resize-x",
            resize === "vertical" && "resize-y",
            className
          )}
          ref={ref}
          aria-describedby={cn(
            description && descriptionId,
            error && errorId,
            success && successId
          )}
          aria-invalid={error ? "true" : "false"}
          {...props}
        />

        {description && (
          <p id={descriptionId} className="text-sm text-muted-foreground">
            {description}
          </p>
        )}

        {error && (
          <p id={errorId} className="text-sm text-destructive flex items-center gap-1">
            <span className="text-xs">⚠️</span>
            {error}
          </p>
        )}

        {success && (
          <p id={successId} className="text-sm text-basketball-green-600 flex items-center gap-1">
            <span className="text-xs">✅</span>
            {success}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Input, inputVariants };