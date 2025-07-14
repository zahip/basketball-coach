"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-white p-6 shadow-xl transition-all duration-500 ease-out",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b",
        bottom: "inset-x-0 bottom-0 border-t",
        left: "inset-y-0 left-0 h-full w-3/4 border-r",
        right: "inset-y-0 right-0 h-full w-3/4 border-l",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
)

interface SheetProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

interface SheetContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sheetVariants> {
  onClose?: () => void
}

const Sheet = ({ open, onOpenChange, children }: SheetProps) => {
  const [showOverlay, setShowOverlay] = React.useState(false)

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open && onOpenChange) {
        onOpenChange(false)
      }
    }

    if (open) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
      // Trigger overlay animation
      setShowOverlay(true)
    } else {
      document.body.style.overflow = "unset"
      setShowOverlay(false)
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay with smooth fade animation */}
      <div 
        className={`fixed inset-0 bg-black/80 transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          showOverlay ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => onOpenChange?.(false)}
      />
      {children}
    </div>
  )
}

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ side = "right", className, children, onClose, ...props }, ref) => {
    const [isVisible, setIsVisible] = React.useState(false)

    React.useEffect(() => {
      // Trigger animation after component mounts
      setIsVisible(true)
    }, [])

    const getAnimationClasses = () => {
      const base = "transform transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
      switch (side) {
        case "right":
          return `${base} ${isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}`
        case "left":
          return `${base} ${isVisible ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"}`
        case "top":
          return `${base} ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}`
        case "bottom":
          return `${base} ${isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`
        default:
          return base
      }
    }

    return (
      <div
        ref={ref}
        className={cn(sheetVariants({ side }), getAnimationClasses(), className)}
        {...props}
      >
        {children}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    )
  }
)
SheetContent.displayName = "SheetContent"

const SheetTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, ...props }, ref) => (
  <button ref={ref} {...props}>
    {children}
  </button>
))
SheetTrigger.displayName = "SheetTrigger"

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
))
SheetTitle.displayName = "SheetTitle"

const SheetDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
SheetDescription.displayName = "SheetDescription"

export {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}