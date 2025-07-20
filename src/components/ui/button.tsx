import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-soft hover:bg-primary/90 hover:shadow-medium hover:-translate-y-0.5",
        destructive:
          "bg-destructive text-destructive-foreground shadow-soft hover:bg-destructive/90 hover:shadow-medium hover:-translate-y-0.5 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border border-input bg-background shadow-soft hover:bg-accent hover:text-accent-foreground hover:shadow-medium hover:-translate-y-0.5 dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-soft hover:bg-secondary/80 hover:shadow-medium hover:-translate-y-0.5",
        ghost:
          "hover:bg-accent hover:text-accent-foreground hover:shadow-soft dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        basketball:
          "bg-basketball-orange-500 text-white shadow-soft hover:bg-basketball-orange-600 hover:shadow-medium hover:-translate-y-0.5 focus-visible:ring-basketball-orange-500/20",
        court:
          "bg-basketball-blue-500 text-white shadow-soft hover:bg-basketball-blue-600 hover:shadow-medium hover:-translate-y-0.5 focus-visible:ring-basketball-blue-500/20",
        success:
          "bg-basketball-green-500 text-white shadow-soft hover:bg-basketball-green-600 hover:shadow-medium hover:-translate-y-0.5 focus-visible:ring-basketball-green-500/20",
        gradient:
          "bg-gradient-to-r from-basketball-orange-500 to-basketball-blue-500 text-white shadow-soft hover:from-basketball-orange-600 hover:to-basketball-blue-600 hover:shadow-medium hover:-translate-y-0.5",
        primary:
          "bg-blue-700 text-white shadow-soft hover:bg-blue-800 hover:shadow-medium hover:-translate-y-0.5",
        primaryOutline:
          "border-2 border-blue-700 text-blue-700 bg-white shadow-soft hover:bg-blue-50 hover:shadow-medium hover:-translate-y-0.5",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 text-xs has-[>svg]:px-2.5",
        lg: "h-12 rounded-lg px-6 text-base has-[>svg]:px-4",
        xl: "h-14 rounded-lg px-8 text-lg has-[>svg]:px-6",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    loading = false, 
    icon, 
    iconPosition = "left",
    children,
    disabled,
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading

    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          disabled={isDisabled}
          data-loading={loading}
          {...props}
        >
          {children}
        </Slot>
      )
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        data-loading={loading}
        {...props}
      >
        {loading && (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
        )}
        {!loading && icon && iconPosition === "left" && icon}
        {!loading && children}
        {!loading && icon && iconPosition === "right" && icon}
      </button>
    )
  }
)
Button.displayName = "Button"

// Icon Button Component
export interface IconButtonProps extends Omit<ButtonProps, "children"> {
  icon: React.ReactNode
  "aria-label": string
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = "icon", ...props }, ref) => {
    return (
      <Button
        ref={ref}
        size={size}
        {...props}
      >
        {icon}
      </Button>
    )
  }
)
IconButton.displayName = "IconButton"

// Button Group Component
export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical"
  size?: "sm" | "default" | "lg"
  variant?: "default" | "outline" | "secondary"
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ 
    className, 
    orientation = "horizontal", 
    size = "default",
    variant = "outline",
    children,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex",
          orientation === "horizontal" 
            ? "flex-row [&>*:not(:first-child)]:ml-px [&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none"
            : "flex-col [&>*:not(:first-child)]:mt-px [&>*:not(:first-child)]:rounded-t-none [&>*:not(:last-child)]:rounded-b-none",
          className
        )}
        role="group"
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === Button) {
            return React.cloneElement(child, {
              size: child.props.size || size,
              variant: child.props.variant || variant,
            })
          }
          return child
        })}
      </div>
    )
  }
)
ButtonGroup.displayName = "ButtonGroup"

// Floating Action Button Component
export interface FABProps extends Omit<ButtonProps, "size"> {
  size?: "default" | "lg"
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left"
}

const FAB = React.forwardRef<HTMLButtonElement, FABProps>(
  ({ 
    className, 
    size = "default", 
    position = "bottom-right",
    ...props 
  }, ref) => {
    const positionClasses = {
      "bottom-right": "fixed bottom-6 right-6",
      "bottom-left": "fixed bottom-6 left-6",
      "top-right": "fixed top-6 right-6",
      "top-left": "fixed top-6 left-6",
    }

    return (
      <Button
        ref={ref}
        size={size === "lg" ? "icon-lg" : "icon"}
        variant="basketball"
        className={cn(
          "rounded-full shadow-strong z-50",
          positionClasses[position],
          className
        )}
        {...props}
      />
    )
  }
)
FAB.displayName = "FAB"

export { Button, IconButton, ButtonGroup, FAB, buttonVariants }
