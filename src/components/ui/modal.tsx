import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { Button } from "./button";

// Modal Context
interface ModalContextValue {
  isOpen: boolean;
  onClose: () => void;
}

const ModalContext = React.createContext<ModalContextValue | null>(null);

// Hook to use modal context
export function useModal() {
  const context = React.useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a Modal");
  }
  return context;
}

// Modal Root Component
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  backdropClassName?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  position?: "center" | "top" | "bottom";
}

export function Modal({
  isOpen,
  onClose,
  children,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className,
  backdropClassName,
  size = "md",
  position = "center",
}: ModalProps) {
  const [mounted, setMounted] = React.useState(false);

  // Handle mounting/unmounting
  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Handle escape key
  React.useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  // Handle body scroll lock
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md", 
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-full mx-4 my-4 h-[calc(100vh-2rem)]"
  };

  const positionClasses = {
    center: "items-center justify-center",
    top: "items-start justify-center pt-20",
    bottom: "items-end justify-center pb-20"
  };

  if (!mounted || !isOpen) {
    return null;
  }

  const modalContent = (
    <ModalContext.Provider value={{ isOpen, onClose }}>
      <div
        className={cn(
          "modal-backdrop",
          "flex min-h-screen",
          positionClasses[position],
          backdropClassName
        )}
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <div
          className={cn(
            "modal-content",
            "w-full relative",
            sizeClasses[size],
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </ModalContext.Provider>
  );

  return createPortal(modalContent, document.body);
}

// Modal Header Component
export interface ModalHeaderProps {
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
}

export function ModalHeader({ 
  children, 
  className,
  showCloseButton = true 
}: ModalHeaderProps) {
  const { onClose } = useModal();

  return (
    <div className={cn(
      "flex items-center justify-between pb-4 border-b border-border",
      className
    )}>
      <div className="flex-1">
        {children}
      </div>
      {showCloseButton && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          className="ml-4"
          aria-label="Close modal"
        >
          <span className="text-lg">×</span>
        </Button>
      )}
    </div>
  );
}

// Modal Title Component
export interface ModalTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalTitle({ children, className }: ModalTitleProps) {
  return (
    <h2 
      id="modal-title"
      className={cn("text-xl font-semibold text-foreground", className)}
    >
      {children}
    </h2>
  );
}

// Modal Description Component
export interface ModalDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalDescription({ children, className }: ModalDescriptionProps) {
  return (
    <p 
      id="modal-description"
      className={cn("text-sm text-muted-foreground", className)}
    >
      {children}
    </p>
  );
}

// Modal Body Component
export interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalBody({ children, className }: ModalBodyProps) {
  return (
    <div className={cn("py-6", className)}>
      {children}
    </div>
  );
}

// Modal Footer Component
export interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div className={cn(
      "flex items-center justify-end space-x-2 pt-4 border-t border-border",
      className
    )}>
      {children}
    </div>
  );
}

// Confirmation Modal Component
export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  loading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  loading = false
}: ConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm();
    if (!loading) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalHeader showCloseButton={false}>
        <ModalTitle>{title}</ModalTitle>
      </ModalHeader>
      
      <ModalBody>
        <ModalDescription>{message}</ModalDescription>
      </ModalBody>
      
      <ModalFooter>
        <Button
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          {cancelText}
        </Button>
        <Button
          variant={variant === "destructive" ? "destructive" : "basketball"}
          onClick={handleConfirm}
          loading={loading}
        >
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

// Alert Modal Component
export interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
  buttonText?: string;
}

export function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  type = "info",
  buttonText = "OK"
}: AlertModalProps) {
  const typeConfig = {
    info: { icon: "ℹ️", variant: "court" as const },
    success: { icon: "✅", variant: "success" as const },
    warning: { icon: "⚠️", variant: "outline" as const },
    error: { icon: "❌", variant: "destructive" as const }
  };

  const config = typeConfig[type];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalHeader showCloseButton={false}>
        <ModalTitle className="flex items-center gap-2">
          <span>{config.icon}</span>
          {title}
        </ModalTitle>
      </ModalHeader>
      
      <ModalBody>
        <ModalDescription>{message}</ModalDescription>
      </ModalBody>
      
      <ModalFooter>
        <Button
          variant={config.variant}
          onClick={onClose}
        >
          {buttonText}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

// Custom Hook for Modal State
export function useModalState(defaultOpen = false) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  const open = React.useCallback(() => setIsOpen(true), []);
  const close = React.useCallback(() => setIsOpen(false), []);
  const toggle = React.useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle
  };
}

// Hook for confirmation dialogs
export function useConfirmation() {
  const [state, setState] = React.useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: "default" | "destructive";
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    variant: "default"
  });

  const confirm = React.useCallback((
    title: string,
    message: string,
    onConfirm: () => void,
    variant: "default" | "destructive" = "default"
  ) => {
    setState({
      isOpen: true,
      title,
      message,
      onConfirm,
      variant
    });
  }, []);

  const close = React.useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const ConfirmationComponent = React.useMemo(() => (
    <ConfirmationModal
      isOpen={state.isOpen}
      onClose={close}
      onConfirm={state.onConfirm}
      title={state.title}
      message={state.message}
      variant={state.variant}
    />
  ), [state, close]);

  return { confirm, ConfirmationComponent };
}

export {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
  ConfirmationModal,
  AlertModal,
  useModalState,
  useConfirmation
};