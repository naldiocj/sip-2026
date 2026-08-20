"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";

// Dialog size variants
const dialogSizeVariants = cva(
  "fixed top-1/2 left-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 gap-6 rounded-4xl bg-popover p-6 text-sm text-popover-foreground shadow-xl ring-1 ring-foreground/5 duration-100 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
  {
    variants: {
      size: {
        xs: "max-w-[320px] w-[calc(100%-2rem)]",
        sm: "max-w-[480px] w-[calc(100%-2rem)]",
        md: "max-w-[640px] w-[calc(100%-2rem)]",
        lg: "max-w-[800px] w-[calc(100%-2rem)]",
        xl: "max-w-[1024px] w-[calc(100%-2rem)]",
        full: "max-w-[100vw] w-[100vw] h-[100vh] max-h-[100vh] p-0 rounded-none",
      },
      fullScreen: {
        true: "max-w-[100vw] w-[100vw] h-[100vh] max-h-[100vh] p-0 rounded-none top-0 left-0 -translate-x-0 -translate-y-0",
        false: "",
      },
    },
    defaultVariants: {
      size: "md",
      fullScreen: false,
    },
  }
);

// Base dialog content variants
const dialogContentVariants = cva(
  "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-6 rounded-4xl bg-popover p-6 text-sm text-popover-foreground shadow-xl ring-1 ring-foreground/5 duration-100 outline-none sm:max-w-md dark:ring-foreground/10 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
  {
    variants: {
      variant: {
        default: "",
        sticky: "flex flex-col max-h-[calc(100vh-2rem)] overflow-hidden",
        fullscreen: "max-w-[100vw] w-[100vw] h-[100vh] max-h-[100vh] p-0 rounded-none top-0 left-0 -translate-x-0 -translate-y-0",
      },
      hasStickyHeader: {
        true: "",
        false: "",
      },
      hasStickyFooter: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      hasStickyHeader: false,
      hasStickyFooter: false,
    },
  }
);

function Dialog({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/30 duration-100 supports-backdrop-filter:backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  );
}

interface DialogContentProps extends Omit<DialogPrimitive.Popup.Props, "children">, VariantProps<typeof dialogContentVariants> {
  size?: VariantProps<typeof dialogSizeVariants>["size"];
  fullScreen?: boolean;
  showCloseButton?: boolean;
  stickyHeader?: boolean;
  stickyFooter?: boolean;
  children: React.ReactNode;
  footerActions?: React.ReactNode;
}

function DialogContent({
  className,
  children,
  size = "md",
  fullScreen = false,
  showCloseButton = true,
  stickyHeader = false,
  stickyFooter = false,
  footerActions,
  variant = "default",
  hasStickyHeader = false,
  hasStickyFooter = false,
  ...props
}: DialogContentProps) {
  const isFullScreen = fullScreen || size === "full";
  const isSticky = variant === "sticky";

  // Build the content structure
  const content = (
    <>
      {stickyHeader && (
        <div
          data-slot="dialog-sticky-header"
          className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-popover/95 backdrop-blur supports-[backdrop-filter]:bg-popover/80 px-6 py-4 -mx-6"
        >
          <div className="flex-1" />
          {showCloseButton && (
            <DialogPrimitive.Close
              data-slot="dialog-close"
              render={
                <Button
                  variant="ghost"
                  className="absolute top-4 right-4 bg-secondary"
                  size="icon-sm"
                >
                  <XIcon />
                  <span className="sr-only">Fechar</span>
                </Button>
              }
            />
          )}
        </div>
      )}

      <div
        data-slot="dialog-body"
        className={cn(
          "flex-1 overflow-y-auto",
          stickyHeader && "pt-0",
          stickyFooter && "pb-0"
        )}
      >
        {children}
      </div>

      {stickyFooter && footerActions && (
        <div
          data-slot="dialog-sticky-footer"
          className="sticky bottom-0 z-10 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end border-t border-border bg-popover/95 backdrop-blur supports-[backdrop-filter]:bg-popover/80 px-6 py-4 -mx-6 -mb-6"
        >
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {footerActions}
          </div>
        </div>
      )}
    </>
  );

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          dialogContentVariants({
            variant: fullScreen ? "fullscreen" : isSticky ? "sticky" : "default",
            hasStickyHeader: stickyHeader,
            hasStickyFooter: stickyFooter,
          }),
          dialogSizeVariants({ size, fullScreen: isFullScreen }),
          className
        )}
        {...props}
      >
        {content}
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    />
  );
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean;
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close render={<Button variant="outline" />}>
          Close
        </DialogPrimitive.Close>
      )}
    </div>
  );
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "font-heading text-base leading-none font-medium",
        className
      )}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  dialogSizeVariants,
  dialogContentVariants,
  type DialogContentProps,
};